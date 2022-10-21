'use strict';

const stringify = (x) => {
    try {
        return JSON.stringify(x);
    }
    catch (_) {
        return '{has circular references}';
    }
};
const makeError = (...messages) => new Error(messages.map(stringify).join(' '));

/**

~~~~
// title: getByPath, setByPath, and pathParts tests

const {getByPath, setByPath, pathParts} = await import('../source/b8r.byPath.js');
const obj = {
  foo: 17,
  bar: {baz: 'hello'},
  list: [
    {id: 17, name: 'fred'},
    {id: 100, name: 'boris'}
  ],
  bool: false,
  obj: null,
};

const list = [
  {id: 17, name: 'fred'},
  {id: 100, name: 'boris'},
  obj
]

const debug = console.debug; // prevent errors from leaking to console
errors = []
console.debug = (...args) => errors.push(args[1])

Test(() => getByPath(obj, '')).shouldBe(obj);
Test(() => getByPath(obj, '/')).shouldBe(obj);
Test(() => getByPath(obj, 'foo')).shouldBe(17);
Test(() => getByPath(obj, '[=foo]')).shouldBe(17);
Test(() => getByPath(obj, 'bar.baz')).shouldBe('hello');
Test(() => getByPath(obj, '[=bar][=baz]')).shouldBe('hello');
Test(() => getByPath(list, '[0].id')).shouldBe(17);
Test(() => getByPath(list, '[id=100].name')).shouldBe('boris');
Test(() => getByPath(list, '[bar.baz=hello].foo')).shouldBe(17);
Test(() => getByPath(list, '[bar.baz=hello].list[id=17].name')).shouldBe('fred');
Test(() => {
  setByPath(obj, 'obj', {bar: 17});
  return obj.obj.bar;
}).shouldBe(17);
Test(() => {
  setByPath(obj, 'obj', null);
  return obj.obj;
}).shouldBe(null);
Test(() => {
  setByPath(obj, '[=obj]', {hello: 'world'});
  return obj.obj.hello;
}).shouldBe('world');
Test(() => {
  setByPath(obj, '[=obj][=hello]', 'mars');
  return obj.obj.hello;
}).shouldBe('mars');
Test(() => {
  setByPath(obj, 'list[id=17]', {id: 17, name: 'vlad'});
  return getByPath(obj, 'list[id=17].name');
}).shouldBe('vlad');
Test(() => {
  setByPath(obj, 'list[id=17]', {id: 17, name: 'vlad'});
  return getByPath(obj, 'list[id=17].name');
}).shouldBe('vlad');
Test(() => {
  setByPath(obj, 'list[id=13]', {id:13, name:'success'});
  return getByPath(obj, 'list[id=13].name');
}, 'insert-by-id works for new elements').shouldBe('success');
Test(() => {
  setByPath(obj, 'list[id=13].name', 'replaced');
  return getByPath(obj, 'list[id=13].name');
}, 'id-path in middle of path works').shouldBe('replaced');
Test(() => {
  setByPath(obj, 'list[id=13]', {id:13, name:'overwrite'});
  return getByPath(obj, 'list').length;
}, 'insert-by-id works does not create duplicates').shouldBe(3);
Test(() => {
  let caught = 0;
  try {
    setByPath(obj, 'list[id=20]', {name: 'failure'});
  } catch(e) {
    caught++;
  }
  return caught;
}, 'item inserted at idPath must satisfy it').shouldBe(1);
Test(() => errors, 'bad list bindings reported').shouldBeJSON(["inconsistent id-path 'bar.baz' used for array, expected 'id'"]);

console.debug = debug
~~~~
*/
const now36 = () => new Date(parseInt('1000000000', 36) + Date.now()).valueOf().toString(36).slice(1);
let _seq = 0;
const seq = () => (parseInt('10000', 36) + (++_seq)).toString(36).substr(-5);
const id = () => now36() + seq();
const _delete_ = {};
const _newObject_ = {};
function pathParts(path) {
    if (!path || path === '/') {
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
        if (!idPath) {
            delete array[idx];
        }
        else {
            array.splice(idx, 1);
        }
        return null;
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
                    return null;
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
    return found === undefined ? null : found;
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
                        obj[key] = val;
                    }
                    else {
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
const registry = {};
const listeners = []; // { path_string_or_test, callback }
const validPath = /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/;
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
                    touch(path);
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
        if (!isValidPath(fullPath)) {
            throw new Error(`setting invalid path ${fullPath}`);
        }
        setByPath(registry, fullPath, value);
        touch(fullPath);
        return true; // success (throws error in strict mode otherwise)
    }
});
const xin = new Proxy(registry, regHandler());

exports.observe = observe;
exports.observerShouldBeRemoved = observerShouldBeRemoved;
exports.unobserve = unobserve;
exports.xin = xin;
