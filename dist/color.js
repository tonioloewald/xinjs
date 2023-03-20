import { lerp, clamp } from './more-math';
const hex2 = (n) => ('00' + Math.round(Number(n)).toString(16)).slice(-2);
const span = globalThis.document != null ? globalThis.document.createElement('span') : { style: { color: '' } };
class HslColor {
    h;
    s;
    l;
    constructor(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const l = Math.max(r, g, b);
        const s = l - Math.min(r, g, b);
        const h = s !== 0
            ? l === r
                ? (g - b) / s
                : l === g
                    ? 2 + (b - r) / s
                    : 4 + (r - g) / s
            : 0;
        this.h = 60 * h < 0 ? 60 * h + 360 : 60 * h;
        this.s = s !== 0 ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0;
        this.l = (2 * l - s) / 2;
    }
}
export class Color {
    r;
    g;
    b;
    a;
    static fromCss(spec) {
        span.style.color = spec;
        const converted = span.style.color;
        const [r, g, b, a] = converted.match(/[\d.]+/g);
        return new Color(Number(r), Number(g), Number(b), a == null ? 1 : Number(a));
    }
    static fromHsl(h, s, l, a = 1) {
        return Color.fromCss(`hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${a.toFixed(2)})`);
    }
    constructor(r, g, b, a = 1) {
        this.r = clamp(0, r, 255);
        this.g = clamp(0, g, 255);
        this.b = clamp(0, b, 255);
        this.a = a !== undefined ? clamp(0, a, 1) : a = 1;
    }
    get inverse() {
        return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a);
    }
    get inverseLuminance() {
        const { h, s, l } = this._hsl;
        return Color.fromHsl(h, s, 1 - l, this.a);
    }
    get rgb() {
        const { r, g, b } = this;
        return `rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)})`;
    }
    get rgba() {
        const { r, g, b, a } = this;
        return `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${a.toFixed(2)})`;
    }
    get RGBA() {
        return [this.r / 255, this.g / 255, this.b / 255, this.a];
    }
    get ARGB() {
        return [this.a, this.r / 255, this.g / 255, this.b / 255];
    }
    _hslCached;
    get _hsl() {
        if (this._hslCached == null) {
            this._hslCached = new HslColor(this.r, this.g, this.b);
        }
        return this._hslCached;
    }
    get hsl() {
        const { h, s, l } = this._hsl;
        return `hsl(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`;
    }
    get hsla() {
        const { h, s, l } = this._hsl;
        return `hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${this.a.toFixed(2)})`;
    }
    get mono() {
        const v = this.brightness * 255;
        return new Color(v, v, v);
    }
    get brightness() {
        // http://www.itu.int/rec/R-REC-BT.601
        return (0.299 * this.r + 0.587 * this.g + 0.114 * this.b) / 255;
    }
    get html() {
        return this.a === 1 ? '#' + hex2(this.r) + hex2(this.g) + hex2(this.b) : '#' + hex2(this.r) + hex2(this.g) + hex2(this.b) + hex2(Math.floor(255 * this.a));
    }
    brighten(amount) {
        let { h, s, l } = this._hsl;
        l = clamp(0, l + amount * (1 - l), 1);
        return Color.fromHsl(h, s, l, this.a);
    }
    darken(amount) {
        let { h, s, l } = this._hsl;
        l = clamp(0, l * (1 - amount), 1);
        return Color.fromHsl(h, s, l, this.a);
    }
    saturate(amount) {
        let { h, s, l } = this._hsl;
        s = clamp(0, s + amount * (1 - s), 1);
        return Color.fromHsl(h, s, l, this.a);
    }
    desaturate(amount) {
        let { h, s, l } = this._hsl;
        s = clamp(0, s * (1 - amount), 1);
        return Color.fromHsl(h, s, l, this.a);
    }
    rotate(amount) {
        let { h, s, l } = this._hsl;
        h = (h + 360 + amount) % 360;
        return Color.fromHsl(h, s, l, this.a);
    }
    opacity(alpha) {
        const { h, s, l } = this._hsl;
        return Color.fromHsl(h, s, l, alpha);
    }
    swatch() {
        const { r, g, b, a } = this;
        console.log(`%c   %c ${this.html}, rgba(${r}, ${g}, ${b}, ${a}), ${this.hsla}`, `background-color: rgba(${r}, ${g}, ${b}, ${a})`, 'background-color: #eee');
    }
    blend(otherColor, t) {
        return new Color(lerp(this.r, otherColor.r, t), lerp(this.g, otherColor.g, t), lerp(this.b, otherColor.b, t), lerp(this.a, otherColor.a, t));
    }
}
