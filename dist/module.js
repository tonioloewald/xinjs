
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

      var $parcel$global = globalThis;
    
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequire94c2"];

if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequire94c2"] = parcelRequire;
}

var parcelRegister = parcelRequire.register;
parcelRegister("3x0mh", function(module, exports) {

$parcel$export(module.exports, "Blueprint", () => Blueprint);
$parcel$export(module.exports, "blueprint", () => blueprint);
$parcel$export(module.exports, "BlueprintLoader", () => BlueprintLoader);
$parcel$export(module.exports, "blueprintLoader", () => blueprintLoader);

var $aVpVG = parcelRequire("aVpVG");

var $lGBgM = parcelRequire("lGBgM");
class Blueprint extends (0, $aVpVG.Component) {
    async packaged() {
        if (!this.loaded) {
            const { tag, src } = this;
            const imported = await eval(`import('${src}')`);
            const blueprint = imported[this.property];
            this.loaded = (0, $lGBgM.makeComponent)(tag, blueprint);
        }
        return this.loaded;
    }
    constructor(){
        super(), this.tag = 'anon-elt', this.src = '', this.property = 'default';
        this.initAttributes('tag', 'src', 'property');
    }
}
const blueprint = Blueprint.elementCreator({
    tag: 'xin-blueprint',
    styleSpec: {
        ':host': {
            display: 'none'
        }
    }
});
class BlueprintLoader extends (0, $aVpVG.Component) {
    constructor(){
        super();
    }
    async load() {
        const blueprintElements = [
            ...this.querySelectorAll(Blueprint.tagName)
        ].filter((elt)=>elt.src);
        const promises = blueprintElements.map((elt)=>elt.packaged());
        await Promise.all(promises);
    }
    connectedCallback() {
        super.connectedCallback();
        this.load();
    }
}
const blueprintLoader = BlueprintLoader.elementCreator({
    tag: 'xin-loader',
    styleSpec: {
        ':host': {
            display: 'none'
        }
    }
});

});
parcelRegister("aVpVG", function(module, exports) {

$parcel$export(module.exports, "Component", () => $cd387b053feba574$export$16fa2f45be04daa8);

var $2okor = parcelRequire("2okor");

var $19FSF = parcelRequire("19FSF");

var $gbrAN = parcelRequire("gbrAN");

var $9sLMf = parcelRequire("9sLMf");

var $5JLBr = parcelRequire("5JLBr");
let $cd387b053feba574$var$anonymousElementCount = 0;
function $cd387b053feba574$var$anonElementTag() {
    return `custom-elt${($cd387b053feba574$var$anonymousElementCount++).toString(36)}`;
}
let $cd387b053feba574$var$instanceCount = 0;
const $cd387b053feba574$var$globalStyleSheets = {};
function $cd387b053feba574$var$setGlobalStyle(tagName, styleSpec) {
    const existing = $cd387b053feba574$var$globalStyleSheets[tagName];
    const processed = (0, $2okor.css)(styleSpec).replace(/:host\b/g, tagName);
    $cd387b053feba574$var$globalStyleSheets[tagName] = existing ? existing + '\n' + processed : processed;
}
function $cd387b053feba574$var$insertGlobalStyles(tagName) {
    if ($cd387b053feba574$var$globalStyleSheets[tagName]) document.head.append((0, $9sLMf.elements).style({
        id: tagName + '-component'
    }, $cd387b053feba574$var$globalStyleSheets[tagName]));
    delete $cd387b053feba574$var$globalStyleSheets[tagName];
}
class $cd387b053feba574$export$16fa2f45be04daa8 extends HTMLElement {
    static{
        this.elements = (0, $9sLMf.elements);
    }
    static{
        this.globalStyleSheets = [];
    }
    static{
        this._tagName = null;
    }
    static get tagName() {
        return this._tagName;
    }
    static StyleNode(styleSpec) {
        console.warn('StyleNode is deprecated, just assign static styleSpec: XinStyleSheet to the class directly');
        return (0, $9sLMf.elements).style((0, $2okor.css)(styleSpec));
    }
    static elementCreator(options = {}) {
        if (this._elementCreator == null) {
            const { tag: tag, styleSpec: styleSpec } = options;
            let tagName = options != null ? tag : null;
            if (tagName == null) {
                if (typeof this.name === 'string' && this.name !== '') {
                    tagName = (0, $5JLBr.camelToKabob)(this.name);
                    if (tagName.startsWith('-')) tagName = tagName.slice(1);
                } else tagName = $cd387b053feba574$var$anonElementTag();
            }
            if (customElements.get(tagName) != null) console.warn(`${tagName} is already defined`);
            if (tagName.match(/\w+(-\w+)+/) == null) {
                console.warn(`${tagName} is not a legal tag for a custom-element`);
                tagName = $cd387b053feba574$var$anonElementTag();
            }
            while(customElements.get(tagName) !== undefined)tagName = $cd387b053feba574$var$anonElementTag();
            this._tagName = tagName;
            if (styleSpec !== undefined) $cd387b053feba574$var$setGlobalStyle(tagName, styleSpec);
            window.customElements.define(tagName, this, options);
            this._elementCreator = (0, $9sLMf.elements)[tagName];
        }
        return this._elementCreator;
    }
    initAttributes(...attributeNames) {
        const attributes = {};
        const attributeValues = {};
        const observer = new MutationObserver((mutationsList)=>{
            let triggerRender = false;
            mutationsList.forEach((mutation)=>{
                triggerRender = !!(mutation.attributeName && attributeNames.includes((0, $5JLBr.kabobToCamel)(mutation.attributeName)));
            });
            if (triggerRender && this.queueRender !== undefined) this.queueRender(false);
        });
        observer.observe(this, {
            attributes: true
        });
        attributeNames.forEach((attributeName)=>{
            attributes[attributeName] = (0, $19FSF.deepClone)(this[attributeName]);
            const attributeKabob = (0, $5JLBr.camelToKabob)(attributeName);
            Object.defineProperty(this, attributeName, {
                enumerable: false,
                get () {
                    if (typeof attributes[attributeName] === 'boolean') return this.hasAttribute(attributeKabob);
                    else {
                        if (this.hasAttribute(attributeKabob)) return typeof attributes[attributeName] === 'number' ? parseFloat(this.getAttribute(attributeKabob)) : this.getAttribute(attributeKabob);
                        else if (attributeValues[attributeName] !== undefined) return attributeValues[attributeName];
                        else return attributes[attributeName];
                    }
                },
                set (value) {
                    if (typeof attributes[attributeName] === 'boolean') {
                        if (value !== this[attributeName]) {
                            if (value) this.setAttribute(attributeKabob, '');
                            else this.removeAttribute(attributeKabob);
                            this.queueRender();
                        }
                    } else if (typeof attributes[attributeName] === 'number') {
                        if (value !== parseFloat(this[attributeName])) {
                            this.setAttribute(attributeKabob, value);
                            this.queueRender();
                        }
                    } else if (typeof value === 'object' || `${value}` !== `${this[attributeName]}`) {
                        if (value === null || value === undefined || typeof value === 'object') this.removeAttribute(attributeKabob);
                        else this.setAttribute(attributeKabob, value);
                        this.queueRender();
                        attributeValues[attributeName] = value;
                    }
                }
            });
        });
    }
    initValue() {
        const valueDescriptor = Object.getOwnPropertyDescriptor(this, 'value');
        if (valueDescriptor === undefined || valueDescriptor.get !== undefined || valueDescriptor.set !== undefined) return;
        let value = this.hasAttribute('value') ? this.getAttribute('value') : (0, $19FSF.deepClone)(this.value);
        delete this.value;
        Object.defineProperty(this, 'value', {
            enumerable: false,
            get () {
                return value;
            },
            set (newValue) {
                if (value !== newValue) {
                    value = newValue;
                    this.queueRender(true);
                }
            }
        });
    }
    get parts() {
        const root = this.shadowRoot != null ? this.shadowRoot : this;
        if (this._parts == null) this._parts = new Proxy({}, {
            get (target, ref) {
                if (target[ref] === undefined) {
                    let element = root.querySelector(`[part="${ref}"]`);
                    if (element == null) element = root.querySelector(ref);
                    if (element == null) throw new Error(`elementRef "${ref}" does not exist!`);
                    element.removeAttribute('data-ref');
                    target[ref] = element;
                }
                return target[ref];
            }
        });
        return this._parts;
    }
    constructor(){
        super(), this.content = (0, $9sLMf.elements).slot(), this._changeQueued = false, this._renderQueued = false, this._hydrated = false;
        $cd387b053feba574$var$instanceCount += 1;
        this.initAttributes('hidden');
        this.instanceId = `${this.tagName.toLocaleLowerCase()}-${$cd387b053feba574$var$instanceCount}`;
        this._value = (0, $19FSF.deepClone)(this.defaultValue);
    }
    connectedCallback() {
        $cd387b053feba574$var$insertGlobalStyles(this.constructor.tagName);
        this.hydrate();
        // super annoyingly, chrome loses its shit if you set *any* attributes in the constructor
        if (this.role != null) this.setAttribute('role', this.role);
        if (this.onResize !== undefined) {
            (0, $gbrAN.resizeObserver).observe(this);
            if (this._onResize == null) this._onResize = this.onResize.bind(this);
            this.addEventListener('resize', this._onResize);
        }
        if (this.value != null && this.getAttribute('value') != null) this._value = this.getAttribute('value');
        this.queueRender();
    }
    disconnectedCallback() {
        (0, $gbrAN.resizeObserver).unobserve(this);
    }
    queueRender(triggerChangeEvent = false) {
        if (!this._hydrated) return;
        if (!this._changeQueued) this._changeQueued = triggerChangeEvent;
        if (!this._renderQueued) {
            this._renderQueued = true;
            requestAnimationFrame(()=>{
                // TODO add mechanism to allow component developer to have more control over
                // whether input vs. change events are emitted
                if (this._changeQueued) (0, $gbrAN.dispatch)(this, 'change');
                this._changeQueued = false;
                this._renderQueued = false;
                this.render();
            });
        }
    }
    hydrate() {
        if (!this._hydrated) {
            this.initValue();
            const cloneElements = typeof this.content !== 'function';
            const _content = typeof this.content === 'function' ? this.content() : this.content;
            const { styleSpec: styleSpec } = this.constructor;
            let { styleNode: styleNode } = this.constructor;
            if (styleSpec) {
                styleNode = this.constructor.styleNode = (0, $9sLMf.elements).style((0, $2okor.css)(styleSpec));
                delete this.constructor.styleNode;
            }
            if (this.styleNode) {
                console.warn(this, 'styleNode is deprecrated, use static styleNode or statc styleSpec instead');
                styleNode = this.styleNode;
            }
            if (styleNode) {
                const shadow = this.attachShadow({
                    mode: 'open'
                });
                shadow.appendChild(styleNode.cloneNode(true));
                (0, $gbrAN.appendContentToElement)(shadow, _content, cloneElements);
            } else if (_content !== null) {
                const existingChildren = [
                    ...this.childNodes
                ];
                (0, $gbrAN.appendContentToElement)(this, _content, cloneElements);
                this.isSlotted = this.querySelector('slot,xin-slot') !== undefined;
                const slots = [
                    ...this.querySelectorAll('slot')
                ];
                if (slots.length > 0) slots.forEach($cd387b053feba574$var$XinSlot.replaceSlot);
                if (existingChildren.length > 0) {
                    const slotMap = {
                        '': this
                    };
                    [
                        ...this.querySelectorAll('xin-slot')
                    ].forEach((slot)=>{
                        slotMap[slot.name] = slot;
                    });
                    existingChildren.forEach((child)=>{
                        const defaultSlot = slotMap[''];
                        const destSlot = child instanceof Element ? slotMap[child.slot] : defaultSlot;
                        (destSlot !== undefined ? destSlot : defaultSlot).append(child);
                    });
                }
            }
            this._hydrated = true;
        }
    }
    render() {}
}
class $cd387b053feba574$var$XinSlot extends $cd387b053feba574$export$16fa2f45be04daa8 {
    static replaceSlot(slot) {
        const _slot = document.createElement('xin-slot');
        if (slot.name !== '') _slot.setAttribute('name', slot.name);
        slot.replaceWith(_slot);
    }
    constructor(){
        super(), this.name = '', this.content = null;
        this.initAttributes('name');
    }
}
const $cd387b053feba574$export$a0751b4aa1961d4e = $cd387b053feba574$var$XinSlot.elementCreator({
    tag: 'xin-slot'
});

});
parcelRegister("2okor", function(module, exports) {

$parcel$export(module.exports, "StyleSheet", () => $49cee7f7f866c751$export$9d753cd7ae895cce);
$parcel$export(module.exports, "css", () => $49cee7f7f866c751$export$dbf350e5966cf602);
$parcel$export(module.exports, "processProp", () => $49cee7f7f866c751$export$4f8a9e649bc1f08b);
$parcel$export(module.exports, "initVars", () => $49cee7f7f866c751$export$90d0ea046136e3ed);
$parcel$export(module.exports, "darkMode", () => $49cee7f7f866c751$export$808aaf1b460dc9af);
$parcel$export(module.exports, "invertLuminance", () => $49cee7f7f866c751$export$8279dba9b7d4e420);
$parcel$export(module.exports, "vars", () => $49cee7f7f866c751$export$3cb96c9f6c8d16a4);
$parcel$export(module.exports, "varDefault", () => $49cee7f7f866c751$export$75c0e6adb3e38f31);

var $6Jaab = parcelRequire("6Jaab");

var $9sLMf = parcelRequire("9sLMf");

var $5JLBr = parcelRequire("5JLBr");
function $49cee7f7f866c751$export$9d753cd7ae895cce(id, styleSpec) {
    const element = (0, $9sLMf.elements).style($49cee7f7f866c751$export$dbf350e5966cf602(styleSpec));
    element.id = id;
    document.head.append(element);
}
const $49cee7f7f866c751$var$numericProps = [
    'animation-iteration-count',
    'flex',
    'flex-base',
    'flex-grow',
    'flex-shrink',
    'opacity',
    'order',
    'tab-size',
    'widows',
    'z-index',
    'zoom'
];
const $49cee7f7f866c751$export$4f8a9e649bc1f08b = (prop, value)=>{
    if (typeof value === 'number' && !$49cee7f7f866c751$var$numericProps.includes(prop)) value = `${value}px`;
    if (prop.startsWith('_')) {
        if (prop.startsWith('__')) {
            prop = '--' + prop.substring(2);
            value = `var(${prop}-default, ${value})`;
        } else prop = '--' + prop.substring(1);
    }
    return {
        prop: prop,
        value: String(value)
    };
};
const $49cee7f7f866c751$var$renderProp = (indentation, cssProp, value)=>{
    if (value === undefined) return '';
    if (value instanceof (0, $6Jaab.Color)) value = value.html;
    const processed = $49cee7f7f866c751$export$4f8a9e649bc1f08b(cssProp, value);
    return `${indentation}  ${processed.prop}: ${processed.value};`;
};
const $49cee7f7f866c751$var$renderStatement = (key, value, indentation = '')=>{
    const cssProp = (0, $5JLBr.camelToKabob)(key);
    if (typeof value === 'object' && !(value instanceof (0, $6Jaab.Color))) {
        const renderedRule = Object.keys(value).map((innerKey)=>$49cee7f7f866c751$var$renderStatement(innerKey, value[innerKey], `${indentation}  `)).join('\n');
        return `${indentation}  ${key} {\n${renderedRule}\n${indentation}  }`;
    } else return $49cee7f7f866c751$var$renderProp(indentation, cssProp, value);
};
const $49cee7f7f866c751$export$dbf350e5966cf602 = (obj, indentation = '')=>{
    const selectors = Object.keys(obj).map((selector)=>{
        const body = obj[selector];
        if (typeof body === 'string') {
            if (selector === '@import') return `@import url('${body}');`;
            throw new Error('top-level string value only allowed for `@import`');
        }
        const rule = Object.keys(body).map((prop)=>$49cee7f7f866c751$var$renderStatement(prop, body[prop])).join('\n');
        return `${indentation}${selector} {\n${rule}\n}`;
    });
    return selectors.join('\n\n');
};
const $49cee7f7f866c751$export$90d0ea046136e3ed = (obj)=>{
    console.warn('initVars is deprecated. Just use _ and __ prefixes instead.');
    const rule = {};
    for (const key of Object.keys(obj)){
        const value = obj[key];
        const kabobKey = (0, $5JLBr.camelToKabob)(key);
        rule[`--${kabobKey}`] = typeof value === 'number' && value !== 0 ? String(value) + 'px' : value;
    }
    return rule;
};
const $49cee7f7f866c751$export$808aaf1b460dc9af = (obj)=>{
    console.warn('darkMode is deprecated. Use inverseLuminance instead.');
    const rule = {};
    for (const key of Object.keys(obj)){
        let value = obj[key];
        if (typeof value === 'string' && value.match(/^(#|rgb[a]?\(|hsl[a]?\()/) != null) {
            value = (0, $6Jaab.Color).fromCss(value).inverseLuminance.html;
            rule[`--${(0, $5JLBr.camelToKabob)(key)}`] = value;
        }
    }
    return rule;
};
const $49cee7f7f866c751$export$8279dba9b7d4e420 = (map)=>{
    const inverted = {};
    for (const key of Object.keys(map)){
        const value = map[key];
        if (value instanceof (0, $6Jaab.Color)) inverted[key] = value.inverseLuminance;
        else if (typeof value === 'string' && value.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/)) inverted[key] = (0, $6Jaab.Color).fromCss(value).inverseLuminance;
    }
    return inverted;
};
const $49cee7f7f866c751$export$3cb96c9f6c8d16a4 = new Proxy({}, {
    get (target, prop) {
        if (target[prop] == null) {
            prop = prop.replace(/[A-Z]/g, (x)=>`-${x.toLocaleLowerCase()}`);
            const [, _varName, , isNegative, scaleText, method] = prop.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/);
            const varName = `--${_varName}`;
            if (scaleText != null) {
                const scale = isNegative == null ? Number(scaleText) / 100 : -Number(scaleText) / 100;
                switch(method){
                    case 'b':
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = scale > 0 ? (0, $6Jaab.Color).fromCss(baseColor).brighten(scale).rgba : (0, $6Jaab.Color).fromCss(baseColor).darken(-scale).rgba;
                        }
                        break;
                    case 's':
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = scale > 0 ? (0, $6Jaab.Color).fromCss(baseColor).saturate(scale).rgba : (0, $6Jaab.Color).fromCss(baseColor).desaturate(-scale).rgba;
                        }
                        break;
                    case 'h':
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = (0, $6Jaab.Color).fromCss(baseColor).rotate(scale * 100).rgba;
                            console.log((0, $6Jaab.Color).fromCss(baseColor).hsla, (0, $6Jaab.Color).fromCss(baseColor).rotate(scale).hsla);
                        }
                        break;
                    case 'o':
                        {
                            const baseColor = getComputedStyle(document.body).getPropertyValue(varName);
                            target[prop] = (0, $6Jaab.Color).fromCss(baseColor).opacity(scale).rgba;
                        }
                        break;
                    case '':
                        target[prop] = `calc(var(${varName}) * ${scale})`;
                        break;
                    default:
                        console.error(method);
                        throw new Error(`Unrecognized method ${method} for css variable ${varName}`);
                }
            } else target[prop] = `var(${varName})`;
        }
        return target[prop];
    }
});
const $49cee7f7f866c751$export$75c0e6adb3e38f31 = new Proxy({}, {
    get (target, prop) {
        if (target[prop] === undefined) {
            const varName = `--${prop.replace(/[A-Z]/g, (x)=>`-${x.toLocaleLowerCase()}`)}`;
            target[prop] = (val)=>`var(${varName}, ${val})`;
        }
        return target[prop];
    }
});

});
parcelRegister("6Jaab", function(module, exports) {

$parcel$export(module.exports, "Color", () => $72989831e95a2bab$export$892596cec99bc70e);

var $drWRQ = parcelRequire("drWRQ");
// http://www.itu.int/rec/R-REC-BT.601
const $72989831e95a2bab$var$bt601 = (r, g, b)=>{
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
const $72989831e95a2bab$var$hex2 = (n)=>('00' + Math.round(Number(n)).toString(16)).slice(-2);
class $72989831e95a2bab$var$HslColor {
    constructor(r, g, b){
        r /= 255;
        g /= 255;
        b /= 255;
        const l = Math.max(r, g, b);
        const s = l - Math.min(r, g, b);
        const h = s !== 0 ? l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s : 0;
        this.h = 60 * h < 0 ? 60 * h + 360 : 60 * h;
        this.s = s !== 0 ? l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s)) : 0;
        this.l = (2 * l - s) / 2;
    }
}
const $72989831e95a2bab$var$span = globalThis.document !== undefined ? globalThis.document.createElement('span') : undefined;
class $72989831e95a2bab$export$892596cec99bc70e {
    static fromCss(spec) {
        let converted = spec;
        if ($72989831e95a2bab$var$span instanceof HTMLSpanElement) {
            $72989831e95a2bab$var$span.style.color = spec;
            document.body.appendChild($72989831e95a2bab$var$span);
            converted = getComputedStyle($72989831e95a2bab$var$span).color;
            $72989831e95a2bab$var$span.remove();
        }
        const [r, g, b, a] = converted.match(/[\d.]+/g);
        return new $72989831e95a2bab$export$892596cec99bc70e(Number(r), Number(g), Number(b), a == null ? 1 : Number(a));
    }
    static fromHsl(h, s, l, a = 1) {
        return $72989831e95a2bab$export$892596cec99bc70e.fromCss(`hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${a.toFixed(2)})`);
    }
    constructor(r, g, b, a = 1){
        this.r = (0, $drWRQ.clamp)(0, r, 255);
        this.g = (0, $drWRQ.clamp)(0, g, 255);
        this.b = (0, $drWRQ.clamp)(0, b, 255);
        this.a = a !== undefined ? (0, $drWRQ.clamp)(0, a, 1) : a = 1;
    }
    get inverse() {
        return new $72989831e95a2bab$export$892596cec99bc70e(255 - this.r, 255 - this.g, 255 - this.b, this.a);
    }
    get inverseLuminance() {
        const { h: h, s: s, l: l } = this._hsl;
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, s, 1 - l, this.a);
    }
    get rgb() {
        const { r: r, g: g, b: b } = this;
        return `rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)})`;
    }
    get rgba() {
        const { r: r, g: g, b: b, a: a } = this;
        return `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${a.toFixed(2)})`;
    }
    get RGBA() {
        return [
            this.r / 255,
            this.g / 255,
            this.b / 255,
            this.a
        ];
    }
    get ARGB() {
        return [
            this.a,
            this.r / 255,
            this.g / 255,
            this.b / 255
        ];
    }
    get _hsl() {
        if (this.hslCached == null) this.hslCached = new $72989831e95a2bab$var$HslColor(this.r, this.g, this.b);
        return this.hslCached;
    }
    get hsl() {
        const { h: h, s: s, l: l } = this._hsl;
        return `hsl(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`;
    }
    get hsla() {
        const { h: h, s: s, l: l } = this._hsl;
        return `hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${this.a.toFixed(2)})`;
    }
    get mono() {
        const v = this.brightness * 255;
        return new $72989831e95a2bab$export$892596cec99bc70e(v, v, v);
    }
    get brightness() {
        return $72989831e95a2bab$var$bt601(this.r, this.g, this.b);
    }
    get html() {
        return this.toString();
    }
    toString() {
        return this.a === 1 ? '#' + $72989831e95a2bab$var$hex2(this.r) + $72989831e95a2bab$var$hex2(this.g) + $72989831e95a2bab$var$hex2(this.b) : '#' + $72989831e95a2bab$var$hex2(this.r) + $72989831e95a2bab$var$hex2(this.g) + $72989831e95a2bab$var$hex2(this.b) + $72989831e95a2bab$var$hex2(Math.floor(255 * this.a));
    }
    brighten(amount) {
        const { h: h, s: s, l: l } = this._hsl;
        const lClamped = (0, $drWRQ.clamp)(0, l + amount * (1 - l), 1);
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, s, lClamped, this.a);
    }
    darken(amount) {
        const { h: h, s: s, l: l } = this._hsl;
        const lClamped = (0, $drWRQ.clamp)(0, l * (1 - amount), 1);
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, s, lClamped, this.a);
    }
    saturate(amount) {
        const { h: h, s: s, l: l } = this._hsl;
        const sClamped = (0, $drWRQ.clamp)(0, s + amount * (1 - s), 1);
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, sClamped, l, this.a);
    }
    desaturate(amount) {
        const { h: h, s: s, l: l } = this._hsl;
        const sClamped = (0, $drWRQ.clamp)(0, s * (1 - amount), 1);
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, sClamped, l, this.a);
    }
    rotate(amount) {
        const { h: h, s: s, l: l } = this._hsl;
        const hClamped = (h + 360 + amount) % 360;
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(hClamped, s, l, this.a);
    }
    opacity(alpha) {
        const { h: h, s: s, l: l } = this._hsl;
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl(h, s, l, alpha);
    }
    swatch() {
        const { r: r, g: g, b: b, a: a } = this;
        console.log(`%c      %c ${this.html}, rgba(${r}, ${g}, ${b}, ${a}), ${this.hsla}`, `background-color: rgba(${r}, ${g}, ${b}, ${a})`, 'background-color: transparent');
        return this;
    }
    blend(otherColor, t) {
        return new $72989831e95a2bab$export$892596cec99bc70e((0, $drWRQ.lerp)(this.r, otherColor.r, t), (0, $drWRQ.lerp)(this.g, otherColor.g, t), (0, $drWRQ.lerp)(this.b, otherColor.b, t), (0, $drWRQ.lerp)(this.a, otherColor.a, t));
    }
    mix(otherColor, t) {
        const a = this._hsl;
        const b = otherColor._hsl;
        return $72989831e95a2bab$export$892596cec99bc70e.fromHsl((0, $drWRQ.lerp)(a.h, b.h, t), (0, $drWRQ.lerp)(a.s, b.s, t), (0, $drWRQ.lerp)(a.l, b.l, t), (0, $drWRQ.lerp)(this.a, otherColor.a, t));
    }
}

});
parcelRegister("drWRQ", function(module, exports) {

$parcel$export(module.exports, "clamp", () => $0e50e8a626908591$export$7d15b64cf5a3a4c4);
$parcel$export(module.exports, "lerp", () => $0e50e8a626908591$export$3a89f8d6f6bf6c9f);
$parcel$export(module.exports, "MoreMath", () => $0e50e8a626908591$export$5e0dd9fd5d74e0c5);
/*
# more-math

Some simple functions egregiously missing from `Math`
*/ const $0e50e8a626908591$export$ba6bc6c220358ed9 = 180 / Math.PI;
const $0e50e8a626908591$export$1518e1a62333c8a4 = Math.PI / 180;
function $0e50e8a626908591$export$7d15b64cf5a3a4c4(min, v, max) {
    return v < min ? min : v > max ? max : v;
}
function $0e50e8a626908591$export$3a89f8d6f6bf6c9f(a, b, t) {
    t = $0e50e8a626908591$export$7d15b64cf5a3a4c4(0, t, 1);
    return t * (b - a) + a;
}
const $0e50e8a626908591$export$5e0dd9fd5d74e0c5 = {
    clamp: $0e50e8a626908591$export$7d15b64cf5a3a4c4,
    lerp: $0e50e8a626908591$export$3a89f8d6f6bf6c9f
};

});


