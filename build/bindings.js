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
