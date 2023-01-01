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
    #private;
    boundElement: HTMLElement;
    listContainer: HTMLElement;
    template: HTMLElement;
    options: ListBindingOptions;
    itemToElement: WeakMap<XinObject, HTMLElement>;
    constructor(boundElement: HTMLElement, options?: ListBindingOptions);
    update(array?: any[], isSlice?: boolean): void;
}
export declare const getListBinding: (boundElement: HTMLElement, options?: ListBindingOptions) => ListBinding;
export {};
//# sourceMappingURL=list-binding.d.ts.map