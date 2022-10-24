import { XinObject } from './xin-types';
declare function pathParts(path: string): (string & any[]) | (string | string[])[];
declare function getByPath(obj: XinObject, path: string): XinObject | undefined;
declare function setByPath(orig: XinObject, path: string, val: any): boolean;
declare function deleteByPath(orig: XinObject, path: string): void;
export { getByPath, setByPath, deleteByPath, pathParts };
//# sourceMappingURL=by-path.d.ts.map