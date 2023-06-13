const t={debug:!1,perf:!1};function e(t){if(null==t||"object"!=typeof t)return t;if(Array.isArray(t))return t.map(e);const n={};for(const s in t){const o=t[s];n[s]=null!=t&&"object"==typeof t?e(o):o}return n}const n="-xin-data",s=`.${n}`,o="-xin-event",r=`.${o}`,i=Symbol("xin-path"),l=Symbol("xin-value"),a=t=>t[i];function c(t){return"object"==typeof t&&null!==t&&t[l]||t}const h=new WeakMap,u=new WeakMap,d=t=>{const n=t.cloneNode();if(n instanceof HTMLElement){const s=u.get(t),o=h.get(t);null!=s&&u.set(n,e(s)),null!=o&&h.set(n,e(o))}for(const e of t instanceof HTMLTemplateElement?t.content.childNodes:t.childNodes)e instanceof HTMLElement||e instanceof DocumentFragment?n.appendChild(d(e)):n.appendChild(e.cloneNode());return n},f=new WeakMap,p=t=>{const e=document.body.parentElement;for(;null!=t.parentElement&&t.parentElement!==e;){const e=f.get(t);if(null!=e)return e;t=t.parentElement}return!1},m=Symbol("observer should be removed"),b=[],g=[];let y,v,w=!1;class ${constructor(t,e){const n="string"==typeof e?`"${e}"`:`function ${e.name}`;let s;if("string"==typeof t)this.test=e=>"string"==typeof e&&""!==e&&(t.startsWith(e)||e.startsWith(t)),s=`test = "${t}"`;else if(t instanceof RegExp)this.test=t.test.bind(t),s=`test = "${t.toString()}"`;else{if(!(t instanceof Function))throw new Error("expect listener test to be a string, RegExp, or test function");this.test=t,s=`test = function ${t.name}`}if(this.description=`${s}, ${n}`,"function"!=typeof e)throw new Error("expect callback to be a path or function");this.callback=e,b.push(this)}}const E=()=>{t.perf&&console.time("xin async update");const e=[...g];for(const t of e)b.filter((e=>{let n;try{n=e.test(t)}catch(n){throw new Error(`Listener ${e.description} threw "${n}" at "${t}"`)}return n===m?(_(e),!1):n})).forEach((e=>{let n;try{n=e.callback(t)}catch(n){console.error(`Listener ${e.description} threw "${n}" handling "${t}"`)}n===m&&_(e)}));g.splice(0),w=!1,"function"==typeof v&&v(),t.perf&&console.timeEnd("xin async update")},x=t=>{const e="string"==typeof t?t:a(t);if(void 0===e)throw console.error("touch was called on an invalid target",t),new Error("touch was called on an invalid target");!1===w&&(y=new Promise((t=>{v=t})),w=setTimeout(E)),null==g.find((t=>e.startsWith(t)))&&g.push(e)},A=(t,e)=>new $(t,e),_=t=>{const e=b.indexOf(t);if(!(e>-1))throw new Error("unobserve failed, listener not found");b.splice(e,1)},M=t=>{try{return JSON.stringify(t)}catch(t){return"{has circular references}"}},S=(...t)=>new Error(t.map(M).join(" "));let O=0;const C=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1)+(parseInt("10000",36)+ ++O).toString(36).slice(-5),k={},L={};function j(t){if(""===t)return[];if(Array.isArray(t))return t;{const e=[];for(;t.length>0;){let n=t.search(/\[[^\]]+\]/);if(-1===n){e.push(t.split("."));break}{const s=t.slice(0,n);t=t.slice(n),""!==s&&e.push(s.split(".")),n=t.indexOf("]")+1,e.push(t.slice(1,n-1)),"."===t.slice(n,n+1)&&(n+=1),t=t.slice(n)}}return e}}const P=new WeakMap;function T(t,e){void 0===P.get(t)&&P.set(t,{}),void 0===P.get(t)[e]&&(P.get(t)[e]={});const n=P.get(t)[e];return"_auto_"===e?t.forEach(((t,e)=>{void 0===t._auto_&&(t._auto_=C()),n[t._auto_+""]=e})):t.forEach(((t,s)=>{n[I(t,e)+""]=s})),n}function D(t,e,n){n+="";let s=function(t,e){return void 0===P.get(t)||void 0===P.get(t)[e]?T(t,e):P.get(t)[e]}(t,e)[n];return void 0!==s&&I(t[s],e)+""===n||(s=T(t,e)[n]),s}function F(t,e,n){return void 0===t[e]&&void 0!==n&&(t[e]=n),t[e]}function N(t,e,n,s){let o=""!==e?D(t,e,n):n;if(s===k)return t.splice(o,1),P.delete(t),Symbol("deleted");if(s===L)""===e&&void 0===t[o]&&(t[o]={});else if(void 0!==s)if(void 0!==o)t[o]=s;else{if(""===e||I(s,e)+""!=n+"")throw new Error(`byIdPath insert failed at [${e}=${n}]`);t.push(s),o=t.length-1}return t[o]}function B(t){if(!Array.isArray(t))throw S("setByPath failed: expected array, found",t)}function R(t){if(null==t||!(t instanceof Object))throw S("setByPath failed: expected Object, found",t)}function I(t,e){const n=j(e);let s,o,r,i,l=t;for(s=0,o=n.length;void 0!==l&&s<o;s++){const t=n[s];if(Array.isArray(t))for(r=0,i=t.length;void 0!==l&&r<i;r++){l=l[t[r]]}else if(0===l.length){if(l=l[t.slice(1)],"="!==t[0])return}else if(t.includes("=")){const[e,...n]=t.split("=");l=N(l,e,n.join("="))}else r=parseInt(t,10),l=l[r]}return l}function H(t,e,n){let s=t;const o=j(e);for(;null!=s&&o.length>0;){const t=o.shift();if("string"==typeof t){const e=t.indexOf("=");if(e>-1){0===e?R(s):B(s);if(s=N(s,t.slice(0,e),t.slice(e+1),o.length>0?L:n),0===o.length)return!0}else{B(s);const e=parseInt(t,10);if(!(o.length>0)){if(n!==k){if(s[e]===n)return!1;s[e]=n}else s.splice(e,1);return!0}s=s[e]}}else{if(!(Array.isArray(t)&&t.length>0))throw new Error(`setByPath failed, bad path ${e}`);for(R(s);t.length>0;){const e=t.shift();if(!(t.length>0||o.length>0)){if(n!==k){if(s[e]===n)return!1;s[e]=n}else{if(!Object.prototype.hasOwnProperty.call(s,e))return!1;delete s[e]}return!0}s=F(s,e,t.length>0?{}:[])}}}throw new Error(`setByPath(${t}, ${e}, ${n}) failed`)}const q=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],W={},z=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,Q=(t="",e="")=>""===t?e:null!==e.match(/^\d+$/)||e.includes("=")?`${t}[${e}]`:`${t}.${e}`,V=(t="")=>({get(e,n){if(n===i)return t;if(n===l)return e;if("symbol"==typeof n)return e[n];let s=n;const o=s.match(/^([^.[]+)\.(.+)$/)??s.match(/^([^\]]+)(\[.+)/)??s.match(/^(\[[^\]]+\])\.(.+)$/)??s.match(/^(\[[^\]]+\])\[(.+)$/);if(null!==o){const[,n,s]=o,r=Q(t,n),i=I(e,n);return null!==i&&"object"==typeof i?new Proxy(i,V(r))[s]:i}if(s.startsWith("[")&&s.endsWith("]")&&(s=s.substring(1,s.length-1)),!Array.isArray(e)&&void 0!==e[s]||Array.isArray(e)&&s.includes("=")){let n;if(s.includes("=")){const[t,o]=s.split("=");n=e.find((e=>`${I(e,t)}`===o))}else n=e[s];if(null!==n&&"object"==typeof n){const e=Q(t,s);return new Proxy(n,V(e))}return"function"==typeof n?n.bind(e):n}if(Array.isArray(e)){const n=e[s];return"function"==typeof n?(...n)=>{const o=Array.prototype[s].apply(e,n);return q.includes(s)&&x(t),o}:"object"==typeof n?new Proxy(n,V(Q(t,s))):n}return e[s]},set(e,n,s){null!=s&&s[i]&&(s=s[l]);const o=Q(t,n);if(!(t=>z.test(t))(o))throw new Error(`setting invalid path ${o}`);let r=J[o];return null!=r&&null!=r[l]&&(r=r[l]),r!==s&&H(W,o,s)&&x(o),!0}}),Z=(t,e)=>{const n="function"==typeof e?e:J[e];if("function"!=typeof n)throw new Error(`observe expects a function or path to a function, ${e} is neither`);return A(t,n)},J=new Proxy(W,V()),{document:G,MutationObserver:U}=globalThis,Y=(t,e)=>{const n=u.get(t);for(const s of n){let{path:n,binding:o,options:r}=s;const{toDOM:l}=o;if(null!=l){if(n.startsWith("^")){const e=p(t);if(null==e||null==e[i])throw console.error(`Cannot resolve relative binding ${n}`,t,"is not part of a list"),new Error(`Cannot resolve relative binding ${n}`);n=s.path=`${e[i]}${n.substring(1)}`}(null==e||n.startsWith(e))&&l(t,J[n],r)}}};if(null!=U){new U((t=>{t.forEach((t=>{[...t.addedNodes].forEach((t=>{t instanceof HTMLElement&&[...t.querySelectorAll(s)].forEach((t=>Y(t)))}))}))})).observe(G.body,{subtree:!0,childList:!0})}Z((()=>!0),(t=>{const e=G.querySelectorAll(s);for(const n of e)Y(n,t)}));const K=t=>{let e=t.target.closest(s);for(;null!=e;){const t=u.get(e);for(const n of t){const{binding:t,path:s}=n,{fromDOM:o}=t;if(null!=o){let t;try{t=o(e,n.options)}catch(t){throw console.error("Cannot get value from",e,"via",n),new Error("Cannot obtain value fromDOM")}if(null!=t){const e=J[s];if(null==e)J[s]=t;else{const n=null!=e[i]?e[l]:e,o=null!=t[i]?t[l]:t;n!==o&&(J[s]=o)}}}}e=e.parentElement.closest(s)}};function X(t,e,s,o){if(t instanceof DocumentFragment)throw new Error("bind cannot bind to a DocumentFragment");let r;if("object"==typeof e&&void 0===e[i]&&void 0===o){const{value:t}=e;r="string"==typeof t?t:t[i],delete(o=e).value}else r="string"==typeof e?e:e[i];if(null==r)throw new Error("bind requires a path or object with xin Proxy");const{toDOM:l}=s;t.classList.add(n);let a=u.get(t);return null==a&&(a=[],u.set(t,a)),a.push({path:r,binding:s,options:o}),null==l||r.startsWith("^")||x(r),t}null!=globalThis.document&&(G.body.addEventListener("change",K,!0),G.body.addEventListener("input",K,!0));const tt=new Set,et=t=>{let e=t?.target.closest(r),n=!1;const s=new Proxy(t,{get(e,s){if("stopPropagation"===s)return()=>{t.stopPropagation(),n=!0};{const t=e[s];return"function"==typeof t?t.bind(e):t}}});for(;!n&&null!=e;){const n=h.get(e)[t.type]||[];for(const t of n)if("function"==typeof t)t(s);else{const e=J[t];if("function"!=typeof e)throw new Error(`no event handler found at path ${t}`);e(s)}e=null!=e.parentElement?e.parentElement.closest(r):null}},nt=(t,e,n)=>{let s=h.get(t);t.classList.add(o),null==s&&(s={},h.set(t,s)),s[e]||(s[e]=[]),s[e].includes(n)||s[e].push(n),tt.has(e)||(tt.add(e),G.body.addEventListener(e,et,!0))},st=(t,e)=>{const n=new Event(e);t.dispatchEvent(n)},ot=t=>t instanceof HTMLInputElement?t.type:t instanceof HTMLSelectElement&&t.hasAttribute("multiple")?"multi-select":"other",rt=(t,e)=>{switch(ot(t)){case"radio":t.checked=t.value===e;break;case"checkbox":t.checked=e;break;case"date":t.valueAsDate=new Date(e);break;case"multi-select":for(const n of[...t.querySelectorAll("option")])n.selected=e[n.value];break;default:t.value=e}},it=t=>{switch(ot(t)){case"radio":{const e=t.parentElement?.querySelector(`[name="${t.name}"]:checked`);return null!=e?e.value:null}case"checkbox":return t.checked;case"date":return t.valueAsDate.toISOString();case"multi-select":return[...t.querySelectorAll("option")].reduce(((t,e)=>(t[e.value]=e.selected,t)),{});default:return t.value}},{ResizeObserver:lt}=globalThis,at=null!=lt?new lt((t=>{for(const e of t){const t=e.target;st(t,"resize")}})):{observe(){},unobserve(){}},ct=(t,e)=>{if(null!=t&&null!=e)if("string"==typeof e)t.textContent=e;else if(Array.isArray(e))e.forEach((e=>{t.append(e instanceof Node?d(e):e)}));else{if(!(e instanceof HTMLElement))throw new Error("expect text content or document node");t.append(d(e))}},ht=(t,e=250)=>{let n;return(...s)=>{void 0!==n&&clearTimeout(n),n=setTimeout((()=>{t(...s)}),e)}},ut=(t,e=250)=>{let n,s=Date.now()-e,o=!1;return(...r)=>{if(clearTimeout(n),n=setTimeout((async()=>{t(...r),s=Date.now()}),e),!o&&Date.now()-s>=e){o=!0;try{t(...r),s=Date.now()}finally{o=!1}}}},dt=Symbol("list-binding");function ft(t,e){const n=[...t.querySelectorAll(s)];t.matches(s)&&n.unshift(t);for(const t of n){const n=u.get(t);for(const s of n)s.path.startsWith("^")&&(s.path=`${e}${s.path.substring(1)}`),null!=s.binding.toDOM&&s.binding.toDOM(t,J[s.path])}}class pt{_array=[];constructor(t,e={}){if(this.boundElement=t,this.itemToElement=new WeakMap,1!==t.children.length)throw new Error("ListBinding expects an element with exactly one child element");if(t.children[0]instanceof HTMLTemplateElement){const e=t.children[0];if(1!==e.content.children.length)throw new Error("ListBinding expects a template with exactly one child element");this.template=d(e.content.children[0])}else this.template=t.children[0],this.template.remove();this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),this.options=e,null!=e.virtual&&(at.observe(this.boundElement),this._update=ut((()=>{this.update(this._array,!0)}),16),this.boundElement.addEventListener("scroll",this._update),this.boundElement.addEventListener("resize",this._update))}visibleSlice(){const{virtual:t,hiddenProp:e,visibleProp:n}=this.options;let s=this._array;void 0!==e&&(s=s.filter((t=>!0!==t[e]))),void 0!==n&&(s=s.filter((t=>!0===t[n])));let o=0,r=s.length-1,i=0,l=0;if(null!=t){const e=this.boundElement.offsetWidth,n=this.boundElement.offsetHeight,a=null!=t.width?Math.max(1,Math.floor(e/t.width)):1,c=Math.ceil(n/t.height)+1,h=Math.ceil(s.length/a),u=a*c;let d=Math.floor(this.boundElement.scrollTop/t.height);d>h-c+1&&(d=Math.max(0,h-c+1)),o=d*a,r=o+u-1,i=d*t.height,l=Math.max(h*t.height-n-i,0)}return{items:s,firstItem:o,lastItem:r,topBuffer:i,bottomBuffer:l}}update(e,n){null==e&&(e=[]),this._array=e;const{initInstance:s,updateInstance:o,hiddenProp:r,visibleProp:i}=this.options,l=a(e),h=this.visibleSlice();this.boundElement.classList.toggle("-xin-empty-list",0===h.items.length);const u=this._previousSlice,{firstItem:p,lastItem:m,topBuffer:b,bottomBuffer:g}=h;if(void 0===r&&void 0===i&&!0===n&&null!=u&&p===u.firstItem&&m===u.lastItem)return;this._previousSlice=h;let y=0,v=0,w=0;for(const t of[...this.boundElement.children]){if(t===this.listTop||t===this.listBottom)continue;const e=f.get(t);if(null==e)t.remove();else{const n=h.items.indexOf(e);(n<p||n>m)&&(t.remove(),this.itemToElement.delete(e),f.delete(t),y++)}}this.listTop.style.height=String(b)+"px",this.listBottom.style.height=String(g)+"px";const $=[],{idPath:E}=this.options;for(let t=p;t<=m;t++){const e=h.items[t];if(void 0===e)continue;let n=this.itemToElement.get(c(e));if(null==n){if(w++,n=d(this.template),"object"==typeof e&&(this.itemToElement.set(c(e),n),f.set(n,c(e))),this.boundElement.insertBefore(n,this.listBottom),null!=E){ft(n,`${l}[${E}=${e[E]}]`)}else{ft(n,`${l}[${t}]`)}null!=s&&s(n,e)}null!=o&&o(n,e),$.push(n)}let x=null;for(const t of $)t.previousElementSibling!==x&&(v++,null!=x?.nextElementSibling?this.boundElement.insertBefore(t,x.nextElementSibling):this.boundElement.insertBefore(t,this.listBottom)),x=t;t.perf&&console.log(l,"updated",{removed:y,created:w,moved:v})}}const mt=(t,e)=>{let n=t[dt];return null==n&&(n=new pt(t,e),t[dt]=n),n},bt={value:{toDOM(t,e){rt(t,e)},fromDOM:t=>it(t)},text:{toDOM(t,e){t.textContent=e}},enabled:{toDOM(t,e){t.disabled=!e}},disabled:{toDOM(t,e){t.disabled=Boolean(e)}},style:{toDOM(t,e){if("object"==typeof e)for(const n of Object.keys(e))t.style[n]=e[n];else{if("string"!=typeof e)throw new Error("style binding expects either a string or object");t.setAttribute("style",e)}}},list:{toDOM(t,e,n){mt(t,n).update(e)}}};Math.PI,Math.PI;function gt(t,e,n){return e<t?t:e>n?n:e}function yt(t,e,n){return(n=gt(0,n,1))*(e-t)+t}const vt={clamp:gt,lerp:yt},wt=t=>("00"+Math.round(Number(t)).toString(16)).slice(-2);class $t{constructor(t,e,n){t/=255,e/=255,n/=255;const s=Math.max(t,e,n),o=s-Math.min(t,e,n),r=0!==o?s===t?(e-n)/o:s===e?2+(n-t)/o:4+(t-e)/o:0;this.h=60*r<0?60*r+360:60*r,this.s=0!==o?s<=.5?o/(2*s-o):o/(2-(2*s-o)):0,this.l=(2*s-o)/2}}const Et=void 0!==globalThis.document?globalThis.document.createElement("span"):void 0;class xt{static fromCss(t){let e=t;Et instanceof HTMLSpanElement&&(Et.style.color=t,document.body.appendChild(Et),e=getComputedStyle(Et).color,Et.remove());const[n,s,o,r]=e.match(/[\d.]+/g);return new xt(Number(n),Number(s),Number(o),null==r?1:Number(r))}static fromHsl(t,e,n,s=1){return xt.fromCss(`hsla(${t.toFixed(0)}, ${(100*e).toFixed(0)}%, ${(100*n).toFixed(0)}%, ${s.toFixed(2)})`)}constructor(t,e,n,s=1){this.r=gt(0,t,255),this.g=gt(0,e,255),this.b=gt(0,n,255),this.a=void 0!==s?gt(0,s,1):s=1}get inverse(){return new xt(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){const{h:t,s:e,l:n}=this._hsl;return xt.fromHsl(t,e,1-n,this.a)}get rgb(){const{r:t,g:e,b:n}=this;return`rgb(${t.toFixed(0)},${e.toFixed(0)},${n.toFixed(0)})`}get rgba(){const{r:t,g:e,b:n,a:s}=this;return`rgba(${t.toFixed(0)},${e.toFixed(0)},${n.toFixed(0)},${s.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}get _hsl(){return null==this._hslCached&&(this._hslCached=new $t(this.r,this.g,this.b)),this._hslCached}get hsl(){const{h:t,s:e,l:n}=this._hsl;return`hsl(${t.toFixed(0)}, ${(100*e).toFixed(0)}%, ${(100*n).toFixed(0)}%)`}get hsla(){const{h:t,s:e,l:n}=this._hsl;return`hsla(${t.toFixed(0)}, ${(100*e).toFixed(0)}%, ${(100*n).toFixed(0)}%, ${this.a.toFixed(2)})`}get mono(){const t=255*this.brightness;return new xt(t,t,t)}get brightness(){return(.299*this.r+.587*this.g+.114*this.b)/255}get html(){return 1===this.a?"#"+wt(this.r)+wt(this.g)+wt(this.b):"#"+wt(this.r)+wt(this.g)+wt(this.b)+wt(Math.floor(255*this.a))}brighten(t){let{h:e,s:n,l:s}=this._hsl;return s=gt(0,s+t*(1-s),1),xt.fromHsl(e,n,s,this.a)}darken(t){let{h:e,s:n,l:s}=this._hsl;return s=gt(0,s*(1-t),1),xt.fromHsl(e,n,s,this.a)}saturate(t){let{h:e,s:n,l:s}=this._hsl;return n=gt(0,n+t*(1-n),1),xt.fromHsl(e,n,s,this.a)}desaturate(t){let{h:e,s:n,l:s}=this._hsl;return n=gt(0,n*(1-t),1),xt.fromHsl(e,n,s,this.a)}rotate(t){let{h:e,s:n,l:s}=this._hsl;return e=(e+360+t)%360,xt.fromHsl(e,n,s,this.a)}opacity(t){const{h:e,s:n,l:s}=this._hsl;return xt.fromHsl(e,n,s,t)}swatch(){const{r:t,g:e,b:n,a:s}=this;console.log(`%c   %c ${this.html}, rgba(${t}, ${e}, ${n}, ${s}), ${this.hsla}`,`background-color: rgba(${t}, ${e}, ${n}, ${s})`,"background-color: #eee")}blend(t,e){return new xt(yt(this.r,t.r,e),yt(this.g,t.g,e),yt(this.b,t.b,e),yt(this.a,t.a,e))}}function At(t){return t.replace(/[A-Z]/g,(t=>`-${t.toLocaleLowerCase()}`))}const _t={},Mt=new Proxy({fragment:(...t)=>{const e=globalThis.document.createDocumentFragment();for(const n of t)e.append(n);return e}},{get(t,e){if(null==(e=e.replace(/[A-Z]/g,(t=>`-${t.toLocaleLowerCase()}`))).match(/^\w+(-\w+)*$/))throw new Error(`${e} does not appear to be a valid element tagName`);return void 0===t[e]&&(t[e]=(...t)=>((t,...e)=>{void 0===_t[t]&&(_t[t]=globalThis.document.createElement(t));const n=_t[t].cloneNode(),s={};for(const t of e)t instanceof Element||t instanceof DocumentFragment||"string"==typeof t||"number"==typeof t?n instanceof HTMLTemplateElement?n.content.append(t):n.append(t):Object.assign(s,t);for(const t of Object.keys(s)){const e=s[t];if("apply"===t)e(n);else if("style"===t)if("object"==typeof e)for(const t of Object.keys(e))t.startsWith("--")?n.style.setProperty(t,e[t]):n.style[t]=e[t];else n.setAttribute("style",e);else if(null!=t.match(/^on[A-Z]/)){const s=t.substring(2).toLowerCase();nt(n,s,e)}else if(null!=t.match(/^bind[A-Z]/)){const s=t.substring(4,5).toLowerCase()+t.substring(5),o=bt[s];if(void 0===o)throw new Error(`${t} is not allowed, bindings.${s} is not defined`);X(n,e,o)}else if(void 0!==n[t])n[t]=e;else{const s=At(t);"class"===s?e.split(" ").forEach((t=>{n.classList.add(t)})):void 0!==n[s]?n[s]=e:"boolean"==typeof e?e?n.setAttribute(s,""):n.removeAttribute(s):n.setAttribute(s,e)}}return n})(e,...t)),t[e]},set(){throw new Error("You may not add new properties to elements")}});const St=["animation-iteration-count","flex","flex-base","flex-grow","flex-shrink","gap","opacity","order","tab-size","widows","z-index","zoom"],Ot=(t,e,n="")=>{const s=At(t);if("object"==typeof e){const s=Object.keys(e).map((t=>Ot(t,e[t],`${n}  `))).join("\n");return`${n}  ${t} {\n${s}\n${n}  }`}return((t,e,n)=>void 0===n?"":"string"==typeof n||St.includes(e)?`${t}  ${e}: ${n};`:`${t}  ${e}: ${n}px;`)(n,s,e)},Ct=(t,e="")=>Object.keys(t).map((n=>{const s=t[n];if("string"==typeof s){if("@import"===n)return`@import url('${s}');`;throw new Error("top-level string value only allowed for `@import`")}const o=Object.keys(s).map((t=>Ot(t,s[t]))).join("\n");return`${e}${n} {\n${o}\n}`})).join("\n\n"),kt=t=>{const e={};for(const n of Object.keys(t)){const s=t[n];e[`--${At(n)}`]="number"==typeof s&&0!==s?String(s)+"px":s}return e},Lt=t=>{const e={};for(const n of Object.keys(t)){let s=t[n];"string"==typeof s&&null!=s.match(/^(#|rgb[a]?\(|hsl[a]?\()/)&&(s=xt.fromCss(s).inverseLuminance.html,e[`--${At(n)}`]=s)}return e},jt=new Proxy({},{get(t,e){if(null==t[e]){e=e.replace(/[A-Z]/g,(t=>`-${t.toLocaleLowerCase()}`));let[,n,,s,o,r]=e.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/);if(n=`--${n}`,null!=o){const i=null==s?Number(o)/100:-Number(o)/100;switch(r){case"b":{const s=getComputedStyle(document.body).getPropertyValue(n);t[e]=i>0?xt.fromCss(s).brighten(i).rgba:xt.fromCss(s).darken(-i).rgba}break;case"s":{const s=getComputedStyle(document.body).getPropertyValue(n);t[e]=i>0?xt.fromCss(s).saturate(i).rgba:xt.fromCss(s).desaturate(-i).rgba}break;case"h":{const s=getComputedStyle(document.body).getPropertyValue(n);t[e]=xt.fromCss(s).rotate(100*i).rgba,console.log(xt.fromCss(s).hsla,xt.fromCss(s).rotate(i).hsla)}break;case"o":{const s=getComputedStyle(document.body).getPropertyValue(n);t[e]=xt.fromCss(s).opacity(i).rgba}break;case"":t[e]=`calc(var(${n}) * ${i})`;break;default:throw console.error(r),new Error(`Unrecognized method ${r} for css variable ${n}`)}}else t[e]=`var(${n})`}return t[e]}});let Pt=0;class Tt extends HTMLElement{static elements=Mt;content=Mt.slot();static StyleNode(t){return Mt.style(Ct(t))}static elementCreator(t){if(null==this._elementCreator){let e=null!=t?t.tag:null;null==e&&(e=At(this.name),e.startsWith("-")&&(e=e.substring(1)),e.includes("-")||(e+="-elt"));let n=0;for(;null==this._elementCreator;){n+=1;const s=1===n?e:`${e}-${n}`;try{window.customElements.define(s,this,t),this._elementCreator=Mt[s]}catch(t){throw new Error(`could not define ${this.name} as <${s}>: ${String(t)}`)}}}return this._elementCreator}initAttributes(...t){const n={},s={};new MutationObserver((e=>{let n=!1;e.forEach((e=>{var s;n=!(!e.attributeName||!t.includes((s=e.attributeName,s.replace(/-([a-z])/g,((t,e)=>e.toLocaleUpperCase())))))})),n&&void 0!==this.queueRender&&this.queueRender(!1)})).observe(this,{attributes:!0}),t.forEach((t=>{n[t]=e(this[t]);const o=At(t);Object.defineProperty(this,t,{enumerable:!1,get(){return"boolean"==typeof n[t]?this.hasAttribute(o):this.hasAttribute(o)?"number"==typeof n[t]?parseFloat(this.getAttribute(o)):this.getAttribute(o):void 0!==s[t]?s[t]:n[t]},set(e){"boolean"==typeof n[t]?e!==this[t]&&(e?this.setAttribute(o,""):this.removeAttribute(o),this.queueRender()):"number"==typeof n[t]?e!==parseFloat(this[t])&&(this.setAttribute(o,e),this.queueRender()):"object"!=typeof e&&`${e}`==`${this[t]}`||(null==e||"object"==typeof e?this.removeAttribute(o):this.setAttribute(o,e),this.queueRender(),s[t]=e)}})}))}initValue(){const t=Object.getOwnPropertyDescriptor(this,"value");if(void 0===t||void 0!==t.get||void 0!==t.set)return;let n=this.hasAttribute("value")?this.getAttribute("value"):e(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get:()=>n,set(t){n!==t&&(n=t,this.queueRender(!0))}})}get refs(){const t=null!=this.shadowRoot?this.shadowRoot:this;return null==this._refs&&(this._refs=new Proxy({},{get(e,n){if(void 0===e[n]){let s=t.querySelector(`[data-ref="${n}"]`);if(null==s&&(s=t.querySelector(n)),null==s)throw new Error(`elementRef "${n}" does not exist!`);s.removeAttribute("data-ref"),e[n]=s}return e[n]}})),this._refs}constructor(){super(),Pt+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${Pt}`,this._value=e(this.defaultValue)}connectedCallback(){this.hydrate(),null!=this.role&&this.setAttribute("role",this.role),void 0!==this.onResize&&(at.observe(this),null==this._onResize&&(this._onResize=this.onResize.bind(this)),this.addEventListener("resize",this._onResize)),null!=this.value&&null!=this.getAttribute("value")&&(this._value=this.getAttribute("value")),this.queueRender()}disconnectedCallback(){at.unobserve(this)}_changeQueued=!1;_renderQueued=!1;queueRender(t=!1){this._hydrated&&(this._changeQueued||(this._changeQueued=t),this._renderQueued||(this._renderQueued=!0,requestAnimationFrame((()=>{this._changeQueued&&st(this,"change"),this._changeQueued=!1,this._renderQueued=!1,this.render()}))))}_hydrated=!1;hydrate(){if(!this._hydrated){this.initValue();const t="function"==typeof this.content?this.content():this.content;if(void 0!==this.styleNode){const e=this.attachShadow({mode:"open"});e.appendChild(this.styleNode),ct(e,t)}else ct(this,t);this._hydrated=!0}}render(){}}const Dt=(t=(()=>!0))=>{const e=localStorage.getItem("xin-state");if(null!=e){const n=JSON.parse(e);for(const e of Object.keys(n).filter(t))void 0!==J[e]?Object.assign(J[e],n[e]):J[e]=n[e]}const n=ht((()=>{const e={},n=J[l];for(const s of Object.keys(n).filter(t))e[s]=n[s];localStorage.setItem("xin-state",JSON.stringify(e)),console.log("xin state saved to localStorage")}),500);Z(t,n)};function Ft(t){const e={};return Object.keys(t).forEach((n=>{J[n]=t[n],e[n]=J[n]})),e}export{X as bind,nt as on,bt as bindings,jt as vars,kt as initVars,Ct as css,Lt as darkMode,xt as Color,Tt as Component,Mt as elements,Dt as hotReload,p as getListItem,a as xinPath,c as xinValue,vt as MoreMath,t as settings,ut as throttle,ht as debounce,J as xin,Z as observe,_ as unobserve,x as touch,m as observerShouldBeRemoved,Ft as xinProxy};
//# sourceMappingURL=index.js.map
