import { useState, useEffect } from 'react';

const xinPath = Symbol('xin-path');
const xinValue = Symbol('xin-value');

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
    return typeof what === 'object' ? what[xinPath] : what;
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
                console.error(`Listener ${listener.description} threw "${e}" handling "${path}"`);
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
                // @ts-expect-error-error
                found = found[part.slice(1)];
                if (part[0] !== '=') {
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
        if (_prop === xinPath) {
            return path;
        }
        else if (_prop === xinValue) {
            return target;
        }
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
        if (prop.startsWith('[') && prop.endsWith(']')) {
            prop = prop.substring(1, prop.length - 1);
        }
        if ((!Array.isArray(target) && target[prop] !== undefined) ||
            (Array.isArray(target) && prop.includes('='))) {
            let value;
            if (prop.includes('=')) {
                const [idPath, needle] = prop.split('=');
                value = target.find((candidate) => `${getByPath(candidate, idPath)}` === needle);
            }
            else {
                value = target[prop];
            }
            if (value !== null && typeof value === 'object') {
                const currentPath = extendPath(path, prop);
                return new Proxy(value, regHandler(currentPath));
            }
            else if (typeof value === 'function') {
                return value.bind(target);
            }
            else {
                return value;
            }
        }
        else if (Array.isArray(target)) {
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
    set(_, prop, value) {
        // eslint-disable-next-line
        if (value != null && value[xinPath]) {
            value = value[xinValue];
        }
        const fullPath = extendPath(path, prop);
        if (!isValidPath(fullPath)) {
            throw new Error(`setting invalid path ${fullPath}`);
        }
        let existing = xin[fullPath];
        // eslint-disable-next-line
        if (existing != null && existing[xinValue] != null) {
            existing = existing[xinValue];
        }
        if (existing !== value && setByPath(registry, fullPath, value)) {
            touch(fullPath);
        }
        return true;
    }
});
const observe = (test, callback) => {
    const func = typeof callback === 'function' ? callback : (xin)[callback];
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
// should be able to replace \u221E with ???
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
let TypeError$1 = class TypeError {
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
};
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
        if (params[i] instanceof TypeError$1) {
            return params[i];
        }
    }
    const [paramErrors, returnErrors] = types.map((type, i) => matchType(type, params[i]));
    return [...paramErrors, ...returnErrors];
};
const typeSafe = (func, paramTypes = [], resultType = undefined, functionName = 'anonymous') => {
    const paramErrors = matchParamTypes(['#function', '#?array', '#?any', '#?string'], [func, paramTypes, resultType, functionName]);
    if (paramErrors instanceof TypeError$1) {
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
        if (paramErrors instanceof TypeError$1)
            return paramErrors;
        if (paramErrors.length === 0) {
            const result = func(...params);
            const resultErrors = matchType(resultType, result);
            if (resultErrors.length === 0) {
                return result;
            }
            else {
                return new TypeError$1({
                    functionName,
                    isParamFailure: false,
                    expected: resultType,
                    found: result,
                    errors: resultErrors
                });
            }
        }
        return new TypeError$1({
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
        const state = xin[xinValue];
        for (const key of Object.keys(state).filter(test)) {
            obj[key] = state[key];
        }
        localStorage.setItem('xin-state', JSON.stringify(obj));
        console.log('xin state saved to localStorage');
    }, 500);
    observe(test, saveState);
};

/*
# more-math

Some simple functions egregiously missing from `Math`
*/
const RADIANS_TO_DEGREES = 180 / Math.PI;
const DEGREES_TO_RADIANS = Math.PI / 180;
function clamp(min, v, max) {
    return v < min ? min : (v > max ? max : v);
}
function lerp(a, b, t) {
    t = clamp(0, t, 1);
    return t * (b - a) + a;
}

var moreMath = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DEGREES_TO_RADIANS: DEGREES_TO_RADIANS,
    RADIANS_TO_DEGREES: RADIANS_TO_DEGREES,
    clamp: clamp,
    lerp: lerp
});

