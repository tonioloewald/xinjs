function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
/*
  Note that re-exported types should be explicitly and separately exported
  as types because of issues with parceljs

  The error messages will be very perplexing

  https://github.com/parcel-bundler/parcel/issues/4796
  https://github.com/parcel-bundler/parcel/issues/4240
  https://devblogs.microsoft.com/typescript/announcing-typescript-3-8/#type-only-imports-exports
*/ const $34b63e9d5b96494c$export$a5a6e0b888b2c992 = {
    debug: false,
    perf: false
};


function $5165f04a46b33615$export$b7d58db314e0ac27(obj) {
    if (obj == null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map($5165f04a46b33615$export$b7d58db314e0ac27);
    const clone = {};
    for(const key in obj){
        const val = obj[key];
        if (obj != null && typeof obj === "object") clone[key] = $5165f04a46b33615$export$b7d58db314e0ac27(val);
        else clone[key] = val;
    }
    return clone;
}


const $e921b0bd4f6415ab$export$c6592bbc1eebb717 = "-xin-data";
const $e921b0bd4f6415ab$export$4c0223f67078aeac = `.${$e921b0bd4f6415ab$export$c6592bbc1eebb717}`;
const $e921b0bd4f6415ab$export$6a7099543a9795c7 = "-xin-event";
const $e921b0bd4f6415ab$export$21d9322c3477441b = `.${$e921b0bd4f6415ab$export$6a7099543a9795c7}`;
const $e921b0bd4f6415ab$export$a3622eb3b5dd592a = Symbol("xin-path");
const $e921b0bd4f6415ab$export$bdd0d039ad781534 = Symbol("xin-value");
const $e921b0bd4f6415ab$export$40700dafb97c3799 = (x)=>{
    return x[$e921b0bd4f6415ab$export$a3622eb3b5dd592a];
};
function $e921b0bd4f6415ab$export$5dcba2d45033d435(x) {
    // eslint-disable-next-line
    return typeof x === "object" && x !== null ? x[$e921b0bd4f6415ab$export$bdd0d039ad781534] || x : x;
}
const $e921b0bd4f6415ab$export$fe712848e6e66613 = new WeakMap();
const $e921b0bd4f6415ab$export$1f922de8d0ecbb7e = new WeakMap();
const $e921b0bd4f6415ab$export$4cac8128ba61a55f = (element)=>{
    return {
        eventBindings: $e921b0bd4f6415ab$export$fe712848e6e66613.get(element),
        dataBindings: $e921b0bd4f6415ab$export$1f922de8d0ecbb7e.get(element)
    };
};
const $e921b0bd4f6415ab$export$fa8cc6a36b1ccd7f = (element)=>{
    const cloned = element.cloneNode();
    if (cloned instanceof HTMLElement) {
        const dataBindings = $e921b0bd4f6415ab$export$1f922de8d0ecbb7e.get(element);
        const eventHandlers = $e921b0bd4f6415ab$export$fe712848e6e66613.get(element);
        if (dataBindings != null) // @ts-expect-error-error
        $e921b0bd4f6415ab$export$1f922de8d0ecbb7e.set(cloned, (0, $5165f04a46b33615$export$b7d58db314e0ac27)(dataBindings));
        if (eventHandlers != null) // @ts-expect-error-error
        $e921b0bd4f6415ab$export$fe712848e6e66613.set(cloned, (0, $5165f04a46b33615$export$b7d58db314e0ac27)(eventHandlers));
    }
    for (const node of element instanceof HTMLTemplateElement ? element.content.childNodes : element.childNodes)if (node instanceof HTMLElement || node instanceof DocumentFragment) cloned.appendChild($e921b0bd4f6415ab$export$fa8cc6a36b1ccd7f(node));
    else cloned.appendChild(node.cloneNode());
    return cloned;
};
const $e921b0bd4f6415ab$export$86caed35dd837d06 = new WeakMap();
const $e921b0bd4f6415ab$export$4c309843c07ce679 = (element)=>{
    const html = document.body.parentElement;
    while(element.parentElement != null && element.parentElement !== html){
        const item = $e921b0bd4f6415ab$export$86caed35dd837d06.get(element);
        if (item != null) return item;
        element = element.parentElement;
    }
    return false;
};



const $f0b099915f91bd21$export$253d09664e30b967 = Symbol("observer should be removed");
const $f0b099915f91bd21$export$58bed631278dbc67 = [] // { path_string_or_test, callback }
;
const $f0b099915f91bd21$var$touchedPaths = [];
let $f0b099915f91bd21$var$updateTriggered = false;
let $f0b099915f91bd21$var$updatePromise;
let $f0b099915f91bd21$var$resolveUpdate;
class $f0b099915f91bd21$export$c92b1d5f43586026 {
    constructor(test, callback){
        const callbackDescription = typeof callback === "string" ? `"${callback}"` : `function ${callback.name}`;
        let testDescription;
        if (typeof test === "string") {
            this.test = (t)=>typeof t === "string" && t !== "" && (test.startsWith(t) || t.startsWith(test));
            testDescription = `test = "${test}"`;
        } else if (test instanceof RegExp) {
            this.test = test.test.bind(test);
            testDescription = `test = "${test.toString()}"`;
        } else if (test instanceof Function) {
            this.test = test;
            testDescription = `test = function ${test.name}`;
        } else throw new Error("expect listener test to be a string, RegExp, or test function");
        this.description = `${testDescription}, ${callbackDescription}`;
        if (typeof callback === "function") this.callback = callback;
        else throw new Error("expect callback to be a path or function");
        $f0b099915f91bd21$export$58bed631278dbc67.push(this);
    }
}
const $f0b099915f91bd21$export$1c2919332513559b = async ()=>{
    if ($f0b099915f91bd21$var$updatePromise === undefined) return;
    await $f0b099915f91bd21$var$updatePromise;
};
const $f0b099915f91bd21$var$update = ()=>{
    if ((0, $34b63e9d5b96494c$export$a5a6e0b888b2c992).perf) console.time("xin async update");
    const paths = [
        ...$f0b099915f91bd21$var$touchedPaths
    ];
    for (const path of paths)$f0b099915f91bd21$export$58bed631278dbc67.filter((listener)=>{
        let heard;
        try {
            heard = listener.test(path);
        } catch (e) {
            throw new Error(`Listener ${listener.description} threw "${e}" at "${path}"`);
        }
        if (heard === $f0b099915f91bd21$export$253d09664e30b967) {
            $f0b099915f91bd21$export$23a2283368c55ea2(listener);
            return false;
        }
        return heard;
    }).forEach((listener)=>{
        let outcome;
        try {
            outcome = listener.callback(path);
        } catch (e) {
            console.error(`Listener ${listener.description} threw "${e}" handling "${path}"`);
        }
        if (outcome === $f0b099915f91bd21$export$253d09664e30b967) $f0b099915f91bd21$export$23a2283368c55ea2(listener);
    });
    $f0b099915f91bd21$var$touchedPaths.splice(0);
    $f0b099915f91bd21$var$updateTriggered = false;
    if (typeof $f0b099915f91bd21$var$resolveUpdate === "function") $f0b099915f91bd21$var$resolveUpdate();
    if ((0, $34b63e9d5b96494c$export$a5a6e0b888b2c992).perf) console.timeEnd("xin async update");
};
const $f0b099915f91bd21$export$d0b7ea69ab6056df = (touchable)=>{
    const path = typeof touchable === "string" ? touchable : (0, $e921b0bd4f6415ab$export$40700dafb97c3799)(touchable);
    if (path === undefined) {
        console.error("touch was called on an invalid target", touchable);
        throw new Error("touch was called on an invalid target");
    }
    if ($f0b099915f91bd21$var$updateTriggered === false) {
        $f0b099915f91bd21$var$updatePromise = new Promise((resolve)=>{
            $f0b099915f91bd21$var$resolveUpdate = resolve;
        });
        $f0b099915f91bd21$var$updateTriggered = setTimeout($f0b099915f91bd21$var$update);
    }
    if ($f0b099915f91bd21$var$touchedPaths.find((touchedPath)=>path.startsWith(touchedPath)) == null) $f0b099915f91bd21$var$touchedPaths.push(path);
};
const $f0b099915f91bd21$export$d1203567a167490e = (test, callback)=>{
    return new $f0b099915f91bd21$export$c92b1d5f43586026(test, callback);
};
const $f0b099915f91bd21$export$23a2283368c55ea2 = (listener)=>{
    const index = $f0b099915f91bd21$export$58bed631278dbc67.indexOf(listener);
    if (index > -1) $f0b099915f91bd21$export$58bed631278dbc67.splice(index, 1);
    else throw new Error("unobserve failed, listener not found");
};


// unique tokens passed to set by path to delete or create properties
const $31366a4b885eb48b$var$stringify = (x)=>{
    try {
        return JSON.stringify(x);
    } catch (_) {
        return "{has circular references}";
    }
};
const $31366a4b885eb48b$export$5a4bb2b1c89bdce7 = (...messages)=>new Error(messages.map($31366a4b885eb48b$var$stringify).join(" "));


const $c62be31ef05b0c90$var$now36 = ()=>new Date(parseInt("1000000000", 36) + Date.now()).valueOf().toString(36).slice(1);
let $c62be31ef05b0c90$var$_seq = 0;
const $c62be31ef05b0c90$var$seq = ()=>(parseInt("10000", 36) + ++$c62be31ef05b0c90$var$_seq).toString(36).slice(-5);
const $c62be31ef05b0c90$var$id = ()=>$c62be31ef05b0c90$var$now36() + $c62be31ef05b0c90$var$seq();
const $c62be31ef05b0c90$var$_delete_ = {};
const $c62be31ef05b0c90$var$_newObject_ = {};
function $c62be31ef05b0c90$export$f5d2dd4cfd729958(path) {
    if (path === "") return [];
    if (Array.isArray(path)) return path;
    else {
        const parts = [];
        while(path.length > 0){
            let index = path.search(/\[[^\]]+\]/);
            if (index === -1) {
                parts.push(path.split("."));
                break;
            } else {
                const part = path.slice(0, index);
                path = path.slice(index);
                if (part !== "") parts.push(part.split("."));
                index = path.indexOf("]") + 1;
                parts.push(path.slice(1, index - 1));
                // handle paths dereferencing array element like foo[0].id
                if (path.slice(index, index + 1) === ".") index += 1;
                path = path.slice(index);
            }
        }
        return parts;
    }
}
const $c62be31ef05b0c90$var$idPathMaps = new WeakMap();
function $c62be31ef05b0c90$var$buildIdPathValueMap(array, idPath) {
    if ($c62be31ef05b0c90$var$idPathMaps.get(array) === undefined) $c62be31ef05b0c90$var$idPathMaps.set(array, {});
    if ($c62be31ef05b0c90$var$idPathMaps.get(array)[idPath] === undefined) $c62be31ef05b0c90$var$idPathMaps.get(array)[idPath] = {};
    const map = $c62be31ef05b0c90$var$idPathMaps.get(array)[idPath];
    if (idPath === "_auto_") array.forEach((item, idx)=>{
        if (item._auto_ === undefined) item._auto_ = $c62be31ef05b0c90$var$id();
        map[item._auto_ + ""] = idx;
    });
    else array.forEach((item, idx)=>{
        map[$c62be31ef05b0c90$export$44b5bed83342a92f(item, idPath) + ""] = idx;
    });
    return map;
}
function $c62be31ef05b0c90$var$getIdPathMap(array, idPath) {
    if ($c62be31ef05b0c90$var$idPathMaps.get(array) === undefined || $c62be31ef05b0c90$var$idPathMaps.get(array)[idPath] === undefined) return $c62be31ef05b0c90$var$buildIdPathValueMap(array, idPath);
    else return $c62be31ef05b0c90$var$idPathMaps.get(array)[idPath];
}
function $c62be31ef05b0c90$var$keyToIndex(array, idPath, idValue) {
    idValue = idValue + "";
    let idx = $c62be31ef05b0c90$var$getIdPathMap(array, idPath)[idValue];
    if (idx === undefined || $c62be31ef05b0c90$export$44b5bed83342a92f(array[idx], idPath) + "" !== idValue) idx = $c62be31ef05b0c90$var$buildIdPathValueMap(array, idPath)[idValue];
    return idx;
}
function $c62be31ef05b0c90$var$byKey(obj, key, valueToInsert) {
    if (obj[key] === undefined && valueToInsert !== undefined) obj[key] = valueToInsert;
    return obj[key];
}
function $c62be31ef05b0c90$var$byIdPath(array, idPath, idValue, valueToInsert) {
    let idx = idPath !== "" ? $c62be31ef05b0c90$var$keyToIndex(array, idPath, idValue) : idValue;
    if (valueToInsert === $c62be31ef05b0c90$var$_delete_) {
        array.splice(idx, 1);
        $c62be31ef05b0c90$var$idPathMaps.delete(array);
        return Symbol("deleted");
    } else if (valueToInsert === $c62be31ef05b0c90$var$_newObject_) {
        if (idPath === "" && array[idx] === undefined) array[idx] = {};
    } else if (valueToInsert !== undefined) {
        if (idx !== undefined) array[idx] = valueToInsert;
        else if (idPath !== "" && $c62be31ef05b0c90$export$44b5bed83342a92f(valueToInsert, idPath) + "" === idValue + "") {
            array.push(valueToInsert);
            idx = array.length - 1;
        } else throw new Error(`byIdPath insert failed at [${idPath}=${idValue}]`);
    }
    return array[idx];
}
function $c62be31ef05b0c90$var$expectArray(obj) {
    if (!Array.isArray(obj)) throw (0, $31366a4b885eb48b$export$5a4bb2b1c89bdce7)("setByPath failed: expected array, found", obj);
}
function $c62be31ef05b0c90$var$expectObject(obj) {
    if (obj == null || !(obj instanceof Object)) throw (0, $31366a4b885eb48b$export$5a4bb2b1c89bdce7)("setByPath failed: expected Object, found", obj);
}
function $c62be31ef05b0c90$export$44b5bed83342a92f(obj, path) {
    const parts = $c62be31ef05b0c90$export$f5d2dd4cfd729958(path);
    let found = obj;
    let i, iMax, j, jMax;
    for(i = 0, iMax = parts.length; found !== undefined && i < iMax; i++){
        const part = parts[i];
        if (Array.isArray(part)) for(j = 0, jMax = part.length; found !== undefined && j < jMax; j++){
            const key = part[j];
            found = found[key];
        }
        else {
            if (found.length === 0) {
                // @ts-expect-error-error
                found = found[part.slice(1)];
                if (part[0] !== "=") return undefined;
            } else if (part.includes("=")) {
                const [idPath, ...tail] = part.split("=");
                found = $c62be31ef05b0c90$var$byIdPath(found, idPath, tail.join("="));
            } else {
                j = parseInt(part, 10);
                found = found[j];
            }
        }
    }
    return found;
}
function $c62be31ef05b0c90$export$f65a19d15516795e(orig, path, val) {
    let obj = orig;
    const parts = $c62be31ef05b0c90$export$f5d2dd4cfd729958(path);
    while(obj != null && parts.length > 0){
        const part = parts.shift();
        if (typeof part === "string") {
            const equalsOffset = part.indexOf("=");
            if (equalsOffset > -1) {
                if (equalsOffset === 0) $c62be31ef05b0c90$var$expectObject(obj);
                else $c62be31ef05b0c90$var$expectArray(obj);
                const idPath = part.slice(0, equalsOffset);
                const idValue = part.slice(equalsOffset + 1);
                obj = $c62be31ef05b0c90$var$byIdPath(obj, idPath, idValue, parts.length > 0 ? $c62be31ef05b0c90$var$_newObject_ : val);
                if (parts.length === 0) return true;
            } else {
                $c62be31ef05b0c90$var$expectArray(obj);
                const idx = parseInt(part, 10);
                if (parts.length > 0) obj = obj[idx];
                else {
                    if (val !== $c62be31ef05b0c90$var$_delete_) {
                        if (obj[idx] === val) return false;
                        obj[idx] = val;
                    } else obj.splice(idx, 1);
                    return true;
                }
            }
        } else if (Array.isArray(part) && part.length > 0) {
            $c62be31ef05b0c90$var$expectObject(obj);
            while(part.length > 0){
                const key = part.shift();
                if (part.length > 0 || parts.length > 0) // if we're at the end of part.length then we need to insert an array
                obj = $c62be31ef05b0c90$var$byKey(obj, key, part.length > 0 ? {} : []);
                else {
                    if (val !== $c62be31ef05b0c90$var$_delete_) {
                        if (obj[key] === val) return false;
                        obj[key] = val;
                    } else {
                        if (!Object.prototype.hasOwnProperty.call(obj, key)) return false;
                        // eslint-disable-next-line
                        delete obj[key];
                    }
                    return true;
                }
            }
        } else throw new Error(`setByPath failed, bad path ${path}`);
    }
    // eslint-disable-next-line
    throw new Error(`setByPath(${orig}, ${path}, ${val}) failed`);
}
function $c62be31ef05b0c90$export$102e532907108dad(orig, path) {
    if ($c62be31ef05b0c90$export$44b5bed83342a92f(orig, path) !== null) $c62be31ef05b0c90$export$f65a19d15516795e(orig, path, $c62be31ef05b0c90$var$_delete_);
}



