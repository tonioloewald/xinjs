import { TosiObject, PathTestFunction, ObserverCallbackFunction } from './xin-types';
import { settings } from './settings';
import { Listener, touch, unobserve, updates, OBSERVER_SHOULD_BE_REMOVED } from './path-listener';
declare const isValidPath: (path: string) => boolean;
/**
 * THE ACCESSOR SURFACE, AS DATA. This list is what the `get` trap actually
 * serves — it is the implementation's own answer to "what is the accessor
 * API", and therefore the only authoritative one.
 *
 * It is `as const` so the TYPES can be checked against it rather than
 * hand-restating it. Six declaration surfaces describe this one proxy
 * (`TosiAccessor`, `TosiProps`, `BoxedScalarAPI`, `BoxedArrayProps`,
 * `BoxedScalar`, `BoxedProxy`), nothing kept them in sync, and they drifted:
 * `tosiBinding` was present on two and missing from a third for an unknown
 * number of releases. `src/type-surface.test.ts` now fails if a name here is
 * absent from the declared accessor type.
 */
export declare const ACCESSOR_PROP_NAMES: readonly ["path", "value", "touch", "observe", "bind", "on", "binding", "listBinding", "listFind", "listUpdate", "listRemove", "as", "take"];
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
} & import("./xin-types").TosiProps<TosiObject>;
export { xin, boxed, updates, touch, observe, unobserve, settings, isValidPath, OBSERVER_SHOULD_BE_REMOVED, };
