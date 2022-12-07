declare class HslColor {
    h: number;
    s: number;
    l: number;
    constructor(r: number, g: number, b: number);
}
export declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    static fromCss(spec: string): Color;
    static fromHsl(h: number, s: number, l: number, a?: number): Color;
    constructor(r: number, g: number, b: number, a?: number);
    get inverse(): Color;
    get inverseLuminance(): Color;
    get rgb(): string;
    get rgba(): string;
    _hslCached?: HslColor;
    get _hsl(): HslColor;
    get hsl(): string;
    get hsla(): string;
    get mono(): Color;
    get brightness(): number;
    get html(): string;
    brighten(amount: number): Color;
    darken(amount: number): Color;
    saturate(amount: number): Color;
    desaturate(amount: number): Color;
    rotate(amount: number): Color;
    opacity(alpha: number): Color;
    swatch(): void;
    blend(otherColor: Color, t: number): Color;
}
export {};
//# sourceMappingURL=color.d.ts.map