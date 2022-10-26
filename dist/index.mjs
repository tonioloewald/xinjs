import { useState, useEffect } from 'react';

const stringify = (x) => {
    try {
        return JSON.stringify(x);
    }
    catch (_) {
        return '{has circular references}';
    }
};
const makeError = (...messages) => new Error(messages.map(stringify).join(' '));

// unique tokens passed to set by path to delete or create properties
const now36 = () => new Date(parseInt('1000000000', 36) + Date.now()).valueOf().toString(36).slice(1);
let _seq = 0;
const seq = () => (parseInt('10000', 36) + (++_seq)).toString(36).substr(-5);
const id = () => now36() + seq();
const _delete_ = {};
const _newObject_ = {};
function pathParts(path) {
    if (!path) {
        return [];
    }
    if (Array.isArray(path)) {
        return path;
    }
    else {
        const parts = [];
        while (path.length) {
            var index = path.search(/\[[^\]]+\]/);
            if (index === -1) {
                parts.push(path.split('.'));
                break;
            }
            else {
                const part = path.substr(0, index);
                path = path.substr(index);
                if (part) {
                    parts.push(part.split('.'));
                }
                index = path.indexOf(']') + 1;
                parts.push(path.substr(1, index - 2));
                // handle paths dereferencing array element like foo[0].id
                if (path.substr(index, 1) === '.') {
                    index += 1;
                }
                path = path.substr(index);
            }
        }
        return parts;
    }
}
const idPathMaps = new WeakMap();
function buildIdPathValueMap(array, idPath) {
    if (array && !idPathMaps.get(array)) {
        idPathMaps.set(array, {});
    }
    if (!idPathMaps.get(array)[idPath]) {
        idPathMaps.get(array)[idPath] = {};
    }
    const map = idPathMaps.get(array)[idPath];
    if (idPath === '_auto_') {
        array.forEach((item, idx) => {
            if (item._auto_ === undefined)
                item._auto_ = id();
            map[item._auto_ + ''] = idx;
        });
    }
    else {
        array.forEach((item, idx) => {
            map[getByPath(item, idPath) + ''] = idx;
        });
    }
    return map;
}
function getIdPathMap(array, idPath) {
    if (!idPathMaps.get(array) || !idPathMaps.get(array)[idPath]) {
        return buildIdPathValueMap(array, idPath);
    }
    else {
        return idPathMaps.get(array)[idPath];
    }
}
function keyToIndex(array, idPath, idValue) {
    idValue = idValue + '';
    /*
    if (array.length > 200) {
      return array.findIndex(a => getByPath(a, idPath) + '' === idValue)
    } */
    let idx = getIdPathMap(array, idPath)[idValue];
    if (idx === undefined || getByPath(array[idx], idPath) + '' !== idValue) {
        idx = buildIdPathValueMap(array, idPath)[idValue];
    }
    return idx;
}
function byKey(obj, key, valueToInsert) {
    if (!obj[key]) {
        obj[key] = valueToInsert;
    }
    return obj[key];
}
function byIdPath(array, idPath, idValue, valueToInsert) {
    let idx = idPath ? keyToIndex(array, idPath, idValue) : idValue;
    if (valueToInsert === _delete_) {
        array.splice(idx, 1);
        idPathMaps.delete(array);
        return Symbol('deleted');
    }
    else if (valueToInsert === _newObject_) {
        if (!idPath && !array[idx]) {
            array[idx] = {};
        }
    }
    else if (valueToInsert) {
        if (idx !== undefined) {
            array[idx] = valueToInsert;
        }
        else if (idPath && getByPath(valueToInsert, idPath) + '' === idValue + '') {
            array.push(valueToInsert);
            idx = array.length - 1;
        }
        else {
            throw new Error(`byIdPath insert failed at [${idPath}=${idValue}]`);
        }
    }
    return array[idx];
}
function expectArray(obj) {
    if (!Array.isArray(obj)) {
        throw makeError('setByPath failed: expected array, found', obj);
    }
}
function expectObject(obj) {
    if (!obj || obj.constructor !== Object) {
        throw makeError('setByPath failed: expected Object, found', obj);
    }
}
function getByPath(obj, path) {
    const parts = pathParts(path);
    var found = obj;
    var i, iMax, j, jMax;
    for (i = 0, iMax = parts.length; found && i < iMax; i++) {
        var part = parts[i];
        if (Array.isArray(part)) {
            for (j = 0, jMax = part.length; found && j < jMax; j++) {
                var key = part[j];
                found = found[key];
            }
        }
        else {
            if (!found.length) {
                if (part[0] === '=') {
                    found = found[part.substr(1)];
                }
                else {
                    return undefined;
                }
            }
            else if (part.indexOf('=') > -1) {
                const [idPath, ...tail] = part.split('=');
                found = byIdPath(found, idPath, tail.join('='));
            }
            else {
                j = parseInt(part, 10);
                found = found[j];
            }
        }
    }
    return found;
}
function setByPath(orig, path, val) {
    let obj = orig;
    const parts = pathParts(path);
    while (obj && parts.length) {
        const part = parts.shift();
        if (typeof part === 'string') {
            const equalsOffset = part.indexOf('=');
            if (equalsOffset > -1) {
                if (equalsOffset === 0) {
                    expectObject(obj);
                }
                else {
                    expectArray(obj);
                }
                const idPath = part.substr(0, equalsOffset);
                const idValue = part.substr(equalsOffset + 1);
                obj = byIdPath(obj, idPath, idValue, parts.length ? _newObject_ : val);
                if (!parts.length) {
                    return true;
                }
            }
            else {
                expectArray(obj);
                const idx = parseInt(part, 10);
                if (parts.length) {
                    obj = obj[idx];
                }
                else {
                    if (val !== _delete_) {
                        if (obj[idx] === val) {
                            return false;
                        }
                        obj[idx] = val;
                    }
                    else {
                        obj.splice(idx, 1);
                    }
                    return true;
                }
            }
        }
        else if (Array.isArray(part) && part.length) {
            expectObject(obj);
            while (part.length) {
                const key = part.shift();
                if (part.length || parts.length) {
                    // if we're at the end of part.length then we need to insert an array
                    obj = byKey(obj, key, part.length ? {} : []);
                }
                else {
                    if (val !== _delete_) {
                        if (obj[key] === val) {
                            return false;
                        }
                        obj[key] = val;
                    }
                    else {
                        if (!obj.hasOwnProperty(key)) {
                            return false;
                        }
                        delete obj[key];
                    }
                    return true;
                }
            }
        }
        else {
            throw new Error(`setByPath failed, bad path ${path}`);
        }
    }
    throw new Error(`setByPath(${orig}, ${path}, ${val}) failed`);
}

