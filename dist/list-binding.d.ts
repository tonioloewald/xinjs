import { XinObject } from './xin-types';
declare const listBindingRef: unique symbol;
interface ListBindingOptions {
    idPath?: string;
    virtual?: {
        height: number;
        width?: number;
    };
    hiddenProp?: symbol | string;
    visibleProp?: symbol | string;
}
declare class ListBinding {
    boundElement: Element;
    listTop: HTMLElement;
    listBottom: HTMLElement;
    template: Element;
    options: ListBindingOptions;
    itemToElement: WeakMap<XinObject, Element>;
    private _array;
    private readonly _update?;
    private _previousSlice?;
    constructor(boundElement: Element, options?: ListBindingOptions);
    private visibleSlice;
    update(array?: any[], isSlice?: boolean): void;
}
interface ListBoundElement extends Element {
    [listBindingRef]?: ListBinding;
}
export declare const getListBinding: (boundElement: ListBoundElement, options?: ListBindingOptions) => ListBinding;
export {};
