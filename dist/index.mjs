import { useState, useEffect } from 'react';

const settings = {
    debug: false,
    perf: false
};

const observerShouldBeRemoved = Symbol('observer should be removed');
const listeners = []; // { path_string_or_test, callback }
const touchedPaths = [];
let updateTriggered = false;
let resolveUpdate;
const getPath = (what) => {
    return typeof what === 'object' ? what._xinPath : what;
};
class Listener {
    constructor(test, callback) {
        const callbackDescription = typeof callback === 'string' ? `"${callback}"` : `function ${callback.name}`;
        let testDescription;
        if (typeof test === 'string') {
            this.test = t => typeof t === 'string' && t !== '' && (test.startsWith(t) || t.startsWith(test));
            testDescription = `test = "${test}"`;
        }
        else if (test instanceof RegExp) {
            this.test = test.test.bind(test);
            testDescription = `test = "${test.toString()}"`;
        }
        else if (test instanceof Function) {
            this.test = test;
            testDescription = `test = function ${test.name}`;
        }
        else {
            throw new Error('expect listener test to be a string, RegExp, or test function');
        }
        this.description = `${testDescription}, ${callbackDescription}`;
        if (typeof callback === 'function') {
            this.callback = callback;
        }
        else {
            throw new Error('expect callback to be a path or function');
        }
        listeners.push(this);
    }
}
const update = () => {
    if (settings.perf) {
        console.time('xin async update');
    }
    const paths = [...touchedPaths];
    for (const path of paths) {
        listeners
            .filter(listener => {
            let heard;
            try {
                heard = listener.test(path);
            }
            catch (e) {
                throw new Error(`Listener ${listener.description} threw "${e}" at "${path}"`);
            }
            if (heard === observerShouldBeRemoved) {
                unobserve(listener);
                return false;
            }
            return heard;
        })
            .forEach(listener => {
            let outcome;
            try {
                outcome = listener.callback(path);
            }
            catch (e) {
                throw new Error(`Listener ${listener.description} threw "${e}" handling "${path}"`);
            }
            if (outcome === observerShouldBeRemoved) {
                unobserve(listener);
            }
        });
    }
    touchedPaths.splice(0);
    updateTriggered = false;
    if (typeof resolveUpdate === 'function') {
        resolveUpdate();
    }
    if (settings.perf) {
        console.timeEnd('xin async update');
    }
};
const touch = (what) => {
    const path = getPath(what);
    if (updateTriggered === false) {
        new Promise(resolve => {
            resolveUpdate = resolve;
        });
        updateTriggered = setTimeout(update);
    }
    if (touchedPaths.find(touchedPath => path.startsWith(touchedPath)) == null) {
        touchedPaths.push(path);
    }
};
const observe$1 = (test, callback) => {
    return new Listener(test, callback);
};
const unobserve = (listener) => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
        listeners.splice(index, 1);
    }
    else {
        throw new Error('unobserve failed, listener not found');
    }
};

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
const seq = () => (parseInt('10000', 36) + (++_seq)).toString(36).slice(-5);
const id = () => now36() + seq();
const _delete_ = {};
const _newObject_ = {};
function pathParts(path) {
    if (path === '') {
        return [];
    }
    if (Array.isArray(path)) {
        return path;
    }
    else {
        const parts = [];
        while (path.length > 0) {
            let index = path.search(/\[[^\]]+\]/);
            if (index === -1) {
                parts.push(path.split('.'));
                break;
            }
            else {
                const part = path.slice(0, index);
                path = path.slice(index);
                if (part !== '') {
                    parts.push(part.split('.'));
                }
                index = path.indexOf(']') + 1;
                parts.push(path.slice(1, index - 1));
                // handle paths dereferencing array element like foo[0].id
                if (path.slice(index, index + 1) === '.') {
                    index += 1;
                }
                path = path.slice(index);
            }
        }
        return parts;
    }
}
const idPathMaps = new WeakMap();
function buildIdPathValueMap(array, idPath) {
    if (idPathMaps.get(array) === undefined) {
        idPathMaps.set(array, {});
    }
    if (idPathMaps.get(array)[idPath] === undefined) {
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
    if (idPathMaps.get(array) === undefined || idPathMaps.get(array)[idPath] === undefined) {
        return buildIdPathValueMap(array, idPath);
    }
    else {
        return idPathMaps.get(array)[idPath];
    }
}
function keyToIndex(array, idPath, idValue) {
    idValue = idValue + '';
    let idx = getIdPathMap(array, idPath)[idValue];
    if (idx === undefined || getByPath(array[idx], idPath) + '' !== idValue) {
        idx = buildIdPathValueMap(array, idPath)[idValue];
    }
    return idx;
}
function byKey(obj, key, valueToInsert) {
    if (obj[key] === undefined && valueToInsert !== undefined) {
        obj[key] = valueToInsert;
    }
    return obj[key];
}
function byIdPath(array, idPath, idValue, valueToInsert) {
    let idx = idPath !== '' ? keyToIndex(array, idPath, idValue) : idValue;
    if (valueToInsert === _delete_) {
        array.splice(idx, 1);
        idPathMaps.delete(array);
        return Symbol('deleted');
    }
    else if (valueToInsert === _newObject_) {
        if (idPath === '' && array[idx] === undefined) {
            array[idx] = {};
        }
    }
    else if (valueToInsert !== undefined) {
        if (idx !== undefined) {
            array[idx] = valueToInsert;
        }
        else if (idPath !== '' && getByPath(valueToInsert, idPath) + '' === idValue + '') {
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
    if ((obj == null) || obj.constructor !== Object) {
        throw makeError('setByPath failed: expected Object, found', obj);
    }
}
function getByPath(obj, path) {
    const parts = pathParts(path);
    let found = obj;
    let i, iMax, j, jMax;
    for (i = 0, iMax = parts.length; found !== undefined && i < iMax; i++) {
        const part = parts[i];
        if (Array.isArray(part)) {
            for (j = 0, jMax = part.length; found !== undefined && j < jMax; j++) {
                const key = part[j];
                found = found[key];
            }
        }
        else {
            if (found.length === 0) {
                if (part[0] === '=') {
                    found = found[part.slice(1)];
                }
                else {
                    return undefined;
                }
            }
            else if (part.includes('=')) {
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
    while ((obj != null) && (parts.length > 0)) {
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
                const idPath = part.slice(0, equalsOffset);
                const idValue = part.slice(equalsOffset + 1);
                obj = byIdPath(obj, idPath, idValue, (parts.length > 0) ? _newObject_ : val);
                if (parts.length === 0) {
                    return true;
                }
            }
            else {
                expectArray(obj);
                const idx = parseInt(part, 10);
                if (parts.length > 0) {
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
        else if (Array.isArray(part) && (part.length > 0)) {
            expectObject(obj);
            while (part.length > 0) {
                const key = part.shift();
                if ((part.length > 0) || (parts.length > 0)) {
                    // if we're at the end of part.length then we need to insert an array
                    obj = byKey(obj, key, (part.length > 0) ? {} : []);
                }
                else {
                    if (val !== _delete_) {
                        if (obj[key] === val) {
                            return false;
                        }
                        obj[key] = val;
                    }
                    else {
                        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
                            return false;
                        }
                        // eslint-disable-next-line
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
    // eslint-disable-next-line
    throw new Error(`setByPath(${orig}, ${path}, ${val}) failed`);
}

// list of Array functions that change the array
const ARRAY_MUTATIONS = ['sort', 'splice', 'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'unshift'];
const registry = {};
const validPath = /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/;
const isValidPath = (path) => validPath.test(path);
const extendPath = (path = '', prop = '') => {
    if (path === '') {
        return prop;
    }
    else {
        if (prop.match(/^\d+$/) !== null || prop.includes('=')) {
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
            // @ts-expect-error
            return target[_prop];
        }
        let prop = _prop;
        const compoundProp = prop.match(/^([^.[]+)\.(.+)$/) ?? // basePath.subPath (omit '.')
            prop.match(/^([^\]]+)(\[.+)/) ?? // basePath[subPath
            prop.match(/^(\[[^\]]+\])\.(.+)$/) ?? // [basePath].subPath (omit '.')
            prop.match(/^(\[[^\]]+\])\[(.+)$/); // [basePath][subPath
        if (compoundProp !== null) {
            const [, basePath, subPath] = compoundProp;
            const currentPath = extendPath(path, basePath);
            const value = getByPath(target, basePath);
            return value !== null && typeof value === 'object' ? new Proxy(value, regHandler(currentPath))[subPath] : value;
        }
        if (prop === '_xinPath') {
            return path;
        }
        if (prop === '_xinValue') {
            return target;
        }
        if (prop.startsWith('[') && prop.endsWith(']')) {
            prop = prop.substring(1, prop.length - 1);
        }
        if ((!Array.isArray(target) && target[prop] !== undefined) ||
            (Array.isArray(target) && prop.includes('='))) {
            let value;
            if (prop.includes('=')) {
                const [idPath, needle] = prop.split('=');
                value = target.find(
                // eslint-disable-next-line
                (candidate) => `${getByPath(candidate, idPath)}` === needle);
            }
            else {
                value = (target)[prop];
            }
            if (value !== null && typeof value === 'object') {
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
            // @ts-expect-error -- we could be looking for an index, a property, or a method
            const value = target[prop];
            return typeof value === 'function'
                ? (...items) => {
                    // @ts-expect-error
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
            return target[prop];
        }
    },
    set(target, prop, value) {
        // eslint-disable-next-line
        if (value?._xinPath) {
            value = value._xinValue;
        }
        const fullPath = extendPath(path, prop);
        if (!isValidPath(fullPath)) {
            throw new Error(`setting invalid path ${fullPath}`);
        }
        let existing = xin[fullPath];
        if (existing?._xinValue != null) {
            existing = existing._xinValue;
        }
        if (existing !== value && setByPath(registry, fullPath, value)) {
            touch(fullPath);
        }
        return true;
    }
});
const observe = (test, callback) => {
    const func = typeof callback === 'function' ? callback : xin[callback];
    if (typeof func !== 'function') {
        throw new Error(`observe expects a function or path to a function, ${callback} is neither`);
    }
    return observe$1(test, func);
};
const xin = new Proxy(registry, regHandler());

// TODO declare type the way it's declated for useState so that TypeScript
// passes through type of initialValue to the right thing
const useXin = (path, initialValue = '') => {
    const [value, update] = useState(xin[path] !== undefined ? xin[path] : initialValue);
    useEffect(() => {
        const observer = () => {
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

const asyncFunc = async () => { };
const isAsync = (func) => func.constructor === (asyncFunc).constructor;
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
        [, lower, upper] = spec.match(/^([[(]-?[\d.\u221E]+)?,?(-?[\d.\u221E]+[\])])?$/);
    }
    catch (e) {
        throw new Error(`bad range ${spec}`);
    }
    if (lower !== undefined && lower !== '') {
        const min = parseFloatOrInfinity(lower.substring(1));
        if (lower[0] === '(') {
            if (x <= min)
                return false;
        }
        else {
            if (x < min)
                return false;
        }
    }
    if (upper !== undefined && upper !== '') {
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
    const regexp = regExps[spec] !== undefined ? regExps[spec] : regExps[spec] = new RegExp(spec);
    return regexp.test(subject);
};
const isInstanceOf = (obj, constructor) => {
    if (typeof constructor === 'function') {
        return obj instanceof Function;
    }
    else {
        let proto = Object.getPrototypeOf(obj);
        while (proto.constructor !== undefined && proto.constructor !== Object) {
            if (proto.constructor.name === constructor) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
};
const specificTypeMatch = (type, subject) => {
    // eslint-disable-next-line
    const [, optional, baseType, , spec] = type.match(/^#([?]?)([^\s]+)(\s(.*))?$/) || [];
    if (optional !== '' && (subject === null || subject === undefined))
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
            if (type == null) {
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
            return spec.split('||').find((type) => specificTypeMatch(`#${type}`, subject)) !== undefined;
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
            return isInstanceOf(subject, spec);
        case 'promise':
            return subject instanceof Promise;
        case 'object':
            return (subject !== null) && typeof subject === 'object' && !Array.isArray(subject);
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
        errors.push(`${path !== '' ? path + ' ' : ''}was ${quoteIfString(subject)}, expected ${exampleType}`);
    }
    else if (exampleType === 'array') {
        // only checking first element of subject for now
        const sampler = subject.length > 0 ? arraySampler(subject) : false;
        if (example.length === 1 && sampler !== false) {
            // assume homogenous array
            for (const { sample, i } of sampler)
                matchType(example[0], sample, errors, `${path}[${i}]`);
        }
        else if (example.length > 1 && sampler !== false) {
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
                    keyTest = new RegExp(`^${key.substring(1)}$`);
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
                    matchType(example[key], subject[k], errors, `${path}./^${key.substring(1)}$/:${k}`);
                    testedKeys.add(k);
                }
            }
        }
        else if (key.endsWith('?')) {
            const k = key.slice(0, key.length - 1);
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
        this.functionName = 'anonymous';
        this.isParamFailure = false;
        this.errors = [];
        Object.assign(this, config);
    }
    toString() {
        const { functionName, isParamFailure, errors } = this;
        return `${functionName}() failed, bad ${isParamFailure ? 'parameter' : 'return'}: ${JSON.stringify(errors)}`;
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
    const [paramErrors, returnErrors] = types.map((type, i) => matchType(type, params[i]));
    return [...paramErrors, ...returnErrors];
};
const typeSafe = (func, paramTypes = [], resultType = undefined, functionName = 'anonymous') => {
    const paramErrors = matchParamTypes(['#function', '#?array', '#?any', '#?string'], [func, paramTypes, resultType, functionName]);
    if (paramErrors instanceof TypeError) {
        throw new Error('typeSafe was passed bad parameters');
    }
    if (func.name !== '') {
        functionName = func.name;
    }
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
        const itemTemplate = (template).find(possible => matchType(possible, item).length === 0);
        if (itemTemplate !== undefined) {
            output.push(filter(itemTemplate, item));
        }
    }
    return output;
};
const filterObject = (template, obj) => {
    if (matchType(template, obj).length > 0) {
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
    else if (typeof obj !== 'object' && (matchType(template, obj).length > 0)) {
        return undefined;
    }
    else if (Array.isArray(template)) {
        return filterArray(template, obj);
    }
    else if (typeof obj === 'object') {
        return filterObject(template, obj);
    }
    else {
        return (matchType(template, obj).length > 0) ? undefined : obj;
    }
};

const debounce = (origFn, minInterval = 250) => {
    let debounceId;
    return (...args) => {
        if (debounceId !== undefined)
            clearTimeout(debounceId);
        debounceId = setTimeout(() => {
            origFn(...args);
        }, minInterval);
    };
};
const throttle = (origFn, minInterval = 250) => {
    let debounceId;
    let previousCall = Date.now() - minInterval;
    let inFlight = false;
    return (...args) => {
        clearTimeout(debounceId);
        debounceId = setTimeout(async () => {
            origFn(...args);
            previousCall = Date.now();
        }, minInterval);
        if (!inFlight && Date.now() - previousCall >= minInterval) {
            inFlight = true;
            try {
                origFn(...args);
                previousCall = Date.now();
            }
            finally {
                inFlight = false;
            }
        }
    };
};

const hotReload = (test = () => true) => {
    const savedState = localStorage.getItem('xin-state');
    if (savedState != null) {
        const state = JSON.parse(savedState);
        for (const key of Object.keys(state).filter(test)) {
            if (xin[key] !== undefined) {
                Object.assign(xin[key], state[key]);
            }
            else {
                xin[key] = state[key];
            }
        }
    }
    const saveState = debounce(() => {
        const obj = {};
        const state = xin._xinValue;
        for (const key of Object.keys(state).filter(test)) {
            obj[key] = state[key];
        }
        localStorage.setItem('xin-state', JSON.stringify(obj));
        console.log('xin state saved to localStorage');
    }, 500);
    observe(test, saveState);
};

const bind = (element, what, binding, options) => {
    if (element instanceof DocumentFragment) {
        throw new Error('bind cannot bind to a DocumentFragment');
    }
    const { toDOM, fromDOM } = binding;
    // eslint-disable-next-line
    if (typeof what !== 'string' && what !== null && typeof what === 'object' && !what._xinPath) {
        throw new Error('bind requires a path or object with xin Proxy');
    }
    const path = typeof what === 'string' ? what : what._xinPath;
    if (toDOM != null) {
        touch(path);
        observe(path, () => {
            const value = xin[path];
            if (typeof value === 'object' || (fromDOM == null) || fromDOM(element) !== value) {
                toDOM(element, value, options);
            }
        });
    }
    if (fromDOM != null) {
        const updateXin = () => {
            const value = fromDOM(element);
            if (value !== undefined && value !== null) {
                // eslint-disable-next-line
                const existing = xin[path]._xinValue || xin[path];
                // eslint-disable-next-line
                const actual = value._xinValue || value;
                if (xin[path] != null && existing !== actual) {
                    xin[path] = value;
                }
            }
        };
        element.addEventListener('input', throttle(updateXin, 500));
        element.addEventListener('change', updateXin);
    }
    return element;
};

const itemToElement = new WeakMap();
const elementToItem = new WeakMap();
const listBindings = new WeakMap();
class ListBinding {
    constructor(boundElement, options = {}) {
        this.boundElement = boundElement;
        if (boundElement.children.length !== 1) {
            throw new Error('ListBinding expects an element with exactly one child element');
        }
        if (boundElement.children[0] instanceof HTMLTemplateElement) {
            const template = boundElement.children[0];
            if (template.content.children.length !== 1) {
                throw new Error('ListBinding expects a template with exactly one child element');
            }
            template.remove();
            this.template = template.content.children[0].cloneNode(true);
        }
        else {
            this.template = boundElement.children[0];
            this.template.remove();
        }
        this.options = options;
    }
    update(array) {
        if (array == null) {
            array = [];
        }
        const { idPath, initInstance, updateInstance } = this.options;
        // @ts-expect-error
        const arrayPath = array._xinPath;
        let removed = 0;
        let moved = 0;
        let created = 0;
        for (const element of [...this.boundElement.children]) {
            const item = elementToItem.get(element);
            if ((item == null) || !array.includes(item)) {
                element.remove();
                itemToElement.delete(item);
                elementToItem.delete(element);
                removed++;
            }
        }
        // build a complete new set of elements in the right order
        const elements = [];
        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            if (item === undefined) {
                continue;
            }
            let element = itemToElement.get(item._xinValue);
            if (element == null) {
                created++;
                element = this.template.cloneNode(true);
                if (typeof item === 'object') {
                    itemToElement.set(item._xinValue, element);
                    elementToItem.set(element, item._xinValue);
                }
                this.boundElement.append(element);
                if (initInstance != null) {
                    // eslint-disable-next-line
                    initInstance(element, item);
                }
                // @ts-expect-error
                if (typeof element.bindValue === 'function') {
                    if (idPath == null) {
                        throw new Error('cannot bindValue without an idPath');
                    }
                    // @ts-expect-error
                    element._value = item;
                    const idValue = item[idPath];
                    const path = `${arrayPath}[${idPath}=${idValue}]`;
                    // @ts-expect-error
                    element.bindValue(path);
                }
            }
            if (updateInstance != null) {
                // eslint-disable-next-line
                updateInstance(element, item);
            }
            elements.push(element);
        }
        // make sure all the elements are in the DOM and in the correct location
        let insertionPoint = null;
        for (const element of elements) {
            if (element.previousElementSibling !== insertionPoint) {
                moved++;
                if (insertionPoint?.nextElementSibling != null) {
                    this.boundElement.insertBefore(element, insertionPoint.nextElementSibling);
                }
                else {
                    this.boundElement.append(element);
                }
            }
            insertionPoint = element;
        }
        if (settings.perf) {
            console.log(arrayPath, 'updated', { removed, created, moved });
        }
    }
}
const getListBinding = (boundElement, options) => {
    let listBinding = listBindings.get(boundElement);
    if (listBinding == null) {
        listBinding = new ListBinding(boundElement, options);
        listBindings.set(boundElement, listBinding);
    }
    return listBinding;
};

const bindings = {
    value: {
        toDOM(element, value) {
            // @ts-expect-error
            if (element.value !== undefined) {
                // @ts-expect-error
                element.value = value;
            }
            else {
                throw new Error(`cannot set value of <${element.tagName}>`);
            }
        },
        fromDOM(element) {
            // @ts-expect-error
            return element.value;
        }
    },
    text: {
        toDOM(element, value) {
            element.textContent = value;
        }
    },
    style: {
        toDOM(element, value) {
            if (typeof value === 'object') {
                for (const prop of Object.keys(value)) {
                    // @ts-expect-error
                    element.style[prop] = value[prop];
                }
            }
            else if (typeof value === 'string') {
                element.setAttribute('style', value);
            }
            else {
                throw new Error('style binding expects either a string or object');
            }
        }
    },
    list: {
        toDOM(element, value, options) {
            const listBinding = getListBinding(element, options);
            listBinding.update(value);
        }
    }
};

const hyphenated = (s) => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
const css = (obj) => {
    const selectors = Object.keys(obj).map((selector) => {
        const body = obj[selector];
        const rule = Object.keys(body)
            .map((prop) => `  ${hyphenated(prop)}: ${body[prop]};`)
            .join('\n');
        return `${selector} {\n${rule}\n}`;
    });
    return selectors.join('\n\n');
};

function deepClone(obj) {
    if (obj == null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(deepClone);
    }
    const clone = {};
    for (const key in obj) {
        const val = obj[key];
        if (obj != null && typeof obj === 'object') {
            clone[key] = deepClone(val);
        }
        else {
            clone[key] = val;
        }
    }
    return clone;
}

const dispatch = (target, type) => {
    const event = new Event(type);
    target.dispatchEvent(event);
};
/* global ResizeObserver */
const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const element = entry.target;
        dispatch(element, 'resize');
    }
});
const appendContentToElement = (elt, content) => {
    if (content != null) {
        if (typeof content === 'string') {
            elt.textContent = content;
        }
        else if (Array.isArray(content)) {
            content.forEach(node => {
                elt.append(node instanceof HTMLElement ? node.cloneNode(true) : node);
            });
        }
        else if (content instanceof HTMLElement) {
            elt.append(content.cloneNode(true));
        }
        else {
            throw new Error('expect text content or document node');
        }
    }
};

const templates = {};
function camelToKabob(s) {
    return s.replace(/[A-Z]/g, (c) => {
        return `-${c.toLocaleLowerCase()}`;
    });
}
function kabobToCamel(s) {
    return s.replace(/-([a-z])/g, (_, c) => {
        return c.toLocaleUpperCase();
    });
}
const create = (tagType, ...contents) => {
    if (templates[tagType] === undefined) {
        templates[tagType] = document.createElement(tagType);
    }
    const elt = templates[tagType].cloneNode();
    for (const item of contents) {
        if (item instanceof HTMLElement || item instanceof DocumentFragment || typeof item === 'string' || typeof item === 'number') {
            if (elt instanceof HTMLTemplateElement) {
                elt.content.append(item);
            }
            else {
                elt.append(item);
            }
        }
        else {
            for (const key of Object.keys(item)) {
                const value = (item)[key];
                if (key === 'apply') {
                    value(elt);
                }
                else if (key === 'style') {
                    if (typeof value === 'object') {
                        for (const prop of Object.keys(value)) {
                            if (prop.startsWith('--')) {
                                elt.style.setProperty(prop, value[prop]);
                            }
                            else {
                                // @ts-expect-error
                                elt.style[prop] = value[prop];
                            }
                        }
                    }
                    else {
                        elt.setAttribute('style', value);
                    }
                }
                else if (key.match(/^on[A-Z]/) != null) {
                    const eventType = key.substring(2).toLowerCase();
                    elt.addEventListener(eventType, value);
                }
                else if (key.match(/^bind[A-Z]/) != null) {
                    const bindingType = key.substring(4).toLowerCase();
                    const binding = bindings[bindingType];
                    if (binding !== undefined) {
                        bind(elt, value, binding);
                    }
                    else {
                        throw new Error(`${key} is not allowed, bindings.${bindingType} is not defined`);
                    }
                }
                else {
                    const attr = camelToKabob(key);
                    // @ts-expect-error-error
                    if (elt[attr] !== undefined) {
                        // @ts-expect-error-error
                        elt[attr] = value;
                    }
                    else if (typeof value === 'boolean') {
                        value ? elt.setAttribute(attr, '') : elt.removeAttribute(attr);
                    }
                    else {
                        elt.setAttribute(attr, value);
                    }
                }
            }
        }
    }
    return elt;
};
const fragment = (...contents) => {
    const frag = document.createDocumentFragment();
    for (const item of contents) {
        frag.append(item);
    }
    return frag;
};
const _elements = { fragment };
const elements = new Proxy(_elements, {
    get(target, tagName) {
        tagName = tagName.replace(/[A-Z]/g, c => `-${c.toLocaleLowerCase()}`);
        if (tagName.match(/^\w+(-\w+)*$/) == null) {
            throw new Error(`${tagName} does not appear to be a valid element tagName`);
        }
        else if (target[tagName] === undefined) {
            target[tagName] = (...contents) => create(tagName, ...contents);
        }
        return target[tagName];
    },
    set() {
        throw new Error('You may not add new properties to elements');
    }
});

const defaultSpec = {
    superClass: HTMLElement,
    methods: {},
    eventHandlers: {},
    props: {},
    attributes: {},
    content: elements.slot()
};
const makeWebComponent = (tagName, spec) => {
    const { superClass, style, methods, eventHandlers, props, attributes, content, role, value, bindValue, childListChange } = Object.assign({}, defaultSpec, spec);
    let styleNode;
    if (style !== undefined) {
        const styleText = css(Object.assign({ ':host([hidden])': { display: 'none !important' } }, style));
        styleNode = elements.style(styleText);
    }
    const componentClass = class extends superClass {
        constructor() {
            super();
            this._initialized = false;
            this._changeQueued = false;
            this._renderQueued = false;
            this._hydrated = false;
            if (Object.prototype.hasOwnProperty.call(attributes, 'value')) {
                throw new Error('do not define an attribute named "value"; define value directly instead');
            }
            if (Object.prototype.hasOwnProperty.call(attributes, 'value')) {
                throw new Error('do not define a prop named "value"; define value directly instead');
            }
            this.initAttributes();
            this.initProps();
            this.initValue();
            this.initEventHandlers();
            this.initRefs();
            this.queueRender();
            this._initialized = true;
        }
        initProps() {
            for (const prop of Object.keys(props)) {
                let propVal = deepClone(props[prop]);
                if (typeof propVal !== 'function') {
                    Object.defineProperty(this, prop, {
                        enumerable: false,
                        get() {
                            return propVal;
                        },
                        set(x) {
                            if (x !== undefined && (x !== propVal || typeof x === 'object')) {
                                propVal = x;
                                this.queueRender(true);
                            }
                        }
                    });
                }
                else {
                    const setter = propVal;
                    Object.defineProperty(this, prop, {
                        enumerable: false,
                        get() {
                            return setter.call(this);
                        },
                        set(x) {
                            if (setter.length === 1) {
                                setter.call(this, x);
                            }
                            else {
                                throw new Error(`cannot set ${prop}, it is read-only`);
                            }
                        }
                    });
                }
            }
        }
        initRefs() {
            // eslint-disable-next-line
            const self = this;
            this.elementRefs = new Proxy({}, {
                get(target, ref) {
                    if (target[ref] === undefined) {
                        const element = (self.shadowRoot != null) ? self.shadowRoot.querySelector(`[data-ref="${ref}"]`) : self.querySelector(`[data-ref="${ref}"]`);
                        if (element == null)
                            throw new Error(`elementRef "${ref}" does not exist!`);
                        element.removeAttribute('data-ref');
                        target[ref] = element;
                    }
                    return target[ref];
                },
                set() {
                    throw new Error('elementRefs is read-only');
                }
            });
        }
        initEventHandlers() {
            Object.keys(eventHandlers).forEach(eventType => {
                const passive = eventType.startsWith('touch') ? { passive: true } : false;
                this.addEventListener(eventType, eventHandlers[eventType].bind(this), passive);
            });
            if (childListChange !== undefined) {
                const observer = new MutationObserver(childListChange.bind(this));
                observer.observe(this, { childList: true });
            }
        }
        initAttributes() {
            const attributeNames = Object.keys(attributes);
            if (attributeNames.length > 0) {
                const attributeValues = {};
                const observer = new MutationObserver((mutationsList) => {
                    let triggerRender = false;
                    mutationsList.forEach((mutation) => {
                        // eslint-disable-next-line
                        triggerRender = !!(mutation.attributeName && attributeNames.includes(kabobToCamel(mutation.attributeName)));
                    });
                    if (triggerRender && this.queueRender !== undefined)
                        this.queueRender(false);
                });
                observer.observe(this, { attributes: true });
                attributeNames.forEach(attributeName => {
                    const attributeKabob = camelToKabob(attributeName);
                    Object.defineProperty(this, attributeName, {
                        enumerable: false,
                        get() {
                            if (typeof attributes[attributeName] === 'boolean') {
                                return this.hasAttribute(attributeKabob);
                            }
                            else {
                                // eslint-disable-next-line
                                if (this.hasAttribute(attributeKabob)) {
                                    return typeof attributes[attributeName] === 'number'
                                        ? parseFloat(this.getAttribute(attributeKabob))
                                        : this.getAttribute(attributeKabob);
                                    // @ts-expect-error
                                }
                                else if (attributeValues[attributeName] !== undefined) {
                                    // @ts-expect-error
                                    return attributeValues[attributeName];
                                }
                                else {
                                    return attributes[attributeName];
                                }
                            }
                        },
                        set(value) {
                            if (typeof attributes[attributeName] === 'boolean') {
                                if (value !== this[attributeName]) {
                                    // eslint-disable-next-line
                                    if (value) {
                                        this.setAttribute(attributeKabob, '');
                                    }
                                    else {
                                        this.removeAttribute(attributeKabob);
                                    }
                                }
                            }
                            else if (typeof attributes[attributeName] === 'number') {
                                if (value !== parseFloat(this[attributeName])) {
                                    this.setAttribute(attributeKabob, value);
                                }
                            }
                            else {
                                if (typeof value === 'object' || `${value}` !== `${this[attributeName]}`) {
                                    if (value === null || value === undefined || typeof value === 'object') {
                                        this.removeAttribute(attributeKabob);
                                    }
                                    else {
                                        this.setAttribute(attributeKabob, value);
                                    }
                                    // @ts-expect-error
                                    attributeValues[attributeName] = value;
                                }
                            }
                        }
                    });
                });
            }
        }
        initValue() {
            if (value !== undefined) {
                this._value = deepClone(value);
            }
            if (bindValue !== undefined) {
                this.bindValue = (path) => {
                    bind(this, path, bindings.value);
                    bindValue.call(this, path);
                };
            }
        }
        get value() {
            return this._value;
        }
        set value(newValue) {
            if (newValue !== undefined && (typeof newValue === 'object' || newValue !== this._value)) {
                this._value = newValue;
                this.queueRender(true);
            }
        }
        hydrate() {
            if (!this._hydrated) {
                if (styleNode !== undefined) {
                    const shadow = this.attachShadow({ mode: 'open' });
                    shadow.appendChild(styleNode.cloneNode(true));
                    appendContentToElement(shadow, content);
                }
                else {
                    appendContentToElement(this, content);
                }
                this._hydrated = true;
            }
        }
        queueRender(change = false) {
            if (this.render === undefined) {
                return;
            }
            if (!this._changeQueued)
                this._changeQueued = change;
            if (!this._renderQueued) {
                this._renderQueued = true;
                requestAnimationFrame(() => {
                    // TODO add mechanism to allow component developer to have more control over
                    // whether input vs. change events are emitted
                    if (this._changeQueued)
                        dispatch(this, 'change');
                    this._changeQueued = false;
                    this._renderQueued = false;
                    this.render();
                });
            }
        }
        connectedCallback() {
            this.hydrate();
            // super annoyingly, chrome loses its shit if you set *any* attributes in the constructor
            if (role !== undefined && role !== '')
                this.setAttribute('role', role);
            if (eventHandlers.resize !== undefined) {
                resizeObserver.observe(this);
            }
            if (value != null && this.getAttribute('value') != null) {
                this._value = this.getAttribute('value');
            }
            if (spec.connectedCallback != null)
                spec.connectedCallback.call(this);
        }
        disconnectedCallback() {
            resizeObserver.unobserve(this);
            if (spec.disconnectedCallback != null)
                spec.disconnectedCallback.call(this);
        }
        render() {
            this.hydrate();
            if (spec.render != null)
                spec.render.call(this);
        }
        static defaultAttributes() {
            return { ...attributes };
        }
    };
    Object.keys(methods).forEach(methodName => {
        // @ts-expect-error
        componentClass.prototype[methodName] = methods[methodName];
    });
    // if-statement is to prevent some node-based "browser" tests from breaking
    if (window.customElements !== undefined)
        window.customElements.define(tagName, componentClass);
    return elements[tagName];
};

export { bind, bindings, elements, filter, hotReload, makeWebComponent, matchType, observe, observerShouldBeRemoved, settings, touch, typeSafe, unobserve, useXin, xin };
