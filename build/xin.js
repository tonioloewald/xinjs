import { getByPath, setByPath } from './by-path';
export const observerShouldBeRemoved = Symbol('observer should be removed');
// list of Array functions that change the array  
const ARRAY_MUTATIONS = ['sort', 'splice', 'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'unshift'];
const registry = {};
const listeners = []; // { path_string_or_test, callback }
const debugPaths = true;
const validPath = /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\mad+\]|\[[^=[\](),]*=[^[\]()]+\])*$/;
const isValidPath = (path) => validPath.test(path);
class Listener {
    constructor(test, callback) {
        if (typeof test === 'string') {
            this.test = t => typeof t === 'string' && t.startsWith(test);
        }
        else if (test instanceof RegExp) {
            this.test = test.test.bind(test);
        }
        else if (test instanceof Function) {
            this.test = test;
        }
        else {
            throw new Error('expect listener test to be a string, RegExp, or test function');
        }
        if (typeof callback === 'string') {
            this.callback = (...args) => {
                const func = xin[callback];
                if (func) {
                    func(...args);
                }
                else {
                    throw new Error(`callback path ${callback} does not exist`);
                }
            };
        }
        else if (typeof callback === 'function') {
            this.callback = callback;
        }
        else {
            throw new Error('expect callback to be a path or function');
        }
        listeners.push(this);
    }
}
const touch = (path) => {
    listeners
        .filter(listener => {
        let heard;
        try {
            heard = listener.test(path);
        }
        catch (e) {
            throw new Error(`listener test (${path}) threw ${e}`);
        }
        if (heard === observerShouldBeRemoved) {
            unobserve(listener);
            return false;
        }
        return !!heard;
    })
        .forEach(listener => {
        try {
            if (listener.callback(path) === observerShouldBeRemoved) {
                unobserve(listener);
            }
        }
        catch (e) {
            throw new Error(`listener callback threw ${e} handling ${path}`);
        }
    });
};
const observe = (test, callback) => {
    return new Listener(test, callback);
};
const unobserve = (listener) => {
    let index;
    let found = false;
    index = listeners.indexOf(listener);
    if (index > -1) {
        listeners.splice(index, 1);
    }
    else {
        throw new Error('unobserve failed, listener not found');
    }
    return found;
};
const extendPath = (path = '', prop = '') => {
    if (path === '') {
        return prop;
    }
    else {
        if (prop.match(/^\d+$/) || prop.includes('=')) {
            return `${path}[${prop}]`;
        }
        else {
            return `${path}.${prop}`;
        }
    }
};
const regHandler = (path = '') => ({
    get(target, prop) {
        const compoundProp = prop.match(/^([^.[]+)\.(.+)$/) || // basePath.subPath (omit '.')
            prop.match(/^([^\]]+)(\[.+)/) || // basePath[subPath
            prop.match(/^(\[[^\]]+\])\.(.+)$/) || // [basePath].subPath (omit '.')
            prop.match(/^(\[[^\]]+\])\[(.+)$/); // [basePath][subPath
        if (compoundProp) {
            const [, basePath, subPath] = compoundProp;
            const currentPath = extendPath(path, basePath);
            const value = getByPath(target, basePath);
            // @ts-expect-error
            return value && typeof value === 'object' ? new Proxy(value, regHandler(currentPath))[subPath] : value;
        }
        if (prop === '_xinPath') {
            return path;
        }
        if (prop === '_xinValue') {
            return target;
        }
        if (prop.startsWith('[') && prop.endsWith(']')) {
            prop = prop.substr(1, prop.length - 2);
        }
        if (Object.prototype.hasOwnProperty.call(target, prop) ||
            (Array.isArray(target) && typeof prop === 'string' && prop.includes('='))) {
            let value;
            if (prop.includes('=')) {
                const [idPath, needle] = prop.split('=');
                value = target.find((candidate) => `${getByPath(candidate, idPath)}` === needle);
            }
            else {
                value = (target)[prop];
            }
            if (value &&
                typeof value === 'object' &&
                (value.constructor === Object || value.constructor === Array)) {
                const currentPath = extendPath(path, prop);
                const proxy = new Proxy(value, regHandler(currentPath));
                return proxy;
            }
            else if (typeof value === 'function') {
                return value.bind(target);
            }
            else {
                return value;
            }
        }
        else if (Array.isArray(target)) {
            // @ts-ignore -- tsc doesn't like the fact we're looking at array functions
            return typeof target[prop] === 'function'
                ? (...items) => {
                    // @ts-ignore
                    const result = (Array.prototype[prop]).apply(target, items);
                    if (ARRAY_MUTATIONS.includes(prop)) {
                        touch(path);
                    }
                    return result;
                }
                : target[Number(prop)];
        }
        else {
            return undefined;
        }
    },
    set(target, prop, value) {
        if (value && value._xinPath) {
            throw new Error('You cannot put xin proxies into the registry');
        }
        const fullPath = extendPath(path, prop);
        if (debugPaths && !isValidPath(fullPath)) {
            throw new Error(`setting invalid path ${fullPath}`);
        }
        if (setByPath(registry, fullPath, value)) {
            touch(fullPath);
        }
        return true;
    }
});
const xin = new Proxy(registry, regHandler());
export { touch, observe, unobserve, xin, isValidPath };
