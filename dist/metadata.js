import { deepClone } from './deep-clone';
export const BOUND_CLASS = '-xin-data';
export const BOUND_SELECTOR = `.${BOUND_CLASS}`;
export const EVENT_CLASS = '-xin-event';
export const EVENT_SELECTOR = `.${EVENT_CLASS}`;
export const elementToHandlers = new WeakMap();
export const elementToBindings = new WeakMap();
export const getElementBindings = (element) => {
    return {
        eventBindings: elementToHandlers.get(element),
        dataBindings: elementToBindings.get(element)
    };
};
export const cloneWithBindings = (element) => {
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
export const elementToItem = new WeakMap();
export const getListItem = (element) => {
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
