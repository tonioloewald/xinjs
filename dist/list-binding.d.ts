import { XinObject } from './xin-types';
declare const listBindingRef: unique symbol;
declare global {
    interface HTMLElement {
        [listBindingRef]?: ListBinding;
    }
}
interface ListBindingOptions {
    idPath?: string;
    initInstance?: (element: HTMLElement, value: any) => void;
    updateInstance?: (element: HTMLElement, value: any) => void;
    virtual?: {
        height: number;
        width?: number;
    };
}
declare class ListBinding {
    boundElement: HTMLElement;
    listContainer: HTMLElement;
    template: HTMLElement;
    options: ListBindingOptions;
    itemToElement: WeakMap<XinObject, HTMLElement>;
    private _array;
    private readonly _update?;
    private _previousSlice?;
    constructor(boundElement: HTMLElement, options?: ListBindingOptions);
    private visibleSlice;
    update(array?: any[], isSlice?: boolean): void;
}
export declare const getListBinding: (boundElement: HTMLElement, options?: ListBindingOptions) => ListBinding;
export {};
//# sourceMappingURL=list-binding.d.ts.map