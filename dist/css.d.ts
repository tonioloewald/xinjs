import { XinStyleSheet, XinStyleRule } from './css-types';
export declare function StyleSheet(id: string, styleSpec: XinStyleSheet): void;
export declare const processProp: (prop: string, value: string | number) => {
    prop: string;
    value: string;
};
export declare const css: (obj: XinStyleSheet, indentation?: string) => string;
export declare const initVars: (obj: {
    [key: string]: string | number;
}) => XinStyleRule;
export declare const invertLuminance: (map: XinStyleRule) => XinStyleRule;
export declare const varDefault: {
    [key: string]: CssVarBuilder;
};
type VarsType = {
    default: typeof varDefault;
} & {
    [key: string]: string;
};
export declare const vars: VarsType;
type CssVarBuilder = (val: string | number) => string;
export {};
