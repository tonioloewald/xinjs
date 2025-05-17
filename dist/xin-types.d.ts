import { XIN_PATH, XIN_VALUE, XIN_OBSERVE, XIN_BIND } from './metadata';
import { XinStyleRule } from './css-types';
export type AnyFunction = (...args: any[]) => any | Promise<any>;
export type XinScalar = string | boolean | number | symbol | AnyFunction;
export type XinArray = any[];
export interface XinObject {
    [key: string | number | symbol]: any;
}
export type XinProxyTarget = XinObject | XinArray;
export type XinValue = XinObject | XinArray | XinScalar | null | undefined;
type ProxyObserveFunc = ((path: string) => void);
type ProxyBindFunc<T = Element> = (element: T, binding: XinBinding<T>, options?: XinObject) => VoidFunction;
export interface XinProps<T = any> {
    [XIN_PATH]: string;
    [XIN_VALUE]: T;
    [XIN_OBSERVE]: ProxyObserveFunc;
    [XIN_BIND]: ProxyBindFunc;
}
export interface OptionalXinProps<T = any> {
    [XIN_PATH]?: string;
    [XIN_VALUE]?: T;
    [XIN_OBSERVE]?: ProxyObserveFunc;
    [XIN_BIND]?: ProxyBindFunc;
}
export type BoxedProxy<T = any> = T extends Array<infer U> ? Array<BoxedProxy<U>> : T extends Function ? T : T extends object ? {
    [K in keyof T]: BoxedProxy<T[K]>;
} : T extends string ? String & OptionalXinProps<string> : T extends number ? Number & OptionalXinProps<number> : T extends boolean ? Boolean & OptionalXinProps<boolean> : T;
export type Unboxed<T = any> = T extends String ? string : T extends Number ? number : T extends Boolean ? boolean : T;
export type XinProxy<T = any> = T extends Array<infer U> ? Array<XinProxy<U>> : T extends Function ? T : T extends object ? {
    [K in keyof T]: T[K] extends object ? XinProxy<T[K]> : T[K];
} : T;
export type XinProxyObject = XinProps<object> & {
    [key: string]: XinProxyObject | XinProxyArray | XinObject | XinArray | XinScalar;
};
export type XinProxyArray = XinProps<[]> & {
    [key: string]: XinProxyObject;
} & (XinProxyObject[] | XinScalar[]);
export type XinTouchableType = string | XinProxy | BoxedProxy | String | Number | Boolean;
export type XinEventHandler<T = Event> = ((evt: T) => void) | ((evt: T) => Promise<void>) | string;
export type XinBindingShortcut = XinTouchableType | XinBindingSpec;
type _BooleanFunction = () => boolean;
type _PathTestFunction = (path: string) => boolean | symbol;
export type PathTestFunction = _BooleanFunction | _PathTestFunction;
type OptionalSymbol = symbol | undefined;
type _CallbackFunction = (() => void) | (() => OptionalSymbol);
type _PathCallbackFunction = ((path: string) => void) | ((path: string) => OptionalSymbol);
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction;
export interface XinBindingSpec {
    value: XinTouchableType | any;
    [key: string]: any;
}
export type XinBindingSetter<T = Element> = (element: T, value: any, options?: XinObject) => void;
export type XinBindingGetter<T = Element> = (element: T, options?: XinObject) => any;
export interface XinBinding<T = Element> {
    toDOM?: XinBindingSetter<T>;
    fromDOM?: XinBindingGetter<T>;
}
export interface XinInlineBinding<T = Element> {
    value: XinTouchableType;
    binding: XinBinding<T> | XinBindingSetter<T> | string;
}
export interface ElementProps<T = Element> {
    onClick?: XinEventHandler<MouseEvent>;
    onInput?: XinEventHandler<InputEvent>;
    onChange?: XinEventHandler;
    onSubmit?: XinEventHandler;
    bind?: XinInlineBinding<T>;
    bindValue?: XinBindingShortcut;
    bindText?: XinBindingShortcut;
    bindList?: XinBindingShortcut;
    bindEnabled?: XinBindingShortcut;
    bindDisabled?: XinBindingShortcut;
    bindStyle?: XinBindingShortcut;
    style?: XinStyleRule;
    class?: string;
    apply?: (element: Element) => void | Promise<void>;
    [key: string]: any;
}
export interface StringMap {
    [key: string]: any;
}
export interface PartsMap<T = Element> {
    [key: string]: T;
}
export type ValueElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type ElementPart<T = Element> = Element | DocumentFragment | ElementProps<T> | string | number;
export type HTMLElementCreator<T = Element> = (...contents: ElementPart<T>[]) => T;
export type FragmentCreator = (...contents: ElementPart<Element>[]) => DocumentFragment;
export type ElementCreator<T = Element> = (...contents: ElementPart<T>[]) => T;
export type ContentPart = Element | DocumentFragment | string;
export type ContentType = ContentPart | ContentPart[];
export {};
