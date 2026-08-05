import { describe, expect, it } from "vitest";

import { SVGUtils } from "../../../src/Web/SVG/SVG.utils.js";

const countCommands = (path: string, command: string) => path.split(command).length - 1;

describe("SVGUtils.pointArrayToString", () => {
    it("formats points for an SVG points attribute", () => {
        expect(
            SVGUtils.pointArrayToString([
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
            ]),
        ).toBe("0,0 10,0 10,10");
    });

    it("gives an empty string for no points", () => {
        expect(SVGUtils.pointArrayToString([])).toBe("");
    });
});

describe("SVGUtils.getLinearCoords", () => {
    it("runs left to right at 0 degrees", () => {
        expect(SVGUtils.getLinearCoords({})).toEqual({ x1: 0, y1: 0.5, x2: 1, y2: 0.5 });
    });

    it("runs top to bottom at 90 degrees", () => {
        const coords = SVGUtils.getLinearCoords({ angle: 90 });

        expect(coords.x1).toBeCloseTo(0.5, 10);
        expect(coords.y1).toBeCloseTo(0, 10);
        expect(coords.x2).toBeCloseTo(0.5, 10);
        expect(coords.y2).toBeCloseTo(1, 10);
    });

    it("pushes the stops outside the box when scaled up", () => {
        const coords = SVGUtils.getLinearCoords({ scale: { width: 2, height: 2 } });

        expect(coords.x1).toBeCloseTo(-0.5, 10);
        expect(coords.x2).toBeCloseTo(1.5, 10);
    });

    it("shifts the centre by the offset", () => {
        const coords = SVGUtils.getLinearCoords({ offset: { x: 0.25, y: -0.25 } });

        expect(coords.x1).toBeCloseTo(0.25, 10);
        expect(coords.x2).toBeCloseTo(1.25, 10);
        expect(coords.y1).toBeCloseTo(0.25, 10);
    });

    it("stays centred on the midpoint whatever the angle", () => {
        for (const angle of [0, 37, 90, 180, 300]) {
            const coords = SVGUtils.getLinearCoords({ angle });

            expect((coords.x1 + coords.x2) * 0.5).toBeCloseTo(0.5, 10);
            expect((coords.y1 + coords.y2) * 0.5).toBeCloseTo(0.5, 10);
        }
    });
});

describe("SVGUtils.getArcPath", () => {
    it("draws a full circle for a whole turn", () => {
        const path = SVGUtils.getArcPath(360);

        expect(path).toContain("m 0 -1");
        expect(countCommands(path, "a ")).toBe(2);
    });

    it("draws a full circle for any positive whole number of turns", () => {
        expect(SVGUtils.getArcPath(720)).toBe(SVGUtils.getArcPath(360));
    });

    it("draws a pie slice for a partial turn", () => {
        const path = SVGUtils.getArcPath(90);

        expect(path.startsWith("M 0.5 0.5 L ")).toBe(true);
        expect(path.endsWith(" Z")).toBe(true);
        expect(path).not.toContain("NaN");
    });

    it("sets the large-arc flag only past half a turn", () => {
        expect(SVGUtils.getArcPath(180)).toContain("A 1 1 0 0 0");
        expect(SVGUtils.getArcPath(270)).toContain("A 1 1 0 1 0");
    });

    it("wraps sizes beyond a full turn", () => {
        expect(SVGUtils.getArcPath(450)).toBe(SVGUtils.getArcPath(90));
    });

    it("takes a rotation", () => {
        expect(SVGUtils.getArcPath(90, 45)).not.toBe(SVGUtils.getArcPath(90));
    });
});

describe("SVGUtils.getWedgesPath", () => {
    it("draws nothing at zero thickness", () => {
        expect(SVGUtils.getWedgesPath(6, 0)).toBe("");
        expect(SVGUtils.getWedgesPath(6, -1)).toBe("");
    });

    it("draws a solid circle at full thickness", () => {
        const path = SVGUtils.getWedgesPath(6, 1);

        expect(countCommands(path, "M ")).toBe(1);
        expect(countCommands(path, "A ")).toBe(2);
    });

    it("draws a blade in every other sector", () => {
        expect(countCommands(SVGUtils.getWedgesPath(6, 0.5), "M ")).toBe(3);
        expect(countCommands(SVGUtils.getWedgesPath(8, 0.5), "M ")).toBe(4);
    });

    it("produces usable numbers", () => {
        expect(SVGUtils.getWedgesPath(6, 0.5)).not.toContain("NaN");
        expect(SVGUtils.getWedgesPath(6, 0.5, 30, 0.4)).not.toContain("NaN");
    });

    it("takes a rotation and a curvature", () => {
        const plain = SVGUtils.getWedgesPath(6, 0.5);

        expect(SVGUtils.getWedgesPath(6, 0.5, 30)).not.toBe(plain);
        expect(SVGUtils.getWedgesPath(6, 0.5, 0, 0.5)).not.toBe(plain);
    });
});