parcelRegister("9sLMf", function(module, exports) {

$parcel$export(module.exports, "elements", () => $9e0c0b8784c80412$export$7a5d735b2ab6389d);
$parcel$export(module.exports, "svgElements", () => $9e0c0b8784c80412$export$cf20112a1bc148da);
$parcel$export(module.exports, "mathML", () => $9e0c0b8784c80412$export$8ec252cfdd664597);

var $kCu8Y = parcelRequire("kCu8Y");

var $buKmK = parcelRequire("buKmK");

var $5JLBr = parcelRequire("5JLBr");

var $2okor = parcelRequire("2okor");
const $9e0c0b8784c80412$var$MATH = 'http://www.w3.org/1998/Math/MathML';
const $9e0c0b8784c80412$var$SVG = 'http://www.w3.org/2000/svg';
const $9e0c0b8784c80412$var$templates = {};
const $9e0c0b8784c80412$var$create = (tagType, ...contents)=>{
    if ($9e0c0b8784c80412$var$templates[tagType] === undefined) {
        const [tag, namespace] = tagType.split('|');
        if (namespace === undefined) $9e0c0b8784c80412$var$templates[tagType] = globalThis.document.createElement(tag);
        else $9e0c0b8784c80412$var$templates[tagType] = globalThis.document.createElementNS(namespace, tag);
    }
    const elt = $9e0c0b8784c80412$var$templates[tagType].cloneNode();
    const elementProps = {};
    for (const item of contents)if (item instanceof Element || item instanceof DocumentFragment || typeof item === 'string' || typeof item === 'number') {
        if (elt instanceof HTMLTemplateElement) elt.content.append(item);
        else elt.append(item);
    } else Object.assign(elementProps, item);
    for (const key of Object.keys(elementProps)){
        const value = elementProps[key];
        if (key === 'apply') value(elt);
        else if (key === 'style') {
            if (typeof value === 'object') for (const prop of Object.keys(value)){
                const processed = (0, $2okor.processProp)((0, $5JLBr.camelToKabob)(prop), value[prop]);
                if (processed.prop.startsWith('--')) elt.style.setProperty(processed.prop, processed.value);
                else elt.style[prop] = processed.value;
            }
            else elt.setAttribute('style', value);
        } else if (key.match(/^on[A-Z]/) != null) {
            const eventType = key.substring(2).toLowerCase();
            (0, $kCu8Y.on)(elt, eventType, value);
        } else if (key === 'bind') {
            const binding = typeof value.binding === 'string' ? (0, $buKmK.bindings)[value.binding] : value.binding;
            if (binding !== undefined && value.value !== undefined) (0, $kCu8Y.bind)(elt, value.value, value.binding instanceof Function ? {
                toDOM: value.binding
            } : value.binding);
            else throw new Error(`bad binding`);
        } else if (key.match(/^bind[A-Z]/) != null) {
            const bindingType = key.substring(4, 5).toLowerCase() + key.substring(5);
            const binding = (0, $buKmK.bindings)[bindingType];
            if (binding !== undefined) (0, $kCu8Y.bind)(elt, value, binding);
            else throw new Error(`${key} is not allowed, bindings.${bindingType} is not defined`);
        } else if (elt[key] !== undefined) {
            // MathML is only supported on 91% of browsers, and not on the Raspberry Pi Chromium
            const { MathMLElement: MathMLElement } = globalThis;
            if (elt instanceof SVGElement || MathMLElement !== undefined && elt instanceof MathMLElement) elt.setAttribute(key, value);
            else elt[key] = value;
        } else {
            const attr = (0, $5JLBr.camelToKabob)(key);
            if (attr === 'class') value.split(' ').forEach((className)=>{
                elt.classList.add(className);
            });
            else if (elt[attr] !== undefined) elt[attr] = value;
            else if (typeof value === 'boolean') value ? elt.setAttribute(attr, '') : elt.removeAttribute(attr);
            else elt.setAttribute(attr, value);
        }
    }
    return elt;
};
const $9e0c0b8784c80412$var$fragment = (...contents)=>{
    const frag = globalThis.document.createDocumentFragment();
    for (const item of contents)frag.append(item);
    return frag;
};
const $9e0c0b8784c80412$export$7a5d735b2ab6389d = new Proxy({
    fragment: $9e0c0b8784c80412$var$fragment
}, {
    get (target, tagName) {
        tagName = tagName.replace(/[A-Z]/g, (c)=>`-${c.toLocaleLowerCase()}`);
        if (target[tagName] === undefined) target[tagName] = (...contents)=>$9e0c0b8784c80412$var$create(tagName, ...contents);
        return target[tagName];
    },
    set () {
        throw new Error('You may not add new properties to elements');
    }
});
const $9e0c0b8784c80412$export$cf20112a1bc148da = new Proxy({
    fragment: $9e0c0b8784c80412$var$fragment
}, {
    get (target, tagName) {
        if (target[tagName] === undefined) target[tagName] = (...contents)=>$9e0c0b8784c80412$var$create(`${tagName}|${$9e0c0b8784c80412$var$SVG}`, ...contents);
        return target[tagName];
    },
    set () {
        throw new Error('You may not add new properties to elements');
    }
});
const $9e0c0b8784c80412$export$8ec252cfdd664597 = new Proxy({
    fragment: $9e0c0b8784c80412$var$fragment
}, {
    get (target, tagName) {
        if (target[tagName] === undefined) target[tagName] = (...contents)=>$9e0c0b8784c80412$var$create(`${tagName}|${$9e0c0b8784c80412$var$MATH}`, ...contents);
        return target[tagName];
    },
    set () {
        throw new Error('You may not add new properties to elements');
    }
});

});
parcelRegister("kCu8Y", function(module, exports) {

$parcel$export(module.exports, "bind", () => $b5796eaeba5c782e$export$2385a24977818dd0);
$parcel$export(module.exports, "on", () => $b5796eaeba5c782e$export$af631764ddc44097);

var $eppu5 = parcelRequire("eppu5");
var $5lOGz = parcelRequire("5lOGz");

var $5hOlm = parcelRequire("5hOlm");
const { document: $b5796eaeba5c782e$var$document, MutationObserver: $b5796eaeba5c782e$var$MutationObserver } = globalThis;
const $b5796eaeba5c782e$export$80bf2f765c31be6a = (element, changedPath)=>{
    const dataBindings = (0, $5hOlm.elementToBindings).get(element);
    if (dataBindings == null) return;
    for (const dataBinding of dataBindings){
        const { binding: binding, options: options } = dataBinding;
        let { path: path } = dataBinding;
        const { toDOM: toDOM } = binding;
        if (toDOM != null) {
            if (path.startsWith('^')) {
                const dataSource = (0, $5hOlm.getListItem)(element);
                if (dataSource != null && dataSource[0, $5hOlm.XIN_PATH] != null) path = dataBinding.path = `${dataSource[0, $5hOlm.XIN_PATH]}${path.substring(1)}`;
                else {
                    console.error(`Cannot resolve relative binding ${path}`, element, 'is not part of a list');
                    throw new Error(`Cannot resolve relative binding ${path}`);
                }
            }
            if (changedPath == null || path.startsWith(changedPath)) toDOM(element, (0, $eppu5.xin)[path], options);
        }
    }
};
// this is just to allow bind to be testable in node
if ($b5796eaeba5c782e$var$MutationObserver != null) {
    const observer = new $b5796eaeba5c782e$var$MutationObserver((mutationsList)=>{
        mutationsList.forEach((mutation)=>{
            [
                ...mutation.addedNodes
            ].forEach((node)=>{
                if (node instanceof Element) [
                    ...node.querySelectorAll((0, $5hOlm.BOUND_SELECTOR))
                ].forEach((element)=>$b5796eaeba5c782e$export$80bf2f765c31be6a(element));
            });
        });
    });
    observer.observe($b5796eaeba5c782e$var$document.body, {
        subtree: true,
        childList: true
    });
}
(0, $eppu5.observe)(()=>true, (changedPath)=>{
    const boundElements = $b5796eaeba5c782e$var$document.querySelectorAll((0, $5hOlm.BOUND_SELECTOR));
    for (const element of boundElements)$b5796eaeba5c782e$export$80bf2f765c31be6a(element, changedPath);
});
const $b5796eaeba5c782e$var$handleChange = (event)=>{
    // @ts-expect-error-error
    let target = event.target.closest((0, $5hOlm.BOUND_SELECTOR));
    while(target != null){
        const dataBindings = (0, $5hOlm.elementToBindings).get(target);
        for (const dataBinding of dataBindings){
            const { binding: binding, path: path } = dataBinding;
            const { fromDOM: fromDOM } = binding;
            if (fromDOM != null) {
                let value;
                try {
                    value = fromDOM(target, dataBinding.options);
                } catch (e) {
                    console.error('Cannot get value from', target, 'via', dataBinding);
                    throw new Error('Cannot obtain value fromDOM');
                }
                if (value != null) {
                    const existing = (0, $eppu5.xin)[path];
                    if (existing == null) (0, $eppu5.xin)[path] = value;
                    else {
                        const existingActual = // @ts-expect-error-error
                        existing[0, $5hOlm.XIN_PATH] != null ? existing[0, $5hOlm.XIN_VALUE] : existing;
                        const valueActual = value[0, $5hOlm.XIN_PATH] != null ? value[0, $5hOlm.XIN_VALUE] : value;
                        if (existingActual !== valueActual) (0, $eppu5.xin)[path] = valueActual;
                    }
                }
            }
        }
        target = target.parentElement.closest((0, $5hOlm.BOUND_SELECTOR));
    }
};
if (globalThis.document != null) {
    $b5796eaeba5c782e$var$document.body.addEventListener('change', $b5796eaeba5c782e$var$handleChange, true);
    $b5796eaeba5c782e$var$document.body.addEventListener('input', $b5796eaeba5c782e$var$handleChange, true);
}
function $b5796eaeba5c782e$export$2385a24977818dd0(element, what, binding, options) {
    if (element instanceof DocumentFragment) throw new Error('bind cannot bind to a DocumentFragment');
    let path;
    if (typeof what === 'object' && what[0, $5hOlm.XIN_PATH] === undefined && options === undefined) {
        const { value: value } = what;
        path = typeof value === 'string' ? value : value[0, $5hOlm.XIN_PATH];
        options = what;
        delete options.value;
    } else path = typeof what === 'string' ? what : what[0, $5hOlm.XIN_PATH];
    if (path == null) throw new Error('bind requires a path or object with xin Proxy');
    const { toDOM: toDOM } = binding;
    element.classList?.add((0, $5hOlm.BOUND_CLASS));
    let dataBindings = (0, $5hOlm.elementToBindings).get(element);
    if (dataBindings == null) {
        dataBindings = [];
        (0, $5hOlm.elementToBindings).set(element, dataBindings);
    }
    dataBindings.push({
        path: path,
        binding: binding,
        options: options
    });
    if (toDOM != null && !path.startsWith('^')) // not calling toDOM directly here allows virtual list bindings to work
    (0, $5lOGz.touch)(path);
    return element;
}
const $b5796eaeba5c782e$var$handledEventTypes = new Set();
const $b5796eaeba5c782e$var$handleBoundEvent = (event)=>{
    // @ts-expect-error-error
    let target = event?.target.closest((0, $5hOlm.EVENT_SELECTOR));
    let propagationStopped = false;
    const wrappedEvent = new Proxy(event, {
        get (target, prop) {
            if (prop === 'stopPropagation') return ()=>{
                event.stopPropagation();
                propagationStopped = true;
            };
            else {
                // @ts-expect-error-error
                const value = target[prop];
                return typeof value === 'function' ? value.bind(target) : value;
            }
        }
    });
    while(!propagationStopped && target != null){
        const eventBindings = (0, $5hOlm.elementToHandlers).get(target);
        const handlers = eventBindings[event.type] || [];
        for (const handler of handlers){
            if (typeof handler === 'function') handler(wrappedEvent);
            else {
                const func = (0, $eppu5.xin)[handler];
                if (typeof func === 'function') func(wrappedEvent);
                else throw new Error(`no event handler found at path ${handler}`);
            }
            if (propagationStopped) continue;
        }
        target = target.parentElement != null ? target.parentElement.closest((0, $5hOlm.EVENT_SELECTOR)) : null;
    }
};
const $b5796eaeba5c782e$export$af631764ddc44097 = (element, eventType, eventHandler)=>{
    let eventBindings = (0, $5hOlm.elementToHandlers).get(element);
    element.classList.add((0, $5hOlm.EVENT_CLASS));
    if (eventBindings == null) {
        eventBindings = {};
        (0, $5hOlm.elementToHandlers).set(element, eventBindings);
    }
    if (!eventBindings[eventType]) eventBindings[eventType] = [];
    if (!eventBindings[eventType].includes(eventHandler)) eventBindings[eventType].push(eventHandler);
    if (!$b5796eaeba5c782e$var$handledEventTypes.has(eventType)) {
        $b5796eaeba5c782e$var$handledEventTypes.add(eventType);
        $b5796eaeba5c782e$var$document.body.addEventListener(eventType, $b5796eaeba5c782e$var$handleBoundEvent, true);
    }
};

});
parcelRegister("eppu5", function(module, exports) {

$parcel$export(module.exports, "xin", () => $547f11326d897190$export$966034e6c6823eb0);
$parcel$export(module.exports, "observe", () => $547f11326d897190$export$d1203567a167490e);
$parcel$export(module.exports, "boxed", () => $547f11326d897190$export$fd1b43749dd321e5);
$parcel$export(module.exports, "updates", () => (parcelRequire("5lOGz")).updates);
$parcel$export(module.exports, "touch", () => (parcelRequire("5lOGz")).touch);
$parcel$export(module.exports, "unobserve", () => (parcelRequire("5lOGz")).unobserve);
$parcel$export(module.exports, "observerShouldBeRemoved", () => (parcelRequire("5lOGz")).observerShouldBeRemoved);

var $hv4Z8 = parcelRequire("hv4Z8");

var $5lOGz = parcelRequire("5lOGz");

var $aMI8M = parcelRequire("aMI8M");

var $5hOlm = parcelRequire("5hOlm");
// list of Array functions that change the array
const $547f11326d897190$var$ARRAY_MUTATIONS = [
    'sort',
    'splice',
    'copyWithin',
    'fill',
    'pop',
    'push',
    'reverse',
    'shift',
    'unshift'
];
const $547f11326d897190$var$registry = {};
const $547f11326d897190$var$debugPaths = true;
const $547f11326d897190$var$validPath = /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/;
const $547f11326d897190$export$a678af82bf766611 = (path)=>$547f11326d897190$var$validPath.test(path);
const $547f11326d897190$var$extendPath = (path = '', prop = '')=>{
    if (path === '') return prop;
    else {
        if (prop.match(/^\d+$/) !== null || prop.includes('=')) return `${path}[${prop}]`;
        else return `${path}.${prop}`;
    }
};
const $547f11326d897190$var$boxes = {
    string (s) {
        return new String(s);
    },
    boolean (b) {
        return new Boolean(b);
    },
    bigint (b) {
        return b;
    },
    symbol (s) {
        return s;
    },
    number (n) {
        return new Number(n);
    }
};
function $547f11326d897190$var$box(x, path) {
    const t = typeof x;
    if (x === undefined || t === 'object' || t === 'function') return x;
    else return new Proxy($547f11326d897190$var$boxes[t](x), $547f11326d897190$var$regHandler(path, true));
}
const $547f11326d897190$var$regHandler = (path, boxScalars)=>({
        // TODO figure out how to correctly return array[Symbol.iterator] so that for(const foo of xin.foos) works
        // as you'd expect
        get (target, _prop) {
            if (_prop === (0, $5hOlm.XIN_PATH)) return path;
            else if (_prop === (0, $5hOlm.XIN_VALUE)) {
                while((0, $5hOlm.xinPath)(target) !== undefined)target = (0, $5hOlm.xinValue)(target);
                return target;
            }
            if (typeof _prop === 'symbol') return target[_prop];
            let prop = _prop;
            const compoundProp = prop.match(/^([^.[]+)\.(.+)$/) ?? // basePath.subPath (omit '.')
            prop.match(/^([^\]]+)(\[.+)/) ?? // basePath[subPath
            prop.match(/^(\[[^\]]+\])\.(.+)$/) ?? // [basePath].subPath (omit '.')
            prop.match(/^(\[[^\]]+\])\[(.+)$/) // [basePath][subPath
            ;
            if (compoundProp !== null) {
                const [, basePath, subPath] = compoundProp;
                const currentPath = $547f11326d897190$var$extendPath(path, basePath);
                const value = (0, $aMI8M.getByPath)(target, basePath);
                return value !== null && typeof value === 'object' ? new Proxy(value, $547f11326d897190$var$regHandler(currentPath, boxScalars))[subPath] : value;
            }
            if (prop.startsWith('[') && prop.endsWith(']')) prop = prop.substring(1, prop.length - 1);
            if (!Array.isArray(target) && target[prop] !== undefined || Array.isArray(target) && prop.includes('=')) {
                let value;
                if (prop.includes('=')) {
                    const [idPath, needle] = prop.split('=');
                    value = target.find((candidate)=>`${(0, $aMI8M.getByPath)(candidate, idPath)}` === needle);
                } else value = target[prop];
                if (value !== null && typeof value === 'object') {
                    const currentPath = $547f11326d897190$var$extendPath(path, prop);
                    return new Proxy(value, $547f11326d897190$var$regHandler(currentPath, boxScalars));
                } else if (typeof value === 'function') return value.bind(target);
                else return boxScalars ? $547f11326d897190$var$box(value, $547f11326d897190$var$extendPath(path, prop)) : value;
            } else if (Array.isArray(target)) {
                const value = target[prop];
                return typeof value === 'function' ? (...items)=>{
                    // @ts-expect-error seriously?
                    const result = Array.prototype[prop].apply(target, items);
                    if ($547f11326d897190$var$ARRAY_MUTATIONS.includes(prop)) (0, $5lOGz.touch)(path);
                    return result;
                } : typeof value === 'object' ? new Proxy(value, $547f11326d897190$var$regHandler($547f11326d897190$var$extendPath(path, prop), boxScalars)) : boxScalars ? $547f11326d897190$var$box(value, $547f11326d897190$var$extendPath(path, prop)) : value;
            } else return boxScalars ? $547f11326d897190$var$box(target[prop], $547f11326d897190$var$extendPath(path, prop)) : target[prop];
        },
        set (_, prop, value) {
            value = (0, $5hOlm.xinValue)(value);
            const fullPath = $547f11326d897190$var$extendPath(path, prop);
            if ($547f11326d897190$var$debugPaths && !$547f11326d897190$export$a678af82bf766611(fullPath)) throw new Error(`setting invalid path ${fullPath}`);
            const existing = (0, $5hOlm.xinValue)($547f11326d897190$export$966034e6c6823eb0[fullPath]);
            if (existing !== value && (0, $aMI8M.setByPath)($547f11326d897190$var$registry, fullPath, value)) (0, $5lOGz.touch)(fullPath);
            return true;
        }
    });
const $547f11326d897190$export$d1203567a167490e = (test, callback)=>{
    const func = typeof callback === 'function' ? callback : $547f11326d897190$export$966034e6c6823eb0[callback];
    if (typeof func !== 'function') throw new Error(`observe expects a function or path to a function, ${callback} is neither`);
    return (0, $5lOGz.observe)(test, func);
};
const $547f11326d897190$export$966034e6c6823eb0 = new Proxy($547f11326d897190$var$registry, $547f11326d897190$var$regHandler('', false));
const $547f11326d897190$export$fd1b43749dd321e5 = new Proxy($547f11326d897190$var$registry, $547f11326d897190$var$regHandler('', true));

});
parcelRegister("hv4Z8", function(module, exports) {

$parcel$export(module.exports, "settings", () => $34b63e9d5b96494c$export$a5a6e0b888b2c992);
const $34b63e9d5b96494c$export$a5a6e0b888b2c992 = {
    debug: false,
    perf: false
};

});

