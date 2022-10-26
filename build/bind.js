import { xin, observe, observerShouldBeRemoved } from './xin';
export const bindings = {
    value: {
        toDOM(element, value, options) {
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
    }
};
export const bind = (element, what, binding, options) => {
    const { toDOM, fromDOM } = binding;
    const path = typeof what === 'string' ? what : what._xinPath;
    if (toDOM) {
        toDOM(element, xin[path]);
        observe(path, () => {
            if (!element.closest('body')) {
                return observerShouldBeRemoved;
            }
            const value = xin[path];
            if (typeof value === 'object' || !fromDOM || fromDOM(element) !== value) {
                toDOM(element, value);
            }
        });
    }
    if (fromDOM) {
        element.addEventListener('input', () => {
            xin[path] = fromDOM(element);
        });
    }
};
