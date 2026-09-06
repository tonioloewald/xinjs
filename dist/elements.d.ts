import { ElementProps, ElementCreator, TosiBinding } from './xin-types';
import { type ElementsProxy } from './elements-types';
export declare const propBindingKey: (binding: TosiBinding) => string | undefined;
/**
 * WHAT IS THIS POSITIONAL ARGUMENT? One answer, for the two places that ask.
 *
 * `create()` and `Component.hydrate()`'s content filter both classify the same
 * arguments, and `mergeElementProps` was extracted precisely to keep them in
 * step — its comment says so. They drifted anyway: the value/array/warning
 * rules landed in `create()` only, so `content = [span('a'), new Date()]`
 * still dropped the Date silently and a nested array still turned its INDICES
 * into host attributes — verbatim the symptom the release notes call fixed.
 *
 * So the classification is the shared thing now, not just the merge.
 *
 * `Node`, not `Element | DocumentFragment`: hydrate() already used the wider
 * test and it is the correct one — a `Text` or `Comment` node is legitimate
 * content, and create() rejecting it was the narrower of two disagreeing
 * copies.
 */
export type PositionalKind = 'child' | 'proxy' | 'text' | 'props' | 'array' | 'unusable';
export declare const classifyPositional: (item: any) => PositionalKind;
/** the message for an argument that will do nothing, so both sites say it identically */
export declare const positionalWarning: (kind: PositionalKind, tagName: string) => string | undefined;
export declare const mergeElementProps: (target: any, item: any) => void;
export declare const elementSet: (elt: HTMLElement, key: string, value: any) => void;
/**
 * elements is a proxy that produces ElementCreators, e.g.
 * elements.div() creates <div> elements and
 * elements.myElement() creates <my-element> elements.
 */
export declare const elements: ElementsProxy;
interface SVGElementsProxy {
    [key: string]: ElementCreator<SVGElement>;
}
export declare const svgElements: SVGElementsProxy;
interface MathMLElementsProxy {
    [key: string]: ElementCreator<MathMLElement>;
}
export declare const mathML: MathMLElementsProxy;
export declare function bindParts(root: Element, bindingMap: Record<string, ElementProps>, dataAttribute?: string): void;
export {};
