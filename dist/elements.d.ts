import { ElementPart, ElementCreator, SwissArmyElement } from '../src/xin-types';
export declare const makeComponent: (...componentParts: ElementPart[]) => (...args: ElementPart[]) => any;
export declare const create: (tagType: string, ...contents: ElementPart[]) => SwissArmyElement;
export declare const elements: {
    [key: string]: ElementCreator<any>;
    [key: symbol]: ElementCreator<any>;
};
//# sourceMappingURL=elements.d.ts.map