parcelRegister("5lOGz", function(module, exports) {

$parcel$export(module.exports, "observerShouldBeRemoved", () => $f0b099915f91bd21$export$253d09664e30b967);
$parcel$export(module.exports, "updates", () => $f0b099915f91bd21$export$1c2919332513559b);
$parcel$export(module.exports, "unobserve", () => $f0b099915f91bd21$export$23a2283368c55ea2);
$parcel$export(module.exports, "touch", () => $f0b099915f91bd21$export$d0b7ea69ab6056df);
$parcel$export(module.exports, "observe", () => $f0b099915f91bd21$export$d1203567a167490e);

var $5hOlm = parcelRequire("5hOlm");

var $hv4Z8 = parcelRequire("hv4Z8");
const $f0b099915f91bd21$export$253d09664e30b967 = Symbol('observer should be removed');
const $f0b099915f91bd21$export$58bed631278dbc67 = [] // { path_string_or_test, callback }
;
const $f0b099915f91bd21$var$touchedPaths = [];
let $f0b099915f91bd21$var$updateTriggered = false;
let $f0b099915f91bd21$var$updatePromise;
let $f0b099915f91bd21$var$resolveUpdate;
class $f0b099915f91bd21$export$c92b1d5f43586026 {
    constructor(test, callback){
        const callbackDescription = typeof callback === 'string' ? `"${callback}"` : `function ${callback.name}`;
        let testDescription;
        if (typeof test === 'string') {
            this.test = (t)=>typeof t === 'string' && t !== '' && (test.startsWith(t) || t.startsWith(test));
            testDescription = `test = "${test}"`;
        } else if (test instanceof RegExp) {
            this.test = test.test.bind(test);
            testDescription = `test = "${test.toString()}"`;
        } else if (test instanceof Function) {
            this.test = test;
            testDescription = `test = function ${test.name}`;
        } else throw new Error('expect listener test to be a string, RegExp, or test function');
        this.description = `${testDescription}, ${callbackDescription}`;
        if (typeof callback === 'function') this.callback = callback;
        else throw new Error('expect callback to be a path or function');
        $f0b099915f91bd21$export$58bed631278dbc67.push(this);
    }
}
const $f0b099915f91bd21$export$1c2919332513559b = async ()=>{
    if ($f0b099915f91bd21$var$updatePromise === undefined) return;
    await $f0b099915f91bd21$var$updatePromise;
};
const $f0b099915f91bd21$var$update = ()=>{
    if ((0, $hv4Z8.settings).perf) console.time('xin async update');
    const paths = [
        ...$f0b099915f91bd21$var$touchedPaths
    ];
    for (const path of paths)$f0b099915f91bd21$export$58bed631278dbc67.filter((listener)=>{
        let heard;
        try {
            heard = listener.test(path);
        } catch (e) {
            throw new Error(`Listener ${listener.description} threw "${e}" at "${path}"`);
        }
        if (heard === $f0b099915f91bd21$export$253d09664e30b967) {
            $f0b099915f91bd21$export$23a2283368c55ea2(listener);
            return false;
        }
        return heard;
    }).forEach((listener)=>{
        let outcome;
        try {
            outcome = listener.callback(path);
        } catch (e) {
            console.error(`Listener ${listener.description} threw "${e}" handling "${path}"`);
        }
        if (outcome === $f0b099915f91bd21$export$253d09664e30b967) $f0b099915f91bd21$export$23a2283368c55ea2(listener);
    });
    $f0b099915f91bd21$var$touchedPaths.splice(0);
    $f0b099915f91bd21$var$updateTriggered = false;
    if (typeof $f0b099915f91bd21$var$resolveUpdate === 'function') $f0b099915f91bd21$var$resolveUpdate();
    if ((0, $hv4Z8.settings).perf) console.timeEnd('xin async update');
};
const $f0b099915f91bd21$export$d0b7ea69ab6056df = (touchable)=>{
    const path = typeof touchable === 'string' ? touchable : (0, $5hOlm.xinPath)(touchable);
    if (path === undefined) {
        console.error('touch was called on an invalid target', touchable);
        throw new Error('touch was called on an invalid target');
    }
    if ($f0b099915f91bd21$var$updateTriggered === false) {
        $f0b099915f91bd21$var$updatePromise = new Promise((resolve)=>{
            $f0b099915f91bd21$var$resolveUpdate = resolve;
        });
        $f0b099915f91bd21$var$updateTriggered = setTimeout($f0b099915f91bd21$var$update);
    }
    if ($f0b099915f91bd21$var$touchedPaths.find((touchedPath)=>path.startsWith(touchedPath)) == null) $f0b099915f91bd21$var$touchedPaths.push(path);
};
const $f0b099915f91bd21$export$d1203567a167490e = (test, callback)=>{
    return new $f0b099915f91bd21$export$c92b1d5f43586026(test, callback);
};
const $f0b099915f91bd21$export$23a2283368c55ea2 = (listener)=>{
    const index = $f0b099915f91bd21$export$58bed631278dbc67.indexOf(listener);
    if (index > -1) $f0b099915f91bd21$export$58bed631278dbc67.splice(index, 1);
    else throw new Error('unobserve failed, listener not found');
};

});
parcelRegister("5hOlm", function(module, exports) {

$parcel$export(module.exports, "BOUND_CLASS", () => $e921b0bd4f6415ab$export$c6592bbc1eebb717);
$parcel$export(module.exports, "BOUND_SELECTOR", () => $e921b0bd4f6415ab$export$4c0223f67078aeac);
$parcel$export(module.exports, "EVENT_CLASS", () => $e921b0bd4f6415ab$export$6a7099543a9795c7);
$parcel$export(module.exports, "EVENT_SELECTOR", () => $e921b0bd4f6415ab$export$21d9322c3477441b);
$parcel$export(module.exports, "XIN_PATH", () => $e921b0bd4f6415ab$export$a3622eb3b5dd592a);
$parcel$export(module.exports, "XIN_VALUE", () => $e921b0bd4f6415ab$export$bdd0d039ad781534);
$parcel$export(module.exports, "xinPath", () => $e921b0bd4f6415ab$export$40700dafb97c3799);
$parcel$export(module.exports, "xinValue", () => $e921b0bd4f6415ab$export$5dcba2d45033d435);
$parcel$export(module.exports, "elementToHandlers", () => $e921b0bd4f6415ab$export$fe712848e6e66613);
$parcel$export(module.exports, "elementToBindings", () => $e921b0bd4f6415ab$export$1f922de8d0ecbb7e);
$parcel$export(module.exports, "cloneWithBindings", () => $e921b0bd4f6415ab$export$fa8cc6a36b1ccd7f);
$parcel$export(module.exports, "elementToItem", () => $e921b0bd4f6415ab$export$86caed35dd837d06);
$parcel$export(module.exports, "getListItem", () => $e921b0bd4f6415ab$export$4c309843c07ce679);

var $19FSF = parcelRequire("19FSF");
const $e921b0bd4f6415ab$export$c6592bbc1eebb717 = '-xin-data';
const $e921b0bd4f6415ab$export$4c0223f67078aeac = `.${$e921b0bd4f6415ab$export$c6592bbc1eebb717}`;
const $e921b0bd4f6415ab$export$6a7099543a9795c7 = '-xin-event';
const $e921b0bd4f6415ab$export$21d9322c3477441b = `.${$e921b0bd4f6415ab$export$6a7099543a9795c7}`;
const $e921b0bd4f6415ab$export$a3622eb3b5dd592a = Symbol('xin-path');
const $e921b0bd4f6415ab$export$bdd0d039ad781534 = Symbol('xin-value');
const $e921b0bd4f6415ab$export$40700dafb97c3799 = (x)=>{
    return x[$e921b0bd4f6415ab$export$a3622eb3b5dd592a];
};
function $e921b0bd4f6415ab$export$5dcba2d45033d435(x) {
    return typeof x === 'object' && x !== null ? x[$e921b0bd4f6415ab$export$bdd0d039ad781534] || x : x;
}
const $e921b0bd4f6415ab$export$fe712848e6e66613 = new WeakMap();
const $e921b0bd4f6415ab$export$1f922de8d0ecbb7e = new WeakMap();
const $e921b0bd4f6415ab$export$4cac8128ba61a55f = (element)=>{
    return {
        eventBindings: $e921b0bd4f6415ab$export$fe712848e6e66613.get(element),
        dataBindings: $e921b0bd4f6415ab$export$1f922de8d0ecbb7e.get(element)
    };
};
const $e921b0bd4f6415ab$export$fa8cc6a36b1ccd7f = (element)=>{
    const cloned = element.cloneNode();
    if (cloned instanceof Element) {
        const dataBindings = $e921b0bd4f6415ab$export$1f922de8d0ecbb7e.get(element);
        const eventHandlers = $e921b0bd4f6415ab$export$fe712848e6e66613.get(element);
        if (dataBindings != null) // @ts-expect-error-error
        $e921b0bd4f6415ab$export$1f922de8d0ecbb7e.set(cloned, (0, $19FSF.deepClone)(dataBindings));
        if (eventHandlers != null) // @ts-expect-error-error
        $e921b0bd4f6415ab$export$fe712848e6e66613.set(cloned, (0, $19FSF.deepClone)(eventHandlers));
    }
    for (const node of element instanceof HTMLTemplateElement ? element.content.childNodes : element.childNodes)if (node instanceof Element || node instanceof DocumentFragment) cloned.appendChild($e921b0bd4f6415ab$export$fa8cc6a36b1ccd7f(node));
    else cloned.appendChild(node.cloneNode());
    return cloned;
};
const $e921b0bd4f6415ab$export$86caed35dd837d06 = new WeakMap();
const $e921b0bd4f6415ab$export$4c309843c07ce679 = (element)=>{
    const html = document.body.parentElement;
    while(element.parentElement != null && element.parentElement !== html){
        const item = $e921b0bd4f6415ab$export$86caed35dd837d06.get(element);
        if (item != null) return item;
        element = element.parentElement;
    }
    return false;
};

});
parcelRegister("19FSF", function(module, exports) {

$parcel$export(module.exports, "deepClone", () => $5165f04a46b33615$export$b7d58db314e0ac27);
function $5165f04a46b33615$export$b7d58db314e0ac27(obj) {
    if (obj == null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map($5165f04a46b33615$export$b7d58db314e0ac27);
    const clone = {};
    for(const key in obj){
        const val = obj[key];
        if (obj != null && typeof obj === 'object') clone[key] = $5165f04a46b33615$export$b7d58db314e0ac27(val);
        else clone[key] = val;
    }
    return clone;
}

});



parcelRegister("aMI8M", function(module, exports) {

$parcel$export(module.exports, "getByPath", () => $c62be31ef05b0c90$export$44b5bed83342a92f);
$parcel$export(module.exports, "setByPath", () => $c62be31ef05b0c90$export$f65a19d15516795e);
// unique tokens passed to set by path to delete or create properties

var $5lDHe = parcelRequire("5lDHe");
const $c62be31ef05b0c90$var$now36 = ()=>new Date(parseInt('1000000000', 36) + Date.now()).valueOf().toString(36).slice(1);
let $c62be31ef05b0c90$var$_seq = 0;
const $c62be31ef05b0c90$var$seq = ()=>(parseInt('10000', 36) + ++$c62be31ef05b0c90$var$_seq).toString(36).slice(-5);
const $c62be31ef05b0c90$var$id = ()=>$c62be31ef05b0c90$var$now36() + $c62be31ef05b0c90$var$seq();
const $c62be31ef05b0c90$var$_delete_ = {};
const $c62be31ef05b0c90$var$_newObject_ = {};
function $c62be31ef05b0c90$export$f5d2dd4cfd729958(path) {
    if (path === '') return [];
    if (Array.isArray(path)) return path;
    else {
        const parts = [];
        while(path.length > 0){
            let index = path.search(/\[[^\]]+\]/);
            if (index === -1) {
                parts.push(path.split('.'));
                break;
            } else {
                const part = path.slice(0, index);
                path = path.slice(index);
                if (part !== '') parts.push(part.split('.'));
                index = path.indexOf(']') + 1;
                parts.push(path.slice(1, index - 1));
                // handle paths dereferencing array element like foo[0].id
                if (path.slice(index, index + 1) === '.') index += 1;
                path = path.slice(index);
            }
        }
        return parts;
    }
}
const $c62be31ef05b0c90$var$idPathMaps = new WeakMap();
function $c62be31ef05b0c90$var$buildIdPathValueMap(array, idPath) {
    if ($c62be31ef05b0c90$var$idPathMaps.get(array) === undefined) $c62be31ef05b0c90$var$idPathMaps.set(array, {});
    if ($c62be31ef05b0c90$var$idPathMaps.get(array)[idPath] === undefined) $c62be31ef05b0c90$var$idPathMaps.get(array)[idPath] = {};
    const map = $c62be31ef05b0c90$var$idPathMaps.get(array)[idPath];
    if (idPath === '_auto_') array.forEach((item, idx)=>{
        if (item._auto_ === undefined) item._auto_ = $c62be31ef05b0c90$var$id();
        map[item._auto_ + ''] = idx;
    });
    else array.forEach((item, idx)=>{
        map[$c62be31ef05b0c90$export$44b5bed83342a92f(item, idPath) + ''] = idx;
    });
    return map;
}
function $c62be31ef05b0c90$var$getIdPathMap(array, idPath) {
    if ($c62be31ef05b0c90$var$idPathMaps.get(array) === undefined || $c62be31ef05b0c90$var$idPathMaps.get(array)[idPath] === undefined) return $c62be31ef05b0c90$var$buildIdPathValueMap(array, idPath);
    else return $c62be31ef05b0c90$var$idPathMaps.get(array)[idPath];
}
function $c62be31ef05b0c90$var$keyToIndex(array, idPath, idValue) {
    idValue = idValue + '';
    let idx = $c62be31ef05b0c90$var$getIdPathMap(array, idPath)[idValue];
    if (idx === undefined || $c62be31ef05b0c90$export$44b5bed83342a92f(array[idx], idPath) + '' !== idValue) idx = $c62be31ef05b0c90$var$buildIdPathValueMap(array, idPath)[idValue];
    return idx;
}
function $c62be31ef05b0c90$var$byKey(obj, key, valueToInsert) {
    if (obj[key] === undefined && valueToInsert !== undefined) obj[key] = valueToInsert;
    return obj[key];
}
function $c62be31ef05b0c90$var$byIdPath(array, idPath, idValue, valueToInsert) {
    let idx = idPath !== '' ? $c62be31ef05b0c90$var$keyToIndex(array, idPath, idValue) : idValue;
    if (valueToInsert === $c62be31ef05b0c90$var$_delete_) {
        array.splice(idx, 1);
        $c62be31ef05b0c90$var$idPathMaps.delete(array);
        return Symbol('deleted');
    } else if (valueToInsert === $c62be31ef05b0c90$var$_newObject_) {
        if (idPath === '' && array[idx] === undefined) array[idx] = {};
    } else if (valueToInsert !== undefined) {
        if (idx !== undefined) array[idx] = valueToInsert;
        else if (idPath !== '' && $c62be31ef05b0c90$export$44b5bed83342a92f(valueToInsert, idPath) + '' === idValue + '') {
            array.push(valueToInsert);
            idx = array.length - 1;
        } else throw new Error(`byIdPath insert failed at [${idPath}=${idValue}]`);
    }
    return array[idx];
}
function $c62be31ef05b0c90$var$expectArray(obj) {
    if (!Array.isArray(obj)) throw (0, $5lDHe.makeError)('setByPath failed: expected array, found', obj);
}
function $c62be31ef05b0c90$var$expectObject(obj) {
    if (obj == null || !(obj instanceof Object)) throw (0, $5lDHe.makeError)('setByPath failed: expected Object, found', obj);
}
function $c62be31ef05b0c90$export$44b5bed83342a92f(obj, path) {
    const parts = $c62be31ef05b0c90$export$f5d2dd4cfd729958(path);
    let found = obj;
    let i, iMax, j, jMax;
    for(i = 0, iMax = parts.length; found !== undefined && i < iMax; i++){
        const part = parts[i];
        if (Array.isArray(part)) for(j = 0, jMax = part.length; found !== undefined && j < jMax; j++){
            const key = part[j];
            found = found[key];
        }
        else {
            if (found.length === 0) {
                // @ts-expect-error-error
                found = found[part.slice(1)];
                if (part[0] !== '=') return undefined;
            } else if (part.includes('=')) {
                const [idPath, ...tail] = part.split('=');
                found = $c62be31ef05b0c90$var$byIdPath(found, idPath, tail.join('='));
            } else {
                j = parseInt(part, 10);
                found = found[j];
            }
        }
    }
    return found;
}
function $c62be31ef05b0c90$export$f65a19d15516795e(orig, path, val) {
    let obj = orig;
    const parts = $c62be31ef05b0c90$export$f5d2dd4cfd729958(path);
    while(obj != null && parts.length > 0){
        const part = parts.shift();
        if (typeof part === 'string') {
            const equalsOffset = part.indexOf('=');
            if (equalsOffset > -1) {
                if (equalsOffset === 0) $c62be31ef05b0c90$var$expectObject(obj);
                else $c62be31ef05b0c90$var$expectArray(obj);
                const idPath = part.slice(0, equalsOffset);
                const idValue = part.slice(equalsOffset + 1);
                obj = $c62be31ef05b0c90$var$byIdPath(obj, idPath, idValue, parts.length > 0 ? $c62be31ef05b0c90$var$_newObject_ : val);
                if (parts.length === 0) return true;
            } else {
                $c62be31ef05b0c90$var$expectArray(obj);
                const idx = parseInt(part, 10);
                if (parts.length > 0) obj = obj[idx];
                else {
                    if (val !== $c62be31ef05b0c90$var$_delete_) {
                        if (obj[idx] === val) return false;
                        obj[idx] = val;
                    } else obj.splice(idx, 1);
                    return true;
                }
            }
        } else if (Array.isArray(part) && part.length > 0) {
            $c62be31ef05b0c90$var$expectObject(obj);
            while(part.length > 0){
                const key = part.shift();
                if (part.length > 0 || parts.length > 0) // if we're at the end of part.length then we need to insert an array
                obj = $c62be31ef05b0c90$var$byKey(obj, key, part.length > 0 ? {} : []);
                else {
                    if (val !== $c62be31ef05b0c90$var$_delete_) {
                        if (obj[key] === val) return false;
                        obj[key] = val;
                    } else {
                        if (!Object.prototype.hasOwnProperty.call(obj, key)) return false;
                        delete obj[key];
                    }
                    return true;
                }
            }
        } else throw new Error(`setByPath failed, bad path ${path}`);
    }
    throw new Error(`setByPath(${orig}, ${path}, ${val}) failed`);
}
function $c62be31ef05b0c90$export$102e532907108dad(orig, path) {
    if ($c62be31ef05b0c90$export$44b5bed83342a92f(orig, path) !== null) $c62be31ef05b0c90$export$f65a19d15516795e(orig, path, $c62be31ef05b0c90$var$_delete_);
}

});
parcelRegister("5lDHe", function(module, exports) {

$parcel$export(module.exports, "makeError", () => $31366a4b885eb48b$export$5a4bb2b1c89bdce7);
const $31366a4b885eb48b$var$stringify = (x)=>{
    try {
        return JSON.stringify(x);
    } catch (_) {
        return '{has circular references}';
    }
};
const $31366a4b885eb48b$export$5a4bb2b1c89bdce7 = (...messages)=>new Error(messages.map($31366a4b885eb48b$var$stringify).join(' '));

});