const observerShouldBeRemoved = Symbol('observer should be removed');
// list of Array functions that change the array  
const ARRAY_MUTATIONS = ['sort', 'splice', 'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'unshift'];
const registry = {};
const listeners = []; // { path_string_or_test, callback }
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
const getPath = (what) => {
    return typeof what === 'object' ? what._xinPath : what;
};
const touch = (what) => {
    const path = getPath(what);
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
            return target ? target[prop] : undefined;
        }
    },
    set(target, prop, value) {
        if (value && value._xinPath) {
            throw new Error('You cannot put xin proxies into the registry');
        }
        const fullPath = extendPath(path, prop);
        if (!isValidPath(fullPath)) {
            throw new Error(`setting invalid path ${fullPath}`);
        }
        if (setByPath(registry, fullPath, value)) {
            touch(fullPath);
        }
        return true;
    }
});
const xin = new Proxy(registry, regHandler());

// TODO declare type the way it's declated for useState so that TypeScript
// passes through type of initialValue to the right thing
const useXin = (path, initialValue = '') => {
    const [value, update] = useState(xin[path] || initialValue);
    useEffect(() => {
        const observer = (path) => {
            update(xin[path]);
        };
        const listener = observe(path, observer);
        return () => {
            unobserve(listener);
        };
    });
    const setValue = (value) => {
        xin[path] = value;
    };
    return [value, setValue];
};

