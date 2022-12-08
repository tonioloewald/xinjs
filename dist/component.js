import { css } from './css';
import { deepClone } from './deep-clone';
import { appendContentToElement, dispatch, resizeObserver } from './dom';
import { elements, camelToKabob, kabobToCamel } from './elements';
export class Component extends HTMLElement {
    constructor() {
        super();
        this.content = elements.slot();
        this._changeQueued = false;
        this._renderQueued = false;
        this._hydrated = false;
        this.initAttributes('hidden');
        this._value = deepClone(this.defaultValue);
    }
    static StyleNode(styleSpec) {
        return elements.style(css(styleSpec));
    }
    static elementCreator(options) {
        if (this._elementCreator == null) {
            let desiredTag = options != null ? options.tag : null;
            if (desiredTag == null) {
                desiredTag = camelToKabob(this.name);
                if (desiredTag.startsWith('-')) {
                    desiredTag = desiredTag.substring(1);
                }
                if (!desiredTag.includes('-')) {
                    desiredTag += '-elt';
                }
            }
            let attempts = 0;
            while (this._elementCreator == null) {
                attempts += 1;
                const tag = attempts === 1 ? desiredTag : `${desiredTag}-${attempts}`;
                try {
                    window.customElements.define(tag, this, options);
                    this._elementCreator = elements[tag];
                }
                catch (e) {
                    throw new Error(`could not define ${this.name} as <${tag}>: ${String(e)}`);
                }
            }
        }
        return this._elementCreator;
    }
    initAttributes(...attributeNames) {
        const attributes = {};
        const attributeValues = {};
        const observer = new MutationObserver((mutationsList) => {
            let triggerRender = false;
            mutationsList.forEach((mutation) => {
                // eslint-disable-next-line
                triggerRender = !!(mutation.attributeName && attributeNames.includes(kabobToCamel(mutation.attributeName)));
            });
            if (triggerRender && this.queueRender !== undefined)
                this.queueRender(false);
        });
        observer.observe(this, { attributes: true });
        attributeNames.forEach(attributeName => {
            attributes[attributeName] = deepClone(this[attributeName]);
            const attributeKabob = camelToKabob(attributeName);
            Object.defineProperty(this, attributeName, {
                enumerable: false,
                get() {
                    if (typeof attributes[attributeName] === 'boolean') {
                        return this.hasAttribute(attributeKabob);
                    }
                    else {
                        // eslint-disable-next-line
                        if (this.hasAttribute(attributeKabob)) {
                            return typeof attributes[attributeName] === 'number'
                                ? parseFloat(this.getAttribute(attributeKabob))
                                : this.getAttribute(attributeKabob);
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
                                this.setAttribute(attributeKabob, '');
                            }
                            else {
                                this.removeAttribute(attributeKabob);
                            }
                            this.queueRender();
                        }
                    }
                    else if (typeof attributes[attributeName] === 'number') {
                        if (value !== parseFloat(this[attributeName])) {
                            this.setAttribute(attributeKabob, value);
                            this.queueRender();
                        }
                    }
                    else {
                        if (typeof value === 'object' || `${value}` !== `${this[attributeName]}`) {
                            if (value === null || value === undefined || typeof value === 'object') {
                                this.removeAttribute(attributeKabob);
                            }
                            else {
                                this.setAttribute(attributeKabob, value);
                            }
                            this.queueRender();
                            // @ts-expect-error
                            attributeValues[attributeName] = value;
                        }
                    }
                }
            });
        });
    }
    initValue() {
        const valueDescriptor = Object.getOwnPropertyDescriptor(this, 'value');
        if (valueDescriptor === undefined || valueDescriptor.get !== undefined || valueDescriptor.set !== undefined) {
            return;
        }
        let value = this.hasAttribute('value') ? this.getAttribute('value') : deepClone(this.value);
        delete this.value;
        Object.defineProperty(this, 'value', {
            enumerable: false,
            get() {
                return value;
            },
            set(newValue) {
                if (value !== newValue) {
                    value = newValue;
                    this.queueRender(true);
                }
            }
        });
    }
    get refs() {
        const root = this.shadowRoot != null ? this.shadowRoot : this;
        if (this._refs == null) {
            this._refs = new Proxy({}, {
                get(target, ref) {
                    if (target[ref] === undefined) {
                        let element = root.querySelector(`[data-ref="${ref}"]`);
                        if (element == null) {
                            element = root.querySelector(ref);
                        }
                        if (element == null)
                            throw new Error(`elementRef "${ref}" does not exist!`);
                        element.removeAttribute('data-ref');
                        target[ref] = element;
                    }
                    return target[ref];
                }
            });
        }
        return this._refs;
    }
    connectedCallback() {
        this.hydrate();
        // super annoyingly, chrome loses its shit if you set *any* attributes in the constructor
        if (this.role != null)
            this.setAttribute('role', this.role);
        if (this.onResize !== undefined) {
            resizeObserver.observe(this);
            if (this._onResize == null) {
                this._onResize = this.onResize.bind(this);
            }
            this.addEventListener('resize', this._onResize);
        }
        if (this.value != null && this.getAttribute('value') != null) {
            this._value = this.getAttribute('value');
        }
    }
    disconnectedCallback() {
        resizeObserver.unobserve(this);
    }
    queueRender(triggerChangeEvent = false) {
        if (!this._changeQueued)
            this._changeQueued = triggerChangeEvent;
        if (!this._renderQueued) {
            this._renderQueued = true;
            requestAnimationFrame(() => {
                // TODO add mechanism to allow component developer to have more control over
                // whether input vs. change events are emitted
                if (this._changeQueued)
                    dispatch(this, 'change');
                this._changeQueued = false;
                this._renderQueued = false;
                this.render();
            });
        }
    }
    hydrate() {
        if (!this._hydrated) {
            this.initValue();
            if (this.styleNode !== undefined) {
                const shadow = this.attachShadow({ mode: 'open' });
                shadow.appendChild(this.styleNode);
                appendContentToElement(shadow, this.content);
            }
            else {
                appendContentToElement(this, this.content);
            }
            this._hydrated = true;
        }
    }
    render() {
        this.hydrate();
    }
}
Component.elements = elements;
