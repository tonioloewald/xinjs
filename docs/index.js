var Ei=Object.defineProperty;var Vt=(n,a)=>{for(var t in a)Ei(n,t,{get:a[t],enumerable:!0,configurable:!0,set:(o)=>a[t]=()=>o})};var Jn={};Vt(Jn,{xinValue:()=>z,xinProxy:()=>Sn,xinPath:()=>Nn,xin:()=>I,version:()=>ra,vars:()=>r,varDefault:()=>b,updates:()=>zi,unobserve:()=>ia,touch:()=>rn,throttle:()=>la,svgElements:()=>qn,settings:()=>aa,on:()=>lo,observe:()=>Yn,mathML:()=>yo,makeComponent:()=>Ja,invertLuminance:()=>Ya,initVars:()=>us,hotReload:()=>Ga,getListItem:()=>dn,elements:()=>g,debounce:()=>ea,darkMode:()=>ms,css:()=>Fn,boxedProxy:()=>un,boxed:()=>sa,blueprintLoader:()=>ws,blueprint:()=>fs,bindings:()=>Z,bind:()=>U,StyleSheet:()=>Gn,MoreMath:()=>as,Component:()=>c,Color:()=>v,BlueprintLoader:()=>$a,Blueprint:()=>ha});var aa={debug:!1,perf:!1};function en(n){if(n==null||typeof n!=="object")return n;if(Array.isArray(n))return n.map(en);let a={};for(let t in n){let o=n[t];if(n!=null&&typeof n==="object")a[t]=en(o);else a[t]=o}return a}var Qt="-xin-data",jn=`.${Qt}`,Lt="-xin-event",Xt=`.${Lt}`,R="xinPath",zn="xinValue",Ti="xinObserve",Di="xinBind",Nn=(n)=>{return n&&n[R]};function z(n){return typeof n==="object"&&n!==null?n[zn]||n:n}var Vn=new WeakMap,ln=new WeakMap,Xn=(n)=>{let a=n.cloneNode();if(a instanceof Element){let t=ln.get(n),o=Vn.get(n);if(t!=null)ln.set(a,en(t));if(o!=null)Vn.set(a,en(o))}for(let t of n instanceof HTMLTemplateElement?n.content.childNodes:n.childNodes)if(t instanceof Element||t instanceof DocumentFragment)a.appendChild(Xn(t));else a.appendChild(t.cloneNode());return a},na=new WeakMap,dn=(n)=>{let a=document.body.parentElement;while(n.parentElement!=null&&n.parentElement!==a){let t=na.get(n);if(t!=null)return t;n=n.parentElement}return!1},Wt=Symbol("observer should be removed"),ta=[],oa=[],Da=!1,za,Va;class kt{description;test;callback;constructor(n,a){let t=typeof a==="string"?`"${a}"`:`function ${a.name}`,o;if(typeof n==="string")this.test=(i)=>typeof i==="string"&&i!==""&&(n.startsWith(i)||i.startsWith(n)),o=`test = "${n}"`;else if(n instanceof RegExp)this.test=n.test.bind(n),o=`test = "${n.toString()}"`;else if(n instanceof Function)this.test=n,o=`test = function ${n.name}`;else throw new Error("expect listener test to be a string, RegExp, or test function");if(this.description=`${o}, ${t}`,typeof a==="function")this.callback=a;else throw new Error("expect callback to be a path or function");ta.push(this)}}var zi=async()=>{if(za===void 0)return;await za},Vi=()=>{if(aa.perf)console.time("xin async update");let n=Array.from(oa);for(let a of n)ta.filter((t)=>{let o;try{o=t.test(a)}catch(i){throw new Error(`Listener ${t.description} threw "${i}" at "${a}"`)}if(o===Wt)return ia(t),!1;return o}).forEach((t)=>{let o;try{o=t.callback(a)}catch(i){console.error(`Listener ${t.description} threw "${i}" handling "${a}"`)}if(o===Wt)ia(t)});if(oa.splice(0),Da=!1,typeof Va==="function")Va();if(aa.perf)console.timeEnd("xin async update")},rn=(n)=>{let a=typeof n==="string"?n:Nn(n);if(a===void 0)throw console.error("touch was called on an invalid target",n),new Error("touch was called on an invalid target");if(Da===!1)za=new Promise((t)=>{Va=t}),Da=setTimeout(Vi);if(oa.find((t)=>a.startsWith(t))==null)oa.push(a)},no=(n,a)=>{return new kt(n,a)},ia=(n)=>{let a=ta.indexOf(n);if(a>-1)ta.splice(a,1);else throw new Error("unobserve failed, listener not found")},Xi=(n)=>{try{return JSON.stringify(n)}catch(a){return"{has circular references}"}},ao=(...n)=>new Error(n.map(Xi).join(" ")),Wi=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1),Hi=0,Fi=()=>(parseInt("10000",36)+ ++Hi).toString(36).slice(-5),Ni=()=>Wi()+Fi(),Xa={},to={};function oo(n){if(n==="")return[];if(Array.isArray(n))return n;else{let a=[];while(n.length>0){let t=n.search(/\[[^\]]+\]/);if(t===-1){a.push(n.split("."));break}else{let o=n.slice(0,t);if(n=n.slice(t),o!=="")a.push(o.split("."));if(t=n.indexOf("]")+1,a.push(n.slice(1,t-1)),n.slice(t,t+1)===".")t+=1;n=n.slice(t)}}return a}}var K=new WeakMap;function io(n,a){if(K.get(n)===void 0)K.set(n,{});if(K.get(n)[a]===void 0)K.get(n)[a]={};let t=K.get(n)[a];if(a==="_auto_")n.forEach((o,i)=>{if(o._auto_===void 0)o._auto_=Ni();t[o._auto_+""]=i});else n.forEach((o,i)=>{t[Wn(o,a)+""]=i});return t}function Yi(n,a){if(K.get(n)===void 0||K.get(n)[a]===void 0)return io(n,a);else return K.get(n)[a]}function qi(n,a,t){t=t+"";let o=Yi(n,a)[t];if(o===void 0||Wn(n[o],a)+""!==t)o=io(n,a)[t];return o}function Gi(n,a,t){if(n[a]===void 0&&t!==void 0)n[a]=t;return n[a]}function so(n,a,t,o){let i=a!==""?qi(n,a,t):t;if(o===Xa)return n.splice(i,1),K.delete(n),Symbol("deleted");else if(o===to){if(a===""&&n[i]===void 0)n[i]={}}else if(o!==void 0)if(i!==void 0)n[i]=o;else if(a!==""&&Wn(o,a)+""===t+"")n.push(o),i=n.length-1;else throw new Error(`byIdPath insert failed at [${a}=${t}]`);return n[i]}function Ht(n){if(!Array.isArray(n))throw ao("setByPath failed: expected array, found",n)}function Ft(n){if(n==null||!(n instanceof Object))throw ao("setByPath failed: expected Object, found",n)}function Wn(n,a){let t=oo(a),o=n,i,s,e,l;for(i=0,s=t.length;o!==void 0&&i<s;i++){let h=t[i];if(Array.isArray(h))for(e=0,l=h.length;o!==void 0&&e<l;e++){let d=h[e];o=o[d]}else if(o.length===0){if(o=o[h.slice(1)],h[0]!=="=")return}else if(h.includes("=")){let[d,...p]=h.split("=");o=so(o,d,p.join("="))}else e=parseInt(h,10),o=o[e]}return o}function Ji(n,a,t){let o=n,i=oo(a);while(o!=null&&i.length>0){let s=i.shift();if(typeof s==="string"){let e=s.indexOf("=");if(e>-1){if(e===0)Ft(o);else Ht(o);let l=s.slice(0,e),h=s.slice(e+1);if(o=so(o,l,h,i.length>0?to:t),i.length===0)return!0}else{Ht(o);let l=parseInt(s,10);if(i.length>0)o=o[l];else{if(t!==Xa){if(o[l]===t)return!1;o[l]=t}else o.splice(l,1);return!0}}}else if(Array.isArray(s)&&s.length>0){Ft(o);while(s.length>0){let e=s.shift();if(s.length>0||i.length>0)o=Gi(o,e,s.length>0?{}:[]);else{if(t!==Xa){if(o[e]===t)return!1;o[e]=t}else{if(!Object.prototype.hasOwnProperty.call(o,e))return!1;delete o[e]}return!0}}}else throw new Error(`setByPath failed, bad path ${a}`)}throw new Error(`setByPath(${n}, ${a}, ${t}) failed`)}var $i=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],Ha={},Ki=!0,Ri=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,Ui=(n)=>Ri.test(n),on=(n="",a="")=>{if(n==="")return a;else if(a.match(/^\d+$/)!==null||a.includes("="))return`${n}[${a}]`;else return`${n}.${a}`},Zi={string(n){return new String(n)},boolean(n){return new Boolean(n)},bigint(n){return n},symbol(n){return n},number(n){return new Number(n)}};function Oa(n,a){let t=typeof n;if(n===void 0||t==="object"||t==="function")return n;else return new Proxy(Zi[typeof n](n),Cn(a,!0))}var Cn=(n,a)=>({get(t,o){switch(o){case R:return n;case zn:return z(t);case Ti:return(e)=>{let l=no(n,e);return()=>ia(l)};case Di:return(e,l,h)=>{U(e,n,l,h)}}if(typeof o==="symbol")return t[o];let i=o,s=i.match(/^([^.[]+)\.(.+)$/)??i.match(/^([^\]]+)(\[.+)/)??i.match(/^(\[[^\]]+\])\.(.+)$/)??i.match(/^(\[[^\]]+\])\[(.+)$/);if(s!==null){let[,e,l]=s,h=on(n,e),d=Wn(t,e);return d!==null&&typeof d==="object"?new Proxy(d,Cn(h,a))[l]:d}if(i.startsWith("[")&&i.endsWith("]"))i=i.substring(1,i.length-1);if(!Array.isArray(t)&&t[i]!==void 0||Array.isArray(t)&&i.includes("=")){let e;if(i.includes("=")){let[l,h]=i.split("=");e=t.find((d)=>`${Wn(d,l)}`===h)}else e=t[i];if(e!==null&&typeof e==="object"){let l=on(n,i);return new Proxy(e,Cn(l,a))}else if(typeof e==="function")return e.bind(t);else return a?Oa(e,on(n,i)):e}else if(Array.isArray(t)){let e=t[i];return typeof e==="function"?(...l)=>{let h=e.apply(t,l);if($i.includes(i))rn(n);return h}:typeof e==="object"?new Proxy(e,Cn(on(n,i),a)):a?Oa(e,on(n,i)):e}else return a?Oa(t[i],on(n,i)):t[i]},set(t,o,i){i=z(i);let s=o!==zn?on(n,o):n;if(Ki&&!Ui(s))throw new Error(`setting invalid path ${s}`);if(z(I[s])!==i&&Ji(Ha,s,i))rn(s);return!0}}),Yn=(n,a)=>{let t=typeof a==="function"?a:I[a];if(typeof t!=="function")throw new Error(`observe expects a function or path to a function, ${a} is neither`);return no(n,t)},I=new Proxy(Ha,Cn("",!1)),sa=new Proxy(Ha,Cn("",!0)),{document:Hn,MutationObserver:Nt}=globalThis,eo=(n,a)=>{let t=ln.get(n);if(t==null)return;for(let o of t){let{binding:i,options:s}=o,{path:e}=o,{toDOM:l}=i;if(l!=null){if(e.startsWith("^")){let h=dn(n);if(h!=null&&h[R]!=null)e=o.path=`${h[R]}${e.substring(1)}`;else throw console.error(`Cannot resolve relative binding ${e}`,n,"is not part of a list"),new Error(`Cannot resolve relative binding ${e}`)}if(a==null||e.startsWith(a))l(n,I[e],s)}}};if(Nt!=null)new Nt((n)=>{n.forEach((a)=>{Array.from(a.addedNodes).forEach((t)=>{if(t instanceof Element)Array.from(t.querySelectorAll(jn)).forEach((o)=>eo(o))})})}).observe(Hn.body,{subtree:!0,childList:!0});Yn(()=>!0,(n)=>{let a=Array.from(Hn.querySelectorAll(jn));for(let t of a)eo(t,n)});var Yt=(n)=>{let a=n.target.closest(jn);while(a!=null){let t=ln.get(a);for(let o of t){let{binding:i,path:s}=o,{fromDOM:e}=i;if(e!=null){let l;try{l=e(a,o.options)}catch(h){throw console.error("Cannot get value from",a,"via",o),new Error("Cannot obtain value fromDOM")}if(l!=null){let h=I[s];if(h==null)I[s]=l;else{let d=h[R]!=null?h[zn]:h,p=l[R]!=null?l[zn]:l;if(d!==p)I[s]=p}}}}a=a.parentElement.closest(jn)}};if(globalThis.document!=null)Hn.body.addEventListener("change",Yt,!0),Hn.body.addEventListener("input",Yt,!0);function U(n,a,t,o){if(n instanceof DocumentFragment)throw new Error("bind cannot bind to a DocumentFragment");let i;if(typeof a==="object"&&a[R]===void 0&&o===void 0){let{value:l}=a;i=typeof l==="string"?l:l[R],o=a,delete o.value}else i=typeof a==="string"?a:a[R];if(i==null)throw new Error("bind requires a path or object with xin Proxy");let{toDOM:s}=t;n.classList?.add(Qt);let e=ln.get(n);if(e==null)e=[],ln.set(n,e);if(e.push({path:i,binding:t,options:o}),s!=null&&!i.startsWith("^"))rn(i);return n}var qt=new Set,Qi=(n)=>{let a=n?.target.closest(Xt),t=!1,o=new Proxy(n,{get(i,s){if(s==="stopPropagation")return()=>{n.stopPropagation(),t=!0};else{let e=i[s];return typeof e==="function"?e.bind(i):e}}});while(!t&&a!=null){let i=Vn.get(a)[n.type]||[];for(let s of i){if(typeof s==="function")s(o);else{let e=I[s];if(typeof e==="function")e(o);else throw new Error(`no event handler found at path ${s}`)}if(t)continue}a=a.parentElement!=null?a.parentElement.closest(Xt):null}},lo=(n,a,t)=>{let o=Vn.get(n);if(n.classList.add(Lt),o==null)o={},Vn.set(n,o);if(!o[a])o[a]=[];if(!o[a].includes(t))o[a].push(t);if(!qt.has(a))qt.add(a),Hn.body.addEventListener(a,Qi,!0)},ro=(n,a)=>{let t=new Event(a);n.dispatchEvent(t)},ho=(n)=>{if(n instanceof HTMLInputElement)return n.type;else if(n instanceof HTMLSelectElement&&n.hasAttribute("multiple"))return"multi-select";else return"other"},Gt=(n,a)=>{switch(ho(n)){case"radio":n.checked=n.value===a;break;case"checkbox":n.checked=!!a;break;case"date":n.valueAsDate=new Date(a);break;case"multi-select":for(let t of Array.from(n.querySelectorAll("option")))t.selected=a[t.value];break;default:n.value=a}},Li=(n)=>{switch(ho(n)){case"radio":{let a=n.parentElement?.querySelector(`[name="${n.name}"]:checked`);return a!=null?a.value:null}case"checkbox":return n.checked;case"date":return n.valueAsDate?.toISOString();case"multi-select":return Array.from(n.querySelectorAll("option")).reduce((a,t)=>{return a[t.value]=t.selected,a},{});default:return n.value}},{ResizeObserver:Jt}=globalThis,Wa=Jt!=null?new Jt((n)=>{for(let a of n){let t=a.target;ro(t,"resize")}}):{observe(){},unobserve(){}},$t=(n,a,t=!0)=>{if(n!=null&&a!=null)if(typeof a==="string")n.textContent=a;else if(Array.isArray(a))a.forEach((o)=>{n.append(o instanceof Node&&t?Xn(o):o)});else if(a instanceof Node)n.append(t?Xn(a):a);else throw new Error("expect text content or document node")},ea=(n,a=250)=>{let t;return(...o)=>{if(t!==void 0)clearTimeout(t);t=setTimeout(()=>{n(...o)},a)}},la=(n,a=250)=>{let t,o=Date.now()-a,i=!1;return(...s)=>{if(clearTimeout(t),t=setTimeout(async()=>{n(...s),o=Date.now()},a),!i&&Date.now()-o>=a){i=!0;try{n(...s),o=Date.now()}finally{i=!1}}}},Kt=Symbol("list-binding"),ki=16;function Rt(n,a){let t=Array.from(n.querySelectorAll(jn));if(n.matches(jn))t.unshift(n);for(let o of t){let i=ln.get(o);for(let s of i){if(s.path.startsWith("^"))s.path=`${a}${s.path.substring(1)}`;if(s.binding.toDOM!=null)s.binding.toDOM(o,I[s.path])}}}class uo{boundElement;listTop;listBottom;template;options;itemToElement;_array=[];_update;_previousSlice;constructor(n,a={}){if(this.boundElement=n,this.itemToElement=new WeakMap,n.children.length!==1)throw new Error("ListBinding expects an element with exactly one child element");if(n.children[0]instanceof HTMLTemplateElement){let t=n.children[0];if(t.content.children.length!==1)throw new Error("ListBinding expects a template with exactly one child element");this.template=Xn(t.content.children[0])}else this.template=n.children[0],this.template.remove();if(this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),this.options=a,a.virtual!=null)Wa.observe(this.boundElement),this._update=la(()=>{this.update(this._array,!0)},ki),this.boundElement.addEventListener("scroll",this._update),this.boundElement.addEventListener("resize",this._update)}visibleSlice(){let{virtual:n,hiddenProp:a,visibleProp:t}=this.options,o=this._array;if(a!==void 0)o=o.filter((h)=>h[a]!==!0);if(t!==void 0)o=o.filter((h)=>h[t]===!0);let i=0,s=o.length-1,e=0,l=0;if(n!=null&&this.boundElement instanceof HTMLElement){let h=this.boundElement.offsetWidth,d=this.boundElement.offsetHeight,p=n.width!=null?Math.max(1,Math.floor(h/n.width)):1,m=Math.ceil(d/n.height)+1,u=Math.ceil(o.length/p),M=p*m,_=Math.floor(this.boundElement.scrollTop/n.height);if(_>u-m+1)_=Math.max(0,u-m+1);i=_*p,s=i+M-1,e=_*n.height,l=Math.max(u*n.height-d-e,0)}return{items:o,firstItem:i,lastItem:s,topBuffer:e,bottomBuffer:l}}update(n,a){if(n==null)n=[];this._array=n;let{hiddenProp:t,visibleProp:o}=this.options,i=Nn(n),s=this.visibleSlice();this.boundElement.classList.toggle("-xin-empty-list",s.items.length===0);let e=this._previousSlice,{firstItem:l,lastItem:h,topBuffer:d,bottomBuffer:p}=s;if(t===void 0&&o===void 0&&a===!0&&e!=null&&l===e.firstItem&&h===e.lastItem)return;this._previousSlice=s;let m=0,u=0,M=0;for(let x of Array.from(this.boundElement.children)){if(x===this.listTop||x===this.listBottom)continue;let O=na.get(x);if(O==null)x.remove();else{let A=s.items.indexOf(O);if(A<l||A>h)x.remove(),this.itemToElement.delete(O),na.delete(x),m++}}this.listTop.style.height=String(d)+"px",this.listBottom.style.height=String(p)+"px";let _=[],{idPath:V}=this.options;for(let x=l;x<=h;x++){let O=s.items[x];if(O===void 0)continue;let A=this.itemToElement.get(z(O));if(A==null){if(M++,A=Xn(this.template),typeof O==="object")this.itemToElement.set(z(O),A),na.set(A,z(O));if(this.boundElement.insertBefore(A,this.listBottom),V!=null){let D=O[V],X=`${i}[${V}=${D}]`;Rt(A,X)}else{let D=`${i}[${x}]`;Rt(A,D)}}_.push(A)}let S=null;for(let x of _){if(x.previousElementSibling!==S)if(u++,S?.nextElementSibling!=null)this.boundElement.insertBefore(x,S.nextElementSibling);else this.boundElement.insertBefore(x,this.listBottom);S=x}if(aa.perf)console.log(i,"updated",{removed:m,created:M,moved:u})}}var ns=(n,a)=>{let t=n[Kt];if(t===void 0)t=new uo(n,a),n[Kt]=t;return t},Z={value:{toDOM:Gt,fromDOM(n){return Li(n)}},set:{toDOM:Gt},text:{toDOM(n,a){n.textContent=a}},enabled:{toDOM(n,a){n.disabled=!a}},disabled:{toDOM(n,a){n.disabled=Boolean(a)}},style:{toDOM(n,a){}},callback:{toDOM(n,a,t){if(t?.callback)t.callback(n,a);else if(a instanceof Function)a(n)}},list:{toDOM(n,a,t){ns(n,t).update(a)}}},wl=180/Math.PI,vl=Math.PI/180;function Y(n,a,t){return a<n?n:a>t?t:a}function $(n,a,t){return t=Y(0,t,1),t*(a-n)+n}var as={clamp:Y,lerp:$},ts=(n,a,t)=>{return(0.299*n+0.587*a+0.114*t)/255},sn=(n)=>("00"+Math.round(Number(n)).toString(16)).slice(-2);class mo{h;s;l;constructor(n,a,t){n/=255,a/=255,t/=255;let o=Math.max(n,a,t),i=o-Math.min(n,a,t),s=i!==0?o===n?(a-t)/i:o===a?2+(t-n)/i:4+(n-a)/i:0;this.h=60*s<0?60*s+360:60*s,this.s=i!==0?o<=0.5?i/(2*o-i):i/(2-(2*o-i)):0,this.l=(2*o-i)/2}}var Tn=globalThis.document!==void 0?globalThis.document.createElement("span"):void 0;class v{r;g;b;a;static fromCss(n){let a=n;if(Tn instanceof HTMLSpanElement)Tn.style.color=n,document.body.appendChild(Tn),a=getComputedStyle(Tn).color,Tn.remove();let[t,o,i,s]=a.match(/[\d.]+/g);return new v(Number(t),Number(o),Number(i),s==null?1:Number(s))}static fromHsl(n,a,t,o=1){return v.fromCss(`hsla(${n.toFixed(0)}, ${(a*100).toFixed(0)}%, ${(t*100).toFixed(0)}%, ${o.toFixed(2)})`)}constructor(n,a,t,o=1){this.r=Y(0,n,255),this.g=Y(0,a,255),this.b=Y(0,t,255),this.a=o!==void 0?Y(0,o,1):o=1}get inverse(){return new v(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){let{h:n,s:a,l:t}=this._hsl;return v.fromHsl(n,a,1-t,this.a)}get rgb(){let{r:n,g:a,b:t}=this;return`rgb(${n.toFixed(0)},${a.toFixed(0)},${t.toFixed(0)})`}get rgba(){let{r:n,g:a,b:t,a:o}=this;return`rgba(${n.toFixed(0)},${a.toFixed(0)},${t.toFixed(0)},${o.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}hslCached;get _hsl(){if(this.hslCached==null)this.hslCached=new mo(this.r,this.g,this.b);return this.hslCached}get hsl(){let{h:n,s:a,l:t}=this._hsl;return`hsl(${n.toFixed(0)}, ${(a*100).toFixed(0)}%, ${(t*100).toFixed(0)}%)`}get hsla(){let{h:n,s:a,l:t}=this._hsl;return`hsla(${n.toFixed(0)}, ${(a*100).toFixed(0)}%, ${(t*100).toFixed(0)}%, ${this.a.toFixed(2)})`}get mono(){let n=this.brightness*255;return new v(n,n,n)}get brightness(){return ts(this.r,this.g,this.b)}get html(){return this.toString()}toString(){return this.a===1?"#"+sn(this.r)+sn(this.g)+sn(this.b):"#"+sn(this.r)+sn(this.g)+sn(this.b)+sn(Math.floor(255*this.a))}brighten(n){let{h:a,s:t,l:o}=this._hsl,i=Y(0,o+n*(1-o),1);return v.fromHsl(a,t,i,this.a)}darken(n){let{h:a,s:t,l:o}=this._hsl,i=Y(0,o*(1-n),1);return v.fromHsl(a,t,i,this.a)}saturate(n){let{h:a,s:t,l:o}=this._hsl,i=Y(0,t+n*(1-t),1);return v.fromHsl(a,i,o,this.a)}desaturate(n){let{h:a,s:t,l:o}=this._hsl,i=Y(0,t*(1-n),1);return v.fromHsl(a,i,o,this.a)}rotate(n){let{h:a,s:t,l:o}=this._hsl,i=(a+360+n)%360;return v.fromHsl(i,t,o,this.a)}opacity(n){let{h:a,s:t,l:o}=this._hsl;return v.fromHsl(a,t,o,n)}swatch(){let{r:n,g:a,b:t,a:o}=this;return console.log(`%c      %c ${this.html}, rgba(${n}, ${a}, ${t}, ${o}), ${this.hsla}`,`background-color: rgba(${n}, ${a}, ${t}, ${o})`,"background-color: transparent"),this}blend(n,a){return new v($(this.r,n.r,a),$(this.g,n.g,a),$(this.b,n.b,a),$(this.a,n.a,a))}mix(n,a){let t=this._hsl,o=n._hsl;return v.fromHsl($(t.h,o.h,a),$(t.s,o.s,a),$(t.l,o.l,a),$(this.a,n.a,a))}}function hn(n){return n.replace(/[A-Z]/g,(a)=>{return`-${a.toLocaleLowerCase()}`})}function os(n){return n.replace(/-([a-z])/g,(a,t)=>{return t.toLocaleUpperCase()})}var is="http://www.w3.org/1998/Math/MathML",ss="http://www.w3.org/2000/svg",kn={},po=(n,a,t)=>{let o=co(hn(a),t);if(o.prop.startsWith("--"))n.style.setProperty(o.prop,o.value);else n.style[a]=o.value},es=(n)=>{return{toDOM(a,t){po(a,n,t)}}},bo=(n,a,t)=>{if(a==="style")if(typeof t==="object")for(let o of Object.keys(t))if(Nn(t[o]))console.log(o,t[o]),U(n,t[o],es(o));else po(n,o,t[o]);else n.setAttribute("style",t);else if(n[a]!==void 0){let{MathMLElement:o}=globalThis;if(n instanceof SVGElement||o!==void 0&&n instanceof o)n.setAttribute(a,t);else n[a]=t}else{let o=hn(a);if(o==="class")t.split(" ").forEach((i)=>{n.classList.add(i)});else if(n[o]!==void 0)n[o]=t;else if(typeof t==="boolean")t?n.setAttribute(o,""):n.removeAttribute(o);else n.setAttribute(o,t)}},ls=(n)=>{return{toDOM(a,t){bo(a,n,t)}}},rs=(n,a,t)=>{if(a==="apply")t(n);else if(a.match(/^on[A-Z]/)!=null){let o=a.substring(2).toLowerCase();lo(n,o,t)}else if(a==="bind")if((typeof t.binding==="string"?Z[t.binding]:t.binding)!==void 0&&t.value!==void 0)U(n,t.value,t.binding instanceof Function?{toDOM:t.binding}:t.binding);else throw new Error("bad binding");else if(a.match(/^bind[A-Z]/)!=null){let o=a.substring(4,5).toLowerCase()+a.substring(5),i=Z[o];if(i!==void 0)U(n,t,i);else throw new Error(`${a} is not allowed, bindings.${o} is not defined`)}else if(Nn(t))U(n,t,ls(a));else bo(n,a,t)},Fa=(n,...a)=>{if(kn[n]===void 0){let[i,s]=n.split("|");if(s===void 0)kn[n]=globalThis.document.createElement(i);else kn[n]=globalThis.document.createElementNS(s,i)}let t=kn[n].cloneNode(),o={};for(let i of a)if(i instanceof Element||i instanceof DocumentFragment||typeof i==="string"||typeof i==="number")if(t instanceof HTMLTemplateElement)t.content.append(i);else t.append(i);else if(i.xinPath)t.append(g.span({bindText:i}));else Object.assign(o,i);for(let i of Object.keys(o)){let s=o[i];rs(t,i,s)}return t},Na=(...n)=>{let a=globalThis.document.createDocumentFragment();for(let t of n)a.append(t);return a},g=new Proxy({fragment:Na},{get(n,a){if(a=a.replace(/[A-Z]/g,(t)=>`-${t.toLocaleLowerCase()}`),n[a]===void 0)n[a]=(...t)=>Fa(a,...t);return n[a]},set(){throw new Error("You may not add new properties to elements")}}),qn=new Proxy({fragment:Na},{get(n,a){if(n[a]===void 0)n[a]=(...t)=>Fa(`${a}|${ss}`,...t);return n[a]},set(){throw new Error("You may not add new properties to elements")}}),yo=new Proxy({fragment:Na},{get(n,a){if(n[a]===void 0)n[a]=(...t)=>Fa(`${a}|${is}`,...t);return n[a]},set(){throw new Error("You may not add new properties to elements")}});function Gn(n,a){let t=g.style(Fn(a));t.id=n,document.head.append(t)}var hs=["animation-iteration-count","flex","flex-base","flex-grow","flex-shrink","opacity","order","tab-size","widows","z-index","zoom"],co=(n,a)=>{if(typeof a==="number"&&!hs.includes(n))a=`${a}px`;if(n.startsWith("_"))if(n.startsWith("__"))n="--"+n.substring(2),a=`var(${n}-default, ${a})`;else n="--"+n.substring(1);return{prop:n,value:String(a)}},ds=(n,a,t)=>{if(t===void 0)return"";if(t instanceof v)t=t.html;let o=co(a,t);return`${n}  ${o.prop}: ${o.value};`},go=(n,a,t="")=>{let o=hn(n);if(typeof a==="object"&&!(a instanceof v)){let i=Object.keys(a).map((s)=>go(s,a[s],`${t}  `)).join(`
`);return`${t}  ${n} {
${i}
${t}  }`}else return ds(t,o,a)},Fn=(n,a="")=>{return Object.keys(n).map((t)=>{let o=n[t];if(typeof o==="string"){if(t==="@import")return`@import url('${o}');`;throw new Error("top-level string value only allowed for `@import`")}let i=Object.keys(o).map((s)=>go(s,o[s])).join(`
`);return`${a}${t} {
${i}
}`}).join(`

`)},us=(n)=>{console.warn("initVars is deprecated. Just use _ and __ prefixes instead.");let a={};for(let t of Object.keys(n)){let o=n[t],i=hn(t);a[`--${i}`]=typeof o==="number"&&o!==0?String(o)+"px":o}return a},ms=(n)=>{console.warn("darkMode is deprecated. Use inverseLuminance instead.");let a={};for(let t of Object.keys(n)){let o=n[t];if(typeof o==="string"&&o.match(/^(#|rgb[a]?\(|hsl[a]?\()/)!=null)o=v.fromCss(o).inverseLuminance.html,a[`--${hn(t)}`]=o}return a},Ya=(n)=>{let a={};for(let t of Object.keys(n)){let o=n[t];if(o instanceof v)a[t]=o.inverseLuminance;else if(typeof o==="string"&&o.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/))a[t]=v.fromCss(o).inverseLuminance}return a},b=new Proxy({},{get(n,a){if(n[a]===void 0){let t=`--${a.replace(/[A-Z]/g,(o)=>`-${o.toLocaleLowerCase()}`)}`;n[a]=(o)=>`var(${t}, ${o})`}return n[a]}}),r=new Proxy({},{get(n,a){if(a==="default")return b;if(n[a]==null){a=a.replace(/[A-Z]/g,(l)=>`-${l.toLocaleLowerCase()}`);let[,t,,o,i,s]=a.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/),e=`--${t}`;if(i!=null){let l=o==null?Number(i)/100:-Number(i)/100;switch(s){case"b":{let h=getComputedStyle(document.body).getPropertyValue(e);n[a]=l>0?v.fromCss(h).brighten(l).rgba:v.fromCss(h).darken(-l).rgba}break;case"s":{let h=getComputedStyle(document.body).getPropertyValue(e);n[a]=l>0?v.fromCss(h).saturate(l).rgba:v.fromCss(h).desaturate(-l).rgba}break;case"h":{let h=getComputedStyle(document.body).getPropertyValue(e);n[a]=v.fromCss(h).rotate(l*100).rgba,console.log(v.fromCss(h).hsla,v.fromCss(h).rotate(l).hsla)}break;case"o":{let h=getComputedStyle(document.body).getPropertyValue(e);n[a]=v.fromCss(h).opacity(l).rgba}break;case"":n[a]=`calc(var(${e}) * ${l})`;break;default:throw console.error(s),new Error(`Unrecognized method ${s} for css variable ${e}`)}}else n[a]=`var(${e})`}return n[a]}}),ps=0;function Ea(){return`custom-elt${(ps++).toString(36)}`}var Ut=0,Dn={};function bs(n,a){let t=Dn[n],o=Fn(a).replace(/:host\b/g,n);Dn[n]=t?t+`
`+o:o}function ys(n){if(Dn[n])document.head.append(g.style({id:n+"-component"},Dn[n]));delete Dn[n]}class c extends HTMLElement{static elements=g;static _elementCreator;instanceId;styleNode;static styleSpec;static styleNode;content=g.slot();isSlotted;static _tagName=null;static get tagName(){return this._tagName}static StyleNode(n){return console.warn("StyleNode is deprecated, just assign static styleSpec: XinStyleSheet to the class directly"),g.style(Fn(n))}static elementCreator(n={}){if(this._elementCreator==null){let{tag:a,styleSpec:t}=n,o=n!=null?a:null;if(o==null)if(typeof this.name==="string"&&this.name!==""){if(o=hn(this.name),o.startsWith("-"))o=o.slice(1)}else o=Ea();if(customElements.get(o)!=null)console.warn(`${o} is already defined`);if(o.match(/\w+(-\w+)+/)==null)console.warn(`${o} is not a legal tag for a custom-element`),o=Ea();while(customElements.get(o)!==void 0)o=Ea();if(this._tagName=o,t!==void 0)bs(o,t);window.customElements.define(o,this,n),this._elementCreator=g[o]}return this._elementCreator}initAttributes(...n){let a={},t={};new MutationObserver((o)=>{let i=!1;if(o.forEach((s)=>{i=!!(s.attributeName&&n.includes(os(s.attributeName)))}),i&&this.queueRender!==void 0)this.queueRender(!1)}).observe(this,{attributes:!0}),n.forEach((o)=>{a[o]=en(this[o]);let i=hn(o);Object.defineProperty(this,o,{enumerable:!1,get(){if(typeof a[o]==="boolean")return this.hasAttribute(i);else if(this.hasAttribute(i))return typeof a[o]==="number"?parseFloat(this.getAttribute(i)):this.getAttribute(i);else if(t[o]!==void 0)return t[o];else return a[o]},set(s){if(typeof a[o]==="boolean"){if(s!==this[o]){if(s)this.setAttribute(i,"");else this.removeAttribute(i);this.queueRender()}}else if(typeof a[o]==="number"){if(s!==parseFloat(this[o]))this.setAttribute(i,s),this.queueRender()}else if(typeof s==="object"||`${s}`!==`${this[o]}`){if(s===null||s===void 0||typeof s==="object")this.removeAttribute(i);else this.setAttribute(i,s);this.queueRender(),t[o]=s}}})})}initValue(){let n=Object.getOwnPropertyDescriptor(this,"value");if(n===void 0||n.get!==void 0||n.set!==void 0)return;let a=this.hasAttribute("value")?this.getAttribute("value"):en(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get(){return a},set(t){if(a!==t)a=t,this.queueRender(!0)}})}_parts;get parts(){let n=this.shadowRoot!=null?this.shadowRoot:this;if(this._parts==null)this._parts=new Proxy({},{get(a,t){if(a[t]===void 0){let o=n.querySelector(`[part="${t}"]`);if(o==null)o=n.querySelector(t);if(o==null)throw new Error(`elementRef "${t}" does not exist!`);o.removeAttribute("data-ref"),a[t]=o}return a[t]}});return this._parts}constructor(){super();Ut+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${Ut}`,this._value=en(this.defaultValue)}connectedCallback(){if(ys(this.constructor.tagName),this.hydrate(),this.role!=null)this.setAttribute("role",this.role);if(this.onResize!==void 0){if(Wa.observe(this),this._onResize==null)this._onResize=this.onResize.bind(this);this.addEventListener("resize",this._onResize)}if(this.value!=null&&this.getAttribute("value")!=null)this._value=this.getAttribute("value");this.queueRender()}disconnectedCallback(){Wa.unobserve(this)}_changeQueued=!1;_renderQueued=!1;queueRender(n=!1){if(!this._hydrated)return;if(!this._changeQueued)this._changeQueued=n;if(!this._renderQueued)this._renderQueued=!0,requestAnimationFrame(()=>{if(this._changeQueued)ro(this,"change");this._changeQueued=!1,this._renderQueued=!1,this.render()})}_hydrated=!1;hydrate(){if(!this._hydrated){this.initValue();let n=typeof this.content!=="function",a=typeof this.content==="function"?this.content():this.content,{styleSpec:t}=this.constructor,{styleNode:o}=this.constructor;if(t)o=this.constructor.styleNode=g.style(Fn(t)),delete this.constructor.styleNode;if(this.styleNode)console.warn(this,"styleNode is deprecrated, use static styleNode or statc styleSpec instead"),o=this.styleNode;if(o){let i=this.attachShadow({mode:"open"});i.appendChild(o.cloneNode(!0)),$t(i,a,n)}else if(a!==null){let i=Array.from(this.childNodes);$t(this,a,n),this.isSlotted=this.querySelector("slot,xin-slot")!==void 0;let s=Array.from(this.querySelectorAll("slot"));if(s.length>0)s.forEach(qa.replaceSlot);if(i.length>0){let e={"":this};Array.from(this.querySelectorAll("xin-slot")).forEach((l)=>{e[l.name]=l}),i.forEach((l)=>{let h=e[""],d=l instanceof Element?e[l.slot]:h;(d!==void 0?d:h).append(l)})}}this._hydrated=!0}}render(){}}class qa extends c{name="";content=null;static replaceSlot(n){let a=document.createElement("xin-slot");if(n.name!=="")a.setAttribute("name",n.name);n.replaceWith(a)}constructor(){super();this.initAttributes("name")}}var xl=qa.elementCreator({tag:"xin-slot"}),Ga=(n=()=>!0)=>{let a=localStorage.getItem("xin-state");if(a!=null){let o=JSON.parse(a);for(let i of Object.keys(o).filter(n))if(I[i]!==void 0)Object.assign(I[i],o[i]);else I[i]=o[i]}let t=ea(()=>{let o={},i=z(I);for(let s of Object.keys(i).filter(n))o[s]=i[s];localStorage.setItem("xin-state",JSON.stringify(o)),console.log("xin state saved to localStorage")},500);Yn(n,t)},ra="0.9.1";function un(n){return Object.assign(sa,n),sa}var Zt=!1;function Sn(n,a=!1){if(a){if(!Zt)console.warn("xinProxy(..., true) is deprecated; use boxedProxy(...) instead"),Zt=!0;return un(n)}return Object.keys(n).forEach((t)=>{I[t]=n[t]}),I}var cs={};async function Ja(n,a){let{type:t,styleSpec:o}=await a(n,{Color:v,Component:c,elements:g,svgElements:qn,mathML:yo,varDefault:b,vars:r,xin:I,boxed:sa,xinProxy:Sn,boxedProxy:un,makeComponent:Ja,version:ra}),i={type:t,creator:t.elementCreator({tag:n,styleSpec:o})};return cs[n]=i,i}var Ta={},gs=(n)=>import(n);class ha extends c{tag="anon-elt";src="";property="default";loaded;onload=()=>{};async packaged(){let{tag:n,src:a,property:t}=this,o=`${n}.${t}:${a}`;if(!this.loaded){if(Ta[o]===void 0){let i=(await gs(a))[t];Ta[o]=Ja(n,i)}else console.log(`using cached ${n}`);this.loaded=await Ta[o],this.onload()}return this.loaded}constructor(){super();this.initAttributes("tag","src","property")}}var fs=ha.elementCreator({tag:"xin-blueprint",styleSpec:{":host":{display:"none"}}});class $a extends c{onload=()=>{};constructor(){super()}async load(){let n=Array.from(this.querySelectorAll(ha.tagName)).filter((a)=>a.src).map((a)=>a.packaged());await Promise.all(n),this.onload()}connectedCallback(){super.connectedCallback(),this.load()}}var ws=$a.elementCreator({tag:"xin-loader",styleSpec:{":host":{display:"none"}}});var Dt={};Vt(Dt,{xrControllersText:()=>Pe,xrControllers:()=>Ie,xinjs:()=>Jn,xinTagList:()=>hl,xinTag:()=>Si,xinSizer:()=>sl,xinSelect:()=>dt,xinSegmented:()=>il,xinRating:()=>$e,xinPasswordStrength:()=>Je,xinNotification:()=>fi,xinMenu:()=>oe,xinLocalized:()=>Sa,xinForm:()=>_e,xinFloat:()=>tt,xinField:()=>Me,xinCarousel:()=>Js,version:()=>Tt,updateLocalized:()=>ut,trackDrag:()=>an,tabSelector:()=>ci,svgIcon:()=>Ns,svg2DataUrl:()=>Zo,styleSheet:()=>Uo,spacer:()=>Bn,sizeBreak:()=>Bt,sideNav:()=>It,setLocale:()=>Zs,scriptTag:()=>fn,richTextWidgets:()=>ji,richText:()=>ke,removeLastMenu:()=>vn,postNotification:()=>qe,positionFloat:()=>ai,popMenu:()=>Q,popFloat:()=>ni,menu:()=>ri,markdownViewer:()=>xt,mapBox:()=>Fe,makeSorter:()=>ti,makeExamplesLive:()=>Xe,localize:()=>B,localePicker:()=>ks,liveExample:()=>_a,isBreached:()=>vi,initLocalization:()=>Ls,icons:()=>f,i18n:()=>P,gamepadText:()=>Ae,gamepadState:()=>yi,findHighestZ:()=>ht,filterPart:()=>Ca,filterBuilder:()=>we,elastic:()=>Ze,editableRect:()=>be,dragAndDrop:()=>di,digest:()=>wi,defineIcon:()=>Fs,dataTable:()=>me,createSubMenu:()=>ei,createMenuItem:()=>li,createMenuAction:()=>si,commandButton:()=>N,colorInput:()=>ko,codeEditor:()=>va,bringToFront:()=>Zn,bodymovinPlayer:()=>qs,blockStyle:()=>St,b3d:()=>Ys,availableFilters:()=>ct,abTest:()=>Xs,XinTagList:()=>Et,XinTag:()=>Aa,XinSizer:()=>Ot,XinSelect:()=>Ln,XinSegmented:()=>_t,XinRating:()=>jt,XinPasswordStrength:()=>Ct,XinNotification:()=>wn,XinMenu:()=>bt,XinLocalized:()=>J,XinForm:()=>Qn,XinFloat:()=>tn,XinField:()=>Ma,XinCarousel:()=>rt,TabSelector:()=>wt,SvgIcon:()=>et,SizeBreak:()=>Pt,SideNav:()=>At,RichText:()=>Mt,MarkdownViewer:()=>vt,MapBox:()=>gn,LocalePicker:()=>mt,LiveExample:()=>On,FilterPart:()=>gt,FilterBuilder:()=>ft,EditableRect:()=>H,DataTable:()=>yt,CodeEditor:()=>Pn,BodymovinPlayer:()=>In,B3d:()=>lt,AbTest:()=>An});function Ka(){return{async:!1,baseUrl:null,breaks:!1,extensions:null,gfm:!0,headerIds:!0,headerPrefix:"",highlight:null,hooks:null,langPrefix:"language-",mangle:!0,pedantic:!1,renderer:null,sanitize:!1,sanitizer:null,silent:!1,smartypants:!1,tokenizer:null,walkTokens:null,xhtml:!1}}var k=Ka();function jo(n){k=n}var So=/[&<>"']/,vs=new RegExp(So.source,"g"),Mo=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,xs=new RegExp(Mo.source,"g"),Cs={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},fo=(n)=>Cs[n];function E(n,a){if(a){if(So.test(n))return n.replace(vs,fo)}else if(Mo.test(n))return n.replace(xs,fo);return n}var js=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;function _o(n){return n.replace(js,(a,t)=>{if(t=t.toLowerCase(),t==="colon")return":";if(t.charAt(0)==="#")return t.charAt(1)==="x"?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1));return""})}var Ss=/(^|[^\[])\^/g;function j(n,a){n=typeof n==="string"?n:n.source,a=a||"";let t={replace:(o,i)=>{return i=i.source||i,i=i.replace(Ss,"$1"),n=n.replace(o,i),t},getRegex:()=>{return new RegExp(n,a)}};return t}var Ms=/[^\w:]/g,_s=/^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;function wo(n,a,t){if(n){let o;try{o=decodeURIComponent(_o(t)).replace(Ms,"").toLowerCase()}catch(i){return null}if(o.indexOf("javascript:")===0||o.indexOf("vbscript:")===0||o.indexOf("data:")===0)return null}if(a&&!_s.test(t))t=Bs(a,t);try{t=encodeURI(t).replace(/%25/g,"%")}catch(o){return null}return t}var da={},As=/^[^:]+:\/*[^/]*$/,Is=/^([^:]+:)[\s\S]*$/,Ps=/^([^:]+:\/*[^/]*)[\s\S]*$/;function Bs(n,a){if(!da[" "+n])if(As.test(n))da[" "+n]=n+"/";else da[" "+n]=ua(n,"/",!0);n=da[" "+n];let t=n.indexOf(":")===-1;if(a.substring(0,2)==="//"){if(t)return a;return n.replace(Is,"$1")+a}else if(a.charAt(0)==="/"){if(t)return a;return n.replace(Ps,"$1")+a}else return n+a}var ma={exec:function n(){}};function vo(n,a){let t=n.replace(/\|/g,(s,e,l)=>{let h=!1,d=e;while(--d>=0&&l[d]==="\\")h=!h;if(h)return"|";else return" |"}),o=t.split(/ \|/),i=0;if(!o[0].trim())o.shift();if(o.length>0&&!o[o.length-1].trim())o.pop();if(o.length>a)o.splice(a);else while(o.length<a)o.push("");for(;i<o.length;i++)o[i]=o[i].trim().replace(/\\\|/g,"|");return o}function ua(n,a,t){let o=n.length;if(o===0)return"";let i=0;while(i<o){let s=n.charAt(o-i-1);if(s===a&&!t)i++;else if(s!==a&&t)i++;else break}return n.slice(0,o-i)}function Os(n,a){if(n.indexOf(a[1])===-1)return-1;let t=n.length,o=0,i=0;for(;i<t;i++)if(n[i]==="\\")i++;else if(n[i]===a[0])o++;else if(n[i]===a[1]){if(o--,o<0)return i}return-1}function Es(n,a){if(!n||n.silent)return;if(a)console.warn("marked(): callback is deprecated since version 5.0.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/using_pro#async");if(n.sanitize||n.sanitizer)console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options");if(n.highlight||n.langPrefix!=="language-")console.warn("marked(): highlight and langPrefix parameters are deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-highlight.");if(n.mangle)console.warn("marked(): mangle parameter is enabled by default, but is deprecated since version 5.0.0, and will be removed in the future. To clear this warning, install https://www.npmjs.com/package/marked-mangle, or disable by setting `{mangle: false}`.");if(n.baseUrl)console.warn("marked(): baseUrl parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-base-url.");if(n.smartypants)console.warn("marked(): smartypants parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-smartypants.");if(n.xhtml)console.warn("marked(): xhtml parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-xhtml.");if(n.headerIds||n.headerPrefix)console.warn("marked(): headerIds and headerPrefix parameters enabled by default, but are deprecated since version 5.0.0, and will be removed in the future. To clear this warning, install  https://www.npmjs.com/package/marked-gfm-heading-id, or disable by setting `{headerIds: false}`.")}function xo(n,a,t,o){let i=a.href,s=a.title?E(a.title):null,e=n[1].replace(/\\([\[\]])/g,"$1");if(n[0].charAt(0)!=="!"){o.state.inLink=!0;let l={type:"link",raw:t,href:i,title:s,text:e,tokens:o.inlineTokens(e)};return o.state.inLink=!1,l}return{type:"image",raw:t,href:i,title:s,text:E(e)}}function Ts(n,a){let t=n.match(/^(\s+)(?:```)/);if(t===null)return a;let o=t[1];return a.split(`
`).map((i)=>{let s=i.match(/^\s+/);if(s===null)return i;let[e]=s;if(e.length>=o.length)return i.slice(o.length);return i}).join(`
`)}class Kn{constructor(n){this.options=n||k}space(n){let a=this.rules.block.newline.exec(n);if(a&&a[0].length>0)return{type:"space",raw:a[0]}}code(n){let a=this.rules.block.code.exec(n);if(a){let t=a[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:a[0],codeBlockStyle:"indented",text:!this.options.pedantic?ua(t,`
`):t}}}fences(n){let a=this.rules.block.fences.exec(n);if(a){let t=a[0],o=Ts(t,a[3]||"");return{type:"code",raw:t,lang:a[2]?a[2].trim().replace(this.rules.inline._escapes,"$1"):a[2],text:o}}}heading(n){let a=this.rules.block.heading.exec(n);if(a){let t=a[2].trim();if(/#$/.test(t)){let o=ua(t,"#");if(this.options.pedantic)t=o.trim();else if(!o||/ $/.test(o))t=o.trim()}return{type:"heading",raw:a[0],depth:a[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(n){let a=this.rules.block.hr.exec(n);if(a)return{type:"hr",raw:a[0]}}blockquote(n){let a=this.rules.block.blockquote.exec(n);if(a){let t=a[0].replace(/^ *>[ \t]?/gm,""),o=this.lexer.state.top;this.lexer.state.top=!0;let i=this.lexer.blockTokens(t);return this.lexer.state.top=o,{type:"blockquote",raw:a[0],tokens:i,text:t}}}list(n){let a=this.rules.block.list.exec(n);if(a){let t,o,i,s,e,l,h,d,p,m,u,M,_=a[1].trim(),V=_.length>1,S={type:"list",raw:"",ordered:V,start:V?+_.slice(0,-1):"",loose:!1,items:[]};if(_=V?`\\d{1,9}\\${_.slice(-1)}`:`\\${_}`,this.options.pedantic)_=V?_:"[*+-]";let x=new RegExp(`^( {0,3}${_})((?:[	 ][^\\n]*)?(?:\\n|$))`);while(n){if(M=!1,!(a=x.exec(n)))break;if(this.rules.block.hr.test(n))break;if(t=a[0],n=n.substring(t.length),d=a[2].split(`
`,1)[0].replace(/^\t+/,(A)=>" ".repeat(3*A.length)),p=n.split(`
`,1)[0],this.options.pedantic)s=2,u=d.trimLeft();else s=a[2].search(/[^ ]/),s=s>4?1:s,u=d.slice(s),s+=a[1].length;if(l=!1,!d&&/^ *$/.test(p))t+=p+`
`,n=n.substring(p.length+1),M=!0;if(!M){let A=new RegExp(`^ {0,${Math.min(3,s-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),D=new RegExp(`^ {0,${Math.min(3,s-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),X=new RegExp(`^ {0,${Math.min(3,s-1)}}(?:\`\`\`|~~~)`),En=new RegExp(`^ {0,${Math.min(3,s-1)}}#`);while(n){if(m=n.split(`
`,1)[0],p=m,this.options.pedantic)p=p.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ");if(X.test(p))break;if(En.test(p))break;if(A.test(p))break;if(D.test(n))break;if(p.search(/[^ ]/)>=s||!p.trim())u+=`
`+p.slice(s);else{if(l)break;if(d.search(/[^ ]/)>=4)break;if(X.test(d))break;if(En.test(d))break;if(D.test(d))break;u+=`
`+p}if(!l&&!p.trim())l=!0;t+=m+`
`,n=n.substring(m.length+1),d=p.slice(s)}}if(!S.loose){if(h)S.loose=!0;else if(/\n *\n *$/.test(t))h=!0}if(this.options.gfm){if(o=/^\[[ xX]\] /.exec(u),o)i=o[0]!=="[ ] ",u=u.replace(/^\[[ xX]\] +/,"")}S.items.push({type:"list_item",raw:t,task:!!o,checked:i,loose:!1,text:u}),S.raw+=t}S.items[S.items.length-1].raw=t.trimRight(),S.items[S.items.length-1].text=u.trimRight(),S.raw=S.raw.trimRight();let O=S.items.length;for(e=0;e<O;e++)if(this.lexer.state.top=!1,S.items[e].tokens=this.lexer.blockTokens(S.items[e].text,[]),!S.loose){let A=S.items[e].tokens.filter((X)=>X.type==="space"),D=A.length>0&&A.some((X)=>/\n.*\n/.test(X.raw));S.loose=D}if(S.loose)for(e=0;e<O;e++)S.items[e].loose=!0;return S}}html(n){let a=this.rules.block.html.exec(n);if(a){let t={type:"html",block:!0,raw:a[0],pre:!this.options.sanitizer&&(a[1]==="pre"||a[1]==="script"||a[1]==="style"),text:a[0]};if(this.options.sanitize){let o=this.options.sanitizer?this.options.sanitizer(a[0]):E(a[0]);t.type="paragraph",t.text=o,t.tokens=this.lexer.inline(o)}return t}}def(n){let a=this.rules.block.def.exec(n);if(a){let t=a[1].toLowerCase().replace(/\s+/g," "),o=a[2]?a[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline._escapes,"$1"):"",i=a[3]?a[3].substring(1,a[3].length-1).replace(this.rules.inline._escapes,"$1"):a[3];return{type:"def",tag:t,raw:a[0],href:o,title:i}}}table(n){let a=this.rules.block.table.exec(n);if(a){let t={type:"table",header:vo(a[1]).map((o)=>{return{text:o}}),align:a[2].replace(/^ *|\| *$/g,"").split(/ *\| */),rows:a[3]&&a[3].trim()?a[3].replace(/\n[ \t]*$/,"").split(`
`):[]};if(t.header.length===t.align.length){t.raw=a[0];let o=t.align.length,i,s,e,l;for(i=0;i<o;i++)if(/^ *-+: *$/.test(t.align[i]))t.align[i]="right";else if(/^ *:-+: *$/.test(t.align[i]))t.align[i]="center";else if(/^ *:-+ *$/.test(t.align[i]))t.align[i]="left";else t.align[i]=null;o=t.rows.length;for(i=0;i<o;i++)t.rows[i]=vo(t.rows[i],t.header.length).map((h)=>{return{text:h}});o=t.header.length;for(s=0;s<o;s++)t.header[s].tokens=this.lexer.inline(t.header[s].text);o=t.rows.length;for(s=0;s<o;s++){l=t.rows[s];for(e=0;e<l.length;e++)l[e].tokens=this.lexer.inline(l[e].text)}return t}}}lheading(n){let a=this.rules.block.lheading.exec(n);if(a)return{type:"heading",raw:a[0],depth:a[2].charAt(0)==="="?1:2,text:a[1],tokens:this.lexer.inline(a[1])}}paragraph(n){let a=this.rules.block.paragraph.exec(n);if(a){let t=a[1].charAt(a[1].length-1)===`
`?a[1].slice(0,-1):a[1];return{type:"paragraph",raw:a[0],text:t,tokens:this.lexer.inline(t)}}}text(n){let a=this.rules.block.text.exec(n);if(a)return{type:"text",raw:a[0],text:a[0],tokens:this.lexer.inline(a[0])}}escape(n){let a=this.rules.inline.escape.exec(n);if(a)return{type:"escape",raw:a[0],text:E(a[1])}}tag(n){let a=this.rules.inline.tag.exec(n);if(a){if(!this.lexer.state.inLink&&/^<a /i.test(a[0]))this.lexer.state.inLink=!0;else if(this.lexer.state.inLink&&/^<\/a>/i.test(a[0]))this.lexer.state.inLink=!1;if(!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(a[0]))this.lexer.state.inRawBlock=!0;else if(this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(a[0]))this.lexer.state.inRawBlock=!1;return{type:this.options.sanitize?"text":"html",raw:a[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:this.options.sanitize?this.options.sanitizer?this.options.sanitizer(a[0]):E(a[0]):a[0]}}}link(n){let a=this.rules.inline.link.exec(n);if(a){let t=a[2].trim();if(!this.options.pedantic&&/^</.test(t)){if(!/>$/.test(t))return;let s=ua(t.slice(0,-1),"\\");if((t.length-s.length)%2===0)return}else{let s=Os(a[2],"()");if(s>-1){let l=(a[0].indexOf("!")===0?5:4)+a[1].length+s;a[2]=a[2].substring(0,s),a[0]=a[0].substring(0,l).trim(),a[3]=""}}let o=a[2],i="";if(this.options.pedantic){let s=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(o);if(s)o=s[1],i=s[3]}else i=a[3]?a[3].slice(1,-1):"";if(o=o.trim(),/^</.test(o))if(this.options.pedantic&&!/>$/.test(t))o=o.slice(1);else o=o.slice(1,-1);return xo(a,{href:o?o.replace(this.rules.inline._escapes,"$1"):o,title:i?i.replace(this.rules.inline._escapes,"$1"):i},a[0],this.lexer)}}reflink(n,a){let t;if((t=this.rules.inline.reflink.exec(n))||(t=this.rules.inline.nolink.exec(n))){let o=(t[2]||t[1]).replace(/\s+/g," ");if(o=a[o.toLowerCase()],!o){let i=t[0].charAt(0);return{type:"text",raw:i,text:i}}return xo(t,o,t[0],this.lexer)}}emStrong(n,a,t=""){let o=this.rules.inline.emStrong.lDelim.exec(n);if(!o)return;if(o[3]&&t.match(/[\p{L}\p{N}]/u))return;if(!(o[1]||o[2])||!t||this.rules.inline.punctuation.exec(t)){let s=o[0].length-1,e,l,h=s,d=0,p=o[0][0]==="*"?this.rules.inline.emStrong.rDelimAst:this.rules.inline.emStrong.rDelimUnd;p.lastIndex=0,a=a.slice(-1*n.length+s);while((o=p.exec(a))!=null){if(e=o[1]||o[2]||o[3]||o[4]||o[5]||o[6],!e)continue;if(l=e.length,o[3]||o[4]){h+=l;continue}else if(o[5]||o[6]){if(s%3&&!((s+l)%3)){d+=l;continue}}if(h-=l,h>0)continue;l=Math.min(l,l+h+d);let m=n.slice(0,s+o.index+l+1);if(Math.min(s,l)%2){let M=m.slice(1,-1);return{type:"em",raw:m,text:M,tokens:this.lexer.inlineTokens(M)}}let u=m.slice(2,-2);return{type:"strong",raw:m,text:u,tokens:this.lexer.inlineTokens(u)}}}}codespan(n){let a=this.rules.inline.code.exec(n);if(a){let t=a[2].replace(/\n/g," "),o=/[^ ]/.test(t),i=/^ /.test(t)&&/ $/.test(t);if(o&&i)t=t.substring(1,t.length-1);return t=E(t,!0),{type:"codespan",raw:a[0],text:t}}}br(n){let a=this.rules.inline.br.exec(n);if(a)return{type:"br",raw:a[0]}}del(n){let a=this.rules.inline.del.exec(n);if(a)return{type:"del",raw:a[0],text:a[2],tokens:this.lexer.inlineTokens(a[2])}}autolink(n,a){let t=this.rules.inline.autolink.exec(n);if(t){let o,i;if(t[2]==="@")o=E(this.options.mangle?a(t[1]):t[1]),i="mailto:"+o;else o=E(t[1]),i=o;return{type:"link",raw:t[0],text:o,href:i,tokens:[{type:"text",raw:o,text:o}]}}}url(n,a){let t;if(t=this.rules.inline.url.exec(n)){let o,i;if(t[2]==="@")o=E(this.options.mangle?a(t[0]):t[0]),i="mailto:"+o;else{let s;do s=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])[0];while(s!==t[0]);if(o=E(t[0]),t[1]==="www.")i="http://"+t[0];else i=t[0]}return{type:"link",raw:t[0],text:o,href:i,tokens:[{type:"text",raw:o,text:o}]}}}inlineText(n,a){let t=this.rules.inline.text.exec(n);if(t){let o;if(this.lexer.state.inRawBlock)o=this.options.sanitize?this.options.sanitizer?this.options.sanitizer(t[0]):E(t[0]):t[0];else o=E(this.options.smartypants?a(t[0]):t[0]);return{type:"text",raw:t[0],text:o}}}}var w={newline:/^(?: *(?:\n|$))+/,code:/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,fences:/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,hr:/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,heading:/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,blockquote:/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,list:/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,html:"^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",def:/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,table:ma,lheading:/^((?:(?!^bull ).|\n(?!\n|bull ))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,_paragraph:/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,text:/^[^\n]+/};w._label=/(?!\s*\])(?:\\.|[^\[\]\\])+/;w._title=/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;w.def=j(w.def).replace("label",w._label).replace("title",w._title).getRegex();w.bullet=/(?:[*+-]|\d{1,9}[.)])/;w.listItemStart=j(/^( *)(bull) */).replace("bull",w.bullet).getRegex();w.list=j(w.list).replace(/bull/g,w.bullet).replace("hr","\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def","\\n+(?="+w.def.source+")").getRegex();w._tag="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";w._comment=/<!--(?!-?>)[\s\S]*?(?:-->|$)/;w.html=j(w.html,"i").replace("comment",w._comment).replace("tag",w._tag).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();w.lheading=j(w.lheading).replace(/bull/g,w.bullet).getRegex();w.paragraph=j(w._paragraph).replace("hr",w.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",w._tag).getRegex();w.blockquote=j(w.blockquote).replace("paragraph",w.paragraph).getRegex();w.normal={...w};w.gfm={...w.normal,table:"^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"};w.gfm.table=j(w.gfm.table).replace("hr",w.hr).replace("heading"," {0,3}#{1,6} ").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",w._tag).getRegex();w.gfm.paragraph=j(w._paragraph).replace("hr",w.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("table",w.gfm.table).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",w._tag).getRegex();w.pedantic={...w.normal,html:j(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",w._comment).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:ma,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:j(w.normal._paragraph).replace("hr",w.hr).replace("heading",` *#{1,6} *[^
]`).replace("lheading",w.lheading).replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").getRegex()};var y={escape:/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,autolink:/^<(scheme:[^\s\x00-\x1f<>]*|email)>/,url:ma,tag:"^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",link:/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,reflink:/^!?\[(label)\]\[(ref)\]/,nolink:/^!?\[(ref)\](?:\[\])?/,reflinkSearch:"reflink|nolink(?!\\()",emStrong:{lDelim:/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,rDelimAst:/^[^_*]*?__[^_*]*?\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\*)[punct](\*+)(?=[\s]|$)|[^punct\s](\*+)(?!\*)(?=[punct\s]|$)|(?!\*)[punct\s](\*+)(?=[^punct\s])|[\s](\*+)(?!\*)(?=[punct])|(?!\*)[punct](\*+)(?!\*)(?=[punct])|[^punct\s](\*+)(?=[^punct\s])/,rDelimUnd:/^[^_*]*?\*\*[^_*]*?_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\s]|$)|[^punct\s](_+)(?!_)(?=[punct\s]|$)|(?!_)[punct\s](_+)(?=[^punct\s])|[\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])/},code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,br:/^( {2,}|\\)\n(?!\s*$)/,del:ma,text:/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,punctuation:/^((?![*_])[\spunctuation])/};y._punctuation="\\p{P}$+<=>`^|~";y.punctuation=j(y.punctuation,"u").replace(/punctuation/g,y._punctuation).getRegex();y.blockSkip=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g;y.anyPunctuation=/\\[punct]/g;y._escapes=/\\([punct])/g;y._comment=j(w._comment).replace("(?:-->|$)","-->").getRegex();y.emStrong.lDelim=j(y.emStrong.lDelim,"u").replace(/punct/g,y._punctuation).getRegex();y.emStrong.rDelimAst=j(y.emStrong.rDelimAst,"gu").replace(/punct/g,y._punctuation).getRegex();y.emStrong.rDelimUnd=j(y.emStrong.rDelimUnd,"gu").replace(/punct/g,y._punctuation).getRegex();y.anyPunctuation=j(y.anyPunctuation,"gu").replace(/punct/g,y._punctuation).getRegex();y._escapes=j(y._escapes,"gu").replace(/punct/g,y._punctuation).getRegex();y._scheme=/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;y._email=/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;y.autolink=j(y.autolink).replace("scheme",y._scheme).replace("email",y._email).getRegex();y._attribute=/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;y.tag=j(y.tag).replace("comment",y._comment).replace("attribute",y._attribute).getRegex();y._label=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;y._href=/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;y._title=/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;y.link=j(y.link).replace("label",y._label).replace("href",y._href).replace("title",y._title).getRegex();y.reflink=j(y.reflink).replace("label",y._label).replace("ref",w._label).getRegex();y.nolink=j(y.nolink).replace("ref",w._label).getRegex();y.reflinkSearch=j(y.reflinkSearch,"g").replace("reflink",y.reflink).replace("nolink",y.nolink).getRegex();y.normal={...y};y.pedantic={...y.normal,strong:{start:/^__|\*\*/,middle:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,endAst:/\*\*(?!\*)/g,endUnd:/__(?!_)/g},em:{start:/^_|\*/,middle:/^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,endAst:/\*(?!\*)/g,endUnd:/_(?!_)/g},link:j(/^!?\[(label)\]\((.*?)\)/).replace("label",y._label).getRegex(),reflink:j(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",y._label).getRegex()};y.gfm={...y.normal,escape:j(y.escape).replace("])","~|])").getRegex(),_extended_email:/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,url:/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/};y.gfm.url=j(y.gfm.url,"i").replace("email",y.gfm._extended_email).getRegex();y.breaks={...y.gfm,br:j(y.br).replace("{2,}","*").getRegex(),text:j(y.gfm.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()};function Ds(n){return n.replace(/---/g,"—").replace(/--/g,"–").replace(/(^|[-\u2014/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…")}function Co(n){let a="",t,o,i=n.length;for(t=0;t<i;t++){if(o=n.charCodeAt(t),Math.random()>0.5)o="x"+o.toString(16);a+="&#"+o+";"}return a}class q{constructor(n){this.tokens=[],this.tokens.links=Object.create(null),this.options=n||k,this.options.tokenizer=this.options.tokenizer||new Kn,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let a={block:w.normal,inline:y.normal};if(this.options.pedantic)a.block=w.pedantic,a.inline=y.pedantic;else if(this.options.gfm)if(a.block=w.gfm,this.options.breaks)a.inline=y.breaks;else a.inline=y.gfm;this.tokenizer.rules=a}static get rules(){return{block:w,inline:y}}static lex(n,a){return new q(a).lex(n)}static lexInline(n,a){return new q(a).inlineTokens(n)}lex(n){n=n.replace(/\r\n|\r/g,`
`),this.blockTokens(n,this.tokens);let a;while(a=this.inlineQueue.shift())this.inlineTokens(a.src,a.tokens);return this.tokens}blockTokens(n,a=[]){if(this.options.pedantic)n=n.replace(/\t/g,"    ").replace(/^ +$/gm,"");else n=n.replace(/^( *)(\t+)/gm,(e,l,h)=>{return l+"    ".repeat(h.length)});let t,o,i,s;while(n){if(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some((e)=>{if(t=e.call({lexer:this},n,a))return n=n.substring(t.raw.length),a.push(t),!0;return!1}))continue;if(t=this.tokenizer.space(n)){if(n=n.substring(t.raw.length),t.raw.length===1&&a.length>0)a[a.length-1].raw+=`
`;else a.push(t);continue}if(t=this.tokenizer.code(n)){if(n=n.substring(t.raw.length),o=a[a.length-1],o&&(o.type==="paragraph"||o.type==="text"))o.raw+=`
`+t.raw,o.text+=`
`+t.text,this.inlineQueue[this.inlineQueue.length-1].src=o.text;else a.push(t);continue}if(t=this.tokenizer.fences(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.heading(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.hr(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.blockquote(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.list(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.html(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.def(n)){if(n=n.substring(t.raw.length),o=a[a.length-1],o&&(o.type==="paragraph"||o.type==="text"))o.raw+=`
`+t.raw,o.text+=`
`+t.raw,this.inlineQueue[this.inlineQueue.length-1].src=o.text;else if(!this.tokens.links[t.tag])this.tokens.links[t.tag]={href:t.href,title:t.title};continue}if(t=this.tokenizer.table(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.lheading(n)){n=n.substring(t.raw.length),a.push(t);continue}if(i=n,this.options.extensions&&this.options.extensions.startBlock){let e=1/0,l=n.slice(1),h;if(this.options.extensions.startBlock.forEach(function(d){if(h=d.call({lexer:this},l),typeof h==="number"&&h>=0)e=Math.min(e,h)}),e<1/0&&e>=0)i=n.substring(0,e+1)}if(this.state.top&&(t=this.tokenizer.paragraph(i))){if(o=a[a.length-1],s&&o.type==="paragraph")o.raw+=`
`+t.raw,o.text+=`
`+t.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=o.text;else a.push(t);s=i.length!==n.length,n=n.substring(t.raw.length);continue}if(t=this.tokenizer.text(n)){if(n=n.substring(t.raw.length),o=a[a.length-1],o&&o.type==="text")o.raw+=`
`+t.raw,o.text+=`
`+t.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=o.text;else a.push(t);continue}if(n){let e="Infinite loop on byte: "+n.charCodeAt(0);if(this.options.silent){console.error(e);break}else throw new Error(e)}}return this.state.top=!0,a}inline(n,a=[]){return this.inlineQueue.push({src:n,tokens:a}),a}inlineTokens(n,a=[]){let t,o,i,s=n,e,l,h;if(this.tokens.links){let d=Object.keys(this.tokens.links);if(d.length>0){while((e=this.tokenizer.rules.inline.reflinkSearch.exec(s))!=null)if(d.includes(e[0].slice(e[0].lastIndexOf("[")+1,-1)))s=s.slice(0,e.index)+"["+"a".repeat(e[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex)}}while((e=this.tokenizer.rules.inline.blockSkip.exec(s))!=null)s=s.slice(0,e.index)+"["+"a".repeat(e[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);while((e=this.tokenizer.rules.inline.anyPunctuation.exec(s))!=null)s=s.slice(0,e.index)+"++"+s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);while(n){if(!l)h="";if(l=!1,this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some((d)=>{if(t=d.call({lexer:this},n,a))return n=n.substring(t.raw.length),a.push(t),!0;return!1}))continue;if(t=this.tokenizer.escape(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.tag(n)){if(n=n.substring(t.raw.length),o=a[a.length-1],o&&t.type==="text"&&o.type==="text")o.raw+=t.raw,o.text+=t.text;else a.push(t);continue}if(t=this.tokenizer.link(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.reflink(n,this.tokens.links)){if(n=n.substring(t.raw.length),o=a[a.length-1],o&&t.type==="text"&&o.type==="text")o.raw+=t.raw,o.text+=t.text;else a.push(t);continue}if(t=this.tokenizer.emStrong(n,s,h)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.codespan(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.br(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.del(n)){n=n.substring(t.raw.length),a.push(t);continue}if(t=this.tokenizer.autolink(n,Co)){n=n.substring(t.raw.length),a.push(t);continue}if(!this.state.inLink&&(t=this.tokenizer.url(n,Co))){n=n.substring(t.raw.length),a.push(t);continue}if(i=n,this.options.extensions&&this.options.extensions.startInline){let d=1/0,p=n.slice(1),m;if(this.options.extensions.startInline.forEach(function(u){if(m=u.call({lexer:this},p),typeof m==="number"&&m>=0)d=Math.min(d,m)}),d<1/0&&d>=0)i=n.substring(0,d+1)}if(t=this.tokenizer.inlineText(i,Ds)){if(n=n.substring(t.raw.length),t.raw.slice(-1)!=="_")h=t.raw.slice(-1);if(l=!0,o=a[a.length-1],o&&o.type==="text")o.raw+=t.raw,o.text+=t.text;else a.push(t);continue}if(n){let d="Infinite loop on byte: "+n.charCodeAt(0);if(this.options.silent){console.error(d);break}else throw new Error(d)}}return a}}class Rn{constructor(n){this.options=n||k}code(n,a,t){let o=(a||"").match(/\S*/)[0];if(this.options.highlight){let i=this.options.highlight(n,o);if(i!=null&&i!==n)t=!0,n=i}if(n=n.replace(/\n$/,"")+`
`,!o)return"<pre><code>"+(t?n:E(n,!0))+`</code></pre>
`;return'<pre><code class="'+this.options.langPrefix+E(o)+'">'+(t?n:E(n,!0))+`</code></pre>
`}blockquote(n){return`<blockquote>
${n}</blockquote>
`}html(n,a){return n}heading(n,a,t,o){if(this.options.headerIds){let i=this.options.headerPrefix+o.slug(t);return`<h${a} id="${i}">${n}</h${a}>
`}return`<h${a}>${n}</h${a}>
`}hr(){return this.options.xhtml?`<hr/>
`:`<hr>
`}list(n,a,t){let o=a?"ol":"ul",i=a&&t!==1?' start="'+t+'"':"";return"<"+o+i+`>
`+n+"</"+o+`>
`}listitem(n){return`<li>${n}</li>
`}checkbox(n){return"<input "+(n?'checked="" ':"")+'disabled="" type="checkbox"'+(this.options.xhtml?" /":"")+"> "}paragraph(n){return`<p>${n}</p>
`}table(n,a){if(a)a=`<tbody>${a}</tbody>`;return`<table>
<thead>
`+n+`</thead>
`+a+`</table>
`}tablerow(n){return`<tr>
${n}</tr>
`}tablecell(n,a){let t=a.header?"th":"td";return(a.align?`<${t} align="${a.align}">`:`<${t}>`)+n+`</${t}>
`}strong(n){return`<strong>${n}</strong>`}em(n){return`<em>${n}</em>`}codespan(n){return`<code>${n}</code>`}br(){return this.options.xhtml?"<br/>":"<br>"}del(n){return`<del>${n}</del>`}link(n,a,t){if(n=wo(this.options.sanitize,this.options.baseUrl,n),n===null)return t;let o='<a href="'+n+'"';if(a)o+=' title="'+a+'"';return o+=">"+t+"</a>",o}image(n,a,t){if(n=wo(this.options.sanitize,this.options.baseUrl,n),n===null)return t;let o=`<img src="${n}" alt="${t}"`;if(a)o+=` title="${a}"`;return o+=this.options.xhtml?"/>":">",o}text(n){return n}}class pa{strong(n){return n}em(n){return n}codespan(n){return n}del(n){return n}html(n){return n}text(n){return n}link(n,a,t){return""+t}image(n,a,t){return""+t}br(){return""}}class ba{constructor(){this.seen={}}serialize(n){return n.toLowerCase().trim().replace(/<[!\/a-z].*?>/ig,"").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,"").replace(/\s/g,"-")}getNextSafeSlug(n,a){let t=n,o=0;if(this.seen.hasOwnProperty(t)){o=this.seen[n];do o++,t=n+"-"+o;while(this.seen.hasOwnProperty(t))}if(!a)this.seen[n]=o,this.seen[t]=0;return t}slug(n,a={}){let t=this.serialize(n);return this.getNextSafeSlug(t,a.dryrun)}}class G{constructor(n){this.options=n||k,this.options.renderer=this.options.renderer||new Rn,this.renderer=this.options.renderer,this.renderer.options=this.options,this.textRenderer=new pa,this.slugger=new ba}static parse(n,a){return new G(a).parse(n)}static parseInline(n,a){return new G(a).parseInline(n)}parse(n,a=!0){let t="",o,i,s,e,l,h,d,p,m,u,M,_,V,S,x,O,A,D,X,En=n.length;for(o=0;o<En;o++){if(u=n[o],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[u.type]){if(X=this.options.extensions.renderers[u.type].call({parser:this},u),X!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(u.type)){t+=X||"";continue}}switch(u.type){case"space":continue;case"hr":{t+=this.renderer.hr();continue}case"heading":{t+=this.renderer.heading(this.parseInline(u.tokens),u.depth,_o(this.parseInline(u.tokens,this.textRenderer)),this.slugger);continue}case"code":{t+=this.renderer.code(u.text,u.lang,u.escaped);continue}case"table":{p="",d="",e=u.header.length;for(i=0;i<e;i++)d+=this.renderer.tablecell(this.parseInline(u.header[i].tokens),{header:!0,align:u.align[i]});p+=this.renderer.tablerow(d),m="",e=u.rows.length;for(i=0;i<e;i++){h=u.rows[i],d="",l=h.length;for(s=0;s<l;s++)d+=this.renderer.tablecell(this.parseInline(h[s].tokens),{header:!1,align:u.align[s]});m+=this.renderer.tablerow(d)}t+=this.renderer.table(p,m);continue}case"blockquote":{m=this.parse(u.tokens),t+=this.renderer.blockquote(m);continue}case"list":{M=u.ordered,_=u.start,V=u.loose,e=u.items.length,m="";for(i=0;i<e;i++){if(x=u.items[i],O=x.checked,A=x.task,S="",x.task)if(D=this.renderer.checkbox(O),V)if(x.tokens.length>0&&x.tokens[0].type==="paragraph"){if(x.tokens[0].text=D+" "+x.tokens[0].text,x.tokens[0].tokens&&x.tokens[0].tokens.length>0&&x.tokens[0].tokens[0].type==="text")x.tokens[0].tokens[0].text=D+" "+x.tokens[0].tokens[0].text}else x.tokens.unshift({type:"text",text:D});else S+=D;S+=this.parse(x.tokens,V),m+=this.renderer.listitem(S,A,O)}t+=this.renderer.list(m,M,_);continue}case"html":{t+=this.renderer.html(u.text,u.block);continue}case"paragraph":{t+=this.renderer.paragraph(this.parseInline(u.tokens));continue}case"text":{m=u.tokens?this.parseInline(u.tokens):u.text;while(o+1<En&&n[o+1].type==="text")u=n[++o],m+=`
`+(u.tokens?this.parseInline(u.tokens):u.text);t+=a?this.renderer.paragraph(m):m;continue}default:{let zt='Token with "'+u.type+'" type was not found.';if(this.options.silent){console.error(zt);return}else throw new Error(zt)}}}return t}parseInline(n,a){a=a||this.renderer;let t="",o,i,s,e=n.length;for(o=0;o<e;o++){if(i=n[o],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){if(s=this.options.extensions.renderers[i.type].call({parser:this},i),s!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){t+=s||"";continue}}switch(i.type){case"escape":{t+=a.text(i.text);break}case"html":{t+=a.html(i.text);break}case"link":{t+=a.link(i.href,i.title,this.parseInline(i.tokens,a));break}case"image":{t+=a.image(i.href,i.title,i.text);break}case"strong":{t+=a.strong(this.parseInline(i.tokens,a));break}case"em":{t+=a.em(this.parseInline(i.tokens,a));break}case"codespan":{t+=a.codespan(i.text);break}case"br":{t+=a.br();break}case"del":{t+=a.del(this.parseInline(i.tokens,a));break}case"text":{t+=a.text(i.text);break}default:{let l='Token with "'+i.type+'" type was not found.';if(this.options.silent){console.error(l);return}else throw new Error(l)}}}return t}}class $n{constructor(n){this.options=n||k}static passThroughHooks=new Set(["preprocess","postprocess"]);preprocess(n){return n}postprocess(n){return n}}class Ao{defaults=Ka();options=this.setOptions;parse=this.#n(q.lex,G.parse);parseInline=this.#n(q.lexInline,G.parseInline);Parser=G;parser=G.parse;Renderer=Rn;TextRenderer=pa;Lexer=q;lexer=q.lex;Tokenizer=Kn;Slugger=ba;Hooks=$n;constructor(...n){this.use(...n)}walkTokens(n,a){let t=[];for(let o of n)switch(t=t.concat(a.call(this,o)),o.type){case"table":{for(let i of o.header)t=t.concat(this.walkTokens(i.tokens,a));for(let i of o.rows)for(let s of i)t=t.concat(this.walkTokens(s.tokens,a));break}case"list":{t=t.concat(this.walkTokens(o.items,a));break}default:if(this.defaults.extensions&&this.defaults.extensions.childTokens&&this.defaults.extensions.childTokens[o.type])this.defaults.extensions.childTokens[o.type].forEach((i)=>{t=t.concat(this.walkTokens(o[i],a))});else if(o.tokens)t=t.concat(this.walkTokens(o.tokens,a))}return t}use(...n){let a=this.defaults.extensions||{renderers:{},childTokens:{}};return n.forEach((t)=>{let o={...t};if(o.async=this.defaults.async||o.async||!1,t.extensions)t.extensions.forEach((i)=>{if(!i.name)throw new Error("extension name required");if(i.renderer){let s=a.renderers[i.name];if(s)a.renderers[i.name]=function(...e){let l=i.renderer.apply(this,e);if(l===!1)l=s.apply(this,e);return l};else a.renderers[i.name]=i.renderer}if(i.tokenizer){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");if(a[i.level])a[i.level].unshift(i.tokenizer);else a[i.level]=[i.tokenizer];if(i.start){if(i.level==="block")if(a.startBlock)a.startBlock.push(i.start);else a.startBlock=[i.start];else if(i.level==="inline")if(a.startInline)a.startInline.push(i.start);else a.startInline=[i.start]}}if(i.childTokens)a.childTokens[i.name]=i.childTokens}),o.extensions=a;if(t.renderer){let i=this.defaults.renderer||new Rn(this.defaults);for(let s in t.renderer){let e=i[s];i[s]=(...l)=>{let h=t.renderer[s].apply(i,l);if(h===!1)h=e.apply(i,l);return h}}o.renderer=i}if(t.tokenizer){let i=this.defaults.tokenizer||new Kn(this.defaults);for(let s in t.tokenizer){let e=i[s];i[s]=(...l)=>{let h=t.tokenizer[s].apply(i,l);if(h===!1)h=e.apply(i,l);return h}}o.tokenizer=i}if(t.hooks){let i=this.defaults.hooks||new $n;for(let s in t.hooks){let e=i[s];if($n.passThroughHooks.has(s))i[s]=(l)=>{if(this.defaults.async)return Promise.resolve(t.hooks[s].call(i,l)).then((d)=>{return e.call(i,d)});let h=t.hooks[s].call(i,l);return e.call(i,h)};else i[s]=(...l)=>{let h=t.hooks[s].apply(i,l);if(h===!1)h=e.apply(i,l);return h}}o.hooks=i}if(t.walkTokens){let i=this.defaults.walkTokens;o.walkTokens=function(s){let e=[];if(e.push(t.walkTokens.call(this,s)),i)e=e.concat(i.call(this,s));return e}}this.defaults={...this.defaults,...o}}),this}setOptions(n){return this.defaults={...this.defaults,...n},this}#n(n,a){return(t,o,i)=>{if(typeof o==="function")i=o,o=null;let s={...o};o={...this.defaults,...s};let e=this.#a(o.silent,o.async,i);if(typeof t==="undefined"||t===null)return e(new Error("marked(): input parameter is undefined or null"));if(typeof t!=="string")return e(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(t)+", string expected"));if(Es(o,i),o.hooks)o.hooks.options=o;if(i){let l=o.highlight,h;try{if(o.hooks)t=o.hooks.preprocess(t);h=n(t,o)}catch(m){return e(m)}let d=(m)=>{let u;if(!m)try{if(o.walkTokens)this.walkTokens(h,o.walkTokens);if(u=a(h,o),o.hooks)u=o.hooks.postprocess(u)}catch(M){m=M}return o.highlight=l,m?e(m):i(null,u)};if(!l||l.length<3)return d();if(delete o.highlight,!h.length)return d();let p=0;if(this.walkTokens(h,(m)=>{if(m.type==="code")p++,setTimeout(()=>{l(m.text,m.lang,(u,M)=>{if(u)return d(u);if(M!=null&&M!==m.text)m.text=M,m.escaped=!0;if(p--,p===0)d()})},0)}),p===0)d();return}if(o.async)return Promise.resolve(o.hooks?o.hooks.preprocess(t):t).then((l)=>n(l,o)).then((l)=>o.walkTokens?Promise.all(this.walkTokens(l,o.walkTokens)).then(()=>l):l).then((l)=>a(l,o)).then((l)=>o.hooks?o.hooks.postprocess(l):l).catch(e);try{if(o.hooks)t=o.hooks.preprocess(t);let l=n(t,o);if(o.walkTokens)this.walkTokens(l,o.walkTokens);let h=a(l,o);if(o.hooks)h=o.hooks.postprocess(h);return h}catch(l){return e(l)}}}#a(n,a,t){return(o)=>{if(o.message+=`
Please report this to https://github.com/markedjs/marked.`,n){let i="<p>An error occurred:</p><pre>"+E(o.message+"",!0)+"</pre>";if(a)return Promise.resolve(i);if(t){t(null,i);return}return i}if(a)return Promise.reject(o);if(t){t(o);return}throw o}}}var mn=new Ao(k);function C(n,a,t){return mn.parse(n,a,t)}C.options=C.setOptions=function(n){return mn.setOptions(n),C.defaults=mn.defaults,jo(C.defaults),C};C.getDefaults=Ka;C.defaults=k;C.use=function(...n){return mn.use(...n),C.defaults=mn.defaults,jo(C.defaults),C};C.walkTokens=function(n,a){return mn.walkTokens(n,a)};C.parseInline=mn.parseInline;C.Parser=G;C.parser=G.parse;C.Renderer=Rn;C.TextRenderer=pa;C.Lexer=q;C.lexer=q.lex;C.Tokenizer=Kn;C.Slugger=ba;C.Hooks=$n;C.parse=C;var{options:Cl,setOptions:jl,use:Sl,walkTokens:Ml,parseInline:_l}=C;var Al=G.parse,Il=q.lex;var zs=Object.defineProperty,Vs=(n,a)=>{for(var t in a)zs(n,t,{get:a[t],enumerable:!0,configurable:!0,set:(o)=>a[t]=()=>o})},{abTestConditions:Ra}=Sn({abTestConditions:{}});class An extends c{static set conditions(n){Object.assign(Ra,n);for(let a of[...An.instances])a.queueRender()}condition="";not=!1;static instances=new Set;constructor(){super();this.initAttributes("condition","not")}connectedCallback(){super.connectedCallback(),An.instances.add(this)}disconnectedCallback(){super.disconnectedCallback(),An.instances.delete(this)}render(){if(this.condition!==""&&(this.not?Ra[this.condition]!==!0:Ra[this.condition]===!0))this.toggleAttribute("hidden",!1);else this.toggleAttribute("hidden",!0)}}var Xs=An.elementCreator({tag:"xin-ab"}),ya={};function fn(n,a){if(ya[n]===void 0){if(a!==void 0){let o=globalThis[a];ya[n]=Promise.resolve({[a]:o})}let t=g.script({src:n});document.head.append(t),ya[n]=new Promise((o)=>{t.onload=()=>o(globalThis)})}return ya[n]}var Ua={};function Uo(n){if(Ua[n]===void 0){let a=g.link({rel:"stylesheet",type:"text/css",href:n});document.head.append(a),Ua[n]=new Promise((t)=>{a.onload=t})}return Ua[n]}var ja={earth:"M705 107c-58-28-124-43-193-43-54 0-107 10-155 27 0 0-28 63-28 63-1 2-1 5-1 7 0 0 10 112 10 112 0 5-2 10-6 13 0 0-25 17-25 17-8 5-19 1-21-8 0 0-14-50-14-50-2-8-11-12-19-9 0 0-40 17-40 17-4 2-6 5-8 8 0 0-34 99-34 99-3 9 3 18 13 19 0 0 109 5 109 5 3 0 6 1 8 3 0 0 115 96 115 96 2 1 3 2 6 3 0 0 138 35 138 35 6 1 10 6 10 12 0 0 9 105 9 105 0 4-1 8-3 10 0 0-240 274-240 274 54 23 114 36 177 36 138 0 261-62 344-160 0 0 25-151 25-151 0-2 0-3-0-5 0 0-33-190-33-190-1-6-5-10-11-11 0 0-141-31-141-31-5-1-9-5-11-10 0 0-51-183-51-183-1-4-0-8 2-12 0 0 68-101 68-101zM102 332c-24 55-38 116-38 180 0 151 75 284 189 365 0 0 6-179 6-179 0-5-3-10-8-13 0 0-111-57-111-57-5-2-7-7-8-12 0 0-6-223-6-223-0-2-0-3-1-5 0 0-23-56-23-56zM512 0c283 0 512 229 512 512s-229 512-512 512c-283 0-512-229-512-512s229-512 512-512z",bluesky:"M830 0c137 0 194 57 194 194v635c0 137-57 194-194 194h-635c-137 0-194-57-194-194v-635c0-137 57-194 194-194h635zM855 171c-44-0-83 22-117 47-91 69-190 208-226 282-36-75-134-214-226-282h-0c-66-49-173-88-173 34 0 24 14 204 22 234 28 102 132 128 224 112-161 27-202 118-114 209 168 172 242-43 260-99 3-10 5-15 5-11 0-4 2 1 5 11 19 55 92 271 260 99 89-91 48-182-114-209 92 16 196-10 224-112 8-29 22-209 22-234-0-25-4-54-24-70-9-7-19-9-31-11z",tool:"M657 298l161-160c3-3 6-8 9-13 10-22 0-47-21-56-11-5-23-9-34-13-67-21-143-18-212 13-75 34-129 95-156 167-24 63-26 133-4 200l-275 275c-26 26-39 60-39 94s13 68 39 94 60 39 94 39 68-13 94-39l275-275c2 1 4 1 6 2 67 21 143 18 212-13 75-34 129-95 156-167s27-153-7-228c-2-4-5-9-9-13-17-17-44-17-60 0l-160 161zM597 239c-16 17-24 38-24 60 0 21 8 43 24 59l69 69c17 17 39 25 60 25 21-0 43-8 59-24l110-110c4 34-1 68-12 99-19 51-58 95-112 119-49 22-103 24-151 9-8-3-17-6-25-9-17-7-35-3-48 9l-295 295c-9 9-22 14-34 14s-24-5-34-14-14-22-14-34 5-24 14-34l295-295c13-13 16-32 9-48-24-54-25-112-5-163s58-95 112-119c36-16 75-22 112-18z",sidebar:"M213 85c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-597c0-35-14-67-38-90s-55-38-90-38zM427 853v-683h384c12 0 22 5 30 13s13 18 13 30v597c0 12-5 22-13 30s-18 13-30 13zM341 171v683h-128c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13z",calendar:"M299 85v43h-85c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-597c0-35-14-67-38-90s-55-38-90-38h-85v-43c0-24-19-43-43-43s-43 19-43 43v43h-256v-43c0-24-19-43-43-43s-43 19-43 43zM853 384h-683v-128c0-12 5-22 13-30s18-13 30-13h85v43c0 24 19 43 43 43s43-19 43-43v-43h256v43c0 24 19 43 43 43s43-19 43-43v-43h85c12 0 22 5 30 13s13 18 13 30zM171 469h683v384c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30z",editDoc:"M469 128h-299c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-299c0-24-19-43-43-43s-43 19-43 43v299c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h299c24 0 43-19 43-43s-19-43-43-43zM759 77l-405 405c-5 5-9 12-11 20l-43 171c-2 6-2 14 0 21 6 23 29 37 52 31l171-43c7-2 14-6 20-11l405-405c26-26 39-60 39-94s-13-68-39-94-60-39-94-39-68 13-94 39zM819 137c9-9 22-14 34-14s24 5 34 14 14 22 14 34-5 24-14 34l-397 397-90 23 23-90z",edit:"M695 98l-576 576c-5 5-9 11-11 19l-64 235c-2 7-2 15 0 22 6 23 30 36 52 30l235-64c7-2 13-6 19-11l576-576c32-32 48-74 48-115s-16-84-48-115-74-48-115-48-84 16-115 48zM755 158c15-15 35-23 55-23s40 8 55 23 23 35 23 55-8 40-23 55l-568 568-152 41 41-152z",web:"M723 469c-9-115-47-228-114-329 67 17 127 53 174 100 60 60 100 140 110 229zM609 884c63-95 104-207 114-329h171c-10 89-50 169-110 229-47 47-107 83-174 100zM301 555c9 115 47 228 114 329-67-17-127-53-174-100-60-60-100-140-110-229zM415 140c-63 95-104 207-114 329h-171c10-89 50-169 110-229 48-47 107-83 174-100zM512 43c0 0 0 0 0 0-130 0-247 53-332 137-85 85-137 202-137 332s53 247 137 332c85 85 202 137 332 137 0 0 0 0 0 0 130-0 247-53 332-137 85-85 137-202 137-332s-53-247-137-332c-85-85-202-137-332-137zM638 555c-11 119-56 229-126 318-74-95-115-206-126-318zM512 151c74 95 115 206 126 318h-251c11-119 56-229 126-318z",info:"M981 512c0-130-53-247-137-332s-202-137-332-137-247 53-332 137-137 202-137 332 53 247 137 332 202 137 332 137 247-53 332-137 137-202 137-332zM896 512c0 106-43 202-112 272s-165 112-272 112-202-43-272-112-112-165-112-272 43-202 112-272 165-112 272-112 202 43 272 112 112 165 112 272zM555 683v-171c0-24-19-43-43-43s-43 19-43 43v171c0 24 19 43 43 43s43-19 43-43zM512 384c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",loading:"M469 85v171c0 24 19 43 43 43s43-19 43-43v-171c0-24-19-43-43-43s-43 19-43 43zM469 768v171c0 24 19 43 43 43s43-19 43-43v-171c0-24-19-43-43-43s-43 19-43 43zM180 241l121 121c17 17 44 17 60 0s17-44 0-60l-121-121c-17-17-44-17-60 0s-17 44 0 60zM663 723l121 121c17 17 44 17 60 0s17-44 0-60l-121-121c-17-17-44-17-60 0s-17 44 0 60zM85 555h171c24 0 43-19 43-43s-19-43-43-43h-171c-24 0-43 19-43 43s19 43 43 43zM768 555h171c24 0 43-19 43-43s-19-43-43-43h-171c-24 0-43 19-43 43s19 43 43 43zM241 844l121-121c17-17 17-44 0-60s-44-17-60 0l-121 121c-17 17-17 44 0 60s44 17 60 0zM723 361l121-121c17-17 17-44 0-60s-44-17-60 0l-121 121c-17 17-17 44 0 60s44 17 60 0z",mail:"M128 338l360 252c15 10 34 10 49 0l360-252v430c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30zM43 255c0 0 0 1 0 1v511c0 35 15 67 38 90s55 38 90 38h683c35 0 67-15 90-38s38-55 38-90v-511c0-0 0-1 0-1-0-35-15-67-38-90-23-23-55-38-90-38h-683c-35 0-67 15-90 38-23 23-37 55-38 90zM891 237l-379 266-379-266c2-4 5-8 8-11 8-8 19-13 30-13h683c12 0 22 5 30 13 3 3 6 7 8 11z",resize:"M175 102l271 271c20 20 20 52 0 72s-52 20-72 0l-271-271v184c0 28-23 51-51 51s-51-23-51-51v-307c0-7 1-14 4-20s6-12 11-17c0-0 0-0 0-0 5-5 10-8 17-11 6-3 13-4 20-4h307c28 0 51 23 51 51s-23 51-51 51h-184zM849 922l-271-271c-20-20-20-52 0-72s52-20 72 0l271 271v-184c0-28 23-51 51-51s51 23 51 51v307c0 28-23 51-51 51h-307c-28 0-51-23-51-51s23-51 51-51h184z",menu:"M128 555h768c24 0 43-19 43-43s-19-43-43-43h-768c-24 0-43 19-43 43s19 43 43 43zM128 299h768c24 0 43-19 43-43s-19-43-43-43h-768c-24 0-43 19-43 43s19 43 43 43zM128 811h768c24 0 43-19 43-43s-19-43-43-43h-768c-24 0-43 19-43 43s19 43 43 43z",message:"M939 640v-427c0-35-14-67-38-90s-55-38-90-38h-597c-35 0-67 14-90 38s-38 55-38 90v683c0 11 4 22 13 30 17 17 44 17 60 0l158-158h494c35 0 67-14 90-38s38-55 38-90zM853 640c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22 5-30 13l-98 98v-580c0-12 5-22 13-30s18-13 30-13h597c12 0 22 5 30 13s13 18 13 30z",blog:{p:["M848 517c0-23 19-42 42-43l1-0c23 0 42 19 43 42l0 1v128c0 35-14 67-37 90l-1 1c-23 23-55 37-89 38l-1 0h-494l-158 158c-17 17-44 17-60 0-8-8-12-19-12-29l-0-1v-683c0-35 14-67 38-90 23-23 55-37 89-38l1-0h299c24 0 43 19 43 43 0 23-19 42-42 43l-1 0h-299c-12 0-22 5-30 12l-0 0c-8 8-12 18-12 29l-0 1v580l98-98c8-8 18-12 29-12l1-0h512c12 0 22-5 30-13 8-8 12-18 12-29l0-1v-128zM797 39l-352 352c-5 5-9 12-11 20l-43 171c-2 6-2 14 0 21 6 23 29 37 52 31l171-43c7-2 14-6 20-11l352-352c26-26 39-60 39-94s-13-68-39-94c-26-26-60-39-94-39s-68 13-94 39zM857 99c9-9 22-14 34-14s24 5 34 14c9 9 14 22 14 34s-5 24-14 34l-344 344-90 23 23-90 344-344z","M292 251h163c24 0 43 19 43 43s-19 43-43 43h-163c-24 0-43-19-43-43s19-43 43-43z","M292 407h67c24 0 43 19 43 43s-19 43-43 43h-67c-24 0-43-19-43-43s19-43 43-43z"]},phone:"M981 722c1-30-10-60-29-83-20-24-48-41-82-46-34-4-72-13-110-28-18-7-38-9-57-7-28 3-56 15-78 36l-31 31c-76-48-143-114-196-196l31-31c14-14 24-31 30-49 9-27 9-57-2-86-12-32-22-70-27-111-4-30-19-57-41-77-23-21-54-33-86-33h-128c-4 0-8 0-12 1-35 3-66 20-87 45s-32 58-29 94c13 131 58 266 137 388 64 103 156 197 269 269 110 72 243 122 388 138 4 0 8 1 12 1 35-0 67-15 90-38s37-55 37-90zM896 722v128c0 12-5 23-12 30s-18 13-30 13c-134-14-254-59-353-124-104-66-186-151-243-243-72-112-113-234-125-351-1-11 3-22 10-31s17-14 29-15l132-0c12-0 22 4 29 11 7 7 12 16 14 26 6 46 17 90 32 129 3 9 3 19 0 28-2 6-6 12-10 17l-54 54c-14 14-16 35-7 51 68 119 164 211 272 272 17 9 38 6 51-7l54-54c7-7 16-11 26-12 6-1 13 0 20 3 44 16 88 27 129 32 10 1 20 7 26 15 6 8 10 18 10 29z",pieChart:"M866 661c-41 98-118 169-209 206s-196 39-294-2-169-118-206-209-39-196 2-294c40-94 113-165 200-202 22-9 31-35 22-56s-35-31-56-22c-106 46-196 132-245 247-50 119-48 248-3 359s133 205 252 256 248 48 359 3 205-133 256-252c9-22-1-47-23-56s-47 1-56 23zM894 469h-339v-339c89 10 169 50 229 110s100 140 110 229zM981 512c0-130-53-247-137-332s-202-137-332-137c-24 0-43 19-43 43v427c0 24 19 43 43 43h427c24 0 43-19 43-43z",search:"M684 677c-1 1-3 2-4 4s-3 3-4 4c-54 52-127 84-207 84-82 0-157-33-211-87s-87-129-87-211 33-157 87-211 129-87 211-87 157 33 211 87 87 129 87 211c0 80-32 153-84 207zM926 866l-157-157c53-66 84-149 84-240 0-106-43-202-112-272s-166-112-272-112-202 43-272 112-112 166-112 272 43 202 112 272 166 112 272 112c91 0 174-31 240-84l157 157c17 17 44 17 60 0s17-44 0-60z",send:"M980 97c2-6 2-13 1-20-1-5-3-10-6-14-3-4-6-8-10-11-5-4-11-6-16-8s-12-1-18-0c-2 0-4 1-5 1l-1 0-852 298c-11 4-20 12-25 23-10 22 0 47 22 56l369 164 164 369c5 10 13 19 25 23 22 8 47-4 54-26l298-852c0-1 1-2 1-3zM460 504l-259-115 575-201zM837 248l-201 575-115-259z",server:"M171 43c-35 0-67 14-90 38s-38 55-38 90v171c0 35 14 67 38 90s55 38 90 38h683c35 0 67-14 90-38s38-55 38-90v-171c0-35-14-67-38-90s-55-38-90-38zM171 128h683c12 0 22 5 30 13s13 18 13 30v171c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30v-171c0-12 5-22 13-30s18-13 30-13zM171 555c-35 0-67 14-90 38s-38 55-38 90v171c0 35 14 67 38 90s55 38 90 38h683c35 0 67-14 90-38s38-55 38-90v-171c0-35-14-67-38-90s-55-38-90-38zM171 640h683c12 0 22 5 30 13s13 18 13 30v171c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30v-171c0-12 5-22 13-30s18-13 30-13zM256 299c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43zM256 811c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",graphUp:"M725 299h153l-302 302-183-183c-17-17-44-17-60 0l-320 320c-17 17-17 44 0 60s44 17 60 0l290-290 183 183c17 17 44 17 60 0l333-333v153c0 24 19 43 43 43s43-19 43-43v-256c0-6-1-11-3-16s-5-10-9-14c-0-0-0-0-0-0-4-4-9-7-14-9-5-2-11-3-16-3h-256c-24 0-43 19-43 43s19 43 43 43z",copy:"M469 341c-35 0-67 14-90 38s-38 55-38 90v384c0 35 14 67 38 90s55 38 90 38h384c35 0 67-14 90-38s38-55 38-90v-384c0-35-14-67-38-90s-55-38-90-38zM469 427h384c12 0 22 5 30 13s13 18 13 30v384c0 12-5 22-13 30s-18 13-30 13h-384c-12 0-22-5-30-13s-13-18-13-30v-384c0-12 5-22 13-30s18-13 30-13zM213 597h-43c-12 0-22-5-30-13s-13-18-13-30v-384c0-12 5-22 13-30s18-13 30-13h384c12 0 22 5 30 13s13 18 13 30v43c0 24 19 43 43 43s43-19 43-43v-43c0-35-14-67-38-90s-55-38-90-38h-384c-35 0-67 14-90 38s-38 55-38 90v384c0 35 14 67 38 90s55 38 90 38h43c24 0 43-19 43-43s-19-43-43-43z",alignCenter:"M128 128h768v86h-768v-86zM298 298h428v86h-428v-86zM128 554v-84h768v84h-768zM128 896v-86h768v86h-768zM298 640h428v86h-428v-86z",alignLeft:"M128 128h768v86h-768v-86zM128 896v-86h768v86h-768zM128 554v-84h768v84h-768zM640 298v86h-512v-86h512zM640 640v86h-512v-86h512z",alignRight:"M128 128h768v86h-768v-86zM384 384v-86h512v86h-512zM128 554v-84h768v84h-768zM384 726v-86h512v86h-512zM128 896v-86h768v86h-768z",fontBold:"M576 662q28 0 46-19t18-45-18-45-46-19h-150v128h150zM426 278v128h128q26 0 45-19t19-45-19-45-45-19h-128zM666 460q92 42 92 146 0 68-45 115t-113 47h-302v-598h268q72 0 121 50t49 122-70 118z",blockOutdent:"M470 554v-84h426v84h-426zM470 384v-86h426v86h-426zM128 128h768v86h-768v-86zM128 896v-86h768v86h-768zM128 512l170-170v340zM470 726v-86h426v86h-426z",blockIndent:"M470 554v-84h426v84h-426zM470 384v-86h426v86h-426zM128 128h768v86h-768v-86zM470 726v-86h426v86h-426zM128 342l170 170-170 170v-340zM128 896v-86h768v86h-768z",fontItalic:"M426 170h342v128h-120l-144 342h94v128h-342v-128h120l144-342h-94v-128z",listBullet:"M298 214h598v84h-598v-84zM298 554v-84h598v84h-598zM298 810v-84h598v84h-598zM170 704q26 0 45 19t19 45-19 45-45 19-45-19-19-45 19-45 45-19zM170 192q26 0 45 18t19 46-19 46-45 18-45-18-19-46 19-46 45-18zM170 448q26 0 45 18t19 46-19 46-45 18-45-18-19-46 19-46 45-18z",listNumber:"M298 554v-84h598v84h-598zM298 810v-84h598v84h-598zM298 214h598v84h-598v-84zM86 470v-44h128v40l-78 88h78v44h-128v-40l76-88h-76zM128 342v-128h-42v-44h84v172h-42zM86 726v-44h128v172h-128v-44h84v-20h-42v-44h42v-20h-84z",fontUnderline:"M214 810h596v86h-596v-86zM512 726q-106 0-181-75t-75-181v-342h106v342q0 62 44 105t106 43 106-43 44-105v-342h106v342q0 106-75 181t-181 75z",airplay:"M213 683h-43c-12 0-22-5-30-13s-13-18-13-30v-427c0-12 5-22 13-30s18-13 30-13h683c12 0 22 5 30 13s13 18 13 30v427c0 12-5 22-13 30s-18 13-30 13h-43c-24 0-43 19-43 43s19 43 43 43h43c35 0 67-14 90-38s38-55 38-90v-427c0-35-14-67-38-90s-55-38-90-38h-683c-35 0-67 14-90 38s-38 55-38 90v427c0 35 14 67 38 90s55 38 90 38h43c24 0 43-19 43-43s-19-43-43-43zM545 613c-1-2-3-4-5-5-18-15-45-13-60 5l-213 256c-6 7-10 17-10 27 0 24 19 43 43 43h427c10 0 19-3 27-10 18-15 21-42 5-60zM512 707l122 147h-244z",bell:"M725 341c0 171 40 278 79 341h-585c39-63 79-170 79-341 0-59 24-112 62-151s92-62 151-62 112 24 151 62 62 92 62 151zM811 341c0-82-33-157-87-211s-129-87-211-87-157 33-211 87-87 129-87 211c0 261-102 343-109 349-19 13-24 39-11 59 8 12 22 19 35 19h768c24 0 43-19 43-43 0-14-7-27-18-35-8-6-110-87-110-349zM549 875c-6 10-15 17-26 20s-22 2-32-4c-7-4-12-9-15-15-12-20-38-28-58-16s-28 38-16 58c11 19 27 35 47 47 31 18 65 21 97 13s60-29 78-59c12-20 5-47-15-58s-47-5-58 15z",bellOff:"M549 875c-6 10-15 17-26 20s-22 2-32-4c-7-4-12-9-15-15-12-20-38-28-58-16s-28 38-16 58c11 19 27 35 47 47 31 18 65 21 97 13s60-29 78-59c12-20 5-47-15-58s-47-5-58 15zM811 340c-0-82-33-156-87-210-54-54-129-88-211-88-62-0-119 19-166 50-19 13-25 40-11 59s40 25 59 11c33-22 73-35 116-36 62 0 115 24 153 63 38 39 62 92 62 150-2 71 7 148 28 225 6 23 30 36 52 30s36-30 30-52c-19-69-27-139-25-201 0-0 0-0 0-1 0-0 0-0 0-0zM298 359l324 324h-403c37-61 76-163 79-324zM13 73l207 207c-5 21-7 42-6 62 0 261-102 343-109 348-19 13-24 39-11 59 8 12 22 19 35 19h580l243 243c17 17 44 17 60 0s17-44 0-60l-939-939c-17-17-44-17-60 0s-17 44 0 60z",bookmark:"M786 931c7 5 15 8 25 8 24 0 43-19 43-43v-683c0-35-14-67-38-90s-55-38-90-38h-427c-35 0-67 14-90 38s-38 55-38 90v683c-0 8 3 17 8 25 14 19 40 24 60 10l274-196zM768 813l-231-165c-15-11-35-10-50 0l-231 165v-600c0-12 5-22 13-30s18-13 30-13h427c12 0 22 5 30 13s13 18 13 30z",camera:"M1024 811v-469c0-35-14-67-38-90s-55-38-90-38h-148l-73-109c-8-12-21-19-35-19h-256c-14 0-27 7-35 19l-73 109h-148c-35 0-67 14-90 38s-38 55-38 90v469c0 35 14 67 38 90s55 38 90 38h768c35 0 67-14 90-38s38-55 38-90zM939 811c0 12-5 22-13 30s-18 13-30 13h-768c-12 0-22-5-30-13s-13-18-13-30v-469c0-12 5-22 13-30s18-13 30-13h171c15 0 28-7 35-19l73-109h210l73 109c8 12 22 19 35 19h171c12 0 22 5 30 13s13 18 13 30zM725 555c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM640 555c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90z",check:"M823 226l-439 439-183-183c-17-17-44-17-60 0s-17 44 0 60l213 213c17 17 44 17 60 0l469-469c17-17 17-44 0-60s-44-17-60 0z",chevronDown:"M226 414l256 256c17 17 44 17 60 0l256-256c17-17 17-44 0-60s-44-17-60 0l-226 226-226-226c-17-17-44-17-60 0s-17 44 0 60z",chevronLeft:"M670 738l-226-226 226-226c17-17 17-44 0-60s-44-17-60 0l-256 256c-17 17-17 44 0 60l256 256c17 17 44 17 60 0s17-44 0-60z",chevronRight:"M414 798l256-256c17-17 17-44 0-60l-256-256c-17-17-44-17-60 0s-17 44 0 60l226 226-226 226c-17 17-17 44 0 60s44 17 60 0z",chevronUp:"M798 610l-256-256c-17-17-44-17-60 0l-256 256c-17 17-17 44 0 60s44 17 60 0l226-226 226 226c17 17 44 17 60 0s17-44 0-60z",code:"M713 798l256-256c17-17 17-44 0-60l-256-256c-17-17-44-17-60 0s-17 44 0 60l226 226-226 226c-17 17-17 44 0 60s44 17 60 0zM311 226l-256 256c-17 17-17 44 0 60l256 256c17 17 44 17 60 0s17-44 0-60l-226-226 226-226c17-17 17-44 0-60s-44-17-60 0z",undo:"M896 853v-299c0-59-24-112-62-151s-92-62-151-62h-409l141-141c17-17 17-44 0-60s-44-17-60 0l-213 213c-4 4-7 9-9 14s-3 11-3 16 1 11 3 16c2 5 5 10 9 14l213 213c17 17 44 17 60 0s17-44 0-60l-141-141h409c35 0 67 14 90 38s38 55 38 90v299c0 24 19 43 43 43s43-19 43-43z",redo:"M213 853v-299c0-35 14-67 38-90s55-38 90-38h409l-141 141c-17 17-17 44 0 60s44 17 60 0l213-213c4-4 7-9 9-14 4-10 4-22 0-33-2-5-5-10-9-14l-213-213c-17-17-44-17-60 0s-17 44 0 60l141 141h-409c-59 0-112 24-151 62s-62 92-62 151v299c0 24 19 43 43 43s43-19 43-43z",crop:"M302 302l381-3c11 0 22 5 30 13s13 18 13 30v384h-384c-12 0-22-5-30-13s-13-18-13-30zM43 304l174-1-3 380c0 36 14 68 38 91s55 38 90 38h384v171c0 24 19 43 43 43s43-19 43-43v-171h171c24 0 43-19 43-43s-19-43-43-43h-171v-384c0-35-14-67-38-90s-55-38-91-38l-380 3 1-174c0-24-19-43-42-43s-43 19-43 42l-2 175-175 2c-24 0-42 19-42 43s19 42 43 42z",database:"M171 213c0 0 0-4 9-12 10-10 29-21 56-31 64-25 163-42 277-42s213 17 277 42c27 11 45 22 56 31 9 8 9 12 9 12 0 0-0 4-9 12-10 10-29 21-56 31-64 25-163 42-277 42s-213-17-277-42c-27-11-45-22-56-31-9-8-9-12-9-12zM853 620v191c-2 4-4 8-9 12-10 10-29 21-56 31-64 25-163 42-276 42s-213-17-276-42c-27-10-45-21-56-31-5-5-8-8-8-10l-0-193c11 5 22 10 33 15 77 30 187 48 307 48s231-18 307-48c12-5 23-10 34-15zM853 321v190c0 0 0 0 0 1-2 4-4 8-9 12-10 10-29 21-56 31-64 25-163 42-276 42s-213-17-276-42c-27-10-45-21-56-31-5-5-8-8-8-10-0-2-0-3-0-5l-0-188c11 5 22 10 34 15 77 30 187 48 308 48s231-18 308-48c12-5 23-10 34-15zM85 213v597c0 2 0 5 0 7 2 28 18 51 37 68 21 19 50 35 82 48 77 30 187 48 307 48s231-18 307-48c32-13 61-28 82-48 18-17 34-40 37-68 0-2 0-5 0-7v-597c0-2-0-5-0-7-2-28-18-51-36-68-21-20-50-35-82-48-77-30-187-48-308-48s-231 18-308 48c-32 13-61 28-82 48-18 17-34 40-36 68-0 2-0 5-0 7z",download:"M853 640v171c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-171c0-24-19-43-43-43s-43 19-43 43v171c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-171c0-24-19-43-43-43s-43 19-43 43zM555 537v-409c0-24-19-43-43-43s-43 19-43 43v409l-141-141c-17-17-44-17-60 0s-17 44 0 60l213 213c4 4 9 7 14 9s11 3 16 3c11 0 22-4 30-13l213-213c17-17 17-44 0-60s-44-17-60 0z",downloadCloud:"M469 512v281l-98-98c-17-17-44-17-60 0s-17 44 0 60l171 171c4 4 9 7 14 9 10 4 22 4 33 0 5-2 10-5 14-9l171-171c17-17 17-44 0-60s-44-17-60 0l-98 98v-281c0-24-19-43-43-43s-43 19-43 43zM915 807c58-41 94-101 105-165s-2-133-43-191c-35-50-85-84-140-99-22-6-46-10-69-10h-22c-31-88-91-158-167-203-85-50-188-68-291-41s-185 92-235 176-68 188-41 291c16 62 46 116 85 159 16 17 43 19 60 3s19-43 3-60c-30-33-53-75-65-123-21-80-7-160 32-226s103-117 183-137 160-7 226 32 117 103 137 183c5 19 22 32 41 32h54c16 0 31 2 47 6 37 10 70 33 93 66 27 39 36 84 29 127s-31 83-70 110c-19 14-24 40-10 59s40 24 59 10z",externalLink:"M725 555v256c0 12-5 22-13 30s-18 13-30 13h-469c-12 0-22-5-30-13s-13-18-13-30v-469c0-12 5-22 13-30s18-13 30-13h256c24 0 43-19 43-43s-19-43-43-43h-256c-35 0-67 14-90 38s-38 55-38 90v469c0 35 14 67 38 90s55 38 90 38h469c35 0 67-14 90-38s38-55 38-90v-256c0-24-19-43-43-43s-43 19-43 43zM457 627l397-397v153c0 24 19 43 43 43s43-19 43-43v-256c0-6-1-11-3-16s-5-10-9-14c-0-0-0-0-0-0-4-4-9-7-14-9-5-2-11-3-16-3h-256c-24 0-43 19-43 43s19 43 43 43h153l-397 397c-17 17-17 44 0 60s44 17 60 0z",eye:"M5 493c-6 12-6 26 0 38 0 0 17 34 48 79 19 28 44 61 75 95 38 42 86 85 142 119 68 42 150 72 243 72s175-30 243-72c56-35 103-78 142-119 31-34 56-67 75-95 31-45 48-79 48-79 6-12 6-26 0-38 0 0-17-34-48-79-19-28-44-61-75-95-38-42-86-85-142-119-68-42-150-72-243-72s-175 30-243 72c-56 35-103 78-142 119-31 34-56 67-75 95-31 45-48 79-48 79zM91 512c7-12 17-29 31-49 17-25 40-55 68-85 34-38 76-75 123-104 58-36 124-59 198-59s141 24 198 59c48 30 89 67 123 104 27 30 50 60 68 85 14 20 24 37 31 49-7 12-17 29-31 49-17 25-40 55-68 85-34 38-76 75-123 104-58 36-124 59-198 59s-141-24-198-59c-48-30-89-67-123-104-27-30-50-60-68-85-14-20-24-37-31-49zM683 512c0-47-19-90-50-121s-74-50-121-50-90 19-121 50-50 74-50 121 19 90 50 121 74 50 121 50 90-19 121-50 50-74 50-121zM597 512c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60 10-45 25-60 37-25 60-25 45 10 60 25 25 37 25 60z",eyeOff:"M432 222c28-6 55-9 79-9 75 0 141 24 199 59 48 30 89 67 123 104 27 30 50 60 68 85 14 20 24 37 31 49-23 41-49 78-76 108-15 18-13 45 5 60s45 13 60-5c35-41 69-90 97-144 6-12 7-26 1-39 0 0-17-34-48-79-19-28-44-61-75-95-38-42-86-85-142-119-68-42-150-72-243-72-31-0-66 3-100 11-23 5-37 28-32 51s28 37 51 32zM428 488l108 108c-8 3-16 4-24 4-22 1-44-7-61-23s-26-38-27-59c-0-10 1-20 4-30zM255 316l109 109c-19 29-27 63-26 97 2 44 20 87 54 119s79 47 122 46c30-1 59-10 85-26l99 99c-59 34-124 51-187 52-74 0-140-24-198-59-48-30-89-67-123-104-27-30-50-60-68-85-14-20-24-37-31-49 45-78 101-144 164-197zM13 73l182 182c-74 63-139 143-190 237-6 12-7 26-1 39 0 0 17 34 48 79 19 28 44 61 75 95 38 42 86 85 142 119 68 42 150 72 244 72 85-1 171-26 248-75l191 191c17 17 44 17 60 0s17-44 0-60l-379-379c-0-0-0-0-0-0l-180-180c-0-0-1-1-1-1l-379-379c-17-17-44-17-60 0s-17 44 0 60z",fastForward:"M597 723v-423l272 211zM128 723v-423l272 211zM112 844l384-299c11-8 16-21 16-33v298c0 24 19 43 43 43 10 0 19-3 26-9l384-299c19-14 22-41 7-60-2-3-5-6-7-7l-384-299c-19-14-45-11-60 7-6 8-9 17-9 26v298c-0-9-3-18-9-26-2-3-5-6-7-7l-384-299c-19-14-45-11-60 7-6 8-9 17-9 26v597c0 24 19 43 43 43 10 0 19-3 26-9z",file:"M750 341h-153v-153zM883 354l-299-299c-4-4-9-7-14-9s-11-3-16-3h-299c-35 0-67 14-90 38s-38 55-38 90v683c0 35 14 67 38 90s55 38 90 38h512c35 0 67-14 90-38s38-55 38-90v-469c0-12-5-22-13-30zM512 128v256c0 24 19 43 43 43h256v427c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22-5-30-13s-13-18-13-30v-683c0-12 5-22 13-30s18-13 30-13z",fileMinus:"M750 299h-110v-110zM883 311l-256-256c-4-4-9-7-14-9s-11-3-16-3h-341c-35 0-67 14-90 38s-38 55-38 90v683c0 35 14 67 38 90s55 38 90 38h512c35 0 67-14 90-38s38-55 38-90v-512c0-12-5-22-13-30zM555 128v213c0 24 19 43 43 43h213v469c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22-5-30-13s-13-18-13-30v-683c0-12 5-22 13-30s18-13 30-13zM384 683h256c24 0 43-19 43-43s-19-43-43-43h-256c-24 0-43 19-43 43s19 43 43 43z",filePlus:"M750 299h-110v-110zM883 311l-256-256c-4-4-9-7-14-9s-11-3-16-3h-341c-35 0-67 14-90 38s-38 55-38 90v683c0 35 14 67 38 90s55 38 90 38h512c35 0 67-14 90-38s38-55 38-90v-512c0-12-5-22-13-30zM555 128v213c0 24 19 43 43 43h213v469c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22-5-30-13s-13-18-13-30v-683c0-12 5-22 13-30s18-13 30-13zM384 683h85v85c0 24 19 43 43 43s43-19 43-43v-85h85c24 0 43-19 43-43s-19-43-43-43h-85v-85c0-24-19-43-43-43s-43 19-43 43v85h-85c-24 0-43 19-43 43s19 43 43 43z",fileText:"M750 299h-110v-110zM883 311l-256-256c-4-4-9-7-14-9s-11-3-16-3h-341c-35 0-67 14-90 38s-38 55-38 90v683c0 35 14 67 38 90s55 38 90 38h512c35 0 67-14 90-38s38-55 38-90v-512c0-12-5-22-13-30zM555 128v213c0 24 19 43 43 43h213v469c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22-5-30-13s-13-18-13-30v-683c0-12 5-22 13-30s18-13 30-13zM683 512h-341c-24 0-43 19-43 43s19 43 43 43h341c24 0 43-19 43-43s-19-43-43-43zM683 683h-341c-24 0-43 19-43 43s19 43 43 43h341c24 0 43-19 43-43s-19-43-43-43zM427 341h-85c-24 0-43 19-43 43s19 43 43 43h85c24 0 43-19 43-43s-19-43-43-43z",filter:"M847 171l-282 333c-6 7-10 17-10 28v295l-85-43v-253c0-10-3-19-10-28l-282-333zM939 85h-853c-24 0-43 19-43 43 0 11 4 20 10 28l331 392v263c0 17 9 31 24 38l171 85c21 11 47 2 57-19 3-6 5-13 4-19v-349l331-392c15-18 13-45-5-60-8-7-18-10-28-10z",flag:"M213 572v-421c19-9 58-23 128-23 55 0 101 18 155 40 53 21 113 46 186 46 55 0 97-7 128-17v421c-19 9-58 23-128 23-55 0-101-18-155-40-53-21-113-46-186-46-55 0-97 7-128 17zM213 939v-276c19-9 58-23 128-23 55 0 101 18 155 40 53 21 113 46 186 46 139 0 192-47 201-55 8-8 13-19 13-30v-512c0-24-19-43-43-43-11 0-22 4-29 12-4 3-42 31-141 31-55 0-101-18-155-40-53-21-113-46-186-46-139 0-192 47-201 55-8 8-13 19-13 30v811c0 24 19 43 43 43s43-19 43-43z",folder:"M981 811v-469c0-35-14-67-38-90s-55-38-90-38h-361l-73-109c-8-12-21-19-35-19h-213c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h683c35 0 67-14 90-38s38-55 38-90zM896 811c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h191l73 109c8 12 22 19 35 19h384c12 0 22 5 30 13s13 18 13 30z",folderMinus:"M981 811v-469c0-35-14-67-38-90s-55-38-90-38h-361l-73-109c-8-12-21-19-35-19h-213c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h683c35 0 67-14 90-38s38-55 38-90zM896 811c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h191l73 109c8 12 22 19 35 19h384c12 0 22 5 30 13s13 18 13 30zM384 640h256c24 0 43-19 43-43s-19-43-43-43h-256c-24 0-43 19-43 43s19 43 43 43z",folderPlus:"M981 811v-469c0-35-14-67-38-90s-55-38-90-38h-361l-73-109c-8-12-21-19-35-19h-213c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h683c35 0 67-14 90-38s38-55 38-90zM896 811c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h191l73 109c8 12 22 19 35 19h384c12 0 22 5 30 13s13 18 13 30zM384 640h85v85c0 24 19 43 43 43s43-19 43-43v-85h85c24 0 43-19 43-43s-19-43-43-43h-85v-85c0-24-19-43-43-43s-43 19-43 43v85h-85c-24 0-43 19-43 43s19 43 43 43z",help:"M981 512c0-130-53-247-137-332s-202-137-332-137-247 53-332 137-137 202-137 332 53 247 137 332 202 137 332 137 247-53 332-137 137-202 137-332zM896 512c0 106-43 202-112 272s-165 112-272 112-202-43-272-112-112-165-112-272 43-202 112-272 165-112 272-112 202 43 272 112 112 165 112 272zM428 398c8-22 24-39 44-49s43-11 65-4c20 7 35 20 45 37 8 13 12 28 12 44 0 7-2 13-5 20-3 7-9 14-16 21-30 30-78 47-78 47-22 7-34 32-27 54s32 34 54 27c0 0 66-22 111-67 12-12 23-26 32-43 9-17 14-37 14-58-0-31-9-61-24-87-20-33-51-60-90-74-44-16-91-12-130 7s-72 53-87 97c-8 22 4 47 26 54s47-4 54-26zM512 768c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",home:"M102 350c-10 8-16 20-16 34v469c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-469c-0-13-6-25-16-34l-384-299c-15-12-37-12-52 0zM683 896v-384c0-24-19-43-43-43h-256c-24 0-43 19-43 43v384h-128c-12 0-22-5-30-13s-13-18-13-30v-448l341-265 341 265v448c0 12-5 22-13 30s-18 13-30 13zM427 896v-341h171v341z",image:"M213 85c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-597c0-35-14-67-38-90s-55-38-90-38zM469 363c0-29-12-56-31-75s-46-31-75-31-56 12-75 31-31 46-31 75 12 56 31 75 46 31 75 31 56-12 75-31 31-46 31-75zM384 363c0 6-2 11-6 15s-9 6-15 6-11-2-15-6-6-9-6-15 2-11 6-15 9-6 15-6 11 2 15 6 6 9 6 15zM316 853l366-366 171 171v153c0 12-5 22-13 30s-18 13-30 13zM853 537l-141-141c-17-17-44-17-60 0l-454 454c-6-2-11-6-15-10-8-8-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h597c12 0 22 5 30 13s13 18 13 30z",layers:"M512 133l331 166-331 166-331-166zM493 47l-427 213c-21 11-30 36-19 57 4 9 11 15 19 19l427 213c12 6 26 6 38 0l427-213c21-11 30-36 19-57-4-9-11-15-19-19l-427-213c-12-6-26-6-38 0zM66 763l427 213c12 6 26 6 38 0l427-213c21-11 30-36 19-57s-36-30-57-19l-408 204-408-204c-21-11-47-2-57 19s-2 47 19 57zM66 550l427 213c12 6 26 6 38 0l427-213c21-11 30-36 19-57s-36-30-57-19l-408 204-408-204c-21-11-47-2-57 19s-2 47 19 57z",link:"M392 580c42 57 104 91 168 100s133-6 190-48c10-8 20-16 28-24l128-128c50-51 73-117 72-183s-27-131-78-180c-50-48-115-72-179-72-64 0-127 24-177 72l-74 73c-17 17-17 44-0 60s44 17 60 0l73-72c33-32 75-48 118-48 43-0 86 16 119 48 34 33 51 76 52 120s-15 88-47 121l-128 128c-5 5-11 11-18 16-38 28-83 38-127 32s-84-29-112-67c-14-19-41-23-60-9s-23 41-9 60zM632 444c-42-57-104-91-168-100s-133 6-190 48c-10 8-20 16-28 24l-128 128c-50 51-73 117-72 183s27 131 78 180c50 48 115 72 179 72 64-0 127-24 177-72l74-74c17-17 17-44 0-60s-44-17-60 0l-72 72c-33 32-75 48-118 48-43 0-86-16-119-48-34-33-51-76-52-120s15-88 47-121l128-128c5-5 11-11 18-16 38-28 83-38 127-32s84 29 112 67c14 19 41 23 60 9s23-41 9-60z",lock:"M213 512h597c12 0 22 5 30 13s13 18 13 30v299c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-299c0-12 5-22 13-30s18-13 30-13zM768 427v-128c0-71-29-135-75-181s-110-75-181-75-135 29-181 75-75 110-75 181v128h-43c-35 0-67 14-90 38s-38 55-38 90v299c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-299c0-35-14-67-38-90s-55-38-90-38zM341 427v-128c0-47 19-90 50-121s74-50 121-50 90 19 121 50 50 74 50 121v128z",logIn:"M640 171h171c12 0 22 5 30 13s13 18 13 30v597c0 12-5 22-13 30s-18 13-30 13h-171c-24 0-43 19-43 43s19 43 43 43h171c35 0 67-14 90-38s38-55 38-90v-597c0-35-14-67-38-90s-55-38-90-38h-171c-24 0-43 19-43 43s19 43 43 43zM537 469h-409c-24 0-43 19-43 43s19 43 43 43h409l-141 141c-17 17-17 44 0 60s44 17 60 0l213-213c4-4 7-9 9-14s3-11 3-16c0-6-1-11-3-16-2-5-5-10-9-14l-213-213c-17-17-44-17-60 0s-17 44 0 60z",logOut:"M384 853h-171c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h171c24 0 43-19 43-43s-19-43-43-43h-171c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h171c24 0 43-19 43-43s-19-43-43-43zM793 469h-409c-24 0-43 19-43 43s19 43 43 43h409l-141 141c-17 17-17 44 0 60s44 17 60 0l213-213c4-4 7-9 9-14 6-15 3-34-9-47l-213-213c-17-17-44-17-60 0s-17 44 0 60z",map:"M299 159v584l-213 122v-584zM725 865v-584l213-122v584zM663 976c3 2 7 3 11 4 1 0 3 1 4 1s3 0 4 0c-0 0-0 0-0 0s0 0 0 0c7 0 15-2 21-6l1-0 298-170c14-8 21-22 21-37v-683c0-24-19-43-43-43-8 0-15 2-21 6l-279 159-320-160c-4-2-7-3-11-4-1-0-3-1-4-1s-3-0-4-0c0 0 0 0 0 0s0 0-0 0c-7 0-15 2-21 6l-1 0-298 170c-14 8-21 22-22 37v683c0 24 19 43 43 43 8 0 15-2 21-6l279-159zM640 282v587l-256-128v-587z",mapPin:"M939 427c0-118-48-225-125-302s-184-125-302-125-225 48-302 125-125 184-125 302c0 24 2 48 6 72 12 66 38 128 72 184 117 196 325 334 325 334 14 9 33 10 47 0 0 0 208-138 325-334 33-56 60-118 72-184 4-23 6-47 6-72zM853 427c0 19-2 38-5 57-9 53-31 106-61 156-82 137-215 245-272 288-60-39-196-148-279-288-30-50-52-102-61-156-3-19-5-38-5-57 0-94 38-180 100-241s147-100 241-100 180 38 241 100 100 147 100 241zM683 427c0-47-19-90-50-121s-74-50-121-50-90 19-121 50-50 74-50 121 19 90 50 121 74 50 121 50 90-19 121-50 50-74 50-121zM597 427c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60 10-45 25-60 37-25 60-25 45 10 60 25 25 37 25 60z",maximize:"M341 85h-128c-35 0-67 14-90 38s-38 55-38 90v128c0 24 19 43 43 43s43-19 43-43v-128c0-12 5-22 13-30s18-13 30-13h128c24 0 43-19 43-43s-19-43-43-43zM939 341v-128c0-35-14-67-38-90s-55-38-90-38h-128c-24 0-43 19-43 43s19 43 43 43h128c12 0 22 5 30 13s13 18 13 30v128c0 24 19 43 43 43s43-19 43-43zM683 939h128c35 0 67-14 90-38s38-55 38-90v-128c0-24-19-43-43-43s-43 19-43 43v128c0 12-5 22-13 30s-18 13-30 13h-128c-24 0-43 19-43 43s19 43 43 43zM85 683v128c0 35 14 67 38 90s55 38 90 38h128c24 0 43-19 43-43s-19-43-43-43h-128c-12 0-22-5-30-13s-13-18-13-30v-128c0-24-19-43-43-43s-43 19-43 43z",messageCircle:"M939 491v-21c0-1-0-2-0-2-6-100-47-190-113-258-68-71-163-117-269-123-1-0-2-0-2-0h-21c-60-1-123 13-182 43-52 26-98 63-134 108-56 70-90 158-90 254-1 54 11 111 35 165l-76 227c-3 8-3 18 0 27 7 22 32 34 54 27l227-76c49 22 106 35 165 35 59-0 116-13 168-37 82-37 151-101 194-187 27-53 43-116 43-182zM853 491c0 52-12 101-34 142-34 68-89 119-153 148-41 19-87 29-133 29-52 0-101-12-142-34-11-6-23-6-33-3l-162 54 54-162c4-11 3-23-2-33-24-47-34-96-34-142 0-76 26-146 71-201 29-35 65-65 106-86 47-24 96-34 142-34h19c84 5 158 41 212 97 51 53 84 124 89 203z",mic:"M512 85c24 0 45 10 60 25s25 37 25 60v341c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60v-341c0-24 10-45 25-60s37-25 60-25zM512 0c-47 0-90 19-121 50s-50 74-50 121v341c0 47 19 90 50 121s74 50 121 50 90-19 121-50 50-74 50-121v-341c0-47-19-90-50-121s-74-50-121-50zM341 1024h341c24 0 43-19 43-43s-19-43-43-43h-128v-88c77-10 146-45 199-97 62-62 100-147 100-241v-85c0-24-19-43-43-43s-43 19-43 43v85c0 71-29 135-75 181s-110 75-181 75-135-29-181-75-75-110-75-181v-85c0-24-19-43-43-43s-43 19-43 43v85c0 94 38 180 100 241 52 52 121 88 199 97v88h-128c-24 0-43 19-43 43s19 43 43 43z",micOff:"M534 594c-7 2-14 3-22 3-24-0-45-10-60-25-15-15-25-37-25-60v-25zM683 399v-228c0-47-19-90-50-121s-74-50-121-50c-43-0-83 16-113 43-27 24-47 57-54 94-5 23 10 46 33 50s46-10 50-33c4-19 14-35 27-47 15-13 34-21 56-21 24 0 45 10 61 25 15 16 25 37 25 60v228c0 24 19 43 43 43s43-19 43-43zM768 427v85c0 16-1 32-4 45-4 23 11 45 34 50s45-11 50-34c3-19 5-39 5-60v-85c0-24-19-43-43-43s-43 19-43 43zM341 1024h341c24 0 43-19 43-43s-19-43-43-43h-128v-86c62-8 119-31 168-69l229 229c17 17 44 17 60 0s17-44 0-60l-249-249c-2-3-4-7-7-9-3-3-6-5-9-7l-674-674c-17-17-44-17-60 0s-17 44 0 60l329 329v110c0 47 19 90 50 121s74 50 121 50c32-0 61-9 86-24l63 63c-41 30-89 46-137 48-4-1-8-2-13-2-4 0-9 1-13 2-60-3-120-27-167-73-49-48-75-111-77-175-0-5-0-10-0-10v-86c0-24-19-43-43-43s-43 19-43 43v85c0 6 0 13 0 13 3 85 37 169 102 234 55 54 125 86 196 95v86h-128c-24 0-43 19-43 43s19 43 43 43z",minimize:"M299 128v128c0 12-5 22-13 30s-18 13-30 13h-128c-24 0-43 19-43 43s19 43 43 43h128c35 0 67-14 90-38s38-55 38-90v-128c0-24-19-43-43-43s-43 19-43 43zM896 299h-128c-12 0-22-5-30-13s-13-18-13-30v-128c0-24-19-43-43-43s-43 19-43 43v128c0 35 14 67 38 90s55 38 90 38h128c24 0 43-19 43-43s-19-43-43-43zM725 896v-128c0-12 5-22 13-30s18-13 30-13h128c24 0 43-19 43-43s-19-43-43-43h-128c-35 0-67 14-90 38s-38 55-38 90v128c0 24 19 43 43 43s43-19 43-43zM128 725h128c12 0 22 5 30 13s13 18 13 30v128c0 24 19 43 43 43s43-19 43-43v-128c0-35-14-67-38-90s-55-38-90-38h-128c-24 0-43 19-43 43s19 43 43 43z",minus:"M213 555h597c24 0 43-19 43-43s-19-43-43-43h-597c-24 0-43 19-43 43s19 43 43 43z",moon:"M938 550c1-10-2-20-8-29-14-19-41-23-60-9-41 30-88 46-136 50-58 4-118-12-169-49-57-42-91-103-101-168s5-133 47-190c6-8 9-19 8-29-2-23-23-41-47-38-96 9-184 50-252 113-74 69-124 164-134 272-11 117 27 228 97 312s172 141 289 152 228-27 312-97 141-172 152-289zM835 626c-21 58-57 109-103 147-67 56-156 86-250 77s-175-55-231-122-86-156-77-250c8-87 48-163 107-218 33-31 73-55 117-71-19 54-25 111-16 166 13 86 59 168 135 224 67 50 147 71 225 66 32-2 64-9 94-20z",more:"M597 512c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60zM896 512c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60zM299 512c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60z",moreVertical:"M597 512c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60zM597 213c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60zM597 811c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60z",mousePointer:"M207 207l524 218-208 71c-12 4-22 14-27 27l-71 208zM555 615l225 225c17 17 44 17 60 0s17-44 0-60l-225-225 250-85c22-8 34-32 27-54-4-12-13-21-24-26l-724-302c-22-9-47 1-56 23-5 11-4 23 0 33l302 724c9 22 34 32 56 23 12-5 20-14 24-26z",move:"M469 188v281h-281l55-55c17-17 17-44 0-60s-44-17-60 0l-128 128c-8 8-13 18-13 30 0 6 1 11 3 16s5 10 9 14l128 128c17 17 44 17 60 0s17-44 0-60l-55-55h281v281l-55-55c-17-17-44-17-60 0s-17 44 0 60l128 128c4 4 9 7 14 9s11 3 16 3c6 0 11-1 16-3 5-2 10-5 14-9l128-128c17-17 17-44 0-60s-44-17-60 0l-55 55v-281h281l-55 55c-17 17-17 44 0 60s44 17 60 0l128-128c4-4 7-9 9-14 6-15 3-34-9-47l-128-128c-17-17-44-17-60 0s-17 44 0 60l55 55h-281v-281l55 55c17 17 44 17 60 0s17-44 0-60l-128-128c-4-4-9-7-14-9-10-4-22-4-33 0-5 2-10 5-14 9l-128 128c-17 17-17 44 0 60s44 17 60 0z",music:"M341 768c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60 10-45 25-60 37-25 60-25 45 10 60 25 25 37 25 60zM939 683v-555c0-2-0-5-1-7-4-23-26-39-49-35l-512 85c-20 3-36 21-36 42v407c-25-15-54-23-85-23-47 0-90 19-121 50s-50 74-50 121 19 90 50 121 74 50 121 50 90-19 121-50 50-74 50-121v-519l427-71v356c-25-15-54-23-85-23-47 0-90 19-121 50s-50 74-50 121 19 90 50 121 74 50 121 50 90-19 121-50 50-74 50-121zM853 683c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60 10-45 25-60 37-25 60-25 45 10 60 25 25 37 25 60z",paperclip:"M885 441l-392 392c-42 42-96 63-151 63s-109-21-151-63-63-96-63-151 21-109 63-151l392-392c25-25 58-38 91-38s66 13 91 38 38 58 38 91-13 66-38 91l-393 392c-8 8-19 13-30 13s-22-4-30-13-13-19-13-30 4-22 13-30l362-362c17-17 17-44 0-60s-44-17-60-0l-362 362c-25 25-38 58-38 91s13 66 38 91 58 38 91 38 66-13 91-38l393-392c42-42 63-96 63-151s-21-109-63-151-96-63-151-63-109 21-151 63l-392 392c-58 58-88 135-88 211s29 153 88 211 135 88 211 88 153-29 211-88l392-392c17-17 17-44 0-60s-44-17-60 0z",pause:"M256 128c-24 0-43 19-43 43v683c0 24 19 43 43 43h171c24 0 43-19 43-43v-683c0-24-19-43-43-43zM299 213h85v597h-85zM597 128c-24 0-43 19-43 43v683c0 24 19 43 43 43h171c24 0 43-19 43-43v-683c0-24-19-43-43-43zM640 213h85v597h-85z",play:"M236 92c-7-4-15-7-23-7-24 0-43 19-43 43v768c-0 8 2 16 7 23 13 20 39 26 59 13l597-384c5-3 9-7 13-13 13-20 7-46-13-59zM256 206l476 306-476 306z",plus:"M213 555h256v256c0 24 19 43 43 43s43-19 43-43v-256h256c24 0 43-19 43-43s-19-43-43-43h-256v-256c0-24-19-43-43-43s-43 19-43 43v256h-256c-24 0-43 19-43 43s19 43 43 43z",refresh:"M190 398c31-89 96-157 175-194s172-45 261-14c51 18 94 46 127 80l121 113h-148c-24 0-43 19-43 43s19 43 43 43h256c0 0 0 0 1 0 6-0 11-1 16-3 5-2 10-5 14-10 1-1 1-1 2-2 3-4 6-8 7-12s3-9 3-14c0-1 0-1 0-2v-256c0-24-19-43-43-43s-43 19-43 43v157l-125-117c-42-43-97-79-160-101-111-39-228-30-326 17s-179 132-218 243c-8 22 4 47 26 54s47-4 54-26zM85 696l126 118c82 82 192 124 301 124s218-42 302-125c47-47 81-103 101-160 8-22-4-47-26-54s-47 4-54 26c-15 45-42 89-80 127-67 67-154 100-241 100s-175-33-242-101l-119-112h148c24 0 43-19 43-43s-19-43-43-43h-256c-0 0-0 0-1 0-6 0-11 1-16 3-5 2-10 5-14 10-1 1-1 1-2 2-3 4-6 8-7 12s-3 9-3 14c-0 1-0 1-0 2v256c0 24 19 43 43 43s43-19 43-43z",rewind:"M427 723l-272-211 272-211zM912 844c7 6 16 9 26 9 24 0 43-19 43-43v-597c0-9-3-18-9-26-14-19-41-22-60-7l-384 299c-3 2-5 5-7 7-6 8-9 17-9 26v-298c0-9-3-18-9-26-14-19-41-22-60-7l-384 299c-3 2-5 5-7 7-14 19-11 45 7 60l384 299c7 6 16 9 26 9 24 0 43-19 43-43v-298c0 13 6 25 16 33zM896 723l-272-211 272-211z",settings:"M683 512c0-47-19-90-50-121s-74-50-121-50-90 19-121 50-50 74-50 121 19 90 50 121 74 50 121 50 90-19 121-50 50-74 50-121zM597 512c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60 10-45 25-60 37-25 60-25 45 10 60 25 25 37 25 60zM867 657c2-4 5-8 8-11 5-4 11-6 17-6h4c35 0 67-14 90-38s38-55 38-90-14-67-38-90-55-38-90-38h-7c-5-0-9-1-13-3-5-3-10-7-12-13-0-1-0-3-0-4-1-2-2-5-2-7 1-14 3-19 7-23l3-3c25-25 37-58 37-91s-13-66-38-91c-25-25-58-37-91-37s-66 13-90 38l-2 2c-4 3-8 6-12 7-6 2-12 1-19-1-4-2-8-5-11-8-4-5-6-11-6-17v-4c0-35-14-67-38-90s-55-38-90-38-67 14-90 38-38 55-38 90v7c-0 5-1 9-3 13-3 5-7 10-13 12-1 0-3 0-4 0-2 1-5 2-7 2-14-1-19-3-23-7l-3-3c-25-25-58-37-91-37s-65 13-91 38c-25 25-37 58-37 91s13 66 38 90l2 2c3 4 6 8 7 12 2 6 1 12-1 19-0 1-1 1-1 2-2 5-5 9-8 12-5 4-11 7-16 7h-4c-35 0-67 14-90 38s-38 55-38 91 14 67 38 90 55 38 90 38h7c5 0 9 1 13 3 5 3 10 7 13 14 1 2 2 5 2 7-1 14-3 19-7 23l-3 3c-25 25-37 58-37 91s13 66 38 91c25 25 58 37 91 37s66-13 90-38l2-2c4-3 8-6 12-7 6-2 12-1 19 1 1 0 1 1 2 1 5 2 9 5 12 8 4 5 7 11 7 16v4c0 35 14 67 38 90s55 38 90 38 67-14 90-38 38-55 38-90v-7c0-5 1-9 3-13 3-5 7-10 14-13 2-1 5-2 7-2 14 1 19 3 23 7l3 3c25 25 58 37 91 37s66-13 91-38c25-25 37-58 37-91s-13-66-38-90l-2-2c-3-4-6-8-7-12-2-6-1-12 1-19zM785 397c-1-9-2-13-3-16v3c0 2 0 4 0 5 1 3 2 5 3 8 0 4 0 4 0 4 11 25 29 44 52 56 16 8 33 13 52 13h8c12 0 22 5 30 13s13 18 13 30-5 22-13 30-18 13-30 13h-4c-27 0-52 10-71 26-14 11-25 26-32 42-11 25-12 52-5 76 5 18 15 35 28 48l3 3c8 8 13 19 13 30s-4 22-12 30c-8 8-19 13-30 13s-22-4-30-12l-3-3c-20-19-44-30-70-32-19-2-38 1-55 9-25 11-44 29-55 51-8 16-13 33-13 52v8c0 12-5 22-13 30s-18 12-30 12-22-5-30-13-13-18-13-30v-4c-1-28-11-53-27-72-12-14-28-25-45-32-25-11-51-12-75-5-18 5-35 15-48 28l-3 3c-8 8-19 13-30 13s-22-4-30-12c-8-8-13-19-13-30s4-22 12-30l3-3c19-20 30-44 32-70 2-19-1-38-9-55-11-25-29-44-51-55-16-8-33-13-52-13l-8 0c-12 0-22-5-30-13s-13-18-13-30 5-22 13-30 18-13 30-13h4c28-1 53-11 72-27 14-12 25-28 32-45 11-25 12-51 5-75-5-18-15-35-28-48l-3-3c-8-8-13-19-13-30s4-22 12-30c8-8 19-13 30-13s22 4 30 12l3 3c20 19 44 30 70 32 16 1 32-1 47-6 4-1 8-2 11-3-1 0-3 0-4 0-9 1-13 2-16 3h3c2 0 4-0 5-0 3-1 5-2 8-3 4-0 4-0 4-0 25-11 44-29 56-52 8-16 13-33 13-52v-8c0-12 5-22 13-30s18-13 30-13 22 5 30 13 13 18 13 30v4c0 27 10 52 26 71 11 14 26 25 42 32 25 11 51 12 76 5 18-5 35-15 48-28l3-3c8-8 19-13 30-13s22 4 30 12c8 8 13 19 13 30s-4 22-12 30l-3 3c-19 20-30 44-32 70-1 16 1 32 6 47 1 4 2 8 3 11-0-1-0-3-0-4z",share:"M128 512v341c0 35 14 67 38 90s55 38 90 38h512c35 0 67-14 90-38s38-55 38-90v-341c0-24-19-43-43-43s-43 19-43 43v341c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22-5-30-13s-13-18-13-30v-341c0-24-19-43-43-43s-43 19-43 43zM469 188v452c0 24 19 43 43 43s43-19 43-43v-452l98 98c17 17 44 17 60 0s17-44 0-60l-171-171c-4-4-9-7-14-9-10-4-22-4-33 0-5 2-10 5-14 9l-171 171c-17 17-17 44 0 60s44 17 60 0z",start:"M784 887c7 6 17 9 27 9 24 0 43-19 43-43v-683c0-9-3-19-9-27-15-18-42-21-60-7l-427 341c-2 2-5 4-7 7-15 18-12 45 7 60zM768 765l-316-253 316-253zM256 811v-597c0-24-19-43-43-43s-43 19-43 43v597c0 24 19 43 43 43s43-19 43-43z",end:"M240 137c-7-6-17-9-27-9-24 0-43 19-43 43v683c-0 9 3 19 9 27 15 18 42 21 60 7l427-341c2-2 5-4 7-7 15-18 12-45-7-60zM256 259l316 253-316 253zM768 213v597c0 24 19 43 43 43s43-19 43-43v-597c0-24-19-43-43-43s-43 19-43 43z",forbidden:"M981 512c0-130-53-247-137-332s-202-137-332-137-247 53-332 137-137 202-137 332 53 247 137 332 202 137 332 137 247-53 332-137 137-202 137-332zM812 752l-540-540c66-53 149-84 240-84 106 0 202 43 272 112s112 165 112 272c0 91-31 174-84 240zM212 272l540 540c-66 53-149 84-240 84-106 0-202-43-272-112s-112-165-112-272c0-91 31-174 84-240z",square:"M213 85c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-597c0-35-14-67-38-90s-55-38-90-38zM213 171h597c12 0 22 5 30 13s13 18 13 30v597c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13z",star:"M550 66c-4-8-11-15-19-19-21-10-47-2-57 19l-122 247-273 40c-9 1-18 5-24 12-16 17-16 44 1 60l197 192-47 271c-2 9-0 18 4 27 11 21 37 29 58 18l244-128 244 128c8 4 17 6 27 4 23-4 39-26 35-49l-47-271 197-192c6-6 11-15 12-24 3-23-13-45-36-48l-273-40-122-247z",sun:"M768 512c0-71-29-135-75-181s-110-75-181-75-135 29-181 75-75 110-75 181 29 135 75 181 110 75 181 75 135-29 181-75 75-110 75-181zM683 512c0 47-19 90-50 121s-74 50-121 50-90-19-121-50-50-74-50-121 19-90 50-121 74-50 121-50 90 19 121 50 50 74 50 121zM469 43v85c0 24 19 43 43 43s43-19 43-43v-85c0-24-19-43-43-43s-43 19-43 43zM469 896v85c0 24 19 43 43 43s43-19 43-43v-85c0-24-19-43-43-43s-43 19-43 43zM150 210l61 61c17 17 44 17 60 0s17-44 0-60l-61-61c-17-17-44-17-60 0s-17 44 0 60zM753 814l61 61c17 17 44 17 60 0s17-44 0-60l-61-61c-17-17-44-17-60 0s-17 44 0 60zM43 555h85c24 0 43-19 43-43s-19-43-43-43h-85c-24 0-43 19-43 43s19 43 43 43zM896 555h85c24 0 43-19 43-43s-19-43-43-43h-85c-24 0-43 19-43 43s19 43 43 43zM210 874l61-61c17-17 17-44 0-60s-44-17-60 0l-61 61c-17 17-17 44 0 60s44 17 60 0zM814 271l61-61c17-17 17-44 0-60s-44-17-60 0l-61 61c-17 17-17 44 0 60s44 17 60 0z",tag:"M909 602c25-25 37-58 37-90 0-33-12-65-37-90l-367-367c-8-8-18-12-30-12h-427c-24 0-43 19-43 43v427c0 11 4 22 13 30l367 366c25 25 58 37 91 37s66-13 90-38zM848 542l-306 306c-8 8-19 13-30 13s-22-4-30-12l-354-354v-366h366l354 354c8 8 12 19 12 30 0 11-4 22-12 30zM299 341c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",terminal:"M201 755l256-256c17-17 17-44 0-60l-256-256c-17-17-44-17-60 0s-17 44 0 60l226 226-226 226c-17 17-17 44 0 60s44 17 60 0zM512 853h341c24 0 43-19 43-43s-19-43-43-43h-341c-24 0-43 19-43 43s19 43 43 43z",thumbsDown:"M469 640c0-24-19-43-43-43h-242c-3-0-7-0-7-0-12-2-21-8-28-17s-10-20-8-32l59-384c2-10 7-19 14-26 8-7 18-11 29-11h439v418l-154 346c-13-4-25-11-34-21-15-15-25-37-25-60zM384 683v128c0 47 19 90 50 121s74 50 121 50c17 0 32-10 39-25l171-384c3-6 4-12 4-17v-469c0-24-19-43-43-43h-481c-33-0-63 12-86 33-22 19-37 46-41 76l-59 384c-5 35 4 69 23 95s49 45 84 51c7 1 14 2 21 1zM725 128h114c15-0 29 5 39 14 9 8 16 19 18 32v290c-2 15-9 27-19 36-10 8-23 13-37 13l-115 0c-24 0-43 19-43 43s19 43 43 43h113c35 1 67-12 92-32 27-22 45-53 50-90 0-2 0-4 0-6v-299c0-2-0-4-0-6-5-34-22-64-46-86-26-23-60-37-96-36h-114c-24 0-43 19-43 43s19 43 43 43z",thumbsUp:"M555 384c0 24 19 43 43 43h242c3 0 7 0 7 0 12 2 21 8 28 17s10 20 8 32l-59 384c-2 10-7 19-14 26-8 7-18 11-29 11h-439v-418l154-346c13 4 25 11 34 21 15 15 25 37 25 60zM640 341v-128c0-47-19-90-50-121s-74-50-121-50c-17 0-32 10-39 25l-171 384c-3 6-4 12-4 17v469c0 24 19 43 43 43h481c33 0 63-12 86-33 22-19 37-46 41-76l59-384c5-35-4-69-23-95s-49-45-84-51c-7-1-14-2-21-1zM299 896h-128c-12 0-22-5-30-13s-13-18-13-30v-299c0-12 5-22 13-30s18-13 30-13h128c24 0 43-19 43-43s-19-43-43-43h-128c-35 0-67 14-90 38s-38 55-38 90v299c0 35 14 67 38 90s55 38 90 38h128c24 0 43-19 43-43s-19-43-43-43z",trash:"M768 299v555c0 12-5 22-13 30s-18 13-30 13h-427c-12 0-22-5-30-13s-13-18-13-30v-555zM725 213v-43c0-35-14-67-38-90s-55-38-90-38h-171c-35 0-67 14-90 38s-38 55-38 90v43h-171c-24 0-43 19-43 43s19 43 43 43h43v555c0 35 14 67 38 90s55 38 90 38h427c35 0 67-14 90-38s38-55 38-90v-555h43c24 0 43-19 43-43s-19-43-43-43zM384 213v-43c0-12 5-22 13-30s18-13 30-13h171c12 0 22 5 30 13s13 18 13 30v43z",unlock:"M213 512h597c12 0 22 5 30 13s13 18 13 30v299c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-299c0-12 5-22 13-30s18-13 30-13zM341 427v-128c-0-47 19-90 50-121 31-31 73-50 120-50 44 0 83 16 113 43 27 24 47 57 55 94 5 23 27 38 50 33s38-27 33-50c-12-56-41-105-82-141-45-40-105-64-170-64-71 0-135 29-181 75s-75 110-75 181v128h-43c-35 0-67 14-90 38s-38 55-38 90v299c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-299c0-35-14-67-38-90s-55-38-90-38z",upload:"M853 640v171c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-171c0-24-19-43-43-43s-43 19-43 43v171c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-171c0-24-19-43-43-43s-43 19-43 43zM469 231v409c0 24 19 43 43 43s43-19 43-43v-409l141 141c17 17 44 17 60 0s17-44 0-60l-213-213c-4-4-9-7-14-9-10-4-22-4-33 0-5 2-10 5-14 9l-213 213c-17 17-17 44 0 60s44 17 60 0z",uploadCloud:"M469 615v281c0 24 19 43 43 43s43-19 43-43v-281l98 98c17 17 44 17 60 0s17-44 0-60l-171-171c-4-4-9-7-14-9s-11-3-16-3c-11 0-22 4-30 13l-171 171c-17 17-17 44 0 60s44 17 60 0zM890 822c62-34 105-90 123-152s13-133-21-195c-29-53-74-92-126-114-31-13-64-20-98-20h-22c-31-88-91-158-167-203-85-50-188-67-291-41s-185 92-235 177-67 188-41 291c16 61 46 116 84 158 16 18 43 19 60 3s19-43 3-60c-29-33-53-75-65-123-21-80-7-160 32-226s103-117 183-138 160-7 226 32 117 103 138 183c5 19 22 32 41 32h53c23 0 45 5 66 13 35 14 65 40 84 76 23 41 26 88 14 130s-41 79-82 102c-21 11-28 37-17 58s37 28 58 17z",user:"M896 896v-85c0-59-24-112-62-151s-92-62-151-62h-341c-59 0-112 24-151 62s-62 92-62 151v85c0 24 19 43 43 43s43-19 43-43v-85c0-35 14-67 38-90s55-38 90-38h341c35 0 67 14 90 38s38 55 38 90v85c0 24 19 43 43 43s43-19 43-43zM725 299c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM640 299c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90z",userMinus:"M725 896v-85c0-59-24-112-62-151s-92-62-151-62h-299c-59 0-112 24-151 62s-62 92-62 151v85c0 24 19 43 43 43s43-19 43-43v-85c0-35 14-67 38-90s55-38 90-38h299c35 0 67 14 90 38s38 55 38 90v85c0 24 19 43 43 43s43-19 43-43zM576 299c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM491 299c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90zM981 427h-256c-24 0-43 19-43 43s19 43 43 43h256c24 0 43-19 43-43s-19-43-43-43z",userPlus:"M725 896v-85c0-59-24-112-62-151s-92-62-151-62h-299c-59 0-112 24-151 62s-62 92-62 151v85c0 24 19 43 43 43s43-19 43-43v-85c0-35 14-67 38-90s55-38 90-38h299c35 0 67 14 90 38s38 55 38 90v85c0 24 19 43 43 43s43-19 43-43zM576 299c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM491 299c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90zM981 427h-85v-85c0-24-19-43-43-43s-43 19-43 43v85h-85c-24 0-43 19-43 43s19 43 43 43h85v85c0 24 19 43 43 43s43-19 43-43v-85h85c24 0 43-19 43-43s-19-43-43-43z",userX:"M725 896v-85c0-59-24-112-62-151s-92-62-151-62h-299c-59 0-112 24-151 62s-62 92-62 151v85c0 24 19 43 43 43s43-19 43-43v-85c0-35 14-67 38-90s55-38 90-38h299c35 0 67 14 90 38s38 55 38 90v85c0 24 19 43 43 43s43-19 43-43zM576 299c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM491 299c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90zM951 311l-77 77-77-77c-17-17-44-17-60 0s-17 44 0 60l77 77-77 77c-17 17-17 44 0 60s44 17 60 0l77-77 77 77c17 17 44 17 60 0s17-44 0-60l-77-77 77-77c17-17 17-44 0-60s-44-17-60 0z",users:"M768 896v-85c0-59-24-112-62-151s-92-62-151-62h-341c-59 0-112 24-151 62s-62 92-62 151v85c0 24 19 43 43 43s43-19 43-43v-85c0-35 14-67 38-90s55-38 90-38h341c35 0 67 14 90 38s38 55 38 90v85c0 24 19 43 43 43s43-19 43-43zM597 299c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM512 299c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90zM1024 896v-85c-0-53-19-102-52-139-28-32-65-56-108-67-23-6-46 8-52 30s8 46 30 52c26 7 48 21 65 41 19 22 31 51 31 83v85c0 24 19 43 43 43s43-19 43-43zM672 175c34 9 62 31 78 59s23 63 14 97c-8 29-25 54-47 70-13 10-29 17-45 22-23 6-36 29-30 52s29 36 52 30c27-7 53-19 75-36 38-28 66-69 79-118 15-57 5-115-23-162s-74-83-131-98c-23-6-46 8-52 31s8 46 31 52z",video:"M939 382v261l-183-130zM128 171c-35 0-67 14-90 38s-38 55-38 90v427c0 35 14 67 38 90s55 38 90 38h469c35 0 67-14 90-38s38-55 38-90v-130l231 165c19 14 46 9 60-10 5-8 8-16 8-25v-427c0-24-19-43-43-43-9 0-18 3-25 8l-231 165v-130c0-35-14-67-38-90s-55-38-90-38zM128 256h469c12 0 22 5 30 13s13 18 13 30v427c0 12-5 22-13 30s-18 13-30 13h-469c-12 0-22-5-30-13s-13-18-13-30v-427c0-12 5-22 13-30s18-13 30-13z",videoOff:"M455 256h143c12 0 22 5 30 13s13 18 13 30v143c0 12 5 22 13 30l43 43c15 15 38 17 55 4l188-136v343c0 24 19 43 43 43s43-19 43-43v-427c0-9-3-17-8-25-14-19-40-23-60-10l-227 164-4-4v-125c0-35-14-67-38-90s-55-38-90-38h-143c-24 0-43 19-43 43s19 43 43 43zM196 256l444 444v25c0 12-5 22-13 30s-18 13-30 13h-469c-12 0-22-5-30-13s-13-18-13-30v-427c0-12 5-22 13-30s18-13 30-13zM13 73l99 99c-29 4-54 17-74 36-23 23-38 55-38 90v427c0 35 14 67 38 90s55 38 90 38h469c35 0 67-14 90-38 11-11 21-25 27-40l236 236c17 17 44 17 60 0s17-44 0-60l-939-939c-17-17-44-17-60 0s-17 44 0 60z",volume:"M427 302v420l-144-115c-7-6-17-9-27-9h-128v-171h128c9 0 19-3 27-9zM443 180l-202 161h-156c-24 0-43 19-43 43v256c0 24 19 43 43 43h156l202 161c18 15 45 12 60-7 6-8 9-17 9-27v-597c0-24-19-43-43-43-10 0-19 4-27 9z",volumeLow:"M427 302v420l-144-115c-7-6-17-9-27-9h-128v-171h128c9 0 19-3 27-9zM443 180l-202 161h-156c-24 0-43 19-43 43v256c0 24 19 43 43 43h156l202 161c18 15 45 12 60-7 6-8 9-17 9-27v-597c0-24-19-43-43-43-10 0-19 4-27 9zM633 391c33 33 50 77 50 121s-17 87-50 121c-17 17-17 44 0 60s44 17 60 0c50-50 75-116 75-181s-25-131-75-181c-17-17-44-17-60 0s-17 44 0 60z",volumeHigh:"M427 302v420l-144-115c-7-6-17-9-27-9h-128v-171h128c9 0 19-3 27-9zM443 180l-202 161h-156c-24 0-43 19-43 43v256c0 24 19 43 43 43h156l202 161c18 15 45 12 60-7 6-8 9-17 9-27v-597c0-24-19-43-43-43-10 0-19 4-27 9zM783 241c75 75 112 173 112 272 0 98-37 196-112 271-17 17-17 44 0 60s44 17 60 0c92-92 137-212 137-332 0-120-46-240-137-332-17-17-44-17-60 0s-17 44 0 60zM633 391c33 33 50 77 50 121s-17 87-50 121c-17 17-17 44 0 60s44 17 60 0c50-50 75-116 75-181s-25-131-75-181c-17-17-44-17-60 0s-17 44 0 60z",volumeOff:"M427 302v420l-144-115c-7-6-17-9-27-9h-128v-171h128c9 0 19-3 27-9zM443 180l-202 161h-156c-24 0-43 19-43 43v256c0 24 19 43 43 43h156l202 161c18 15 45 12 60-7 6-8 9-17 9-27v-597c0-24-19-43-43-43-10 0-19 4-27 9zM695 414l98 98-98 98c-17 17-17 44 0 60s44 17 60 0l98-98 98 98c17 17 44 17 60 0s17-44 0-60l-98-98 98-98c17-17 17-44 0-60s-44-17-60 0l-98 98-98-98c-17-17-44-17-60 0s-17 44 0 60z",wifi:"M241 568c84-70 186-102 287-98 92 3 184 36 259 98 18 15 45 12 60-6s12-45-6-60c-90-74-199-114-310-118-121-4-245 34-345 118-18 15-21 42-5 60s42 21 60 5zM89 416c125-110 282-163 437-159 147 3 293 57 410 160 18 16 45 14 60-4s14-45-4-60c-133-116-298-177-464-181-176-4-353 56-495 181-18 16-19 43-4 60s43 19 60 4zM389 722c42-30 92-42 140-39 38 3 75 16 108 39 19 14 46 9 59-10s9-46-10-59c-45-31-97-50-150-54-67-5-137 12-196 54-19 14-24 40-10 59s40 24 59 10zM512 896c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",wifiOff:"M695 510c34 16 64 37 88 57 18 15 45 13 60-4s13-45-4-60c-30-26-67-50-106-70-21-10-47-2-57 20s-2 47 20 57zM460 258c172-14 333 41 456 142 6 5 12 10 18 16 18 16 45 14 60-4s14-45-4-60c-7-6-14-12-21-18-140-114-323-177-517-161-23 2-41 22-39 46s22 41 46 39zM389 722c42-30 92-42 140-39 38 3 75 16 108 39 10 7 22 9 33 7l282 282c17 17 44 17 60 0s17-44 0-60l-544-544c-2-3-5-5-7-7l-387-387c-17-17-44-17-60 0s-17 44 0 60l174 174c-54 27-106 62-155 105-18 16-19 43-4 60s43 19 60 4c51-45 107-80 162-105l99 99c-58 19-114 50-164 92-18 15-20 42-5 60s42 20 60 5c54-45 116-75 179-88l119 119c-1-0-2-0-3-0-67-5-137 12-196 54-19 14-24 40-10 59s40 24 59 10zM512 896c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",x:"M226 286l226 226-226 226c-17 17-17 44 0 60s44 17 60 0l226-226 226 226c17 17 44 17 60 0s17-44 0-60l-226-226 226-226c17-17 17-44 0-60s-44-17-60 0l-226 226-226-226c-17-17-44-17-60 0s-17 44 0 60z",zoomIn:"M684 677c-1 1-3 2-4 4s-3 3-4 4c-54 52-127 84-207 84-82 0-157-33-211-87s-87-129-87-211 33-157 87-211 129-87 211-87 157 33 211 87 87 129 87 211c0 80-32 153-84 207zM926 866l-157-157c53-66 84-149 84-240 0-106-43-202-112-272s-166-112-272-112-202 43-272 112-112 166-112 272 43 202 112 272 166 112 272 112c91 0 174-31 240-84l157 157c17 17 44 17 60 0s17-44 0-60zM341 512h85v85c0 24 19 43 43 43s43-19 43-43v-85h85c24 0 43-19 43-43s-19-43-43-43h-85v-85c0-24-19-43-43-43s-43 19-43 43v85h-85c-24 0-43 19-43 43s19 43 43 43z",zoomOut:"M684 677c-1 1-3 2-4 4s-3 3-4 4c-54 52-127 84-207 84-82 0-157-33-211-87s-87-129-87-211 33-157 87-211 129-87 211-87 157 33 211 87 87 129 87 211c0 80-32 153-84 207zM926 866l-157-157c53-66 84-149 84-240 0-106-43-202-112-272s-166-112-272-112-202 43-272 112-112 166-112 272 43 202 112 272 166 112 272 112c91 0 174-31 240-84l157 157c17 17 44 17 60 0s17-44 0-60zM341 512h256c24 0 43-19 43-43s-19-43-43-43h-256c-24 0-43 19-43 43s19 43 43 43z",discord:{p:["M1145 86c-81-38-174-68-272-85l-7-1c-11 19-23 43-34 68l-2 5c-46-7-100-12-155-12s-108 4-160 12l6-1c-13-29-25-53-38-76l2 4c-105 18-198 48-286 89l7-3c-176 261-224 516-200 766v0c98 73 211 131 334 169l8 2c26-34 50-73 71-113l2-5c-45-17-83-35-119-57l3 2c10-7 19-14 28-21 100 48 218 76 342 76s242-28 347-78l-5 2c9 8 19 15 28 21-33 20-71 38-111 53l-5 2c23 45 47 84 75 120l-2-2c131-40 244-99 345-174l-3 2c28-291-48-543-201-767zM451 698c-67 0-122-60-122-135s53-135 121-135 123 61 122 135-54 135-122 135zM900 698c-67 0-122-60-122-135s53-135 122-135 123 61 121 135-54 135-121 135z"],w:1351},tiktok:"M535 1c56-1 111-0 167-1 3 65 27 132 75 178 48 47 115 69 181 76v172c-61-2-123-15-179-41-24-11-47-25-69-40-0 125 0 249-1 373-3 60-23 119-58 168-56 82-153 135-252 137-61 3-122-13-174-44-86-51-147-144-156-244-1-21-1-43-0-64 8-81 48-159 110-212 71-61 170-91 262-73 1 63-2 126-2 189-42-14-92-10-129 16-27 17-47 44-58 75-9 22-6 46-6 69 10 70 78 129 149 122 48-0 93-28 118-69 8-14 17-29 17-45 4-76 3-152 3-229 0-172-0-343 1-515z",xrColor:{p:["M801 116c-0-0-1-0-1-0-473 0-734 64-734 396 0 254 135 396 349 396s279-164 385-164c0 0 1-0 1-0 0 0 1 0 1 0 107 0 172 164 385 164s349-142 349-396c0-332-261-396-734-396-0 0-1 0-1 0 0 0-0 0-0 0z","M482 822c147-18 199-134 280-134 0 0 1-0 1-0 0 0 1 0 1 0 14 0 26 3 39 9 13-5 25-9 39-9 0 0 1-0 1-0 0 0 1 0 1 0 81 0 134 116 280 134 153-17 247-132 247-325 0-266-202-324-568-327-367 4-568 62-568 327 0 193 95 308 247 325z","M482 822c13 1 27 2 41 2 149-0 211-97 280-127-13-5-25-9-39-9-0 0-1-0-1-0-0 0-1 0-1 0-81 0-134 116-280 134z","M803 169c13-0 26-0 39-0 0 0 1 0 1 0 0 0 0 0 0 0 0-0 1-0 1-0 392 0 607 53 607 328 0 210-112 328-289 328-13-0-26-1-38-2 153-17 247-132 247-325 0-266-202-324-568-327 0 0 0 0 0 0z","M803 697c69 30 130 127 280 127 14 0 28-1 41-2-147-18-199-134-280-134-0 0-1-0-1-0-0 0-1 0-1 0-14 0-26 3-39 9z","M482 822c-12 1-25 2-38 2-177 0-289-118-289-328 0-275 216-328 607-328 0 0 1 0 1 0 0 0 0 0 0 0 0-0 1-0 1-0 13 0 26 0 39 0-367 4-568 62-568 327 0 193 95 308 247 325z","M929 246c0 0 6 0 6 0 18 7 11 3 22 12 3 3 3 3 14 14 0 0 308 308 308 308 12 12 12 12 14 14 16 16 16 43 0 60-16 16-43 16-60 0 0 0-337-337-337-337-16-16-16-43 0-60 10-10 18-11 32-12z","M801 245c23 0 42 19 42 42 0 336 0 223 0 337 0 23-19 42-42 42-23 0-42-19-42-42 0 0 0-337 0-337 0-23 19-42 42-42z","M346 246c18 7 11 3 22 12 0 0 139 139 139 139s124-124 124-124c12-12 12-12 14-14 10-10 18-11 32-12 0 0 6 0 6 0 18 7 11 3 22 12 16 16 16 43 0 60-3 3-3 3-14 14 0 0-124 124-124 124s139 139 139 139c16 16 16 43 0 60-16 16-43 16-60 0 0 0-139-139-139-139s-65 65-65 65c0 0-60 60-60 60-12 12-12 12-14 14-16 16-43 16-60 0-16-16-16-43 0-60 3-3 3-3 14-14 0 0 124-124 124-124s-139-139-139-139c-16-16-16-43 0-60 10-10 18-11 32-12 0 0 6 0 6 0z"],c:["rgb(0, 0, 0)","rgb(251, 237, 33)","rgb(140, 198, 63)","rgb(140, 198, 63)","rgb(255, 28, 36)","rgb(255, 28, 36)","rgb(61, 168, 244)","rgb(140, 198, 63)","rgb(255, 28, 36)"],w:1600},blueprint:{p:["M0 194c0-137 57-194 194-194 0 0 635 0 635 0 137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194 0 0 0-635 0-635z","M629 498c13 0 24 11 24 24 0 0 0 122 0 122 0 140-114 254-254 254-140 0-254-114-254-254 0 0 0-122 0-122 0-13 11-24 24-24 0 0 79 0 79 0 13 0 24 11 24 24 0 0 0 122 0 122 0 70 57 127 127 127 70 0 127-57 127-127 0 0 0-122 0-122 0-13 11-24 24-24 0 0 79 0 79 0z","M789 881c-13 0-24-11-24-24 0 0 0-335 0-335 0-13 11-24 24-24 0 0 79 0 79 0 13 0 24 11 24 24 0 0 0 335 0 335 0 13-11 24-24 24 0 0-79 0-79 0z","M182 131c13 5 8 2 16 9 0 0 102 102 102 102s91-91 91-91c9-9 9-9 11-11 8-7 13-8 23-9 0 0 4 0 4 0 13 5 8 2 16 9 12 12 12 32 0 44-2 2-2 2-11 11 0 0-91 91-91 91s102 102 102 102c12 12 12 32 0 44-12 12-32 12-44 0 0 0-102-102-102-102s-48 48-48 48c0 0-44 44-44 44-9 9-9 9-11 11-12 12-32 12-44 0-12-12-12-32 0-44 2-2 2-2 11-11 0 0 91-91 91-91s-102-102-102-102c-12-12-12-32 0-44 8-7 13-8 23-9 0 0 4 0 4 0z","M516 131c17 0 31 14 31 31 0 247 0 164 0 248 0 17-14 31-31 31-17 0-31-14-31-31 0 0 0-248 0-248 0-17 14-31 31-31z","M611 131c0 0 4 0 4 0 13 5 8 2 16 9 2 2 2 2 11 11 0 0 226 226 226 226 9 9 9 9 11 11 12 12 12 32 0 44-12 12-32 12-44 0 0 0-248-248-248-248-12-12-12-32 0-44 8-7 13-8 23-9z","M700 953c-22-45-26-53-46-94-2-4-8-5-12-2-21 20-42 40-63 60-5 4-12 1-12-5 0 0 0-323 0-323 0-6 7-9 12-6 84 65 169 129 253 194 5 4 3 12-3 13-28 5-57 10-85 15-5 1-7 6-5 10 21 43 42 86 63 130 2 4 0 8-3 10 0 0-72 37-72 37-4 2-8 0-10-3 0 0-17-35-17-35zM652 812c3-2 7-2 8 1 0 0 69 142 69 142 1 3 4 4 7 2 10-5 20-10 29-15 3-1 4-4 2-7-23-47-46-95-70-142-2-3 0-7 4-7 0 0 68-12 68-12 4-1 6-6 2-9-57-44-114-87-171-131-3-3-8-0-8 4 0 0 0 217 0 217 0 5 5 7 9 4 13-13 16-15 34-32 0 0 16-15 16-15z"],c:["rgb(78, 143, 234)","rgb(199, 219, 246)","rgb(199, 219, 246)","rgb(199, 219, 246)","rgb(199, 219, 246)","rgb(199, 219, 246)","rgb(255, 255, 255)"]},xinie:{p:["M0 194c0-137 57-194 194-194 0 0 635 0 635 0 137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194 0 0 0-635 0-635z","M927 741c0 12-10 22-22 22-174 0-116 0-175 0-12 0-22-10-22-22s10-22 22-22c0 0 175 0 175 0 12 0 22 10 22 22z","M927 916c0 12-10 22-22 22-174 0-116 0-175 0-12 0-22-10-22-22s10-22 22-22c0 0 175 0 175 0 12 0 22 10 22 22z","M927 828c0 12-10 22-22 22-174 0-116 0-175 0-12 0-22-10-22-22s10-22 22-22c0 0 175 0 175 0 12 0 22 10 22 22z","M664 719c12 0 22 10 22 22 0 174 0 116 0 175 0 12-10 22-22 22s-22-10-22-22c0 0 0-175 0-175 0-12 10-22 22-22z","M426 719c0 0 3 0 3 0 9 4 6 1 11 6 1 1 1 1 8 8 0 0 160 160 160 160 6 6 6 6 8 8 9 9 9 22 0 31-9 9-22 9-31 0 0 0-175-175-175-175-9-9-9-22 0-31 5-5 9-6 16-6z","M359 719c12 0 22 10 22 22 0 174 0 116 0 175 0 12-10 22-22 22-12 0-22-10-22-22 0 0 0-175 0-175 0-12 10-22 22-22z","M123 719c9 4 6 1 11 6 0 0 72 72 72 72s64-64 64-64c6-6 6-6 8-8 5-5 9-6 16-6 0 0 3 0 3 0 9 4 6 1 11 6 9 9 9 22 0 31-1 1-1 1-8 8 0 0-64 64-64 64s72 72 72 72c9 9 9 22 0 31-9 9-22 9-31 0 0 0-72-72-72-72s-34 34-34 34c0 0-31 31-31 31-6 6-6 6-8 8-9 9-22 9-31 0s-9-22 0-31c1-1 1-1 8-8 0 0 64-64 64-64s-72-72-72-72c-9-9-9-22 0-31 5-5 9-6 16-6 0 0 3 0 3 0z","M640 714c0 0-18-8-30-25-12-17-6-28-6-28s-22 18-9 36c13 18 46 17 46 17z","M621 636c0 0 64-20 64 4 0 14-11 27-29 27s-45-20-45-32c-0-12 9-24 9-24s-23 10-22 25c1 16 11 36 58 36 27 0 49-6 49-31 0-18-20-23-40-23-20 0-43 18-43 18z","M672 614z","M540 306c0 0 61-120 61-120s-3 31 1 77c1 12 3 21 6 28 0 0-68 15-68 15z","M624 85c0 0 12-19 57-20s80 36 81 74c1 38-15 56-15 86 0 30 54 39 54 39s-42 47-80 47c-26 0-53-44-54-81-0-37 29-60 33-94 6-49-76-52-76-52z","M593 63c29 14 35 61 14 105-21 44-62 68-91 54-29-14-35-61-14-105s62-68 91-54z","M477 335c0 0-42 137-123 139-81 2-58-118-66-125-8-8-40-26-40-26s71 26 93 19c22-7 26-16 26-16s-50 111 6 108c56-3 104-98 104-98z","M710 290c0 0 48 28 46 67-1 25-114 61-115 93-2 32 29 38 47 37 18-0 37-9 37-9s-63 10-64-18c-2-42 152-9 151-78s-101-92-101-92z","M624 81z","M493 324c0 0-40 150 7 210 83 106 205 40 205 40s-102 9-99-70c3-110 96-228 96-228s-209 47-209 47z","M716 568c0 0 63-31 26-55-42-27-86 29-86 29s39-27 60-12c21 15 0 38 0 38z","M267 238c16-7 39-8 59-3 0 0 107 30 107 30 21 6 23 14 7 21 0 0-83 38-83 38-16 7-39 8-59 3 0 0-107-30-107-30-21-6-23-14-7-21 0 0 83-38 83-38z","M267 198c16-7 39-8 59-3 0 0 107 30 107 30 21 6 23 14 7 21 0 0-83 38-83 38-16 7-39 8-59 3 0 0-107-30-107-30-21-6-23-14-7-21 0 0 83-38 83-38z","M267 159c16-7 39-8 59-3 0 0 107 30 107 30 21 6 23 14 7 21 0 0-83 38-83 38-16 7-39 8-59 3 0 0-107-30-107-30-21-6-23-14-7-21 0 0 83-38 83-38z"],c:["rgb(63, 63, 63)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(255, 147, 28)","rgb(61, 168, 244)","rgb(140, 198, 63)","rgb(255, 28, 35)","rgb(255, 147, 28)","rgb(255, 147, 28)","rgb(170, 170, 170)","rgb(251, 237, 33)","rgb(255, 147, 28)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(0, 242, 35)","rgb(251, 237, 33)","rgb(255, 147, 28)","rgb(253, 28, 35)","rgb(138, 196, 63)","rgb(61, 167, 242)"]},xinjsUiColor:{p:["M0 194c0-137 57-194 194-194 0 0 635 0 635 0 137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194 0 0 0-635 0-635z","M629 498c13 0 24 11 24 24 0 0 0 122 0 122 0 140-114 254-254 254-140 0-254-114-254-254 0 0 0-122 0-122 0-13 11-24 24-24 0 0 79 0 79 0 13 0 24 11 24 24 0 0 0 122 0 122 0 70 57 127 127 127 70 0 127-57 127-127 0 0 0-122 0-122 0-13 11-24 24-24 0 0 79 0 79 0z","M789 881c-13 0-24-11-24-24 0 0 0-335 0-335 0-13 11-24 24-24 0 0 79 0 79 0 13 0 24 11 24 24 0 0 0 335 0 335 0 13-11 24-24 24 0 0-79 0-79 0z","M182 131c13 5 8 2 16 9 0 0 102 102 102 102s91-91 91-91c9-9 9-9 11-11 8-7 13-8 23-9 0 0 4 0 4 0 13 5 8 2 16 9 12 12 12 32 0 44-2 2-2 2-11 11 0 0-91 91-91 91s102 102 102 102c12 12 12 32 0 44-12 12-32 12-44 0 0 0-102-102-102-102s-48 48-48 48c0 0-44 44-44 44-9 9-9 9-11 11-12 12-32 12-44 0-12-12-12-32 0-44 2-2 2-2 11-11 0 0 91-91 91-91s-102-102-102-102c-12-12-12-32 0-44 8-7 13-8 23-9 0 0 4 0 4 0z","M516 131c17 0 31 14 31 31 0 247 0 164 0 248 0 17-14 31-31 31-17 0-31-14-31-31 0 0 0-248 0-248 0-17 14-31 31-31z","M611 131c0 0 4 0 4 0 13 5 8 2 16 9 2 2 2 2 11 11 0 0 226 226 226 226 9 9 9 9 11 11 12 12 12 32 0 44-12 12-32 12-44 0 0 0-248-248-248-248-12-12-12-32 0-44 8-7 13-8 23-9z","M700 953c-22-45-26-53-46-94-2-4-8-5-12-2-21 20-42 40-63 60-5 4-12 1-12-5 0-108 0-215 0-323 0-6 7-9 12-6 84 65 169 129 253 194 5 4 3 12-3 13-28 5-57 10-85 15-5 1-7 6-5 10 21 43 42 86 63 130 2 4 0 8-3 10-24 12-48 25-72 37-4 2-8 0-10-3 0 0-17-35-17-35z","M652 812c3-2 7-2 8 1 23 47 46 95 69 142 1 3 4 4 7 2 10-5 20-10 29-15 3-1 4-4 2-7-23-47-46-95-70-142-2-3 0-7 4-7 23-4 45-8 68-12 4-1 6-6 2-9-57-44-114-87-171-131-3-3-8-0-8 4 0 72 0 145 0 217 0 5 5 7 9 4 13-13 16-15 34-32 0 0 16-15 16-15z"],c:["rgb(80, 80, 80)","rgb(255, 147, 29)","rgb(251, 237, 33)","rgb(255, 28, 36)","rgb(140, 198, 63)","rgb(61, 168, 244)","rgb(255, 255, 255)","rgb(0, 0, 0)"]},xinjsUi:{p:["M830 0c137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194v-635c0-137 57-194 194-194h635zM248 498h-79c-13 0-24 11-24 24v122c0 140 114 254 254 254 65 0 124-24 168-64v79c0 6 8 10 12 5l63-60c4-3 9-2 12 2 20 40 24 49 46 94 0 0 17 35 17 35 2 4 6 5 10 3 0 0 72-37 72-37 4-2 5-6 3-10-21-43-42-86-63-130-2-4 1-9 5-10 7-1 14-2 21-4v55c0 13 11 24 24 24h79c13 0 24-11 24-24v-335c0-13-11-24-24-24h-79c-13 0-24 11-24 24v204l-112-86v-118c0-13-11-24-24-24h-79c-13 0-24 11-24 24v122c0 70-57 127-127 127-70 0-127-57-127-127v-122c0-13-11-24-24-24zM516 131c-17 0-31 14-31 31v248c0 17 14 31 31 31 17 0 31-14 31-31 0-83 0-1 0-248 0-17-14-31-31-31zM425 131c-10 0-16 1-23 9-2 2-2 2-11 11 0 0-91 91-91 91s-102-102-102-102c-8-7-3-3-16-9 0 0-4-0-4-0-10 0-16 1-23 9-12 12-12 32 0 44 0 0 102 102 102 102-31 31-62 62-93 93-3 3-6 6-9 9-12 12-12 32 0 44 12 12 32 12 44 0 2-2 2-2 11-11 0 0 44-44 44-44s48-48 48-48c0 0 102 102 102 102 12 12 32 12 44 0 12-12 12-32 0-44 0 0-102-102-102-102s91-91 91-91c9-9 9-9 11-11 12-12 12-32 0-44-8-7-3-3-16-9 0 0-4-0-4-0zM611 131c-10 0-16 1-23 9-12 12-12 32 0 44 0 0 248 248 248 248 12 12 32 12 44 0 12-12 12-32 0-44-2-2-2-2-11-11 0 0-222-227-222-227-9-9-13-8-15-10-8-7-3-3-16-9 0 0-4-0-4-0z","M652 812c3-2 7-2 8 1 23 47 46 95 69 142 1 3 4 4 7 2 10-5 20-10 29-15 3-1 4-4 2-7-23-47-46-95-70-142-2-3 0-7 4-7 23-4 45-8 68-12 4-1 6-6 2-9-57-44-114-87-171-131-3-3-8-0-8 4 0 72 0 145 0 217 0 5 5 7 9 4 13-13 16-15 34-32 0 0 16-15 16-15z"]},cmy:{p:["M302 442c-11-27-17-56-17-86 0-126 103-229 229-229s229 103 229 229c0 31-6 60-17 87-12-2-24-3-37-3-72 0-136 33-178 85-42-52-106-85-178-85-11 0-21 1-32 2z","M478 582c-80-13-146-67-175-140 10-1 21-2 32-2 72 0 136 33 178 85-14 17-26 37-34 58z","M512 813c-42 52-106 85-178 85-126 0-229-103-229-229 0-116 86-211 197-227 30 73 96 127 175 140-11 27-17 56-17 87 0 55 19 105 51 144z","M547 582c-10 1-21 2-32 2-13 0-25-1-37-3 9-21 20-40 34-58 14 18 26 37 35 58 0 0 0 0 0 0z","M478 582c-11 27-17 56-17 87 0 55 19 105 51 144 32-39 51-90 51-144 0-30-6-59-17-86-10 1-21 2-32 2-13 0-25-1-37-3z","M547 582c82-11 150-66 180-140-12-2-24-3-37-3-72 0-136 33-178 85 14 18 26 37 35 58 0 0 0 0 0 0z","M512 813c42 52 106 85 178 85 126 0 229-103 229-229 0-114-83-208-192-226-30 74-98 129-180 140 11 27 17 56 17 86 0 55-19 105-51 144 0 0 0 0 0 0z"],c:["rgb(86, 206, 255)","rgb(20, 248, 0)","rgb(249, 255, 44)","rgb(0, 0, 0)","rgb(252, 0, 0)","rgb(1, 6, 255)","rgb(241, 76, 255)"]},rgb:{p:["M302 442c-11-27-17-56-17-86 0-126 103-229 229-229s229 103 229 229c0 31-6 60-17 87-12-2-24-3-37-3-72 0-136 33-178 85-42-52-106-85-178-85-11 0-21 1-32 2z","M478 582c-80-13-146-67-175-140 10-1 21-2 32-2 72 0 136 33 178 85-14 17-26 37-34 58z","M512 813c-42 52-106 85-178 85-126 0-229-103-229-229 0-116 86-211 197-227 30 73 96 127 175 140-11 27-17 56-17 87 0 55 19 105 51 144z","M547 582c-10 1-21 2-32 2-13 0-25-1-37-3 9-21 20-40 34-58 14 18 26 37 35 58 0 0 0 0 0 0z","M478 582c-11 27-17 56-17 87 0 55 19 105 51 144 32-39 51-90 51-144 0-30-6-59-17-86-10 1-21 2-32 2-13 0-25-1-37-3z","M547 582c82-11 150-66 180-140-12-2-24-3-37-3-72 0-136 33-178 85 14 18 26 37 35 58 0 0 0 0 0 0z","M512 813c42 52 106 85 178 85 126 0 229-103 229-229 0-114-83-208-192-226-30 74-98 129-180 140 11 27 17 56 17 86 0 55-19 105-51 144 0 0 0 0 0 0z"],c:["rgb(248, 14, 0)","rgb(253, 0, 255)","rgb(44, 131, 255)","rgb(255, 255, 255)","rgb(0, 219, 255)","rgb(250, 255, 0)","rgb(0, 204, 3)"]},xinjsColor:{p:["M0 194c0-137 57-194 194-194 0 0 635 0 635 0 137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194 0 0 0-635 0-635z","M126 302c8 3 5 1 10 6 0 0 66 66 66 66s59-59 59-59c6-6 6-6 7-7 5-5 9-5 15-6 0 0 3 0 3 0 8 3 5 1 10 6 8 8 8 21 0 28-1 1-1 1-7 7 0 0-59 59-59 59s66 66 66 66c8 8 8 21 0 28-8 8-21 8-28 0 0 0-66-66-66-66s-31 31-31 31c0 0-28 28-28 28-6 6-6 6-7 7-8 8-21 8-28 0-8-8-8-21 0-28 1-1 1-1 7-7 0 0 59-59 59-59s-66-66-66-66c-8-8-8-21 0-28 5-5 9-5 15-6 0 0 3 0 3 0z","M404 302c0 0 3 0 3 0 8 3 5 1 10 6 1 1 1 1 7 7 0 0 147 147 147 147 6 6 6 6 7 7 8 8 8 21 0 28-8 8-21 8-28 0 0 0-161-161-161-161-8-8-8-21 0-28 5-5 9-5 15-6z","M343 301c11 0 20 9 20 20 0 160 0 106 0 161 0 11-9 20-20 20-11 0-20-9-20-20 0 0 0-161 0-161 0-11 9-20 20-20z","M674 462c11 0 20 9 20 20 0 0 0 221 0 221 0 11-9 20-20 20s-20-9-20-20c0 0 0-221 0-221 0-11 9-20 20-20zM674 472c-6 0-10 4-10 10 0 0 0 221 0 221 0 6 4 10 10 10 6 0 10-4 10-10 0 0 0-221 0-221-0-6-3-8-8-10 0 0-2-0-2-0z","M404 302c0 0 3 0 3 0 8 3 5 1 10 6 1 1 1 1 7 7 0 0 147 147 147 147 6 6 6 6 7 7 8 8 8 21 0 28-8 8-21 8-28 0 0 0-161-161-161-161-8-8-8-21 0-28 5-5 9-5 15-6z","M284 522c0 0 3 0 3 0 8 3 5 1 10 6 8 8 8 21 0 28-1 1-2 2-3 3 0 0-39 39-39 39s-1 1-1 1c0 0-22 22-22 22s-2 2-2 2c0 0 66 66 66 66 8 8 8 21 0 28-8 8-21 8-28 0-1-1-1-1-7-7 0 0-59-59-59-59s-27 27-27 27c-4 4-7 7-11 11 0 0-29 29-29 29-8 8-21 8-28 0-8-8-8-21 0-28 0 0 66-66 66-66s-59-59-59-59c-2-2-4-4-6-6 0 0-0-0-0-0-8-8-8-21 0-28 5-5 9-5 15-6 0 0 3 0 3 0 8 3 5 1 10 6 0 0 66 66 66 66 22-22 44-44 66-66 5-5 9-5 15-6zM284 532c-4 0-6 0-8 3-6 6-11 11-22 22 0 0-0 0-0 0-22 22-32 32-44 44-4 4-10 4-14-0 0 0-66-66-66-66-1-1-1-1-2-2-1-0-2-1-4-1 0 0-1-0-1-0-4 0-6 0-8 3-4 4-4 10 0 14 0 0 0 0 0 0s-0-0-0-0c2 2 5 5 6 6 0 0 59 59 59 59 4 4 4 10 0 14 0 0-66 66-66 66-4 4-4 10 0 14 4 4 10 4 14 0 0 0 29-29 29-29 1-1 3-3 5-5 3-3 4-4 6-6 0 0 27-27 27-27 4-4 10-4 14-0 0 0 59 59 59 59 5 5 3 3 6 6 1 1 0 0 1 1 4 4 10 4 14 0 4-4 4-10-0-14 0 0-66-66-66-66-4-4-4-10-0-14 0 0 2-2 2-2s22-22 22-22c0 0 1-1 1-1s39-39 39-39c1-1 1-1 3-3 4-4 4-10 0-14-1-0-1-1-2-1-1-0-2-1-4-1 0 0-1-0-1-0z","M343 522c11 0 20 9 20 20 0 0 0 161 0 161 0 11-9 20-20 20-11 0-20-9-20-20 0 0 0-161 0-161 0-11 9-20 20-20zM343 532c-6 0-10 4-10 10 0 0 0 161 0 161 0 6 4 10 10 10 6 0 10-4 10-10 0 0 0-161 0-161 0-6-4-10-10-10z","M564 522c0 0 3 0 3 0 8 3 5 1 10 6 8 8 8 21 0 28-1 1-1 1-7 7-51 51-102 102-154 154-8 8-21 8-28 0-8-8-8-21 0-28 1-1 2-2 3-3 52-53 105-105 158-158 5-5 9-5 15-6zM565 532c-4 0-6 0-8 3-0 0-0 0-1 1 0 0 0 0 0 0-1 1-1 1-6 6 0 0-147 147-147 147-5 5-6 6-6 6 0 0 0 0 0 0-0 0-0 0-1 1-4 4-4 10 0 14 4 4 10 4 14 0 0-0 0-0 1-1 2-2 4-4 6-6 0 0 147-147 147-147s2-2 2-2c0 0 5-5 5-5 4-4 4-10 0-14-1-0-1-1-2-1-1-0-2-1-4-1 0 0-1-0-1-0z","M343 522c11 0 20 9 20 20 0 0 0 161 0 161 0 11-9 20-20 20-11 0-20-9-20-20 0 0 0-161 0-161 0-11 9-20 20-20zM343 532c-6 0-10 4-10 10 0 0 0 161 0 161 0 6 4 10 10 10 6 0 10-4 10-10 0 0 0-161 0-161 0-6-4-10-10-10z","M564 522c0 0 3 0 3 0 8 3 5 1 10 6 8 8 8 21 0 28-1 1-1 1-7 7-51 51-102 102-154 154-8 8-21 8-28 0-8-8-8-21 0-28 1-1 2-2 3-3 52-53 105-105 158-158 5-5 9-5 15-6zM565 532c-4 0-6 0-8 3-0 0-0 0-1 1 0 0 0 0 0 0-1 1-1 1-6 6 0 0-147 147-147 147-5 5-6 6-6 6 0 0 0 0 0 0-0 0-0 0-1 1-4 4-4 10 0 14 4 4 10 4 14 0 0-0 0-0 1-1 2-2 4-4 6-6 0 0 147-147 147-147s2-2 2-2c0 0 5-5 5-5 4-4 4-10 0-14-1-0-1-1-2-1-1-0-2-1-4-1 0 0-1-0-1-0z","M704 301c11 0 20 9 20 20 0 0 0 140 0 140 0 5-2 10-6 14 0 0-20 20-20 20-4 4-9 6-14 6 0 0-60 0-60 0-11 0-20-9-20-20 0-11 9-20 20-20 0 0 52 0 52 0s8-8 8-8c0 0 0-132 0-132 0-11 9-20 20-20z","M902 462c11 0 20 9 20 20 0 11-9 20-20 20 0 0-138 0-138 0-11 0-20-9-20-20 0-11 9-20 20-20 0 0 138 0 138 0z","M902 532c11 0 20 9 20 20 0 11-9 20-20 20 0 0-138 0-138 0-11 0-20-9-20-20 0-11 9-20 20-20 0 0 138 0 138 0zM902 542c0 0-138 0-138 0-6 0-10 4-10 10s4 10 10 10c0 0 138 0 138 0 6 0 10-4 10-10s-4-10-10-10z","M902 392c11 0 20 9 20 20 0 11-9 20-20 20 0 0-138 0-138 0-11 0-20-9-20-20 0-11 9-20 20-20 0 0 138 0 138 0z","M903 302c0 0 3 0 3 0 8 3 5 1 10 6 8 8 8 21 0 28 0 0-20 20-20 20-4 4-9 6-14 6 0 0-118 0-118 0-11 0-20-9-20-20 0-11 9-20 20-20 0 0 109 0 109 0s14-14 14-14c5-5 9-5 15-6z","M902 602c11 0 20 9 20 20 0 0 0 60 0 60 0 5-2 10-6 14 0 0-20 20-20 20-4 4-9 6-14 6 0 0-118 0-118 0-11 0-20-9-20-20 0 0 0-80 0-80 0-11 9-20 20-20 0 0 138 0 138 0zM902 612c0 0-138 0-138 0-6 0-10 4-10 10 0 0 0 80 0 80 0 6 4 10 10 10 0 0 118 0 118 0 3 0 5-1 7-3 0 0 20-20 20-20 2-2 3-4 3-7 0 0 0-60 0-60 0-6-4-10-10-10zM882 632c6 0 10 4 10 10 0 0 0 32 0 32 0 3-1 5-3 7 0 0-8 8-8 8-2 2-4 3-7 3 0 0-89 0-89 0-6 0-10-4-10-10 0 0 0-40 0-40 0-6 4-10 10-10 0 0 98 0 98 0zM882 642c0 0-98 0-98 0s0 40 0 40c0 0 89 0 89 0s8-8 8-8c0 0 0-32 0-32z"],c:["rgb(80, 80, 80)","rgb(255, 28, 36)","rgb(8, 131, 87)","rgb(140, 198, 63)","rgb(255, 147, 29)","rgb(61, 168, 244)","rgb(255, 28, 36)","rgb(8, 131, 87)","rgb(8, 131, 87)","rgb(140, 198, 63)","rgb(61, 168, 244)","rgb(255, 147, 29)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(251, 237, 33)"]},xinColor:{p:["M0 194c0-137 57-194 194-194 0 0 635 0 635 0 137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194 0 0 0-635 0-635z","M178 180c13 5 8 2 16 9 0 0 104 104 104 104s93-93 93-93c9-9 9-9 11-11 8-8 14-8 24-9 0 0 5 0 5 0 13 5 8 2 16 9 12 12 12 32 0 45-2 2-2 2-11 11 0 0-93 93-93 93s104 104 104 104c12 12 12 32 0 45-12 12-32 12-45 0 0 0-104-104-104-104s-49 49-49 49c0 0-45 45-45 45-9 9-9 9-11 11-12 12-32 12-45 0-12-12-12-32 0-45 2-2 2-2 11-11 0 0 93-93 93-93s-104-104-104-104c-12-12-12-32 0-45 8-8 14-8 24-9 0 0 5 0 5 0z","M617 180c0 0 5 0 5 0 13 5 8 2 16 9 2 2 2 2 11 11 0 0 232 232 232 232 9 9 9 9 11 11 12 12 12 32 0 45-12 12-32 12-45 0 0 0-253-253-253-253-12-12-12-32 0-45 8-8 14-8 24-9z","M520 179c17 0 32 14 32 32 0 253 0 168 0 253 0 17-14 32-32 32-17 0-32-14-32-32 0 0 0-253 0-253 0-17 14-32 32-32z","M617 180c0 0 5 0 5 0 13 5 8 2 16 9 2 2 2 2 11 11 0 0 232 232 232 232 9 9 9 9 11 11 12 12 12 32 0 45-12 12-32 12-45 0 0 0-253-253-253-253-12-12-12-32 0-45 8-8 14-8 24-9z","M426 528c0 0 5 0 5 0 13 5 8 2 16 9 12 12 12 32 0 45-1 1-3 3-4 4 0 0-62 62-62 62s-2 2-2 2c0 0-34 34-34 34s-3 3-3 3c0 0 104 104 104 104 12 12 12 32 0 45-12 12-32 12-45 0-2-2-2-2-11-11 0 0-94-94-94-94s-42 42-42 42c-6 6-11 11-17 17 0 0-45 45-45 45-12 12-32 12-45 0-12-12-12-32 0-45 0 0 104-104 104-104s-93-93-93-93c-3-3-7-7-10-10 0 0-1-1-1-1-12-12-12-32 0-45 8-8 14-8 24-9 0 0 5 0 5 0 13 5 8 2 16 9 0 0 104 104 104 104 35-35 70-70 104-104 8-8 14-8 24-9zM427 544c-6 0-9 0-13 4-10 10-17 17-35 35 0 0-0 0-0 0-35 35-50 50-69 69-6 6-16 6-22-0 0 0-104-104-104-104-1-1-2-2-3-2-2-1-4-1-6-2 0 0-1-0-1-0-6 0-9 0-13 4-6 6-6 16 0 22 0 0 1 1 1 1s-0-0-0-0c4 4 7 7 10 10 0 0 93 93 93 93 6 6 6 16 0 22 0 0-104 104-104 104-6 6-6 16 0 22 6 6 16 6 22 0 0 0 45-45 45-45 2-2 4-4 8-8 4-4 6-6 9-9 0 0 42-42 42-42 6-6 16-6 22-0 0 0 94 94 94 94 8 8 5 5 9 9 1 1 1 1 2 2 6 6 16 6 22 0 6-6 6-16-0-22 0 0-104-104-104-104-6-6-6-16-0-22 0 0 3-3 3-3s34-34 34-34c0 0 2-2 2-2s62-62 62-62c2-2 2-2 4-4 6-7 6-15 0-22-1-1-2-1-3-2-2-1-4-1-6-2 0 0-1-0-1-0z","M520 528c17 0 32 14 32 32 0 0 0 253 0 253 0 17-14 32-32 32-17 0-32-14-32-32 0 0 0-253 0-253 0-17 14-32 32-32zM520 544c-9 0-16 7-16 16 0 0 0 253 0 253 0 9 7 16 16 16s16-7 16-16c0 0 0-253 0-253 0-9-7-16-16-16z","M870 528c0 0 5 0 5 0 13 5 8 2 16 9 12 12 12 32 0 45-2 2-2 2-11 11-81 81-162 162-243 243-12 12-32 12-45 0-12-12-12-32 0-45 1-1 3-3 4-4 83-84 166-166 249-249 8-8 14-8 24-9zM870 544c-6 0-9 0-13 4-1 1-1 1-1 1 0 0 0 0 0 0-1 1-2 2-10 10 0 0-232 232-232 232-8 8-9 9-10 10 0 0 0 0 0 0-0 0-0 0-1 1-6 6-6 16 0 22 6 6 16 6 22 0 1-1 1-1 1-1 3-3 7-7 10-10 0 0 232-232 232-232s3-3 3-3c0 0 8-8 8-8 6-7 6-15 0-22-1-1-2-1-3-2-2-1-4-1-6-2 0 0-1-0-1-0z","M520 528c17 0 32 14 32 32 0 0 0 253 0 253 0 17-14 32-32 32-17 0-32-14-32-32 0 0 0-253 0-253 0-17 14-32 32-32zM520 544c-9 0-16 7-16 16 0 0 0 253 0 253 0 9 7 16 16 16s16-7 16-16c0 0 0-253 0-253 0-9-7-16-16-16z","M870 528c0 0 5 0 5 0 13 5 8 2 16 9 12 12 12 32 0 45-2 2-2 2-11 11-81 81-162 162-243 243-12 12-32 12-45 0-12-12-12-32 0-45 1-1 3-3 4-4 83-84 166-166 249-249 8-8 14-8 24-9zM870 544c-6 0-9 0-13 4-1 1-1 1-1 1 0 0 0 0 0 0-1 1-2 2-10 10 0 0-232 232-232 232-8 8-9 9-10 10 0 0 0 0 0 0-0 0-0 0-1 1-6 6-6 16 0 22 6 6 16 6 22 0 1-1 1-1 1-1 3-3 7-7 10-10 0 0 232-232 232-232s3-3 3-3c0 0 8-8 8-8 6-7 6-15 0-22-1-1-2-1-3-2-2-1-4-1-6-2 0 0-1-0-1-0z"],c:["rgb(80, 80, 80)","rgb(255, 28, 36)","rgb(8, 131, 87)","rgb(140, 198, 63)","rgb(61, 168, 244)","rgb(255, 28, 36)","rgb(8, 131, 87)","rgb(8, 131, 87)","rgb(140, 198, 63)","rgb(61, 168, 244)"]},sortDescending:"M723 469c-256 0-179 0-435 0-24 0-43 19-43 43s19 43 43 43c256 0 179 0 435 0 24 0 43-19 43-43s-19-43-43-43zM603 725c-256 0 61 0-195 0-24 0-43 19-43 43s19 43 43 43c256 0-61 0 195 0 24 0 43-19 43-43s-19-43-43-43zM856 213c-256 0-432 0-688 0-24 0-43 19-43 43s19 43 43 43c256 0 432 0 688 0 24 0 43-19 43-43s-19-43-43-43z",sortAscending:"M301 555c256 0 179 0 435 0 24 0 43-19 43-43s-19-43-43-43c-256 0-179 0-435 0-24 0-43 19-43 43s19 43 43 43zM421 299c256 0-61 0 195 0 24 0 43-19 43-43s-19-43-43-43c-256 0 61 0-195 0-24 0-43 19-43 43s19 43 43 43zM168 811c256 0 432 0 688 0 24 0 43-19 43-43s-19-43-43-43c-256 0-432 0-688 0-24 0-43 19-43 43s19 43 43 43z",instagram:{p:["M512 92c137 0 153 1 207 3 50 2 77 11 95 18 24 9 41 20 59 38 18 18 29 35 38 59 7 18 15 45 18 95 2 54 3 70 3 207s-1 153-3 207c-2 50-11 77-18 95-9 24-20 41-38 59-18 18-35 29-59 38-18 7-45 15-95 18-54 2-70 3-207 3s-153-1-207-3c-50-2-77-11-95-18-24-9-41-20-59-38-18-18-29-35-38-59-7-18-15-45-18-95-2-54-3-70-3-207s1-153 3-207c2-50 11-77 18-95 9-24 20-41 38-59 18-18 35-29 59-38 18-7 45-15 95-18 54-2 70-3 207-3zM512 0c-139 0-156 1-211 3-54 2-92 11-124 24-34 13-62 31-91 59-29 28-46 57-59 91-13 33-21 70-24 124-2 55-3 72-3 211s1 156 3 211c2 54 11 92 24 124 13 34 31 62 59 91 28 28 57 46 91 59 33 13 70 21 124 24 55 2 72 3 211 3s156-1 211-3c54-2 92-11 124-24 34-13 62-31 91-59s46-57 59-91c13-33 21-70 24-124 2-55 3-72 3-211s-1-156-3-211c-2-54-11-92-24-124-13-34-30-63-59-91-28-28-57-46-91-59-33-13-70-21-124-24-55-3-72-3-211-3v0z","M512 249c-145 0-263 118-263 263s118 263 263 263 263-118 263-263c0-145-118-263-263-263zM512 683c-94 0-171-76-171-171s76-171 171-171c94 0 171 76 171 171s-76 171-171 171z","M847 239c0 34-27 61-61 61s-61-27-61-61c0-34 27-61 61-61s61 27 61 61z"]},linkedin:"M928 0h-832c-53 0-96 43-96 96v832c0 53 43 96 96 96h832c53 0 96-43 96-96v-832c0-53-43-96-96-96zM384 832h-128v-448h128v448zM320 320c-35 0-64-29-64-64s29-64 64-64c35 0 64 29 64 64s-29 64-64 64zM832 832h-128v-256c0-35-29-64-64-64s-64 29-64 64v256h-128v-448h128v79c26-36 67-79 112-79 80 0 144 72 144 160v288z",eyedropper:"M987 37c-50-50-131-50-181 0l-172 172-121-121-136 136 106 106-472 472c-8 8-11 19-10 29h-0v160c0 18 14 32 32 32h160c0 0 3 0 4 0 9 0 18-4 25-11l472-472 106 106 136-136-121-121 172-172c50-50 50-131 0-181zM173 960h-109v-109l470-470 109 109-470 470z",heart:{p:["M1088 358c0 86-37 164-96 218h0l-320 320c-32 32-64 64-96 64s-64-32-96-64l-320-320c-59-54-96-131-96-218 0-162 132-294 294-294 86 0 164 37 218 96 54-59 131-96 218-96 162 0 294 132 294 294z"],w:1152},facebook:"M928 0h-832c-53 0-96 43-96 96v832c0 53 43 96 96 96h416v-448h-128v-128h128v-64c0-106 86-192 192-192h128v128h-128c-35 0-64 29-64 64v64h192l-32 128h-160v448h288c53 0 96-43 96-96v-832c0-53-43-96-96-96z",twitter:"M1024 226c-38 17-78 28-121 33 43-26 77-67 92-116-41 24-86 42-133 51-38-41-93-66-153-66-116 0-210 94-210 210 0 16 2 32 5 48-175-9-329-92-433-220-18 31-28 67-28 106 0 73 37 137 93 175-34-1-67-11-95-26 0 1 0 2 0 3 0 102 72 187 169 206-18 5-36 7-55 7-14 0-27-1-40-4 27 83 104 144 196 146-72 56-162 90-261 90-17 0-34-1-50-3 93 60 204 94 322 94 386 0 598-320 598-598 0-9-0-18-1-27 41-29 77-66 105-109z",youtube:"M1014 307c0 0-10-71-41-102-39-41-83-41-103-43-143-10-358-10-358-10h-0c0 0-215 0-358 10-20 2-64 3-103 43-31 31-41 102-41 102s-10 83-10 166v78c0 83 10 166 10 166s10 71 41 102c39 41 90 39 113 44 82 8 348 10 348 10s215-0 358-11c20-2 64-3 103-43 31-31 41-102 41-102s10-83 10-166v-78c-0-83-10-166-10-166zM406 645v-288l277 144-277 143z",game:{p:["M1056 194v-2h-672c-177 0-320 143-320 320s143 320 320 320c105 0 198-50 256-128h128c58 78 151 128 256 128 177 0 320-143 320-320 0-166-126-302-288-318zM576 576h-128v128h-128v-128h-128v-128h128v-128h128v128h128v128zM960 576c-35 0-64-29-64-64s29-64 64-64 64 29 64 64-29 64-64 64zM1152 576c-35 0-64-29-64-64 0-35 29-64 64-64s64 29 64 64c0 35-29 64-64 64z"],w:1408},google:"M512 0c-283 0-512 229-512 512s229 512 512 512 512-229 512-512-229-512-512-512zM520 896c-212 0-384-172-384-384s172-384 384-384c104 0 190 38 257 100l-104 100c-29-27-78-59-153-59-131 0-238 109-238 242s107 242 238 242c152 0 209-109 218-166h-218v-132h363c3 19 6 38 6 64 0 219-147 375-369 375z",github:"M512 13c-283 0-512 229-512 512 0 226 147 418 350 486 26 5 35-11 35-25 0-12-0-53-1-95-142 31-173-60-173-60-23-59-57-75-57-75-46-32 4-31 4-31 51 4 78 53 78 53 46 78 120 56 149 43 5-33 18-56 33-68-114-13-233-57-233-253 0-56 20-102 53-137-5-13-23-65 5-136 0 0 43-14 141 52 41-11 85-17 128-17 44 0 87 6 128 17 98-66 141-52 141-52 28 71 10 123 5 136 33 36 53 82 53 137 0 197-120 240-234 253 18 16 35 47 35 95 0 69-1 124-1 141 0 14 9 30 35 25 203-68 350-260 350-486 0-283-229-512-512-512z",npm:"M0 0v1024h1024v-1024h-1024zM832 832h-128v-512h-192v512h-320v-640h640v640z",xr:{p:["M801 116c465 0 735 49 735 396 0 279-197 396-342 396-218 0-307-165-393-165-110 0-175 165-393 165-145 0-342-117-342-396 0-347 270-396 735-396zM949 285c-16-16-41-16-57 0-16 16-16 41-0 57v0l322 322c16 16 41 16 57 0 16-16 16-41 0-57-9-9-18-18-26-26l-4-4c-5-5-9-9-14-14l-4-4c-32-32-65-64-132-131l-8-8c-1-1-3-3-4-4l-18-18c-31-31-68-68-113-113zM801 272c-22 0-40 18-40 40v0 322c0 22 18 40 40 40 22 0 40-18 40-40 0-1 0-2 0-3l0-6c0-3 0-6 0-8l0-5c0-1 0-2 0-2l0-6c0-1 0-1 0-2l0-7c0-1 0-1 0-2l0-8c0-0 0-1 0-1l-0-20c-0-0-0-1-0-1l-0-12c-0-1-0-1-0-2l-0-15c-0-1-0-2-0-2l-0-14c-0-1-0-2-0-3l-0-22c-0-1-0-3-0-4l-0-28c-0-2-0-4-0-5l-0-50c-0-2-0-5-0-7l-0-84c0-22-18-40-40-40zM710 282c-16-16-41-16-57 0v0l-134 134-131-131c-16-16-41-16-57 0-16 16-16 41-0 57v0l131 131-132 132c-15 16-15 41 1 56 16 16 41 16 57 0v0l131-131 134 134c16 16 41 16 57 0 16-16 16-41 0-57v0l-134-133 134-133c16-16 16-41 0-57z"],w:1600},xinjs:{p:["M830 0c137 0 194 57 194 194v635c0 137-57 194-194 194h-635c-137 0-194-57-194-194v-635c0-137 57-194 194-194h635zM520 528c-17 0-32 14-32 32v253c0 17 14 32 32 32 17 0 32-14 32-32v-253c0-17-14-32-32-32zM870 528c-10 0-16 1-24 9-83 83-167 166-249 249-1 1-3 3-4 4-12 12-12 32 0 45 12 12 32 12 45 0 81-81 161-162 243-243 9-9 9-9 11-11 12-12 12-32 0-45-8-7-3-3-16-9 0 0-5-0-5-0zM426 528c-10 0-16 1-24 9-35 35-70 70-104 104 0 0-104-104-104-104-8-7-3-3-16-9 0 0-5-0-5-0-10 0-16 1-24 9-12 12-12 32 0 45 0 0 1 1 1 1l10 10c0 0 93 93 93 93s-104 104-104 104c-12 12-12 32 0 45 12 12 32 12 45 0 0 0 45-45 45-45 6-6 11-11 17-17 0 0 42-42 42-42l100 100c2 2 3 3 5 5 12 12 32 12 45 0 12-12 12-32 0-45l-104-104c0 0 3-3 3-3s34-34 34-34c0 0 2-2 2-2s62-62 62-62c1-1 3-3 4-4 12-12 12-32 0-45-8-7-3-3-16-9 0 0-5-0-5-0zM520 179c-17 0-32 14-32 32v253c0 17 14 32 32 32 17 0 32-14 32-32 0-85 0-1 0-253 0-17-14-32-32-32zM617 180c-10 0-16 1-24 9-12 12-12 32 0 45 0 0 253 253 253 253 12 12 32 12 45 0 12-12 12-32 0-45-4-4-7-7-11-11-77-77-154-154-231-231-9-9-9-9-11-11-8-7-3-3-16-9 0 0-5-0-5-0zM426 180c-10 0-16 1-24 9-2 2-2 2-11 11 0 0-93 93-93 93s-104-104-104-104c-8-7-3-3-16-9 0 0-5-0-5-0-10 0-16 1-24 9-12 12-12 32 0 45 0 0 104 104 104 104-32 32-63 63-95 95l-9 9c-12 12-12 32 0 45 12 12 32 12 45 0 4-4 8-8 12-12 15-15 30-30 45-45 16-16 32-32 47-47 0 0 104 104 104 104 12 12 32 12 45 0 12-12 12-32 0-45 0 0-104-104-104-104s93-93 93-93c9-9 9-9 11-11 12-12 12-32 0-45-8-7-3-3-16-9 0 0-5-0-5-0z","M870 544c0 0 1 0 1 0 2 1 4 2 6 2 1 1 2 1 3 2 6 7 6 15-0 22 0 0-8 8-8 8s-3 3-3 3c0 0-232 232-232 232-3 3-7 7-10 10-0 0-0 0-1 1-6 6-16 6-22 0-6-6-6-16 0-22 0 0 1-1 1-1 1-1 2-2 10-10 0 0 232-232 232-232 8-8 9-9 10-10 0-0 0-0 1-1 4-4 7-4 13-4z","M520 544c9 0 16 7 16 16 0 0 0 253 0 253 0 9-7 16-16 16s-16-7-16-16c0 0 0-253 0-253 0-9 7-16 16-16z","M427 544c0 0 1 0 1 0 2 1 4 2 6 2 1 1 2 1 3 2 6 7 6 15-0 22-2 2-2 2-4 4 0 0-62 62-62 62s-2 2-2 2c0 0-34 34-34 34s-3 3-3 3c-6 6-6 16 0 22 0 0 104 104 104 104 6 6 6 16 0 22-6 6-16 6-22 0-1-1-0-0-2-2-4-4-1-1-9-9 0 0-94-94-94-94-6-6-16-6-22 0 0 0-42 42-42 42-2 2-4 4-9 9-4 4-6 6-8 8 0 0-45 45-45 45-6 6-16 6-22-0-6-6-6-16 0-22 0 0 104-104 104-104 6-6 6-16 0-22 0 0-93-93-93-93-3-3-6-6-10-10 0 0-1-1-1-1-6-6-6-16-0-22 4-4 7-4 13-4 0 0 1 0 1 0 2 1 4 2 6 2 1 1 2 2 3 2 0 0 104 104 104 104 6 6 16 6 22 0 19-19 35-35 69-69 17-17 25-25 35-35 4-4 7-4 13-4z"]},html5:"M61 0l82 922 369 102 370-103 82-921h-903zM785 301h-433l10 116h412l-31 347-232 64-232-64-16-178h113l8 90 126 34 0-0 126-34 13-147h-392l-30-342h566l-10 113z",bug:{p:["M933 549c0 20-17 37-37 37h-128c0 71-15 125-38 166l119 119c14 14 14 37 0 51-7 7-17 11-26 11s-19-3-26-11l-113-113s-75 69-172 69v-512h-73v512c-103 0-179-75-179-75l-105 118c-7 8-17 12-27 12-9 0-17-3-25-9-15-14-16-37-3-52l115-130c-20-39-33-90-33-157h-128c-20 0-37-17-37-37s17-37 37-37h128v-168l-99-99c-14-14-14-37 0-51s37-14 51 0l99 99h482l99-99c14-14 37-14 51 0s14 37 0 51l-99 99v168h128c20 0 37 17 37 37zM658 219h-366c0-101 82-183 183-183s183 82 183 183z"],w:951}},{svg:Ws,path:Io}=qn;function Hs(n){let a=ja[n];if(a===void 0){if(n)console.warn(`icon ${n} not found`);a=ja.square}return typeof a!=="string"?a:{w:1024,h:1024,p:[a]}}var Fs=(n,a)=>{ja[n]=a},Zo=(n,a,t,o=1)=>{if(a!==void 0){for(let s of[...n.querySelectorAll("path")])if(s.setAttribute("fill",a),t!==void 0)s.setAttribute("stroke",t),s.setAttribute("stroke-width",String(Number(o)*32))}n.setAttribute("xmlns","http://www.w3.org/2000/svg");let i=n.querySelectorAll("[style]");n.removeAttribute("style");for(let s of[...i]){let[e]=s.getAttribute("style")?.match(/rgb\([^)]+\)/)||[];if(s.removeAttribute("style"),e&&!a)s.setAttribute("fill",v.fromCss(e).html)}return`url(data:image/svg+xml;charset=UTF-8,${encodeURIComponent(n.outerHTML)})`},f=new Proxy(ja,{get(n,a){let t=Hs(a);return t===void 0?void 0:(...o)=>{let{w:i,h:s}=Object.assign({w:1024,h:1024},t);return Ws({viewBox:`0 0 ${i} ${s}`,class:"icon-"+a.replace(/([a-z])([A-Z])/g,(e,l,h)=>l+"-"+h.toLocaleLowerCase()),style:{height:b.xinIconSize("16px")}},...o,...t.p.map((e,l)=>{let h=Array.from(new Set(t.c));return t.c?Io({d:e,style:{fill:`var(--icon-fill-${h.indexOf(t.c[l])}, ${t.c[l]})`}}):Io({d:e})}))}}});class et extends c{icon="";size=0;color="";stroke="";strokeWidth=1;constructor(){super();this.initAttributes("icon","size","color","stroke","strokeWidth")}render(){this.textContent="";let n={};if(this.size)n.height=this.size,this.style.setProperty("--xin-icon-size",`${this.size}px`);if(this.stroke)n.stroke=this.stroke,n.strokeWidth=this.strokeWidth*32;if(this.color.match(/linear-gradient/)){let a=this.color.split("-")[0],[,t]=this.color.match(/[a-z-]+\((.*)\)/)||[],[,o]=t.match(/(\d+)deg/)||[],i=(t.match(/(#|rgb|hsl).*?%/g)||[]).map((h)=>{let[,d,p]=h.match(/^(.*)\s(\d+%)$/)||["black","100%"];return`<stop offset="${p}" stop-color="${v.fromCss(d).html}" ></stop>`}).join(""),s="";if(o)s=` gradientTransform="rotate(${parseFloat(o).toFixed(0)})"`;let e=qn.defs(),l="g-"+Math.floor(Math.random()*Number.MAX_SAFE_INTEGER);e.innerHTML=`<${a}Gradient id="${l}" ${s}>${i}</${a}Gradient>`,n.fill=`url(#${l})`,this.append(f[this.icon]({style:n},e))}else n.fill=this.color,this.append(f[this.icon]({style:n}))}}var Ns=et.elementCreator({tag:"xin-icon",styleSpec:{":host":{display:"inline-flex"},":host, :host svg":{height:b.xinIconSize("16px")}}}),Po=()=>{};class lt extends c{babylonReady;BABYLON;static styleSpec={":host":{display:"block",position:"relative"},":host canvas":{width:"100%",height:"100%"},":host .babylonVRicon":{height:50,width:80,backgroundColor:"transparent",filter:"drop-shadow(0 0 4px #000c)",backgroundImage:Zo(f.xrColor()),backgroundPosition:"center",backgroundRepeat:"no-repeat",border:"none",borderRadius:5,borderStyle:"none",outline:"none",transition:"transform 0.125s ease-out"},":host .babylonVRicon:hover":{transform:"scale(1.1)"}};content=g.canvas({part:"canvas"});constructor(){super();this.babylonReady=(async()=>{let{BABYLON:n}=await fn("https://cdn.babylonjs.com/babylon.js","BABYLON");return n})()}scene;engine;sceneCreated=Po;update=Po;_update=()=>{if(this.scene){if(this.update!==void 0)this.update(this,this.BABYLON);if(this.scene.activeCamera!==void 0)this.scene.render()}};onResize(){if(this.engine)this.engine.resize()}loadScene=async(n,a,t)=>{let{BABYLON:o}=await fn("https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js","BABYLON");o.SceneLoader.Append(n,a,this.scene,t)};loadUI=async(n)=>{let{BABYLON:a}=await fn("https://cdn.babylonjs.com/gui/babylon.gui.min.js","BABYLON"),t=a.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI",!0,this.scene),{snippetId:o,jsonUrl:i,data:s,size:e}=n;if(e)t.idealWidth=e,t.renderAtIdealSize=!0;let l;if(o)l=await t.parseFromSnippetAsync(o);else if(i)l=await t.parseFromURLAsync(i);else if(s)l=t.parseContent(s);else return null;let h=t.getChildren()[0],d=h.children.reduce((p,m)=>{return p[m.name]=m,p},{});return{advancedTexture:t,gui:l,root:h,widgets:d}};connectedCallback(){super.connectedCallback();let{canvas:n}=this.parts;this.babylonReady.then(async(a)=>{if(this.BABYLON=a,this.engine=new a.Engine(n,!0),this.scene=new a.Scene(this.engine),this.sceneCreated)await this.sceneCreated(this,a);if(this.scene.activeCamera===void 0)new a.ArcRotateCamera("default-camera",-Math.PI/2,Math.PI/2.5,3,new a.Vector3(0,0,0)).attachControl(this.parts.canvas,!0);this.engine.runRenderLoop(this._update)})}}var Ys=lt.elementCreator({tag:"xin-3d"});class In extends c{content=null;src="";json="";config={renderer:"svg",loop:!0,autoplay:!0};static bodymovinAvailable;animation;static styleSpec={":host":{width:400,height:400,display:"inline-block"}};_loading=!1;get loading(){return this._loading}constructor(){super();if(this.initAttributes("src","json"),In.bodymovinAvailable===void 0)In.bodymovinAvailable=fn("https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js","bodymovin")}doneLoading=()=>{this._loading=!1};load=({bodymovin:n})=>{if(this._loading=!0,this.config.container=this.shadowRoot!==null?this.shadowRoot:void 0,this.json!=="")this.config.animationData=this.json,delete this.config.path;else if(this.src!=="")delete this.config.animationData,this.config.path=this.src;else console.log("%c<xin-lottie>%c expected either %cjson%c (animation data) or %csrc% c(url) but found neither.","color: #44f; background: #fff; padding: 0 5px","color: default","color: #44f; background: #fff; padding: 0 5px","color: default","color: #44f; background: #fff; padding: 0 5px","color: default");if(this.animation){this.animation.destroy();let a=this.shadowRoot;if(a!==null)a.querySelector("svg")?.remove()}this.animation=n.loadAnimation(this.config),this.animation.addEventListener("DOMLoaded",this.doneLoading)};render(){super.render(),In.bodymovinAvailable.then(this.load).catch((n)=>{console.error(n)})}}var qs=In.elementCreator({tag:"xin-lottie"}),{button:Za,slot:Gs,div:ca}=g;class rt extends c{arrows=!1;dots=!1;loop=!1;maxVisibleItems=1;snapDelay=0.1;snapDuration=0.25;auto=0;lastAutoAdvance=Date.now();interval;autoAdvance=()=>{if(this.auto>0&&this.auto*1000<Date.now()-this.lastAutoAdvance)this.forward()};_page=0;get page(){return this._page}set page(n){let{scroller:a,back:t,forward:o}=this.parts;if(this.lastPage<=0)o.disabled=t.disabled=!0,n=0;else n=Math.max(0,Math.min(this.lastPage,n)),n=isNaN(n)?0:n;if(this._page!==n)this._page=isNaN(n)?0:n,this.animateScroll(this._page*a.offsetWidth),t.disabled=this.page<=0&&!this.loop,o.disabled=this.page>=this.lastPage&&!this.loop}get visibleItems(){return[...this.children].filter((n)=>getComputedStyle(n).display!=="none")}get lastPage(){return Math.max(Math.ceil(this.visibleItems.length/(this.maxVisibleItems||1))-1,0)}static styleSpec={":host":{display:"flex",flexDirection:"column",position:"relative"},":host svg":{height:r.carouselIconSize},":host button":{outline:"none",border:"none",boxShadow:"none",background:"transparent",fill:r.carouselButtonColor,padding:0},":host::part(back), :host::part(forward)":{position:"absolute",top:0,bottom:0,width:r.carouseButtonWidth,zIndex:2},":host::part(back)":{left:0},":host::part(forward)":{right:0},":host button:disabled":{opacity:0.5,pointerEvents:"none"},":host button:hover":{fill:r.carouselButtonHoverColor},":host button:active":{fill:r.carouselButtonActiveColor},":host::part(pager)":{position:"relative"},":host::part(scroller)":{overflow:"auto hidden",position:"relative"},":host::part(grid)":{display:"grid",justifyItems:"center"},":host *::-webkit-scrollbar, *::-webkit-scrollbar-thumb":{display:"none"},":host .dot":{background:r.carouselButtonColor,borderRadius:r.carouselDotSize,height:r.carouselDotSize,width:r.carouselDotSize,transition:r.carouselDotTransition},":host .dot:not(.current):hover":{background:r.carouselButtonHoverColor,height:r.carouselDotSize150,width:r.carouselDotSize150,margin:r.carouselDotSize_25},":host .dot:not(.current):active":{background:r.carouselButtonActiveColor},":host .dot.current":{background:r.carouselDotCurrentColor},":host::part(progress)":{display:"flex",gap:r.carouselDotSpacing,justifyContent:"center",padding:r.carouselProgressPadding}};easing=(n)=>{return Math.sin(n*Math.PI*0.5)};indicateCurrent=()=>{let{scroller:n,progress:a}=this.parts,t=n.scrollLeft/n.offsetWidth;[...a.children].forEach((o,i)=>{o.classList.toggle("current",Math.floor(i/this.maxVisibleItems-t)===0)}),this.lastAutoAdvance=Date.now(),clearTimeout(this.snapTimer),this.snapTimer=setTimeout(this.snapPosition,this.snapDelay*1000)};snapPosition=()=>{let{scroller:n}=this.parts,a=Math.round(n.scrollLeft/n.offsetWidth);if(a!==this.page)this.page=a>this.page?Math.ceil(a):Math.floor(a);this.lastAutoAdvance=Date.now()};back=()=>{this.page=this.page>0?this.page-1:this.lastPage};forward=()=>{this.page=this.page<this.lastPage?this.page+1:0};handleDotClick=(n)=>{let{progress:a}=this.parts,t=[...a.children].indexOf(n.target);if(t>-1)this.page=Math.floor(t/this.maxVisibleItems)};snapTimer;animationFrame;animateScroll(n,a=-1,t=0){cancelAnimationFrame(this.animationFrame);let{scroller:o}=this.parts;if(a===-1){a=o.scrollLeft,t=Date.now(),this.animationFrame=requestAnimationFrame(()=>{this.animateScroll(n,a,t)});return}let i=(Date.now()-t)/1000;if(i>=this.snapDuration||Math.abs(o.scrollLeft-n)<2)o.scrollLeft=n,this.animationFrame=null;else o.scrollLeft=a+this.easing(i/this.snapDuration)*(n-a),this.animationFrame=requestAnimationFrame(()=>{this.animateScroll(n,a,t)})}content=()=>[ca({part:"pager"},Za({title:"previous slide",part:"back"},f.chevronLeft()),ca({title:"slides",role:"group",part:"scroller"},ca({part:"grid"},Gs())),Za({title:"next slide",part:"forward"},f.chevronRight())),ca({title:"choose slide to display",role:"group",part:"progress"})];constructor(){super();this.initAttributes("dots","arrows","maxVisibleItems","snapDuration","loop","auto")}connectedCallback(){super.connectedCallback(),this.ariaRoleDescription="carousel",this.ariaOrientation="horizontal",this.ariaReadOnly="true";let{back:n,forward:a,scroller:t,progress:o}=this.parts;n.addEventListener("click",this.back),a.addEventListener("click",this.forward),t.addEventListener("scroll",this.indicateCurrent),o.addEventListener("click",this.handleDotClick),this.lastAutoAdvance=Date.now(),this.interval=setInterval(this.autoAdvance,100)}disconnectedCallback(){clearInterval(this.interval)}render(){super.render();let{dots:n,arrows:a,visibleItems:t,lastPage:o}=this,{progress:i,back:s,forward:e,grid:l}=this.parts;t.forEach((h)=>{h.role="group"}),l.style.gridTemplateColumns=`${100/this.maxVisibleItems/(1+this.lastPage)}% `.repeat(t.length).trim(),l.style.width=(1+this.lastPage)*100+"%",i.textContent="",i.append(...t.map((h,d)=>Za({title:`item ${d+1}`,class:"dot"}))),this.indicateCurrent(),i.style.display=n&&o>0?"":"none",s.hidden=e.hidden=!(a&&o>0)}}var Js=rt.elementCreator({tag:"xin-carousel",styleSpec:{":host":{_carouselIconSize:24,_carouselButtonColor:"#0004",_carouselButtonHoverColor:"#0006",_carouselButtonActiveColor:"#000c",_carouseButtonWidth:48,_carouselDotCurrentColor:"#0008",_carouselDotSize:8,_carouselDotSpacing:r.carouselDotSize,_carouselProgressPadding:12,_carouselDotTransition:"0.125s ease-in-out"},":host:focus":{outline:"none",boxShadow:"none"}}}),Bo="https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.2/",Qo="ace/theme/tomorrow",$s=async(n,a="html",t={},o=Qo)=>{let{ace:i}=await fn(`${Bo}ace.min.js`);i.config.set("basePath",Bo);let s=i.edit(n,{mode:`ace/mode/${a}`,tabSize:2,useSoftTabs:!0,useWorker:!1,...t});return s.setTheme(o),s};class Pn extends c{source="";get value(){return this.editor===void 0?this.source:this.editor.getValue()}set value(n){if(this.editor===void 0)this.source=n;else this.editor.setValue(n),this.editor.clearSelection(),this.editor.session.getUndoManager().reset()}mode="javascript";disabled=!1;role="code editor";get editor(){return this._editor}_editor;_editorPromise;options={};theme=Qo;static styleSpec={":host":{display:"block",position:"relative",width:"100%",height:"100%"}};constructor(){super();this.initAttributes("mode","theme","disabled")}onResize(){if(this.editor!==void 0)this.editor.resize(!0)}connectedCallback(){if(super.connectedCallback(),this.source==="")this.value=this.textContent!==null?this.textContent.trim():"";if(this._editorPromise===void 0)this._editorPromise=$s(this,this.mode,this.options,this.theme),this._editorPromise.then((n)=>{this._editor=n,n.setValue(this.source,1),n.clearSelection(),n.session.getUndoManager().reset()})}render(){if(super.render(),this._editorPromise!==void 0)this._editorPromise.then((n)=>n.setReadOnly(this.disabled))}}var va=Pn.elementCreator({tag:"xin-code"}),{input:Qa}=g,Oo=v.fromCss("#8888");class Lo extends c{value=Oo.rgba;color=Oo;static styleSpec={":host":{_gap:8,_swatchSize:32,_cssWidth:72,_alphaWidth:72,display:"inline-flex",gap:r.gap,alignItems:"center"},':host input[type="color"]':{border:0,width:r.swatchSize,height:r.swatchSize},":host::part(alpha)":{width:r.alphaWidth},":host::part(css)":{width:r.cssWidth,fontFamily:"monospace"}};content=[Qa({title:"base color",type:"color",part:"rgb"}),Qa({type:"range",title:"opacity",part:"alpha",min:0,max:1,step:0.05}),Qa({title:"css color spec",part:"css"})];valueChanged=!1;update=(n)=>{let{rgb:a,alpha:t,css:o}=this.parts;if(n.type==="input")this.color=v.fromCss(a.value),this.color.a=Number(t.value),o.value=this.color.html;else this.color=v.fromCss(o.value),a.value=this.color.html.substring(0,7),t.value=String(this.color.a);a.style.opacity=String(this.color.a),this.value=this.color.rgba,this.valueChanged=!0};connectedCallback(){super.connectedCallback();let{rgb:n,alpha:a,css:t}=this.parts;n.addEventListener("input",this.update),a.addEventListener("input",this.update),t.addEventListener("change",this.update)}render(){if(this.valueChanged){this.valueChanted=!1;return}let{rgb:n,alpha:a,css:t}=this.parts;this.color=v.fromCss(this.value),n.value=this.color.html.substring(0,7),n.style.opacity=String(this.color.a),a.value=String(this.color.a),t.value=this.color.html}}var ko=Lo.elementCreator({tag:"xin-color"}),nn=g.div({style:{content:" ",position:"fixed",top:0,left:0,right:0,bottom:0}}),ga={passive:!0},an=(n,a,t="move")=>{if(!n.type.startsWith("touch")){let{clientX:o,clientY:i}=n;nn.style.cursor=t,Zn(nn),document.body.append(nn);let s=(e)=>{let l=e.clientX-o,h=e.clientY-i;if(a(l,h,e)===!0)nn.removeEventListener("mousemove",s),nn.removeEventListener("mouseup",s),nn.remove()};nn.addEventListener("mousemove",s,ga),nn.addEventListener("mouseup",s,ga)}else if(n instanceof TouchEvent){let o=n.changedTouches[0],i=o.identifier,s=o.clientX,e=o.clientY,l=n.target,h=0,d=0,p=(m)=>{let u=[...m.touches].find((M)=>M.identifier===i);if(u!==void 0)h=u.clientX-s,d=u.clientY-e;if(m.type==="touchmove")m.stopPropagation(),m.preventDefault();if(a(h,d,m)===!0||u===void 0)l.removeEventListener("touchmove",p),l.removeEventListener("touchend",p),l.removeEventListener("touchcancel",p)};l.addEventListener("touchmove",p),l.addEventListener("touchend",p,ga),l.addEventListener("touchcancel",p,ga)}},ht=(n="body *")=>[...document.querySelectorAll(n)].map((a)=>parseFloat(getComputedStyle(a).zIndex)).reduce((a,t)=>isNaN(a)||Number(a)<t?t:Number(a),0),Zn=(n,a="body *")=>{n.style.zIndex=String(ht(a)+1)},{slot:Ks}=g;class tn extends c{static floats=new Set;drag=!1;remainOnResize="remove";remainOnScroll="remain";content=Ks();static styleSpec={":host":{position:"fixed"}};constructor(){super();this.initAttributes("drag","remainOnResize","remainOnScroll")}reposition=(n)=>{if(n.target?.closest(".no-drag"))return;if(this.drag){Zn(this);let a=this.offsetLeft,t=this.offsetTop;an(n,(o,i,s)=>{if(this.style.left=`${a+o}px`,this.style.top=`${t+i}px`,this.style.right="auto",this.style.bottom="auto",s.type==="mouseup")return!0})}};connectedCallback(){super.connectedCallback(),tn.floats.add(this);let n={passive:!0};this.addEventListener("touchstart",this.reposition,n),this.addEventListener("mousedown",this.reposition,n),Zn(this)}disconnectedCallback(){super.disconnectedCallback(),tn.floats.delete(this)}}var tt=tn.elementCreator({tag:"xin-float"});window.addEventListener("resize",()=>{[...tn.floats].forEach((n)=>{if(n.remainOnResize==="hide")n.hidden=!0;else if(n.remainOnResize==="remove")n.remove()})},{passive:!0});document.addEventListener("scroll",(n)=>{if(n.target instanceof HTMLElement&&n.target.closest(tn.tagName))return;[...tn.floats].forEach((a)=>{if(a.remainOnScroll==="hide")a.hidden=!0;else if(a.remainOnScroll==="remove")a.remove()})},{passive:!0,capture:!0});var ni=(n)=>{let{content:a,target:t,position:o}=n,i=Array.isArray(a)?tt(...a):tt(a);return ai(i,t,o),document.body.append(i),i},ai=(n,a,t)=>{{let{position:m}=getComputedStyle(n);if(m!=="fixed")n.style.position="fixed";Zn(n)}let{left:o,top:i,width:s,height:e}=a.getBoundingClientRect(),l=o+s*0.5,h=i+e*0.5,d=window.innerWidth,p=window.innerHeight;if(t==="side")t=(l<d*0.5?"e":"w")+(h<p*0.5?"s":"n");else if(t==="auto"||t===void 0)t=(h<p*0.5?"s":"n")+(l<d*0.5?"e":"w");if(n.style.top=n.style.left=n.style.right=n.style.bottom=n.style.transform="",t.length===2){let[m,u]=t;switch(m){case"n":n.style.bottom=(p-i).toFixed(2)+"px";break;case"e":n.style.left=(o+s).toFixed(2)+"px";break;case"s":n.style.top=(i+e).toFixed(2)+"px";break;case"w":n.style.right=(d-o).toFixed(2)+"px";break}switch(u){case"n":n.style.bottom=(p-i-e).toFixed(2)+"px";break;case"e":n.style.left=o.toFixed(2)+"px";break;case"s":n.style.top=i.toFixed(2)+"px";break;case"w":n.style.right=(d-o-s).toFixed(2)+"px";break}n.style.transform=""}else if(t==="n")n.style.bottom=(p-i).toFixed(2)+"px",n.style.left=l.toFixed(2)+"px",n.style.transform="translateX(-50%)";else if(t==="s")n.style.top=(i+e).toFixed(2)+"px",n.style.left=l.toFixed(2)+"px",n.style.transform="translateX(-50%)";else if(t==="e")n.style.left=(o+s).toFixed(2)+"px",n.style.top=h.toFixed(2)+"px",n.style.transform="translateY(-50%)";else if(t==="w")n.style.right=(d-o).toFixed(2)+"px",n.style.top=h.toFixed(2)+"px",n.style.transform="translateY(-50%)";n.style.setProperty("--max-height",`calc(100vh - ${n.style.top||n.style.bottom})`),n.style.setProperty("--max-width",`calc(100vw - ${n.style.left||n.style.right})`)};function ti(n,a=!0){return(t,o)=>{let i=n(t),s=n(o);for(let e in i)if(i[e]!==s[e])return(Array.isArray(a)?a[e]!==!1:a)?i[e]>s[e]?1:-1:i[e]>s[e]?-1:1;return 0}}var{button:Rs,span:Eo,input:Us}=g,oi=(n,a)=>{return!!n.find((t)=>{if(t===null||a==null)return!1;else if(Array.isArray(t))return oi(t,a);else if(t.value===a||t===a)return!0})};class Ln extends c{editable=!1;showIcon=!1;hideCaption=!1;options="";value="";placeholder="";filter="";localized=!1;setValue=(n,a=!1)=>{if(this.value!==n)this.value=n,this.queueRender(!0);if(a)this.dispatchEvent(new Event("action"))};getValue=()=>this.value;get selectOptions(){return typeof this.options==="string"?this.options.split(",").map((n)=>n.trim()||null):this.options}buildOptionMenuItem=(n)=>{if(n===null)return null;let{setValue:a,getValue:t}=this,o,i,s;if(typeof n==="string")i=s=n;else({icon:o,caption:i,value:s}=n);if(this.localized)i=B(i);let{options:e}=n;if(e)return{icon:o,caption:i,checked:()=>oi(e,t()),menuItems:e.map(this.buildOptionMenuItem)};return{icon:o,caption:i,checked:()=>t()===s,action:typeof s==="function"?async()=>{let l=await s();if(l!==void 0)a(l,!0)}:()=>{if(typeof s==="string")a(s,!0)}}};get optionsMenu(){let n=this.selectOptions.map(this.buildOptionMenuItem);if(this.filter==="")return n;let a=(t)=>{if(t===null)return!0;else if(t.menuItems)return t.menuItems=t.menuItems.filter(a),t.menuItems.length>0;else return t.caption.toLocaleLowerCase().includes(this.filter)};return n.filter(a)}handleChange=(n)=>{let{value:a}=this.parts,t=a.value||"";if(this.value!==String(t))this.value=t,this.dispatchEvent(new Event("change"));this.filter="",n.stopPropagation(),n.preventDefault()};handleKey=(n)=>{if(n.key==="Enter")n.preventDefault()};filterMenu=la(()=>{this.filter=this.parts.value.value.toLocaleLowerCase(),vn(0),this.popOptions()});popOptions=(n)=>{if(n&&n.type==="click")this.filter="";this.poppedOptions=this.optionsMenu,Q({target:this,menuItems:this.poppedOptions})};content=()=>[Rs({onClick:this.popOptions},Eo(),Us({part:"value",value:this.value,tabindex:0,onKeydown:this.handleKey,onInput:this.filterMenu,onChange:this.handleChange}),f.chevronDown())];constructor(){super();this.initAttributes("options","editable","placeholder","showIcon","hideCaption","localized")}get allOptions(){let n=[];function a(t){for(let o of t)if(typeof o==="string")n.push({caption:o,value:o});else if(o?.value)n.push(o);else if(o?.options)a(o.options)}return a(this.selectOptions),n}findOption(){return this.allOptions.find((n)=>n.value===this.value)||{caption:this.value,value:this.value}}localeChanged=()=>{this.queueRender()};connectedCallback(){if(super.connectedCallback(),this.localized)J.allInstances.add(this)}disconnectedCallback(){if(super.disconnectedCallback(),this.localized)J.allInstances.delete(this)}render(){super.render();let{value:n}=this.parts,a=n.previousElementSibling,t=this.findOption(),o=Eo();if(n.value=this.localized?B(t.caption):t.caption,t.icon)if(t.icon instanceof HTMLElement)o=t.icon.cloneNode(!0);else o=f[t.icon]();a.replaceWith(o),n.setAttribute("placeholder",this.localized?B(this.placeholder):this.placeholder),n.style.pointerEvents=this.editable?"":"none",n.readOnly=!this.editable}}var dt=Ln.elementCreator({tag:"xin-select",styleSpec:{":host":{"--gap":"8px","--touch-size":"44px","--padding":"0 8px","--value-padding":"0 8px","--icon-width":"24px","--fieldWidth":"140px",display:"inline-block",position:"relative"},":host button":{display:"grid",alignItems:"center",gap:r.gap,textAlign:"left",height:r.touchSize,padding:r.padding,gridTemplateColumns:`auto ${r.iconWidth}`,position:"relative"},":host[show-icon] button":{gridTemplateColumns:`${r.iconWidth} auto ${r.iconWidth}`},":host[hide-caption] button":{gridTemplateColumns:`${r.iconWidth} ${r.iconWidth}`},":host:not([show-icon]) button > :first-child":{display:"none"},":host[hide-caption] button > :nth-child(2)":{display:"none"},':host [part="value"]':{width:r.fieldWidth,padding:r.valuePadding,height:r.touchSize,lineHeight:r.touchSize,boxShadow:"none",whiteSpace:"nowrap",outline:"none",background:"transparent"},':host [part="value"]:not(:focus)':{overflow:"hidden",textOverflow:"ellipsis",background:"transparent"}}}),{span:ii}=g,{i18n:P}=un({i18n:{locale:window.navigator.language,locales:[window.navigator.language],languages:[window.navigator.language],emoji:[""],stringMap:{},localeOptions:[{icon:ii(),caption:window.navigator.language,value:window.navigator.language}]}});Z.localeOptions={toDOM(n,a){if(n instanceof Ln)n.options=a}};var Zs=(n)=>{if(P.locales.includes(n))P.locale=n;else console.error(`language ${n} is not available`)},ut=()=>{let n=Array.from(J.allInstances);for(let a of n)a.localeChanged()};Yn(P.locale.xinPath,ut);var Qs=ti((n)=>[n.caption.toLocaleLowerCase()]);function Ls(n){let[a,,t,o,...i]=n.split(`
`).map((s)=>s.split("\t"));if(a&&t&&o&&i){if(P.locales=a,P.languages=t,P.emoji=o,P.stringMap=i.reduce((s,e)=>{return s[e[0].toLocaleLowerCase()]=e,s},{}),P.localeOptions=a.map((s,e)=>({icon:ii({title:a[e]},o[e]),caption:t[e],value:s})).sort(Qs),!P.locales.includes(P.locale.valueOf())){let s=P.locale.substring(0,2);P.locale=P.locales.find((e)=>e.substring(0,2)===s)||P.locales[0]}ut()}}function B(n){if(n.endsWith("…"))return B(n.substring(0,n.length-1))+"…";let a=P.locales.indexOf(P.locale.valueOf());if(a>-1){let t=P.stringMap[n.toLocaleLowerCase()],o=t&&t[a];if(o)n=n.toLocaleLowerCase()===n?o.toLocaleLowerCase():o.valueOf()}return n}class mt extends c{hideCaption=!1;content=()=>{return dt({part:"select",showIcon:!0,title:B("Language"),bindValue:P.locale,bindLocaleOptions:P.localeOptions})};constructor(){super();this.initAttributes("hideCaption")}render(){super.render(),this.parts.select.toggleAttribute("hide-caption",this.hideCaption)}}var ks=mt.elementCreator({tag:"xin-locale-picker"});class J extends c{static allInstances=new Set;contents=()=>g.xinSlot();refString="";constructor(){super();this.initAttributes("refString")}connectedCallback(){super.connectedCallback(),J.allInstances.add(this)}disconnectedCallback(){super.disconnectedCallback(),J.allInstances.delete(this)}localeChanged(){if(!this.refString)this.refString=this.textContent||"";this.textContent=this.refString?B(this.refString):""}render(){super.render(),this.localeChanged()}}var Sa=J.elementCreator({tag:"xin-localized",styleSpec:{":host":{pointerEvents:"none"}}}),ne=(n,a)=>{a=a.toLocaleLowerCase();let t=!!a.match(/\^|ctrl/),o=!!a.match(/⌘|meta/),i=!!a.match(/⌥|⎇|alt|option/),s=!!a.match(/⇧|shift/),e=a.slice(-1);return n.key===e&&n.metaKey===o&&n.ctrlKey===t&&n.altKey===i&&n.shiftKey===s},{div:To,button:pt,span:F,a:ae,xinSlot:te}=g;Gn("xin-menu-helper",{".xin-menu":{overflow:"hidden auto",maxHeight:`calc(${r.maxHeight} - ${b.menuInset("8px")})`,borderRadius:r.spacing50,background:b.menuBg("#fafafa"),boxShadow:b.menuShadow(`${r.spacing13} ${r.spacing50} ${r.spacing} #0004`)},".xin-menu > div":{width:b.menuWidth("auto")},".xin-menu-trigger":{paddingLeft:0,paddingRight:0,minWidth:b.touchSize("48px")},".xin-menu-separator":{display:"inline-block",content:" ",height:"1px",width:"100%",background:b.menuSeparatorColor("#2224"),margin:b.menuSeparatorMargin("8px 0")},".xin-menu-item":{boxShadow:"none",border:"none !important",display:"grid",alignItems:"center",justifyContent:"flex-start",textDecoration:"none",gridTemplateColumns:"0px 1fr 30px",width:"100%",gap:0,background:"transparent",padding:b.menuItemPadding("0 16px"),height:b.menuItemHeight("48px"),lineHeight:b.menuItemHeight("48px"),textAlign:"left"},".xin-menu-item, .xin-menu-item > span":{color:b.menuItemColor("#222")},".xin-menu-with-icons .xin-menu-item":{gridTemplateColumns:"30px 1fr 30px"},".xin-menu-item svg":{fill:b.menuItemIconColor("#222")},".xin-menu-item.xin-menu-item-checked":{background:b.menuItemHoverBg("#eee")},".xin-menu-item > span:nth-child(2)":{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textAlign:"left"},".xin-menu-item:hover":{boxShadow:"none !important",background:b.menuItemHoverBg("#eee")},".xin-menu-item:active":{boxShadow:"none !important",background:b.menuItemActiveBg("#aaa"),color:b.menuItemActiveColor("#000")},".xin-menu-item:active svg":{fill:b.menuItemIconActiveColor("#000")}});var si=(n,a)=>{let t=n.checked&&n.checked()&&"check"||!1,o=n?.icon||t||F(" ");if(typeof o==="string")o=f[o]();let i;if(typeof n?.action==="string")i=ae({class:"xin-menu-item",href:n.action},o,a.localized?F(B(n.caption)):F(n.caption),F(n.shortcut||" "));else i=pt({class:"xin-menu-item",onClick:n.action},o,a.localized?F(B(n.caption)):F(n.caption),F(n.shortcut||" "));if(i.classList.toggle("xin-menu-item-checked",t!==!1),n?.enabled&&!n.enabled())i.setAttribute("disabled","");return i},ei=(n,a)=>{let t=n.checked&&n.checked()&&"check"||!1,o=n?.icon||t||F(" ");if(typeof o==="string")o=f[o]();let i=pt({class:"xin-menu-item",disabled:!(!n.enabled||n.enabled()),onClick(s){Q(Object.assign({},a,{menuItems:n.menuItems,target:i,submenuDepth:(a.submenuDepth||0)+1,position:"side"})),s.stopPropagation(),s.preventDefault()}},o,a.localized?F(B(n.caption)):F(n.caption),f.chevronRight({style:{justifySelf:"flex-end"}}));return i},li=(n,a)=>{if(n===null)return F({class:"xin-menu-separator"});else if(n?.action)return si(n,a);else return ei(n,a)},ri=(n)=>{let{target:a,width:t,menuItems:o}=n,i=o.find((s)=>s?.icon||s?.checked);return To({class:i?"xin-menu xin-menu-with-icons":"xin-menu",onClick(){vn(0)}},To({style:{minWidth:a.offsetWidth+"px",width:typeof t==="number"?`${t}px`:t},onMousedown(s){s.preventDefault(),s.stopPropagation()}},...o.map((s)=>li(s,n))))},_n,cn=[],vn=(n=0)=>{let a=cn.splice(n);for(let t of a)t.menu.remove();return _n=a[0],n>0?cn[n-1]:void 0};document.body.addEventListener("mousedown",(n)=>{if(n.target&&!cn.find((a)=>a.target.contains(n.target)))vn(0)});document.body.addEventListener("keydown",(n)=>{if(n.key==="Escape")vn(0)});var Q=(n)=>{n=Object.assign({submenuDepth:0},n);let{target:a,position:t,submenuDepth:o}=n;if(_n&&!document.body.contains(_n?.menu))_n=void 0;if(cn.length&&!document.body.contains(cn[0].menu))cn.splice(0);if(o===0&&_n?.target===a)return;let i=vn(o);if(_n?.target===a)return;if(i&&i.target===a){vn();return}if(!n.menuItems?.length)return;let s=ri(n),e=ni({content:s,target:a,position:t});e.remainOnScroll="remove",cn.push({target:a,menu:e})};function hi(n,a){for(let t of n){if(!t)continue;let{shortcut:o}=t,{menuItems:i}=t;if(o){if(ne(a,o))return t}else if(i){let s=hi(i,a);if(s)return s}}return}class bt extends c{menuItems=[];menuWidth="auto";localized=!1;showMenu=(n)=>{if(n.type==="click"||n.code==="Space")Q({target:this.parts.trigger,width:this.menuWidth,localized:this.localized,menuItems:this.menuItems}),n.stopPropagation(),n.preventDefault()};content=()=>pt({tabindex:0,part:"trigger",onClick:this.showMenu},te());handleShortcut=async(n)=>{let a=hi(this.menuItems,n);if(a){if(a.action instanceof Function)a.action()}};constructor(){super();this.initAttributes("menuWidth","localized","icon"),this.addEventListener("keydown",this.showMenu)}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.handleShortcut,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.handleShortcut)}}var oe=bt.elementCreator({tag:"xin-menu",styleSpec:{":host":{display:"inline-block"},":host button > xin-slot":{display:"flex",alignItems:"center",gap:b.xinMenuTriggerGap("10px")}}}),di={};Vs(di,{init:()=>bi,draggedElement:()=>re});var ie=()=>!!document.querySelector(".drag-source"),ui=(n,a)=>{if(!n)return!1;for(let t of n)if(t==="special/any")return!0;else if(t.indexOf("*")>-1){let[o,i]=t.split("/"),[s,e]=a.split("/");if((o==="*"||o===s)&&(i==="*"||i===e))return!0}else if(t===a)return!0},xa=(n)=>{for(let a of[...document.querySelectorAll(`.${n}`)])a.classList.remove(n)},mi=()=>{xa("drag-over"),xa("drag-source"),xa("drag-target")},ot=(n,a=";")=>{return(n||"").split(a).map((t)=>t.trim()).filter((t)=>t!=="")},pi=(n)=>{if(!n)n=[];let a=[...document.querySelectorAll("[data-drop]")];for(let t of a){let o=ot(t.dataset.drop);if(n.find((i)=>ui(o,i)))t.classList.add("drag-target");else t.classList.remove("drag-target")}};function se(n){let a=n.target?.closest('[draggable="true"],a[href]');if(!a)return;a.classList.add("drag-source");let t=a.matches('[draggable="true"]')?ot(a.dataset.drag||"text/html"):ot(a.dataset.drag||"url");for(let o of t){let i=a.dataset.dragContent||(o==="text/html"?a.innerHTML:a.textContent);n.dataTransfer?.setData(o,i||"")}pi(n.dataTransfer?.types),n.stopPropagation()}function Do(n){if(!ie())pi(n.dataTransfer?.types);let a=n.target.closest(".drag-target");if(a&&n.dataTransfer)a.classList.add("drag-over"),n.dataTransfer.dropEffect="copy";else n.preventDefault(),n.stopPropagation()}function ee(){xa("drag-over")}function le(n){let a=n.target.closest(".drag-target");if(a){let t=(a.dataset?.drop||"").split(";");for(let o of t)if(ui(n.dataTransfer?.types,o))if(o==="text/html")a.innerHTML=n.dataTransfer?.getData(o)||"";else a.textContent=n.dataTransfer?.getData(o)||""}mi()}var re=()=>document.querySelector(".drag-source"),zo=!1,bi=()=>{if(zo)return;document.body.addEventListener("dragstart",se),document.body.addEventListener("dragenter",Do),document.body.addEventListener("dragover",Do),document.body.addEventListener("drop",le),document.body.addEventListener("dragleave",ee),document.body.addEventListener("dragend",mi),window.addEventListener("dragover",(n)=>n.preventDefault()),window.addEventListener("drop",(n)=>n.preventDefault()),zo=!0};function he(n,a,t){let o=n.find((i)=>i[a]!==void 0&&i[a]!==null);if(o!==void 0){let i=o[a];switch(typeof i){case"string":if(i.match(/^\d+(\.\d+)?$/))return 6*t;else if(i.includes(" "))return 20*t;else return 12*t;case"number":return 6*t;case"boolean":return 5*t;case"object":return!1;default:return 8*t}}return!1}var{div:Mn,span:fa,button:de,template:ue}=g,Vo=(n)=>n;class yt extends c{select=!1;multiple=!1;nosort=!1;nohide=!1;noreorder=!1;selectionChanged=()=>{};localized=!1;selectedKey=Symbol("selected");selectBinding=(n,a)=>{n.toggleAttribute("aria-selected",a[this.selectedKey]===!0)};pinnedTop=0;pinnedBottom=0;maxVisibleRows=1e4;get value(){return{array:this.array,filter:this.filter,columns:this.columns}}set value(n){let{array:a,columns:t,filter:o}=z(n);if(this._array!==a||this._columns!==t||this._filter!==o)this.queueRender();this._array=a||[],this._columns=t||null,this._filter=o||Vo}rowData={visible:[],pinnedTop:[],pinnedBottom:[]};_array=[];_columns=null;_filter=Vo;charWidth=15;rowHeight=30;minColumnWidth=30;get virtual(){return this.rowHeight>0?{height:this.rowHeight}:void 0}constructor(){super();this.rowData=un({[this.instanceId]:this.rowData})[this.instanceId],this.initAttributes("rowHeight","charWidth","minColumnWidth","select","multiple","pinnedTop","pinnedBottom","nosort","nohide","noreorder","localized")}get array(){return this._array}set array(n){this._array=z(n),this.queueRender()}get filter(){return this._filter}set filter(n){if(this._filter!==n)this._filter=n,this.queueRender()}get sort(){if(this._sort)return this._sort;let n=this._columns?.find((t)=>t.sort==="ascending"||t.sort==="descending");if(!n)return;let{prop:a}=n;return n.sort==="ascending"?(t,o)=>t[a]>o[a]?1:-1:(t,o)=>t[a]>o[a]?-1:1}set sort(n){if(this._sort!==n)this._sort=n,this.queueRender()}get columns(){if(!Array.isArray(this._columns)){let{_array:n}=this;this._columns=Object.keys(n[0]||{}).map((a)=>{let t=he(n,a,this.charWidth);return{name:a.replace(/([a-z])([A-Z])/g,"$1 $2").toLocaleLowerCase(),prop:a,align:typeof n[0][a]==="number"||n[0][a]!==""&&!isNaN(n[0][a])?"right":"left",visible:t!==!1,width:t?t:0}})}return this._columns}set columns(n){this._columns=n,this.queueRender()}get visibleColumns(){return this.columns.filter((n)=>n.visible!==!1)}content=null;getColumn(n){let a=(n.touches!==void 0?n.touches[0].clientX:n.clientX)-this.getBoundingClientRect().x,t=n.touches!==void 0?20:5,o=0,i=[];return this.visibleColumns.find((s)=>{if(s.visible!==!1)return o+=s.width,i.push(o),Math.abs(a-o)<t})}setCursor=(n)=>{if(this.getColumn(n)!==void 0)this.style.cursor="col-resize";else this.style.cursor=""};resizeColumn=(n)=>{let a=this.getColumn(n);if(a!==void 0){let t=Number(a.width),o=n.touches!==void 0,i=o?n.touches[0].identifier:void 0;an(n,(s,e,l)=>{if((o?[...l.touches].find((d)=>d.identifier===i):!0)===void 0)return!0;let h=t+s;if(a.width=h>this.minColumnWidth?h:this.minColumnWidth,this.setColumnWidths(),l.type==="mouseup")return!0},"col-resize")}};selectRow(n,a=!0){if(a)n[this.selectedKey]=!0;else delete n[this.selectedKey]}selectRows(n,a=!0){for(let t of n||this.array)this.selectRow(t,a)}deSelect(n){this.selectRows(n,!1)}rangeStart;updateSelection=(n)=>{if(!this.select&&!this.multiple)return;let{target:a}=n;if(!(a instanceof HTMLElement))return;let t=a.closest(".tr");if(!(t instanceof HTMLElement))return;let o=dn(t);if(o===!1)return;let i=n,s=window.getSelection();if(s!==null)s.removeAllRanges();let e=this.visibleRows;if(this.multiple&&i.shiftKey&&e.length>0&&this.rangeStart!==o){let l=this.rangeStart===void 0||this.rangeStart[this.selectedKey]===!0,[h,d]=[this.rangeStart!==void 0?e.indexOf(this.rangeStart):0,e.indexOf(o)].sort((p,m)=>p-m);if(h>-1)for(let p=h;p<=d;p++){let m=e[p];this.selectRow(m,l)}}else if(this.multiple&&i.metaKey){this.selectRow(o,!o[this.selectedKey]);let l=e.indexOf(o),h=e[l+1],d=l>0?e[l-1]:void 0;if(h!==void 0&&h[this.selectedKey]===!0)this.rangeStart=h;else if(d!==void 0&&d[this.selectedKey]===!0)this.rangeStart=d;else this.rangeStart=void 0}else this.rangeStart=o,this.deSelect(),this.selectRow(o,!0);this.selectionChanged(this.visibleSelectedRows);for(let l of Array.from(this.querySelectorAll(".tr"))){let h=dn(l);this.selectBinding(l,h)}};connectedCallback(){super.connectedCallback(),this.addEventListener("mousemove",this.setCursor),this.addEventListener("mousedown",this.resizeColumn),this.addEventListener("touchstart",this.resizeColumn,{passive:!0}),this.addEventListener("mouseup",this.updateSelection),this.addEventListener("touchend",this.updateSelection)}setColumnWidths(){this.style.setProperty("--grid-columns",this.visibleColumns.map((n)=>n.width+"px").join(" ")),this.style.setProperty("--grid-row-width",this.visibleColumns.reduce((n,a)=>n+a.width,0)+"px")}sortByColumn=(n,a="auto")=>{for(let t of this.columns.filter((o)=>z(o.sort)!==!1))if(z(t)===n){if(a==="auto")t.sort=t.sort==="ascending"?"descending":"ascending";else t.sort=a;this.queueRender()}else delete t.sort};popColumnMenu=(n,a)=>{let{sortByColumn:t}=this,o=this.columns.filter((e)=>e.visible===!1),i=this.queueRender.bind(this),s=[];if(!this.nosort&&a.sort!==!1)s.push({caption:this.localized?`${B("Sort")} ${B("Ascending")}`:"Sort Ascending",icon:"sortAscending",action(){t(a)}},{caption:this.localized?`${B("Sort")} ${B("Descending")}`:"Sort Ascending",icon:"sortDescending",action(){t(a,"descending")}});if(!this.nohide){if(s.length)s.push(null);s.push({caption:this.localized?`${B("Hide")} ${B("Column")}`:"Hide Column",icon:"eyeOff",enabled:()=>a.visible!==!0,action(){a.visible=!1,i()}},{caption:this.localized?`${B("Show")} ${B("Column")}`:"Show Column",icon:"eye",enabled:()=>o.length>0,menuItems:o.map((e)=>{return{caption:e.name||e.prop,action(){delete e.visible,i()}}})})}Q({target:n,localized:this.localized,menuItems:s})};get captionSpan(){return this.localized?Sa:fa}headerCell=(n)=>{let{popColumnMenu:a}=this,t="none",o;switch(n.sort){case"ascending":o=f.sortAscending(),t="descending";break;case!1:break;default:break;case"descending":t="ascending",o=f.sortDescending()}let i=!(this.nosort&&this.nohide)?de({class:"menu-trigger",onClick(s){a(s.target,n),s.stopPropagation()}},o||f.moreVertical()):{};return n.headerCell!==void 0?n.headerCell(n):fa({class:"th",role:"columnheader",ariaSort:t,style:{...this.cellStyle,textAlign:n.align||"left"}},this.captionSpan(typeof n.name==="string"?n.name:n.prop),fa({style:{flex:"1"}}),i)};dataCell=(n)=>{if(n.dataCell!==void 0)return n.dataCell(n);return fa({class:"td",role:"cell",style:{...this.cellStyle,textAlign:n.align||"left"},bindText:`^.${n.prop}`})};get visibleRows(){return z(this.rowData.visible)}get visibleSelectedRows(){return this.visibleRows.filter((n)=>n[this.selectedKey])}get selectedRows(){return this.array.filter((n)=>n[this.selectedKey])}rowTemplate(n){return ue(Mn({class:"tr",role:"row",bind:{value:"^",binding:{toDOM:this.selectBinding}}},...n.map(this.dataCell)))}draggedColumn;dropColumn=(n)=>{let a=n.target.closest(".drag-over"),t=Array.from(a.parentElement.children).indexOf(a),o=this.visibleColumns[t],i=this.columns.indexOf(this.draggedColumn),s=this.columns.indexOf(o);this.columns.splice(i,1),this.columns.splice(s,0,this.draggedColumn),console.log({event:n,target:a,targetIndex:t,draggedIndex:i,droppedIndex:s}),this.queueRender(),n.preventDefault(),n.stopPropagation()};render(){super.render(),this.rowData.pinnedTop=this.pinnedTop>0?this._array.slice(0,this.pinnedTop):[],this.rowData.pinnedBottom=this.pinnedBottom>0?this._array.slice(this._array.length-this.pinnedBottom):[],this.rowData.visible=this.filter(this._array.slice(this.pinnedTop,Math.min(this.maxVisibleRows,this._array.length-this.pinnedTop-this.pinnedBottom)));let{sort:n}=this;if(n)this.rowData.visible.sort(n);this.textContent="",this.style.display="flex",this.style.flexDirection="column";let{visibleColumns:a}=this;if(this.style.setProperty("--row-height",`${this.rowHeight}px`),this.setColumnWidths(),!this.noreorder)bi();let t=this.instanceId+"-column-header",o=a.map((i)=>{let s=this.headerCell(i);if(!this.noreorder)s.setAttribute("draggable","true"),s.dataset.drag=t,s.dataset.drop=t,s.addEventListener("dragstart",()=>{this.draggedColumn=i}),s.addEventListener("drop",this.dropColumn);return s});if(this.append(Mn({class:"thead",role:"rowgroup",style:{touchAction:"none"}},Mn({class:"tr",role:"row"},...o))),this.pinnedTop>0)this.append(Mn({part:"pinnedTopRows",class:"tbody",role:"rowgroup",style:{flex:"0 0 auto",overflow:"hidden",height:`${this.rowHeight*this.pinnedTop}px`},bindList:{value:this.rowData.pinnedTop,virtual:this.virtual}},this.rowTemplate(a)));if(this.append(Mn({part:"visibleRows",class:"tbody",role:"rowgroup",style:{content:" ",minHeight:"100px",flex:"1 1 100px",overflow:"hidden auto"},bindList:{value:this.rowData.visible,virtual:this.virtual}},this.rowTemplate(a))),this.pinnedBottom>0)this.append(Mn({part:"pinnedBottomRows",class:"tbody",role:"rowgroup",style:{flex:"0 0 auto",overflow:"hidden",height:`${this.rowHeight*this.pinnedBottom}px`},bindList:{value:this.rowData.pinnedBottom,virtual:this.virtual}},this.rowTemplate(a)))}}var me=yt.elementCreator({tag:"xin-table",styleSpec:{":host":{overflow:"auto hidden"},":host .thead, :host .tbody":{width:r.gridRowWidth},":host .tr":{display:"grid",gridTemplateColumns:r.gridColumns,height:r.rowHeight,lineHeight:r.rowHeight},":host .td, :host .th":{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",display:"flex",alignItems:"center"},":host .th .menu-trigger":{color:"currentColor",background:"none",padding:0,lineHeight:r.touchSize,height:r.touchSize,width:r.touchSize},':host [draggable="true"]':{cursor:"ew-resize"},':host [draggable="true"]:active':{background:b.draggedHeaderBg("#0004"),color:b.draggedHeaderColor("#fff")},":host .drag-over":{background:b.dropHeaderBg("#fff4")}}}),{div:W,slot:pe}=g;class H extends c{static angleSize=15;static gridSize=8;static snapAngle=!1;static snapToGrid=!1;static styleSpec={":host":{"--handle-bg":"#fff4","--handle-color":"#2228","--handle-hover-bg":"#8ff8","--handle-hover-color":"#222","--handle-size":"20px","--handle-padding":"2px"},":host ::slotted(*)":{position:"absolute"},":host > :not(style,slot)":{boxSizing:"border-box",content:'" "',position:"absolute",display:"flex",height:r.handleSize,width:r.handleSize,padding:r.handlePadding,"--text-color":r.handleColor,background:r.handleBg},":host > .drag-size":{top:0,bottom:0,left:0,right:0,height:"auto",width:"auto",background:"transparent",cursor:"ew-resize"},':host > [part="rotate"]':{transform:`translateY(${r.handleSize_50})`},":host > [locked] > svg:first-child, :host > :not([locked]) > svg+svg":{display:"none"},":host .icon-unlock":{opacity:0.5},":host svg":{pointerEvents:"none"},":host > *:hover":{"--text-color":r.handleHoverColor,background:r.handleHoverBg}};static snappedCoords(n,a){let{gridSize:t}=H;return H.snapToGrid||n.shiftKey?a.map((o)=>Math.round(o/t)*t):a}static snappedAngle(n,a){let{angleSize:t}=H;return H.snapAngle||n.shiftKey?Math.round(a/t)*t:a}get locked(){let n=this.parentElement;if(n.style.inset)return{left:!0,top:!0,bottom:!0,right:!0};let a=n.style.right.match(/\d/)!==null,t=!a||n.style.left.match(/\d/)!==null,o=n.style.bottom.match(/\d/)!==null,i=!o||n.style.top.match(/\d/)!==null;return{left:t,top:i,bottom:o,right:a}}set locked(n){let{bottom:a,right:t}=n,{left:o,top:i}=n,s=this.parentElement,e=s.offsetLeft,l=s.offsetTop,h=s.offsetWidth,d=s.offsetHeight,p=s.offsetParent.offsetWidth-e-h,m=s.offsetParent.offsetHeight-l-d;if(Object.assign(s.style,{left:"",right:"",top:"",bottom:"",width:"",height:""}),!t)o=!0;if(!a)i=!0;if(o)s.style.left=e+"px";if(t)s.style.right=p+"px";if(o&&t)s.style.width="auto";else s.style.width=h+"px";if(i)s.style.top=l+"px";if(a)s.style.bottom=m+"px";if(i&&a)s.style.height="auto";else s.style.height=d+"px";this.queueRender()}get coords(){let{top:n,left:a,right:t,bottom:o}=this.parentElement.style;return{top:parseFloat(n),left:parseFloat(a),right:parseFloat(t),bottom:parseFloat(o)}}get left(){return this.parentElement.offsetLeft}get width(){return this.parentElement.offsetWidth}get right(){return this.parentElement.offsetParent.offsetWidth-(this.left+this.width)}get top(){return this.parentElement.offsetTop}get height(){return this.parentElement.offsetHeight}get bottom(){return this.parentElement.offsetParent.offsetHeight-(this.top+this.height)}triggerChange=()=>{this.parentElement.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))};adjustPosition=(n)=>{let{locked:a}=this;this.locked=a;let t=this.parentElement,{top:o,left:i,bottom:s,right:e}=this.coords;an(n,(l,h,d)=>{if([l,h]=H.snappedCoords(d,[l,h]),!isNaN(o))t.style.top=o+h+"px";if(!isNaN(s))t.style.bottom=s-h+"px";if(!isNaN(i))t.style.left=i+l+"px";if(!isNaN(e))t.style.right=e-l+"px";if(d.type==="mouseup")return this.triggerChange(),!0})};resize=(n)=>{let a=this.parentElement,{locked:t}=this;this.locked=Object.assign({left:!0,top:!0,right:!0,bottom:!0});let[o,i]=[this.right,this.bottom];an(n,(s,e,l)=>{let h=o-s,d=i-e;if([h,d]=H.snappedCoords(l,[h,d]),a.style.right=h+"px",a.style.bottom=d+"px",l.type==="mouseup")return this.locked=t,this.triggerChange(),!0})};adjustSize=(n)=>{let a=this.parentElement,{locked:t}=this,o=n.target.getAttribute("part");this.locked=Object.assign({left:!0,right:!0,top:!0,bottom:!0});let i=this[o];an(n,(s,e,l)=>{let[h]=H.snappedCoords(l,[i+(["left","right"].includes(o)?s:e)*(["right","bottom"].includes(o)?-1:1)]);if(a.style[o]=h+"px",l.type==="mouseup")return this.locked=t,this.triggerChange(),!0})};get rect(){return this.parentElement.getBoundingClientRect()}get center(){let n=this.parentElement.getBoundingClientRect();return{x:n.x+n.width*0.5,y:n.y+n.height*0.5}}get element(){return this.parentElement}adjustRotation=(n)=>{let{center:a}=this,{transformOrigin:t}=this.element.style;if(!t)this.element.style.transformOrigin="50% 50%";an(n,(o,i,s)=>{let{clientX:e,clientY:l}=s,h=e-a.x,d=l-a.y,p=d>0?90:-90;if(h!==0)p=Math.atan2(d,h)*180/Math.PI;if(p=H.snappedAngle(s,p),p===0)this.element.style.transformOrigin="",this.element.style.transform="";else this.element.style.transform=`rotate(${p}deg)`;return this.triggerChange(),s.type==="mouseup"})};toggleLock=(n)=>{let{locked:a}=this,t=n.target.title.split(" ")[1];a[t]=!a[t],this.locked=a,this.queueRender(),n.stopPropagation(),n.preventDefault()};content=()=>[W({part:"move",style:{top:"50%",left:"50%",transform:"translate(-50%,-50%)"}},f.move()),W({part:"left",title:"resize left",class:"drag-size",style:{left:"-6px",width:"8px"}}),W({part:"right",title:"resize right",class:"drag-size",style:{left:"calc(100% - 2px)",width:"8px"}}),W({part:"top",title:"resize top",class:"drag-size",style:{top:"-6px",height:"8px",cursor:"ns-resize"}}),W({part:"bottom",title:"resize bottom",class:"drag-size",style:{top:"calc(100% - 2px)",height:"8px",cursor:"ns-resize"}}),W({part:"resize",style:{top:"100%",left:"100%"}},f.resize()),W({part:"rotate",style:{top:"50%",right:"0"}},f.refresh()),W({part:"lockLeft",title:"lock left",style:{top:"50%",left:0,transform:"translate(-100%, -50%)"}},f.unlock(),f.lock()),W({part:"lockRight",title:"lock right",style:{top:"50%",left:"100%",transform:"translate(0%, -50%)"}},f.unlock(),f.lock()),W({part:"lockTop",title:"lock top",style:{top:0,left:"50%",transform:"translate(-50%, -100%)"}},f.unlock(),f.lock()),W({part:"lockBottom",title:"lock bottom",style:{top:"100%",left:"50%",transform:"translate(-50%, 0%)"}},f.unlock(),f.lock()),pe()];constructor(){super();this.initAttributes("rotationSnap","positionSnap")}connectedCallback(){super.connectedCallback();let{left:n,right:a,top:t,bottom:o,lockLeft:i,lockRight:s,lockTop:e,lockBottom:l,move:h,resize:d,rotate:p}=this.parts,m={passive:!0};[n,a,t,o].forEach((u)=>{u.addEventListener("mousedown",this.adjustSize,m),u.addEventListener("touchstart",this.adjustSize,m)}),[i,s,e,l].forEach((u)=>{u.addEventListener("click",this.toggleLock)}),d.addEventListener("mousedown",this.resize,m),h.addEventListener("mousedown",this.adjustPosition,m),p.addEventListener("mousedown",this.adjustRotation,m),d.addEventListener("touchstart",this.resize,m),h.addEventListener("touchstart",this.adjustPosition,m),p.addEventListener("touchstart",this.adjustRotation,m)}render(){if(super.render(),!this.parentElement)return;let{lockLeft:n,lockRight:a,lockTop:t,lockBottom:o}=this.parts,{left:i,right:s,top:e,bottom:l}=this.locked;n.toggleAttribute("locked",i),a.toggleAttribute("locked",s),t.toggleAttribute("locked",e),o.toggleAttribute("locked",l)}}var be=H.elementCreator({tag:"xin-editable"}),{div:ye,input:ce,select:Xo,option:Un,button:it,span:ge}=g,Wo=(n)=>n,Ho="null filter, everything matches",ct={contains:{caption:"contains",negative:"does not contain",makeTest:(n)=>{return n=n.toLocaleLowerCase(),(a)=>String(a).toLocaleLowerCase().includes(n)}},hasTags:{caption:"has tags",makeTest:(n)=>{let a=n.split(/[\s,]/).map((t)=>t.trim().toLocaleLowerCase()).filter((t)=>t!=="");return console.log(a),(t)=>Array.isArray(t)&&a.find((o)=>!t.includes(o))===void 0}},doesNotHaveTags:{caption:"does not have tags",makeTest:(n)=>{let a=n.split(/[\s,]/).map((t)=>t.trim().toLocaleLowerCase()).filter((t)=>t!=="");return console.log(a),(t)=>Array.isArray(t)&&a.find((o)=>t.includes(o))===void 0}},equals:{caption:"=",negative:"≠",makeTest:(n)=>{if(isNaN(Number(n)))return n=String(n).toLocaleLowerCase(),(t)=>String(t).toLocaleLowerCase()===n;let a=Number(n);return(t)=>Number(t)===a}},after:{caption:"is after",negative:"is before",makeTest:(n)=>{let a=new Date(n);return(t)=>new Date(t)>a}},greaterThan:{caption:">",negative:"≤",makeTest:(n)=>{if(!isNaN(Number(n))){let a=Number(n);return(t)=>Number(t)>a}return n=n.toLocaleLowerCase(),(a)=>String(a).toLocaleLowerCase()>n}},truthy:{caption:"is true/non-empty/non-zero",negative:"is false/empty/zero",needsValue:!1,makeTest:()=>(n)=>!!n},isTrue:{caption:"= true",needsValue:!1,makeTest:()=>(n)=>n===!0},isFalse:{caption:"= false",needsValue:!1,makeTest:()=>(n)=>n===!1}},fe={description:"anything",test:()=>!0};function Fo(n){return n.options[n.selectedIndex].text}class gt extends c{fields=[];filters=ct;haystack="*";condition="";needle="";content=()=>[Xo({part:"haystack"}),f.chevronDown(),Xo({part:"condition"}),f.chevronDown(),ce({part:"needle",type:"search"}),ge({part:"padding"}),it({part:"remove",title:"delete"},f.trash())];filter=fe;constructor(){super();this.initAttributes("haystack","condition","needle")}get state(){let{haystack:n,needle:a,condition:t}=this.parts;return{haystack:n.value,needle:a.value,condition:t.value}}set state(n){Object.assign(this,n)}buildFilter=()=>{let{haystack:n,condition:a,needle:t}=this.parts,o=a.value.startsWith("~"),i=o?a.value.slice(1):a.value,s=this.filters[i];t.hidden=s.needsValue===!1;let e=s.needsValue===!1?s.makeTest(void 0):s.makeTest(t.value),l=n.value,h;if(l!=="*")h=o?(m)=>!e(m[l]):(m)=>e(m[l]);else h=o?(m)=>Object.values(m).find((u)=>!e(u))!==void 0:(m)=>Object.values(m).find((u)=>e(u))!==void 0;let d=s.needsValue!==!1?` "${t.value}"`:"",p=`${Fo(n)} ${Fo(a)}${d}`;this.filter={description:p,test:h},this.parentElement?.dispatchEvent(new Event("change"))};connectedCallback(){super.connectedCallback();let{haystack:n,condition:a,needle:t,remove:o}=this.parts;n.addEventListener("change",this.buildFilter),a.addEventListener("change",this.buildFilter),t.addEventListener("input",this.buildFilter),n.value=this.haystack,a.value=this.condition,t.value=this.needle,o.addEventListener("click",()=>{let{parentElement:i}=this;this.remove(),i?.dispatchEvent(new Event("change"))})}render(){super.render();let{haystack:n,condition:a,needle:t}=this.parts;n.textContent="",n.append(Un("any field",{value:"*"}),...this.fields.map((i)=>{let s=i.name||i.prop;return Un(`${s}`,{value:i.prop})})),a.textContent="";let o=Object.keys(this.filters).map((i)=>{let s=this.filters[i];return s.negative!==void 0?[Un(s.caption,{value:i}),Un(s.negative,{value:"~"+i})]:Un(s.caption,{value:i})}).flat();if(a.append(...o),this.haystack!=="")n.value=this.haystack;if(this.condition!=="")a.value=this.condition;if(this.needle!=="")t.value=this.needle;this.buildFilter()}}var Ca=gt.elementCreator({tag:"xin-filter-part",styleSpec:{":host":{display:"flex"},':host svg[class^="icon-"]:':{height:"var(--font-size, 16px)",verticalAlign:"middle",fill:"var(--text-color)",pointerEvents:"none"},':host [part="haystack"], :host [part="condition"]':{flex:"1"},':host [part="needle"]':{flex:2},':host [hidden]+[part="padding"]':{display:"block",content:" ",flex:"1 1 auto"}}});class ft extends c{_fields=[];get fields(){return this._fields}set fields(n){this._fields=n,this.queueRender()}get state(){let{filterContainer:n}=this.parts;return[...n.children].map((a)=>a.state)}set state(n){let{fields:a,filters:t}=this,{filterContainer:o}=this.parts;o.textContent="";for(let i of n)o.append(Ca({fields:a,filters:t,...i}))}filter=Wo;description=Ho;addFilter=()=>{let{fields:n,filters:a}=this,{filterContainer:t}=this.parts;t.append(Ca({fields:n,filters:a}))};content=()=>[it({part:"add",title:"add filter condition",onClick:this.addFilter,class:"round"},f.plus()),ye({part:"filterContainer"}),it({part:"reset",title:"reset filter",onClick:this.reset},f.x())];filters=ct;reset=()=>{let{fields:n,filters:a}=this,{filterContainer:t}=this.parts;this.description=Ho,this.filter=Wo,t.textContent="",t.append(Ca({fields:n,filters:a})),this.dispatchEvent(new Event("change"))};buildFilter=()=>{let{filterContainer:n}=this.parts;if(n.children.length===0){this.reset();return}let a=[...n.children].map((o)=>o.filter),t=a.map((o)=>o.test);this.description=a.map((o)=>o.description).join(", "),this.filter=(o)=>o.filter((i)=>t.find((s)=>s(i)===!1)===void 0),this.dispatchEvent(new Event("change"))};connectedCallback(){super.connectedCallback();let{filterContainer:n}=this.parts;n.addEventListener("change",this.buildFilter),this.reset()}render(){super.render()}}var we=ft.elementCreator({tag:"xin-filter",styleSpec:{":host":{height:"auto",display:"grid",gridTemplateColumns:"32px calc(100% - 64px) 32px",alignItems:"center"},':host [part="filterContainer"]':{display:"flex",flexDirection:"column",alignItems:"stretch",flex:"1 1 auto"},':host [part="add"], :host [part="reset"]':{"--button-size":"var(--touch-size, 32px)",borderRadius:"999px",height:"var(--button-size)",lineHeight:"var(--button-size)",margin:"0",padding:"0",textAlign:"center",width:"var(--button-size)",flex:"0 0 var(--button-size)"}}}),{form:ve,slot:La,xinSlot:No,label:xe,input:Ce,span:je}=g;function pn(n,a,t){if(t!==""&&t!==!1)n.setAttribute(a,t);else n.removeAttribute(a)}function Se(n){switch(n.type){case"checkbox":return n.checked;case"radio":{let a=n.parentElement?.querySelector(`input[type="radio"][name="${n.name}"]:checked`);return a?a.value:null}case"range":case"number":return Number(n.value);default:return Array.isArray(n.value)&&n.value.length===0?null:n.value}}function Yo(n,a){if(!(n instanceof HTMLElement));else if(n instanceof HTMLInputElement)switch(n.type){case"checkbox":n.checked=a;break;case"radio":n.checked=a===n.value;break;default:n.value=String(a||"")}else if(a!=null||n.value!=null)n.value=String(a||"")}class Ma extends c{caption="";key="";type="";optional=!1;pattern="";placeholder="";min="";max="";step="";fixedPrecision=-1;value=null;content=xe(No({part:"caption"}),je({part:"field"},No({part:"input",name:"input"}),Ce({part:"valueHolder"})));constructor(){super();this.initAttributes("caption","key","type","optional","pattern","placeholder","min","max","step","fixedPrecision","prefix","suffix")}valueChanged=!1;handleChange=()=>{let{input:n,valueHolder:a}=this.parts,t=n.children[0]||a;if(t!==a)a.value=t.value;this.value=Se(t),this.valueChanged=!0;let o=this.closest("xin-form");if(o&&this.key!=="")switch(this.type){case"checkbox":o.fields[this.key]=t.checked;break;case"number":case"range":if(this.fixedPrecision>-1)t.value=Number(t.value).toFixed(this.fixedPrecision),o.fields[this.key]=Number(t.value);else o.fields[this.key]=Number(t.value);break;default:o.fields[this.key]=t.value}};initialize(n){let a=n.fields[this.key]!==void 0?n.fields[this.key]:this.value;if(a!=null&&a!==""){if(n.fields[this.key]==null)n.fields[this.key]=a;this.value=a}}connectedCallback(){super.connectedCallback();let{input:n,valueHolder:a}=this.parts,t=this.closest(Qn.tagName);if(t instanceof Qn)this.initialize(t);a.addEventListener("change",this.handleChange),n.addEventListener("change",this.handleChange,!0)}render(){if(this.valueChanged){this.valueChanged=!1;return}let{input:n,caption:a,valueHolder:t,field:o}=this.parts;if(a.textContent?.trim()==="")a.append(this.caption!==""?this.caption:this.key);if(this.type==="text"){n.textContent="";let i=g.textarea({value:this.value});if(this.placeholder)i.setAttribute("placeholder",this.placeholder);n.append(i)}else if(this.type==="color")n.textContent="",n.append(ko({value:this.value}));else if(n.children.length===0)pn(t,"placeholder",this.placeholder),pn(t,"type",this.type),pn(t,"pattern",this.pattern),pn(t,"min",this.min),pn(t,"max",this.max),pn(t,"step",this.step);if(Yo(t,this.value),Yo(n.children[0],this.value),this.prefix?o.setAttribute("prefix",this.prefix):o.removeAttribute("prefix"),this.suffix?o.setAttribute("suffix",this.suffix):o.removeAttribute("suffix"),t.classList.toggle("hidden",n.children.length>0),n.children.length>0)t.setAttribute("tabindex","-1");else t.removeAttribute("tabindex");n.style.display=n.children.length===0?"none":"",pn(t,"required",!this.optional)}}class Qn extends c{context={};value={};get isValid(){return[...this.querySelectorAll("*")].filter((n)=>n.required!==void 0).find((n)=>!n.reportValidity())===void 0}static styleSpec={":host":{display:"flex",flexDirection:"column"},":host::part(header), :host::part(footer)":{display:"flex"},":host::part(content)":{display:"flex",flexDirection:"column",overflow:"hidden auto",height:"100%",width:"100%",position:"relative",boxSizing:"border-box"},":host form":{display:"flex",flex:"1 1 auto",position:"relative",overflow:"hidden"}};content=[La({part:"header",name:"header"}),ve({part:"form"},La({part:"content"})),La({part:"footer",name:"footer"})];getField=(n)=>{return this.querySelector(`xin-field[key="${n}"]`)};get fields(){if(typeof this.value==="string")try{this.value=JSON.parse(this.value)}catch(t){console.log("<xin-form> could not use its value, expects valid JSON"),this.value={}}let{getField:n}=this,a=this.dispatchEvent.bind(this);return new Proxy(this.value,{get(t,o){return t[o]},set(t,o,i){if(t[o]!==i){t[o]=i;let s=n(o);if(s)s.value=i;a(new Event("change"))}return!0}})}set fields(n){let a=[...this.querySelectorAll(Ma.tagName)];for(let t of a)t.value=n[t.key]}submit=()=>{this.parts.form.dispatchEvent(new Event("submit"))};handleSubmit=(n)=>{n.preventDefault(),n.stopPropagation(),this.submitCallback(this.value,this.isValid)};submitCallback=(n,a)=>{console.log("override submitCallback to handle this data",{value:n,isValid:a})};connectedCallback(){super.connectedCallback();let{form:n}=this.parts;n.addEventListener("submit",this.handleSubmit)}}var Me=Ma.elementCreator({tag:"xin-field",styleSpec:{':host [part="field"]':{position:"relative",display:"flex",alignItems:"center",gap:b.prefixSuffixGap("8px")},':host [part="field"][prefix]::before':{content:"attr(prefix)"},':host [part="field"][suffix]::after':{content:"attr(suffix)"},':host [part="field"] > *, :host [part="input"] > *':{width:"100%"},":host textarea":{resize:"none"},':host input[type="checkbox"]':{width:"fit-content"},":host .hidden":{position:"absolute",pointerEvents:"none",opacity:0}}}),_e=Qn.elementCreator({tag:"xin-form"});function yi(){return navigator.getGamepads().filter((n)=>n!==null).map((n)=>{let{id:a,axes:t,buttons:o}=n;return{id:a,axes:t,buttons:o.map((i,s)=>{let{pressed:e,value:l}=i;return{index:s,pressed:e,value:l}}).filter((i)=>i.pressed||i.value!==0).reduce((i,s)=>{return i[s.index]=s.value,i},{})}})}function Ae(){let n=yi();return n.length===0?"no active gamepads":n.map(({id:a,axes:t,buttons:o})=>{let i=t.map((e)=>e.toFixed(2)).join(" "),s=Object.keys(o).map((e)=>`[${e}](${o[Number(e)].toFixed(2)})`).join(" ");return`${a}
${i}
${s}`}).join(`
`)}function Ie(n){let a={};return n.input.onControllerAddedObservable.add((t)=>{t.onMotionControllerInitObservable.add((o)=>{let i={};o.getComponentIds().forEach((s)=>{let e=o.getComponent(s);if(i[s]={pressed:e.pressed},e.onButtonStateChangedObservable.add(()=>{i[s].pressed=e.pressed}),e.onAxisValueChangedObservable)i[s].axes=[],e.onAxisValueChangedObservable.add((l)=>{i[s].axes=l})}),a[o.handedness]=i})}),a}function Pe(n){if(n===void 0||Object.keys(n).length===0)return"no xr inputs";return Object.keys(n).map((a)=>{let t=n[a],o=Object.keys(t).filter((i)=>t[i].pressed).join(" ");return`${a}
${o}`}).join(`
`)}var{div:bn,slot:qo,span:Be,button:Oe}=g;class wt extends c{value=0;localized=!1;makeTab(n,a,t){let o=a.getAttribute("name"),i=a.querySelector('template[role="tab"]')?.content.cloneNode(!0)||(this.localized?Sa(o):Be(o));return bn(i,{part:"tab",tabindex:0,role:"tab",ariaControls:t},a.hasAttribute("data-close")?Oe({title:"close",class:"close"},f.x()):{})}static styleSpec={":host":{display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",boxShadow:"none !important"},slot:{position:"relative",display:"block",flex:"1",overflow:"hidden",overflowY:"auto"},'slot[name="after-tabs"]':{flex:"0 0 auto"},"::slotted([hidden])":{display:"none !important"},":host::part(tabpanel)":{display:"flex",flexDirection:"column",overflowX:"auto"},":host::part(tabrow)":{display:"flex"},":host .tabs":{display:"flex",userSelect:"none",whiteSpace:"nowrap"},":host .tabs > div":{padding:`${r.spacing50} ${r.spacing}`,cursor:"default",display:"flex",alignItems:"baseline"},':host .tabs > [aria-selected="true"]':{"--text-color":r.xinTabsSelectedColor,color:r.textColor},":host .elastic":{flex:"1"},":host .border":{background:"var(--xin-tabs-bar-color, #ccc)"},":host .border > .selected":{content:" ",width:0,height:"var(--xin-tabs-bar-height, 2px)",background:r.xinTabsSelectedColor,transition:"ease-out 0.2s"},":host button.close":{fill:r.textColor,border:0,background:"transparent",textAlign:"center",marginLeft:r.spacing50,padding:0},":host button.close > svg":{height:"12px"}};onCloseTab=null;content=[bn({role:"tabpanel",part:"tabpanel"},bn({part:"tabrow"},bn({class:"tabs",part:"tabs"}),bn({class:"elastic"}),qo({name:"after-tabs"})),bn({class:"border"},bn({class:"selected",part:"selected"}))),qo()];constructor(){super();this.initAttributes("localized")}addTabBody(n,a=!1){if(!n.hasAttribute("name"))throw console.error("element has no name attribute",n),new Error("element has no name attribute");if(this.append(n),this.setupTabs(),a)this.value=this.bodies.length-1;this.queueRender()}removeTabBody(n){n.remove(),this.setupTabs(),this.queueRender()}keyTab=(n)=>{let{tabs:a}=this.parts,t=[...a.children].indexOf(n.target);switch(n.key){case"ArrowLeft":this.value=(t+Number(a.children.length)-1)%a.children.length,a.children[this.value].focus(),n.preventDefault();break;case"ArrowRight":this.value=(t+1)%a.children.length,a.children[this.value].focus(),n.preventDefault();break;case" ":this.pickTab(n),n.preventDefault();break;default:}};get bodies(){return[...this.children].filter((n)=>n.hasAttribute("name"))}pickTab=(n)=>{let{tabs:a}=this.parts,t=n.target,o=t.closest("button.close")!==null,i=t.closest(".tabs > div"),s=[...a.children].indexOf(i);if(o){let e=this.bodies[s];if(!this.onCloseTab||this.onCloseTab(e)!==!1)this.removeTabBody(this.bodies[s])}else if(s>-1)this.value=s};setupTabs=()=>{let{tabs:n}=this.parts,a=[...this.children].filter((t)=>!t.hasAttribute("slot")&&t.hasAttribute("name"));if(n.textContent="",this.value>=a.length)this.value=a.length-1;for(let t in a){let o=a[t],i=`${this.instanceId}-${t}`;o.id=i;let s=this.makeTab(this,o,i);n.append(s)}};connectedCallback(){super.connectedCallback();let{tabs:n}=this.parts;n.addEventListener("click",this.pickTab),n.addEventListener("keydown",this.keyTab),this.setupTabs(),J.allInstances.add(this)}disconnectedCallback(){super.disconnectedCallback(),J.allInstances.delete(this)}localeChanged=()=>{this.queueRender()};onResize(){this.queueRender()}render(){let{tabs:n,selected:a}=this.parts,t=this.bodies;for(let o=0;o<t.length;o++){let i=t[o],s=n.children[o];if(this.value===Number(o))s.setAttribute("aria-selected","true"),a.style.marginLeft=`${s.offsetLeft-n.offsetLeft}px`,a.style.width=`${s.offsetWidth}px`,i.toggleAttribute("hidden",!1);else s.toggleAttribute("aria-selected",!1),i.toggleAttribute("hidden",!0)}}}var ci=wt.elementCreator({tag:"xin-tabs"}),{div:wa,xinSlot:Ee,style:Te,button:yn,h4:De,pre:ze}=g,Ve=(async()=>{}).constructor;class On extends c{persistToDom=!1;prettier=!1;prefix="lx";storageKey="live-example-payload";context={};uuid=crypto.randomUUID();remoteId="";lastUpdate=0;interval;static insertExamples(n,a={}){let t=[...n.querySelectorAll(".language-html,.language-js,.language-css")].filter((o)=>!o.closest(On.tagName)).map((o)=>({block:o.parentElement,language:o.classList[0].split("-").pop(),code:o.innerText}));for(let o=0;o<t.length;o+=1){let i=[t[o]];while(o<t.length-1&&t[o].block.nextElementSibling===t[o+1].block)i.push(t[o+1]),o+=1;let s=_a({context:a});i[0].block.parentElement.insertBefore(s,i[0].block),i.forEach((e)=>{switch(e.language){case"js":s.js=e.code;break;case"html":s.html=e.code;break;case"css":s.css=e.code;break}e.block.remove()}),s.showDefaultTab()}}constructor(){super();this.initAttributes("persistToDom","prettier")}get activeTab(){let{editors:n}=this.parts;return[...n.children].find((a)=>a.getAttribute("hidden")===null)}getEditorValue(n){return this.parts[n].value}setEditorValue(n,a){let t=this.parts[n];t.value=a}get css(){return this.getEditorValue("css")}set css(n){this.setEditorValue("css",n)}get html(){return this.getEditorValue("html")}set html(n){this.setEditorValue("html",n)}get js(){return this.getEditorValue("js")}set js(n){this.setEditorValue("js",n)}updateUndo=()=>{let{activeTab:n}=this,{undo:a,redo:t}=this.parts;if(n instanceof Pn&&n.editor!==void 0){let o=n.editor.session.getUndoManager();a.disabled=!o.hasUndo(),t.disabled=!o.hasRedo()}else a.disabled=!0,t.disabled=!0};undo=()=>{let{activeTab:n}=this;if(n instanceof Pn)n.editor.undo()};redo=()=>{let{activeTab:n}=this;if(n instanceof Pn)n.editor.redo()};get isMaximized(){return this.classList.contains("-maximize")}flipLayout=()=>{this.classList.toggle("-vertical")};exampleMenu=()=>{Q({target:this.parts.exampleWidgets,width:"auto",menuItems:[{icon:"edit",caption:"view/edit code",action:this.showCode},{icon:"editDoc",caption:"view/edit code in a new window",action:this.openEditorWindow},null,{icon:this.isMaximized?"minimize":"maximize",caption:this.isMaximized?"restore preview":"maximize preview",action:this.toggleMaximize}]})};content=()=>[wa({part:"example"},Te({part:"style"}),yn({title:"example menu",part:"exampleWidgets",onClick:this.exampleMenu},f.code())),wa({class:"code-editors",part:"codeEditors",hidden:!0},De("Code"),yn({title:"close code",class:"transparent close-button",onClick:this.closeCode},f.x()),ci({part:"editors",onChange:this.updateUndo},va({name:"js",mode:"javascript",part:"js"}),va({name:"html",mode:"html",part:"html"}),va({name:"css",mode:"css",part:"css"}),wa({slot:"after-tabs",class:"row"},yn({title:"undo",part:"undo",class:"transparent",onClick:this.undo},f.undo()),yn({title:"redo",part:"redo",class:"transparent",onClick:this.redo},f.redo()),yn({title:"flip direction",class:"transparent",onClick:this.flipLayout},f.sidebar()),yn({title:"copy as markdown",class:"transparent",onClick:this.copy},f.copy()),yn({title:"reload",class:"transparent",onClick:this.refreshRemote},f.refresh())))),Ee({part:"sources",hidden:!0})];connectedCallback(){super.connectedCallback();let{sources:n}=this.parts;this.initFromElements([...n.children]),addEventListener("storage",this.remoteChange),this.interval=setInterval(this.remoteChange,500),this.undoInterval=setInterval(this.updateUndo,250)}disconnectedCallback(){super.disconnectedCallback();let{storageKey:n,remoteKey:a}=this;clearInterval(this.interval),clearInterval(this.undoInterval),localStorage.setItem(n,JSON.stringify({remoteKey:a,sentAt:Date.now(),close:!0}))}copy=()=>{let n=this.js!==""?"```js\n"+this.js.trim()+"\n```\n":"",a=this.html!==""?"```html\n"+this.html.trim()+"\n```\n":"",t=this.css!==""?"```css\n"+this.css.trim()+"\n```\n":"";navigator.clipboard.writeText(n+a+t)};toggleMaximize=()=>{this.classList.toggle("-maximize")};get remoteKey(){return this.remoteId!==""?this.prefix+"-"+this.remoteId:this.prefix+"-"+this.uuid}remoteChange=(n)=>{let a=localStorage.getItem(this.storageKey);if(n instanceof StorageEvent&&n.key!==this.storageKey)return;if(a===null)return;let{remoteKey:t,sentAt:o,css:i,html:s,js:e,close:l}=JSON.parse(a);if(o<=this.lastUpdate)return;if(t!==this.remoteKey)return;if(l===!0)window.close();console.log("received new code",o,this.lastUpdate),this.lastUpdate=o,this.css=i,this.html=s,this.js=e,this.refresh()};showCode=()=>{this.classList.add("-maximize"),this.classList.toggle("-vertical",this.offsetHeight>this.offsetWidth),this.parts.codeEditors.hidden=!1};closeCode=()=>{if(this.remoteId!=="")window.close();else this.classList.remove("-maximize"),this.parts.codeEditors.hidden=!0};openEditorWindow=()=>{let{storageKey:n,remoteKey:a,css:t,html:o,js:i,uuid:s,prefix:e}=this,l=location.href.split("?")[0]+`?${e}=${s}`;localStorage.setItem(n,JSON.stringify({remoteKey:a,sentAt:Date.now(),css:t,html:o,js:i})),window.open(l)};refreshRemote=()=>{let{remoteKey:n,css:a,html:t,js:o}=this;localStorage.setItem(this.storageKey,JSON.stringify({remoteKey:n,sentAt:Date.now(),css:a,html:t,js:o}))};updateSources=()=>{if(this.persistToDom){let{sources:n}=this.parts;n.innerText="";for(let a of["js","css","html"])if(this[a])n.append(ze({class:`language-${a}`,innerHTML:this[a]}))}};refresh=()=>{if(this.remoteId!=="")return;let{example:n,style:a}=this.parts,t=wa({class:"preview"});t.innerHTML=this.html,a.innerText=this.css;let o=n.querySelector(".preview");if(o)o.replaceWith(t);else n.insertBefore(t,this.parts.exampleWidgets);let i={preview:t,...this.context};try{if(new Ve(...Object.keys(i),this.js)(...Object.values(i)).catch((s)=>console.error(s)),this.persistToDom)this.updateSources()}catch(s){console.error(s),window.alert(`Error: ${s}, the console may have more information…`)}};initFromElements(n){for(let a of n){a.hidden=!0;let[t,...o]=a.innerHTML.split(`
`);if(["js","html","css"].includes(t)){let i=o.filter((e)=>e.trim()!=="").map((e)=>e.match(/^\s*/)[0].length).sort()[0],s=(i>0?o.map((e)=>e.substring(i)):o).join(`
`);this.parts[t].value=s}else{let i=["js","html","css"].find((s)=>a.matches(`.language-${s}`));if(i)this.parts[i].value=i==="html"?a.innerHTML:a.innerText}}}showDefaultTab(){let{editors:n}=this.parts;if(this.js!=="")n.value=0;else if(this.html!=="")n.value=1;else if(this.css!=="")n.value=2}render(){if(super.render(),this.remoteId!==""){let n=localStorage.getItem(this.storageKey);if(n!==null){let{remoteKey:a,sentAt:t,css:o,html:i,js:s}=JSON.parse(n);if(this.remoteKey!==a)return;this.lastUpdate=t,this.css=o,this.html=i,this.js=s,this.parts.example.hidden=!0,this.parts.codeEditors.hidden=!1,this.classList.add("-maximize"),this.updateUndo()}}else this.refresh()}}var _a=On.elementCreator({tag:"xin-example",styleSpec:{":host":{"--xin-example-height":"320px","--code-editors-bar-bg":"#777","--code-editors-bar-color":"#fff","--widget-bg":"#fff8","--widget-color":"#000",position:"relative",display:"flex",height:"var(--xin-example-height)",background:"var(--background)",boxSizing:"border-box"},":host.-maximize":{position:"fixed",left:"0",top:"0",height:"100vh",width:"100vw",margin:"0 !important"},".-maximize":{zIndex:101},":host.-vertical":{flexDirection:"column"},":host .icon-sidebar":{transform:"rotateZ(180deg)"},":host.-vertical .icon-sidebar":{transform:"rotateZ(270deg)"},":host.-maximize .hide-if-maximized, :host:not(.-maximize) .show-if-maximized":{display:"none"},':host [part="example"]':{flex:"1 1 50%",height:"100%",position:"relative",overflowX:"auto"},":host .preview":{height:"100%",position:"relative",overflow:"hidden",boxShadow:"inset 0 0 0 2px #8883"},':host [part="editors"]':{flex:"1 1 200px",height:"100%",position:"relative"},':host [part="exampleWidgets"]':{position:"absolute",left:"5px",bottom:"5px","--widget-color":"var(--brand-color)",borderRadius:"5px",width:"44px",height:"44px",lineHeight:"44px",zIndex:"100"},':host [part="exampleWidgets"] svg':{fill:"var(--widget-color)"},":host .code-editors":{overflow:"hidden",background:"white",position:"relative",top:"0",right:"0",flex:"1 1 50%",height:"100%",flexDirection:"column",zIndex:"10"},":host .code-editors:not([hidden])":{display:"flex"},":host .code-editors > h4":{padding:"5px",margin:"0",textAlign:"center",background:"var(--code-editors-bar-bg)",color:"var(--code-editors-bar-color)",cursor:"move"},":host .close-button":{position:"absolute",top:"0",right:"0",color:"var(--code-editors-bar-color)"},":host button.transparent, :host .sizer":{width:"32px",height:"32px",lineHeight:"32px",textAlign:"center",padding:"0",margin:"0"},":host .sizer":{cursor:"nwse-resize"}}});function Xe(n){let a=[...n.querySelectorAll("pre")].filter((t)=>["js","html","css","json"].includes(t.innerText.split(`
`)[0]));for(let t=0;t<a.length;t++){let o=[a[t]];while(a[t].nextElementSibling===a[t+1])o.push(a[t+1]),t+=1;let i=_a();n.insertBefore(i,o[0]),i.initFromElements(o)}}var We=new URL(window.location.href).searchParams,Go=We.get("lx");if(Go)document.title+=" [code editor]",document.body.textContent="",document.body.append(_a({remoteId:Go}));var{div:He}=g;class gn extends c{coords="65.01715565258993,25.48081004203459,12";content=He({style:{width:"100%",height:"100%"}});get map(){return this._map}mapStyle="mapbox://styles/mapbox/streets-v12";token="";static mapboxCSSAvailable;static mapboxAvailable;_map;static styleSpec={":host":{display:"inline-block",position:"relative",width:"400px",height:"400px",textAlign:"left"}};constructor(){super();if(this.initAttributes("coords","token","mapStyle"),gn.mapboxCSSAvailable===void 0)gn.mapboxCSSAvailable=Uo("https://api.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.css").catch((n)=>{console.error("failed to load mapbox-gl.css",n)}),gn.mapboxAvailable=fn("https://api.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.js").catch((n)=>{console.error("failed to load mapbox-gl.js",n)})}connectedCallback(){if(super.connectedCallback(),!this.token)console.error("mapbox requires an access token which you can provide via the token attribute")}render(){if(super.render(),!this.token)return;let{div:n}=this.parts,[a,t,o]=this.coords.split(",").map((i)=>Number(i));if(this.map)this.map.remove();gn.mapboxAvailable.then(({mapboxgl:i})=>{console.log("%cmapbox may complain about missing css -- don't panic!","background: orange; color: black; padding: 0 5px;"),i.accessToken=this.token,this._map=new i.Map({container:n,style:this.mapStyle,zoom:o,center:[t,a]}),this._map.on("render",()=>this._map.resize())})}}var Fe=gn.elementCreator({tag:"xin-map"});function gi(n,a){if(a==null)a="";else if(typeof a!=="string")a=String(a);return a.replace(/\{\{([^}]+)\}\}/g,(t,o)=>{let i=I[`${n}${o.startsWith("[")?o:"."+o}`];return i===void 0?t:gi(n,String(i))})}class vt extends c{src="";value="";content=null;elements=!1;context={};constructor(){super();this.initAttributes("src","elements","context")}connectedCallback(){if(super.connectedCallback(),this.src!=="")(async()=>{let n=await fetch(this.src);this.value=await n.text()})();else if(this.value==="")if(this.elements)this.value=this.innerHTML;else this.value=this.textContent!=null?this.textContent:""}didRender=()=>{};render(){super.render(),I[this.instanceId]=typeof this.context==="string"?JSON.parse(this.context):this.context;let n=gi(this.instanceId,this.value);if(this.elements){let a=n.split(`
`).reduce((t,o)=>{if(o.startsWith("<")||t.length===0)t.push(o);else{let i=t[t.length-1];if(!i.startsWith("<")||!i.endsWith(">"))t[t.length-1]+=`
`+o;else t.push(o)}return t},[]);this.innerHTML=a.map((t)=>t.startsWith("<")&&t.endsWith(">")?t:C(t,{mangle:!1,headerIds:!1})).join("")}else this.innerHTML=C(n,{mangle:!1,headerIds:!1});this.didRender()}}var xt=vt.elementCreator({tag:"xin-md"}),{div:ka,button:Ne}=g,Ye={error:"red",warn:"orange",info:"royalblue",log:"gray",success:"green",progress:"royalblue"};class wn extends c{static singleton;static styleSpec={":host":{_notificationSpacing:8,_notificationWidth:360,_notificationPadding:`${r.notificationSpacing} ${r.notificationSpacing50} ${r.notificationSpacing} ${r.notificationSpacing200}`,_notificationBg:"#fafafa",_notificationAccentColor:"#aaa",_notificationTextColor:"#444",_notificationIconSize:r.notificationSpacing300,_notificationButtonSize:48,_notificationBorderWidth:"3px 0 0",_notificationBorderRadius:r.notificationSpacing50,position:"fixed",left:0,right:0,bottom:0,paddingBottom:r.notificationSpacing,width:r.notificationWidth,display:"flex",flexDirection:"column-reverse",margin:"0 auto",gap:r.notificationSpacing,maxHeight:"50vh",overflow:"hidden auto",boxShadow:"none !important"},":host *":{color:r.notificationTextColor},":host .note":{display:"grid",background:r.notificationBg,padding:r.notificationPadding,gridTemplateColumns:`${r.notificationIconSize} 1fr ${r.notificationButtonSize}`,gap:r.notificationSpacing,alignItems:"center",borderRadius:r.notificationBorderRadius,boxShadow:`0 2px 8px #0006, inset 0 0 0 2px ${r.notificationAccentColor}`,borderColor:r.notificationAccentColor,borderWidth:r.notificationBorderWidth,borderStyle:"solid",transition:"0.5s ease-in",transitionProperty:"margin, opacity",zIndex:1},":host .note .icon":{fill:r.notificationAccentColor},":host .note button":{display:"flex",lineHeight:r.notificationButtonSize,padding:0,margin:0,height:r.notificationButtonSize,width:r.notificationButtonSize,background:"transparent",alignItems:"center",justifyContent:"center",boxShadow:"none",border:"none",position:"relative"},":host .note button:hover svg":{fill:r.notificationAccentColor},":host .note button:active svg":{borderRadius:99,fill:r.notificationBg,background:r.notificationAccentColor,padding:r.spacing50},":host .note svg":{height:r.notificationIconSize,width:r.notificationIconSize,pointerEvents:"none"},":host .message":{display:"flex",flexDirection:"column",alignItems:"center",gap:r.notificationSpacing},":host .note.closing":{opacity:0,zIndex:0}};static removeNote(n){n.classList.add("closing"),n.style.marginBottom=-n.offsetHeight+"px";let a=()=>{n.remove()};n.addEventListener("transitionend",a),setTimeout(a,1000)}static post(n){let{message:a,duration:t,type:o,close:i,progress:s,icon:e}=Object.assign({type:"info",duration:-1},typeof n==="string"?{message:n}:n);if(!this.singleton)this.singleton=fi();let l=this.singleton;document.body.append(l),l.style.zIndex=String(ht()+1);let h=Ye[o],d=s||o==="progress"?g.progress():{},p=()=>{if(i)i();wn.removeNote(u)},m=e instanceof SVGElement?e:e?f[e]({class:"icon"}):f.info({class:"icon"}),u=ka({class:`note ${o}`,style:{_notificationAccentColor:h}},m,ka({class:"message"},ka(a),d),Ne({class:"close",title:"close",apply(M){M.addEventListener("click",p)}},f.x()));if(l.shadowRoot.append(u),d instanceof HTMLProgressElement&&s instanceof Function){d.setAttribute("max",String(100)),d.value=s();let M=setInterval(()=>{if(!l.shadowRoot.contains(u)){clearInterval(M);return}let _=s();if(d.value=_,_>=100)wn.removeNote(u)},1000)}if(t>0)setTimeout(()=>{wn.removeNote(u)},t*1000);return u.scrollIntoView(),p}content=null}var fi=wn.elementCreator({tag:"xin-notification"});function qe(n){return wn.post(n)}var wi=async(n,a="SHA-1")=>{let t=new TextEncoder().encode(n),o=await crypto.subtle.digest(a,t);return Array.from(new Uint8Array(o)).map((i)=>i.toString(16).padStart(2,"0")).join("")},vi=async(n)=>{let a=await wi(n),t=await fetch(`https://weakpass.com/api/v1/search/${a}`);if(t.ok){let o=await t.json();console.log("password found in weakpass database",o)}return t.status!==404},{span:nt,xinSlot:Ge}=g;class Ct extends c{minLength=8;goodLength=12;indicatorColors="#f00,#f40,#f80,#ef0,#8f0,#0a2";descriptionColors="#000,#000,#000,#000,#000,#fff";issues={tooShort:!0,short:!0,noUpper:!0,noLower:!0,noNumber:!0,noSpecial:!0};issueDescriptions={tooShort:"too short",short:"short",noUpper:"no upper case",noLower:"no lower case",noNumber:"no digits",noSpecial:"no unusual characters"};value=0;strengthDescriptions=["unacceptable","very weak","weak","moderate","strong","very strong"];constructor(){super();this.initAttributes("minLength","goodLength","indicatorColors")}strength(n){return this.issues={tooShort:n.length<this.minLength,short:n.length<this.goodLength,noUpper:!n.match(/[A-Z]/),noLower:!n.match(/[a-z]/),noNumber:!n.match(/[0-9]/),noSpecial:!n.match(/[^a-zA-Z0-9]/)},this.issues.tooShort?0:Object.values(this.issues).filter((a)=>!a).length-1}async isBreached(){let n=this.querySelector("input")?.value;if(!n||typeof n!=="string")return!0;return await vi(n)}updateIndicator=(n)=>{let{level:a,description:t}=this.parts,o=this.indicatorColors.split(","),i=this.descriptionColors.split(","),s=this.strength(n);if(this.value!==s)this.value=s,this.dispatchEvent(new Event("change"));a.style.width=`${(s+1)*16.67}%`,this.style.setProperty("--indicator-color",o[s]),this.style.setProperty("--description-color",i[s]),t.textContent=this.strengthDescriptions[s]};update=(n)=>{let a=n.target.closest("input");this.updateIndicator(a?.value||"")};content=()=>[Ge({onInput:this.update}),nt({part:"meter"},nt({part:"level"}),nt({part:"description"}))];render(){super.render();let n=this.querySelector("input");this.updateIndicator(n?.value)}}var Je=Ct.elementCreator({tag:"xin-password-strength",styleSpec:{":host":{display:"inline-flex",flexDirection:"column",gap:r.spacing50,position:"relative"},":host xin-slot":{display:"flex"},':host [part="meter"]':{display:"block",position:"relative",height:b.meterHeight("24px"),background:b.indicatorBg("white"),borderRadius:b.meterRadius("4px"),boxShadow:b.meterShadow(`inset 0 0 0 2px ${r.indicatorColor}`)},':host [part="level"]':{height:b.levelHeight("20px"),content:'" "',display:"inline-block",width:0,transition:"0.15s ease-out",background:r.indicatorColor,margin:b.levelMargin("2px"),borderRadius:b.levelRadius("2px")},':host [part="description"]':{position:"absolute",inset:"0",color:r.descriptionColor,height:b.meterHeight("24px"),lineHeight:b.meterHeight("24px"),textAlign:"center"}}}),{span:at}=g;class jt extends c{iconSize=24;min=1;max=5;step=1;value=null;icon="star";color="#f91";emptyColor="#8888";emptyStrokeWidth=2;readonly=!1;hollow=!1;static styleSpec={":host":{display:"inline-block",position:"relative",width:"fit-content"},":host::part(container)":{position:"relative",display:"inline-block"},":host::part(empty), :host::part(filled)":{height:"100%",whiteSpace:"nowrap",overflow:"hidden"},":host::part(empty)":{pointerEvents:"none",_textColor:"transparent"},':host [part="empty"]:not(.hollow)':{fill:r.ratingEmptyColor},":host .hollow":{fill:"none",stroke:r.ratingEmptyColor,strokeWidth:r.ratingEmptyStrokeWidth},":host::part(filled)":{position:"absolute",left:0,fill:r.ratingColor,stroke:r.ratingColor,strokeWidth:r.ratingEmptyStrokeWidth},":host svg":{transform:"scale(0.7)",pointerEvents:"all !important",transition:"0.25s ease-in-out"},":host svg:hover":{transform:"scale(0.9)"},":host svg:active":{transform:"scale(1)"}};constructor(){super();this.initAttributes("max","min","icon","step","color","emptyColor","readonly","iconSize","hollow")}content=()=>at({part:"container"},at({part:"empty"}),at({part:"filled"}));displayValue(n){let{empty:a,filled:t}=this.parts,o=Math.round((n||0)/this.step)*this.step;t.style.width=o/this.max*a.offsetWidth+"px"}update=(n)=>{if(this.readonly)return;let{empty:a}=this.parts,t=n instanceof MouseEvent?n.pageX-a.getBoundingClientRect().x:0,o=Math.min(Math.max(this.min,Math.round(t/a.offsetWidth*this.max/this.step+this.step*0.5)*this.step),this.max);if(n.type==="click")this.value=o;else if(n.type==="mousemove")this.displayValue(o);else this.displayValue(this.value||0)};handleKey=(n)=>{let a=Number(this.value);if(a==null)a=Math.round((this.min+this.max)*0.5*this.step)*this.step;let t=!1;switch(n.key){case"ArrowUp":case"ArrowRight":a+=this.step,t=!0;break;case"ArrowDown":case"ArrowLeft":a-=this.step,t=!0;break}if(this.value=Math.max(Math.min(a,this.max),this.min),t)n.stopPropagation(),n.preventDefault()};connectedCallback(){super.connectedCallback();let{container:n}=this.parts;n.tabIndex=0,n.addEventListener("mousemove",this.update,!0),n.addEventListener("mouseleave",this.update),n.addEventListener("blur",this.update),n.addEventListener("click",this.update),n.addEventListener("keydown",this.handleKey)}_renderedIcon="";render(){if(super.render(),this.style.setProperty("--rating-color",this.color),this.style.setProperty("--rating-empty-color",this.emptyColor),this.style.setProperty("--rating-empty-stroke-width",String(this.emptyStrokeWidth*32)),this.readonly)this.role="image";else this.role="slider";this.ariaLabel=`rating ${this.value} out of ${this.max}`,this.ariaValueMax=String(this.max),this.ariaValueMin=String(this.min),this.ariaValueNow=this.value===null?String(-1):String(this.value);let{empty:n,filled:a}=this.parts,t=this.iconSize+"px";if(n.classList.toggle("hollow",this.hollow),this._renderedIcon!==this.icon){this._renderedIcon=this.icon;for(let o=0;o<this.max;o++)n.append(f[this.icon]({height:t})),a.append(f[this.icon]({height:t}))}this.style.height=t,this.displayValue(this.value)}}var $e=jt.elementCreator({tag:"xin-rating"}),{xinSlot:Jo,div:Ke,button:Re,span:xi}=g,Ue=[{caption:"Title",tagType:"H1"},{caption:"Heading",tagType:"H2"},{caption:"Subheading",tagType:"H3"},{caption:"Minor heading",tagType:"H4"},{caption:"Body",tagType:"P"},{caption:"Code Block",tagType:"PRE"}];function St(n=Ue){return dt({title:"paragraph style",slot:"toolbar",class:"block-style",options:n.map(({caption:a,tagType:t})=>({caption:a,value:`formatBlock,${t}`}))})}function Bn(n="10px"){return xi({slot:"toolbar",style:{flex:`0 0 ${n}`,content:" "}})}function Ze(n="10px"){return xi({slot:"toolbar",style:{flex:`0 0 ${n}`,content:" "}})}function N(n,a,t){return Re({slot:"toolbar",dataCommand:a,title:n},t)}var Qe=()=>[N("left-justify","justifyLeft",f.alignLeft()),N("center","justifyCenter",f.alignCenter()),N("right-justify","justifyRight",f.alignRight()),Bn(),N("bullet list","insertUnorderedList",f.listBullet()),N("numbered list","insertOrderedList",f.listNumber()),Bn(),N("indent","indent",f.blockIndent()),N("indent","outdent",f.blockOutdent())],Ci=()=>[N("bold","bold",f.fontBold()),N("italic","italic",f.fontItalic()),N("underline","underline",f.fontUnderline())],Le=()=>[St(),Bn(),...Ci()],ji=()=>[St(),Bn(),...Qe(),Bn(),...Ci()];class Mt extends c{widgets="default";isInitialized=!1;get value(){return this.isInitialized?this.parts.doc.innerHTML:this.savedValue||this.innerHTML}set value(n){if(this.isInitialized)this.parts.doc.innerHTML=n;else this.innerHTML=n}blockElement(n){let{doc:a}=this.parts;while(n.parentElement!==null&&n.parentElement!==a)n=n.parentElement;return n.parentElement===a?n:void 0}get selectedBlocks(){let{doc:n}=this.parts,a=window.getSelection();if(a===null)return[];let t=[];for(let o=0;o<a.rangeCount;o++){let i=a.getRangeAt(o);if(!n.contains(i.commonAncestorContainer))continue;let s=this.blockElement(i.startContainer),e=this.blockElement(i.endContainer);t.push(s);while(s!==e&&s!==null)s=s.nextElementSibling,t.push(s)}return t}get selectedText(){let n=window.getSelection();if(n===null)return"";return this.selectedBlocks.length?n.toString():""}selectionChange=()=>{};handleSelectChange=(n)=>{let a=n.target.closest(Ln.tagName);if(a==null)return;this.doCommand(a.value)};handleButtonClick=(n)=>{let a=n.target.closest("button");if(a==null)return;this.doCommand(a.dataset.command)};content=[Jo({name:"toolbar",part:"toolbar",onClick:this.handleButtonClick,onChange:this.handleSelectChange}),Ke({part:"doc",contenteditable:!0,style:{flex:"1 1 auto",outline:"none"}}),Jo({part:"content"})];constructor(){super();this.initAttributes("widgets")}doCommand(n){if(n===void 0)return;let a=n.split(",");console.log("execCommand",a[0],!1,...a.slice(1)),document.execCommand(a[0],!1,...a.slice(1))}updateBlockStyle(){let n=this.parts.toolbar.querySelector(".block-style");if(n===null)return;let a=this.selectedBlocks.map((t)=>t.tagName);a=[...new Set(a)],n.value=a.length===1?`formatBlock,${a[0]}`:""}connectedCallback(){super.connectedCallback();let{doc:n,content:a}=this.parts;if(a.innerHTML!==""&&n.innerHTML==="")n.innerHTML=a.innerHTML,a.innerHTML="";this.isInitialized=!0,a.style.display="none",document.addEventListener("selectionchange",(t)=>{this.updateBlockStyle(),this.selectionChange(t,this)})}render(){let{toolbar:n}=this.parts;if(super.render(),n.children.length===0)switch(this.widgets){case"minimal":n.append(...Le());break;case"default":n.append(...ji());break}}}var ke=Mt.elementCreator({tag:"xin-word",styleSpec:{":host":{display:"flex",flexDirection:"column",height:"100%"},':host [part="toolbar"]':{padding:"4px",display:"flex",gap:"0px",flex:"0 0 auto",flexWrap:"wrap"}}}),{div:nl,slot:al,label:tl,span:ol,input:$o}=g;class _t extends c{choices="";other="";multiple=!1;name="";placeholder="Please specify…";localized=!1;value=null;get values(){return(this.value||"").split(",").map((n)=>n.trim()).filter((n)=>n!=="")}content=()=>[al(),nl({part:"options"},$o({part:"custom",hidden:!0}))];static styleSpec={":host":{display:"inline-flex",gap:b.segmentedOptionGap("8px"),alignItems:b.segmentedAlignItems("center")},":host, :host::part(options)":{flexDirection:b.segmentedDirection("row")},":host label":{display:"inline-grid",alignItems:"center",gap:b.segmentedOptionGap("8px"),gridTemplateColumns:b.segmentedOptionGridColumns("0px 24px 1fr"),padding:b.segmentedOptionPadding("4px 12px"),font:b.segmentedOptionFont("16px")},":host label:has(:checked)":{color:b.segmentedOptionCurrentColor("#eee"),background:b.segmentedOptionCurrentBackground("#44a")},":host svg":{height:b.segmentOptionIconSize("16px"),fill:b.segmentedOptionIconColor("currentColor")},":host label.no-icon":{gap:0,gridTemplateColumns:b.segmentedOptionGridColumns("0px 1fr")},':host input[type="radio"], :host input[type="checkbox"]':{visibility:b.segmentedInputVisibility("hidden")},":host::part(options)":{display:"flex",borderRadius:b.segmentedOptionsBorderRadius("8px"),background:b.segmentedOptionsBackground("#fff"),color:b.segmentedOptionColor("#222"),overflow:"hidden",alignItems:b.segmentedOptionAlignItems("stretch")},":host::part(custom)":{padding:b.segmentedOptionPadding("4px 12px"),color:b.segmentedOptionCurrentColor("#eee"),background:b.segmentedOptionCurrentBackground("#44a"),font:b.segmentedOptionFont("16px"),border:"0",outline:"none"},":host::part(custom)::placeholder":{color:b.segmentedOptionCurrentColor("#eee"),opacity:b.segmentedPlaceholderOpacity(0.75)}};constructor(){super();this.initAttributes("direction","choices","other","multiple","name","placeholder","localized")}valueChanged=!1;handleChange=()=>{let{options:n,custom:a}=this.parts;if(this.multiple){let t=[...n.querySelectorAll("input:checked")];this.value=t.map((o)=>o.value).join(",")}else{let t=n.querySelector("input:checked");if(!t)this.value=null;else if(t.value)a.setAttribute("hidden",""),this.value=t.value;else a.removeAttribute("hidden"),a.focus(),a.select(),this.value=a.value}this.valueChanged=!0};handleKey=(n)=>{switch(n.code){case"Space":n.target.click();break}};connectedCallback(){super.connectedCallback();let{options:n}=this.parts;if(this.name==="")this.name=this.instanceId;if(n.addEventListener("change",this.handleChange),n.addEventListener("keydown",this.handleKey),this.other&&this.multiple)console.warn(this,"is set to [other] and [multiple]; [other] will be ignored"),this.other=""}get _choices(){let n=Array.isArray(this.choices)?this.choices:this.choices.split(",").filter((a)=>a.trim()!=="").map((a)=>{let[t,o]=a.split("=").map((l)=>l.trim()),[i,s]=(o||t).split(":").map((l)=>l.trim()),e=s?f[s]():"";return{value:t,icon:e,caption:i}});if(this.other&&!this.multiple){let[a,t]=this.other.split(":");n.push({value:"",caption:a,icon:t})}return n}get isOtherValue(){return Boolean(this.value===""||this.value&&!this._choices.find((n)=>n.value===this.value))}render(){if(super.render(),this.valueChanged){this.valueChanged=!1;return}let{options:n,custom:a}=this.parts;n.textContent="";let t=this.multiple?"checkbox":"radio",{values:o,isOtherValue:i}=this;if(n.append(...this._choices.map((s)=>{return tl({tabindex:0},$o({type:t,name:this.name,value:s.value,checked:o.includes(s.value)||s.value===""&&i,tabIndex:-1}),s.icon||{class:"no-icon"},this.localized?Sa(s.caption):ol(s.caption))})),this.other&&!this.multiple)a.hidden=!i,a.value=i?this.value:"",a.placeholder=this.placeholder,n.append(a)}}var il=_t.elementCreator({tag:"xin-segmented"}),{slot:Ko}=g;class At extends c{minSize=800;navSize=200;compact=!1;content=[Ko({name:"nav",part:"nav"}),Ko({part:"content"})];_contentVisible=!1;get contentVisible(){return this._contentVisible}set contentVisible(n){this._contentVisible=n,this.queueRender()}static styleSpec={":host":{display:"grid",gridTemplateColumns:`${b.navWidth("50%")} ${b.contentWidth("50%")}`,gridTemplateRows:"100%",position:"relative",margin:b.margin("0 0 0 -100%"),transition:b.sideNavTransition("0.25s ease-out")},":host slot":{position:"relative"},":host slot:not([name])":{display:"block"},':host slot[name="nav"]':{display:"block"}};onResize=()=>{let{content:n}=this.parts,a=this.offsetParent;if(a===null)return;if(this.compact=a.offsetWidth<this.minSize,[...this.childNodes].find((t)=>t instanceof Element?t.getAttribute("slot")!=="nav":!0)===void 0){this.style.setProperty("--nav-width","100%"),this.style.setProperty("--content-width","0%");return}if(!this.compact)n.classList.add("-xin-sidenav-visible"),this.style.setProperty("--nav-width",`${this.navSize}px`),this.style.setProperty("--content-width",`calc(100% - ${this.navSize}px)`),this.style.setProperty("--margin","0");else if(n.classList.remove("-xin-sidenav-visible"),this.style.setProperty("--nav-width","50%"),this.style.setProperty("--content-width","50%"),this.contentVisible)this.style.setProperty("--margin","0 0 0 -100%");else this.style.setProperty("--margin","0 -100% 0 0")};observer;connectedCallback(){super.connectedCallback(),this.contentVisible=this.parts.content.childNodes.length===0,globalThis.addEventListener("resize",this.onResize),this.observer=new MutationObserver(this.onResize),this.observer.observe(this,{childList:!0}),this.style.setProperty("--side-nav-transition","0s"),setTimeout(()=>{this.style.removeProperty("--side-nav-transition")},250)}disconnectedCallback(){super.disconnectedCallback(),this.observer.disconnect()}constructor(){super();this.initAttributes("minSize","navSize","compact")}render(){super.render(),this.onResize()}}var It=At.elementCreator({tag:"xin-sidenav"}),{slot:Ro}=g;class Pt extends c{minWidth=0;minHeight=0;value="normal";content=[Ro({part:"normal"}),Ro({part:"small",name:"small"})];static styleSpec={":host":{display:"inline-block",position:"relative"}};constructor(){super();this.initAttributes("minWidth","minHeight")}onResize=()=>{let{normal:n,small:a}=this.parts,t=this.offsetParent;if(!(t instanceof HTMLElement))return;else if(t.offsetWidth<this.minWidth||t.offsetHeight<this.minHeight)n.hidden=!0,a.hidden=!1,this.value="small";else n.hidden=!1,a.hidden=!0,this.value="normal"};connectedCallback(){super.connectedCallback(),globalThis.addEventListener("resize",this.onResize)}disconnectedCallback(){super.disconnectedCallback(),globalThis.removeEventListener("resize",this.onResize)}}var Bt=Pt.elementCreator({tag:"xin-sizebreak"});class Ot extends c{target=null;static styleSpec={":host":{_resizeIconFill:"#222",display:"block",position:"absolute",bottom:-7,right:-7,padding:14,width:44,height:44,opacity:0.25,transition:"opacity 0.25s ease-out"},":host(:hover)":{opacity:0.5},":host svg":{width:16,height:16,fill:r.resizeIconFill}};content=f.resize();get minSize(){let{minWidth:n,minHeight:a}=getComputedStyle(this.target);return{width:parseFloat(n)||32,height:parseFloat(a)||32}}resizeTarget=(n)=>{let{target:a}=this;if(!a)return;let{offsetWidth:t,offsetHeight:o}=a;a.style.left=a.offsetLeft+"px",a.style.top=a.offsetTop+"px",a.style.bottom="",a.style.right="";let{minSize:i}=this;an(n,(s,e,l)=>{if(a.style.width=Math.max(i.width,t+s)+"px",a.style.height=Math.max(i.height,o+e)+"px",l.type==="mouseup")return!0},"nwse-resize")};connectedCallback(){if(super.connectedCallback(),!this.target)this.target=this.parentElement;let n={passive:!0};this.addEventListener("mousedown",this.resizeTarget,n),this.addEventListener("touchstart",this.resizeTarget,n)}}var sl=Ot.elementCreator({tag:"xin-sizer"}),{div:el,input:ll,span:rl,button:st}=g;class Aa extends c{caption="";removeable=!1;removeCallback=()=>{this.remove()};content=()=>[rl({part:"caption"},this.caption),st(f.x(),{part:"remove",hidden:!this.removeable,onClick:this.removeCallback})];constructor(){super();this.initAttributes("caption","removeable")}}var Si=Aa.elementCreator({tag:"xin-tag",styleSpec:{":host":{"--tag-close-button-color":"#000c","--tag-close-button-bg":"#fffc","--tag-button-opacity":"0.5","--tag-button-hover-opacity":"0.75","--tag-bg":b.brandColor("blue"),"--tag-text-color":b.brandTextColor("white"),display:"inline-flex",borderRadius:b.tagRoundedRadius(r.spacing50),color:r.tagTextColor,background:r.tagBg,padding:`0 ${r.spacing75} 0 ${r.spacing75}`,height:`calc(${r.lineHeight} + ${r.spacing50})`,lineHeight:`calc(${r.lineHeight} + ${r.spacing50})`},':host > [part="caption"]':{position:"relative",whiteSpace:"nowrap",overflow:"hidden",flex:"1 1 auto",fontSize:b.fontSize("16px"),color:r.tagTextColor,textOverflow:"ellipsis"},':host [part="remove"]':{boxShadow:"none",margin:`0 ${r.spacing_50} 0 ${r.spacing25}`,padding:0,display:"inline-flex",alignItems:"center",alignSelf:"center",justifyContent:"center",height:r.spacing150,width:r.spacing150,"--text-color":r.tagCloseButtonColor,background:r.tagCloseButtonBg,borderRadius:b.tagCloseButtonRadius("99px"),opacity:r.tagButtonOpacity},':host [part="remove"]:hover':{background:r.tagCloseButtonBg,opacity:r.tagButtonHoverOpacity}}});class Et extends c{disabled=!1;name="";availableTags=[];value=[];textEntry=!1;editable=!1;placeholder="enter tags";get tags(){return typeof this.value==="string"?this.value.split(",").map((n)=>n.trim()).filter((n)=>n!==""):this.value}constructor(){super();this.initAttributes("name","value","textEntry","availableTags","editable","placeholder","disabled")}addTag=(n)=>{if(n.trim()==="")return;let{tags:a}=this;if(!a.includes(n))a.push(n);this.value=a,this.queueRender(!0)};toggleTag=(n)=>{if(this.tags.includes(n))this.value=this.tags.filter((a)=>a!==n);else this.addTag(n);this.queueRender(!0)};enterTag=(n)=>{let{tagInput:a}=this.parts;switch(n.key){case",":{let t=a.value.split(",")[0];this.addTag(t)}break;case"Enter":{let t=a.value.split(",")[0];this.addTag(t)}n.stopPropagation(),n.preventDefault();break;default:}};popSelectMenu=()=>{let{toggleTag:n}=this,{tagMenu:a}=this.parts,t=typeof this.availableTags==="string"?this.availableTags.split(","):this.availableTags,o=this.tags.filter((s)=>!t.includes(s));if(o.length)t.push(null,...o);let i=t.map((s)=>{if(s===""||s===null)return null;else if(typeof s==="object")return{checked:()=>this.tags.includes(s.value),caption:s.caption,action(){n(s.value)}};else return{checked:()=>this.tags.includes(s),caption:s,action(){n(s)}}});Q({target:a,width:"auto",menuItems:i})};content=()=>[st({style:{visibility:"hidden"},tabindex:-1}),el({part:"tagContainer",class:"row"}),ll({part:"tagInput",class:"elastic",onKeydown:this.enterTag}),st({title:"add tag",part:"tagMenu",onClick:this.popSelectMenu},f.chevronDown())];removeTag=(n)=>{if(this.editable&&!this.disabled){let a=n.target.closest(Aa.tagName);this.value=this.tags.filter((t)=>t!==a.caption),a.remove(),this.queueRender(!0)}n.stopPropagation(),n.preventDefault()};render(){super.render();let{tagContainer:n,tagMenu:a,tagInput:t}=this.parts;if(a.disabled=this.disabled,t.value="",t.setAttribute("placeholder",this.placeholder),this.editable&&!this.disabled)a.toggleAttribute("hidden",!1),t.toggleAttribute("hidden",!this.textEntry);else a.toggleAttribute("hidden",!0),t.toggleAttribute("hidden",!0);n.textContent="";let{tags:o}=this;for(let i of o)n.append(Si({caption:i,removeable:this.editable&&!this.disabled,removeCallback:this.removeTag}))}}var hl=Et.elementCreator({tag:"xin-tag-list",styleSpec:{":host":{"--tag-list-bg":"#f8f8f8","--touch-size":"44px","--spacing":"16px",display:"grid",gridTemplateColumns:"auto",alignItems:"center",background:r.tagListBg,gap:r.spacing25,borderRadius:b.taglistRoundedRadius(r.spacing50),overflow:"hidden"},":host[editable]":{gridTemplateColumns:`0px auto ${r.touchSize}`},":host[editable][text-entry]":{gridTemplateColumns:`0px 2fr 1fr ${r.touchSize}`},':host [part="tagContainer"]':{display:"flex",content:'" "',alignItems:"center",background:r.inputBg,borderRadius:b.tagContainerRadius(r.spacing50),boxShadow:r.borderShadow,flexWrap:"nowrap",overflow:"auto hidden",gap:r.spacing25,minHeight:`calc(${r.lineHeight} + ${r.spacing})`,padding:r.spacing25},':host [part="tagMenu"]':{width:r.touchSize,height:r.touchSize,lineHeight:r.touchSize,textAlign:"center",padding:0,margin:0},":host [hidden]":{display:"none !important"},':host button[part="tagMenu"]':{background:r.brandColor,color:r.brandTextColor}}}),Tt="0.9.15";var Mi={_textColor:"#222",_brandColor:"#295546",_background:"#fafafa",_inputBg:"#fdfdfd",_backgroundShaded:"#f5f5f5",_navBg:"#ddede8",_barColor:"#dae3df",_focusColor:"#148960ad",_brandTextColor:"#ecf3dd",_insetBg:"#eee",_codeBg:"#f8ffe9",_shadowColor:"#0004",_menuBg:"#fafafa",_menuItemActiveColor:"#000",_menuItemIconActiveColor:"#000",_menuItemActiveBg:"#aaa",_menuItemHoverBg:"#eee",_menuItemColor:"#222",_menuSeparatorColor:"#2224",_scrollThumbColor:"#0006",_scrollBarColor:"#0001"},_i={"@import":"https://fonts.googleapis.com/css2?family=Aleo:ital,wght@0,100..900;1,100..900&famiSpline+Sans+Mono:ital,wght@0,300..700;1,300..700&display=swap",":root":{_fontFamily:"'Aleo', sans-serif",_codeFontFamily:"'Spline Sans Mono', monospace",_fontSize:"16px",_codeFontSize:"14px",...Mi,_spacing:"10px",_lineHeight:"calc(var(--font-size) * 1.6)",_h1Scale:"2",_h2Scale:"1.5",_h3Scale:"1.25",_touchSize:"32px",_headerHeight:"calc( var(--line-height) * var(--h2-scale) + var(--spacing) * 2 )"},"@media (prefers-color-scheme: dark)":{body:{_darkmode:"true"}},".darkmode":{...Ya(Mi),_menuShadow:"0 0 0 2px #a0f3d680",_menuSeparatorColor:"#a0f3d640"},".high-contrast":{filter:"contrast(2)"},"*":{boxSizing:"border-box",scrollbarColor:`${r.scrollThumbColor} ${r.scrollBarColor}`,scrollbarWidth:"thin"},body:{fontFamily:r.fontFamily,fontSize:r.fontSize,margin:"0",lineHeight:r.lineHeight,background:r.background,_linkColor:r.brandColor,_xinTabsSelectedColor:r.brandColor,_xinTabsBarColor:r.brandTextColor,_menuItemIconColor:r.brandColor,color:r.textColor},"input, button, select, textarea":{fontFamily:r.fontFamily,fontSize:r.fontSize,color:"currentColor",background:r.inputBg},select:{WebkitAppearance:"none",appearance:"none"},header:{background:r.brandColor,color:r.brandTextColor,_textColor:r.brandTextColor,_linkColor:r.transTextColor,display:"flex",alignItems:"center",padding:"0 var(--spacing)",lineHeight:"calc(var(--line-height) * var(--h1-scale))",height:r.headerHeight,whiteSpace:"nowrap"},h1:{_textColor:r.brandColor,fontSize:"calc(var(--font-size) * var(--h1-scale))",lineHeight:"calc(var(--line-height) * var(--h1-scale))",fontWeight:"400",margin:"0",padding:r.spacing,textAlign:"center"},"header h2":{color:r.brandTextColor,whiteSpace:"nowrap"},h2:{color:r.brandColor,fontSize:"calc(var(--font-size) * var(--h2-scale))",lineHeight:"calc(var(--line-height) * var(--h2-scale))",margin:"calc(var(--spacing) * var(--h2-scale)) 0"},h3:{fontSize:"calc(var(--font-size) * var(--h3-scale))",lineHeight:"calc(var(--line-height) * var(--h3-scale))",margin:"calc(var(--spacing) * var(--h3-scale)) 0"},main:{alignItems:"stretch",display:"flex",flexDirection:"column",maxWidth:"100vw",height:"100vh",overflow:"hidden"},"main > xin-sidenav":{height:"calc(100vh - var(--header-height))"},"main > xin-sidenav::part(nav)":{background:r.navBg},"input[type=search]":{borderRadius:99},blockquote:{background:r.insetBg,margin:"0",padding:"var(--spacing) calc(var(--spacing) * 2)"},"blockquote > :first-child":{marginTop:"0"},"blockquote > :last-child":{marginBottom:"0"},".bar":{display:"flex",gap:r.spacing,justifyContent:"center",alignItems:"center",padding:r.spacing,flexWrap:"wrap",_textColor:r.brandColor,background:r.barColor},a:{textDecoration:"none",color:r.linkColor,opacity:"0.9",borderBottom:"1px solid var(--brand-color)"},"button, select, .clickable":{transition:"ease-out 0.2s",background:r.brandTextColor,_textColor:r.brandColor,display:"inline-block",textDecoration:"none",padding:"0 calc(var(--spacing) * 1.25)",border:"none",borderRadius:"calc(var(--spacing) * 0.5)"},"button, select, clickable, input":{lineHeight:"calc(var(--line-height) + var(--spacing))"},"select:has(+ .icon-chevron-down)":{paddingRight:"calc(var(--spacing) * 2.7)"},"select + .icon-chevron-down":{marginLeft:"calc(var(--spacing) * -2.7)",width:"calc(var(--spacing) * 2.7)",alignSelf:"center",pointerEvents:"none",objectPosition:"left center",_textColor:r.brandColor},"label > select + .icon-chevron-down":{marginLeft:"calc(var(--spacing) * -3.5)"},"input, textarea":{border:"none",outline:"none",borderRadius:"calc(var(--spacing) * 0.5)"},input:{padding:"0 calc(var(--spacing) * 1.5)"},textarea:{padding:"var(--spacing) calc(var(--spacing) * 1.25)",lineHeight:r.lineHeight,minHeight:"calc(var(--spacing) + var(--line-height) * 4)"},"input[type='number']":{paddingRight:0,width:"6em",textAlign:"right"},"input[type=number]::-webkit-inner-spin-button":{margin:"1px 3px 1px 0.5em",opacity:1,inset:1},"input[type='checkbox'], input[type='radio']":{maxWidth:r.lineHeight},"::placeholder":{color:r.focusColor},img:{verticalAlign:"middle"},"button:hover, button:hover, .clickable:hover":{boxShadow:"inset 0 0 0 2px var(--brand-color)"},"button:active, button:active, .clickable:active":{background:r.brandColor,color:r.brandTextColor},label:{display:"inline-flex",gap:"calc(var(--spacing) * 0.5)",alignItems:"center"},".elastic":{flex:"1 1 auto",overflow:"hidden",position:"relative"},"svg text":{pointerEvents:"none",fontSize:"16px",fontWeight:"bold",fill:"#000",stroke:"#fff8",strokeWidth:"0.5",opacity:"0"},"svg text.hover":{opacity:"1"},".thead":{background:r.brandColor,color:r.brandTextColor},".th + .th":{border:"1px solid #fff4",borderWidth:"0 1px"},".th, .td":{padding:"0 var(--spacing)"},".tr:not([aria-selected]):hover":{background:"#08835810"},"[aria-selected]":{background:"#08835820"},":disabled":{opacity:"0.5",filter:"saturate(0)",pointerEvents:"none"},pre:{background:r.codeBg,padding:r.spacing,borderRadius:"calc(var(--spacing) * 0.25)",overflow:"auto",fontSize:r.codeFontSize,lineHeight:"calc(var(--font-size) * 1.2)"},"pre, code":{fontFamily:r.codeFontFamily,_textColor:r.brandColor},".-xin-sidenav-visible .close-content":{display:"none"},".transparent, .iconic":{background:"none"},".iconic":{padding:"0",fontSize:"150%",lineHeight:"calc(var(--line-height) + var(--spacing))",width:"calc(var(--line-height) + var(--spacing))",textAlign:"center"},".transparent:hover, .iconic:hover":{background:"#0002",boxShadow:"none",color:r.textColor},".transparent:active, .iconic:active":{background:"#0004",boxShadow:"none",color:r.textColor},"xin-sidenav:not([compact]) .show-within-compact":{display:"none"},".on.on":{background:r.brandColor,_textColor:r.brandTextColor},".current":{background:r.background},".doc-link":{cursor:"pointer",borderBottom:"none",transition:"0.15s ease-out",marginLeft:"20px",padding:"calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5)"},".doc-link:not(.current):hover":{background:r.background},".doc-link:not(.current)":{opacity:"0.8",marginLeft:0},"xin-example":{margin:"var(--spacing) 0"},"xin-example [part=editors]":{background:r.insetBg},"[class*='icon-'], xin-icon":{color:"currentcolor",height:r.fontSize,pointerEvents:"none"},"[class*='icon-']":{verticalAlign:"middle"},".icon-plus":{content:"'+'"},table:{borderCollapse:"collapse"},thead:{background:r.brandColor,color:r.brandTextColor},tbody:{background:r.background},"tr:nth-child(2n)":{background:r.backgroundShaded},"th, td":{padding:"calc(var(--spacing) * 0.5) var(--spacing)"},"header xin-locale-picker xin-select button":{color:"currentcolor",background:"transparent",gap:"2px"},svg:{fill:"currentcolor"},"img.logo, xin-icon.logo":{animation:"2s ease-in-out 0s infinite alternate logo-swing"},"@keyframes logo-swing":{"0%":{transform:"perspective(1000px) rotateY(15deg)"},"100%":{transform:"perspective(1000px) rotateY(-15deg)"}}};var Ia=[{text:`# xinjs

<!--{ "pin": "top" }-->

<div style="text-align: center; margin: 20px">
  <a href="https://xinjs.net">
    <img style="width: 200px; max-width: 80%" alt="xinjs logo" src="https://xinjs.net/xinjs-logo.svg">
  </a>
</div>

[xinjs.net](https://xinjs.net) | [xinjs-ui](https://ui.xinjs.net) | [docs](https://github.com/tonioloewald/xinjs/blob/main/docs/_contents_.md) | [github](https://github.com/tonioloewald/xinjs) | [npm](https://www.npmjs.com/package/xinjs) | [cdn](https://www.jsdelivr.com/package/npm/xinjs) | [react-xinjs](https://github.com/tonioloewald/react-xinjs#readme) | [discord](https://discord.gg/ramJ9rgky5)

[![xinjs is on NPM](https://badge.fury.io/js/xinjs.svg)](https://www.npmjs.com/package/xinjs)
[![xinjs is about 10kB gzipped](https://deno.bundlejs.com/?q=xinjs&badge=)](https://bundlejs.com/?q=xinjs&badge=)
[![xinjs on jsdelivr](https://data.jsdelivr.com/v1/package/npm/xinjs/badge)](https://www.jsdelivr.com/package/npm/xinjs)

For a pretty thorough overview of xinjs, you might like to start with [What is xinjs?](https://loewald.com/blog/2025/6/4/what-is-xinjs-).
To understand the thinking behind xinjs, there's [What should a front-end framework do?](https://loewald.com/blog/2025/6/4/what-should-a-front-end-framework-do).

### Build UIs with less code

- simple, efficient observer pattern
- written in TypeScript
- lightweight
- works anywhere (browsers, node, bun, electron etc.)

If you want to build a web-application that's performant, robust, and maintainable,
\`xinjs\` lets you:

- implement your business logic however you like (or reuse existing code),
- build your UI with pure \`React\` components (using \`useXin\`)
- and/or \`web-component\`s,
- and _bind_ state to the user-interface _directly_.

In general, \`xinjs\` is able to accomplish the same or better compactness, expressiveness,
and simplicity as you get with highly-refined React-centric toolchains, but without transpilation,
domain-specific-languages, or other tricks that provide convenience at the cost of becoming locked-in
to React, a specific state-management system (which permeats your business logic), and UI framework.

Here's the usual codesandbox \`React Typescript\` boilerplate [converted to \`xinjs\`](https://codesandbox.io/s/xinapp-eei48c?file=/src/app.ts).

The standard [React Todo List Example](https://codesandbox.io/s/xinjs-react-reminders-demo-v0-4-2-l46k52?file=/src/App.tsx)
becomes shorter and simpler with \`xinjs\` and _cleanly separates_ business logic from presentation. \`xinjs\` **paths** route data to/from UI elements, and events from the UI to methods, and those paths are _exactly what you expect_.

But xinjs lets you work with pure HTML components as cleanly—more cleanly—and efficiently than
React toolchains let you work with JSX.

    export default function App() {
      return (
        <div className="App">
          <h1>Hello React</h1>
          <h2>Start editing to see some magic happen!</h2>
        </div>
      );
    }

Becomes:

    const { div, h1, h2 } = elements // exported from xinjs
    export const App = () => div(
      { class: 'App' },
      h1('Hello xinjs'),
      h2('Start editing to see some magic happen!')
    )

Except this reusable component outputs native DOM nodes. No transpilation, spooky magic at a distance,
or virtual DOM required. And it all works just as well with web-components. This is you get when
you run App() in the console:

    ▼ <div class="App">
        <h1>Hello xinjs</h1>
        <h2>Start editing to see some magic happen!</h2>
      </div>

The ▼ is there to show that's **DOM nodes**, not HTML.

\`xinjs\` lets you lean into web-standards and native browser functionality while writing less code that's
easier to run, debug, deploy, and maintain. Bind data direct to standard input elements—without having
to fight their basic behavior—and now you're using _native_ functionality with _deep accessibility_ support
as opposed to whatever the folks who wrote the library you're using have gotten around to implementing.

> **Aside**: \`xinjs\` will also probably work perfectly well with \`Angular\`, \`Vue\`, et al, but I haven't
> bothered digging into it and don't want to deal with \`ngZone\` stuff unless someone is paying
> me.

If you want to build your own \`web-components\` versus use something off-the-rack like
[Shoelace](https://shoelace.style), \`xinjs\` offers a \`Component\` base class that, along with
its \`elements\` and \`css\` libraries allows you to implement component views in pure Javascript
more compactly than with \`jsx\` (and without a virtual DOM).

    import { Component, elements, css } from 'xinjs'

    const { style, h1, slot } = elements
    export class MyComponent extends Component {
      styleNode = style(css({
        h1: {
          color: 'blue'
        }
      }))
      content = [ h1('hello world'), slot() ]
    }

The difference is that \`web-components\` are drop-in replacements for standard HTML elements
and interoperate happily with one-another and other libraries, load asynchronously,
and are natively supported by all modern browsers.

## What \`xinjs\` does

### Observe Object State

\`xinjs\` tracks the state of objects you assign to it using \`paths\` allowing economical
and direct updates to application state.

    import { xinProxy, observe } from 'xinjs'

    const { app } = xinProxy({
      app: {
        prefs: {
          darkmode: false
        },
        docs: [
          {
            id: 1234,
            title: 'title',
            body: 'markdown goes here'
          }
        ]
      }
    })

    observe('app.prefs.darkmode', () => {
      document.body.classList.toggle('dark-mode', app.prefs.darkmode)
    })

    observe('app.docs', () => {
      // render docs
    })

> #### What does \`xinProxy\` do, and what is a \`XinProxy\`?
>
> \`xinProxy\` is syntax sugar for assigning something to \`xin\` (which is a \`XinProxyObject\`)
> and then getting it back out again.
>
> A \`XinProxy\` is an [ES Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
> wrapped around an \`object\` (which in Javascript means anything
> that has a \`constructor\` which in particular includes \`Array\`s, \`class\` instances, \`function\`s
> and so on, but not "scalars" like \`number\`s, \`string\`s, \`boolean\`s, \`null\`, and \`undefined\`)
>
> All you need to know about a \`XinProxy\` is that it's Proxy wrapped around your original
> object that allows you to interact with the object normally, but which allows \`xinjs\` to
> **observe** changes made to the wrapped object and tell interested parties about the changes.
>
> If you want to original object back you can just hold on to a reference or use \`xinValue(someProxy)\`
> to unwrap it.

### No Tax, No Packaging

\`xinjs\` does not modify the stuff you hand over to it… it just wraps objects
with a \`Proxy\` and then if you use \`xin\` to make changes to those objects,
\`xinjs\` will notify any interested observers.

**Note** \`xinProxy({foo: {...}})\` is syntax sugar for \`xin.foo = {...}\`.

    import { xinProxy, observe } from 'xinjs'
    const { foo } = xinProxy({
      foo: {
        bar: 17
      }
    })

    observe('foo.bar', v => {
      console.log('foo.bar was changed to', xin.foo.bar)
    })

    foo.bar = 17        // does not trigger the observer
    foo.bar = Math.PI   // triggers the observer

### Paths are like JavaScript

\`xin\` is designed to behave just like a JavaScript \`Object\`. What you put
into it is what you get out of it:

    import { xin, xinValue } from 'xinjs'

    const foo = {bar: 'baz'}
    xin.foo = foo

    // xin.foo returns a Proxy wrapped around foo (without touching foo)
    xinValue(xin.foo) === foo

    // really, it's just the original object
    xin.foo.bar = 'lurman'
    foo.bar === 'lurman' // true

    // seriously, it's just the original object
    foo.bar = 'luhrman'
    xin.foo.bar === 'luhrman' // true

### …but better!

It's very common to deal with arrays of objects that have unique id values,
so \`xinjs\` supports the idea of id-paths

    import { xinProxy, xin } from 'xinjs

    const { app } = xinProxy ({
      app: {
        list: [
          {
            id: '1234abcd',
            text: 'hello world'
          },
          {
            id: '5678efgh',
            text: 'so long, redux'
          }
        ]
      }
    })

    console.log(app.list[0].text)              // hello world
    console.log(app.list['id=5678efgh'])       // so long, redux
    console.log(xin['app.list[id=1234abcd'])   // hello world

### Telling \`xin\` about changes using \`touch()\`

Sometimes you will modify an object behind \`xin\`'s back (e.g. for efficiency).
When you want to trigger updates, simply touch the path.

    import { xin, observe, touch } from 'xinjs'

    const foo = { bar: 17 }
    xin.foo = foo
    observe('foo.bar', path => console.log(path, '->', xin[path])
    xin.foo.bar = -2              // console will show: foo.bar -> -2

    foo.bar = 100                 // nothing happens
    touch('foo.bar')              // console will show: foo.bar -> 100

### CSS

\`xinjs\` includes utilities for working with css.

    import {css, vars, initVars, darkMode} from 'xinjs'
    const cssVars = {
      textFont: 'sans-serif'
      color: '#111'
    }

\`initVars()\` processes an object changing its keys from camelCase to --kabob-case:

    initVars(cssVars) // emits { --text-font: "sans-serif", --color: "#111" }

\`darkMode()\` processes an object, taking only the color properties and inverting their luminance values:
darkMode(cssVars) // emits { color: '#ededed' }

The \`vars\` simply converts its camelCase properties into css variable references

    vars.fooBar // emits 'var(--foo-bar)'
    calc(\`\${vars.width} + 2 * \${vars.spacing}\`) // emits 'calc(var(--width) + 2 * var(--spacing))'

\`css()\` processes an object, rendering it as CSS

    css({
      '.container': {
        'position', 'relative'
      }
    }) // emits .container { position: relative; }

## Color

\`xinjs\` includes a powerful \`Color\` class for manipulating colors.

    import {Color} from 'xinjs
    const translucentBlue = new Color(0, 0, 255, 0.5) // r, g, b, a parameters
    const postItBackground = Color.fromCss('#e7e79d')
    const darkGrey = Color.fromHsl(0, 0, 0.2)

The color objects have computed properties for rendering the color in different ways,
making adjustments, blending colors, and so forth.

## Hot Reload

One of the nice things about working with the React toolchain is hot reloading.
\`xinjs\` supports hot reloading (and not just in development!) via the \`hotReload()\`
function:

    import {xin, hotReload} from 'xinjs'

    xin.app = {
      ...
    }

    hotReload()

\`hotReload\` stores serializable state managed by \`xin\` in localStorage and restores
it (by overlay) on reload. Because any functions (for example) won't be persisted,
simply call \`hotReload\` after initializing your app state and you're good to go.

\`hotReload\` accepts a test function (path => boolean) as a parameter.
Only top-level properties in \`xin\` that pass the test will be persisted.

To completely reset the app, run \`localStorage.clear()\` in the console.

### Types

\`xinjs\` [type-by-example](https://www.npmjs.com/package/type-by-example) has been
broken out into a separate standalone library. (Naturally it works very well with
xinjs but they are completely independent.)

## Development Notes

You'll need to install [bun](https://bun.sh/) and [nodejs](https://nodejs.org)),
and then run \`npm install\` and \`bun install\`. \`bun\` is used because it's
**fast** and is a really nice test-runner.

To work interactively on the demo code, use \`bun start\`. This runs the demo
site on localhost.

To build everything run \`bun run make\` which builds production versions of the
demo site (in \`www\`) and the \`dist\` and \`cdn\` directories.

To create a local package (for experimenting with a build) run \`bun pack\`.

### Parcel Occasionally Gets Screwed Up

- remove all the parcel transformer dependencies @parcel/\\*
- rm -rf node_modules
- run the update script
- npx parcel build (which restores needed parcel transformers)

## Related Libraries

- react-xinjs [react-xinjs](https://github.com/tonioloewald/react-xinjs#readme)
  allows you to use xin's path-observer model in React [ReactJS](https://reactjs.org) apps
- type-by-example [github](https://github.com/tonioloewald/type-by-example) | [npm](https://www.npmjs.com/package/type-by-example)
  is a library for declaring types in pure javascript, allowing run-time type-checking.
- filter-shapes [github](https://github.com/tonioloewald/filter-shapes) | [npm](https://www.npmjs.com/package/filter-shapes)
  is a library for filtering objects (and arrays of objects) to specific shapes (e.g. to reduce storage / bandwidth costs).
  It is built on top of type-by-example.

## Credits

\`xinjs\` is in essence a highly incompatible update to \`b8rjs\` with the goal
of removing cruft, supporting more use-cases, and eliminating functionality
that has been made redundant by improvements to the JavaScript language and
DOM APIs.

\`xinjs\` is being developed using [bun](https://bun.sh/).
\`bun\` is crazy fast (based on Webkit's JS engine, vs. V8), does a lot of stuff
natively, and runs TypeScript (with import and require) directly.
`,title:"xinjs",filename:"README.md",path:"README.md",pin:"top"},{text:`# bind

\`bind()\` lets you synchronize data / application state to the user-interface reliably,
efficiently, and with a minimum of code.

## An Aside on Reactive Programming vs. the Observer Model

A good deal of front-end code deals with keeping the application's
state synchronized with the user-interface. One approach to this problem
is [Reactive Programming](https://en.wikipedia.org/wiki/Reactive_programming)
as exemplified by [React](https://reactjs.org) and its many imitators.

\`xinjs\` works very well with React via the [useXin](./useXin.md) React "hook".
But \`xinjs\` is not designed for "reactive programming" and in fact "hooks" aren't
"reactive" at all, so much as an example of the "observer" or "pub/sub" pattern.

\`xinjs\` is a "path-observer" in that it's an implementation of the
[Observer Pattern](https://en.wikipedia.org/wiki/Observer_pattern)
where **path strings** serve as a level of *indirection* to the things observed.
This allows data to be "observed" before it exists, which in particular *decouples* the setup
of the user interface from the initialization of data and allows user interfaces
built with \`xinjs\` to be *deeply asynchronous*.

## \`bind\`

The \`bind\` function is a simple way of tying an \`HTMLElement\`'s properties to
state via \`path\` using [bindings](bindings.md)

    import {bind, bindings, xin, elements, updates} from 'xinjs'
    const {div, input} = elements

    const divElt = div()
    bind(divElt, 'app.title', bindings.text)
    document.body.append(divElt)

    const inputElt = input()
    bind(inputElt, 'app.title', bindings.value)

    xin.app = {title: 'hello world'}
    await updates()

What's happening is essentially the same as:

    divElt.textContent = xin.app.title
    observe('app.title', () => divElt.textContent = xin.app.title)

    inputElt.value = xin.app.title
    observe('app.title', () => inputElt.value = xin.app.title)
    inputElt.addEventListener('change', () => { xin.app.title = inputElt.value })

Except:

1. this code is harder to write
2. it will fail if xin.app hasn't been initialized (which it hasn't!)
3. inputElt will also trigger *debounced* updates on \`input\` events

After this. \`div.textContent\` and \`inputElt.value\` are 'hello world'.
If the user edits the value of \`inputElt\` then \`xin.app.title\` will
be updated, and \`app.title\` will be listed as a changed path, and
an update will be fired via \`setTimout\`. When that update fires,
anything observer of the paths \`app.text\` and \`app\` will be fired.

A \`binding\` looks like this:

    interface XinBinding {
      toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void
      fromDOM?: (element: HTMLElement) => any
    }

Simply put the \`toDOM\` method updates the DOM based on changes in state
while \`fromDOM\` updates state based on data in the DOM. Most bindings
will have a \`toDOM\` method but no \`fromDOM\` method since \`bindings.value\`
(which has both) covers most of the use-cases for \`fromDOM\`.

It's easy to write your own \`bindings\` if those in \`bindings\` don't meet your
need, e.g. here's a custom binding that toggles the visibility of an element
based on whether the bound value is neither "falsy" nor an empty \`Array\`.

    const visibility = {
      toDOM(element, value) {
        if (element.dataset.origDisplay === undefined && element.style.display !== 'none') {
          element.dataset.origDisplay = element.style.display
        }
        element.style.display = (value != null && element.length > 0) ? element.dataset.origDisplay : 'none'
      }
    }
    bind(listElement, 'app.bigList', visibility)`,title:"bind",filename:"bind.ts",path:"src/bind.ts"},{text:`# bindings

\`bindings\` is simply a collection of common bindings.

You can create your own bindings easily enough (and add them to \`bindings\` if so desired).

A \`binding\` looks like this:

    interface XinBinding {
      toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void
      fromDOM?: (element: HTMLElement) => any
    }

The \`fromDOM\` function is only needed for bindings to elements that trigger \`change\` or \`input\`
events, typically \`<input>\`, \`<textarea>\`, and \`<select>\` elements, and of course your
own [Custom Elements](web-components.md).

You can see examples of these bindings in the [kitchen sink demo](../demo/components/kitchen-sink.ts).

## set

The \`set\` binding sends state from \`xin\` to the bound element's \`value\` property. It's a
"one way" version of the \`value\` binding. It's recommended for handling compound
UI elements like dialog boxes or composite custom-elements like a code-editor which might
have all kinds of internal elements generating \`change\` events.

## value

The \`value\` binding syncs state from \`xin\` to the bound element's \`value\` property. In
general this should only be used for binding simple things, like \`<input>\` and \`<textarea>\`
elements.

## text

The \`text\` binding copies state from \`xin\` to the bound element's \`textContent\` property.

## enabled & disabled

The \`enabled\` and \`disabled\` bindings allow you to make a widget's enabled status
be determined by the truthiness of something in \`xin\`, e.g.

\`\`\`
import { xinProxy, elements } from 'xinjs'

const myDoc = xinProxy({
    myDoc: {
        content: ''
        unsavedChanges: false
    }
}, 1)

// this button will only be enabled if there is something in \`myList.array\`
document.body.append(
    elements.textarea({
        bindValue: myDoc.content,
        onInput() {
            myDoc.unsavedChanges = true
        }
    }),
    elements.button(
        'Save Changes',
        {
            bindEnabled: myDoc.unsavedChanges,
            onClick() {
                // save the doc
                myDoc.unsavedChanges = false
            }
        }
    )
)
\`\`\`

## list

The \`list\` binding makes a copy of a \`template\` element inside the bound element
for every item in the bound \`Array\`.

It uses the existing **single** child element it finds inside the bound element
as its \`template\`. If the child is a \`<template>\` (which is a good idea) then it
expects that \`template\` to have a *single child element*.

E.g. if you have a simple unordered list:

    <ul>
      <li></li>
    </ul>

You can bind an array to the \`<ul>\` and it will make a copy of the \`<li>\` inside
for each item in the source array.

The \`list\` binding accepts as options:
- \`idPath: string\`
- \`initInstance: (element, item: any) => void\`
- \`updateInstance: (element, item: any) => void\`
- \`virtual: {width?: number, height: number}\`
- \`hiddenProp: symbol | string\`
- \`visibleProp: symbol | string\`

\`initInstance\` is called once for each element created, and is passed
that element and the array value that it represents.

Meanwhile, \`updateInstance\` is called once on creation and then any time the
array value is updated.

### Virtual List Binding

If you want to bind large arrays with minimal performance impact, you can make a list
binding \`virtual\` by passing the \`height\` (and optionally \`width\`) of an item.
Only visible elements will be rendered. Just make sure the values passed represent
the *minimum* dimensions of the individual rendered items if they can vary in size.

You can find examples of large, virtual bound arrays in [ArrayBindingsTest.ts](../demo/ArrayBindingTest.ts)
and [list-filters.ts](../demo/components/list-filters.ts)

### Filtered Lists and Detail Views

You can **filter** the elements you wish to display in a bound list by using the
\`hiddenProp\` (to hide elements of the list) and/or \`visibleProp\` (to show elements
of the list).

You can pass a \`path\` or a \`symbol\` as either the \`hiddenProp\` or \`visibleProp\`.

Typically, you can use \`hiddenProp\` to power filters and \`visibleProp\` to power
detail views. The beauty of using symbols is that it won't impact the serialized
values of the array and different views of the array can use different selection
and filtering criteria.

An example of a large array bound to a filtered list view using \`hiddenProp\`
and a detail view using \`visibleProp\` can be found in [list-filters.ts](../demo/components/list-filters.ts).

> **Note** for a given list-binding, if you specify \`hiddenProp\` (but not \`visibleProp\`),
> then all items in the array will be shown *unless* \`item[hiddenProp] === true\`.
>
> Conversely, if you specify \`visibleProp\` (but not \`hiddenProp\`), then all items
> in the array will be ignored *unless* \`item[visibleProp] === true\`.
>
> If, for some reason, you specify both then an item will only be visible if
> it \`item[visibleProp] === true\` and \`item[hiddenProp] !== true\`.

### Binding custom-elements using idPath

If you list-bind a custom-element with \`bindValue\` implemented and providing an
\`idPath\` then the list-binding will bind the array items to the value of the
custom-element.

See [arrayBindingTest.ts](../demo/ArrayBindingTest.ts) for an example of this.

### xin-empty-list class

The \`list\` binding will automatically add the class \`-xin-empty-list\` to a
container bound to an empty array, making it easier to conditionally render
instructions or explanations when a list is empty.`,title:"bindings",filename:"bindings.ts",path:"src/bindings.ts"},{text:`# blueprints

One issue with standard web-components built with xinjs is that building them
"sucks in" the version of \`xinjs\` you're working with. This isn't a huge problem
with monolithic code-bases, but it does prevent components from being loaded
"on-the-fly" from CDNs and composed on the spot and it does make it hard to
"tree shake" component libraries.

Another issue is name-collision. What if two people create a \`<tab-selector>\` component
and you want to use both of them? Or you want to switch to a new and better one but
don't want to do it everywhere all at once?

With blueprints, the *consumer* of the component chooses the \`tag\`, reducing the
chance of name-collision. (You can consume the same blueprint multiple times,
giving each one its own tag.)

To address these issues, \`xinjs\` provides a \`<xin-loader>\` loader component and
a function \`makeComponent\` that can define a component given a blueprint
function.

## \`<xin-loader>\`—the blueprint loader

\`<xin-loader>\` is a simple custom-element provided by \`xinjs\` for the dynamic loading
of component **blueprints**. It will load its \`<xin-blueprint>\`s in parallel.

\`\`\`
<xin-loader>
  <xin-blueprint tag="swiss-clock" src="https://loewald.com/lib/swiss-clock"></xin-blueprint>
</xin-loader>
<swiss-clock>
  <code style="color: var(--brand-color)">xinjs</code> rules!
</swiss-clock>
\`\`\`

### \`<xin-blueprint>\` Attributes

- \`src\` is the url of the \`blueprint\` javascript module (required)
- \`tag\` is the tagName you wish to use. This defaults to the name of the source file if suitable.
- \`property\` allows you to load a named exported property from a blueprint module
  (allowing one blueprint to export multiple blueprints). By default, it's \`default\`.

#### \`<xin-loader>\` and \`<xin-blueprint>\` Properties

- \`onload\` is called by \`<xin-loader>\` when all its blueprints are loaded, and by
  \`<xin-blueprint>\` when its blueprint is loaded.

#### Properties

- \`onload\` is called when all the blueprints have loaded.

## \`makeComponent(tag: string, blueprint: XinBlueprint): Promise<XinPackagedCompoent>\`

\`makeComponent\` takes a \`tag\` of your choice and a \`blueprint\` and generates
the custom-element's \`class\` and \`elementCreator\` as its \`type\` and \`creator\`
properties.

So, instead of:

    import {myThing} from './path/to/my-thing'

    document.body.append(myThing())

You could write:

    import { makeComponent } from 'xinjs'
    import myThingBlueprint from './path/to/my-thing-blueprint'

    makeComponent('different-tag', myThingBlueprint).then((packaged) => {
      document.body.append(packaged.creator())
    })


## \`XinBlueprint\`

    export interface XinFactory {
      Color: typeof Color
      Component: typeof Component
      elements: typeof elements
      svgElements: typeof svgElements
      mathML: typeof mathML
      vars: typeof vars
      varDefault: typeof varDefault
      xinProxy: typeof xinProxy
      boxedProxy: typeof boxedProxy
      version: string
    }

    export interface XinPackagedComponent {
      type: typeof Component
      creator: ElementCreator
    }

    export type XinBlueprint = (
      tag: string,
      module: XinFactory
    ) => XinPackagedComponent

\`XinBlueprint\` lets you provide a component "blueprint", in the form of a function,
that can be loaded and turned into an actual component. The beauty of this is that
unlike an actual component, the blueprint has no special dependencies.

So instead of defining a component like this:

    import { Component, elements, vars, varDefault } from 'xinjs'

    const { h2, slot } = elements

    export class MyThing extends Component {
      static styleSpec = {
        ':host': {
          color: varDefault.textColor('#222'),
          background: vars.bgColor,
        },

        content = () => [
          h2('my thing'),
          slot()
        ]
      }
    }

    export const myThing = myThing.elementCreator({
      tag: 'my-thing',
      styleSpec: {
        _bgColor: '#f00'
      }
    })

You can define a "blueprint" like this:

    import { XinBlueprint } from 'xinjs'

    const blueprint: XinBlueprint = (
      tag,
      { Component, elements, vars, varDefault }
    ) => {
      const {h2, slot} = elements

      class MyThing extends Component {
        static styleSpec = {
          ':host': {
            color: varDefault.textColor('#222'),
            background: vars.bgColor,
          },

          content = () => [
            h2('my thing'),
            slot()
          ]
        }
      }

      return {
        type: MyThing,
        styleSpec: {
          _bgColor: '#f00'
        }
      }
    }

The blueprint function can be \`async\`, so you can use async import inside it to pull in dependencies.

> **Note** that in this example the blueprint is a *pure* function (i.e. it has no side-effects).
> If this blueprint is consumed twice, each will be completely independent. A non-pure blueprint
> could be implemented such that the different versions of the blueprint share information.
> E.g. you could maintain a list of all the instances of any version of the blueprint.`,title:"blueprints",filename:"blueprint-loader.ts",path:"src/blueprint-loader.ts"},{text:`# color

\`xinjs\` includes a compact (~1.3kB) and powerful \`Color\` class for manipulating colors.
The hope is that when the CSS provides native color calculations this will no
longer be needed.

## Color

The most straightforward method for creating a \`Color\` instance is using
the constructor to create an \`rgb\` or \`rgba\` representation.

## Static Methods

\`Color.fromCss(cssColor: string): Color\` produces a \`Color\` instance from any
css color definition the browser can handle.

\`Color.fromHsl(h: number, s: number, l: number, a = 1)\` produces a \`Color\`
instance from HSL/HSLA values. The HSL values are cached internally and
used for internal calculations to reduce precision problems that occur
when converting HSL to RGB and back. It's nowhere near as sophisticated as
the models used by (say) Adobe or Apple, but it's less bad than doing all
computations in rgb.

## Properties

- \`r\`, \`g\`, \`b\` are numbers from 0 to 255.
- \`a\` is a number from 0 to 1

## Properties (read-only)

- \`html\` — the color in HTML \`#rrggbb[aa]\` format
- \`inverse\` — the photonegative of the color (light is dark, orange is blue)
- \`inverseLuminance\` — inverts luminance but keeps hue, great for "dark mode"
- \`rgb\` and \`rgba\` — the color in \`rgb(...)\` and \`rgba(...)\` formats.
- \`hsl\` and \`hsla\` — the color in \`hsl(...)\` and \`hsla(...)\` formats.
- \`RGBA\` and \`ARGB\` — return the values as arrays of numbers from 0 to 1 for use with
  [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) (for example).
- \`brightness\` — this is the brightness of the color based on [BT.601](https://www.itu.int/rec/R-REC-BT.601)
- \`mono\` — this produces a \`Color\` instance that a greyscale version (based on \`brightness\`)

## Manipulating Colors

Each of these methods creates a new color instance based on the existing color(s).

In each case \`amount\` is from 0 to 1, and \`degrees\` is an angle (e.g. ± 0 to 360).

- \`brighten(amount: number)\`
- \`darken(amount: number)\`
- \`saturate(amount: number)\`
- \`desaturate(amount: number)\`
- \`rotate(angle: number)\`
- \`opacity(amount: number)\` — this just creates a color with that opacity (it doesn't adjust it)
- \`mix(otherColor: Color, amount)\` — produces a mix of the two colors in HSL-space
- \`blend(otherColor: Color, amount)\` — produces a blend of the two colors in RGB-space (usually icky)

Where-ever possible, unless otherwise indicated, all of these operations are performed in HSL-space.
HSL space is not great! For example, \`desaturate\` essentially blends you with medium gray (\`#888\`)
rather than a BT.601 \`brightness\` value where "yellow" is really bright and "blue" is really dark.

If you want to desaturate colors more nicely, you can try blending them with their own \`mono\`.

## Utilities

- \`swatch()\` emits the color into the console with a swatch and returns the color for chaining.
- \`toString()\` emits the \`html\` property`,title:"color",filename:"color.ts",path:"src/color.ts"},{text:`# css

\`xinjs\` provides a collection of utilities for working with CSS rules that
help leverage CSS variables to produce highly maintainable and lightweight
code that is nonetheless easy to customize.

The basic goal is to be able to implement some or all of our CSS very efficiently, compactly,
and reusably in Javascript because:

- Javascript quality tooling is really good, CSS quality tooling is terrible
- Having to write CSS in Javascript is *inevitable* so it might as well be consistent and painless
- It turns out you can get by with *much less* and generally *simpler* CSS this way
- You get some natural wins this way. E.g. writing two definitions of \`body {}\` is easy to do
  and bad in CSS. In Javascript it's simply an error!

The \`css\` module attempts to implement all this the simplest and most obvious way possible,
providing syntax sugar to help with best-practices such as \`css-variables\` and the use of
\`@media\` queries to drive consistency, themes, and accessibility.

## css(styleMap: XinStyleMap): string

A function that, given a \`XinStyleMap\` renders CSS code. What is a XinStyleMap?
It's kind of what you'd expect if you wanted to represent CSS as Javascript in
the most straightforward way possible. It allows for things like \`@import\`,
\`@keyframes\` and so forth, but knows just enough about CSS to help with things
like autocompletion of CSS rules (rendered as camelcase) so that, unlike me, it
can remind you that it's \`whiteSpace\` and not \`whitespace\`.

    import {elements, css} from 'xinjs'
    const {style} = elements

    const myStyleMap = {
      body: {
        color: 'red'
      },
      button: {
        borderRadius: 5
      }
    }

    document.head.append(style(css(myStyleMap)))

If a bare, non-zero **number** is assigned to a CSS property it will have 'px' suffixed
to it automatically. There are *no bare numeric*ele properties in CSS except \`0\`.

Why \`px\`? Well the other obvious options would be \`rem\` and \`em\` but \`px\` seems the
least surprising option.

\`css\` should render nested rules, such as \`@keyframes\` and \`@media\` correctly.

## initVars({[key: string]: any}) => {[key: string]: any}

Given a map of CSS properties (in camelCase) form emit a map of css-variables to
the values, with \`px\` suffixed to bare numbers where appropriate.

    const cssVars = {
      textColor: '#222',   // --text-color: #222
      background: '#eee',  // --background: #eee
      fontSize: 15         // --font-size: 15px
    }

    const myStyleMap = {
      ':root': initVars(cssVars)
    }
## darkMode({[key: string]: any}) => {[key: string]: string}

Given a map of CSS properties (in camelCase) emit a map of those properties that
has color values with their luminance inverted.

    const myStyleMap = {
      ':root': cssVars,               // includes --font-size
      '@media (prefers-color-scheme: dark)': {
        ':root': darkMode(cssVars)    // omits --font-size
      },
    }

## vars

\`vars\` is a proxy object that will return a css variable string from
a camelCase property, e.g.

    vars.camelCase // 'var(--camel-case)'

> **it isn't called \`var\`** because that's a reserved word!

### varDefault

\`varDefault\` is a proxy object just like \`vars\` except that it returns a
\`function\` that takes a property and renders it as a css variable reference
with a default, e.g

    varDefault.borderColor('red') // \`var(--border-color, red)\`

### Syntax Sugar for \`calc(...)\`

More importantly, \`vars\` allows you to conveniently perform calculations
on css (dimensional) variables by a percentage:

    vars.camelSize50    // 'calc(var(--camel-size) * 0.5)'
    vars.camelSize_50   // 'calc(var(--camel-size) * -0.5)'

### Computed Colors

> **Caution** although these look superficially like the \`vars\` syntax
> sugar for \`calc()\` performed on dimensional variables, they are in fact
> color calculations are performed on colors *evaluated* on \`document.body\`.

You can write:

    initVars({
      lineHeight: 24,
      spacing: 5,
      buttonHeight: calc(\`vars.lineHeight + vars.spacing200\`)
    })

And then render this as CSS and stick it into a StyleNode and it will work.

You *cannot* write:

    initVars({
      background: '#fafafa',
      blockColor: vars.background_5b
    })

Because \`--background\` isn't defined on \`document.body\` yet, so vars.background_5b
won't be able to tell what \`--background\` is going to be yet. So either you need to
do this in two stags (create a StyleNode that defines the base color \`--background\`
then define the computed colors and add this) OR use a \`Color\` instance:

    const background = Color.fromCss('#fafafa')

    initVars({
      background: background.toHTML,
      blockColor: background.brighten(-0.05).toHTML
    })

Until browsers support color calculations the way they support dimenion arithmetic with \`calc()\`
this is the miserable existence we all lead. That, or defining huge arrays of color
values that we mostly don't use and are often not exactly what we want. You choose!

> **New** color now supports CSS [named colors](https://developer.mozilla.org/en-US/docs/Web/CSS/named-color),
such as \`black\`, \`red\`, and \`aliceblue\`.

\`vars\` also allows you to perform color calculations on css (color)
variables:

#### Change luminance with \`b\` (for brighten) suffix

The scale value is treated as a percentage and moves the brightness
that far from its current value to 100% (if positive) or 0% (if negattive).

    vars.textColor50b   // increases the luminance of textColor
    vars.textColor_50b  // halves the luminance of textColor

#### Change saturation with \`s\` suffix

The scale value is treated as a percentage and moves the saturation
that far from its current value to 100% (if positive) or 0% (if negattive).

    vars.textColor50s   // increases the saturation of textColor
    vars.textColor_50s  // halves the saturation of textColor

#### Rotate hue with \`h\` suffix

    vars.textColor30h   // rotates the hue of textColor by 30°
    vars.textColor_90h  // rotates the hue of textColor by -90°

#### Set Opacity with \`o\` suffix

Unlike the other modifiers, \`o\` simply sets the opacity of the
resulting color to the value provided.

    vars.textColor50o   // textColor with opacity set to 0.5

## More to follow?

The more I use the \`css\` module, the more I like it and the more ideas I have
to make it even better, but I have a very tight size/complexity target
for \`xinjs\` so these new ideas really have to earn a spot. Perhaps the
feature I have come closest to adding and then decided against was providing
syntax-sugar for classs so that:

    css({
      _foo: {
        color: 'red'
      }
    })

Would render:

    .foo {
      color: 'red'
    }

But looking at the code I and others have written, the case for this is weak as most class
declarations are not just bare classes. This doesn't help with declarations
for \`input.foo\` or \`.foo::after\` or \`.foo > *\` and now there'd be things that
look different which violates the "principle of least surprise". So, no.

### Something to Declare

Where I am always looking to improve this module (and all of \`xinjs\`) is to
do a better job of **declaring** things to improve autocomplete behavior and
minimize casting and other Typescript antipatterns. E.g. adding a ton of
declarations to \`elements\` and \`css\` has done wonders to reduce the need for
stuff like \`const nameElement = this.parts.nameField as unknown as HTMLInputElement\`
and prevent css property typos without adding a single byte to the size of
the javascript payload.`,title:"css",filename:"css.ts",path:"src/css.ts"},{text:`# elements

\`xinjs\` provides \`elements\` for easily and efficiently generating DOM elements
without using \`innerHTML\` or other unsafe methods.

    import {elements} from 'xinjs'

    const {label, span, input} = elements

    document.body.append(
      label(
      {style: {
        display: 'inline-flex'
      }},
      span('This is a field'),
      input({value: 'hello world', placeholder: 'type something'})
      )
    )

\`elements\` is a proxy whose properties are element factory functions,
so \`elements.foo\` is a function that returns a \`<foo>\` element.

The arguments of the factory functions can be strings, numbers, other
elements, or property-maps, which are converted into attributes or properties.

E.g.

    const {span} = elements
    span('foo')                   // produces <span>foo</foo>
    span('bar', {class: 'foo'})   // produces <span class="foo">bar</span>
    button('click me', {
      onclick() {
        alert('you clicked me')
      }
    })                            // creates a button with an event handler
    input({
      type: 'checkbox',
      checked: true
    })                            // produces a checked checkbox

## camelCase conversion

Attributes in camelCase, e.g. \`dataInfo\`, will be converted to kebab-case,
so:

    span({dataInfo: 'foo'})        // produces <span data-ref="foo"></span>

## style properties

\`style\` properties can be objects, and these are used to modify the
element's \`style\` object (while a string property will just change the
element's \`style\` attribute, eliminating previous changes).

  span({style: 'border: 1px solid red'}, {style: 'font-size: 15px'})

…produces \`<span style="font-size: 15px"></span>\`, which is probably
not what was wanted.

  span({style: {border: '1px solid red'}, {style: {fontSize: '15px'}}})

…produces \`<span style="border: 1px solid red; fon-size: 15px></span>\`
which is probably what was wanted.

## event handlers

Properties starting with \`on\` (followed by an uppercase letter)
will be converted into event-handlers, so \`onMouseup\` will be
turned into a \`mouseup\` listener.

## binding

You can [bind](bind.md) an element to state using [bindings](bindings.md)
using convenient properties, e.g.

    import { elements } from 'xinjs'
    const {div} = elements
    div({ bindValue: 'app.title' })

…is syntax sugar for:

    import { elements, bind, bindings } from 'xinjs'
    const { div } = elements
    bind( div(), 'app.title', bindings.value )

If you want to use your own bindings, you can use \`apply\`:

    const visibleBinding = {
      toDOM(element, value) {
        element.classList.toggle('hidden', !value)
      }
    }

    div({ apply(elt){
      bind(elt, 'app.prefs.isVisible', visibleBinding})
    } })

## apply

A property named \`apply\` is assumed to be a function that will be called
on the element.

    span({
      apply(element){ element.textContent = 'foobar'}
    })

…produces \`<span>foobar</span>\`.

## fragment

\`elements.fragment\` is produces \`DocumentFragment\`s, but is otherwise
just like other element factory functions.

## svgElements

\`svgElements\` is a proxy just like \`elements\` but it produces **SVG** elements in
the appropriate namespace.

## mathML

\`mathML\` is a proxy just like \`elements\` but it products **MathML** elements in
the appropriate namespace.

> ### Caution
>
> Both \`svgElements\` and \`mathML\` are experimental and do not have anything like  the
> degree of testing behind them as \`elements\`. In particular, the properties of
> SVG elements (and possible MathML elements) are quite different from ordinary
> elements, so the underlying \`ElementCreator\` will never try to set properties
> directly and will always use \`setAttribute(...)\`.
>
> E.g. \`svgElements.svg({viewBox: '0 0 100 100'})\` will call \`setAttribute()\` and
> not set the property directly, because the \`viewBox\` property is… weird, but
> setting the attribute works.
>
> Again, use with caution!`,title:"elements",filename:"elements.ts",path:"src/elements.ts"},{text:`# throttle & debounce

Usage:

    const debouncedFunc = debounce(func, 250)
    const throttledFunc = debounce(func, 250)

\`throttle(voidFunc, interval)\` and \`debounce(voidFunc, interval)\` are utility functions for
producing functions that filter out unnecessary repeated calls to a function, typically
in response to rapid user input, e.g. from keystrokes or pointer movement.

The usual purpose of these functions is to prevent over-calling of a function based on
rapidly changing data, such as keyboard event or scroll event handling.

\`debounce\`ed functions will only actually be called \`interval\` ms after the last time the
wrapper is called.

E.g. if the user types into a search field, you can call a \`debounce\`ed
function to do the query, and it won't fire until the user stops typing for \`interval\` ms.

\`throttle\`ed functions will only called at most every \`interval\` ms.

E.g. if the user types into a search field, you can call a \`throttle\`ed function
every \`interval\` ms, including one last time after the last time the wrapper is called.

> In particular, both throttle and debounce are guaranteed to execute the
> wrapped function after the last call to the wrapper.

Note that parameters will be passed to the wrapped function, and that *the last call always goes through*.
However, parameters passed to skipped calls will *never* reach the wrapped function.`,title:"throttle & debounce",filename:"throttle.ts",path:"src/throttle.ts"},{text:`# web-components

**xinjs** provides the abstract \`Component\` class to make defining custom-elements
easier.

## Component

To define a custom-element you can subclass \`Component\`, simply add the properties
and methods you want, with some help from \`Component\` itself, and then simply
export your new class's \`elementCreator()\` which is a function that defines your
new component's element and produces instances of it as needed.

    import {Component} from 'xinjs'

    class ToolBar extends Component {
      static styleSpec = {
        ':host': {
          display: 'flex',
          gap: '10px',
        },
      }
    }

    export const toolBar = ToolBar.elementCreator({ tag: 'tool-bar' })

This component is just a structural element. By default a \`Component\` subclass will
comprise itself and a \`<slot>\`. You can change this by giving your subclass its
own \`content\` template.

The last line defines the \`ToolBar\` class as the implementation of \`<tool-bar>\`
HTML elements (\`tool-bar\` is derived automatically from the class name) and
returns an \`ElementCreator\` function that creates \`<tool-bar>\` elements.

See [elements](./elements.md) for more information on \`ElementCreator\` functions.

### Component properties

#### content: Element | Element[] | () => Element | () => Element[] | null

Here's a simple example of a custom-element that simply produces a
\`<label>\` wrapped around \`<span>\` and an \`<input>\`. Its value is synced
to that of its \`<input>\` so the user doesn't need to care about how
it works internally.

    const {label, span, input} = Component.elements

    class LabeledInput extends Component {
      caption: string = 'untitled'
      value: string = ''

      constructor() {
        super()
        this.initAttributes('caption')
      }

      content = label(span(), input())

      connectedCallback() {
        super.connectedCallback()
        const {input} = this.parts
        input.addEventListener('input', () => {
          this.value = input.value
        })
      }

      render() {
        super.render()
        const {span, input} = this.parts
        span.textContent = this.caption
        if (input.value !== this.value) {
          input.value = this.value
        }
      }
    }

    export const labeledInput = LabeledInput.elementCreator()

\`content\` is, in essence, a template for the internals of the element. By default
it's a single \`<slot>\` element. If you explicitly want an element with no content
you can set your subclass's content to \`null\` or omit any \`<slot>\` from its template.

By setting content to be a function that returns elements instead of a collection
of elements you can take customize elements based on the component's properties.
In particular, you can use \`onXxxx\` syntax sugar to bind events.

(Note that you cannot bind to xin paths reliably if your component uses a \`shadowDOM\`
because \`xin\` cannot "see" elements there. As a general rule, you need to take care
of anything in the \`shadowDOM\` yourself.)

If you'd like to see a more complex example along the same lines, look at
[labeled-input.ts](../demo/components/labeled-input.ts).

##### <slot> names and the \`slot\` attribute

    const {slot} = Component.elements
    class MenuBar extends Component {
      static styleSpec = {
        ':host, :host > slot': {
          display: 'flex',
        },
        ':host > slot:nth-child(1)': {
          flex: '1 1 auto'
        },
      }

      content = [slot(), slot({name: 'gadgets'})]
    }

    export menuBar = MenuBar.elementCreator()

One of the neat things about custom-elements is that you can give them *multiple*
\`<slot>\`s with different \`name\` attributes and then have children target a specific
slot using the \`slot\` attribute.

[app-layout.ts](../demo/components/app-layout.ts) is a more complex example of a
structural element utilizing multiple named \`<slot>\`s.

#### \`<xin-slot>\`

If you put \`<slot>\` elements inside a \`Component\` subclass that doesn't have a
shadowDOM, they will automatically be replaced with \`<xin-slot>\` elements that
have the expected behavior (i.e. sucking in children in based on their \`<slot>\`
attribute).

\`<xin-slot>\` doesn't support \`:slotted\` but since there's no shadowDOM, just
style such elements normally, or use \`xin-slot\` as a CSS-selector.

Note that you cannot give a \`<slot>\` element attributes (other than \`name\`) so if
you want to give a \`<xin-slot>\` attributes (such as \`class\` or \`style\`), create it
explicitly (e.g. using \`elements.xinSlot()\`) rather than using \`<slot>\` elements
and letting them be switched out (because they'll lose any attributes you give them).

Also see the [faux-slot example](/demo/faux-slots.ts).

> ##### Background
>
> \`<slot>\` elements do not work as expected in shadowDOM-less components. This is
> hugely annoying since it prevents components from composing nicely unless they
> have a shadowDOM, and while the shadowDOM is great for small widgets, it's
> terrible for composite views and breaks \`xinjs\`'s bindings (inside the shadow
> DOM you need to do data- and event- binding manually).

#### styleNode: HTMLStyleElement

\`styleNode\` is the \`<style>\` element that will be inserted into the element's
\`shadowRoot\`.

If a \`Component\` subclass has no \`styleNode\`, no \`shadowRoot\` will be
created. This reduces the memory and performance cost of the element.

This is to avoid the performance/memory costs associated with the \`shadowDOM\`
for custom-elements with no styling.

##### Notes

Styling custom-elements can be tricky, and it's worth learning about
how the \`:host\` and \`:slotted()\` selectors work.

It's also very useful to understand how CSS-Variables interact with the
\`shadowDOM\`. In particular, CSS-variables are passed into the \`shadowDOM\`
when other CSS rules are not. You can use css rules to modify css-variables
which will then penetrate the \`shadowDOM\`.

#### refs: {[key:string]: Element | undefined}

    render() {
      super.render() // see note
      const {span, input} = this.parts
      span.textContent = this.caption
      if (input.value !== this.value) {
        input.value = this.value
      }
    }

> **Note**: the \`render()\` method of the base \`Component\` class doesn't currently
> do anything, so calling it is optional (but a good practice in case one day…)
>
> It is *necessary* however to call \`super.connectedCallback\`, \`super.disconnectedCallback\`
> and \`super()\` in the \`constructor()\` should you override them.

\`this.parts\` returns a proxy that provides elements conveniently and efficiently. It
is intended to facilitate access to static elements (it memoizes its values the
first time they are computed).

\`this.parts.foo\` will return a content element with \`data-ref="foo"\`. If no such
element is found it tries it as a css selector, so \`this.parts['.foo']\` would find
a content element with \`class="foo"\` while \`this.parts.h1\` will find an \`<h1>\`.

\`this.parts\` will also remove a \`data-ref\` attribute once it has been used to find
the element. This means that if you use all your refs in \`render\` or \`connectedCallback\`
then no trace will remain in the DOM for a mounted element.

### Component methods

#### initAttributes(...attributeNames: string[])

    class LabeledInput extends Component {
      caption: string = 'untitled'
      value: string = ''

      constructor() {
        super()
        this.initAttributes('caption')
      }

      ...
    }

Sets up basic behavior such as queueing a render if an attribute is changed, setting
attributes based on the DOM source, updating them if they're changed, implementing
boolean attributes in the expected manner, and so forth.

Call \`initAttributes\` in your subclass's \`constructor\`, and make sure to call \`super()\`.

#### queueRender(triggerChangeEvent = false): void

Uses \`requestAnimationFrame\` to queue a call to the component's \`render\` method. If
called with \`true\` it will also trigger a \`change\` event.

#### private initValue(): void

**Don't call this!** Sets up expected behavior for an \`HTMLElement\` with
a value (i.e. triggering a \`change\` events and \`render\` when the \`value\` changes).

#### private hydrate(): void

**Don't call this** Appends \`content\` to the element (or its \`shadowRoot\` if it has a \`styleNode\`)

#### connectedCallback(): void

If the class has an \`onResize\` handler then a ResizeObserver will trigger \`resize\`
events on the element when its size changes and \`onResize\` will be set up to respond
to \`resize\` events.

Also, if the subclass has defined \`value\`, calls \`initValue()\`.

\`connectedCallback\` is a great place to attach **event-handlers** to elements in your component.

Be sure to call \`super.connectedCallback()\` if you implement \`connectedCallback\` in the subclass.

#### disconnectedCallback(): void

Be sure to call \`super.disconnectedCallback()\` if you implement \`disconnectedCallback\` in the subclass.

#### render(): void

Be sure to call \`super.render()\` if you implement \`render\` in the subclass.

### Component static properties

#### Component.elements

    const {label, span, input} = Component.elements

This is simply provided as a convenient way to get to [elements](./elements.md)

### Component static methods

#### Component.elementCreator(options? {tag?: string, styleSpec: XinStyleSheet}): ElementCreator

    export const toolBar = ToolBar.elementCreator({tag: 'tool-bar'})

Returns a function that creates the custom-element. If you don't pass a \`tag\` or if the provided tag
is already in use, a new unique tag will be used.

If no tag is provided, the Component will try to use introspection to "snake-case" the
"ClassName", but if you're using name mangling this won't work and you'll get something
pretty meaningless.

If you want to create a global \`<style>\` sheet for the element (especially useful if
your component doesn't use the \`shadowDOM\`) then you can pass \`styleSpec\`. E.g.

    export const toolBar = ToolBar.elementCreator({
      tag: 'tool-bar',
      styleSpec: {
        ':host': { // note that ':host' will be turned into the tagName automatically!
          display: 'flex',
          padding: 'var(--toolbar-padding, 0 8px)',
          gap: '4px'
        }
      }
    })

This will—assuming "tool-bar" is available—create:

    <style id="tool-bar-helper">
      tool-bar {
        display: flex;
        padding: var(--toolbar-padding, 0 8px);
        gap: 4px;
      }
    <style>

And append it to \`document.head\` when the first instance of \`<tool-bar>\` is inserted in the DOM.

Finally, \`elementCreator\` is memoized and only generated once (and the arguments are
ignored on all subsequent calls).

## Examples

In proving out \`Component\` I've built a number of examples.

- [app-layout](../demo/components/app-layout.ts) uses multiple named slots to implement
  a typical app-layout with header, footer, sidebars, etc.
- [babylon3d](../demo/components/babylon3d.ts) implements a whole family of components
  (inspired by [a-frame](https://aframe.io)) that lets you assemble interactive 3d scenes.
  Aside from the core \`<b-3d>\` element, none of the other elements are actually displayed.
- [game-controller.ts](../demo/components/game-controller.ts) is an invisible element that
  implements basic game-controller functions (loosely based on [unity3d](https://unity3d.com)'s
  game controls).
- [labeled-input](../demo/components/labeled-input.ts) is what you'd expect.
- [labeled-value](../demo/components/labeled-input.ts) is like labeled-input but read-only.
- [markdown-viewer](../demo/components/markdown-viewer.ts) renders markdown.
- [toolbar.ts](../demo/components/toolbar.ts) is a simple toolbar container.`,title:"web-components",filename:"component.ts",path:"src/component.ts"},{text:`# xin

> In Mandarin, "xin" has several meanings including "truth" and "message".

\`xin\` is a path-based implementation of the **observer** or **pub/sub**
pattern designed to be very simple and straightforward to use, leverage
Typescript type-checking and autocompletion, and let you get more done with
less code and no weird build magic (such as special decorators or "execution zones").

## In a nutshell

[sandbox example](https://codesandbox.io/s/xintro-mh4rbj?file=/src/index.ts)

Think of xin as being an \`object\`, so you can just assign values to it:

    import { xin } from 'xinjs'

    // typically you won't set a "root-level" property to a simple scalar value like this
    xin.x = 17

    // more commonly you'll assign large chunks of your application state, if not its
    // entire state to a "root-level" property.
    xin.app = {
      prefs: {
        darkMode: false
      },
      docs: [
        {
          title: 'my novel',
          content: 'It was a dark and stormy night…'
        },
        {
          title: 'my poem',
          content: 'Let us go then, you and I, when the evening is spread out against the sky…'
        }
      ]
    }

Once an object is assigned to  \`xin\`, changing it within \`xin\` is simple:

    xin.x = Math.PI

    xin.app.docs[1].title = 'The Love Song of J. Alfred Prufrock'

But any changes can be observed by writing an observer:

    import { observe } from 'xinjs'

    observe('app.docs', (path) => {
      console.log(path, 'is now', xin[path])
    })

Now, if you sneakily make changes behind \`xin\`'s back, e.g. by modifying the values
directly, e.g.

    const emails = await getEmails()
    xin.emails = emails

    // notes that xin.emails is really JUST emails
    emails.push(...)
    emails.splice(...)
    emails[17].from = '...'

Then \`xin\` won't know and observers won't fire. So you can simply \`touch\` the path
impacted:

    import { touch } from 'xinjs'
    touch('emails')

## boxedProxy()

After working with \`xin\` and using \`Typescript\` for an extended period, I've tried to
improve the type declarations to minimize the amount of casting and \`// @ts-ignore-error\`
directives needed. The latest result of all this is \`boxedProxy\`.

\`boxedProxy(foo)\` is simply declared as a function that takes an object of type T and
returns a XinProxy<T>.

    import { boxedProxy } from 'xinjs'

    const { foo, bar } = boxedProxy({
      foo: 'bar',
      bar: {
        director: 'luhrmann'
      }
    })

This is syntax sugar for:

    import { boxed } from 'xinjs'

    const stuff = {
      foo: 'bar',
      bar: {
        director: 'luhrmann',
        born: 1962
      }
    }

    Object.assign(boxed, stuff)

    const { foo, bar } = boxed as XinProxy<typeof stuff>

So, Typescript will know that \`foo\` is a \`XinProxy<String>\`, and \`bar.born\` is a \`XinProxy<Number>\`.

## How it works

\`xin\` is a \`Proxy\` wrapped around a bare object: effectively a map of strings to values.

When you access the properties of an object assigned to \`xin\` it wraps the values in
similar proxies, and tracks the **path** that got you there:

    xin.foo = {
      bar: 'baz',
      luhrman: {
        job: 'director'
      }
    }

Now if you pull objects back out of \`xin\`:

    let foo = xin.foo
    let luhrman = foo.luhrman

\`foo\` is a \`Proxy\` wrapped around the original *untouched* object, and it knows it came from 'foo'.
Similarly \`luhrman\` is a \`Proxy\` that knows it came from 'foo.luhrman'.

If you **change** a value in a wrapped object, e.g.

    foo.bar = 'bob'
    luhrman.job = 'writer'

Then it will trigger any observers looking for relevant changes. And each change will fire the observer
and tell it the \`path\` that was changed. E.g. an observer watching \`lurman\` will be fired if \`lurman\`
or one of \`lurman\`'s properties is changed.

## Boxed Proxies

\`boxed\` is a sister to \`xin\` that wraps "scalar" values (\`boolean\`, \`number\`, \`string\`) in
objects. E.g. if you write something like:

    xin.test = { answer: 42 }
    boxed.box = { pie: 'apple' }

Then:

    xin.test.answer === 42
    xin.box.pie === 'apple'
    // box wraps "scalars" in objects
    boxed.test.answer.valueOf() === 42
    boxed.box.pie.valueOf() === 'apple'
    // anything that comes out of boxed has a path!
    xinPath(boxed.test.answer) === 'test.answer'
    xinPath(boxed.box.pie) === 'box.pie'

Aside from always "boxing" scalar values, \`boxed\` works just like \`xin\`.

And \`xinProxy\` will return a \`boxed\` proxy if you pass \`true\` as a second parameter, so:

    const { prox } = xinProxy({
        prox: {
            message: 'hello'
        }
    }, true)

> This is deprecated in favor of \`boxedProxy(...)\` which is declared in such a way
> that Typescript will be more helpful.

Will give you a proxy that emits boxed scalars.

### Why?!

As far as Typescript is concerned, \`xinProxy\` just passes back what you put into it,
which means that you can now write bindings with type-checking and autocomplete and
never use string literals. So something like this *just works*:

    const div = elements.div({bindText: prox.message})

## If you need the thing itself or the path to the thing…

\`Proxy\`s returned by \`xin\` are typically indistinguishable from the original object, but
in a pinch \`xinPath()\` will give you the path (\`string\`) of a \`XinProxy\` while \`xinValue\`
will give its "bare" value. \`xinPath()\` can also be used to test if something is actually
a proxy, as it will return \`undefined\` for regular objects.

E.g.

    xinPath(luhrman) === 'foo.luhrman'     // true
    const bareLurhman = xinValue(luhrman)  // not wrapped

You may want the thing itself to, for example, perform a large number of changes to an
object without firing observers. You can let \`xin\` know you've made changes behind its back using
\`touch\`, e.g.

    doTerribleThings(xinValue(luhrman))
    // eslint-disable-next-line
    touch(luhrman)

## id-paths

There's one more wrinkle in \`xin\`'s paths, and that is **id-paths**. This is because in many cases
you will encounter large arrays of objects, each with a unique id somewhere, e.g. it might be \`id\` or \`uid\`
or even buried deeper…

    xin.message = [
      {
        id: '1234abcd',
        title: 'hello',
        body: 'hello there!'
      },
      …
    ]

Instead of referring to the first item in \`messages\` as \`messages[0]\` it can be referred to
as \`messages[id=1234abcd]\`, and this will retrieve the item regardless of its position in messages.

### \`touch\`, \`observe\` and \`unobserve\`

\`touch\`, \`observe\` and \`unobserve\` provide low level access to the \`xin\` observer model. \`touch(path: touchable)\` allows you to directly inform \`xin\` that the value at a specified path has changed. You might want to update a large data structure directly without firing observers. You can let \`xin\` know you've made changes behind its back using \`touch\`, e.g.

    doTerribleThings(xin.luhrman)
    touch(xin.luhrman)

What's \`touchable\`? A string (id-path) or a xin observer proxy.

\`observe(path: string | RegExp | PathTestFunction, callback: function): Listener\` allows you to directly observe changes to a path (or any path that matches a RegExp or PathTestFunction evalutes as true) and trigger a callback which will be passed the path that actually changed. \`unobserve(listener: Listener)\` removes the listener.

### \`async updates()\`

\`updates\` is an async function that resolves after the next UI update. This is for a case where you expect a change you've made to trigger UI changes and you want to act after those have occurred. Typically, this is simply not needed, but it's very useful for testing when you want to change an observed value and verify that your UI widget has updated correctly.

> ## \`isValidPath(path: string): boolean\`
>
> This is an internally used function that validates a path string. It's used in testing and may be useful at runtime.
>
> ## \`settings: { perf: boolean, debug: boolean }\`
>
> This is a (so far) internally used configuration object. It's used in testing and may be useful at runtime. Eventually it will allow you to make path resolution and so forth easier to debug and performance tune.`,title:"xin",filename:"xin.ts",path:"src/xin.ts"},{text:`# todo

## work in progress

<!--{ "pin": "bottom" }-->

- change \`MutationObserver\` in Component if there's an \`onDomChanged\`
  or something handler to trigger it as appropriate
- automated golden tests?
- \`css()\` should handle multiple \`@import\`s
- possibly leverage component static property method (if we can keep type preservation)

## known issues

- bindList cloning doesn't duplicate svgs for some reason
`,title:"todo",filename:"TODO.md",path:"TODO.md",pin:"bottom"}];Gn("demo-style",_i);setTimeout(()=>{let n=getComputedStyle(document.body).getPropertyValue("--brand-color");console.log("welcome to %cxinjs.net",`color: ${n}; padding: 0 5px;`)},100);var xn="xinjs",ul=document.location.search!==""?document.location.search.substring(1).split("&")[0]:"README.md",ml=Ia.find((n)=>n.filename===ul)||Ia[0],{app:T,prefs:L}=Sn({app:{title:xn,blogUrl:"https://loewald.com",discordUrl:"https://discord.com/invite/ramJ9rgky5",githubUrl:`https://github.com/tonioloewald/${xn}#readme`,npmUrl:`https://www.npmjs.com/package/${xn}`,xinjsuiUrl:"https://ui.xinjs.net",bundleBadgeUrl:`https://deno.bundlejs.com/?q=${xn}&badge=`,bundleUrl:`https://bundlejs.com/?q=${xn}`,cdnBadgeUrl:`https://data.jsdelivr.com/v1/package/npm/${xn}/badge`,cdnUrl:`https://www.jsdelivr.com/package/npm/${xn}`,optimizeLottie:!1,lottieFilename:"",lottieData:"",docs:Ia,currentDoc:ml},prefs:{theme:"system",highContrast:!1,locale:""}});Ga((n)=>{if(n.startsWith("prefs"))return!0;return!1});Z.docLink={toDOM(n,a){n.setAttribute("href",`?${a}`)}};Z.current={toDOM(n,a){let t=n.getAttribute("href")||"";n.classList.toggle("current",a===t.substring(1))}};setTimeout(()=>{Object.assign(globalThis,{app:T,xin:I,bindings:Z,elements:g,vars:r,touch:rn})},1000);var Ai=document.querySelector("main"),{h2:pl,div:Ii,span:Pa,a:Ba,img:Pi,header:bl,button:Bi,template:yl,input:cl}=g;U(document.body,"prefs.theme",{toDOM(n,a){if(a==="system")a=getComputedStyle(document.body).getPropertyValue("--darkmode")==="true"?"dark":"light";n.classList.toggle("darkmode",a==="dark")}});U(document.body,"prefs.highContrast",{toDOM(n,a){n.classList.toggle("high-contrast",a)}});window.addEventListener("popstate",()=>{let n=window.location.search.substring(1);T.currentDoc=T.docs.find((a)=>a.filename===n)||T.docs[0]});var gl=ea(()=>{console.time("filter");let n=Oi.value.toLocaleLowerCase();T.docs.forEach((a)=>{a.hidden=!a.title.toLocaleLowerCase().includes(n)&&!a.text.toLocaleLowerCase().includes(n)}),rn(T.docs),console.timeEnd("filter")}),Oi=cl({slot:"nav",placeholder:"search",type:"search",style:{width:"calc(100% - 10px)",margin:"5px"},onInput:gl});if(Ai)Ai.append(bl(Ba({href:"/",style:{display:"flex",alignItems:"center",borderBottom:"none"},title:`xinjs ${ra}, xinjs-ui ${Tt}`},f.xinColor({style:{_fontSize:40,marginRight:10}}),pl({bindText:"app.title"})),Pa({class:"elastic"}),Bt({minWidth:750},Pa({style:{marginRight:r.spacing,display:"flex",alignItems:"center",gap:r.spacing50}},Ba({href:T.bundleUrl},Pi({alt:"bundlejs size badge",src:T.bundleBadgeUrl})),Ba({href:T.cdnUrl},Pi({alt:"jsdelivr",src:T.cdnBadgeUrl}))),Pa({slot:"small"})),Pa({style:{flex:"0 0 10px"}}),Bi({title:"theme",class:"iconic",style:{color:r.linkColor},onClick(n){Q({target:n.target,menuItems:[{icon:"github",caption:"github",action:T.githubUrl},{icon:"npm",caption:"npm",action:T.npmUrl},{icon:"discord",caption:"discord",action:T.discordUrl},{icon:"xinjsUiColor",caption:"xinjs-ui",action:T.xinjsuiUrl},{icon:"blog",caption:"Blog",action:"https://loewald.com"},null,{icon:"rgb",caption:"Color Theme",menuItems:[{caption:"System",checked(){return L.theme==="system"},action(){L.theme="system"}},{caption:"Dark",checked(){return L.theme==="dark"},action(){L.theme="dark"}},{caption:"Light",checked(){return L.theme==="light"},action(){L.theme="light"}},null,{caption:"High Contrast",checked(){return L.highContrast},action(){L.highContrast=!L.highContrast}}]}]})}},f.moreVertical())),It({name:"Documentation",navSize:200,minSize:600,style:{flex:"1 1 auto",overflow:"hidden"}},Oi,Ii({slot:"nav",style:{display:"flex",flexDirection:"column",width:"100%",height:"100%",overflowY:"scroll"},bindList:{hiddenProp:"hidden",value:T.docs}},yl(Ba({class:"doc-link",bindCurrent:"app.currentDoc.filename",bindDocLink:"^.filename",bindText:"^.title",onClick(n){let a=n.target,t=dn(n.target),o=n.target.closest("xin-sidenav");o.contentVisible=!0;let{href:i}=a;window.history.pushState({href:i},"",i),T.currentDoc=t,n.preventDefault()}}))),Ii({style:{position:"relative",overflowY:"scroll",height:"100%"}},Bi({title:"show navigation",class:"transparent close-nav show-within-compact",style:{marginTop:"2px",position:"fixed"},onClick(n){n.target.closest("xin-sidenav").contentVisible=!1}},f.chevronLeft()),xt({style:{display:"block",maxWidth:"44em",margin:"auto",padding:"0 1em",overflow:"hidden"},bindValue:"app.currentDoc.text",didRender(){On.insertExamples(this,{xinjs:Jn,xinjsui:Dt})}}))));

//# debugId=96BD8A2E20A7294764756E2164756E21
//# sourceMappingURL=index.js.map