const isAsync = (func) => func && func.constructor === (async () => { }).constructor;
const describe = (x) => {
    if (x === null)
        return 'null';
    if (Array.isArray(x))
        return 'array';
    if (typeof x === 'number') {
        if (isNaN(x))
            return 'NaN';
    }
    if (typeof x === 'string' && x.startsWith('#'))
        return x;
    if (x instanceof Promise)
        return 'promise';
    if (typeof x === 'function') {
        return x.constructor === (async () => { }).constructor
            ? 'async'
            : 'function';
    }
    if (typeof x === 'object' && x.constructor.name !== 'Object') {
        return x.constructor.name;
    }
    return typeof x;
};
// FIXME: bun doesn't handle unicode characters in code correctly
// should be able to replace \u221E with ∞
const parseFloatOrInfinity = (x) => {
    if (x === '-\u221E') {
        return -Infinity;
    }
    else if (x[0] === '\u221E') {
        return Infinity;
    }
    else {
        return parseFloat(x);
    }
};
const inRange = (spec, x) => {
    let lower, upper;
    if (spec === undefined)
        return true;
    try {
        // @ts-expect-error
        [, lower, upper] = (spec || '').match(/^([[(]-?[\d.\u221E]+)?,?(-?[\d.\u221E]+[\])])?$/);
    }
    catch (e) {
        throw new Error(`bad range ${spec}`);
    }
    if (lower) {
        const min = parseFloatOrInfinity(lower.substr(1));
        if (lower[0] === '(') {
            if (x <= min)
                return false;
        }
        else {
            if (x < min)
                return false;
        }
    }
    if (upper) {
        const max = parseFloatOrInfinity(upper);
        if (upper.endsWith(')')) {
            if (x >= max)
                return false;
        }
        else {
            if (x > max)
                return false;
        }
    }
    return true;
};
const regExps = {};
const regexpTest = (spec, subject) => {
    const regexp = regExps[spec] ? regExps[spec] : regExps[spec] = new RegExp(spec);
    return regexp.test(subject);
};
const isInstanceOf = (obj, constructor) => {
    if (typeof constructor === 'function') {
        return obj instanceof Function;
    }
    else {
        let proto = Object.getPrototypeOf(obj);
        while (proto.constructor && proto.constructor !== Object) {
            if (proto.constructor.name === constructor) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
};
const specificTypeMatch = (type, subject) => {
    const [, optional, baseType, , spec] = type.match(/^#([?]?)([^\s]+)(\s(.*))?$/) || [];
    if (optional && (subject === null || subject === undefined))
        return true;
    const subjectType = describe(subject);
    switch (baseType) {
        case 'forbidden':
            return false;
        case 'any':
            return subject !== null && subject !== undefined;
        case 'native':
            if (typeof subject !== 'function' || subject.toString() !== 'function () { [native code] }') {
                return false;
            }
            if (!type) {
                return true;
            }
            return isAsync(subject) ? type.match(/^async\b/) : type.match(/^function\b/);
        case 'function':
            if (subjectType !== 'function')
                return false;
            // todo allow for typeSafe functions with param/result specified by name
            return true;
        case 'number':
            if (subjectType !== 'number')
                return false;
            return inRange(spec, subject);
        case 'int':
            if (subjectType !== 'number' || subject !== Math.floor(subject))
                return false;
            return inRange(spec, subject);
        case 'union':
            return !!spec.split('||').find((type) => specificTypeMatch(`#${type}`, subject));
        case 'enum':
            try {
                return spec.split('|').map(JSON.parse).includes(subject);
            }
            catch (e) {
                throw new Error(`bad enum specification (${spec}), expect JSON strings`);
            }
        case 'void':
            return subjectType === 'undefined' || subjectType === 'null';
        case 'nothing':
            return subjectType === 'undefined';
        case 'string':
            return subjectType === 'string';
        case 'regexp':
            return subjectType === 'string' && regexpTest(spec, subject);
        case 'array':
            return Array.isArray(subject);
        case 'instance':
            // @ts-ignore
            return isInstanceOf(subject, spec);
        case 'promise':
            return subject instanceof Promise;
        case 'object':
            return !!subject && typeof subject === 'object' && !Array.isArray(subject);
        default:
            if (subjectType !== baseType) {
                throw makeError('got', subject, `expected "${type}", "${subjectType}" does not match "${baseType}"`);
            }
            else {
                return true;
            }
    }
};
const quoteIfString = (x) => typeof x === 'string' ? `"${x}"` : (typeof x === 'object' ? describe(x) : x);
// when checking large arrays, only check a maximum of 111 elements
function* arraySampler(a) {
    let i = 0;
    // 101 is a prime number so hopefully we'll avoid sampling fixed patterns
    const increment = Math.ceil(a.length / 101);
    while (i < a.length) {
        // first five
        if (i < 5) {
            yield { sample: a[i], i };
            i++;
            // last five
        }
        else if (i > a.length - 5) {
            yield { sample: a[i], i };
            i++;
        }
        else {
            // ~1% of the ones in the middle
            yield { sample: a[i], i };
            i = Math.min(i + increment, a.length - 4);
        }
    }
}
const matchType = (example, subject, errors = [], path = '') => {
    const exampleType = describe(example);
    const subjectType = describe(subject);
    const typesMatch = exampleType.startsWith('#')
        ? specificTypeMatch(exampleType, subject)
        : exampleType === subjectType;
    if (!typesMatch) {
        errors.push(`${path ? path + ' ' : ''}was ${quoteIfString(subject)}, expected ${exampleType}`);
    }
    else if (exampleType === 'array') {
        // only checking first element of subject for now
        const sampler = subject.length ? arraySampler(subject) : false;
        if (example.length === 1 && sampler) {
            // assume homogenous array
            for (const { sample, i } of sampler)
                matchType(example[0], sample, errors, `${path}[${i}]`);
        }
        else if (example.length > 1 && sampler) {
            // assume heterogeneous array
            for (const { sample, i } of sampler) {
                let foundMatch = false;
                for (const specificExample of example) {
                    if (matchType(specificExample, sample, [], '').length === 0) {
                        foundMatch = true;
                        break;
                    }
                }
                if (!foundMatch)
                    errors.push(`${path}[${i}] had no matching type`);
            }
        }
    }
    else if (exampleType === 'object') {
        matchKeys(example, subject, errors, path);
    }
    return errors;
};
const legalVarName = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
const matchKeys = (example, subject, errors = [], path = '') => {
    const testedKeys = new Set();
    for (const key of Object.keys(example)) {
        if (key.startsWith('#')) {
            let keyTest = legalVarName;
            try {
                if (key !== '#') {
                    keyTest = new RegExp(`^${key.substr(1)}$`);
                }
            }
            catch (e) {
                const badKeyError = `illegal regular expression in example key '${key}'`;
                errors.push(badKeyError);
                throw makeError(badKeyError);
            }
            const matchingKeys = Object.keys(subject).filter(key => keyTest.test(key));
            for (const k of matchingKeys) {
                if (!testedKeys.has(k)) {
                    matchType(example[key], subject[k], errors, `${path}./^${key.substr(1)}$/:${k}`);
                    testedKeys.add(k);
                }
            }
        }
        else if (key.endsWith('?')) {
            const k = key.substr(0, key.length - 1);
            if (Object.hasOwnProperty.call(subject, k)) {
                if (!testedKeys.has(k)) {
                    matchType(example[key], subject[k], errors, path + '.' + k);
                    testedKeys.add(k);
                }
            }
        }
        else {
            if (!testedKeys.has(key)) {
                matchType(example[key], subject[key], errors, path + '.' + key);
                testedKeys.add(key);
            }
        }
    }
    return errors;
};
class TypeError {
    constructor(config) {
        // initializers are unnecessary but TypeScript is too stupid
        this.functionName = undefined;
        this.isParamFailure = false;
        this.errors = [];
        Object.assign(this, config);
    }
    toString() {
        const { functionName, isParamFailure, errors } = this;
        return `${functionName} failed: bad ${isParamFailure ? 'parameter' : 'result'}, ${JSON.stringify(errors)}`;
    }
}
const assignReadOnly = (obj, propMap) => {
    propMap = { ...propMap };
    for (const key of Object.keys(propMap)) {
        const value = propMap[key];
        Object.defineProperty(obj, key, {
            enumerable: true,
            get() {
                return value;
            },
            set(value) {
                throw new Error(`${key} is read-only`);
            }
        });
    }
    return obj;
};
const matchParamTypes = (types, params) => {
    for (let i = 0; i < params.length; i++) {
        if (params[i] instanceof TypeError) {
            return params[i];
        }
    }
    const errors = types.map((type, i) => matchType(type, params[i]));
    return errors.flat().length ? errors : [];
};
const typeSafe = (func, paramTypes = [], resultType = undefined, functionName = undefined) => {
    const paramErrors = matchParamTypes(['#function', '#?array', '#?any', '#?string'], [func, paramTypes, resultType, functionName]);
    if (paramErrors instanceof TypeError) {
        throw new Error(`typeSafe was passed bad paramters`);
    }
    if (!functionName)
        functionName = func.name || 'anonymous';
    let callCount = 0;
    return assignReadOnly(function (...params) {
        callCount += 1;
        const paramErrors = matchParamTypes(paramTypes, params);
        // short circuit failures
        if (paramErrors instanceof TypeError)
            return paramErrors;
        if (paramErrors.length === 0) {
            const result = func(...params);
            const resultErrors = matchType(resultType, result);
            if (resultErrors.length === 0) {
                return result;
            }
            else {
                return new TypeError({
                    functionName,
                    isParamFailure: false,
                    expected: resultType,
                    found: result,
                    errors: resultErrors
                });
            }
        }
        return new TypeError({
            functionName,
            isParamFailure: true,
            expected: paramTypes,
            found: params,
            errors: paramErrors
        });
    }, {
        paramTypes,
        resultType,
        getCallCount: () => callCount
    });
};

const filterArray = (template, obj) => {
    if (!Array.isArray(obj)) {
        return undefined;
    }
    if (template.length === 0) {
        return [...obj];
    }
    const output = [];
    for (const item of obj) {
        const itemTemplate = template.find(possible => matchType(possible, item).length === 0);
        if (itemTemplate !== undefined) {
            output.push(filter(itemTemplate, item));
        }
    }
    return output;
};
const filterObject = (template, obj) => {
    if (matchType(template, obj).length) {
        return undefined;
    }
    const output = {};
    for (const key of Object.keys(template)) {
        const value = filter(template[key], obj[key]);
        if (value !== undefined) {
            output[key] = value;
        }
    }
    return output;
};
const filter = (template, obj) => {
    if (obj === undefined || obj === null) {
        return undefined;
    }
    else if (typeof obj !== 'object' && matchType(template, obj).length) {
        return undefined;
    }
    else if (Array.isArray(template)) {
        return filterArray(template, obj);
    }
    else if (typeof template === 'object') {
        return filterObject(template, obj);
    }
    else {
        return matchType(obj, template).length ? undefined : obj;
    }
};

const hotReload = (test = () => true) => {
    const savedState = localStorage.getItem('xin-state');
    if (savedState) {
        const state = JSON.parse(savedState);
        for (const key of Object.keys(state).filter(test)) {
            if (xin[key]) {
                Object.assign(xin[key], state[key]);
            }
            else {
                xin[key] = state[key];
            }
        }
    }
    let deferredSave = 0;
    const saveState = () => {
        const state = xin._xinValue;
        for (const key of Object.keys(state).filter(test)) {
            state[key];
        }
        localStorage.setItem('xin-state', JSON.stringify(xin._xinValue));
        console.log('xin state saved to localStorage');
    };
    observe(test, () => {
        clearTimeout(deferredSave);
        deferredSave = setTimeout(saveState, 250);
    });
};

export { filter, hotReload, matchType, observe, observerShouldBeRemoved, touch, typeSafe, unobserve, useXin, xin };
