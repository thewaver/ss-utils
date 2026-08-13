import { describe, expect, it } from "vitest";

import { Matrix3d, Matrix3dUtils } from "../../src/Abstracts/matrix3d.js";
import { Point3d } from "../../src/Abstracts/point3d.js";

const IDENTITY: Matrix3d = [1, 0, 0, 0, 1, 0, 0, 0, 1];

const X: Point3d = { x: 1, y: 0, z: 0 };
const Y: Point3d = { x: 0, y: 1, z: 0 };
const Z: Point3d = { x: 0, y: 0, z: 1 };

const expectPoint = (actual: Point3d, expected: Point3d) => {
    expect(actual.x).toBeCloseTo(expected.x, 10);
    expect(actual.y).toBeCloseTo(expected.y, 10);
    expect(actual.z).toBeCloseTo(expected.z, 10);
};

const expectMatrix = (actual: Matrix3d, expected: Matrix3d) => {
    actual.forEach((cell, idx) => expect(cell).toBeCloseTo(expected[idx], 10));
};

describe("Matrix3dUtils.apply", () => {
    it("leaves a point alone under the identity", () => {
        expectPoint(Matrix3dUtils.apply(IDENTITY, { x: 3, y: -4, z: 5 }), { x: 3, y: -4, z: 5 });
    });

    it("reads the matrix row by row", () => {
        const m: Matrix3d = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        expect(Matrix3dUtils.apply(m, { x: 1, y: 2, z: 3 })).toEqual({ x: 14, y: 32, z: 50 });
    });

    it("does not modify its inputs", () => {
        const m: Matrix3d = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const v: Point3d = { x: 1, y: 2, z: 3 };

        Matrix3dUtils.apply(m, v);

        expect(m).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        expect(v).toEqual({ x: 1, y: 2, z: 3 });
    });
});

describe("Matrix3dUtils.multiply", () => {
    it("leaves a matrix alone under the identity", () => {
        const m: Matrix3d = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        expectMatrix(Matrix3dUtils.multiply(m, IDENTITY), m);
        expectMatrix(Matrix3dUtils.multiply(IDENTITY, m), m);
    });

    it("matches a worked product", () => {
        const a: Matrix3d = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const b: Matrix3d = [9, 8, 7, 6, 5, 4, 3, 2, 1];

        expectMatrix(Matrix3dUtils.multiply(a, b), [30, 24, 18, 84, 69, 54, 138, 114, 90]);
    });

    it("applies the right hand transform first", () => {
        const first = Matrix3dUtils.rotationZ(90);
        const second = Matrix3dUtils.scaling(2, 2);
        const combined = Matrix3dUtils.multiply(second, first);

        expectPoint(Matrix3dUtils.apply(combined, X), Matrix3dUtils.apply(second, Matrix3dUtils.apply(first, X)));
    });

    it("is not commutative", () => {
        const a = Matrix3dUtils.rotationZ(90);
        const b = Matrix3dUtils.scaling(2, 1);

        expect(Matrix3dUtils.multiply(a, b)).not.toEqual(Matrix3dUtils.multiply(b, a));
    });
});

describe("Matrix3dUtils rotations", () => {
    it("turns a quarter circle about each axis", () => {
        expectPoint(Matrix3dUtils.apply(Matrix3dUtils.rotationX(90), Y), Z);
        expectPoint(Matrix3dUtils.apply(Matrix3dUtils.rotationY(90), Z), X);
        expectPoint(Matrix3dUtils.apply(Matrix3dUtils.rotationZ(90), X), Y);
    });

    it("leaves its own axis untouched", () => {
        expectPoint(Matrix3dUtils.apply(Matrix3dUtils.rotationX(37), X), X);
        expectPoint(Matrix3dUtils.apply(Matrix3dUtils.rotationY(37), Y), Y);
        expectPoint(Matrix3dUtils.apply(Matrix3dUtils.rotationZ(37), Z), Z);
    });

    it("changes nothing at zero degrees", () => {
        expectMatrix(Matrix3dUtils.rotationX(0), IDENTITY);
        expectMatrix(Matrix3dUtils.rotationY(0), IDENTITY);
        expectMatrix(Matrix3dUtils.rotationZ(0), IDENTITY);
    });

    it("comes full circle at 360 degrees", () => {
        expectMatrix(Matrix3dUtils.rotationZ(360), IDENTITY);
    });

    it("undoes itself when turned back", () => {
        const there = Matrix3dUtils.rotationY(37);
        const back = Matrix3dUtils.rotationY(-37);

        expectMatrix(Matrix3dUtils.multiply(back, there), IDENTITY);
    });

    it("keeps the length of what it turns", () => {
        const v: Point3d = { x: 1, y: 2, z: 3 };
        const turned = Matrix3dUtils.apply(Matrix3dUtils.rotationX(53), v);

        expect(Math.hypot(turned.x, turned.y, turned.z)).toBeCloseTo(Math.hypot(v.x, v.y, v.z), 10);
    });
});

describe("Matrix3dUtils.scaling", () => {
    it("stretches x and y and leaves z alone", () => {
        expectPoint(Matrix3dUtils.apply(Matrix3dUtils.scaling(2, 3), { x: 1, y: 1, z: 1 }), { x: 2, y: 3, z: 1 });
    });

    it("flips on a negative scale", () => {
        expectPoint(Matrix3dUtils.apply(Matrix3dUtils.scaling(-1, 1), X), { x: -1, y: 0, z: 0 });
    });

    it("changes nothing at a scale of one", () => {
        expectMatrix(Matrix3dUtils.scaling(1, 1), IDENTITY);
    });
});

describe("Matrix3dUtils.apply with Point3d", () => {
    it("accepts a point built by the Point3d helpers", () => {
        expectPoint(Matrix3dUtils.apply(IDENTITY, Point3d.add(X, { x: 0, y: 2, z: 0 })), { x: 1, y: 2, z: 0 });
    });

    it("returns a point those helpers accept back", () => {
        const turned = Matrix3dUtils.apply(Matrix3dUtils.rotationZ(0), { x: 1, y: 2, z: 3 });

        expect(Point3d.isSame(turned, { x: 1, y: 2, z: 3 })).toBe(true);
    });
});
