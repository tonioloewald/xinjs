type VoidFunc = (...args: any[]) => void;
export declare const debounce: (origFn: VoidFunc, minInterval?: number) => VoidFunc;
export declare const throttle: (origFn: VoidFunc, minInterval?: number) => VoidFunc;
export {};
