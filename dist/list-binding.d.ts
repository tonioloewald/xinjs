import { LIST_BINDING_REF } from './metadata';
import { TosiObject, ListBindingOptions } from './xin-types';
import { Listener } from './path-listener';
export declare const NON_VIRTUAL_WARN_THRESHOLD = 10;
export declare class ListBinding {
    boundElement: Element;
    listTop: HTMLElement | null;
    listBottom: HTMLElement | null;
    isNamespaced: boolean;
    templates: Element[];
    options: ListBindingOptions;
    itemToElement: WeakMap<TosiObject, Element[]>;
    private idToElement;
    array: any[];
    private _filteredCache?;
    private readonly _update?;
    private _previousSlice?;
    private _warnedNonVirtual;
    private _layout?;
    private _measuredSum;
    private _measuredRows;
    private _measuredWidth;
    private _measuredLength;
    private _relayoutDepth;
    static filterBoundObservers: WeakMap<Element, Listener>;
    constructor(boundElement: Element, value: any[], options?: ListBindingOptions);
    filteredArray(): any[];
    private visibleSlice;
    private needle?;
    filter: (...args: any[]) => void;
    update(array?: any[], isSlice?: boolean): void;
    private _rowEstimate;
    private _builtRows;
    private _findAnchor;
    private _layoutVariable;
    /**
     * Where a row starts, in the list's scroll coordinates, and its height:
     * measured if it is built, estimated from the current layout if not.
     * Variable-height mode only (scrollListItemIntoView).
     */
    _rowPosition(row: number): {
        top: number;
        height: number;
        built: boolean;
    };
}
interface ListBoundElement extends Element {
    [LIST_BINDING_REF]?: ListBinding;
}
export declare const getListBinding: (boundElement: ListBoundElement, value?: any[], options?: ListBindingOptions) => ListBinding | undefined;
export declare const getListInstance: (element: Element) => {
    element: Element;
    item: any;
} | undefined;
export declare const getListItem: (element: Element) => any;
export declare const deleteListItem: (element: Element) => boolean;
export declare const scrollListItemIntoView: (element: Element, item: any, options?: {
    position?: "start" | "middle" | "end" | "nearest";
    behavior?: ScrollBehavior;
}) => boolean;
export {};