// list of Array functions that change the array
const $547f11326d897190$var$ARRAY_MUTATIONS = [
    "sort",
    "splice",
    "copyWithin",
    "fill",
    "pop",
    "push",
    "reverse",
    "shift",
    "unshift"
];
const $547f11326d897190$var$registry = {};
const $547f11326d897190$var$debugPaths = true;
const $547f11326d897190$var$validPath = /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/;
const $547f11326d897190$export$a678af82bf766611 = (path)=>$547f11326d897190$var$validPath.test(path);
const $547f11326d897190$var$extendPath = (path = "", prop = "")=>{
    if (path === "") return prop;
    else {
        if (prop.match(/^\d+$/) !== null || prop.includes("=")) return `${path}[${prop}]`;
        else return `${path}.${prop}`;
    }
};
const $547f11326d897190$var$regHandler = (path = "")=>({
        // TODO figure out how to correctly return array[Symbol.iterator] so that for(const foo of xin.foos) works
        // as you'd expect
        get (target, _prop) {
            if (_prop === (0, $e921b0bd4f6415ab$export$a3622eb3b5dd592a)) return path;
            else if (_prop === (0, $e921b0bd4f6415ab$export$bdd0d039ad781534)) {
                while((0, $e921b0bd4f6415ab$export$40700dafb97c3799)(target) !== undefined)target = (0, $e921b0bd4f6415ab$export$5dcba2d45033d435)(target);
                return target;
            }
            if (typeof _prop === "symbol") return target[_prop];
            let prop = _prop;
            const compoundProp = prop.match(/^([^.[]+)\.(.+)$/) ?? // basePath.subPath (omit '.')
            prop.match(/^([^\]]+)(\[.+)/) ?? // basePath[subPath
            prop.match(/^(\[[^\]]+\])\.(.+)$/) ?? // [basePath].subPath (omit '.')
            prop.match(/^(\[[^\]]+\])\[(.+)$/) // [basePath][subPath
            ;
            if (compoundProp !== null) {
                const [, basePath, subPath] = compoundProp;
                const currentPath = $547f11326d897190$var$extendPath(path, basePath);
                const value = (0, $c62be31ef05b0c90$export$44b5bed83342a92f)(target, basePath);
                return value !== null && typeof value === "object" ? new Proxy(value, $547f11326d897190$var$regHandler(currentPath))[subPath] : value;
            }
            if (prop.startsWith("[") && prop.endsWith("]")) prop = prop.substring(1, prop.length - 1);
            if (!Array.isArray(target) && target[prop] !== undefined || Array.isArray(target) && prop.includes("=")) {
                let value;
                if (prop.includes("=")) {
                    const [idPath, needle] = prop.split("=");
                    value = target.find((candidate)=>`${(0, $c62be31ef05b0c90$export$44b5bed83342a92f)(candidate, idPath)}` === needle);
                } else value = target[prop];
                if (value !== null && typeof value === "object") {
                    const currentPath = $547f11326d897190$var$extendPath(path, prop);
                    return new Proxy(value, $547f11326d897190$var$regHandler(currentPath));
                } else if (typeof value === "function") return value.bind(target);
                else return value;
            } else if (Array.isArray(target)) {
                const value = target[prop];
                return typeof value === "function" ? (...items)=>{
                    // @ts-expect-error seriously, eslint?
                    const result = Array.prototype[prop].apply(target, items);
                    if ($547f11326d897190$var$ARRAY_MUTATIONS.includes(prop)) (0, $f0b099915f91bd21$export$d0b7ea69ab6056df)(path);
                    return result;
                } : typeof value === "object" ? new Proxy(value, $547f11326d897190$var$regHandler($547f11326d897190$var$extendPath(path, prop))) : value;
            } else return target[prop];
        },
        set (_, prop, value) {
            value = (0, $e921b0bd4f6415ab$export$5dcba2d45033d435)(value);
            const fullPath = $547f11326d897190$var$extendPath(path, prop);
            if ($547f11326d897190$var$debugPaths && !$547f11326d897190$export$a678af82bf766611(fullPath)) throw new Error(`setting invalid path ${fullPath}`);
            const existing = (0, $e921b0bd4f6415ab$export$5dcba2d45033d435)($547f11326d897190$export$966034e6c6823eb0[fullPath]);
            if (existing !== value && (0, $c62be31ef05b0c90$export$f65a19d15516795e)($547f11326d897190$var$registry, fullPath, value)) (0, $f0b099915f91bd21$export$d0b7ea69ab6056df)(fullPath);
            return true;
        }
    });
