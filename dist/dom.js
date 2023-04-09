import { cloneWithBindings } from './metadata';
export const dispatch = (target, type) => {
    const event = new Event(type);
    target.dispatchEvent(event);
};
const valueType = (element) => {
    if (element instanceof HTMLInputElement) {
        return element.type;
    }
    else if (element instanceof HTMLSelectElement && element.hasAttribute('multiple')) {
        return 'multi-select';
    }
    else {
        return 'other';
    }
};
export const setValue = (element, newValue) => {
    switch (valueType(element)) {
        case 'radio':
            // @ts-expect-error
            element.checked = element.value === newValue;
            break;
        case 'checkbox':
            // @ts-expect-error
            element.checked = newValue;
            break;
        case 'date':
            // @ts-expect-error
            element.valueAsDate = new Date(newValue);
            break;
        case 'multi-select':
            for (const option of [...element.querySelectorAll('option')]) {
                option.selected = newValue[option.value];
            }
            break;
        default:
            // @ts-expect-error
            element.value = newValue;
    }
};
export const getValue = (element) => {
    switch (valueType(element)) {
        case 'radio':
            {
                const radio = element.parentElement?.querySelector(`[name="${element.name}"]:checked`);
                return radio != null ? radio.value : null;
            }
        case 'checkbox':
            // @ts-expect-error
            return element.checked;
        case 'date':
            // @ts-expect-error
            return element.valueAsDate.toISOString();
        case 'multi-select':
            return [...element.querySelectorAll('option')]
                .reduce((map, option) => {
                map[option.value] = option.selected;
                return map;
            }, {});
        default:
            return element.value;
    }
};
/* global ResizeObserver */
const { ResizeObserver } = globalThis;
export const resizeObserver = ResizeObserver != null
    ? new ResizeObserver(entries => {
        for (const entry of entries) {
            const element = entry.target;
            dispatch(element, 'resize');
        }
    })
    : {
        observe() { },
        unobserve() { }
    };
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
