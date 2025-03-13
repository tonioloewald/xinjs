var{defineProperty:An,getOwnPropertyNames:Wo,getOwnPropertyDescriptor:Do}=Object,Ho=Object.prototype.hasOwnProperty;var In=new WeakMap,zo=(n)=>{var o=In.get(n),c;if(o)return o;if(o=An({},"__esModule",{value:!0}),n&&typeof n==="object"||typeof n==="function")Wo(n).map((f)=>!Ho.call(o,f)&&An(o,f,{get:()=>n[f],enumerable:!(c=Do(n,f))||c.enumerable}));return In.set(n,o),o};var Oo=(n,o)=>{for(var c in o)An(n,c,{get:o[c],enumerable:!0,configurable:!0,set:(f)=>o[c]=()=>f})};var eo={};Oo(eo,{xinValue:()=>L,xinProxy:()=>Ln,xinPath:()=>I,xin:()=>T,version:()=>Sn,vars:()=>Fn,varDefault:()=>kn,updates:()=>Jn,unobserve:()=>b,touch:()=>s,throttle:()=>rn,svgElements:()=>$n,settings:()=>G,on:()=>xn,observerShouldBeRemoved:()=>p,observe:()=>m,mathML:()=>Tn,makeComponent:()=>a,invertLuminance:()=>So,initVars:()=>Fo,hotReload:()=>Co,getListItem:()=>cn,elements:()=>S,debounce:()=>yn,darkMode:()=>ko,css:()=>_,boxedProxy:()=>t,boxed:()=>K,blueprintLoader:()=>lo,blueprint:()=>ho,bindings:()=>h,bind:()=>g,StyleSheet:()=>$o,MoreMath:()=>yo,Component:()=>i,Color:()=>$,BlueprintLoader:()=>Vn,Blueprint:()=>Blueprint});module.exports=zo(eo);var G={debug:!1,perf:!1};function O(n){if(n==null||typeof n!=="object")return n;if(Array.isArray(n))return n.map(O);let o={};for(let c in n){let f=n[c];if(n!=null&&typeof n==="object")o[c]=O(f);else o[c]=f}return o}var Wn="-xin-data",U=`.${Wn}`,Dn="-xin-event",Hn=`.${Dn}`,M="xinPath",q="xinValue",I=(n)=>{return n[M]};function L(n){return typeof n==="object"&&n!==null?n[q]||n:n}var Y=new WeakMap,Z=new WeakMap;var w=(n)=>{let o=n.cloneNode();if(o instanceof Element){let c=Z.get(n),f=Y.get(n);if(c!=null)Z.set(o,O(c));if(f!=null)Y.set(o,O(f))}for(let c of n instanceof HTMLTemplateElement?n.content.childNodes:n.childNodes)if(c instanceof Element||c instanceof DocumentFragment)o.appendChild(w(c));else o.appendChild(c.cloneNode());return o},N=new WeakMap,cn=(n)=>{let o=document.body.parentElement;while(n.parentElement!=null&&n.parentElement!==o){let c=N.get(n);if(c!=null)return c;n=n.parentElement}return!1};var p=Symbol("observer should be removed"),fn=[],Xn=[],zn=!1,On,Zn;class Pn{description;test;callback;constructor(n,o){let c=typeof o==="string"?`"${o}"`:`function ${o.name}`,f;if(typeof n==="string")this.test=(X)=>typeof X==="string"&&X!==""&&(n.startsWith(X)||X.startsWith(n)),f=`test = "${n}"`;else if(n instanceof RegExp)this.test=n.test.bind(n),f=`test = "${n.toString()}"`;else if(n instanceof Function)this.test=n,f=`test = function ${n.name}`;else throw new Error("expect listener test to be a string, RegExp, or test function");if(this.description=`${f}, ${c}`,typeof o==="function")this.callback=o;else throw new Error("expect callback to be a path or function");fn.push(this)}}var Jn=async()=>{if(On===void 0)return;await On},Zo=()=>{if(G.perf)console.time("xin async update");let n=[...Xn];for(let o of n)fn.filter((c)=>{let f;try{f=c.test(o)}catch(X){throw new Error(`Listener ${c.description} threw "${X}" at "${o}"`)}if(f===p)return b(c),!1;return f}).forEach((c)=>{let f;try{f=c.callback(o)}catch(X){console.error(`Listener ${c.description} threw "${X}" handling "${o}"`)}if(f===p)b(c)});if(Xn.splice(0),zn=!1,typeof Zn==="function")Zn();if(G.perf)console.timeEnd("xin async update")},s=(n)=>{let o=typeof n==="string"?n:I(n);if(o===void 0)throw console.error("touch was called on an invalid target",n),new Error("touch was called on an invalid target");if(zn===!1)On=new Promise((c)=>{Zn=c}),zn=setTimeout(Zo);if(Xn.find((c)=>o.startsWith(c))==null)Xn.push(o)},un=(n,o)=>{return new Pn(n,o)},b=(n)=>{let o=fn.indexOf(n);if(o>-1)fn.splice(o,1);else throw new Error("unobserve failed, listener not found")};var Jo=(n)=>{try{return JSON.stringify(n)}catch(o){return"{has circular references}"}},Gn=(...n)=>new Error(n.map(Jo).join(" "));var io=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1),Go=0,Uo=()=>(parseInt("10000",36)+ ++Go).toString(36).slice(-5),Qo=()=>io()+Uo(),Un={},pn={};function bn(n){if(n==="")return[];if(Array.isArray(n))return n;else{let o=[];while(n.length>0){let c=n.search(/\[[^\]]+\]/);if(c===-1){o.push(n.split("."));break}else{let f=n.slice(0,c);if(n=n.slice(c),f!=="")o.push(f.split("."));if(c=n.indexOf("]")+1,o.push(n.slice(1,c-1)),n.slice(c,c+1)===".")c+=1;n=n.slice(c)}}return o}}var J=new WeakMap;function dn(n,o){if(J.get(n)===void 0)J.set(n,{});if(J.get(n)[o]===void 0)J.get(n)[o]={};let c=J.get(n)[o];if(o==="_auto_")n.forEach((f,X)=>{if(f._auto_===void 0)f._auto_=Qo();c[f._auto_+""]=X});else n.forEach((f,X)=>{c[P(f,o)+""]=X});return c}function Yo(n,o){if(J.get(n)===void 0||J.get(n)[o]===void 0)return dn(n,o);else return J.get(n)[o]}function qo(n,o,c){c=c+"";let f=Yo(n,o)[c];if(f===void 0||P(n[f],o)+""!==c)f=dn(n,o)[c];return f}function wo(n,o,c){if(n[o]===void 0&&c!==void 0)n[o]=c;return n[o]}function gn(n,o,c,f){let X=o!==""?qo(n,o,c):c;if(f===Un)return n.splice(X,1),J.delete(n),Symbol("deleted");else if(f===pn){if(o===""&&n[X]===void 0)n[X]={}}else if(f!==void 0)if(X!==void 0)n[X]=f;else if(o!==""&&P(f,o)+""===c+"")n.push(f),X=n.length-1;else throw new Error(`byIdPath insert failed at [${o}=${c}]`);return n[X]}function mn(n){if(!Array.isArray(n))throw Gn("setByPath failed: expected array, found",n)}function Nn(n){if(n==null||!(n instanceof Object))throw Gn("setByPath failed: expected Object, found",n)}function P(n,o){let c=bn(o),f=n,X,y,x,r;for(X=0,y=c.length;f!==void 0&&X<y;X++){let E=c[X];if(Array.isArray(E))for(x=0,r=E.length;f!==void 0&&x<r;x++){let F=E[x];f=f[F]}else if(f.length===0){if(f=f[E.slice(1)],E[0]!=="=")return}else if(E.includes("=")){let[F,...W]=E.split("=");f=gn(f,F,W.join("="))}else x=parseInt(E,10),f=f[x]}return f}function vn(n,o,c){let f=n,X=bn(o);while(f!=null&&X.length>0){let y=X.shift();if(typeof y==="string"){let x=y.indexOf("=");if(x>-1){if(x===0)Nn(f);else mn(f);let r=y.slice(0,x),E=y.slice(x+1);if(f=gn(f,r,E,X.length>0?pn:c),X.length===0)return!0}else{mn(f);let r=parseInt(y,10);if(X.length>0)f=f[r];else{if(c!==Un){if(f[r]===c)return!1;f[r]=c}else f.splice(r,1);return!0}}}else if(Array.isArray(y)&&y.length>0){Nn(f);while(y.length>0){let x=y.shift();if(y.length>0||X.length>0)f=wo(f,x,y.length>0?{}:[]);else{if(c!==Un){if(f[x]===c)return!1;f[x]=c}else{if(!Object.prototype.hasOwnProperty.call(f,x))return!1;delete f[x]}return!0}}}else throw new Error(`setByPath failed, bad path ${o}`)}throw new Error(`setByPath(${n}, ${o}, ${c}) failed`)}var so=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],Yn={},Bo=!0,Ko=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,Ro=(n)=>Ko.test(n),B=(n="",o="")=>{if(n==="")return o;else if(o.match(/^\d+$/)!==null||o.includes("="))return`${n}[${o}]`;else return`${n}.${o}`},_o={string(n){return new String(n)},boolean(n){return new Boolean(n)},bigint(n){return n},symbol(n){return n},number(n){return new Number(n)}};function Qn(n,o){let c=typeof n;if(n===void 0||c==="object"||c==="function")return n;else return new Proxy(_o[typeof n](n),u(o,!0))}var u=(n,o)=>({get(c,f){switch(f){case M:return n;case q:return L(c)}if(typeof f==="symbol")return c[f];let X=f,y=X.match(/^([^.[]+)\.(.+)$/)??X.match(/^([^\]]+)(\[.+)/)??X.match(/^(\[[^\]]+\])\.(.+)$/)??X.match(/^(\[[^\]]+\])\[(.+)$/);if(y!==null){let[,x,r]=y,E=B(n,x),F=P(c,x);return F!==null&&typeof F==="object"?new Proxy(F,u(E,o))[r]:F}if(X.startsWith("[")&&X.endsWith("]"))X=X.substring(1,X.length-1);if(!Array.isArray(c)&&c[X]!==void 0||Array.isArray(c)&&X.includes("=")){let x;if(X.includes("=")){let[r,E]=X.split("=");x=c.find((F)=>`${P(F,r)}`===E)}else x=c[X];if(x!==null&&typeof x==="object"){let r=B(n,X);return new Proxy(x,u(r,o))}else if(typeof x==="function")return x.bind(c);else return o?Qn(x,B(n,X)):x}else if(Array.isArray(c)){let x=c[X];return typeof x==="function"?(...r)=>{let E=Array.prototype[X].apply(c,r);if(so.includes(X))s(n);return E}:typeof x==="object"?new Proxy(x,u(B(n,X),o)):o?Qn(x,B(n,X)):x}else return o?Qn(c[X],B(n,X)):c[X]},set(c,f,X){X=L(X);let y=f!==q?B(n,f):n;if(Bo&&!Ro(y))throw new Error(`setting invalid path ${y}`);if(L(T[y])!==X&&vn(Yn,y,X))s(y);return!0}}),m=(n,o)=>{let c=typeof o==="function"?o:T[o];if(typeof c!=="function")throw new Error(`observe expects a function or path to a function, ${o} is neither`);return un(n,c)},T=new Proxy(Yn,u("",!1)),K=new Proxy(Yn,u("",!0));var{document:d,MutationObserver:hn}=globalThis,tn=(n,o)=>{let c=Z.get(n);if(c==null)return;for(let f of c){let{binding:X,options:y}=f,{path:x}=f,{toDOM:r}=X;if(r!=null){if(x.startsWith("^")){let E=cn(n);if(E!=null&&E[M]!=null)x=f.path=`${E[M]}${x.substring(1)}`;else throw console.error(`Cannot resolve relative binding ${x}`,n,"is not part of a list"),new Error(`Cannot resolve relative binding ${x}`)}if(o==null||x.startsWith(o))r(n,T[x],y)}}};if(hn!=null)new hn((o)=>{o.forEach((c)=>{[...c.addedNodes].forEach((f)=>{if(f instanceof Element)[...f.querySelectorAll(U)].forEach((X)=>tn(X))})})}).observe(d.body,{subtree:!0,childList:!0});m(()=>!0,(n)=>{let o=d.querySelectorAll(U);for(let c of o)tn(c,n)});var ln=(n)=>{let o=n.target.closest(U);while(o!=null){let c=Z.get(o);for(let f of c){let{binding:X,path:y}=f,{fromDOM:x}=X;if(x!=null){let r;try{r=x(o,f.options)}catch(E){throw console.error("Cannot get value from",o,"via",f),new Error("Cannot obtain value fromDOM")}if(r!=null){let E=T[y];if(E==null)T[y]=r;else{let F=E[M]!=null?E[q]:E,W=r[M]!=null?r[q]:r;if(F!==W)T[y]=W}}}}o=o.parentElement.closest(U)}};if(globalThis.document!=null)d.body.addEventListener("change",ln,!0),d.body.addEventListener("input",ln,!0);function g(n,o,c,f){if(n instanceof DocumentFragment)throw new Error("bind cannot bind to a DocumentFragment");let X;if(typeof o==="object"&&o[M]===void 0&&f===void 0){let{value:r}=o;X=typeof r==="string"?r:r[M],f=o,delete f.value}else X=typeof o==="string"?o:o[M];if(X==null)throw new Error("bind requires a path or object with xin Proxy");let{toDOM:y}=c;n.classList?.add(Wn);let x=Z.get(n);if(x==null)x=[],Z.set(n,x);if(x.push({path:X,binding:c,options:f}),y!=null&&!X.startsWith("^"))s(X);return n}var en=new Set,jo=(n)=>{let o=n?.target.closest(Hn),c=!1,f=new Proxy(n,{get(X,y){if(y==="stopPropagation")return()=>{n.stopPropagation(),c=!0};else{let x=X[y];return typeof x==="function"?x.bind(X):x}}});while(!c&&o!=null){let y=Y.get(o)[n.type]||[];for(let x of y){if(typeof x==="function")x(f);else{let r=T[x];if(typeof r==="function")r(f);else throw new Error(`no event handler found at path ${x}`)}if(c)continue}o=o.parentElement!=null?o.parentElement.closest(Hn):null}},xn=(n,o,c)=>{let f=Y.get(n);if(n.classList.add(Dn),f==null)f={},Y.set(n,f);if(!f[o])f[o]=[];if(!f[o].includes(c))f[o].push(c);if(!en.has(o))en.add(o),d.body.addEventListener(o,jo,!0)};var qn=(n,o)=>{let c=new Event(o);n.dispatchEvent(c)},no=(n)=>{if(n instanceof HTMLInputElement)return n.type;else if(n instanceof HTMLSelectElement&&n.hasAttribute("multiple"))return"multi-select";else return"other"},wn=(n,o)=>{switch(no(n)){case"radio":n.checked=n.value===o;break;case"checkbox":n.checked=!!o;break;case"date":n.valueAsDate=new Date(o);break;case"multi-select":for(let c of[...n.querySelectorAll("option")])c.selected=o[c.value];break;default:n.value=o}},oo=(n)=>{switch(no(n)){case"radio":{let o=n.parentElement?.querySelector(`[name="${n.name}"]:checked`);return o!=null?o.value:null}case"checkbox":return n.checked;case"date":return n.valueAsDate?.toISOString();case"multi-select":return[...n.querySelectorAll("option")].reduce((o,c)=>{return o[c.value]=c.selected,o},{});default:return n.value}},{ResizeObserver:an}=globalThis,v=an!=null?new an((n)=>{for(let o of n){let c=o.target;qn(c,"resize")}}):{observe(){},unobserve(){}},sn=(n,o,c=!0)=>{if(n!=null&&o!=null)if(typeof o==="string")n.textContent=o;else if(Array.isArray(o))o.forEach((f)=>{n.append(f instanceof Node&&c?w(f):f)});else if(o instanceof Node)n.append(c?w(o):o);else throw new Error("expect text content or document node")};var yn=(n,o=250)=>{let c;return(...f)=>{if(c!==void 0)clearTimeout(c);c=setTimeout(()=>{n(...f)},o)}},rn=(n,o=250)=>{let c,f=Date.now()-o,X=!1;return(...y)=>{if(clearTimeout(c),c=setTimeout(async()=>{n(...y),f=Date.now()},o),!X&&Date.now()-f>=o){X=!0;try{n(...y),f=Date.now()}finally{X=!1}}}};var co=Symbol("list-binding"),Vo=16;function fo(n,o){let c=[...n.querySelectorAll(U)];if(n.matches(U))c.unshift(n);for(let f of c){let X=Z.get(f);for(let y of X){if(y.path.startsWith("^"))y.path=`${o}${y.path.substring(1)}`;if(y.binding.toDOM!=null)y.binding.toDOM(f,T[y.path])}}}class Xo{boundElement;listTop;listBottom;template;options;itemToElement;_array=[];_update;_previousSlice;constructor(n,o={}){if(this.boundElement=n,this.itemToElement=new WeakMap,n.children.length!==1)throw new Error("ListBinding expects an element with exactly one child element");if(n.children[0]instanceof HTMLTemplateElement){let c=n.children[0];if(c.content.children.length!==1)throw new Error("ListBinding expects a template with exactly one child element");this.template=w(c.content.children[0])}else this.template=n.children[0],this.template.remove();if(this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),this.options=o,o.virtual!=null)v.observe(this.boundElement),this._update=rn(()=>{this.update(this._array,!0)},Vo),this.boundElement.addEventListener("scroll",this._update),this.boundElement.addEventListener("resize",this._update)}visibleSlice(){let{virtual:n,hiddenProp:o,visibleProp:c}=this.options,f=this._array;if(o!==void 0)f=f.filter((E)=>E[o]!==!0);if(c!==void 0)f=f.filter((E)=>E[c]===!0);let X=0,y=f.length-1,x=0,r=0;if(n!=null&&this.boundElement instanceof HTMLElement){let E=this.boundElement.offsetWidth,F=this.boundElement.offsetHeight,W=n.width!=null?Math.max(1,Math.floor(E/n.width)):1,j=Math.ceil(F/n.height)+1,V=Math.ceil(f.length/W),nn=W*j,Q=Math.floor(this.boundElement.scrollTop/n.height);if(Q>V-j+1)Q=Math.max(0,V-j+1);X=Q*W,y=X+nn-1,x=Q*n.height,r=Math.max(V*n.height-F-x,0)}return{items:f,firstItem:X,lastItem:y,topBuffer:x,bottomBuffer:r}}update(n,o){if(n==null)n=[];this._array=n;let{hiddenProp:c,visibleProp:f}=this.options,X=I(n),y=this.visibleSlice();this.boundElement.classList.toggle("-xin-empty-list",y.items.length===0);let x=this._previousSlice,{firstItem:r,lastItem:E,topBuffer:F,bottomBuffer:W}=y;if(c===void 0&&f===void 0&&o===!0&&x!=null&&r===x.firstItem&&E===x.lastItem)return;this._previousSlice=y;let j=0,V=0,nn=0;for(let k of[...this.boundElement.children]){if(k===this.listTop||k===this.listBottom)continue;let D=N.get(k);if(D==null)k.remove();else{let C=y.items.indexOf(D);if(C<r||C>E)k.remove(),this.itemToElement.delete(D),N.delete(k),j++}}this.listTop.style.height=String(F)+"px",this.listBottom.style.height=String(W)+"px";let Q=[],{idPath:Cn}=this.options;for(let k=r;k<=E;k++){let D=y.items[k];if(D===void 0)continue;let C=this.itemToElement.get(L(D));if(C==null){if(nn++,C=w(this.template),typeof D==="object")this.itemToElement.set(L(D),C),N.set(C,L(D));if(this.boundElement.insertBefore(C,this.listBottom),Cn!=null){let Mn=D[Cn],Ao=`${X}[${Cn}=${Mn}]`;fo(C,Ao)}else{let Mn=`${X}[${k}]`;fo(C,Mn)}}Q.push(C)}let on=null;for(let k of Q){if(k.previousElementSibling!==on)if(V++,on?.nextElementSibling!=null)this.boundElement.insertBefore(k,on.nextElementSibling);else this.boundElement.insertBefore(k,this.listBottom);on=k}if(G.perf)console.log(X,"updated",{removed:j,created:nn,moved:V})}}var xo=(n,o)=>{let c=n[co];if(c===void 0)c=new Xo(n,o),n[co]=c;return c};var h={value:{toDOM:wn,fromDOM(n){return oo(n)}},set:{toDOM:wn},text:{toDOM(n,o){n.textContent=o}},enabled:{toDOM(n,o){n.disabled=!o}},disabled:{toDOM(n,o){n.disabled=Boolean(o)}},style:{toDOM(n,o){if(typeof o==="object")for(let c of Object.keys(o))n.style[c]=o[c];else if(typeof o==="string")n.setAttribute("style",o);else throw new Error("style binding expects either a string or object")}},list:{toDOM(n,o,c){xo(n,c).update(o)}}};var Bc=180/Math.PI,Kc=Math.PI/180;function A(n,o,c){return o<n?n:o>c?c:o}function H(n,o,c){return c=A(0,c,1),c*(o-n)+n}var yo={clamp:A,lerp:H};var Io=(n,o,c)=>{return(0.299*n+0.587*o+0.114*c)/255},R=(n)=>("00"+Math.round(Number(n)).toString(16)).slice(-2);class ro{h;s;l;constructor(n,o,c){n/=255,o/=255,c/=255;let f=Math.max(n,o,c),X=f-Math.min(n,o,c),y=X!==0?f===n?(o-c)/X:f===o?2+(c-n)/X:4+(n-o)/X:0;this.h=60*y<0?60*y+360:60*y,this.s=X!==0?f<=0.5?X/(2*f-X):X/(2-(2*f-X)):0,this.l=(2*f-X)/2}}var l=globalThis.document!==void 0?globalThis.document.createElement("span"):void 0;class ${r;g;b;a;static fromCss(n){let o=n;if(l instanceof HTMLSpanElement)l.style.color=n,document.body.appendChild(l),o=getComputedStyle(l).color,l.remove();let[c,f,X,y]=o.match(/[\d.]+/g);return new $(Number(c),Number(f),Number(X),y==null?1:Number(y))}static fromHsl(n,o,c,f=1){return $.fromCss(`hsla(${n.toFixed(0)}, ${(o*100).toFixed(0)}%, ${(c*100).toFixed(0)}%, ${f.toFixed(2)})`)}constructor(n,o,c,f=1){this.r=A(0,n,255),this.g=A(0,o,255),this.b=A(0,c,255),this.a=f!==void 0?A(0,f,1):f=1}get inverse(){return new $(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){let{h:n,s:o,l:c}=this._hsl;return $.fromHsl(n,o,1-c,this.a)}get rgb(){let{r:n,g:o,b:c}=this;return`rgb(${n.toFixed(0)},${o.toFixed(0)},${c.toFixed(0)})`}get rgba(){let{r:n,g:o,b:c,a:f}=this;return`rgba(${n.toFixed(0)},${o.toFixed(0)},${c.toFixed(0)},${f.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}hslCached;get _hsl(){if(this.hslCached==null)this.hslCached=new ro(this.r,this.g,this.b);return this.hslCached}get hsl(){let{h:n,s:o,l:c}=this._hsl;return`hsl(${n.toFixed(0)}, ${(o*100).toFixed(0)}%, ${(c*100).toFixed(0)}%)`}get hsla(){let{h:n,s:o,l:c}=this._hsl;return`hsla(${n.toFixed(0)}, ${(o*100).toFixed(0)}%, ${(c*100).toFixed(0)}%, ${this.a.toFixed(2)})`}get mono(){let n=this.brightness*255;return new $(n,n,n)}get brightness(){return Io(this.r,this.g,this.b)}get html(){return this.toString()}toString(){return this.a===1?"#"+R(this.r)+R(this.g)+R(this.b):"#"+R(this.r)+R(this.g)+R(this.b)+R(Math.floor(255*this.a))}brighten(n){let{h:o,s:c,l:f}=this._hsl,X=A(0,f+n*(1-f),1);return $.fromHsl(o,c,X,this.a)}darken(n){let{h:o,s:c,l:f}=this._hsl,X=A(0,f*(1-n),1);return $.fromHsl(o,c,X,this.a)}saturate(n){let{h:o,s:c,l:f}=this._hsl,X=A(0,c+n*(1-c),1);return $.fromHsl(o,X,f,this.a)}desaturate(n){let{h:o,s:c,l:f}=this._hsl,X=A(0,c*(1-n),1);return $.fromHsl(o,X,f,this.a)}rotate(n){let{h:o,s:c,l:f}=this._hsl,X=(o+360+n)%360;return $.fromHsl(X,c,f,this.a)}opacity(n){let{h:o,s:c,l:f}=this._hsl;return $.fromHsl(o,c,f,n)}swatch(){let{r:n,g:o,b:c,a:f}=this;return console.log(`%c      %c ${this.html}, rgba(${n}, ${o}, ${c}, ${f}), ${this.hsla}`,`background-color: rgba(${n}, ${o}, ${c}, ${f})`,"background-color: transparent"),this}blend(n,o){return new $(H(this.r,n.r,o),H(this.g,n.g,o),H(this.b,n.b,o),H(this.a,n.a,o))}mix(n,o){let c=this._hsl,f=n._hsl;return $.fromHsl(H(c.h,f.h,o),H(c.s,f.s,o),H(c.l,f.l,o),H(this.a,n.a,o))}}function z(n){return n.replace(/[A-Z]/g,(o)=>{return`-${o.toLocaleLowerCase()}`})}function Eo(n){return n.replace(/-([a-z])/g,(o,c)=>{return c.toLocaleUpperCase()})}var Po="http://www.w3.org/1998/Math/MathML",uo="http://www.w3.org/2000/svg",En={},Bn=(n,...o)=>{if(En[n]===void 0){let[X,y]=n.split("|");if(y===void 0)En[n]=globalThis.document.createElement(X);else En[n]=globalThis.document.createElementNS(y,X)}let c=En[n].cloneNode(),f={};for(let X of o)if(X instanceof Element||X instanceof DocumentFragment||typeof X==="string"||typeof X==="number")if(c instanceof HTMLTemplateElement)c.content.append(X);else c.append(X);else Object.assign(f,X);for(let X of Object.keys(f)){let y=f[X];if(X==="apply")y(c);else if(X==="style")if(typeof y==="object")for(let x of Object.keys(y)){let r=Rn(z(x),y[x]);if(r.prop.startsWith("--"))c.style.setProperty(r.prop,r.value);else c.style[x]=r.value}else c.setAttribute("style",y);else if(X.match(/^on[A-Z]/)!=null){let x=X.substring(2).toLowerCase();xn(c,x,y)}else if(X==="bind")if((typeof y.binding==="string"?h[y.binding]:y.binding)!==void 0&&y.value!==void 0)g(c,y.value,y.binding instanceof Function?{toDOM:y.binding}:y.binding);else throw new Error("bad binding");else if(X.match(/^bind[A-Z]/)!=null){let x=X.substring(4,5).toLowerCase()+X.substring(5),r=h[x];if(r!==void 0)g(c,y,r);else throw new Error(`${X} is not allowed, bindings.${x} is not defined`)}else if(c[X]!==void 0){let{MathMLElement:x}=globalThis;if(c instanceof SVGElement||x!==void 0&&c instanceof x)c.setAttribute(X,y);else c[X]=y}else{let x=z(X);if(x==="class")y.split(" ").forEach((r)=>{c.classList.add(r)});else if(c[x]!==void 0)c[x]=y;else if(typeof y==="boolean")y?c.setAttribute(x,""):c.removeAttribute(x);else c.setAttribute(x,y)}}return c},Kn=(...n)=>{let o=globalThis.document.createDocumentFragment();for(let c of n)o.append(c);return o},S=new Proxy({fragment:Kn},{get(n,o){if(o=o.replace(/[A-Z]/g,(c)=>`-${c.toLocaleLowerCase()}`),n[o]===void 0)n[o]=(...c)=>Bn(o,...c);return n[o]},set(){throw new Error("You may not add new properties to elements")}}),$n=new Proxy({fragment:Kn},{get(n,o){if(n[o]===void 0)n[o]=(...c)=>Bn(`${o}|${uo}`,...c);return n[o]},set(){throw new Error("You may not add new properties to elements")}}),Tn=new Proxy({fragment:Kn},{get(n,o){if(n[o]===void 0)n[o]=(...c)=>Bn(`${o}|${Po}`,...c);return n[o]},set(){throw new Error("You may not add new properties to elements")}});function $o(n,o){let c=S.style(_(o));c.id=n,document.head.append(c)}var mo=["animation-iteration-count","flex","flex-base","flex-grow","flex-shrink","opacity","order","tab-size","widows","z-index","zoom"],Rn=(n,o)=>{if(typeof o==="number"&&!mo.includes(n))o=`${o}px`;if(n.startsWith("_"))if(n.startsWith("__"))n="--"+n.substring(2),o=`var(${n}-default, ${o})`;else n="--"+n.substring(1);return{prop:n,value:String(o)}},No=(n,o,c)=>{if(c===void 0)return"";if(c instanceof $)c=c.html;let f=Rn(o,c);return`${n}  ${f.prop}: ${f.value};`},To=(n,o,c="")=>{let f=z(n);if(typeof o==="object"&&!(o instanceof $)){let X=Object.keys(o).map((y)=>To(y,o[y],`${c}  `)).join(`
`);return`${c}  ${n} {
${X}
${c}  }`}else return No(c,f,o)},_=(n,o="")=>{return Object.keys(n).map((f)=>{let X=n[f];if(typeof X==="string"){if(f==="@import")return`@import url('${X}');`;throw new Error("top-level string value only allowed for `@import`")}let y=Object.keys(X).map((x)=>To(x,X[x])).join(`
`);return`${o}${f} {
${y}
}`}).join(`

`)},Fo=(n)=>{console.warn("initVars is deprecated. Just use _ and __ prefixes instead.");let o={};for(let c of Object.keys(n)){let f=n[c],X=z(c);o[`--${X}`]=typeof f==="number"&&f!==0?String(f)+"px":f}return o},ko=(n)=>{console.warn("darkMode is deprecated. Use inverseLuminance instead.");let o={};for(let c of Object.keys(n)){let f=n[c];if(typeof f==="string"&&f.match(/^(#|rgb[a]?\(|hsl[a]?\()/)!=null)f=$.fromCss(f).inverseLuminance.html,o[`--${z(c)}`]=f}return o},So=(n)=>{let o={};for(let c of Object.keys(n)){let f=n[c];if(f instanceof $)o[c]=f.inverseLuminance;else if(typeof f==="string"&&f.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/))o[c]=$.fromCss(f).inverseLuminance}return o},Fn=new Proxy({},{get(n,o){if(n[o]==null){o=o.replace(/[A-Z]/g,(r)=>`-${r.toLocaleLowerCase()}`);let[,c,,f,X,y]=o.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/),x=`--${c}`;if(X!=null){let r=f==null?Number(X)/100:-Number(X)/100;switch(y){case"b":{let E=getComputedStyle(document.body).getPropertyValue(x);n[o]=r>0?$.fromCss(E).brighten(r).rgba:$.fromCss(E).darken(-r).rgba}break;case"s":{let E=getComputedStyle(document.body).getPropertyValue(x);n[o]=r>0?$.fromCss(E).saturate(r).rgba:$.fromCss(E).desaturate(-r).rgba}break;case"h":{let E=getComputedStyle(document.body).getPropertyValue(x);n[o]=$.fromCss(E).rotate(r*100).rgba,console.log($.fromCss(E).hsla,$.fromCss(E).rotate(r).hsla)}break;case"o":{let E=getComputedStyle(document.body).getPropertyValue(x);n[o]=$.fromCss(E).opacity(r).rgba}break;case"":n[o]=`calc(var(${x}) * ${r})`;break;default:throw console.error(y),new Error(`Unrecognized method ${y} for css variable ${x}`)}}else n[o]=`var(${x})`}return n[o]}}),kn=new Proxy({},{get(n,o){if(n[o]===void 0){let c=`--${o.replace(/[A-Z]/g,(f)=>`-${f.toLocaleLowerCase()}`)}`;n[o]=(f)=>`var(${c}, ${f})`}return n[o]}});var po=0;function _n(){return`custom-elt${(po++).toString(36)}`}var Lo=0,e={};function bo(n,o){let c=e[n],f=_(o).replace(/:host\b/g,n);e[n]=c?c+`
`+f:f}function go(n){if(e[n])document.head.append(S.style({id:n+"-component"},e[n]));delete e[n]}class i extends HTMLElement{static elements=S;static _elementCreator;instanceId;styleNode;static styleSpec;static styleNode;content=S.slot();isSlotted;static _tagName=null;static get tagName(){return this._tagName}static StyleNode(n){return console.warn("StyleNode is deprecated, just assign static styleSpec: XinStyleSheet to the class directly"),S.style(_(n))}static elementCreator(n={}){if(this._elementCreator==null){let{tag:o,styleSpec:c}=n,f=n!=null?o:null;if(f==null)if(typeof this.name==="string"&&this.name!==""){if(f=z(this.name),f.startsWith("-"))f=f.slice(1)}else f=_n();if(customElements.get(f)!=null)console.warn(`${f} is already defined`);if(f.match(/\w+(-\w+)+/)==null)console.warn(`${f} is not a legal tag for a custom-element`),f=_n();while(customElements.get(f)!==void 0)f=_n();if(this._tagName=f,c!==void 0)bo(f,c);window.customElements.define(f,this,n),this._elementCreator=S[f]}return this._elementCreator}initAttributes(...n){let o={},c={};new MutationObserver((X)=>{let y=!1;if(X.forEach((x)=>{y=!!(x.attributeName&&n.includes(Eo(x.attributeName)))}),y&&this.queueRender!==void 0)this.queueRender(!1)}).observe(this,{attributes:!0}),n.forEach((X)=>{o[X]=O(this[X]);let y=z(X);Object.defineProperty(this,X,{enumerable:!1,get(){if(typeof o[X]==="boolean")return this.hasAttribute(y);else if(this.hasAttribute(y))return typeof o[X]==="number"?parseFloat(this.getAttribute(y)):this.getAttribute(y);else if(c[X]!==void 0)return c[X];else return o[X]},set(x){if(typeof o[X]==="boolean"){if(x!==this[X]){if(x)this.setAttribute(y,"");else this.removeAttribute(y);this.queueRender()}}else if(typeof o[X]==="number"){if(x!==parseFloat(this[X]))this.setAttribute(y,x),this.queueRender()}else if(typeof x==="object"||`${x}`!==`${this[X]}`){if(x===null||x===void 0||typeof x==="object")this.removeAttribute(y);else this.setAttribute(y,x);this.queueRender(),c[X]=x}}})})}initValue(){let n=Object.getOwnPropertyDescriptor(this,"value");if(n===void 0||n.get!==void 0||n.set!==void 0)return;let o=this.hasAttribute("value")?this.getAttribute("value"):O(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get(){return o},set(c){if(o!==c)o=c,this.queueRender(!0)}})}_parts;get parts(){let n=this.shadowRoot!=null?this.shadowRoot:this;if(this._parts==null)this._parts=new Proxy({},{get(o,c){if(o[c]===void 0){let f=n.querySelector(`[part="${c}"]`);if(f==null)f=n.querySelector(c);if(f==null)throw new Error(`elementRef "${c}" does not exist!`);f.removeAttribute("data-ref"),o[c]=f}return o[c]}});return this._parts}constructor(){super();Lo+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${Lo}`,this._value=O(this.defaultValue)}connectedCallback(){if(go(this.constructor.tagName),this.hydrate(),this.role!=null)this.setAttribute("role",this.role);if(this.onResize!==void 0){if(v.observe(this),this._onResize==null)this._onResize=this.onResize.bind(this);this.addEventListener("resize",this._onResize)}if(this.value!=null&&this.getAttribute("value")!=null)this._value=this.getAttribute("value");this.queueRender()}disconnectedCallback(){v.unobserve(this)}_changeQueued=!1;_renderQueued=!1;queueRender(n=!1){if(!this._hydrated)return;if(!this._changeQueued)this._changeQueued=n;if(!this._renderQueued)this._renderQueued=!0,requestAnimationFrame(()=>{if(this._changeQueued)qn(this,"change");this._changeQueued=!1,this._renderQueued=!1,this.render()})}_hydrated=!1;hydrate(){if(!this._hydrated){this.initValue();let n=typeof this.content!=="function",o=typeof this.content==="function"?this.content():this.content,{styleSpec:c}=this.constructor,{styleNode:f}=this.constructor;if(c)f=this.constructor.styleNode=S.style(_(c)),delete this.constructor.styleNode;if(this.styleNode)console.warn(this,"styleNode is deprecrated, use static styleNode or statc styleSpec instead"),f=this.styleNode;if(f){let X=this.attachShadow({mode:"open"});X.appendChild(f.cloneNode(!0)),sn(X,o,n)}else if(o!==null){let X=[...this.childNodes];sn(this,o,n),this.isSlotted=this.querySelector("slot,xin-slot")!==void 0;let y=[...this.querySelectorAll("slot")];if(y.length>0)y.forEach(jn.replaceSlot);if(X.length>0){let x={"":this};[...this.querySelectorAll("xin-slot")].forEach((r)=>{x[r.name]=r}),X.forEach((r)=>{let E=x[""],F=r instanceof Element?x[r.slot]:E;(F!==void 0?F:E).append(r)})}}this._hydrated=!0}}render(){}}class jn extends i{name="";content=null;static replaceSlot(n){let o=document.createElement("xin-slot");if(n.name!=="")o.setAttribute("name",n.name);n.replaceWith(o)}constructor(){super();this.initAttributes("name")}}var nf=jn.elementCreator({tag:"xin-slot"});var Co=(n=()=>!0)=>{let o=localStorage.getItem("xin-state");if(o!=null){let f=JSON.parse(o);for(let X of Object.keys(f).filter(n))if(T[X]!==void 0)Object.assign(T[X],f[X]);else T[X]=f[X]}let c=yn(()=>{let f={},X=L(T);for(let y of Object.keys(X).filter(n))f[y]=X[y];localStorage.setItem("xin-state",JSON.stringify(f)),console.log("xin state saved to localStorage")},500);m(n,c)};var Sn="0.8.5";function t(n){return Object.assign(K,n),K}var Mo=!1;function Ln(n,o=!1){if(o){if(!Mo)console.warn("xinProxy(..., true) is deprecated; use boxedProxy(...) instead"),Mo=!0;return t(n)}return Object.keys(n).forEach((c)=>{T[c]=n[c]}),T}var vo={};async function a(n,o){let{type:c,styleSpec:f}=await o(n,{Color:$,Component:i,elements:S,svgElements:$n,mathML:Tn,varDefault:kn,vars:Fn,xin:T,boxed:K,xinProxy:Ln,boxedProxy:t,makeComponent:a,version:Sn}),X={type:c,creator:c.elementCreator({tag:n,styleSpec:f})};return vo[n]=X,X}class Blueprint extends i{tag="anon-elt";src="";property="default";loaded;async packaged(){if(!this.loaded){let{tag,src}=this,imported=await eval(`import('${src}')`),blueprint=imported[this.property];this.loaded=await a(tag,blueprint)}return this.loaded}constructor(){super();this.initAttributes("tag","src","property")}}var ho=Blueprint.elementCreator({tag:"xin-blueprint",styleSpec:{":host":{display:"none"}}});class Vn extends i{constructor(){super()}async load(){let o=[...this.querySelectorAll(Blueprint.tagName)].filter((c)=>c.src).map((c)=>c.packaged());await Promise.all(o)}connectedCallback(){super.connectedCallback(),this.load()}}var lo=Vn.elementCreator({tag:"xin-loader",styleSpec:{":host":{display:"none"}}});

//# debugId=AD9EB54FBA7B91D464756E2164756E21
//# sourceMappingURL=main.js.map