const hex2 = (n) => ('00' + Math.round(Number(n)).toString(16)).slice(-2);
const span = globalThis.document != null ? globalThis.document.createElement('span') : { style: { color: '' } };
class HslColor {
    constructor(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const l = Math.max(r, g, b);
        const s = l - Math.min(r, g, b);
        const h = s !== 0
            ? l === r
                ? (g - b) / s
                : l === g
                    ? 2 + (b - r) / s
                    : 4 + (r - g) / s
            : 0;
        this.h = 60 * h < 0 ? 60 * h + 360 : 60 * h;
        this.s = s !== 0 ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0;
        this.l = (2 * l - s) / 2;
    }
}
class Color {
    static fromCss(spec) {
        span.style.color = spec;
        const converted = span.style.color;
        const [r, g, b, a] = converted.match(/[\d.]+/g);
        return new Color(Number(r), Number(g), Number(b), a == null ? 1 : Number(a));
    }
    static fromHsl(h, s, l, a = 1) {
        return Color.fromCss(`hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${a.toFixed(2)})`);
    }
    constructor(r, g, b, a = 1) {
        this.r = clamp(0, r, 255);
        this.g = clamp(0, g, 255);
        this.b = clamp(0, b, 255);
        this.a = a !== undefined ? clamp(0, a, 1) : a = 1;
    }
    get inverse() {
        return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a);
    }
    get inverseLuminance() {
        const { h, s, l } = this._hsl;
        return Color.fromHsl(h, s, 1 - l, this.a);
    }
    get rgb() {
        const { r, g, b } = this;
        return `rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)})`;
    }
    get rgba() {
        const { r, g, b, a } = this;
        return `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${a.toFixed(2)})`;
    }
    get RGBA() {
        return [this.r / 255, this.g / 255, this.b / 255, this.a];
    }
    get ARGB() {
        return [this.a, this.r / 255, this.g / 255, this.b / 255];
    }
    get _hsl() {
        if (this._hslCached == null) {
            this._hslCached = new HslColor(this.r, this.g, this.b);
        }
        return this._hslCached;
    }
    get hsl() {
        const { h, s, l } = this._hsl;
        return `hsl(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`;
    }
    get hsla() {
        const { h, s, l } = this._hsl;
        return `hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${this.a.toFixed(2)})`;
    }
    get mono() {
        const v = this.brightness * 255;
        return new Color(v, v, v);
    }
    get brightness() {
        // http://www.itu.int/rec/R-REC-BT.601
        return (0.299 * this.r + 0.587 * this.g + 0.114 * this.b) / 255;
    }
    get html() {
        return this.a === 1 ? '#' + hex2(this.r) + hex2(this.g) + hex2(this.b) : '#' + hex2(this.r) + hex2(this.g) + hex2(this.b) + hex2(Math.floor(255 * this.a));
    }
    brighten(amount) {
        let { h, s, l } = this._hsl;
        l = clamp(0, l + amount * (1 - l), 1);
        return Color.fromHsl(h, s, l, this.a);
    }
    darken(amount) {
        let { h, s, l } = this._hsl;
        l = clamp(0, l * (1 - amount), 1);
        return Color.fromHsl(h, s, l, this.a);
    }
    saturate(amount) {
        let { h, s, l } = this._hsl;
        s = clamp(0, s + amount * (1 - s), 1);
        return Color.fromHsl(h, s, l, this.a);
    }
    desaturate(amount) {
        let { h, s, l } = this._hsl;
        s = clamp(0, s * (1 - amount), 1);
        return Color.fromHsl(h, s, l, this.a);
    }
    rotate(amount) {
        let { h, s, l } = this._hsl;
        h = (h + 360 + amount) % 360;
        return Color.fromHsl(h, s, l, this.a);
    }
    opacity(alpha) {
        const { h, s, l } = this._hsl;
        return Color.fromHsl(h, s, l, alpha);
    }
    swatch() {
        const { r, g, b, a } = this;
        console.log(`%c   %c ${this.html}, rgba(${r}, ${g}, ${b}, ${a}), ${this.hsla}`, `background-color: rgba(${r}, ${g}, ${b}, ${a})`, 'background-color: #eee');
    }
    blend(otherColor, t) {
        return new Color(lerp(this.r, otherColor.r, t), lerp(this.g, otherColor.g, t), lerp(this.b, otherColor.b, t), lerp(this.a, otherColor.a, t));
    }
}

