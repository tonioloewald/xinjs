import { XinObject } from './xin-types';
export declare const observerShouldBeRemoved: unique symbol;
declare type PathTestFunction = (path: string) => boolean | Symbol;
declare type CallbackFunction = (path: string) => void | Symbol;
declare const isValidPath: (path: string) => boolean;
declare class Listener {
    test: PathTestFunction;
    callback: CallbackFunction;
    constructor(test: string | RegExp | PathTestFunction, callback: string | CallbackFunction);
}
declare const touch: (path: string) => void;
declare const observe: (test: string | RegExp | PathTestFunction, callback: string | CallbackFunction) => Listener;
declare const unobserve: (listener: Listener) => boolean;
declare const xin: XinObject;
export { touch, observe, unobserve, xin, isValidPath };
//# sourceMappingURL=xin.d.ts.map