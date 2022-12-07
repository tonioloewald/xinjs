import { ElementPart, ElementCreator } from '../src/xin-types';
export declare function camelToKabob(s: string): string;
export declare function kabobToCamel(s: string): string;
export declare const makeComponent: (...componentParts: ElementPart[]) => (...args: ElementPart[]) => any;
export declare const create: (tagType: string, ...contents: ElementPart[]) => HTMLElement;
export declare const elements: {
    [key: string]: ElementCreator<any>;
    [key: symbol]: ElementCreator<any>;
};
//# sourceMappingURL=elements.d.ts.map