const $547f11326d897190$export$d1203567a167490e = (test, callback)=>{
    const func = typeof callback === "function" ? callback : $547f11326d897190$export$966034e6c6823eb0[callback];
    if (typeof func !== "function") throw new Error(`observe expects a function or path to a function, ${callback} is neither`);
    return (0, $f0b099915f91bd21$export$d1203567a167490e)(test, func);
};
const $547f11326d897190$export$966034e6c6823eb0 = new Proxy($547f11326d897190$var$registry, $547f11326d897190$var$regHandler());



const { document: $b5796eaeba5c782e$var$document, MutationObserver: $b5796eaeba5c782e$var$MutationObserver } = globalThis;
const $b5796eaeba5c782e$export$80bf2f765c31be6a = (element, changedPath)=>{
    const dataBindings = (0, $e921b0bd4f6415ab$export$1f922de8d0ecbb7e).get(element);
    if (dataBindings == null) return;
    for (const dataBinding of dataBindings){
        const { binding: binding, options: options } = dataBinding;
        let { path: path } = dataBinding;
        const { toDOM: toDOM } = binding;
        if (toDOM != null) {
            if (path.startsWith("^")) {
                const dataSource = (0, $e921b0bd4f6415ab$export$4c309843c07ce679)(element);
                if (dataSource != null && dataSource[0, $e921b0bd4f6415ab$export$a3622eb3b5dd592a] != null) path = dataBinding.path = `${dataSource[0, $e921b0bd4f6415ab$export$a3622eb3b5dd592a]}${path.substring(1)}`;
                else {
                    console.error(`Cannot resolve relative binding ${path}`, element, "is not part of a list");
                    throw new Error(`Cannot resolve relative binding ${path}`);
                }
            }
            if (changedPath == null || path.startsWith(changedPath)) toDOM(element, (0, $547f11326d897190$export$966034e6c6823eb0)[path], options);
        }
    }
};
// this is just to allow bind to be testable in node
if ($b5796eaeba5c782e$var$MutationObserver != null) {
    const observer = new $b5796eaeba5c782e$var$MutationObserver((mutationsList)=>{
        mutationsList.forEach((mutation)=>{
            [
                ...mutation.addedNodes
            ].forEach((node)=>{
                if (node instanceof HTMLElement) [
                    ...node.querySelectorAll((0, $e921b0bd4f6415ab$export$4c0223f67078aeac))
                ].forEach((element)=>$b5796eaeba5c782e$export$80bf2f765c31be6a(element));
            });
        });
    });
    observer.observe($b5796eaeba5c782e$var$document.body, {
        subtree: true,
        childList: true
    });
}
(0, $547f11326d897190$export$d1203567a167490e)(()=>true, (changedPath)=>{
    const boundElements = $b5796eaeba5c782e$var$document.querySelectorAll((0, $e921b0bd4f6415ab$export$4c0223f67078aeac));
    for (const element of boundElements)$b5796eaeba5c782e$export$80bf2f765c31be6a(element, changedPath);
});
const $b5796eaeba5c782e$var$handleChange = (event)=>{
    // @ts-expect-error-error
    let target = event.target.closest((0, $e921b0bd4f6415ab$export$4c0223f67078aeac));
    while(target != null){
        const dataBindings = (0, $e921b0bd4f6415ab$export$1f922de8d0ecbb7e).get(target);
        for (const dataBinding of dataBindings){
            const { binding: binding, path: path } = dataBinding;
            const { fromDOM: fromDOM } = binding;
            if (fromDOM != null) {
                let value;
                try {
                    value = fromDOM(target, dataBinding.options);
                } catch (e) {
                    console.error("Cannot get value from", target, "via", dataBinding);
                    throw new Error("Cannot obtain value fromDOM");
                }
                if (value != null) {
                    const existing = (0, $547f11326d897190$export$966034e6c6823eb0)[path];
                    // eslint-disable-next-line
                    if (existing == null) (0, $547f11326d897190$export$966034e6c6823eb0)[path] = value;
                    else {
                        const existingActual = // @ts-expect-error-error
                        existing[0, $e921b0bd4f6415ab$export$a3622eb3b5dd592a] != null ? existing[0, $e921b0bd4f6415ab$export$bdd0d039ad781534] : existing;
                        const valueActual = value[0, $e921b0bd4f6415ab$export$a3622eb3b5dd592a] != null ? value[0, $e921b0bd4f6415ab$export$bdd0d039ad781534] : value;
                        if (existingActual !== valueActual) (0, $547f11326d897190$export$966034e6c6823eb0)[path] = valueActual;
                    }
                }
            }
        }
        target = target.parentElement.closest((0, $e921b0bd4f6415ab$export$4c0223f67078aeac));
    }
};
if (globalThis.document != null) {
    $b5796eaeba5c782e$var$document.body.addEventListener("change", $b5796eaeba5c782e$var$handleChange, true);
    $b5796eaeba5c782e$var$document.body.addEventListener("input", $b5796eaeba5c782e$var$handleChange, true);
}
function $b5796eaeba5c782e$export$2385a24977818dd0(element, what, binding, options) {
    if (element instanceof DocumentFragment) throw new Error("bind cannot bind to a DocumentFragment");
    let path;
    if (typeof what === "object" && what[0, $e921b0bd4f6415ab$export$a3622eb3b5dd592a] === undefined && options === undefined) {
        const { value: value } = what;
        path = typeof value === "string" ? value : value[0, $e921b0bd4f6415ab$export$a3622eb3b5dd592a];
        options = what;
        delete options.value;
    } else path = typeof what === "string" ? what : what[0, $e921b0bd4f6415ab$export$a3622eb3b5dd592a];
    if (path == null) throw new Error("bind requires a path or object with xin Proxy");
    const { toDOM: toDOM } = binding;
    element.classList.add((0, $e921b0bd4f6415ab$export$c6592bbc1eebb717));
    let dataBindings = (0, $e921b0bd4f6415ab$export$1f922de8d0ecbb7e).get(element);
    if (dataBindings == null) {
        dataBindings = [];
        (0, $e921b0bd4f6415ab$export$1f922de8d0ecbb7e).set(element, dataBindings);
    }
    dataBindings.push({
        path: path,
        binding: binding,
        options: options
    });
    if (toDOM != null && !path.startsWith("^")) (0, $f0b099915f91bd21$export$d0b7ea69ab6056df)(path);
    return element;
}
const $b5796eaeba5c782e$var$handledEventTypes = new Set();
const $b5796eaeba5c782e$var$handleBoundEvent = (event)=>{
    // @ts-expect-error-error
    let target = event?.target.closest((0, $e921b0bd4f6415ab$export$21d9322c3477441b));
    let propagationStopped = false;
    const wrappedEvent = new Proxy(event, {
        get (target, prop) {
            if (prop === "stopPropagation") return ()=>{
                event.stopPropagation();
                propagationStopped = true;
            };
            else {
                // @ts-expect-error-error
                const value = target[prop];
                return typeof value === "function" ? value.bind(target) : value;
            }
        }
    });
    while(!propagationStopped && target != null){
        const eventBindings = (0, $e921b0bd4f6415ab$export$fe712848e6e66613).get(target);
        const handlers = eventBindings[event.type] || [];
        for (const handler of handlers){
            if (typeof handler === "function") handler(wrappedEvent);
            else {
                const func = (0, $547f11326d897190$export$966034e6c6823eb0)[handler];
                if (typeof func === "function") func(wrappedEvent);
                else throw new Error(`no event handler found at path ${handler}`);
            }
            if (propagationStopped) continue;
        }
        target = target.parentElement != null ? target.parentElement.closest((0, $e921b0bd4f6415ab$export$21d9322c3477441b)) : null;
    }
};
const $b5796eaeba5c782e$export$af631764ddc44097 = (element, eventType, eventHandler)=>{
    let eventBindings = (0, $e921b0bd4f6415ab$export$fe712848e6e66613).get(element);
    element.classList.add((0, $e921b0bd4f6415ab$export$6a7099543a9795c7));
    if (eventBindings == null) {
        eventBindings = {};
        (0, $e921b0bd4f6415ab$export$fe712848e6e66613).set(element, eventBindings);
    }
    if (!eventBindings[eventType]) eventBindings[eventType] = [];
    if (!eventBindings[eventType].includes(eventHandler)) eventBindings[eventType].push(eventHandler);
    if (!$b5796eaeba5c782e$var$handledEventTypes.has(eventType)) {
        $b5796eaeba5c782e$var$handledEventTypes.add(eventType);
        $b5796eaeba5c782e$var$document.body.addEventListener(eventType, $b5796eaeba5c782e$var$handleBoundEvent, true);
    }
};




