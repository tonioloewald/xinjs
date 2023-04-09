import { getListBinding } from './list-binding';
import { getValue, setValue } from './dom';
export const bindings = {
    value: {
        toDOM(element, value) {
            setValue(element, value);
        },
        fromDOM(element) {
            return getValue(element);
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
