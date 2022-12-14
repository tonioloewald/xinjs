import { makeError } from './make-error';
const asyncFunc = async () => { };
export const isAsync = (func) => func.constructor === (asyncFunc).constructor;
export const describe = (x) => {
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
export const isInstanceOf = (obj, constructor) => {
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
export const specificTypeMatch = (type, subject) => {
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
const functionDeclaration = /^((async\s+)?function)?\s*\((.*?)\)\s*(=>)?\s*\{/;
const arrowDeclaration = /^((\.\.\.\w+)|(\w+)|\((.*?)\))\s*=>\s*[^\s{]/;
const returnsValue = /\w+\s*=>\s*[^\s{]|\breturn\b/;
export const describeType = (x) => {
    const scalarType = describe(x);
    switch (scalarType) {
        case 'array':
            return x.map(describeType);
        case 'object':
            if (x.constructor === Object) {
                const _type = {};
                Object.keys(x).forEach((key) => { _type[key] = describeType(x[key]); });
                return _type;
            }
            else {
                return '#instance x.constructor.name';
            }
        case 'function':
        case 'async':
            {
                if (x.protoype !== undefined) {
                    return '#class x.name';
                }
                const source = x.toString();
                if (source.endsWith('() { [native code] }')) {
                    return `#native ${scalarType}`;
                }
                const functionSource = source.match(functionDeclaration);
                const arrowSource = source.match(arrowDeclaration);
                const hasReturnValue = (source.match(returnsValue) != null) || source.match(arrowDeclaration);
                // eslint-disable-next-line
                const paramText = ((functionSource && functionSource[3]) ||
                    // eslint-disable-next-line
                    (arrowSource && (arrowSource[2] || arrowSource[3] || arrowSource[4])) || '').trim();
                const params = paramText.split(',').map((param) => {
                    const [key] = param.split('=');
                    return `${key} #any`;
                });
                return `${scalarType} ( ${params.join(', ')} ) => ${(hasReturnValue != null) ? '#any' : '#nothing'}`;
            }
        default:
            return `#${scalarType}`;
    }
};
export const typeJSON = (x) => JSON.stringify(describeType(x));
export const typeJS = (x) => typeJSON(x).replace(/"(\w+)":/g, '$1:');
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
export const matchType = (example, subject, errors = [], path = '') => {
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
export const exampleAtPath = (example, path) => {
    const parts = Array.isArray(path)
        ? [...path]
        : path.replace(/\[[^\]]*\]/g, '.*').split('.');
    if (example === null || example === undefined || parts.length === 0) {
        return example;
    }
    else {
        const part = parts.shift();
        if (part === '*') {
            if (Array.isArray(example)) {
                return example.length === 1
                    ? exampleAtPath(example[0], parts)
                    : exampleAtPath(Object.assign({}, ...example), parts);
            }
            else {
                return undefined;
            }
        }
        else {
            // @ts-expect-error
            return exampleAtPath(example[part], parts);
        }
    }
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
export class TypeError {
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
export const assignReadOnly = (obj, propMap) => {
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
export const matchParamTypes = (types, params) => {
    for (let i = 0; i < params.length; i++) {
        if (params[i] instanceof TypeError) {
            return params[i];
        }
    }
    const [paramErrors, returnErrors] = types.map((type, i) => matchType(type, params[i]));
    return [...paramErrors, ...returnErrors];
};
export const typeSafe = (func, paramTypes = [], resultType = undefined, functionName = 'anonymous') => {
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
