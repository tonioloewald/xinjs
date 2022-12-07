import { XinProxyObject, PathTestFunction, ObserverCallbackFunction, xinValue, xinPath } from './xin-types';
import { settings } from './settings';
import { Listener, touch, unobserve, updates, observerShouldBeRemoved } from './path-listener';
export { xinValue, xinPath };
declare const isValidPath: (path: string) => boolean;
declare const observe: (test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction) => Listener;
declare const xin: XinProxyObject;
export { xin, updates, touch, observe, unobserve, observerShouldBeRemoved, isValidPath, settings };
//# sourceMappingURL=xin.d.ts.map