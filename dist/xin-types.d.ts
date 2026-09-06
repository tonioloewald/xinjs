import { XIN_PATH, XIN_VALUE, TOSI_ACCESSOR, TAKE_DESCRIPTOR } from './metadata';
import { TosiStyleRule } from './css-types';
import { ElementsProxy } from './elements-types';
export type AnyFunction = (...args: any[]) => any | Promise<any>;
export type TosiScalar = string | boolean | number | symbol | AnyFunction;
export type TosiArray = any[];
export interface TosiObject {
    [key: string | number | symbol]: any;
}
export type TosiProxyTarget = TosiObject | TosiArray;
export type TosiValue = TosiObject | TosiArray | TosiScalar | null | undefined;
type ProxyObserveFunc = (callback: ObserverCallbackFunction) => VoidFunction;
type ProxyBindFunc<T extends Element = Element> = (element: T, binding: TosiBinding<T>, options?: TosiObject) => VoidFunction;
/**
 * TakeDescriptor is returned by `.take()` — a reactive binding descriptor
 * that carries paths to observe and a transform function.
 * The binding system uses this to wire up multi-path reactive transforms.
 */
export interface TakeDescriptor {
    [TAKE_DESCRIPTOR]: true;
    paths: string[];
    transform: (...values: any[]) => any;
}
/**
 * TosiAccessor is the collision-free observer API accessed via `.tosi`.
 * Unlike the direct properties (path, value, observe, etc.) which can be
 * shadowed by actual object properties, `.tosi` is always available.
 */
export interface TosiAccessor<T = any> {
    value: T;
    readonly path: string;
    touch: () => void;
    observe: (callback: ObserverCallbackFunction) => VoidFunction;
    bind: <E extends Element = Element>(element: E, binding: TosiBinding<E>, options?: TosiObject) => void;
    on: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction;
    binding: (binding: TosiBinding) => {
        bind: {
            value: string;
            binding: TosiBinding;
        };
    };
    tosiBinding: (binding: TosiBinding) => {
        bind: {
            value: string;
            binding: TosiBinding;
        };
    };
    listBinding: (templateBuilder: ListTemplateBuilder, options?: ListBindingOptions) => ListBinding;
    listFind: {
        (selector: (item: any) => any, value: any): BoxedProxy | undefined;
        (element: Element): BoxedProxy | undefined;
    };
    listUpdate: (selector: (item: any) => any, newValue: any) => BoxedProxy;
    listRemove: (selector: (item: any) => any, value: any) => boolean;
    take: (...args: [...sources: any[], transform: (...values: any[]) => any]) => TakeDescriptor;
}
/**
 * TosiProps provides the observer API for boxed objects and arrays.
 * The `.tosi` accessor is the preferred, collision-free way to access
 * the observer API. The direct properties (path, value, observe, etc.)
 * still work but can be shadowed by actual object properties with the
 * same names.
 */
export interface TosiProps<T = any> {
    [TOSI_ACCESSOR]: TosiAccessor<T>;
    tosi: TosiAccessor<T>;
    path: string;
    value: T;
    touch: () => void;
    observe: ProxyObserveFunc;
    bind: ProxyBindFunc;
    on: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction;
    binding: (binding: TosiBinding) => {
        bind: {
            value: string;
            binding: TosiBinding;
        };
    };
    tosiBinding: (binding: TosiBinding) => {
        bind: {
            value: string;
            binding: TosiBinding;
        };
    };
    take: (...args: [...sources: any[], transform: (...values: any[]) => any]) => TakeDescriptor;
    valueOf: () => T;
    toJSON: () => T;
    [XIN_PATH]: string;
    xinPath: string;
    tosiPath: string;
    [XIN_VALUE]: T;
    xinValue: T;
    tosiValue: T;
    xinObserve: ProxyObserveFunc;
    tosiObserve: ProxyObserveFunc;
    xinBind: ProxyBindFunc;
    tosiBind: ProxyBindFunc;
}
type ListTemplateBuilder<U = any> = (elements: ElementsProxy, item: U, columnIndex?: number) => HTMLElement;
type ListBinding = [ElementProps, HTMLTemplateElement];
type ListFieldSelector<U> = (item: BoxedProxy<U>) => BoxedScalar<any>;
export interface BoxedArrayProps<U = any> {
    listBinding: (templateBuilder: ListTemplateBuilder<U>, options?: ListBindingOptions) => ListBinding;
    tosiListBinding: (templateBuilder: ListTemplateBuilder<U>, options?: ListBindingOptions) => ListBinding;
    listFind: {
        (selector: ListFieldSelector<U>, value: any): BoxedProxy<U> | undefined;
        (element: Element): BoxedProxy<U> | undefined;
    };
    listUpdate: (selector: ListFieldSelector<U>, newValue: U) => BoxedProxy<U>;
    listRemove: (selector: ListFieldSelector<U>, value: any) => boolean;
}
/**
 * BoxedScalarAPI is the observer API surface for boxed primitives.
 */