const $f314c6851ceb0f9e$export$635e15bbd66f01ea = (target, type)=>{
    const event = new Event(type);
    target.dispatchEvent(event);
};
const $f314c6851ceb0f9e$var$valueType = (element)=>{
    if (element instanceof HTMLInputElement) return element.type;
    else if (element instanceof HTMLSelectElement && element.hasAttribute("multiple")) return "multi-select";
    else return "other";
};
const $f314c6851ceb0f9e$export$80746c6bc6142fc8 = (element, newValue)=>{
    switch($f314c6851ceb0f9e$var$valueType(element)){
        case "radio":
            element.checked = element.value === newValue;
            break;
        case "checkbox":
            element.checked = !!newValue;
            break;
        case "date":
            element.valueAsDate = new Date(newValue);
            break;
        case "multi-select":
            for (const option of [
                ...element.querySelectorAll("option")
            ])option.selected = newValue[option.value];
            break;
        default:
            element.value = newValue;
    }
};
const $f314c6851ceb0f9e$export$bf7199a9ebcb84a9 = (element)=>{
    switch($f314c6851ceb0f9e$var$valueType(element)){
        case "radio":
            {
                const radio = element.parentElement?.querySelector(`[name="${element.name}"]:checked`);
                return radio != null ? radio.value : null;
            }
        case "checkbox":
            return element.checked;
        case "date":
            return element.valueAsDate?.toISOString();
        case "multi-select":
            return [
                ...element.querySelectorAll("option")
            ].reduce((map, option)=>{
                map[option.value] = option.selected;
                return map;
            }, {});
        default:
            return element.value;
    }
};
const { ResizeObserver: $f314c6851ceb0f9e$var$ResizeObserver } = globalThis;
const $f314c6851ceb0f9e$export$b13421f1ae71d316 = $f314c6851ceb0f9e$var$ResizeObserver != null ? new $f314c6851ceb0f9e$var$ResizeObserver((entries)=>{
    for (const entry of entries){
        const element = entry.target;
        $f314c6851ceb0f9e$export$635e15bbd66f01ea(element, "resize");
    }
}) : {
    observe () {},
    unobserve () {}
};
const $f314c6851ceb0f9e$export$6bb13967611cdb1 = (elt, content, cloneElements = true)=>{
    if (elt != null && content != null) {
        if (typeof content === "string") elt.textContent = content;
        else if (Array.isArray(content)) content.forEach((node)=>{
            elt.append(node instanceof Node && cloneElements ? (0, $e921b0bd4f6415ab$export$fa8cc6a36b1ccd7f)(node) : node);
        });
        else if (content instanceof Node) elt.append(cloneElements ? (0, $e921b0bd4f6415ab$export$fa8cc6a36b1ccd7f)(content) : content);
        else throw new Error("expect text content or document node");
    }
};


const $fb7e454a17657925$export$61fc7d43ac8f84b0 = (origFn, minInterval = 250)=>{
    let debounceId;
    return (...args)=>{
        if (debounceId !== undefined) clearTimeout(debounceId);
        debounceId = setTimeout(()=>{
            origFn(...args);
        }, minInterval);
    };
};
const $fb7e454a17657925$export$de363e709c412c8a = (origFn, minInterval = 250)=>{
    let debounceId;
    let previousCall = Date.now() - minInterval;
    let inFlight = false;
    return (...args)=>{
        clearTimeout(debounceId);
        debounceId = setTimeout(async ()=>{
            origFn(...args);
            previousCall = Date.now();
        }, minInterval);
        if (!inFlight && Date.now() - previousCall >= minInterval) {
            inFlight = true;
            try {
                origFn(...args);
                previousCall = Date.now();
            } finally{
                inFlight = false;
            }
        }
    };
};




const $ea2c6a36710de0a8$var$listBindingRef = Symbol("list-binding");
const $ea2c6a36710de0a8$var$SLICE_INTERVAL_MS = 16 // 60fps
;
function $ea2c6a36710de0a8$var$updateRelativeBindings(element, path) {
    const boundElements = [
        ...element.querySelectorAll((0, $e921b0bd4f6415ab$export$4c0223f67078aeac))
    ];
    if (element.matches((0, $e921b0bd4f6415ab$export$4c0223f67078aeac))) boundElements.unshift(element);
    for (const boundElement of boundElements){
        const bindings = (0, $e921b0bd4f6415ab$export$1f922de8d0ecbb7e).get(boundElement);
        for (const binding of bindings){
            if (binding.path.startsWith("^")) binding.path = `${path}${binding.path.substring(1)}`;
            if (binding.binding.toDOM != null) binding.binding.toDOM(boundElement, (0, $547f11326d897190$export$966034e6c6823eb0)[binding.path]);
        }
    }
}
class $ea2c6a36710de0a8$var$ListBinding {
    constructor(boundElement, options = {}){
        this._array = [];
        this.boundElement = boundElement;
        this.itemToElement = new WeakMap();
        if (boundElement.children.length !== 1) throw new Error("ListBinding expects an element with exactly one child element");
        if (boundElement.children[0] instanceof HTMLTemplateElement) {
            const template = boundElement.children[0];
            if (template.content.children.length !== 1) throw new Error("ListBinding expects a template with exactly one child element");
            this.template = (0, $e921b0bd4f6415ab$export$fa8cc6a36b1ccd7f)(template.content.children[0]);
        } else {
            this.template = boundElement.children[0];
            this.template.remove();
        }
        this.listTop = document.createElement("div");
        this.listBottom = document.createElement("div");
        this.boundElement.append(this.listTop);
        this.boundElement.append(this.listBottom);
        this.options = options;
        if (options.virtual != null) {
            (0, $f314c6851ceb0f9e$export$b13421f1ae71d316).observe(this.boundElement);
            this._update = (0, $fb7e454a17657925$export$de363e709c412c8a)(()=>{
                this.update(this._array, true);
            }, $ea2c6a36710de0a8$var$SLICE_INTERVAL_MS);
            this.boundElement.addEventListener("scroll", this._update);
            this.boundElement.addEventListener("resize", this._update);
        }
    }
    visibleSlice() {
        const { virtual: virtual, hiddenProp: hiddenProp, visibleProp: visibleProp } = this.options;
        let visibleArray = this._array;
        if (hiddenProp !== undefined) visibleArray = visibleArray.filter((item)=>item[hiddenProp] !== true);
        if (visibleProp !== undefined) visibleArray = visibleArray.filter((item)=>item[visibleProp] === true);
        let firstItem = 0;
        let lastItem = visibleArray.length - 1;
        let topBuffer = 0;
        let bottomBuffer = 0;
        if (virtual != null) {
            const width = this.boundElement.offsetWidth;
            const height = this.boundElement.offsetHeight;
            const visibleColumns = virtual.width != null ? Math.max(1, Math.floor(width / virtual.width)) : 1;
            const visibleRows = Math.ceil(height / virtual.height) + 1;
            const totalRows = Math.ceil(visibleArray.length / visibleColumns);
            const visibleItems = visibleColumns * visibleRows;
            let topRow = Math.floor(this.boundElement.scrollTop / virtual.height);
            if (topRow > totalRows - visibleRows + 1) topRow = Math.max(0, totalRows - visibleRows + 1);
            firstItem = topRow * visibleColumns;
            lastItem = firstItem + visibleItems - 1;
            topBuffer = topRow * virtual.height;
            bottomBuffer = Math.max(totalRows * virtual.height - height - topBuffer, 0);
        }
        return {
            items: visibleArray,
            firstItem: firstItem,
            lastItem: lastItem,
            topBuffer: topBuffer,
            bottomBuffer: bottomBuffer
        };
    }
    update(array, isSlice) {
        if (array == null) array = [];
        this._array = array;
        const { initInstance: initInstance, updateInstance: updateInstance, hiddenProp: hiddenProp, visibleProp: visibleProp } = this.options;
        const arrayPath = (0, $e921b0bd4f6415ab$export$40700dafb97c3799)(array);
        const slice = this.visibleSlice();
        this.boundElement.classList.toggle("-xin-empty-list", slice.items.length === 0);
        const previousSlice = this._previousSlice;
        const { firstItem: firstItem, lastItem: lastItem, topBuffer: topBuffer, bottomBuffer: bottomBuffer } = slice;
        if (hiddenProp === undefined && visibleProp === undefined && isSlice === true && previousSlice != null && firstItem === previousSlice.firstItem && lastItem === previousSlice.lastItem) return;
        this._previousSlice = slice;
        let removed = 0;
        let moved = 0;
        let created = 0;
        for (const element of [
            ...this.boundElement.children
        ]){
            if (element === this.listTop || element === this.listBottom) continue;
            const proxy = (0, $e921b0bd4f6415ab$export$86caed35dd837d06).get(element);
            if (proxy == null) element.remove();
            else {
                const idx = slice.items.indexOf(proxy);
                if (idx < firstItem || idx > lastItem) {
                    element.remove();
                    this.itemToElement.delete(proxy);
                    (0, $e921b0bd4f6415ab$export$86caed35dd837d06).delete(element);
                    removed++;
                }
            }
        }
        this.listTop.style.height = String(topBuffer) + "px";
        this.listBottom.style.height = String(bottomBuffer) + "px";
        // build a complete new set of elements in the right order
        const elements = [];
        const { idPath: idPath } = this.options;
        for(let i = firstItem; i <= lastItem; i++){
            const item = slice.items[i];
            if (item === undefined) continue;
            let element = this.itemToElement.get((0, $e921b0bd4f6415ab$export$5dcba2d45033d435)(item));
            if (element == null) {
                created++;
                element = (0, $e921b0bd4f6415ab$export$fa8cc6a36b1ccd7f)(this.template);
                if (typeof item === "object") {
                    this.itemToElement.set((0, $e921b0bd4f6415ab$export$5dcba2d45033d435)(item), element);
                    (0, $e921b0bd4f6415ab$export$86caed35dd837d06).set(element, (0, $e921b0bd4f6415ab$export$5dcba2d45033d435)(item));
                }
                this.boundElement.insertBefore(element, this.listBottom);
                if (idPath != null) {
                    const idValue = item[idPath];
                    const itemPath = `${arrayPath}[${idPath}=${idValue}]`;
                    $ea2c6a36710de0a8$var$updateRelativeBindings(element, itemPath);
                } else {
                    const itemPath = `${arrayPath}[${i}]`;
                    $ea2c6a36710de0a8$var$updateRelativeBindings(element, itemPath);
                }
                if (initInstance != null) // eslint-disable-next-line
                initInstance(element, item);
            }
            if (updateInstance != null) // eslint-disable-next-line
            updateInstance(element, item);
            elements.push(element);
        }
        // make sure all the elements are in the DOM and in the correct location
        let insertionPoint = null;
        for (const element of elements){
            if (element.previousElementSibling !== insertionPoint) {
                moved++;
                if (insertionPoint?.nextElementSibling != null) this.boundElement.insertBefore(element, insertionPoint.nextElementSibling);
                else this.boundElement.insertBefore(element, this.listBottom);
            }
            insertionPoint = element;
        }
        if ((0, $34b63e9d5b96494c$export$a5a6e0b888b2c992).perf) console.log(arrayPath, "updated", {
            removed: removed,
            created: created,
            moved: moved
        });
    }
}
const $ea2c6a36710de0a8$export$b0eb386be3b9fed8 = (boundElement, options)=>{
    let listBinding = boundElement[$ea2c6a36710de0a8$var$listBindingRef];
    if (listBinding === undefined) {
        listBinding = new $ea2c6a36710de0a8$var$ListBinding(boundElement, options);
        boundElement[$ea2c6a36710de0a8$var$listBindingRef] = listBinding;
    }
    return listBinding;
};



