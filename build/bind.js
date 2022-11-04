import { xin, touch, observe, observerShouldBeRemoved } from './xin';
import { throttle } from './throttle';
export const bind = (element, what, binding, options) => {
    const { toDOM, fromDOM } = binding;
    // eslint-disable-next-line
    if (typeof what !== 'string' && what !== null && typeof what === 'object' && !what._xinPath) {
        throw new Error('bind requires a path or object with xin Proxy');
    }
    const path = typeof what === 'string' ? what : what._xinPath;
    if (toDOM != null) {
        // toDOM(element, xin[path], options)
        touch(path);
        observe(path, () => {
            if (element.closest('body') == null) {
                return observerShouldBeRemoved;
            }
            const value = xin[path];
            if (typeof value === 'object' || (fromDOM == null) || fromDOM(element) !== value) {
                toDOM(element, value, options);
            }
        });
    }
    if (fromDOM != null) {
        const updateXin = () => {
            const value = fromDOM(element);
            if (value !== undefined && value !== null) {
                xin[path] = value;
            }
        };
        element.addEventListener('input', throttle(updateXin, 500));
        element.addEventListener('change', updateXin);
    }
    return element;
};
