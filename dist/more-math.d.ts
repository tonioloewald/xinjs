export declare const RADIANS_TO_DEGREES: number;
export declare const DEGREES_TO_RADIANS: number;
export declare function clamp(min: number, v: number, max: number): number;
export declare function lerp(a: number, b: number, t: number, clamped?: boolean): number;
export declare const MoreMath: {
    RADIANS_TO_DEGREES: number;
    DEGREES_TO_RADIANS: number;
    clamp: typeof clamp;
    lerp: typeof lerp;
};
