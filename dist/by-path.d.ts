import { XinObject, XinArray } from './xin-types';
type Part = string | string[];
type PartArray = Part[];
declare function pathParts(path: string | PartArray): PartArray;
declare function getByPath(obj: XinObject | XinArray, path: string): any;
declare function setByPath(orig: XinObject | XinArray, path: string, val: any): boolean;
declare function deleteByPath(orig: XinObject, path: string): void;
export { getByPath, setByPath, deleteByPath, pathParts };
