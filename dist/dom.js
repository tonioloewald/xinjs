import { cloneWithBindings } from './metadata';
export const dispatch = (target, type) => {
    const event = new Event(type);
    target.dispatchEvent(event);
};
/* global ResizeObserver */
export const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const element = entry.target;
        dispatch(element, 'resize');
    }
});
export const appendContentToElement = (elt, content) => {
    if (elt != null && content != null) {
        if (typeof content === 'string') {
            elt.textContent = content;
        }
        else if (Array.isArray(content)) {
            content.forEach(node => {
                elt.append(node instanceof Node ? cloneWithBindings(node) : node);
            });
        }
        else if (content instanceof HTMLElement) {
            elt.append(cloneWithBindings(content));
        }
        else {
            throw new Error('expect text content or document node');
        }
    }
};
