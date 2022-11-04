interface ListBindingOptions {
    idPath?: string;
    initInstance?: (element: HTMLElement, pathOrObj: any) => void;
    updateInstance?: (element: HTMLElement, pathOrObj: any) => void;
}
declare class ListBinding {
    boundElement: HTMLElement;
    template: HTMLElement;
    options: ListBindingOptions;
    constructor(boundElement: HTMLElement, options?: ListBindingOptions);
    update(array?: any[]): void;
}
export declare const getListBinding: (boundElement: HTMLElement, options?: ListBindingOptions) => ListBinding;
export {};
//# sourceMappingURL=list-binding.d.ts.map