interface BoxedScalarAPI<T> {
    [TOSI_ACCESSOR]: TosiAccessor<T>;
    tosi: TosiAccessor<T>;
    value: T;
    path: string;
    touch: () => void;
    observe: (callback: ObserverCallbackFunction) => VoidFunction;
    bind: <E extends Element = Element>(element: E, binding: TosiBinding<E>, options?: TosiObject) => void;
    on: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction;
    binding: (binding: TosiBinding) => {
        bind: {
            value: string;
            binding: TosiBinding;
        };
    };
    take: (...args: [...sources: any[], transform: (...values: any[]) => any]) => TakeDescriptor;
    listBinding: (templateBuilder: ListTemplateBuilder<T>, options?: ListBindingOptions) => ListBinding;
    valueOf: () => T;
    toString: () => string;
    toJSON: () => T;
    xinValue: T;
    xinPath: string;
    tosiValue: T;
    tosiPath: string;
    xinObserve: (callback: ObserverCallbackFunction) => VoidFunction;
    tosiObserve: (callback: ObserverCallbackFunction) => VoidFunction;
    xinBind: <E extends Element = Element>(element: E, binding: TosiBinding<E>, options?: TosiObject) => void;
    tosiBind: <E extends Element = Element>(element: E, binding: TosiBinding<E>, options?: TosiObject) => void;
    xinOn: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction;
    tosiOn: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction;
    tosiBinding: (binding: TosiBinding) => {
        bind: {
            value: string;
            binding: TosiBinding;
        };
    };
}
/**
 * BoxedScalar represents a boxed primitive value (string, number, boolean, null, undefined).
 * It provides the reactive API (value, path, observe, etc.) plus all methods from the
 * underlying primitive's prototype (e.g. toLocaleLowerCase for strings, toFixed for numbers).
 *
 * Note: Direct assignment like `proxy.x = 3` is a TypeScript type error due to
 * fundamental limitations in TypeScript's mapped types (no asymmetric get/set).
 * Use `proxy.x.value = 3` instead.
 */
