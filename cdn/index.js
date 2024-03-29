let e,t;function r(e,t,r,s){Object.defineProperty(e,t,{get:r,set:s,enumerable:!0,configurable:!0})}let s={debug:!1,perf:!1};function i(e){if(null==e||"object"!=typeof e)return e;if(Array.isArray(e))return e.map(i);let t={};for(let r in e){let s=e[r];null!=e&&"object"==typeof e?t[r]=i(s):t[r]=s}return t}let n="-xin-data",o=`.${n}`,l="-xin-event",a=`.${l}`,c=Symbol("xin-path"),h=Symbol("xin-value"),u=e=>e[c];function d(e){return"object"==typeof e&&null!==e&&e[h]||e}let f=new WeakMap,p=new WeakMap,b=e=>{let t=e.cloneNode();if(t instanceof HTMLElement){let r=p.get(e),s=f.get(e);null!=r&&p.set(t,i(r)),null!=s&&f.set(t,i(s))}for(let r of e instanceof HTMLTemplateElement?e.content.childNodes:e.childNodes)r instanceof HTMLElement||r instanceof DocumentFragment?t.appendChild(b(r)):t.appendChild(r.cloneNode());return t},m=new WeakMap,g=e=>{let t=document.body.parentElement;for(;null!=e.parentElement&&e.parentElement!==t;){let t=m.get(e);if(null!=t)return t;e=e.parentElement}return!1},y=Symbol("observer should be removed"),$=[],v=[],x=!1;class w{constructor(e,t){let r;let s="string"==typeof t?`"${t}"`:`function ${t.name}`;if("string"==typeof e)this.test=t=>"string"==typeof t&&""!==t&&(e.startsWith(t)||t.startsWith(e)),r=`test = "${e}"`;else if(e instanceof RegExp)this.test=e.test.bind(e),r=`test = "${e.toString()}"`;else if(e instanceof Function)this.test=e,r=`test = function ${e.name}`;else throw Error("expect listener test to be a string, RegExp, or test function");if(this.description=`${r}, ${s}`,"function"==typeof t)this.callback=t;else throw Error("expect callback to be a path or function");$.push(this)}}let E=async()=>{void 0!==e&&await e},S=()=>{for(let e of(s.perf&&console.time("xin async update"),[...v]))$.filter(t=>{let r;try{r=t.test(e)}catch(r){throw Error(`Listener ${t.description} threw "${r}" at "${e}"`)}return r===y?(C(t),!1):r}).forEach(t=>{let r;try{r=t.callback(e)}catch(r){console.error(`Listener ${t.description} threw "${r}" handling "${e}"`)}r===y&&C(t)});v.splice(0),x=!1,"function"==typeof t&&t(),s.perf&&console.timeEnd("xin async update")},A=r=>{let s="string"==typeof r?r:u(r);if(void 0===s)throw console.error("touch was called on an invalid target",r),Error("touch was called on an invalid target");!1===x&&(e=new Promise(e=>{t=e}),x=setTimeout(S)),null==v.find(e=>s.startsWith(e))&&v.push(s)},_=(e,t)=>new w(e,t),C=e=>{let t=$.indexOf(e);if(t>-1)$.splice(t,1);else throw Error("unobserve failed, listener not found")},k=e=>{try{return JSON.stringify(e)}catch(e){return"{has circular references}"}},M=(...e)=>Error(e.map(k).join(" ")),O=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1),L=0,T=()=>(parseInt("10000",36)+ ++L).toString(36).slice(-5),j=()=>O()+T(),N={},P={};function D(e){if(""===e)return[];if(Array.isArray(e))return e;{let t=[];for(;e.length>0;){let r=e.search(/\[[^\]]+\]/);if(-1===r){t.push(e.split("."));break}{let s=e.slice(0,r);e=e.slice(r),""!==s&&t.push(s.split(".")),r=e.indexOf("]")+1,t.push(e.slice(1,r-1)),"."===e.slice(r,r+1)&&(r+=1),e=e.slice(r)}}return t}}let F=new WeakMap;function R(e,t){void 0===F.get(e)&&F.set(e,{}),void 0===F.get(e)[t]&&(F.get(e)[t]={});let r=F.get(e)[t];return"_auto_"===t?e.forEach((e,t)=>{void 0===e._auto_&&(e._auto_=j()),r[e._auto_+""]=t}):e.forEach((e,s)=>{r[H(e,t)+""]=s}),r}function B(e,t,r,s){var i;let n;let o=""!==t?(i=r+"",(void 0===(n=(void 0===F.get(e)||void 0===F.get(e)[t]?R(e,t):F.get(e)[t])[i])||H(e[n],t)+""!==i)&&(n=R(e,t)[i]),n):r;if(s===N)return e.splice(o,1),F.delete(e),Symbol("deleted");if(s===P)""===t&&void 0===e[o]&&(e[o]={});else if(void 0!==s){if(void 0!==o)e[o]=s;else if(""!==t&&H(s,t)+""==r+"")e.push(s),o=e.length-1;else throw Error(`byIdPath insert failed at [${t}=${r}]`)}return e[o]}function q(e){if(!Array.isArray(e))throw M("setByPath failed: expected array, found",e)}function W(e){if(null==e||!(e instanceof Object))throw M("setByPath failed: expected Object, found",e)}function H(e,t){let r,s,i,n;let o=D(t),l=e;for(r=0,s=o.length;void 0!==l&&r<s;r++){let e=o[r];if(Array.isArray(e))for(i=0,n=e.length;void 0!==l&&i<n;i++)l=l[e[i]];else if(0===l.length){if(l=l[e.slice(1)],"="!==e[0])return}else if(e.includes("=")){let[t,...r]=e.split("=");l=B(l,t,r.join("="))}else l=l[i=parseInt(e,10)]}return l}let I=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],z={},V=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,Q=e=>V.test(e),J=(e="",t="")=>""===e?t:null!==t.match(/^\d+$/)||t.includes("=")?`${e}[${t}]`:`${e}.${t}`,Z={string:e=>new String(e),boolean:e=>new Boolean(e),bigint:e=>e,symbol:e=>e,number:e=>new Number(e)};function G(e,t){let r=typeof e;return void 0===e||"object"===r||"function"===r?e:new Proxy(Z[r](e),U(t,!0))}let U=(e,t)=>({get(r,s){if(s===c)return e;if(s===h){for(;void 0!==u(r);)r=d(r);return r}if("symbol"==typeof s)return r[s];let i=s,n=i.match(/^([^.[]+)\.(.+)$/)??i.match(/^([^\]]+)(\[.+)/)??i.match(/^(\[[^\]]+\])\.(.+)$/)??i.match(/^(\[[^\]]+\])\[(.+)$/);if(null!==n){let[,s,i]=n,o=J(e,s),l=H(r,s);return null!==l&&"object"==typeof l?new Proxy(l,U(o,t))[i]:l}if(i.startsWith("[")&&i.endsWith("]")&&(i=i.substring(1,i.length-1)),!Array.isArray(r)&&void 0!==r[i]||Array.isArray(r)&&i.includes("=")){let s;if(i.includes("=")){let[e,t]=i.split("=");s=r.find(r=>`${H(r,e)}`===t)}else s=r[i];return null!==s&&"object"==typeof s?new Proxy(s,U(J(e,i),t)):"function"==typeof s?s.bind(r):t?G(s,J(e,i)):s}if(!Array.isArray(r))return t?G(r[i],J(e,i)):r[i];{let s=r[i];return"function"==typeof s?(...t)=>{let s=Array.prototype[i].apply(r,t);return I.includes(i)&&A(e),s}:"object"==typeof s?new Proxy(s,U(J(e,i),t)):t?G(s,J(e,i)):s}},set(t,r,s){s=d(s);let i=J(e,r);if(!Q(i))throw Error(`setting invalid path ${i}`);return d(Y[i])!==s&&function(e,t,r){let s=e,i=D(t);for(;null!=s&&i.length>0;){let e=i.shift();if("string"==typeof e){let t=e.indexOf("=");if(t>-1){if(0===t?W(s):q(s),s=B(s,e.slice(0,t),e.slice(t+1),i.length>0?P:r),0===i.length)return!0}else{q(s);let t=parseInt(e,10);if(i.length>0)s=s[t];else{if(r!==N){if(s[t]===r)return!1;s[t]=r}else s.splice(t,1);return!0}}}else if(Array.isArray(e)&&e.length>0)for(W(s);e.length>0;){let t=e.shift();if(e.length>0||i.length>0){var n,o;n=s,o=e.length>0?{}:[],void 0===n[t]&&void 0!==o&&(n[t]=o),s=n[t]}else{if(r!==N){if(s[t]===r)return!1;s[t]=r}else{if(!Object.prototype.hasOwnProperty.call(s,t))return!1;delete s[t]}return!0}}else throw Error(`setByPath failed, bad path ${t}`)}throw Error(`setByPath(${e}, ${t}, ${r}) failed`)}(z,i,s)&&A(i),!0}}),X=(e,t)=>{let r="function"==typeof t?t:Y[t];if("function"!=typeof r)throw Error(`observe expects a function or path to a function, ${t} is neither`);return _(e,r)},Y=new Proxy(z,U("",!1)),K=new Proxy(z,U("",!0)),{document:ee,MutationObserver:et}=globalThis,er=(e,t)=>{let r=p.get(e);if(null!=r)for(let s of r){let{binding:r,options:i}=s,{path:n}=s,{toDOM:o}=r;if(null!=o){if(n.startsWith("^")){let t=g(e);if(null!=t&&null!=t[c])n=s.path=`${t[c]}${n.substring(1)}`;else throw console.error(`Cannot resolve relative binding ${n}`,e,"is not part of a list"),Error(`Cannot resolve relative binding ${n}`)}(null==t||n.startsWith(t))&&o(e,Y[n],i)}}};null!=et&&new et(e=>{e.forEach(e=>{[...e.addedNodes].forEach(e=>{e instanceof HTMLElement&&[...e.querySelectorAll(o)].forEach(e=>er(e))})})}).observe(ee.body,{subtree:!0,childList:!0}),X(()=>!0,e=>{for(let t of ee.querySelectorAll(o))er(t,e)});let es=e=>{let t=e.target.closest(o);for(;null!=t;){for(let e of p.get(t)){let{binding:r,path:s}=e,{fromDOM:i}=r;if(null!=i){let r;try{r=i(t,e.options)}catch(r){throw console.error("Cannot get value from",t,"via",e),Error("Cannot obtain value fromDOM")}if(null!=r){let e=Y[s];if(null==e)Y[s]=r;else{let t=null!=e[c]?e[h]:e,i=null!=r[c]?r[h]:r;t!==i&&(Y[s]=i)}}}}t=t.parentElement.closest(o)}};function ei(e,t,r,s){let i;if(e instanceof DocumentFragment)throw Error("bind cannot bind to a DocumentFragment");if("object"==typeof t&&void 0===t[c]&&void 0===s){let{value:e}=t;i="string"==typeof e?e:e[c],s=t,delete s.value}else i="string"==typeof t?t:t[c];if(null==i)throw Error("bind requires a path or object with xin Proxy");let{toDOM:o}=r;e.classList.add(n);let l=p.get(e);return null==l&&(l=[],p.set(e,l)),l.push({path:i,binding:r,options:s}),null==o||i.startsWith("^")||A(i),e}null!=globalThis.document&&(ee.body.addEventListener("change",es,!0),ee.body.addEventListener("input",es,!0));let en=new Set,eo=e=>{let t=e?.target.closest(a),r=!1,s=new Proxy(e,{get(t,s){if("stopPropagation"===s)return()=>{e.stopPropagation(),r=!0};{let e=t[s];return"function"==typeof e?e.bind(t):e}}});for(;!r&&null!=t;){for(let i of f.get(t)[e.type]||[]){if("function"==typeof i)i(s);else{let e=Y[i];if("function"==typeof e)e(s);else throw Error(`no event handler found at path ${i}`)}if(r)continue}t=null!=t.parentElement?t.parentElement.closest(a):null}},el=(e,t,r)=>{let s=f.get(e);e.classList.add(l),null==s&&(s={},f.set(e,s)),s[t]||(s[t]=[]),s[t].includes(r)||s[t].push(r),en.has(t)||(en.add(t),ee.body.addEventListener(t,eo,!0))},ea=(e,t)=>{let r=new Event(t);e.dispatchEvent(r)},ec=e=>e instanceof HTMLInputElement?e.type:e instanceof HTMLSelectElement&&e.hasAttribute("multiple")?"multi-select":"other",eh=(e,t)=>{switch(ec(e)){case"radio":e.checked=e.value===t;break;case"checkbox":e.checked=!!t;break;case"date":e.valueAsDate=new Date(t);break;case"multi-select":for(let r of[...e.querySelectorAll("option")])r.selected=t[r.value];break;default:e.value=t}},eu=e=>{switch(ec(e)){case"radio":{let t=e.parentElement?.querySelector(`[name="${e.name}"]:checked`);return null!=t?t.value:null}case"checkbox":return e.checked;case"date":return e.valueAsDate?.toISOString();case"multi-select":return[...e.querySelectorAll("option")].reduce((e,t)=>(e[t.value]=t.selected,e),{});default:return e.value}},{ResizeObserver:ed}=globalThis,ef=null!=ed?new ed(e=>{for(let t of e)ea(t.target,"resize")}):{observe(){},unobserve(){}},ep=(e,t,r=!0)=>{if(null!=e&&null!=t){if("string"==typeof t)e.textContent=t;else if(Array.isArray(t))t.forEach(t=>{e.append(t instanceof Node&&r?b(t):t)});else if(t instanceof Node)e.append(r?b(t):t);else throw Error("expect text content or document node")}},eb=(e,t=250)=>{let r;return(...s)=>{void 0!==r&&clearTimeout(r),r=setTimeout(()=>{e(...s)},t)}},em=(e,t=250)=>{let r;let s=Date.now()-t,i=!1;return(...n)=>{if(clearTimeout(r),r=setTimeout(async()=>{e(...n),s=Date.now()},t),!i&&Date.now()-s>=t){i=!0;try{e(...n),s=Date.now()}finally{i=!1}}}},eg=Symbol("list-binding");function ey(e,t){let r=[...e.querySelectorAll(o)];for(let s of(e.matches(o)&&r.unshift(e),r))for(let e of p.get(s))e.path.startsWith("^")&&(e.path=`${t}${e.path.substring(1)}`),null!=e.binding.toDOM&&e.binding.toDOM(s,Y[e.path])}class e${constructor(e,t={}){if(this._array=[],this.boundElement=e,this.itemToElement=new WeakMap,1!==e.children.length)throw Error("ListBinding expects an element with exactly one child element");if(e.children[0]instanceof HTMLTemplateElement){let t=e.children[0];if(1!==t.content.children.length)throw Error("ListBinding expects a template with exactly one child element");this.template=b(t.content.children[0])}else this.template=e.children[0],this.template.remove();this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),this.options=t,null!=t.virtual&&(ef.observe(this.boundElement),this._update=em(()=>{this.update(this._array,!0)},16),this.boundElement.addEventListener("scroll",this._update),this.boundElement.addEventListener("resize",this._update))}visibleSlice(){let{virtual:e,hiddenProp:t,visibleProp:r}=this.options,s=this._array;void 0!==t&&(s=s.filter(e=>!0!==e[t])),void 0!==r&&(s=s.filter(e=>!0===e[r]));let i=0,n=s.length-1,o=0,l=0;if(null!=e){let t=this.boundElement.offsetWidth,r=this.boundElement.offsetHeight,a=null!=e.width?Math.max(1,Math.floor(t/e.width)):1,c=Math.ceil(r/e.height)+1,h=Math.ceil(s.length/a),u=Math.floor(this.boundElement.scrollTop/e.height);u>h-c+1&&(u=Math.max(0,h-c+1)),n=(i=u*a)+a*c-1,o=u*e.height,l=Math.max(h*e.height-r-o,0)}return{items:s,firstItem:i,lastItem:n,topBuffer:o,bottomBuffer:l}}update(e,t){null==e&&(e=[]),this._array=e;let{hiddenProp:r,visibleProp:i}=this.options,n=u(e),o=this.visibleSlice();this.boundElement.classList.toggle("-xin-empty-list",0===o.items.length);let l=this._previousSlice,{firstItem:a,lastItem:c,topBuffer:h,bottomBuffer:f}=o;if(void 0===r&&void 0===i&&!0===t&&null!=l&&a===l.firstItem&&c===l.lastItem)return;this._previousSlice=o;let p=0,g=0,y=0;for(let e of[...this.boundElement.children]){if(e===this.listTop||e===this.listBottom)continue;let t=m.get(e);if(null==t)e.remove();else{let r=o.items.indexOf(t);(r<a||r>c)&&(e.remove(),this.itemToElement.delete(t),m.delete(e),p++)}}this.listTop.style.height=String(h)+"px",this.listBottom.style.height=String(f)+"px";let $=[],{idPath:v}=this.options;for(let e=a;e<=c;e++){let t=o.items[e];if(void 0===t)continue;let r=this.itemToElement.get(d(t));if(null==r){if(y++,r=b(this.template),"object"==typeof t&&(this.itemToElement.set(d(t),r),m.set(r,d(t))),this.boundElement.insertBefore(r,this.listBottom),null!=v){let e=t[v];ey(r,`${n}[${v}=${e}]`)}else ey(r,`${n}[${e}]`)}$.push(r)}let x=null;for(let e of $)e.previousElementSibling!==x&&(g++,x?.nextElementSibling!=null?this.boundElement.insertBefore(e,x.nextElementSibling):this.boundElement.insertBefore(e,this.listBottom)),x=e;s.perf&&console.log(n,"updated",{removed:p,created:y,moved:g})}}let ev=(e,t)=>{let r=e[eg];return void 0===r&&(r=new e$(e,t),e[eg]=r),r},ex={value:{toDOM(e,t){eh(e,t)},fromDOM:e=>eu(e)},text:{toDOM(e,t){e.textContent=t}},enabled:{toDOM(e,t){e.disabled=!t}},disabled:{toDOM(e,t){e.disabled=!!t}},style:{toDOM(e,t){if("object"==typeof t)for(let r of Object.keys(t))e.style[r]=t[r];else if("string"==typeof t)e.setAttribute("style",t);else throw Error("style binding expects either a string or object")}},list:{toDOM(e,t,r){ev(e,r).update(t)}}};function ew(e,t,r){return t<e?e:t>r?r:t}function eE(e,t,r){return(r=ew(0,r,1))*(t-e)+e}let eS={clamp:ew,lerp:eE},eA=(e,t,r)=>(.299*e+.587*t+.114*r)/255,e_=e=>("00"+Math.round(Number(e)).toString(16)).slice(-2);class eC{constructor(e,t,r){let s=Math.max(e/=255,t/=255,r/=255),i=s-Math.min(e,t,r),n=0!==i?s===e?(t-r)/i:s===t?2+(r-e)/i:4+(e-t)/i:0;this.h=60*n<0?60*n+360:60*n,this.s=0!==i?s<=.5?i/(2*s-i):i/(2-(2*s-i)):0,this.l=(2*s-i)/2}}let ek=void 0!==globalThis.document?globalThis.document.createElement("span"):void 0;class eM{static fromCss(e){let t=e;ek instanceof HTMLSpanElement&&(ek.style.color=e,document.body.appendChild(ek),t=getComputedStyle(ek).color,ek.remove());let[r,s,i,n]=t.match(/[\d.]+/g);return new eM(Number(r),Number(s),Number(i),null==n?1:Number(n))}static fromHsl(e,t,r,s=1){return eM.fromCss(`hsla(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%, ${s.toFixed(2)})`)}constructor(e,t,r,s=1){this.r=ew(0,e,255),this.g=ew(0,t,255),this.b=ew(0,r,255),this.a=void 0!==s?ew(0,s,1):s=1}get inverse(){return new eM(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){let{h:e,s:t,l:r}=this._hsl;return eM.fromHsl(e,t,1-r,this.a)}get rgb(){let{r:e,g:t,b:r}=this;return`rgb(${e.toFixed(0)},${t.toFixed(0)},${r.toFixed(0)})`}get rgba(){let{r:e,g:t,b:r,a:s}=this;return`rgba(${e.toFixed(0)},${t.toFixed(0)},${r.toFixed(0)},${s.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}get _hsl(){return null==this.hslCached&&(this.hslCached=new eC(this.r,this.g,this.b)),this.hslCached}get hsl(){let{h:e,s:t,l:r}=this._hsl;return`hsl(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%)`}get hsla(){let{h:e,s:t,l:r}=this._hsl;return`hsla(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%, ${this.a.toFixed(2)})`}get mono(){let e=255*this.brightness;return new eM(e,e,e)}get brightness(){return eA(this.r,this.g,this.b)}get html(){return this.toString()}toString(){return 1===this.a?"#"+e_(this.r)+e_(this.g)+e_(this.b):"#"+e_(this.r)+e_(this.g)+e_(this.b)+e_(Math.floor(255*this.a))}brighten(e){let{h:t,s:r,l:s}=this._hsl,i=ew(0,s+e*(1-s),1);return eM.fromHsl(t,r,i,this.a)}darken(e){let{h:t,s:r,l:s}=this._hsl,i=ew(0,s*(1-e),1);return eM.fromHsl(t,r,i,this.a)}saturate(e){let{h:t,s:r,l:s}=this._hsl,i=ew(0,r+e*(1-r),1);return eM.fromHsl(t,i,s,this.a)}desaturate(e){let{h:t,s:r,l:s}=this._hsl,i=ew(0,r*(1-e),1);return eM.fromHsl(t,i,s,this.a)}rotate(e){let{h:t,s:r,l:s}=this._hsl;return eM.fromHsl((t+360+e)%360,r,s,this.a)}opacity(e){let{h:t,s:r,l:s}=this._hsl;return eM.fromHsl(t,r,s,e)}swatch(){let{r:e,g:t,b:r,a:s}=this;return console.log(`%c   %c ${this.html}, rgba(${e}, ${t}, ${r}, ${s}), ${this.hsla}`,`background-color: rgba(${e}, ${t}, ${r}, ${s})`,"background-color: #eee"),this}blend(e,t){return new eM(eE(this.r,e.r,t),eE(this.g,e.g,t),eE(this.b,e.b,t),eE(this.a,e.a,t))}mix(e,t){let r=this._hsl,s=e._hsl;return eM.fromHsl(eE(r.h,s.h,t),eE(r.s,s.s,t),eE(r.l,s.l,t),eE(this.a,e.a,t))}}function eO(e){return e.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)}let eL={},eT=(e,...t)=>{if(void 0===eL[e]){let[t,r]=e.split("|");void 0===r?eL[e]=globalThis.document.createElement(t):eL[e]=globalThis.document.createElementNS(r,t)}let r=eL[e].cloneNode(),s={};for(let e of t)e instanceof Element||e instanceof DocumentFragment||"string"==typeof e||"number"==typeof e?r instanceof HTMLTemplateElement?r.content.append(e):r.append(e):Object.assign(s,e);for(let e of Object.keys(s)){let t=s[e];if("apply"===e)t(r);else if("style"===e){if("object"==typeof t)for(let e of Object.keys(t)){let s=eB(eO(e),t[e]);s.prop.startsWith("--")?r.style.setProperty(s.prop,s.value):r.style[e]=s.value}else r.setAttribute("style",t)}else if(null!=e.match(/^on[A-Z]/))el(r,e.substring(2).toLowerCase(),t);else if("bind"===e){if(void 0!==("string"==typeof t.binding?ex[t.binding]:t.binding)&&void 0!==t.value)ei(r,t.value,t.binding instanceof Function?{toDOM:t.binding}:t.binding);else throw Error("bad binding")}else if(null!=e.match(/^bind[A-Z]/)){let s=e.substring(4,5).toLowerCase()+e.substring(5),i=ex[s];if(void 0!==i)ei(r,t,i);else throw Error(`${e} is not allowed, bindings.${s} is not defined`)}else if(void 0!==r[e]){let{MathMLElement:s}=globalThis;r instanceof SVGElement||void 0!==s&&r instanceof s?r.setAttribute(e,t):r[e]=t}else{let s=eO(e);"class"===s?t.split(" ").forEach(e=>{r.classList.add(e)}):void 0!==r[s]?r[s]=t:"boolean"==typeof t?t?r.setAttribute(s,""):r.removeAttribute(s):r.setAttribute(s,t)}}return r},ej=(...e)=>{let t=globalThis.document.createDocumentFragment();for(let r of e)t.append(r);return t},eN=new Proxy({fragment:ej},{get:(e,t)=>(void 0===e[t=t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)]&&(e[t]=(...e)=>eT(t,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),eP=new Proxy({fragment:ej},{get:(e,t)=>(void 0===e[t]&&(e[t]=(...e)=>eT(`${t}|http://www.w3.org/2000/svg`,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),eD=new Proxy({fragment:ej},{get:(e,t)=>(void 0===e[t]&&(e[t]=(...e)=>eT(`${t}|http://www.w3.org/1998/Math/MathML`,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}});function eF(e,t){let r=eN.style(eH(t));r.id=e,document.head.append(r)}let eR=["animation-iteration-count","flex","flex-base","flex-grow","flex-shrink","opacity","order","tab-size","widows","z-index","zoom"],eB=(e,t)=>("number"!=typeof t||eR.includes(e)||(t=`${t}px`),e.startsWith("_")&&(e.startsWith("__")?(e="--"+e.substring(2),t=`var(${e}-default, ${t})`):e="--"+e.substring(1)),{prop:e,value:String(t)}),eq=(e,t,r)=>{if(void 0===r)return"";r instanceof eM&&(r=r.html);let s=eB(t,r);return`${e}  ${s.prop}: ${s.value};`},eW=(e,t,r="")=>{let s=eO(e);if("object"!=typeof t||t instanceof eM)return eq(r,s,t);{let s=Object.keys(t).map(e=>eW(e,t[e],`${r}  `)).join("\n");return`${r}  ${e} {
${s}
${r}  }`}},eH=(e,t="")=>Object.keys(e).map(r=>{let s=e[r];if("string"==typeof s){if("@import"===r)return`@import url('${s}');`;throw Error("top-level string value only allowed for `@import`")}let i=Object.keys(s).map(e=>eW(e,s[e])).join("\n");return`${t}${r} {
${i}
}`}).join("\n\n"),eI=e=>{console.warn("initVars is deprecated. Just use _ and __ prefixes instead.");let t={};for(let r of Object.keys(e)){let s=e[r],i=eO(r);t[`--${i}`]="number"==typeof s&&0!==s?String(s)+"px":s}return t},ez=e=>{console.warn("darkMode is deprecated. Use inverseLuminance instead.");let t={};for(let r of Object.keys(e)){let s=e[r];"string"==typeof s&&null!=s.match(/^(#|rgb[a]?\(|hsl[a]?\()/)&&(s=eM.fromCss(s).inverseLuminance.html,t[`--${eO(r)}`]=s)}return t},eV=e=>{let t={};for(let r of Object.keys(e)){let s=e[r];s instanceof eM?t[r]=s.inverseLuminance:"string"==typeof s&&s.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/)&&(t[r]=eM.fromCss(s).inverseLuminance)}return t},eQ=new Proxy({},{get(e,t){if(null==e[t]){let[,r,,s,i,n]=(t=t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)).match(/^([^\d_]*)((_)?(\d+)(\w*))?$/),o=`--${r}`;if(null!=i){let r=null==s?Number(i)/100:-Number(i)/100;switch(n){case"b":{let s=getComputedStyle(document.body).getPropertyValue(o);e[t]=r>0?eM.fromCss(s).brighten(r).rgba:eM.fromCss(s).darken(-r).rgba}break;case"s":{let s=getComputedStyle(document.body).getPropertyValue(o);e[t]=r>0?eM.fromCss(s).saturate(r).rgba:eM.fromCss(s).desaturate(-r).rgba}break;case"h":{let s=getComputedStyle(document.body).getPropertyValue(o);e[t]=eM.fromCss(s).rotate(100*r).rgba,console.log(eM.fromCss(s).hsla,eM.fromCss(s).rotate(r).hsla)}break;case"o":{let s=getComputedStyle(document.body).getPropertyValue(o);e[t]=eM.fromCss(s).opacity(r).rgba}break;case"":e[t]=`calc(var(${o}) * ${r})`;break;default:throw console.error(n),Error(`Unrecognized method ${n} for css variable ${o}`)}}else e[t]=`var(${o})`}return e[t]}}),eJ=new Proxy({},{get(e,t){if(void 0===e[t]){let r=`--${t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)}`;e[t]=e=>`var(${r}, ${e})`}return e[t]}}),eZ=0;function eG(){return`custom-elt${(eZ++).toString(36)}`}let eU=0,eX={};class eY extends HTMLElement{static{this.elements=eN}static{this.globalStyleSheets=[]}static{this._tagName=null}static get tagName(){return this._tagName}static StyleNode(e){return console.warn("StyleNode is deprecated, just assign static styleSpec: XinStyleSheet to the class directly"),eN.style(eH(e))}static elementCreator(e={}){if(null==this._elementCreator){let{tag:t,styleSpec:r}=e,s=null!=e?t:null;for(null==s&&("string"==typeof this.name&&""!==this.name?(s=eO(this.name)).startsWith("-")&&(s=s.slice(1)):s=eG()),null!=customElements.get(s)&&console.warn(`${s} is already defined`),null==s.match(/\w+(-\w+)+/)&&(console.warn(`${s} is not a legal tag for a custom-element`),s=eG());void 0!==customElements.get(s);)s=eG();window.customElements.define(s,this,e),this._tagName=s,this._elementCreator=eN[s],void 0!==r&&function(e,t){let r=eX[e],s=eH(t).replace(/:host\b/g,e);eX[e]=r?r+"\n"+s:s}(s,r)}return this._elementCreator}initAttributes(...e){let t={},r={};new MutationObserver(t=>{let r=!1;t.forEach(t=>{r=!!(t.attributeName&&e.includes(t.attributeName.replace(/-([a-z])/g,(e,t)=>t.toLocaleUpperCase())))}),r&&void 0!==this.queueRender&&this.queueRender(!1)}).observe(this,{attributes:!0}),e.forEach(e=>{t[e]=i(this[e]);let s=eO(e);Object.defineProperty(this,e,{enumerable:!1,get(){return"boolean"==typeof t[e]?this.hasAttribute(s):this.hasAttribute(s)?"number"==typeof t[e]?parseFloat(this.getAttribute(s)):this.getAttribute(s):void 0!==r[e]?r[e]:t[e]},set(i){"boolean"==typeof t[e]?i!==this[e]&&(i?this.setAttribute(s,""):this.removeAttribute(s),this.queueRender()):"number"==typeof t[e]?i!==parseFloat(this[e])&&(this.setAttribute(s,i),this.queueRender()):("object"==typeof i||`${i}`!=`${this[e]}`)&&(null==i||"object"==typeof i?this.removeAttribute(s):this.setAttribute(s,i),this.queueRender(),r[e]=i)}})})}initValue(){let e=Object.getOwnPropertyDescriptor(this,"value");if(void 0===e||void 0!==e.get||void 0!==e.set)return;let t=this.hasAttribute("value")?this.getAttribute("value"):i(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get:()=>t,set(e){t!==e&&(t=e,this.queueRender(!0))}})}get parts(){let e=null!=this.shadowRoot?this.shadowRoot:this;return null==this._parts&&(this._parts=new Proxy({},{get(t,r){if(void 0===t[r]){let s=e.querySelector(`[part="${r}"]`);if(null==s&&(s=e.querySelector(r)),null==s)throw Error(`elementRef "${r}" does not exist!`);s.removeAttribute("data-ref"),t[r]=s}return t[r]}})),this._parts}constructor(){super(),this.content=eN.slot(),this._changeQueued=!1,this._renderQueued=!1,this._hydrated=!1,eU+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${eU}`,this._value=i(this.defaultValue)}connectedCallback(){var e;eX[e=this.constructor.tagName]&&document.head.append(eN.style({id:e+"-component"},eX[e])),delete eX[e],this.hydrate(),null!=this.role&&this.setAttribute("role",this.role),void 0!==this.onResize&&(ef.observe(this),null==this._onResize&&(this._onResize=this.onResize.bind(this)),this.addEventListener("resize",this._onResize)),null!=this.value&&null!=this.getAttribute("value")&&(this._value=this.getAttribute("value")),this.queueRender()}disconnectedCallback(){ef.unobserve(this)}queueRender(e=!1){this._hydrated&&(this._changeQueued||(this._changeQueued=e),this._renderQueued||(this._renderQueued=!0,requestAnimationFrame(()=>{this._changeQueued&&ea(this,"change"),this._changeQueued=!1,this._renderQueued=!1,this.render()})))}hydrate(){if(!this._hydrated){this.initValue();let e="function"!=typeof this.content,t="function"==typeof this.content?this.content():this.content,{styleSpec:r}=this.constructor,{styleNode:s}=this.constructor;if(r&&(s=this.constructor.styleNode=eN.style(eH(r)),delete this.constructor.styleNode),this.styleNode&&(console.warn(this,"styleNode is deprecrated, use static styleNode or statc styleSpec instead"),s=this.styleNode),s){let r=this.attachShadow({mode:"open"});r.appendChild(s.cloneNode(!0)),ep(r,t,e)}else if(null!==t){let r=[...this.childNodes];ep(this,t,e),this.isSlotted=void 0!==this.querySelector("slot,xin-slot");let s=[...this.querySelectorAll("slot")];if(s.length>0&&s.forEach(eK.replaceSlot),r.length>0){let e={"":this};[...this.querySelectorAll("xin-slot")].forEach(t=>{e[t.name]=t}),r.forEach(t=>{let r=e[""],s=t instanceof Element?e[t.slot]:r;(void 0!==s?s:r).append(t)})}}this._hydrated=!0}}render(){}}class eK extends eY{static replaceSlot(e){let t=document.createElement("xin-slot");""!==e.name&&t.setAttribute("name",e.name),e.replaceWith(t)}constructor(){super(),this.name="",this.content=null,this.initAttributes("name")}}eK.elementCreator({tag:"xin-slot"});let e0=(e=()=>!0)=>{let t=localStorage.getItem("xin-state");if(null!=t){let r=JSON.parse(t);for(let t of Object.keys(r).filter(e))void 0!==Y[t]?Object.assign(Y[t],r[t]):Y[t]=r[t]}let r=eb(()=>{let t={},r=Y[h];for(let s of Object.keys(r).filter(e))t[s]=r[s];localStorage.setItem("xin-state",JSON.stringify(t)),console.log("xin state saved to localStorage")},500);X(e,r)};function e1(e,t){let{type:r,styleSpec:s}=t(e,{Color:eM,Component:eY,elements:eN,varDefault:eJ,vars:eQ});return{type:r,creator:r.elementCreator({tag:e,styleSpec:s})}}async function e5(e,t){return(0,(await import(t)).default)(e,{Component:eY,elements:eN,vars:eQ,varDefault:eJ,Color:eM})}var e6={};r(e6,"XinTest",()=>e9),r(e6,"xinTest",()=>e4);let{span:e2,slot:e3}=eN;class e9 extends eY{static delay(e){return new Promise(t=>{setTimeout(t,e)})}static{this.styleSpec={":host":{display:"flex",gap:"5px",alignItems:"center"},':host [part="outcome"]':{display:"inline-block",borderRadius:"99px",padding:"0 12px",fontSize:"80%"},":host .waiting":{background:"#ff04"},":host .running":{background:"#f804"},":host .success":{background:"#0f04"},":host .failed":{background:"#f004"},":host .exception":{color:"white",background:"red"}}}constructor(){super(),this.test=()=>!0,this.delay=0,this.statis="",this.expect=!0,this.content=[e2({part:"description"},e3()),e2({part:"outcome"})],this.run=()=>{clearTimeout(this.timeout),this.status="waiting",this.timeout=setTimeout(async()=>{this.status="running";try{let e=JSON.stringify(await this.test());e===JSON.stringify(this.expect)?this.status="success":this.status=`failed: got ${e}, expected ${this.expect}`}catch(e){this.status=`exception: ${e}`}},this.delay)},this.initAttributes("description","delay","status")}connectedCallback(){super.connectedCallback(),this.run()}disconnectedCallback(){super.disconnectedCallback(),this.class,clearTimeout(this.timeout)}render(){super.render();let{outcome:e}=this.parts;e.textContent=this.status,e.setAttribute("class",this.status.match(/\w+/)[0])}}let e4=e9.elementCreator({tag:"xin-test"});function e8(e,t=!1){let r={};return Object.keys(e).forEach(s=>{Y[s]=e[s],r[s]=t?K[s]:Y[s]}),r}export{ei as bind,el as on,ex as bindings,eH as css,eV as invertLuminance,ez as darkMode,eI as initVars,eQ as vars,eJ as varDefault,eF as StyleSheet,eM as Color,eY as Component,eN as elements,eP as svgElements,eD as mathML,e0 as hotReload,g as getListItem,u as xinPath,d as xinValue,e1 as makeComponent,e5 as importComponent,eS as MoreMath,s as settings,em as throttle,eb as debounce,Y as xin,X as observe,C as unobserve,A as touch,y as observerShouldBeRemoved,E as updates,e8 as xinProxy,e9 as XinTest,e4 as xinTest};
//# sourceMappingURL=index.js.map