const $7d9f6326e1d5d994$export$97a1a3e6f39778d2 = {
    value: {
        toDOM (element, value) {
            (0, $f314c6851ceb0f9e$export$80746c6bc6142fc8)(element, value);
        },
        fromDOM (element) {
            return (0, $f314c6851ceb0f9e$export$bf7199a9ebcb84a9)(element);
        }
    },
    text: {
        toDOM (element, value) {
            element.textContent = value;
        }
    },
    enabled: {
        toDOM (element, value) {
            element.disabled = !value;
        }
    },
    disabled: {
        toDOM (element, value) {
            element.disabled = Boolean(value);
        }
    },
    style: {
        toDOM (element, value) {
            if (typeof value === "object") for (const prop of Object.keys(value))// @ts-expect-error typescript has a strange/incorrect idea of what element.style is
            element.style[prop] = value[prop];
            else if (typeof value === "string") element.setAttribute("style", value);
            else throw new Error("style binding expects either a string or object");
        }
    },
    list: {
        toDOM (element, value, options) {
            const listBinding = (0, $ea2c6a36710de0a8$export$b0eb386be3b9fed8)(element, options);
            listBinding.update(value);
        }
    }
};


/*
# more-math

Some simple functions egregiously missing from `Math`
*/ const $0e50e8a626908591$export$ba6bc6c220358ed9 = 180 / Math.PI;
const $0e50e8a626908591$export$1518e1a62333c8a4 = Math.PI / 180;
function $0e50e8a626908591$export$7d15b64cf5a3a4c4(min, v, max) {
    return v < min ? min : v > max ? max : v;
}
function $0e50e8a626908591$export$3a89f8d6f6bf6c9f(a, b, t) {
    t = $0e50e8a626908591$export$7d15b64cf5a3a4c4(0, t, 1);
    return t * (b - a) + a;
}
const $0e50e8a626908591$export$5e0dd9fd5d74e0c5 = {
    clamp: $0e50e8a626908591$export$7d15b64cf5a3a4c4,
    lerp: $0e50e8a626908591$export$3a89f8d6f6bf6c9f
};


const $72989831e95a2bab$var$hex2 = (n)=>("00" + Math.round(Number(n)).toString(16)).slice(-2);
class $72989831e95a2bab$var$HslColor {
    constructor(r, g, b){
        r /= 255;
        g /= 255;
        b /= 255;
        const l = Math.max(r, g, b);
        const s = l - Math.min(r, g, b);
        const h = s !== 0 ? l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s : 0;
        this.h = 60 * h < 0 ? 60 * h + 360 : 60 * h;
        this.s = s !== 0 ? l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s)) : 0;
        this.l = (2 * l - s) / 2;
    }
}
const $72989831e95a2bab$var$span = globalThis.document !== undefined ? globalThis.document.createElement("span") : undefined;
class $72989831e95a2bab$export$892596cec99bc70e {
    static fromCss(spec) {
        let converted = spec;
        if ($72989831e95a2bab$var$span instanceof HTMLSpanElement) {
            $72989831e95a2bab$var$span.style.color = spec;
            document.body.appendChild($72989831e95a2bab$var$span);
            converted = getComputedStyle($72989831e95a2bab$var$span).color;
            $72989831e95a2bab$var$span.remove();
        }
        const [r, g, b, a] = converted.match(/[\d.]+/g);
        return new $72989831e95a2bab$export$892596cec99bc70e(Number(r), Number(g), Number(b), a == null ? 1 : Number(a));
    }
    static fromHsl(h, s, l, a = 1) {
        return $72989831e95a2bab$export$892596cec99bc70e.fromCss(`hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${a.toFixed(2)})`);
    }
    constructor(r, g, b, a = 1){
        this.r = (0, $0e50e8a626908591$export$7d15b64cf5a3a4c4)(0, r, 255);
        this.g = (0, $0e50e8a626908591$export$7d15b64cf5a3a4c4)(0, g, 255);
        this.b = (0, $0e50e8a626908591$export$7d15b64cf5a3a4c4)(0, b, 255);
        this.a = a !== undefined ? (0, $0e50e8a626908591$export$7d15b64cf5a3a4c4)(0, a, 1) : a = 1;
    }
    get inverse() {
        return new $72989831e95a2bab$export$892596cec99bc70e(255 - this.r, 255 - this.g, 255 - this.b, this.a);
    }
    get inverseLuminance() {
        const { h: h, s: s, l: l } = this._hsl;
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, s, 1 - l, this.a);
    }
    get rgb() {
        const { r: r, g: g, b: b } = this;
        return `rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)})`;
    }
    get rgba() {
        const { r: r, g: g, b: b, a: a } = this;
        return `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${a.toFixed(2)})`;
    }
    get RGBA() {
        return [
            this.r / 255,
            this.g / 255,
            this.b / 255,
            this.a
        ];
    }
    get ARGB() {
        return [
            this.a,
            this.r / 255,
            this.g / 255,
            this.b / 255
        ];
    }
    get _hsl() {
        if (this._hslCached == null) this._hslCached = new $72989831e95a2bab$var$HslColor(this.r, this.g, this.b);
        return this._hslCached;
    }
    get hsl() {
        const { h: h, s: s, l: l } = this._hsl;
        return `hsl(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`;
    }
    get hsla() {
        const { h: h, s: s, l: l } = this._hsl;
        return `hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${this.a.toFixed(2)})`;
    }
    get mono() {
        const v = this.brightness * 255;
        return new $72989831e95a2bab$export$892596cec99bc70e(v, v, v);
    }
    get brightness() {
        // http://www.itu.int/rec/R-REC-BT.601
        return (0.299 * this.r + 0.587 * this.g + 0.114 * this.b) / 255;
    }
    get html() {
        return this.a === 1 ? "#" + $72989831e95a2bab$var$hex2(this.r) + $72989831e95a2bab$var$hex2(this.g) + $72989831e95a2bab$var$hex2(this.b) : "#" + $72989831e95a2bab$var$hex2(this.r) + $72989831e95a2bab$var$hex2(this.g) + $72989831e95a2bab$var$hex2(this.b) + $72989831e95a2bab$var$hex2(Math.floor(255 * this.a));
    }
    brighten(amount) {
        const { h: h, s: s, l: l } = this._hsl;
        const lClamped = (0, $0e50e8a626908591$export$7d15b64cf5a3a4c4)(0, l + amount * (1 - l), 1);
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, s, lClamped, this.a);
    }
    darken(amount) {
        const { h: h, s: s, l: l } = this._hsl;
        const lClamped = (0, $0e50e8a626908591$export$7d15b64cf5a3a4c4)(0, l * (1 - amount), 1);
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, s, lClamped, this.a);
    }
    saturate(amount) {
        const { h: h, s: s, l: l } = this._hsl;
        const sClamped = (0, $0e50e8a626908591$export$7d15b64cf5a3a4c4)(0, s + amount * (1 - s), 1);
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, sClamped, l, this.a);
    }
    desaturate(amount) {
        const { h: h, s: s, l: l } = this._hsl;
        const sClamped = (0, $0e50e8a626908591$export$7d15b64cf5a3a4c4)(0, s * (1 - amount), 1);
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, sClamped, l, this.a);
    }
    rotate(amount) {
        const { h: h, s: s, l: l } = this._hsl;
        const hClamped = (h + 360 + amount) % 360;
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(hClamped, s, l, this.a);
    }
    opacity(alpha) {
        const { h: h, s: s, l: l } = this._hsl;
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, s, l, alpha);
    }
    swatch() {
        const { r: r, g: g, b: b, a: a } = this;
        console.log(`%c   %c ${this.html}, rgba(${r}, ${g}, ${b}, ${a}), ${this.hsla}`, `background-color: rgba(${r}, ${g}, ${b}, ${a})`, "background-color: #eee");
    }
    blend(otherColor, t) {
        return new $72989831e95a2bab$export$892596cec99bc70e((0, $0e50e8a626908591$export$3a89f8d6f6bf6c9f)(this.r, otherColor.r, t), (0, $0e50e8a626908591$export$3a89f8d6f6bf6c9f)(this.g, otherColor.g, t), (0, $0e50e8a626908591$export$3a89f8d6f6bf6c9f)(this.b, otherColor.b, t), (0, $0e50e8a626908591$export$3a89f8d6f6bf6c9f)(this.a, otherColor.a, t));
    }
}




