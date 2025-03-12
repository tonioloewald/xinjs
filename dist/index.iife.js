(()=>{var{defineProperty:Mn,getOwnPropertyNames:Cc,getOwnPropertyDescriptor:Wc}=Object,Dc=Object.prototype.hasOwnProperty;var Vn=new WeakMap,Hc=(n)=>{var c=Vn.get(n),f;if(c)return c;if(c=Mn({},"__esModule",{value:!0}),n&&typeof n==="object"||typeof n==="function")Cc(n).map((o)=>!Dc.call(c,o)&&Mn(c,o,{get:()=>n[o],enumerable:!(f=Wc(n,o))||f.enumerable}));return Vn.set(n,c),c};var zc=(n,c)=>{for(var f in c)Mn(n,f,{get:c[f],enumerable:!0,configurable:!0,set:(o)=>c[f]=()=>o})};var hc={};zc(hc,{xinValue:()=>L,xinProxy:()=>Fn,xinPath:()=>V,xin:()=>F,vars:()=>$n,varDefault:()=>Tn,updates:()=>On,unobserve:()=>p,touch:()=>w,throttle:()=>xn,svgElements:()=>rn,settings:()=>U,on:()=>on,observerShouldBeRemoved:()=>N,observe:()=>u,mathML:()=>En,makeComponent:()=>Sn,invertLuminance:()=>Sc,initVars:()=>Tc,hotReload:()=>Lc,getListItem:()=>nn,elements:()=>k,debounce:()=>Xn,darkMode:()=>Fc,css:()=>s,boxedProxy:()=>_n,boxed:()=>b,blueprintLoader:()=>vc,blueprint:()=>dc,bindings:()=>h,bind:()=>d,StyleSheet:()=>Ec,MoreMath:()=>xc,Component:()=>G,Color:()=>$,BlueprintLoader:()=>jn,Blueprint:()=>Blueprint});var U={debug:!1,perf:!1};function O(n){if(n==null||typeof n!=="object")return n;if(Array.isArray(n))return n.map(O);let c={};for(let f in n){let o=n[f];if(n!=null&&typeof n==="object")c[f]=O(o);else c[f]=o}return c}var An="-xin-data",Q=`.${An}`,Cn="-xin-event",Wn=`.${Cn}`,A="xinPath",B="xinValue",V=(n)=>{return n[A]};function L(n){return typeof n==="object"&&n!==null?n[B]||n:n}var q=new WeakMap,Z=new WeakMap;var K=(n)=>{let c=n.cloneNode();if(c instanceof Element){let f=Z.get(n),o=q.get(n);if(f!=null)Z.set(c,O(f));if(o!=null)q.set(c,O(o))}for(let f of n instanceof HTMLTemplateElement?n.content.childNodes:n.childNodes)if(f instanceof Element||f instanceof DocumentFragment)c.appendChild(K(f));else c.appendChild(f.cloneNode());return c},m=new WeakMap,nn=(n)=>{let c=document.body.parentElement;while(n.parentElement!=null&&n.parentElement!==c){let f=m.get(n);if(f!=null)return f;n=n.parentElement}return!1};var N=Symbol("observer should be removed"),cn=[],fn=[],Dn=!1,Hn,zn;class In{description;test;callback;constructor(n,c){let f=typeof c==="string"?`"${c}"`:`function ${c.name}`,o;if(typeof n==="string")this.test=(X)=>typeof X==="string"&&X!==""&&(n.startsWith(X)||X.startsWith(n)),o=`test = "${n}"`;else if(n instanceof RegExp)this.test=n.test.bind(n),o=`test = "${n.toString()}"`;else if(n instanceof Function)this.test=n,o=`test = function ${n.name}`;else throw new Error("expect listener test to be a string, RegExp, or test function");if(this.description=`${o}, ${f}`,typeof c==="function")this.callback=c;else throw new Error("expect callback to be a path or function");cn.push(this)}}var On=async()=>{if(Hn===void 0)return;await Hn},Oc=()=>{if(U.perf)console.time("xin async update");let n=[...fn];for(let c of n)cn.filter((f)=>{let o;try{o=f.test(c)}catch(X){throw new Error(`Listener ${f.description} threw "${X}" at "${c}"`)}if(o===N)return p(f),!1;return o}).forEach((f)=>{let o;try{o=f.callback(c)}catch(X){console.error(`Listener ${f.description} threw "${X}" handling "${c}"`)}if(o===N)p(f)});if(fn.splice(0),Dn=!1,typeof zn==="function")zn();if(U.perf)console.timeEnd("xin async update")},w=(n)=>{let c=typeof n==="string"?n:V(n);if(c===void 0)throw console.error("touch was called on an invalid target",n),new Error("touch was called on an invalid target");if(Dn===!1)Hn=new Promise((f)=>{zn=f}),Dn=setTimeout(Oc);if(fn.find((f)=>c.startsWith(f))==null)fn.push(c)},Pn=(n,c)=>{return new In(n,c)},p=(n)=>{let c=cn.indexOf(n);if(c>-1)cn.splice(c,1);else throw new Error("unobserve failed, listener not found")};var Zc=(n)=>{try{return JSON.stringify(n)}catch(c){return"{has circular references}"}},Zn=(...n)=>new Error(n.map(Zc).join(" "));var Jc=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1),Gc=0,Uc=()=>(parseInt("10000",36)+ ++Gc).toString(36).slice(-5),Qc=()=>Jc()+Uc(),Jn={},Nn={};function pn(n){if(n==="")return[];if(Array.isArray(n))return n;else{let c=[];while(n.length>0){let f=n.search(/\[[^\]]+\]/);if(f===-1){c.push(n.split("."));break}else{let o=n.slice(0,f);if(n=n.slice(f),o!=="")c.push(o.split("."));if(f=n.indexOf("]")+1,c.push(n.slice(1,f-1)),n.slice(f,f+1)===".")f+=1;n=n.slice(f)}}return c}}var J=new WeakMap;function bn(n,c){if(J.get(n)===void 0)J.set(n,{});if(J.get(n)[c]===void 0)J.get(n)[c]={};let f=J.get(n)[c];if(c==="_auto_")n.forEach((o,X)=>{if(o._auto_===void 0)o._auto_=Qc();f[o._auto_+""]=X});else n.forEach((o,X)=>{f[I(o,c)+""]=X});return f}function Yc(n,c){if(J.get(n)===void 0||J.get(n)[c]===void 0)return bn(n,c);else return J.get(n)[c]}function qc(n,c,f){f=f+"";let o=Yc(n,c)[f];if(o===void 0||I(n[o],c)+""!==f)o=bn(n,c)[f];return o}function Bc(n,c,f){if(n[c]===void 0&&f!==void 0)n[c]=f;return n[c]}function gn(n,c,f,o){let X=c!==""?qc(n,c,f):f;if(o===Jn)return n.splice(X,1),J.delete(n),Symbol("deleted");else if(o===Nn){if(c===""&&n[X]===void 0)n[X]={}}else if(o!==void 0)if(X!==void 0)n[X]=o;else if(c!==""&&I(o,c)+""===f+"")n.push(o),X=n.length-1;else throw new Error(`byIdPath insert failed at [${c}=${f}]`);return n[X]}function un(n){if(!Array.isArray(n))throw Zn("setByPath failed: expected array, found",n)}function mn(n){if(n==null||!(n instanceof Object))throw Zn("setByPath failed: expected Object, found",n)}function I(n,c){let f=pn(c),o=n,X,y,x,r;for(X=0,y=f.length;o!==void 0&&X<y;X++){let E=f[X];if(Array.isArray(E))for(x=0,r=E.length;o!==void 0&&x<r;x++){let T=E[x];o=o[T]}else if(o.length===0){if(o=o[E.slice(1)],E[0]!=="=")return}else if(E.includes("=")){let[T,...W]=E.split("=");o=gn(o,T,W.join("="))}else x=parseInt(E,10),o=o[x]}return o}function dn(n,c,f){let o=n,X=pn(c);while(o!=null&&X.length>0){let y=X.shift();if(typeof y==="string"){let x=y.indexOf("=");if(x>-1){if(x===0)mn(o);else un(o);let r=y.slice(0,x),E=y.slice(x+1);if(o=gn(o,r,E,X.length>0?Nn:f),X.length===0)return!0}else{un(o);let r=parseInt(y,10);if(X.length>0)o=o[r];else{if(f!==Jn){if(o[r]===f)return!1;o[r]=f}else o.splice(r,1);return!0}}}else if(Array.isArray(y)&&y.length>0){mn(o);while(y.length>0){let x=y.shift();if(y.length>0||X.length>0)o=Bc(o,x,y.length>0?{}:[]);else{if(f!==Jn){if(o[x]===f)return!1;o[x]=f}else{if(!Object.prototype.hasOwnProperty.call(o,x))return!1;delete o[x]}return!0}}}else throw new Error(`setByPath failed, bad path ${c}`)}throw new Error(`setByPath(${n}, ${c}, ${f}) failed`)}var Kc=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],Un={},wc=!0,Rc=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,ic=(n)=>Rc.test(n),R=(n="",c="")=>{if(n==="")return c;else if(c.match(/^\d+$/)!==null||c.includes("="))return`${n}[${c}]`;else return`${n}.${c}`},sc={string(n){return new String(n)},boolean(n){return new Boolean(n)},bigint(n){return n},symbol(n){return n},number(n){return new Number(n)}};function Gn(n,c){let f=typeof n;if(n===void 0||f==="object"||f==="function")return n;else return new Proxy(sc[typeof n](n),P(c,!0))}var P=(n,c)=>({get(f,o){switch(o){case A:return n;case B:return L(f)}if(typeof o==="symbol")return f[o];let X=o,y=X.match(/^([^.[]+)\.(.+)$/)??X.match(/^([^\]]+)(\[.+)/)??X.match(/^(\[[^\]]+\])\.(.+)$/)??X.match(/^(\[[^\]]+\])\[(.+)$/);if(y!==null){let[,x,r]=y,E=R(n,x),T=I(f,x);return T!==null&&typeof T==="object"?new Proxy(T,P(E,c))[r]:T}if(X.startsWith("[")&&X.endsWith("]"))X=X.substring(1,X.length-1);if(!Array.isArray(f)&&f[X]!==void 0||Array.isArray(f)&&X.includes("=")){let x;if(X.includes("=")){let[r,E]=X.split("=");x=f.find((T)=>`${I(T,r)}`===E)}else x=f[X];if(x!==null&&typeof x==="object"){let r=R(n,X);return new Proxy(x,P(r,c))}else if(typeof x==="function")return x.bind(f);else return c?Gn(x,R(n,X)):x}else if(Array.isArray(f)){let x=f[X];return typeof x==="function"?(...r)=>{let E=Array.prototype[X].apply(f,r);if(Kc.includes(X))w(n);return E}:typeof x==="object"?new Proxy(x,P(R(n,X),c)):c?Gn(x,R(n,X)):x}else return c?Gn(f[X],R(n,X)):f[X]},set(f,o,X){X=L(X);let y=o!==B?R(n,o):n;if(wc&&!ic(y))throw new Error(`setting invalid path ${y}`);if(L(F[y])!==X&&dn(Un,y,X))w(y);return!0}}),u=(n,c)=>{let f=typeof c==="function"?c:F[c];if(typeof f!=="function")throw new Error(`observe expects a function or path to a function, ${c} is neither`);return Pn(n,f)},F=new Proxy(Un,P("",!1)),b=new Proxy(Un,P("",!0));var{document:g,MutationObserver:vn}=globalThis,en=(n,c)=>{let f=Z.get(n);if(f==null)return;for(let o of f){let{binding:X,options:y}=o,{path:x}=o,{toDOM:r}=X;if(r!=null){if(x.startsWith("^")){let E=nn(n);if(E!=null&&E[A]!=null)x=o.path=`${E[A]}${x.substring(1)}`;else throw console.error(`Cannot resolve relative binding ${x}`,n,"is not part of a list"),new Error(`Cannot resolve relative binding ${x}`)}if(c==null||x.startsWith(c))r(n,F[x],y)}}};if(vn!=null)new vn((c)=>{c.forEach((f)=>{[...f.addedNodes].forEach((o)=>{if(o instanceof Element)[...o.querySelectorAll(Q)].forEach((X)=>en(X))})})}).observe(g.body,{subtree:!0,childList:!0});u(()=>!0,(n)=>{let c=g.querySelectorAll(Q);for(let f of c)en(f,n)});var hn=(n)=>{let c=n.target.closest(Q);while(c!=null){let f=Z.get(c);for(let o of f){let{binding:X,path:y}=o,{fromDOM:x}=X;if(x!=null){let r;try{r=x(c,o.options)}catch(E){throw console.error("Cannot get value from",c,"via",o),new Error("Cannot obtain value fromDOM")}if(r!=null){let E=F[y];if(E==null)F[y]=r;else{let T=E[A]!=null?E[B]:E,W=r[A]!=null?r[B]:r;if(T!==W)F[y]=W}}}}c=c.parentElement.closest(Q)}};if(globalThis.document!=null)g.body.addEventListener("change",hn,!0),g.body.addEventListener("input",hn,!0);function d(n,c,f,o){if(n instanceof DocumentFragment)throw new Error("bind cannot bind to a DocumentFragment");let X;if(typeof c==="object"&&c[A]===void 0&&o===void 0){let{value:r}=c;X=typeof r==="string"?r:r[A],o=c,delete o.value}else X=typeof c==="string"?c:c[A];if(X==null)throw new Error("bind requires a path or object with xin Proxy");let{toDOM:y}=f;n.classList?.add(An);let x=Z.get(n);if(x==null)x=[],Z.set(n,x);if(x.push({path:X,binding:f,options:o}),y!=null&&!X.startsWith("^"))w(X);return n}var ln=new Set,_c=(n)=>{let c=n?.target.closest(Wn),f=!1,o=new Proxy(n,{get(X,y){if(y==="stopPropagation")return()=>{n.stopPropagation(),f=!0};else{let x=X[y];return typeof x==="function"?x.bind(X):x}}});while(!f&&c!=null){let y=q.get(c)[n.type]||[];for(let x of y){if(typeof x==="function")x(o);else{let r=F[x];if(typeof r==="function")r(o);else throw new Error(`no event handler found at path ${x}`)}if(f)continue}c=c.parentElement!=null?c.parentElement.closest(Wn):null}},on=(n,c,f)=>{let o=q.get(n);if(n.classList.add(Cn),o==null)o={},q.set(n,o);if(!o[c])o[c]=[];if(!o[c].includes(f))o[c].push(f);if(!ln.has(c))ln.add(c),g.body.addEventListener(c,_c,!0)};var Qn=(n,c)=>{let f=new Event(c);n.dispatchEvent(f)},an=(n)=>{if(n instanceof HTMLInputElement)return n.type;else if(n instanceof HTMLSelectElement&&n.hasAttribute("multiple"))return"multi-select";else return"other"},Yn=(n,c)=>{switch(an(n)){case"radio":n.checked=n.value===c;break;case"checkbox":n.checked=!!c;break;case"date":n.valueAsDate=new Date(c);break;case"multi-select":for(let f of[...n.querySelectorAll("option")])f.selected=c[f.value];break;default:n.value=c}},nc=(n)=>{switch(an(n)){case"radio":{let c=n.parentElement?.querySelector(`[name="${n.name}"]:checked`);return c!=null?c.value:null}case"checkbox":return n.checked;case"date":return n.valueAsDate?.toISOString();case"multi-select":return[...n.querySelectorAll("option")].reduce((c,f)=>{return c[f.value]=f.selected,c},{});default:return n.value}},{ResizeObserver:tn}=globalThis,v=tn!=null?new tn((n)=>{for(let c of n){let f=c.target;Qn(f,"resize")}}):{observe(){},unobserve(){}},qn=(n,c,f=!0)=>{if(n!=null&&c!=null)if(typeof c==="string")n.textContent=c;else if(Array.isArray(c))c.forEach((o)=>{n.append(o instanceof Node&&f?K(o):o)});else if(c instanceof Node)n.append(f?K(c):c);else throw new Error("expect text content or document node")};var Xn=(n,c=250)=>{let f;return(...o)=>{if(f!==void 0)clearTimeout(f);f=setTimeout(()=>{n(...o)},c)}},xn=(n,c=250)=>{let f,o=Date.now()-c,X=!1;return(...y)=>{if(clearTimeout(f),f=setTimeout(async()=>{n(...y),o=Date.now()},c),!X&&Date.now()-o>=c){X=!0;try{n(...y),o=Date.now()}finally{X=!1}}}};var cc=Symbol("list-binding"),jc=16;function fc(n,c){let f=[...n.querySelectorAll(Q)];if(n.matches(Q))f.unshift(n);for(let o of f){let X=Z.get(o);for(let y of X){if(y.path.startsWith("^"))y.path=`${c}${y.path.substring(1)}`;if(y.binding.toDOM!=null)y.binding.toDOM(o,F[y.path])}}}class oc{boundElement;listTop;listBottom;template;options;itemToElement;_array=[];_update;_previousSlice;constructor(n,c={}){if(this.boundElement=n,this.itemToElement=new WeakMap,n.children.length!==1)throw new Error("ListBinding expects an element with exactly one child element");if(n.children[0]instanceof HTMLTemplateElement){let f=n.children[0];if(f.content.children.length!==1)throw new Error("ListBinding expects a template with exactly one child element");this.template=K(f.content.children[0])}else this.template=n.children[0],this.template.remove();if(this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),this.options=c,c.virtual!=null)v.observe(this.boundElement),this._update=xn(()=>{this.update(this._array,!0)},jc),this.boundElement.addEventListener("scroll",this._update),this.boundElement.addEventListener("resize",this._update)}visibleSlice(){let{virtual:n,hiddenProp:c,visibleProp:f}=this.options,o=this._array;if(c!==void 0)o=o.filter((E)=>E[c]!==!0);if(f!==void 0)o=o.filter((E)=>E[f]===!0);let X=0,y=o.length-1,x=0,r=0;if(n!=null&&this.boundElement instanceof HTMLElement){let E=this.boundElement.offsetWidth,T=this.boundElement.offsetHeight,W=n.width!=null?Math.max(1,Math.floor(E/n.width)):1,_=Math.ceil(T/n.height)+1,j=Math.ceil(o.length/W),t=W*_,Y=Math.floor(this.boundElement.scrollTop/n.height);if(Y>j-_+1)Y=Math.max(0,j-_+1);X=Y*W,y=X+t-1,x=Y*n.height,r=Math.max(j*n.height-T-x,0)}return{items:o,firstItem:X,lastItem:y,topBuffer:x,bottomBuffer:r}}update(n,c){if(n==null)n=[];this._array=n;let{hiddenProp:f,visibleProp:o}=this.options,X=V(n),y=this.visibleSlice();this.boundElement.classList.toggle("-xin-empty-list",y.items.length===0);let x=this._previousSlice,{firstItem:r,lastItem:E,topBuffer:T,bottomBuffer:W}=y;if(f===void 0&&o===void 0&&c===!0&&x!=null&&r===x.firstItem&&E===x.lastItem)return;this._previousSlice=y;let _=0,j=0,t=0;for(let S of[...this.boundElement.children]){if(S===this.listTop||S===this.listBottom)continue;let D=m.get(S);if(D==null)S.remove();else{let M=y.items.indexOf(D);if(M<r||M>E)S.remove(),this.itemToElement.delete(D),m.delete(S),_++}}this.listTop.style.height=String(T)+"px",this.listBottom.style.height=String(W)+"px";let Y=[],{idPath:kn}=this.options;for(let S=r;S<=E;S++){let D=y.items[S];if(D===void 0)continue;let M=this.itemToElement.get(L(D));if(M==null){if(t++,M=K(this.template),typeof D==="object")this.itemToElement.set(L(D),M),m.set(M,L(D));if(this.boundElement.insertBefore(M,this.listBottom),kn!=null){let Ln=D[kn],Ac=`${X}[${kn}=${Ln}]`;fc(M,Ac)}else{let Ln=`${X}[${S}]`;fc(M,Ln)}}Y.push(M)}let a=null;for(let S of Y){if(S.previousElementSibling!==a)if(j++,a?.nextElementSibling!=null)this.boundElement.insertBefore(S,a.nextElementSibling);else this.boundElement.insertBefore(S,this.listBottom);a=S}if(U.perf)console.log(X,"updated",{removed:_,created:t,moved:j})}}var Xc=(n,c)=>{let f=n[cc];if(f===void 0)f=new oc(n,c),n[cc]=f;return f};var h={value:{toDOM:Yn,fromDOM(n){return nc(n)}},set:{toDOM:Yn},text:{toDOM(n,c){n.textContent=c}},enabled:{toDOM(n,c){n.disabled=!c}},disabled:{toDOM(n,c){n.disabled=Boolean(c)}},style:{toDOM(n,c){if(typeof c==="object")for(let f of Object.keys(c))n.style[f]=c[f];else if(typeof c==="string")n.setAttribute("style",c);else throw new Error("style binding expects either a string or object")}},list:{toDOM(n,c,f){Xc(n,f).update(c)}}};var Kf=180/Math.PI,wf=Math.PI/180;function C(n,c,f){return c<n?n:c>f?f:c}function H(n,c,f){return f=C(0,f,1),f*(c-n)+n}var xc={clamp:C,lerp:H};var Vc=(n,c,f)=>{return(0.299*n+0.587*c+0.114*f)/255},i=(n)=>("00"+Math.round(Number(n)).toString(16)).slice(-2);class yc{h;s;l;constructor(n,c,f){n/=255,c/=255,f/=255;let o=Math.max(n,c,f),X=o-Math.min(n,c,f),y=X!==0?o===n?(c-f)/X:o===c?2+(f-n)/X:4+(n-c)/X:0;this.h=60*y<0?60*y+360:60*y,this.s=X!==0?o<=0.5?X/(2*o-X):X/(2-(2*o-X)):0,this.l=(2*o-X)/2}}var l=globalThis.document!==void 0?globalThis.document.createElement("span"):void 0;class ${r;g;b;a;static fromCss(n){let c=n;if(l instanceof HTMLSpanElement)l.style.color=n,document.body.appendChild(l),c=getComputedStyle(l).color,l.remove();let[f,o,X,y]=c.match(/[\d.]+/g);return new $(Number(f),Number(o),Number(X),y==null?1:Number(y))}static fromHsl(n,c,f,o=1){return $.fromCss(`hsla(${n.toFixed(0)}, ${(c*100).toFixed(0)}%, ${(f*100).toFixed(0)}%, ${o.toFixed(2)})`)}constructor(n,c,f,o=1){this.r=C(0,n,255),this.g=C(0,c,255),this.b=C(0,f,255),this.a=o!==void 0?C(0,o,1):o=1}get inverse(){return new $(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){let{h:n,s:c,l:f}=this._hsl;return $.fromHsl(n,c,1-f,this.a)}get rgb(){let{r:n,g:c,b:f}=this;return`rgb(${n.toFixed(0)},${c.toFixed(0)},${f.toFixed(0)})`}get rgba(){let{r:n,g:c,b:f,a:o}=this;return`rgba(${n.toFixed(0)},${c.toFixed(0)},${f.toFixed(0)},${o.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}hslCached;get _hsl(){if(this.hslCached==null)this.hslCached=new yc(this.r,this.g,this.b);return this.hslCached}get hsl(){let{h:n,s:c,l:f}=this._hsl;return`hsl(${n.toFixed(0)}, ${(c*100).toFixed(0)}%, ${(f*100).toFixed(0)}%)`}get hsla(){let{h:n,s:c,l:f}=this._hsl;return`hsla(${n.toFixed(0)}, ${(c*100).toFixed(0)}%, ${(f*100).toFixed(0)}%, ${this.a.toFixed(2)})`}get mono(){let n=this.brightness*255;return new $(n,n,n)}get brightness(){return Vc(this.r,this.g,this.b)}get html(){return this.toString()}toString(){return this.a===1?"#"+i(this.r)+i(this.g)+i(this.b):"#"+i(this.r)+i(this.g)+i(this.b)+i(Math.floor(255*this.a))}brighten(n){let{h:c,s:f,l:o}=this._hsl,X=C(0,o+n*(1-o),1);return $.fromHsl(c,f,X,this.a)}darken(n){let{h:c,s:f,l:o}=this._hsl,X=C(0,o*(1-n),1);return $.fromHsl(c,f,X,this.a)}saturate(n){let{h:c,s:f,l:o}=this._hsl,X=C(0,f+n*(1-f),1);return $.fromHsl(c,X,o,this.a)}desaturate(n){let{h:c,s:f,l:o}=this._hsl,X=C(0,f*(1-n),1);return $.fromHsl(c,X,o,this.a)}rotate(n){let{h:c,s:f,l:o}=this._hsl,X=(c+360+n)%360;return $.fromHsl(X,f,o,this.a)}opacity(n){let{h:c,s:f,l:o}=this._hsl;return $.fromHsl(c,f,o,n)}swatch(){let{r:n,g:c,b:f,a:o}=this;return console.log(`%c      %c ${this.html}, rgba(${n}, ${c}, ${f}, ${o}), ${this.hsla}`,`background-color: rgba(${n}, ${c}, ${f}, ${o})`,"background-color: transparent"),this}blend(n,c){return new $(H(this.r,n.r,c),H(this.g,n.g,c),H(this.b,n.b,c),H(this.a,n.a,c))}mix(n,c){let f=this._hsl,o=n._hsl;return $.fromHsl(H(f.h,o.h,c),H(f.s,o.s,c),H(f.l,o.l,c),H(this.a,n.a,c))}}function z(n){return n.replace(/[A-Z]/g,(c)=>{return`-${c.toLocaleLowerCase()}`})}function rc(n){return n.replace(/-([a-z])/g,(c,f)=>{return f.toLocaleUpperCase()})}var Ic="http://www.w3.org/1998/Math/MathML",Pc="http://www.w3.org/2000/svg",yn={},Bn=(n,...c)=>{if(yn[n]===void 0){let[X,y]=n.split("|");if(y===void 0)yn[n]=globalThis.document.createElement(X);else yn[n]=globalThis.document.createElementNS(y,X)}let f=yn[n].cloneNode(),o={};for(let X of c)if(X instanceof Element||X instanceof DocumentFragment||typeof X==="string"||typeof X==="number")if(f instanceof HTMLTemplateElement)f.content.append(X);else f.append(X);else Object.assign(o,X);for(let X of Object.keys(o)){let y=o[X];if(X==="apply")y(f);else if(X==="style")if(typeof y==="object")for(let x of Object.keys(y)){let r=wn(z(x),y[x]);if(r.prop.startsWith("--"))f.style.setProperty(r.prop,r.value);else f.style[x]=r.value}else f.setAttribute("style",y);else if(X.match(/^on[A-Z]/)!=null){let x=X.substring(2).toLowerCase();on(f,x,y)}else if(X==="bind")if((typeof y.binding==="string"?h[y.binding]:y.binding)!==void 0&&y.value!==void 0)d(f,y.value,y.binding instanceof Function?{toDOM:y.binding}:y.binding);else throw new Error("bad binding");else if(X.match(/^bind[A-Z]/)!=null){let x=X.substring(4,5).toLowerCase()+X.substring(5),r=h[x];if(r!==void 0)d(f,y,r);else throw new Error(`${X} is not allowed, bindings.${x} is not defined`)}else if(f[X]!==void 0){let{MathMLElement:x}=globalThis;if(f instanceof SVGElement||x!==void 0&&f instanceof x)f.setAttribute(X,y);else f[X]=y}else{let x=z(X);if(x==="class")y.split(" ").forEach((r)=>{f.classList.add(r)});else if(f[x]!==void 0)f[x]=y;else if(typeof y==="boolean")y?f.setAttribute(x,""):f.removeAttribute(x);else f.setAttribute(x,y)}}return f},Kn=(...n)=>{let c=globalThis.document.createDocumentFragment();for(let f of n)c.append(f);return c},k=new Proxy({fragment:Kn},{get(n,c){if(c=c.replace(/[A-Z]/g,(f)=>`-${f.toLocaleLowerCase()}`),n[c]===void 0)n[c]=(...f)=>Bn(c,...f);return n[c]},set(){throw new Error("You may not add new properties to elements")}}),rn=new Proxy({fragment:Kn},{get(n,c){if(n[c]===void 0)n[c]=(...f)=>Bn(`${c}|${Pc}`,...f);return n[c]},set(){throw new Error("You may not add new properties to elements")}}),En=new Proxy({fragment:Kn},{get(n,c){if(n[c]===void 0)n[c]=(...f)=>Bn(`${c}|${Ic}`,...f);return n[c]},set(){throw new Error("You may not add new properties to elements")}});function Ec(n,c){let f=k.style(s(c));f.id=n,document.head.append(f)}var uc=["animation-iteration-count","flex","flex-base","flex-grow","flex-shrink","opacity","order","tab-size","widows","z-index","zoom"],wn=(n,c)=>{if(typeof c==="number"&&!uc.includes(n))c=`${c}px`;if(n.startsWith("_"))if(n.startsWith("__"))n="--"+n.substring(2),c=`var(${n}-default, ${c})`;else n="--"+n.substring(1);return{prop:n,value:String(c)}},mc=(n,c,f)=>{if(f===void 0)return"";if(f instanceof $)f=f.html;let o=wn(c,f);return`${n}  ${o.prop}: ${o.value};`},$c=(n,c,f="")=>{let o=z(n);if(typeof c==="object"&&!(c instanceof $)){let X=Object.keys(c).map((y)=>$c(y,c[y],`${f}  `)).join(`
`);return`${f}  ${n} {
${X}
${f}  }`}else return mc(f,o,c)},s=(n,c="")=>{return Object.keys(n).map((o)=>{let X=n[o];if(typeof X==="string"){if(o==="@import")return`@import url('${X}');`;throw new Error("top-level string value only allowed for `@import`")}let y=Object.keys(X).map((x)=>$c(x,X[x])).join(`
`);return`${c}${o} {
${y}
}`}).join(`

`)},Tc=(n)=>{console.warn("initVars is deprecated. Just use _ and __ prefixes instead.");let c={};for(let f of Object.keys(n)){let o=n[f],X=z(f);c[`--${X}`]=typeof o==="number"&&o!==0?String(o)+"px":o}return c},Fc=(n)=>{console.warn("darkMode is deprecated. Use inverseLuminance instead.");let c={};for(let f of Object.keys(n)){let o=n[f];if(typeof o==="string"&&o.match(/^(#|rgb[a]?\(|hsl[a]?\()/)!=null)o=$.fromCss(o).inverseLuminance.html,c[`--${z(f)}`]=o}return c},Sc=(n)=>{let c={};for(let f of Object.keys(n)){let o=n[f];if(o instanceof $)c[f]=o.inverseLuminance;else if(typeof o==="string"&&o.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/))c[f]=$.fromCss(o).inverseLuminance}return c},$n=new Proxy({},{get(n,c){if(n[c]==null){c=c.replace(/[A-Z]/g,(r)=>`-${r.toLocaleLowerCase()}`);let[,f,,o,X,y]=c.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/),x=`--${f}`;if(X!=null){let r=o==null?Number(X)/100:-Number(X)/100;switch(y){case"b":{let E=getComputedStyle(document.body).getPropertyValue(x);n[c]=r>0?$.fromCss(E).brighten(r).rgba:$.fromCss(E).darken(-r).rgba}break;case"s":{let E=getComputedStyle(document.body).getPropertyValue(x);n[c]=r>0?$.fromCss(E).saturate(r).rgba:$.fromCss(E).desaturate(-r).rgba}break;case"h":{let E=getComputedStyle(document.body).getPropertyValue(x);n[c]=$.fromCss(E).rotate(r*100).rgba,console.log($.fromCss(E).hsla,$.fromCss(E).rotate(r).hsla)}break;case"o":{let E=getComputedStyle(document.body).getPropertyValue(x);n[c]=$.fromCss(E).opacity(r).rgba}break;case"":n[c]=`calc(var(${x}) * ${r})`;break;default:throw console.error(y),new Error(`Unrecognized method ${y} for css variable ${x}`)}}else n[c]=`var(${x})`}return n[c]}}),Tn=new Proxy({},{get(n,c){if(n[c]===void 0){let f=`--${c.replace(/[A-Z]/g,(o)=>`-${o.toLocaleLowerCase()}`)}`;n[c]=(o)=>`var(${f}, ${o})`}return n[c]}});var Nc=0;function Rn(){return`custom-elt${(Nc++).toString(36)}`}var kc=0,e={};function pc(n,c){let f=e[n],o=s(c).replace(/:host\b/g,n);e[n]=f?f+`
`+o:o}function bc(n){if(e[n])document.head.append(k.style({id:n+"-component"},e[n]));delete e[n]}class G extends HTMLElement{static elements=k;static _elementCreator;instanceId;styleNode;static styleSpec;static styleNode;content=k.slot();isSlotted;static _tagName=null;static get tagName(){return this._tagName}static StyleNode(n){return console.warn("StyleNode is deprecated, just assign static styleSpec: XinStyleSheet to the class directly"),k.style(s(n))}static elementCreator(n={}){if(this._elementCreator==null){let{tag:c,styleSpec:f}=n,o=n!=null?c:null;if(o==null)if(typeof this.name==="string"&&this.name!==""){if(o=z(this.name),o.startsWith("-"))o=o.slice(1)}else o=Rn();if(customElements.get(o)!=null)console.warn(`${o} is already defined`);if(o.match(/\w+(-\w+)+/)==null)console.warn(`${o} is not a legal tag for a custom-element`),o=Rn();while(customElements.get(o)!==void 0)o=Rn();if(this._tagName=o,f!==void 0)pc(o,f);window.customElements.define(o,this,n),this._elementCreator=k[o]}return this._elementCreator}initAttributes(...n){let c={},f={};new MutationObserver((X)=>{let y=!1;if(X.forEach((x)=>{y=!!(x.attributeName&&n.includes(rc(x.attributeName)))}),y&&this.queueRender!==void 0)this.queueRender(!1)}).observe(this,{attributes:!0}),n.forEach((X)=>{c[X]=O(this[X]);let y=z(X);Object.defineProperty(this,X,{enumerable:!1,get(){if(typeof c[X]==="boolean")return this.hasAttribute(y);else if(this.hasAttribute(y))return typeof c[X]==="number"?parseFloat(this.getAttribute(y)):this.getAttribute(y);else if(f[X]!==void 0)return f[X];else return c[X]},set(x){if(typeof c[X]==="boolean"){if(x!==this[X]){if(x)this.setAttribute(y,"");else this.removeAttribute(y);this.queueRender()}}else if(typeof c[X]==="number"){if(x!==parseFloat(this[X]))this.setAttribute(y,x),this.queueRender()}else if(typeof x==="object"||`${x}`!==`${this[X]}`){if(x===null||x===void 0||typeof x==="object")this.removeAttribute(y);else this.setAttribute(y,x);this.queueRender(),f[X]=x}}})})}initValue(){let n=Object.getOwnPropertyDescriptor(this,"value");if(n===void 0||n.get!==void 0||n.set!==void 0)return;let c=this.hasAttribute("value")?this.getAttribute("value"):O(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get(){return c},set(f){if(c!==f)c=f,this.queueRender(!0)}})}_parts;get parts(){let n=this.shadowRoot!=null?this.shadowRoot:this;if(this._parts==null)this._parts=new Proxy({},{get(c,f){if(c[f]===void 0){let o=n.querySelector(`[part="${f}"]`);if(o==null)o=n.querySelector(f);if(o==null)throw new Error(`elementRef "${f}" does not exist!`);o.removeAttribute("data-ref"),c[f]=o}return c[f]}});return this._parts}constructor(){super();kc+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${kc}`,this._value=O(this.defaultValue)}connectedCallback(){if(bc(this.constructor.tagName),this.hydrate(),this.role!=null)this.setAttribute("role",this.role);if(this.onResize!==void 0){if(v.observe(this),this._onResize==null)this._onResize=this.onResize.bind(this);this.addEventListener("resize",this._onResize)}if(this.value!=null&&this.getAttribute("value")!=null)this._value=this.getAttribute("value");this.queueRender()}disconnectedCallback(){v.unobserve(this)}_changeQueued=!1;_renderQueued=!1;queueRender(n=!1){if(!this._hydrated)return;if(!this._changeQueued)this._changeQueued=n;if(!this._renderQueued)this._renderQueued=!0,requestAnimationFrame(()=>{if(this._changeQueued)Qn(this,"change");this._changeQueued=!1,this._renderQueued=!1,this.render()})}_hydrated=!1;hydrate(){if(!this._hydrated){this.initValue();let n=typeof this.content!=="function",c=typeof this.content==="function"?this.content():this.content,{styleSpec:f}=this.constructor,{styleNode:o}=this.constructor;if(f)o=this.constructor.styleNode=k.style(s(f)),delete this.constructor.styleNode;if(this.styleNode)console.warn(this,"styleNode is deprecrated, use static styleNode or statc styleSpec instead"),o=this.styleNode;if(o){let X=this.attachShadow({mode:"open"});X.appendChild(o.cloneNode(!0)),qn(X,c,n)}else if(c!==null){let X=[...this.childNodes];qn(this,c,n),this.isSlotted=this.querySelector("slot,xin-slot")!==void 0;let y=[...this.querySelectorAll("slot")];if(y.length>0)y.forEach(sn.replaceSlot);if(X.length>0){let x={"":this};[...this.querySelectorAll("xin-slot")].forEach((r)=>{x[r.name]=r}),X.forEach((r)=>{let E=x[""],T=r instanceof Element?x[r.slot]:E;(T!==void 0?T:E).append(r)})}}this._hydrated=!0}}render(){}}class sn extends G{name="";content=null;static replaceSlot(n){let c=document.createElement("xin-slot");if(n.name!=="")c.setAttribute("name",n.name);n.replaceWith(c)}constructor(){super();this.initAttributes("name")}}var af=sn.elementCreator({tag:"xin-slot"});var Lc=(n=()=>!0)=>{let c=localStorage.getItem("xin-state");if(c!=null){let o=JSON.parse(c);for(let X of Object.keys(o).filter(n))if(F[X]!==void 0)Object.assign(F[X],o[X]);else F[X]=o[X]}let f=Xn(()=>{let o={},X=L(F);for(let y of Object.keys(X).filter(n))o[y]=X[y];localStorage.setItem("xin-state",JSON.stringify(o)),console.log("xin state saved to localStorage")},500);u(n,f)};function _n(n){return Object.assign(b,n),b}var Mc=!1;function Fn(n,c=!1){if(c){if(!Mc)console.warn("xinProxy(..., true) is deprecated; use boxedProxy(...) instead"),Mc=!0;return _n(n)}return Object.keys(n).forEach((f)=>{F[f]=n[f]}),F}var gc={};function Sn(n,c){let{type:f,styleSpec:o}=c(n,{Color:$,Component:G,elements:k,svgElements:rn,mathML:En,varDefault:Tn,vars:$n,xinProxy:Fn}),X={type:f,creator:f.elementCreator({tag:n,styleSpec:o})};return gc[n]=X,X}class Blueprint extends G{tag="anon-elt";src="";property="default";loaded;async packaged(){if(!this.loaded){let{tag,src}=this,imported=await eval(`import('${src}')`),blueprint=imported[this.property];this.loaded=Sn(tag,blueprint)}return this.loaded}constructor(){super();this.initAttributes("tag","src","property")}}var dc=Blueprint.elementCreator({tag:"xin-blueprint",styleSpec:{":host":{display:"none"}}});class jn extends G{constructor(){super()}async load(){let c=[...this.querySelectorAll(Blueprint.tagName)].filter((f)=>f.src).map((f)=>f.packaged());await Promise.all(c)}connectedCallback(){super.connectedCallback(),this.load()}}var vc=jn.elementCreator({tag:"xin-loader",styleSpec:{":host":{display:"none"}}});})();

//# debugId=FBD5571CC462083564756E2164756E21
//# sourceMappingURL=index.iife.js.map
