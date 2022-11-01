import { getByPath, setByPath } from './by-path';
export const observerShouldBeRemoved = Symbol('observer should be removed');
// list of Array functions that change the array  
const ARRAY_MUTATIONS = ['sort', 'splice', 'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'unshift'];
const registry = {};
const listeners = []; // { path_string_or_test, callback }
const debugPaths = true;
const validPath = /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/;
const isValidPath = (path) => validPath.test(path);
class Listener {
    constructor(test, callback) {
        if (typeof test === 'string') {
            this.test = t => typeof t === 'string' && !!t && (test.startsWith(t) || t.startsWith(test));
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
const getPath = (what) => {
    return typeof what === 'object' ? what._xinPath : what;
};
const touchedPaths = [];
let updateTriggered = false;
let updatePromise;
let resolveUpdate;
export const updates = async () => {
    if (!updatePromise) {
        return;
    }
    await updatePromise;
};
const update = () => {
    console.time('xin async update');
    const paths = [...touchedPaths];
    for (const path of paths) {
        listeners
            .filter(listener => {
            let heard;
            try {
                heard = listener.test(path);
            }
            catch (e) {
                throw new Error(`${listener.test} threw "${e}" at "${path}"`);
            }
            if (heard === observerShouldBeRemoved) {
                unobserve(listener);
                return false;
            }
            return !!heard;
        })
            .forEach(listener => {
            let heard;
            try {
                heard = listener.callback(path);
            }
            catch (e) {
                throw new Error(`${listener.callback} threw "${e}" handling "${path}"`);
            }
            if (heard === observerShouldBeRemoved) {
                unobserve(listener);
            }
        });
    }
    touchedPaths.splice(0);
    updateTriggered = false;
    if (resolveUpdate) {
        resolveUpdate();
    }
    console.timeEnd('xin async update');
};
const touch = (what) => {
    const path = getPath(what);
    if (!updateTriggered) {
        updatePromise = new Promise(resolve => {
            resolveUpdate = resolve;
        });
        updateTriggered = setTimeout(update);
    }
    if (!touchedPaths.find(touchedPath => path.startsWith(touchedPath))) {
        touchedPaths.push(path);
    }
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
    // TODO figure out how to correctly return array[Symbol.iterator] so that for(const foo of xin.foos) works
    // as you'd expect
    get(target, _prop) {
        if (typeof _prop === 'symbol') {
            // @ts-ignore-error
            return target[_prop];
        }
        let prop = _prop;
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
        if ((!Array.isArray(target) && target[prop] !== undefined) ||
            (Array.isArray(target) && prop.includes('='))) {
            let value;
            if (prop.includes('=')) {
                const [idPath, needle] = prop.split('=');
                value = target.find((candidate) => `${getByPath(candidate, idPath)}` === needle);
            }
            else {
                value = (target)[prop];
            }
            if (value && typeof value === 'object') {
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
            // @ts-ignore -- we could be looking for an index, a property, or a method
            const value = target[prop];
            return typeof value === 'function'
                ? (...items) => {
                    // @ts-ignore
                    const result = (Array.prototype[prop]).apply(target, items);
                    if (ARRAY_MUTATIONS.includes(prop)) {
                        touch(path);
                    }
                    return result;
                }
                : typeof value === 'object'
                    ? new Proxy(value, regHandler(extendPath(path, prop)))
                    : value;
        }
        else {
            return target ? target[prop] : undefined;
        }
    },
    set(target, prop, value) {
        if (value && value._xinPath) {
            value = value._xinValue;
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
