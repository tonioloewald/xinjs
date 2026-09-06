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
/**
 * APPLY a positional argument. One implementation, for the three call sites.
 *
 * `classifyPositional` shared the QUESTION; this shares the ANSWER, which is
 * what actually stops them diverging. Sharing only the classifier was not
 * enough and the drift kept coming back at a new address each round:
 *
 *   round 1  `create()` fixed, `hydrate()` still dropped values silently
 *   round 2  both classified alike — and `hydrate()` still emitted text at the
 *            END of the child list, because it FILTERED and re-appended, so
 *            `[10n, span(' each')]` rendered " each10" against create()'s
 *            "10 each"
 *   round 3  `fragment()` turned out to be the third site, never classified at
 *            all, rendering `null` as the literal string "null" — directly
 *            contradicting the contract added in the same release
 *
 * `append` is the caller's placement (append to an element, push into an
 * ordered array, append to a fragment) and is called IN ARGUMENT ORDER, which
 * is what makes position correct by construction rather than by remembering.
 */
export declare const applyPositional: (item: any, tagName: string, append: (node: any) => void, mergeProps?: (props: any) => void) => void;
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