function deepClone(obj) {
    if (obj == null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        // @ts-expect-error-error
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

const BOUND_CLASS = '-xin-data';
const BOUND_SELECTOR = `.${BOUND_CLASS}`;
const EVENT_CLASS = '-xin-event';
const EVENT_SELECTOR = `.${EVENT_CLASS}`;
const elementToHandlers = new WeakMap();
const elementToBindings = new WeakMap();
const cloneWithBindings = (element) => {
    const cloned = element.cloneNode();
    if (cloned instanceof HTMLElement) {
        const dataBindings = elementToBindings.get(element);
        const eventHandlers = elementToHandlers.get(element);
        if (dataBindings != null) {
            // @ts-expect-error-error
            elementToBindings.set(cloned, deepClone(dataBindings));
        }
        if (eventHandlers != null) {
            // @ts-expect-error-error
            elementToHandlers.set(cloned, deepClone(eventHandlers));
        }
    }
    for (const node of element.childNodes) {
        if (node instanceof HTMLElement || node instanceof DocumentFragment) {
            cloned.appendChild(cloneWithBindings(node));
        }
        else {
            cloned.appendChild(node.cloneNode());
        }
    }
    return cloned;
};
const elementToItem = new WeakMap();
const getListItem = (element) => {
    const html = document.body.parentElement;
    while (element.parentElement != null && element.parentElement !== html) {
        const item = elementToItem.get(element);
        if (item != null) {
            return item;
        }
        element = element.parentElement;
    }
    return false;
};

observe(() => true, (changedPath) => {
    const boundElements = globalThis.document.body.querySelectorAll(BOUND_SELECTOR);
    for (const element of boundElements) {
        const dataBindings = elementToBindings.get(element);
        for (const dataBinding of dataBindings) {
            let { path, binding, options } = dataBinding;
            const { toDOM } = binding;
            if (toDOM != null) {
                if (path.startsWith('^')) {
                    const dataSource = getListItem(element);
                    if (dataSource != null && dataSource[xinPath] != null) {
                        path = dataBinding.path = `${dataSource[xinPath]}${path.substring(1)}`;
                    }
                    else {
                        console.error(`Cannot resolve relative binding ${path}`, element, 'is not part of a list');
                        throw new Error(`Cannot resolve relative binding ${path}`);
                    }
                }
                if (path.startsWith(changedPath)) {
                    toDOM(element, xin[path], options);
                }
            }
        }
    }
});
const handleChange = (event) => {
    // @ts-expect-error-error
    let target = event.target.closest(BOUND_SELECTOR);
    while (target != null) {
        const dataBindings = elementToBindings.get(target);
        for (const dataBinding of dataBindings) {
            const { binding, path } = dataBinding;
            const { fromDOM } = binding;
            if (fromDOM != null) {
                let value;
                try {
                    value = fromDOM(target, dataBinding.options);
                }
                catch (e) {
                    console.error('Cannot get value from', target, 'via', dataBinding);
                    throw new Error('Cannot obtain value fromDOM');
                }
                if (value != null) {
                    const existing = xin[path];
                    // eslint-disable-next-line
                    if (existing == null) {
                        xin[path] = value;
                    }
                    else {
                        // @ts-expect-error-error
                        const existingActual = existing[xinPath] != null ? existing[xinValue] : existing;
                        const valueActual = value[xinPath] != null ? value[xinValue] : value;
                        if (existingActual !== valueActual) {
                            xin[path] = valueActual;
                        }
                    }
                }
            }
        }
        target = target.parentElement.closest(BOUND_SELECTOR);
    }
};
if (globalThis.document != null) {
    globalThis.document.body.addEventListener('change', handleChange, true);
    globalThis.document.body.addEventListener('input', handleChange, true);
}
const bind = (element, what, binding, options) => {
    if (element instanceof DocumentFragment) {
        throw new Error('bind cannot bind to a DocumentFragment');
    }
    let path;
    if (typeof what === 'object' && what[xinPath] === undefined && options === undefined) {
        const { value } = what;
        path = typeof value === 'string' ? value : value[xinPath];
        options = what;
        delete options.value;
    }
    else {
        path = typeof what === 'string' ? what : what[xinPath];
    }
    if (path == null) {
        throw new Error('bind requires a path or object with xin Proxy');
    }
    const { toDOM } = binding;
    element.classList.add(BOUND_CLASS);
    let dataBindings = elementToBindings.get(element);
    if (dataBindings == null) {
        dataBindings = [];
        elementToBindings.set(element, dataBindings);
    }
    dataBindings.push({ path, binding, options });
    if (toDOM != null && !path.startsWith('^')) {
        touch(path);
    }
    return element;
};
const handledEventTypes = new Set();
const handleBoundEvent = (event) => {
    // @ts-expect-error-error
    let target = event?.target.closest(EVENT_SELECTOR);
    let propagationStopped = false;
    const wrappedEvent = new Proxy(event, {
        get(target, prop) {
            if (prop === 'stopPropagation') {
                return () => {
                    event.stopPropagation();
                    propagationStopped = true;
                };
            }
            else {
                // @ts-expect-error-error
                const value = target[prop];
                return typeof value === 'function' ? value.bind(target) : value;
            }
        }
    });
    // eslint-disable-next-line no-unmodified-loop-condition
    while (!propagationStopped && target != null) {
        const eventBindings = elementToHandlers.get(target);
        // eslint-disable-next-line
        const handlers = eventBindings[event.type] || [];
        for (const handler of handlers) {
            if (typeof handler === 'function') {
                handler(wrappedEvent);
            }
            else {
                const func = xin[handler];
                if (typeof func === 'function') {
                    func(wrappedEvent);
                }
                else {
                    throw new Error(`no event handler found at path ${handler}`);
                }
            }
            if (propagationStopped) {
                continue;
            }
        }
        target = target.parentElement.closest(EVENT_SELECTOR);
    }
};
const on = (element, eventType, eventHandler) => {
    let eventBindings = elementToHandlers.get(element);
    element.classList.add(EVENT_CLASS);
    if (eventBindings == null) {
        eventBindings = {};
        elementToHandlers.set(element, eventBindings);
    }
    // eslint-disable-next-line
    if (!eventBindings[eventType]) {
        eventBindings[eventType] = [];
    }
    if (!eventBindings[eventType].includes(eventHandler)) {
        eventBindings[eventType].push(eventHandler);
    }
    if (!handledEventTypes.has(eventType)) {
        handledEventTypes.add(eventType);
        document.body.addEventListener(eventType, handleBoundEvent, true);
    }
};

const dispatch = (target, type) => {
    const event = new Event(type);
    target.dispatchEvent(event);
};
/* global ResizeObserver */
const { ResizeObserver } = globalThis;
const resizeObserver = ResizeObserver != null
    ? new ResizeObserver(entries => {
        for (const entry of entries) {
            const element = entry.target;
            dispatch(element, 'resize');
        }
    })
    : {
        observe() { },
        unobserve() { }
    };
const appendContentToElement = (elt, content) => {
    if (elt != null && content != null) {
        if (typeof content === 'string') {
            elt.textContent = content;
        }
        else if (Array.isArray(content)) {
            content.forEach(node => {
                elt.append(node instanceof Node ? cloneWithBindings(node) : node);
            });
        }
        else if (content instanceof HTMLElement) {
            elt.append(cloneWithBindings(content));
        }
        else {
            throw new Error('expect text content or document node');
        }
    }
};

var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _ListBinding_instances, _ListBinding_array, _ListBinding_update, _ListBinding_previouseSlice, _ListBinding_visibleSlice;
const listBindingRef = Symbol('list-binding');
const SLICE_INTERVAL_MS = 16; // 60fps
function updateRelativeBindings(element, path) {
    const boundElements = [...element.querySelectorAll(BOUND_SELECTOR)];
    if (element.matches(BOUND_SELECTOR)) {
        boundElements.unshift(element);
    }
    for (const boundElement of boundElements) {
        const bindings = elementToBindings.get(boundElement);
        for (const binding of bindings) {
            if (binding.path.startsWith('^')) {
                binding.path = `${path}${binding.path.substring(1)}`;
            }
            if (binding.binding.toDOM != null) {
                binding.binding.toDOM(boundElement, xin[binding.path]);
            }
        }
    }
}
class ListBinding {
    constructor(boundElement, options = {}) {
        _ListBinding_instances.add(this);
        _ListBinding_array.set(this, []);
        _ListBinding_update.set(this, void 0);
        _ListBinding_previouseSlice.set(this, void 0);
        this.boundElement = boundElement;
        this.itemToElement = new WeakMap();
        if (boundElement.children.length !== 1) {
            throw new Error('ListBinding expects an element with exactly one child element');
        }
        if (boundElement.children[0] instanceof HTMLTemplateElement) {
            const template = boundElement.children[0];
            if (template.content.children.length !== 1) {
                throw new Error('ListBinding expects a template with exactly one child element');
            }
            this.template = cloneWithBindings(template.content.children[0]);
        }
        else {
            this.template = boundElement.children[0];
            this.template.remove();
        }
        this.listContainer = document.createElement('div');
        this.boundElement.append(this.listContainer);
        this.options = options;
        if (options.virtual != null) {
            resizeObserver.observe(this.boundElement);
            __classPrivateFieldSet(this, _ListBinding_update, throttle(() => {
                this.update(__classPrivateFieldGet(this, _ListBinding_array, "f"), true);
            }, SLICE_INTERVAL_MS), "f");
            this.boundElement.addEventListener('scroll', __classPrivateFieldGet(this, _ListBinding_update, "f"));
            this.boundElement.addEventListener('resize', __classPrivateFieldGet(this, _ListBinding_update, "f"));
        }
    }
    update(array, isSlice) {
        if (array == null) {
            array = [];
        }
        __classPrivateFieldSet(this, _ListBinding_array, array, "f");
        const { initInstance, updateInstance } = this.options;
        // @ts-expect-error
        const arrayPath = array[xinPath];
        const slice = __classPrivateFieldGet(this, _ListBinding_instances, "m", _ListBinding_visibleSlice).call(this);
        const previousSlice = __classPrivateFieldGet(this, _ListBinding_previouseSlice, "f");
        const { firstItem, lastItem, topBuffer, bottomBuffer } = slice;
        if (isSlice === true && previousSlice != null && firstItem === previousSlice.firstItem && lastItem === previousSlice.lastItem) {
            return;
        }
        __classPrivateFieldSet(this, _ListBinding_previouseSlice, slice, "f");
        let removed = 0;
        let moved = 0;
        let created = 0;
        for (const element of [...this.listContainer.children]) {
            const proxy = elementToItem.get(element);
            if (proxy == null) {
                element.remove();
            }
            else {
                const idx = array.indexOf(proxy);
                if (idx < firstItem || idx > lastItem) {
                    element.remove();
                    this.itemToElement.delete(proxy);
                    elementToItem.delete(element);
                    removed++;
                }
            }
        }
        this.listContainer.style.marginTop = String(topBuffer) + 'px';
        this.listContainer.style.marginBottom = String(bottomBuffer) + 'px';
        // build a complete new set of elements in the right order
        const elements = [];
        const { idPath } = this.options;
        for (let i = firstItem; i <= lastItem; i++) {
            const item = array[i];
            if (item === undefined) {
                continue;
            }
            let element = this.itemToElement.get(item[xinValue]);
            if (element == null) {
                created++;
                element = cloneWithBindings(this.template);
                if (typeof item === 'object') {
                    this.itemToElement.set(item[xinValue], element);
                    elementToItem.set(element, item[xinValue]);
                }
                this.listContainer.append(element);
                if (idPath != null) {
                    const idValue = item[idPath];
                    const itemPath = `${arrayPath}[${idPath}=${idValue}]`;
                    updateRelativeBindings(element, itemPath);
                }
                if (initInstance != null) {
                    // eslint-disable-next-line
                    initInstance(element, item);
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
                    this.listContainer.insertBefore(element, insertionPoint.nextElementSibling);
                }
                else {
                    this.listContainer.append(element);
                }
            }
            insertionPoint = element;
        }
        if (settings.perf) {
            console.log(arrayPath, 'updated', { removed, created, moved });
        }
    }
}
_ListBinding_array = new WeakMap(), _ListBinding_update = new WeakMap(), _ListBinding_previouseSlice = new WeakMap(), _ListBinding_instances = new WeakSet(), _ListBinding_visibleSlice = function _ListBinding_visibleSlice() {
    const { virtual } = this.options;
    let firstItem = 0;
    let lastItem = __classPrivateFieldGet(this, _ListBinding_array, "f").length - 1;
    let topBuffer = 0;
    let bottomBuffer = 0;
    if (virtual != null) {
        const width = this.boundElement.offsetWidth;
        const height = this.boundElement.offsetHeight;
        const visibleColumns = virtual.width != null ? Math.max(1, Math.floor(width / virtual.width)) : 1;
        const visibleRows = Math.ceil(height / virtual.height) + 1;
        const totalRows = Math.ceil(__classPrivateFieldGet(this, _ListBinding_array, "f").length / visibleColumns);
        const visibleItems = visibleColumns * visibleRows;
        let topRow = Math.floor(this.boundElement.scrollTop / virtual.height);
        if (topRow > totalRows - visibleRows + 1) {
            topRow = Math.max(0, totalRows - visibleRows + 1);
            this.boundElement.scrollTop = topRow * virtual.height;
        }
        firstItem = topRow * visibleColumns;
        lastItem = firstItem + visibleItems - 1;
        topBuffer = topRow * virtual.height;
        bottomBuffer = totalRows * virtual.height - height - topBuffer;
    }
    return {
        firstItem,
        lastItem,
        topBuffer,
        bottomBuffer
    };
};
const getListBinding = (boundElement, options) => {
    let listBinding = boundElement[listBindingRef];
    if (listBinding == null) {
        listBinding = new ListBinding(boundElement, options);
        boundElement[listBindingRef] = listBinding;
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
    enabled: {
        toDOM(element, value) {
            // eslint-disable-next-line
            element.disabled = !value;
        }
    },
    disabled: {
        toDOM(element, value) {
            element.disabled = Boolean(value);
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

const templates = {};
const makeComponent = (...componentParts) => {
    return (...args) => elements.div(...args, ...componentParts);
};
const create = (tagType, ...contents) => {
    if (templates[tagType] === undefined) {
        templates[tagType] = globalThis.document.createElement(tagType);
    }
    const elt = templates[tagType].cloneNode();
    for (const item of contents) {
        if (item instanceof Element || item instanceof DocumentFragment || typeof item === 'string' || typeof item === 'number') {
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
                    on(elt, eventType, value);
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
    const frag = globalThis.document.createDocumentFragment();
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

const dimensionalProps = ['left', 'right', 'top', 'bottom', 'gap'];
const isDimensional = (cssProp) => {
    return (cssProp.match(/(width|height|size|margin|padding|radius)/) != null) || dimensionalProps.includes(cssProp);
};
const renderStatement = (key, value, indentation = '') => {
    const cssProp = camelToKabob(key);
    if (typeof value === 'object') {
        const renderedRule = Object.keys(value).map(innerKey => renderStatement(innerKey, value[innerKey], `${indentation}  `)).join('\n');
        return `${indentation}  ${key} {\n${renderedRule}\n${indentation}  }`;
    }
    else if (typeof value === 'number' && isDimensional(cssProp)) {
        return `${indentation}  ${cssProp}: ${value}px;`;
    }
    return `${indentation}  ${cssProp}: ${value};`;
};
const css = (obj, indentation = '') => {
    const selectors = Object.keys(obj).map((selector) => {
        const body = obj[selector];
        const rule = Object.keys(body)
            .map(prop => renderStatement(prop, body[prop]))
            .join('\n');
        return `${indentation}${selector} {\n${rule}\n}`;
    });
    return selectors.join('\n\n');
};
const initVars = (obj) => {
    const rule = {};
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        rule[`--${camelToKabob(key)}`] = typeof value === 'number' ? String(value) + 'px' : value;
    }
    return rule;
};
const vars = new Proxy({}, {
    get(target, prop) {
        if (target[prop] == null) {
            prop = prop.replace(/[A-Z]/g, x => `-${x.toLocaleLowerCase()}`);
            let [, varName, , isNegative, scaleText, method] = prop.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/);
            varName = `--${varName}`;
            if (scaleText != null) {
                const scale = isNegative == null ? Number(scaleText) / 100 : -Number(scaleText) / 100;
                switch (method) {
                    case 'b': // brighten
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = scale > 0 ? Color.fromCss(baseColor).brighten(scale).rgba : Color.fromCss(baseColor).darken(-scale).rgba;
                        }
                        break;
                    case 's': // saturate
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = scale > 0 ? Color.fromCss(baseColor).saturate(scale).rgba : Color.fromCss(baseColor).desaturate(-scale).rgba;
                        }
                        break;
                    case 'h': // hue
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = Color.fromCss(baseColor).rotate(scale).rgba;
                        }
                        break;
                    case 'o': // alpha
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = Color.fromCss(baseColor).opacity(scale).rgba;
                        }
                        break;
                    case '':
                        target[prop] = `calc(var(${varName}) * ${scale})`;
                        break;
                    default:
                        console.error(method);
                        throw new Error(`Unrecognized method ${method} for css variable ${varName}`);
                }
            }
            else {
                target[prop] = `var(${varName})`;
            }
        }
        return target[prop];
    }
});

class Component extends HTMLElement {
    static StyleNode(styleSpec) {
        return elements.style(css(styleSpec));
    }
    static elementCreator(options) {
        if (this._elementCreator == null) {
            let desiredTag = options != null ? options.tag : null;
            if (desiredTag == null) {
                desiredTag = camelToKabob(this.name);
                if (desiredTag.startsWith('-')) {
                    desiredTag = desiredTag.substring(1);
                }
                if (!desiredTag.includes('-')) {
                    desiredTag += '-elt';
                }
            }
            let attempts = 0;
            while (this._elementCreator == null) {
                attempts += 1;
                const tag = attempts === 1 ? desiredTag : `${desiredTag}-${attempts}`;
                try {
                    window.customElements.define(tag, this, options);
                    this._elementCreator = elements[tag];
                }
                catch (e) {
                    throw new Error(`could not define ${this.name} as <${tag}>: ${String(e)}`);
                }
            }
        }
        return this._elementCreator;
    }
    initAttributes(...attributeNames) {
        const attributes = {};
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
            attributes[attributeName] = deepClone(this[attributeName]);
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
                            this.queueRender();
                        }
                    }
                    else if (typeof attributes[attributeName] === 'number') {
                        if (value !== parseFloat(this[attributeName])) {
                            this.setAttribute(attributeKabob, value);
                            this.queueRender();
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
                            this.queueRender();
                            // @ts-expect-error
                            attributeValues[attributeName] = value;
                        }
                    }
                }
            });
        });
    }
    initValue() {
        const valueDescriptor = Object.getOwnPropertyDescriptor(this, 'value');
        if (valueDescriptor === undefined || valueDescriptor.get !== undefined || valueDescriptor.set !== undefined) {
            return;
        }
        let value = this.hasAttribute('value') ? this.getAttribute('value') : deepClone(this.value);
        delete this.value;
        Object.defineProperty(this, 'value', {
            enumerable: false,
            get() {
                return value;
            },
            set(newValue) {
                if (value !== newValue) {
                    value = newValue;
                    this.queueRender(true);
                }
            }
        });
    }
    get refs() {
        const root = this.shadowRoot != null ? this.shadowRoot : this;
        if (this._refs == null) {
            this._refs = new Proxy({}, {
                get(target, ref) {
                    if (target[ref] === undefined) {
                        let element = root.querySelector(`[data-ref="${ref}"]`);
                        if (element == null) {
                            element = root.querySelector(ref);
                        }
                        if (element == null)
                            throw new Error(`elementRef "${ref}" does not exist!`);
                        element.removeAttribute('data-ref');
                        target[ref] = element;
                    }
                    return target[ref];
                }
            });
        }
        return this._refs;
    }
    constructor() {
        super();
        this.content = elements.slot();
        this._changeQueued = false;
        this._renderQueued = false;
        this._hydrated = false;
        this.initAttributes('hidden');
        this._value = deepClone(this.defaultValue);
    }
    connectedCallback() {
        this.hydrate();
        // super annoyingly, chrome loses its shit if you set *any* attributes in the constructor
        if (this.role != null)
            this.setAttribute('role', this.role);
        if (this.onResize !== undefined) {
            resizeObserver.observe(this);
            if (this._onResize == null) {
                this._onResize = this.onResize.bind(this);
            }
            this.addEventListener('resize', this._onResize);
        }
        if (this.value != null && this.getAttribute('value') != null) {
            this._value = this.getAttribute('value');
        }
    }
    disconnectedCallback() {
        resizeObserver.unobserve(this);
    }
    queueRender(triggerChangeEvent = false) {
        if (!this._changeQueued)
            this._changeQueued = triggerChangeEvent;
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
    hydrate() {
        if (!this._hydrated) {
            this.initValue();
            if (this.styleNode !== undefined) {
                const shadow = this.attachShadow({ mode: 'open' });
                shadow.appendChild(this.styleNode);
                appendContentToElement(shadow, this.content);
            }
            else {
                appendContentToElement(this, this.content);
            }
            this._hydrated = true;
        }
    }
    render() {
        this.hydrate();
    }
}
Component.elements = elements;

export { Color, Component, moreMath as MoreMath, bind, bindings, css, elements, filter, getListItem, hotReload, initVars, makeComponent, matchType, observe, observerShouldBeRemoved, on, settings, touch, typeSafe, unobserve, useXin, vars, xin, xinPath, xinValue };
