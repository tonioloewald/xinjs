var Ao=Object.defineProperty;var Nt=(n,e)=>{for(var t in e)Ao(n,t,{get:e[t],enumerable:!0,configurable:!0,set:(a)=>e[t]=()=>a})};var Gn={};Nt(Gn,{xinValue:()=>z,xinProxy:()=>Tn,xinPath:()=>Yn,xin:()=>I,version:()=>de,vars:()=>r,varDefault:()=>c,updates:()=>Vo,unobserve:()=>se,touchElement:()=>qe,touch:()=>hn,throttle:()=>Wn,svgElements:()=>$n,settings:()=>ae,on:()=>re,observe:()=>Ln,mathML:()=>ca,makeComponent:()=>Je,invertLuminance:()=>$e,initVars:()=>yi,hotReload:()=>Ge,getListItem:()=>un,getCssVar:()=>ha,elements:()=>g,debounce:()=>le,css:()=>qn,boxedProxy:()=>pn,boxed:()=>En,blueprintLoader:()=>ji,blueprint:()=>Ci,bindings:()=>K,bind:()=>H,StyleSheet:()=>Rn,MoreMath:()=>si,Component:()=>y,Color:()=>v,BlueprintLoader:()=>Ue,Blueprint:()=>he});var ae={debug:!1,perf:!1};function rn(n){if(n==null||typeof n!=="object")return n;if(n instanceof Set)return new Set(n);else if(Array.isArray(n))return n.map(rn);let e={};for(let t in n){let a=n[t];if(n!=null&&typeof n==="object")e[t]=rn(a);else e[t]=a}return e}var Qt="-xin-data",Sn=`.${Qt}`,kt="-xin-event",Wt=`.${kt}`,U="xinPath",Vn="xinValue",Oo="xinObserve",Do="xinBind",zo="xinOn",Yn=(n)=>{return n&&n[U]||void 0};function z(n){return typeof n==="object"&&n!==null?n[Vn]||n:n}var Xn=new WeakMap,dn=new WeakMap,Hn=(n)=>{let e=n.cloneNode();if(e instanceof Element){let t=dn.get(n),a=Xn.get(n);if(t!=null)dn.set(e,rn(t));if(a!=null)Xn.set(e,rn(a))}for(let t of Array.from(n instanceof HTMLTemplateElement?n.content.childNodes:n.childNodes))if(t instanceof Element||t instanceof DocumentFragment)e.appendChild(Hn(t));else e.appendChild(t.cloneNode());return e},te=new WeakMap,un=(n)=>{let e=document.body.parentElement;while(n.parentElement!=null&&n.parentElement!==e){let t=te.get(n);if(t!=null)return t;n=n.parentElement}return!1},Ft=Symbol("observer should be removed"),oe=[],ie=[],ze=!1,Ve,Xe;class na{description;test;callback;constructor(n,e){let t=typeof e==="string"?`"${e}"`:`function ${e.name}`,a;if(typeof n==="string")this.test=(o)=>typeof o==="string"&&o!==""&&(n.startsWith(o)||o.startsWith(n)),a=`test = "${n}"`;else if(n instanceof RegExp)this.test=n.test.bind(n),a=`test = "${n.toString()}"`;else if(n instanceof Function)this.test=n,a=`test = function ${n.name}`;else throw new Error("expect listener test to be a string, RegExp, or test function");if(this.description=`${a}, ${t}`,typeof e==="function")this.callback=e;else throw new Error("expect callback to be a path or function");oe.push(this)}}var Vo=async()=>{if(Ve===void 0)return;await Ve},Xo=()=>{if(ae.perf)console.time("xin async update");let n=Array.from(ie);for(let e of n)oe.filter((t)=>{let a;try{a=t.test(e)}catch(o){throw new Error(`Listener ${t.description} threw "${o}" at "${e}"`)}if(a===Ft)return se(t),!1;return a}).forEach((t)=>{let a;try{a=t.callback(e)}catch(o){console.error(`Listener ${t.description} threw "${o}" handling "${e}"`)}if(a===Ft)se(t)});if(ie.splice(0),ze=!1,typeof Xe==="function")Xe();if(ae.perf)console.timeEnd("xin async update")},hn=(n)=>{let e=typeof n==="string"?n:Yn(n);if(e===void 0)throw console.error("touch was called on an invalid target",n),new Error("touch was called on an invalid target");if(ze===!1)Ve=new Promise((t)=>{Xe=t}),ze=setTimeout(Xo);if(ie.find((t)=>e.startsWith(t))==null)ie.push(e)},ea=(n,e)=>{return new na(n,e)},se=(n)=>{let e=oe.indexOf(n);if(e>-1)oe.splice(e,1);else throw new Error("unobserve failed, listener not found")},Ho=(n)=>{try{return JSON.stringify(n)}catch(e){return"{has circular references}"}},ta=(...n)=>new Error(n.map(Ho).join(" ")),No=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1),Wo=0,Fo=()=>(parseInt("10000",36)+ ++Wo).toString(36).slice(-5),qo=()=>No()+Fo(),He={},aa={};function oa(n){if(n==="")return[];if(Array.isArray(n))return n;else{let e=[];while(n.length>0){let t=n.search(/\[[^\]]+\]/);if(t===-1){e.push(n.split("."));break}else{let a=n.slice(0,t);if(n=n.slice(t),a!=="")e.push(a.split("."));if(t=n.indexOf("]")+1,e.push(n.slice(1,t-1)),n.slice(t,t+1)===".")t+=1;n=n.slice(t)}}return e}}var J=new WeakMap;function ia(n,e){if(J.get(n)===void 0)J.set(n,{});if(J.get(n)[e]===void 0)J.get(n)[e]={};let t=J.get(n)[e];if(e==="_auto_")n.forEach((a,o)=>{if(a._auto_===void 0)a._auto_=qo();t[a._auto_+""]=o});else n.forEach((a,o)=>{t[Nn(a,e)+""]=o});return t}function Yo(n,e){if(J.get(n)===void 0||J.get(n)[e]===void 0)return ia(n,e);else return J.get(n)[e]}function Lo(n,e,t){t=t+"";let a=Yo(n,e)[t];if(a===void 0||Nn(n[a],e)+""!==t)a=ia(n,e)[t];return a}function $o(n,e,t){if(n[e]===void 0&&t!==void 0)n[e]=t;return n[e]}function sa(n,e,t,a){let o=e!==""?Lo(n,e,t):t;if(a===He)return n.splice(o,1),J.delete(n),Symbol("deleted");else if(a===aa){if(e===""&&n[o]===void 0)n[o]={}}else if(a!==void 0)if(o!==void 0)n[o]=a;else if(e!==""&&Nn(a,e)+""===t+"")n.push(a),o=n.length-1;else throw new Error(`byIdPath insert failed at [${e}=${t}]`);return n[o]}function qt(n){if(!Array.isArray(n))throw ta("setByPath failed: expected array, found",n)}function Yt(n){if(n==null||!(n instanceof Object))throw ta("setByPath failed: expected Object, found",n)}function Nn(n,e){let t=oa(e),a=n,o,i,s,l;for(o=0,i=t.length;a!==void 0&&o<i;o++){let d=t[o];if(Array.isArray(d))for(s=0,l=d.length;a!==void 0&&s<l;s++){let h=d[s];a=a[h]}else if(a.length===0){if(a=a[Number(d.slice(1))],d[0]!=="=")return}else if(d.includes("=")){let[h,...m]=d.split("=");a=sa(a,h,m.join("="))}else s=parseInt(d,10),a=a[s]}return a}function Ro(n,e,t){let a=n,o=oa(e);while(a!=null&&o.length>0){let i=o.shift();if(typeof i==="string"){let s=i.indexOf("=");if(s>-1){if(s===0)Yt(a);else qt(a);let l=i.slice(0,s),d=i.slice(s+1);if(a=sa(a,l,d,o.length>0?aa:t),o.length===0)return!0}else{qt(a);let l=parseInt(i,10);if(o.length>0)a=a[l];else{if(t!==He){if(a[l]===t)return!1;a[l]=t}else a.splice(l,1);return!0}}}else if(Array.isArray(i)&&i.length>0){Yt(a);while(i.length>0){let s=i.shift();if(i.length>0||o.length>0)a=$o(a,s,i.length>0?{}:[]);else{if(t!==He){if(a[s]===t)return!1;a[s]=t}else{if(!Object.prototype.hasOwnProperty.call(a,s))return!1;delete a[s]}return!0}}}else throw new Error(`setByPath failed, bad path ${e}`)}throw new Error(`setByPath(${n}, ${e}, ${t}) failed`)}var Go=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],Fe={},Jo=!0,Uo=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,Ko=(n)=>Uo.test(n),sn=(n="",e="")=>{if(n==="")return e;else if(e.match(/^\d+$/)!==null||e.includes("="))return`${n}[${e}]`;else return`${n}.${e}`},Zo={string(n){return new String(n)},boolean(n){return new Boolean(n)},bigint(n){return n},symbol(n){return n},number(n){return new Number(n)}};function Ae(n,e){let t=typeof n;if(n===void 0||t==="object"||t==="function")return n;else return new Proxy(Zo[typeof n](n),jn(e,!0))}var jn=(n,e)=>({get(t,a){switch(a){case U:return n;case Vn:return t.valueOf?t.valueOf():t;case Oo:return(s)=>{let l=ea(n,s);return()=>se(l)};case zo:return(s,l)=>re(s,l,z(t));case Do:return(s,l,d)=>{H(s,n,l,d)}}if(typeof a==="symbol")return t[a];let o=a,i=o.match(/^([^.[]+)\.(.+)$/)??o.match(/^([^\]]+)(\[.+)/)??o.match(/^(\[[^\]]+\])\.(.+)$/)??o.match(/^(\[[^\]]+\])\[(.+)$/);if(i!==null){let[,s,l]=i,d=sn(n,s),h=Nn(t,s);return h!==null&&typeof h==="object"?new Proxy(h,jn(d,e))[l]:h}if(o.startsWith("[")&&o.endsWith("]"))o=o.substring(1,o.length-1);if(!Array.isArray(t)&&t[o]!==void 0||Array.isArray(t)&&o.includes("=")){let s;if(o.includes("=")){let[l,d]=o.split("=");s=t.find((h)=>`${Nn(h,l)}`===d)}else s=t[o];if(s instanceof Object){let l=sn(n,o);return new Proxy(s instanceof Function?s.bind(t):s,jn(l,e))}else return e?Ae(s,sn(n,o)):s}else if(Array.isArray(t)){let s=t[o];return typeof s==="function"?(...l)=>{let d=s.apply(t,l);if(Go.includes(o))hn(n);return d}:typeof s==="object"?new Proxy(s,jn(sn(n,o),e)):e?Ae(s,sn(n,o)):s}else return e?Ae(t[o],sn(n,o)):t[o]},set(t,a,o){o=z(o);let i=a!==Vn?sn(n,a):n;if(Jo&&!Ko(i))throw new Error(`setting invalid path ${i}`);if(z(I[i])!==o&&Ro(Fe,i,o))hn(i);return!0}}),Ln=(n,e)=>{let t=typeof e==="function"?e:I[e];if(typeof t!=="function")throw new Error(`observe expects a function or path to a function, ${e} is neither`);return ea(n,t)},I=new Proxy(Fe,jn("",!1)),En=new Proxy(Fe,jn("",!0)),la=(n,e)=>{let t=new Event(e);n.dispatchEvent(t)},ra=(n)=>{if(n instanceof HTMLInputElement)return n.type;else if(n instanceof HTMLSelectElement&&n.hasAttribute("multiple"))return"multi-select";else return"other"},Qo=(n,e)=>{switch(ra(n)){case"radio":n.checked=n.value===e;break;case"checkbox":n.checked=!!e;break;case"date":n.valueAsDate=new Date(e);break;case"multi-select":for(let t of Array.from(n.querySelectorAll("option")))t.selected=e[t.value];break;default:n.value=e}},ko=(n)=>{switch(ra(n)){case"radio":{let e=n.parentElement?.querySelector(`[name="${n.name}"]:checked`);return e!=null?e.value:null}case"checkbox":return n.checked;case"date":return n.valueAsDate?.toISOString();case"multi-select":return Array.from(n.querySelectorAll("option")).reduce((e,t)=>{return e[t.value]=t.selected,e},{});default:return n.value}},{ResizeObserver:Lt}=globalThis,Ne=Lt!=null?new Lt((n)=>{for(let e of n){let t=e.target;la(t,"resize")}}):{observe(){},unobserve(){}},$t=(n,e,t=!0)=>{if(n!=null&&e!=null)if(typeof e==="string")n.textContent=e;else if(Array.isArray(e))e.forEach((a)=>{n.append(a instanceof Node&&t?Hn(a):a)});else if(e instanceof Node)n.append(t?Hn(e):e);else throw new Error("expect text content or document node")},le=(n,e=250)=>{let t;return(...a)=>{if(t!==void 0)clearTimeout(t);t=setTimeout(()=>{n(...a)},e)}},Wn=(n,e=250)=>{let t,a=Date.now()-e,o=!1;return(...i)=>{if(clearTimeout(t),t=setTimeout(async()=>{n(...i),a=Date.now()},e),!o&&Date.now()-a>=e){o=!0;try{n(...i),a=Date.now()}finally{o=!1}}}},We=Symbol("list-binding"),ni=16,ei=100;function Rt(n,e){let t=Array.from(n.querySelectorAll(Sn));if(n.matches(Sn))t.unshift(n);for(let a of t){let o=dn.get(a);for(let i of o){if(i.path.startsWith("^"))i.path=`${e}${i.path.substring(1)}`;if(i.binding.toDOM!=null)i.binding.toDOM(a,I[i.path])}}}class da{boundElement;listTop;listBottom;template;options;itemToElement;_array=[];_update;_previousSlice;static filterBoundObservers=new WeakMap;constructor(n,e,t={}){if(this.boundElement=n,this.itemToElement=new WeakMap,n.children.length!==1)throw new Error("ListBinding expects an element with exactly one child element");if(n.children[0]instanceof HTMLTemplateElement){let a=n.children[0];if(a.content.children.length!==1)throw new Error("ListBinding expects a template with exactly one child element");this.template=Hn(a.content.children[0])}else this.template=n.children[0],this.template.remove();if(this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),this.options=t,t.virtual!=null)Ne.observe(this.boundElement),this._update=Wn(()=>{this.update(this._array,!0)},ni),this.boundElement.addEventListener("scroll",this._update),this.boundElement.addEventListener("resize",this._update)}visibleSlice(){let{virtual:n,hiddenProp:e,visibleProp:t}=this.options,a=this._array;if(e!==void 0)a=a.filter((d)=>d[e]!==!0);if(t!==void 0)a=a.filter((d)=>d[t]===!0);if(this.options.filter&&this.needle!==void 0)a=this.options.filter(a,this.needle);let o=0,i=a.length-1,s=0,l=0;if(n!=null&&this.boundElement instanceof HTMLElement){let d=this.boundElement.offsetWidth,h=this.boundElement.offsetHeight,m=n.width!=null?Math.max(1,Math.floor(d/n.width)):1,p=Math.ceil(h/n.height)+1,u=Math.ceil(a.length/m),E=m*p,T=Math.floor(this.boundElement.scrollTop/n.height);if(T>u-p+1)T=Math.max(0,u-p+1);o=T*m,i=o+E-1,s=T*n.height,l=Math.max(u*n.height-h-s,0)}return{items:a,firstItem:o,lastItem:i,topBuffer:s,bottomBuffer:l}}needle;filter=Wn((n)=>{if(this.needle!==n)this.needle=n,this.update(this._array)},ei);update(n,e){if(n==null)n=[];this._array=n;let{hiddenProp:t,visibleProp:a}=this.options,o=Yn(n),i=this.visibleSlice();this.boundElement.classList.toggle("-xin-empty-list",i.items.length===0);let s=this._previousSlice,{firstItem:l,lastItem:d,topBuffer:h,bottomBuffer:m}=i;if(t===void 0&&a===void 0&&e===!0&&s!=null&&l===s.firstItem&&d===s.lastItem)return;this._previousSlice=i;let p=0,u=0,E=0;for(let x of Array.from(this.boundElement.children)){if(x===this.listTop||x===this.listBottom)continue;let B=te.get(x);if(B==null)x.remove();else{let M=i.items.indexOf(B);if(M<l||M>d)x.remove(),this.itemToElement.delete(B),te.delete(x),p++}}this.listTop.style.height=String(h)+"px",this.listBottom.style.height=String(m)+"px";let T=[],{idPath:V}=this.options;for(let x=l;x<=d;x++){let B=i.items[x];if(B===void 0)continue;let M=this.itemToElement.get(z(B));if(M==null){if(E++,M=Hn(this.template),typeof B==="object")this.itemToElement.set(z(B),M),te.set(M,z(B));if(this.boundElement.insertBefore(M,this.listBottom),V!=null){let D=B[V],X=`${o}[${V}=${D}]`;Rt(M,X)}else{let D=`${o}[${x}]`;Rt(M,D)}}T.push(M)}let S=null;for(let x of T){if(x.previousElementSibling!==S)if(u++,S?.nextElementSibling!=null)this.boundElement.insertBefore(x,S.nextElementSibling);else this.boundElement.insertBefore(x,this.listBottom);S=x}if(ae.perf)console.log(o,"updated",{removed:p,created:E,moved:u})}}var ti=(n,e,t)=>{let a=n[We];if(a===void 0)a=new da(n,e,t),n[We]=a;return a},{document:Fn,MutationObserver:Gt}=globalThis,qe=(n,e)=>{let t=dn.get(n);if(t==null)return;for(let a of t){let{binding:o,options:i}=a,{path:s}=a,{toDOM:l}=o;if(l!=null){if(s.startsWith("^")){let d=un(n);if(d!=null&&d[U]!=null)s=a.path=`${d[U]}${s.substring(1)}`;else throw console.error(`Cannot resolve relative binding ${s}`,n,"is not part of a list"),new Error(`Cannot resolve relative binding ${s}`)}if(e==null||s.startsWith(e))l(n,I[s],i)}}};if(Gt!=null)new Gt((n)=>{n.forEach((e)=>{Array.from(e.addedNodes).forEach((t)=>{if(t instanceof Element)Array.from(t.querySelectorAll(Sn)).forEach((a)=>qe(a))})})}).observe(Fn.body,{subtree:!0,childList:!0});Ln(()=>!0,(n)=>{let e=Array.from(Fn.querySelectorAll(Sn));for(let t of e)qe(t,n)});var Jt=(n)=>{let e=n.target.closest(Sn);while(e!=null){let t=dn.get(e);for(let a of t){let{binding:o,path:i}=a,{fromDOM:s}=o;if(s!=null){let l;try{l=s(e,a.options)}catch(d){throw console.error("Cannot get value from",e,"via",a),new Error("Cannot obtain value fromDOM")}if(l!=null){let d=I[i];if(d==null)I[i]=l;else{let h=d[U]!=null?d[Vn]:d,m=l[U]!=null?l[Vn]:l;if(h!==m)I[i]=m}}}}e=e.parentElement.closest(Sn)}};if(globalThis.document!=null)Fn.body.addEventListener("change",Jt,!0),Fn.body.addEventListener("input",Jt,!0);function H(n,e,t,a){if(n instanceof DocumentFragment)throw new Error("bind cannot bind to a DocumentFragment");let o;if(typeof e==="object"&&e[U]===void 0&&a===void 0){let{value:l}=e;o=typeof l==="string"?l:l[U],a=e,delete a.value}else o=typeof e==="string"?e:e[U];if(o==null)throw new Error("bind requires a path or object with xin Proxy");let{toDOM:i}=t;n.classList?.add(Qt);let s=dn.get(n);if(s==null)s=[],dn.set(n,s);if(s.push({path:o,binding:t,options:a}),i!=null&&!o.startsWith("^"))hn(o);if(a?.filter&&a?.needle)H(n,a.needle,{toDOM(l,d){console.log({needle:d}),l[We]?.filter(d)}});return n}var Ut=new Set,ai=(n)=>{let e=n?.target.closest(Wt),t=!1,a=new Proxy(n,{get(i,s){if(s==="stopPropagation")return()=>{n.stopPropagation(),t=!0};else{let l=i[s];return typeof l==="function"?l.bind(i):l}}}),o=new Set;while(!t&&e!=null){let i=Xn.get(e)[n.type]||o;for(let s of i){if(typeof s==="function")s(a);else{let l=I[s];if(typeof l==="function")l(a);else throw new Error(`no event handler found at path ${s}`)}if(t)continue}e=e.parentElement!=null?e.parentElement.closest(Wt):null}};function re(n,e,t){let a=Xn.get(n);if(n.classList.add(kt),a==null)a={},Xn.set(n,a);if(!a[e])a[e]=new Set;if(a[e].add(t),!Ut.has(e))Ut.add(e),Fn.body.addEventListener(e,ai,!0);return()=>{a[e].delete(t)}}var K={value:{toDOM:Qo,fromDOM(n){return ko(n)}},text:{toDOM(n,e){n.textContent=e}},enabled:{toDOM(n,e){n.disabled=!e}},disabled:{toDOM(n,e){n.disabled=Boolean(e)}},list:{toDOM(n,e,t){ti(n,e,t).update(e)}}},oi=180/Math.PI,ii=Math.PI/180;function L(n,e,t){return t<n?NaN:e<n?n:e>t?t:e}function Q(n,e,t,a=!0){if(a)t=L(0,t,1);return t*(e-n)+n}var si={RADIANS_TO_DEGREES:oi,DEGREES_TO_RADIANS:ii,clamp:L,lerp:Q};function ha(n,e=document.body){let t=getComputedStyle(e);if(n.endsWith(")")&&n.startsWith("var("))n=n.slice(4,-1);return t.getPropertyValue(n).trim()}var li=(n,e,t)=>{return(0.299*n+0.587*e+0.114*t)/255},ln=(n)=>("00"+Math.round(Number(n)).toString(16)).slice(-2);class ua{h;s;l;constructor(n,e,t){n/=255,e/=255,t/=255;let a=Math.max(n,e,t),o=a-Math.min(n,e,t),i=o!==0?a===n?(e-t)/o:a===e?2+(t-n)/o:4+(n-e)/o:0;this.h=60*i<0?60*i+360:60*i,this.s=o!==0?a<=0.5?o/(2*a-o):o/(2-(2*a-o)):0,this.l=(2*a-o)/2}}var Cn=globalThis.document!==void 0?globalThis.document.createElement("span"):void 0;class v{r;g;b;a;static fromVar(n,e=document.body){return v.fromCss(ha(n,e))}static fromCss(n){let e=n;if(Cn instanceof HTMLSpanElement)Cn.style.color="black",Cn.style.color=n,document.body.appendChild(Cn),e=getComputedStyle(Cn).color,Cn.remove();let[t,a,o,i]=e.match(/[\d.]+/g),s=e.startsWith("color(srgb")?255:1;return new v(Number(t)*s,Number(a)*s,Number(o)*s,i==null?1:Number(i))}static fromHsl(n,e,t,a=1){return v.fromCss(`hsl(${n.toFixed(0)}deg ${(e*100).toFixed(0)}% ${(t*100).toFixed(0)}% / ${(a*100).toFixed(0)}%)`)}static black=new v(0,0,0);static white=new v(255,255,255);constructor(n,e,t,a=1){this.r=L(0,n,255),this.g=L(0,e,255),this.b=L(0,t,255),this.a=a!==void 0?L(0,a,1):a=1}get inverse(){return new v(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){let{h:n,s:e,l:t}=this._hsl;return v.fromHsl(n,e,1-t,this.a)}contrasting(n=1){let{h:e,s:t,l:a}=this._hsl;return this.blend(this.brightness>0.5?v.black:v.white,n)}get rgb(){let{r:n,g:e,b:t}=this;return`rgb(${n.toFixed(0)},${e.toFixed(0)},${t.toFixed(0)})`}get rgba(){let{r:n,g:e,b:t,a}=this;return`rgba(${n.toFixed(0)},${e.toFixed(0)},${t.toFixed(0)},${a.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}hslCached;get _hsl(){if(this.hslCached==null)this.hslCached=new ua(this.r,this.g,this.b);return this.hslCached}get hsl(){let{h:n,s:e,l:t}=this._hsl;return`hsl(${n.toFixed(0)}deg ${(e*100).toFixed(0)}% ${(t*100).toFixed(0)}%)`}get hsla(){let{h:n,s:e,l:t}=this._hsl;return`hsl(${n.toFixed(0)}deg ${(e*100).toFixed(0)}% ${(t*100).toFixed(0)}% / ${(this.a*100).toFixed(0)}%)`}get mono(){let n=this.brightness*255;return new v(n,n,n)}get brightness(){return li(this.r,this.g,this.b)}get html(){return this.toString()}toString(){return this.a===1?"#"+ln(this.r)+ln(this.g)+ln(this.b):"#"+ln(this.r)+ln(this.g)+ln(this.b)+ln(Math.floor(255*this.a))}brighten(n){let{h:e,s:t,l:a}=this._hsl,o=L(0,a+n*(1-a),1);return v.fromHsl(e,t,o,this.a)}darken(n){let{h:e,s:t,l:a}=this._hsl,o=L(0,a*(1-n),1);return v.fromHsl(e,t,o,this.a)}saturate(n){let{h:e,s:t,l:a}=this._hsl,o=L(0,t+n*(1-t),1);return v.fromHsl(e,o,a,this.a)}desaturate(n){let{h:e,s:t,l:a}=this._hsl,o=L(0,t*(1-n),1);return v.fromHsl(e,o,a,this.a)}rotate(n){let{h:e,s:t,l:a}=this._hsl,o=(e+360+n)%360;return v.fromHsl(o,t,a,this.a)}opacity(n){let{h:e,s:t,l:a}=this._hsl;return v.fromHsl(e,t,a,n)}swatch(){return console.log(`%c      %c ${this.html}, ${this.rgba}`,`background-color: ${this.html}`,"background-color: transparent"),this}blend(n,e){return new v(Q(this.r,n.r,e),Q(this.g,n.g,e),Q(this.b,n.b,e),Q(this.a,n.a,e))}static blendHue(n,e,t){let a=(e-n+720)%360;if(a<180)return n+t*a;else return n-(360-a)*t}mix(n,e){let t=this._hsl,a=n._hsl;return v.fromHsl(t.s===0?a.h:a.s===0?t.h:v.blendHue(t.h,a.h,e),Q(t.s,a.s,e),Q(t.l,a.l,e),Q(this.a,n.a,e))}colorMix(n,e){return v.fromCss(`color-mix(in hsl, ${this.html}, ${n.html} ${(e*100).toFixed(0)}%)`)}}function k(n){return n.replace(/[A-Z]/g,(e)=>{return`-${e.toLocaleLowerCase()}`})}function ri(n){return n.replace(/-([a-z])/g,(e,t)=>{return t.toLocaleUpperCase()})}var di="http://www.w3.org/1998/Math/MathML",hi="http://www.w3.org/2000/svg",ee={},pa=(n,e,t)=>{let a=ba(k(e),t);if(a.prop.startsWith("--"))n.style.setProperty(a.prop,a.value);else n.style[e]=a.value},ui=(n)=>{return{toDOM(e,t){pa(e,n,t)}}},ma=(n,e,t)=>{if(e==="style")if(typeof t==="object")for(let a of Object.keys(t))if(Yn(t[a]))H(n,t[a],ui(a));else pa(n,a,t[a]);else n.setAttribute("style",t);else if(n[e]!==void 0){let{MathMLElement:a}=globalThis;if(n instanceof SVGElement||a!==void 0&&n instanceof a)n.setAttribute(e,t);else n[e]=t}else{let a=k(e);if(a==="class")t.split(" ").forEach((o)=>{n.classList.add(o)});else if(n[a]!==void 0)n[a]=t;else if(typeof t==="boolean")t?n.setAttribute(a,""):n.removeAttribute(a);else n.setAttribute(a,t)}},pi=(n)=>{return{toDOM(e,t){ma(e,n,t)}}},mi=(n,e,t)=>{if(e==="apply")t(n);else if(e.match(/^on[A-Z]/)!=null){let a=e.substring(2).toLowerCase();re(n,a,t)}else if(e==="bind")if((typeof t.binding==="string"?K[t.binding]:t.binding)!==void 0&&t.value!==void 0)H(n,t.value,t.binding instanceof Function?{toDOM:t.binding}:t.binding);else throw new Error("bad binding");else if(e.match(/^bind[A-Z]/)!=null){let a=e.substring(4,5).toLowerCase()+e.substring(5),o=K[a];if(o!==void 0)H(n,t,o);else throw new Error(`${e} is not allowed, bindings.${a} is not defined`)}else if(Yn(t))H(n,t,pi(e));else ma(n,e,t)},Ye=(n,...e)=>{if(ee[n]===void 0){let[o,i]=n.split("|");if(i===void 0)ee[n]=globalThis.document.createElement(o);else ee[n]=globalThis.document.createElementNS(i,o)}let t=ee[n].cloneNode(),a={};for(let o of e)if(o instanceof Element||o instanceof DocumentFragment||typeof o==="string"||typeof o==="number")if(t instanceof HTMLTemplateElement)t.content.append(o);else t.append(o);else if(o.xinPath)t.append(g.span({bindText:o}));else Object.assign(a,o);for(let o of Object.keys(a)){let i=a[o];mi(t,o,i)}return t},Le=(...n)=>{let e=globalThis.document.createDocumentFragment();for(let t of n)e.append(t);return e},g=new Proxy({fragment:Le},{get(n,e){if(e=e.replace(/[A-Z]/g,(t)=>`-${t.toLocaleLowerCase()}`),n[e]===void 0)n[e]=(...t)=>Ye(e,...t);return n[e]},set(){throw new Error("You may not add new properties to elements")}}),$n=new Proxy({fragment:Le},{get(n,e){if(n[e]===void 0)n[e]=(...t)=>Ye(`${e}|${hi}`,...t);return n[e]},set(){throw new Error("You may not add new properties to elements")}}),ca=new Proxy({fragment:Le},{get(n,e){if(n[e]===void 0)n[e]=(...t)=>Ye(`${e}|${di}`,...t);return n[e]},set(){throw new Error("You may not add new properties to elements")}});function Rn(n,e){let t=g.style(qn(e));t.id=n,document.head.append(t)}var ci=["animation-iteration-count","flex","flex-base","flex-grow","flex-shrink","opacity","order","tab-size","widows","z-index","zoom"],ba=(n,e)=>{if(typeof e==="number"&&!ci.includes(n))e=`${e}px`;if(n.startsWith("_"))if(n.startsWith("__"))n="--"+n.substring(2),e=`var(${n}-default, ${e})`;else n="--"+n.substring(1);return{prop:n,value:String(e)}},bi=(n,e,t)=>{if(t===void 0)return"";if(t instanceof v)t=t.html;let a=ba(e,t);return`${n}  ${a.prop}: ${a.value};`},ya=(n,e,t="")=>{let a=k(n);if(typeof e==="object"&&!(e instanceof v)){let o=Object.keys(e).map((i)=>ya(i,e[i],`${t}  `)).join(`
`);return`${t}  ${n} {
${o}
${t}  }`}else return bi(t,a,e)},qn=(n,e="")=>{return Object.keys(n).map((t)=>{let a=n[t];if(typeof a==="string"){if(t==="@import")return`@import url('${a}');`;throw new Error("top-level string value only allowed for `@import`")}let o=Object.keys(a).map((i)=>ya(i,a[i])).join(`
`);return`${e}${t} {
${o}
}`}).join(`

`)},yi=(n)=>{console.warn("initVars is deprecated. Just use _ and __ prefixes instead.");let e={};for(let t of Object.keys(n)){let a=n[t],o=k(t);e[`--${o}`]=typeof a==="number"&&a!==0?String(a)+"px":a}return e},$e=(n)=>{let e={};for(let t of Object.keys(n)){let a=n[t];if(a instanceof v)e[t]=a.inverseLuminance;else if(typeof a==="string"&&a.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/))e[t]=v.fromCss(a).inverseLuminance}return e},c=new Proxy({},{get(n,e){if(n[e]===void 0){let t="--"+k(e);n[e]=(a)=>`var(${t}, ${a})`}return n[e]}}),r=new Proxy({},{get(n,e){if(e==="default")return c;if(n[e]==null){e=k(e);let[,t,,a,o,i]=e.match(/^([-\w]*?)((_)?(\d+)(\w?))?$/)||["",e],s=`--${t}`;if(o!=null){let l=a==null?Number(o)/100:-Number(o)/100;switch(i){case"b":{let d=v.fromVar(s);n[e]=l>0?d.brighten(l).rgba:d.darken(-l).rgba}break;case"s":{let d=v.fromVar(s);n[e]=l>0?d.saturate(l).rgba:d.desaturate(-l).rgba}break;case"h":{let d=v.fromVar(s);n[e]=d.rotate(l*100).rgba}break;case"o":{let d=v.fromVar(s);n[e]=d.opacity(l).rgba}break;case"":n[e]=`calc(var(${s}) * ${l})`;break;default:throw console.error(i),new Error(`Unrecognized method ${i} for css variable ${s}`)}}else n[e]=`var(${s})`}return n[e]}}),gi=0;function Oe(){return`custom-elt${(gi++).toString(36)}`}var Kt=0,zn={};function fi(n,e){let t=zn[n],a=qn(e).replace(/:host\b/g,n);zn[n]=t?t+`
`+a:a}function wi(n){if(zn[n])document.head.append(g.style({id:n+"-component"},zn[n]));delete zn[n]}class y extends HTMLElement{static elements=g;static _elementCreator;instanceId;styleNode;static styleSpec;static styleNode;content=g.slot();isSlotted;static _tagName=null;static get tagName(){return this._tagName}static StyleNode(n){return console.warn("StyleNode is deprecated, just assign static styleSpec: XinStyleSheet to the class directly"),g.style(qn(n))}static elementCreator(n={}){if(this._elementCreator==null){let{tag:e,styleSpec:t}=n,a=n!=null?e:null;if(a==null)if(typeof this.name==="string"&&this.name!==""){if(a=k(this.name),a.startsWith("-"))a=a.slice(1)}else a=Oe();if(customElements.get(a)!=null)console.warn(`${a} is already defined`);if(a.match(/\w+(-\w+)+/)==null)console.warn(`${a} is not a legal tag for a custom-element`),a=Oe();while(customElements.get(a)!==void 0)a=Oe();if(this._tagName=a,t!==void 0)fi(a,t);window.customElements.define(a,this,n),this._elementCreator=g[a]}return this._elementCreator}initAttributes(...n){let e={},t={};new MutationObserver((a)=>{let o=!1;if(a.forEach((i)=>{o=!!(i.attributeName&&n.includes(ri(i.attributeName)))}),o&&this.queueRender!==void 0)this.queueRender(!1)}).observe(this,{attributes:!0}),n.forEach((a)=>{e[a]=rn(this[a]);let o=k(a);Object.defineProperty(this,a,{enumerable:!1,get(){if(typeof e[a]==="boolean")return this.hasAttribute(o);else if(this.hasAttribute(o))return typeof e[a]==="number"?parseFloat(this.getAttribute(o)):this.getAttribute(o);else if(t[a]!==void 0)return t[a];else return e[a]},set(i){if(typeof e[a]==="boolean"){if(i!==this[a]){if(i)this.setAttribute(o,"");else this.removeAttribute(o);this.queueRender()}}else if(typeof e[a]==="number"){if(i!==parseFloat(this[a]))this.setAttribute(o,i),this.queueRender()}else if(typeof i==="object"||`${i}`!==`${this[a]}`){if(i===null||i===void 0||typeof i==="object")this.removeAttribute(o);else this.setAttribute(o,i);this.queueRender(),t[a]=i}}})})}initValue(){let n=Object.getOwnPropertyDescriptor(this,"value");if(n===void 0||n.get!==void 0||n.set!==void 0)return;let e=this.hasAttribute("value")?this.getAttribute("value"):rn(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get(){return e},set(t){if(e!==t)e=t,this.queueRender(!0)}})}_parts;get parts(){let n=this.shadowRoot!=null?this.shadowRoot:this;if(this._parts==null)this._parts=new Proxy({},{get(e,t){if(e[t]===void 0){let a=n.querySelector(`[part="${t}"]`);if(a==null)a=n.querySelector(t);if(a==null)throw new Error(`elementRef "${t}" does not exist!`);a.removeAttribute("data-ref"),e[t]=a}return e[t]}});return this._parts}constructor(){super();Kt+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${Kt}`,this._value=rn(this.defaultValue)}connectedCallback(){if(wi(this.constructor.tagName),this.hydrate(),this.role!=null)this.setAttribute("role",this.role);if(this.onResize!==void 0){if(Ne.observe(this),this._onResize==null)this._onResize=this.onResize.bind(this);this.addEventListener("resize",this._onResize)}if(this.value!=null&&this.getAttribute("value")!=null)this._value=this.getAttribute("value");this.queueRender()}disconnectedCallback(){Ne.unobserve(this)}_changeQueued=!1;_renderQueued=!1;queueRender(n=!1){if(!this._hydrated)return;if(!this._changeQueued)this._changeQueued=n;if(!this._renderQueued)this._renderQueued=!0,requestAnimationFrame(()=>{if(this._changeQueued)la(this,"change");this._changeQueued=!1,this._renderQueued=!1,this.render()})}_hydrated=!1;hydrate(){if(!this._hydrated){this.initValue();let n=typeof this.content!=="function",e=typeof this.content==="function"?this.content():this.content,{styleSpec:t}=this.constructor,{styleNode:a}=this.constructor;if(t)a=this.constructor.styleNode=g.style(qn(t)),delete this.constructor.styleNode;if(this.styleNode)console.warn(this,"styleNode is deprecrated, use static styleNode or statc styleSpec instead"),a=this.styleNode;if(a){let o=this.attachShadow({mode:"open"});o.appendChild(a.cloneNode(!0)),$t(o,e,n)}else if(e!==null){let o=Array.from(this.childNodes);$t(this,e,n),this.isSlotted=this.querySelector("slot,xin-slot")!==void 0;let i=Array.from(this.querySelectorAll("slot"));if(i.length>0)i.forEach(Re.replaceSlot);if(o.length>0){let s={"":this};Array.from(this.querySelectorAll("xin-slot")).forEach((l)=>{s[l.name]=l}),o.forEach((l)=>{let d=s[""],h=l instanceof Element?s[l.slot]:d;(h!==void 0?h:d).append(l)})}}this._hydrated=!0}}render(){}}class Re extends y{name="";content=null;static replaceSlot(n){let e=document.createElement("xin-slot");if(n.name!=="")e.setAttribute("name",n.name);n.replaceWith(e)}constructor(){super();this.initAttributes("name")}}var jl=Re.elementCreator({tag:"xin-slot"}),Ge=(n=()=>!0)=>{let e=localStorage.getItem("xin-state");if(e!=null){let a=JSON.parse(e);for(let o of Object.keys(a).filter(n))if(I[o]!==void 0)Object.assign(I[o],a[o]);else I[o]=a[o]}let t=le(()=>{let a={},o=z(I);for(let i of Object.keys(o).filter(n))a[i]=o[i];localStorage.setItem("xin-state",JSON.stringify(a)),console.log("xin state saved to localStorage")},500);Ln(n,t)},de="1.0.2";function pn(n){return Object.assign(En,n),En}var Zt=!1;function Tn(n,e=!1){if(e){if(!Zt)console.warn("xinProxy(..., true) is deprecated; use boxedProxy(...) instead"),Zt=!0;return pn(n)}return Object.keys(n).forEach((t)=>{I[t]=n[t]}),I}var vi={};async function Je(n,e){let{type:t,styleSpec:a}=await e(n,{Color:v,Component:y,elements:g,svgElements:$n,mathML:ca,varDefault:c,vars:r,xin:I,boxed:En,xinProxy:Tn,boxedProxy:pn,makeComponent:Je,bind:H,on:re,version:de}),o={type:t,creator:t.elementCreator({tag:n,styleSpec:a})};return vi[n]=o,o}var De={},xi=(n)=>import(n);class he extends y{tag="anon-elt";src="";property="default";loaded;blueprintLoaded=(n)=>{};async packaged(){let{tag:n,src:e,property:t}=this,a=`${n}.${t}:${e}`;if(!this.loaded){if(De[a]===void 0)De[a]=xi(e).then((o)=>{let i=o[t];return Je(n,i)});else console.log(`using cached ${n}`);this.loaded=await De[a],this.blueprintLoaded(this.loaded)}return this.loaded}constructor(){super();this.initAttributes("tag","src","property")}}var Ci=he.elementCreator({tag:"xin-blueprint",styleSpec:{":host":{display:"none"}}});class Ue extends y{allLoaded=()=>{};constructor(){super()}async load(){let n=Array.from(this.querySelectorAll(he.tagName)).filter((e)=>e.src).map((e)=>e.packaged());await Promise.all(n),this.allLoaded()}connectedCallback(){super.connectedCallback(),this.load()}}var ji=Ue.elementCreator({tag:"xin-loader",styleSpec:{":host":{display:"none"}}});var Xt={};Nt(Xt,{xrControllersText:()=>Os,xrControllers:()=>As,xinjs:()=>Gn,xinTagList:()=>ml,xinTag:()=>So,xinSizer:()=>dl,xinSelect:()=>mt,xinSegmented:()=>rl,xinRating:()=>Ks,xinPasswordStrength:()=>Us,xinNotification:()=>fo,xinMenu:()=>ls,xinLocalized:()=>Ee,xinForm:()=>Ps,xinFloat:()=>it,xinField:()=>_s,xinCarousel:()=>Ui,version:()=>Vt,updateLocalized:()=>ct,trackDrag:()=>tn,tabSelector:()=>yo,svgIcon:()=>$i,svg2DataUrl:()=>Ua,styleSheet:()=>Ja,spacer:()=>An,sizeBreak:()=>Ot,sideNav:()=>Bt,setLocale:()=>ns,scriptTag:()=>wn,richTextWidgets:()=>jo,richText:()=>al,removeLastMenu:()=>xn,postNotification:()=>Gs,positionFloat:()=>no,popMenu:()=>Z,popFloat:()=>ka,menu:()=>lo,markdownViewer:()=>St,mapBox:()=>Ls,makeSorter:()=>eo,makeExamplesLive:()=>Fs,localize:()=>P,localePicker:()=>as,liveExample:()=>Me,isBreached:()=>vo,initLocalization:()=>ts,icons:()=>f,i18n:()=>_,gamepadText:()=>Bs,gamepadState:()=>bo,findHighestZ:()=>pt,filterPart:()=>je,filterBuilder:()=>js,elastic:()=>nl,editableRect:()=>fs,dragAndDrop:()=>ho,digest:()=>wo,defineIcon:()=>Li,dataTable:()=>ys,createSubMenu:()=>io,createMenuItem:()=>so,createMenuAction:()=>oo,commandButton:()=>Y,colorInput:()=>Qa,codeEditor:()=>xe,bringToFront:()=>Qn,bodymovinPlayer:()=>Gi,blockStyle:()=>Mt,b3d:()=>Ri,availableFilters:()=>wt,abTest:()=>Fi,XinTagList:()=>zt,XinTag:()=>Ie,XinSizer:()=>Dt,XinSelect:()=>ne,XinSegmented:()=>_t,XinRating:()=>Tt,XinPasswordStrength:()=>Et,XinNotification:()=>vn,XinMenu:()=>gt,XinLocalized:()=>G,XinForm:()=>kn,XinFloat:()=>an,XinField:()=>Te,XinCarousel:()=>ut,TabSelector:()=>Ct,SvgIcon:()=>dt,SizeBreak:()=>At,SideNav:()=>Pt,RichText:()=>It,MarkdownViewer:()=>jt,MapBox:()=>fn,LocalePicker:()=>bt,LiveExample:()=>On,FilterPart:()=>vt,FilterBuilder:()=>xt,EditableRect:()=>F,DataTable:()=>ft,CodeEditor:()=>Bn,BodymovinPlayer:()=>Pn,B3d:()=>ht,AbTest:()=>_n});function Ke(){return{async:!1,baseUrl:null,breaks:!1,extensions:null,gfm:!0,headerIds:!0,headerPrefix:"",highlight:null,hooks:null,langPrefix:"language-",mangle:!0,pedantic:!1,renderer:null,sanitize:!1,sanitizer:null,silent:!1,smartypants:!1,tokenizer:null,walkTokens:null,xhtml:!1}}var nn=Ke();function Ca(n){nn=n}var ja=/[&<>"']/,Si=new RegExp(ja.source,"g"),Sa=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,Ei=new RegExp(Sa.source,"g"),Ti={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ga=(n)=>Ti[n];function A(n,e){if(e){if(ja.test(n))return n.replace(Si,ga)}else if(Sa.test(n))return n.replace(Ei,ga);return n}var Mi=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;function Ea(n){return n.replace(Mi,(e,t)=>{if(t=t.toLowerCase(),t==="colon")return":";if(t.charAt(0)==="#")return t.charAt(1)==="x"?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1));return""})}var Ii=/(^|[^\[])\^/g;function j(n,e){n=typeof n==="string"?n:n.source,e=e||"";let t={replace:(a,o)=>{return o=o.source||o,o=o.replace(Ii,"$1"),n=n.replace(a,o),t},getRegex:()=>{return new RegExp(n,e)}};return t}var _i=/[^\w:]/g,Pi=/^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;function fa(n,e,t){if(n){let a;try{a=decodeURIComponent(Ea(t)).replace(_i,"").toLowerCase()}catch(o){return null}if(a.indexOf("javascript:")===0||a.indexOf("vbscript:")===0||a.indexOf("data:")===0)return null}if(e&&!Pi.test(t))t=Di(e,t);try{t=encodeURI(t).replace(/%25/g,"%")}catch(a){return null}return t}var ue={},Bi=/^[^:]+:\/*[^/]*$/,Ai=/^([^:]+:)[\s\S]*$/,Oi=/^([^:]+:\/*[^/]*)[\s\S]*$/;function Di(n,e){if(!ue[" "+n])if(Bi.test(n))ue[" "+n]=n+"/";else ue[" "+n]=pe(n,"/",!0);n=ue[" "+n];let t=n.indexOf(":")===-1;if(e.substring(0,2)==="//"){if(t)return e;return n.replace(Ai,"$1")+e}else if(e.charAt(0)==="/"){if(t)return e;return n.replace(Oi,"$1")+e}else return n+e}var me={exec:function n(){}};function wa(n,e){let t=n.replace(/\|/g,(i,s,l)=>{let d=!1,h=s;while(--h>=0&&l[h]==="\\")d=!d;if(d)return"|";else return" |"}),a=t.split(/ \|/),o=0;if(!a[0].trim())a.shift();if(a.length>0&&!a[a.length-1].trim())a.pop();if(a.length>e)a.splice(e);else while(a.length<e)a.push("");for(;o<a.length;o++)a[o]=a[o].trim().replace(/\\\|/g,"|");return a}function pe(n,e,t){let a=n.length;if(a===0)return"";let o=0;while(o<a){let i=n.charAt(a-o-1);if(i===e&&!t)o++;else if(i!==e&&t)o++;else break}return n.slice(0,a-o)}function zi(n,e){if(n.indexOf(e[1])===-1)return-1;let t=n.length,a=0,o=0;for(;o<t;o++)if(n[o]==="\\")o++;else if(n[o]===e[0])a++;else if(n[o]===e[1]){if(a--,a<0)return o}return-1}function Vi(n,e){if(!n||n.silent)return;if(e)console.warn("marked(): callback is deprecated since version 5.0.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/using_pro#async");if(n.sanitize||n.sanitizer)console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options");if(n.highlight||n.langPrefix!=="language-")console.warn("marked(): highlight and langPrefix parameters are deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-highlight.");if(n.mangle)console.warn("marked(): mangle parameter is enabled by default, but is deprecated since version 5.0.0, and will be removed in the future. To clear this warning, install https://www.npmjs.com/package/marked-mangle, or disable by setting `{mangle: false}`.");if(n.baseUrl)console.warn("marked(): baseUrl parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-base-url.");if(n.smartypants)console.warn("marked(): smartypants parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-smartypants.");if(n.xhtml)console.warn("marked(): xhtml parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-xhtml.");if(n.headerIds||n.headerPrefix)console.warn("marked(): headerIds and headerPrefix parameters enabled by default, but are deprecated since version 5.0.0, and will be removed in the future. To clear this warning, install  https://www.npmjs.com/package/marked-gfm-heading-id, or disable by setting `{headerIds: false}`.")}function va(n,e,t,a){let o=e.href,i=e.title?A(e.title):null,s=n[1].replace(/\\([\[\]])/g,"$1");if(n[0].charAt(0)!=="!"){a.state.inLink=!0;let l={type:"link",raw:t,href:o,title:i,text:s,tokens:a.inlineTokens(s)};return a.state.inLink=!1,l}return{type:"image",raw:t,href:o,title:i,text:A(s)}}function Xi(n,e){let t=n.match(/^(\s+)(?:```)/);if(t===null)return e;let a=t[1];return e.split(`
`).map((o)=>{let i=o.match(/^\s+/);if(i===null)return o;let[s]=i;if(s.length>=a.length)return o.slice(a.length);return o}).join(`
`)}class Un{constructor(n){this.options=n||nn}space(n){let e=this.rules.block.newline.exec(n);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(n){let e=this.rules.block.code.exec(n);if(e){let t=e[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:!this.options.pedantic?pe(t,`
`):t}}}fences(n){let e=this.rules.block.fences.exec(n);if(e){let t=e[0],a=Xi(t,e[3]||"");return{type:"code",raw:t,lang:e[2]?e[2].trim().replace(this.rules.inline._escapes,"$1"):e[2],text:a}}}heading(n){let e=this.rules.block.heading.exec(n);if(e){let t=e[2].trim();if(/#$/.test(t)){let a=pe(t,"#");if(this.options.pedantic)t=a.trim();else if(!a||/ $/.test(a))t=a.trim()}return{type:"heading",raw:e[0],depth:e[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(n){let e=this.rules.block.hr.exec(n);if(e)return{type:"hr",raw:e[0]}}blockquote(n){let e=this.rules.block.blockquote.exec(n);if(e){let t=e[0].replace(/^ *>[ \t]?/gm,""),a=this.lexer.state.top;this.lexer.state.top=!0;let o=this.lexer.blockTokens(t);return this.lexer.state.top=a,{type:"blockquote",raw:e[0],tokens:o,text:t}}}list(n){let e=this.rules.block.list.exec(n);if(e){let t,a,o,i,s,l,d,h,m,p,u,E,T=e[1].trim(),V=T.length>1,S={type:"list",raw:"",ordered:V,start:V?+T.slice(0,-1):"",loose:!1,items:[]};if(T=V?`\\d{1,9}\\${T.slice(-1)}`:`\\${T}`,this.options.pedantic)T=V?T:"[*+-]";let x=new RegExp(`^( {0,3}${T})((?:[	 ][^\\n]*)?(?:\\n|$))`);while(n){if(E=!1,!(e=x.exec(n)))break;if(this.rules.block.hr.test(n))break;if(t=e[0],n=n.substring(t.length),h=e[2].split(`
`,1)[0].replace(/^\t+/,(M)=>" ".repeat(3*M.length)),m=n.split(`
`,1)[0],this.options.pedantic)i=2,u=h.trimLeft();else i=e[2].search(/[^ ]/),i=i>4?1:i,u=h.slice(i),i+=e[1].length;if(l=!1,!h&&/^ *$/.test(m))t+=m+`
`,n=n.substring(m.length+1),E=!0;if(!E){let M=new RegExp(`^ {0,${Math.min(3,i-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),D=new RegExp(`^ {0,${Math.min(3,i-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),X=new RegExp(`^ {0,${Math.min(3,i-1)}}(?:\`\`\`|~~~)`),Dn=new RegExp(`^ {0,${Math.min(3,i-1)}}#`);while(n){if(p=n.split(`
`,1)[0],m=p,this.options.pedantic)m=m.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ");if(X.test(m))break;if(Dn.test(m))break;if(M.test(m))break;if(D.test(n))break;if(m.search(/[^ ]/)>=i||!m.trim())u+=`
`+m.slice(i);else{if(l)break;if(h.search(/[^ ]/)>=4)break;if(X.test(h))break;if(Dn.test(h))break;if(D.test(h))break;u+=`
`+m}if(!l&&!m.trim())l=!0;t+=p+`
`,n=n.substring(p.length+1),h=m.slice(i)}}if(!S.loose){if(d)S.loose=!0;else if(/\n *\n *$/.test(t))d=!0}if(this.options.gfm){if(a=/^\[[ xX]\] /.exec(u),a)o=a[0]!=="[ ] ",u=u.replace(/^\[[ xX]\] +/,"")}S.items.push({type:"list_item",raw:t,task:!!a,checked:o,loose:!1,text:u}),S.raw+=t}S.items[S.items.length-1].raw=t.trimRight(),S.items[S.items.length-1].text=u.trimRight(),S.raw=S.raw.trimRight();let B=S.items.length;for(s=0;s<B;s++)if(this.lexer.state.top=!1,S.items[s].tokens=this.lexer.blockTokens(S.items[s].text,[]),!S.loose){let M=S.items[s].tokens.filter((X)=>X.type==="space"),D=M.length>0&&M.some((X)=>/\n.*\n/.test(X.raw));S.loose=D}if(S.loose)for(s=0;s<B;s++)S.items[s].loose=!0;return S}}html(n){let e=this.rules.block.html.exec(n);if(e){let t={type:"html",block:!0,raw:e[0],pre:!this.options.sanitizer&&(e[1]==="pre"||e[1]==="script"||e[1]==="style"),text:e[0]};if(this.options.sanitize){let a=this.options.sanitizer?this.options.sanitizer(e[0]):A(e[0]);t.type="paragraph",t.text=a,t.tokens=this.lexer.inline(a)}return t}}def(n){let e=this.rules.block.def.exec(n);if(e){let t=e[1].toLowerCase().replace(/\s+/g," "),a=e[2]?e[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline._escapes,"$1"):"",o=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline._escapes,"$1"):e[3];return{type:"def",tag:t,raw:e[0],href:a,title:o}}}table(n){let e=this.rules.block.table.exec(n);if(e){let t={type:"table",header:wa(e[1]).map((a)=>{return{text:a}}),align:e[2].replace(/^ *|\| *$/g,"").split(/ *\| */),rows:e[3]&&e[3].trim()?e[3].replace(/\n[ \t]*$/,"").split(`
`):[]};if(t.header.length===t.align.length){t.raw=e[0];let a=t.align.length,o,i,s,l;for(o=0;o<a;o++)if(/^ *-+: *$/.test(t.align[o]))t.align[o]="right";else if(/^ *:-+: *$/.test(t.align[o]))t.align[o]="center";else if(/^ *:-+ *$/.test(t.align[o]))t.align[o]="left";else t.align[o]=null;a=t.rows.length;for(o=0;o<a;o++)t.rows[o]=wa(t.rows[o],t.header.length).map((d)=>{return{text:d}});a=t.header.length;for(i=0;i<a;i++)t.header[i].tokens=this.lexer.inline(t.header[i].text);a=t.rows.length;for(i=0;i<a;i++){l=t.rows[i];for(s=0;s<l.length;s++)l[s].tokens=this.lexer.inline(l[s].text)}return t}}}lheading(n){let e=this.rules.block.lheading.exec(n);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(n){let e=this.rules.block.paragraph.exec(n);if(e){let t=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:t,tokens:this.lexer.inline(t)}}}text(n){let e=this.rules.block.text.exec(n);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(n){let e=this.rules.inline.escape.exec(n);if(e)return{type:"escape",raw:e[0],text:A(e[1])}}tag(n){let e=this.rules.inline.tag.exec(n);if(e){if(!this.lexer.state.inLink&&/^<a /i.test(e[0]))this.lexer.state.inLink=!0;else if(this.lexer.state.inLink&&/^<\/a>/i.test(e[0]))this.lexer.state.inLink=!1;if(!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(e[0]))this.lexer.state.inRawBlock=!0;else if(this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(e[0]))this.lexer.state.inRawBlock=!1;return{type:this.options.sanitize?"text":"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:this.options.sanitize?this.options.sanitizer?this.options.sanitizer(e[0]):A(e[0]):e[0]}}}link(n){let e=this.rules.inline.link.exec(n);if(e){let t=e[2].trim();if(!this.options.pedantic&&/^</.test(t)){if(!/>$/.test(t))return;let i=pe(t.slice(0,-1),"\\");if((t.length-i.length)%2===0)return}else{let i=zi(e[2],"()");if(i>-1){let l=(e[0].indexOf("!")===0?5:4)+e[1].length+i;e[2]=e[2].substring(0,i),e[0]=e[0].substring(0,l).trim(),e[3]=""}}let a=e[2],o="";if(this.options.pedantic){let i=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(a);if(i)a=i[1],o=i[3]}else o=e[3]?e[3].slice(1,-1):"";if(a=a.trim(),/^</.test(a))if(this.options.pedantic&&!/>$/.test(t))a=a.slice(1);else a=a.slice(1,-1);return va(e,{href:a?a.replace(this.rules.inline._escapes,"$1"):a,title:o?o.replace(this.rules.inline._escapes,"$1"):o},e[0],this.lexer)}}reflink(n,e){let t;if((t=this.rules.inline.reflink.exec(n))||(t=this.rules.inline.nolink.exec(n))){let a=(t[2]||t[1]).replace(/\s+/g," ");if(a=e[a.toLowerCase()],!a){let o=t[0].charAt(0);return{type:"text",raw:o,text:o}}return va(t,a,t[0],this.lexer)}}emStrong(n,e,t=""){let a=this.rules.inline.emStrong.lDelim.exec(n);if(!a)return;if(a[3]&&t.match(/[\p{L}\p{N}]/u))return;if(!(a[1]||a[2])||!t||this.rules.inline.punctuation.exec(t)){let i=a[0].length-1,s,l,d=i,h=0,m=a[0][0]==="*"?this.rules.inline.emStrong.rDelimAst:this.rules.inline.emStrong.rDelimUnd;m.lastIndex=0,e=e.slice(-1*n.length+i);while((a=m.exec(e))!=null){if(s=a[1]||a[2]||a[3]||a[4]||a[5]||a[6],!s)continue;if(l=s.length,a[3]||a[4]){d+=l;continue}else if(a[5]||a[6]){if(i%3&&!((i+l)%3)){h+=l;continue}}if(d-=l,d>0)continue;l=Math.min(l,l+d+h);let p=n.slice(0,i+a.index+l+1);if(Math.min(i,l)%2){let E=p.slice(1,-1);return{type:"em",raw:p,text:E,tokens:this.lexer.inlineTokens(E)}}let u=p.slice(2,-2);return{type:"strong",raw:p,text:u,tokens:this.lexer.inlineTokens(u)}}}}codespan(n){let e=this.rules.inline.code.exec(n);if(e){let t=e[2].replace(/\n/g," "),a=/[^ ]/.test(t),o=/^ /.test(t)&&/ $/.test(t);if(a&&o)t=t.substring(1,t.length-1);return t=A(t,!0),{type:"codespan",raw:e[0],text:t}}}br(n){let e=this.rules.inline.br.exec(n);if(e)return{type:"br",raw:e[0]}}del(n){let e=this.rules.inline.del.exec(n);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(n,e){let t=this.rules.inline.autolink.exec(n);if(t){let a,o;if(t[2]==="@")a=A(this.options.mangle?e(t[1]):t[1]),o="mailto:"+a;else a=A(t[1]),o=a;return{type:"link",raw:t[0],text:a,href:o,tokens:[{type:"text",raw:a,text:a}]}}}url(n,e){let t;if(t=this.rules.inline.url.exec(n)){let a,o;if(t[2]==="@")a=A(this.options.mangle?e(t[0]):t[0]),o="mailto:"+a;else{let i;do i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])[0];while(i!==t[0]);if(a=A(t[0]),t[1]==="www.")o="http://"+t[0];else o=t[0]}return{type:"link",raw:t[0],text:a,href:o,tokens:[{type:"text",raw:a,text:a}]}}}inlineText(n,e){let t=this.rules.inline.text.exec(n);if(t){let a;if(this.lexer.state.inRawBlock)a=this.options.sanitize?this.options.sanitizer?this.options.sanitizer(t[0]):A(t[0]):t[0];else a=A(this.options.smartypants?e(t[0]):t[0]);return{type:"text",raw:t[0],text:a}}}}var w={newline:/^(?: *(?:\n|$))+/,code:/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,fences:/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,hr:/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,heading:/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,blockquote:/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,list:/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,html:"^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",def:/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,table:me,lheading:/^((?:(?!^bull ).|\n(?!\n|bull ))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,_paragraph:/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,text:/^[^\n]+/};w._label=/(?!\s*\])(?:\\.|[^\[\]\\])+/;w._title=/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;w.def=j(w.def).replace("label",w._label).replace("title",w._title).getRegex();w.bullet=/(?:[*+-]|\d{1,9}[.)])/;w.listItemStart=j(/^( *)(bull) */).replace("bull",w.bullet).getRegex();w.list=j(w.list).replace(/bull/g,w.bullet).replace("hr","\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def","\\n+(?="+w.def.source+")").getRegex();w._tag="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";w._comment=/<!--(?!-?>)[\s\S]*?(?:-->|$)/;w.html=j(w.html,"i").replace("comment",w._comment).replace("tag",w._tag).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();w.lheading=j(w.lheading).replace(/bull/g,w.bullet).getRegex();w.paragraph=j(w._paragraph).replace("hr",w.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",w._tag).getRegex();w.blockquote=j(w.blockquote).replace("paragraph",w.paragraph).getRegex();w.normal={...w};w.gfm={...w.normal,table:"^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"};w.gfm.table=j(w.gfm.table).replace("hr",w.hr).replace("heading"," {0,3}#{1,6} ").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",w._tag).getRegex();w.gfm.paragraph=j(w._paragraph).replace("hr",w.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("table",w.gfm.table).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",w._tag).getRegex();w.pedantic={...w.normal,html:j(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",w._comment).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:me,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:j(w.normal._paragraph).replace("hr",w.hr).replace("heading",` *#{1,6} *[^
]`).replace("lheading",w.lheading).replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").getRegex()};var b={escape:/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,autolink:/^<(scheme:[^\s\x00-\x1f<>]*|email)>/,url:me,tag:"^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",link:/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,reflink:/^!?\[(label)\]\[(ref)\]/,nolink:/^!?\[(ref)\](?:\[\])?/,reflinkSearch:"reflink|nolink(?!\\()",emStrong:{lDelim:/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,rDelimAst:/^[^_*]*?__[^_*]*?\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\*)[punct](\*+)(?=[\s]|$)|[^punct\s](\*+)(?!\*)(?=[punct\s]|$)|(?!\*)[punct\s](\*+)(?=[^punct\s])|[\s](\*+)(?!\*)(?=[punct])|(?!\*)[punct](\*+)(?!\*)(?=[punct])|[^punct\s](\*+)(?=[^punct\s])/,rDelimUnd:/^[^_*]*?\*\*[^_*]*?_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\s]|$)|[^punct\s](_+)(?!_)(?=[punct\s]|$)|(?!_)[punct\s](_+)(?=[^punct\s])|[\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])/},code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,br:/^( {2,}|\\)\n(?!\s*$)/,del:me,text:/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,punctuation:/^((?![*_])[\spunctuation])/};b._punctuation="\\p{P}$+<=>`^|~";b.punctuation=j(b.punctuation,"u").replace(/punctuation/g,b._punctuation).getRegex();b.blockSkip=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g;b.anyPunctuation=/\\[punct]/g;b._escapes=/\\([punct])/g;b._comment=j(w._comment).replace("(?:-->|$)","-->").getRegex();b.emStrong.lDelim=j(b.emStrong.lDelim,"u").replace(/punct/g,b._punctuation).getRegex();b.emStrong.rDelimAst=j(b.emStrong.rDelimAst,"gu").replace(/punct/g,b._punctuation).getRegex();b.emStrong.rDelimUnd=j(b.emStrong.rDelimUnd,"gu").replace(/punct/g,b._punctuation).getRegex();b.anyPunctuation=j(b.anyPunctuation,"gu").replace(/punct/g,b._punctuation).getRegex();b._escapes=j(b._escapes,"gu").replace(/punct/g,b._punctuation).getRegex();b._scheme=/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;b._email=/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;b.autolink=j(b.autolink).replace("scheme",b._scheme).replace("email",b._email).getRegex();b._attribute=/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;b.tag=j(b.tag).replace("comment",b._comment).replace("attribute",b._attribute).getRegex();b._label=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;b._href=/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;b._title=/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;b.link=j(b.link).replace("label",b._label).replace("href",b._href).replace("title",b._title).getRegex();b.reflink=j(b.reflink).replace("label",b._label).replace("ref",w._label).getRegex();b.nolink=j(b.nolink).replace("ref",w._label).getRegex();b.reflinkSearch=j(b.reflinkSearch,"g").replace("reflink",b.reflink).replace("nolink",b.nolink).getRegex();b.normal={...b};b.pedantic={...b.normal,strong:{start:/^__|\*\*/,middle:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,endAst:/\*\*(?!\*)/g,endUnd:/__(?!_)/g},em:{start:/^_|\*/,middle:/^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,endAst:/\*(?!\*)/g,endUnd:/_(?!_)/g},link:j(/^!?\[(label)\]\((.*?)\)/).replace("label",b._label).getRegex(),reflink:j(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",b._label).getRegex()};b.gfm={...b.normal,escape:j(b.escape).replace("])","~|])").getRegex(),_extended_email:/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,url:/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/};b.gfm.url=j(b.gfm.url,"i").replace("email",b.gfm._extended_email).getRegex();b.breaks={...b.gfm,br:j(b.br).replace("{2,}","*").getRegex(),text:j(b.gfm.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()};function Hi(n){return n.replace(/---/g,"—").replace(/--/g,"–").replace(/(^|[-\u2014/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…")}function xa(n){let e="",t,a,o=n.length;for(t=0;t<o;t++){if(a=n.charCodeAt(t),Math.random()>0.5)a="x"+a.toString(16);e+="&#"+a+";"}return e}class ${constructor(n){this.tokens=[],this.tokens.links=Object.create(null),this.options=n||nn,this.options.tokenizer=this.options.tokenizer||new Un,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let e={block:w.normal,inline:b.normal};if(this.options.pedantic)e.block=w.pedantic,e.inline=b.pedantic;else if(this.options.gfm)if(e.block=w.gfm,this.options.breaks)e.inline=b.breaks;else e.inline=b.gfm;this.tokenizer.rules=e}static get rules(){return{block:w,inline:b}}static lex(n,e){return new $(e).lex(n)}static lexInline(n,e){return new $(e).inlineTokens(n)}lex(n){n=n.replace(/\r\n|\r/g,`
`),this.blockTokens(n,this.tokens);let e;while(e=this.inlineQueue.shift())this.inlineTokens(e.src,e.tokens);return this.tokens}blockTokens(n,e=[]){if(this.options.pedantic)n=n.replace(/\t/g,"    ").replace(/^ +$/gm,"");else n=n.replace(/^( *)(\t+)/gm,(s,l,d)=>{return l+"    ".repeat(d.length)});let t,a,o,i;while(n){if(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some((s)=>{if(t=s.call({lexer:this},n,e))return n=n.substring(t.raw.length),e.push(t),!0;return!1}))continue;if(t=this.tokenizer.space(n)){if(n=n.substring(t.raw.length),t.raw.length===1&&e.length>0)e[e.length-1].raw+=`
`;else e.push(t);continue}if(t=this.tokenizer.code(n)){if(n=n.substring(t.raw.length),a=e[e.length-1],a&&(a.type==="paragraph"||a.type==="text"))a.raw+=`
`+t.raw,a.text+=`
`+t.text,this.inlineQueue[this.inlineQueue.length-1].src=a.text;else e.push(t);continue}if(t=this.tokenizer.fences(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.heading(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.hr(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.blockquote(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.list(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.html(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.def(n)){if(n=n.substring(t.raw.length),a=e[e.length-1],a&&(a.type==="paragraph"||a.type==="text"))a.raw+=`
`+t.raw,a.text+=`
`+t.raw,this.inlineQueue[this.inlineQueue.length-1].src=a.text;else if(!this.tokens.links[t.tag])this.tokens.links[t.tag]={href:t.href,title:t.title};continue}if(t=this.tokenizer.table(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.lheading(n)){n=n.substring(t.raw.length),e.push(t);continue}if(o=n,this.options.extensions&&this.options.extensions.startBlock){let s=1/0,l=n.slice(1),d;if(this.options.extensions.startBlock.forEach(function(h){if(d=h.call({lexer:this},l),typeof d==="number"&&d>=0)s=Math.min(s,d)}),s<1/0&&s>=0)o=n.substring(0,s+1)}if(this.state.top&&(t=this.tokenizer.paragraph(o))){if(a=e[e.length-1],i&&a.type==="paragraph")a.raw+=`
`+t.raw,a.text+=`
`+t.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=a.text;else e.push(t);i=o.length!==n.length,n=n.substring(t.raw.length);continue}if(t=this.tokenizer.text(n)){if(n=n.substring(t.raw.length),a=e[e.length-1],a&&a.type==="text")a.raw+=`
`+t.raw,a.text+=`
`+t.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=a.text;else e.push(t);continue}if(n){let s="Infinite loop on byte: "+n.charCodeAt(0);if(this.options.silent){console.error(s);break}else throw new Error(s)}}return this.state.top=!0,e}inline(n,e=[]){return this.inlineQueue.push({src:n,tokens:e}),e}inlineTokens(n,e=[]){let t,a,o,i=n,s,l,d;if(this.tokens.links){let h=Object.keys(this.tokens.links);if(h.length>0){while((s=this.tokenizer.rules.inline.reflinkSearch.exec(i))!=null)if(h.includes(s[0].slice(s[0].lastIndexOf("[")+1,-1)))i=i.slice(0,s.index)+"["+"a".repeat(s[0].length-2)+"]"+i.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex)}}while((s=this.tokenizer.rules.inline.blockSkip.exec(i))!=null)i=i.slice(0,s.index)+"["+"a".repeat(s[0].length-2)+"]"+i.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);while((s=this.tokenizer.rules.inline.anyPunctuation.exec(i))!=null)i=i.slice(0,s.index)+"++"+i.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);while(n){if(!l)d="";if(l=!1,this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some((h)=>{if(t=h.call({lexer:this},n,e))return n=n.substring(t.raw.length),e.push(t),!0;return!1}))continue;if(t=this.tokenizer.escape(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.tag(n)){if(n=n.substring(t.raw.length),a=e[e.length-1],a&&t.type==="text"&&a.type==="text")a.raw+=t.raw,a.text+=t.text;else e.push(t);continue}if(t=this.tokenizer.link(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.reflink(n,this.tokens.links)){if(n=n.substring(t.raw.length),a=e[e.length-1],a&&t.type==="text"&&a.type==="text")a.raw+=t.raw,a.text+=t.text;else e.push(t);continue}if(t=this.tokenizer.emStrong(n,i,d)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.codespan(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.br(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.del(n)){n=n.substring(t.raw.length),e.push(t);continue}if(t=this.tokenizer.autolink(n,xa)){n=n.substring(t.raw.length),e.push(t);continue}if(!this.state.inLink&&(t=this.tokenizer.url(n,xa))){n=n.substring(t.raw.length),e.push(t);continue}if(o=n,this.options.extensions&&this.options.extensions.startInline){let h=1/0,m=n.slice(1),p;if(this.options.extensions.startInline.forEach(function(u){if(p=u.call({lexer:this},m),typeof p==="number"&&p>=0)h=Math.min(h,p)}),h<1/0&&h>=0)o=n.substring(0,h+1)}if(t=this.tokenizer.inlineText(o,Hi)){if(n=n.substring(t.raw.length),t.raw.slice(-1)!=="_")d=t.raw.slice(-1);if(l=!0,a=e[e.length-1],a&&a.type==="text")a.raw+=t.raw,a.text+=t.text;else e.push(t);continue}if(n){let h="Infinite loop on byte: "+n.charCodeAt(0);if(this.options.silent){console.error(h);break}else throw new Error(h)}}return e}}class Kn{constructor(n){this.options=n||nn}code(n,e,t){let a=(e||"").match(/\S*/)[0];if(this.options.highlight){let o=this.options.highlight(n,a);if(o!=null&&o!==n)t=!0,n=o}if(n=n.replace(/\n$/,"")+`
`,!a)return"<pre><code>"+(t?n:A(n,!0))+`</code></pre>
`;return'<pre><code class="'+this.options.langPrefix+A(a)+'">'+(t?n:A(n,!0))+`</code></pre>
`}blockquote(n){return`<blockquote>
${n}</blockquote>
`}html(n,e){return n}heading(n,e,t,a){if(this.options.headerIds){let o=this.options.headerPrefix+a.slug(t);return`<h${e} id="${o}">${n}</h${e}>
`}return`<h${e}>${n}</h${e}>
`}hr(){return this.options.xhtml?`<hr/>
`:`<hr>
`}list(n,e,t){let a=e?"ol":"ul",o=e&&t!==1?' start="'+t+'"':"";return"<"+a+o+`>
`+n+"</"+a+`>
`}listitem(n){return`<li>${n}</li>
`}checkbox(n){return"<input "+(n?'checked="" ':"")+'disabled="" type="checkbox"'+(this.options.xhtml?" /":"")+"> "}paragraph(n){return`<p>${n}</p>
`}table(n,e){if(e)e=`<tbody>${e}</tbody>`;return`<table>
<thead>
`+n+`</thead>
`+e+`</table>
`}tablerow(n){return`<tr>
${n}</tr>
`}tablecell(n,e){let t=e.header?"th":"td";return(e.align?`<${t} align="${e.align}">`:`<${t}>`)+n+`</${t}>
`}strong(n){return`<strong>${n}</strong>`}em(n){return`<em>${n}</em>`}codespan(n){return`<code>${n}</code>`}br(){return this.options.xhtml?"<br/>":"<br>"}del(n){return`<del>${n}</del>`}link(n,e,t){if(n=fa(this.options.sanitize,this.options.baseUrl,n),n===null)return t;let a='<a href="'+n+'"';if(e)a+=' title="'+e+'"';return a+=">"+t+"</a>",a}image(n,e,t){if(n=fa(this.options.sanitize,this.options.baseUrl,n),n===null)return t;let a=`<img src="${n}" alt="${t}"`;if(e)a+=` title="${e}"`;return a+=this.options.xhtml?"/>":">",a}text(n){return n}}class ce{strong(n){return n}em(n){return n}codespan(n){return n}del(n){return n}html(n){return n}text(n){return n}link(n,e,t){return""+t}image(n,e,t){return""+t}br(){return""}}class be{constructor(){this.seen={}}serialize(n){return n.toLowerCase().trim().replace(/<[!\/a-z].*?>/ig,"").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,"").replace(/\s/g,"-")}getNextSafeSlug(n,e){let t=n,a=0;if(this.seen.hasOwnProperty(t)){a=this.seen[n];do a++,t=n+"-"+a;while(this.seen.hasOwnProperty(t))}if(!e)this.seen[n]=a,this.seen[t]=0;return t}slug(n,e={}){let t=this.serialize(n);return this.getNextSafeSlug(t,e.dryrun)}}class R{constructor(n){this.options=n||nn,this.options.renderer=this.options.renderer||new Kn,this.renderer=this.options.renderer,this.renderer.options=this.options,this.textRenderer=new ce,this.slugger=new be}static parse(n,e){return new R(e).parse(n)}static parseInline(n,e){return new R(e).parseInline(n)}parse(n,e=!0){let t="",a,o,i,s,l,d,h,m,p,u,E,T,V,S,x,B,M,D,X,Dn=n.length;for(a=0;a<Dn;a++){if(u=n[a],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[u.type]){if(X=this.options.extensions.renderers[u.type].call({parser:this},u),X!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(u.type)){t+=X||"";continue}}switch(u.type){case"space":continue;case"hr":{t+=this.renderer.hr();continue}case"heading":{t+=this.renderer.heading(this.parseInline(u.tokens),u.depth,Ea(this.parseInline(u.tokens,this.textRenderer)),this.slugger);continue}case"code":{t+=this.renderer.code(u.text,u.lang,u.escaped);continue}case"table":{m="",h="",s=u.header.length;for(o=0;o<s;o++)h+=this.renderer.tablecell(this.parseInline(u.header[o].tokens),{header:!0,align:u.align[o]});m+=this.renderer.tablerow(h),p="",s=u.rows.length;for(o=0;o<s;o++){d=u.rows[o],h="",l=d.length;for(i=0;i<l;i++)h+=this.renderer.tablecell(this.parseInline(d[i].tokens),{header:!1,align:u.align[i]});p+=this.renderer.tablerow(h)}t+=this.renderer.table(m,p);continue}case"blockquote":{p=this.parse(u.tokens),t+=this.renderer.blockquote(p);continue}case"list":{E=u.ordered,T=u.start,V=u.loose,s=u.items.length,p="";for(o=0;o<s;o++){if(x=u.items[o],B=x.checked,M=x.task,S="",x.task)if(D=this.renderer.checkbox(B),V)if(x.tokens.length>0&&x.tokens[0].type==="paragraph"){if(x.tokens[0].text=D+" "+x.tokens[0].text,x.tokens[0].tokens&&x.tokens[0].tokens.length>0&&x.tokens[0].tokens[0].type==="text")x.tokens[0].tokens[0].text=D+" "+x.tokens[0].tokens[0].text}else x.tokens.unshift({type:"text",text:D});else S+=D;S+=this.parse(x.tokens,V),p+=this.renderer.listitem(S,M,B)}t+=this.renderer.list(p,E,T);continue}case"html":{t+=this.renderer.html(u.text,u.block);continue}case"paragraph":{t+=this.renderer.paragraph(this.parseInline(u.tokens));continue}case"text":{p=u.tokens?this.parseInline(u.tokens):u.text;while(a+1<Dn&&n[a+1].type==="text")u=n[++a],p+=`
`+(u.tokens?this.parseInline(u.tokens):u.text);t+=e?this.renderer.paragraph(p):p;continue}default:{let Ht='Token with "'+u.type+'" type was not found.';if(this.options.silent){console.error(Ht);return}else throw new Error(Ht)}}}return t}parseInline(n,e){e=e||this.renderer;let t="",a,o,i,s=n.length;for(a=0;a<s;a++){if(o=n[a],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[o.type]){if(i=this.options.extensions.renderers[o.type].call({parser:this},o),i!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(o.type)){t+=i||"";continue}}switch(o.type){case"escape":{t+=e.text(o.text);break}case"html":{t+=e.html(o.text);break}case"link":{t+=e.link(o.href,o.title,this.parseInline(o.tokens,e));break}case"image":{t+=e.image(o.href,o.title,o.text);break}case"strong":{t+=e.strong(this.parseInline(o.tokens,e));break}case"em":{t+=e.em(this.parseInline(o.tokens,e));break}case"codespan":{t+=e.codespan(o.text);break}case"br":{t+=e.br();break}case"del":{t+=e.del(this.parseInline(o.tokens,e));break}case"text":{t+=e.text(o.text);break}default:{let l='Token with "'+o.type+'" type was not found.';if(this.options.silent){console.error(l);return}else throw new Error(l)}}}return t}}class Jn{constructor(n){this.options=n||nn}static passThroughHooks=new Set(["preprocess","postprocess"]);preprocess(n){return n}postprocess(n){return n}}class Ta{defaults=Ke();options=this.setOptions;parse=this.#n($.lex,R.parse);parseInline=this.#n($.lexInline,R.parseInline);Parser=R;parser=R.parse;Renderer=Kn;TextRenderer=ce;Lexer=$;lexer=$.lex;Tokenizer=Un;Slugger=be;Hooks=Jn;constructor(...n){this.use(...n)}walkTokens(n,e){let t=[];for(let a of n)switch(t=t.concat(e.call(this,a)),a.type){case"table":{for(let o of a.header)t=t.concat(this.walkTokens(o.tokens,e));for(let o of a.rows)for(let i of o)t=t.concat(this.walkTokens(i.tokens,e));break}case"list":{t=t.concat(this.walkTokens(a.items,e));break}default:if(this.defaults.extensions&&this.defaults.extensions.childTokens&&this.defaults.extensions.childTokens[a.type])this.defaults.extensions.childTokens[a.type].forEach((o)=>{t=t.concat(this.walkTokens(a[o],e))});else if(a.tokens)t=t.concat(this.walkTokens(a.tokens,e))}return t}use(...n){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return n.forEach((t)=>{let a={...t};if(a.async=this.defaults.async||a.async||!1,t.extensions)t.extensions.forEach((o)=>{if(!o.name)throw new Error("extension name required");if(o.renderer){let i=e.renderers[o.name];if(i)e.renderers[o.name]=function(...s){let l=o.renderer.apply(this,s);if(l===!1)l=i.apply(this,s);return l};else e.renderers[o.name]=o.renderer}if(o.tokenizer){if(!o.level||o.level!=="block"&&o.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");if(e[o.level])e[o.level].unshift(o.tokenizer);else e[o.level]=[o.tokenizer];if(o.start){if(o.level==="block")if(e.startBlock)e.startBlock.push(o.start);else e.startBlock=[o.start];else if(o.level==="inline")if(e.startInline)e.startInline.push(o.start);else e.startInline=[o.start]}}if(o.childTokens)e.childTokens[o.name]=o.childTokens}),a.extensions=e;if(t.renderer){let o=this.defaults.renderer||new Kn(this.defaults);for(let i in t.renderer){let s=o[i];o[i]=(...l)=>{let d=t.renderer[i].apply(o,l);if(d===!1)d=s.apply(o,l);return d}}a.renderer=o}if(t.tokenizer){let o=this.defaults.tokenizer||new Un(this.defaults);for(let i in t.tokenizer){let s=o[i];o[i]=(...l)=>{let d=t.tokenizer[i].apply(o,l);if(d===!1)d=s.apply(o,l);return d}}a.tokenizer=o}if(t.hooks){let o=this.defaults.hooks||new Jn;for(let i in t.hooks){let s=o[i];if(Jn.passThroughHooks.has(i))o[i]=(l)=>{if(this.defaults.async)return Promise.resolve(t.hooks[i].call(o,l)).then((h)=>{return s.call(o,h)});let d=t.hooks[i].call(o,l);return s.call(o,d)};else o[i]=(...l)=>{let d=t.hooks[i].apply(o,l);if(d===!1)d=s.apply(o,l);return d}}a.hooks=o}if(t.walkTokens){let o=this.defaults.walkTokens;a.walkTokens=function(i){let s=[];if(s.push(t.walkTokens.call(this,i)),o)s=s.concat(o.call(this,i));return s}}this.defaults={...this.defaults,...a}}),this}setOptions(n){return this.defaults={...this.defaults,...n},this}#n(n,e){return(t,a,o)=>{if(typeof a==="function")o=a,a=null;let i={...a};a={...this.defaults,...i};let s=this.#e(a.silent,a.async,o);if(typeof t==="undefined"||t===null)return s(new Error("marked(): input parameter is undefined or null"));if(typeof t!=="string")return s(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(t)+", string expected"));if(Vi(a,o),a.hooks)a.hooks.options=a;if(o){let l=a.highlight,d;try{if(a.hooks)t=a.hooks.preprocess(t);d=n(t,a)}catch(p){return s(p)}let h=(p)=>{let u;if(!p)try{if(a.walkTokens)this.walkTokens(d,a.walkTokens);if(u=e(d,a),a.hooks)u=a.hooks.postprocess(u)}catch(E){p=E}return a.highlight=l,p?s(p):o(null,u)};if(!l||l.length<3)return h();if(delete a.highlight,!d.length)return h();let m=0;if(this.walkTokens(d,(p)=>{if(p.type==="code")m++,setTimeout(()=>{l(p.text,p.lang,(u,E)=>{if(u)return h(u);if(E!=null&&E!==p.text)p.text=E,p.escaped=!0;if(m--,m===0)h()})},0)}),m===0)h();return}if(a.async)return Promise.resolve(a.hooks?a.hooks.preprocess(t):t).then((l)=>n(l,a)).then((l)=>a.walkTokens?Promise.all(this.walkTokens(l,a.walkTokens)).then(()=>l):l).then((l)=>e(l,a)).then((l)=>a.hooks?a.hooks.postprocess(l):l).catch(s);try{if(a.hooks)t=a.hooks.preprocess(t);let l=n(t,a);if(a.walkTokens)this.walkTokens(l,a.walkTokens);let d=e(l,a);if(a.hooks)d=a.hooks.postprocess(d);return d}catch(l){return s(l)}}}#e(n,e,t){return(a)=>{if(a.message+=`
Please report this to https://github.com/markedjs/marked.`,n){let o="<p>An error occurred:</p><pre>"+A(a.message+"",!0)+"</pre>";if(e)return Promise.resolve(o);if(t){t(null,o);return}return o}if(e)return Promise.reject(a);if(t){t(a);return}throw a}}}var mn=new Ta(nn);function C(n,e,t){return mn.parse(n,e,t)}C.options=C.setOptions=function(n){return mn.setOptions(n),C.defaults=mn.defaults,Ca(C.defaults),C};C.getDefaults=Ke;C.defaults=nn;C.use=function(...n){return mn.use(...n),C.defaults=mn.defaults,Ca(C.defaults),C};C.walkTokens=function(n,e){return mn.walkTokens(n,e)};C.parseInline=mn.parseInline;C.Parser=R;C.parser=R.parse;C.Renderer=Kn;C.TextRenderer=ce;C.Lexer=$;C.lexer=$.lex;C.Tokenizer=Un;C.Slugger=be;C.Hooks=Jn;C.parse=C;var{options:Sl,setOptions:El,use:Tl,walkTokens:Ml,parseInline:Il}=C;var _l=R.parse,Pl=$.lex;var Ni=Object.defineProperty,Wi=(n,e)=>{for(var t in e)Ni(n,t,{get:e[t],enumerable:!0,configurable:!0,set:(a)=>e[t]=()=>a})},{abTestConditions:Ze}=Tn({abTestConditions:{}});class _n extends y{static set conditions(n){Object.assign(Ze,n);for(let e of[..._n.instances])e.queueRender()}condition="";not=!1;static instances=new Set;constructor(){super();this.initAttributes("condition","not")}connectedCallback(){super.connectedCallback(),_n.instances.add(this)}disconnectedCallback(){super.disconnectedCallback(),_n.instances.delete(this)}render(){if(this.condition!==""&&(this.not?Ze[this.condition]!==!0:Ze[this.condition]===!0))this.toggleAttribute("hidden",!1);else this.toggleAttribute("hidden",!0)}}var Fi=_n.elementCreator({tag:"xin-ab"}),ye={};function wn(n,e){if(ye[n]===void 0){if(e!==void 0){let a=globalThis[e];ye[n]=Promise.resolve({[e]:a})}let t=g.script({src:n});document.head.append(t),ye[n]=new Promise((a)=>{t.onload=()=>a(globalThis)})}return ye[n]}var Qe={};function Ja(n){if(Qe[n]===void 0){let e=g.link({rel:"stylesheet",type:"text/css",href:n});document.head.append(e),Qe[n]=new Promise((t)=>{e.onload=t})}return Qe[n]}var Se={earth:"M705 107c-58-28-124-43-193-43-54 0-107 10-155 27 0 0-28 63-28 63-1 2-1 5-1 7 0 0 10 112 10 112 0 5-2 10-6 13 0 0-25 17-25 17-8 5-19 1-21-8 0 0-14-50-14-50-2-8-11-12-19-9 0 0-40 17-40 17-4 2-6 5-8 8 0 0-34 99-34 99-3 9 3 18 13 19 0 0 109 5 109 5 3 0 6 1 8 3 0 0 115 96 115 96 2 1 3 2 6 3 0 0 138 35 138 35 6 1 10 6 10 12 0 0 9 105 9 105 0 4-1 8-3 10 0 0-240 274-240 274 54 23 114 36 177 36 138 0 261-62 344-160 0 0 25-151 25-151 0-2 0-3-0-5 0 0-33-190-33-190-1-6-5-10-11-11 0 0-141-31-141-31-5-1-9-5-11-10 0 0-51-183-51-183-1-4-0-8 2-12 0 0 68-101 68-101zM102 332c-24 55-38 116-38 180 0 151 75 284 189 365 0 0 6-179 6-179 0-5-3-10-8-13 0 0-111-57-111-57-5-2-7-7-8-12 0 0-6-223-6-223-0-2-0-3-1-5 0 0-23-56-23-56zM512 0c283 0 512 229 512 512s-229 512-512 512c-283 0-512-229-512-512s229-512 512-512z",bluesky:"M830 0c137 0 194 57 194 194v635c0 137-57 194-194 194h-635c-137 0-194-57-194-194v-635c0-137 57-194 194-194h635zM855 171c-44-0-83 22-117 47-91 69-190 208-226 282-36-75-134-214-226-282h-0c-66-49-173-88-173 34 0 24 14 204 22 234 28 102 132 128 224 112-161 27-202 118-114 209 168 172 242-43 260-99 3-10 5-15 5-11 0-4 2 1 5 11 19 55 92 271 260 99 89-91 48-182-114-209 92 16 196-10 224-112 8-29 22-209 22-234-0-25-4-54-24-70-9-7-19-9-31-11z",tool:"M657 298l161-160c3-3 6-8 9-13 10-22 0-47-21-56-11-5-23-9-34-13-67-21-143-18-212 13-75 34-129 95-156 167-24 63-26 133-4 200l-275 275c-26 26-39 60-39 94s13 68 39 94 60 39 94 39 68-13 94-39l275-275c2 1 4 1 6 2 67 21 143 18 212-13 75-34 129-95 156-167s27-153-7-228c-2-4-5-9-9-13-17-17-44-17-60 0l-160 161zM597 239c-16 17-24 38-24 60 0 21 8 43 24 59l69 69c17 17 39 25 60 25 21-0 43-8 59-24l110-110c4 34-1 68-12 99-19 51-58 95-112 119-49 22-103 24-151 9-8-3-17-6-25-9-17-7-35-3-48 9l-295 295c-9 9-22 14-34 14s-24-5-34-14-14-22-14-34 5-24 14-34l295-295c13-13 16-32 9-48-24-54-25-112-5-163s58-95 112-119c36-16 75-22 112-18z",sidebar:"M213 85c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-597c0-35-14-67-38-90s-55-38-90-38zM427 853v-683h384c12 0 22 5 30 13s13 18 13 30v597c0 12-5 22-13 30s-18 13-30 13zM341 171v683h-128c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13z",calendar:"M299 85v43h-85c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-597c0-35-14-67-38-90s-55-38-90-38h-85v-43c0-24-19-43-43-43s-43 19-43 43v43h-256v-43c0-24-19-43-43-43s-43 19-43 43zM853 384h-683v-128c0-12 5-22 13-30s18-13 30-13h85v43c0 24 19 43 43 43s43-19 43-43v-43h256v43c0 24 19 43 43 43s43-19 43-43v-43h85c12 0 22 5 30 13s13 18 13 30zM171 469h683v384c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30z",editDoc:"M469 128h-299c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-299c0-24-19-43-43-43s-43 19-43 43v299c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h299c24 0 43-19 43-43s-19-43-43-43zM759 77l-405 405c-5 5-9 12-11 20l-43 171c-2 6-2 14 0 21 6 23 29 37 52 31l171-43c7-2 14-6 20-11l405-405c26-26 39-60 39-94s-13-68-39-94-60-39-94-39-68 13-94 39zM819 137c9-9 22-14 34-14s24 5 34 14 14 22 14 34-5 24-14 34l-397 397-90 23 23-90z",edit:"M695 98l-576 576c-5 5-9 11-11 19l-64 235c-2 7-2 15 0 22 6 23 30 36 52 30l235-64c7-2 13-6 19-11l576-576c32-32 48-74 48-115s-16-84-48-115-74-48-115-48-84 16-115 48zM755 158c15-15 35-23 55-23s40 8 55 23 23 35 23 55-8 40-23 55l-568 568-152 41 41-152z",web:"M723 469c-9-115-47-228-114-329 67 17 127 53 174 100 60 60 100 140 110 229zM609 884c63-95 104-207 114-329h171c-10 89-50 169-110 229-47 47-107 83-174 100zM301 555c9 115 47 228 114 329-67-17-127-53-174-100-60-60-100-140-110-229zM415 140c-63 95-104 207-114 329h-171c10-89 50-169 110-229 48-47 107-83 174-100zM512 43c0 0 0 0 0 0-130 0-247 53-332 137-85 85-137 202-137 332s53 247 137 332c85 85 202 137 332 137 0 0 0 0 0 0 130-0 247-53 332-137 85-85 137-202 137-332s-53-247-137-332c-85-85-202-137-332-137zM638 555c-11 119-56 229-126 318-74-95-115-206-126-318zM512 151c74 95 115 206 126 318h-251c11-119 56-229 126-318z",info:"M981 512c0-130-53-247-137-332s-202-137-332-137-247 53-332 137-137 202-137 332 53 247 137 332 202 137 332 137 247-53 332-137 137-202 137-332zM896 512c0 106-43 202-112 272s-165 112-272 112-202-43-272-112-112-165-112-272 43-202 112-272 165-112 272-112 202 43 272 112 112 165 112 272zM555 683v-171c0-24-19-43-43-43s-43 19-43 43v171c0 24 19 43 43 43s43-19 43-43zM512 384c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",loading:"M469 85v171c0 24 19 43 43 43s43-19 43-43v-171c0-24-19-43-43-43s-43 19-43 43zM469 768v171c0 24 19 43 43 43s43-19 43-43v-171c0-24-19-43-43-43s-43 19-43 43zM180 241l121 121c17 17 44 17 60 0s17-44 0-60l-121-121c-17-17-44-17-60 0s-17 44 0 60zM663 723l121 121c17 17 44 17 60 0s17-44 0-60l-121-121c-17-17-44-17-60 0s-17 44 0 60zM85 555h171c24 0 43-19 43-43s-19-43-43-43h-171c-24 0-43 19-43 43s19 43 43 43zM768 555h171c24 0 43-19 43-43s-19-43-43-43h-171c-24 0-43 19-43 43s19 43 43 43zM241 844l121-121c17-17 17-44 0-60s-44-17-60 0l-121 121c-17 17-17 44 0 60s44 17 60 0zM723 361l121-121c17-17 17-44 0-60s-44-17-60 0l-121 121c-17 17-17 44 0 60s44 17 60 0z",mail:"M128 338l360 252c15 10 34 10 49 0l360-252v430c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30zM43 255c0 0 0 1 0 1v511c0 35 15 67 38 90s55 38 90 38h683c35 0 67-15 90-38s38-55 38-90v-511c0-0 0-1 0-1-0-35-15-67-38-90-23-23-55-38-90-38h-683c-35 0-67 15-90 38-23 23-37 55-38 90zM891 237l-379 266-379-266c2-4 5-8 8-11 8-8 19-13 30-13h683c12 0 22 5 30 13 3 3 6 7 8 11z",resize:"M175 102l271 271c20 20 20 52 0 72s-52 20-72 0l-271-271v184c0 28-23 51-51 51s-51-23-51-51v-307c0-7 1-14 4-20s6-12 11-17c0-0 0-0 0-0 5-5 10-8 17-11 6-3 13-4 20-4h307c28 0 51 23 51 51s-23 51-51 51h-184zM849 922l-271-271c-20-20-20-52 0-72s52-20 72 0l271 271v-184c0-28 23-51 51-51s51 23 51 51v307c0 28-23 51-51 51h-307c-28 0-51-23-51-51s23-51 51-51h184z",menu:"M128 555h768c24 0 43-19 43-43s-19-43-43-43h-768c-24 0-43 19-43 43s19 43 43 43zM128 299h768c24 0 43-19 43-43s-19-43-43-43h-768c-24 0-43 19-43 43s19 43 43 43zM128 811h768c24 0 43-19 43-43s-19-43-43-43h-768c-24 0-43 19-43 43s19 43 43 43z",message:"M939 640v-427c0-35-14-67-38-90s-55-38-90-38h-597c-35 0-67 14-90 38s-38 55-38 90v683c0 11 4 22 13 30 17 17 44 17 60 0l158-158h494c35 0 67-14 90-38s38-55 38-90zM853 640c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22 5-30 13l-98 98v-580c0-12 5-22 13-30s18-13 30-13h597c12 0 22 5 30 13s13 18 13 30z",blog:{p:["M848 517c0-23 19-42 42-43l1-0c23 0 42 19 43 42l0 1v128c0 35-14 67-37 90l-1 1c-23 23-55 37-89 38l-1 0h-494l-158 158c-17 17-44 17-60 0-8-8-12-19-12-29l-0-1v-683c0-35 14-67 38-90 23-23 55-37 89-38l1-0h299c24 0 43 19 43 43 0 23-19 42-42 43l-1 0h-299c-12 0-22 5-30 12l-0 0c-8 8-12 18-12 29l-0 1v580l98-98c8-8 18-12 29-12l1-0h512c12 0 22-5 30-13 8-8 12-18 12-29l0-1v-128zM797 39l-352 352c-5 5-9 12-11 20l-43 171c-2 6-2 14 0 21 6 23 29 37 52 31l171-43c7-2 14-6 20-11l352-352c26-26 39-60 39-94s-13-68-39-94c-26-26-60-39-94-39s-68 13-94 39zM857 99c9-9 22-14 34-14s24 5 34 14c9 9 14 22 14 34s-5 24-14 34l-344 344-90 23 23-90 344-344z","M292 251h163c24 0 43 19 43 43s-19 43-43 43h-163c-24 0-43-19-43-43s19-43 43-43z","M292 407h67c24 0 43 19 43 43s-19 43-43 43h-67c-24 0-43-19-43-43s19-43 43-43z"]},phone:"M981 722c1-30-10-60-29-83-20-24-48-41-82-46-34-4-72-13-110-28-18-7-38-9-57-7-28 3-56 15-78 36l-31 31c-76-48-143-114-196-196l31-31c14-14 24-31 30-49 9-27 9-57-2-86-12-32-22-70-27-111-4-30-19-57-41-77-23-21-54-33-86-33h-128c-4 0-8 0-12 1-35 3-66 20-87 45s-32 58-29 94c13 131 58 266 137 388 64 103 156 197 269 269 110 72 243 122 388 138 4 0 8 1 12 1 35-0 67-15 90-38s37-55 37-90zM896 722v128c0 12-5 23-12 30s-18 13-30 13c-134-14-254-59-353-124-104-66-186-151-243-243-72-112-113-234-125-351-1-11 3-22 10-31s17-14 29-15l132-0c12-0 22 4 29 11 7 7 12 16 14 26 6 46 17 90 32 129 3 9 3 19 0 28-2 6-6 12-10 17l-54 54c-14 14-16 35-7 51 68 119 164 211 272 272 17 9 38 6 51-7l54-54c7-7 16-11 26-12 6-1 13 0 20 3 44 16 88 27 129 32 10 1 20 7 26 15 6 8 10 18 10 29z",pieChart:"M866 661c-41 98-118 169-209 206s-196 39-294-2-169-118-206-209-39-196 2-294c40-94 113-165 200-202 22-9 31-35 22-56s-35-31-56-22c-106 46-196 132-245 247-50 119-48 248-3 359s133 205 252 256 248 48 359 3 205-133 256-252c9-22-1-47-23-56s-47 1-56 23zM894 469h-339v-339c89 10 169 50 229 110s100 140 110 229zM981 512c0-130-53-247-137-332s-202-137-332-137c-24 0-43 19-43 43v427c0 24 19 43 43 43h427c24 0 43-19 43-43z",search:"M684 677c-1 1-3 2-4 4s-3 3-4 4c-54 52-127 84-207 84-82 0-157-33-211-87s-87-129-87-211 33-157 87-211 129-87 211-87 157 33 211 87 87 129 87 211c0 80-32 153-84 207zM926 866l-157-157c53-66 84-149 84-240 0-106-43-202-112-272s-166-112-272-112-202 43-272 112-112 166-112 272 43 202 112 272 166 112 272 112c91 0 174-31 240-84l157 157c17 17 44 17 60 0s17-44 0-60z",send:"M980 97c2-6 2-13 1-20-1-5-3-10-6-14-3-4-6-8-10-11-5-4-11-6-16-8s-12-1-18-0c-2 0-4 1-5 1l-1 0-852 298c-11 4-20 12-25 23-10 22 0 47 22 56l369 164 164 369c5 10 13 19 25 23 22 8 47-4 54-26l298-852c0-1 1-2 1-3zM460 504l-259-115 575-201zM837 248l-201 575-115-259z",server:"M171 43c-35 0-67 14-90 38s-38 55-38 90v171c0 35 14 67 38 90s55 38 90 38h683c35 0 67-14 90-38s38-55 38-90v-171c0-35-14-67-38-90s-55-38-90-38zM171 128h683c12 0 22 5 30 13s13 18 13 30v171c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30v-171c0-12 5-22 13-30s18-13 30-13zM171 555c-35 0-67 14-90 38s-38 55-38 90v171c0 35 14 67 38 90s55 38 90 38h683c35 0 67-14 90-38s38-55 38-90v-171c0-35-14-67-38-90s-55-38-90-38zM171 640h683c12 0 22 5 30 13s13 18 13 30v171c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30v-171c0-12 5-22 13-30s18-13 30-13zM256 299c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43zM256 811c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",graphUp:"M725 299h153l-302 302-183-183c-17-17-44-17-60 0l-320 320c-17 17-17 44 0 60s44 17 60 0l290-290 183 183c17 17 44 17 60 0l333-333v153c0 24 19 43 43 43s43-19 43-43v-256c0-6-1-11-3-16s-5-10-9-14c-0-0-0-0-0-0-4-4-9-7-14-9-5-2-11-3-16-3h-256c-24 0-43 19-43 43s19 43 43 43z",copy:"M469 341c-35 0-67 14-90 38s-38 55-38 90v384c0 35 14 67 38 90s55 38 90 38h384c35 0 67-14 90-38s38-55 38-90v-384c0-35-14-67-38-90s-55-38-90-38zM469 427h384c12 0 22 5 30 13s13 18 13 30v384c0 12-5 22-13 30s-18 13-30 13h-384c-12 0-22-5-30-13s-13-18-13-30v-384c0-12 5-22 13-30s18-13 30-13zM213 597h-43c-12 0-22-5-30-13s-13-18-13-30v-384c0-12 5-22 13-30s18-13 30-13h384c12 0 22 5 30 13s13 18 13 30v43c0 24 19 43 43 43s43-19 43-43v-43c0-35-14-67-38-90s-55-38-90-38h-384c-35 0-67 14-90 38s-38 55-38 90v384c0 35 14 67 38 90s55 38 90 38h43c24 0 43-19 43-43s-19-43-43-43z",alignCenter:"M128 128h768v86h-768v-86zM298 298h428v86h-428v-86zM128 554v-84h768v84h-768zM128 896v-86h768v86h-768zM298 640h428v86h-428v-86z",alignLeft:"M128 128h768v86h-768v-86zM128 896v-86h768v86h-768zM128 554v-84h768v84h-768zM640 298v86h-512v-86h512zM640 640v86h-512v-86h512z",alignRight:"M128 128h768v86h-768v-86zM384 384v-86h512v86h-512zM128 554v-84h768v84h-768zM384 726v-86h512v86h-512zM128 896v-86h768v86h-768z",fontBold:"M576 662q28 0 46-19t18-45-18-45-46-19h-150v128h150zM426 278v128h128q26 0 45-19t19-45-19-45-45-19h-128zM666 460q92 42 92 146 0 68-45 115t-113 47h-302v-598h268q72 0 121 50t49 122-70 118z",blockOutdent:"M470 554v-84h426v84h-426zM470 384v-86h426v86h-426zM128 128h768v86h-768v-86zM128 896v-86h768v86h-768zM128 512l170-170v340zM470 726v-86h426v86h-426z",blockIndent:"M470 554v-84h426v84h-426zM470 384v-86h426v86h-426zM128 128h768v86h-768v-86zM470 726v-86h426v86h-426zM128 342l170 170-170 170v-340zM128 896v-86h768v86h-768z",fontItalic:"M426 170h342v128h-120l-144 342h94v128h-342v-128h120l144-342h-94v-128z",listBullet:"M298 214h598v84h-598v-84zM298 554v-84h598v84h-598zM298 810v-84h598v84h-598zM170 704q26 0 45 19t19 45-19 45-45 19-45-19-19-45 19-45 45-19zM170 192q26 0 45 18t19 46-19 46-45 18-45-18-19-46 19-46 45-18zM170 448q26 0 45 18t19 46-19 46-45 18-45-18-19-46 19-46 45-18z",listNumber:"M298 554v-84h598v84h-598zM298 810v-84h598v84h-598zM298 214h598v84h-598v-84zM86 470v-44h128v40l-78 88h78v44h-128v-40l76-88h-76zM128 342v-128h-42v-44h84v172h-42zM86 726v-44h128v172h-128v-44h84v-20h-42v-44h42v-20h-84z",fontUnderline:"M214 810h596v86h-596v-86zM512 726q-106 0-181-75t-75-181v-342h106v342q0 62 44 105t106 43 106-43 44-105v-342h106v342q0 106-75 181t-181 75z",airplay:"M213 683h-43c-12 0-22-5-30-13s-13-18-13-30v-427c0-12 5-22 13-30s18-13 30-13h683c12 0 22 5 30 13s13 18 13 30v427c0 12-5 22-13 30s-18 13-30 13h-43c-24 0-43 19-43 43s19 43 43 43h43c35 0 67-14 90-38s38-55 38-90v-427c0-35-14-67-38-90s-55-38-90-38h-683c-35 0-67 14-90 38s-38 55-38 90v427c0 35 14 67 38 90s55 38 90 38h43c24 0 43-19 43-43s-19-43-43-43zM545 613c-1-2-3-4-5-5-18-15-45-13-60 5l-213 256c-6 7-10 17-10 27 0 24 19 43 43 43h427c10 0 19-3 27-10 18-15 21-42 5-60zM512 707l122 147h-244z",bell:"M725 341c0 171 40 278 79 341h-585c39-63 79-170 79-341 0-59 24-112 62-151s92-62 151-62 112 24 151 62 62 92 62 151zM811 341c0-82-33-157-87-211s-129-87-211-87-157 33-211 87-87 129-87 211c0 261-102 343-109 349-19 13-24 39-11 59 8 12 22 19 35 19h768c24 0 43-19 43-43 0-14-7-27-18-35-8-6-110-87-110-349zM549 875c-6 10-15 17-26 20s-22 2-32-4c-7-4-12-9-15-15-12-20-38-28-58-16s-28 38-16 58c11 19 27 35 47 47 31 18 65 21 97 13s60-29 78-59c12-20 5-47-15-58s-47-5-58 15z",bellOff:"M549 875c-6 10-15 17-26 20s-22 2-32-4c-7-4-12-9-15-15-12-20-38-28-58-16s-28 38-16 58c11 19 27 35 47 47 31 18 65 21 97 13s60-29 78-59c12-20 5-47-15-58s-47-5-58 15zM811 340c-0-82-33-156-87-210-54-54-129-88-211-88-62-0-119 19-166 50-19 13-25 40-11 59s40 25 59 11c33-22 73-35 116-36 62 0 115 24 153 63 38 39 62 92 62 150-2 71 7 148 28 225 6 23 30 36 52 30s36-30 30-52c-19-69-27-139-25-201 0-0 0-0 0-1 0-0 0-0 0-0zM298 359l324 324h-403c37-61 76-163 79-324zM13 73l207 207c-5 21-7 42-6 62 0 261-102 343-109 348-19 13-24 39-11 59 8 12 22 19 35 19h580l243 243c17 17 44 17 60 0s17-44 0-60l-939-939c-17-17-44-17-60 0s-17 44 0 60z",bookmark:"M786 931c7 5 15 8 25 8 24 0 43-19 43-43v-683c0-35-14-67-38-90s-55-38-90-38h-427c-35 0-67 14-90 38s-38 55-38 90v683c-0 8 3 17 8 25 14 19 40 24 60 10l274-196zM768 813l-231-165c-15-11-35-10-50 0l-231 165v-600c0-12 5-22 13-30s18-13 30-13h427c12 0 22 5 30 13s13 18 13 30z",camera:"M1024 811v-469c0-35-14-67-38-90s-55-38-90-38h-148l-73-109c-8-12-21-19-35-19h-256c-14 0-27 7-35 19l-73 109h-148c-35 0-67 14-90 38s-38 55-38 90v469c0 35 14 67 38 90s55 38 90 38h768c35 0 67-14 90-38s38-55 38-90zM939 811c0 12-5 22-13 30s-18 13-30 13h-768c-12 0-22-5-30-13s-13-18-13-30v-469c0-12 5-22 13-30s18-13 30-13h171c15 0 28-7 35-19l73-109h210l73 109c8 12 22 19 35 19h171c12 0 22 5 30 13s13 18 13 30zM725 555c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM640 555c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90z",check:"M823 226l-439 439-183-183c-17-17-44-17-60 0s-17 44 0 60l213 213c17 17 44 17 60 0l469-469c17-17 17-44 0-60s-44-17-60 0z",chevronDown:"M226 414l256 256c17 17 44 17 60 0l256-256c17-17 17-44 0-60s-44-17-60 0l-226 226-226-226c-17-17-44-17-60 0s-17 44 0 60z",chevronLeft:"M670 738l-226-226 226-226c17-17 17-44 0-60s-44-17-60 0l-256 256c-17 17-17 44 0 60l256 256c17 17 44 17 60 0s17-44 0-60z",chevronRight:"M414 798l256-256c17-17 17-44 0-60l-256-256c-17-17-44-17-60 0s-17 44 0 60l226 226-226 226c-17 17-17 44 0 60s44 17 60 0z",chevronUp:"M798 610l-256-256c-17-17-44-17-60 0l-256 256c-17 17-17 44 0 60s44 17 60 0l226-226 226 226c17 17 44 17 60 0s17-44 0-60z",code:"M713 798l256-256c17-17 17-44 0-60l-256-256c-17-17-44-17-60 0s-17 44 0 60l226 226-226 226c-17 17-17 44 0 60s44 17 60 0zM311 226l-256 256c-17 17-17 44 0 60l256 256c17 17 44 17 60 0s17-44 0-60l-226-226 226-226c17-17 17-44 0-60s-44-17-60 0z",undo:"M896 853v-299c0-59-24-112-62-151s-92-62-151-62h-409l141-141c17-17 17-44 0-60s-44-17-60 0l-213 213c-4 4-7 9-9 14s-3 11-3 16 1 11 3 16c2 5 5 10 9 14l213 213c17 17 44 17 60 0s17-44 0-60l-141-141h409c35 0 67 14 90 38s38 55 38 90v299c0 24 19 43 43 43s43-19 43-43z",redo:"M213 853v-299c0-35 14-67 38-90s55-38 90-38h409l-141 141c-17 17-17 44 0 60s44 17 60 0l213-213c4-4 7-9 9-14 4-10 4-22 0-33-2-5-5-10-9-14l-213-213c-17-17-44-17-60 0s-17 44 0 60l141 141h-409c-59 0-112 24-151 62s-62 92-62 151v299c0 24 19 43 43 43s43-19 43-43z",crop:"M302 302l381-3c11 0 22 5 30 13s13 18 13 30v384h-384c-12 0-22-5-30-13s-13-18-13-30zM43 304l174-1-3 380c0 36 14 68 38 91s55 38 90 38h384v171c0 24 19 43 43 43s43-19 43-43v-171h171c24 0 43-19 43-43s-19-43-43-43h-171v-384c0-35-14-67-38-90s-55-38-91-38l-380 3 1-174c0-24-19-43-42-43s-43 19-43 42l-2 175-175 2c-24 0-42 19-42 43s19 42 43 42z",database:"M171 213c0 0 0-4 9-12 10-10 29-21 56-31 64-25 163-42 277-42s213 17 277 42c27 11 45 22 56 31 9 8 9 12 9 12 0 0-0 4-9 12-10 10-29 21-56 31-64 25-163 42-277 42s-213-17-277-42c-27-11-45-22-56-31-9-8-9-12-9-12zM853 620v191c-2 4-4 8-9 12-10 10-29 21-56 31-64 25-163 42-276 42s-213-17-276-42c-27-10-45-21-56-31-5-5-8-8-8-10l-0-193c11 5 22 10 33 15 77 30 187 48 307 48s231-18 307-48c12-5 23-10 34-15zM853 321v190c0 0 0 0 0 1-2 4-4 8-9 12-10 10-29 21-56 31-64 25-163 42-276 42s-213-17-276-42c-27-10-45-21-56-31-5-5-8-8-8-10-0-2-0-3-0-5l-0-188c11 5 22 10 34 15 77 30 187 48 308 48s231-18 308-48c12-5 23-10 34-15zM85 213v597c0 2 0 5 0 7 2 28 18 51 37 68 21 19 50 35 82 48 77 30 187 48 307 48s231-18 307-48c32-13 61-28 82-48 18-17 34-40 37-68 0-2 0-5 0-7v-597c0-2-0-5-0-7-2-28-18-51-36-68-21-20-50-35-82-48-77-30-187-48-308-48s-231 18-308 48c-32 13-61 28-82 48-18 17-34 40-36 68-0 2-0 5-0 7z",download:"M853 640v171c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-171c0-24-19-43-43-43s-43 19-43 43v171c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-171c0-24-19-43-43-43s-43 19-43 43zM555 537v-409c0-24-19-43-43-43s-43 19-43 43v409l-141-141c-17-17-44-17-60 0s-17 44 0 60l213 213c4 4 9 7 14 9s11 3 16 3c11 0 22-4 30-13l213-213c17-17 17-44 0-60s-44-17-60 0z",downloadCloud:"M469 512v281l-98-98c-17-17-44-17-60 0s-17 44 0 60l171 171c4 4 9 7 14 9 10 4 22 4 33 0 5-2 10-5 14-9l171-171c17-17 17-44 0-60s-44-17-60 0l-98 98v-281c0-24-19-43-43-43s-43 19-43 43zM915 807c58-41 94-101 105-165s-2-133-43-191c-35-50-85-84-140-99-22-6-46-10-69-10h-22c-31-88-91-158-167-203-85-50-188-68-291-41s-185 92-235 176-68 188-41 291c16 62 46 116 85 159 16 17 43 19 60 3s19-43 3-60c-30-33-53-75-65-123-21-80-7-160 32-226s103-117 183-137 160-7 226 32 117 103 137 183c5 19 22 32 41 32h54c16 0 31 2 47 6 37 10 70 33 93 66 27 39 36 84 29 127s-31 83-70 110c-19 14-24 40-10 59s40 24 59 10z",externalLink:"M725 555v256c0 12-5 22-13 30s-18 13-30 13h-469c-12 0-22-5-30-13s-13-18-13-30v-469c0-12 5-22 13-30s18-13 30-13h256c24 0 43-19 43-43s-19-43-43-43h-256c-35 0-67 14-90 38s-38 55-38 90v469c0 35 14 67 38 90s55 38 90 38h469c35 0 67-14 90-38s38-55 38-90v-256c0-24-19-43-43-43s-43 19-43 43zM457 627l397-397v153c0 24 19 43 43 43s43-19 43-43v-256c0-6-1-11-3-16s-5-10-9-14c-0-0-0-0-0-0-4-4-9-7-14-9-5-2-11-3-16-3h-256c-24 0-43 19-43 43s19 43 43 43h153l-397 397c-17 17-17 44 0 60s44 17 60 0z",eye:"M5 493c-6 12-6 26 0 38 0 0 17 34 48 79 19 28 44 61 75 95 38 42 86 85 142 119 68 42 150 72 243 72s175-30 243-72c56-35 103-78 142-119 31-34 56-67 75-95 31-45 48-79 48-79 6-12 6-26 0-38 0 0-17-34-48-79-19-28-44-61-75-95-38-42-86-85-142-119-68-42-150-72-243-72s-175 30-243 72c-56 35-103 78-142 119-31 34-56 67-75 95-31 45-48 79-48 79zM91 512c7-12 17-29 31-49 17-25 40-55 68-85 34-38 76-75 123-104 58-36 124-59 198-59s141 24 198 59c48 30 89 67 123 104 27 30 50 60 68 85 14 20 24 37 31 49-7 12-17 29-31 49-17 25-40 55-68 85-34 38-76 75-123 104-58 36-124 59-198 59s-141-24-198-59c-48-30-89-67-123-104-27-30-50-60-68-85-14-20-24-37-31-49zM683 512c0-47-19-90-50-121s-74-50-121-50-90 19-121 50-50 74-50 121 19 90 50 121 74 50 121 50 90-19 121-50 50-74 50-121zM597 512c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60 10-45 25-60 37-25 60-25 45 10 60 25 25 37 25 60z",eyeOff:"M432 222c28-6 55-9 79-9 75 0 141 24 199 59 48 30 89 67 123 104 27 30 50 60 68 85 14 20 24 37 31 49-23 41-49 78-76 108-15 18-13 45 5 60s45 13 60-5c35-41 69-90 97-144 6-12 7-26 1-39 0 0-17-34-48-79-19-28-44-61-75-95-38-42-86-85-142-119-68-42-150-72-243-72-31-0-66 3-100 11-23 5-37 28-32 51s28 37 51 32zM428 488l108 108c-8 3-16 4-24 4-22 1-44-7-61-23s-26-38-27-59c-0-10 1-20 4-30zM255 316l109 109c-19 29-27 63-26 97 2 44 20 87 54 119s79 47 122 46c30-1 59-10 85-26l99 99c-59 34-124 51-187 52-74 0-140-24-198-59-48-30-89-67-123-104-27-30-50-60-68-85-14-20-24-37-31-49 45-78 101-144 164-197zM13 73l182 182c-74 63-139 143-190 237-6 12-7 26-1 39 0 0 17 34 48 79 19 28 44 61 75 95 38 42 86 85 142 119 68 42 150 72 244 72 85-1 171-26 248-75l191 191c17 17 44 17 60 0s17-44 0-60l-379-379c-0-0-0-0-0-0l-180-180c-0-0-1-1-1-1l-379-379c-17-17-44-17-60 0s-17 44 0 60z",fastForward:"M597 723v-423l272 211zM128 723v-423l272 211zM112 844l384-299c11-8 16-21 16-33v298c0 24 19 43 43 43 10 0 19-3 26-9l384-299c19-14 22-41 7-60-2-3-5-6-7-7l-384-299c-19-14-45-11-60 7-6 8-9 17-9 26v298c-0-9-3-18-9-26-2-3-5-6-7-7l-384-299c-19-14-45-11-60 7-6 8-9 17-9 26v597c0 24 19 43 43 43 10 0 19-3 26-9z",file:"M750 341h-153v-153zM883 354l-299-299c-4-4-9-7-14-9s-11-3-16-3h-299c-35 0-67 14-90 38s-38 55-38 90v683c0 35 14 67 38 90s55 38 90 38h512c35 0 67-14 90-38s38-55 38-90v-469c0-12-5-22-13-30zM512 128v256c0 24 19 43 43 43h256v427c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22-5-30-13s-13-18-13-30v-683c0-12 5-22 13-30s18-13 30-13z",fileMinus:"M750 299h-110v-110zM883 311l-256-256c-4-4-9-7-14-9s-11-3-16-3h-341c-35 0-67 14-90 38s-38 55-38 90v683c0 35 14 67 38 90s55 38 90 38h512c35 0 67-14 90-38s38-55 38-90v-512c0-12-5-22-13-30zM555 128v213c0 24 19 43 43 43h213v469c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22-5-30-13s-13-18-13-30v-683c0-12 5-22 13-30s18-13 30-13zM384 683h256c24 0 43-19 43-43s-19-43-43-43h-256c-24 0-43 19-43 43s19 43 43 43z",filePlus:"M750 299h-110v-110zM883 311l-256-256c-4-4-9-7-14-9s-11-3-16-3h-341c-35 0-67 14-90 38s-38 55-38 90v683c0 35 14 67 38 90s55 38 90 38h512c35 0 67-14 90-38s38-55 38-90v-512c0-12-5-22-13-30zM555 128v213c0 24 19 43 43 43h213v469c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22-5-30-13s-13-18-13-30v-683c0-12 5-22 13-30s18-13 30-13zM384 683h85v85c0 24 19 43 43 43s43-19 43-43v-85h85c24 0 43-19 43-43s-19-43-43-43h-85v-85c0-24-19-43-43-43s-43 19-43 43v85h-85c-24 0-43 19-43 43s19 43 43 43z",fileText:"M750 299h-110v-110zM883 311l-256-256c-4-4-9-7-14-9s-11-3-16-3h-341c-35 0-67 14-90 38s-38 55-38 90v683c0 35 14 67 38 90s55 38 90 38h512c35 0 67-14 90-38s38-55 38-90v-512c0-12-5-22-13-30zM555 128v213c0 24 19 43 43 43h213v469c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22-5-30-13s-13-18-13-30v-683c0-12 5-22 13-30s18-13 30-13zM683 512h-341c-24 0-43 19-43 43s19 43 43 43h341c24 0 43-19 43-43s-19-43-43-43zM683 683h-341c-24 0-43 19-43 43s19 43 43 43h341c24 0 43-19 43-43s-19-43-43-43zM427 341h-85c-24 0-43 19-43 43s19 43 43 43h85c24 0 43-19 43-43s-19-43-43-43z",filter:"M847 171l-282 333c-6 7-10 17-10 28v295l-85-43v-253c0-10-3-19-10-28l-282-333zM939 85h-853c-24 0-43 19-43 43 0 11 4 20 10 28l331 392v263c0 17 9 31 24 38l171 85c21 11 47 2 57-19 3-6 5-13 4-19v-349l331-392c15-18 13-45-5-60-8-7-18-10-28-10z",flag:"M213 572v-421c19-9 58-23 128-23 55 0 101 18 155 40 53 21 113 46 186 46 55 0 97-7 128-17v421c-19 9-58 23-128 23-55 0-101-18-155-40-53-21-113-46-186-46-55 0-97 7-128 17zM213 939v-276c19-9 58-23 128-23 55 0 101 18 155 40 53 21 113 46 186 46 139 0 192-47 201-55 8-8 13-19 13-30v-512c0-24-19-43-43-43-11 0-22 4-29 12-4 3-42 31-141 31-55 0-101-18-155-40-53-21-113-46-186-46-139 0-192 47-201 55-8 8-13 19-13 30v811c0 24 19 43 43 43s43-19 43-43z",folder:"M981 811v-469c0-35-14-67-38-90s-55-38-90-38h-361l-73-109c-8-12-21-19-35-19h-213c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h683c35 0 67-14 90-38s38-55 38-90zM896 811c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h191l73 109c8 12 22 19 35 19h384c12 0 22 5 30 13s13 18 13 30z",folderMinus:"M981 811v-469c0-35-14-67-38-90s-55-38-90-38h-361l-73-109c-8-12-21-19-35-19h-213c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h683c35 0 67-14 90-38s38-55 38-90zM896 811c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h191l73 109c8 12 22 19 35 19h384c12 0 22 5 30 13s13 18 13 30zM384 640h256c24 0 43-19 43-43s-19-43-43-43h-256c-24 0-43 19-43 43s19 43 43 43z",folderPlus:"M981 811v-469c0-35-14-67-38-90s-55-38-90-38h-361l-73-109c-8-12-21-19-35-19h-213c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h683c35 0 67-14 90-38s38-55 38-90zM896 811c0 12-5 22-13 30s-18 13-30 13h-683c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h191l73 109c8 12 22 19 35 19h384c12 0 22 5 30 13s13 18 13 30zM384 640h85v85c0 24 19 43 43 43s43-19 43-43v-85h85c24 0 43-19 43-43s-19-43-43-43h-85v-85c0-24-19-43-43-43s-43 19-43 43v85h-85c-24 0-43 19-43 43s19 43 43 43z",help:"M981 512c0-130-53-247-137-332s-202-137-332-137-247 53-332 137-137 202-137 332 53 247 137 332 202 137 332 137 247-53 332-137 137-202 137-332zM896 512c0 106-43 202-112 272s-165 112-272 112-202-43-272-112-112-165-112-272 43-202 112-272 165-112 272-112 202 43 272 112 112 165 112 272zM428 398c8-22 24-39 44-49s43-11 65-4c20 7 35 20 45 37 8 13 12 28 12 44 0 7-2 13-5 20-3 7-9 14-16 21-30 30-78 47-78 47-22 7-34 32-27 54s32 34 54 27c0 0 66-22 111-67 12-12 23-26 32-43 9-17 14-37 14-58-0-31-9-61-24-87-20-33-51-60-90-74-44-16-91-12-130 7s-72 53-87 97c-8 22 4 47 26 54s47-4 54-26zM512 768c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",home:"M102 350c-10 8-16 20-16 34v469c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-469c-0-13-6-25-16-34l-384-299c-15-12-37-12-52 0zM683 896v-384c0-24-19-43-43-43h-256c-24 0-43 19-43 43v384h-128c-12 0-22-5-30-13s-13-18-13-30v-448l341-265 341 265v448c0 12-5 22-13 30s-18 13-30 13zM427 896v-341h171v341z",image:"M213 85c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-597c0-35-14-67-38-90s-55-38-90-38zM469 363c0-29-12-56-31-75s-46-31-75-31-56 12-75 31-31 46-31 75 12 56 31 75 46 31 75 31 56-12 75-31 31-46 31-75zM384 363c0 6-2 11-6 15s-9 6-15 6-11-2-15-6-6-9-6-15 2-11 6-15 9-6 15-6 11 2 15 6 6 9 6 15zM316 853l366-366 171 171v153c0 12-5 22-13 30s-18 13-30 13zM853 537l-141-141c-17-17-44-17-60 0l-454 454c-6-2-11-6-15-10-8-8-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h597c12 0 22 5 30 13s13 18 13 30z",layers:"M512 133l331 166-331 166-331-166zM493 47l-427 213c-21 11-30 36-19 57 4 9 11 15 19 19l427 213c12 6 26 6 38 0l427-213c21-11 30-36 19-57-4-9-11-15-19-19l-427-213c-12-6-26-6-38 0zM66 763l427 213c12 6 26 6 38 0l427-213c21-11 30-36 19-57s-36-30-57-19l-408 204-408-204c-21-11-47-2-57 19s-2 47 19 57zM66 550l427 213c12 6 26 6 38 0l427-213c21-11 30-36 19-57s-36-30-57-19l-408 204-408-204c-21-11-47-2-57 19s-2 47 19 57z",link:"M392 580c42 57 104 91 168 100s133-6 190-48c10-8 20-16 28-24l128-128c50-51 73-117 72-183s-27-131-78-180c-50-48-115-72-179-72-64 0-127 24-177 72l-74 73c-17 17-17 44-0 60s44 17 60 0l73-72c33-32 75-48 118-48 43-0 86 16 119 48 34 33 51 76 52 120s-15 88-47 121l-128 128c-5 5-11 11-18 16-38 28-83 38-127 32s-84-29-112-67c-14-19-41-23-60-9s-23 41-9 60zM632 444c-42-57-104-91-168-100s-133 6-190 48c-10 8-20 16-28 24l-128 128c-50 51-73 117-72 183s27 131 78 180c50 48 115 72 179 72 64-0 127-24 177-72l74-74c17-17 17-44 0-60s-44-17-60 0l-72 72c-33 32-75 48-118 48-43 0-86-16-119-48-34-33-51-76-52-120s15-88 47-121l128-128c5-5 11-11 18-16 38-28 83-38 127-32s84 29 112 67c14 19 41 23 60 9s23-41 9-60z",lock:"M213 512h597c12 0 22 5 30 13s13 18 13 30v299c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-299c0-12 5-22 13-30s18-13 30-13zM768 427v-128c0-71-29-135-75-181s-110-75-181-75-135 29-181 75-75 110-75 181v128h-43c-35 0-67 14-90 38s-38 55-38 90v299c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-299c0-35-14-67-38-90s-55-38-90-38zM341 427v-128c0-47 19-90 50-121s74-50 121-50 90 19 121 50 50 74 50 121v128z",logIn:"M640 171h171c12 0 22 5 30 13s13 18 13 30v597c0 12-5 22-13 30s-18 13-30 13h-171c-24 0-43 19-43 43s19 43 43 43h171c35 0 67-14 90-38s38-55 38-90v-597c0-35-14-67-38-90s-55-38-90-38h-171c-24 0-43 19-43 43s19 43 43 43zM537 469h-409c-24 0-43 19-43 43s19 43 43 43h409l-141 141c-17 17-17 44 0 60s44 17 60 0l213-213c4-4 7-9 9-14s3-11 3-16c0-6-1-11-3-16-2-5-5-10-9-14l-213-213c-17-17-44-17-60 0s-17 44 0 60z",logOut:"M384 853h-171c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13h171c24 0 43-19 43-43s-19-43-43-43h-171c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h171c24 0 43-19 43-43s-19-43-43-43zM793 469h-409c-24 0-43 19-43 43s19 43 43 43h409l-141 141c-17 17-17 44 0 60s44 17 60 0l213-213c4-4 7-9 9-14 6-15 3-34-9-47l-213-213c-17-17-44-17-60 0s-17 44 0 60z",map:"M299 159v584l-213 122v-584zM725 865v-584l213-122v584zM663 976c3 2 7 3 11 4 1 0 3 1 4 1s3 0 4 0c-0 0-0 0-0 0s0 0 0 0c7 0 15-2 21-6l1-0 298-170c14-8 21-22 21-37v-683c0-24-19-43-43-43-8 0-15 2-21 6l-279 159-320-160c-4-2-7-3-11-4-1-0-3-1-4-1s-3-0-4-0c0 0 0 0 0 0s0 0-0 0c-7 0-15 2-21 6l-1 0-298 170c-14 8-21 22-22 37v683c0 24 19 43 43 43 8 0 15-2 21-6l279-159zM640 282v587l-256-128v-587z",mapPin:"M939 427c0-118-48-225-125-302s-184-125-302-125-225 48-302 125-125 184-125 302c0 24 2 48 6 72 12 66 38 128 72 184 117 196 325 334 325 334 14 9 33 10 47 0 0 0 208-138 325-334 33-56 60-118 72-184 4-23 6-47 6-72zM853 427c0 19-2 38-5 57-9 53-31 106-61 156-82 137-215 245-272 288-60-39-196-148-279-288-30-50-52-102-61-156-3-19-5-38-5-57 0-94 38-180 100-241s147-100 241-100 180 38 241 100 100 147 100 241zM683 427c0-47-19-90-50-121s-74-50-121-50-90 19-121 50-50 74-50 121 19 90 50 121 74 50 121 50 90-19 121-50 50-74 50-121zM597 427c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60 10-45 25-60 37-25 60-25 45 10 60 25 25 37 25 60z",maximize:"M341 85h-128c-35 0-67 14-90 38s-38 55-38 90v128c0 24 19 43 43 43s43-19 43-43v-128c0-12 5-22 13-30s18-13 30-13h128c24 0 43-19 43-43s-19-43-43-43zM939 341v-128c0-35-14-67-38-90s-55-38-90-38h-128c-24 0-43 19-43 43s19 43 43 43h128c12 0 22 5 30 13s13 18 13 30v128c0 24 19 43 43 43s43-19 43-43zM683 939h128c35 0 67-14 90-38s38-55 38-90v-128c0-24-19-43-43-43s-43 19-43 43v128c0 12-5 22-13 30s-18 13-30 13h-128c-24 0-43 19-43 43s19 43 43 43zM85 683v128c0 35 14 67 38 90s55 38 90 38h128c24 0 43-19 43-43s-19-43-43-43h-128c-12 0-22-5-30-13s-13-18-13-30v-128c0-24-19-43-43-43s-43 19-43 43z",messageCircle:"M939 491v-21c0-1-0-2-0-2-6-100-47-190-113-258-68-71-163-117-269-123-1-0-2-0-2-0h-21c-60-1-123 13-182 43-52 26-98 63-134 108-56 70-90 158-90 254-1 54 11 111 35 165l-76 227c-3 8-3 18 0 27 7 22 32 34 54 27l227-76c49 22 106 35 165 35 59-0 116-13 168-37 82-37 151-101 194-187 27-53 43-116 43-182zM853 491c0 52-12 101-34 142-34 68-89 119-153 148-41 19-87 29-133 29-52 0-101-12-142-34-11-6-23-6-33-3l-162 54 54-162c4-11 3-23-2-33-24-47-34-96-34-142 0-76 26-146 71-201 29-35 65-65 106-86 47-24 96-34 142-34h19c84 5 158 41 212 97 51 53 84 124 89 203z",mic:"M512 85c24 0 45 10 60 25s25 37 25 60v341c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60v-341c0-24 10-45 25-60s37-25 60-25zM512 0c-47 0-90 19-121 50s-50 74-50 121v341c0 47 19 90 50 121s74 50 121 50 90-19 121-50 50-74 50-121v-341c0-47-19-90-50-121s-74-50-121-50zM341 1024h341c24 0 43-19 43-43s-19-43-43-43h-128v-88c77-10 146-45 199-97 62-62 100-147 100-241v-85c0-24-19-43-43-43s-43 19-43 43v85c0 71-29 135-75 181s-110 75-181 75-135-29-181-75-75-110-75-181v-85c0-24-19-43-43-43s-43 19-43 43v85c0 94 38 180 100 241 52 52 121 88 199 97v88h-128c-24 0-43 19-43 43s19 43 43 43z",micOff:"M534 594c-7 2-14 3-22 3-24-0-45-10-60-25-15-15-25-37-25-60v-25zM683 399v-228c0-47-19-90-50-121s-74-50-121-50c-43-0-83 16-113 43-27 24-47 57-54 94-5 23 10 46 33 50s46-10 50-33c4-19 14-35 27-47 15-13 34-21 56-21 24 0 45 10 61 25 15 16 25 37 25 60v228c0 24 19 43 43 43s43-19 43-43zM768 427v85c0 16-1 32-4 45-4 23 11 45 34 50s45-11 50-34c3-19 5-39 5-60v-85c0-24-19-43-43-43s-43 19-43 43zM341 1024h341c24 0 43-19 43-43s-19-43-43-43h-128v-86c62-8 119-31 168-69l229 229c17 17 44 17 60 0s17-44 0-60l-249-249c-2-3-4-7-7-9-3-3-6-5-9-7l-674-674c-17-17-44-17-60 0s-17 44 0 60l329 329v110c0 47 19 90 50 121s74 50 121 50c32-0 61-9 86-24l63 63c-41 30-89 46-137 48-4-1-8-2-13-2-4 0-9 1-13 2-60-3-120-27-167-73-49-48-75-111-77-175-0-5-0-10-0-10v-86c0-24-19-43-43-43s-43 19-43 43v85c0 6 0 13 0 13 3 85 37 169 102 234 55 54 125 86 196 95v86h-128c-24 0-43 19-43 43s19 43 43 43z",minimize:"M299 128v128c0 12-5 22-13 30s-18 13-30 13h-128c-24 0-43 19-43 43s19 43 43 43h128c35 0 67-14 90-38s38-55 38-90v-128c0-24-19-43-43-43s-43 19-43 43zM896 299h-128c-12 0-22-5-30-13s-13-18-13-30v-128c0-24-19-43-43-43s-43 19-43 43v128c0 35 14 67 38 90s55 38 90 38h128c24 0 43-19 43-43s-19-43-43-43zM725 896v-128c0-12 5-22 13-30s18-13 30-13h128c24 0 43-19 43-43s-19-43-43-43h-128c-35 0-67 14-90 38s-38 55-38 90v128c0 24 19 43 43 43s43-19 43-43zM128 725h128c12 0 22 5 30 13s13 18 13 30v128c0 24 19 43 43 43s43-19 43-43v-128c0-35-14-67-38-90s-55-38-90-38h-128c-24 0-43 19-43 43s19 43 43 43z",minus:"M213 555h597c24 0 43-19 43-43s-19-43-43-43h-597c-24 0-43 19-43 43s19 43 43 43z",moon:"M938 550c1-10-2-20-8-29-14-19-41-23-60-9-41 30-88 46-136 50-58 4-118-12-169-49-57-42-91-103-101-168s5-133 47-190c6-8 9-19 8-29-2-23-23-41-47-38-96 9-184 50-252 113-74 69-124 164-134 272-11 117 27 228 97 312s172 141 289 152 228-27 312-97 141-172 152-289zM835 626c-21 58-57 109-103 147-67 56-156 86-250 77s-175-55-231-122-86-156-77-250c8-87 48-163 107-218 33-31 73-55 117-71-19 54-25 111-16 166 13 86 59 168 135 224 67 50 147 71 225 66 32-2 64-9 94-20z",more:"M597 512c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60zM896 512c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60zM299 512c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60z",moreVertical:"M597 512c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60zM597 213c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60zM597 811c0-24-10-45-25-60s-37-25-60-25-45 10-60 25-25 37-25 60 10 45 25 60 37 25 60 25 45-10 60-25 25-37 25-60z",mousePointer:"M207 207l524 218-208 71c-12 4-22 14-27 27l-71 208zM555 615l225 225c17 17 44 17 60 0s17-44 0-60l-225-225 250-85c22-8 34-32 27-54-4-12-13-21-24-26l-724-302c-22-9-47 1-56 23-5 11-4 23 0 33l302 724c9 22 34 32 56 23 12-5 20-14 24-26z",move:"M469 188v281h-281l55-55c17-17 17-44 0-60s-44-17-60 0l-128 128c-8 8-13 18-13 30 0 6 1 11 3 16s5 10 9 14l128 128c17 17 44 17 60 0s17-44 0-60l-55-55h281v281l-55-55c-17-17-44-17-60 0s-17 44 0 60l128 128c4 4 9 7 14 9s11 3 16 3c6 0 11-1 16-3 5-2 10-5 14-9l128-128c17-17 17-44 0-60s-44-17-60 0l-55 55v-281h281l-55 55c-17 17-17 44 0 60s44 17 60 0l128-128c4-4 7-9 9-14 6-15 3-34-9-47l-128-128c-17-17-44-17-60 0s-17 44 0 60l55 55h-281v-281l55 55c17 17 44 17 60 0s17-44 0-60l-128-128c-4-4-9-7-14-9-10-4-22-4-33 0-5 2-10 5-14 9l-128 128c-17 17-17 44 0 60s44 17 60 0z",music:"M341 768c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60 10-45 25-60 37-25 60-25 45 10 60 25 25 37 25 60zM939 683v-555c0-2-0-5-1-7-4-23-26-39-49-35l-512 85c-20 3-36 21-36 42v407c-25-15-54-23-85-23-47 0-90 19-121 50s-50 74-50 121 19 90 50 121 74 50 121 50 90-19 121-50 50-74 50-121v-519l427-71v356c-25-15-54-23-85-23-47 0-90 19-121 50s-50 74-50 121 19 90 50 121 74 50 121 50 90-19 121-50 50-74 50-121zM853 683c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60 10-45 25-60 37-25 60-25 45 10 60 25 25 37 25 60z",paperclip:"M885 441l-392 392c-42 42-96 63-151 63s-109-21-151-63-63-96-63-151 21-109 63-151l392-392c25-25 58-38 91-38s66 13 91 38 38 58 38 91-13 66-38 91l-393 392c-8 8-19 13-30 13s-22-4-30-13-13-19-13-30 4-22 13-30l362-362c17-17 17-44 0-60s-44-17-60-0l-362 362c-25 25-38 58-38 91s13 66 38 91 58 38 91 38 66-13 91-38l393-392c42-42 63-96 63-151s-21-109-63-151-96-63-151-63-109 21-151 63l-392 392c-58 58-88 135-88 211s29 153 88 211 135 88 211 88 153-29 211-88l392-392c17-17 17-44 0-60s-44-17-60 0z",pause:"M256 128c-24 0-43 19-43 43v683c0 24 19 43 43 43h171c24 0 43-19 43-43v-683c0-24-19-43-43-43zM299 213h85v597h-85zM597 128c-24 0-43 19-43 43v683c0 24 19 43 43 43h171c24 0 43-19 43-43v-683c0-24-19-43-43-43zM640 213h85v597h-85z",play:"M236 92c-7-4-15-7-23-7-24 0-43 19-43 43v768c-0 8 2 16 7 23 13 20 39 26 59 13l597-384c5-3 9-7 13-13 13-20 7-46-13-59zM256 206l476 306-476 306z",plus:"M213 555h256v256c0 24 19 43 43 43s43-19 43-43v-256h256c24 0 43-19 43-43s-19-43-43-43h-256v-256c0-24-19-43-43-43s-43 19-43 43v256h-256c-24 0-43 19-43 43s19 43 43 43z",refresh:"M190 398c31-89 96-157 175-194s172-45 261-14c51 18 94 46 127 80l121 113h-148c-24 0-43 19-43 43s19 43 43 43h256c0 0 0 0 1 0 6-0 11-1 16-3 5-2 10-5 14-10 1-1 1-1 2-2 3-4 6-8 7-12s3-9 3-14c0-1 0-1 0-2v-256c0-24-19-43-43-43s-43 19-43 43v157l-125-117c-42-43-97-79-160-101-111-39-228-30-326 17s-179 132-218 243c-8 22 4 47 26 54s47-4 54-26zM85 696l126 118c82 82 192 124 301 124s218-42 302-125c47-47 81-103 101-160 8-22-4-47-26-54s-47 4-54 26c-15 45-42 89-80 127-67 67-154 100-241 100s-175-33-242-101l-119-112h148c24 0 43-19 43-43s-19-43-43-43h-256c-0 0-0 0-1 0-6 0-11 1-16 3-5 2-10 5-14 10-1 1-1 1-2 2-3 4-6 8-7 12s-3 9-3 14c-0 1-0 1-0 2v256c0 24 19 43 43 43s43-19 43-43z",rewind:"M427 723l-272-211 272-211zM912 844c7 6 16 9 26 9 24 0 43-19 43-43v-597c0-9-3-18-9-26-14-19-41-22-60-7l-384 299c-3 2-5 5-7 7-6 8-9 17-9 26v-298c0-9-3-18-9-26-14-19-41-22-60-7l-384 299c-3 2-5 5-7 7-14 19-11 45 7 60l384 299c7 6 16 9 26 9 24 0 43-19 43-43v-298c0 13 6 25 16 33zM896 723l-272-211 272-211z",settings:"M683 512c0-47-19-90-50-121s-74-50-121-50-90 19-121 50-50 74-50 121 19 90 50 121 74 50 121 50 90-19 121-50 50-74 50-121zM597 512c0 24-10 45-25 60s-37 25-60 25-45-10-60-25-25-37-25-60 10-45 25-60 37-25 60-25 45 10 60 25 25 37 25 60zM867 657c2-4 5-8 8-11 5-4 11-6 17-6h4c35 0 67-14 90-38s38-55 38-90-14-67-38-90-55-38-90-38h-7c-5-0-9-1-13-3-5-3-10-7-12-13-0-1-0-3-0-4-1-2-2-5-2-7 1-14 3-19 7-23l3-3c25-25 37-58 37-91s-13-66-38-91c-25-25-58-37-91-37s-66 13-90 38l-2 2c-4 3-8 6-12 7-6 2-12 1-19-1-4-2-8-5-11-8-4-5-6-11-6-17v-4c0-35-14-67-38-90s-55-38-90-38-67 14-90 38-38 55-38 90v7c-0 5-1 9-3 13-3 5-7 10-13 12-1 0-3 0-4 0-2 1-5 2-7 2-14-1-19-3-23-7l-3-3c-25-25-58-37-91-37s-65 13-91 38c-25 25-37 58-37 91s13 66 38 90l2 2c3 4 6 8 7 12 2 6 1 12-1 19-0 1-1 1-1 2-2 5-5 9-8 12-5 4-11 7-16 7h-4c-35 0-67 14-90 38s-38 55-38 91 14 67 38 90 55 38 90 38h7c5 0 9 1 13 3 5 3 10 7 13 14 1 2 2 5 2 7-1 14-3 19-7 23l-3 3c-25 25-37 58-37 91s13 66 38 91c25 25 58 37 91 37s66-13 90-38l2-2c4-3 8-6 12-7 6-2 12-1 19 1 1 0 1 1 2 1 5 2 9 5 12 8 4 5 7 11 7 16v4c0 35 14 67 38 90s55 38 90 38 67-14 90-38 38-55 38-90v-7c0-5 1-9 3-13 3-5 7-10 14-13 2-1 5-2 7-2 14 1 19 3 23 7l3 3c25 25 58 37 91 37s66-13 91-38c25-25 37-58 37-91s-13-66-38-90l-2-2c-3-4-6-8-7-12-2-6-1-12 1-19zM785 397c-1-9-2-13-3-16v3c0 2 0 4 0 5 1 3 2 5 3 8 0 4 0 4 0 4 11 25 29 44 52 56 16 8 33 13 52 13h8c12 0 22 5 30 13s13 18 13 30-5 22-13 30-18 13-30 13h-4c-27 0-52 10-71 26-14 11-25 26-32 42-11 25-12 52-5 76 5 18 15 35 28 48l3 3c8 8 13 19 13 30s-4 22-12 30c-8 8-19 13-30 13s-22-4-30-12l-3-3c-20-19-44-30-70-32-19-2-38 1-55 9-25 11-44 29-55 51-8 16-13 33-13 52v8c0 12-5 22-13 30s-18 12-30 12-22-5-30-13-13-18-13-30v-4c-1-28-11-53-27-72-12-14-28-25-45-32-25-11-51-12-75-5-18 5-35 15-48 28l-3 3c-8 8-19 13-30 13s-22-4-30-12c-8-8-13-19-13-30s4-22 12-30l3-3c19-20 30-44 32-70 2-19-1-38-9-55-11-25-29-44-51-55-16-8-33-13-52-13l-8 0c-12 0-22-5-30-13s-13-18-13-30 5-22 13-30 18-13 30-13h4c28-1 53-11 72-27 14-12 25-28 32-45 11-25 12-51 5-75-5-18-15-35-28-48l-3-3c-8-8-13-19-13-30s4-22 12-30c8-8 19-13 30-13s22 4 30 12l3 3c20 19 44 30 70 32 16 1 32-1 47-6 4-1 8-2 11-3-1 0-3 0-4 0-9 1-13 2-16 3h3c2 0 4-0 5-0 3-1 5-2 8-3 4-0 4-0 4-0 25-11 44-29 56-52 8-16 13-33 13-52v-8c0-12 5-22 13-30s18-13 30-13 22 5 30 13 13 18 13 30v4c0 27 10 52 26 71 11 14 26 25 42 32 25 11 51 12 76 5 18-5 35-15 48-28l3-3c8-8 19-13 30-13s22 4 30 12c8 8 13 19 13 30s-4 22-12 30l-3 3c-19 20-30 44-32 70-1 16 1 32 6 47 1 4 2 8 3 11-0-1-0-3-0-4z",share:"M128 512v341c0 35 14 67 38 90s55 38 90 38h512c35 0 67-14 90-38s38-55 38-90v-341c0-24-19-43-43-43s-43 19-43 43v341c0 12-5 22-13 30s-18 13-30 13h-512c-12 0-22-5-30-13s-13-18-13-30v-341c0-24-19-43-43-43s-43 19-43 43zM469 188v452c0 24 19 43 43 43s43-19 43-43v-452l98 98c17 17 44 17 60 0s17-44 0-60l-171-171c-4-4-9-7-14-9-10-4-22-4-33 0-5 2-10 5-14 9l-171 171c-17 17-17 44 0 60s44 17 60 0z",start:"M784 887c7 6 17 9 27 9 24 0 43-19 43-43v-683c0-9-3-19-9-27-15-18-42-21-60-7l-427 341c-2 2-5 4-7 7-15 18-12 45 7 60zM768 765l-316-253 316-253zM256 811v-597c0-24-19-43-43-43s-43 19-43 43v597c0 24 19 43 43 43s43-19 43-43z",end:"M240 137c-7-6-17-9-27-9-24 0-43 19-43 43v683c-0 9 3 19 9 27 15 18 42 21 60 7l427-341c2-2 5-4 7-7 15-18 12-45-7-60zM256 259l316 253-316 253zM768 213v597c0 24 19 43 43 43s43-19 43-43v-597c0-24-19-43-43-43s-43 19-43 43z",forbidden:"M981 512c0-130-53-247-137-332s-202-137-332-137-247 53-332 137-137 202-137 332 53 247 137 332 202 137 332 137 247-53 332-137 137-202 137-332zM812 752l-540-540c66-53 149-84 240-84 106 0 202 43 272 112s112 165 112 272c0 91-31 174-84 240zM212 272l540 540c-66 53-149 84-240 84-106 0-202-43-272-112s-112-165-112-272c0-91 31-174 84-240z",square:"M213 85c-35 0-67 14-90 38s-38 55-38 90v597c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-597c0-35-14-67-38-90s-55-38-90-38zM213 171h597c12 0 22 5 30 13s13 18 13 30v597c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-597c0-12 5-22 13-30s18-13 30-13z",star:"M550 66c-4-8-11-15-19-19-21-10-47-2-57 19l-122 247-273 40c-9 1-18 5-24 12-16 17-16 44 1 60l197 192-47 271c-2 9-0 18 4 27 11 21 37 29 58 18l244-128 244 128c8 4 17 6 27 4 23-4 39-26 35-49l-47-271 197-192c6-6 11-15 12-24 3-23-13-45-36-48l-273-40-122-247z",sun:"M768 512c0-71-29-135-75-181s-110-75-181-75-135 29-181 75-75 110-75 181 29 135 75 181 110 75 181 75 135-29 181-75 75-110 75-181zM683 512c0 47-19 90-50 121s-74 50-121 50-90-19-121-50-50-74-50-121 19-90 50-121 74-50 121-50 90 19 121 50 50 74 50 121zM469 43v85c0 24 19 43 43 43s43-19 43-43v-85c0-24-19-43-43-43s-43 19-43 43zM469 896v85c0 24 19 43 43 43s43-19 43-43v-85c0-24-19-43-43-43s-43 19-43 43zM150 210l61 61c17 17 44 17 60 0s17-44 0-60l-61-61c-17-17-44-17-60 0s-17 44 0 60zM753 814l61 61c17 17 44 17 60 0s17-44 0-60l-61-61c-17-17-44-17-60 0s-17 44 0 60zM43 555h85c24 0 43-19 43-43s-19-43-43-43h-85c-24 0-43 19-43 43s19 43 43 43zM896 555h85c24 0 43-19 43-43s-19-43-43-43h-85c-24 0-43 19-43 43s19 43 43 43zM210 874l61-61c17-17 17-44 0-60s-44-17-60 0l-61 61c-17 17-17 44 0 60s44 17 60 0zM814 271l61-61c17-17 17-44 0-60s-44-17-60 0l-61 61c-17 17-17 44 0 60s44 17 60 0z",tag:"M909 602c25-25 37-58 37-90 0-33-12-65-37-90l-367-367c-8-8-18-12-30-12h-427c-24 0-43 19-43 43v427c0 11 4 22 13 30l367 366c25 25 58 37 91 37s66-13 90-38zM848 542l-306 306c-8 8-19 13-30 13s-22-4-30-12l-354-354v-366h366l354 354c8 8 12 19 12 30 0 11-4 22-12 30zM299 341c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",terminal:"M201 755l256-256c17-17 17-44 0-60l-256-256c-17-17-44-17-60 0s-17 44 0 60l226 226-226 226c-17 17-17 44 0 60s44 17 60 0zM512 853h341c24 0 43-19 43-43s-19-43-43-43h-341c-24 0-43 19-43 43s19 43 43 43z",thumbsDown:"M469 640c0-24-19-43-43-43h-242c-3-0-7-0-7-0-12-2-21-8-28-17s-10-20-8-32l59-384c2-10 7-19 14-26 8-7 18-11 29-11h439v418l-154 346c-13-4-25-11-34-21-15-15-25-37-25-60zM384 683v128c0 47 19 90 50 121s74 50 121 50c17 0 32-10 39-25l171-384c3-6 4-12 4-17v-469c0-24-19-43-43-43h-481c-33-0-63 12-86 33-22 19-37 46-41 76l-59 384c-5 35 4 69 23 95s49 45 84 51c7 1 14 2 21 1zM725 128h114c15-0 29 5 39 14 9 8 16 19 18 32v290c-2 15-9 27-19 36-10 8-23 13-37 13l-115 0c-24 0-43 19-43 43s19 43 43 43h113c35 1 67-12 92-32 27-22 45-53 50-90 0-2 0-4 0-6v-299c0-2-0-4-0-6-5-34-22-64-46-86-26-23-60-37-96-36h-114c-24 0-43 19-43 43s19 43 43 43z",thumbsUp:"M555 384c0 24 19 43 43 43h242c3 0 7 0 7 0 12 2 21 8 28 17s10 20 8 32l-59 384c-2 10-7 19-14 26-8 7-18 11-29 11h-439v-418l154-346c13 4 25 11 34 21 15 15 25 37 25 60zM640 341v-128c0-47-19-90-50-121s-74-50-121-50c-17 0-32 10-39 25l-171 384c-3 6-4 12-4 17v469c0 24 19 43 43 43h481c33 0 63-12 86-33 22-19 37-46 41-76l59-384c5-35-4-69-23-95s-49-45-84-51c-7-1-14-2-21-1zM299 896h-128c-12 0-22-5-30-13s-13-18-13-30v-299c0-12 5-22 13-30s18-13 30-13h128c24 0 43-19 43-43s-19-43-43-43h-128c-35 0-67 14-90 38s-38 55-38 90v299c0 35 14 67 38 90s55 38 90 38h128c24 0 43-19 43-43s-19-43-43-43z",trash:"M768 299v555c0 12-5 22-13 30s-18 13-30 13h-427c-12 0-22-5-30-13s-13-18-13-30v-555zM725 213v-43c0-35-14-67-38-90s-55-38-90-38h-171c-35 0-67 14-90 38s-38 55-38 90v43h-171c-24 0-43 19-43 43s19 43 43 43h43v555c0 35 14 67 38 90s55 38 90 38h427c35 0 67-14 90-38s38-55 38-90v-555h43c24 0 43-19 43-43s-19-43-43-43zM384 213v-43c0-12 5-22 13-30s18-13 30-13h171c12 0 22 5 30 13s13 18 13 30v43z",unlock:"M213 512h597c12 0 22 5 30 13s13 18 13 30v299c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-299c0-12 5-22 13-30s18-13 30-13zM341 427v-128c-0-47 19-90 50-121 31-31 73-50 120-50 44 0 83 16 113 43 27 24 47 57 55 94 5 23 27 38 50 33s38-27 33-50c-12-56-41-105-82-141-45-40-105-64-170-64-71 0-135 29-181 75s-75 110-75 181v128h-43c-35 0-67 14-90 38s-38 55-38 90v299c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-299c0-35-14-67-38-90s-55-38-90-38z",upload:"M853 640v171c0 12-5 22-13 30s-18 13-30 13h-597c-12 0-22-5-30-13s-13-18-13-30v-171c0-24-19-43-43-43s-43 19-43 43v171c0 35 14 67 38 90s55 38 90 38h597c35 0 67-14 90-38s38-55 38-90v-171c0-24-19-43-43-43s-43 19-43 43zM469 231v409c0 24 19 43 43 43s43-19 43-43v-409l141 141c17 17 44 17 60 0s17-44 0-60l-213-213c-4-4-9-7-14-9-10-4-22-4-33 0-5 2-10 5-14 9l-213 213c-17 17-17 44 0 60s44 17 60 0z",uploadCloud:"M469 615v281c0 24 19 43 43 43s43-19 43-43v-281l98 98c17 17 44 17 60 0s17-44 0-60l-171-171c-4-4-9-7-14-9s-11-3-16-3c-11 0-22 4-30 13l-171 171c-17 17-17 44 0 60s44 17 60 0zM890 822c62-34 105-90 123-152s13-133-21-195c-29-53-74-92-126-114-31-13-64-20-98-20h-22c-31-88-91-158-167-203-85-50-188-67-291-41s-185 92-235 177-67 188-41 291c16 61 46 116 84 158 16 18 43 19 60 3s19-43 3-60c-29-33-53-75-65-123-21-80-7-160 32-226s103-117 183-138 160-7 226 32 117 103 138 183c5 19 22 32 41 32h53c23 0 45 5 66 13 35 14 65 40 84 76 23 41 26 88 14 130s-41 79-82 102c-21 11-28 37-17 58s37 28 58 17z",user:"M896 896v-85c0-59-24-112-62-151s-92-62-151-62h-341c-59 0-112 24-151 62s-62 92-62 151v85c0 24 19 43 43 43s43-19 43-43v-85c0-35 14-67 38-90s55-38 90-38h341c35 0 67 14 90 38s38 55 38 90v85c0 24 19 43 43 43s43-19 43-43zM725 299c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM640 299c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90z",userMinus:"M725 896v-85c0-59-24-112-62-151s-92-62-151-62h-299c-59 0-112 24-151 62s-62 92-62 151v85c0 24 19 43 43 43s43-19 43-43v-85c0-35 14-67 38-90s55-38 90-38h299c35 0 67 14 90 38s38 55 38 90v85c0 24 19 43 43 43s43-19 43-43zM576 299c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM491 299c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90zM981 427h-256c-24 0-43 19-43 43s19 43 43 43h256c24 0 43-19 43-43s-19-43-43-43z",userPlus:"M725 896v-85c0-59-24-112-62-151s-92-62-151-62h-299c-59 0-112 24-151 62s-62 92-62 151v85c0 24 19 43 43 43s43-19 43-43v-85c0-35 14-67 38-90s55-38 90-38h299c35 0 67 14 90 38s38 55 38 90v85c0 24 19 43 43 43s43-19 43-43zM576 299c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM491 299c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90zM981 427h-85v-85c0-24-19-43-43-43s-43 19-43 43v85h-85c-24 0-43 19-43 43s19 43 43 43h85v85c0 24 19 43 43 43s43-19 43-43v-85h85c24 0 43-19 43-43s-19-43-43-43z",userX:"M725 896v-85c0-59-24-112-62-151s-92-62-151-62h-299c-59 0-112 24-151 62s-62 92-62 151v85c0 24 19 43 43 43s43-19 43-43v-85c0-35 14-67 38-90s55-38 90-38h299c35 0 67 14 90 38s38 55 38 90v85c0 24 19 43 43 43s43-19 43-43zM576 299c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM491 299c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90zM951 311l-77 77-77-77c-17-17-44-17-60 0s-17 44 0 60l77 77-77 77c-17 17-17 44 0 60s44 17 60 0l77-77 77 77c17 17 44 17 60 0s17-44 0-60l-77-77 77-77c17-17 17-44 0-60s-44-17-60 0z",users:"M768 896v-85c0-59-24-112-62-151s-92-62-151-62h-341c-59 0-112 24-151 62s-62 92-62 151v85c0 24 19 43 43 43s43-19 43-43v-85c0-35 14-67 38-90s55-38 90-38h341c35 0 67 14 90 38s38 55 38 90v85c0 24 19 43 43 43s43-19 43-43zM597 299c0-59-24-112-62-151s-92-62-151-62-112 24-151 62-62 92-62 151 24 112 62 151 92 62 151 62 112-24 151-62 62-92 62-151zM512 299c0 35-14 67-38 90s-55 38-90 38-67-14-90-38-38-55-38-90 14-67 38-90 55-38 90-38 67 14 90 38 38 55 38 90zM1024 896v-85c-0-53-19-102-52-139-28-32-65-56-108-67-23-6-46 8-52 30s8 46 30 52c26 7 48 21 65 41 19 22 31 51 31 83v85c0 24 19 43 43 43s43-19 43-43zM672 175c34 9 62 31 78 59s23 63 14 97c-8 29-25 54-47 70-13 10-29 17-45 22-23 6-36 29-30 52s29 36 52 30c27-7 53-19 75-36 38-28 66-69 79-118 15-57 5-115-23-162s-74-83-131-98c-23-6-46 8-52 31s8 46 31 52z",video:"M939 382v261l-183-130zM128 171c-35 0-67 14-90 38s-38 55-38 90v427c0 35 14 67 38 90s55 38 90 38h469c35 0 67-14 90-38s38-55 38-90v-130l231 165c19 14 46 9 60-10 5-8 8-16 8-25v-427c0-24-19-43-43-43-9 0-18 3-25 8l-231 165v-130c0-35-14-67-38-90s-55-38-90-38zM128 256h469c12 0 22 5 30 13s13 18 13 30v427c0 12-5 22-13 30s-18 13-30 13h-469c-12 0-22-5-30-13s-13-18-13-30v-427c0-12 5-22 13-30s18-13 30-13z",videoOff:"M455 256h143c12 0 22 5 30 13s13 18 13 30v143c0 12 5 22 13 30l43 43c15 15 38 17 55 4l188-136v343c0 24 19 43 43 43s43-19 43-43v-427c0-9-3-17-8-25-14-19-40-23-60-10l-227 164-4-4v-125c0-35-14-67-38-90s-55-38-90-38h-143c-24 0-43 19-43 43s19 43 43 43zM196 256l444 444v25c0 12-5 22-13 30s-18 13-30 13h-469c-12 0-22-5-30-13s-13-18-13-30v-427c0-12 5-22 13-30s18-13 30-13zM13 73l99 99c-29 4-54 17-74 36-23 23-38 55-38 90v427c0 35 14 67 38 90s55 38 90 38h469c35 0 67-14 90-38 11-11 21-25 27-40l236 236c17 17 44 17 60 0s17-44 0-60l-939-939c-17-17-44-17-60 0s-17 44 0 60z",volume:"M427 302v420l-144-115c-7-6-17-9-27-9h-128v-171h128c9 0 19-3 27-9zM443 180l-202 161h-156c-24 0-43 19-43 43v256c0 24 19 43 43 43h156l202 161c18 15 45 12 60-7 6-8 9-17 9-27v-597c0-24-19-43-43-43-10 0-19 4-27 9z",volumeLow:"M427 302v420l-144-115c-7-6-17-9-27-9h-128v-171h128c9 0 19-3 27-9zM443 180l-202 161h-156c-24 0-43 19-43 43v256c0 24 19 43 43 43h156l202 161c18 15 45 12 60-7 6-8 9-17 9-27v-597c0-24-19-43-43-43-10 0-19 4-27 9zM633 391c33 33 50 77 50 121s-17 87-50 121c-17 17-17 44 0 60s44 17 60 0c50-50 75-116 75-181s-25-131-75-181c-17-17-44-17-60 0s-17 44 0 60z",volumeHigh:"M427 302v420l-144-115c-7-6-17-9-27-9h-128v-171h128c9 0 19-3 27-9zM443 180l-202 161h-156c-24 0-43 19-43 43v256c0 24 19 43 43 43h156l202 161c18 15 45 12 60-7 6-8 9-17 9-27v-597c0-24-19-43-43-43-10 0-19 4-27 9zM783 241c75 75 112 173 112 272 0 98-37 196-112 271-17 17-17 44 0 60s44 17 60 0c92-92 137-212 137-332 0-120-46-240-137-332-17-17-44-17-60 0s-17 44 0 60zM633 391c33 33 50 77 50 121s-17 87-50 121c-17 17-17 44 0 60s44 17 60 0c50-50 75-116 75-181s-25-131-75-181c-17-17-44-17-60 0s-17 44 0 60z",volumeOff:"M427 302v420l-144-115c-7-6-17-9-27-9h-128v-171h128c9 0 19-3 27-9zM443 180l-202 161h-156c-24 0-43 19-43 43v256c0 24 19 43 43 43h156l202 161c18 15 45 12 60-7 6-8 9-17 9-27v-597c0-24-19-43-43-43-10 0-19 4-27 9zM695 414l98 98-98 98c-17 17-17 44 0 60s44 17 60 0l98-98 98 98c17 17 44 17 60 0s17-44 0-60l-98-98 98-98c17-17 17-44 0-60s-44-17-60 0l-98 98-98-98c-17-17-44-17-60 0s-17 44 0 60z",wifi:"M241 568c84-70 186-102 287-98 92 3 184 36 259 98 18 15 45 12 60-6s12-45-6-60c-90-74-199-114-310-118-121-4-245 34-345 118-18 15-21 42-5 60s42 21 60 5zM89 416c125-110 282-163 437-159 147 3 293 57 410 160 18 16 45 14 60-4s14-45-4-60c-133-116-298-177-464-181-176-4-353 56-495 181-18 16-19 43-4 60s43 19 60 4zM389 722c42-30 92-42 140-39 38 3 75 16 108 39 19 14 46 9 59-10s9-46-10-59c-45-31-97-50-150-54-67-5-137 12-196 54-19 14-24 40-10 59s40 24 59 10zM512 896c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",wifiOff:"M695 510c34 16 64 37 88 57 18 15 45 13 60-4s13-45-4-60c-30-26-67-50-106-70-21-10-47-2-57 20s-2 47 20 57zM460 258c172-14 333 41 456 142 6 5 12 10 18 16 18 16 45 14 60-4s14-45-4-60c-7-6-14-12-21-18-140-114-323-177-517-161-23 2-41 22-39 46s22 41 46 39zM389 722c42-30 92-42 140-39 38 3 75 16 108 39 10 7 22 9 33 7l282 282c17 17 44 17 60 0s17-44 0-60l-544-544c-2-3-5-5-7-7l-387-387c-17-17-44-17-60 0s-17 44 0 60l174 174c-54 27-106 62-155 105-18 16-19 43-4 60s43 19 60 4c51-45 107-80 162-105l99 99c-58 19-114 50-164 92-18 15-20 42-5 60s42 20 60 5c54-45 116-75 179-88l119 119c-1-0-2-0-3-0-67-5-137 12-196 54-19 14-24 40-10 59s40 24 59 10zM512 896c24 0 43-19 43-43s-19-43-43-43-43 19-43 43 19 43 43 43z",x:"M226 286l226 226-226 226c-17 17-17 44 0 60s44 17 60 0l226-226 226 226c17 17 44 17 60 0s17-44 0-60l-226-226 226-226c17-17 17-44 0-60s-44-17-60 0l-226 226-226-226c-17-17-44-17-60 0s-17 44 0 60z",zoomIn:"M684 677c-1 1-3 2-4 4s-3 3-4 4c-54 52-127 84-207 84-82 0-157-33-211-87s-87-129-87-211 33-157 87-211 129-87 211-87 157 33 211 87 87 129 87 211c0 80-32 153-84 207zM926 866l-157-157c53-66 84-149 84-240 0-106-43-202-112-272s-166-112-272-112-202 43-272 112-112 166-112 272 43 202 112 272 166 112 272 112c91 0 174-31 240-84l157 157c17 17 44 17 60 0s17-44 0-60zM341 512h85v85c0 24 19 43 43 43s43-19 43-43v-85h85c24 0 43-19 43-43s-19-43-43-43h-85v-85c0-24-19-43-43-43s-43 19-43 43v85h-85c-24 0-43 19-43 43s19 43 43 43z",zoomOut:"M684 677c-1 1-3 2-4 4s-3 3-4 4c-54 52-127 84-207 84-82 0-157-33-211-87s-87-129-87-211 33-157 87-211 129-87 211-87 157 33 211 87 87 129 87 211c0 80-32 153-84 207zM926 866l-157-157c53-66 84-149 84-240 0-106-43-202-112-272s-166-112-272-112-202 43-272 112-112 166-112 272 43 202 112 272 166 112 272 112c91 0 174-31 240-84l157 157c17 17 44 17 60 0s17-44 0-60zM341 512h256c24 0 43-19 43-43s-19-43-43-43h-256c-24 0-43 19-43 43s19 43 43 43z",discord:{p:["M1145 86c-81-38-174-68-272-85l-7-1c-11 19-23 43-34 68l-2 5c-46-7-100-12-155-12s-108 4-160 12l6-1c-13-29-25-53-38-76l2 4c-105 18-198 48-286 89l7-3c-176 261-224 516-200 766v0c98 73 211 131 334 169l8 2c26-34 50-73 71-113l2-5c-45-17-83-35-119-57l3 2c10-7 19-14 28-21 100 48 218 76 342 76s242-28 347-78l-5 2c9 8 19 15 28 21-33 20-71 38-111 53l-5 2c23 45 47 84 75 120l-2-2c131-40 244-99 345-174l-3 2c28-291-48-543-201-767zM451 698c-67 0-122-60-122-135s53-135 121-135 123 61 122 135-54 135-122 135zM900 698c-67 0-122-60-122-135s53-135 122-135 123 61 121 135-54 135-121 135z"],w:1351},tiktok:"M535 1c56-1 111-0 167-1 3 65 27 132 75 178 48 47 115 69 181 76v172c-61-2-123-15-179-41-24-11-47-25-69-40-0 125 0 249-1 373-3 60-23 119-58 168-56 82-153 135-252 137-61 3-122-13-174-44-86-51-147-144-156-244-1-21-1-43-0-64 8-81 48-159 110-212 71-61 170-91 262-73 1 63-2 126-2 189-42-14-92-10-129 16-27 17-47 44-58 75-9 22-6 46-6 69 10 70 78 129 149 122 48-0 93-28 118-69 8-14 17-29 17-45 4-76 3-152 3-229 0-172-0-343 1-515z",xrColor:{p:["M801 116c-0-0-1-0-1-0-473 0-734 64-734 396 0 254 135 396 349 396s279-164 385-164c0 0 1-0 1-0 0 0 1 0 1 0 107 0 172 164 385 164s349-142 349-396c0-332-261-396-734-396-0 0-1 0-1 0 0 0-0 0-0 0z","M482 822c147-18 199-134 280-134 0 0 1-0 1-0 0 0 1 0 1 0 14 0 26 3 39 9 13-5 25-9 39-9 0 0 1-0 1-0 0 0 1 0 1 0 81 0 134 116 280 134 153-17 247-132 247-325 0-266-202-324-568-327-367 4-568 62-568 327 0 193 95 308 247 325z","M482 822c13 1 27 2 41 2 149-0 211-97 280-127-13-5-25-9-39-9-0 0-1-0-1-0-0 0-1 0-1 0-81 0-134 116-280 134z","M803 169c13-0 26-0 39-0 0 0 1 0 1 0 0 0 0 0 0 0 0-0 1-0 1-0 392 0 607 53 607 328 0 210-112 328-289 328-13-0-26-1-38-2 153-17 247-132 247-325 0-266-202-324-568-327 0 0 0 0 0 0z","M803 697c69 30 130 127 280 127 14 0 28-1 41-2-147-18-199-134-280-134-0 0-1-0-1-0-0 0-1 0-1 0-14 0-26 3-39 9z","M482 822c-12 1-25 2-38 2-177 0-289-118-289-328 0-275 216-328 607-328 0 0 1 0 1 0 0 0 0 0 0 0 0-0 1-0 1-0 13 0 26 0 39 0-367 4-568 62-568 327 0 193 95 308 247 325z","M929 246c0 0 6 0 6 0 18 7 11 3 22 12 3 3 3 3 14 14 0 0 308 308 308 308 12 12 12 12 14 14 16 16 16 43 0 60-16 16-43 16-60 0 0 0-337-337-337-337-16-16-16-43 0-60 10-10 18-11 32-12z","M801 245c23 0 42 19 42 42 0 336 0 223 0 337 0 23-19 42-42 42-23 0-42-19-42-42 0 0 0-337 0-337 0-23 19-42 42-42z","M346 246c18 7 11 3 22 12 0 0 139 139 139 139s124-124 124-124c12-12 12-12 14-14 10-10 18-11 32-12 0 0 6 0 6 0 18 7 11 3 22 12 16 16 16 43 0 60-3 3-3 3-14 14 0 0-124 124-124 124s139 139 139 139c16 16 16 43 0 60-16 16-43 16-60 0 0 0-139-139-139-139s-65 65-65 65c0 0-60 60-60 60-12 12-12 12-14 14-16 16-43 16-60 0-16-16-16-43 0-60 3-3 3-3 14-14 0 0 124-124 124-124s-139-139-139-139c-16-16-16-43 0-60 10-10 18-11 32-12 0 0 6 0 6 0z"],c:["rgb(0, 0, 0)","rgb(251, 237, 33)","rgb(140, 198, 63)","rgb(140, 198, 63)","rgb(255, 28, 36)","rgb(255, 28, 36)","rgb(61, 168, 244)","rgb(140, 198, 63)","rgb(255, 28, 36)"],w:1600},blueprint:{p:["M0 194c0-137 57-194 194-194 0 0 635 0 635 0 137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194 0 0 0-635 0-635z","M629 498c13 0 24 11 24 24 0 0 0 122 0 122 0 140-114 254-254 254-140 0-254-114-254-254 0 0 0-122 0-122 0-13 11-24 24-24 0 0 79 0 79 0 13 0 24 11 24 24 0 0 0 122 0 122 0 70 57 127 127 127 70 0 127-57 127-127 0 0 0-122 0-122 0-13 11-24 24-24 0 0 79 0 79 0z","M789 881c-13 0-24-11-24-24 0 0 0-335 0-335 0-13 11-24 24-24 0 0 79 0 79 0 13 0 24 11 24 24 0 0 0 335 0 335 0 13-11 24-24 24 0 0-79 0-79 0z","M182 131c13 5 8 2 16 9 0 0 102 102 102 102s91-91 91-91c9-9 9-9 11-11 8-7 13-8 23-9 0 0 4 0 4 0 13 5 8 2 16 9 12 12 12 32 0 44-2 2-2 2-11 11 0 0-91 91-91 91s102 102 102 102c12 12 12 32 0 44-12 12-32 12-44 0 0 0-102-102-102-102s-48 48-48 48c0 0-44 44-44 44-9 9-9 9-11 11-12 12-32 12-44 0-12-12-12-32 0-44 2-2 2-2 11-11 0 0 91-91 91-91s-102-102-102-102c-12-12-12-32 0-44 8-7 13-8 23-9 0 0 4 0 4 0z","M516 131c17 0 31 14 31 31 0 247 0 164 0 248 0 17-14 31-31 31-17 0-31-14-31-31 0 0 0-248 0-248 0-17 14-31 31-31z","M611 131c0 0 4 0 4 0 13 5 8 2 16 9 2 2 2 2 11 11 0 0 226 226 226 226 9 9 9 9 11 11 12 12 12 32 0 44-12 12-32 12-44 0 0 0-248-248-248-248-12-12-12-32 0-44 8-7 13-8 23-9z","M700 953c-22-45-26-53-46-94-2-4-8-5-12-2-21 20-42 40-63 60-5 4-12 1-12-5 0 0 0-323 0-323 0-6 7-9 12-6 84 65 169 129 253 194 5 4 3 12-3 13-28 5-57 10-85 15-5 1-7 6-5 10 21 43 42 86 63 130 2 4 0 8-3 10 0 0-72 37-72 37-4 2-8 0-10-3 0 0-17-35-17-35zM652 812c3-2 7-2 8 1 0 0 69 142 69 142 1 3 4 4 7 2 10-5 20-10 29-15 3-1 4-4 2-7-23-47-46-95-70-142-2-3 0-7 4-7 0 0 68-12 68-12 4-1 6-6 2-9-57-44-114-87-171-131-3-3-8-0-8 4 0 0 0 217 0 217 0 5 5 7 9 4 13-13 16-15 34-32 0 0 16-15 16-15z"],c:["rgb(78, 143, 234)","rgb(199, 219, 246)","rgb(199, 219, 246)","rgb(199, 219, 246)","rgb(199, 219, 246)","rgb(199, 219, 246)","rgb(255, 255, 255)"]},xinie:{p:["M0 194c0-137 57-194 194-194 0 0 635 0 635 0 137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194 0 0 0-635 0-635z","M927 741c0 12-10 22-22 22-174 0-116 0-175 0-12 0-22-10-22-22s10-22 22-22c0 0 175 0 175 0 12 0 22 10 22 22z","M927 916c0 12-10 22-22 22-174 0-116 0-175 0-12 0-22-10-22-22s10-22 22-22c0 0 175 0 175 0 12 0 22 10 22 22z","M927 828c0 12-10 22-22 22-174 0-116 0-175 0-12 0-22-10-22-22s10-22 22-22c0 0 175 0 175 0 12 0 22 10 22 22z","M664 719c12 0 22 10 22 22 0 174 0 116 0 175 0 12-10 22-22 22s-22-10-22-22c0 0 0-175 0-175 0-12 10-22 22-22z","M426 719c0 0 3 0 3 0 9 4 6 1 11 6 1 1 1 1 8 8 0 0 160 160 160 160 6 6 6 6 8 8 9 9 9 22 0 31-9 9-22 9-31 0 0 0-175-175-175-175-9-9-9-22 0-31 5-5 9-6 16-6z","M359 719c12 0 22 10 22 22 0 174 0 116 0 175 0 12-10 22-22 22-12 0-22-10-22-22 0 0 0-175 0-175 0-12 10-22 22-22z","M123 719c9 4 6 1 11 6 0 0 72 72 72 72s64-64 64-64c6-6 6-6 8-8 5-5 9-6 16-6 0 0 3 0 3 0 9 4 6 1 11 6 9 9 9 22 0 31-1 1-1 1-8 8 0 0-64 64-64 64s72 72 72 72c9 9 9 22 0 31-9 9-22 9-31 0 0 0-72-72-72-72s-34 34-34 34c0 0-31 31-31 31-6 6-6 6-8 8-9 9-22 9-31 0s-9-22 0-31c1-1 1-1 8-8 0 0 64-64 64-64s-72-72-72-72c-9-9-9-22 0-31 5-5 9-6 16-6 0 0 3 0 3 0z","M640 714c0 0-18-8-30-25-12-17-6-28-6-28s-22 18-9 36c13 18 46 17 46 17z","M621 636c0 0 64-20 64 4 0 14-11 27-29 27s-45-20-45-32c-0-12 9-24 9-24s-23 10-22 25c1 16 11 36 58 36 27 0 49-6 49-31 0-18-20-23-40-23-20 0-43 18-43 18z","M672 614z","M540 306c0 0 61-120 61-120s-3 31 1 77c1 12 3 21 6 28 0 0-68 15-68 15z","M624 85c0 0 12-19 57-20s80 36 81 74c1 38-15 56-15 86 0 30 54 39 54 39s-42 47-80 47c-26 0-53-44-54-81-0-37 29-60 33-94 6-49-76-52-76-52z","M593 63c29 14 35 61 14 105-21 44-62 68-91 54-29-14-35-61-14-105s62-68 91-54z","M477 335c0 0-42 137-123 139-81 2-58-118-66-125-8-8-40-26-40-26s71 26 93 19c22-7 26-16 26-16s-50 111 6 108c56-3 104-98 104-98z","M710 290c0 0 48 28 46 67-1 25-114 61-115 93-2 32 29 38 47 37 18-0 37-9 37-9s-63 10-64-18c-2-42 152-9 151-78s-101-92-101-92z","M624 81z","M493 324c0 0-40 150 7 210 83 106 205 40 205 40s-102 9-99-70c3-110 96-228 96-228s-209 47-209 47z","M716 568c0 0 63-31 26-55-42-27-86 29-86 29s39-27 60-12c21 15 0 38 0 38z","M267 238c16-7 39-8 59-3 0 0 107 30 107 30 21 6 23 14 7 21 0 0-83 38-83 38-16 7-39 8-59 3 0 0-107-30-107-30-21-6-23-14-7-21 0 0 83-38 83-38z","M267 198c16-7 39-8 59-3 0 0 107 30 107 30 21 6 23 14 7 21 0 0-83 38-83 38-16 7-39 8-59 3 0 0-107-30-107-30-21-6-23-14-7-21 0 0 83-38 83-38z","M267 159c16-7 39-8 59-3 0 0 107 30 107 30 21 6 23 14 7 21 0 0-83 38-83 38-16 7-39 8-59 3 0 0-107-30-107-30-21-6-23-14-7-21 0 0 83-38 83-38z"],c:["rgb(63, 63, 63)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(255, 147, 28)","rgb(61, 168, 244)","rgb(140, 198, 63)","rgb(255, 28, 35)","rgb(255, 147, 28)","rgb(255, 147, 28)","rgb(170, 170, 170)","rgb(251, 237, 33)","rgb(255, 147, 28)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(0, 242, 35)","rgb(251, 237, 33)","rgb(255, 147, 28)","rgb(253, 28, 35)","rgb(138, 196, 63)","rgb(61, 167, 242)"]},xinjsUiColor:{p:["M0 194c0-137 57-194 194-194 0 0 635 0 635 0 137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194 0 0 0-635 0-635z","M629 498c13 0 24 11 24 24 0 0 0 122 0 122 0 140-114 254-254 254-140 0-254-114-254-254 0 0 0-122 0-122 0-13 11-24 24-24 0 0 79 0 79 0 13 0 24 11 24 24 0 0 0 122 0 122 0 70 57 127 127 127 70 0 127-57 127-127 0 0 0-122 0-122 0-13 11-24 24-24 0 0 79 0 79 0z","M789 881c-13 0-24-11-24-24 0 0 0-335 0-335 0-13 11-24 24-24 0 0 79 0 79 0 13 0 24 11 24 24 0 0 0 335 0 335 0 13-11 24-24 24 0 0-79 0-79 0z","M182 131c13 5 8 2 16 9 0 0 102 102 102 102s91-91 91-91c9-9 9-9 11-11 8-7 13-8 23-9 0 0 4 0 4 0 13 5 8 2 16 9 12 12 12 32 0 44-2 2-2 2-11 11 0 0-91 91-91 91s102 102 102 102c12 12 12 32 0 44-12 12-32 12-44 0 0 0-102-102-102-102s-48 48-48 48c0 0-44 44-44 44-9 9-9 9-11 11-12 12-32 12-44 0-12-12-12-32 0-44 2-2 2-2 11-11 0 0 91-91 91-91s-102-102-102-102c-12-12-12-32 0-44 8-7 13-8 23-9 0 0 4 0 4 0z","M516 131c17 0 31 14 31 31 0 247 0 164 0 248 0 17-14 31-31 31-17 0-31-14-31-31 0 0 0-248 0-248 0-17 14-31 31-31z","M611 131c0 0 4 0 4 0 13 5 8 2 16 9 2 2 2 2 11 11 0 0 226 226 226 226 9 9 9 9 11 11 12 12 12 32 0 44-12 12-32 12-44 0 0 0-248-248-248-248-12-12-12-32 0-44 8-7 13-8 23-9z","M700 953c-22-45-26-53-46-94-2-4-8-5-12-2-21 20-42 40-63 60-5 4-12 1-12-5 0-108 0-215 0-323 0-6 7-9 12-6 84 65 169 129 253 194 5 4 3 12-3 13-28 5-57 10-85 15-5 1-7 6-5 10 21 43 42 86 63 130 2 4 0 8-3 10-24 12-48 25-72 37-4 2-8 0-10-3 0 0-17-35-17-35z","M652 812c3-2 7-2 8 1 23 47 46 95 69 142 1 3 4 4 7 2 10-5 20-10 29-15 3-1 4-4 2-7-23-47-46-95-70-142-2-3 0-7 4-7 23-4 45-8 68-12 4-1 6-6 2-9-57-44-114-87-171-131-3-3-8-0-8 4 0 72 0 145 0 217 0 5 5 7 9 4 13-13 16-15 34-32 0 0 16-15 16-15z"],c:["rgb(80, 80, 80)","rgb(255, 147, 29)","rgb(251, 237, 33)","rgb(255, 28, 36)","rgb(140, 198, 63)","rgb(61, 168, 244)","rgb(255, 255, 255)","rgb(0, 0, 0)"]},xinjsUi:{p:["M830 0c137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194v-635c0-137 57-194 194-194h635zM248 498h-79c-13 0-24 11-24 24v122c0 140 114 254 254 254 65 0 124-24 168-64v79c0 6 8 10 12 5l63-60c4-3 9-2 12 2 20 40 24 49 46 94 0 0 17 35 17 35 2 4 6 5 10 3 0 0 72-37 72-37 4-2 5-6 3-10-21-43-42-86-63-130-2-4 1-9 5-10 7-1 14-2 21-4v55c0 13 11 24 24 24h79c13 0 24-11 24-24v-335c0-13-11-24-24-24h-79c-13 0-24 11-24 24v204l-112-86v-118c0-13-11-24-24-24h-79c-13 0-24 11-24 24v122c0 70-57 127-127 127-70 0-127-57-127-127v-122c0-13-11-24-24-24zM516 131c-17 0-31 14-31 31v248c0 17 14 31 31 31 17 0 31-14 31-31 0-83 0-1 0-248 0-17-14-31-31-31zM425 131c-10 0-16 1-23 9-2 2-2 2-11 11 0 0-91 91-91 91s-102-102-102-102c-8-7-3-3-16-9 0 0-4-0-4-0-10 0-16 1-23 9-12 12-12 32 0 44 0 0 102 102 102 102-31 31-62 62-93 93-3 3-6 6-9 9-12 12-12 32 0 44 12 12 32 12 44 0 2-2 2-2 11-11 0 0 44-44 44-44s48-48 48-48c0 0 102 102 102 102 12 12 32 12 44 0 12-12 12-32 0-44 0 0-102-102-102-102s91-91 91-91c9-9 9-9 11-11 12-12 12-32 0-44-8-7-3-3-16-9 0 0-4-0-4-0zM611 131c-10 0-16 1-23 9-12 12-12 32 0 44 0 0 248 248 248 248 12 12 32 12 44 0 12-12 12-32 0-44-2-2-2-2-11-11 0 0-222-227-222-227-9-9-13-8-15-10-8-7-3-3-16-9 0 0-4-0-4-0z","M652 812c3-2 7-2 8 1 23 47 46 95 69 142 1 3 4 4 7 2 10-5 20-10 29-15 3-1 4-4 2-7-23-47-46-95-70-142-2-3 0-7 4-7 23-4 45-8 68-12 4-1 6-6 2-9-57-44-114-87-171-131-3-3-8-0-8 4 0 72 0 145 0 217 0 5 5 7 9 4 13-13 16-15 34-32 0 0 16-15 16-15z"]},cmy:{p:["M302 442c-11-27-17-56-17-86 0-126 103-229 229-229s229 103 229 229c0 31-6 60-17 87-12-2-24-3-37-3-72 0-136 33-178 85-42-52-106-85-178-85-11 0-21 1-32 2z","M478 582c-80-13-146-67-175-140 10-1 21-2 32-2 72 0 136 33 178 85-14 17-26 37-34 58z","M512 813c-42 52-106 85-178 85-126 0-229-103-229-229 0-116 86-211 197-227 30 73 96 127 175 140-11 27-17 56-17 87 0 55 19 105 51 144z","M547 582c-10 1-21 2-32 2-13 0-25-1-37-3 9-21 20-40 34-58 14 18 26 37 35 58 0 0 0 0 0 0z","M478 582c-11 27-17 56-17 87 0 55 19 105 51 144 32-39 51-90 51-144 0-30-6-59-17-86-10 1-21 2-32 2-13 0-25-1-37-3z","M547 582c82-11 150-66 180-140-12-2-24-3-37-3-72 0-136 33-178 85 14 18 26 37 35 58 0 0 0 0 0 0z","M512 813c42 52 106 85 178 85 126 0 229-103 229-229 0-114-83-208-192-226-30 74-98 129-180 140 11 27 17 56 17 86 0 55-19 105-51 144 0 0 0 0 0 0z"],c:["rgb(86, 206, 255)","rgb(20, 248, 0)","rgb(249, 255, 44)","rgb(0, 0, 0)","rgb(252, 0, 0)","rgb(1, 6, 255)","rgb(241, 76, 255)"]},rgb:{p:["M302 442c-11-27-17-56-17-86 0-126 103-229 229-229s229 103 229 229c0 31-6 60-17 87-12-2-24-3-37-3-72 0-136 33-178 85-42-52-106-85-178-85-11 0-21 1-32 2z","M478 582c-80-13-146-67-175-140 10-1 21-2 32-2 72 0 136 33 178 85-14 17-26 37-34 58z","M512 813c-42 52-106 85-178 85-126 0-229-103-229-229 0-116 86-211 197-227 30 73 96 127 175 140-11 27-17 56-17 87 0 55 19 105 51 144z","M547 582c-10 1-21 2-32 2-13 0-25-1-37-3 9-21 20-40 34-58 14 18 26 37 35 58 0 0 0 0 0 0z","M478 582c-11 27-17 56-17 87 0 55 19 105 51 144 32-39 51-90 51-144 0-30-6-59-17-86-10 1-21 2-32 2-13 0-25-1-37-3z","M547 582c82-11 150-66 180-140-12-2-24-3-37-3-72 0-136 33-178 85 14 18 26 37 35 58 0 0 0 0 0 0z","M512 813c42 52 106 85 178 85 126 0 229-103 229-229 0-114-83-208-192-226-30 74-98 129-180 140 11 27 17 56 17 86 0 55-19 105-51 144 0 0 0 0 0 0z"],c:["rgb(248, 14, 0)","rgb(253, 0, 255)","rgb(44, 131, 255)","rgb(255, 255, 255)","rgb(0, 219, 255)","rgb(250, 255, 0)","rgb(0, 204, 3)"]},xinjsColor:{p:["M0 194c0-137 57-194 194-194 0 0 635 0 635 0 137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194 0 0 0-635 0-635z","M126 302c8 3 5 1 10 6 0 0 66 66 66 66s59-59 59-59c6-6 6-6 7-7 5-5 9-5 15-6 0 0 3 0 3 0 8 3 5 1 10 6 8 8 8 21 0 28-1 1-1 1-7 7 0 0-59 59-59 59s66 66 66 66c8 8 8 21 0 28-8 8-21 8-28 0 0 0-66-66-66-66s-31 31-31 31c0 0-28 28-28 28-6 6-6 6-7 7-8 8-21 8-28 0-8-8-8-21 0-28 1-1 1-1 7-7 0 0 59-59 59-59s-66-66-66-66c-8-8-8-21 0-28 5-5 9-5 15-6 0 0 3 0 3 0z","M404 302c0 0 3 0 3 0 8 3 5 1 10 6 1 1 1 1 7 7 0 0 147 147 147 147 6 6 6 6 7 7 8 8 8 21 0 28-8 8-21 8-28 0 0 0-161-161-161-161-8-8-8-21 0-28 5-5 9-5 15-6z","M343 301c11 0 20 9 20 20 0 160 0 106 0 161 0 11-9 20-20 20-11 0-20-9-20-20 0 0 0-161 0-161 0-11 9-20 20-20z","M674 462c11 0 20 9 20 20 0 0 0 221 0 221 0 11-9 20-20 20s-20-9-20-20c0 0 0-221 0-221 0-11 9-20 20-20zM674 472c-6 0-10 4-10 10 0 0 0 221 0 221 0 6 4 10 10 10 6 0 10-4 10-10 0 0 0-221 0-221-0-6-3-8-8-10 0 0-2-0-2-0z","M404 302c0 0 3 0 3 0 8 3 5 1 10 6 1 1 1 1 7 7 0 0 147 147 147 147 6 6 6 6 7 7 8 8 8 21 0 28-8 8-21 8-28 0 0 0-161-161-161-161-8-8-8-21 0-28 5-5 9-5 15-6z","M284 522c0 0 3 0 3 0 8 3 5 1 10 6 8 8 8 21 0 28-1 1-2 2-3 3 0 0-39 39-39 39s-1 1-1 1c0 0-22 22-22 22s-2 2-2 2c0 0 66 66 66 66 8 8 8 21 0 28-8 8-21 8-28 0-1-1-1-1-7-7 0 0-59-59-59-59s-27 27-27 27c-4 4-7 7-11 11 0 0-29 29-29 29-8 8-21 8-28 0-8-8-8-21 0-28 0 0 66-66 66-66s-59-59-59-59c-2-2-4-4-6-6 0 0-0-0-0-0-8-8-8-21 0-28 5-5 9-5 15-6 0 0 3 0 3 0 8 3 5 1 10 6 0 0 66 66 66 66 22-22 44-44 66-66 5-5 9-5 15-6zM284 532c-4 0-6 0-8 3-6 6-11 11-22 22 0 0-0 0-0 0-22 22-32 32-44 44-4 4-10 4-14-0 0 0-66-66-66-66-1-1-1-1-2-2-1-0-2-1-4-1 0 0-1-0-1-0-4 0-6 0-8 3-4 4-4 10 0 14 0 0 0 0 0 0s-0-0-0-0c2 2 5 5 6 6 0 0 59 59 59 59 4 4 4 10 0 14 0 0-66 66-66 66-4 4-4 10 0 14 4 4 10 4 14 0 0 0 29-29 29-29 1-1 3-3 5-5 3-3 4-4 6-6 0 0 27-27 27-27 4-4 10-4 14-0 0 0 59 59 59 59 5 5 3 3 6 6 1 1 0 0 1 1 4 4 10 4 14 0 4-4 4-10-0-14 0 0-66-66-66-66-4-4-4-10-0-14 0 0 2-2 2-2s22-22 22-22c0 0 1-1 1-1s39-39 39-39c1-1 1-1 3-3 4-4 4-10 0-14-1-0-1-1-2-1-1-0-2-1-4-1 0 0-1-0-1-0z","M343 522c11 0 20 9 20 20 0 0 0 161 0 161 0 11-9 20-20 20-11 0-20-9-20-20 0 0 0-161 0-161 0-11 9-20 20-20zM343 532c-6 0-10 4-10 10 0 0 0 161 0 161 0 6 4 10 10 10 6 0 10-4 10-10 0 0 0-161 0-161 0-6-4-10-10-10z","M564 522c0 0 3 0 3 0 8 3 5 1 10 6 8 8 8 21 0 28-1 1-1 1-7 7-51 51-102 102-154 154-8 8-21 8-28 0-8-8-8-21 0-28 1-1 2-2 3-3 52-53 105-105 158-158 5-5 9-5 15-6zM565 532c-4 0-6 0-8 3-0 0-0 0-1 1 0 0 0 0 0 0-1 1-1 1-6 6 0 0-147 147-147 147-5 5-6 6-6 6 0 0 0 0 0 0-0 0-0 0-1 1-4 4-4 10 0 14 4 4 10 4 14 0 0-0 0-0 1-1 2-2 4-4 6-6 0 0 147-147 147-147s2-2 2-2c0 0 5-5 5-5 4-4 4-10 0-14-1-0-1-1-2-1-1-0-2-1-4-1 0 0-1-0-1-0z","M343 522c11 0 20 9 20 20 0 0 0 161 0 161 0 11-9 20-20 20-11 0-20-9-20-20 0 0 0-161 0-161 0-11 9-20 20-20zM343 532c-6 0-10 4-10 10 0 0 0 161 0 161 0 6 4 10 10 10 6 0 10-4 10-10 0 0 0-161 0-161 0-6-4-10-10-10z","M564 522c0 0 3 0 3 0 8 3 5 1 10 6 8 8 8 21 0 28-1 1-1 1-7 7-51 51-102 102-154 154-8 8-21 8-28 0-8-8-8-21 0-28 1-1 2-2 3-3 52-53 105-105 158-158 5-5 9-5 15-6zM565 532c-4 0-6 0-8 3-0 0-0 0-1 1 0 0 0 0 0 0-1 1-1 1-6 6 0 0-147 147-147 147-5 5-6 6-6 6 0 0 0 0 0 0-0 0-0 0-1 1-4 4-4 10 0 14 4 4 10 4 14 0 0-0 0-0 1-1 2-2 4-4 6-6 0 0 147-147 147-147s2-2 2-2c0 0 5-5 5-5 4-4 4-10 0-14-1-0-1-1-2-1-1-0-2-1-4-1 0 0-1-0-1-0z","M704 301c11 0 20 9 20 20 0 0 0 140 0 140 0 5-2 10-6 14 0 0-20 20-20 20-4 4-9 6-14 6 0 0-60 0-60 0-11 0-20-9-20-20 0-11 9-20 20-20 0 0 52 0 52 0s8-8 8-8c0 0 0-132 0-132 0-11 9-20 20-20z","M902 462c11 0 20 9 20 20 0 11-9 20-20 20 0 0-138 0-138 0-11 0-20-9-20-20 0-11 9-20 20-20 0 0 138 0 138 0z","M902 532c11 0 20 9 20 20 0 11-9 20-20 20 0 0-138 0-138 0-11 0-20-9-20-20 0-11 9-20 20-20 0 0 138 0 138 0zM902 542c0 0-138 0-138 0-6 0-10 4-10 10s4 10 10 10c0 0 138 0 138 0 6 0 10-4 10-10s-4-10-10-10z","M902 392c11 0 20 9 20 20 0 11-9 20-20 20 0 0-138 0-138 0-11 0-20-9-20-20 0-11 9-20 20-20 0 0 138 0 138 0z","M903 302c0 0 3 0 3 0 8 3 5 1 10 6 8 8 8 21 0 28 0 0-20 20-20 20-4 4-9 6-14 6 0 0-118 0-118 0-11 0-20-9-20-20 0-11 9-20 20-20 0 0 109 0 109 0s14-14 14-14c5-5 9-5 15-6z","M902 602c11 0 20 9 20 20 0 0 0 60 0 60 0 5-2 10-6 14 0 0-20 20-20 20-4 4-9 6-14 6 0 0-118 0-118 0-11 0-20-9-20-20 0 0 0-80 0-80 0-11 9-20 20-20 0 0 138 0 138 0zM902 612c0 0-138 0-138 0-6 0-10 4-10 10 0 0 0 80 0 80 0 6 4 10 10 10 0 0 118 0 118 0 3 0 5-1 7-3 0 0 20-20 20-20 2-2 3-4 3-7 0 0 0-60 0-60 0-6-4-10-10-10zM882 632c6 0 10 4 10 10 0 0 0 32 0 32 0 3-1 5-3 7 0 0-8 8-8 8-2 2-4 3-7 3 0 0-89 0-89 0-6 0-10-4-10-10 0 0 0-40 0-40 0-6 4-10 10-10 0 0 98 0 98 0zM882 642c0 0-98 0-98 0s0 40 0 40c0 0 89 0 89 0s8-8 8-8c0 0 0-32 0-32z"],c:["rgb(80, 80, 80)","rgb(255, 28, 36)","rgb(8, 131, 87)","rgb(140, 198, 63)","rgb(255, 147, 29)","rgb(61, 168, 244)","rgb(255, 28, 36)","rgb(8, 131, 87)","rgb(8, 131, 87)","rgb(140, 198, 63)","rgb(61, 168, 244)","rgb(255, 147, 29)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(251, 237, 33)","rgb(251, 237, 33)"]},xinColor:{p:["M0 194c0-137 57-194 194-194 0 0 635 0 635 0 137 0 194 57 194 194 0 0 0 635 0 635 0 137-57 194-194 194 0 0-635 0-635 0-137 0-194-57-194-194 0 0 0-635 0-635z","M178 180c13 5 8 2 16 9 0 0 104 104 104 104s93-93 93-93c9-9 9-9 11-11 8-8 14-8 24-9 0 0 5 0 5 0 13 5 8 2 16 9 12 12 12 32 0 45-2 2-2 2-11 11 0 0-93 93-93 93s104 104 104 104c12 12 12 32 0 45-12 12-32 12-45 0 0 0-104-104-104-104s-49 49-49 49c0 0-45 45-45 45-9 9-9 9-11 11-12 12-32 12-45 0-12-12-12-32 0-45 2-2 2-2 11-11 0 0 93-93 93-93s-104-104-104-104c-12-12-12-32 0-45 8-8 14-8 24-9 0 0 5 0 5 0z","M617 180c0 0 5 0 5 0 13 5 8 2 16 9 2 2 2 2 11 11 0 0 232 232 232 232 9 9 9 9 11 11 12 12 12 32 0 45-12 12-32 12-45 0 0 0-253-253-253-253-12-12-12-32 0-45 8-8 14-8 24-9z","M520 179c17 0 32 14 32 32 0 253 0 168 0 253 0 17-14 32-32 32-17 0-32-14-32-32 0 0 0-253 0-253 0-17 14-32 32-32z","M617 180c0 0 5 0 5 0 13 5 8 2 16 9 2 2 2 2 11 11 0 0 232 232 232 232 9 9 9 9 11 11 12 12 12 32 0 45-12 12-32 12-45 0 0 0-253-253-253-253-12-12-12-32 0-45 8-8 14-8 24-9z","M426 528c0 0 5 0 5 0 13 5 8 2 16 9 12 12 12 32 0 45-1 1-3 3-4 4 0 0-62 62-62 62s-2 2-2 2c0 0-34 34-34 34s-3 3-3 3c0 0 104 104 104 104 12 12 12 32 0 45-12 12-32 12-45 0-2-2-2-2-11-11 0 0-94-94-94-94s-42 42-42 42c-6 6-11 11-17 17 0 0-45 45-45 45-12 12-32 12-45 0-12-12-12-32 0-45 0 0 104-104 104-104s-93-93-93-93c-3-3-7-7-10-10 0 0-1-1-1-1-12-12-12-32 0-45 8-8 14-8 24-9 0 0 5 0 5 0 13 5 8 2 16 9 0 0 104 104 104 104 35-35 70-70 104-104 8-8 14-8 24-9zM427 544c-6 0-9 0-13 4-10 10-17 17-35 35 0 0-0 0-0 0-35 35-50 50-69 69-6 6-16 6-22-0 0 0-104-104-104-104-1-1-2-2-3-2-2-1-4-1-6-2 0 0-1-0-1-0-6 0-9 0-13 4-6 6-6 16 0 22 0 0 1 1 1 1s-0-0-0-0c4 4 7 7 10 10 0 0 93 93 93 93 6 6 6 16 0 22 0 0-104 104-104 104-6 6-6 16 0 22 6 6 16 6 22 0 0 0 45-45 45-45 2-2 4-4 8-8 4-4 6-6 9-9 0 0 42-42 42-42 6-6 16-6 22-0 0 0 94 94 94 94 8 8 5 5 9 9 1 1 1 1 2 2 6 6 16 6 22 0 6-6 6-16-0-22 0 0-104-104-104-104-6-6-6-16-0-22 0 0 3-3 3-3s34-34 34-34c0 0 2-2 2-2s62-62 62-62c2-2 2-2 4-4 6-7 6-15 0-22-1-1-2-1-3-2-2-1-4-1-6-2 0 0-1-0-1-0z","M520 528c17 0 32 14 32 32 0 0 0 253 0 253 0 17-14 32-32 32-17 0-32-14-32-32 0 0 0-253 0-253 0-17 14-32 32-32zM520 544c-9 0-16 7-16 16 0 0 0 253 0 253 0 9 7 16 16 16s16-7 16-16c0 0 0-253 0-253 0-9-7-16-16-16z","M870 528c0 0 5 0 5 0 13 5 8 2 16 9 12 12 12 32 0 45-2 2-2 2-11 11-81 81-162 162-243 243-12 12-32 12-45 0-12-12-12-32 0-45 1-1 3-3 4-4 83-84 166-166 249-249 8-8 14-8 24-9zM870 544c-6 0-9 0-13 4-1 1-1 1-1 1 0 0 0 0 0 0-1 1-2 2-10 10 0 0-232 232-232 232-8 8-9 9-10 10 0 0 0 0 0 0-0 0-0 0-1 1-6 6-6 16 0 22 6 6 16 6 22 0 1-1 1-1 1-1 3-3 7-7 10-10 0 0 232-232 232-232s3-3 3-3c0 0 8-8 8-8 6-7 6-15 0-22-1-1-2-1-3-2-2-1-4-1-6-2 0 0-1-0-1-0z","M520 528c17 0 32 14 32 32 0 0 0 253 0 253 0 17-14 32-32 32-17 0-32-14-32-32 0 0 0-253 0-253 0-17 14-32 32-32zM520 544c-9 0-16 7-16 16 0 0 0 253 0 253 0 9 7 16 16 16s16-7 16-16c0 0 0-253 0-253 0-9-7-16-16-16z","M870 528c0 0 5 0 5 0 13 5 8 2 16 9 12 12 12 32 0 45-2 2-2 2-11 11-81 81-162 162-243 243-12 12-32 12-45 0-12-12-12-32 0-45 1-1 3-3 4-4 83-84 166-166 249-249 8-8 14-8 24-9zM870 544c-6 0-9 0-13 4-1 1-1 1-1 1 0 0 0 0 0 0-1 1-2 2-10 10 0 0-232 232-232 232-8 8-9 9-10 10 0 0 0 0 0 0-0 0-0 0-1 1-6 6-6 16 0 22 6 6 16 6 22 0 1-1 1-1 1-1 3-3 7-7 10-10 0 0 232-232 232-232s3-3 3-3c0 0 8-8 8-8 6-7 6-15 0-22-1-1-2-1-3-2-2-1-4-1-6-2 0 0-1-0-1-0z"],c:["rgb(80, 80, 80)","rgb(255, 28, 36)","rgb(8, 131, 87)","rgb(140, 198, 63)","rgb(61, 168, 244)","rgb(255, 28, 36)","rgb(8, 131, 87)","rgb(8, 131, 87)","rgb(140, 198, 63)","rgb(61, 168, 244)"]},sortDescending:"M723 469c-256 0-179 0-435 0-24 0-43 19-43 43s19 43 43 43c256 0 179 0 435 0 24 0 43-19 43-43s-19-43-43-43zM603 725c-256 0 61 0-195 0-24 0-43 19-43 43s19 43 43 43c256 0-61 0 195 0 24 0 43-19 43-43s-19-43-43-43zM856 213c-256 0-432 0-688 0-24 0-43 19-43 43s19 43 43 43c256 0 432 0 688 0 24 0 43-19 43-43s-19-43-43-43z",sortAscending:"M301 555c256 0 179 0 435 0 24 0 43-19 43-43s-19-43-43-43c-256 0-179 0-435 0-24 0-43 19-43 43s19 43 43 43zM421 299c256 0-61 0 195 0 24 0 43-19 43-43s-19-43-43-43c-256 0 61 0-195 0-24 0-43 19-43 43s19 43 43 43zM168 811c256 0 432 0 688 0 24 0 43-19 43-43s-19-43-43-43c-256 0-432 0-688 0-24 0-43 19-43 43s19 43 43 43z",instagram:{p:["M512 92c137 0 153 1 207 3 50 2 77 11 95 18 24 9 41 20 59 38 18 18 29 35 38 59 7 18 15 45 18 95 2 54 3 70 3 207s-1 153-3 207c-2 50-11 77-18 95-9 24-20 41-38 59-18 18-35 29-59 38-18 7-45 15-95 18-54 2-70 3-207 3s-153-1-207-3c-50-2-77-11-95-18-24-9-41-20-59-38-18-18-29-35-38-59-7-18-15-45-18-95-2-54-3-70-3-207s1-153 3-207c2-50 11-77 18-95 9-24 20-41 38-59 18-18 35-29 59-38 18-7 45-15 95-18 54-2 70-3 207-3zM512 0c-139 0-156 1-211 3-54 2-92 11-124 24-34 13-62 31-91 59-29 28-46 57-59 91-13 33-21 70-24 124-2 55-3 72-3 211s1 156 3 211c2 54 11 92 24 124 13 34 31 62 59 91 28 28 57 46 91 59 33 13 70 21 124 24 55 2 72 3 211 3s156-1 211-3c54-2 92-11 124-24 34-13 62-31 91-59s46-57 59-91c13-33 21-70 24-124 2-55 3-72 3-211s-1-156-3-211c-2-54-11-92-24-124-13-34-30-63-59-91-28-28-57-46-91-59-33-13-70-21-124-24-55-3-72-3-211-3v0z","M512 249c-145 0-263 118-263 263s118 263 263 263 263-118 263-263c0-145-118-263-263-263zM512 683c-94 0-171-76-171-171s76-171 171-171c94 0 171 76 171 171s-76 171-171 171z","M847 239c0 34-27 61-61 61s-61-27-61-61c0-34 27-61 61-61s61 27 61 61z"]},linkedin:"M928 0h-832c-53 0-96 43-96 96v832c0 53 43 96 96 96h832c53 0 96-43 96-96v-832c0-53-43-96-96-96zM384 832h-128v-448h128v448zM320 320c-35 0-64-29-64-64s29-64 64-64c35 0 64 29 64 64s-29 64-64 64zM832 832h-128v-256c0-35-29-64-64-64s-64 29-64 64v256h-128v-448h128v79c26-36 67-79 112-79 80 0 144 72 144 160v288z",eyedropper:"M987 37c-50-50-131-50-181 0l-172 172-121-121-136 136 106 106-472 472c-8 8-11 19-10 29h-0v160c0 18 14 32 32 32h160c0 0 3 0 4 0 9 0 18-4 25-11l472-472 106 106 136-136-121-121 172-172c50-50 50-131 0-181zM173 960h-109v-109l470-470 109 109-470 470z",heart:{p:["M1088 358c0 86-37 164-96 218h0l-320 320c-32 32-64 64-96 64s-64-32-96-64l-320-320c-59-54-96-131-96-218 0-162 132-294 294-294 86 0 164 37 218 96 54-59 131-96 218-96 162 0 294 132 294 294z"],w:1152},facebook:"M928 0h-832c-53 0-96 43-96 96v832c0 53 43 96 96 96h416v-448h-128v-128h128v-64c0-106 86-192 192-192h128v128h-128c-35 0-64 29-64 64v64h192l-32 128h-160v448h288c53 0 96-43 96-96v-832c0-53-43-96-96-96z",twitter:"M1024 226c-38 17-78 28-121 33 43-26 77-67 92-116-41 24-86 42-133 51-38-41-93-66-153-66-116 0-210 94-210 210 0 16 2 32 5 48-175-9-329-92-433-220-18 31-28 67-28 106 0 73 37 137 93 175-34-1-67-11-95-26 0 1 0 2 0 3 0 102 72 187 169 206-18 5-36 7-55 7-14 0-27-1-40-4 27 83 104 144 196 146-72 56-162 90-261 90-17 0-34-1-50-3 93 60 204 94 322 94 386 0 598-320 598-598 0-9-0-18-1-27 41-29 77-66 105-109z",youtube:"M1014 307c0 0-10-71-41-102-39-41-83-41-103-43-143-10-358-10-358-10h-0c0 0-215 0-358 10-20 2-64 3-103 43-31 31-41 102-41 102s-10 83-10 166v78c0 83 10 166 10 166s10 71 41 102c39 41 90 39 113 44 82 8 348 10 348 10s215-0 358-11c20-2 64-3 103-43 31-31 41-102 41-102s10-83 10-166v-78c-0-83-10-166-10-166zM406 645v-288l277 144-277 143z",game:{p:["M1056 194v-2h-672c-177 0-320 143-320 320s143 320 320 320c105 0 198-50 256-128h128c58 78 151 128 256 128 177 0 320-143 320-320 0-166-126-302-288-318zM576 576h-128v128h-128v-128h-128v-128h128v-128h128v128h128v128zM960 576c-35 0-64-29-64-64s29-64 64-64 64 29 64 64-29 64-64 64zM1152 576c-35 0-64-29-64-64 0-35 29-64 64-64s64 29 64 64c0 35-29 64-64 64z"],w:1408},google:"M512 0c-283 0-512 229-512 512s229 512 512 512 512-229 512-512-229-512-512-512zM520 896c-212 0-384-172-384-384s172-384 384-384c104 0 190 38 257 100l-104 100c-29-27-78-59-153-59-131 0-238 109-238 242s107 242 238 242c152 0 209-109 218-166h-218v-132h363c3 19 6 38 6 64 0 219-147 375-369 375z",github:"M512 13c-283 0-512 229-512 512 0 226 147 418 350 486 26 5 35-11 35-25 0-12-0-53-1-95-142 31-173-60-173-60-23-59-57-75-57-75-46-32 4-31 4-31 51 4 78 53 78 53 46 78 120 56 149 43 5-33 18-56 33-68-114-13-233-57-233-253 0-56 20-102 53-137-5-13-23-65 5-136 0 0 43-14 141 52 41-11 85-17 128-17 44 0 87 6 128 17 98-66 141-52 141-52 28 71 10 123 5 136 33 36 53 82 53 137 0 197-120 240-234 253 18 16 35 47 35 95 0 69-1 124-1 141 0 14 9 30 35 25 203-68 350-260 350-486 0-283-229-512-512-512z",npm:"M0 0v1024h1024v-1024h-1024zM832 832h-128v-512h-192v512h-320v-640h640v640z",xr:{p:["M801 116c465 0 735 49 735 396 0 279-197 396-342 396-218 0-307-165-393-165-110 0-175 165-393 165-145 0-342-117-342-396 0-347 270-396 735-396zM949 285c-16-16-41-16-57 0-16 16-16 41-0 57v0l322 322c16 16 41 16 57 0 16-16 16-41 0-57-9-9-18-18-26-26l-4-4c-5-5-9-9-14-14l-4-4c-32-32-65-64-132-131l-8-8c-1-1-3-3-4-4l-18-18c-31-31-68-68-113-113zM801 272c-22 0-40 18-40 40v0 322c0 22 18 40 40 40 22 0 40-18 40-40 0-1 0-2 0-3l0-6c0-3 0-6 0-8l0-5c0-1 0-2 0-2l0-6c0-1 0-1 0-2l0-7c0-1 0-1 0-2l0-8c0-0 0-1 0-1l-0-20c-0-0-0-1-0-1l-0-12c-0-1-0-1-0-2l-0-15c-0-1-0-2-0-2l-0-14c-0-1-0-2-0-3l-0-22c-0-1-0-3-0-4l-0-28c-0-2-0-4-0-5l-0-50c-0-2-0-5-0-7l-0-84c0-22-18-40-40-40zM710 282c-16-16-41-16-57 0v0l-134 134-131-131c-16-16-41-16-57 0-16 16-16 41-0 57v0l131 131-132 132c-15 16-15 41 1 56 16 16 41 16 57 0v0l131-131 134 134c16 16 41 16 57 0 16-16 16-41 0-57v0l-134-133 134-133c16-16 16-41 0-57z"],w:1600},xinjs:{p:["M830 0c137 0 194 57 194 194v635c0 137-57 194-194 194h-635c-137 0-194-57-194-194v-635c0-137 57-194 194-194h635zM520 528c-17 0-32 14-32 32v253c0 17 14 32 32 32 17 0 32-14 32-32v-253c0-17-14-32-32-32zM870 528c-10 0-16 1-24 9-83 83-167 166-249 249-1 1-3 3-4 4-12 12-12 32 0 45 12 12 32 12 45 0 81-81 161-162 243-243 9-9 9-9 11-11 12-12 12-32 0-45-8-7-3-3-16-9 0 0-5-0-5-0zM426 528c-10 0-16 1-24 9-35 35-70 70-104 104 0 0-104-104-104-104-8-7-3-3-16-9 0 0-5-0-5-0-10 0-16 1-24 9-12 12-12 32 0 45 0 0 1 1 1 1l10 10c0 0 93 93 93 93s-104 104-104 104c-12 12-12 32 0 45 12 12 32 12 45 0 0 0 45-45 45-45 6-6 11-11 17-17 0 0 42-42 42-42l100 100c2 2 3 3 5 5 12 12 32 12 45 0 12-12 12-32 0-45l-104-104c0 0 3-3 3-3s34-34 34-34c0 0 2-2 2-2s62-62 62-62c1-1 3-3 4-4 12-12 12-32 0-45-8-7-3-3-16-9 0 0-5-0-5-0zM520 179c-17 0-32 14-32 32v253c0 17 14 32 32 32 17 0 32-14 32-32 0-85 0-1 0-253 0-17-14-32-32-32zM617 180c-10 0-16 1-24 9-12 12-12 32 0 45 0 0 253 253 253 253 12 12 32 12 45 0 12-12 12-32 0-45-4-4-7-7-11-11-77-77-154-154-231-231-9-9-9-9-11-11-8-7-3-3-16-9 0 0-5-0-5-0zM426 180c-10 0-16 1-24 9-2 2-2 2-11 11 0 0-93 93-93 93s-104-104-104-104c-8-7-3-3-16-9 0 0-5-0-5-0-10 0-16 1-24 9-12 12-12 32 0 45 0 0 104 104 104 104-32 32-63 63-95 95l-9 9c-12 12-12 32 0 45 12 12 32 12 45 0 4-4 8-8 12-12 15-15 30-30 45-45 16-16 32-32 47-47 0 0 104 104 104 104 12 12 32 12 45 0 12-12 12-32 0-45 0 0-104-104-104-104s93-93 93-93c9-9 9-9 11-11 12-12 12-32 0-45-8-7-3-3-16-9 0 0-5-0-5-0z","M870 544c0 0 1 0 1 0 2 1 4 2 6 2 1 1 2 1 3 2 6 7 6 15-0 22 0 0-8 8-8 8s-3 3-3 3c0 0-232 232-232 232-3 3-7 7-10 10-0 0-0 0-1 1-6 6-16 6-22 0-6-6-6-16 0-22 0 0 1-1 1-1 1-1 2-2 10-10 0 0 232-232 232-232 8-8 9-9 10-10 0-0 0-0 1-1 4-4 7-4 13-4z","M520 544c9 0 16 7 16 16 0 0 0 253 0 253 0 9-7 16-16 16s-16-7-16-16c0 0 0-253 0-253 0-9 7-16 16-16z","M427 544c0 0 1 0 1 0 2 1 4 2 6 2 1 1 2 1 3 2 6 7 6 15-0 22-2 2-2 2-4 4 0 0-62 62-62 62s-2 2-2 2c0 0-34 34-34 34s-3 3-3 3c-6 6-6 16 0 22 0 0 104 104 104 104 6 6 6 16 0 22-6 6-16 6-22 0-1-1-0-0-2-2-4-4-1-1-9-9 0 0-94-94-94-94-6-6-16-6-22 0 0 0-42 42-42 42-2 2-4 4-9 9-4 4-6 6-8 8 0 0-45 45-45 45-6 6-16 6-22-0-6-6-6-16 0-22 0 0 104-104 104-104 6-6 6-16 0-22 0 0-93-93-93-93-3-3-6-6-10-10 0 0-1-1-1-1-6-6-6-16-0-22 4-4 7-4 13-4 0 0 1 0 1 0 2 1 4 2 6 2 1 1 2 2 3 2 0 0 104 104 104 104 6 6 16 6 22 0 19-19 35-35 69-69 17-17 25-25 35-35 4-4 7-4 13-4z"]},html5:"M61 0l82 922 369 102 370-103 82-921h-903zM785 301h-433l10 116h412l-31 347-232 64-232-64-16-178h113l8 90 126 34 0-0 126-34 13-147h-392l-30-342h566l-10 113z",bug:{p:["M933 549c0 20-17 37-37 37h-128c0 71-15 125-38 166l119 119c14 14 14 37 0 51-7 7-17 11-26 11s-19-3-26-11l-113-113s-75 69-172 69v-512h-73v512c-103 0-179-75-179-75l-105 118c-7 8-17 12-27 12-9 0-17-3-25-9-15-14-16-37-3-52l115-130c-20-39-33-90-33-157h-128c-20 0-37-17-37-37s17-37 37-37h128v-168l-99-99c-14-14-14-37 0-51s37-14 51 0l99 99h482l99-99c14-14 37-14 51 0s14 37 0 51l-99 99v168h128c20 0 37 17 37 37zM658 219h-366c0-101 82-183 183-183s183 82 183 183z"],w:951}},{svg:qi,path:Ma}=$n;function Yi(n){let e=Se[n];if(e===void 0){if(n)console.warn(`icon ${n} not found`);e=Se.square}return typeof e!=="string"?e:{w:1024,h:1024,p:[e]}}var Li=(n,e)=>{Se[n]=e},Ua=(n,e,t,a=1)=>{if(e!==void 0){for(let i of[...n.querySelectorAll("path")])if(i.setAttribute("fill",e),t!==void 0)i.setAttribute("stroke",t),i.setAttribute("stroke-width",String(Number(a)*32))}n.setAttribute("xmlns","http://www.w3.org/2000/svg");let o=n.querySelectorAll("[style]");n.removeAttribute("style");for(let i of[...o]){let[s]=i.getAttribute("style")?.match(/rgb\([^)]+\)/)||[];if(i.removeAttribute("style"),s&&!e)i.setAttribute("fill",v.fromCss(s).html)}return`url(data:image/svg+xml;charset=UTF-8,${encodeURIComponent(n.outerHTML)})`},f=new Proxy(Se,{get(n,e){let t=Yi(e);return t===void 0?void 0:(...a)=>{let{w:o,h:i}=Object.assign({w:1024,h:1024},t);return qi({viewBox:`0 0 ${o} ${i}`,class:"icon-"+e.replace(/([a-z])([A-Z])/g,(s,l,d)=>l+"-"+d.toLocaleLowerCase()),style:{height:c.xinIconSize("16px")}},...a,...t.p.map((s,l)=>{let d=Array.from(new Set(t.c));return t.c?Ma({d:s,style:{fill:`var(--icon-fill-${d.indexOf(t.c[l])}, ${t.c[l]})`}}):Ma({d:s})}))}}});class dt extends y{icon="";size=0;color="";stroke="";strokeWidth=1;constructor(){super();this.initAttributes("icon","size","color","stroke","strokeWidth")}render(){this.textContent="";let n={};if(this.size)n.height=this.size,this.style.setProperty("--xin-icon-size",`${this.size}px`);if(this.stroke)n.stroke=this.stroke,n.strokeWidth=this.strokeWidth*32;if(this.color.match(/linear-gradient/)){let e=this.color.split("-")[0],[,t]=this.color.match(/[a-z-]+\((.*)\)/)||[],[,a]=t.match(/(\d+)deg/)||[],o=(t.match(/(#|rgb|hsl).*?%/g)||[]).map((d)=>{let[,h,m]=d.match(/^(.*)\s(\d+%)$/)||["black","100%"];return`<stop offset="${m}" stop-color="${v.fromCss(h).html}" ></stop>`}).join(""),i="";if(a)i=` gradientTransform="rotate(${parseFloat(a).toFixed(0)})"`;let s=$n.defs(),l="g-"+Math.floor(Math.random()*Number.MAX_SAFE_INTEGER);s.innerHTML=`<${e}Gradient id="${l}" ${i}>${o}</${e}Gradient>`,n.fill=`url(#${l})`,this.append(f[this.icon]({style:n},s))}else n.fill=this.color,this.append(f[this.icon]({style:n}))}}var $i=dt.elementCreator({tag:"xin-icon",styleSpec:{":host":{display:"inline-flex"},":host, :host svg":{height:c.xinIconSize("16px")}}}),Ia=()=>{};class ht extends y{babylonReady;BABYLON;static styleSpec={":host":{display:"block",position:"relative"},":host canvas":{width:"100%",height:"100%"},":host .babylonVRicon":{height:50,width:80,backgroundColor:"transparent",filter:"drop-shadow(0 0 4px #000c)",backgroundImage:Ua(f.xrColor()),backgroundPosition:"center",backgroundRepeat:"no-repeat",border:"none",borderRadius:5,borderStyle:"none",outline:"none",transition:"transform 0.125s ease-out"},":host .babylonVRicon:hover":{transform:"scale(1.1)"}};content=g.canvas({part:"canvas"});constructor(){super();this.babylonReady=(async()=>{let{BABYLON:n}=await wn("https://cdn.babylonjs.com/babylon.js","BABYLON");return n})()}scene;engine;sceneCreated=Ia;update=Ia;_update=()=>{if(this.scene){if(this.update!==void 0)this.update(this,this.BABYLON);if(this.scene.activeCamera!==void 0)this.scene.render()}};onResize(){if(this.engine)this.engine.resize()}loadScene=async(n,e,t)=>{let{BABYLON:a}=await wn("https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js","BABYLON");a.SceneLoader.Append(n,e,this.scene,t)};loadUI=async(n)=>{let{BABYLON:e}=await wn("https://cdn.babylonjs.com/gui/babylon.gui.min.js","BABYLON"),t=e.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI",!0,this.scene),{snippetId:a,jsonUrl:o,data:i,size:s}=n;if(s)t.idealWidth=s,t.renderAtIdealSize=!0;let l;if(a)l=await t.parseFromSnippetAsync(a);else if(o)l=await t.parseFromURLAsync(o);else if(i)l=t.parseContent(i);else return null;let d=t.getChildren()[0],h=d.children.reduce((m,p)=>{return m[p.name]=p,m},{});return{advancedTexture:t,gui:l,root:d,widgets:h}};connectedCallback(){super.connectedCallback();let{canvas:n}=this.parts;this.babylonReady.then(async(e)=>{if(this.BABYLON=e,this.engine=new e.Engine(n,!0),this.scene=new e.Scene(this.engine),this.sceneCreated)await this.sceneCreated(this,e);if(this.scene.activeCamera===void 0)new e.ArcRotateCamera("default-camera",-Math.PI/2,Math.PI/2.5,3,new e.Vector3(0,0,0)).attachControl(this.parts.canvas,!0);this.engine.runRenderLoop(this._update)})}}var Ri=ht.elementCreator({tag:"xin-3d"});class Pn extends y{content=null;src="";json="";config={renderer:"svg",loop:!0,autoplay:!0};static bodymovinAvailable;animation;static styleSpec={":host":{width:400,height:400,display:"inline-block"}};_loading=!1;get loading(){return this._loading}constructor(){super();if(this.initAttributes("src","json"),Pn.bodymovinAvailable===void 0)Pn.bodymovinAvailable=wn("https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js","bodymovin")}doneLoading=()=>{this._loading=!1};load=({bodymovin:n})=>{if(this._loading=!0,this.config.container=this.shadowRoot!==null?this.shadowRoot:void 0,this.json!=="")this.config.animationData=this.json,delete this.config.path;else if(this.src!=="")delete this.config.animationData,this.config.path=this.src;else console.log("%c<xin-lottie>%c expected either %cjson%c (animation data) or %csrc% c(url) but found neither.","color: #44f; background: #fff; padding: 0 5px","color: default","color: #44f; background: #fff; padding: 0 5px","color: default","color: #44f; background: #fff; padding: 0 5px","color: default");if(this.animation){this.animation.destroy();let e=this.shadowRoot;if(e!==null)e.querySelector("svg")?.remove()}this.animation=n.loadAnimation(this.config),this.animation.addEventListener("DOMLoaded",this.doneLoading)};render(){super.render(),Pn.bodymovinAvailable.then(this.load).catch((n)=>{console.error(n)})}}var Gi=Pn.elementCreator({tag:"xin-lottie"}),{button:ke,slot:Ji,div:ge}=g;class ut extends y{arrows=!1;dots=!1;loop=!1;maxVisibleItems=1;snapDelay=0.1;snapDuration=0.25;auto=0;lastAutoAdvance=Date.now();interval;autoAdvance=()=>{if(this.auto>0&&this.auto*1000<Date.now()-this.lastAutoAdvance)this.forward()};_page=0;get page(){return this._page}set page(n){let{scroller:e,back:t,forward:a}=this.parts;if(this.lastPage<=0)a.disabled=t.disabled=!0,n=0;else n=Math.max(0,Math.min(this.lastPage,n)),n=isNaN(n)?0:n;if(this._page!==n)this._page=isNaN(n)?0:n,this.animateScroll(this._page*e.offsetWidth),t.disabled=this.page<=0&&!this.loop,a.disabled=this.page>=this.lastPage&&!this.loop}get visibleItems(){return[...this.children].filter((n)=>getComputedStyle(n).display!=="none")}get lastPage(){return Math.max(Math.ceil(this.visibleItems.length/(this.maxVisibleItems||1))-1,0)}static styleSpec={":host":{display:"flex",flexDirection:"column",position:"relative"},":host svg":{height:r.carouselIconSize},":host button":{outline:"none",border:"none",boxShadow:"none",background:"transparent",fill:r.carouselButtonColor,padding:0},":host::part(back), :host::part(forward)":{position:"absolute",top:0,bottom:0,width:r.carouseButtonWidth,zIndex:2},":host::part(back)":{left:0},":host::part(forward)":{right:0},":host button:disabled":{opacity:0.5,pointerEvents:"none"},":host button:hover":{fill:r.carouselButtonHoverColor},":host button:active":{fill:r.carouselButtonActiveColor},":host::part(pager)":{position:"relative"},":host::part(scroller)":{overflow:"auto hidden",position:"relative"},":host::part(grid)":{display:"grid",justifyItems:"center"},":host *::-webkit-scrollbar, *::-webkit-scrollbar-thumb":{display:"none"},":host .dot":{background:r.carouselButtonColor,borderRadius:r.carouselDotSize,height:r.carouselDotSize,width:r.carouselDotSize,transition:r.carouselDotTransition},":host .dot:not(.current):hover":{background:r.carouselButtonHoverColor,height:r.carouselDotSize150,width:r.carouselDotSize150,margin:r.carouselDotSize_25},":host .dot:not(.current):active":{background:r.carouselButtonActiveColor},":host .dot.current":{background:r.carouselDotCurrentColor},":host::part(progress)":{display:"flex",gap:r.carouselDotSpacing,justifyContent:"center",padding:r.carouselProgressPadding}};easing=(n)=>{return Math.sin(n*Math.PI*0.5)};indicateCurrent=()=>{let{scroller:n,progress:e}=this.parts,t=n.scrollLeft/n.offsetWidth;[...e.children].forEach((a,o)=>{a.classList.toggle("current",Math.floor(o/this.maxVisibleItems-t)===0)}),this.lastAutoAdvance=Date.now(),clearTimeout(this.snapTimer),this.snapTimer=setTimeout(this.snapPosition,this.snapDelay*1000)};snapPosition=()=>{let{scroller:n}=this.parts,e=Math.round(n.scrollLeft/n.offsetWidth);if(e!==this.page)this.page=e>this.page?Math.ceil(e):Math.floor(e);this.lastAutoAdvance=Date.now()};back=()=>{this.page=this.page>0?this.page-1:this.lastPage};forward=()=>{this.page=this.page<this.lastPage?this.page+1:0};handleDotClick=(n)=>{let{progress:e}=this.parts,t=[...e.children].indexOf(n.target);if(t>-1)this.page=Math.floor(t/this.maxVisibleItems)};snapTimer;animationFrame;animateScroll(n,e=-1,t=0){cancelAnimationFrame(this.animationFrame);let{scroller:a}=this.parts;if(e===-1){e=a.scrollLeft,t=Date.now(),this.animationFrame=requestAnimationFrame(()=>{this.animateScroll(n,e,t)});return}let o=(Date.now()-t)/1000;if(o>=this.snapDuration||Math.abs(a.scrollLeft-n)<2)a.scrollLeft=n,this.animationFrame=null;else a.scrollLeft=e+this.easing(o/this.snapDuration)*(n-e),this.animationFrame=requestAnimationFrame(()=>{this.animateScroll(n,e,t)})}content=()=>[ge({part:"pager"},ke({title:"previous slide",part:"back"},f.chevronLeft()),ge({title:"slides",role:"group",part:"scroller"},ge({part:"grid"},Ji())),ke({title:"next slide",part:"forward"},f.chevronRight())),ge({title:"choose slide to display",role:"group",part:"progress"})];constructor(){super();this.initAttributes("dots","arrows","maxVisibleItems","snapDuration","loop","auto")}connectedCallback(){super.connectedCallback(),this.ariaRoleDescription="carousel",this.ariaOrientation="horizontal",this.ariaReadOnly="true";let{back:n,forward:e,scroller:t,progress:a}=this.parts;n.addEventListener("click",this.back),e.addEventListener("click",this.forward),t.addEventListener("scroll",this.indicateCurrent),a.addEventListener("click",this.handleDotClick),this.lastAutoAdvance=Date.now(),this.interval=setInterval(this.autoAdvance,100)}disconnectedCallback(){clearInterval(this.interval)}render(){super.render();let{dots:n,arrows:e,visibleItems:t,lastPage:a}=this,{progress:o,back:i,forward:s,grid:l}=this.parts;t.forEach((d)=>{d.role="group"}),l.style.gridTemplateColumns=`${100/this.maxVisibleItems/(1+this.lastPage)}% `.repeat(t.length).trim(),l.style.width=(1+this.lastPage)*100+"%",o.textContent="",o.append(...t.map((d,h)=>ke({title:`item ${h+1}`,class:"dot"}))),this.indicateCurrent(),o.style.display=n&&a>0?"":"none",i.hidden=s.hidden=!(e&&a>0)}}var Ui=ut.elementCreator({tag:"xin-carousel",styleSpec:{":host":{_carouselIconSize:24,_carouselButtonColor:"#0004",_carouselButtonHoverColor:"#0006",_carouselButtonActiveColor:"#000c",_carouseButtonWidth:48,_carouselDotCurrentColor:"#0008",_carouselDotSize:8,_carouselDotSpacing:r.carouselDotSize,_carouselProgressPadding:12,_carouselDotTransition:"0.125s ease-in-out"},":host:focus":{outline:"none",boxShadow:"none"}}}),_a="https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.2/",Ka="ace/theme/tomorrow",Ki=async(n,e="html",t={},a=Ka)=>{let{ace:o}=await wn(`${_a}ace.min.js`);o.config.set("basePath",_a);let i=o.edit(n,{mode:`ace/mode/${e}`,tabSize:2,useSoftTabs:!0,useWorker:!1,...t});return i.setTheme(a),i};class Bn extends y{source="";get value(){return this.editor===void 0?this.source:this.editor.getValue()}set value(n){if(this.editor===void 0)this.source=n;else this.editor.setValue(n),this.editor.clearSelection(),this.editor.session.getUndoManager().reset()}mode="javascript";disabled=!1;role="code editor";get editor(){return this._editor}_editor;_editorPromise;options={};theme=Ka;static styleSpec={":host":{display:"block",position:"relative",width:"100%",height:"100%"}};constructor(){super();this.initAttributes("mode","theme","disabled")}onResize(){if(this.editor!==void 0)this.editor.resize(!0)}connectedCallback(){if(super.connectedCallback(),this.source==="")this.value=this.textContent!==null?this.textContent.trim():"";if(this._editorPromise===void 0)this._editorPromise=Ki(this,this.mode,this.options,this.theme),this._editorPromise.then((n)=>{this._editor=n,n.setValue(this.source,1),n.clearSelection(),n.session.getUndoManager().reset()})}render(){if(super.render(),this._editorPromise!==void 0)this._editorPromise.then((n)=>n.setReadOnly(this.disabled))}}var xe=Bn.elementCreator({tag:"xin-code"}),{input:nt}=g,Pa=v.fromCss("#8888");class Za extends y{value=Pa.rgba;color=Pa;static styleSpec={":host":{_gap:8,_swatchSize:32,_cssWidth:72,_alphaWidth:72,display:"inline-flex",gap:r.gap,alignItems:"center"},':host input[type="color"]':{border:0,width:r.swatchSize,height:r.swatchSize},":host::part(alpha)":{width:r.alphaWidth},":host::part(css)":{width:r.cssWidth,fontFamily:"monospace"}};content=[nt({title:"base color",type:"color",part:"rgb"}),nt({type:"range",title:"opacity",part:"alpha",min:0,max:1,step:0.05}),nt({title:"css color spec",part:"css"})];valueChanged=!1;update=(n)=>{let{rgb:e,alpha:t,css:a}=this.parts;if(n.type==="input")this.color=v.fromCss(e.value),this.color.a=Number(t.value),a.value=this.color.html;else this.color=v.fromCss(a.value),e.value=this.color.html.substring(0,7),t.value=String(this.color.a);e.style.opacity=String(this.color.a),this.value=this.color.rgba,this.valueChanged=!0};connectedCallback(){super.connectedCallback();let{rgb:n,alpha:e,css:t}=this.parts;n.addEventListener("input",this.update),e.addEventListener("input",this.update),t.addEventListener("change",this.update)}render(){if(this.valueChanged){this.valueChanted=!1;return}let{rgb:n,alpha:e,css:t}=this.parts;this.color=v.fromCss(this.value),n.value=this.color.html.substring(0,7),n.style.opacity=String(this.color.a),e.value=String(this.color.a),t.value=this.color.html}}var Qa=Za.elementCreator({tag:"xin-color"}),en=g.div({style:{content:" ",position:"fixed",top:0,left:0,right:0,bottom:0}}),fe={passive:!0},tn=(n,e,t="move")=>{if(!n.type.startsWith("touch")){let{clientX:a,clientY:o}=n;en.style.cursor=t,Qn(en),document.body.append(en);let i=(s)=>{let l=s.clientX-a,d=s.clientY-o;if(e(l,d,s)===!0)en.removeEventListener("mousemove",i),en.removeEventListener("mouseup",i),en.remove()};en.addEventListener("mousemove",i,fe),en.addEventListener("mouseup",i,fe)}else if(n instanceof TouchEvent){let a=n.changedTouches[0],o=a.identifier,i=a.clientX,s=a.clientY,l=n.target,d=0,h=0,m=(p)=>{let u=[...p.touches].find((E)=>E.identifier===o);if(u!==void 0)d=u.clientX-i,h=u.clientY-s;if(p.type==="touchmove")p.stopPropagation(),p.preventDefault();if(e(d,h,p)===!0||u===void 0)l.removeEventListener("touchmove",m),l.removeEventListener("touchend",m),l.removeEventListener("touchcancel",m)};l.addEventListener("touchmove",m),l.addEventListener("touchend",m,fe),l.addEventListener("touchcancel",m,fe)}},pt=(n="body *")=>[...document.querySelectorAll(n)].map((e)=>parseFloat(getComputedStyle(e).zIndex)).reduce((e,t)=>isNaN(e)||Number(e)<t?t:Number(e),0),Qn=(n,e="body *")=>{n.style.zIndex=String(pt(e)+1)},{slot:Zi}=g;class an extends y{static floats=new Set;drag=!1;remainOnResize="remove";remainOnScroll="remain";content=Zi();static styleSpec={":host":{position:"fixed"}};constructor(){super();this.initAttributes("drag","remainOnResize","remainOnScroll")}reposition=(n)=>{if(n.target?.closest(".no-drag"))return;if(this.drag){Qn(this);let e=this.offsetLeft,t=this.offsetTop;tn(n,(a,o,i)=>{if(this.style.left=`${e+a}px`,this.style.top=`${t+o}px`,this.style.right="auto",this.style.bottom="auto",i.type==="mouseup")return!0})}};connectedCallback(){super.connectedCallback(),an.floats.add(this);let n={passive:!0};this.addEventListener("touchstart",this.reposition,n),this.addEventListener("mousedown",this.reposition,n),Qn(this)}disconnectedCallback(){super.disconnectedCallback(),an.floats.delete(this)}}var it=an.elementCreator({tag:"xin-float"});window.addEventListener("resize",()=>{[...an.floats].forEach((n)=>{if(n.remainOnResize==="hide")n.hidden=!0;else if(n.remainOnResize==="remove")n.remove()})},{passive:!0});document.addEventListener("scroll",(n)=>{if(n.target instanceof HTMLElement&&n.target.closest(an.tagName))return;[...an.floats].forEach((e)=>{if(e.remainOnScroll==="hide")e.hidden=!0;else if(e.remainOnScroll==="remove")e.remove()})},{passive:!0,capture:!0});var ka=(n)=>{let{content:e,target:t,position:a}=n,o=Array.isArray(e)?it(...e):it(e);return no(o,t,a),document.body.append(o),o},no=(n,e,t)=>{{let{position:p}=getComputedStyle(n);if(p!=="fixed")n.style.position="fixed";Qn(n)}let{left:a,top:o,width:i,height:s}=e.getBoundingClientRect(),l=a+i*0.5,d=o+s*0.5,h=window.innerWidth,m=window.innerHeight;if(t==="side")t=(l<h*0.5?"e":"w")+(d<m*0.5?"s":"n");else if(t==="auto"||t===void 0)t=(d<m*0.5?"s":"n")+(l<h*0.5?"e":"w");if(n.style.top=n.style.left=n.style.right=n.style.bottom=n.style.transform="",t.length===2){let[p,u]=t;switch(p){case"n":n.style.bottom=(m-o).toFixed(2)+"px";break;case"e":n.style.left=(a+i).toFixed(2)+"px";break;case"s":n.style.top=(o+s).toFixed(2)+"px";break;case"w":n.style.right=(h-a).toFixed(2)+"px";break}switch(u){case"n":n.style.bottom=(m-o-s).toFixed(2)+"px";break;case"e":n.style.left=a.toFixed(2)+"px";break;case"s":n.style.top=o.toFixed(2)+"px";break;case"w":n.style.right=(h-a-i).toFixed(2)+"px";break}n.style.transform=""}else if(t==="n")n.style.bottom=(m-o).toFixed(2)+"px",n.style.left=l.toFixed(2)+"px",n.style.transform="translateX(-50%)";else if(t==="s")n.style.top=(o+s).toFixed(2)+"px",n.style.left=l.toFixed(2)+"px",n.style.transform="translateX(-50%)";else if(t==="e")n.style.left=(a+i).toFixed(2)+"px",n.style.top=d.toFixed(2)+"px",n.style.transform="translateY(-50%)";else if(t==="w")n.style.right=(h-a).toFixed(2)+"px",n.style.top=d.toFixed(2)+"px",n.style.transform="translateY(-50%)";n.style.setProperty("--max-height",`calc(100vh - ${n.style.top||n.style.bottom})`),n.style.setProperty("--max-width",`calc(100vw - ${n.style.left||n.style.right})`)};function eo(n,e=!0){return(t,a)=>{let o=n(t),i=n(a);for(let s in o)if(o[s]!==i[s])return(Array.isArray(e)?e[s]!==!1:e)?o[s]>i[s]?1:-1:o[s]>i[s]?-1:1;return 0}}var{button:Qi,span:Ba,input:ki}=g,to=(n,e)=>{return!!n.find((t)=>{if(t===null||e==null)return!1;else if(Array.isArray(t))return to(t,e);else if(t.value===e||t===e)return!0})};class ne extends y{editable=!1;showIcon=!1;hideCaption=!1;options="";value="";placeholder="";filter="";localized=!1;setValue=(n,e=!1)=>{if(this.value!==n)this.value=n,this.queueRender(!0);if(e)this.dispatchEvent(new Event("action"))};getValue=()=>this.value;get selectOptions(){return typeof this.options==="string"?this.options.split(",").map((n)=>n.trim()||null):this.options}buildOptionMenuItem=(n)=>{if(n===null)return null;let{setValue:e,getValue:t}=this,a,o,i;if(typeof n==="string")o=i=n;else({icon:a,caption:o,value:i}=n);if(this.localized)o=P(o);let{options:s}=n;if(s)return{icon:a,caption:o,checked:()=>to(s,t()),menuItems:s.map(this.buildOptionMenuItem)};return{icon:a,caption:o,checked:()=>t()===i,action:typeof i==="function"?async()=>{let l=await i();if(l!==void 0)e(l,!0)}:()=>{if(typeof i==="string")e(i,!0)}}};get optionsMenu(){let n=this.selectOptions.map(this.buildOptionMenuItem);if(this.filter==="")return n;let e=(t)=>{if(t===null)return!0;else if(t.menuItems)return t.menuItems=t.menuItems.filter(e),t.menuItems.length>0;else return t.caption.toLocaleLowerCase().includes(this.filter)};return n.filter(e)}handleChange=(n)=>{let{value:e}=this.parts,t=e.value||"";if(this.value!==String(t))this.value=t,this.dispatchEvent(new Event("change"));this.filter="",n.stopPropagation(),n.preventDefault()};handleKey=(n)=>{if(n.key==="Enter")n.preventDefault()};filterMenu=Wn(()=>{this.filter=this.parts.value.value.toLocaleLowerCase(),xn(0),this.popOptions()});popOptions=(n)=>{if(n&&n.type==="click")this.filter="";this.poppedOptions=this.optionsMenu,Z({target:this,menuItems:this.poppedOptions})};content=()=>[Qi({onClick:this.popOptions},Ba(),ki({part:"value",value:this.value,tabindex:0,onKeydown:this.handleKey,onInput:this.filterMenu,onChange:this.handleChange}),f.chevronDown())];constructor(){super();this.initAttributes("options","editable","placeholder","showIcon","hideCaption","localized")}get allOptions(){let n=[];function e(t){for(let a of t)if(typeof a==="string")n.push({caption:a,value:a});else if(a?.value)n.push(a);else if(a?.options)e(a.options)}return e(this.selectOptions),n}findOption(){return this.allOptions.find((n)=>n.value===this.value)||{caption:this.value,value:this.value}}localeChanged=()=>{this.queueRender()};connectedCallback(){if(super.connectedCallback(),this.localized)G.allInstances.add(this)}disconnectedCallback(){if(super.disconnectedCallback(),this.localized)G.allInstances.delete(this)}render(){super.render();let{value:n}=this.parts,e=n.previousElementSibling,t=this.findOption(),a=Ba();if(n.value=this.localized?P(t.caption):t.caption,t.icon)if(t.icon instanceof HTMLElement)a=t.icon.cloneNode(!0);else a=f[t.icon]();e.replaceWith(a),n.setAttribute("placeholder",this.localized?P(this.placeholder):this.placeholder),n.style.pointerEvents=this.editable?"":"none",n.readOnly=!this.editable}}var mt=ne.elementCreator({tag:"xin-select",styleSpec:{":host":{"--gap":"8px","--touch-size":"44px","--padding":"0 8px","--value-padding":"0 8px","--icon-width":"24px","--fieldWidth":"140px",display:"inline-block",position:"relative"},":host button":{display:"grid",alignItems:"center",gap:r.gap,textAlign:"left",height:r.touchSize,padding:r.padding,gridTemplateColumns:`auto ${r.iconWidth}`,position:"relative"},":host[show-icon] button":{gridTemplateColumns:`${r.iconWidth} auto ${r.iconWidth}`},":host[hide-caption] button":{gridTemplateColumns:`${r.iconWidth} ${r.iconWidth}`},":host:not([show-icon]) button > :first-child":{display:"none"},":host[hide-caption] button > :nth-child(2)":{display:"none"},':host [part="value"]':{width:r.fieldWidth,padding:r.valuePadding,height:r.touchSize,lineHeight:r.touchSize,boxShadow:"none",whiteSpace:"nowrap",outline:"none",background:"transparent"},':host [part="value"]:not(:focus)':{overflow:"hidden",textOverflow:"ellipsis",background:"transparent"}}}),{span:ao}=g,{i18n:_}=pn({i18n:{locale:window.navigator.language,locales:[window.navigator.language],languages:[window.navigator.language],emoji:[""],stringMap:{},localeOptions:[{icon:ao(),caption:window.navigator.language,value:window.navigator.language}]}});K.localeOptions={toDOM(n,e){if(n instanceof ne)n.options=e}};var ns=(n)=>{if(_.locales.includes(n))_.locale=n;else console.error(`language ${n} is not available`)},ct=()=>{let n=Array.from(G.allInstances);for(let e of n)e.localeChanged()};Ln(_.locale.xinPath,ct);var es=eo((n)=>[n.caption.toLocaleLowerCase()]);function ts(n){let[e,,t,a,...o]=n.split(`
`).map((i)=>i.split("\t"));if(e&&t&&a&&o){if(_.locales=e,_.languages=t,_.emoji=a,_.stringMap=o.reduce((i,s)=>{return i[s[0].toLocaleLowerCase()]=s,i},{}),_.localeOptions=e.map((i,s)=>({icon:ao({title:e[s]},a[s]),caption:t[s],value:i})).sort(es),!_.locales.includes(_.locale.valueOf())){let i=_.locale.substring(0,2);_.locale=_.locales.find((s)=>s.substring(0,2)===i)||_.locales[0]}ct()}}function P(n){if(n.endsWith("…"))return P(n.substring(0,n.length-1))+"…";let e=_.locales.indexOf(_.locale.valueOf());if(e>-1){let t=_.stringMap[n.toLocaleLowerCase()],a=t&&t[e];if(a)n=n.toLocaleLowerCase()===n?a.toLocaleLowerCase():a.valueOf()}return n}class bt extends y{hideCaption=!1;content=()=>{return mt({part:"select",showIcon:!0,title:P("Language"),bindValue:_.locale,bindLocaleOptions:_.localeOptions})};constructor(){super();this.initAttributes("hideCaption")}render(){super.render(),this.parts.select.toggleAttribute("hide-caption",this.hideCaption)}}var as=bt.elementCreator({tag:"xin-locale-picker"});class G extends y{static allInstances=new Set;contents=()=>g.xinSlot();refString="";constructor(){super();this.initAttributes("refString")}connectedCallback(){super.connectedCallback(),G.allInstances.add(this)}disconnectedCallback(){super.disconnectedCallback(),G.allInstances.delete(this)}localeChanged(){if(!this.refString)this.refString=this.textContent||"";this.textContent=this.refString?P(this.refString):""}render(){super.render(),this.localeChanged()}}var Ee=G.elementCreator({tag:"xin-localized",styleSpec:{":host":{pointerEvents:"none"}}}),os=(n,e)=>{e=e.toLocaleLowerCase();let t=!!e.match(/\^|ctrl/),a=!!e.match(/⌘|meta/),o=!!e.match(/⌥|⎇|alt|option/),i=!!e.match(/⇧|shift/),s=e.slice(-1);return n.key===s&&n.metaKey===a&&n.ctrlKey===t&&n.altKey===o&&n.shiftKey===i},{div:Aa,button:yt,span:q,a:is,xinSlot:ss}=g;Rn("xin-menu-helper",{".xin-menu":{overflow:"hidden auto",maxHeight:`calc(${r.maxHeight} - ${c.menuInset("8px")})`,borderRadius:r.spacing50,background:c.menuBg("#fafafa"),boxShadow:c.menuShadow(`${r.spacing13} ${r.spacing50} ${r.spacing} #0004`)},".xin-menu > div":{width:c.menuWidth("auto")},".xin-menu-trigger":{paddingLeft:0,paddingRight:0,minWidth:c.touchSize("48px")},".xin-menu-separator":{display:"inline-block",content:" ",height:"1px",width:"100%",background:c.menuSeparatorColor("#2224"),margin:c.menuSeparatorMargin("8px 0")},".xin-menu-item":{boxShadow:"none",border:"none !important",display:"grid",alignItems:"center",justifyContent:"flex-start",textDecoration:"none",gridTemplateColumns:"0px 1fr 30px",width:"100%",gap:0,background:"transparent",padding:c.menuItemPadding("0 16px"),height:c.menuItemHeight("48px"),lineHeight:c.menuItemHeight("48px"),textAlign:"left"},".xin-menu-item, .xin-menu-item > span":{color:c.menuItemColor("#222")},".xin-menu-with-icons .xin-menu-item":{gridTemplateColumns:"30px 1fr 30px"},".xin-menu-item svg":{fill:c.menuItemIconColor("#222")},".xin-menu-item.xin-menu-item-checked":{background:c.menuItemHoverBg("#eee")},".xin-menu-item > span:nth-child(2)":{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textAlign:"left"},".xin-menu-item:hover":{boxShadow:"none !important",background:c.menuItemHoverBg("#eee")},".xin-menu-item:active":{boxShadow:"none !important",background:c.menuItemActiveBg("#aaa"),color:c.menuItemActiveColor("#000")},".xin-menu-item:active svg":{fill:c.menuItemIconActiveColor("#000")}});var oo=(n,e)=>{let t=n.checked&&n.checked()&&"check"||!1,a=n?.icon||t||q(" ");if(typeof a==="string")a=f[a]();let o;if(typeof n?.action==="string")o=is({class:"xin-menu-item",href:n.action},a,e.localized?q(P(n.caption)):q(n.caption),q(n.shortcut||" "));else o=yt({class:"xin-menu-item",onClick:n.action},a,e.localized?q(P(n.caption)):q(n.caption),q(n.shortcut||" "));if(o.classList.toggle("xin-menu-item-checked",t!==!1),n?.enabled&&!n.enabled())o.setAttribute("disabled","");return o},io=(n,e)=>{let t=n.checked&&n.checked()&&"check"||!1,a=n?.icon||t||q(" ");if(typeof a==="string")a=f[a]();let o=yt({class:"xin-menu-item",disabled:!(!n.enabled||n.enabled()),onClick(i){Z(Object.assign({},e,{menuItems:n.menuItems,target:o,submenuDepth:(e.submenuDepth||0)+1,position:"side"})),i.stopPropagation(),i.preventDefault()}},a,e.localized?q(P(n.caption)):q(n.caption),f.chevronRight({style:{justifySelf:"flex-end"}}));return o},so=(n,e)=>{if(n===null)return q({class:"xin-menu-separator"});else if(n?.action)return oo(n,e);else return io(n,e)},lo=(n)=>{let{target:e,width:t,menuItems:a}=n,o=a.find((i)=>i?.icon||i?.checked);return Aa({class:o?"xin-menu xin-menu-with-icons":"xin-menu",onClick(){xn(0)}},Aa({style:{minWidth:e.offsetWidth+"px",width:typeof t==="number"?`${t}px`:t},onMousedown(i){i.preventDefault(),i.stopPropagation()}},...a.map((i)=>so(i,n))))},In,gn=[],xn=(n=0)=>{let e=gn.splice(n);for(let t of e)t.menu.remove();return In=e[0],n>0?gn[n-1]:void 0};document.body.addEventListener("mousedown",(n)=>{if(n.target&&!gn.find((e)=>e.target.contains(n.target)))xn(0)});document.body.addEventListener("keydown",(n)=>{if(n.key==="Escape")xn(0)});var Z=(n)=>{n=Object.assign({submenuDepth:0},n);let{target:e,position:t,submenuDepth:a}=n;if(In&&!document.body.contains(In?.menu))In=void 0;if(gn.length&&!document.body.contains(gn[0].menu))gn.splice(0);if(a===0&&In?.target===e)return;let o=xn(a);if(In?.target===e)return;if(o&&o.target===e){xn();return}if(!n.menuItems?.length)return;let i=lo(n),s=ka({content:i,target:e,position:t});s.remainOnScroll="remove",gn.push({target:e,menu:s})};function ro(n,e){for(let t of n){if(!t)continue;let{shortcut:a}=t,{menuItems:o}=t;if(a){if(os(e,a))return t}else if(o){let i=ro(o,e);if(i)return i}}return}class gt extends y{menuItems=[];menuWidth="auto";localized=!1;showMenu=(n)=>{if(n.type==="click"||n.code==="Space")Z({target:this.parts.trigger,width:this.menuWidth,localized:this.localized,menuItems:this.menuItems}),n.stopPropagation(),n.preventDefault()};content=()=>yt({tabindex:0,part:"trigger",onClick:this.showMenu},ss());handleShortcut=async(n)=>{let e=ro(this.menuItems,n);if(e){if(e.action instanceof Function)e.action()}};constructor(){super();this.initAttributes("menuWidth","localized","icon"),this.addEventListener("keydown",this.showMenu)}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.handleShortcut,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.handleShortcut)}}var ls=gt.elementCreator({tag:"xin-menu",styleSpec:{":host":{display:"inline-block"},":host button > xin-slot":{display:"flex",alignItems:"center",gap:c.xinMenuTriggerGap("10px")}}}),ho={};Wi(ho,{init:()=>co,draggedElement:()=>ps});var rs=()=>!!document.querySelector(".drag-source"),uo=(n,e)=>{if(!n)return!1;for(let t of n)if(t==="special/any")return!0;else if(t.indexOf("*")>-1){let[a,o]=t.split("/"),[i,s]=e.split("/");if((a==="*"||a===i)&&(o==="*"||o===s))return!0}else if(t===e)return!0},Ce=(n)=>{for(let e of[...document.querySelectorAll(`.${n}`)])e.classList.remove(n)},po=()=>{Ce("drag-over"),Ce("drag-source"),Ce("drag-target")},st=(n,e=";")=>{return(n||"").split(e).map((t)=>t.trim()).filter((t)=>t!=="")},mo=(n)=>{if(!n)n=[];let e=[...document.querySelectorAll("[data-drop]")];for(let t of e){let a=st(t.dataset.drop);if(n.find((o)=>uo(a,o)))t.classList.add("drag-target");else t.classList.remove("drag-target")}};function ds(n){let e=n.target?.closest('[draggable="true"],a[href]');if(!e)return;e.classList.add("drag-source");let t=e.matches('[draggable="true"]')?st(e.dataset.drag||"text/html"):st(e.dataset.drag||"url");for(let a of t){let o=e.dataset.dragContent||(a==="text/html"?e.innerHTML:e.textContent);n.dataTransfer?.setData(a,o||"")}mo(n.dataTransfer?.types),n.stopPropagation()}function Oa(n){if(!rs())mo(n.dataTransfer?.types);let e=n.target.closest(".drag-target");if(e&&n.dataTransfer)e.classList.add("drag-over"),n.dataTransfer.dropEffect="copy";else n.preventDefault(),n.stopPropagation()}function hs(){Ce("drag-over")}function us(n){let e=n.target.closest(".drag-target");if(e){let t=(e.dataset?.drop||"").split(";");for(let a of t)if(uo(n.dataTransfer?.types,a))if(a==="text/html")e.innerHTML=n.dataTransfer?.getData(a)||"";else e.textContent=n.dataTransfer?.getData(a)||""}po()}var ps=()=>document.querySelector(".drag-source"),Da=!1,co=()=>{if(Da)return;document.body.addEventListener("dragstart",ds),document.body.addEventListener("dragenter",Oa),document.body.addEventListener("dragover",Oa),document.body.addEventListener("drop",us),document.body.addEventListener("dragleave",hs),document.body.addEventListener("dragend",po),window.addEventListener("dragover",(n)=>n.preventDefault()),window.addEventListener("drop",(n)=>n.preventDefault()),Da=!0};function ms(n,e,t){let a=n.find((o)=>o[e]!==void 0&&o[e]!==null);if(a!==void 0){let o=a[e];switch(typeof o){case"string":if(o.match(/^\d+(\.\d+)?$/))return 6*t;else if(o.includes(" "))return 20*t;else return 12*t;case"number":return 6*t;case"boolean":return 5*t;case"object":return!1;default:return 8*t}}return!1}var{div:Mn,span:we,button:cs,template:bs}=g,za=(n)=>n;class ft extends y{select=!1;multiple=!1;nosort=!1;nohide=!1;noreorder=!1;selectionChanged=()=>{};localized=!1;selectedKey=Symbol("selected");selectBinding=(n,e)=>{n.toggleAttribute("aria-selected",e[this.selectedKey]===!0)};pinnedTop=0;pinnedBottom=0;maxVisibleRows=1e4;get value(){return{array:this.array,filter:this.filter,columns:this.columns}}set value(n){let{array:e,columns:t,filter:a}=z(n);if(this._array!==e||this._columns!==t||this._filter!==a)this.queueRender();this._array=e||[],this._columns=t||null,this._filter=a||za}rowData={visible:[],pinnedTop:[],pinnedBottom:[]};_array=[];_columns=null;_filter=za;charWidth=15;rowHeight=30;minColumnWidth=30;get virtual(){return this.rowHeight>0?{height:this.rowHeight}:void 0}constructor(){super();this.rowData=pn({[this.instanceId]:this.rowData})[this.instanceId],this.initAttributes("rowHeight","charWidth","minColumnWidth","select","multiple","pinnedTop","pinnedBottom","nosort","nohide","noreorder","localized")}get array(){return this._array}set array(n){this._array=z(n),this.queueRender()}get filter(){return this._filter}set filter(n){if(this._filter!==n)this._filter=n,this.queueRender()}get sort(){if(this._sort)return this._sort;let n=this._columns?.find((t)=>t.sort==="ascending"||t.sort==="descending");if(!n)return;let{prop:e}=n;return n.sort==="ascending"?(t,a)=>t[e]>a[e]?1:-1:(t,a)=>t[e]>a[e]?-1:1}set sort(n){if(this._sort!==n)this._sort=n,this.queueRender()}get columns(){if(!Array.isArray(this._columns)){let{_array:n}=this;this._columns=Object.keys(n[0]||{}).map((e)=>{let t=ms(n,e,this.charWidth);return{name:e.replace(/([a-z])([A-Z])/g,"$1 $2").toLocaleLowerCase(),prop:e,align:typeof n[0][e]==="number"||n[0][e]!==""&&!isNaN(n[0][e])?"right":"left",visible:t!==!1,width:t?t:0}})}return this._columns}set columns(n){this._columns=n,this.queueRender()}get visibleColumns(){return this.columns.filter((n)=>n.visible!==!1)}content=null;getColumn(n){let e=(n.touches!==void 0?n.touches[0].clientX:n.clientX)-this.getBoundingClientRect().x,t=n.touches!==void 0?20:5,a=0,o=[];return this.visibleColumns.find((i)=>{if(i.visible!==!1)return a+=i.width,o.push(a),Math.abs(e-a)<t})}setCursor=(n)=>{if(this.getColumn(n)!==void 0)this.style.cursor="col-resize";else this.style.cursor=""};resizeColumn=(n)=>{let e=this.getColumn(n);if(e!==void 0){let t=Number(e.width),a=n.touches!==void 0,o=a?n.touches[0].identifier:void 0;tn(n,(i,s,l)=>{if((a?[...l.touches].find((h)=>h.identifier===o):!0)===void 0)return!0;let d=t+i;if(e.width=d>this.minColumnWidth?d:this.minColumnWidth,this.setColumnWidths(),l.type==="mouseup")return!0},"col-resize")}};selectRow(n,e=!0){if(e)n[this.selectedKey]=!0;else delete n[this.selectedKey]}selectRows(n,e=!0){for(let t of n||this.array)this.selectRow(t,e)}deSelect(n){this.selectRows(n,!1)}rangeStart;updateSelection=(n)=>{if(!this.select&&!this.multiple)return;let{target:e}=n;if(!(e instanceof HTMLElement))return;let t=e.closest(".tr");if(!(t instanceof HTMLElement))return;let a=un(t);if(a===!1)return;let o=n,i=window.getSelection();if(i!==null)i.removeAllRanges();let s=this.visibleRows;if(this.multiple&&o.shiftKey&&s.length>0&&this.rangeStart!==a){let l=this.rangeStart===void 0||this.rangeStart[this.selectedKey]===!0,[d,h]=[this.rangeStart!==void 0?s.indexOf(this.rangeStart):0,s.indexOf(a)].sort((m,p)=>m-p);if(d>-1)for(let m=d;m<=h;m++){let p=s[m];this.selectRow(p,l)}}else if(this.multiple&&o.metaKey){this.selectRow(a,!a[this.selectedKey]);let l=s.indexOf(a),d=s[l+1],h=l>0?s[l-1]:void 0;if(d!==void 0&&d[this.selectedKey]===!0)this.rangeStart=d;else if(h!==void 0&&h[this.selectedKey]===!0)this.rangeStart=h;else this.rangeStart=void 0}else this.rangeStart=a,this.deSelect(),this.selectRow(a,!0);this.selectionChanged(this.visibleSelectedRows);for(let l of Array.from(this.querySelectorAll(".tr"))){let d=un(l);this.selectBinding(l,d)}};connectedCallback(){super.connectedCallback(),this.addEventListener("mousemove",this.setCursor),this.addEventListener("mousedown",this.resizeColumn),this.addEventListener("touchstart",this.resizeColumn,{passive:!0}),this.addEventListener("mouseup",this.updateSelection),this.addEventListener("touchend",this.updateSelection)}setColumnWidths(){this.style.setProperty("--grid-columns",this.visibleColumns.map((n)=>n.width+"px").join(" ")),this.style.setProperty("--grid-row-width",this.visibleColumns.reduce((n,e)=>n+e.width,0)+"px")}sortByColumn=(n,e="auto")=>{for(let t of this.columns.filter((a)=>z(a.sort)!==!1))if(z(t)===n){if(e==="auto")t.sort=t.sort==="ascending"?"descending":"ascending";else t.sort=e;this.queueRender()}else delete t.sort};popColumnMenu=(n,e)=>{let{sortByColumn:t}=this,a=this.columns.filter((s)=>s.visible===!1),o=this.queueRender.bind(this),i=[];if(!this.nosort&&e.sort!==!1)i.push({caption:this.localized?`${P("Sort")} ${P("Ascending")}`:"Sort Ascending",icon:"sortAscending",action(){t(e)}},{caption:this.localized?`${P("Sort")} ${P("Descending")}`:"Sort Ascending",icon:"sortDescending",action(){t(e,"descending")}});if(!this.nohide){if(i.length)i.push(null);i.push({caption:this.localized?`${P("Hide")} ${P("Column")}`:"Hide Column",icon:"eyeOff",enabled:()=>e.visible!==!0,action(){e.visible=!1,o()}},{caption:this.localized?`${P("Show")} ${P("Column")}`:"Show Column",icon:"eye",enabled:()=>a.length>0,menuItems:a.map((s)=>{return{caption:s.name||s.prop,action(){delete s.visible,o()}}})})}Z({target:n,localized:this.localized,menuItems:i})};get captionSpan(){return this.localized?Ee:we}headerCell=(n)=>{let{popColumnMenu:e}=this,t="none",a;switch(n.sort){case"ascending":a=f.sortAscending(),t="descending";break;case!1:break;default:break;case"descending":t="ascending",a=f.sortDescending()}let o=!(this.nosort&&this.nohide)?cs({class:"menu-trigger",onClick(i){e(i.target,n),i.stopPropagation()}},a||f.moreVertical()):{};return n.headerCell!==void 0?n.headerCell(n):we({class:"th",role:"columnheader",ariaSort:t,style:{...this.cellStyle,textAlign:n.align||"left"}},this.captionSpan(typeof n.name==="string"?n.name:n.prop),we({style:{flex:"1"}}),o)};dataCell=(n)=>{if(n.dataCell!==void 0)return n.dataCell(n);return we({class:"td",role:"cell",style:{...this.cellStyle,textAlign:n.align||"left"},bindText:`^.${n.prop}`})};get visibleRows(){return z(this.rowData.visible)}get visibleSelectedRows(){return this.visibleRows.filter((n)=>n[this.selectedKey])}get selectedRows(){return this.array.filter((n)=>n[this.selectedKey])}rowTemplate(n){return bs(Mn({class:"tr",role:"row",bind:{value:"^",binding:{toDOM:this.selectBinding}}},...n.map(this.dataCell)))}draggedColumn;dropColumn=(n)=>{let e=n.target.closest(".drag-over"),t=Array.from(e.parentElement.children).indexOf(e),a=this.visibleColumns[t],o=this.columns.indexOf(this.draggedColumn),i=this.columns.indexOf(a);this.columns.splice(o,1),this.columns.splice(i,0,this.draggedColumn),console.log({event:n,target:e,targetIndex:t,draggedIndex:o,droppedIndex:i}),this.queueRender(),n.preventDefault(),n.stopPropagation()};render(){super.render(),this.rowData.pinnedTop=this.pinnedTop>0?this._array.slice(0,this.pinnedTop):[],this.rowData.pinnedBottom=this.pinnedBottom>0?this._array.slice(this._array.length-this.pinnedBottom):[],this.rowData.visible=this.filter(this._array.slice(this.pinnedTop,Math.min(this.maxVisibleRows,this._array.length-this.pinnedTop-this.pinnedBottom)));let{sort:n}=this;if(n)this.rowData.visible.sort(n);this.textContent="",this.style.display="flex",this.style.flexDirection="column";let{visibleColumns:e}=this;if(this.style.setProperty("--row-height",`${this.rowHeight}px`),this.setColumnWidths(),!this.noreorder)co();let t=this.instanceId+"-column-header",a=e.map((o)=>{let i=this.headerCell(o);if(!this.noreorder)i.setAttribute("draggable","true"),i.dataset.drag=t,i.dataset.drop=t,i.addEventListener("dragstart",()=>{this.draggedColumn=o}),i.addEventListener("drop",this.dropColumn);return i});if(this.append(Mn({class:"thead",role:"rowgroup",style:{touchAction:"none"}},Mn({class:"tr",role:"row"},...a))),this.pinnedTop>0)this.append(Mn({part:"pinnedTopRows",class:"tbody",role:"rowgroup",style:{flex:"0 0 auto",overflow:"hidden",height:`${this.rowHeight*this.pinnedTop}px`},bindList:{value:this.rowData.pinnedTop,virtual:this.virtual}},this.rowTemplate(e)));if(this.append(Mn({part:"visibleRows",class:"tbody",role:"rowgroup",style:{content:" ",minHeight:"100px",flex:"1 1 100px",overflow:"hidden auto"},bindList:{value:this.rowData.visible,virtual:this.virtual}},this.rowTemplate(e))),this.pinnedBottom>0)this.append(Mn({part:"pinnedBottomRows",class:"tbody",role:"rowgroup",style:{flex:"0 0 auto",overflow:"hidden",height:`${this.rowHeight*this.pinnedBottom}px`},bindList:{value:this.rowData.pinnedBottom,virtual:this.virtual}},this.rowTemplate(e)))}}var ys=ft.elementCreator({tag:"xin-table",styleSpec:{":host":{overflow:"auto hidden"},":host .thead, :host .tbody":{width:r.gridRowWidth},":host .tr":{display:"grid",gridTemplateColumns:r.gridColumns,height:r.rowHeight,lineHeight:r.rowHeight},":host .td, :host .th":{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",display:"flex",alignItems:"center"},":host .th .menu-trigger":{color:"currentColor",background:"none",padding:0,lineHeight:r.touchSize,height:r.touchSize,width:r.touchSize},':host [draggable="true"]':{cursor:"ew-resize"},':host [draggable="true"]:active':{background:c.draggedHeaderBg("#0004"),color:c.draggedHeaderColor("#fff")},":host .drag-over":{background:c.dropHeaderBg("#fff4")}}}),{div:W,slot:gs}=g;class F extends y{static angleSize=15;static gridSize=8;static snapAngle=!1;static snapToGrid=!1;static styleSpec={":host":{"--handle-bg":"#fff4","--handle-color":"#2228","--handle-hover-bg":"#8ff8","--handle-hover-color":"#222","--handle-size":"20px","--handle-padding":"2px"},":host ::slotted(*)":{position:"absolute"},":host > :not(style,slot)":{boxSizing:"border-box",content:'" "',position:"absolute",display:"flex",height:r.handleSize,width:r.handleSize,padding:r.handlePadding,"--text-color":r.handleColor,background:r.handleBg},":host > .drag-size":{top:0,bottom:0,left:0,right:0,height:"auto",width:"auto",background:"transparent",cursor:"ew-resize"},':host > [part="rotate"]':{transform:`translateY(${r.handleSize_50})`},":host > [locked] > svg:first-child, :host > :not([locked]) > svg+svg":{display:"none"},":host .icon-unlock":{opacity:0.5},":host svg":{pointerEvents:"none"},":host > *:hover":{"--text-color":r.handleHoverColor,background:r.handleHoverBg}};static snappedCoords(n,e){let{gridSize:t}=F;return F.snapToGrid||n.shiftKey?e.map((a)=>Math.round(a/t)*t):e}static snappedAngle(n,e){let{angleSize:t}=F;return F.snapAngle||n.shiftKey?Math.round(e/t)*t:e}get locked(){let n=this.parentElement;if(n.style.inset)return{left:!0,top:!0,bottom:!0,right:!0};let e=n.style.right.match(/\d/)!==null,t=!e||n.style.left.match(/\d/)!==null,a=n.style.bottom.match(/\d/)!==null,o=!a||n.style.top.match(/\d/)!==null;return{left:t,top:o,bottom:a,right:e}}set locked(n){let{bottom:e,right:t}=n,{left:a,top:o}=n,i=this.parentElement,s=i.offsetLeft,l=i.offsetTop,d=i.offsetWidth,h=i.offsetHeight,m=i.offsetParent.offsetWidth-s-d,p=i.offsetParent.offsetHeight-l-h;if(Object.assign(i.style,{left:"",right:"",top:"",bottom:"",width:"",height:""}),!t)a=!0;if(!e)o=!0;if(a)i.style.left=s+"px";if(t)i.style.right=m+"px";if(a&&t)i.style.width="auto";else i.style.width=d+"px";if(o)i.style.top=l+"px";if(e)i.style.bottom=p+"px";if(o&&e)i.style.height="auto";else i.style.height=h+"px";this.queueRender()}get coords(){let{top:n,left:e,right:t,bottom:a}=this.parentElement.style;return{top:parseFloat(n),left:parseFloat(e),right:parseFloat(t),bottom:parseFloat(a)}}get left(){return this.parentElement.offsetLeft}get width(){return this.parentElement.offsetWidth}get right(){return this.parentElement.offsetParent.offsetWidth-(this.left+this.width)}get top(){return this.parentElement.offsetTop}get height(){return this.parentElement.offsetHeight}get bottom(){return this.parentElement.offsetParent.offsetHeight-(this.top+this.height)}triggerChange=()=>{this.parentElement.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))};adjustPosition=(n)=>{let{locked:e}=this;this.locked=e;let t=this.parentElement,{top:a,left:o,bottom:i,right:s}=this.coords;tn(n,(l,d,h)=>{if([l,d]=F.snappedCoords(h,[l,d]),!isNaN(a))t.style.top=a+d+"px";if(!isNaN(i))t.style.bottom=i-d+"px";if(!isNaN(o))t.style.left=o+l+"px";if(!isNaN(s))t.style.right=s-l+"px";if(h.type==="mouseup")return this.triggerChange(),!0})};resize=(n)=>{let e=this.parentElement,{locked:t}=this;this.locked=Object.assign({left:!0,top:!0,right:!0,bottom:!0});let[a,o]=[this.right,this.bottom];tn(n,(i,s,l)=>{let d=a-i,h=o-s;if([d,h]=F.snappedCoords(l,[d,h]),e.style.right=d+"px",e.style.bottom=h+"px",l.type==="mouseup")return this.locked=t,this.triggerChange(),!0})};adjustSize=(n)=>{let e=this.parentElement,{locked:t}=this,a=n.target.getAttribute("part");this.locked=Object.assign({left:!0,right:!0,top:!0,bottom:!0});let o=this[a];tn(n,(i,s,l)=>{let[d]=F.snappedCoords(l,[o+(["left","right"].includes(a)?i:s)*(["right","bottom"].includes(a)?-1:1)]);if(e.style[a]=d+"px",l.type==="mouseup")return this.locked=t,this.triggerChange(),!0})};get rect(){return this.parentElement.getBoundingClientRect()}get center(){let n=this.parentElement.getBoundingClientRect();return{x:n.x+n.width*0.5,y:n.y+n.height*0.5}}get element(){return this.parentElement}adjustRotation=(n)=>{let{center:e}=this,{transformOrigin:t}=this.element.style;if(!t)this.element.style.transformOrigin="50% 50%";tn(n,(a,o,i)=>{let{clientX:s,clientY:l}=i,d=s-e.x,h=l-e.y,m=h>0?90:-90;if(d!==0)m=Math.atan2(h,d)*180/Math.PI;if(m=F.snappedAngle(i,m),m===0)this.element.style.transformOrigin="",this.element.style.transform="";else this.element.style.transform=`rotate(${m}deg)`;return this.triggerChange(),i.type==="mouseup"})};toggleLock=(n)=>{let{locked:e}=this,t=n.target.title.split(" ")[1];e[t]=!e[t],this.locked=e,this.queueRender(),n.stopPropagation(),n.preventDefault()};content=()=>[W({part:"move",style:{top:"50%",left:"50%",transform:"translate(-50%,-50%)"}},f.move()),W({part:"left",title:"resize left",class:"drag-size",style:{left:"-6px",width:"8px"}}),W({part:"right",title:"resize right",class:"drag-size",style:{left:"calc(100% - 2px)",width:"8px"}}),W({part:"top",title:"resize top",class:"drag-size",style:{top:"-6px",height:"8px",cursor:"ns-resize"}}),W({part:"bottom",title:"resize bottom",class:"drag-size",style:{top:"calc(100% - 2px)",height:"8px",cursor:"ns-resize"}}),W({part:"resize",style:{top:"100%",left:"100%"}},f.resize()),W({part:"rotate",style:{top:"50%",right:"0"}},f.refresh()),W({part:"lockLeft",title:"lock left",style:{top:"50%",left:0,transform:"translate(-100%, -50%)"}},f.unlock(),f.lock()),W({part:"lockRight",title:"lock right",style:{top:"50%",left:"100%",transform:"translate(0%, -50%)"}},f.unlock(),f.lock()),W({part:"lockTop",title:"lock top",style:{top:0,left:"50%",transform:"translate(-50%, -100%)"}},f.unlock(),f.lock()),W({part:"lockBottom",title:"lock bottom",style:{top:"100%",left:"50%",transform:"translate(-50%, 0%)"}},f.unlock(),f.lock()),gs()];constructor(){super();this.initAttributes("rotationSnap","positionSnap")}connectedCallback(){super.connectedCallback();let{left:n,right:e,top:t,bottom:a,lockLeft:o,lockRight:i,lockTop:s,lockBottom:l,move:d,resize:h,rotate:m}=this.parts,p={passive:!0};[n,e,t,a].forEach((u)=>{u.addEventListener("mousedown",this.adjustSize,p),u.addEventListener("touchstart",this.adjustSize,p)}),[o,i,s,l].forEach((u)=>{u.addEventListener("click",this.toggleLock)}),h.addEventListener("mousedown",this.resize,p),d.addEventListener("mousedown",this.adjustPosition,p),m.addEventListener("mousedown",this.adjustRotation,p),h.addEventListener("touchstart",this.resize,p),d.addEventListener("touchstart",this.adjustPosition,p),m.addEventListener("touchstart",this.adjustRotation,p)}render(){if(super.render(),!this.parentElement)return;let{lockLeft:n,lockRight:e,lockTop:t,lockBottom:a}=this.parts,{left:o,right:i,top:s,bottom:l}=this.locked;n.toggleAttribute("locked",o),e.toggleAttribute("locked",i),t.toggleAttribute("locked",s),a.toggleAttribute("locked",l)}}var fs=F.elementCreator({tag:"xin-editable"}),{div:ws,input:vs,select:Va,option:Zn,button:lt,span:xs}=g,Xa=(n)=>n,Ha="null filter, everything matches",wt={contains:{caption:"contains",negative:"does not contain",makeTest:(n)=>{return n=n.toLocaleLowerCase(),(e)=>String(e).toLocaleLowerCase().includes(n)}},hasTags:{caption:"has tags",makeTest:(n)=>{let e=n.split(/[\s,]/).map((t)=>t.trim().toLocaleLowerCase()).filter((t)=>t!=="");return console.log(e),(t)=>Array.isArray(t)&&e.find((a)=>!t.includes(a))===void 0}},doesNotHaveTags:{caption:"does not have tags",makeTest:(n)=>{let e=n.split(/[\s,]/).map((t)=>t.trim().toLocaleLowerCase()).filter((t)=>t!=="");return console.log(e),(t)=>Array.isArray(t)&&e.find((a)=>t.includes(a))===void 0}},equals:{caption:"=",negative:"≠",makeTest:(n)=>{if(isNaN(Number(n)))return n=String(n).toLocaleLowerCase(),(t)=>String(t).toLocaleLowerCase()===n;let e=Number(n);return(t)=>Number(t)===e}},after:{caption:"is after",negative:"is before",makeTest:(n)=>{let e=new Date(n);return(t)=>new Date(t)>e}},greaterThan:{caption:">",negative:"≤",makeTest:(n)=>{if(!isNaN(Number(n))){let e=Number(n);return(t)=>Number(t)>e}return n=n.toLocaleLowerCase(),(e)=>String(e).toLocaleLowerCase()>n}},truthy:{caption:"is true/non-empty/non-zero",negative:"is false/empty/zero",needsValue:!1,makeTest:()=>(n)=>!!n},isTrue:{caption:"= true",needsValue:!1,makeTest:()=>(n)=>n===!0},isFalse:{caption:"= false",needsValue:!1,makeTest:()=>(n)=>n===!1}},Cs={description:"anything",test:()=>!0};function Na(n){return n.options[n.selectedIndex].text}class vt extends y{fields=[];filters=wt;haystack="*";condition="";needle="";content=()=>[Va({part:"haystack"}),f.chevronDown(),Va({part:"condition"}),f.chevronDown(),vs({part:"needle",type:"search"}),xs({part:"padding"}),lt({part:"remove",title:"delete"},f.trash())];filter=Cs;constructor(){super();this.initAttributes("haystack","condition","needle")}get state(){let{haystack:n,needle:e,condition:t}=this.parts;return{haystack:n.value,needle:e.value,condition:t.value}}set state(n){Object.assign(this,n)}buildFilter=()=>{let{haystack:n,condition:e,needle:t}=this.parts,a=e.value.startsWith("~"),o=a?e.value.slice(1):e.value,i=this.filters[o];t.hidden=i.needsValue===!1;let s=i.needsValue===!1?i.makeTest(void 0):i.makeTest(t.value),l=n.value,d;if(l!=="*")d=a?(p)=>!s(p[l]):(p)=>s(p[l]);else d=a?(p)=>Object.values(p).find((u)=>!s(u))!==void 0:(p)=>Object.values(p).find((u)=>s(u))!==void 0;let h=i.needsValue!==!1?` "${t.value}"`:"",m=`${Na(n)} ${Na(e)}${h}`;this.filter={description:m,test:d},this.parentElement?.dispatchEvent(new Event("change"))};connectedCallback(){super.connectedCallback();let{haystack:n,condition:e,needle:t,remove:a}=this.parts;n.addEventListener("change",this.buildFilter),e.addEventListener("change",this.buildFilter),t.addEventListener("input",this.buildFilter),n.value=this.haystack,e.value=this.condition,t.value=this.needle,a.addEventListener("click",()=>{let{parentElement:o}=this;this.remove(),o?.dispatchEvent(new Event("change"))})}render(){super.render();let{haystack:n,condition:e,needle:t}=this.parts;n.textContent="",n.append(Zn("any field",{value:"*"}),...this.fields.map((o)=>{let i=o.name||o.prop;return Zn(`${i}`,{value:o.prop})})),e.textContent="";let a=Object.keys(this.filters).map((o)=>{let i=this.filters[o];return i.negative!==void 0?[Zn(i.caption,{value:o}),Zn(i.negative,{value:"~"+o})]:Zn(i.caption,{value:o})}).flat();if(e.append(...a),this.haystack!=="")n.value=this.haystack;if(this.condition!=="")e.value=this.condition;if(this.needle!=="")t.value=this.needle;this.buildFilter()}}var je=vt.elementCreator({tag:"xin-filter-part",styleSpec:{":host":{display:"flex"},':host svg[class^="icon-"]:':{height:"var(--font-size, 16px)",verticalAlign:"middle",fill:"var(--text-color)",pointerEvents:"none"},':host [part="haystack"], :host [part="condition"]':{flex:"1"},':host [part="needle"]':{flex:2},':host [hidden]+[part="padding"]':{display:"block",content:" ",flex:"1 1 auto"}}});class xt extends y{_fields=[];get fields(){return this._fields}set fields(n){this._fields=n,this.queueRender()}get state(){let{filterContainer:n}=this.parts;return[...n.children].map((e)=>e.state)}set state(n){let{fields:e,filters:t}=this,{filterContainer:a}=this.parts;a.textContent="";for(let o of n)a.append(je({fields:e,filters:t,...o}))}filter=Xa;description=Ha;addFilter=()=>{let{fields:n,filters:e}=this,{filterContainer:t}=this.parts;t.append(je({fields:n,filters:e}))};content=()=>[lt({part:"add",title:"add filter condition",onClick:this.addFilter,class:"round"},f.plus()),ws({part:"filterContainer"}),lt({part:"reset",title:"reset filter",onClick:this.reset},f.x())];filters=wt;reset=()=>{let{fields:n,filters:e}=this,{filterContainer:t}=this.parts;this.description=Ha,this.filter=Xa,t.textContent="",t.append(je({fields:n,filters:e})),this.dispatchEvent(new Event("change"))};buildFilter=()=>{let{filterContainer:n}=this.parts;if(n.children.length===0){this.reset();return}let e=[...n.children].map((a)=>a.filter),t=e.map((a)=>a.test);this.description=e.map((a)=>a.description).join(", "),this.filter=(a)=>a.filter((o)=>t.find((i)=>i(o)===!1)===void 0),this.dispatchEvent(new Event("change"))};connectedCallback(){super.connectedCallback();let{filterContainer:n}=this.parts;n.addEventListener("change",this.buildFilter),this.reset()}render(){super.render()}}var js=xt.elementCreator({tag:"xin-filter",styleSpec:{":host":{height:"auto",display:"grid",gridTemplateColumns:"32px calc(100% - 64px) 32px",alignItems:"center"},':host [part="filterContainer"]':{display:"flex",flexDirection:"column",alignItems:"stretch",flex:"1 1 auto"},':host [part="add"], :host [part="reset"]':{"--button-size":"var(--touch-size, 32px)",borderRadius:"999px",height:"var(--button-size)",lineHeight:"var(--button-size)",margin:"0",padding:"0",textAlign:"center",width:"var(--button-size)",flex:"0 0 var(--button-size)"}}}),{form:Ss,slot:et,xinSlot:Wa,label:Es,input:Ts,span:Ms}=g;function cn(n,e,t){if(t!==""&&t!==!1)n.setAttribute(e,t);else n.removeAttribute(e)}function Is(n){switch(n.type){case"checkbox":return n.checked;case"radio":{let e=n.parentElement?.querySelector(`input[type="radio"][name="${n.name}"]:checked`);return e?e.value:null}case"range":case"number":return Number(n.value);default:return Array.isArray(n.value)&&n.value.length===0?null:n.value}}function Fa(n,e){if(!(n instanceof HTMLElement));else if(n instanceof HTMLInputElement)switch(n.type){case"checkbox":n.checked=e;break;case"radio":n.checked=e===n.value;break;default:n.value=String(e||"")}else if(e!=null||n.value!=null)n.value=String(e||"")}class Te extends y{caption="";key="";type="";optional=!1;pattern="";placeholder="";min="";max="";step="";fixedPrecision=-1;value=null;content=Es(Wa({part:"caption"}),Ms({part:"field"},Wa({part:"input",name:"input"}),Ts({part:"valueHolder"})));constructor(){super();this.initAttributes("caption","key","type","optional","pattern","placeholder","min","max","step","fixedPrecision","prefix","suffix")}valueChanged=!1;handleChange=()=>{let{input:n,valueHolder:e}=this.parts,t=n.children[0]||e;if(t!==e)e.value=t.value;this.value=Is(t),this.valueChanged=!0;let a=this.closest("xin-form");if(a&&this.key!=="")switch(this.type){case"checkbox":a.fields[this.key]=t.checked;break;case"number":case"range":if(this.fixedPrecision>-1)t.value=Number(t.value).toFixed(this.fixedPrecision),a.fields[this.key]=Number(t.value);else a.fields[this.key]=Number(t.value);break;default:a.fields[this.key]=t.value}};initialize(n){let e=n.fields[this.key]!==void 0?n.fields[this.key]:this.value;if(e!=null&&e!==""){if(n.fields[this.key]==null)n.fields[this.key]=e;this.value=e}}connectedCallback(){super.connectedCallback();let{input:n,valueHolder:e}=this.parts,t=this.closest(kn.tagName);if(t instanceof kn)this.initialize(t);e.addEventListener("change",this.handleChange),n.addEventListener("change",this.handleChange,!0)}render(){if(this.valueChanged){this.valueChanged=!1;return}let{input:n,caption:e,valueHolder:t,field:a}=this.parts;if(e.textContent?.trim()==="")e.append(this.caption!==""?this.caption:this.key);if(this.type==="text"){n.textContent="";let o=g.textarea({value:this.value});if(this.placeholder)o.setAttribute("placeholder",this.placeholder);n.append(o)}else if(this.type==="color")n.textContent="",n.append(Qa({value:this.value}));else if(n.children.length===0)cn(t,"placeholder",this.placeholder),cn(t,"type",this.type),cn(t,"pattern",this.pattern),cn(t,"min",this.min),cn(t,"max",this.max),cn(t,"step",this.step);if(Fa(t,this.value),Fa(n.children[0],this.value),this.prefix?a.setAttribute("prefix",this.prefix):a.removeAttribute("prefix"),this.suffix?a.setAttribute("suffix",this.suffix):a.removeAttribute("suffix"),t.classList.toggle("hidden",n.children.length>0),n.children.length>0)t.setAttribute("tabindex","-1");else t.removeAttribute("tabindex");n.style.display=n.children.length===0?"none":"",cn(t,"required",!this.optional)}}class kn extends y{context={};value={};get isValid(){return[...this.querySelectorAll("*")].filter((n)=>n.required!==void 0).find((n)=>!n.reportValidity())===void 0}static styleSpec={":host":{display:"flex",flexDirection:"column"},":host::part(header), :host::part(footer)":{display:"flex"},":host::part(content)":{display:"flex",flexDirection:"column",overflow:"hidden auto",height:"100%",width:"100%",position:"relative",boxSizing:"border-box"},":host form":{display:"flex",flex:"1 1 auto",position:"relative",overflow:"hidden"}};content=[et({part:"header",name:"header"}),Ss({part:"form"},et({part:"content"})),et({part:"footer",name:"footer"})];getField=(n)=>{return this.querySelector(`xin-field[key="${n}"]`)};get fields(){if(typeof this.value==="string")try{this.value=JSON.parse(this.value)}catch(t){console.log("<xin-form> could not use its value, expects valid JSON"),this.value={}}let{getField:n}=this,e=this.dispatchEvent.bind(this);return new Proxy(this.value,{get(t,a){return t[a]},set(t,a,o){if(t[a]!==o){t[a]=o;let i=n(a);if(i)i.value=o;e(new Event("change"))}return!0}})}set fields(n){let e=[...this.querySelectorAll(Te.tagName)];for(let t of e)t.value=n[t.key]}submit=()=>{this.parts.form.dispatchEvent(new Event("submit"))};handleSubmit=(n)=>{n.preventDefault(),n.stopPropagation(),this.submitCallback(this.value,this.isValid)};submitCallback=(n,e)=>{console.log("override submitCallback to handle this data",{value:n,isValid:e})};connectedCallback(){super.connectedCallback();let{form:n}=this.parts;n.addEventListener("submit",this.handleSubmit)}}var _s=Te.elementCreator({tag:"xin-field",styleSpec:{':host [part="field"]':{position:"relative",display:"flex",alignItems:"center",gap:c.prefixSuffixGap("8px")},':host [part="field"][prefix]::before':{content:"attr(prefix)"},':host [part="field"][suffix]::after':{content:"attr(suffix)"},':host [part="field"] > *, :host [part="input"] > *':{width:"100%"},":host textarea":{resize:"none"},':host input[type="checkbox"]':{width:"fit-content"},":host .hidden":{position:"absolute",pointerEvents:"none",opacity:0}}}),Ps=kn.elementCreator({tag:"xin-form"});function bo(){return navigator.getGamepads().filter((n)=>n!==null).map((n)=>{let{id:e,axes:t,buttons:a}=n;return{id:e,axes:t,buttons:a.map((o,i)=>{let{pressed:s,value:l}=o;return{index:i,pressed:s,value:l}}).filter((o)=>o.pressed||o.value!==0).reduce((o,i)=>{return o[i.index]=i.value,o},{})}})}function Bs(){let n=bo();return n.length===0?"no active gamepads":n.map(({id:e,axes:t,buttons:a})=>{let o=t.map((s)=>s.toFixed(2)).join(" "),i=Object.keys(a).map((s)=>`[${s}](${a[Number(s)].toFixed(2)})`).join(" ");return`${e}
${o}
${i}`}).join(`
`)}function As(n){let e={};return n.input.onControllerAddedObservable.add((t)=>{t.onMotionControllerInitObservable.add((a)=>{let o={};a.getComponentIds().forEach((i)=>{let s=a.getComponent(i);if(o[i]={pressed:s.pressed},s.onButtonStateChangedObservable.add(()=>{o[i].pressed=s.pressed}),s.onAxisValueChangedObservable)o[i].axes=[],s.onAxisValueChangedObservable.add((l)=>{o[i].axes=l})}),e[a.handedness]=o})}),e}function Os(n){if(n===void 0||Object.keys(n).length===0)return"no xr inputs";return Object.keys(n).map((e)=>{let t=n[e],a=Object.keys(t).filter((o)=>t[o].pressed).join(" ");return`${e}
${a}`}).join(`
`)}var{div:bn,slot:qa,span:Ds,button:zs}=g;class Ct extends y{value=0;localized=!1;makeTab(n,e,t){let a=e.getAttribute("name"),o=e.querySelector('template[role="tab"]')?.content.cloneNode(!0)||(this.localized?Ee(a):Ds(a));return bn(o,{part:"tab",tabindex:0,role:"tab",ariaControls:t},e.hasAttribute("data-close")?zs({title:"close",class:"close"},f.x()):{})}static styleSpec={":host":{display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",boxShadow:"none !important"},slot:{position:"relative",display:"block",flex:"1",overflow:"hidden",overflowY:"auto"},'slot[name="after-tabs"]':{flex:"0 0 auto"},"::slotted([hidden])":{display:"none !important"},":host::part(tabpanel)":{display:"flex",flexDirection:"column",overflowX:"auto"},":host::part(tabrow)":{display:"flex"},":host .tabs":{display:"flex",userSelect:"none",whiteSpace:"nowrap"},":host .tabs > div":{padding:`${r.spacing50} ${r.spacing}`,cursor:"default",display:"flex",alignItems:"baseline"},':host .tabs > [aria-selected="true"]':{"--text-color":r.xinTabsSelectedColor,color:r.textColor},":host .elastic":{flex:"1"},":host .border":{background:"var(--xin-tabs-bar-color, #ccc)"},":host .border > .selected":{content:" ",width:0,height:"var(--xin-tabs-bar-height, 2px)",background:r.xinTabsSelectedColor,transition:"ease-out 0.2s"},":host button.close":{fill:r.textColor,border:0,background:"transparent",textAlign:"center",marginLeft:r.spacing50,padding:0},":host button.close > svg":{height:"12px"}};onCloseTab=null;content=[bn({role:"tabpanel",part:"tabpanel"},bn({part:"tabrow"},bn({class:"tabs",part:"tabs"}),bn({class:"elastic"}),qa({name:"after-tabs"})),bn({class:"border"},bn({class:"selected",part:"selected"}))),qa()];constructor(){super();this.initAttributes("localized")}addTabBody(n,e=!1){if(!n.hasAttribute("name"))throw console.error("element has no name attribute",n),new Error("element has no name attribute");if(this.append(n),this.setupTabs(),e)this.value=this.bodies.length-1;this.queueRender()}removeTabBody(n){n.remove(),this.setupTabs(),this.queueRender()}keyTab=(n)=>{let{tabs:e}=this.parts,t=[...e.children].indexOf(n.target);switch(n.key){case"ArrowLeft":this.value=(t+Number(e.children.length)-1)%e.children.length,e.children[this.value].focus(),n.preventDefault();break;case"ArrowRight":this.value=(t+1)%e.children.length,e.children[this.value].focus(),n.preventDefault();break;case" ":this.pickTab(n),n.preventDefault();break;default:}};get bodies(){return[...this.children].filter((n)=>n.hasAttribute("name"))}pickTab=(n)=>{let{tabs:e}=this.parts,t=n.target,a=t.closest("button.close")!==null,o=t.closest(".tabs > div"),i=[...e.children].indexOf(o);if(a){let s=this.bodies[i];if(!this.onCloseTab||this.onCloseTab(s)!==!1)this.removeTabBody(this.bodies[i])}else if(i>-1)this.value=i};setupTabs=()=>{let{tabs:n}=this.parts,e=[...this.children].filter((t)=>!t.hasAttribute("slot")&&t.hasAttribute("name"));if(n.textContent="",this.value>=e.length)this.value=e.length-1;for(let t in e){let a=e[t],o=`${this.instanceId}-${t}`;a.id=o;let i=this.makeTab(this,a,o);n.append(i)}};connectedCallback(){super.connectedCallback();let{tabs:n}=this.parts;n.addEventListener("click",this.pickTab),n.addEventListener("keydown",this.keyTab),this.setupTabs(),G.allInstances.add(this)}disconnectedCallback(){super.disconnectedCallback(),G.allInstances.delete(this)}localeChanged=()=>{this.queueRender()};onResize(){this.queueRender()}render(){let{tabs:n,selected:e}=this.parts,t=this.bodies;for(let a=0;a<t.length;a++){let o=t[a],i=n.children[a];if(this.value===Number(a))i.setAttribute("aria-selected","true"),e.style.marginLeft=`${i.offsetLeft-n.offsetLeft}px`,e.style.width=`${i.offsetWidth}px`,o.toggleAttribute("hidden",!1);else i.toggleAttribute("aria-selected",!1),o.toggleAttribute("hidden",!0)}}}var yo=Ct.elementCreator({tag:"xin-tabs"}),{div:ve,xinSlot:Vs,style:Xs,button:yn,h4:Hs,pre:Ns}=g,Ws=(async()=>{}).constructor;class On extends y{persistToDom=!1;prettier=!1;prefix="lx";storageKey="live-example-payload";context={};uuid=crypto.randomUUID();remoteId="";lastUpdate=0;interval;static insertExamples(n,e={}){let t=[...n.querySelectorAll(".language-html,.language-js,.language-css")].filter((a)=>!a.closest(On.tagName)).map((a)=>({block:a.parentElement,language:a.classList[0].split("-").pop(),code:a.innerText}));for(let a=0;a<t.length;a+=1){let o=[t[a]];while(a<t.length-1&&t[a].block.nextElementSibling===t[a+1].block)o.push(t[a+1]),a+=1;let i=Me({context:e});o[0].block.parentElement.insertBefore(i,o[0].block),o.forEach((s)=>{switch(s.language){case"js":i.js=s.code;break;case"html":i.html=s.code;break;case"css":i.css=s.code;break}s.block.remove()}),i.showDefaultTab()}}constructor(){super();this.initAttributes("persistToDom","prettier")}get activeTab(){let{editors:n}=this.parts;return[...n.children].find((e)=>e.getAttribute("hidden")===null)}getEditorValue(n){return this.parts[n].value}setEditorValue(n,e){let t=this.parts[n];t.value=e}get css(){return this.getEditorValue("css")}set css(n){this.setEditorValue("css",n)}get html(){return this.getEditorValue("html")}set html(n){this.setEditorValue("html",n)}get js(){return this.getEditorValue("js")}set js(n){this.setEditorValue("js",n)}updateUndo=()=>{let{activeTab:n}=this,{undo:e,redo:t}=this.parts;if(n instanceof Bn&&n.editor!==void 0){let a=n.editor.session.getUndoManager();e.disabled=!a.hasUndo(),t.disabled=!a.hasRedo()}else e.disabled=!0,t.disabled=!0};undo=()=>{let{activeTab:n}=this;if(n instanceof Bn)n.editor.undo()};redo=()=>{let{activeTab:n}=this;if(n instanceof Bn)n.editor.redo()};get isMaximized(){return this.classList.contains("-maximize")}flipLayout=()=>{this.classList.toggle("-vertical")};exampleMenu=()=>{Z({target:this.parts.exampleWidgets,width:"auto",menuItems:[{icon:"edit",caption:"view/edit code",action:this.showCode},{icon:"editDoc",caption:"view/edit code in a new window",action:this.openEditorWindow},null,{icon:this.isMaximized?"minimize":"maximize",caption:this.isMaximized?"restore preview":"maximize preview",action:this.toggleMaximize}]})};content=()=>[ve({part:"example"},Xs({part:"style"}),yn({title:"example menu",part:"exampleWidgets",onClick:this.exampleMenu},f.code())),ve({class:"code-editors",part:"codeEditors",hidden:!0},Hs("Code"),yn({title:"close code",class:"transparent close-button",onClick:this.closeCode},f.x()),yo({part:"editors",onChange:this.updateUndo},xe({name:"js",mode:"javascript",part:"js"}),xe({name:"html",mode:"html",part:"html"}),xe({name:"css",mode:"css",part:"css"}),ve({slot:"after-tabs",class:"row"},yn({title:"undo",part:"undo",class:"transparent",onClick:this.undo},f.undo()),yn({title:"redo",part:"redo",class:"transparent",onClick:this.redo},f.redo()),yn({title:"flip direction",class:"transparent",onClick:this.flipLayout},f.sidebar()),yn({title:"copy as markdown",class:"transparent",onClick:this.copy},f.copy()),yn({title:"reload",class:"transparent",onClick:this.refreshRemote},f.refresh())))),Vs({part:"sources",hidden:!0})];connectedCallback(){super.connectedCallback();let{sources:n}=this.parts;this.initFromElements([...n.children]),addEventListener("storage",this.remoteChange),this.interval=setInterval(this.remoteChange,500),this.undoInterval=setInterval(this.updateUndo,250)}disconnectedCallback(){super.disconnectedCallback();let{storageKey:n,remoteKey:e}=this;clearInterval(this.interval),clearInterval(this.undoInterval),localStorage.setItem(n,JSON.stringify({remoteKey:e,sentAt:Date.now(),close:!0}))}copy=()=>{let n=this.js!==""?"```js\n"+this.js.trim()+"\n```\n":"",e=this.html!==""?"```html\n"+this.html.trim()+"\n```\n":"",t=this.css!==""?"```css\n"+this.css.trim()+"\n```\n":"";navigator.clipboard.writeText(n+e+t)};toggleMaximize=()=>{this.classList.toggle("-maximize")};get remoteKey(){return this.remoteId!==""?this.prefix+"-"+this.remoteId:this.prefix+"-"+this.uuid}remoteChange=(n)=>{let e=localStorage.getItem(this.storageKey);if(n instanceof StorageEvent&&n.key!==this.storageKey)return;if(e===null)return;let{remoteKey:t,sentAt:a,css:o,html:i,js:s,close:l}=JSON.parse(e);if(a<=this.lastUpdate)return;if(t!==this.remoteKey)return;if(l===!0)window.close();console.log("received new code",a,this.lastUpdate),this.lastUpdate=a,this.css=o,this.html=i,this.js=s,this.refresh()};showCode=()=>{this.classList.add("-maximize"),this.classList.toggle("-vertical",this.offsetHeight>this.offsetWidth),this.parts.codeEditors.hidden=!1};closeCode=()=>{if(this.remoteId!=="")window.close();else this.classList.remove("-maximize"),this.parts.codeEditors.hidden=!0};openEditorWindow=()=>{let{storageKey:n,remoteKey:e,css:t,html:a,js:o,uuid:i,prefix:s}=this,l=location.href.split("?")[0]+`?${s}=${i}`;localStorage.setItem(n,JSON.stringify({remoteKey:e,sentAt:Date.now(),css:t,html:a,js:o})),window.open(l)};refreshRemote=()=>{let{remoteKey:n,css:e,html:t,js:a}=this;localStorage.setItem(this.storageKey,JSON.stringify({remoteKey:n,sentAt:Date.now(),css:e,html:t,js:a}))};updateSources=()=>{if(this.persistToDom){let{sources:n}=this.parts;n.innerText="";for(let e of["js","css","html"])if(this[e])n.append(Ns({class:`language-${e}`,innerHTML:this[e]}))}};refresh=()=>{if(this.remoteId!=="")return;let{example:n,style:e}=this.parts,t=ve({class:"preview"});t.innerHTML=this.html,e.innerText=this.css;let a=n.querySelector(".preview");if(a)a.replaceWith(t);else n.insertBefore(t,this.parts.exampleWidgets);let o={preview:t,...this.context};try{if(new Ws(...Object.keys(o),this.js)(...Object.values(o)).catch((i)=>console.error(i)),this.persistToDom)this.updateSources()}catch(i){console.error(i),window.alert(`Error: ${i}, the console may have more information…`)}};initFromElements(n){for(let e of n){e.hidden=!0;let[t,...a]=e.innerHTML.split(`
`);if(["js","html","css"].includes(t)){let o=a.filter((s)=>s.trim()!=="").map((s)=>s.match(/^\s*/)[0].length).sort()[0],i=(o>0?a.map((s)=>s.substring(o)):a).join(`
`);this.parts[t].value=i}else{let o=["js","html","css"].find((i)=>e.matches(`.language-${i}`));if(o)this.parts[o].value=o==="html"?e.innerHTML:e.innerText}}}showDefaultTab(){let{editors:n}=this.parts;if(this.js!=="")n.value=0;else if(this.html!=="")n.value=1;else if(this.css!=="")n.value=2}render(){if(super.render(),this.remoteId!==""){let n=localStorage.getItem(this.storageKey);if(n!==null){let{remoteKey:e,sentAt:t,css:a,html:o,js:i}=JSON.parse(n);if(this.remoteKey!==e)return;this.lastUpdate=t,this.css=a,this.html=o,this.js=i,this.parts.example.hidden=!0,this.parts.codeEditors.hidden=!1,this.classList.add("-maximize"),this.updateUndo()}}else this.refresh()}}var Me=On.elementCreator({tag:"xin-example",styleSpec:{":host":{"--xin-example-height":"320px","--code-editors-bar-bg":"#777","--code-editors-bar-color":"#fff","--widget-bg":"#fff8","--widget-color":"#000",position:"relative",display:"flex",height:"var(--xin-example-height)",background:"var(--background)",boxSizing:"border-box"},":host.-maximize":{position:"fixed",left:"0",top:"0",height:"100vh",width:"100vw",margin:"0 !important"},".-maximize":{zIndex:101},":host.-vertical":{flexDirection:"column"},":host .icon-sidebar":{transform:"rotateZ(180deg)"},":host.-vertical .icon-sidebar":{transform:"rotateZ(270deg)"},":host.-maximize .hide-if-maximized, :host:not(.-maximize) .show-if-maximized":{display:"none"},':host [part="example"]':{flex:"1 1 50%",height:"100%",position:"relative",overflowX:"auto"},":host .preview":{height:"100%",position:"relative",overflow:"hidden",boxShadow:"inset 0 0 0 2px #8883"},':host [part="editors"]':{flex:"1 1 200px",height:"100%",position:"relative"},':host [part="exampleWidgets"]':{position:"absolute",left:"5px",bottom:"5px","--widget-color":"var(--brand-color)",borderRadius:"5px",width:"44px",height:"44px",lineHeight:"44px",zIndex:"100"},':host [part="exampleWidgets"] svg':{fill:"var(--widget-color)"},":host .code-editors":{overflow:"hidden",background:"white",position:"relative",top:"0",right:"0",flex:"1 1 50%",height:"100%",flexDirection:"column",zIndex:"10"},":host .code-editors:not([hidden])":{display:"flex"},":host .code-editors > h4":{padding:"5px",margin:"0",textAlign:"center",background:"var(--code-editors-bar-bg)",color:"var(--code-editors-bar-color)",cursor:"move"},":host .close-button":{position:"absolute",top:"0",right:"0",color:"var(--code-editors-bar-color)"},":host button.transparent, :host .sizer":{width:"32px",height:"32px",lineHeight:"32px",textAlign:"center",padding:"0",margin:"0"},":host .sizer":{cursor:"nwse-resize"}}});function Fs(n){let e=[...n.querySelectorAll("pre")].filter((t)=>["js","html","css","json"].includes(t.innerText.split(`
`)[0]));for(let t=0;t<e.length;t++){let a=[e[t]];while(e[t].nextElementSibling===e[t+1])a.push(e[t+1]),t+=1;let o=Me();n.insertBefore(o,a[0]),o.initFromElements(a)}}var qs=new URL(window.location.href).searchParams,Ya=qs.get("lx");if(Ya)document.title+=" [code editor]",document.body.textContent="",document.body.append(Me({remoteId:Ya}));var{div:Ys}=g;class fn extends y{coords="65.01715565258993,25.48081004203459,12";content=Ys({style:{width:"100%",height:"100%"}});get map(){return this._map}mapStyle="mapbox://styles/mapbox/streets-v12";token="";static mapboxCSSAvailable;static mapboxAvailable;_map;static styleSpec={":host":{display:"inline-block",position:"relative",width:"400px",height:"400px",textAlign:"left"}};constructor(){super();if(this.initAttributes("coords","token","mapStyle"),fn.mapboxCSSAvailable===void 0)fn.mapboxCSSAvailable=Ja("https://api.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.css").catch((n)=>{console.error("failed to load mapbox-gl.css",n)}),fn.mapboxAvailable=wn("https://api.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.js").catch((n)=>{console.error("failed to load mapbox-gl.js",n)})}connectedCallback(){if(super.connectedCallback(),!this.token)console.error("mapbox requires an access token which you can provide via the token attribute")}render(){if(super.render(),!this.token)return;let{div:n}=this.parts,[e,t,a]=this.coords.split(",").map((o)=>Number(o));if(this.map)this.map.remove();fn.mapboxAvailable.then(({mapboxgl:o})=>{console.log("%cmapbox may complain about missing css -- don't panic!","background: orange; color: black; padding: 0 5px;"),o.accessToken=this.token,this._map=new o.Map({container:n,style:this.mapStyle,zoom:a,center:[t,e]}),this._map.on("render",()=>this._map.resize())})}}var Ls=fn.elementCreator({tag:"xin-map"});function go(n,e){if(e==null)e="";else if(typeof e!=="string")e=String(e);return e.replace(/\{\{([^}]+)\}\}/g,(t,a)=>{let o=I[`${n}${a.startsWith("[")?a:"."+a}`];return o===void 0?t:go(n,String(o))})}class jt extends y{src="";value="";content=null;elements=!1;context={};constructor(){super();this.initAttributes("src","elements","context")}connectedCallback(){if(super.connectedCallback(),this.src!=="")(async()=>{let n=await fetch(this.src);this.value=await n.text()})();else if(this.value==="")if(this.elements)this.value=this.innerHTML;else this.value=this.textContent!=null?this.textContent:""}didRender=()=>{};render(){super.render(),I[this.instanceId]=typeof this.context==="string"?JSON.parse(this.context):this.context;let n=go(this.instanceId,this.value);if(this.elements){let e=n.split(`
`).reduce((t,a)=>{if(a.startsWith("<")||t.length===0)t.push(a);else{let o=t[t.length-1];if(!o.startsWith("<")||!o.endsWith(">"))t[t.length-1]+=`
`+a;else t.push(a)}return t},[]);this.innerHTML=e.map((t)=>t.startsWith("<")&&t.endsWith(">")?t:C(t,{mangle:!1,headerIds:!1})).join("")}else this.innerHTML=C(n,{mangle:!1,headerIds:!1});this.didRender()}}var St=jt.elementCreator({tag:"xin-md"}),{div:tt,button:$s}=g,Rs={error:"red",warn:"orange",info:"royalblue",log:"gray",success:"green",progress:"royalblue"};class vn extends y{static singleton;static styleSpec={":host":{_notificationSpacing:8,_notificationWidth:360,_notificationPadding:`${r.notificationSpacing} ${r.notificationSpacing50} ${r.notificationSpacing} ${r.notificationSpacing200}`,_notificationBg:"#fafafa",_notificationAccentColor:"#aaa",_notificationTextColor:"#444",_notificationIconSize:r.notificationSpacing300,_notificationButtonSize:48,_notificationBorderWidth:"3px 0 0",_notificationBorderRadius:r.notificationSpacing50,position:"fixed",left:0,right:0,bottom:0,paddingBottom:r.notificationSpacing,width:r.notificationWidth,display:"flex",flexDirection:"column-reverse",margin:"0 auto",gap:r.notificationSpacing,maxHeight:"50vh",overflow:"hidden auto",boxShadow:"none !important"},":host *":{color:r.notificationTextColor},":host .note":{display:"grid",background:r.notificationBg,padding:r.notificationPadding,gridTemplateColumns:`${r.notificationIconSize} 1fr ${r.notificationButtonSize}`,gap:r.notificationSpacing,alignItems:"center",borderRadius:r.notificationBorderRadius,boxShadow:`0 2px 8px #0006, inset 0 0 0 2px ${r.notificationAccentColor}`,borderColor:r.notificationAccentColor,borderWidth:r.notificationBorderWidth,borderStyle:"solid",transition:"0.5s ease-in",transitionProperty:"margin, opacity",zIndex:1},":host .note .icon":{fill:r.notificationAccentColor},":host .note button":{display:"flex",lineHeight:r.notificationButtonSize,padding:0,margin:0,height:r.notificationButtonSize,width:r.notificationButtonSize,background:"transparent",alignItems:"center",justifyContent:"center",boxShadow:"none",border:"none",position:"relative"},":host .note button:hover svg":{fill:r.notificationAccentColor},":host .note button:active svg":{borderRadius:99,fill:r.notificationBg,background:r.notificationAccentColor,padding:r.spacing50},":host .note svg":{height:r.notificationIconSize,width:r.notificationIconSize,pointerEvents:"none"},":host .message":{display:"flex",flexDirection:"column",alignItems:"center",gap:r.notificationSpacing},":host .note.closing":{opacity:0,zIndex:0}};static removeNote(n){n.classList.add("closing"),n.style.marginBottom=-n.offsetHeight+"px";let e=()=>{n.remove()};n.addEventListener("transitionend",e),setTimeout(e,1000)}static post(n){let{message:e,duration:t,type:a,close:o,progress:i,icon:s}=Object.assign({type:"info",duration:-1},typeof n==="string"?{message:n}:n);if(!this.singleton)this.singleton=fo();let l=this.singleton;document.body.append(l),l.style.zIndex=String(pt()+1);let d=Rs[a],h=i||a==="progress"?g.progress():{},m=()=>{if(o)o();vn.removeNote(u)},p=s instanceof SVGElement?s:s?f[s]({class:"icon"}):f.info({class:"icon"}),u=tt({class:`note ${a}`,style:{_notificationAccentColor:d}},p,tt({class:"message"},tt(e),h),$s({class:"close",title:"close",apply(E){E.addEventListener("click",m)}},f.x()));if(l.shadowRoot.append(u),h instanceof HTMLProgressElement&&i instanceof Function){h.setAttribute("max",String(100)),h.value=i();let E=setInterval(()=>{if(!l.shadowRoot.contains(u)){clearInterval(E);return}let T=i();if(h.value=T,T>=100)vn.removeNote(u)},1000)}if(t>0)setTimeout(()=>{vn.removeNote(u)},t*1000);return u.scrollIntoView(),m}content=null}var fo=vn.elementCreator({tag:"xin-notification"});function Gs(n){return vn.post(n)}var wo=async(n,e="SHA-1")=>{let t=new TextEncoder().encode(n),a=await crypto.subtle.digest(e,t);return Array.from(new Uint8Array(a)).map((o)=>o.toString(16).padStart(2,"0")).join("")},vo=async(n)=>{let e=await wo(n),t=await fetch(`https://weakpass.com/api/v1/search/${e}`);if(t.ok){let a=await t.json();console.log("password found in weakpass database",a)}return t.status!==404},{span:at,xinSlot:Js}=g;class Et extends y{minLength=8;goodLength=12;indicatorColors="#f00,#f40,#f80,#ef0,#8f0,#0a2";descriptionColors="#000,#000,#000,#000,#000,#fff";issues={tooShort:!0,short:!0,noUpper:!0,noLower:!0,noNumber:!0,noSpecial:!0};issueDescriptions={tooShort:"too short",short:"short",noUpper:"no upper case",noLower:"no lower case",noNumber:"no digits",noSpecial:"no unusual characters"};value=0;strengthDescriptions=["unacceptable","very weak","weak","moderate","strong","very strong"];constructor(){super();this.initAttributes("minLength","goodLength","indicatorColors")}strength(n){return this.issues={tooShort:n.length<this.minLength,short:n.length<this.goodLength,noUpper:!n.match(/[A-Z]/),noLower:!n.match(/[a-z]/),noNumber:!n.match(/[0-9]/),noSpecial:!n.match(/[^a-zA-Z0-9]/)},this.issues.tooShort?0:Object.values(this.issues).filter((e)=>!e).length-1}async isBreached(){let n=this.querySelector("input")?.value;if(!n||typeof n!=="string")return!0;return await vo(n)}updateIndicator=(n)=>{let{level:e,description:t}=this.parts,a=this.indicatorColors.split(","),o=this.descriptionColors.split(","),i=this.strength(n);if(this.value!==i)this.value=i,this.dispatchEvent(new Event("change"));e.style.width=`${(i+1)*16.67}%`,this.style.setProperty("--indicator-color",a[i]),this.style.setProperty("--description-color",o[i]),t.textContent=this.strengthDescriptions[i]};update=(n)=>{let e=n.target.closest("input");this.updateIndicator(e?.value||"")};content=()=>[Js({onInput:this.update}),at({part:"meter"},at({part:"level"}),at({part:"description"}))];render(){super.render();let n=this.querySelector("input");this.updateIndicator(n?.value)}}var Us=Et.elementCreator({tag:"xin-password-strength",styleSpec:{":host":{display:"inline-flex",flexDirection:"column",gap:r.spacing50,position:"relative"},":host xin-slot":{display:"flex"},':host [part="meter"]':{display:"block",position:"relative",height:c.meterHeight("24px"),background:c.indicatorBg("white"),borderRadius:c.meterRadius("4px"),boxShadow:c.meterShadow(`inset 0 0 0 2px ${r.indicatorColor}`)},':host [part="level"]':{height:c.levelHeight("20px"),content:'" "',display:"inline-block",width:0,transition:"0.15s ease-out",background:r.indicatorColor,margin:c.levelMargin("2px"),borderRadius:c.levelRadius("2px")},':host [part="description"]':{position:"absolute",inset:"0",color:r.descriptionColor,height:c.meterHeight("24px"),lineHeight:c.meterHeight("24px"),textAlign:"center"}}}),{span:ot}=g;class Tt extends y{iconSize=24;min=1;max=5;step=1;value=null;icon="star";color="#f91";emptyColor="#8888";emptyStrokeWidth=2;readonly=!1;hollow=!1;static styleSpec={":host":{display:"inline-block",position:"relative",width:"fit-content"},":host::part(container)":{position:"relative",display:"inline-block"},":host::part(empty), :host::part(filled)":{height:"100%",whiteSpace:"nowrap",overflow:"hidden"},":host::part(empty)":{pointerEvents:"none",_textColor:"transparent"},':host [part="empty"]:not(.hollow)':{fill:r.ratingEmptyColor},":host .hollow":{fill:"none",stroke:r.ratingEmptyColor,strokeWidth:r.ratingEmptyStrokeWidth},":host::part(filled)":{position:"absolute",left:0,fill:r.ratingColor,stroke:r.ratingColor,strokeWidth:r.ratingEmptyStrokeWidth},":host svg":{transform:"scale(0.7)",pointerEvents:"all !important",transition:"0.25s ease-in-out"},":host svg:hover":{transform:"scale(0.9)"},":host svg:active":{transform:"scale(1)"}};constructor(){super();this.initAttributes("max","min","icon","step","color","emptyColor","readonly","iconSize","hollow")}content=()=>ot({part:"container"},ot({part:"empty"}),ot({part:"filled"}));displayValue(n){let{empty:e,filled:t}=this.parts,a=Math.round((n||0)/this.step)*this.step;t.style.width=a/this.max*e.offsetWidth+"px"}update=(n)=>{if(this.readonly)return;let{empty:e}=this.parts,t=n instanceof MouseEvent?n.pageX-e.getBoundingClientRect().x:0,a=Math.min(Math.max(this.min,Math.round(t/e.offsetWidth*this.max/this.step+this.step*0.5)*this.step),this.max);if(n.type==="click")this.value=a;else if(n.type==="mousemove")this.displayValue(a);else this.displayValue(this.value||0)};handleKey=(n)=>{let e=Number(this.value);if(e==null)e=Math.round((this.min+this.max)*0.5*this.step)*this.step;let t=!1;switch(n.key){case"ArrowUp":case"ArrowRight":e+=this.step,t=!0;break;case"ArrowDown":case"ArrowLeft":e-=this.step,t=!0;break}if(this.value=Math.max(Math.min(e,this.max),this.min),t)n.stopPropagation(),n.preventDefault()};connectedCallback(){super.connectedCallback();let{container:n}=this.parts;n.tabIndex=0,n.addEventListener("mousemove",this.update,!0),n.addEventListener("mouseleave",this.update),n.addEventListener("blur",this.update),n.addEventListener("click",this.update),n.addEventListener("keydown",this.handleKey)}_renderedIcon="";render(){if(super.render(),this.style.setProperty("--rating-color",this.color),this.style.setProperty("--rating-empty-color",this.emptyColor),this.style.setProperty("--rating-empty-stroke-width",String(this.emptyStrokeWidth*32)),this.readonly)this.role="image";else this.role="slider";this.ariaLabel=`rating ${this.value} out of ${this.max}`,this.ariaValueMax=String(this.max),this.ariaValueMin=String(this.min),this.ariaValueNow=this.value===null?String(-1):String(this.value);let{empty:n,filled:e}=this.parts,t=this.iconSize+"px";if(n.classList.toggle("hollow",this.hollow),this._renderedIcon!==this.icon){this._renderedIcon=this.icon;for(let a=0;a<this.max;a++)n.append(f[this.icon]({height:t})),e.append(f[this.icon]({height:t}))}this.style.height=t,this.displayValue(this.value)}}var Ks=Tt.elementCreator({tag:"xin-rating"}),{xinSlot:La,div:Zs,button:Qs,span:xo}=g,ks=[{caption:"Title",tagType:"H1"},{caption:"Heading",tagType:"H2"},{caption:"Subheading",tagType:"H3"},{caption:"Minor heading",tagType:"H4"},{caption:"Body",tagType:"P"},{caption:"Code Block",tagType:"PRE"}];function Mt(n=ks){return mt({title:"paragraph style",slot:"toolbar",class:"block-style",options:n.map(({caption:e,tagType:t})=>({caption:e,value:`formatBlock,${t}`}))})}function An(n="10px"){return xo({slot:"toolbar",style:{flex:`0 0 ${n}`,content:" "}})}function nl(n="10px"){return xo({slot:"toolbar",style:{flex:`0 0 ${n}`,content:" "}})}function Y(n,e,t){return Qs({slot:"toolbar",dataCommand:e,title:n},t)}var el=()=>[Y("left-justify","justifyLeft",f.alignLeft()),Y("center","justifyCenter",f.alignCenter()),Y("right-justify","justifyRight",f.alignRight()),An(),Y("bullet list","insertUnorderedList",f.listBullet()),Y("numbered list","insertOrderedList",f.listNumber()),An(),Y("indent","indent",f.blockIndent()),Y("indent","outdent",f.blockOutdent())],Co=()=>[Y("bold","bold",f.fontBold()),Y("italic","italic",f.fontItalic()),Y("underline","underline",f.fontUnderline())],tl=()=>[Mt(),An(),...Co()],jo=()=>[Mt(),An(),...el(),An(),...Co()];class It extends y{widgets="default";isInitialized=!1;get value(){return this.isInitialized?this.parts.doc.innerHTML:this.savedValue||this.innerHTML}set value(n){if(this.isInitialized)this.parts.doc.innerHTML=n;else this.innerHTML=n}blockElement(n){let{doc:e}=this.parts;while(n.parentElement!==null&&n.parentElement!==e)n=n.parentElement;return n.parentElement===e?n:void 0}get selectedBlocks(){let{doc:n}=this.parts,e=window.getSelection();if(e===null)return[];let t=[];for(let a=0;a<e.rangeCount;a++){let o=e.getRangeAt(a);if(!n.contains(o.commonAncestorContainer))continue;let i=this.blockElement(o.startContainer),s=this.blockElement(o.endContainer);t.push(i);while(i!==s&&i!==null)i=i.nextElementSibling,t.push(i)}return t}get selectedText(){let n=window.getSelection();if(n===null)return"";return this.selectedBlocks.length?n.toString():""}selectionChange=()=>{};handleSelectChange=(n)=>{let e=n.target.closest(ne.tagName);if(e==null)return;this.doCommand(e.value)};handleButtonClick=(n)=>{let e=n.target.closest("button");if(e==null)return;this.doCommand(e.dataset.command)};content=[La({name:"toolbar",part:"toolbar",onClick:this.handleButtonClick,onChange:this.handleSelectChange}),Zs({part:"doc",contenteditable:!0,style:{flex:"1 1 auto",outline:"none"}}),La({part:"content"})];constructor(){super();this.initAttributes("widgets")}doCommand(n){if(n===void 0)return;let e=n.split(",");console.log("execCommand",e[0],!1,...e.slice(1)),document.execCommand(e[0],!1,...e.slice(1))}updateBlockStyle(){let n=this.parts.toolbar.querySelector(".block-style");if(n===null)return;let e=this.selectedBlocks.map((t)=>t.tagName);e=[...new Set(e)],n.value=e.length===1?`formatBlock,${e[0]}`:""}connectedCallback(){super.connectedCallback();let{doc:n,content:e}=this.parts;if(e.innerHTML!==""&&n.innerHTML==="")n.innerHTML=e.innerHTML,e.innerHTML="";this.isInitialized=!0,e.style.display="none",document.addEventListener("selectionchange",(t)=>{this.updateBlockStyle(),this.selectionChange(t,this)})}render(){let{toolbar:n}=this.parts;if(super.render(),n.children.length===0)switch(this.widgets){case"minimal":n.append(...tl());break;case"default":n.append(...jo());break}}}var al=It.elementCreator({tag:"xin-word",styleSpec:{":host":{display:"flex",flexDirection:"column",height:"100%"},':host [part="toolbar"]':{padding:"4px",display:"flex",gap:"0px",flex:"0 0 auto",flexWrap:"wrap"}}}),{div:ol,slot:il,label:sl,span:ll,input:$a}=g;class _t extends y{choices="";other="";multiple=!1;name="";placeholder="Please specify…";localized=!1;value=null;get values(){return(this.value||"").split(",").map((n)=>n.trim()).filter((n)=>n!=="")}content=()=>[il(),ol({part:"options"},$a({part:"custom",hidden:!0}))];static styleSpec={":host":{display:"inline-flex",gap:c.segmentedOptionGap("8px"),alignItems:c.segmentedAlignItems("center")},":host, :host::part(options)":{flexDirection:c.segmentedDirection("row")},":host label":{display:"inline-grid",alignItems:"center",gap:c.segmentedOptionGap("8px"),gridTemplateColumns:c.segmentedOptionGridColumns("0px 24px 1fr"),padding:c.segmentedOptionPadding("4px 12px"),font:c.segmentedOptionFont("16px")},":host label:has(:checked)":{color:c.segmentedOptionCurrentColor("#eee"),background:c.segmentedOptionCurrentBackground("#44a")},":host svg":{height:c.segmentOptionIconSize("16px"),fill:c.segmentedOptionIconColor("currentColor")},":host label.no-icon":{gap:0,gridTemplateColumns:c.segmentedOptionGridColumns("0px 1fr")},':host input[type="radio"], :host input[type="checkbox"]':{visibility:c.segmentedInputVisibility("hidden")},":host::part(options)":{display:"flex",borderRadius:c.segmentedOptionsBorderRadius("8px"),background:c.segmentedOptionsBackground("#fff"),color:c.segmentedOptionColor("#222"),overflow:"hidden",alignItems:c.segmentedOptionAlignItems("stretch")},":host::part(custom)":{padding:c.segmentedOptionPadding("4px 12px"),color:c.segmentedOptionCurrentColor("#eee"),background:c.segmentedOptionCurrentBackground("#44a"),font:c.segmentedOptionFont("16px"),border:"0",outline:"none"},":host::part(custom)::placeholder":{color:c.segmentedOptionCurrentColor("#eee"),opacity:c.segmentedPlaceholderOpacity(0.75)}};constructor(){super();this.initAttributes("direction","choices","other","multiple","name","placeholder","localized")}valueChanged=!1;handleChange=()=>{let{options:n,custom:e}=this.parts;if(this.multiple){let t=[...n.querySelectorAll("input:checked")];this.value=t.map((a)=>a.value).join(",")}else{let t=n.querySelector("input:checked");if(!t)this.value=null;else if(t.value)e.setAttribute("hidden",""),this.value=t.value;else e.removeAttribute("hidden"),e.focus(),e.select(),this.value=e.value}this.valueChanged=!0};handleKey=(n)=>{switch(n.code){case"Space":n.target.click();break}};connectedCallback(){super.connectedCallback();let{options:n}=this.parts;if(this.name==="")this.name=this.instanceId;if(n.addEventListener("change",this.handleChange),n.addEventListener("keydown",this.handleKey),this.other&&this.multiple)console.warn(this,"is set to [other] and [multiple]; [other] will be ignored"),this.other=""}get _choices(){let n=Array.isArray(this.choices)?this.choices:this.choices.split(",").filter((e)=>e.trim()!=="").map((e)=>{let[t,a]=e.split("=").map((l)=>l.trim()),[o,i]=(a||t).split(":").map((l)=>l.trim()),s=i?f[i]():"";return{value:t,icon:s,caption:o}});if(this.other&&!this.multiple){let[e,t]=this.other.split(":");n.push({value:"",caption:e,icon:t})}return n}get isOtherValue(){return Boolean(this.value===""||this.value&&!this._choices.find((n)=>n.value===this.value))}render(){if(super.render(),this.valueChanged){this.valueChanged=!1;return}let{options:n,custom:e}=this.parts;n.textContent="";let t=this.multiple?"checkbox":"radio",{values:a,isOtherValue:o}=this;if(n.append(...this._choices.map((i)=>{return sl({tabindex:0},$a({type:t,name:this.name,value:i.value,checked:a.includes(i.value)||i.value===""&&o,tabIndex:-1}),i.icon||{class:"no-icon"},this.localized?Ee(i.caption):ll(i.caption))})),this.other&&!this.multiple)e.hidden=!o,e.value=o?this.value:"",e.placeholder=this.placeholder,n.append(e)}}var rl=_t.elementCreator({tag:"xin-segmented"}),{slot:Ra}=g;class Pt extends y{minSize=800;navSize=200;compact=!1;content=[Ra({name:"nav",part:"nav"}),Ra({part:"content"})];_contentVisible=!1;get contentVisible(){return this._contentVisible}set contentVisible(n){this._contentVisible=n,this.queueRender()}static styleSpec={":host":{display:"grid",gridTemplateColumns:`${c.navWidth("50%")} ${c.contentWidth("50%")}`,gridTemplateRows:"100%",position:"relative",margin:c.margin("0 0 0 -100%"),transition:c.sideNavTransition("0.25s ease-out")},":host slot":{position:"relative"},":host slot:not([name])":{display:"block"},':host slot[name="nav"]':{display:"block"}};onResize=()=>{let{content:n}=this.parts,e=this.offsetParent;if(e===null)return;if(this.compact=e.offsetWidth<this.minSize,[...this.childNodes].find((t)=>t instanceof Element?t.getAttribute("slot")!=="nav":!0)===void 0){this.style.setProperty("--nav-width","100%"),this.style.setProperty("--content-width","0%");return}if(!this.compact)n.classList.add("-xin-sidenav-visible"),this.style.setProperty("--nav-width",`${this.navSize}px`),this.style.setProperty("--content-width",`calc(100% - ${this.navSize}px)`),this.style.setProperty("--margin","0");else if(n.classList.remove("-xin-sidenav-visible"),this.style.setProperty("--nav-width","50%"),this.style.setProperty("--content-width","50%"),this.contentVisible)this.style.setProperty("--margin","0 0 0 -100%");else this.style.setProperty("--margin","0 -100% 0 0")};observer;connectedCallback(){super.connectedCallback(),this.contentVisible=this.parts.content.childNodes.length===0,globalThis.addEventListener("resize",this.onResize),this.observer=new MutationObserver(this.onResize),this.observer.observe(this,{childList:!0}),this.style.setProperty("--side-nav-transition","0s"),setTimeout(()=>{this.style.removeProperty("--side-nav-transition")},250)}disconnectedCallback(){super.disconnectedCallback(),this.observer.disconnect()}constructor(){super();this.initAttributes("minSize","navSize","compact")}render(){super.render(),this.onResize()}}var Bt=Pt.elementCreator({tag:"xin-sidenav"}),{slot:Ga}=g;class At extends y{minWidth=0;minHeight=0;value="normal";content=[Ga({part:"normal"}),Ga({part:"small",name:"small"})];static styleSpec={":host":{display:"inline-block",position:"relative"}};constructor(){super();this.initAttributes("minWidth","minHeight")}onResize=()=>{let{normal:n,small:e}=this.parts,t=this.offsetParent;if(!(t instanceof HTMLElement))return;else if(t.offsetWidth<this.minWidth||t.offsetHeight<this.minHeight)n.hidden=!0,e.hidden=!1,this.value="small";else n.hidden=!1,e.hidden=!0,this.value="normal"};connectedCallback(){super.connectedCallback(),globalThis.addEventListener("resize",this.onResize)}disconnectedCallback(){super.disconnectedCallback(),globalThis.removeEventListener("resize",this.onResize)}}var Ot=At.elementCreator({tag:"xin-sizebreak"});class Dt extends y{target=null;static styleSpec={":host":{_resizeIconFill:"#222",display:"block",position:"absolute",bottom:-7,right:-7,padding:14,width:44,height:44,opacity:0.25,transition:"opacity 0.25s ease-out"},":host(:hover)":{opacity:0.5},":host svg":{width:16,height:16,fill:r.resizeIconFill}};content=f.resize();get minSize(){let{minWidth:n,minHeight:e}=getComputedStyle(this.target);return{width:parseFloat(n)||32,height:parseFloat(e)||32}}resizeTarget=(n)=>{let{target:e}=this;if(!e)return;let{offsetWidth:t,offsetHeight:a}=e;e.style.left=e.offsetLeft+"px",e.style.top=e.offsetTop+"px",e.style.bottom="",e.style.right="";let{minSize:o}=this;tn(n,(i,s,l)=>{if(e.style.width=Math.max(o.width,t+i)+"px",e.style.height=Math.max(o.height,a+s)+"px",l.type==="mouseup")return!0},"nwse-resize")};connectedCallback(){if(super.connectedCallback(),!this.target)this.target=this.parentElement;let n={passive:!0};this.addEventListener("mousedown",this.resizeTarget,n),this.addEventListener("touchstart",this.resizeTarget,n)}}var dl=Dt.elementCreator({tag:"xin-sizer"}),{div:hl,input:ul,span:pl,button:rt}=g;class Ie extends y{caption="";removeable=!1;removeCallback=()=>{this.remove()};content=()=>[pl({part:"caption"},this.caption),rt(f.x(),{part:"remove",hidden:!this.removeable,onClick:this.removeCallback})];constructor(){super();this.initAttributes("caption","removeable")}}var So=Ie.elementCreator({tag:"xin-tag",styleSpec:{":host":{"--tag-close-button-color":"#000c","--tag-close-button-bg":"#fffc","--tag-button-opacity":"0.5","--tag-button-hover-opacity":"0.75","--tag-bg":c.brandColor("blue"),"--tag-text-color":c.brandTextColor("white"),display:"inline-flex",borderRadius:c.tagRoundedRadius(r.spacing50),color:r.tagTextColor,background:r.tagBg,padding:`0 ${r.spacing75} 0 ${r.spacing75}`,height:`calc(${r.lineHeight} + ${r.spacing50})`,lineHeight:`calc(${r.lineHeight} + ${r.spacing50})`},':host > [part="caption"]':{position:"relative",whiteSpace:"nowrap",overflow:"hidden",flex:"1 1 auto",fontSize:c.fontSize("16px"),color:r.tagTextColor,textOverflow:"ellipsis"},':host [part="remove"]':{boxShadow:"none",margin:`0 ${r.spacing_50} 0 ${r.spacing25}`,padding:0,display:"inline-flex",alignItems:"center",alignSelf:"center",justifyContent:"center",height:r.spacing150,width:r.spacing150,"--text-color":r.tagCloseButtonColor,background:r.tagCloseButtonBg,borderRadius:c.tagCloseButtonRadius("99px"),opacity:r.tagButtonOpacity},':host [part="remove"]:hover':{background:r.tagCloseButtonBg,opacity:r.tagButtonHoverOpacity}}});class zt extends y{disabled=!1;name="";availableTags=[];value=[];textEntry=!1;editable=!1;placeholder="enter tags";get tags(){return typeof this.value==="string"?this.value.split(",").map((n)=>n.trim()).filter((n)=>n!==""):this.value}constructor(){super();this.initAttributes("name","value","textEntry","availableTags","editable","placeholder","disabled")}addTag=(n)=>{if(n.trim()==="")return;let{tags:e}=this;if(!e.includes(n))e.push(n);this.value=e,this.queueRender(!0)};toggleTag=(n)=>{if(this.tags.includes(n))this.value=this.tags.filter((e)=>e!==n);else this.addTag(n);this.queueRender(!0)};enterTag=(n)=>{let{tagInput:e}=this.parts;switch(n.key){case",":{let t=e.value.split(",")[0];this.addTag(t)}break;case"Enter":{let t=e.value.split(",")[0];this.addTag(t)}n.stopPropagation(),n.preventDefault();break;default:}};popSelectMenu=()=>{let{toggleTag:n}=this,{tagMenu:e}=this.parts,t=typeof this.availableTags==="string"?this.availableTags.split(","):this.availableTags,a=this.tags.filter((i)=>!t.includes(i));if(a.length)t.push(null,...a);let o=t.map((i)=>{if(i===""||i===null)return null;else if(typeof i==="object")return{checked:()=>this.tags.includes(i.value),caption:i.caption,action(){n(i.value)}};else return{checked:()=>this.tags.includes(i),caption:i,action(){n(i)}}});Z({target:e,width:"auto",menuItems:o})};content=()=>[rt({style:{visibility:"hidden"},tabindex:-1}),hl({part:"tagContainer",class:"row"}),ul({part:"tagInput",class:"elastic",onKeydown:this.enterTag}),rt({title:"add tag",part:"tagMenu",onClick:this.popSelectMenu},f.chevronDown())];removeTag=(n)=>{if(this.editable&&!this.disabled){let e=n.target.closest(Ie.tagName);this.value=this.tags.filter((t)=>t!==e.caption),e.remove(),this.queueRender(!0)}n.stopPropagation(),n.preventDefault()};render(){super.render();let{tagContainer:n,tagMenu:e,tagInput:t}=this.parts;if(e.disabled=this.disabled,t.value="",t.setAttribute("placeholder",this.placeholder),this.editable&&!this.disabled)e.toggleAttribute("hidden",!1),t.toggleAttribute("hidden",!this.textEntry);else e.toggleAttribute("hidden",!0),t.toggleAttribute("hidden",!0);n.textContent="";let{tags:a}=this;for(let o of a)n.append(So({caption:o,removeable:this.editable&&!this.disabled,removeCallback:this.removeTag}))}}var ml=zt.elementCreator({tag:"xin-tag-list",styleSpec:{":host":{"--tag-list-bg":"#f8f8f8","--touch-size":"44px","--spacing":"16px",display:"grid",gridTemplateColumns:"auto",alignItems:"center",background:r.tagListBg,gap:r.spacing25,borderRadius:c.taglistRoundedRadius(r.spacing50),overflow:"hidden"},":host[editable]":{gridTemplateColumns:`0px auto ${r.touchSize}`},":host[editable][text-entry]":{gridTemplateColumns:`0px 2fr 1fr ${r.touchSize}`},':host [part="tagContainer"]':{display:"flex",content:'" "',alignItems:"center",background:r.inputBg,borderRadius:c.tagContainerRadius(r.spacing50),boxShadow:r.borderShadow,flexWrap:"nowrap",overflow:"auto hidden",gap:r.spacing25,minHeight:`calc(${r.lineHeight} + ${r.spacing})`,padding:r.spacing25},':host [part="tagMenu"]':{width:r.touchSize,height:r.touchSize,lineHeight:r.touchSize,textAlign:"center",padding:0,margin:0},":host [hidden]":{display:"none !important"},':host button[part="tagMenu"]':{background:r.brandColor,color:r.brandTextColor}}}),Vt="0.9.15";var Eo={_textColor:"#222",_brandColor:"#295546",_background:"#fafafa",_inputBg:"#fdfdfd",_backgroundShaded:"#f5f5f5",_navBg:"#ddede8",_barColor:"#dae3df",_focusColor:"#148960ad",_brandTextColor:"#ecf3dd",_insetBg:"#eee",_codeBg:"#f8ffe9",_shadowColor:"#0004",_menuBg:"#fafafa",_menuItemActiveColor:"#000",_menuItemIconActiveColor:"#000",_menuItemActiveBg:"#aaa",_menuItemHoverBg:"#eee",_menuItemColor:"#222",_menuSeparatorColor:"#2224",_scrollThumbColor:"#0006",_scrollBarColor:"#0001"},To={"@import":"https://fonts.googleapis.com/css2?family=Aleo:ital,wght@0,100..900;1,100..900&famiSpline+Sans+Mono:ital,wght@0,300..700;1,300..700&display=swap",":root":{_fontFamily:"'Aleo', sans-serif",_codeFontFamily:"'Spline Sans Mono', monospace",_fontSize:"16px",_codeFontSize:"14px",...Eo,_spacing:"10px",_lineHeight:r.fontSize160,_h1Scale:"2",_h2Scale:"1.5",_h3Scale:"1.25",_touchSize:"32px",_headerHeight:`calc(${r.lineHeight} * ${r.h2Scale} + ${r.spacing200})`},"@media (prefers-color-scheme: dark)":{body:{_darkmode:"true"}},".darkmode":{...$e(Eo),_menuShadow:"0 0 0 2px #a0f3d680",_menuSeparatorColor:"#a0f3d640"},".high-contrast":{filter:"contrast(2)"},".monochrome":{filter:"grayscale(1)"},".high-contrast.monochrome":{filter:"contrast(2) grayscale(1)"},"*":{boxSizing:"border-box",scrollbarColor:`${r.scrollThumbColor} ${r.scrollBarColor}`,scrollbarWidth:"thin"},body:{fontFamily:r.fontFamily,fontSize:r.fontSize,margin:"0",lineHeight:r.lineHeight,background:r.background,_linkColor:r.brandColor,_xinTabsSelectedColor:r.brandColor,_xinTabsBarColor:r.brandTextColor,_menuItemIconColor:r.brandColor,color:r.textColor},"input, button, select, textarea":{fontFamily:r.fontFamily,fontSize:r.fontSize,color:"currentColor",background:r.inputBg},select:{WebkitAppearance:"none",appearance:"none"},header:{background:r.brandColor,color:r.brandTextColor,_textColor:r.brandTextColor,_linkColor:r.transTextColor,display:"flex",alignItems:"center",padding:"0 var(--spacing)",lineHeight:"calc(var(--line-height) * var(--h1-scale))",height:r.headerHeight,whiteSpace:"nowrap"},h1:{_textColor:r.brandColor,fontSize:"calc(var(--font-size) * var(--h1-scale))",lineHeight:"calc(var(--line-height) * var(--h1-scale))",fontWeight:"400",borderBottom:`4px solid ${r.barColor}`,margin:`${r.spacing} 0 ${r.spacing200}`,padding:0},"header h2":{color:r.brandTextColor,whiteSpace:"nowrap"},h2:{color:r.brandColor,fontSize:"calc(var(--font-size) * var(--h2-scale))",lineHeight:"calc(var(--line-height) * var(--h2-scale))",margin:"calc(var(--spacing) * var(--h2-scale)) 0"},h3:{fontSize:"calc(var(--font-size) * var(--h3-scale))",lineHeight:"calc(var(--line-height) * var(--h3-scale))",margin:"calc(var(--spacing) * var(--h3-scale)) 0"},main:{alignItems:"stretch",display:"flex",flexDirection:"column",maxWidth:"100vw",height:"100vh",overflow:"hidden"},"main > xin-sidenav":{height:"calc(100vh - var(--header-height))"},"main > xin-sidenav::part(nav)":{background:r.navBg},"input[type=search]":{borderRadius:99},blockquote:{background:r.insetBg,margin:"0",padding:"var(--spacing) calc(var(--spacing) * 2)"},"blockquote > :first-child":{marginTop:"0"},"blockquote > :last-child":{marginBottom:"0"},".bar":{display:"flex",gap:r.spacing,justifyContent:"center",alignItems:"center",padding:r.spacing,flexWrap:"wrap",_textColor:r.brandColor,background:r.barColor},a:{textDecoration:"none",color:r.linkColor,opacity:"0.9",borderBottom:"1px solid var(--brand-color)"},"button, select, .clickable":{transition:"ease-out 0.2s",background:r.brandTextColor,_textColor:r.brandColor,display:"inline-block",textDecoration:"none",padding:"0 calc(var(--spacing) * 1.25)",border:"none",borderRadius:"calc(var(--spacing) * 0.5)"},"button, select, clickable, input":{lineHeight:"calc(var(--line-height) + var(--spacing))"},"select:has(+ .icon-chevron-down)":{paddingRight:"calc(var(--spacing) * 2.7)"},"select + .icon-chevron-down":{marginLeft:"calc(var(--spacing) * -2.7)",width:"calc(var(--spacing) * 2.7)",alignSelf:"center",pointerEvents:"none",objectPosition:"left center",_textColor:r.brandColor},"label > select + .icon-chevron-down":{marginLeft:"calc(var(--spacing) * -3.5)"},"input, textarea":{border:"none",outline:"none",borderRadius:"calc(var(--spacing) * 0.5)"},input:{padding:"0 calc(var(--spacing) * 1.5)"},textarea:{padding:"var(--spacing) calc(var(--spacing) * 1.25)",lineHeight:r.lineHeight,minHeight:"calc(var(--spacing) + var(--line-height) * 4)"},"input[type='number']":{paddingRight:0,width:"6em",textAlign:"right"},"input[type=number]::-webkit-inner-spin-button":{margin:"1px 3px 1px 0.5em",opacity:1,inset:1},"input[type='checkbox'], input[type='radio']":{maxWidth:r.lineHeight},"::placeholder":{color:r.focusColor},img:{verticalAlign:"middle"},"button:hover, button:hover, .clickable:hover":{boxShadow:"inset 0 0 0 2px var(--brand-color)"},"button:active, button:active, .clickable:active":{background:r.brandColor,color:r.brandTextColor},label:{display:"inline-flex",gap:"calc(var(--spacing) * 0.5)",alignItems:"center"},".elastic":{flex:"1 1 auto",overflow:"hidden",position:"relative"},"svg text":{pointerEvents:"none",fontSize:"16px",fontWeight:"bold",fill:"#000",stroke:"#fff8",strokeWidth:"0.5",opacity:"0"},"svg text.hover":{opacity:"1"},".thead":{background:r.brandColor,color:r.brandTextColor},".th + .th":{border:"1px solid #fff4",borderWidth:"0 1px"},".th, .td":{padding:"0 var(--spacing)"},".tr:not([aria-selected]):hover":{background:"#08835810"},"[aria-selected]":{background:"#08835820"},":disabled":{opacity:"0.5",filter:"saturate(0)",pointerEvents:"none"},pre:{background:r.codeBg,padding:r.spacing,borderRadius:"calc(var(--spacing) * 0.25)",overflow:"auto",fontSize:r.codeFontSize,lineHeight:"calc(var(--font-size) * 1.2)"},"pre, code":{fontFamily:r.codeFontFamily,_textColor:r.brandColor,fontSize:"90%"},".-xin-sidenav-visible .close-content":{display:"none"},".transparent, .iconic":{background:"none"},".iconic":{padding:"0",fontSize:"150%",lineHeight:"calc(var(--line-height) + var(--spacing))",width:"calc(var(--line-height) + var(--spacing))",textAlign:"center"},".transparent:hover, .iconic:hover":{background:"#0002",boxShadow:"none",color:r.textColor},".transparent:active, .iconic:active":{background:"#0004",boxShadow:"none",color:r.textColor},"xin-sidenav:not([compact]) .show-within-compact":{display:"none"},".on.on":{background:r.brandColor,_textColor:r.brandTextColor},".current":{background:r.background},".doc-link":{cursor:"pointer",borderBottom:"none",transition:"0.15s ease-out",marginLeft:"20px",padding:"calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5)"},".doc-link:not(.current):hover":{background:r.background},".doc-link:not(.current)":{opacity:"0.8",marginLeft:0},"xin-example":{margin:"var(--spacing) 0"},"xin-example .preview.preview":{padding:10},"xin-example [part=editors]":{background:r.insetBg},"[class*='icon-'], xin-icon":{color:"currentcolor",height:r.fontSize,pointerEvents:"none"},"[class*='icon-']":{verticalAlign:"middle"},".icon-plus":{content:"'+'"},table:{borderCollapse:"collapse"},thead:{background:r.brandColor,color:r.brandTextColor},tbody:{background:r.background},"tr:nth-child(2n)":{background:r.backgroundShaded},"th, td":{padding:"calc(var(--spacing) * 0.5) var(--spacing)"},"header xin-locale-picker xin-select button":{color:"currentcolor",background:"transparent",gap:"2px"},svg:{fill:"currentcolor"},"img.logo, xin-icon.logo":{animation:"2s ease-in-out 0s infinite alternate logo-swing"},"@keyframes logo-swing":{"0%":{transform:"perspective(1000px) rotateY(15deg)"},"100%":{transform:"perspective(1000px) rotateY(-15deg)"}}};var _e=[{text:`# xinjs

<!--{ "pin": "top" }-->

[xinjs.net](https://xinjs.net) | [xinjs-ui](https://ui.xinjs.net) | [github](https://github.com/tonioloewald/xinjs) | [npm](https://www.npmjs.com/package/xinjs) | [cdn](https://www.jsdelivr.com/package/npm/xinjs) | [react-xinjs](https://github.com/tonioloewald/react-xinjs#readme) | [discord](https://discord.gg/ramJ9rgky5)

[![xinjs is on NPM](https://badge.fury.io/js/xinjs.svg)](https://www.npmjs.com/package/xinjs)
[![xinjs is about 10kB gzipped](https://deno.bundlejs.com/?q=xinjs&badge=)](https://bundlejs.com/?q=xinjs&badge=)
[![xinjs on jsdelivr](https://data.jsdelivr.com/v1/package/npm/xinjs/badge)](https://www.jsdelivr.com/package/npm/xinjs)

<div style="text-align: center; margin: 20px">
  <img style="width: 250px; max-width: 80%" class="logo" alt="xinjs logo" src="https://xinjs.net/favicon.svg">
</div>

> For a pretty thorough overview of xinjs, you might like to start with [What is xinjs?](https://loewald.com/blog/2025/6/4/what-is-xinjs-).
> To understand the thinking behind xinjs, there's [What should a front-end framework do?](https://loewald.com/blog/2025/6/4/what-should-a-front-end-framework-do).

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
`,title:"xinjs",filename:"README.md",path:"README.md",pin:"top"},{text:`# 1. xin

> In Mandarin, 信 ("xin") has several meanings including "letter", "true" and "message".
> As conceived, \`xin\` is intended to be the "single source of truth" for application
> state, or data.
>
> In [b8rjs](https://b8rjs.com)—\`xinjs\`'s predecessor—it was called
> \`registry\`. But registry has some bad connotations (Windows "registry") and it's
> harder to type and search for.

\`xin\` is a path-based implementation of the **observer** or **pub/sub**
pattern designed to be very simple and straightforward to use, leverage
Typescript type-checking and autocompletion, and let you get more done with
less code and no weird build magic (such as special decorators or "execution zones").

> Note that the interactive examples on the xinjs.net website only support Javascript.
> If you want to play with xinjs using Typescript, try the [sandbox example](https://codesandbox.io/s/xintro-mh4rbj?file=/src/index.ts)

## In a nutshell

\`xin\` is a single object wrapped with an **observer** proxy.

- when you assign an object (or array) to \`xin\` as a property, you're
  just assigning a property to the object. When you pull it out, you
  get a **proxy** of the underlying value, but the original value is
  still there, untouched.
  \`\`\`
  const foo = { bar: 'baz' }
  xin.foo = foo
  xin.foo.bar === foo.bar
  xin.foo.bar === 'baz'
  xin.foo !== foo            // xin.foo is a proxy
  xin.foo.xinValue === foo   // foo is still there!
  \`\`\`
- if you change a property of something already in \`xin\` then this
  change will be \`observed\` and anything *listening* for changes to
  the value at that **path** will be notified.
- xinjs's \`bind\` method leverages the proxy to keep the UI synced
  with application state.

In the following example there's a \`<div>\` and an \`<input>\`. The
textContent of the former and the value of the latter are bound to
the **path** \`xinExample.string\`.

\`xin\` is exposed as a global in the console, so you can go into
console and look at \`xin.xinExample\` and (for example) directly
change it via the console.

You can also turn on Chrome's rendering tools to see how
efficiently the DOM is updated. And also note that typing into
the input field doesn't lose any state (so your text selection
and insertion point are stable.

\`\`\`js
const { xin, elements } = xinjs

xin.xinExample = {
  string: 'hello, xin'
}

const { label, input, div, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10
      }
    },
    div({bindText: 'xinExample.string'}),
    label(
      span('Edit this'),
      input({ bindValue: 'xinExample.string'})
    )
  )
)
\`\`\`

- a **data-path** typically resembles the way you'd reference a value inside
  a javascript object…
- \`xin\` also supports **id-paths** which allow you to create stable references
  to elements in arrays using a (hopefully unique) identifier. E.g. instead
  of referring to an item in an array as \`xin.foo.array[3]\`, assuming it had
  an \`id\` of \`abcd1234\` you could write \`xin.foo.array[id=abcd1234]\`. This makes
  handling large arrays much more efficient.
- when you pull an object-value out of \`xin\` it comes wrapped in the xin
  observer proxy, so it continues to support id-paths and so on.

### A Calculator

\`\`\`js
const { xin, elements, touch } = xinjs

// here's a vanilla javascript calculator
const calculator = {
  x: 4,
  y: 3,
  op: '+',
  result: 0,
  evaluate() {
    this.result = eval(\`\${this.x} \${this.op} \${this.y}\`)
  }
}

calculator.evaluate()

xin.calculatorExample = calculator

// now we'll give it a user interface…
const { input, select, option, div, span } = elements

preview.append(
  div(
    {
      onChange() {
        calculator.evaluate()
        touch('calculatorExample.result')
      }
    },
    input({bindValue: 'calculatorExample.x', placeholder: 'x'}),
    select(
      {
        bindValue: 'calculatorExample.op'
      },
      option('+'),
      option('-'),
      option({value: '*'}, '×'),
      option({value: '/'}, '÷'),
    ),
    input({bindValue: 'calculatorExample.y', placeholder: 'y'}),
    span('='),
    span({bindText: 'calculatorExample.result' })
  )
)
\`\`\`

Important points:

- \`xin\` points at a single object. It's a [Singleton](https://en.wikipedia.org/wiki/Singleton_pattern).
- \`boxed\` points to the **same** object
- \`xin\` and \`boxed\` are observers. They watch the object they point to and
  track changes made by accessing the underlying data through them.
- because \`calculator.evaluate()\` changes \`calculator.result\`
  directly, \`touch()\` is needed to tell \`xin\` that the change occurred.
  See [path-listener](/?path-listener.ts) for more documentation on \`touch()\`.
- \`xin\` is more than just an object!
    - \`xin['foo.bar']\` gets you the same thing \`xin.foo.bar\` gets you.
    - \`xin.foo.bar = 17\` tells \`xin\` that \`foo.bar\` changed, which triggers DOM updates.

> If you're reading this on xinjs.net then this the demo app you're looking
> works a bit like this and \`xin\` (and \`boxed\`) are exposed as globals so
> you can play with them in the **debug console**.
>
> Try going into the console and typing \`xin.app.title\` to see what you get,
> and then try \`xin.app.title = 'foobar' and see what happens to the heading.
>
> Also try \`xin.prefs.theme\` and try \`app.prefs.theme = 'dark'\` etc.

Once an object is assigned to  \`xin\`, changing it within \`xin\` is simple.
Try this in the console:

\`\`\`
xin.calculatorExample.x = 17
\`\`\`

This will update the \`x\` field in the calculator, but not the result.
The result is updated when a \`change\` event is triggered.

If you wanted the calculator to update based on *any* change to its
internal state, you could instead write:

\`\`\`
observe('calculatorExample', () => {
  calculator.evaluate()
  touch('calculatorExample.result')
})
\`\`\`

Now the \`onChange\` handler isn't necessary at all. \`observe\`
is documented in [path-listener](/?path-listener.ts).

\`\`\`js
const { observe, xin, elements } = xinjs

const { h3, div } = elements

const history = div('Try playing with the preceding example')

preview.append(
  h3('Changes to the calculatorExample'),
  history
)

observe(/calculatorExample\\./, path => {
  const value = xin[path]
  history.insertBefore(div(\`\${path} = \${value}\`), history.firstChild)
})
\`\`\`

Now, if you sneakily make changes behind \`xin\`'s back, e.g. by modifying the values
directly, e.g.

\`\`\`
const emails = await getEmails()
xin.emails = emails

// notes that xin.emails is really JUST emails
emails.push(...)
emails.splice(...)
emails[17].from = '...'
\`\`\`

Then \`xin\` won't know and observers won't fire. So you can simply \`touch\` the path
impacted:

\`\`\`
import { touch } from 'xinjs'
touch('emails')
\`\`\`

In the calculator example, the vanilla \`calculator\` code calls \`evaluate\` behind
\`xin\`'s back and uses \`touch('calculatorExample.result')\` to let \`xin\` know that
\`calculatorExample.result\` has changed. This causes \`xin\` to update the
DOM.

## How it works

\`xin\` is a \`Proxy\` wrapped around a bare object: effectively a map of strings to values.

When you access the properties of an object assigned to \`xin\` it wraps the values in
similar proxies, and tracks the **path** that got you there:

\`\`\`
xin.foo = {
  bar: 'baz',
  luhrman: {
    job: 'director'
  }
}
\`\`\`

Now if you pull objects back out of \`xin\`:

\`\`\`
let foo = xin.foo
let luhrman = foo.luhrman
\`\`\`

\`foo\` is a \`Proxy\` wrapped around the original *untouched* object, and it knows it came from 'foo'.
Similarly \`luhrman\` is a \`Proxy\` that knows it came from 'foo.luhrman'.

If you **change** a value in a wrapped object, e.g.

\`\`\`
foo.bar = 'bob'
luhrman.job = 'writer'
\`\`\`

Then it will trigger any observers looking for relevant changes. And each change will fire the observer
and tell it the \`path\` that was changed. E.g. an observer watching \`lurman\` will be fired if \`lurman\`
or one of \`lurman\`'s properties is changed.

## The \`boxed\` proxy

\`boxed\` is a sister to \`xin\` that wraps "scalar" values (\`boolean\`, \`number\`, \`string\`) in
objects. E.g. if you write something like:

\`\`\`
xin.test = { answer: 42 }
boxed.box = { pie: 'apple' }
\`\`\`

Then:

\`\`\`
xin.test.answer === 42
xin.box.pie === 'apple'
// box wraps "scalars" in objects
boxed.test.answer.valueOf() === 42
boxed.box.pie.valueOf() === 'apple'
// anything that comes out of boxed has a path!
xinPath(boxed.test.answer) === 'test.answer'
xinPath(boxed.box.pie) === 'box.pie'
\`\`\`

Aside from always "boxing" scalar values, \`boxed\` works just like \`xin\`.

In the console, you can also access \`boxed\` and look at what happens if you
access \`boxed.xinExample.string\`. Note that this changes the value you get,
the underlying value is still what it was. If you set it to a new \`string\`
value that's what will be stored. \`xin\` doesn't monkey with the values you
assign.

### Why?!

As far as Typescript is concerned, \`xinProxy\` just passes back what you put into it,
which means that you can now write bindings with type-checking and autocomplete and
never use string literals. So something like this *just works*:

\`\`\`
const div = elements.div({bindText: boxed.box.pie})
\`\`\`

…because \`boxed.box.pie\` has a \`xinPath\` which is what is actually used for binding,
whereas \`xin.box.pie\` is just a scalar value. Without \`boxed\` you could write
\`bindText: 'box.pie'\` but you don't get lint support or autocomplete. (Also, in
some cases, you might even mangle the names of an object during minification and
\`boxed\` will know the mangled name).

### If you need the thing itself or the path to the thing…

\`proxy\`s returned by \`xin\` are typically indistinguishable from the original object, but
in a pinch \`xinPath()\` will give you the path (\`string\`) of a \`XinProxy\` while \`xinValue\`
will give its "bare" value. \`xinPath()\` can also be used to test if something is actually
a proxy, as it will return \`undefined\` for regular objects.

E.g.

\`\`\`
xinPath(luhrman) === 'foo.luhrman'     // true
const bareLurhman = xinValue(luhrman)  // not wrapped
\`\`\`

You may want the thing itself to, for example, perform a large number of changes to an
object without firing observers. You can let \`xin\` know you've made changes behind its back using
\`touch\`, e.g.

\`\`\`
doTerribleThings(xinValue(luhrman))
// eslint-disable-next-line
touch(luhrman)
\`\`\`

This is **useful** because \`boxed.foo.bar\` always knows where it came from, while
\`xin.foo.bar\` only knows where it came from if it's an object value.

This means you can write:

\`\`\`js
const { boxed, elements } = xinjs

boxed.boxedExample = {
  string: 'hello, boxed'
}

const { boxedExample } = boxed

const { label, input, div, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10
      }
    },
    div({bindText: boxedExample.string}),
    label(
      span('Edit this'),
      input({ bindValue: boxedExample.string})
    )
  )
)
\`\`\`

And the difference here is you can bind direct to the reference itself rather
than a string. This leverages autocomplete, linting, and so on in a way that
using string paths doesn't.

It does have a downside! \`boxedExample.string !== 'hello, boxed'\` and in fact
\`boxedExample.string !== boxedExample.string\` because they're two different
\`String\` objects. This is critical for comparisons such as \`===\` and \`!==\`.
Always use \`boxed.foo.bar.xinValue\`, \`xinValue(boxed.foo.bar)\` or \`boxed.foo.bar.valueOf()\`
when performing comparisons like this.

## Helper properties and functions

\`XinProxy\` and \`BoxedProxy\` provide some helper properties and functions.

- \`xinValue\` gets you the underlying value
- \`xinPath\` gets you the string path
- \`xinBind(element: Element, binding: [XinBinding](/?bindings.ts), options?: {[key: string]: any})\` will
  bind the \`xinPath\` the element with the specified binding.
  \`\`\`
  boxed.foo.color.bind(element, {
    toDOM(element, color){
      element.style.backgroundColor = color
    }
  })
  \`\`\`
- \`xinOn(element: HTMLElement, eventType: keyof HTMLElementEventMap)\` will
  trigger the event handler when the specified element receives
  an event of the specified type.
- \`xinObserve(callback: ObserverCallbackFunction): UnobserveFunction\` will
  trigger the provided callback when the value changes, and can be cancelled
  using the returned function.

### To Do List Example

Each of the features described thus far, along with the features of the
\`elementCreator\` functions provided by the [elements](/?elements.ts) proxy
are designed to eliminate boilerplate, simplify your code, and reduce
the chance of making costly errors.

This example puts all of this together.

\`\`\`js
const { elements, boxedProxy } = xinjs

const { todos } = boxedProxy({
  todos: {
    list: [],
    newItem: ''
  }
})

const { h3, div, label, input, button, template } = elements

const addItem = () => {
  todos.list.push({
    description: todos.newItem
  })
  todos.newItem = ''
}

preview.append(
  h3('To do'),
  div(
    {
      bindList: {
        value: todos.list
      }
    },
    template(
      div({ bindText: '^.description' })
    )
  ),
  div(
    input({
      placeholder: 'task',
      bindValue: todos.newItem,
      onKeyup(event) {
        if(event.key === 'Enter' && todos.newItem != '') {
          addItem()
        }
      }
    }),
    button('Add', {
      bindEnabled: todos.newItem,
      onClick: addItem
    })
  )
)
\`\`\``,title:"1. xin",filename:"xin.ts",path:"src/xin.ts"},{text:`# 1.1 xin proxy

The key to managing application state with \`xinjs\` is the \`xin\` proxy object
(and \`boxed\`). These are documented [here](/?xin.ts).

## \`xinProxy()\` and \`boxedProxy()\`

After coding with \`xin\` for a while, it became apparent that a common pattern
was something like this:

    import myThing as _myThing from 'path/to/my-thing'
    import { xin } from 'xinjs'

    xin.myThing = _myThing
    export const myThing = xin.myThing as typeof _myThing

Now we can use the new \`myThing\` in a pretty intuitive way, leverage autocomplete
most of the time, and it's all pretty nice.

And because \`myThing.path.to.something\` is actually a \`XinProxy\` we can actually
bind to it directly. So instead of typing (or mis-typing):

    customElement({bindValue: 'mything.path.to.something'}))

We can type the following and even use autocomplete:

    customElement({bindValue: mything.path.to.something}))

This gets you:

    const { myThing } = xinProxy({ myThing: ... })

And after working with that for a while, the question became, what if we could
leverage autocomplete even for non-object properties?

This gets us to:

    const { myThing } = boxedProxy({ myThing: ... })

…(and also \`boxed\`).

\`boxed\` and \`boxedProxy\` deliver a proxy wrapped around an object wrapped around
the original \`string\`, \`boolean\`, or \`number\`. This gets you autocomplete and
strong typing in general, at the cost of slight annoyances (e.g. having to write
\`myThing.path.to.string.valueOf() === 'some value'\`). That's the tradeoff. In
practice it's really very nice.

\`xinProxy(foo)\` is simply declared as a function that takes an object of type T and
returns a BoxedProxy<T>.

    import { xinProxy } from 'xinjs'

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

So, Typescript will know that \`foo\` is a \`string\` and \`bar\` is a \`XinProxy<typeof stuff.bar>\`.

Now, \`boxedProxy\` is the same except replace \`XinProxy\` with \`BoxedProxy\` and
now Typescript will know that \`foo\` is a \`BoxedProxy<string>\`, \`bar\` is a \`BoxedProxy<typeof stuff.bar>\`
and \`bar.born\` is a \`BoxedProxy<number>\`.

This lets you write bindings that support autocomplete and lint. Yay!`,title:"1.1 xin proxy",filename:"xin-proxy.ts",path:"src/xin-proxy.ts"},{text:`# 1.2 path-listener

\`path-listener\` implements the \`xin\` observer model. Although these events
are exported from \`xinjs\` they shouldn't need to be used very often. Mostly
they're used by \`bind\` and \`xin\` to manage state.

## \`touch(path: string)\`

This is used to inform \`xin\` that a value at a path has changed. Remember that
xin simply wraps an object, and if you change the object directly, \`xin\` won't
necessarily know about it.

The two most common uses for \`touch()\` are:

1. You want to make lots of changes to a large data structure, possibly
   over a period of time (e.g. update hundreds of thousands of values
   in a table that involve service calls or heavy computation) and don't
   want to thrash the UI so you just change the object directly.
2. You want to change the content of an object but need a something that
   is bound to the "outer" object to be refreshed.

## \`observe()\` and \`unobserve()\`

    const listener = observe(
      path: string | RegExp | (path: string) => boolean,
      (changedPath: string) => {
        ...
      }
    )

    // and later, when you're done
    unobserve(listener);

\`observe(…)\` lets you call a function whenever a specified path changes. You'll
be passed the path that changed and you can do whatever you like. It returns
a reference to the listener to allow you to dispose of it later.

\`unobserve(listener)\` removes the listener.

> This is how binding works. When you bind a path to an interface element, an
> observer is created that knows when to update the interface element. (If the
> binding is "two-way" (i.e. provides a \`fromDOM\` callback) then an \`input\` or
> \`change\` event that hits that element will update the value at the bound
> path.

## \`async updates()\`

You can \`await updates()\` or use \`updates().then(…)\` to execute code
after any changes have been rendered to the DOM. Typically, you shouldn't
have to mess with this, but sometimes—for example—you might need to know
how large a rendered UI element is to adjust something else.

It's also used a lot in unit tests. After you perform some logic, does
it appear correctly in the UI?`,title:"1.2 path-listener",filename:"path-listener.ts",path:"src/path-listener.ts"},{text:`# 1.3 metadata

## \`getListItem(element: Element): any\`

## \`xinValue(x: any): any\`

\`xinValue\` is helpful when you want to strip the \`xin\` or \`boxed\` proxy off of a
value. \`xinValue\` passes through normal values, so it's safe to use on anything.

    import { boxed } from 'xinjs'

    const foo = { bar: 'hello', baz: 17 }
    boxed.foo = foo

    boxed.foo.bar === foo.bar               // false, boxed.foo.bar is a String
    boxed.foo === foo                       // false, boxed.foo is a Proxy
    boxed.foo.baz === 17                    // false, boxed.foo.baz is a Number
    xinValue(boxed.foo.bar) === 'hello'     // true
    boxed.foo.xinValue === foo              // true
    boxed.foo.baz.xinValue = 17             // true
    xinValue(boxed.foo) === xinValue(foo)   // true
    foo.xinValue                            // undefined! foo isn't a proxy

## \`xinPath(x: any): string | undefined\`

\`xinPath\` will get you the path of a \`xin\` or \`boxed\` proxy. \`xinPath\` will be
undefined for anything that's isn't a \`xin\` or \`boxed\` proxy, so it can also
be used to tell if a value is a (\`xin\` or \`boxed\`) proxy.`,title:"1.3 metadata",filename:"metadata.ts",path:"src/metadata.ts"},{text:`# 2. bind

\`bind()\` lets you synchronize data / application state to the user-interface reliably,
efficiently, and with a minimum of code.

## An Aside on Reactive Programming vs. the Observer Model

A good deal of front-end code deals with keeping the application's
state synchronized with the user-interface. One approach to this problem
is [Reactive Programming](https://en.wikipedia.org/wiki/Reactive_programming)
as exemplified by [React](https://reactjs.org) and its many imitators.

\`xinjs\` works very well with React via the [useXin](https://github.com/tonioloewald/react-xinjs) React "hook".
But \`xinjs\` is not designed for "reactive programming" and in fact "hooks" aren't
"reactive" at all, so much as an example of the "observer" or "pub/sub" pattern.

\`xinjs\` is a "path-observer" in that it's an implementation of the
[Observer Pattern](https://en.wikipedia.org/wiki/Observer_pattern)
where **path strings** serve as a level of *indirection* to the things observed.
This allows data to be "observed" before it exists, which in particular *decouples* the setup
of the user interface from the initialization of data and allows user interfaces
built with \`xinjs\` to be *deeply asynchronous*.

## \`bind()\`

\`\`\`
bind<T = Element>(
  element: T,
  what: XinTouchableType,
  binding: XinBinding,
  options: XinObject
): T
\`\`\`

\`bind()\` binds a \`path\` to an element, syncing the value at the path to and/or from the DOM.

\`\`\`js
const { bind, boxedProxy } = xinjs

const { simpleBindExample } = boxedProxy({
  simpleBindExample: {
    showThing: true
  }
})

bind(
  preview.querySelector('b'),
  'simpleBindExample.showThing',
  {
    toDOM(element, value) {
      element.style.visibility = value ? 'visible' : 'hidden'
    }
  }
)

bind(
  preview.querySelector('input[type=checkbox]'),
  // the boxedProxy can be used instead of a string path
  simpleBindExample.showThing,
  // we could just use bindings.value here
  {
    toDOM(element, value) {
      element.checked = value
    },
    fromDOM(element) {
      return element.checked
    }
  }
)
\`\`\`
\`\`\`html
<b>The thing</b><br>
<label>
  <input type="checkbox">
  Show the thing
</label>
\`\`\`

The \`bind\` function is a simple way of tying an \`HTMLElement\`'s properties to
state via \`path\` using [bindings](/?bindings.ts)

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
2. it will fail if xin.app hasn't been initialized (which it hasn't been!)
3. inputElt will also trigger *debounced* updates on \`input\` events

After this. \`div.textContent\` and \`inputElt.value\` are 'hello world'.
If the user edits the value of \`inputElt\` then \`xin.app.title\` will
be updated, and \`app.title\` will be listed as a changed path, and
an update will be fired via \`setTimout\`. When that update fires,
anything observer of the paths \`app.text\` and \`app\` will be fired.

A \`binding\` looks like this:

\`\`\`
interface XinBinding {
  toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void
  fromDOM?: (element: HTMLElement) => any
}
\`\`\`

Simply put the \`toDOM\` method updates the DOM based on changes in state
while \`fromDOM\` updates state based on data in the DOM. Most bindings
will have a \`toDOM\` method but no \`fromDOM\` method since \`bindings.value\`
(which has both) covers most of the use-cases for \`fromDOM\`.

It's easy to write your own \`bindings\` if those in \`bindings\` don't meet your
need, e.g. here's a custom binding that toggles the visibility of an element
based on whether the bound value is neither "falsy" nor an empty \`Array\`.

\`\`\`
const visibility = {
  toDOM(element, value) {
    if (element.dataset.origDisplay === undefined && element.style.display !== 'none') {
      element.dataset.origDisplay = element.style.display
    }
    element.style.display = (value != null && element.length > 0) ? element.dataset.origDisplay : 'none'
  }
}
bind(listElement, 'app.bigList', visibility)
\`\`\`

## \`on()\`

    on(element: Element, eventType: string, handler: XinEventHandler): VoidFunction

    export type XinEventHandler<T extends Event = Event, E extends Element = Element> =
      | ((evt: T & {target: E}) => void)
      | ((evt: T & {target: E}) => Promise<void>)
      | string

\`\`\`js
const { elements, on, boxedProxy } = xinjs
const { postNotification } = xinjsui

const makeHandler = (message) => () => {
  postNotification({ message, duration: 2 })
}

const { onExample } = boxedProxy({
  onExample: {
    clickHandler: makeHandler('Hello from onExample proxy')
  }
})

const { button, div, h2 } = elements

const hasListener = button('has listener')
hasListener.addEventListener('click', makeHandler('Hello from addEventListener'))

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        gap: 10
      }
    },
    h2('Event Handler Examples'),
    hasListener,
    button('just a callback', {onClick: makeHandler('just a callback')}),
    button('via proxy', {onClick: onExample.clickHandler}),
  )
)
\`\`\`

\`on()\` binds event-handlers to DOM elements.

More than syntax sugar for \`addEventListener\`, \`on()\` allows you to bind event
handlers inside \`xin\` by path (e.g. allowing event-handling code to be loaded
asynchronously or lazily, or simply allowing event-handlers to be switched dynamically
without rebinding) and it uses event-bubbling to minimize the actual number of
event handlers that need to be registered.

\`on()\` returns a function for removing the event handler.

In essence, only one event handler of a given type is ever added to the
DOM by \`on()\` (at \`document.body\` level), and then when that event is detected,
that handler goes from the original target through to the DOM and fires off
event-handlers, passing them an event proxy (so that \`stopPropagation()\` still
works).

## \`touchElement()\`

\`\`\`
touchElement(element: Element, changedPath?: string)
\`\`\`

This is a low-level function for *immediately* updating a bound element. If you specifically
want to force a render of an element (versus anything bound to a path), simply call
\`touchElement(element)\`. Specifying a \`changedPath\` will only trigger bindings bound
to paths staring with the provided path.`,title:"2. bind",filename:"bind.ts",path:"src/bind.ts"},{text:`# 2.1 binding arrays

The most likely source of complexity and performance issues in applications is
displaying large lists or grids of objects. \`xinjs\` provides robust support
for handling this efficiently.

## \`bindList\` and \`bindings.list\`

The basic structure of a **list-binding** is:

    div( // container element
      {
        bindList: {
          value: boxed.path.to.array // OR 'path.to.array'
          idPath: 'id' // (optional) path to unique id of array items
        }
      },
      template( // template for the repeated item
        div( // repeated item should have a single root element
          ... // whatever you want
          span({
            bindText: '^.foo.bar' // binding to a given array member's \`foo.bar\`
              // '^' refers to the array item itself
          })
        )
      )
    )

\`\`\`js
const { elements, boxedProxy } = xinjs
const { listBindingExample } = boxedProxy({
  listBindingExample: {
    array: ['this', 'is', 'an', 'example']
  }
})

const { h3, ul, li, template } = elements

preview.append(
  h3('binding an array of strings'),
  ul(
    {
      bindList: {
        value: listBindingExample.array
      },
    },
    template(
      li({ bindText: '^' })
    )
  )
)
\`\`\`

### id-paths

**id-paths** are a wrinkle in \`xin\`'s paths specifically there to make list-bindign more efficient.
This is because in many cases you will encounter large arrays of objects, each with a unique id somewhere, e.g. it might be \`id\` or \`uid\`
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

Specifying an \`idPath\` in a list-binding will allow the list to be more efficiently updated.
It's the equivalent of a \`key\` in React, the difference being that its optional and
specifically intended to leverage pre-existing keys where available.

## Virtualized Lists

The real power of \`bindList\` comes from its support for virtualizing lists.

    bindList: {
      value: emojiListExample.array,
      idPath: 'name',
      virtual: {
        height: 30,
      },
    }

Simply add a \`virtual\` property to the list-binding specifying a *minimum* \`height\` (and, optionally,
\`height\`) and the list will be \`virtualized\` (meaning that only visible elements will be rendered,
missing elements being replaced by a single padding element above and below the list).

Now you can trivially bind an array of a million objects to the DOM and have it scroll at
120fps.

\`\`\`js
const { elements, boxedProxy } = xinjs
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const { emojiListExample } = boxedProxy({
  emojiListExample: {
    array: await request.json()
  }
})

const { div, span, template } = elements

preview.append(
  div(
    {
      class: 'emoji-table',
      bindList: {
        value: emojiListExample.array,
        idPath: 'name',
        virtual: {
          height: 30,
        },
      }
    },
    template(
      div(
        {
          class: 'emoji-row',
          tabindex: 0,
        },
        span({ bindText: '^.chars', class: 'graphic' }),
        span({ bindText: '^.name', class: 'no-overflow' }),
        span({ bindText: '^.category', class: 'no-overflow' }),
        span({ bindText: '^.subcategory', class: 'no-overflow' })
      )
    )
  )
)
\`\`\`
\`\`\`css
.emoji-table {
  height: 100%;
  overflow: auto;
}
.emoji-row {
  display: grid;
  grid-template-columns: 50px 300px 200px 200px;
  align-items: center;
  height: 30px;
}

.emoji-row > .graphic {
  font-size: 20px;
  justify-self: center;
}

.emoji-row > * {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
\`\`\`

## Filtered Lists

It's also extremely common to want to filter a rendered list, and \`xinjs\`
provides both simple and powerful methods for doing this.

## \`hiddenProp\` and \`visibleProp\`

\`hiddenProp\` and \`visibleProp\` allow you to use a property to hide or show array
elements (and they can be \`symbol\` values if you want to avoid "polluting"
your data, e.g. for round-tripping to a database.)

## \`filter\` and \`needle\`

    bindList: {
      value: filterListExample.array,
      idPath: 'name',
      virtual: {
        height: 30,
      },
      filter: (emojis, needle) => {
        needle = needle.trim().toLocaleLowerCase()
        if (!needle) {
          return emojis
        }
        return emojis.filter(emoji => \`\${emoji.name} \${emoji.category} \${emoji.subcategory}\`.toLocaleLowerCase().includes(needle))
      },
      needle: filterListExample.needle
    }

If \`bindList\`'s options provide a \`filter\` function and a \`needle\` (proxy or path) then
the list will be filtered using the function via throttled updates.

\`filter\` is passed the whole array, and \`needle\` can be anything so, \`filter\` can
sort the array or even synthesize it entirely.

In this example the \`needle\` is an object containing both a \`needle\` string and \`sort\`
value, and the \`filter\` function filters the list if the string is non-empty, and
sorts the list if \`sort\` is not "default". Also note that an \`input\` event handler
is used to \`touch\` the object and trigger updates.

\`\`\`js
// note that this example is styled by the earlier example

const { elements, boxedProxy } = xinjs
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const { filterListExample } = boxedProxy({
  filterListExample: {
    config: {
      needle: '',
      sort: 'default',
    },
    array: await request.json()
  }
})

const { b, div, span, template, label, input, select, option } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        padding: 10,
        gap: 10,
        height: 60,
        alignItems: 'center'
      },
      onInput() {
        // need to trigger change if any prop of config changes
        touch(filterListExample.config)
      },
    },
    b('filtered list'),
    span({style: 'flex: 1'}),
    label(
      span('sort by'),
      select(
        {
          bindValue: filterListExample.config.sort
        },
        option('default'),
        option('name'),
        option('category')
      ),
    ),
    input({
      type: 'search',
      placeholder: 'filter emoji',
      bindValue: filterListExample.config.needle
    })
  ),
  div(
    {
      class: 'emoji-table',
      style: 'height: calc(100% - 60px)',
      bindList: {
        value: filterListExample.array,
        idPath: 'name',
        virtual: {
          height: 30,
        },
        filter: (emojis, config) => {
          let { needle, sort } = config
          needle = needle.trim().toLocaleLowerCase()
          if (needle) {
            emojis = emojis.filter(emoji => \`\${emoji.name} \${emoji.category} \${emoji.subcategory}\`.toLocaleLowerCase().includes(needle))
          }
          return config.sort === 'default' ? emojis : emojis.sort((a, b) => a[config.sort] > b[config.sort] ? 1 : -1)
        },
        needle: filterListExample.config
      }
    },
    template(
      div(
        {
          class: 'emoji-row',
          tabindex: 0,
        },
        span({ bindText: '^.chars', class: 'graphic' }),
        span({ bindText: '^.name', class: 'no-overflow' }),
        span({ bindText: '^.category', class: 'no-overflow' }),
        span({ bindText: '^.subcategory', class: 'no-overflow' })
      )
    )
  )
)
\`\`\``,title:"2.1 binding arrays",filename:"list-binding.ts",path:"src/list-binding.ts"},{text:"# 2.2 bindings\n\n`bindings` is simply a collection of common bindings.\n\nYou can create your own bindings easily enough (and add them to `bindings` if so desired).\n\nA `binding` looks like this:\n\n```\ninterface XinBinding {\n  toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void\n  fromDOM?: (element: HTMLElement) => any\n}\n```\n\nThe `fromDOM` function is only needed for bindings to elements that trigger `change` or `input`\nevents, typically `<input>`, `<textarea>`, and `<select>` elements, and of course your\nown [Custom Elements](/?components.ts).\n\n## value\n\nThe `value` binding syncs state from `xin` to the bound element's `value` property. In\ngeneral this should only be used for binding simple things, like `<input>` and `<textarea>`\nelements.\n\n## text\n\nThe `text` binding copies state from `xin` to the bound element's `textContent` property.\n\n## enabled & disabled\n\nThe `enabled` and `disabled` bindings allow you to make a widget's enabled status\nbe determined by the truthiness of something in `xin`, e.g.\n\n```\nimport { xinProxy, elements } from 'xinjs'\n\nconst myDoc = xinProxy({\n    myDoc: {\n        content: ''\n        unsavedChanges: false\n    }\n}, 1)\n\n// this button will only be enabled if there is something in `myList.array`\ndocument.body.append(\n    elements.textarea({\n        bindValue: myDoc.content,\n        onInput() {\n            myDoc.unsavedChanges = true\n        }\n    }),\n    elements.button(\n        'Save Changes',\n        {\n            bindEnabled: myDoc.unsavedChanges,\n            onClick() {\n                // save the doc\n                myDoc.unsavedChanges = false\n            }\n        }\n    )\n)\n```\n\n## list\n\nThe `list` binding makes a copy of a `template` element inside the bound element\nfor every item in the bound `Array`.\n\nIt uses the existing **single** child element it finds inside the bound element\nas its `template`. If the child is a `<template>` (which is a good idea) then it\nexpects that `template` to have a *single child element*.\n\nE.g. if you have a simple unordered list:\n\n    <ul>\n      <li></li>\n    </ul>\n\nYou can bind an array to the `<ul>` and it will make a copy of the `<li>` inside\nfor each item in the source array.\n\nThe `list` binding accepts as options:\n- `idPath: string`\n- `initInstance: (element, item: any) => void`\n- `updateInstance: (element, item: any) => void`\n- `virtual: {width?: number, height: number}`\n- `hiddenProp: symbol | string`\n- `visibleProp: symbol | string`\n\n`initInstance` is called once for each element created, and is passed\nthat element and the array value that it represents.\n\nMeanwhile, `updateInstance` is called once on creation and then any time the\narray value is updated.\n\n### Virtual List Binding\n\nIf you want to bind large arrays with minimal performance impact, you can make a list\nbinding `virtual` by passing the `height` (and optionally `width`) of an item.\nOnly visible elements will be rendered. Just make sure the values passed represent\nthe *minimum* dimensions of the individual rendered items if they can vary in size.\n\n### Filtered Lists and Detail Views\n\nYou can **filter** the elements you wish to display in a bound list by using the\n`hiddenProp` (to hide elements of the list) and/or `visibleProp` (to show elements\nof the list).\n\nYou can pass a `path` or a `symbol` as either the `hiddenProp` or `visibleProp`.\n\nTypically, you can use `hiddenProp` to power filters and `visibleProp` to power\ndetail views. The beauty of using symbols is that it won't impact the serialized\nvalues of the array and different views of the array can use different selection\nand filtering criteria.\n\n> **Note** for a given list-binding, if you specify `hiddenProp` (but not `visibleProp`),\n> then all items in the array will be shown *unless* `item[hiddenProp] === true`.\n>\n> Conversely, if you specify `visibleProp` (but not `hiddenProp`), then all items\n> in the array will be ignored *unless* `item[visibleProp] === true`.\n>\n> If, for some reason, you specify both then an item will only be visible if\n> it `item[visibleProp] === true` and `item[hiddenProp] !== true`.\n\n### Binding custom-elements using idPath\n\nIf you list-bind a custom-element with `bindValue` implemented and providing an\n`idPath` then the list-binding will bind the array items to the value of the\ncustom-element.\n\n### xin-empty-list class\n\nThe `list` binding will automatically add the class `-xin-empty-list` to a\ncontainer bound to an empty array, making it easier to conditionally render\ninstructions or explanations when a list is empty.",title:"2.2 bindings",filename:"bindings.ts",path:"src/bindings.ts"},{text:`# 3. elements

\`xinjs\` provides \`elements\` for easily and efficiently generating DOM elements
without using \`innerHTML\` or other unsafe methods.

\`\`\`js
const { elements } =  xinjs

const { div, input, label, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        gap: 10
      }
    },
    label(
      {
        style: {
          display: 'inline-flex'
        }
      },
      span('text'),
      input({value: 'hello world', placeholder: 'type something'})
    ),
    label(
      {
        style: {
          display: 'inline-flex'
        }
      },
      span('checkbox'),
      input({type: 'checkbox', checked: true})
    )
  )
)
\`\`\`

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

    span({dataInfo: 'foo'})        // produces <span data-info="foo"></span>

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

You can [bind](/?bind.ts) an element to state using [bindings](/?bindings.ts)
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

## event-handlers

You can attach event handlers to elements using \`on<EventType>\`
as syntax sugar, e.g.

    import { elements } from 'xinjs'
    const { button } = elements
    document.body.append(
      button('click me', {onClick() {
        alert('clicked!')
      }})
    )

…is syntax sugar for:

    import { elements, on } from 'xinjs'
    const { button } = elements
    const aButton = button('click me')
    on(aButton, 'click', () => {
      alert('clicked!')
    })
    document.body.append(
      aButton
    )

There are some subtle but important differences between \`on()\` and
\`addEventListener\` which are discussed in detail in the section on
[bind](/?bind.ts).

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
> Again, use with caution!`,title:"3. elements",filename:"elements.ts",path:"src/elements.ts"},{text:`# 4. web-components

**xinjs** provides the abstract \`Component\` class to make defining custom-elements
easier.

## Component

To define a custom-element you can subclass \`Component\`, simply add the properties
and methods you want, with some help from \`Component\` itself, and then simply
export your new class's \`elementCreator()\` which is a function that defines your
new component's element and produces instances of it as needed.

\`\`\`
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
\`\`\`

This component is just a structural element. By default a \`Component\` subclass will
comprise itself and a \`<slot>\`. You can change this by giving your subclass its
own \`content\` template.

The last line defines the \`ToolBar\` class as the implementation of \`<tool-bar>\`
HTML elements (\`tool-bar\` is derived automatically from the class name) and
returns an \`ElementCreator\` function that creates \`<tool-bar>\` elements.

See [elements](/?elements.ts) for more information on \`ElementCreator\` functions.

### Component properties

#### content: Element | Element[] | () => Element | () => Element[] | null

Here's a simple example of a custom-element that simply produces a
\`<label>\` wrapped around \`<span>\` and an \`<input>\`. Its value is synced
to that of its \`<input>\` so the user doesn't need to care about how
it works internally.

\`\`\`js
const { Component, elements } = xinjs

const {label, span, input} = elements

class LabeledInput extends Component {
  caption = 'untitled'
  value = ''

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

const labeledInput = LabeledInput.elementCreator()

preview.append(
  labeledInput({caption: 'A text field', value: 'some text'})
)
\`\`\`

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
[xin-form and xin-field](https://ui.xinjs.net/?form.ts).

##### <slot> names and the \`slot\` attribute

\`\`\`
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
\`\`\`

One of the neat things about custom-elements is that you can give them *multiple*
\`<slot>\`s with different \`name\` attributes and then have children target a specific
slot using the \`slot\` attribute.

This app's layout (the nav sidebar that disappears if the app is in a narrow space, etc.)
is built using just such a custom-element.

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

Here's a very simple example:

\`\`\`js
const { Component, elements } = xinjs

const { xinSlot, div } = elements

class FauxSlotExample extends Component {
  content = [
    div('This is a web-component with no shadow DOM and working slots!'),
    xinSlot({name: 'top'}),
    xinSlot(),
    xinSlot({name: 'bottom'}),
  ]
}

const fauxSlotExample = FauxSlotExample.elementCreator({
  tag: 'faux-slot-example',
  styleSpec: {
    ':host': {
      display: 'flex',
      flexDirection: 'column'
    },
  }
})

preview.append(
  fauxSlotExample(
    div({slot: 'bottom'}, 'I should be on the bottom'),
    div({slot: 'top'}, 'I should be on the top'),
    div('I should be in the middle')
  )
)
\`\`\`

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

This is simply provided as a convenient way to get to [elements](/?elements.ts)

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

[xinjs-ui](https://ui.xinjs.net) is a component library built using this \`Component\` class
that provides the essential additions to standard HTML elements needed to build many
user-interfaces.

- [xin-example](https://ui.xinjs.net/https://ui.xinjs.net/?live-example.ts) uses multiple named slots to implement
  powers the interactive examples used for this site.
- [xin-sidebar](https://ui.xinjs.net/?side-nav.ts) implements the sidebar navigation
  used on this site.
- [xin-table](https://ui.xinjs.net/?data-table.ts) implements virtualized tables
  with resizable, reorderable, sortable columns that can handle more data
  than you're probably willing to load.
- [xin-form and xin-field](https://ui.xinjs.net/?form.ts) allow you to
  quickly create forms that leverage all the built-in functionality of \`<input>\`
  elements (including powerful validation) even for custom-fields.
- [xin-md](https://ui.xinjs.net/?markdown-viewer.ts) uses \`marked\` to render
  markdown.
- [xin-3d](https://ui.xinjs.net/?babylon-3d.ts) lets you easily embed 3d scenes
  in your application using [babylonjs](https://babylonjs.com/)`,title:"4. web-components",filename:"component.ts",path:"src/component.ts"},{text:`# 4.1 blueprints

One issue with standard web-components built with xinjs is that building them
"sucks in" the version of \`xinjs\` you're working with. This isn't a huge problem
with monolithic code-bases, but it does prevent components from being loaded
"on-the-fly" from CDNs and composed on the spot and it does make it hard to
"tree shake" component libraries.

\`\`\`js
const { elements, blueprintLoader, blueprint } = xinjs

preview.append(
  blueprintLoader(
    blueprint({
      tag: 'swiss-clock',
      src: 'https://tonioloewald.github.io/xin-clock/dist/blueprint.js?1234',
      blueprintLoaded({creator}) {
        preview.append(creator())
      }
    }),
  )
)
\`\`\`

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
- \`loaded\` is the \`XinPackagedComponent\` after loading

#### \`<xin-blueprint>\` Properties

- \`blueprintLoaded(package: XinPackagedComponent)\` \`<xin-blueprint>\` when its blueprint is loaded.

#### \`<xin-loader>\` Properties

- \`allLoaded()\` is called when all the blueprints have loaded.

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

This is a more complex example that loads two components and only generates
the test component once everything is ready:

\`\`\`js
const { blueprintLoader, blueprint } = xinjs

let clockType = null

preview.append(
  blueprintLoader(
    {
      allLoaded() {
        const xinTest = this.querySelector('[tag="xin-test"]').loaded.creator
        preview.append(
          xinTest({
            description: \`\${clockType.tagName} registered\`,
            test() {
              return (
                preview.querySelector(clockType.tagName) && preview.querySelector(clockType.tagName).constructor !==
                HTMLElement
              )
            },
          })
        )
      },
    },
    blueprint({
      tag: 'swiss-clock',
      src: 'https://tonioloewald.github.io/xin-clock/dist/blueprint.js?1234',
      blueprintLoaded({type, creator}) {
        clockType = type
        preview.append(creator())
      },
    }),
    blueprint({
      tag: 'xin-test',
      src: 'https://tonioloewald.github.io/xin-test/dist/blueprint.js',
    })
  )
)
\`\`\`

## \`XinBlueprint\`

    export interface XinFactory {
      Color: typeof Color
      Component: typeof Component
      elements: typeof elements
      svgElements: typeof svgElements
      mathML: typeof mathML
      vars: typeof vars
      varDefault: typeof varDefault
      xin: typeof xin
      boxed: typeof boxed
      xinProxy: typeof xinProxy
      boxedProxy: typeof boxedProxy
      makeComponent: typeof makeComponent
      bind: typeof bind
      on: typeof on
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
> E.g. you could maintain a list of all the instances of any version of the blueprint.`,title:"4.1 blueprints",filename:"blueprint-loader.ts",path:"src/blueprint-loader.ts"},{text:`# 4.2 makeComponent

\`makeComponent(tag: string, bluePrint: XinBlueprint<T>): Promise<XinComponentSpec<T>>\`
hydrates [blueprints](/?blueprint-loader.ts) into usable [web-component](./?component.ts)s.

Here are the relevant interfaces:

\`\`\`
export interface PartsMap<T = Element> {
  [key: string]: T
}

export type XinBlueprint<T = PartsMap> = (
  tag: string,
  module: XinFactory
) => XinComponentSpec<T> | Promise<XinComponentSpec<T>>

export interface XinComponentSpec<T = PartsMap> {
  type: Component<T>
  styleSpec?: XinStyleSheet
}
\`\`\`

Note that a crucial benefit of blueprints is that the **consumer** of the blueprint gets
to choose the \`tagName\` of the custom-element. (Of course with react you can choose
the virtualDOM representation, but this often doesn't give you much of a clue where
the corresponding code is by looking at the DOM or even the React component panel.`,title:"4.2 makeComponent",filename:"make-component.ts",path:"src/make-component.ts"},{text:`# 5. css

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

\`\`\`
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
\`\`\`

There's a convenient \`Stylesheet()\` function that does all this and adds an id to the
resulting \`<style>\` element to make it easier to figure out where a given stylesheet
came from.

\`\`\`
Stylesheet('my-styles', {
  body: {
    color: 'red'
  },
  button: {
    borderRadius: 5
  }
})
\`\`\`

…inserts the following in the \`document.head\`:

\`\`\`
<style id="my-styles">
body {
  color: red;
}
button {
  border-radius: 5px;
}
</style>
\`\`\`

If a bare, non-zero **number** is assigned to a CSS property it will have 'px' suffixed
to it automatically. There are *no bare numeric*ele properties in CSS except \`0\`.

Why \`px\`? Well the other obvious options would be \`rem\` and \`em\` but \`px\` seems the
least surprising option.

\`css\` should render nested rules, such as \`@keyframes\` and \`@media\` correctly.

## Initializing CSS Variables

You can initialize CSS variables using \`_\` or \`__\` prefixes on property names.
One bar, turns the camelCase property-name into a --snake-case CSS variable
name, while two creates a default that can be overridden.

\`\`\`
StyleSheet('my-theme', {
  ':root', {
    _fooBar: 'red',
    __bazBar: '10px'
  }
})
\`\`\`

Will produce:

\`\`\`
<style id="my-theme">
  :root {
    --foo-bar: red;
    --baz-bar: var(--baz-bar-default, 10px);
  }
</style>
\`\`\`
\`\`\`js
const { elements, vars } = xinjs
const { div } = elements

window.CSS.registerProperty({
  name: '--at-bar',
  syntax: '<color>',
  inherits: true,
  initialValue: 'green',
})

preview.append(
  div(
    {
      style: {
        _fooBar: 'red',
        __bazBar: 'blue',
      }
    },
    div(
      {
        style: { color: vars.fooBar },
      },
      'fooBar'
    ),
    div(
      {
        style: { color: vars.bazBar },
      },
      'bazBar'
    ),
    div(
      {
        style: { color: vars.atBar },
      },
      'atBar'
    ),
  )
)
\`\`\`

> ### @property and CSS.registerProperty() considered harmful
>
> This [new CSS feature}(https://developer.mozilla.org/en-US/docs/Web/CSS/@property) 
> is well-intentioned but ill-considered. I advise
> against using it yourself until its serious flaws are addressed. The problem
> is that if someone registers a variable you're using or you register
> a variable someone else is using then your CSS may be broken. And
> you can't re-register a variable either. 

> This is a bit like the problem
> that xinjs Component works around with tagNames, but in practice far more
> difficult to solve. It is impossible to tell if a given instance of 
> a given variable name is an intentional reuse or a new separate variable.
> No-one intentionally defines two different components with the same tag.

## invertLuminance({[key: string]: any}) => {[key: string]: string}

Given a map of CSS properties (in camelCase) emit a map of those properties that
has color values with their luminance inverted.

    const myStyleMap = {
      ':root': cssVars,                      // includes --font-size
      '@media (prefers-color-scheme: dark)': {
        ':root': invertLuminance(cssVars)    // omits --font-size
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
    
## \`getCssVar(variable: string, atElement = document.body): string\`

\`getCssVar()\` obtains the css variable evaluated at the specified element 
(an element defined at \`:root\` can be evaluated at \`document.body\`). You
can provide the name, e.g. \`--foo-bar\`, or "wrapped", e.g. \`var(--foo-bar)\`.

### Syntax Sugar for \`calc(...)\`

More importantly, \`vars\` allows you to conveniently perform calculations
on css (dimensional) variables by a percentage:

    vars.camelSize50    // 'calc(var(--camel-size) * 0.5)'
    vars.camelSize_50   // 'calc(var(--camel-size) * -0.5)'

### Computed Colors

> #### Notes
>
> \`color()\` and \`color-mix()\` are [now enjoy 91% support](https://caniuse.com/?search=color-mix) as of writing.
> See [color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) documentation.
> Where they meet your needs, I'd suggest using them.
>
> [contrast-color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color) is coming in Safari 26, 
> but [currently enjoys 0% upport](https://caniuse.com/?search=contrast-color).
>
> **Caution** although these look superficially like the \`vars\` syntax
> sugar for \`calc()\` performed on dimensional variables, they are in fact
> color calculations are performed on colors *evaluated* on \`document.body\` at 
> execution time. (So they won'b automatically be recomputed on theme change.)

You can write:

\`\`\`
const styleSpec = {
  _lineHeight: 24,
  _spacing: 5,
  _buttonHeight: calc(\`vars.lineHeight + vars.spacing200\`)
)
\`\`\`

And then render this as CSS and stick it into a StyleNode and it will work.

You *cannot* write:

\`\`\`
const styleSpec = {
  _background: '#fafafa',
  _blockColor: vars.background_5b
}
\`\`\`

Because \`--background\` isn't defined on \`document.body\` yet, so vars.background_5b
won't be able to tell what \`--background\` is going to be yet. So either you need to
do this in two stags (create a StyleNode that defines the base color \`--background\`
then define the computed colors and add this) OR use a \`Color\` instance:

\`\`\`
const background = Color.fromCss('#fafafa')

initVars({
  background: background.toHTML,
  blockColor: background.brighten(-0.05).toHTML
})
\`\`\`

Until browsers support color calculations the way they support dimension arithmetic with \`calc()\`
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
the javascript payload.`,title:"5. css",filename:"css.ts",path:"src/css.ts"},{text:"# 5.1 color\n\n`xinjs` includes a lightweight, powerful `Color` class for manipulating colors.\nI hope at some point CSS will provide sufficiently capable native color calculations \nso that this will no longer be needed. Some of these methods have begun to appear, \nand are approaching wide implementation.\n\n## Color\n\nThe most straightforward methods for creating a `Color` instance are to use the\n`Color()` constructor to create an `rgb` or `rgba` representation, or using the\n`Color.fromCss()` to create a `Color` from any CSS (s)rgb representation,\ne.g.\n\n```\nnew Color(255, 255, 0)               // yellow\nnew Color(0, 128, 0, 0.5)            // translucent dark green\nColor.fromCss('#000')                // black\nColor.fromCss('hsl(90deg 100% 50%))  // orange\nColor.fromCss('color(srgb 1 0 0.5))  // purple\n```\n\nNote that `Color.fromCss()` is not compatible with non-srgb color spaces. The new CSS\ncolor functions produce color specifications of the form `color(<space> ....)` and\n`Color.fromCSS()` will handle `color(srgb ...)` correctly (this is so it can parse the\noutput of `color-mix(in hsl ...)` but not other [color spaces](https://developer.mozilla.org/en-US/blog/css-color-module-level-4/#whats_new_in_css_colors_module_level_4).\n\n## Manipulating Colors\n\n```js\nconst { elements, Color } = xinjs\n\nconst { label, span, div, input, button } = elements\n\nconst swatches = div({ class: 'swatches' })\nfunction makeSwatch(text) {\n  const color = Color.fromCss(colorInput.value)\n  const adjustedColor = eval('color.' + text)\n  swatches.style.setProperty('--original', color)\n  swatches.append(\n    div(\n      text, \n      {\n        class: 'swatch',\n        title: `${adjustedColor.html} ${adjustedColor.hsla}`,\n        style: { \n          _adjusted: adjustedColor, \n          _text: adjustedColor.contrasting()\n        }\n      }\n    )\n  )\n}\n\nconst colorInput = input({\n  type: 'color', \n  value: '#000',\n  onInput: update\n})\nconst red = Color.fromCss('#f00')\nconst gray = Color.fromCss('#888')\nconst teal = Color.fromCss('teal')\nconst aliceblue = Color.fromCss('aliceblue')\n\nfunction update() {\n  swatches.textContent = ''\n  makeSwatch('brighten(-0.5)')\n  makeSwatch('brighten(0.5)')\n  makeSwatch('saturate(0.25)')\n  makeSwatch('saturate(0.5)')\n  makeSwatch('desaturate(0.5)')\n  makeSwatch('desaturate(0.75)')\n  makeSwatch('contrasting()')\n  makeSwatch('contrasting(0.05)')\n  makeSwatch('contrasting(0.25)')\n  makeSwatch('contrasting(0.45)')\n  makeSwatch('inverseLuminance')\n  makeSwatch('mono')\n  makeSwatch('rotate(-330)')\n  makeSwatch('rotate(60)')\n  makeSwatch('rotate(-270)')\n  makeSwatch('rotate(120)')\n  makeSwatch('rotate(-210)')\n  makeSwatch('rotate(180)')\n  makeSwatch('rotate(-150)')\n  makeSwatch('rotate(240)')\n  makeSwatch('rotate(-90)')\n  makeSwatch('rotate(300)')\n  makeSwatch('rotate(-30)')\n  makeSwatch('opacity(0.1)')\n  makeSwatch('opacity(0.5)')\n  makeSwatch('opacity(0.75)')\n  makeSwatch('rotate(-90).opacity(0.75)')\n  makeSwatch('brighten(0.5).desaturate(0.5)')\n  makeSwatch('blend(Color.black, 0.5)')\n  makeSwatch('mix(Color.white, 0.4)')\n  makeSwatch('blend(gray, 0.4)')\n  makeSwatch('mix(red, 0.25)')\n  makeSwatch('mix(red, 0.5)')\n  makeSwatch('mix(red, 0.75)')\n  makeSwatch('mix(teal, 0.25)')\n  makeSwatch('mix(teal, 0.5)')\n  makeSwatch('mix(teal, 0.75)')\n  makeSwatch('colorMix(aliceblue, 0.25)')\n  makeSwatch('colorMix(aliceblue, 0.5)')\n  makeSwatch('colorMix(aliceblue, 0.75)')\n}\n\nfunction randomColor() {\n  colorInput.value = Color.fromHsl(Math.random() * 360, Math.random(), Math.random() * 0.5 + 0.25)\n  update()\n}\n\nrandomColor()\n\npreview.append(\n  label(\n    span('base color'),\n    colorInput\n  ),\n  button(\n    'Random(ish) Color',\n    {\n      onClick: randomColor\n    }\n  ),\n  swatches\n)\n```\n```css\n.preview .swatches {\n  display: flex;\n  gap: 4px;\n  padding: 4px;\n  flex-wrap: wrap;\n  font-size: 80%;\n}\n.preview .swatch {\n  display: inline-block;\n  padding: 2px 6px; \n  color: var(--text);\n  background: var(--adjusted);\n  border: 2px solid var(--original);\n}\n```\n\nEach of these methods creates a new color instance based on the existing color(s).\n\nIn each case `amount` is from 0 to 1, and `degrees` is an angle in degrees.\n\n- `brighten(amount: number)`\n- `darken(amount: number)`\n- `saturate(amount: number)`\n- `desaturate(amount: number)`\n- `rotate(angle: number)`\n- `opacity(amount: number)` — this just creates a color with that opacity (it doesn't adjust it)\n- `mix(otherColor: Color, amount)` — produces a mix of the two colors in HSL-space\n- `colorMix(otherColor: Color, amount)` — uses `color-mix(in hsl...)` to blend the colors\n- `blend(otherColor: Color, amount)` — produces a blend of the two colors in RGB-space (usually icky)\n- `contrasting(amount = 1)` — produces a **contrasting color** by blending the color with black (if its\n  `brightness` is > 0.5) or white by `amount`. The new color will always have opacity 1.\n  `contrasting()` produce nearly identical results to `contrast-color()`.\n  \n> **Note** the captions in the example above are colored using `contrasting()` and thus\n> should always be readable. In general, a base color will produce the worst results when\n> its `brightness` is around 0.5, much as is the case with the new and experimental CSS\n> [contrast-color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color)\n> function. \n>\n> **Also note** that `contrasting()` a highly translucent color will often get poor\n> results since the underlying background color is the important thing.\n\nWhere-ever possible, unless otherwise indicated, all of these operations are performed in HSL-space.\nHSL space is not great! For example, `desaturate` essentially blends you with medium gray (`#888`)\nrather than a BT.601 `brightness` value where \"yellow\" is really bright and \"blue\" is really dark.\n\nIf you want to desaturate colors more nicely, you can try blending them with their own `mono`.\n\n## Static Methods\n\nThese are alternatives to the standard `Color(r, g, b, a = 1)` constructor.\n\n`Color.fromVar(cssVariableName: string, element = document.body): Color` evaluates\nthe color at the specified element and then returns a `Color` instance with that\nvalue. It will accept both bare variable names (`--foo-bar`) and wrapped (`var(--foo-bar)`).\n\n`Color.fromCss(cssColor: string): Color` produces a `Color` instance from any\ncss color definition the browser can handle.\n\n`Color.fromHsl(h: number, s: number, l: number, a = 1)` produces a `Color`\ninstance from HSL/HSLA values. The HSL values are cached internally and\nused for internal calculations to reduce precision problems that occur\nwhen converting HSL to RGB and back. It's nowhere near as sophisticated as\nthe models used by (say) Adobe or Apple, but it's less bad than doing all\ncomputations in rgb.\n\n## Properties\n\n- `r`, `g`, `b` are numbers from 0 to 255.\n- `a` is a number from 0 to 1\n\n## Properties (read-only)\n\n- `black`, `white` — handy constants\n- `html` — the color in HTML `#rrggbb[aa]` format\n- `inverse` — the photonegative of the color (light is dark, orange is blue)\n- `inverseLuminance` — inverts luminance but keeps hue, great for \"dark mode\"\n- `rgb` and `rgba` — the color in `rgb(...)` and `rgba(...)` formats.\n- `hsl` and `hsla` — the color in `hsl(...)` and `hsla(...)` formats.\n- `RGBA` and `ARGB` — return the values as arrays of numbers from 0 to 1 for use with\n  [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) (for example).\n- `brightness` — this is the brightness of the color based on [BT.601](https://www.itu.int/rec/R-REC-BT.601)\n- `mono` — this produces a `Color` instance that a greyscale version (based on `brightness`)\n\n## Utilities\n\n- `swatch()` emits the color into the console with a swatch and returns the color for chaining.\n- `toString()` emits the `html` property",title:"5.1 color",filename:"color.ts",path:"src/color.ts"},{text:"# A.1 more-math\n\nSome simple functions egregiously missing from the Javascript `Math`\nobject. They are exported from `xinjs` as the `MoreMath` object.\n\n## Functions\n\n`clamp(min, v, max)` will return `v` if it's between `min` and `max`\nand the `min` or `max` otherwise.\n\n```\nclamp(0, 0.5, 1)        // produces 0.5\nclamp(0, -0.5, 1)       // produces 0\nclamp(-50, 75, 50)      // produces 50\n```\n\n`lerp(a, b, t, clamped = true)` will interpolate linearly between `a` and `b` using\nparameter `t`. `t` will be clamped to the interval `[0, 1]`, so\n`lerp` will be clamped *between* a and b unless you pass `false` as the\noptional fourth parameter (allowing `lerp()` to extrapolate).\n\n```\nlerp(0, 10, 0.5)        // produces 5\nlerp(0, 10, 2)          // produces 10\nlerp(0, 10, 2, false)   // produces 20\nlerp(5, -5, 0.75)       // produces -2.5\n```\n\n## Constants\n\n`RADIANS_TO_DEGREES` and `DEGREES_TO_RADIANS` are values to multiply\nan angle by to convert between degrees and radians.",title:"A.1 more-math",filename:"more-math.ts",path:"src/more-math.ts"},{text:`# A.2 throttle & debounce

Usage:

\`\`\`
const debouncedFunc = debounce(func, 250)
const throttledFunc = debounce(func, 250)
\`\`\`

\`throttle(voidFunc, interval)\` and \`debounce(voidFunc, interval)\` are utility functions for
producing functions that filter out unnecessary repeated calls to a function, typically
in response to rapid user input, e.g. from keystrokes or pointer movement.

\`\`\`js
const { throttle, debounce, on } = xinjs

function follow( element ) {
  return ( event ) => {
    element.style.top = event.offsetY + 'px'
    element.style.left = event.offsetX + 'px'
  }
}
on(preview, 'mousemove', follow(preview.querySelector('#unfiltered')))
on(preview, 'mousemove', throttle(follow(preview.querySelector('#throttle'))))
on(preview, 'mousemove', debounce(follow(preview.querySelector('#debounce'))))
\`\`\`
\`\`\`html
<h3>Throttle & Debounce in Action</h3>
<p>Move your mouse around in here…</p>
<p style="color: blue">follow function — triggers immediately</p>
<p style="color: red">throttled follow function — triggers every 250ms</p>
<p style="color: green">debounced follow function — stop moving for 250ms to trigger it</p>
<div id="unfiltered" class="follower" style="height: 20px; width: 20px; border-color: blue"></div>
<div id="throttle" class="follower" style="height: 40px; width: 40px; border-color: red"></div>
<div id="debounce" class="follower" style="height: 60px; width: 60px; border-color: green"></div>
\`\`\`
\`\`\`css
.preview * {
  pointer-events: none;
}
.preview .follower {
  top: 100px;
  left: 400px;
  position: absolute;
  border-width: 4px;
  border-style: solid;
  background: transparent;
  transform: translateX(-50%) translateY(-50%);
}
\`\`\`

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
However, parameters passed to skipped calls will *never* reach the wrapped function.`,title:"A.2 throttle & debounce",filename:"throttle.ts",path:"src/throttle.ts"},{text:"# A.3 hotReload\n\n`hotReload()` persists any root-level paths in `xin` that its test function evaluates as true\nto `localStorage`.\n\n```\nhotReload(test: PathTestFunction = () => true): void\n```",title:"A.3 hotReload",filename:"hot-reload.ts",path:"src/hot-reload.ts"},{text:`# todo

## work in progress

<!--{ "pin": "bottom" }-->

- change \`MutationObserver\` in Component if there's an \`onDomChanged\`
  or something handler to trigger it as appropriate
- automated golden tests?
- \`css()\` should handle multiple \`@import\`s
- possibly leverage component static property method (if we can keep type preservation)

## known issues

- bindList cloning doesn't duplicate svgs for some reason
`,title:"todo",filename:"TODO.md",path:"TODO.md",pin:"bottom"}];Rn("demo-style",To);var on="xinjs";setTimeout(()=>{let n=v.fromVar(r.brandColor),e=v.fromVar(r.background);console.log(`welcome to %c${on}`,`background: ${n.html}; color: ${e.html}; padding: 0 5px;`)},100);var bl=document.location.search!==""?document.location.search.substring(1).split("&")[0]:"README.md",yl=_e.find((n)=>n.filename===bl)||_e[0],{app:O,prefs:N}=Tn({app:{title:on,blogUrl:"https://loewald.com",discordUrl:"https://discord.com/invite/ramJ9rgky5",githubUrl:`https://github.com/tonioloewald/${on}#readme`,npmUrl:`https://www.npmjs.com/package/${on}`,xinjsuiUrl:"https://ui.xinjs.net",bundleBadgeUrl:`https://deno.bundlejs.com/?q=${on}&badge=`,bundleUrl:`https://bundlejs.com/?q=${on}`,cdnBadgeUrl:`https://data.jsdelivr.com/v1/package/npm/${on}/badge`,cdnUrl:`https://www.jsdelivr.com/package/npm/${on}`,optimizeLottie:!1,lottieFilename:"",lottieData:"",docs:_e,currentDoc:yl},prefs:{theme:"system",highContrast:!1,monochrome:!1,locale:""}});Ge((n)=>{if(n.startsWith("prefs"))return!0;return!1});K.docLink={toDOM(n,e){n.setAttribute("href",`?${e}`)}};K.current={toDOM(n,e){let t=n.getAttribute("href")||"";n.classList.toggle("current",e===t.substring(1))}};setTimeout(()=>{Object.assign(globalThis,{app:O,xin:I,bindings:K,elements:g,vars:r,touch:hn,boxed:En,Color:v})},1000);var Mo=document.querySelector("main"),{h2:gl,div:Io,span:Pe,a:Be,img:_o,header:fl,button:Po,template:wl,input:vl}=g;H(document.body,"prefs.theme",{toDOM(n,e){if(e==="system")e=getComputedStyle(document.body).getPropertyValue("--darkmode")==="true"?"dark":"light";n.classList.toggle("darkmode",e==="dark")}});H(document.body,"prefs.highContrast",{toDOM(n,e){n.classList.toggle("high-contrast",e)}});H(document.body,"prefs.monochrome",{toDOM(n,e){n.classList.toggle("monochrome",e)}});window.addEventListener("popstate",()=>{let n=window.location.search.substring(1);O.currentDoc=O.docs.find((e)=>e.filename===n)||O.docs[0]});var xl=le(()=>{console.time("filter");let n=Bo.value.toLocaleLowerCase();O.docs.forEach((e)=>{e.hidden=!e.title.toLocaleLowerCase().includes(n)&&!e.text.toLocaleLowerCase().includes(n)}),hn(O.docs),console.timeEnd("filter")}),Bo=vl({slot:"nav",placeholder:"search",type:"search",style:{width:"calc(100% - 10px)",margin:"5px"},onInput:xl});if(Mo)Mo.append(fl(Be({href:"/",style:{display:"flex",alignItems:"center",borderBottom:"none"},title:`xinjs ${de}, xinjs-ui ${Vt}`},f.xinColor({style:{_fontSize:40,marginRight:10}}),gl({bindText:"app.title"})),Pe({class:"elastic"}),Ot({minWidth:750},Pe({style:{marginRight:r.spacing,display:"flex",alignItems:"center",gap:r.spacing50}},Be({href:O.bundleUrl},_o({alt:"bundlejs size badge",src:O.bundleBadgeUrl})),Be({href:O.cdnUrl},_o({alt:"jsdelivr",src:O.cdnBadgeUrl}))),Pe({slot:"small"})),Pe({style:{flex:"0 0 10px"}}),Po({title:"theme",class:"iconic",onClick(n){Z({target:n.target,menuItems:[{icon:"github",caption:"github",action:O.githubUrl},{icon:"npm",caption:"npm",action:O.npmUrl},{icon:"discord",caption:"discord",action:O.discordUrl},{icon:"xinjsUiColor",caption:"xinjs-ui",action:O.xinjsuiUrl},{icon:"blog",caption:"Blog",action:"https://loewald.com"},null,{icon:"rgb",caption:"Color Theme",menuItems:[{caption:"System",checked(){return N.theme==="system"},action(){N.theme="system"}},{caption:"Dark",checked(){return N.theme==="dark"},action(){N.theme="dark"}},{caption:"Light",checked(){return N.theme==="light"},action(){N.theme="light"}},null,{caption:"High Contrast",checked(){return N.highContrast},action(){N.highContrast=!N.highContrast}},{caption:"Monochrome",checked(){return N.monochrome},action(){N.monochrome=!N.monochrome}}]}]})}},f.moreVertical())),Bt({name:"Documentation",navSize:200,minSize:600,style:{flex:"1 1 auto",overflow:"hidden"}},Bo,Io({slot:"nav",style:{display:"flex",flexDirection:"column",width:"100%",height:"100%",overflowY:"scroll"},bindList:{hiddenProp:"hidden",value:O.docs}},wl(Be({class:"doc-link",bindCurrent:"app.currentDoc.filename",bindDocLink:"^.filename",bindText:"^.title",onClick(n){let e=n.target.closest("a");if(!e)return;let t=un(n.target),a=n.target.closest("xin-sidenav");a.contentVisible=!0;let{href:o}=e;window.history.pushState({href:o},"",o),O.currentDoc=t,n.preventDefault()}}))),Io({style:{position:"relative",overflowY:"scroll",height:"100%"}},Po({title:"show navigation",class:"transparent close-nav show-within-compact",style:{marginTop:"2px",position:"fixed"},onClick(n){n.target.closest("xin-sidenav").contentVisible=!1}},f.chevronLeft()),St({style:{display:"block",maxWidth:"44em",margin:"auto",padding:"0 1em",overflow:"hidden"},bindValue:"app.currentDoc.text",didRender(){On.insertExamples(this,{xinjs:Gn,xinjsui:Xt})}}))));

//# debugId=63BB4A62442775D164756E2164756E21
//# sourceMappingURL=index.js.map
