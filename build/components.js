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
    if (content != null) {
        if (typeof content === 'string') {
            elt.textContent = content;
        }
        else if (Array.isArray(content)) {
            content.forEach(node => {
                // @ts-expect-error-error
                elt.appendChild(node instanceof HTMLElement ? node.cloneNode(true) : node);
            });
        }
        else if (content instanceof HTMLElement) {
            elt.appendChild(content.cloneNode(true));
        }
        else {
            throw new Error('expect text content or document node');
        }
    }
};
const hyphenated = (s) => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
const css = (obj) => {
    const selectors = Object.keys(obj).map((selector) => {
        const body = obj[selector];
        const rule = Object.keys(body)
            .map((prop) => `  ${hyphenated(prop)}: ${body[prop]};`)
            .join('\n');
        return `${selector} {\n${rule}\n}`;
    });
    return selectors.join('\n\n');
};
const defaultSpec = {
    superClass: HTMLElement,
    methods: {},
    eventHandlers: {},
    props: {},
    attributes: {},
    content: elements.slot()
};
export const makeWebComponent = (tagName, spec) => {
    const { superClass, style, methods, eventHandlers, props, attributes, content, role } = Object.assign({}, defaultSpec, spec);
    let styleNode;
    if (style !== undefined) {
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
            // eslint-disable-next-line
            const self = this;
            this.elementRefs = new Proxy({}, {
                get(target, ref) {
                    if (target[ref] === undefined) {
                        const element = (self.shadowRoot != null) ? self.shadowRoot.querySelector(`[data-ref="${ref}"]`) : self.querySelector(`[data-ref="${ref}"]`);
                        if (element == null)
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
            if (styleNode !== undefined) {
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
            if (eventHandlers.childListChange !== undefined) {
                // @ts-expect-error
                const observer = new MutationObserver(eventHandlers.childListChange.bind(this));
                observer.observe(this, { childList: true });
            }
            const attributeNames = Object.keys(attributes);
            if (attributeNames.length > 0) {
                const attributeValues = {};
                const observer = new MutationObserver((mutationsList) => {
                    let triggerRender = false;
                    mutationsList.forEach((mutation) => {
                        // eslint-disable-next-line
                        triggerRender = !!(mutation.attributeName && attributeNames.includes(mutation.attributeName));
                    });
                    if (triggerRender && this.queueRender !== undefined)
                        this.queueRender(false);
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
                                // eslint-disable-next-line
                                if (this.hasAttribute(attributeName)) {
                                    return typeof attributes[attributeName] === 'number'
                                        ? parseFloat(this.getAttribute(attributeName))
                                        : this.getAttribute(attributeName);
                                    // @ts-expect-error
                                }
                                else if (attributeValues[attributeName] !== undefined) {
                                    // @ts-expect-error
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
                                    // eslint-disable-next-line
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
                                    // @ts-expect-error
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
            if (this.render === undefined) {
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
                    this.render();
                });
            }
        }
        connectedCallback() {
            // super annoyingly, chrome loses its shit if you set *any* attributes in the constructor
            if (role !== undefined && role !== '')
                this.setAttribute('role', role);
            if (eventHandlers.resize !== undefined) {
                resizeObserver.observe(this);
            }
            if (Object.prototype.hasOwnProperty.call(props, 'value')) {
                this.value = this.getAttribute('value') ?? null;
            }
            if (spec.connectedCallback != null)
                spec.connectedCallback.call(this);
        }
        disconnectedCallback() {
            resizeObserver.unobserve(this);
            if (spec.disconnectedCallback != null)
                spec.disconnectedCallback.call(this);
        }
        render() {
            if (spec.render != null)
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
    if (window.customElements !== undefined)
        window.customElements.define(tagName, componentClass);
    return elements[tagName];
};
