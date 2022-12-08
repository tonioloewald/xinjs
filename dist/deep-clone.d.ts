import { XinObject, XinArray } from './xin-types';
type Scalar = string | boolean | number | Function;
type Cloneable = Scalar | XinObject | XinArray;
export declare function deepClone(obj: Cloneable): Cloneable | Cloneable[];
export {};
//# sourceMappingURL=deep-clone.d.ts.map