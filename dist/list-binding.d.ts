import { XinObject } from './xin-types';
interface ListBindingOptions {
    idPath?: string;
    initInstance?: (element: HTMLElement, value: any) => void;
    updateInstance?: (element: HTMLElement, value: any) => void;
}
declare class ListBinding {
    boundElement: HTMLElement;
    template: HTMLElement;
    options: ListBindingOptions;
    itemToElement: WeakMap<XinObject, HTMLElement>;
    constructor(boundElement: HTMLElement, options?: ListBindingOptions);
    update(array?: any[]): void;
}
export declare const getListBinding: (boundElement: HTMLElement, options?: ListBindingOptions) => ListBinding;
export {};
//# sourceMappingURL=list-binding.d.ts.map