function $bed4bed3dcfb6f9a$export$87ae551bf60f4bb(s) {
    return s.replace(/[A-Z]/g, (c)=>{
        return `-${c.toLocaleLowerCase()}`;
    });
}
function $bed4bed3dcfb6f9a$export$fd322201efdc650f(s) {
    return s.replace(/-([a-z])/g, (_, c)=>{
        return c.toLocaleUpperCase();
    });
}


const $9e0c0b8784c80412$var$MATH = "http://www.w3.org/1998/Math/MathML";
const $9e0c0b8784c80412$var$SVG = "http://www.w3.org/2000/svg";
const $9e0c0b8784c80412$var$templates = {};
const $9e0c0b8784c80412$var$create = (tagType, ...contents)=>{
    if ($9e0c0b8784c80412$var$templates[tagType] === undefined) {
        const [tag, namespace] = tagType.split("|");
        if (namespace === undefined) $9e0c0b8784c80412$var$templates[tagType] = globalThis.document.createElement(tag);
        else $9e0c0b8784c80412$var$templates[tagType] = globalThis.document.createElementNS(namespace, tag);
    }
    const elt = $9e0c0b8784c80412$var$templates[tagType].cloneNode();
    const elementProps = {};
    for (const item of contents)if (item instanceof Element || item instanceof DocumentFragment || typeof item === "string" || typeof item === "number") {
        if (elt instanceof HTMLTemplateElement) elt.content.append(item);
        else elt.append(item);
    } else Object.assign(elementProps, item);
    for (const key of Object.keys(elementProps)){
        const value = elementProps[key];
        if (key === "apply") value(elt);
        else if (key === "style") {
            if (typeof value === "object") {
                for (const prop of Object.keys(value))if (prop.startsWith("--")) elt.style.setProperty(prop, value[prop]);
                else elt.style[prop] = value[prop];
            } else elt.setAttribute("style", value);
        } else if (key.match(/^on[A-Z]/) != null) {
            const eventType = key.substring(2).toLowerCase();
            (0, $b5796eaeba5c782e$export$af631764ddc44097)(elt, eventType, value);
        } else if (key === "bind") {
            const binding = typeof value.binding === "string" ? (0, $7d9f6326e1d5d994$export$97a1a3e6f39778d2)[value.binding] : value.binding;
            if (binding !== undefined && value.value !== undefined) (0, $b5796eaeba5c782e$export$2385a24977818dd0)(elt, value.value, value.binding);
            else throw new Error(`bad binding`);
        } else if (key.match(/^bind[A-Z]/) != null) {
            const bindingType = key.substring(4, 5).toLowerCase() + key.substring(5);
            const binding = (0, $7d9f6326e1d5d994$export$97a1a3e6f39778d2)[bindingType];
            if (binding !== undefined) (0, $b5796eaeba5c782e$export$2385a24977818dd0)(elt, value, binding);
            else throw new Error(`${key} is not allowed, bindings.${bindingType} is not defined`);
        } else if (elt[key] !== undefined) {
            // MathML is only supported on 91% of browsers, and not on the Raspberry Pi Chromium
            const { MathMLElement: MathMLElement } = globalThis;
            if (elt instanceof SVGElement || MathMLElement !== undefined && elt instanceof MathMLElement) elt.setAttribute(key, value);
            else elt[key] = value;
        } else {
            const attr = (0, $bed4bed3dcfb6f9a$export$87ae551bf60f4bb)(key);
            if (attr === "class") value.split(" ").forEach((className)=>{
                elt.classList.add(className);
            });
            else if (elt[attr] !== undefined) elt[attr] = value;
            else if (typeof value === "boolean") value ? elt.setAttribute(attr, "") : elt.removeAttribute(attr);
            else elt.setAttribute(attr, value);
        }
    }
    return elt;
};
const $9e0c0b8784c80412$var$fragment = (...contents)=>{
    const frag = globalThis.document.createDocumentFragment();
    for (const item of contents)frag.append(item);
    return frag;
};
const $9e0c0b8784c80412$export$7a5d735b2ab6389d = new Proxy({
    fragment: $9e0c0b8784c80412$var$fragment
}, {
    get (target, tagName) {
        tagName = tagName.replace(/[A-Z]/g, (c)=>`-${c.toLocaleLowerCase()}`);
        if (target[tagName] === undefined) target[tagName] = (...contents)=>$9e0c0b8784c80412$var$create(tagName, ...contents);
        return target[tagName];
    },
    set () {
        throw new Error("You may not add new properties to elements");
    }
});
const $9e0c0b8784c80412$export$cf20112a1bc148da = new Proxy({
    fragment: $9e0c0b8784c80412$var$fragment
}, {
    get (target, tagName) {
        if (target[tagName] === undefined) target[tagName] = (...contents)=>$9e0c0b8784c80412$var$create(`${tagName}|${$9e0c0b8784c80412$var$SVG}`, ...contents);
        return target[tagName];
    },
    set () {
        throw new Error("You may not add new properties to elements");
    }
});
const $9e0c0b8784c80412$export$8ec252cfdd664597 = new Proxy({
    fragment: $9e0c0b8784c80412$var$fragment
}, {
    get (target, tagName) {
        if (target[tagName] === undefined) target[tagName] = (...contents)=>$9e0c0b8784c80412$var$create(`${tagName}|${$9e0c0b8784c80412$var$MATH}`, ...contents);
        return target[tagName];
    },
    set () {
        throw new Error("You may not add new properties to elements");
    }
});