export type BoxedScalar<T> = BoxedScalarAPI<T> & (T extends string ? Omit<String, keyof BoxedScalarAPI<any>> : T extends number ? Omit<Number, keyof BoxedScalarAPI<any>> : T extends boolean ? Omit<Boolean, keyof BoxedScalarAPI<any>> : unknown);
export type BoxedProxy<T = any> = T extends Array<infer U> ? Array<BoxedProxy<U>> & TosiProps<T> & BoxedArrayProps<U> : T extends Function ? T & TosiProps<Function> : T extends object ? {
    [K in keyof T]: BoxedProxy<T[K]>;
} & TosiProps<T> : T extends string ? BoxedScalar<string> : T extends number ? BoxedScalar<number> : T extends boolean ? BoxedScalar<boolean> : T extends undefined | null ? BoxedScalar<T> : T;
export type Unboxed<T = any> = T extends BoxedScalar<infer U> ? U : T extends String ? string : T extends Number ? number : T extends Boolean ? boolean : T;
export type TosiProxy<T = any> = T extends Array<infer U> ? Array<TosiProxy<U>> : T extends Function ? T : T extends object ? {
    [K in keyof T]: T[K] extends object ? TosiProxy<T[K]> : T[K];
} : T;
export type TosiProxyObject = TosiProps<object> & {
    [key: string]: TosiProxyObject | TosiProxyArray | TosiObject | TosiArray | TosiScalar;
};
export type TosiProxyArray = TosiProps<[]> & {
    [key: string]: TosiProxyObject;
} & (TosiProxyObject[] | TosiScalar[]);
export type TosiTouchableType = string | TosiProxy | BoxedProxy | String | Number | Boolean;
export type EventType = keyof HTMLElementEventMap;
export type TosiEventHandler<T extends Event = Event, E = Element> = ((evt: T & {
    target: E;
}) => void) | ((evt: T & {
    target: E;
}) => Promise<void>) | string;
export type TosiBindingShortcut = TosiTouchableType | TosiBindingSpec | TakeDescriptor;
type _BooleanFunction = () => boolean;
type _PathTestFunction = (path: string) => boolean | symbol;
export type PathTestFunction = _BooleanFunction | _PathTestFunction;
type OptionalSymbol = symbol | undefined;
type _CallbackFunction = (() => void) | (() => OptionalSymbol);
type _PathCallbackFunction = ((path: string) => void) | ((path: string) => OptionalSymbol);
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction;
export interface TosiBindingSpec {
    value: TosiTouchableType | any;
    [key: string]: any;
}
export type TosiBindingSetter<T = Element> = (element: T, value: any, options?: TosiObject) => void;
export type TosiBindingGetter<T = Element> = (element: T, options?: TosiObject) => any;
export interface TosiBinding<T = Element> {
    toDOM?: TosiBindingSetter<T>;
    fromDOM?: TosiBindingGetter<T>;
}
export interface TosiInlineBinding<T = Element> {
    value: TosiTouchableType;
    binding: TosiBinding<T> | TosiBindingSetter<T> | string;
    /** forwarded as `bind()`'s fourth argument — idPath, virtual, hiddenProp… */
    options?: TosiObject;
}
export type TosiClassSpec = string | false | null | Array<string | false | null | undefined> | Record<string, boolean>;
export interface ElementProps<T = Element> {
    onClick?: TosiEventHandler<MouseEvent, T>;
    onMousedown?: TosiEventHandler<MouseEvent, T>;
    onMouseenter?: TosiEventHandler<MouseEvent, T>;
    onMouseleave?: TosiEventHandler<MouseEvent, T>;
    onMouseup?: TosiEventHandler<MouseEvent, T>;
    onTouchstart?: TosiEventHandler<TouchEvent, T>;
    onTouchmove?: TosiEventHandler<TouchEvent, T>;
    onTouchend?: TosiEventHandler<TouchEvent, T>;
    onTouchcancel?: TosiEventHandler<TouchEvent, T>;
    onDragstart?: TosiEventHandler<DragEvent, T>;
    onDragover?: TosiEventHandler<DragEvent, T>;
    onDragend?: TosiEventHandler<DragEvent, T>;
    onDragenter?: TosiEventHandler<DragEvent, T>;
    onDragleave?: TosiEventHandler<DragEvent, T>;
    onInput?: TosiEventHandler<InputEvent, T>;
    onChange?: TosiEventHandler<InputEvent, T>;
    onSubmit?: TosiEventHandler<SubmitEvent, T>;
    onKeydown?: TosiEventHandler<KeyboardEvent, T>;
    onKeyup?: TosiEventHandler<KeyboardEvent, T>;
    /** one inline binding, or several — `create()` accumulates rather than
     * overwriting, so a container can be list-bound AND carry its own binding */
    bind?: TosiInlineBinding<T> | Array<TosiInlineBinding<T>>;
    /** TWO-WAY value binding; `value: proxy` is one-way (state -> DOM) only */
    bindValue?: TosiBindingShortcut;
    /** Text binding. With a proxy, `{ textContent: proxy }` says the same thing
     * in a plain prop and is the more durable spelling; with a PATH STRING this
     * is the only form that binds — `textContent: 'path'` sets the literal text
     * "path" and silently does not bind (a mistake that typechecks and passes a
     * unit suite; it was caught only by the browser doc-test lane). Not
     * deprecated in either form. */
    bindText?: TosiBindingShortcut;
    /** the low-level list-binding prop; `.tosi.listBinding()` is sugar over it */
    bindList?: TosiBindingShortcut;
    /** Enabled binding (inverted `disabled`). With a proxy,
     * `{ disabled: proxy.tosi.take(v => !v) }` is the plain-prop equivalent;
     * with a PATH STRING this is the only form that works — `disabled: 'path'`
     * assigns a non-empty, therefore always truthy, string and permanently
     * DISABLES the control. Not deprecated in either form. */
    bindEnabled?: TosiBindingShortcut;
    /** Disabled binding. With a proxy, `{ disabled: proxy }` is the plain-prop
     * equivalent; with a PATH STRING this is the only form that works, for the
     * same always-truthy reason as `bindEnabled`. Not deprecated. */
    bindDisabled?: TosiBindingShortcut;
    style?: TosiStyleRule;
    class?: TosiClassSpec;
    apply?: (element: Element) => void | Promise<void>;
    /** inline contract: JSON-Schema-shaped description of the element's bound
     *  value — harvested into the agent surface's map, enforced on agent
     *  writes, overridable by top-level curation (expose.contract) */
    contract?: Record<string, any>;
    [key: string]: any;
}
export interface StringMap {
    [key: string]: any;
}
export interface PartsMap {
    [key: string]: Element;
}
export type ValueElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type ElementPart<T = Element> = Element | DocumentFragment | ElementProps<T> | string | number | Map<string, any> | BoxedScalar<any> | TosiProps<any>;
export type HTMLElementCreator<T = HTMLElement> = (...contents: ElementPart<T>[]) => T;
export type FragmentCreator = (...contents: ElementPart<Element>[]) => DocumentFragment;
export type ElementCreator<T = Element> = (...contents: ElementPart<T>[]) => T;
export type ContentPart = ElementPart | null | undefined;
export type ContentType = ContentPart | ContentPart[];
export type ListFilter = (array: any[], needle: any) => any[];
export interface ListBindingOptions {
    idPath?: string;
    virtual?: {
        height: number;
        /** When set, enables variable-height mode using scroll-fraction interpolation.
         *  Items render at natural height; minHeight is used for scroll area estimation. */
        minHeight?: number;
        width?: number;
        visibleColumns?: number;
        rowChunkSize?: number;
        /** Use 'window' to virtualize based on window scroll position instead of element scroll */
        scrollContainer?: 'window' | 'element';
        /** Number of elements to stamp per array item (for grid layouts). Default 1. */
        itemsPerRow?: number;
    };
    hiddenProp?: symbol | string;
    visibleProp?: symbol | string;
    filter?: ListFilter;
    needle?: TosiTouchableType;
}
/** @deprecated Use `TosiScalar` */
export type XinScalar = TosiScalar;
/** @deprecated Use `TosiArray` */
export type XinArray = TosiArray;
/** @deprecated Use `TosiObject` */
export type XinObject = TosiObject;
/** @deprecated Use `TosiProxyTarget` */
export type XinProxyTarget = TosiProxyTarget;
/** @deprecated Use `TosiValue` */
export type XinValue = TosiValue;
/** @deprecated Use `TosiProps` */
export type XinProps<T = any> = TosiProps<T>;
/** @deprecated Use `TosiProxy` */
export type XinProxy<T = any> = TosiProxy<T>;
/** @deprecated Use `TosiProxyObject` */
export type XinProxyObject = TosiProxyObject;
/** @deprecated Use `TosiProxyArray` */
export type XinProxyArray = TosiProxyArray;
/** @deprecated Use `TosiTouchableType` */
export type XinTouchableType = TosiTouchableType;
/** @deprecated Use `TosiEventHandler` */
export type XinEventHandler<T extends Event = Event, E = Element> = TosiEventHandler<T, E>;
/** @deprecated Use `TosiBindingShortcut` */
export type XinBindingShortcut = TosiBindingShortcut;
/** @deprecated Use `TosiBindingSpec` */
export type XinBindingSpec = TosiBindingSpec;
/** @deprecated Use `TosiBindingSetter` */
export type XinBindingSetter<T = Element> = TosiBindingSetter<T>;
/** @deprecated Use `TosiBindingGetter` */
export type XinBindingGetter<T = Element> = TosiBindingGetter<T>;
/** @deprecated Use `TosiBinding` */
export type XinBinding<T = Element> = TosiBinding<T>;
/** @deprecated Use `TosiInlineBinding` */
export type XinInlineBinding<T = Element> = TosiInlineBinding<T>;
/** @deprecated Use `TosiClassSpec` */
export type XinClassSpec = TosiClassSpec;
export {};
