import { Color } from './color';
import { Component } from './component';
import { vars, varDefault } from './css';
import { XinStyleSheet } from './css-types';
import { bind, on } from './bind';
import { elements, svgElements, mathML } from './elements';
import { ElementCreator, PartsMap } from './xin-types';
import { xin, boxed } from './xin';
import { xinProxy, boxedProxy } from './xin-proxy';
export interface XinFactory {
    Color: typeof Color;
    Component: typeof Component;
    elements: typeof elements;
    svgElements: typeof svgElements;
    mathML: typeof mathML;
    vars: typeof vars;
    varDefault: typeof varDefault;
    xin: typeof xin;
    boxed: typeof boxed;
    xinProxy: typeof xinProxy;
    boxedProxy: typeof boxedProxy;
    makeComponent: typeof makeComponent;
    bind: typeof bind;
    on: typeof on;
    version: string;
}
export interface XinComponentSpec<T = PartsMap> {
    type: Component<T>;
    styleSpec?: XinStyleSheet;
}
export interface XinPackagedComponent<T = PartsMap> {
    type: Component<T>;
    creator: ElementCreator;
}
export declare const madeComponents: {
    [key: string]: XinPackagedComponent<any>;
};
export type XinBlueprint<T = PartsMap> = (tag: string, module: XinFactory) => XinComponentSpec<T> | Promise<XinComponentSpec<T>>;
export declare function makeComponent<T = PartsMap>(tag: string, blueprint: XinBlueprint<T>): Promise<XinPackagedComponent<T>>;