parcelRegister("buKmK", function(module, exports) {

$parcel$export(module.exports, "bindings", () => $7d9f6326e1d5d994$export$97a1a3e6f39778d2);

var $2dgdI = parcelRequire("2dgdI");

var $gbrAN = parcelRequire("gbrAN");
const $7d9f6326e1d5d994$export$97a1a3e6f39778d2 = {
    value: {
        toDOM: (0, $gbrAN.setValue),
        fromDOM (element) {
            return (0, $gbrAN.getValue)(element);
        }
    },
    set: {
        toDOM: (0, $gbrAN.setValue)
    },
    text: {
        toDOM (element, value) {
            element.textContent = value;
        }
    },
    enabled: {
        toDOM (element, value) {
            element.disabled = !value;
        }
    },
    disabled: {
        toDOM (element, value) {
            element.disabled = Boolean(value);
        }
    },
    style: {
        toDOM (element, value) {
            if (typeof value === 'object') for (const prop of Object.keys(value))// @ts-expect-error typescript has a strange/incorrect idea of what element.style is
            element.style[prop] = value[prop];
            else if (typeof value === 'string') element.setAttribute('style', value);
            else throw new Error('style binding expects either a string or object');
        }
    },
    list: {
        toDOM (element, value, options) {
            const listBinding = (0, $2dgdI.getListBinding)(element, options);
            listBinding.update(value);
        }
    }
};

});
parcelRegister("2dgdI", function(module, exports) {

$parcel$export(module.exports, "getListBinding", () => $ea2c6a36710de0a8$export$b0eb386be3b9fed8);

var $hv4Z8 = parcelRequire("hv4Z8");

var $gbrAN = parcelRequire("gbrAN");

var $9nL7f = parcelRequire("9nL7f");

var $eppu5 = parcelRequire("eppu5");

var $5hOlm = parcelRequire("5hOlm");
const $ea2c6a36710de0a8$var$listBindingRef = Symbol('list-binding');
const $ea2c6a36710de0a8$var$SLICE_INTERVAL_MS = 16 // 60fps
;
function $ea2c6a36710de0a8$var$updateRelativeBindings(element, path) {
    const boundElements = [
        ...element.querySelectorAll((0, $5hOlm.BOUND_SELECTOR))
    ];
    if (element.matches((0, $5hOlm.BOUND_SELECTOR))) boundElements.unshift(element);
    for (const boundElement of boundElements){
        const bindings = (0, $5hOlm.elementToBindings).get(boundElement);
        for (const binding of bindings){
            if (binding.path.startsWith('^')) binding.path = `${path}${binding.path.substring(1)}`;
            if (binding.binding.toDOM != null) binding.binding.toDOM(boundElement, (0, $eppu5.xin)[binding.path]);
        }
    }
}
class $ea2c6a36710de0a8$var$ListBinding {
    constructor(boundElement, options = {}){
        this._array = [];
        this.boundElement = boundElement;
        this.itemToElement = new WeakMap();
        if (boundElement.children.length !== 1) throw new Error('ListBinding expects an element with exactly one child element');
        if (boundElement.children[0] instanceof HTMLTemplateElement) {
            const template = boundElement.children[0];
            if (template.content.children.length !== 1) throw new Error('ListBinding expects a template with exactly one child element');
            this.template = (0, $5hOlm.cloneWithBindings)(template.content.children[0]);
        } else {
            this.template = boundElement.children[0];
            this.template.remove();
        }
        this.listTop = document.createElement('div');
        this.listBottom = document.createElement('div');
        this.boundElement.append(this.listTop);
        this.boundElement.append(this.listBottom);
        this.options = options;
        if (options.virtual != null) {
            (0, $gbrAN.resizeObserver).observe(this.boundElement);
            this._update = (0, $9nL7f.throttle)(()=>{
                this.update(this._array, true);
            }, $ea2c6a36710de0a8$var$SLICE_INTERVAL_MS);
            this.boundElement.addEventListener('scroll', this._update);
            this.boundElement.addEventListener('resize', this._update);
        }
    }
    visibleSlice() {
        const { virtual: virtual, hiddenProp: hiddenProp, visibleProp: visibleProp } = this.options;
        let visibleArray = this._array;
        if (hiddenProp !== undefined) visibleArray = visibleArray.filter((item)=>item[hiddenProp] !== true);
        if (visibleProp !== undefined) visibleArray = visibleArray.filter((item)=>item[visibleProp] === true);
        let firstItem = 0;
        let lastItem = visibleArray.length - 1;
        let topBuffer = 0;
        let bottomBuffer = 0;
        if (virtual != null && this.boundElement instanceof HTMLElement) {
            const width = this.boundElement.offsetWidth;
            const height = this.boundElement.offsetHeight;
            const visibleColumns = virtual.width != null ? Math.max(1, Math.floor(width / virtual.width)) : 1;
            const visibleRows = Math.ceil(height / virtual.height) + 1;
            const totalRows = Math.ceil(visibleArray.length / visibleColumns);
            const visibleItems = visibleColumns * visibleRows;
            let topRow = Math.floor(this.boundElement.scrollTop / virtual.height);
            if (topRow > totalRows - visibleRows + 1) topRow = Math.max(0, totalRows - visibleRows + 1);
            firstItem = topRow * visibleColumns;
            lastItem = firstItem + visibleItems - 1;
            topBuffer = topRow * virtual.height;
            bottomBuffer = Math.max(totalRows * virtual.height - height - topBuffer, 0);
        }
        return {
            items: visibleArray,
            firstItem: firstItem,
            lastItem: lastItem,
            topBuffer: topBuffer,
            bottomBuffer: bottomBuffer
        };
    }
    update(array, isSlice) {
        if (array == null) array = [];
        this._array = array;
        const { hiddenProp: hiddenProp, visibleProp: visibleProp } = this.options;
        const arrayPath = (0, $5hOlm.xinPath)(array);
        const slice = this.visibleSlice();
        this.boundElement.classList.toggle('-xin-empty-list', slice.items.length === 0);
        const previousSlice = this._previousSlice;
        const { firstItem: firstItem, lastItem: lastItem, topBuffer: topBuffer, bottomBuffer: bottomBuffer } = slice;
        if (hiddenProp === undefined && visibleProp === undefined && isSlice === true && previousSlice != null && firstItem === previousSlice.firstItem && lastItem === previousSlice.lastItem) return;
        this._previousSlice = slice;
        let removed = 0;
        let moved = 0;
        let created = 0;
        for (const element of [
            ...this.boundElement.children
        ]){
            if (element === this.listTop || element === this.listBottom) continue;
            const proxy = (0, $5hOlm.elementToItem).get(element);
            if (proxy == null) element.remove();
            else {
                const idx = slice.items.indexOf(proxy);
                if (idx < firstItem || idx > lastItem) {
                    element.remove();
                    this.itemToElement.delete(proxy);
                    (0, $5hOlm.elementToItem).delete(element);
                    removed++;
                }
            }
        }
        this.listTop.style.height = String(topBuffer) + 'px';
        this.listBottom.style.height = String(bottomBuffer) + 'px';
        // build a complete new set of elements in the right order
        const elements = [];
        const { idPath: idPath } = this.options;
        for(let i = firstItem; i <= lastItem; i++){
            const item = slice.items[i];
            if (item === undefined) continue;
            let element = this.itemToElement.get((0, $5hOlm.xinValue)(item));
            if (element == null) {
                created++;
                element = (0, $5hOlm.cloneWithBindings)(this.template);
                if (typeof item === 'object') {
                    this.itemToElement.set((0, $5hOlm.xinValue)(item), element);
                    (0, $5hOlm.elementToItem).set(element, (0, $5hOlm.xinValue)(item));
                }
                this.boundElement.insertBefore(element, this.listBottom);
                if (idPath != null) {
                    const idValue = item[idPath];
                    const itemPath = `${arrayPath}[${idPath}=${idValue}]`;
                    $ea2c6a36710de0a8$var$updateRelativeBindings(element, itemPath);
                } else {
                    const itemPath = `${arrayPath}[${i}]`;
                    $ea2c6a36710de0a8$var$updateRelativeBindings(element, itemPath);
                }
            }
            elements.push(element);
        }
        // make sure all the elements are in the DOM and in the correct location
        let insertionPoint = null;
        for (const element of elements){
            if (element.previousElementSibling !== insertionPoint) {
                moved++;
                if (insertionPoint?.nextElementSibling != null) this.boundElement.insertBefore(element, insertionPoint.nextElementSibling);
                else this.boundElement.insertBefore(element, this.listBottom);
            }
            insertionPoint = element;
        }
        if ((0, $hv4Z8.settings).perf) console.log(arrayPath, 'updated', {
            removed: removed,
            created: created,
            moved: moved
        });
    }
}
const $ea2c6a36710de0a8$export$b0eb386be3b9fed8 = (boundElement, options)=>{
    let listBinding = boundElement[$ea2c6a36710de0a8$var$listBindingRef];
    if (listBinding === undefined) {
        listBinding = new $ea2c6a36710de0a8$var$ListBinding(boundElement, options);
        boundElement[$ea2c6a36710de0a8$var$listBindingRef] = listBinding;
    }
    return listBinding;
};

});
parcelRegister("gbrAN", function(module, exports) {

$parcel$export(module.exports, "dispatch", () => $f314c6851ceb0f9e$export$635e15bbd66f01ea);
$parcel$export(module.exports, "setValue", () => $f314c6851ceb0f9e$export$80746c6bc6142fc8);
$parcel$export(module.exports, "getValue", () => $f314c6851ceb0f9e$export$bf7199a9ebcb84a9);
$parcel$export(module.exports, "resizeObserver", () => $f314c6851ceb0f9e$export$b13421f1ae71d316);
$parcel$export(module.exports, "appendContentToElement", () => $f314c6851ceb0f9e$export$6bb13967611cdb1);

var $5hOlm = parcelRequire("5hOlm");
const $f314c6851ceb0f9e$export$635e15bbd66f01ea = (target, type)=>{
    const event = new Event(type);
    target.dispatchEvent(event);
};
const $f314c6851ceb0f9e$var$valueType = (element)=>{
    if (element instanceof HTMLInputElement) return element.type;
    else if (element instanceof HTMLSelectElement && element.hasAttribute('multiple')) return 'multi-select';
    else return 'other';
};
const $f314c6851ceb0f9e$export$80746c6bc6142fc8 = (element, newValue)=>{
    switch($f314c6851ceb0f9e$var$valueType(element)){
        case 'radio':
            element.checked = element.value === newValue;
            break;
        case 'checkbox':
            element.checked = !!newValue;
            break;
        case 'date':
            element.valueAsDate = new Date(newValue);
            break;
        case 'multi-select':
            for (const option of [
                ...element.querySelectorAll('option')
            ])option.selected = newValue[option.value];
            break;
        default:
            element.value = newValue;
    }
};
const $f314c6851ceb0f9e$export$bf7199a9ebcb84a9 = (element)=>{
    switch($f314c6851ceb0f9e$var$valueType(element)){
        case 'radio':
            {
                const radio = element.parentElement?.querySelector(`[name="${element.name}"]:checked`);
                return radio != null ? radio.value : null;
            }
        case 'checkbox':
            return element.checked;
        case 'date':
            return element.valueAsDate?.toISOString();
        case 'multi-select':
            return [
                ...element.querySelectorAll('option')
            ].reduce((map, option)=>{
                map[option.value] = option.selected;
                return map;
            }, {});
        default:
            return element.value;
    }
};
const { ResizeObserver: $f314c6851ceb0f9e$var$ResizeObserver } = globalThis;
const $f314c6851ceb0f9e$export$b13421f1ae71d316 = $f314c6851ceb0f9e$var$ResizeObserver != null ? new $f314c6851ceb0f9e$var$ResizeObserver((entries)=>{
    for (const entry of entries){
        const element = entry.target;
        $f314c6851ceb0f9e$export$635e15bbd66f01ea(element, 'resize');
    }
}) : {
    observe () {},
    unobserve () {}
};
const $f314c6851ceb0f9e$export$6bb13967611cdb1 = (elt, content, cloneElements = true)=>{
    if (elt != null && content != null) {
        if (typeof content === 'string') elt.textContent = content;
        else if (Array.isArray(content)) content.forEach((node)=>{
            elt.append(node instanceof Node && cloneElements ? (0, $5hOlm.cloneWithBindings)(node) : node);
        });
        else if (content instanceof Node) elt.append(cloneElements ? (0, $5hOlm.cloneWithBindings)(content) : content);
        else throw new Error('expect text content or document node');
    }
};

});

