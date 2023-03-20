export declare type XinScalar = string | boolean | number | Function;
export declare type XinArray = XinObject[] | XinScalar[];
export interface XinObject {
    [key: string]: XinObject | XinArray | XinScalar;
}
export declare type XinProxyTarget = XinObject | XinArray;
export declare type XinValue = XinObject | XinArray | XinScalar | null | undefined;
export declare const xinPath: unique symbol;
export declare const xinValue: unique symbol;
export interface XinProps {
    [xinValue]: XinObject | XinObject | XinScalar;
    [xinPath]: string;
}
export declare type XinProxyObject = XinProps & {
    [key: string]: XinProxyObject | XinProxyArray | XinObject | XinArray | XinScalar;
};
export declare type XinProxyArray = XinProps & {
    [key: string]: XinProxyObject;
} & (XinProxyObject[] | XinScalar[]);
export declare type XinProxy = XinProps & (XinObject | XinArray);
export declare type XinProxyValue = XinProxy | XinScalar | null | undefined;
export declare type XinTouchableType = string | XinProps;
export declare type XinEventHandler<T = Event> = ((evt: T) => void) | string;
export declare type XinBindingShortcut = XinTouchableType | XinBindingSpec;
declare type _BooleanFunction = () => boolean;
declare type _PathTestFunction = (path: string) => boolean | Symbol;
export declare type PathTestFunction = _BooleanFunction | _PathTestFunction;
declare type OptionalSymbol = Symbol | undefined;
declare type _CallbackFunction = (() => void) | (() => OptionalSymbol);
declare type _PathCallbackFunction = ((path: string) => void) | ((path: string) => OptionalSymbol);
export declare type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction;
export interface XinBindingSpec {
    value: XinTouchableType;
    [key: string]: any;
}
export interface XinBinding {
    toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void;
    fromDOM?: (element: HTMLElement, options?: XinObject) => any;
}
export interface ElementProps {
    onClick?: XinEventHandler<MouseEvent>;
    onInput?: XinEventHandler;
    onChange?: XinEventHandler;
    onSubmit?: XinEventHandler;
    bindValue?: XinBindingShortcut;
    bindText?: XinBindingShortcut;
    bindList?: XinBindingShortcut;
    bindEnabled?: XinBindingShortcut;
    bindDisabled?: XinBindingShortcut;
    bindStyle?: XinBindingShortcut;
    [key: string]: any;
}
export declare type SwissArmyElement = HTMLInputElement & HTMLCanvasElement;
export declare type ElementPart = SwissArmyElement | DocumentFragment | ElementProps | string | number;
export declare type HTMLElementCreator<T extends Node = SwissArmyElement> = (...contents: ElementPart[]) => T;
export declare type FragmentCreator = (...contents: ElementPart[]) => DocumentFragment;
export declare type ElementCreator<T extends Node = SwissArmyElement> = (...contents: ElementPart[]) => T;
export {};
//# sourceMappingURL=xin-types.d.ts.map