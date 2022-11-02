import { xin, observe, observerShouldBeRemoved } from './xin';
import { throttle } from './throttle';
export const bind = (element, what, binding, options) => {
    const { toDOM, fromDOM } = binding;
    if (!what || (typeof what === 'object' && !what._xinPath)) {
        throw new Error('bind requires a path or object with xin Proxy');
    }
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
        element.addEventListener('input', throttle(() => {
            xin[path] = fromDOM(element);
        }, 500));
        element.addEventListener('change', () => {
            xin[path] = fromDOM(element);
        });
    }
    return element;
};
