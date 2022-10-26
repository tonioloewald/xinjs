import { XinObject, PathTestFunction, ObserverCallbackFunction } from './xin-types';
export declare const observerShouldBeRemoved: unique symbol;
declare const isValidPath: (path: string) => boolean;
declare class Listener {
    test: PathTestFunction;
    callback: ObserverCallbackFunction;
    constructor(test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction);
}
declare const touch: (what: string | {
    _xinPath: string;
}) => void;
declare const observe: (test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction) => Listener;
declare const unobserve: (listener: Listener) => boolean;
declare const xin: XinObject;
export { touch, observe, unobserve, xin, isValidPath };
//# sourceMappingURL=xin.d.ts.map