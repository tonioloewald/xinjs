import { ValueElement } from './xin-types';
export declare const dispatch: (target: Element, type: string, { bubbles, composed }?: EventInit) => void;
export declare const isBindingWrite: () => boolean;
export declare const setValue: (element: Element, newValue: any) => void;
export declare const getValue: (element: ValueElement) => any;
export declare const resizeObserver: ResizeObserver | {
    observe(): void;
    unobserve(): void;
};
/**
 * Append ALREADY-CLASSIFIED content. Both callers run their items through
 * `applyPositional` first, so by here everything is a Node or a string —
 * which is why the parameter is not `ContentType`. It used to be, and that
 * was only harmless while `ContentType` happened to be that narrow: widening
 * `ContentPart` to match what `content` arrays really accept (values, boxed
 * proxies, null) immediately made this a type error, correctly, because this
 * function cannot handle those and is never given them.
 */
export type ResolvedContent = Node | string | Array<Node | string>;
export declare const appendContentToElement: (elt: Element | ShadowRoot | null | undefined, content: ResolvedContent | null | undefined, cloneElements?: boolean) => void;
