export type XinScalar = string | boolean | number | Function;
export type XinArray = XinObject[] | XinScalar[];
export interface XinObject {
    [key: string]: XinObject | XinArray | XinScalar;
}
export type XinProxyTarget = XinObject | XinArray;
export type XinValue = XinObject | XinArray | XinScalar | null | undefined;
export declare const xinPath: unique symbol;
export declare const xinValue: unique symbol;
export interface XinProps {
    [xinValue]: XinObject | XinObject | XinScalar;
    [xinPath]: string;
}
export type XinProxyObject = XinProps & {
    [key: string]: XinProxyObject | XinProxyArray | XinObject | XinArray | XinScalar;
};
export type XinProxyArray = XinProps & {
    [key: string]: XinProxyObject;
} & (XinProxyObject[] | XinScalar[]);
export type XinProxy = XinProps & (XinObject | XinArray);
export type XinProxyValue = XinProxy | XinScalar | null | undefined;
export type XinTouchableType = string | XinProps;
export type XinEventHandler<T = Event> = ((evt: T) => void) | string;
export type XinBindingShortcut = XinTouchableType | XinBindingSpec;
type _BooleanFunction = () => boolean;
type _PathTestFunction = (path: string) => boolean | Symbol;
export type PathTestFunction = _BooleanFunction | _PathTestFunction;
type OptionalSymbol = Symbol | undefined;
type _CallbackFunction = (() => void) | (() => OptionalSymbol);
type _PathCallbackFunction = ((path: string) => void) | ((path: string) => OptionalSymbol);
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction;
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
export type ValueElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type SwissArmyElement = HTMLInputElement & HTMLCanvasElement;
export type ElementPart = SwissArmyElement | DocumentFragment | ElementProps | string | number;
export type HTMLElementCreator<T extends Node = SwissArmyElement> = (...contents: ElementPart[]) => T;
export type FragmentCreator = (...contents: ElementPart[]) => DocumentFragment;
export type ElementCreator<T extends Node = SwissArmyElement> = (...contents: ElementPart[]) => T;
export type ContentPart = HTMLElement | DocumentFragment | string;
export type ContentType = ContentPart | ContentPart[];
export {};
//# sourceMappingURL=xin-types.d.ts.map