!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("fastest-validator"),require("react")):"function"==typeof define&&define.amd?define(["fastest-validator","react"],t):"object"==typeof exports?exports["@jms-1/react-validated-model"]=t(require("fastest-validator"),require("react")):e["@jms-1/react-validated-model"]=t(e["fastest-validator"],e.React)}(self,((e,t)=>(()=>{"use strict";var r=[,t=>{t.exports=e},e=>{e.exports=t}],o={};function s(e){var t=o[e];if(void 0!==t)return t.exports;var a=o[e]={exports:{}};return r[e](a,a.exports,s),a.exports}s.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return s.d(t,{a:t}),t},s.d=(e,t)=>{for(var r in t)s.o(t,r)&&!s.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var a={};return(()=>{s.r(a),s.d(a,{useModel:()=>n});var e=s(1),t=s.n(e),r=s(2);let o=0;function n(e,s={}){const[a,n]=r.useState(++o),[i,u]=r.useState(++o),l=r.useMemo((()=>JSON.stringify(e||{})),[e]),f=r.useMemo((()=>(new(t())).compile(s)),[s]),c=r.useMemo((()=>JSON.parse(l)),[l,e,a]),d=r.useCallback((()=>n(++o)),[]),p=r.useCallback((()=>u(++o)),[]),y=r.useCallback((e=>{const t={};return new Proxy(e,{get(e,r){if(t.hasOwnProperty(r))return t[r];const o=e[r];if(null==o)return o;switch(typeof o){case"object":return t[r]=y(o);case"function":return(...t)=>{const r=JSON.stringify(e),s=o.call(e,...t);return JSON.stringify(e)!==r&&p(),s};default:return o}},set:(e,r,o)=>(e[r]!==o&&(delete t[r],e[r]=void 0===o?o:JSON.parse(JSON.stringify(o)),p()),!0)})}),[p]),b=r.useMemo((()=>y(c)),[c,y,i]),m=r.useCallback((()=>f(c)),[c,f,i]),v=r.useCallback((e=>{const t=m();if(!0===t)return[];if(!e)return t;const r=`${e}.`,o=`${e}[`;return t.filter((t=>t.field&&(t.field===e||t.field.startsWith(r)||t.field.startsWith(o))))}),[m]),S=r.useCallback((()=>!(JSON.stringify(c)===l)),[c,l,i]);return[b,r.useMemo((()=>({findErrors:v,isDirty:S,reset:d})),[d,v,S])]}})(),a})()));
//# sourceMappingURL=index.js.map