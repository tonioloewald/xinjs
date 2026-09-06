import { ElementProps, ElementCreator, TosiBinding } from './xin-types';
import { type ElementsProxy } from './elements-types';
export declare const propBindingKey: (binding: TosiBinding) => string | undefined;
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
