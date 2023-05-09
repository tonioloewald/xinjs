function t(t,e,n,s){Object.defineProperty(t,e,{get:n,set:s,enumerable:!0,configurable:!0})}var e={};t(e,"RADIANS_TO_DEGREES",(()=>n)),t(e,"DEGREES_TO_RADIANS",(()=>s)),t(e,"clamp",(()=>o)),t(e,"lerp",(()=>r));const n=180/Math.PI,s=Math.PI/180;function o(t,e,n){return e<t?t:e>n?n:e}function r(t,e,n){return(n=o(0,n,1))*(e-t)+t}var i={};t(i,"xinPath",(()=>l)),t(i,"xinValue",(()=>a));const l=Symbol("xin-path"),a=Symbol("xin-value"),c={debug:!1,perf:!1},h=Symbol("observer should be removed"),u=[],d=[];let f,p,m=!1;class b{constructor(t,e){const n="string"==typeof e?`"${e}"`:`function ${e.name}`;let s;if("string"==typeof t)this.test=e=>"string"==typeof e&&""!==e&&(t.startsWith(e)||e.startsWith(t)),s=`test = "${t}"`;else if(t instanceof RegExp)this.test=t.test.bind(t),s=`test = "${t.toString()}"`;else{if(!(t instanceof Function))throw new Error("expect listener test to be a string, RegExp, or test function");this.test=t,s=`test = function ${t.name}`}if(this.description=`${s}, ${n}`,"function"!=typeof e)throw new Error("expect callback to be a path or function");this.callback=e,u.push(this)}}const g=()=>{c.perf&&console.time("xin async update");const t=[...d];for(const e of t)u.filter((t=>{let n;try{n=t.test(e)}catch(n){throw new Error(`Listener ${t.description} threw "${n}" at "${e}"`)}return n===h?(w(t),!1):n})).forEach((t=>{let n;try{n=t.callback(e)}catch(n){console.error(`Listener ${t.description} threw "${n}" handling "${e}"`)}n===h&&w(t)}));d.splice(0),m=!1,"function"==typeof p&&p(),c.perf&&console.timeEnd("xin async update")},y=t=>{const e=(t=>"object"==typeof t?t[l]:t)(t);!1===m&&(f=new Promise((t=>{p=t})),m=setTimeout(g)),null==d.find((t=>e.startsWith(t)))&&d.push(e)},v=(t,e)=>new b(t,e),w=t=>{const e=u.indexOf(t);if(!(e>-1))throw new Error("unobserve failed, listener not found");u.splice(e,1)},$=t=>{try{return JSON.stringify(t)}catch(t){return"{has circular references}"}},E=(...t)=>new Error(t.map($).join(" "));let x=0;const _=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1)+(parseInt("10000",36)+ ++x).toString(36).slice(-5),A={},S={};function O(t){if(""===t)return[];if(Array.isArray(t))return t;{const e=[];for(;t.length>0;){let n=t.search(/\[[^\]]+\]/);if(-1===n){e.push(t.split("."));break}{const s=t.slice(0,n);t=t.slice(n),""!==s&&e.push(s.split(".")),n=t.indexOf("]")+1,e.push(t.slice(1,n-1)),"."===t.slice(n,n+1)&&(n+=1),t=t.slice(n)}}return e}}const M=new WeakMap;function C(t,e){void 0===M.get(t)&&M.set(t,{}),void 0===M.get(t)[e]&&(M.get(t)[e]={});const n=M.get(t)[e];return"_auto_"===e?t.forEach(((t,e)=>{void 0===t._auto_&&(t._auto_=_()),n[t._auto_+""]=e})):t.forEach(((t,s)=>{n[P(t,e)+""]=s})),n}function k(t,e,n){n+="";let s=function(t,e){return void 0===M.get(t)||void 0===M.get(t)[e]?C(t,e):M.get(t)[e]}(t,e)[n];return void 0!==s&&P(t[s],e)+""===n||(s=C(t,e)[n]),s}function j(t,e,n){return void 0===t[e]&&void 0!==n&&(t[e]=n),t[e]}function L(t,e,n,s){let o=""!==e?k(t,e,n):n;if(s===A)return t.splice(o,1),M.delete(t),Symbol("deleted");if(s===S)""===e&&void 0===t[o]&&(t[o]={});else if(void 0!==s)if(void 0!==o)t[o]=s;else{if(""===e||P(s,e)+""!=n+"")throw new Error(`byIdPath insert failed at [${e}=${n}]`);t.push(s),o=t.length-1}return t[o]}function T(t){if(!Array.isArray(t))throw E("setByPath failed: expected array, found",t)}function D(t){if(null==t||t.constructor!==Object)throw E("setByPath failed: expected Object, found",t)}function P(t,e){const n=O(e);let s,o,r,i,l=t;for(s=0,o=n.length;void 0!==l&&s<o;s++){const t=n[s];if(Array.isArray(t))for(r=0,i=t.length;void 0!==l&&r<i;r++){l=l[t[r]]}else if(0===l.length){if(l=l[t.slice(1)],"="!==t[0])return}else if(t.includes("=")){const[e,...n]=t.split("=");l=L(l,e,n.join("="))}else r=parseInt(t,10),l=l[r]}return l}function F(t,e,n){let s=t;const o=O(e);for(;null!=s&&o.length>0;){const t=o.shift();if("string"==typeof t){const e=t.indexOf("=");if(e>-1){0===e?D(s):T(s);if(s=L(s,t.slice(0,e),t.slice(e+1),o.length>0?S:n),0===o.length)return!0}else{T(s);const e=parseInt(t,10);if(!(o.length>0)){if(n!==A){if(s[e]===n)return!1;s[e]=n}else s.splice(e,1);return!0}s=s[e]}}else{if(!(Array.isArray(t)&&t.length>0))throw new Error(`setByPath failed, bad path ${e}`);for(D(s);t.length>0;){const e=t.shift();if(!(t.length>0||o.length>0)){if(n!==A){if(s[e]===n)return!1;s[e]=n}else{if(!Object.prototype.hasOwnProperty.call(s,e))return!1;delete s[e]}return!0}s=j(s,e,t.length>0?{}:[])}}}throw new Error(`setByPath(${t}, ${e}, ${n}) failed`)}const R=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],N={},B=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,I=(t="",e="")=>""===t?e:null!==e.match(/^\d+$/)||e.includes("=")?`${t}[${e}]`:`${t}.${e}`,H=(t="")=>({get(e,n){if(n===l)return t;if(n===a)return e;if("symbol"==typeof n)return e[n];let s=n;const o=s.match(/^([^.[]+)\.(.+)$/)??s.match(/^([^\]]+)(\[.+)/)??s.match(/^(\[[^\]]+\])\.(.+)$/)??s.match(/^(\[[^\]]+\])\[(.+)$/);if(null!==o){const[,n,s]=o,r=I(t,n),i=P(e,n);return null!==i&&"object"==typeof i?new Proxy(i,H(r))[s]:i}if(s.startsWith("[")&&s.endsWith("]")&&(s=s.substring(1,s.length-1)),!Array.isArray(e)&&void 0!==e[s]||Array.isArray(e)&&s.includes("=")){let n;if(s.includes("=")){const[t,o]=s.split("=");n=e.find((e=>`${P(e,t)}`===o))}else n=e[s];if(null!==n&&"object"==typeof n){const e=I(t,s);return new Proxy(n,H(e))}return"function"==typeof n?n.bind(e):n}if(Array.isArray(e)){const n=e[s];return"function"==typeof n?(...n)=>{const o=Array.prototype[s].apply(e,n);return R.includes(s)&&y(t),o}:"object"==typeof n?new Proxy(n,H(I(t,s))):n}return e[s]},set(e,n,s){null!=s&&s[l]&&(s=s[a]);const o=I(t,n);if(!(t=>B.test(t))(o))throw new Error(`setting invalid path ${o}`);let r=W[o];return null!=r&&null!=r[a]&&(r=r[a]),r!==s&&F(N,o,s)&&y(o),!0}}),q=(t,e)=>{const n="function"==typeof e?e:W[e];if("function"!=typeof n)throw new Error(`observe expects a function or path to a function, ${e} is neither`);return v(t,n)},W=new Proxy(N,H()),z=(t,e=250)=>{let n;return(...s)=>{void 0!==n&&clearTimeout(n),n=setTimeout((()=>{t(...s)}),e)}},V=(t,e=250)=>{let n,s=Date.now()-e,o=!1;return(...r)=>{if(clearTimeout(n),n=setTimeout((async()=>{t(...r),s=Date.now()}),e),!o&&Date.now()-s>=e){o=!0;try{t(...r),s=Date.now()}finally{o=!1}}}},Q=(t=(()=>!0))=>{const e=localStorage.getItem("xin-state");if(null!=e){const n=JSON.parse(e);for(const e of Object.keys(n).filter(t))void 0!==W[e]?Object.assign(W[e],n[e]):W[e]=n[e]}const n=z((()=>{const e={},n=W[a];for(const s of Object.keys(n).filter(t))e[s]=n[s];localStorage.setItem("xin-state",JSON.stringify(e)),console.log("xin state saved to localStorage")}),500);q(t,n)},Z=t=>("00"+Math.round(Number(t)).toString(16)).slice(-2),G=null!=globalThis.document?globalThis.document.createElement("span"):{style:{color:""}};class J{constructor(t,e,n){t/=255,e/=255,n/=255;const s=Math.max(t,e,n),o=s-Math.min(t,e,n),r=0!==o?s===t?(e-n)/o:s===e?2+(n-t)/o:4+(t-e)/o:0;this.h=60*r<0?60*r+360:60*r,this.s=0!==o?s<=.5?o/(2*s-o):o/(2-(2*s-o)):0,this.l=(2*s-o)/2}}class U{static fromCss(t){G.style.color=t;const e=G.style.color,[n,s,o,r]=e.match(/[\d.]+/g);return new U(Number(n),Number(s),Number(o),null==r?1:Number(r))}static fromHsl(t,e,n,s=1){return U.fromCss(`hsla(${t.toFixed(0)}, ${(100*e).toFixed(0)}%, ${(100*n).toFixed(0)}%, ${s.toFixed(2)})`)}constructor(t,e,n,s=1){this.r=o(0,t,255),this.g=o(0,e,255),this.b=o(0,n,255),this.a=void 0!==s?o(0,s,1):s=1}get inverse(){return new U(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){const{h:t,s:e,l:n}=this._hsl;return U.fromHsl(t,e,1-n,this.a)}get rgb(){const{r:t,g:e,b:n}=this;return`rgb(${t.toFixed(0)},${e.toFixed(0)},${n.toFixed(0)})`}get rgba(){const{r:t,g:e,b:n,a:s}=this;return`rgba(${t.toFixed(0)},${e.toFixed(0)},${n.toFixed(0)},${s.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}get _hsl(){return null==this._hslCached&&(this._hslCached=new J(this.r,this.g,this.b)),this._hslCached}get hsl(){const{h:t,s:e,l:n}=this._hsl;return`hsl(${t.toFixed(0)}, ${(100*e).toFixed(0)}%, ${(100*n).toFixed(0)}%)`}get hsla(){const{h:t,s:e,l:n}=this._hsl;return`hsla(${t.toFixed(0)}, ${(100*e).toFixed(0)}%, ${(100*n).toFixed(0)}%, ${this.a.toFixed(2)})`}get mono(){const t=255*this.brightness;return new U(t,t,t)}get brightness(){return(.299*this.r+.587*this.g+.114*this.b)/255}get html(){return 1===this.a?"#"+Z(this.r)+Z(this.g)+Z(this.b):"#"+Z(this.r)+Z(this.g)+Z(this.b)+Z(Math.floor(255*this.a))}brighten(t){let{h:e,s:n,l:s}=this._hsl;return s=o(0,s+t*(1-s),1),U.fromHsl(e,n,s,this.a)}darken(t){let{h:e,s:n,l:s}=this._hsl;return s=o(0,s*(1-t),1),U.fromHsl(e,n,s,this.a)}saturate(t){let{h:e,s:n,l:s}=this._hsl;return n=o(0,n+t*(1-n),1),U.fromHsl(e,n,s,this.a)}desaturate(t){let{h:e,s:n,l:s}=this._hsl;return n=o(0,n*(1-t),1),U.fromHsl(e,n,s,this.a)}rotate(t){let{h:e,s:n,l:s}=this._hsl;return e=(e+360+t)%360,U.fromHsl(e,n,s,this.a)}opacity(t){const{h:e,s:n,l:s}=this._hsl;return U.fromHsl(e,n,s,t)}swatch(){const{r:t,g:e,b:n,a:s}=this;console.log(`%c   %c ${this.html}, rgba(${t}, ${e}, ${n}, ${s}), ${this.hsla}`,`background-color: rgba(${t}, ${e}, ${n}, ${s})`,"background-color: #eee")}blend(t,e){return new U(r(this.r,t.r,e),r(this.g,t.g,e),r(this.b,t.b,e),r(this.a,t.a,e))}}function Y(t){if(null==t||"object"!=typeof t)return t;if(Array.isArray(t))return t.map(Y);const e={};for(const n in t){const s=t[n];e[n]=null!=t&&"object"==typeof t?Y(s):s}return e}const K="-xin-data",X=`.${K}`,tt="-xin-event",et=`.${tt}`,nt=new WeakMap,st=new WeakMap,ot=t=>{const e=t.cloneNode();if(e instanceof HTMLElement){const n=st.get(t),s=nt.get(t);null!=n&&st.set(e,Y(n)),null!=s&&nt.set(e,Y(s))}for(const n of t instanceof HTMLTemplateElement?t.content.childNodes:t.childNodes)n instanceof HTMLElement||n instanceof DocumentFragment?e.appendChild(ot(n)):e.appendChild(n.cloneNode());return e},rt=new WeakMap,it=t=>{const e=document.body.parentElement;for(;null!=t.parentElement&&t.parentElement!==e;){const e=rt.get(t);if(null!=e)return e;t=t.parentElement}return!1},{document:lt,MutationObserver:at}=globalThis,ct=(t,e)=>{const n=st.get(t);for(const s of n){let{path:n,binding:o,options:r}=s;const{toDOM:i}=o;if(null!=i){if(n.startsWith("^")){const e=it(t);if(null==e||null==e[l])throw console.error(`Cannot resolve relative binding ${n}`,t,"is not part of a list"),new Error(`Cannot resolve relative binding ${n}`);n=s.path=`${e[l]}${n.substring(1)}`}(null==e||n.startsWith(e))&&i(t,W[n],r)}}};if(null!=at){new at((t=>{t.forEach((t=>{[...t.addedNodes].forEach((t=>{t instanceof HTMLElement&&[...t.querySelectorAll(X)].forEach((t=>ct(t)))}))}))})).observe(lt.body,{subtree:!0,childList:!0})}q((()=>!0),(t=>{const e=lt.querySelectorAll(X);for(const n of e)ct(n,t)}));const ht=t=>{let e=t.target.closest(X);for(;null!=e;){const t=st.get(e);for(const n of t){const{binding:t,path:s}=n,{fromDOM:o}=t;if(null!=o){let t;try{t=o(e,n.options)}catch(t){throw console.error("Cannot get value from",e,"via",n),new Error("Cannot obtain value fromDOM")}if(null!=t){const e=W[s];if(null==e)W[s]=t;else{const n=null!=e[l]?e[a]:e,o=null!=t[l]?t[a]:t;n!==o&&(W[s]=o)}}}}e=e.parentElement.closest(X)}};null!=globalThis.document&&(lt.body.addEventListener("change",ht,!0),lt.body.addEventListener("input",ht,!0));const ut=(t,e,n,s)=>{if(t instanceof DocumentFragment)throw new Error("bind cannot bind to a DocumentFragment");let o;if("object"==typeof e&&void 0===e[l]&&void 0===s){const{value:t}=e;o="string"==typeof t?t:t[l],delete(s=e).value}else o="string"==typeof e?e:e[l];if(null==o)throw new Error("bind requires a path or object with xin Proxy");const{toDOM:r}=n;t.classList.add(K);let i=st.get(t);return null==i&&(i=[],st.set(t,i)),i.push({path:o,binding:n,options:s}),null==r||o.startsWith("^")||y(o),t},dt=new Set,ft=t=>{let e=t?.target.closest(et),n=!1;const s=new Proxy(t,{get(e,s){if("stopPropagation"===s)return()=>{t.stopPropagation(),n=!0};{const t=e[s];return"function"==typeof t?t.bind(e):t}}});for(;!n&&null!=e;){const n=nt.get(e)[t.type]||[];for(const t of n)if("function"==typeof t)t(s);else{const e=W[t];if("function"!=typeof e)throw new Error(`no event handler found at path ${t}`);e(s)}e=null!=e.parentElement?e.parentElement.closest(et):null}},pt=(t,e,n)=>{let s=nt.get(t);t.classList.add(tt),null==s&&(s={},nt.set(t,s)),s[e]||(s[e]=[]),s[e].includes(n)||s[e].push(n),dt.has(e)||(dt.add(e),lt.body.addEventListener(e,ft,!0))},mt=(t,e)=>{const n=new Event(e);t.dispatchEvent(n)},bt=t=>t instanceof HTMLInputElement?t.type:t instanceof HTMLSelectElement&&t.hasAttribute("multiple")?"multi-select":"other",gt=(t,e)=>{switch(bt(t)){case"radio":t.checked=t.value===e;break;case"checkbox":t.checked=e;break;case"date":t.valueAsDate=new Date(e);break;case"multi-select":for(const n of[...t.querySelectorAll("option")])n.selected=e[n.value];break;default:t.value=e}},yt=t=>{switch(bt(t)){case"radio":{const e=t.parentElement?.querySelector(`[name="${t.name}"]:checked`);return null!=e?e.value:null}case"checkbox":return t.checked;case"date":return t.valueAsDate.toISOString();case"multi-select":return[...t.querySelectorAll("option")].reduce(((t,e)=>(t[e.value]=e.selected,t)),{});default:return t.value}},{ResizeObserver:vt}=globalThis,wt=null!=vt?new vt((t=>{for(const e of t){const t=e.target;mt(t,"resize")}})):{observe(){},unobserve(){}},$t=(t,e)=>{if(null!=t&&null!=e)if("string"==typeof e)t.textContent=e;else if(Array.isArray(e))e.forEach((e=>{t.append(e instanceof Node?ot(e):e)}));else{if(!(e instanceof HTMLElement))throw new Error("expect text content or document node");t.append(ot(e))}},Et=Symbol("list-binding");function xt(t,e){const n=[...t.querySelectorAll(X)];t.matches(X)&&n.unshift(t);for(const t of n){const n=st.get(t);for(const s of n)s.path.startsWith("^")&&(s.path=`${e}${s.path.substring(1)}`),null!=s.binding.toDOM&&s.binding.toDOM(t,W[s.path])}}class _t{_array=[];constructor(t,e={}){if(this.boundElement=t,this.itemToElement=new WeakMap,1!==t.children.length)throw new Error("ListBinding expects an element with exactly one child element");if(t.children[0]instanceof HTMLTemplateElement){const e=t.children[0];if(1!==e.content.children.length)throw new Error("ListBinding expects a template with exactly one child element");this.template=ot(e.content.children[0])}else this.template=t.children[0],this.template.remove();this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),this.options=e,null!=e.virtual&&(wt.observe(this.boundElement),this._update=V((()=>{this.update(this._array,!0)}),16),this.boundElement.addEventListener("scroll",this._update),this.boundElement.addEventListener("resize",this._update))}visibleSlice(){const{virtual:t}=this.options;let e=0,n=this._array.length-1,s=0,o=0;if(null!=t){const r=this.boundElement.offsetWidth,i=this.boundElement.offsetHeight,l=null!=t.width?Math.max(1,Math.floor(r/t.width)):1,a=Math.ceil(i/t.height)+1,c=Math.ceil(this._array.length/l),h=l*a;let u=Math.floor(this.boundElement.scrollTop/t.height);u>c-a+1&&(u=Math.max(0,c-a+1)),e=u*l,n=e+h-1,s=u*t.height,o=c*t.height-i-s}return{firstItem:e,lastItem:n,topBuffer:s,bottomBuffer:o}}update(t,e){null==t&&(t=[]),this._array=t;const{initInstance:n,updateInstance:s}=this.options,o=t[l],r=this.visibleSlice(),i=this._previousSlice,{firstItem:h,lastItem:u,topBuffer:d,bottomBuffer:f}=r;if(!0===e&&null!=i&&h===i.firstItem&&u===i.lastItem)return;this._previousSlice=r;let p=0,m=0,b=0;for(const e of[...this.boundElement.children]){if(e===this.listTop||e===this.listBottom)continue;const n=rt.get(e);if(null==n)e.remove();else{const s=t.indexOf(n);(s<h||s>u)&&(e.remove(),this.itemToElement.delete(n),rt.delete(e),p++)}}this.listTop.style.height=String(d)+"px",this.listBottom.style.height=String(f)+"px";const g=[],{idPath:y}=this.options;for(let e=h;e<=u;e++){const r=t[e];if(void 0===r)continue;let i=this.itemToElement.get(r[a]);if(null==i){if(b++,i=ot(this.template),"object"==typeof r&&(this.itemToElement.set(r[a],i),rt.set(i,r[a])),this.boundElement.insertBefore(i,this.listBottom),null!=y){xt(i,`${o}[${y}=${r[y]}]`)}null!=n&&n(i,r)}null!=s&&s(i,r),g.push(i)}let v=null;for(const t of g)t.previousElementSibling!==v&&(m++,null!=v?.nextElementSibling?this.boundElement.insertBefore(t,v.nextElementSibling):this.boundElement.insertBefore(t,this.listBottom)),v=t;c.perf&&console.log(o,"updated",{removed:p,created:b,moved:m})}}const At=(t,e)=>{let n=t[Et];return null==n&&(n=new _t(t,e),t[Et]=n),n},St={value:{toDOM(t,e){gt(t,e)},fromDOM:t=>yt(t)},text:{toDOM(t,e){t.textContent=e}},enabled:{toDOM(t,e){t.disabled=!e}},disabled:{toDOM(t,e){t.disabled=Boolean(e)}},style:{toDOM(t,e){if("object"==typeof e)for(const n of Object.keys(e))t.style[n]=e[n];else{if("string"!=typeof e)throw new Error("style binding expects either a string or object");t.setAttribute("style",e)}}},list:{toDOM(t,e,n){At(t,n).update(e)}}};function Ot(t){return t.replace(/[A-Z]/g,(t=>`-${t.toLocaleLowerCase()}`))}const Mt={},Ct=(...t)=>(...e)=>kt.div(...e,...t),kt=new Proxy({fragment:(...t)=>{const e=globalThis.document.createDocumentFragment();for(const n of t)e.append(n);return e}},{get(t,e){if(null==(e=e.replace(/[A-Z]/g,(t=>`-${t.toLocaleLowerCase()}`))).match(/^\w+(-\w+)*$/))throw new Error(`${e} does not appear to be a valid element tagName`);return void 0===t[e]&&(t[e]=(...t)=>((t,...e)=>{void 0===Mt[t]&&(Mt[t]=globalThis.document.createElement(t));const n=Mt[t].cloneNode(),s={};for(const t of e)t instanceof Element||t instanceof DocumentFragment||"string"==typeof t||"number"==typeof t?n instanceof HTMLTemplateElement?n.content.append(t):n.append(t):Object.assign(s,t);for(const t of Object.keys(s)){const e=s[t];if("apply"===t)e(n);else if("style"===t)if("object"==typeof e)for(const t of Object.keys(e))t.startsWith("--")?n.style.setProperty(t,e[t]):n.style[t]=e[t];else n.setAttribute("style",e);else if(null!=t.match(/^on[A-Z]/)){const s=t.substring(2).toLowerCase();pt(n,s,e)}else if(null!=t.match(/^bind[A-Z]/)){const s=t.substring(4,5).toLowerCase()+t.substring(5),o=St[s];if(void 0===o)throw new Error(`${t} is not allowed, bindings.${s} is not defined`);ut(n,e,o)}else{const s=Ot(t);"class"===s?e.split(" ").forEach((t=>{n.classList.add(t)})):void 0!==n[s]?n[s]=e:"boolean"==typeof e?e?n.setAttribute(s,""):n.removeAttribute(s):n.setAttribute(s,e)}}return n})(e,...t)),t[e]},set(){throw new Error("You may not add new properties to elements")}});const jt=["left","right","top","bottom","gap"],Lt=t=>null!=t.match(/(width|height|size|margin|padding|radius|spacing|top|left|right|bottom)/)||jt.includes(t),Tt=(t,e,n="")=>{const s=Ot(t);if("object"==typeof e){const s=Object.keys(e).map((t=>Tt(t,e[t],`${n}  `))).join("\n");return`${n}  ${t} {\n${s}\n${n}  }`}return"number"==typeof e&&Lt(s)?`${n}  ${s}: ${e}px;`:void 0!==e?`${n}  ${s}: ${e};`:""},Dt=(t,e="")=>Object.keys(t).map((n=>{const s=t[n];if("string"==typeof s){if("@import"===n)return`@import url('${s}');`;throw new Error("top-level string value only allowed for `@import`")}const o=Object.keys(s).map((t=>Tt(t,s[t]))).join("\n");return`${e}${n} {\n${o}\n}`})).join("\n\n"),Pt=t=>{const e={};for(const n of Object.keys(t)){const s=t[n],o=Ot(n);e[`--${o}`]="number"==typeof s&&Lt(o)?String(s)+"px":s}return e},Ft=t=>{const e={};for(const n of Object.keys(t)){let s=t[n];"string"==typeof s&&null!=s.match(/^(#|rgb[a]?\(|hsl[a]?\()/)&&(s=U.fromCss(s).inverseLuminance.html,e[`--${Ot(n)}`]=s)}return e},Rt=new Proxy({},{get(t,e){if(null==t[e]){e=e.replace(/[A-Z]/g,(t=>`-${t.toLocaleLowerCase()}`));let[,n,,s,o,r]=e.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/);if(n=`--${n}`,null!=o){const i=null==s?Number(o)/100:-Number(o)/100;switch(r){case"b":{const s=getComputedStyle(document.body).getPropertyValue(n);t[e]=i>0?U.fromCss(s).brighten(i).rgba:U.fromCss(s).darken(-i).rgba}break;case"s":{const s=getComputedStyle(document.body).getPropertyValue(n);t[e]=i>0?U.fromCss(s).saturate(i).rgba:U.fromCss(s).desaturate(-i).rgba}break;case"h":{const s=getComputedStyle(document.body).getPropertyValue(n);t[e]=U.fromCss(s).rotate(100*i).rgba,console.log(U.fromCss(s).hsla,U.fromCss(s).rotate(i).hsla)}break;case"o":{const s=getComputedStyle(document.body).getPropertyValue(n);t[e]=U.fromCss(s).opacity(i).rgba}break;case"":t[e]=`calc(var(${n}) * ${i})`;break;default:throw console.error(r),new Error(`Unrecognized method ${r} for css variable ${n}`)}}else t[e]=`var(${n})`}return t[e]}});let Nt=0;class Bt extends HTMLElement{static elements=kt;content=kt.slot();static StyleNode(t){return kt.style(Dt(t))}static elementCreator(t){if(null==this._elementCreator){let e=null!=t?t.tag:null;null==e&&(e=Ot(this.name),e.startsWith("-")&&(e=e.substring(1)),e.includes("-")||(e+="-elt"));let n=0;for(;null==this._elementCreator;){n+=1;const s=1===n?e:`${e}-${n}`;try{window.customElements.define(s,this,t),this._elementCreator=kt[s]}catch(t){throw new Error(`could not define ${this.name} as <${s}>: ${String(t)}`)}}}return this._elementCreator}initAttributes(...t){const e={},n={};new MutationObserver((e=>{let n=!1;e.forEach((e=>{var s;n=!(!e.attributeName||!t.includes((s=e.attributeName,s.replace(/-([a-z])/g,((t,e)=>e.toLocaleUpperCase())))))})),n&&void 0!==this.queueRender&&this.queueRender(!1)})).observe(this,{attributes:!0}),t.forEach((t=>{e[t]=Y(this[t]);const s=Ot(t);Object.defineProperty(this,t,{enumerable:!1,get(){return"boolean"==typeof e[t]?this.hasAttribute(s):this.hasAttribute(s)?"number"==typeof e[t]?parseFloat(this.getAttribute(s)):this.getAttribute(s):void 0!==n[t]?n[t]:e[t]},set(o){"boolean"==typeof e[t]?o!==this[t]&&(o?this.setAttribute(s,""):this.removeAttribute(s),this.queueRender()):"number"==typeof e[t]?o!==parseFloat(this[t])&&(this.setAttribute(s,o),this.queueRender()):"object"!=typeof o&&`${o}`==`${this[t]}`||(null==o||"object"==typeof o?this.removeAttribute(s):this.setAttribute(s,o),this.queueRender(),n[t]=o)}})}))}initValue(){const t=Object.getOwnPropertyDescriptor(this,"value");if(void 0===t||void 0!==t.get||void 0!==t.set)return;let e=this.hasAttribute("value")?this.getAttribute("value"):Y(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get:()=>e,set(t){e!==t&&(e=t,this.queueRender(!0))}})}get refs(){const t=null!=this.shadowRoot?this.shadowRoot:this;return null==this._refs&&(this._refs=new Proxy({},{get(e,n){if(void 0===e[n]){let s=t.querySelector(`[data-ref="${n}"]`);if(null==s&&(s=t.querySelector(n)),null==s)throw new Error(`elementRef "${n}" does not exist!`);s.removeAttribute("data-ref"),e[n]=s}return e[n]}})),this._refs}constructor(){super(),Nt+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${Nt}`,this._value=Y(this.defaultValue)}connectedCallback(){this.hydrate(),null!=this.role&&this.setAttribute("role",this.role),void 0!==this.onResize&&(wt.observe(this),null==this._onResize&&(this._onResize=this.onResize.bind(this)),this.addEventListener("resize",this._onResize)),null!=this.value&&null!=this.getAttribute("value")&&(this._value=this.getAttribute("value")),this.queueRender()}disconnectedCallback(){wt.unobserve(this)}_changeQueued=!1;_renderQueued=!1;queueRender(t=!1){this._hydrated&&(this._changeQueued||(this._changeQueued=t),this._renderQueued||(this._renderQueued=!0,requestAnimationFrame((()=>{this._changeQueued&&mt(this,"change"),this._changeQueued=!1,this._renderQueued=!1,this.render()}))))}_hydrated=!1;hydrate(){if(!this._hydrated){this.initValue();const t="function"==typeof this.content?this.content():this.content;if(void 0!==this.styleNode){const e=this.attachShadow({mode:"open"});e.appendChild(this.styleNode),$t(e,t)}else $t(this,t);this._hydrated=!0}}render(){}}const It=e;export{It as MoreMath,W as xin,q as observe,w as unobserve,y as touch,h as observerShouldBeRemoved,Q as hotReload,V as throttle,z as debounce,Bt as Component,kt as elements,Ct as makeComponent,c as settings,ut as bind,pt as on,St as bindings,it as getListItem,Rt as vars,Pt as initVars,Dt as css,Ft as darkMode,U as Color,l as xinPath,a as xinValue};
//# sourceMappingURL=index.js.map
