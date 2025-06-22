import { XinObject, XinTouchableType } from './xin-types';
import { Listener } from './path-listener';
export declare const listBindingRef: unique symbol;
type ListFilter = (array: any[], needle: any) => any[];
interface ListBindingOptions {
    idPath?: string;
    virtual?: {
        height: number;
        width?: number;
    };
    hiddenProp?: symbol | string;
    visibleProp?: symbol | string;
    filter?: ListFilter;
    needle?: XinTouchableType;
}
export declare class ListBinding {
    boundElement: Element;
    listTop: HTMLElement;
    listBottom: HTMLElement;
    template: Element;
    options: ListBindingOptions;
    itemToElement: WeakMap<XinObject, Element>;
    private _array;
    private readonly _update?;
    private _previousSlice?;
    static filterBoundObservers: WeakMap<Element, Listener>;
    constructor(boundElement: Element, value: any[], options?: ListBindingOptions);
    private visibleSlice;
    private needle?;
    filter: (...args: any[]) => void;
    update(array?: any[], isSlice?: boolean): void;
}
interface ListBoundElement extends Element {
    [listBindingRef]?: ListBinding;
}
export declare const getListBinding: (boundElement: ListBoundElement, value: any[], options?: ListBindingOptions) => ListBinding;
export {};
