let e;let t={debug:!1,perf:!1};function r(e){if(null==e||"object"!=typeof e)return e;if(Array.isArray(e))return e.map(r);let t={};for(let l in e){let i=e[l];null!=e&&"object"==typeof e?t[l]=r(i):t[l]=i}return t}let l="-xin-data",i=`.${l}`,n="-xin-event",o=`.${n}`,s=Symbol("xin-path"),a=Symbol("xin-value"),h=e=>e[s];function u(e){return"object"==typeof e&&null!==e&&e[a]||e}let c=new WeakMap,d=new WeakMap,f=e=>{let t=e.cloneNode();if(t instanceof HTMLElement){let l=d.get(e),i=c.get(e);null!=l&&d.set(t,r(l)),null!=i&&c.set(t,r(i))}for(let r of e instanceof HTMLTemplateElement?e.content.childNodes:e.childNodes)r instanceof HTMLElement||r instanceof DocumentFragment?t.appendChild(f(r)):t.appendChild(r.cloneNode());return t},p=new WeakMap,b=e=>{let t=document.body.parentElement;for(;null!=e.parentElement&&e.parentElement!==t;){let t=p.get(e);if(null!=t)return t;e=e.parentElement}return!1},m=Symbol("observer should be removed"),g=[],$=[],y=!1;class v{constructor(e,t){let r;let l="string"==typeof t?`"${t}"`:`function ${t.name}`;if("string"==typeof e)this.test=t=>"string"==typeof t&&""!==t&&(e.startsWith(t)||t.startsWith(e)),r=`test = "${e}"`;else if(e instanceof RegExp)this.test=e.test.bind(e),r=`test = "${e.toString()}"`;else if(e instanceof Function)this.test=e,r=`test = function ${e.name}`;else throw Error("expect listener test to be a string, RegExp, or test function");if(this.description=`${r}, ${l}`,"function"==typeof t)this.callback=t;else throw Error("expect callback to be a path or function");g.push(this)}}let x=()=>{t.perf&&console.time("xin async update");let r=[...$];for(let e of r)g.filter(t=>{let r;try{r=t.test(e)}catch(r){throw Error(`Listener ${t.description} threw "${r}" at "${e}"`)}return r===m?(A(t),!1):r}).forEach(t=>{let r;try{r=t.callback(e)}catch(r){console.error(`Listener ${t.description} threw "${r}" handling "${e}"`)}r===m&&A(t)});$.splice(0),y=!1,"function"==typeof e&&e(),t.perf&&console.timeEnd("xin async update")},w=t=>{let r="string"==typeof t?t:h(t);if(void 0===r)throw console.error("touch was called on an invalid target",t),Error("touch was called on an invalid target");!1===y&&(new Promise(t=>{e=t}),y=setTimeout(x)),null==$.find(e=>r.startsWith(e))&&$.push(r)},E=(e,t)=>new v(e,t),A=e=>{let t=g.indexOf(e);if(t>-1)g.splice(t,1);else throw Error("unobserve failed, listener not found")},_=e=>{try{return JSON.stringify(e)}catch(e){return"{has circular references}"}},S=(...e)=>Error(e.map(_).join(" ")),M=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1),C=0,O=()=>(parseInt("10000",36)+ ++C).toString(36).slice(-5),L=()=>M()+O(),k={},j={};function P(e){if(""===e)return[];if(Array.isArray(e))return e;{let t=[];for(;e.length>0;){let r=e.search(/\[[^\]]+\]/);if(-1===r){t.push(e.split("."));break}{let l=e.slice(0,r);e=e.slice(r),""!==l&&t.push(l.split(".")),r=e.indexOf("]")+1,t.push(e.slice(1,r-1)),"."===e.slice(r,r+1)&&(r+=1),e=e.slice(r)}}return t}}let T=new WeakMap;function D(e,t){void 0===T.get(e)&&T.set(e,{}),void 0===T.get(e)[t]&&(T.get(e)[t]={});let r=T.get(e)[t];return"_auto_"===t?e.forEach((e,t)=>{void 0===e._auto_&&(e._auto_=L()),r[e._auto_+""]=t}):e.forEach((e,l)=>{r[q(e,t)+""]=l}),r}function F(e,t,r,l){var i;let n;let o=""!==t?(i=r+"",(void 0===(n=(void 0===T.get(e)||void 0===T.get(e)[t]?D(e,t):T.get(e)[t])[i])||q(e[n],t)+""!==i)&&(n=D(e,t)[i]),n):r;if(l===k)return e.splice(o,1),T.delete(e),Symbol("deleted");if(l===j)""===t&&void 0===e[o]&&(e[o]={});else if(void 0!==l){if(void 0!==o)e[o]=l;else if(""!==t&&q(l,t)+""==r+"")e.push(l),o=e.length-1;else throw Error(`byIdPath insert failed at [${t}=${r}]`)}return e[o]}function R(e){if(!Array.isArray(e))throw S("setByPath failed: expected array, found",e)}function N(e){if(null==e||!(e instanceof Object))throw S("setByPath failed: expected Object, found",e)}function q(e,t){let r,l,i,n;let o=P(t),s=e;for(r=0,l=o.length;void 0!==s&&r<l;r++){let e=o[r];if(Array.isArray(e))for(i=0,n=e.length;void 0!==s&&i<n;i++){let t=e[i];s=s[t]}else if(0===s.length){if(s=s[e.slice(1)],"="!==e[0])return}else if(e.includes("=")){let[t,...r]=e.split("=");s=F(s,t,r.join("="))}else s=s[i=parseInt(e,10)]}return s}let B=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],H={},I=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,W=e=>I.test(e),z=(e="",t="")=>""===e?t:null!==t.match(/^\d+$/)||t.includes("=")?`${e}[${t}]`:`${e}.${t}`,V=(e="")=>({get(t,r){if(r===s)return e;if(r===a){for(;void 0!==h(t);)t=u(t);return t}if("symbol"==typeof r)return t[r];let l=r,i=l.match(/^([^.[]+)\.(.+)$/)??l.match(/^([^\]]+)(\[.+)/)??l.match(/^(\[[^\]]+\])\.(.+)$/)??l.match(/^(\[[^\]]+\])\[(.+)$/);if(null!==i){let[,r,l]=i,n=z(e,r),o=q(t,r);return null!==o&&"object"==typeof o?new Proxy(o,V(n))[l]:o}if(l.startsWith("[")&&l.endsWith("]")&&(l=l.substring(1,l.length-1)),!Array.isArray(t)&&void 0!==t[l]||Array.isArray(t)&&l.includes("=")){let r;if(l.includes("=")){let[e,i]=l.split("=");r=t.find(t=>`${q(t,e)}`===i)}else r=t[l];if(null!==r&&"object"==typeof r){let t=z(e,l);return new Proxy(r,V(t))}return"function"==typeof r?r.bind(t):r}if(!Array.isArray(t))return t[l];{let r=t[l];return"function"==typeof r?(...r)=>{let i=Array.prototype[l].apply(t,r);return B.includes(l)&&w(e),i}:"object"==typeof r?new Proxy(r,V(z(e,l))):r}},set(t,r,l){l=u(l);let i=z(e,r);if(!W(i))throw Error(`setting invalid path ${i}`);let n=u(Z[i]);return n!==l&&function(e,t,r){let l=e,i=P(t);for(;null!=l&&i.length>0;){let e=i.shift();if("string"==typeof e){let t=e.indexOf("=");if(t>-1){0===t?N(l):R(l);let n=e.slice(0,t),o=e.slice(t+1);if(l=F(l,n,o,i.length>0?j:r),0===i.length)return!0}else{R(l);let t=parseInt(e,10);if(i.length>0)l=l[t];else{if(r!==k){if(l[t]===r)return!1;l[t]=r}else l.splice(t,1);return!0}}}else if(Array.isArray(e)&&e.length>0)for(N(l);e.length>0;){let t=e.shift();if(e.length>0||i.length>0){var n,o;n=l,o=e.length>0?{}:[],void 0===n[t]&&void 0!==o&&(n[t]=o),l=n[t]}else{if(r!==k){if(l[t]===r)return!1;l[t]=r}else{if(!Object.prototype.hasOwnProperty.call(l,t))return!1;delete l[t]}return!0}}else throw Error(`setByPath failed, bad path ${t}`)}throw Error(`setByPath(${e}, ${t}, ${r}) failed`)}(H,i,l)&&w(i),!0}}),Q=(e,t)=>{let r="function"==typeof t?t:Z[t];if("function"!=typeof r)throw Error(`observe expects a function or path to a function, ${t} is neither`);return E(e,r)},Z=new Proxy(H,V()),{document:G,MutationObserver:J}=globalThis,Y=(e,t)=>{let r=d.get(e);if(null!=r)for(let l of r){let{path:r,binding:i,options:n}=l,{toDOM:o}=i;if(null!=o){if(r.startsWith("^")){let t=b(e);if(null!=t&&null!=t[s])r=l.path=`${t[s]}${r.substring(1)}`;else throw console.error(`Cannot resolve relative binding ${r}`,e,"is not part of a list"),Error(`Cannot resolve relative binding ${r}`)}(null==t||r.startsWith(t))&&o(e,Z[r],n)}}};if(null!=J){let e=new J(e=>{e.forEach(e=>{[...e.addedNodes].forEach(e=>{e instanceof HTMLElement&&[...e.querySelectorAll(i)].forEach(e=>Y(e))})})});e.observe(G.body,{subtree:!0,childList:!0})}Q(()=>!0,e=>{let t=G.querySelectorAll(i);for(let r of t)Y(r,e)});let U=e=>{let t=e.target.closest(i);for(;null!=t;){let e=d.get(t);for(let r of e){let{binding:e,path:l}=r,{fromDOM:i}=e;if(null!=i){let e;try{e=i(t,r.options)}catch(e){throw console.error("Cannot get value from",t,"via",r),Error("Cannot obtain value fromDOM")}if(null!=e){let t=Z[l];if(null==t)Z[l]=e;else{let r=null!=t[s]?t[a]:t,i=null!=e[s]?e[a]:e;r!==i&&(Z[l]=i)}}}}t=t.parentElement.closest(i)}};function K(e,t,r,i){let n;if(e instanceof DocumentFragment)throw Error("bind cannot bind to a DocumentFragment");if("object"==typeof t&&void 0===t[s]&&void 0===i){let{value:e}=t;n="string"==typeof e?e:e[s],i=t,delete i.value}else n="string"==typeof t?t:t[s];if(null==n)throw Error("bind requires a path or object with xin Proxy");let{toDOM:o}=r;e.classList.add(l);let a=d.get(e);return null==a&&(a=[],d.set(e,a)),a.push({path:n,binding:r,options:i}),null==o||n.startsWith("^")||w(n),e}null!=globalThis.document&&(G.body.addEventListener("change",U,!0),G.body.addEventListener("input",U,!0));let X=new Set,ee=e=>{let t=e?.target.closest(o),r=!1,l=new Proxy(e,{get(t,l){if("stopPropagation"===l)return()=>{e.stopPropagation(),r=!0};{let e=t[l];return"function"==typeof e?e.bind(t):e}}});for(;!r&&null!=t;){let i=c.get(t),n=i[e.type]||[];for(let e of n){if("function"==typeof e)e(l);else{let t=Z[e];if("function"==typeof t)t(l);else throw Error(`no event handler found at path ${e}`)}if(r)continue}t=null!=t.parentElement?t.parentElement.closest(o):null}},et=(e,t,r)=>{let l=c.get(e);e.classList.add(n),null==l&&(l={},c.set(e,l)),l[t]||(l[t]=[]),l[t].includes(r)||l[t].push(r),X.has(t)||(X.add(t),G.body.addEventListener(t,ee,!0))},er=(e,t)=>{let r=new Event(t);e.dispatchEvent(r)},el=e=>e instanceof HTMLInputElement?e.type:e instanceof HTMLSelectElement&&e.hasAttribute("multiple")?"multi-select":"other",ei=(e,t)=>{switch(el(e)){case"radio":e.checked=e.value===t;break;case"checkbox":e.checked=t;break;case"date":e.valueAsDate=new Date(t);break;case"multi-select":for(let r of[...e.querySelectorAll("option")])r.selected=t[r.value];break;default:e.value=t}},en=e=>{switch(el(e)){case"radio":{let t=e.parentElement?.querySelector(`[name="${e.name}"]:checked`);return null!=t?t.value:null}case"checkbox":return e.checked;case"date":return e.valueAsDate.toISOString();case"multi-select":return[...e.querySelectorAll("option")].reduce((e,t)=>(e[t.value]=t.selected,e),{});default:return e.value}},{ResizeObserver:eo}=globalThis,es=null!=eo?new eo(e=>{for(let t of e){let e=t.target;er(e,"resize")}}):{observe(){},unobserve(){}},ea=(e,t,r=!0)=>{if(null!=e&&null!=t){if("string"==typeof t)e.textContent=t;else if(Array.isArray(t))t.forEach(t=>{e.append(t instanceof Node&&r?f(t):t)});else if(t instanceof HTMLElement||t instanceof DocumentFragment)e.append(r?f(t):t);else throw Error("expect text content or document node")}},eh=(e,t=250)=>{let r;return(...l)=>{void 0!==r&&clearTimeout(r),r=setTimeout(()=>{e(...l)},t)}},eu=(e,t=250)=>{let r;let l=Date.now()-t,i=!1;return(...n)=>{if(clearTimeout(r),r=setTimeout(async()=>{e(...n),l=Date.now()},t),!i&&Date.now()-l>=t){i=!0;try{e(...n),l=Date.now()}finally{i=!1}}}},ec=Symbol("list-binding");function ed(e,t){let r=[...e.querySelectorAll(i)];for(let l of(e.matches(i)&&r.unshift(e),r)){let e=d.get(l);for(let r of e)r.path.startsWith("^")&&(r.path=`${t}${r.path.substring(1)}`),null!=r.binding.toDOM&&r.binding.toDOM(l,Z[r.path])}}class ef{constructor(e,t={}){if(this._array=[],this.boundElement=e,this.itemToElement=new WeakMap,1!==e.children.length)throw Error("ListBinding expects an element with exactly one child element");if(e.children[0]instanceof HTMLTemplateElement){let t=e.children[0];if(1!==t.content.children.length)throw Error("ListBinding expects a template with exactly one child element");this.template=f(t.content.children[0])}else this.template=e.children[0],this.template.remove();this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),this.options=t,null!=t.virtual&&(es.observe(this.boundElement),this._update=eu(()=>{this.update(this._array,!0)},16),this.boundElement.addEventListener("scroll",this._update),this.boundElement.addEventListener("resize",this._update))}visibleSlice(){let{virtual:e,hiddenProp:t,visibleProp:r}=this.options,l=this._array;void 0!==t&&(l=l.filter(e=>!0!==e[t])),void 0!==r&&(l=l.filter(e=>!0===e[r]));let i=0,n=l.length-1,o=0,s=0;if(null!=e){let t=this.boundElement.offsetWidth,r=this.boundElement.offsetHeight,a=null!=e.width?Math.max(1,Math.floor(t/e.width)):1,h=Math.ceil(r/e.height)+1,u=Math.ceil(l.length/a),c=Math.floor(this.boundElement.scrollTop/e.height);c>u-h+1&&(c=Math.max(0,u-h+1)),n=(i=c*a)+a*h-1,o=c*e.height,s=Math.max(u*e.height-r-o,0)}return{items:l,firstItem:i,lastItem:n,topBuffer:o,bottomBuffer:s}}update(e,r){null==e&&(e=[]),this._array=e;let{initInstance:l,updateInstance:i,hiddenProp:n,visibleProp:o}=this.options,s=h(e),a=this.visibleSlice();this.boundElement.classList.toggle("-xin-empty-list",0===a.items.length);let c=this._previousSlice,{firstItem:d,lastItem:b,topBuffer:m,bottomBuffer:g}=a;if(void 0===n&&void 0===o&&!0===r&&null!=c&&d===c.firstItem&&b===c.lastItem)return;this._previousSlice=a;let $=0,y=0,v=0;for(let e of[...this.boundElement.children]){if(e===this.listTop||e===this.listBottom)continue;let t=p.get(e);if(null==t)e.remove();else{let r=a.items.indexOf(t);(r<d||r>b)&&(e.remove(),this.itemToElement.delete(t),p.delete(e),$++)}}this.listTop.style.height=String(m)+"px",this.listBottom.style.height=String(g)+"px";let x=[],{idPath:w}=this.options;for(let e=d;e<=b;e++){let t=a.items[e];if(void 0===t)continue;let r=this.itemToElement.get(u(t));if(null==r){if(v++,r=f(this.template),"object"==typeof t&&(this.itemToElement.set(u(t),r),p.set(r,u(t))),this.boundElement.insertBefore(r,this.listBottom),null!=w){let e=t[w],l=`${s}[${w}=${e}]`;ed(r,l)}else{let t=`${s}[${e}]`;ed(r,t)}null!=l&&l(r,t)}null!=i&&i(r,t),x.push(r)}let E=null;for(let e of x)e.previousElementSibling!==E&&(y++,E?.nextElementSibling!=null?this.boundElement.insertBefore(e,E.nextElementSibling):this.boundElement.insertBefore(e,this.listBottom)),E=e;t.perf&&console.log(s,"updated",{removed:$,created:v,moved:y})}}let ep=(e,t)=>{let r=e[ec];return null==r&&(r=new ef(e,t),e[ec]=r),r},eb={value:{toDOM(e,t){ei(e,t)},fromDOM:e=>en(e)},text:{toDOM(e,t){e.textContent=t}},enabled:{toDOM(e,t){e.disabled=!t}},disabled:{toDOM(e,t){e.disabled=!!t}},style:{toDOM(e,t){if("object"==typeof t)for(let r of Object.keys(t))e.style[r]=t[r];else if("string"==typeof t)e.setAttribute("style",t);else throw Error("style binding expects either a string or object")}},list:{toDOM(e,t,r){let l=ep(e,r);l.update(t)}}};function em(e,t,r){return t<e?e:t>r?r:t}function eg(e,t,r){return(r=em(0,r,1))*(t-e)+e}let e$={clamp:em,lerp:eg},ey=e=>("00"+Math.round(Number(e)).toString(16)).slice(-2);class ev{constructor(e,t,r){e/=255,t/=255,r/=255;let l=Math.max(e,t,r),i=l-Math.min(e,t,r),n=0!==i?l===e?(t-r)/i:l===t?2+(r-e)/i:4+(e-t)/i:0;this.h=60*n<0?60*n+360:60*n,this.s=0!==i?l<=.5?i/(2*l-i):i/(2-(2*l-i)):0,this.l=(2*l-i)/2}}let ex=void 0!==globalThis.document?globalThis.document.createElement("span"):void 0;class ew{static fromCss(e){let t=e;ex instanceof HTMLSpanElement&&(ex.style.color=e,document.body.appendChild(ex),t=getComputedStyle(ex).color,ex.remove());let[r,l,i,n]=t.match(/[\d.]+/g);return new ew(Number(r),Number(l),Number(i),null==n?1:Number(n))}static fromHsl(e,t,r,l=1){return ew.fromCss(`hsla(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%, ${l.toFixed(2)})`)}constructor(e,t,r,l=1){this.r=em(0,e,255),this.g=em(0,t,255),this.b=em(0,r,255),this.a=void 0!==l?em(0,l,1):l=1}get inverse(){return new ew(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){let{h:e,s:t,l:r}=this._hsl;return ew.fromHsl(e,t,1-r,this.a)}get rgb(){let{r:e,g:t,b:r}=this;return`rgb(${e.toFixed(0)},${t.toFixed(0)},${r.toFixed(0)})`}get rgba(){let{r:e,g:t,b:r,a:l}=this;return`rgba(${e.toFixed(0)},${t.toFixed(0)},${r.toFixed(0)},${l.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}get _hsl(){return null==this._hslCached&&(this._hslCached=new ev(this.r,this.g,this.b)),this._hslCached}get hsl(){let{h:e,s:t,l:r}=this._hsl;return`hsl(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%)`}get hsla(){let{h:e,s:t,l:r}=this._hsl;return`hsla(${e.toFixed(0)}, ${(100*t).toFixed(0)}%, ${(100*r).toFixed(0)}%, ${this.a.toFixed(2)})`}get mono(){let e=255*this.brightness;return new ew(e,e,e)}get brightness(){return(.299*this.r+.587*this.g+.114*this.b)/255}get html(){return 1===this.a?"#"+ey(this.r)+ey(this.g)+ey(this.b):"#"+ey(this.r)+ey(this.g)+ey(this.b)+ey(Math.floor(255*this.a))}brighten(e){let{h:t,s:r,l:l}=this._hsl;return l=em(0,l+e*(1-l),1),ew.fromHsl(t,r,l,this.a)}darken(e){let{h:t,s:r,l:l}=this._hsl;return l=em(0,l*(1-e),1),ew.fromHsl(t,r,l,this.a)}saturate(e){let{h:t,s:r,l:l}=this._hsl;return r=em(0,r+e*(1-r),1),ew.fromHsl(t,r,l,this.a)}desaturate(e){let{h:t,s:r,l:l}=this._hsl;return r=em(0,r*(1-e),1),ew.fromHsl(t,r,l,this.a)}rotate(e){let{h:t,s:r,l:l}=this._hsl;return t=(t+360+e)%360,ew.fromHsl(t,r,l,this.a)}opacity(e){let{h:t,s:r,l:l}=this._hsl;return ew.fromHsl(t,r,l,e)}swatch(){let{r:e,g:t,b:r,a:l}=this;console.log(`%c   %c ${this.html}, rgba(${e}, ${t}, ${r}, ${l}), ${this.hsla}`,`background-color: rgba(${e}, ${t}, ${r}, ${l})`,"background-color: #eee")}blend(e,t){return new ew(eg(this.r,e.r,t),eg(this.g,e.g,t),eg(this.b,e.b,t),eg(this.a,e.a,t))}}function eE(e){return e.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)}let eA={},e_=(e,...t)=>{if(void 0===eA[e]){let[t,r]=e.split("|");void 0===r?eA[e]=globalThis.document.createElement(t):eA[e]=globalThis.document.createElementNS(r,t)}let r=eA[e].cloneNode(),l={};for(let e of t)e instanceof Element||e instanceof DocumentFragment||"string"==typeof e||"number"==typeof e?r instanceof HTMLTemplateElement?r.content.append(e):r.append(e):Object.assign(l,e);for(let e of Object.keys(l)){let t=l[e];if("apply"===e)t(r);else if("style"===e){if("object"==typeof t)for(let e of Object.keys(t))e.startsWith("--")?r.style.setProperty(e,t[e]):r.style[e]=t[e];else r.setAttribute("style",t)}else if(null!=e.match(/^on[A-Z]/)){let l=e.substring(2).toLowerCase();et(r,l,t)}else if(null!=e.match(/^bind[A-Z]/)){let l=e.substring(4,5).toLowerCase()+e.substring(5),i=eb[l];if(void 0!==i)K(r,t,i);else throw Error(`${e} is not allowed, bindings.${l} is not defined`)}else if(void 0!==r[e])r instanceof SVGElement||r instanceof MathMLElement?r.setAttribute(e,t):r[e]=t;else{let l=eE(e);"class"===l?t.split(" ").forEach(e=>{r.classList.add(e)}):void 0!==r[l]?r[l]=t:"boolean"==typeof t?t?r.setAttribute(l,""):r.removeAttribute(l):r.setAttribute(l,t)}}return r},eS=(...e)=>{let t=globalThis.document.createDocumentFragment();for(let r of e)t.append(r);return t},eM=new Proxy({fragment:eS},{get:(e,t)=>(void 0===e[t=t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)]&&(e[t]=(...e)=>e_(t,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),eC=new Proxy({fragment:eS},{get:(e,t)=>(void 0===e[t]&&(e[t]=(...e)=>e_(`${t}|http://www.w3.org/2000/svg`,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),eO=new Proxy({fragment:eS},{get:(e,t)=>(void 0===e[t]&&(e[t]=(...e)=>e_(`${t}|http://www.w3.org/1998/Math/MathML`,...e)),e[t]),set(){throw Error("You may not add new properties to elements")}}),eL=["animation-iteration-count","flex","flex-base","flex-grow","flex-shrink","gap","opacity","order","tab-size","widows","z-index","zoom"],ek=(e,t,r)=>void 0===r?"":"string"==typeof r||eL.includes(t)?`${e}  ${t}: ${r};`:`${e}  ${t}: ${r}px;`,ej=(e,t,r="")=>{let l=eE(e);if("object"!=typeof t)return ek(r,l,t);{let l=Object.keys(t).map(e=>ej(e,t[e],`${r}  `)).join("\n");return`${r}  ${e} {
${l}
${r}  }`}},eP=(e,t="")=>{let r=Object.keys(e).map(r=>{let l=e[r];if("string"==typeof l){if("@import"===r)return`@import url('${l}');`;throw Error("top-level string value only allowed for `@import`")}let i=Object.keys(l).map(e=>ej(e,l[e])).join("\n");return`${t}${r} {
${i}
}`});return r.join("\n\n")},eT=e=>{let t={};for(let r of Object.keys(e)){let l=e[r],i=eE(r);t[`--${i}`]="number"==typeof l&&0!==l?String(l)+"px":l}return t},eD=e=>{let t={};for(let r of Object.keys(e)){let l=e[r];"string"==typeof l&&null!=l.match(/^(#|rgb[a]?\(|hsl[a]?\()/)&&(l=ew.fromCss(l).inverseLuminance.html,t[`--${eE(r)}`]=l)}return t},eF=new Proxy({},{get(e,t){if(null==e[t]){let[,r,,l,i,n]=(t=t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)).match(/^([^\d_]*)((_)?(\d+)(\w*))?$/);if(r=`--${r}`,null!=i){let o=null==l?Number(i)/100:-Number(i)/100;switch(n){case"b":{let l=getComputedStyle(document.body).getPropertyValue(r);e[t]=o>0?ew.fromCss(l).brighten(o).rgba:ew.fromCss(l).darken(-o).rgba}break;case"s":{let l=getComputedStyle(document.body).getPropertyValue(r);e[t]=o>0?ew.fromCss(l).saturate(o).rgba:ew.fromCss(l).desaturate(-o).rgba}break;case"h":{let l=getComputedStyle(document.body).getPropertyValue(r);e[t]=ew.fromCss(l).rotate(100*o).rgba,console.log(ew.fromCss(l).hsla,ew.fromCss(l).rotate(o).hsla)}break;case"o":{let l=getComputedStyle(document.body).getPropertyValue(r);e[t]=ew.fromCss(l).opacity(o).rgba}break;case"":e[t]=`calc(var(${r}) * ${o})`;break;default:throw console.error(n),Error(`Unrecognized method ${n} for css variable ${r}`)}}else e[t]=`var(${r})`}return e[t]}}),eR=new Proxy({},{get(e,t){if(void 0===e[t]){let r=`--${t.replace(/[A-Z]/g,e=>`-${e.toLocaleLowerCase()}`)}`;e[t]=e=>`var(${r}, ${e})`}return e[t]}}),eN=0;function eq(){return`custom-elt${(eN++).toString(36)}`}let eB=0;class eH extends HTMLElement{static #e=(()=>{this.elements=eM})();static StyleNode(e){return eM.style(eP(e))}static elementCreator(e){if(null==this._elementCreator){let t=null!=e?e.tag:null;for(null==t&&("string"==typeof this.name&&""!==this.name?(t=eE(this.name)).startsWith("-")&&(t=t.slice(1)):t=eq()),null!=customElements.get(t)&&console.warn(`${t} is already defined`),null==t.match(/\w+(-\w+)+/)&&(console.warn(`${t} is not a legal tag for a custom-element`),t=eq());void 0!==customElements.get(t);)t=eq();window.customElements.define(t,this,e),this._elementCreator=eM[t]}return this._elementCreator}initAttributes(...e){let t={},l={},i=new MutationObserver(t=>{let r=!1;t.forEach(t=>{r=!!(t.attributeName&&e.includes(t.attributeName.replace(/-([a-z])/g,(e,t)=>t.toLocaleUpperCase())))}),r&&void 0!==this.queueRender&&this.queueRender(!1)});i.observe(this,{attributes:!0}),e.forEach(e=>{t[e]=r(this[e]);let i=eE(e);Object.defineProperty(this,e,{enumerable:!1,get(){return"boolean"==typeof t[e]?this.hasAttribute(i):this.hasAttribute(i)?"number"==typeof t[e]?parseFloat(this.getAttribute(i)):this.getAttribute(i):void 0!==l[e]?l[e]:t[e]},set(r){"boolean"==typeof t[e]?r!==this[e]&&(r?this.setAttribute(i,""):this.removeAttribute(i),this.queueRender()):"number"==typeof t[e]?r!==parseFloat(this[e])&&(this.setAttribute(i,r),this.queueRender()):("object"==typeof r||`${r}`!=`${this[e]}`)&&(null==r||"object"==typeof r?this.removeAttribute(i):this.setAttribute(i,r),this.queueRender(),l[e]=r)}})})}initValue(){let e=Object.getOwnPropertyDescriptor(this,"value");if(void 0===e||void 0!==e.get||void 0!==e.set)return;let t=this.hasAttribute("value")?this.getAttribute("value"):r(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get:()=>t,set(e){t!==e&&(t=e,this.queueRender(!0))}})}get refs(){console.warn("refs and data-ref are deprecated, use the part attribute and .parts instead");let e=null!=this.shadowRoot?this.shadowRoot:this;return null==this._refs&&(this._refs=new Proxy({},{get(t,r){if(void 0===t[r]){let l=e.querySelector(`[part="${r}"],[data-ref="${r}"]`);if(null==l&&(l=e.querySelector(r)),null==l)throw Error(`elementRef "${r}" does not exist!`);l.removeAttribute("data-ref"),t[r]=l}return t[r]}})),this._refs}get parts(){let e=null!=this.shadowRoot?this.shadowRoot:this;return null==this._refs&&(this._refs=new Proxy({},{get(t,r){if(void 0===t[r]){let l=e.querySelector(`[part="${r}"]`);if(null==l&&(l=e.querySelector(r)),null==l)throw Error(`elementRef "${r}" does not exist!`);l.removeAttribute("data-ref"),t[r]=l}return t[r]}})),this._refs}constructor(){super(),this.content=eM.slot(),this._changeQueued=!1,this._renderQueued=!1,this._hydrated=!1,eB+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${eB}`,this._value=r(this.defaultValue)}connectedCallback(){this.hydrate(),null!=this.role&&this.setAttribute("role",this.role),void 0!==this.onResize&&(es.observe(this),null==this._onResize&&(this._onResize=this.onResize.bind(this)),this.addEventListener("resize",this._onResize)),null!=this.value&&null!=this.getAttribute("value")&&(this._value=this.getAttribute("value")),this.queueRender()}disconnectedCallback(){es.unobserve(this)}queueRender(e=!1){this._hydrated&&(this._changeQueued||(this._changeQueued=e),this._renderQueued||(this._renderQueued=!0,requestAnimationFrame(()=>{this._changeQueued&&er(this,"change"),this._changeQueued=!1,this._renderQueued=!1,this.render()})))}hydrate(){if(!this._hydrated){this.initValue();let e="function"!=typeof this.content,t="function"==typeof this.content?this.content():this.content;if(void 0!==this.styleNode){let r=this.attachShadow({mode:"open"});r.appendChild(this.styleNode),ea(r,t,e)}else if(null!==t){let r=[...this.childNodes];ea(this,t,e),this.isSlotted=void 0!==this.querySelector("slot,xin-slot");let l=[...this.querySelectorAll("slot")];if(l.length>0&&l.forEach(eI.replaceSlot),r.length>0){let e={"":this};[...this.querySelectorAll("xin-slot")].forEach(t=>{e[t.name]=t}),r.forEach(t=>{let r=e[""],l=t instanceof Element?e[t.slot]:r;(void 0!==l?l:r).append(t)})}}this._hydrated=!0}}render(){}}class eI extends eH{static replaceSlot(e){let t=document.createElement("xin-slot");""!==e.name&&t.setAttribute("name",e.name),e.replaceWith(t)}constructor(){super(),this.name="",this.content=null,this.initAttributes("name")}}eI.elementCreator({tag:"xin-slot"});let eW=(e=()=>!0)=>{let t=localStorage.getItem("xin-state");if(null!=t){let r=JSON.parse(t);for(let t of Object.keys(r).filter(e))void 0!==Z[t]?Object.assign(Z[t],r[t]):Z[t]=r[t]}let r=eh(()=>{let t={},r=Z[a];for(let l of Object.keys(r).filter(e))t[l]=r[l];localStorage.setItem("xin-state",JSON.stringify(t)),console.log("xin state saved to localStorage")},500);Q(e,r)};function ez(e){let t={};return Object.keys(e).forEach(r=>{Z[r]=e[r],t[r]=Z[r]}),t}export{K as bind,et as on,eb as bindings,eP as css,eD as darkMode,eT as initVars,eF as vars,eR as varDefault,ew as Color,eH as Component,eM as elements,eC as svgElements,eO as mathML,eW as hotReload,b as getListItem,h as xinPath,u as xinValue,e$ as MoreMath,t as settings,eu as throttle,eh as debounce,Z as xin,Q as observe,A as unobserve,w as touch,m as observerShouldBeRemoved,ez as xinProxy};
//# sourceMappingURL=index.js.map
