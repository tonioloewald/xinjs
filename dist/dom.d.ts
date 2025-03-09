import { ContentType, ValueElement } from './xin-types';
export declare const dispatch: (target: Element, type: string) => void;
export declare const setValue: (element: Element, newValue: any) => void;
export declare const getValue: (element: ValueElement) => any;
export declare const resizeObserver: ResizeObserver | {
    observe(): void;
    unobserve(): void;
};
export declare const appendContentToElement: (elt: Element | ShadowRoot | null | undefined, content: ContentType | null | undefined, cloneElements?: boolean) => void;
