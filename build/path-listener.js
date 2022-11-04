import { settings } from './settings';
export const observerShouldBeRemoved = Symbol('observer should be removed');
export const listeners = []; // { path_string_or_test, callback }
const touchedPaths = [];
let updateTriggered = false;
let updatePromise;
let resolveUpdate;
const getPath = (what) => {
    return typeof what === 'object' ? what._xinPath : what;
};
export class Listener {
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
        if (typeof callback === 'function') {
            this.callback = callback;
        }
        else {
            throw new Error('expect callback to be a path or function');
        }
        listeners.push(this);
    }
}
export const updates = async () => {
    if (!updatePromise) {
        return;
    }
    await updatePromise;
};
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
    if (settings.perf) {
        console.timeEnd('xin async update');
    }
};
export const touch = (what) => {
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
export const observe = (test, callback) => {
    return new Listener(test, callback);
};
export const unobserve = (listener) => {
    let index;
    const found = false;
    index = listeners.indexOf(listener);
    if (index > -1) {
        listeners.splice(index, 1);
    }
    else {
        throw new Error('unobserve failed, listener not found');
    }
    return found;
};