parcelRegister("9nL7f", function(module, exports) {

$parcel$export(module.exports, "debounce", () => $fb7e454a17657925$export$61fc7d43ac8f84b0);
$parcel$export(module.exports, "throttle", () => $fb7e454a17657925$export$de363e709c412c8a);
const $fb7e454a17657925$export$61fc7d43ac8f84b0 = (origFn, minInterval = 250)=>{
    let debounceId;
    return (...args)=>{
        if (debounceId !== undefined) clearTimeout(debounceId);
        debounceId = setTimeout(()=>{
            origFn(...args);
        }, minInterval);
    };
};
const $fb7e454a17657925$export$de363e709c412c8a = (origFn, minInterval = 250)=>{
    let debounceId;
    let previousCall = Date.now() - minInterval;
    let inFlight = false;
    return (...args)=>{
        clearTimeout(debounceId);
        debounceId = setTimeout(async ()=>{
            origFn(...args);
            previousCall = Date.now();
        }, minInterval);
        if (!inFlight && Date.now() - previousCall >= minInterval) {
            inFlight = true;
            try {
                origFn(...args);
                previousCall = Date.now();
            } finally{
                inFlight = false;
            }
        }
    };
};

});



parcelRegister("5JLBr", function(module, exports) {

$parcel$export(module.exports, "camelToKabob", () => $bed4bed3dcfb6f9a$export$87ae551bf60f4bb);
$parcel$export(module.exports, "kabobToCamel", () => $bed4bed3dcfb6f9a$export$fd322201efdc650f);
function $bed4bed3dcfb6f9a$export$87ae551bf60f4bb(s) {
    return s.replace(/[A-Z]/g, (c)=>{
        return `-${c.toLocaleLowerCase()}`;
    });
}
function $bed4bed3dcfb6f9a$export$fd322201efdc650f(s) {
    return s.replace(/-([a-z])/g, (_, c)=>{
        return c.toLocaleUpperCase();
    });
}

});




