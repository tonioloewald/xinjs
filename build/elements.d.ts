import { XinObject } from './xin-types';
declare type elementPart = HTMLElement | XinObject | string | number;
declare type ElementCreator = (...contents: elementPart[]) => HTMLElement | DocumentFragment;
export declare const create: (tagType: string, ...contents: elementPart[]) => HTMLElement;
export declare const elements: {
    [key: string]: ElementCreator;
    [key: symbol]: ElementCreator;
};
export {};
//# sourceMappingURL=elements.d.ts.map