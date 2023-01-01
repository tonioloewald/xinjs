import { XinObject, XinArray } from './xin-types';
declare type Scalar = string | boolean | number | Function;
declare type Cloneable = Scalar | XinObject | XinArray;
export declare function deepClone(obj: Cloneable): Cloneable | Cloneable[];
export {};
//# sourceMappingURL=deep-clone.d.ts.map