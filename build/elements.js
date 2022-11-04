import { bind } from './bind';
import { bindings } from './bindings';
const templates = {};
export const create = (tagType, ...contents) => {
    if (templates[tagType] === undefined) {
        templates[tagType] = document.createElement(tagType);
    }
    const elt = templates[tagType].cloneNode();
    for (const item of contents) {
        if (item instanceof HTMLElement || typeof item === 'string' || typeof item === 'number') {
            if (elt instanceof HTMLTemplateElement) {
                elt.content.append(item);
            }
            else {
                elt.append(item);
            }
        }
        else {
            for (const key of Object.keys(item)) {
                const value = item[key];
                if (key === 'apply') {
                    value(elt);
                }
                else if (key === 'style') {
                    if (typeof value === 'object') {
                        for (const prop of Object.keys(value)) {
                            if (prop.startsWith('--')) {
                                elt.style.setProperty(prop, value[prop]);
                            }
                            else {
                                // @ts-expect-error
                                elt.style[prop] = value[prop];
                            }
                        }
                    }
                    else {
                        elt.setAttribute('style', value);
                    }
                }
                else if (key.match(/^on[A-Z]/) != null) {
                    const eventType = key.substr(2).toLowerCase();
                    elt.addEventListener(eventType, value);
                }
                else if (key.match(/^bind[A-Z]/) != null) {
                    const bindingType = key.substr(4).toLowerCase();
                    const binding = bindings[bindingType];
                    if (binding !== undefined) {
                        bind(elt, value, binding);
                    }
                    else {
                        throw new Error(`${key} is not allowed, bindings.${bindingType} is not defined`);
                    }
                }
                else {
                    const attr = key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
                    if (typeof value === 'boolean') {
                        value ? elt.setAttribute(attr, '') : elt.removeAttribute(attr);
                    }
                    else {
                        elt.setAttribute(attr, value);
                    }
                }
            }
        }
    }
    return elt;
};
const fragment = (...contents) => {
    const frag = document.createDocumentFragment();
    for (const item of contents) {
        frag.append(item);
    }
    return frag;
};
const _elements = { fragment };
export const elements = new Proxy(_elements, {
    get(target, tagName) {
        tagName = tagName.replace(/[A-Z]/g, c => `-${c.toLocaleLowerCase()}`);
        if (tagName.match(/^\w+(-\w+)*$/) == null) {
            throw new Error(`${tagName} does not appear to be a valid element tagName`);
        }
        else if (target[tagName] === undefined) {
            target[tagName] = (...contents) => create(tagName, ...contents);
        }
        return target[tagName];
    },
    set() {
        throw new Error('You may not add new properties to elements');
    }
});
