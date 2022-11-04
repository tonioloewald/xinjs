import { XinObject } from './xin-types';
export declare const isAsync: (func: Function) => boolean;
export declare const describe: (x: any) => string;
export declare const isInstanceOf: (obj: any, constructor: string | Function) => boolean;
export declare const specificTypeMatch: (type: any, subject: any) => boolean;
export declare const describeType: (x: any) => XinObject | string;
export declare const typeJSON: (x: any) => string;
export declare const typeJS: (x: any) => string;
export declare const matchType: (example: any, subject: any, errors?: string[], path?: string) => string[];
export declare const exampleAtPath: (example: any, path: string | string[]) => any;
interface TypeErrorConfig {
    functionName?: string;
    isParamFailure: boolean;
    expected: any;
    found: any;
    errors: string[];
}
export declare class TypeError {
    functionName: string;
    isParamFailure: boolean;
    expected: any;
    found: any;
    errors: string[];
    constructor(config: TypeErrorConfig);
    toString(): string;
}
export declare const assignReadOnly: (obj: any, propMap: XinObject) => any;
export declare const matchParamTypes: (types: any[], params: any[]) => string[];
interface TypeSafeFunction {
    (...args: any[]): any;
    paramTypes: any[];
    resultType: any;
}
export declare const typeSafe: (func: Function, paramTypes?: any[], resultType?: any, functionName?: string) => TypeSafeFunction;
export {};
//# sourceMappingURL=type-by-example.d.ts.map