function $49cee7f7f866c751$export$bc59121b0a0fcbd3(styleSheet) {
    return (0, $9e0c0b8784c80412$export$7a5d735b2ab6389d).style($49cee7f7f866c751$export$dbf350e5966cf602(styleSheet));
}
const $49cee7f7f866c751$var$numericProps = [
    "animation-iteration-count",
    "flex",
    "flex-base",
    "flex-grow",
    "flex-shrink",
    "gap",
    "opacity",
    "order",
    "tab-size",
    "widows",
    "z-index",
    "zoom"
];
const $49cee7f7f866c751$var$renderProp = (indentation, cssProp, value)=>{
    if (value === undefined) return "";
    else if (typeof value === "string" || $49cee7f7f866c751$var$numericProps.includes(cssProp)) return `${indentation}  ${cssProp}: ${value};`;
    else return `${indentation}  ${cssProp}: ${value}px;`;
};
const $49cee7f7f866c751$var$renderStatement = (key, value, indentation = "")=>{
    const cssProp = (0, $bed4bed3dcfb6f9a$export$87ae551bf60f4bb)(key);
    if (typeof value === "object") {
        const renderedRule = Object.keys(value).map((innerKey)=>$49cee7f7f866c751$var$renderStatement(innerKey, value[innerKey], `${indentation}  `)).join("\n");
        return `${indentation}  ${key} {\n${renderedRule}\n${indentation}  }`;
    } else return $49cee7f7f866c751$var$renderProp(indentation, cssProp, value);
};
const $49cee7f7f866c751$export$dbf350e5966cf602 = (obj, indentation = "")=>{
    const selectors = Object.keys(obj).map((selector)=>{
        const body = obj[selector];
        if (typeof body === "string") {
            if (selector === "@import") return `@import url('${body}');`;
            throw new Error("top-level string value only allowed for `@import`");
        }
        const rule = Object.keys(body).map((prop)=>$49cee7f7f866c751$var$renderStatement(prop, body[prop])).join("\n");
        return `${indentation}${selector} {\n${rule}\n}`;
    });
    return selectors.join("\n\n");
};
const $49cee7f7f866c751$export$90d0ea046136e3ed = (obj)=>{
    const rule = {};
    for (const key of Object.keys(obj)){
        const value = obj[key];
        const kabobKey = (0, $bed4bed3dcfb6f9a$export$87ae551bf60f4bb)(key);
        rule[`--${kabobKey}`] = typeof value === "number" && value !== 0 ? String(value) + "px" : value;
    }
    return rule;
};
const $49cee7f7f866c751$export$808aaf1b460dc9af = (obj)=>{
    const rule = {};
    for (const key of Object.keys(obj)){
        let value = obj[key];
        if (typeof value === "string" && value.match(/^(#|rgb[a]?\(|hsl[a]?\()/) != null) {
            value = (0, $72989831e95a2bab$export$892596cec99bc70e).fromCss(value).inverseLuminance.html;
            rule[`--${(0, $bed4bed3dcfb6f9a$export$87ae551bf60f4bb)(key)}`] = value;
        }
    }
    return rule;
};
const $49cee7f7f866c751$export$3cb96c9f6c8d16a4 = new Proxy({}, {
    get (target, prop) {
        if (target[prop] == null) {
            prop = prop.replace(/[A-Z]/g, (x)=>`-${x.toLocaleLowerCase()}`);
            const [, _varName, , isNegative, scaleText, method] = prop.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/);
            const varName = `--${_varName}`;
            if (scaleText != null) {
                const scale = isNegative == null ? Number(scaleText) / 100 : -Number(scaleText) / 100;
                switch(method){
                    case "b":
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = scale > 0 ? (0, $72989831e95a2bab$export$892596cec99bc70e).fromCss(baseColor).brighten(scale).rgba : (0, $72989831e95a2bab$export$892596cec99bc70e).fromCss(baseColor).darken(-scale).rgba;
                        }
                        break;
                    case "s":
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = scale > 0 ? (0, $72989831e95a2bab$export$892596cec99bc70e).fromCss(baseColor).saturate(scale).rgba : (0, $72989831e95a2bab$export$892596cec99bc70e).fromCss(baseColor).desaturate(-scale).rgba;
                        }
                        break;
                    case "h":
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = (0, $72989831e95a2bab$export$892596cec99bc70e).fromCss(baseColor).rotate(scale * 100).rgba;
                            console.log((0, $72989831e95a2bab$export$892596cec99bc70e).fromCss(baseColor).hsla, (0, $72989831e95a2bab$export$892596cec99bc70e).fromCss(baseColor).rotate(scale).hsla);
                        }
                        break;
                    case "o":
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = (0, $72989831e95a2bab$export$892596cec99bc70e).fromCss(baseColor).opacity(scale).rgba;
                        }
                        break;
                    case "":
                        target[prop] = `calc(var(${varName}) * ${scale})`;
                        break;
                    default:
                        console.error(method);
                        throw new Error(`Unrecognized method ${method} for css variable ${varName}`);
                }
            } else target[prop] = `var(${varName})`;
        }
        return target[prop];
    }
});
const $49cee7f7f866c751$export$75c0e6adb3e38f31 = new Proxy({}, {
    get (target, prop) {
        if (target[prop] === undefined) {
            const varName = `--${prop.replace(/[A-Z]/g, (x)=>`-${x.toLocaleLowerCase()}`)}`;
            target[prop] = (val)=>`var(${varName}, ${val})`;
        }
        return target[prop];
    }
});








let $cd387b053feba574$var$anonymousElementCount = 0;
function $cd387b053feba574$var$anonElementTag() {
    return `custom-elt${($cd387b053feba574$var$anonymousElementCount++).toString(36)}`;
}
let $cd387b053feba574$var$instanceCount = 0;
class $cd387b053feba574$export$16fa2f45be04daa8 extends HTMLElement {
    static #_ = (()=>{
        this.elements = (0, $9e0c0b8784c80412$export$7a5d735b2ab6389d);
    })();
    static StyleNode(styleSpec) {
        return (0, $9e0c0b8784c80412$export$7a5d735b2ab6389d).style((0, $49cee7f7f866c751$export$dbf350e5966cf602)(styleSpec));
    }
    static elementCreator(options = {}) {
        if (this._elementCreator == null) {
            const { tag: tag, styleSpec: styleSpec } = options;
            let tagName = options != null ? tag : null;
            if (tagName == null) {
                if (typeof this.name === "string" && this.name !== "") {
                    tagName = (0, $bed4bed3dcfb6f9a$export$87ae551bf60f4bb)(this.name);
                    if (tagName.startsWith("-")) tagName = tagName.slice(1);
                } else tagName = $cd387b053feba574$var$anonElementTag();
            }
            if (customElements.get(tagName) != null) console.warn(`${tagName} is already defined`);
            if (tagName.match(/\w+(-\w+)+/) == null) {
                console.warn(`${tagName} is not a legal tag for a custom-element`);
                tagName = $cd387b053feba574$var$anonElementTag();
            }
            while(customElements.get(tagName) !== undefined)tagName = $cd387b053feba574$var$anonElementTag();
            window.customElements.define(tagName, this, options);
            this._elementCreator = (0, $9e0c0b8784c80412$export$7a5d735b2ab6389d)[tagName];
            if (styleSpec !== undefined) {
                let cssSource = (0, $49cee7f7f866c751$export$dbf350e5966cf602)(styleSpec);
                if (tag !== undefined && tagName !== tag) cssSource = cssSource.replace(new RegExp(`\\b${tag}\\b`, "g"), tagName);
                document.head.append((0, $9e0c0b8784c80412$export$7a5d735b2ab6389d).style({
                    id: tagName
                }, cssSource));
            }
        }
        return this._elementCreator;
    }
    initAttributes(...attributeNames) {
        const attributes = {};
        const attributeValues = {};
        const observer = new MutationObserver((mutationsList)=>{
            let triggerRender = false;
            mutationsList.forEach((mutation)=>{
                triggerRender = !!(mutation.attributeName && attributeNames.includes((0, $bed4bed3dcfb6f9a$export$fd322201efdc650f)(mutation.attributeName)));
            });
            if (triggerRender && this.queueRender !== undefined) this.queueRender(false);
        });
        observer.observe(this, {
            attributes: true
        });
        attributeNames.forEach((attributeName)=>{
            attributes[attributeName] = (0, $5165f04a46b33615$export$b7d58db314e0ac27)(this[attributeName]);
            const attributeKabob = (0, $bed4bed3dcfb6f9a$export$87ae551bf60f4bb)(attributeName);
            Object.defineProperty(this, attributeName, {
                enumerable: false,
                get () {
                    if (typeof attributes[attributeName] === "boolean") return this.hasAttribute(attributeKabob);
                    else {
                        // eslint-disable-next-line
                        if (this.hasAttribute(attributeKabob)) return typeof attributes[attributeName] === "number" ? parseFloat(this.getAttribute(attributeKabob)) : this.getAttribute(attributeKabob);
                        else if (attributeValues[attributeName] !== undefined) return attributeValues[attributeName];
                        else return attributes[attributeName];
                    }
                },
                set (value) {
                    if (typeof attributes[attributeName] === "boolean") {
                        if (value !== this[attributeName]) {
                            // eslint-disable-next-line
                            if (value) this.setAttribute(attributeKabob, "");
                            else this.removeAttribute(attributeKabob);
                            this.queueRender();
                        }
                    } else if (typeof attributes[attributeName] === "number") {
                        if (value !== parseFloat(this[attributeName])) {
                            this.setAttribute(attributeKabob, value);
                            this.queueRender();
                        }
                    } else if (typeof value === "object" || `${value}` !== `${this[attributeName]}`) {
                        if (value === null || value === undefined || typeof value === "object") this.removeAttribute(attributeKabob);
                        else this.setAttribute(attributeKabob, value);
                        this.queueRender();
                        attributeValues[attributeName] = value;
                    }
                }
            });
        });
    }
    initValue() {
        const valueDescriptor = Object.getOwnPropertyDescriptor(this, "value");
        if (valueDescriptor === undefined || valueDescriptor.get !== undefined || valueDescriptor.set !== undefined) return;
        let value = this.hasAttribute("value") ? this.getAttribute("value") : (0, $5165f04a46b33615$export$b7d58db314e0ac27)(this.value);
        delete this.value;
        Object.defineProperty(this, "value", {
            enumerable: false,
            get () {
                return value;
            },
            set (newValue) {
                if (value !== newValue) {
                    value = newValue;
                    this.queueRender(true);
                }
            }
        });
    }
    get refs() {
        console.warn("refs and data-ref are deprecated, use the part attribute and .parts instead");
        const root = this.shadowRoot != null ? this.shadowRoot : this;
        if (this._refs == null) this._refs = new Proxy({}, {
            get (target, ref) {
                if (target[ref] === undefined) {
                    let element = root.querySelector(`[part="${ref}"],[data-ref="${ref}"]`);
                    if (element == null) element = root.querySelector(ref);
                    if (element == null) throw new Error(`elementRef "${ref}" does not exist!`);
                    element.removeAttribute("data-ref");
                    target[ref] = element;
                }
                return target[ref];
            }
        });
        return this._refs;
    }
    get parts() {
        const root = this.shadowRoot != null ? this.shadowRoot : this;
        if (this._refs == null) this._refs = new Proxy({}, {
            get (target, ref) {
                if (target[ref] === undefined) {
                    let element = root.querySelector(`[part="${ref}"]`);
                    if (element == null) element = root.querySelector(ref);
                    if (element == null) throw new Error(`elementRef "${ref}" does not exist!`);
                    element.removeAttribute("data-ref");
                    target[ref] = element;
                }
                return target[ref];
            }
        });
        return this._refs;
    }
    constructor(){
        super();
        this.content = (0, $9e0c0b8784c80412$export$7a5d735b2ab6389d).slot();
        this._changeQueued = false;
        this._renderQueued = false;
        this._hydrated = false;
        $cd387b053feba574$var$instanceCount += 1;
        this.initAttributes("hidden");
        this.instanceId = `${this.tagName.toLocaleLowerCase()}-${$cd387b053feba574$var$instanceCount}`;
        this._value = (0, $5165f04a46b33615$export$b7d58db314e0ac27)(this.defaultValue);
    }
    connectedCallback() {
        this.hydrate();
        // super annoyingly, chrome loses its shit if you set *any* attributes in the constructor
        if (this.role != null) this.setAttribute("role", this.role);
        if (this.onResize !== undefined) {
            (0, $f314c6851ceb0f9e$export$b13421f1ae71d316).observe(this);
            if (this._onResize == null) this._onResize = this.onResize.bind(this);
            this.addEventListener("resize", this._onResize);
        }
        if (this.value != null && this.getAttribute("value") != null) this._value = this.getAttribute("value");
        this.queueRender();
    }
    disconnectedCallback() {
        (0, $f314c6851ceb0f9e$export$b13421f1ae71d316).unobserve(this);
    }
    queueRender(triggerChangeEvent = false) {
        if (!this._hydrated) return;
        if (!this._changeQueued) this._changeQueued = triggerChangeEvent;
        if (!this._renderQueued) {
            this._renderQueued = true;
            requestAnimationFrame(()=>{
                // TODO add mechanism to allow component developer to have more control over
                // whether input vs. change events are emitted
                if (this._changeQueued) (0, $f314c6851ceb0f9e$export$635e15bbd66f01ea)(this, "change");
                this._changeQueued = false;
                this._renderQueued = false;
                this.render();
            });
        }
    }
    hydrate() {
        if (!this._hydrated) {
            this.initValue();
            const cloneElements = typeof this.content !== "function";
            const _content = typeof this.content === "function" ? this.content() : this.content;
            if (this.styleNode !== undefined) {
                const shadow = this.attachShadow({
                    mode: "open"
                });
                shadow.appendChild(this.styleNode);
                (0, $f314c6851ceb0f9e$export$6bb13967611cdb1)(shadow, _content, cloneElements);
            } else if (_content !== null) {
                const existingChildren = [
                    ...this.childNodes
                ];
                (0, $f314c6851ceb0f9e$export$6bb13967611cdb1)(this, _content, cloneElements);
                this.isSlotted = this.querySelector("slot,xin-slot") !== undefined;
                const slots = [
                    ...this.querySelectorAll("slot")
                ];
                if (slots.length > 0) slots.forEach($cd387b053feba574$var$XinSlot.replaceSlot);
                if (existingChildren.length > 0) {
                    const slotMap = {
                        "": this
                    };
                    [
                        ...this.querySelectorAll("xin-slot")
                    ].forEach((slot)=>{
                        slotMap[slot.name] = slot;
                    });
                    existingChildren.forEach((child)=>{
                        const defaultSlot = slotMap[""];
                        const destSlot = child instanceof Element ? slotMap[child.slot] : defaultSlot;
                        (destSlot !== undefined ? destSlot : defaultSlot).append(child);
                    });
                }
            }
            this._hydrated = true;
        }
    }
    render() {}
}
class $cd387b053feba574$var$XinSlot extends $cd387b053feba574$export$16fa2f45be04daa8 {
    static replaceSlot(slot) {
        const _slot = document.createElement("xin-slot");
        if (slot.name !== "") _slot.setAttribute("name", slot.name);
        slot.replaceWith(_slot);
    }
    constructor(){
        super();
        this.name = "";
        this.content = null;
        this.initAttributes("name");
    }
}
const $cd387b053feba574$export$a0751b4aa1961d4e = $cd387b053feba574$var$XinSlot.elementCreator({
    tag: "xin-slot"
});






