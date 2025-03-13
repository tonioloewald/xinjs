import { Color } from './color';
import { Component } from './component';
import { vars, varDefault } from './css';
import { XinStyleSheet } from './css-types';
import { elements, svgElements, mathML } from './elements';
import { ElementCreator } from './xin-types';
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
    version: string;
}
export interface XinComponentSpec {
    type: typeof Component;
    styleSpec?: XinStyleSheet;
}
export interface XinPackagedComponent {
    type: typeof Component;
    creator: ElementCreator;
}
export declare const madeComponents: {
    [key: string]: XinPackagedComponent;
};
export type XinBlueprint = (tag: string, module: XinFactory) => XinComponentSpec | Promise<XinComponentSpec>;
export declare function makeComponent(tag: string, blueprint: XinBlueprint): Promise<XinPackagedComponent>;
