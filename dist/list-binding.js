var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _ListBinding_instances, _ListBinding_array, _ListBinding_update, _ListBinding_previouseSlice, _ListBinding_visibleSlice;
import { settings } from './settings';
import { resizeObserver } from './dom';
import { throttle } from './throttle';
import { xin, xinValue, xinPath } from './xin';
import { cloneWithBindings, elementToItem, elementToBindings, BOUND_SELECTOR } from './metadata';
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
export const getListBinding = (boundElement, options) => {
    let listBinding = boundElement[listBindingRef];
    if (listBinding == null) {
        listBinding = new ListBinding(boundElement, options);
        boundElement[listBindingRef] = listBinding;
    }
    return listBinding;
};
