/**
 * Which way something is heading along one axis.
 *
 * `-1` back, `1` forward, `0` not moving.
 */
export type Dir = -1 | 0 | 1;

/**
 * Which way something is heading on a 2D plane.
 *
 * Each axis is independent, so `{ x: 1, y: -1 }` means right and up, and
 * `{ x: 0, y: 0 }` means at rest.
 */
export type Dir2d = {
    x: Dir;
    y: Dir;
};
