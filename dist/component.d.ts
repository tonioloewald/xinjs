import { StyleSheet } from './css';
import { ContentType } from './dom';
import { ElementCreator, SwissArmyElement } from './xin-types';
export declare abstract class Component extends HTMLElement {
    static elements: {
        [key: string]: ElementCreator<any>;
        [key: symbol]: ElementCreator<any>;
    };
    private static _elementCreator?;
    styleNode?: HTMLStyleElement;
    content: ContentType | null;
    value?: any;
    [key: string]: any;
    static StyleNode(styleSpec: StyleSheet): HTMLStyleElement;
    static elementCreator(options?: ElementDefinitionOptions & {
        tag?: string;
    }): ElementCreator;
    initAttributes(...attributeNames: string[]): void;
    private initValue;
    private _refs?;
    get refs(): {
        [key: string]: SwissArmyElement;
    };
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _changeQueued;
    private _renderQueued;
    queueRender(triggerChangeEvent?: boolean): void;
    private _hydrated;
    private hydrate;
    render(): void;
}
//# sourceMappingURL=component.d.ts.map