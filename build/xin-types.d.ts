export interface XinObject {
    [key: string]: any;
}
export declare type XinTouchableType = string | {
    _xinPath: string;
};
declare type _BooleanFunction = () => boolean;
declare type _PathTestFunction = (path: string) => boolean | Symbol;
export declare type PathTestFunction = _BooleanFunction | _PathTestFunction;
declare type OptionalSymbol = Symbol | undefined;
declare type _CallbackFunction = (() => void) | (() => OptionalSymbol);
declare type _PathCallbackFunction = ((path: string) => void) | ((path: string) => OptionalSymbol);
export declare type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction;
export {};
//# sourceMappingURL=xin-types.d.ts.map