parcelRegister("lGBgM", function(module, exports) {

$parcel$export(module.exports, "makeComponent", () => $cf96335958b9d6da$export$3bc26eec1cc2439f);

var $6Jaab = parcelRequire("6Jaab");

var $aVpVG = parcelRequire("aVpVG");

var $2okor = parcelRequire("2okor");

var $9sLMf = parcelRequire("9sLMf");

var $aNHSH = parcelRequire("aNHSH");
const $cf96335958b9d6da$export$7564cc5630cf4caa = {};
function $cf96335958b9d6da$export$3bc26eec1cc2439f(tag, blueprint) {
    const { type: type, styleSpec: styleSpec } = blueprint(tag, {
        Color: $6Jaab.Color,
        Component: $aVpVG.Component,
        elements: $9sLMf.elements,
        svgElements: $9sLMf.svgElements,
        mathML: $9sLMf.mathML,
        varDefault: $2okor.varDefault,
        vars: $2okor.vars,
        xinProxy: $aNHSH.xinProxy
    });
    const packagedComponent = {
        type: type,
        creator: type.elementCreator({
            tag: tag,
            styleSpec: styleSpec
        })
    };
    $cf96335958b9d6da$export$7564cc5630cf4caa[tag] = packagedComponent;
    return packagedComponent;
}

});
parcelRegister("aNHSH", function(module, exports) {

$parcel$export(module.exports, "xinProxy", () => $7bb234cc8fd49201$export$95a552d2395ab4c4);

var $eppu5 = parcelRequire("eppu5");
function $7bb234cc8fd49201$export$95a552d2395ab4c4(obj, boxScalars = false) {
    const registered = {};
    Object.keys(obj).forEach((key)=>{
        (0, $eppu5.xin)[key] = obj[key];
        registered[key] = boxScalars ? (0, $eppu5.boxed)[key] : (0, $eppu5.xin)[key];
    });
    return registered;
}

});



