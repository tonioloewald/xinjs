import { PathTestFunction, ObserverCallbackFunction } from './xin-types';
export declare const observerShouldBeRemoved: unique symbol;
export declare const listeners: Listener[];
export declare class Listener {
    description: string;
    test: PathTestFunction;
    callback: ObserverCallbackFunction;
    constructor(test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction);
}
export declare const updates: () => Promise<void>;
export declare const touch: (touchable: any) => void;
export declare const observe: (test: string | RegExp | PathTestFunction, callback: ObserverCallbackFunction) => Listener;
export declare const unobserve: (listener: Listener) => void;
