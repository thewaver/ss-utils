import { Point2d } from "./point";
import { Size2d } from "./size";

export type Rect = Point2d & Size2d;

export namespace Rect {
    export const isSame = (a?: Rect, b?: Rect): boolean =>
        !!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

    export const fit = (fitThis: Size2d, intoThis: Size2d): Rect & { scale: number } => {
        const scale = Math.min(intoThis.width / fitThis.width, intoThis.height / fitThis.height);
        const width = fitThis.width * scale;
        const height = fitThis.height * scale;
        const x = (intoThis.width - width) * 0.5;
        const y = (intoThis.height - height) * 0.5;

        return { width, height, x, y, scale };
    };
}