/*
  Note that re-exported types should be explicitly and separately exported
  as types because of issues with parceljs

  The error messages will be very perplexing

  https://github.com/parcel-bundler/parcel/issues/4796
  https://github.com/parcel-bundler/parcel/issues/4240
  https://devblogs.microsoft.com/typescript/announcing-typescript-3-8/#type-only-imports-exports
*/ 
var $kCu8Y = parcelRequire("kCu8Y");

var $buKmK = parcelRequire("buKmK");

var $2okor = parcelRequire("2okor");

var $6Jaab = parcelRequire("6Jaab");

var $aVpVG = parcelRequire("aVpVG");

var $9sLMf = parcelRequire("9sLMf");

var $eppu5 = parcelRequire("eppu5");

var $5hOlm = parcelRequire("5hOlm");

var $9nL7f = parcelRequire("9nL7f");
const $4c651860c5272284$export$93b87f7746612069 = (test = ()=>true)=>{
    const savedState = localStorage.getItem('xin-state');
    if (savedState != null) {
        const state = JSON.parse(savedState);
        for (const key of Object.keys(state).filter(test))if ((0, $eppu5.xin)[key] !== undefined) Object.assign((0, $eppu5.xin)[key], state[key]);
        else (0, $eppu5.xin)[key] = state[key];
    }
    const saveState = (0, $9nL7f.debounce)(()=>{
        const obj = {};
        const state = (0, $eppu5.xin)[0, $5hOlm.XIN_VALUE];
        for (const key of Object.keys(state).filter(test))obj[key] = state[key];
        localStorage.setItem('xin-state', JSON.stringify(obj));
        console.log('xin state saved to localStorage');
    }, 500);
    (0, $eppu5.observe)(test, saveState);
};



