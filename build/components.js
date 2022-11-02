import { elements } from './elements';
const dispatch = (target, type) => {
    const event = new Event(type);
    target.dispatchEvent(event);
};
/* global ResizeObserver */
const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const element = entry.target;
        dispatch(element, 'resize');
    }
});
const appendContentToElement = (elt, content) => {
    if (content) {
        if (typeof content === 'string') {
            elt.textContent = content;
        }
        else if (Array.isArray(content)) {
            content.forEach(node => {
                elt.appendChild(node.cloneNode ? node.cloneNode(true) : node);
            });
        }
        else if (content.cloneNode) {
            elt.appendChild(content.cloneNode(true));
        }
        else {
            throw new Error('expect text content or document node');
        }
    }
};
const hyphenated = (s) => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
const css = (obj) => {
    if (typeof obj === 'object') {
        const selectors = Object.keys(obj).map((selector) => {
            const body = obj[selector];
            const rule = Object.keys(body)
                .map((prop) => `  ${hyphenated(prop)}: ${body[prop]};`)
                .join('\n');
            return `${selector} {\n${rule}\n}`;
        });
        return selectors.join('\n\n');
    }
    else {
        return obj;
    }
};
const defaultSpec = {
    superClass: HTMLElement,
    style: {},
    methods: {},
    eventHandlers: {},
    props: {},
    attributes: {},
    content: elements.slot(),
};
export const makeWebComponent = (tagName, spec) => {
    let { superClass, style, methods, eventHandlers, props, attributes, content, role } = Object.assign({}, defaultSpec, spec);
    let styleNode;
    if (style) {
        const styleText = css(Object.assign({ ':host([hidden])': { display: 'none !important' } }, style));
        styleNode = elements.style(styleText);
    }
    const componentClass = class extends superClass {
        constructor() {
            super();
            this._changeQueued = false;
            this._renderQueued = false;
            for (const prop of Object.keys(props)) {
                let value = props[prop];
                if (typeof value !== 'function') {
                    Object.defineProperty(this, prop, {
                        enumerable: false,
                        get() {
                            return value;
                        },
                        set(x) {
                            if (x !== value) {
                                value = x;
                                if (prop === 'value') {
                                    this.value = x;
                                }
                                this.queueRender(true);
                            }
                        }
                    });
                }
                else {
                    Object.defineProperty(this, prop, {
                        enumerable: false,
                        get() {
                            return value.call(this);
                        },
                        set(x) {
                            if (value.length === 1) {
                                value.call(this, x);
                            }
                            else {
                                throw new Error(`cannot set ${prop}, it is read-only`);
                            }
                        }
                    });
                }
            }
            const self = this;
            this.elementRefs = new Proxy({}, {
                get(target, ref) {
                    if (!target[ref]) {
                        const element = self.shadowRoot ? self.shadowRoot.querySelector(`[data-ref="${ref}"]`) : self.querySelector(`[data-ref="${ref}"]`);
                        if (!element)
                            throw new Error(`elementRef "${ref}" does not exist!`);
                        element.removeAttribute('data-ref');
                        target[ref] = element;
                    }
                    return target[ref];
                },
                set() {
                    throw new Error('elementRefs is read-only');
                }
            });
            if (styleNode) {
                const shadow = this.attachShadow({ mode: 'open' });
                shadow.appendChild(styleNode.cloneNode(true));
                appendContentToElement(shadow, content);
            }
            else {
                appendContentToElement(this, content);
            }
            Object.keys(eventHandlers).forEach(eventType => {
                const passive = eventType.startsWith('touch') ? { passive: true } : false;
                this.addEventListener(eventType, eventHandlers[eventType].bind(this), passive);
            });
            if (eventHandlers.childListChange) {
                // @ts-expect-error
                const observer = new MutationObserver(eventHandlers.childListChange.bind(this));
                observer.observe(this, { childList: true });
            }
            const attributeNames = Object.keys(attributes);
            if (attributeNames.length) {
                const attributeValues = {};
                const observer = new MutationObserver((mutationsList) => {
                    let triggerChange = false;
                    let triggerRender = false;
                    mutationsList.forEach((mutation) => {
                        triggerChange = mutation.attributeName === 'value';
                        triggerRender = triggerChange || !!(mutation.attributeName && attributeNames.includes(mutation.attributeName));
                    });
                    if (triggerRender && this.queueRender)
                        this.queueRender(triggerChange);
                });
                observer.observe(this, { attributes: true });
                attributeNames.forEach(attributeName => {
                    Object.defineProperty(this, attributeName, {
                        enumerable: false,
                        get() {
                            if (typeof attributes[attributeName] === 'boolean') {
                                return this.hasAttribute(attributeName);
                            }
                            else {
                                if (this.hasAttribute(attributeName)) {
                                    return typeof attributes[attributeName] === 'number'
                                        ? parseFloat(this.getAttribute(attributeName))
                                        : this.getAttribute(attributeName);
                                    // @ts-ignore-error
                                }
                                else if (attributeValues[attributeName] !== undefined) {
                                    // @ts-ignore-error
                                    return attributeValues[attributeName];
                                }
                                else {
                                    return attributes[attributeName];
                                }
                            }
                        },
                        set(value) {
                            if (typeof attributes[attributeName] === 'boolean') {
                                if (value !== this[attributeName]) {
                                    if (value) {
                                        this.setAttribute(attributeName, '');
                                    }
                                    else {
                                        this.removeAttribute(attributeName);
                                    }
                                }
                            }
                            else if (typeof attributes[attributeName] === 'number') {
                                if (value !== parseFloat(this[attributeName])) {
                                    this.setAttribute(attributeName, value);
                                }
                            }
                            else {
                                if (typeof value === 'object' || `${value}` !== `${this[attributeName]}`) {
                                    if (value === null || value === undefined || typeof value === 'object') {
                                        this.removeAttribute(attributeName);
                                    }
                                    else {
                                        this.setAttribute(attributeName, value);
                                    }
                                    // @ts-ignore-error
                                    attributeValues[attributeName] = value;
                                }
                            }
                        }
                    });
                });
            }
            this.queueRender();
        }
        queueRender(change = false) {
            // @ts-ignore-error
            if (!this.render) {
                return;
            }
            if (!this._changeQueued)
                this._changeQueued = change;
            if (!this._renderQueued) {
                this._renderQueued = true;
                requestAnimationFrame(() => {
                    if (this._changeQueued)
                        dispatch(this, 'change');
                    this._changeQueued = false;
                    this._renderQueued = false;
                    // @ts-ignore-error
                    this.render();
                });
            }
        }
        connectedCallback() {
            // super annoyingly, chrome loses its shit if you set *any* attributes in the constructor
            if (role)
                this.setAttribute('role', role);
            if (eventHandlers.resize) {
                resizeObserver.observe(this);
            }
            if (props.hasOwnProperty('value')) {
                this.value = this.getAttribute('value') || null;
            }
            if (spec.connectedCallback)
                spec.connectedCallback.call(this);
        }
        disconnectedCallback() {
            resizeObserver.unobserve(this);
            if (spec.disconnectedCallback)
                spec.disconnectedCallback.call(this);
        }
        render() {
            if (spec.render)
                spec.render.call(this);
        }
        static defaultAttributes() {
            return { ...attributes };
        }
    };
    Object.keys(methods).forEach(methodName => {
        // @ts-expect-error
        componentClass.prototype[methodName] = methods[methodName];
    });
    // if-statement is to prevent some node-based "browser" tests from breaking
    if (window.customElements)
        window.customElements.define(tagName, componentClass);
    return elements[tagName];
};
