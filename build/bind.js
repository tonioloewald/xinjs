import { xin, observe, observerShouldBeRemoved } from './xin';
import { getListBinding } from './list-binding';
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
    },
    list: {
        toDOM(element, value, options) {
            console.log({ options });
            const { bindInstance } = options || {};
            const listBinding = getListBinding(element, bindInstance);
            // @ts-expect-error
            listBinding.update(value._xinValue || value);
        }
    }
};
export const bind = (element, what, binding, options) => {
    const { toDOM, fromDOM } = binding;
    const path = typeof what === 'string' ? what : what._xinPath;
    if (toDOM) {
        toDOM(element, xin[path], options);
        observe(path, () => {
            if (!element.closest('body')) {
                return observerShouldBeRemoved;
            }
            const value = xin[path];
            if (typeof value === 'object' || !fromDOM || fromDOM(element) !== value) {
                toDOM(element, value, options);
            }
        });
    }
    if (fromDOM) {
        element.addEventListener('input', () => {
            xin[path] = fromDOM(element);
        });
    }
};
