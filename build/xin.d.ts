import { XinObject, PathTestFunction, ObserverCallbackFunction } from './xin-types';
import { settings } from './settings';
import { Listener, touch, unobserve, updates, observerShouldBeRemoved } from './path-listener';
declare const isValidPath: (path: string) => boolean;
declare const observe: (test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction) => Listener;
declare const xin: XinObject;
export { xin, updates, touch, observe, unobserve, observerShouldBeRemoved, isValidPath, settings };
//# sourceMappingURL=xin.d.ts.map