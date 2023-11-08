let e,t;function r(e,t,r,i){Object.defineProperty(e,t,{get:r,set:i,enumerable:!0,configurable:!0})}/*
  Note that re-exported types should be explicitly and separately exported
  as types because of issues with parceljs

  The error messages will be very perplexing

  https://github.com/parcel-bundler/parcel/issues/4796
  https://github.com/parcel-bundler/parcel/issues/4240
  https://devblogs.microsoft.com/typescript/announcing-typescript-3-8/#type-only-imports-exports
*/let i={debug:!1,perf:!1};function s(e){if(null==e||"object"!=typeof e)return e;if(Array.isArray(e))return e.map(s);let t={};for(let r in e){let i=e[r];null!=e&&"object"==typeof e?t[r]=s(i):t[r]=i}return t}let n="-xin-data",o=`.${n}`,l="-xin-event",a=`.${l}`,h=Symbol("xin-path"),u=Symbol("xin-value"),c=e=>e[h];function d(e){// eslint-disable-next-line
return"object"==typeof e&&null!==e&&e[u]||e}let f=new WeakMap,p=new WeakMap,b=e=>{let t=e.cloneNode();if(t instanceof HTMLElement){let r=p.get(e),i=f.get(e);null!=r&&p.set(t,s(r)),null!=i&&f.set(t,s(i))}for(let r of e instanceof HTMLTemplateElement?e.content.childNodes:e.childNodes)r instanceof HTMLElement||r instanceof DocumentFragment?t.appendChild(b(r)):t.appendChild(r.cloneNode());return t},m=new WeakMap,g=e=>{let t=document.body.parentElement;for(;null!=e.parentElement&&e.parentElement!==t;){let t=m.get(e);if(null!=t)return t;e=e.parentElement}return!1},$=Symbol("observer should be removed"),y=[]// { path_string_or_test, callback }
,v=[],x=!1;class w{constructor(e,t){let r;let i="string"==typeof t?`"${t}"`:`function ${t.name}`;if("string"==typeof e)this.test=t=>"string"==typeof t&&""!==t&&(e.startsWith(t)||t.startsWith(e)),r=`test = "${e}"`;else if(e instanceof RegExp)this.test=e.test.bind(e),r=`test = "${e.toString()}"`;else if(e instanceof Function)this.test=e,r=`test = function ${e.name}`;else throw Error("expect listener test to be a string, RegExp, or test function");if(this.description=`${r}, ${i}`,"function"==typeof t)this.callback=t;else throw Error("expect callback to be a path or function");y.push(this)}}let E=async()=>{void 0!==e&&await e},A=()=>{i.perf&&console.time("xin async update");let e=[...v];for(let t of e)y.filter(e=>{let r;try{r=e.test(t)}catch(r){throw Error(`Listener ${e.description} threw "${r}" at "${t}"`)}return r===$?(k(e),!1):r}).forEach(e=>{let r;try{r=e.callback(t)}catch(r){console.error(`Listener ${e.description} threw "${r}" handling "${t}"`)}r===$&&k(e)});v.splice(0),x=!1,"function"==typeof t&&t(),i.perf&&console.timeEnd("xin async update")},S=r=>{let i="string"==typeof r?r:c(r);if(void 0===i)throw console.error("touch was called on an invalid target",r),Error("touch was called on an invalid target");!1===x&&(e=new Promise(e=>{t=e}),x=setTimeout(A)),null==v.find(e=>i.startsWith(e))&&v.push(i)},_=(e,t)=>new w(e,t),k=e=>{let t=y.indexOf(e);if(t>-1)y.splice(t,1);else throw Error("unobserve failed, listener not found")},C=e=>{try{return JSON.stringify(e)}catch(e){return"{has circular references}"}},M=(...e)=>Error(e.map(C).join(" ")),O=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1),L=0,T=()=>(parseInt("10000",36)+ ++L).toString(36).slice(-5),j=()=>O()+T(),P={},D={};function N(e){if(""===e)return[];if(Array.isArray(e))return e;{let t=[];for(;e.length>0;){let r=e.search(/\[[^\]]+\]/);if(-1===r){t.push(e.split("."));break}{let i=e.slice(0,r);e=e.slice(r),""!==i&&t.push(i.split(".")),r=e.indexOf("]")+1,t.push(e.slice(1,r-1)),"."===e.slice(r,r+1)&&(r+=1),e=e.slice(r)}}return t}}let F=new WeakMap;function R(e,t){void 0===F.get(e)&&F.set(e,{}),void 0===F.get(e)[t]&&(F.get(e)[t]={});let r=F.get(e)[t];return"_auto_"===t?e.forEach((e,t)=>{void 0===e._auto_&&(e._auto_=j()),r[e._auto_+""]=t}):e.forEach((e,i)=>{r[H(e,t)+""]=i}),r}function q(e,t,r,i){var s;let n;let o=""!==t?(s=r+"",(void 0===(n=(void 0===F.get(e)||void 0===F.get(e)[t]?R(e,t):F.get(e)[t])[s])||H(e[n],t)+""!==s)&&(n=R(e,t)[s]),n):r;if(i===P)return e.splice(o,1),F.delete(e),Symbol("deleted");if(i===D)""===t&&void 0===e[o]&&(e[o]={});else if(void 0!==i){if(void 0!==o)e[o]=i;else if(""!==t&&H(i,t)+""==r+"")e.push(i),o=e.length-1;else throw Error(`byIdPath insert failed at [${t}=${r}]`)}return e[o]}function B(e){if(!Array.isArray(e))throw M("setByPath failed: expected array, found",e)}function I(e){if(null==e||!(e instanceof Object))throw M("setByPath failed: expected Object, found",e)}function H(e,t){let r,i,s,n;let o=N(t),l=e;for(r=0,i=o.length;void 0!==l&&r<i;r++){let e=o[r];if(Array.isArray(e))for(s=0,n=e.length;void 0!==l&&s<n;s++){let t=e[s];l=l[t]}else if(0===l.length){if(// @ts-expect-error-error
l=l[e.slice(1)],"="!==e[0])return}else if(e.includes("=")){let[t,...r]=e.split("=");l=q(l,t,r.join("="))}else l=l[s=parseInt(e,10)]}return l}// list of Array functions that change the array
let W=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],z={},V=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,Q=e=>V.test(e),Z=(e="",t="")=>""===e?t:null!==t.match(/^\d+$/)||t.includes("=")?`${e}[${t}]`:`${e}.${t}`,J=(e="")=>({// TODO figure out how to correctly return array[Symbol.iterator] so that for(const foo of xin.foos) works
    // as you'd expect
    get(t,r){if(r===h)return e;if(r===u){for(;void 0!==c(t);)t=d(t);return t}if("symbol"==typeof r)return t[r];let i=r,s=i.match(/^([^.[]+)\.(.+)$/)??// basePath.subPath (omit '.')
    i.match(/^([^\]]+)(\[.+)/)??// basePath[subPath
    i.match(/^(\[[^\]]+\])\.(.+)$/)??// [basePath].subPath (omit '.')
    i.match(/^(\[[^\]]+\])\[(.+)$/)// [basePath][subPath
    ;if(null!==s){let[,r,i]=s,n=Z(e,r),o=H(t,r);return null!==o&&"object"==typeof o?new Proxy(o,J(n))[i]:o}if(i.startsWith("[")&&i.endsWith("]")&&(i=i.substring(1,i.length-1)),!Array.isArray(t)&&void 0!==t[i]||Array.isArray(t)&&i.includes("=")){let r;if(i.includes("=")){let[e,s]=i.split("=");r=t.find(t=>`${H(t,e)}`===s)}else r=t[i];if(null!==r&&"object"==typeof r){let t=Z(e,i);return new Proxy(r,J(t))}return"function"==typeof r?r.bind(t):r}if(!Array.isArray(t))return t[i];{let r=t[i];return"function"==typeof r?(...r)=>{// @ts-expect-error seriously, eslint?
    let s=Array.prototype[i].apply(t,r);return W.includes(i)&&S(e),s}:"object"==typeof r?new Proxy(r,J(Z(e,i))):r}},set(t,r,i){i=d(i);let s=Z(e,r);if(!Q(s))throw Error(`setting invalid path ${s}`);let n=d(Y[s]);return n!==i&&function(e,t,r){let i=e,s=N(t);for(;null!=i&&s.length>0;){let e=s.shift();if("string"==typeof e){let t=e.indexOf("=");if(t>-1){0===t?I(i):B(i);let n=e.slice(0,t),o=e.slice(t+1);if(i=q(i,n,o,s.length>0?D:r),0===s.length)return!0}else{B(i);let t=parseInt(e,10);if(s.length>0)i=i[t];else{if(r!==P){if(i[t]===r)return!1;i[t]=r}else i.splice(t,1);return!0}}}else if(Array.isArray(e)&&e.length>0)for(I(i);e.length>0;){let t=e.shift();if(e.length>0||s.length>0){var n,o;n=i,o=e.length>0?{}:[],void 0===n[t]&&void 0!==o&&(n[t]=o),i=n[t]}else{if(r!==P){if(i[t]===r)return!1;i[t]=r}else{if(!Object.prototype.hasOwnProperty.call(i,t))return!1;// eslint-disable-next-line
    delete i[t]}return!0}}else throw Error(`setByPath failed, bad path ${t}`)}// eslint-disable-next-line
    throw Error(`setByPath(${e}, ${t}, ${r}) failed`)}(z,s,i)&&S(s),!0}}),G=(e,t)=>{let r="function"==typeof t?t:Y[t];if("function"!=typeof r)throw Error(`observe expects a function or path to a function, ${t} is neither`);return _(e,r)},Y=new Proxy(z,J()),{document:U,MutationObserver:X}=globalThis,K=(e,t)=>{let r=p.get(e);if(null!=r)for(let i of r){let{binding:r,options:s}=i,{path:n}=i,{toDOM:o}=r;if(null!=o){if(n.startsWith("^")){let t=g(e);if(null!=t&&null!=t[h])n=i.path=`${t[h]}${n.substring(1)}`;else throw console.error(`Cannot resolve relative binding ${n}`,e,"is not part of a list"),Error(`Cannot resolve relative binding ${n}`)}(null==t||n.startsWith(t))&&o(e,Y[n],s)}}};// this is just to allow bind to be testable in node
