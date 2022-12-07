export declare type ContentPart = HTMLElement | DocumentFragment | string;
export declare type ContentType = ContentPart | ContentPart[];
export declare const dispatch: (target: Element, type: string) => void;
export declare const resizeObserver: ResizeObserver;
export declare const appendContentToElement: (elt: Element | ShadowRoot | null | undefined, content: ContentType | null | undefined) => void;
//# sourceMappingURL=dom.d.ts.map