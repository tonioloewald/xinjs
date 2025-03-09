import { PathTestFunction, ObserverCallbackFunction } from './xin-types';
import { settings } from './settings';
import { Listener, touch, unobserve, updates, observerShouldBeRemoved } from './path-listener';
declare const isValidPath: (path: string) => boolean;
declare const observe: (test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction) => Listener;
declare const xin: {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
};
declare const boxed: {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
};
export { xin, boxed, updates, touch, observe, unobserve, observerShouldBeRemoved, isValidPath, settings, };