if(null!=X){let e=new X(e=>{e.forEach(e=>{[...e.addedNodes].forEach(e=>{e instanceof HTMLElement&&[...e.querySelectorAll(o)].forEach(e=>K(e))})})});e.observe(U.body,{subtree:!0,childList:!0})}G(()=>!0,e=>{let t=U.querySelectorAll(o);for(let r of t)K(r,e)});let ee=e=>{// @ts-expect-error-error
let t=e.target.closest(o);for(;null!=t;){let e=p.get(t);for(let r of e){let{binding:e,path:i}=r,{fromDOM:s}=e;if(null!=s){let e;try{e=s(t,r.options)}catch(e){throw console.error("Cannot get value from",t,"via",r),Error("Cannot obtain value fromDOM")}if(null!=e){let t=Y[i];// eslint-disable-next-line
if(null==t)Y[i]=e;else{let r=null!=t[h]?t[u]:t,s=null!=e[h]?e[u]:e;r!==s&&(Y[i]=s)}}}}t=t.parentElement.closest(o)}};function et(e,t,r,i){let s;if(e instanceof DocumentFragment)throw Error("bind cannot bind to a DocumentFragment");if("object"==typeof t&&void 0===t[h]&&void 0===i){let{value:e}=t;s="string"==typeof e?e:e[h],i=t,delete i.value}else s="string"==typeof t?t:t[h];if(null==s)throw Error("bind requires a path or object with xin Proxy");let{toDOM:o}=r;e.classList.add(n);let l=p.get(e);return null==l&&(l=[],p.set(e,l)),l.push({path:s,binding:r,options:i}),null==o||s.startsWith("^")||S(s),e}null!=globalThis.document&&(U.body.addEventListener("change",ee,!0),U.body.addEventListener("input",ee,!0));let er=new Set,ei=e=>{// @ts-expect-error-error
let t=e?.target.closest(a),r=!1,i=new Proxy(e,{get(t,i){if("stopPropagation"===i)return()=>{e.stopPropagation(),r=!0};{// @ts-expect-error-error
let e=t[i];return"function"==typeof e?e.bind(t):e}}});for(;!r&&null!=t;){let s=f.get(t),n=s[e.type]||[];for(let e of n){if("function"==typeof e)e(i);else{let t=Y[e];if("function"==typeof t)t(i);else throw Error(`no event handler found at path ${e}`)}if(r)continue}t=null!=t.parentElement?t.parentElement.closest(a):null}},es=(e,t,r)=>{let i=f.get(e);e.classList.add(l),null==i&&(i={},f.set(e,i)),i[t]||(i[t]=[]),i[t].includes(r)||i[t].push(r),er.has(t)||(er.add(t),U.body.addEventListener(t,ei,!0))},en=(e,t)=>{let r=new Event(t);e.dispatchEvent(r)},eo=e=>e instanceof HTMLInputElement?e.type:e instanceof HTMLSelectElement&&e.hasAttribute("multiple")?"multi-select":"other",el=(e,t)=>{switch(eo(e)){case"radio":e.checked=e.value===t;break;case"checkbox":e.checked=!!t;break;case"date":e.valueAsDate=new Date(t);break;case"multi-select":for(let r of[...e.querySelectorAll("option")])r.selected=t[r.value];break;default:e.value=t}},ea=e=>{switch(eo(e)){case"radio":{let t=e.parentElement?.querySelector(`[name="${e.name}"]:checked`);return null!=t?t.value:null}case"checkbox":return e.checked;case"date":return e.valueAsDate?.toISOString();case"multi-select":return[...e.querySelectorAll("option")].reduce((e,t)=>(e[t.value]=t.selected,e),{});default:return e.value}},{ResizeObserver:eh}=globalThis,eu=null!=eh?new eh(e=>{for(let t of e){let e=t.target;en(e,"resize")}}):{observe(){},unobserve(){}},ec=(e,t,r=!0)=>{if(null!=e&&null!=t){if("string"==typeof t)e.textContent=t;else if(Array.isArray(t))t.forEach(t=>{e.append(t instanceof Node&&r?b(t):t)});else if(t instanceof Node)e.append(r?b(t):t);else throw Error("expect text content or document node")}},ed=(e,t=250)=>{let r;return(...i)=>{void 0!==r&&clearTimeout(r),r=setTimeout(()=>{e(...i)},t)}},ef=(e,t=250)=>{let r;let i=Date.now()-t,s=!1;return(...n)=>{if(clearTimeout(r),r=setTimeout(async()=>{e(...n),i=Date.now()},t),!s&&Date.now()-i>=t){s=!0;try{e(...n),i=Date.now()}finally{s=!1}}}},ep=Symbol("list-binding");function eb(e,t){let r=[...e.querySelectorAll(o)];for(let i of(e.matches(o)&&r.unshift(e),r)){let e=p.get(i);for(let r of e)r.path.startsWith("^")&&(r.path=`${t}${r.path.substring(1)}`),null!=r.binding.toDOM&&r.binding.toDOM(i,Y[r.path])}}class em{constructor(e,t={}){if(this._array=[],this.boundElement=e,this.itemToElement=new WeakMap,1!==e.children.length)throw Error("ListBinding expects an element with exactly one child element");if(e.children[0]instanceof HTMLTemplateElement){let t=e.children[0];if(1!==t.content.children.length)throw Error("ListBinding expects a template with exactly one child element");this.template=b(t.content.children[0])}else this.template=e.children[0],this.template.remove();this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),this.options=t,null!=t.virtual&&(eu.observe(this.boundElement),this._update=ef(()=>{this.update(this._array,!0)},16// 60fps
),this.boundElement.addEventListener("scroll",this._update),this.boundElement.addEventListener("resize",this._update))}visibleSlice(){let{virtual:e,hiddenProp:t,visibleProp:r}=this.options,i=this._array;void 0!==t&&(i=i.filter(e=>!0!==e[t])),void 0!==r&&(i=i.filter(e=>!0===e[r]));let s=0,n=i.length-1,o=0,l=0;if(null!=e){let t=this.boundElement.offsetWidth,r=this.boundElement.offsetHeight,a=null!=e.width?Math.max(1,Math.floor(t/e.width)):1,h=Math.ceil(r/e.height)+1,u=Math.ceil(i.length/a),c=Math.floor(this.boundElement.scrollTop/e.height);c>u-h+1&&(c=Math.max(0,u-h+1)),n=(s=c*a)+a*h-1,o=c*e.height,l=Math.max(u*e.height-r-o,0)}return{items:i,firstItem:s,lastItem:n,topBuffer:o,bottomBuffer:l}}update(e,t){null==e&&(e=[]),this._array=e;let{initInstance:r,updateInstance:s,hiddenProp:n,visibleProp:o}=this.options,l=c(e),a=this.visibleSlice();this.boundElement.classList.toggle("-xin-empty-list",0===a.items.length);let h=this._previousSlice,{firstItem:u,lastItem:f,topBuffer:p,bottomBuffer:g}=a;if(void 0===n&&void 0===o&&!0===t&&null!=h&&u===h.firstItem&&f===h.lastItem)return;this._previousSlice=a;let $=0,y=0,v=0;for(let e of[...this.boundElement.children]){if(e===this.listTop||e===this.listBottom)continue;let t=m.get(e);if(null==t)e.remove();else{let r=a.items.indexOf(t);(r<u||r>f)&&(e.remove(),this.itemToElement.delete(t),m.delete(e),$++)}}this.listTop.style.height=String(p)+"px",this.listBottom.style.height=String(g)+"px";// build a complete new set of elements in the right order
let x=[],{idPath:w}=this.options;for(let e=u;e<=f;e++){let t=a.items[e];if(void 0===t)continue;let i=this.itemToElement.get(d(t));if(null==i){if(v++,i=b(this.template),"object"==typeof t&&(this.itemToElement.set(d(t),i),m.set(i,d(t))),this.boundElement.insertBefore(i,this.listBottom),null!=w){let e=t[w],r=`${l}[${w}=${e}]`;eb(i,r)}else{let t=`${l}[${e}]`;eb(i,t)}null!=r&&r(i,t)}null!=s&&s(i,t),x.push(i)}// make sure all the elements are in the DOM and in the correct location
let E=null;for(let e of x)e.previousElementSibling!==E&&(y++,E?.nextElementSibling!=null?this.boundElement.insertBefore(e,E.nextElementSibling):this.boundElement.insertBefore(e,this.listBottom)),E=e;i.perf&&console.log(l,"updated",{removed:$,created:v,moved:y})}}let eg=(e,t)=>{let r=e[ep];return void 0===r&&(r=new em(e,t),e[ep]=r),r},e$={value:{toDOM(e,t){el(e,t)},fromDOM:e=>ea(e)},text:{toDOM(e,t){e.textContent=t}},enabled:{toDOM(e,t){e.disabled=!t}},disabled:{toDOM(e,t){e.disabled=!!t}},style:{toDOM(e,t){if("object"==typeof t)for(let r of Object.keys(t))e.style[r]=t[r];else if("string"==typeof t)e.setAttribute("style",t);else throw Error("style binding expects either a string or object")}},list:{toDOM(e,t,r){let i=eg(e,r);i.update(t)}}};function ey(e,t,r){return t<e?e:t>r?r:t}function ev(e,t,r){return(r=ey(0,r,1))*(t-e)+e}let ex={clamp:ey,lerp:ev},ew=e=>("00"+Math.round(Number(e)).toString(16)).slice(-2);class eE{constructor(e,t,r){e/=255,t/=255,r/=255;let i=Math.max(e,t,r),s=i-Math.min(e,t,r),n=0!==s?i===e?(t-r)/s:i===t?2+(r-e)/s:4+(e-t)/s:0;this.h=60*n<0?60*n+360:60*n,this.s=0!==s?i<=.5?s/(2*i-s):s/(2-(2*i-s)):0,this.l=(2*i-s)/2}}let eA=void 0!==globalThis.document?globalThis.document.createElement("span"):void 0;class eS{static fromCss(e){let t=e;eA instanceof HTMLSpanElement&&(eA.style.color=e,document.body.appendChild(eA),t=getComputedStyle(eA).color,eA.remove());let[r,i,s,n]=t.match(/[\d.]+/g);return new eS(Number(r),Number(i),Number(s),null==n?1:Number(n))}static fromHsl(e,t,r,i=1){return eS.fromCss(`hsla(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%, ${i.toFixed(2)})`)}constructor(e,t,r,i=1){this.r=ey(0,e,255),this.g=ey(0,t,255),this.b=ey(0,r,255),this.a=void 0!==i?ey(0,i,1):i=1}get inverse(){return new eS(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){let{h:e,s:t,l:r}=this._hsl;return eS.fromHsl(e,t,1-r,this.a)}get rgb(){let{r:e,g:t,b:r}=this;return`rgb(${e.toFixed(0)},${t.toFixed(0)},${r.toFixed(0)})`}get rgba(){let{r:e,g:t,b:r,a:i}=this;return`rgba(${e.toFixed(0)},${t.toFixed(0)},${r.toFixed(0)},${i.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}get _hsl(){return null==this._hslCached&&(this._hslCached=new eE(this.r,this.g,this.b)),this._hslCached}get hsl(){let{h:e,s:t,l:r}=this._hsl;return`hsl(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%)`}get hsla(){let{h:e,s:t,l:r}=this._hsl;return`hsla(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%, ${this.a.toFixed(2)})`}get mono(){let e=255*this.brightness;return new eS(e,e,e)}get brightness(){// http://www.itu.int/rec/R-REC-BT.601
return(.299*this.r+.587*this.g+.114*this.b)/255}get html(){return 1===this.a?"#"+ew(this.r)+ew(this.g)+ew(this.b):"#"+ew(this.r)+ew(this.g)+ew(this.b)+ew(Math.floor(255*this.a))}brighten(e){let{h:t,s:r,l:i}=this._hsl,s=ey(0,i+e*(1-i),1);return eS.fromHsl(t,r,s,this.a)}darken(e){let{h:t,s:r,l:i}=this._hsl,s=ey(0,i*(1-e),1);return eS.fromHsl(t,r,s,this.a)}saturate(e){let{h:t,s:r,l:i}=this._hsl,s=ey(0,r+e*(1-r),1);return eS.fromHsl(t,s,i,this.a)}desaturate(e){let{h:t,s:r,l:i}=this._hsl,s=ey(0,r*(1-e),1);return eS.fromHsl(t,s,i,this.a)}rotate(e){let{h:t,s:r,l:i}=this._hsl;return eS.fromHsl((t+360+e)%360,r,i,this.a)}opacity(e){let{h:t,s:r,l:i}=this._hsl;return eS.fromHsl(t,r,i,e)}swatch(){let{r:e,g:t,b:r,a:i}=this;console.log(`%c   %c ${this.html}, rgba(${e}, ${t}, ${r}, ${i}), ${this.hsla}`,`background-color: rgba(${e}, ${t}, ${r}, ${i})`,"background-color: #eee")}blend(e,t){return new eS(ev(this.r,e.r,t),ev(this.g,e.g,t),ev(this.b,e.b,t),ev(this.a,e.a,t))}}function e_(e){return e.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)}let ek={},eC=(e,...t)=>{if(void 0===ek[e]){let[t,r]=e.split("|");void 0===r?ek[e]=globalThis.document.createElement(t):ek[e]=globalThis.document.createElementNS(r,t)}let r=ek[e].cloneNode(),i={};for(let e of t)e instanceof Element||e instanceof DocumentFragment||"string"==typeof e||"number"==typeof e?r instanceof HTMLTemplateElement?r.content.append(e):r.append(e):Object.assign(i,e);for(let e of Object.keys(i)){let t=i[e];if("apply"===e)t(r);else if("style"===e){if("object"==typeof t)for(let e of Object.keys(t))e.startsWith("--")?r.style.setProperty(e,t[e]):r.style[e]=t[e];else r.setAttribute("style",t)}else if(null!=e.match(/^on[A-Z]/)){let i=e.substring(2).toLowerCase();es(r,i,t)}else if("bind"===e){let e="string"==typeof t.binding?e$[t.binding]:t.binding;if(void 0!==e&&void 0!==t.value)et(r,t.value,t.binding instanceof Function?{toDOM:t.binding}:t.binding);else throw Error("bad binding")}else if(null!=e.match(/^bind[A-Z]/)){let i=e.substring(4,5).toLowerCase()+e.substring(5),s=e$[i];if(void 0!==s)et(r,t,s);else throw Error(`${e} is not allowed, bindings.${i} is not defined`)}else if(void 0!==r[e]){// MathML is only supported on 91% of browsers, and not on the Raspberry Pi Chromium
let{MathMLElement:i}=globalThis;r instanceof SVGElement||void 0!==i&&r instanceof i?r.setAttribute(e,t):r[e]=t}else{let i=e_(e);"class"===i?t.split(" ").forEach(e=>{r.classList.add(e)}):void 0!==r[i]?r[i]=t:"boolean"==typeof t?t?r.setAttribute(i,""):r.removeAttribute(i):r.setAttribute(i,t)}}return r},eM=(...e)=>{let t=globalThis.document.createDocumentFragment();for(let r of e)t.append(r);return t},eO=new Proxy({fragment:eM},{get:(e,t)=>(void 0===e[t=t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)]&&(e[t]=(...e)=>eC(t,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),eL=new Proxy({fragment:eM},{get:(e,t)=>(void 0===e[t]&&(e[t]=(...e)=>eC(`${t}|http://www.w3.org/2000/svg`,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),eT=new Proxy({fragment:eM},{get:(e,t)=>(void 0===e[t]&&(e[t]=(...e)=>eC(`${t}|http://www.w3.org/1998/Math/MathML`,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),ej=["animation-iteration-count","flex","flex-base","flex-grow","flex-shrink","gap","opacity","order","tab-size","widows","z-index","zoom"],eP=(e,t,r)=>void 0===r?"":"string"==typeof r||ej.includes(t)?`${e}  ${t}: ${r};`:`${e}  ${t}: ${r}px;`,eD=(e,t,r="")=>{let i=e_(e);if("object"!=typeof t)return eP(r,i,t);{let i=Object.keys(t).map(e=>eD(e,t[e],`${r}  `)).join("\n");return`${r}  ${e} {
${i}
${r}  }`}},eN=(e,t="")=>{let r=Object.keys(e).map(r=>{let i=e[r];if("string"==typeof i){if("@import"===r)return`@import url('${i}');`;throw Error("top-level string value only allowed for `@import`")}let s=Object.keys(i).map(e=>eD(e,i[e])).join("\n");return`${t}${r} {
${s}
}`});return r.join("\n\n")},eF=e=>{let t={};for(let r of Object.keys(e)){let i=e[r],s=e_(r);t[`--${s}`]="number"==typeof i&&0!==i?String(i)+"px":i}return t},eR=e=>{let t={};for(let r of Object.keys(e)){let i=e[r];"string"==typeof i&&null!=i.match(/^(#|rgb[a]?\(|hsl[a]?\()/)&&(i=eS.fromCss(i).inverseLuminance.html,t[`--${e_(r)}`]=i)}return t},eq=new Proxy({},{get(e,t){if(null==e[t]){t=t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`);let[,r,,i,s,n]=t.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/),o=`--${r}`;if(null!=s){let r=null==i?Number(s)/100:-Number(s)/100;switch(n){case"b":{let i=getComputedStyle(document.body).getPropertyValue(o);e[t]=r>0?eS.fromCss(i).brighten(r).rgba:eS.fromCss(i).darken(-r).rgba}break;case"s":{let i=getComputedStyle(document.body).getPropertyValue(o);e[t]=r>0?eS.fromCss(i).saturate(r).rgba:eS.fromCss(i).desaturate(-r).rgba}break;case"h":{let i=getComputedStyle(document.body).getPropertyValue(o);e[t]=eS.fromCss(i).rotate(100*r).rgba,console.log(eS.fromCss(i).hsla,eS.fromCss(i).rotate(r).hsla)}break;case"o":{let i=getComputedStyle(document.body).getPropertyValue(o);e[t]=eS.fromCss(i).opacity(r).rgba}break;case"":e[t]=`calc(var(${o}) * ${r})`;break;default:throw console.error(n),Error(`Unrecognized method ${n} for css variable ${o}`)}}else e[t]=`var(${o})`}return e[t]}}),eB=new Proxy({},{get(e,t){if(void 0===e[t]){let r=`--${t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)}`;e[t]=e=>`var(${r}, ${e})`}return e[t]}}),eI=0;function eH(){return`custom-elt${(eI++).toString(36)}`}let eW=0;class ez extends HTMLElement{static #e=(()=>{this.elements=eO})();static StyleNode(e){return eO.style(eN(e))}static elementCreator(e={}){if(null==this._elementCreator){let{tag:t,styleSpec:r}=e,i=null!=e?t:null;for(null==i&&("string"==typeof this.name&&""!==this.name?(i=e_(this.name)).startsWith("-")&&(i=i.slice(1)):i=eH()),null!=customElements.get(i)&&console.warn(`${i} is already defined`),null==i.match(/\w+(-\w+)+/)&&(console.warn(`${i} is not a legal tag for a custom-element`),i=eH());void 0!==customElements.get(i);)i=eH();if(window.customElements.define(i,this,e),this._elementCreator=eO[i],void 0!==r){let e=eN(r);void 0!==t&&i!==t&&(e=e.replace(RegExp(`\\b${t}\\b`,"g"),i)),document.head.append(eO.style({id:i},e))}}return this._elementCreator}initAttributes(...e){let t={},r={},i=new MutationObserver(t=>{let r=!1;t.forEach(t=>{r=!!(t.attributeName&&e.includes(t.attributeName.replace(/-([a-z])/g,(e,t)=>t.toLocaleUpperCase())))}),r&&void 0!==this.queueRender&&this.queueRender(!1)});i.observe(this,{attributes:!0}),e.forEach(e=>{t[e]=s(this[e]);let i=e_(e);Object.defineProperty(this,e,{enumerable:!1,get(){return"boolean"==typeof t[e]?this.hasAttribute(i):this.hasAttribute(i)?"number"==typeof t[e]?parseFloat(this.getAttribute(i)):this.getAttribute(i):void 0!==r[e]?r[e]:t[e]},set(s){"boolean"==typeof t[e]?s!==this[e]&&(s?this.setAttribute(i,""):this.removeAttribute(i),this.queueRender()):"number"==typeof t[e]?s!==parseFloat(this[e])&&(this.setAttribute(i,s),this.queueRender()):("object"==typeof s||`${s}`!=`${this[e]}`)&&(null==s||"object"==typeof s?this.removeAttribute(i):this.setAttribute(i,s),this.queueRender(),r[e]=s)}})})}initValue(){let e=Object.getOwnPropertyDescriptor(this,"value");if(void 0===e||void 0!==e.get||void 0!==e.set)return;let t=this.hasAttribute("value")?this.getAttribute("value"):s(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get:()=>t,set(e){t!==e&&(t=e,this.queueRender(!0))}})}get refs(){console.warn("refs and data-ref are deprecated, use the part attribute and .parts instead");let e=null!=this.shadowRoot?this.shadowRoot:this;return null==this._refs&&(this._refs=new Proxy({},{get(t,r){if(void 0===t[r]){let i=e.querySelector(`[part="${r}"],[data-ref="${r}"]`);if(null==i&&(i=e.querySelector(r)),null==i)throw Error(`elementRef "${r}" does not exist!`);i.removeAttribute("data-ref"),t[r]=i}return t[r]}})),this._refs}get parts(){let e=null!=this.shadowRoot?this.shadowRoot:this;return null==this._refs&&(this._refs=new Proxy({},{get(t,r){if(void 0===t[r]){let i=e.querySelector(`[part="${r}"]`);if(null==i&&(i=e.querySelector(r)),null==i)throw Error(`elementRef "${r}" does not exist!`);i.removeAttribute("data-ref"),t[r]=i}return t[r]}})),this._refs}constructor(){super(),this.content=eO.slot(),this._changeQueued=!1,this._renderQueued=!1,this._hydrated=!1,eW+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${eW}`,this._value=s(this.defaultValue)}connectedCallback(){this.hydrate(),null!=this.role&&this.setAttribute("role",this.role),void 0!==this.onResize&&(eu.observe(this),null==this._onResize&&(this._onResize=this.onResize.bind(this)),this.addEventListener("resize",this._onResize)),null!=this.value&&null!=this.getAttribute("value")&&(this._value=this.getAttribute("value")),this.queueRender()}disconnectedCallback(){eu.unobserve(this)}queueRender(e=!1){this._hydrated&&(this._changeQueued||(this._changeQueued=e),this._renderQueued||(this._renderQueued=!0,requestAnimationFrame(()=>{this._changeQueued&&en(this,"change"),this._changeQueued=!1,this._renderQueued=!1,this.render()})))}hydrate(){if(!this._hydrated){this.initValue();let e="function"!=typeof this.content,t="function"==typeof this.content?this.content():this.content;if(void 0!==this.styleNode){let r=this.attachShadow({mode:"open"});r.appendChild(this.styleNode),ec(r,t,e)}else if(null!==t){let r=[...this.childNodes];ec(this,t,e),this.isSlotted=void 0!==this.querySelector("slot,xin-slot");let i=[...this.querySelectorAll("slot")];if(i.length>0&&i.forEach(eV.replaceSlot),r.length>0){let e={"":this};[...this.querySelectorAll("xin-slot")].forEach(t=>{e[t.name]=t}),r.forEach(t=>{let r=e[""],i=t instanceof Element?e[t.slot]:r;(void 0!==i?i:r).append(t)})}}this._hydrated=!0}}render(){}}class eV extends ez{static replaceSlot(e){let t=document.createElement("xin-slot");""!==e.name&&t.setAttribute("name",e.name),e.replaceWith(t)}constructor(){super(),this.name="",this.content=null,this.initAttributes("name")}}eV.elementCreator({tag:"xin-slot"});let eQ=(e=()=>!0)=>{let t=localStorage.getItem("xin-state");if(null!=t){let r=JSON.parse(t);for(let t of Object.keys(r).filter(e))void 0!==Y[t]?Object.assign(Y[t],r[t]):Y[t]=r[t]}let r=ed(()=>{let t={},r=Y[u];for(let i of Object.keys(r).filter(e))t[i]=r[i];localStorage.setItem("xin-state",JSON.stringify(t)),console.log("xin state saved to localStorage")},500);G(e,r)};var eZ={};r(eZ,"XinTest",()=>eY),r(eZ,"xinTest",()=>eU);let{span:eJ,slot:eG}=eO;class eY extends ez{static delay(e){return new Promise(t=>{setTimeout(t,e)})}constructor(){super(),this.test=()=>!0,this.delay=0,this.statis="",this.expect=!0,this.styleNode=ez.StyleNode({":host":{display:"flex",gap:"5px",alignItems:"center"},':host [part="outcome"]':{display:"inline-block",borderRadius:"99px",padding:"0 12px",fontSize:"80%"},":host .waiting":{background:"#ff04"},":host .running":{background:"#f804"},":host .success":{background:"#0f04"},":host .failed":{background:"#f004"},":host .exception":{color:"white",background:"red"}}),this.content=[eJ({part:"description"},eG()),eJ({part:"outcome"})],this.run=()=>{clearTimeout(this.timeout),this.status="waiting",this.timeout=setTimeout(async()=>{this.status="running";try{let e=JSON.stringify(await this.test());e===JSON.stringify(this.expect)?this.status="success":this.status=`failed: got ${e}, expected ${this.expect}`}catch(e){this.status=`exception: ${e}`}},this.delay)},this.initAttributes("description","delay","status")}connectedCallback(){super.connectedCallback(),this.run()}disconnectedCallback(){super.disconnectedCallback(),this.class,clearTimeout(this.timeout)}render(){super.render();let{outcome:e}=this.parts;e.textContent=this.status,e.setAttribute("class",this.status.match(/\w+/)[0])}}let eU=eY.elementCreator({tag:"xin-test"});function eX(e){let t={};return Object.keys(e).forEach(r=>{Y[r]=e[r],t[r]=Y[r]}),t}export{et as bind,es as on,e$ as bindings,eN as css,eR as darkMode,eF as initVars,eq as vars,eB as varDefault,eS as Color,ez as Component,eO as elements,eL as svgElements,eT as mathML,eQ as hotReload,g as getListItem,c as xinPath,d as xinValue,ex as MoreMath,i as settings,ef as throttle,ed as debounce,Y as xin,G as observe,k as unobserve,S as touch,$ as observerShouldBeRemoved,E as updates,eX as xinProxy,eY as XinTest,eU as xinTest};//# sourceMappingURL=index.js.map

//# sourceMappingURL=index.js.map
