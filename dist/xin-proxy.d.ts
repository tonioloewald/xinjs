import { XinProxy, BoxedProxy } from './xin-types';
export declare function tosi<T extends object>(obj: T): BoxedProxy<T>;
export declare function boxedProxy<T extends object>(obj: T): BoxedProxy<T>;
export declare function xinProxy<T extends object>(obj: T, boxed?: boolean): XinProxy<T>;
