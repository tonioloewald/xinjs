let e,t;function r(e,t,r,i){Object.defineProperty(e,t,{get:r,set:i,enumerable:!0,configurable:!0})}let i={debug:!1,perf:!1};function s(e){if(null==e||"object"!=typeof e)return e;if(Array.isArray(e))return e.map(s);let t={};for(let r in e){let i=e[r];null!=e&&"object"==typeof e?t[r]=s(i):t[r]=i}return t}let n="-xin-data",o=`.${n}`,l="-xin-event",a=`.${l}`,h=Symbol("xin-path"),c=Symbol("xin-value"),u=e=>e[h];function d(e){return"object"==typeof e&&null!==e&&e[c]||e}let f=new WeakMap,p=new WeakMap,b=e=>{let t=e.cloneNode();if(t instanceof HTMLElement){let r=p.get(e),i=f.get(e);null!=r&&p.set(t,s(r)),null!=i&&f.set(t,s(i))}for(let r of e instanceof HTMLTemplateElement?e.content.childNodes:e.childNodes)r instanceof HTMLElement||r instanceof DocumentFragment?t.appendChild(b(r)):t.appendChild(r.cloneNode());return t},m=new WeakMap,g=e=>{let t=document.body.parentElement;for(;null!=e.parentElement&&e.parentElement!==t;){let t=m.get(e);if(null!=t)return t;e=e.parentElement}return!1},y=Symbol("observer should be removed"),$=[],v=[],x=!1;class w{constructor(e,t){let r;let i="string"==typeof t?`"${t}"`:`function ${t.name}`;if("string"==typeof e)this.test=t=>"string"==typeof t&&""!==t&&(e.startsWith(t)||t.startsWith(e)),r=`test = "${e}"`;else if(e instanceof RegExp)this.test=e.test.bind(e),r=`test = "${e.toString()}"`;else if(e instanceof Function)this.test=e,r=`test = function ${e.name}`;else throw Error("expect listener test to be a string, RegExp, or test function");if(this.description=`${r}, ${i}`,"function"==typeof t)this.callback=t;else throw Error("expect callback to be a path or function");$.push(this)}}let E=async()=>{void 0!==e&&await e},S=()=>{i.perf&&console.time("xin async update");let e=[...v];for(let t of e)$.filter(e=>{let r;try{r=e.test(t)}catch(r){throw Error(`Listener ${e.description} threw "${r}" at "${t}"`)}return r===y?(k(e),!1):r}).forEach(e=>{let r;try{r=e.callback(t)}catch(r){console.error(`Listener ${e.description} threw "${r}" handling "${t}"`)}r===y&&k(e)});v.splice(0),x=!1,"function"==typeof t&&t(),i.perf&&console.timeEnd("xin async update")},A=r=>{let i="string"==typeof r?r:u(r);if(void 0===i)throw console.error("touch was called on an invalid target",r),Error("touch was called on an invalid target");!1===x&&(e=new Promise(e=>{t=e}),x=setTimeout(S)),null==v.find(e=>i.startsWith(e))&&v.push(i)},_=(e,t)=>new w(e,t),k=e=>{let t=$.indexOf(e);if(t>-1)$.splice(t,1);else throw Error("unobserve failed, listener not found")},C=e=>{try{return JSON.stringify(e)}catch(e){return"{has circular references}"}},M=(...e)=>Error(e.map(C).join(" ")),O=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1),L=0,T=()=>(parseInt("10000",36)+ ++L).toString(36).slice(-5),j=()=>O()+T(),N={},P={};function D(e){if(""===e)return[];if(Array.isArray(e))return e;{let t=[];for(;e.length>0;){let r=e.search(/\[[^\]]+\]/);if(-1===r){t.push(e.split("."));break}{let i=e.slice(0,r);e=e.slice(r),""!==i&&t.push(i.split(".")),r=e.indexOf("]")+1,t.push(e.slice(1,r-1)),"."===e.slice(r,r+1)&&(r+=1),e=e.slice(r)}}return t}}let F=new WeakMap;function R(e,t){void 0===F.get(e)&&F.set(e,{}),void 0===F.get(e)[t]&&(F.get(e)[t]={});let r=F.get(e)[t];return"_auto_"===t?e.forEach((e,t)=>{void 0===e._auto_&&(e._auto_=j()),r[e._auto_+""]=t}):e.forEach((e,i)=>{r[H(e,t)+""]=i}),r}function q(e,t,r,i){var s;let n;let o=""!==t?(s=r+"",(void 0===(n=(void 0===F.get(e)||void 0===F.get(e)[t]?R(e,t):F.get(e)[t])[s])||H(e[n],t)+""!==s)&&(n=R(e,t)[s]),n):r;if(i===N)return e.splice(o,1),F.delete(e),Symbol("deleted");if(i===P)""===t&&void 0===e[o]&&(e[o]={});else if(void 0!==i){if(void 0!==o)e[o]=i;else if(""!==t&&H(i,t)+""==r+"")e.push(i),o=e.length-1;else throw Error(`byIdPath insert failed at [${t}=${r}]`)}return e[o]}function B(e){if(!Array.isArray(e))throw M("setByPath failed: expected array, found",e)}function I(e){if(null==e||!(e instanceof Object))throw M("setByPath failed: expected Object, found",e)}function H(e,t){let r,i,s,n;let o=D(t),l=e;for(r=0,i=o.length;void 0!==l&&r<i;r++){let e=o[r];if(Array.isArray(e))for(s=0,n=e.length;void 0!==l&&s<n;s++){let t=e[s];l=l[t]}else if(0===l.length){if(l=l[e.slice(1)],"="!==e[0])return}else if(e.includes("=")){let[t,...r]=e.split("=");l=q(l,t,r.join("="))}else l=l[s=parseInt(e,10)]}return l}let W=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],z={},V=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,Q=e=>V.test(e),Z=(e="",t="")=>""===e?t:null!==t.match(/^\d+$/)||t.includes("=")?`${e}[${t}]`:`${e}.${t}`,J={string:e=>new String(e),boolean:e=>new Boolean(e),bigint:e=>e,symbol:e=>e,number:e=>new Number(e)};function G(e,t){let r=typeof e;return void 0===e||"object"===r||"function"===r?e:new Proxy(J[r](e),X(t,!0))}let X=(e,t)=>({get(r,i){if(i===h)return e;if(i===c){for(;void 0!==u(r);)r=d(r);return r}if("symbol"==typeof i)return r[i];let s=i,n=s.match(/^([^.[]+)\.(.+)$/)??s.match(/^([^\]]+)(\[.+)/)??s.match(/^(\[[^\]]+\])\.(.+)$/)??s.match(/^(\[[^\]]+\])\[(.+)$/);if(null!==n){let[,i,s]=n,o=Z(e,i),l=H(r,i);return null!==l&&"object"==typeof l?new Proxy(l,X(o,t))[s]:l}if(s.startsWith("[")&&s.endsWith("]")&&(s=s.substring(1,s.length-1)),!Array.isArray(r)&&void 0!==r[s]||Array.isArray(r)&&s.includes("=")){let i;if(s.includes("=")){let[e,t]=s.split("=");i=r.find(r=>`${H(r,e)}`===t)}else i=r[s];if(null!==i&&"object"==typeof i){let r=Z(e,s);return new Proxy(i,X(r,t))}return"function"==typeof i?i.bind(r):t?G(i,Z(e,s)):i}if(!Array.isArray(r))return t?G(r[s],Z(e,s)):r[s];{let i=r[s];return"function"==typeof i?(...t)=>{let i=Array.prototype[s].apply(r,t);return W.includes(s)&&A(e),i}:"object"==typeof i?new Proxy(i,X(Z(e,s),t)):t?G(i,Z(e,s)):i}},set(t,r,i){i=d(i);let s=Z(e,r);if(!Q(s))throw Error(`setting invalid path ${s}`);let n=d(U[s]);return n!==i&&function(e,t,r){let i=e,s=D(t);for(;null!=i&&s.length>0;){let e=s.shift();if("string"==typeof e){let t=e.indexOf("=");if(t>-1){0===t?I(i):B(i);let n=e.slice(0,t),o=e.slice(t+1);if(i=q(i,n,o,s.length>0?P:r),0===s.length)return!0}else{B(i);let t=parseInt(e,10);if(s.length>0)i=i[t];else{if(r!==N){if(i[t]===r)return!1;i[t]=r}else i.splice(t,1);return!0}}}else if(Array.isArray(e)&&e.length>0)for(I(i);e.length>0;){let t=e.shift();if(e.length>0||s.length>0){var n,o;n=i,o=e.length>0?{}:[],void 0===n[t]&&void 0!==o&&(n[t]=o),i=n[t]}else{if(r!==N){if(i[t]===r)return!1;i[t]=r}else{if(!Object.prototype.hasOwnProperty.call(i,t))return!1;delete i[t]}return!0}}else throw Error(`setByPath failed, bad path ${t}`)}throw Error(`setByPath(${e}, ${t}, ${r}) failed`)}(z,s,i)&&A(s),!0}}),Y=(e,t)=>{let r="function"==typeof t?t:U[t];if("function"!=typeof r)throw Error(`observe expects a function or path to a function, ${t} is neither`);return _(e,r)},U=new Proxy(z,X("",!1)),K=new Proxy(z,X("",!0)),{document:ee,MutationObserver:et}=globalThis,er=(e,t)=>{let r=p.get(e);if(null!=r)for(let i of r){let{binding:r,options:s}=i,{path:n}=i,{toDOM:o}=r;if(null!=o){if(n.startsWith("^")){let t=g(e);if(null!=t&&null!=t[h])n=i.path=`${t[h]}${n.substring(1)}`;else throw console.error(`Cannot resolve relative binding ${n}`,e,"is not part of a list"),Error(`Cannot resolve relative binding ${n}`)}(null==t||n.startsWith(t))&&o(e,U[n],s)}}};if(null!=et){let e=new et(e=>{e.forEach(e=>{[...e.addedNodes].forEach(e=>{e instanceof HTMLElement&&[...e.querySelectorAll(o)].forEach(e=>er(e))})})});e.observe(ee.body,{subtree:!0,childList:!0})}Y(()=>!0,e=>{let t=ee.querySelectorAll(o);for(let r of t)er(r,e)});let ei=e=>{let t=e.target.closest(o);for(;null!=t;){let e=p.get(t);for(let r of e){let{binding:e,path:i}=r,{fromDOM:s}=e;if(null!=s){let e;try{e=s(t,r.options)}catch(e){throw console.error("Cannot get value from",t,"via",r),Error("Cannot obtain value fromDOM")}if(null!=e){let t=U[i];if(null==t)U[i]=e;else{let r=null!=t[h]?t[c]:t,s=null!=e[h]?e[c]:e;r!==s&&(U[i]=s)}}}}t=t.parentElement.closest(o)}};function es(e,t,r,i){let s;if(e instanceof DocumentFragment)throw Error("bind cannot bind to a DocumentFragment");if("object"==typeof t&&void 0===t[h]&&void 0===i){let{value:e}=t;s="string"==typeof e?e:e[h],i=t,delete i.value}else s="string"==typeof t?t:t[h];if(null==s)throw Error("bind requires a path or object with xin Proxy");let{toDOM:o}=r;e.classList.add(n);let l=p.get(e);return null==l&&(l=[],p.set(e,l)),l.push({path:s,binding:r,options:i}),null==o||s.startsWith("^")||A(s),e}null!=globalThis.document&&(ee.body.addEventListener("change",ei,!0),ee.body.addEventListener("input",ei,!0));let en=new Set,eo=e=>{let t=e?.target.closest(a),r=!1,i=new Proxy(e,{get(t,i){if("stopPropagation"===i)return()=>{e.stopPropagation(),r=!0};{let e=t[i];return"function"==typeof e?e.bind(t):e}}});for(;!r&&null!=t;){let s=f.get(t),n=s[e.type]||[];for(let e of n){if("function"==typeof e)e(i);else{let t=U[e];if("function"==typeof t)t(i);else throw Error(`no event handler found at path ${e}`)}if(r)continue}t=null!=t.parentElement?t.parentElement.closest(a):null}},el=(e,t,r)=>{let i=f.get(e);e.classList.add(l),null==i&&(i={},f.set(e,i)),i[t]||(i[t]=[]),i[t].includes(r)||i[t].push(r),en.has(t)||(en.add(t),ee.body.addEventListener(t,eo,!0))},ea=(e,t)=>{let r=new Event(t);e.dispatchEvent(r)},eh=e=>e instanceof HTMLInputElement?e.type:e instanceof HTMLSelectElement&&e.hasAttribute("multiple")?"multi-select":"other",ec=(e,t)=>{switch(eh(e)){case"radio":e.checked=e.value===t;break;case"checkbox":e.checked=!!t;break;case"date":e.valueAsDate=new Date(t);break;case"multi-select":for(let r of[...e.querySelectorAll("option")])r.selected=t[r.value];break;default:e.value=t}},eu=e=>{switch(eh(e)){case"radio":{let t=e.parentElement?.querySelector(`[name="${e.name}"]:checked`);return null!=t?t.value:null}case"checkbox":return e.checked;case"date":return e.valueAsDate?.toISOString();case"multi-select":return[...e.querySelectorAll("option")].reduce((e,t)=>(e[t.value]=t.selected,e),{});default:return e.value}},{ResizeObserver:ed}=globalThis,ef=null!=ed?new ed(e=>{for(let t of e){let e=t.target;ea(e,"resize")}}):{observe(){},unobserve(){}},ep=(e,t,r=!0)=>{if(null!=e&&null!=t){if("string"==typeof t)e.textContent=t;else if(Array.isArray(t))t.forEach(t=>{e.append(t instanceof Node&&r?b(t):t)});else if(t instanceof Node)e.append(r?b(t):t);else throw Error("expect text content or document node")}},eb=(e,t=250)=>{let r;return(...i)=>{void 0!==r&&clearTimeout(r),r=setTimeout(()=>{e(...i)},t)}},em=(e,t=250)=>{let r;let i=Date.now()-t,s=!1;return(...n)=>{if(clearTimeout(r),r=setTimeout(async()=>{e(...n),i=Date.now()},t),!s&&Date.now()-i>=t){s=!0;try{e(...n),i=Date.now()}finally{s=!1}}}},eg=Symbol("list-binding");function ey(e,t){let r=[...e.querySelectorAll(o)];for(let i of(e.matches(o)&&r.unshift(e),r)){let e=p.get(i);for(let r of e)r.path.startsWith("^")&&(r.path=`${t}${r.path.substring(1)}`),null!=r.binding.toDOM&&r.binding.toDOM(i,U[r.path])}}class e${constructor(e,t={}){if(this._array=[],this.boundElement=e,this.itemToElement=new WeakMap,1!==e.children.length)throw Error("ListBinding expects an element with exactly one child element");if(e.children[0]instanceof HTMLTemplateElement){let t=e.children[0];if(1!==t.content.children.length)throw Error("ListBinding expects a template with exactly one child element");this.template=b(t.content.children[0])}else this.template=e.children[0],this.template.remove();this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),this.options=t,null!=t.virtual&&(ef.observe(this.boundElement),this._update=em(()=>{this.update(this._array,!0)},16),this.boundElement.addEventListener("scroll",this._update),this.boundElement.addEventListener("resize",this._update))}visibleSlice(){let{virtual:e,hiddenProp:t,visibleProp:r}=this.options,i=this._array;void 0!==t&&(i=i.filter(e=>!0!==e[t])),void 0!==r&&(i=i.filter(e=>!0===e[r]));let s=0,n=i.length-1,o=0,l=0;if(null!=e){let t=this.boundElement.offsetWidth,r=this.boundElement.offsetHeight,a=null!=e.width?Math.max(1,Math.floor(t/e.width)):1,h=Math.ceil(r/e.height)+1,c=Math.ceil(i.length/a),u=Math.floor(this.boundElement.scrollTop/e.height);u>c-h+1&&(u=Math.max(0,c-h+1)),n=(s=u*a)+a*h-1,o=u*e.height,l=Math.max(c*e.height-r-o,0)}return{items:i,firstItem:s,lastItem:n,topBuffer:o,bottomBuffer:l}}update(e,t){null==e&&(e=[]),this._array=e;let{initInstance:r,updateInstance:s,hiddenProp:n,visibleProp:o}=this.options,l=u(e),a=this.visibleSlice();this.boundElement.classList.toggle("-xin-empty-list",0===a.items.length);let h=this._previousSlice,{firstItem:c,lastItem:f,topBuffer:p,bottomBuffer:g}=a;if(void 0===n&&void 0===o&&!0===t&&null!=h&&c===h.firstItem&&f===h.lastItem)return;this._previousSlice=a;let y=0,$=0,v=0;for(let e of[...this.boundElement.children]){if(e===this.listTop||e===this.listBottom)continue;let t=m.get(e);if(null==t)e.remove();else{let r=a.items.indexOf(t);(r<c||r>f)&&(e.remove(),this.itemToElement.delete(t),m.delete(e),y++)}}this.listTop.style.height=String(p)+"px",this.listBottom.style.height=String(g)+"px";let x=[],{idPath:w}=this.options;for(let e=c;e<=f;e++){let t=a.items[e];if(void 0===t)continue;let i=this.itemToElement.get(d(t));if(null==i){if(v++,i=b(this.template),"object"==typeof t&&(this.itemToElement.set(d(t),i),m.set(i,d(t))),this.boundElement.insertBefore(i,this.listBottom),null!=w){let e=t[w],r=`${l}[${w}=${e}]`;ey(i,r)}else{let t=`${l}[${e}]`;ey(i,t)}null!=r&&r(i,t)}null!=s&&s(i,t),x.push(i)}let E=null;for(let e of x)e.previousElementSibling!==E&&($++,E?.nextElementSibling!=null?this.boundElement.insertBefore(e,E.nextElementSibling):this.boundElement.insertBefore(e,this.listBottom)),E=e;i.perf&&console.log(l,"updated",{removed:y,created:v,moved:$})}}let ev=(e,t)=>{let r=e[eg];return void 0===r&&(r=new e$(e,t),e[eg]=r),r},ex={value:{toDOM(e,t){ec(e,t)},fromDOM:e=>eu(e)},text:{toDOM(e,t){e.textContent=t}},enabled:{toDOM(e,t){e.disabled=!t}},disabled:{toDOM(e,t){e.disabled=!!t}},style:{toDOM(e,t){if("object"==typeof t)for(let r of Object.keys(t))e.style[r]=t[r];else if("string"==typeof t)e.setAttribute("style",t);else throw Error("style binding expects either a string or object")}},list:{toDOM(e,t,r){let i=ev(e,r);i.update(t)}}};function ew(e,t,r){return t<e?e:t>r?r:t}function eE(e,t,r){return(r=ew(0,r,1))*(t-e)+e}let eS={clamp:ew,lerp:eE},eA=e=>("00"+Math.round(Number(e)).toString(16)).slice(-2);class e_{constructor(e,t,r){e/=255,t/=255,r/=255;let i=Math.max(e,t,r),s=i-Math.min(e,t,r),n=0!==s?i===e?(t-r)/s:i===t?2+(r-e)/s:4+(e-t)/s:0;this.h=60*n<0?60*n+360:60*n,this.s=0!==s?i<=.5?s/(2*i-s):s/(2-(2*i-s)):0,this.l=(2*i-s)/2}}let ek=void 0!==globalThis.document?globalThis.document.createElement("span"):void 0;class eC{static fromCss(e){let t=e;ek instanceof HTMLSpanElement&&(ek.style.color=e,document.body.appendChild(ek),t=getComputedStyle(ek).color,ek.remove());let[r,i,s,n]=t.match(/[\d.]+/g);return new eC(Number(r),Number(i),Number(s),null==n?1:Number(n))}static fromHsl(e,t,r,i=1){return eC.fromCss(`hsla(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%, ${i.toFixed(2)})`)}constructor(e,t,r,i=1){this.r=ew(0,e,255),this.g=ew(0,t,255),this.b=ew(0,r,255),this.a=void 0!==i?ew(0,i,1):i=1}get inverse(){return new eC(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){let{h:e,s:t,l:r}=this._hsl;return eC.fromHsl(e,t,1-r,this.a)}get rgb(){let{r:e,g:t,b:r}=this;return`rgb(${e.toFixed(0)},${t.toFixed(0)},${r.toFixed(0)})`}get rgba(){let{r:e,g:t,b:r,a:i}=this;return`rgba(${e.toFixed(0)},${t.toFixed(0)},${r.toFixed(0)},${i.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}get _hsl(){return null==this._hslCached&&(this._hslCached=new e_(this.r,this.g,this.b)),this._hslCached}get hsl(){let{h:e,s:t,l:r}=this._hsl;return`hsl(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%)`}get hsla(){let{h:e,s:t,l:r}=this._hsl;return`hsla(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%, ${this.a.toFixed(2)})`}get mono(){let e=255*this.brightness;return new eC(e,e,e)}get brightness(){return(.299*this.r+.587*this.g+.114*this.b)/255}get html(){return 1===this.a?"#"+eA(this.r)+eA(this.g)+eA(this.b):"#"+eA(this.r)+eA(this.g)+eA(this.b)+eA(Math.floor(255*this.a))}brighten(e){let{h:t,s:r,l:i}=this._hsl,s=ew(0,i+e*(1-i),1);return eC.fromHsl(t,r,s,this.a)}darken(e){let{h:t,s:r,l:i}=this._hsl,s=ew(0,i*(1-e),1);return eC.fromHsl(t,r,s,this.a)}saturate(e){let{h:t,s:r,l:i}=this._hsl,s=ew(0,r+e*(1-r),1);return eC.fromHsl(t,s,i,this.a)}desaturate(e){let{h:t,s:r,l:i}=this._hsl,s=ew(0,r*(1-e),1);return eC.fromHsl(t,s,i,this.a)}rotate(e){let{h:t,s:r,l:i}=this._hsl;return eC.fromHsl((t+360+e)%360,r,i,this.a)}opacity(e){let{h:t,s:r,l:i}=this._hsl;return eC.fromHsl(t,r,i,e)}swatch(){let{r:e,g:t,b:r,a:i}=this;console.log(`%c   %c ${this.html}, rgba(${e}, ${t}, ${r}, ${i}), ${this.hsla}`,`background-color: rgba(${e}, ${t}, ${r}, ${i})`,"background-color: #eee")}blend(e,t){return new eC(eE(this.r,e.r,t),eE(this.g,e.g,t),eE(this.b,e.b,t),eE(this.a,e.a,t))}}function eM(e){return e.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)}let eO={},eL=(e,...t)=>{if(void 0===eO[e]){let[t,r]=e.split("|");void 0===r?eO[e]=globalThis.document.createElement(t):eO[e]=globalThis.document.createElementNS(r,t)}let r=eO[e].cloneNode(),i={};for(let e of t)e instanceof Element||e instanceof DocumentFragment||"string"==typeof e||"number"==typeof e?r instanceof HTMLTemplateElement?r.content.append(e):r.append(e):Object.assign(i,e);for(let e of Object.keys(i)){let t=i[e];if("apply"===e)t(r);else if("style"===e){if("object"==typeof t)for(let e of Object.keys(t))e.startsWith("--")?r.style.setProperty(e,t[e]):r.style[e]=t[e];else r.setAttribute("style",t)}else if(null!=e.match(/^on[A-Z]/)){let i=e.substring(2).toLowerCase();el(r,i,t)}else if("bind"===e){let e="string"==typeof t.binding?ex[t.binding]:t.binding;if(void 0!==e&&void 0!==t.value)es(r,t.value,t.binding instanceof Function?{toDOM:t.binding}:t.binding);else throw Error("bad binding")}else if(null!=e.match(/^bind[A-Z]/)){let i=e.substring(4,5).toLowerCase()+e.substring(5),s=ex[i];if(void 0!==s)es(r,t,s);else throw Error(`${e} is not allowed, bindings.${i} is not defined`)}else if(void 0!==r[e]){let{MathMLElement:i}=globalThis;r instanceof SVGElement||void 0!==i&&r instanceof i?r.setAttribute(e,t):r[e]=t}else{let i=eM(e);"class"===i?t.split(" ").forEach(e=>{r.classList.add(e)}):void 0!==r[i]?r[i]=t:"boolean"==typeof t?t?r.setAttribute(i,""):r.removeAttribute(i):r.setAttribute(i,t)}}return r},eT=(...e)=>{let t=globalThis.document.createDocumentFragment();for(let r of e)t.append(r);return t},ej=new Proxy({fragment:eT},{get:(e,t)=>(void 0===e[t=t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)]&&(e[t]=(...e)=>eL(t,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),eN=new Proxy({fragment:eT},{get:(e,t)=>(void 0===e[t]&&(e[t]=(...e)=>eL(`${t}|http://www.w3.org/2000/svg`,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),eP=new Proxy({fragment:eT},{get:(e,t)=>(void 0===e[t]&&(e[t]=(...e)=>eL(`${t}|http://www.w3.org/1998/Math/MathML`,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),eD=["animation-iteration-count","flex","flex-base","flex-grow","flex-shrink","gap","opacity","order","tab-size","widows","z-index","zoom"],eF=(e,t,r)=>void 0===r?"":"string"==typeof r||eD.includes(t)?`${e}  ${t}: ${r};`:`${e}  ${t}: ${r}px;`,eR=(e,t,r="")=>{let i=eM(e);if("object"!=typeof t)return eF(r,i,t);{let i=Object.keys(t).map(e=>eR(e,t[e],`${r}  `)).join("\n");return`${r}  ${e} {
${i}
${r}  }`}},eq=(e,t="")=>{let r=Object.keys(e).map(r=>{let i=e[r];if("string"==typeof i){if("@import"===r)return`@import url('${i}');`;throw Error("top-level string value only allowed for `@import`")}let s=Object.keys(i).map(e=>eR(e,i[e])).join("\n");return`${t}${r} {
${s}
}`});return r.join("\n\n")},eB=e=>{let t={};for(let r of Object.keys(e)){let i=e[r],s=eM(r);t[`--${s}`]="number"==typeof i&&0!==i?String(i)+"px":i}return t},eI=e=>{let t={};for(let r of Object.keys(e)){let i=e[r];"string"==typeof i&&null!=i.match(/^(#|rgb[a]?\(|hsl[a]?\()/)&&(i=eC.fromCss(i).inverseLuminance.html,t[`--${eM(r)}`]=i)}return t},eH=new Proxy({},{get(e,t){if(null==e[t]){t=t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`);let[,r,,i,s,n]=t.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/),o=`--${r}`;if(null!=s){let r=null==i?Number(s)/100:-Number(s)/100;switch(n){case"b":{let i=getComputedStyle(document.body).getPropertyValue(o);e[t]=r>0?eC.fromCss(i).brighten(r).rgba:eC.fromCss(i).darken(-r).rgba}break;case"s":{let i=getComputedStyle(document.body).getPropertyValue(o);e[t]=r>0?eC.fromCss(i).saturate(r).rgba:eC.fromCss(i).desaturate(-r).rgba}break;case"h":{let i=getComputedStyle(document.body).getPropertyValue(o);e[t]=eC.fromCss(i).rotate(100*r).rgba,console.log(eC.fromCss(i).hsla,eC.fromCss(i).rotate(r).hsla)}break;case"o":{let i=getComputedStyle(document.body).getPropertyValue(o);e[t]=eC.fromCss(i).opacity(r).rgba}break;case"":e[t]=`calc(var(${o}) * ${r})`;break;default:throw console.error(n),Error(`Unrecognized method ${n} for css variable ${o}`)}}else e[t]=`var(${o})`}return e[t]}}),eW=new Proxy({},{get(e,t){if(void 0===e[t]){let r=`--${t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)}`;e[t]=e=>`var(${r}, ${e})`}return e[t]}}),ez=0;function eV(){return`custom-elt${(ez++).toString(36)}`}let eQ=0,eZ={};class eJ extends HTMLElement{static #e=(()=>{this.elements=ej})();static #t=(()=>{this.globalStyleSheets=[]})();static #r=(()=>{this._tagName=null})();static get tagName(){return this._tagName}static StyleNode(e){return console.warn("StyleNode is deprecated, just assign static styleSpec: XinStyleSheet to the class directly"),ej.style(eq(e))}static elementCreator(e={}){if(null==this._elementCreator){let{tag:t,styleSpec:r}=e,i=null!=e?t:null;for(null==i&&("string"==typeof this.name&&""!==this.name?(i=eM(this.name)).startsWith("-")&&(i=i.slice(1)):i=eV()),null!=customElements.get(i)&&console.warn(`${i} is already defined`),null==i.match(/\w+(-\w+)+/)&&(console.warn(`${i} is not a legal tag for a custom-element`),i=eV());void 0!==customElements.get(i);)i=eV();window.customElements.define(i,this,e),this._tagName=i,this._elementCreator=ej[i],void 0!==r&&function(e,t){let r=eZ[e],i=eq(t).replace(/:host\b/g,e);eZ[e]=r?r+"\n"+i:i}(i,r)}return this._elementCreator}initAttributes(...e){let t={},r={},i=new MutationObserver(t=>{let r=!1;t.forEach(t=>{r=!!(t.attributeName&&e.includes(t.attributeName.replace(/-([a-z])/g,(e,t)=>t.toLocaleUpperCase())))}),r&&void 0!==this.queueRender&&this.queueRender(!1)});i.observe(this,{attributes:!0}),e.forEach(e=>{t[e]=s(this[e]);let i=eM(e);Object.defineProperty(this,e,{enumerable:!1,get(){return"boolean"==typeof t[e]?this.hasAttribute(i):this.hasAttribute(i)?"number"==typeof t[e]?parseFloat(this.getAttribute(i)):this.getAttribute(i):void 0!==r[e]?r[e]:t[e]},set(s){"boolean"==typeof t[e]?s!==this[e]&&(s?this.setAttribute(i,""):this.removeAttribute(i),this.queueRender()):"number"==typeof t[e]?s!==parseFloat(this[e])&&(this.setAttribute(i,s),this.queueRender()):("object"==typeof s||`${s}`!=`${this[e]}`)&&(null==s||"object"==typeof s?this.removeAttribute(i):this.setAttribute(i,s),this.queueRender(),r[e]=s)}})})}initValue(){let e=Object.getOwnPropertyDescriptor(this,"value");if(void 0===e||void 0!==e.get||void 0!==e.set)return;let t=this.hasAttribute("value")?this.getAttribute("value"):s(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get:()=>t,set(e){t!==e&&(t=e,this.queueRender(!0))}})}get refs(){console.warn("refs and data-ref are deprecated, use the part attribute and .parts instead");let e=null!=this.shadowRoot?this.shadowRoot:this;return null==this._refs&&(this._refs=new Proxy({},{get(t,r){if(void 0===t[r]){let i=e.querySelector(`[part="${r}"],[data-ref="${r}"]`);if(null==i&&(i=e.querySelector(r)),null==i)throw Error(`elementRef "${r}" does not exist!`);i.removeAttribute("data-ref"),t[r]=i}return t[r]}})),this._refs}get parts(){let e=null!=this.shadowRoot?this.shadowRoot:this;return null==this._refs&&(this._refs=new Proxy({},{get(t,r){if(void 0===t[r]){let i=e.querySelector(`[part="${r}"]`);if(null==i&&(i=e.querySelector(r)),null==i)throw Error(`elementRef "${r}" does not exist!`);i.removeAttribute("data-ref"),t[r]=i}return t[r]}})),this._refs}constructor(){super(),this.content=ej.slot(),this._changeQueued=!1,this._renderQueued=!1,this._hydrated=!1,eQ+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${eQ}`,this._value=s(this.defaultValue)}connectedCallback(){var e;eZ[e=this.constructor.tagName]&&document.head.append(ej.style({id:e+"-component"},eZ[e])),delete eZ[e],this.hydrate(),null!=this.role&&this.setAttribute("role",this.role),void 0!==this.onResize&&(ef.observe(this),null==this._onResize&&(this._onResize=this.onResize.bind(this)),this.addEventListener("resize",this._onResize)),null!=this.value&&null!=this.getAttribute("value")&&(this._value=this.getAttribute("value")),this.queueRender()}disconnectedCallback(){ef.unobserve(this)}queueRender(e=!1){this._hydrated&&(this._changeQueued||(this._changeQueued=e),this._renderQueued||(this._renderQueued=!0,requestAnimationFrame(()=>{this._changeQueued&&ea(this,"change"),this._changeQueued=!1,this._renderQueued=!1,this.render()})))}hydrate(){if(!this._hydrated){this.initValue();let e="function"!=typeof this.content,t="function"==typeof this.content?this.content():this.content,{styleSpec:r}=this.constructor,{styleNode:i}=this.constructor;if(r&&(i=this.constructor.styleNode=ej.style(eq(r)),delete this.constructor.styleNode),this.styleNode&&(console.warn(this,"styleNode is deprecrated, use static styleNode or statc styleSpec instead"),i=this.styleNode),i){let r=this.attachShadow({mode:"open"});r.appendChild(i.cloneNode(!0)),ep(r,t,e)}else if(null!==t){let r=[...this.childNodes];ep(this,t,e),this.isSlotted=void 0!==this.querySelector("slot,xin-slot");let i=[...this.querySelectorAll("slot")];if(i.length>0&&i.forEach(eG.replaceSlot),r.length>0){let e={"":this};[...this.querySelectorAll("xin-slot")].forEach(t=>{e[t.name]=t}),r.forEach(t=>{let r=e[""],i=t instanceof Element?e[t.slot]:r;(void 0!==i?i:r).append(t)})}}this._hydrated=!0}}render(){}}class eG extends eJ{static replaceSlot(e){let t=document.createElement("xin-slot");""!==e.name&&t.setAttribute("name",e.name),e.replaceWith(t)}constructor(){super(),this.name="",this.content=null,this.initAttributes("name")}}eG.elementCreator({tag:"xin-slot"});let eX=(e=()=>!0)=>{let t=localStorage.getItem("xin-state");if(null!=t){let r=JSON.parse(t);for(let t of Object.keys(r).filter(e))void 0!==U[t]?Object.assign(U[t],r[t]):U[t]=r[t]}let r=eb(()=>{let t={},r=U[c];for(let i of Object.keys(r).filter(e))t[i]=r[i];localStorage.setItem("xin-state",JSON.stringify(t)),console.log("xin state saved to localStorage")},500);Y(e,r)};var eY={};r(eY,"XinTest",()=>e0),r(eY,"xinTest",()=>e1);let{span:eU,slot:eK}=ej;class e0 extends eJ{static delay(e){return new Promise(t=>{setTimeout(t,e)})}static #e=(()=>{this.styleSpec={":host":{display:"flex",gap:"5px",alignItems:"center"},':host [part="outcome"]':{display:"inline-block",borderRadius:"99px",padding:"0 12px",fontSize:"80%"},":host .waiting":{background:"#ff04"},":host .running":{background:"#f804"},":host .success":{background:"#0f04"},":host .failed":{background:"#f004"},":host .exception":{color:"white",background:"red"}}})();constructor(){super(),this.test=()=>!0,this.delay=0,this.statis="",this.expect=!0,this.content=[eU({part:"description"},eK()),eU({part:"outcome"})],this.run=()=>{clearTimeout(this.timeout),this.status="waiting",this.timeout=setTimeout(async()=>{this.status="running";try{let e=JSON.stringify(await this.test());e===JSON.stringify(this.expect)?this.status="success":this.status=`failed: got ${e}, expected ${this.expect}`}catch(e){this.status=`exception: ${e}`}},this.delay)},this.initAttributes("description","delay","status")}connectedCallback(){super.connectedCallback(),this.run()}disconnectedCallback(){super.disconnectedCallback(),this.class,clearTimeout(this.timeout)}render(){super.render();let{outcome:e}=this.parts;e.textContent=this.status,e.setAttribute("class",this.status.match(/\w+/)[0])}}let e1=e0.elementCreator({tag:"xin-test"});function e5(e,t=!1){let r={};return Object.keys(e).forEach(i=>{U[i]=e[i],r[i]=t?K[i]:U[i]}),r}export{es as bind,el as on,ex as bindings,eq as css,eI as darkMode,eB as initVars,eH as vars,eW as varDefault,eC as Color,eJ as Component,ej as elements,eN as svgElements,eP as mathML,eX as hotReload,g as getListItem,u as xinPath,d as xinValue,eS as MoreMath,i as settings,em as throttle,eb as debounce,U as xin,Y as observe,k as unobserve,A as touch,y as observerShouldBeRemoved,E as updates,e5 as xinProxy,e0 as XinTest,e1 as xinTest};
//# sourceMappingURL=index.js.map
