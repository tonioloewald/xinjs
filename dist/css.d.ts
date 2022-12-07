export interface StyleRule {
    [key: string]: string | number;
}
export interface StyleMap {
    [key: string]: StyleRule;
}
export interface StyleSheet {
    [key: string]: StyleRule | StyleMap;
}
export declare function StyleNode(styleSheet: StyleSheet): HTMLStyleElement;
export declare const css: (obj: StyleSheet | StyleMap, indentation?: string) => string;
export declare const initVars: (obj: StyleRule) => StyleRule;
export declare const darkMode: (obj: StyleRule) => StyleRule;
export declare const vars: {
    [key: string]: string;
};
//# sourceMappingURL=css.d.ts.map