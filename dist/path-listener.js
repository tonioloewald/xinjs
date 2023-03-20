import { xinPath } from './xin-types';
import { settings } from './settings';
export const observerShouldBeRemoved = Symbol('observer should be removed');
export const listeners = []; // { path_string_or_test, callback }
const touchedPaths = [];
let updateTriggered = false;
let updatePromise;
let resolveUpdate;
const getPath = (what) => {
    return typeof what === 'object' ? what[xinPath] : what;
};
export class Listener {
    description;
    test;
    callback;
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
export const updates = async () => {
    if (updatePromise === undefined) {
        console.log('updates, no waiting!');
        return;
    }
    await updatePromise;
};
const update = () => {
    if (settings.perf) {
        console.time('xin async update');
    }
    const paths = [...touchedPaths];
    console.log('update', paths);
    touchedPaths.splice(0);
    for (const path of paths) {
        listeners
            .filter(listener => {
            let heard;
            try {
                heard = listener.test(path);
                console.log({ heard, path });
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
    updateTriggered = false;
    if (typeof resolveUpdate === 'function') {
        resolveUpdate();
    }
    if (settings.perf) {
        console.timeEnd('xin async update');
    }
};
export const touch = (what) => {
    const path = getPath(what);
    if (updateTriggered === false) {
        updatePromise = new Promise(resolve => {
            resolveUpdate = resolve;
        });
        updateTriggered = setTimeout(update);
    }
    if (touchedPaths.find(touchedPath => path.startsWith(touchedPath)) == null) {
        touchedPaths.push(path);
        console.log('pushed', path, touchedPaths);
    }
};
export const observe = (test, callback) => {
    return new Listener(test, callback);
};
export const unobserve = (listener) => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
        listeners.splice(index, 1);
    }
    else {
        throw new Error('unobserve failed, listener not found');
    }
};
