declare class ListBinding {
    boundElement: HTMLElement;
    template: HTMLElement;
    elements: HTMLElement[];
    bindInstance?: (element: HTMLElement, obj: any) => void;
    constructor(boundElement: HTMLElement, bindInstance?: (element: HTMLElement, obj: any) => void);
    update(array: any[]): void;
}
export declare const getListBinding: (boundElement: HTMLElement, bindInstance?: ((element: HTMLElement, obj: any) => void) | undefined) => ListBinding;
export {};
//# sourceMappingURL=list-binding.d.ts.map