const $4c651860c5272284$export$93b87f7746612069 = (test = ()=>true)=>{
    const savedState = localStorage.getItem("xin-state");
    if (savedState != null) {
        const state = JSON.parse(savedState);
        for (const key of Object.keys(state).filter(test))if ((0, $547f11326d897190$export$966034e6c6823eb0)[key] !== undefined) Object.assign((0, $547f11326d897190$export$966034e6c6823eb0)[key], state[key]);
        else (0, $547f11326d897190$export$966034e6c6823eb0)[key] = state[key];
    }
    const saveState = (0, $fb7e454a17657925$export$61fc7d43ac8f84b0)(()=>{
        const obj = {};
        const state = (0, $547f11326d897190$export$966034e6c6823eb0)[0, $e921b0bd4f6415ab$export$bdd0d039ad781534];
        for (const key of Object.keys(state).filter(test))obj[key] = state[key];
        localStorage.setItem("xin-state", JSON.stringify(obj));
        console.log("xin state saved to localStorage");
    }, 500);
    (0, $547f11326d897190$export$d1203567a167490e)(test, saveState);
};





var $222449ec3acb18f4$exports = {};

$parcel$export($222449ec3acb18f4$exports, "XinTest", () => $222449ec3acb18f4$export$e8658328209d5943);
$parcel$export($222449ec3acb18f4$exports, "xinTest", () => $222449ec3acb18f4$export$b1604b020b2ce76d);


const { span: $222449ec3acb18f4$var$span, slot: $222449ec3acb18f4$var$slot } = (0, $9e0c0b8784c80412$export$7a5d735b2ab6389d);
class $222449ec3acb18f4$export$e8658328209d5943 extends (0, $cd387b053feba574$export$16fa2f45be04daa8) {
    static delay(ms) {
        return new Promise((resolve)=>{
            setTimeout(resolve, ms);
        });
    }
    constructor(){
        super();
        this.test = ()=>true;
        this.delay = 0;
        this.statis = "";
        this.expect = true;
        this.styleNode = (0, $cd387b053feba574$export$16fa2f45be04daa8).StyleNode({
            ":host": {
                display: "flex",
                gap: "5px",
                alignItems: "center"
            },
            ':host [part="outcome"]': {
                display: "inline-block",
                borderRadius: "99px",
                padding: "0 12px",
                fontSize: "80%"
            },
            ":host .waiting": {
                background: "#ff04"
            },
            ":host .running": {
                background: "#f804"
            },
            ":host .success": {
                background: "#0f04"
            },
            ":host .failed": {
                background: "#f004"
            },
            ":host .exception": {
                color: "white",
                background: "red"
            }
        });
        this.content = [
            $222449ec3acb18f4$var$span({
                part: "description"
            }, $222449ec3acb18f4$var$slot()),
            $222449ec3acb18f4$var$span({
                part: "outcome"
            })
        ];
        this.run = ()=>{
            clearTimeout(this.timeout);
            this.status = "waiting";
            this.timeout = setTimeout(async ()=>{
                this.status = "running";
                try {
                    const outcome = JSON.stringify(await this.test());
                    if (outcome === JSON.stringify(this.expect)) this.status = "success";
                    else this.status = `failed: got ${outcome}, expected ${this.expect}`;
                } catch (err) {
                    this.status = `exception: ${err}`;
                }
            }, this.delay);
        };
        this.initAttributes("description", "delay", "status");
    }
    connectedCallback() {
        super.connectedCallback();
        this.run();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.class;
        clearTimeout(this.timeout);
    }
    render() {
        super.render();
        const { outcome: outcome } = this.parts;
        outcome.textContent = this.status;
        outcome.setAttribute("class", this.status.match(/\w+/)[0]);
    }
}
const $222449ec3acb18f4$export$b1604b020b2ce76d = $222449ec3acb18f4$export$e8658328209d5943.elementCreator({
    tag: "xin-test"
});




var $526cc5d62ff194fb$exports = {};



function $7bb234cc8fd49201$export$95a552d2395ab4c4(obj) {
    const registered = {};
    Object.keys(obj).forEach((key)=>{
        // eslint-disable-next-line
        (0, $547f11326d897190$export$966034e6c6823eb0)[key] = obj[key];
        registered[key] = (0, $547f11326d897190$export$966034e6c6823eb0)[key];
    });
    return registered;
}




export {$b5796eaeba5c782e$export$2385a24977818dd0 as bind, $b5796eaeba5c782e$export$af631764ddc44097 as on, $7d9f6326e1d5d994$export$97a1a3e6f39778d2 as bindings, $49cee7f7f866c751$export$dbf350e5966cf602 as css, $49cee7f7f866c751$export$808aaf1b460dc9af as darkMode, $49cee7f7f866c751$export$90d0ea046136e3ed as initVars, $49cee7f7f866c751$export$3cb96c9f6c8d16a4 as vars, $49cee7f7f866c751$export$75c0e6adb3e38f31 as varDefault, $72989831e95a2bab$export$892596cec99bc70e as Color, $cd387b053feba574$export$16fa2f45be04daa8 as Component, $9e0c0b8784c80412$export$7a5d735b2ab6389d as elements, $9e0c0b8784c80412$export$cf20112a1bc148da as svgElements, $9e0c0b8784c80412$export$8ec252cfdd664597 as mathML, $4c651860c5272284$export$93b87f7746612069 as hotReload, $e921b0bd4f6415ab$export$4c309843c07ce679 as getListItem, $e921b0bd4f6415ab$export$40700dafb97c3799 as xinPath, $e921b0bd4f6415ab$export$5dcba2d45033d435 as xinValue, $0e50e8a626908591$export$5e0dd9fd5d74e0c5 as MoreMath, $34b63e9d5b96494c$export$a5a6e0b888b2c992 as settings, $fb7e454a17657925$export$de363e709c412c8a as throttle, $fb7e454a17657925$export$61fc7d43ac8f84b0 as debounce, $547f11326d897190$export$966034e6c6823eb0 as xin, $547f11326d897190$export$d1203567a167490e as observe, $f0b099915f91bd21$export$23a2283368c55ea2 as unobserve, $f0b099915f91bd21$export$d0b7ea69ab6056df as touch, $f0b099915f91bd21$export$253d09664e30b967 as observerShouldBeRemoved, $f0b099915f91bd21$export$1c2919332513559b as updates, $7bb234cc8fd49201$export$95a552d2395ab4c4 as xinProxy, $222449ec3acb18f4$export$e8658328209d5943 as XinTest, $222449ec3acb18f4$export$b1604b020b2ce76d as xinTest};
//# sourceMappingURL=module.js.map
