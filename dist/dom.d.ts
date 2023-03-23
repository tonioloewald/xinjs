export type ContentPart = HTMLElement | DocumentFragment | string;
export type ContentType = ContentPart | ContentPart[];
export declare const dispatch: (target: Element, type: string) => void;
export declare const resizeObserver: ResizeObserver | {
    observe(): void;
    unobserve(): void;
};
export declare const appendContentToElement: (elt: Element | ShadowRoot | null | undefined, content: ContentType | null | undefined) => void;
//# sourceMappingURL=dom.d.ts.map