import { PathTestFunction, ObserverCallbackFunction, XinTouchableType } from './xin-types';
export declare const observerShouldBeRemoved: unique symbol;
export declare const listeners: Listener[];
export declare class Listener {
    test: PathTestFunction;
    callback: ObserverCallbackFunction;
    constructor(test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction);
}
export declare const updates: () => Promise<void>;
export declare const touch: (what: XinTouchableType) => void;
export declare const observe: (test: string | RegExp | PathTestFunction, callback: ObserverCallbackFunction) => Listener;
export declare const unobserve: (listener: Listener) => boolean;
//# sourceMappingURL=path-listener.d.ts.map