var $5hOlm = parcelRequire("5hOlm");

var $lGBgM = parcelRequire("lGBgM");

var $drWRQ = parcelRequire("drWRQ");

var $hv4Z8 = parcelRequire("hv4Z8");

var $9nL7f = parcelRequire("9nL7f");

var $eppu5 = parcelRequire("eppu5");
var $5lOGz = parcelRequire("5lOGz");
parcelRequire("3x0mh");
var $526cc5d62ff194fb$exports = {};



var $aNHSH = parcelRequire("aNHSH");


var $b5796eaeba5c782e$export$2385a24977818dd0 = parcelRequire("kCu8Y").bind;
var $b5796eaeba5c782e$export$af631764ddc44097 = parcelRequire("kCu8Y").on;
var $7d9f6326e1d5d994$export$97a1a3e6f39778d2 = parcelRequire("buKmK").bindings;
var $49cee7f7f866c751$export$dbf350e5966cf602 = parcelRequire("2okor").css;
var $49cee7f7f866c751$export$8279dba9b7d4e420 = parcelRequire("2okor").invertLuminance;
var $49cee7f7f866c751$export$808aaf1b460dc9af = parcelRequire("2okor").darkMode;
var $49cee7f7f866c751$export$90d0ea046136e3ed = parcelRequire("2okor").initVars;
var $49cee7f7f866c751$export$3cb96c9f6c8d16a4 = parcelRequire("2okor").vars;
var $49cee7f7f866c751$export$75c0e6adb3e38f31 = parcelRequire("2okor").varDefault;
var $49cee7f7f866c751$export$9d753cd7ae895cce = parcelRequire("2okor").StyleSheet;
var $72989831e95a2bab$export$892596cec99bc70e = parcelRequire("6Jaab").Color;
var $cd387b053feba574$export$16fa2f45be04daa8 = parcelRequire("aVpVG").Component;
var $9e0c0b8784c80412$export$7a5d735b2ab6389d = parcelRequire("9sLMf").elements;
var $9e0c0b8784c80412$export$cf20112a1bc148da = parcelRequire("9sLMf").svgElements;
var $9e0c0b8784c80412$export$8ec252cfdd664597 = parcelRequire("9sLMf").mathML;
var $e921b0bd4f6415ab$export$4c309843c07ce679 = parcelRequire("5hOlm").getListItem;
var $e921b0bd4f6415ab$export$40700dafb97c3799 = parcelRequire("5hOlm").xinPath;
var $e921b0bd4f6415ab$export$5dcba2d45033d435 = parcelRequire("5hOlm").xinValue;
var $cf96335958b9d6da$export$3bc26eec1cc2439f = parcelRequire("lGBgM").makeComponent;
var $0e50e8a626908591$export$5e0dd9fd5d74e0c5 = parcelRequire("drWRQ").MoreMath;
var $34b63e9d5b96494c$export$a5a6e0b888b2c992 = parcelRequire("hv4Z8").settings;
var $fb7e454a17657925$export$de363e709c412c8a = parcelRequire("9nL7f").throttle;
var $fb7e454a17657925$export$61fc7d43ac8f84b0 = parcelRequire("9nL7f").debounce;
var $547f11326d897190$export$966034e6c6823eb0 = parcelRequire("eppu5").xin;
var $547f11326d897190$export$d1203567a167490e = parcelRequire("eppu5").observe;
var $f0b099915f91bd21$export$23a2283368c55ea2 = parcelRequire("5lOGz").unobserve;
var $f0b099915f91bd21$export$d0b7ea69ab6056df = parcelRequire("5lOGz").touch;
var $f0b099915f91bd21$export$253d09664e30b967 = parcelRequire("5lOGz").observerShouldBeRemoved;
var $f0b099915f91bd21$export$1c2919332513559b = parcelRequire("5lOGz").updates;
var $7bb234cc8fd49201$export$95a552d2395ab4c4 = parcelRequire("aNHSH").xinProxy;
var Blueprint = parcelRequire("3x0mh").Blueprint;
var blueprint = parcelRequire("3x0mh").blueprint;
var BlueprintLoader = parcelRequire("3x0mh").BlueprintLoader;
var blueprintLoader = parcelRequire("3x0mh").blueprintLoader;
var $db8c79eba3148e96$exports = parcelRequire("3x0mh")["*"];
export {$b5796eaeba5c782e$export$2385a24977818dd0 as bind, $b5796eaeba5c782e$export$af631764ddc44097 as on, $7d9f6326e1d5d994$export$97a1a3e6f39778d2 as bindings, $49cee7f7f866c751$export$dbf350e5966cf602 as css, $49cee7f7f866c751$export$8279dba9b7d4e420 as invertLuminance, $49cee7f7f866c751$export$808aaf1b460dc9af as darkMode, $49cee7f7f866c751$export$90d0ea046136e3ed as initVars, $49cee7f7f866c751$export$3cb96c9f6c8d16a4 as vars, $49cee7f7f866c751$export$75c0e6adb3e38f31 as varDefault, $49cee7f7f866c751$export$9d753cd7ae895cce as StyleSheet, $72989831e95a2bab$export$892596cec99bc70e as Color, $cd387b053feba574$export$16fa2f45be04daa8 as Component, $9e0c0b8784c80412$export$7a5d735b2ab6389d as elements, $9e0c0b8784c80412$export$cf20112a1bc148da as svgElements, $9e0c0b8784c80412$export$8ec252cfdd664597 as mathML, $4c651860c5272284$export$93b87f7746612069 as hotReload, $e921b0bd4f6415ab$export$4c309843c07ce679 as getListItem, $e921b0bd4f6415ab$export$40700dafb97c3799 as xinPath, $e921b0bd4f6415ab$export$5dcba2d45033d435 as xinValue, $cf96335958b9d6da$export$3bc26eec1cc2439f as makeComponent, $0e50e8a626908591$export$5e0dd9fd5d74e0c5 as MoreMath, $34b63e9d5b96494c$export$a5a6e0b888b2c992 as settings, $fb7e454a17657925$export$de363e709c412c8a as throttle, $fb7e454a17657925$export$61fc7d43ac8f84b0 as debounce, $547f11326d897190$export$966034e6c6823eb0 as xin, $547f11326d897190$export$d1203567a167490e as observe, $f0b099915f91bd21$export$23a2283368c55ea2 as unobserve, $f0b099915f91bd21$export$d0b7ea69ab6056df as touch, $f0b099915f91bd21$export$253d09664e30b967 as observerShouldBeRemoved, $f0b099915f91bd21$export$1c2919332513559b as updates, $7bb234cc8fd49201$export$95a552d2395ab4c4 as xinProxy, Blueprint, blueprint, BlueprintLoader, blueprintLoader, $db8c79eba3148e96$exports as default};
//# sourceMappingURL=module.js.map
