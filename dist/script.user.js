// ==UserScript==
// @name         WPlace AutoBOT
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  blank
// @author       10590
// @match        https://wplace.live/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(()=>{var Oo=Object.create;var At=Object.defineProperty;var Fo=Object.getOwnPropertyDescriptor;var No=Object.getOwnPropertyNames;var Ro=Object.getPrototypeOf,Uo=Object.prototype.hasOwnProperty;var qo=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,n)=>(typeof require<"u"?require:t)[n]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var _o=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of No(t))!Uo.call(e,i)&&i!==n&&At(e,i,{get:()=>t[i],enumerable:!(o=Fo(t,i))||o.enumerable});return e};var Wo=(e,t,n)=>(n=e!=null?Oo(Ro(e)):{},_o(t||!e||!e.__esModule?At(n,"default",{value:e,enumerable:!0}):n,e));var at=(e,t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")=>{let n=()=>{if(typeof crypto<"u"&&crypto.getRandomValues){let o=new Uint32Array(1);return crypto.getRandomValues(o),o[0]%t.length}return Math.floor(Math.random()*t.length)};return[...Array(e)].map(()=>t[n()]).join("")},V=e=>new Promise(t=>setTimeout(t,e));function Dt(e,t){let n=null,o=function(...i){n&&clearTimeout(n),n=setTimeout(()=>e.apply(this,i),t)};return o.flush=function(...i){n&&(clearTimeout(n),n=null,e.apply(this,i))},o}var Lt=async function(e){let t=Math.max(0,await e());for(;t>0;){let n=t>5e3?2e3:t>1e3?500:100;await this.sleep(Math.min(n,t)),t=Math.max(0,await e())}},$e=(e,t={})=>{if(Array.from(document.head.querySelectorAll("link")).some(i=>i.href===e))return;let o=document.createElement("link");o.rel="stylesheet",o.href=e;for(let[i,s]of Object.entries(t))o.setAttribute(i,s);document.head.appendChild(o)},Ee=async(e,t=200,n=5e3)=>{let o=Date.now();for(;Date.now()-o<n;){let i=document.querySelector(e);if(i)return i;await V(t)}return null},qe=e=>{let t=Math.ceil(e/1e3),n=Math.floor(t/3600),o=Math.floor(t%3600/60),i=t%60;return n>0?`${n}h ${o}m ${i}s`:o>0?`${o}m ${i}s`:`${i}s`},it=(e,t,n,o,i,s,l=1e3)=>{let m=n+i,f=o+s;return{startTileX:e+Math.floor(n/l),startTileY:t+Math.floor(o/l),endTileX:e+Math.floor((m-1)/l),endTileY:t+Math.floor((f-1)/l)}};function st(e){return Object.getOwnPropertyNames(e).forEach(t=>{e[t]!==null&&(typeof e[t]=="object"||typeof e[t]=="function")&&!Object.isFrozen(e[t])&&st(e[t])}),Object.freeze(e)}var D=st({minimized:!1,cooldownChargeThreshold:30,tokenSource:"generator",overlayOpacity:.2,blueMarbleEnabled:!1,batchMode:"random",randomBatchMin:30,randomBatchMax:60,paintingSpeed:20,paintingSpeedLimitEnabled:!0,paintWhitePixels:!0,paintTransparentPixels:!1,paintUnavailablePixels:!1,coordinateMode:"rows",coordinateDirection:"top-left",coordinateSnake:!0,blockWidth:6,blockHeight:2,notificationsEnabled:!1,notifyOnChargesReached:!0,notifyOnlyWhenUnfocused:!0,notificationIntervalMinutes:5,resizeSettings:null,originalImage:null,ditheringEnabled:!0,colorMatchingAlgorithm:"lab",enableChromaPenalty:!0,chromaPenaltyWeight:.15,customTransparencyThreshold:100,customWhiteThreshold:250,themeKey:"classic",languageKey:"en"});var a={...D,running:!1,processing:!1,artTotalPixels:0,totalPaintedPixels:0,userPaintedPixels:0,availableColors:[],activeColorPalette:[],fullChargeData:null,fullChargeInterval:null,displayCharges:0,preciseCurrentCharges:0,maxCharges:1,cooldown:31e3,imageData:null,stopFlag:!1,startPosition:null,selectingPosition:!1,region:null,estimatedTime:0,chargesThresholdInterval:null,initialSetupComplete:!1,resizeIgnoreMask:null,_lastChargesNotifyAt:0,_lastChargesBelow:!0,_lastSavePixelCount:0,_lastSaveTime:0,_saveInProgress:!1,paintedMap:null,get hasAvailableColors(){return!!this.availableColors.length},get imageLoaded(){return!!this.imageData}};var Ot=["en","es-MX","fr","id","ja","ko","pt","ru","tr","uk","vi","zh-CN","zh-TW"];var H={LANGUAGES:Ot,PAINTING_SPEED:{MIN:1,MAX:1e3},THEMES:{classic:{name:"Classic",cssClass:"wplace-theme-classic"},"classic-light":{name:"Classic Light",cssClass:"wplace-theme-classic-light"},"neon-retro":{name:"Neon Retro",cssClass:"wplace-theme-neon"}},COLOR_MAP:{0:{id:0,name:"Transparent",rgb:{r:222,g:250,b:206}},1:{id:1,name:"Black",rgb:{r:0,g:0,b:0}},2:{id:2,name:"Dark Gray",rgb:{r:60,g:60,b:60}},3:{id:3,name:"Gray",rgb:{r:120,g:120,b:120}},4:{id:4,name:"Light Gray",rgb:{r:210,g:210,b:210}},5:{id:5,name:"White",rgb:{r:255,g:255,b:255}},6:{id:6,name:"Deep Red",rgb:{r:96,g:0,b:24}},7:{id:7,name:"Red",rgb:{r:237,g:28,b:36}},8:{id:8,name:"Orange",rgb:{r:255,g:127,b:39}},9:{id:9,name:"Gold",rgb:{r:246,g:170,b:9}},10:{id:10,name:"Yellow",rgb:{r:249,g:221,b:59}},11:{id:11,name:"Light Yellow",rgb:{r:255,g:250,b:188}},12:{id:12,name:"Dark Green",rgb:{r:14,g:185,b:104}},13:{id:13,name:"Green",rgb:{r:19,g:230,b:123}},14:{id:14,name:"Light Green",rgb:{r:135,g:255,b:94}},15:{id:15,name:"Dark Teal",rgb:{r:12,g:129,b:110}},16:{id:16,name:"Teal",rgb:{r:16,g:174,b:166}},17:{id:17,name:"Light Teal",rgb:{r:19,g:225,b:190}},18:{id:18,name:"Dark Blue",rgb:{r:40,g:80,b:158}},19:{id:19,name:"Blue",rgb:{r:64,g:147,b:228}},20:{id:20,name:"Cyan",rgb:{r:96,g:247,b:242}},21:{id:21,name:"Indigo",rgb:{r:107,g:80,b:246}},22:{id:22,name:"Light Indigo",rgb:{r:153,g:177,b:251}},23:{id:23,name:"Dark Purple",rgb:{r:120,g:12,b:153}},24:{id:24,name:"Purple",rgb:{r:170,g:56,b:185}},25:{id:25,name:"Light Purple",rgb:{r:224,g:159,b:249}},26:{id:26,name:"Dark Pink",rgb:{r:203,g:0,b:122}},27:{id:27,name:"Pink",rgb:{r:236,g:31,b:128}},28:{id:28,name:"Light Pink",rgb:{r:243,g:141,b:169}},29:{id:29,name:"Dark Brown",rgb:{r:104,g:70,b:52}},30:{id:30,name:"Brown",rgb:{r:149,g:104,b:42}},31:{id:31,name:"Beige",rgb:{r:248,g:178,b:119}},32:{id:32,name:"Medium Gray",rgb:{r:170,g:170,b:170}},33:{id:33,name:"Dark Red",rgb:{r:165,g:14,b:30}},34:{id:34,name:"Light Red",rgb:{r:250,g:128,b:114}},35:{id:35,name:"Dark Orange",rgb:{r:228,g:92,b:26}},36:{id:36,name:"Light Tan",rgb:{r:214,g:181,b:148}},37:{id:37,name:"Dark Goldenrod",rgb:{r:156,g:132,b:49}},38:{id:38,name:"Goldenrod",rgb:{r:197,g:173,b:49}},39:{id:39,name:"Light Goldenrod",rgb:{r:232,g:212,b:95}},40:{id:40,name:"Dark Olive",rgb:{r:74,g:107,b:58}},41:{id:41,name:"Olive",rgb:{r:90,g:148,b:74}},42:{id:42,name:"Light Olive",rgb:{r:132,g:197,b:115}},43:{id:43,name:"Dark Cyan",rgb:{r:15,g:121,b:159}},44:{id:44,name:"Light Cyan",rgb:{r:187,g:250,b:242}},45:{id:45,name:"Light Blue",rgb:{r:125,g:199,b:255}},46:{id:46,name:"Dark Indigo",rgb:{r:77,g:49,b:184}},47:{id:47,name:"Dark Slate Blue",rgb:{r:74,g:66,b:132}},48:{id:48,name:"Slate Blue",rgb:{r:122,g:113,b:196}},49:{id:49,name:"Light Slate Blue",rgb:{r:181,g:174,b:241}},50:{id:50,name:"Light Brown",rgb:{r:219,g:164,b:99}},51:{id:51,name:"Dark Beige",rgb:{r:209,g:128,b:81}},52:{id:52,name:"Light Beige",rgb:{r:255,g:197,b:165}},53:{id:53,name:"Dark Peach",rgb:{r:155,g:82,b:73}},54:{id:54,name:"Peach",rgb:{r:209,g:128,b:120}},55:{id:55,name:"Light Peach",rgb:{r:250,g:182,b:164}},56:{id:56,name:"Dark Tan",rgb:{r:123,g:99,b:82}},57:{id:57,name:"Tan",rgb:{r:156,g:132,b:107}},58:{id:58,name:"Dark Slate",rgb:{r:51,g:57,b:65}},59:{id:59,name:"Slate",rgb:{r:109,g:117,b:141}},60:{id:60,name:"Light Slate",rgb:{r:179,g:185,b:209}},61:{id:61,name:"Dark Stone",rgb:{r:109,g:100,b:63}},62:{id:62,name:"Stone",rgb:{r:148,g:140,b:107}},63:{id:63,name:"Light Stone",rgb:{r:205,g:197,b:158}}}};var Ho=(e={})=>{let{maxLength:t=100,shouldLog:n=!1,label:o="LocalStorage"}=e;return(i,s)=>{let l;try{l=JSON.stringify(s)}catch(m){return console.groupCollapsed(`\u26A0\uFE0F ${o}: Could not serialize value`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",i),console.log("%cValue (failed to serialize):","font-weight: bold; color: #d6333f;",s),console.log("%cError:","color: #999;",m),console.groupEnd(),!1}try{if(localStorage.setItem(i,l),n){let m=l.length>t?l.slice(0,t)+"...":l;console.groupCollapsed(`\u{1F4BE} ${o}: Saved to localStorage`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",i),console.log("%cValue:","font-weight: bold; color: #50c878;",m),l.length>t&&console.log("%cFull serialized value:","color: #999;",l),console.groupEnd()}}catch(m){return console.groupCollapsed(`\u274C ${o}: Could not save to localStorage`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",i),console.log("%cValue (failed to save):","font-weight: bold; color: #d6333f;",s),console.log("%cSerialized (partial):","color: #999;",l),console.log("%cError:","color: #999;",m),console.groupEnd(),!1}return!0}},Vo=(e={})=>{let{shouldLog:t=!1,label:n="Storage"}=e;return(o,i=null)=>{let s=localStorage.getItem(o);if(s===null)return t&&(console.groupCollapsed(`\u{1F50D} ${n}: Key not found`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",o),console.log("%cUsing default:","color: #999;",i),console.groupEnd()),i;let l=s,m=!1;try{l=JSON.parse(s),m=!0}catch(f){if(typeof s=="string"){if(s.length>100||/[\x00-\x1F\x7F-\x9F]/.test(s)||/[\uFFFD]/.test(s)||s.trim()==="")return t&&(console.groupCollapsed(`\u274C ${n}: Invalid or corrupted data`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",o),console.log("%cRaw value:","color: #d6333f;",s),console.log("%cError:","color: #999;",f),console.log("%cUsing default:","color: #666;",i),console.groupEnd()),i;t&&(console.groupCollapsed(`\u{1F7E1} ${n}: Raw string (not JSON)`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",o),console.log("%cValue:","color: #50c878;",s),console.groupEnd())}}return m&&t&&(console.groupCollapsed(`\u2705 ${n}: Loaded (JSON)`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",o),console.log("%cValue:","font-weight: bold; color: #50c878;",l),console.groupEnd()),l}},ze=Ho({maxLength:80}),Ae=Vo();function U(){try{let e={};for(let t of Object.keys(D))e[t]=a[t];a.resizeIgnoreMask&&a.resizeSettings&&a.resizeSettings.width*a.resizeSettings.height===a.resizeIgnoreMask.length?e.resizeIgnoreMask={w:a.resizeSettings.width,h:a.resizeSettings.height,data:btoa(String.fromCharCode(...a.resizeIgnoreMask))}:e.resizeIgnoreMask=null,ze("wplace-bot-settings",e)}catch(e){console.warn("Could not save bot settings:",e)}}function Ft(){return!Ae("wplace-bot-settings")}function Nt(){try{let t=function(n,o){if(!n?.data)return console.debug("[Settings] parseResizeIgnoreMask: no mask.data"),null;if(!o)return console.debug("[Settings] parseResizeIgnoreMask: no state.resizeSettings"),null;if(n.w!==o.width||n.h!==o.height)return console.warn(`[Settings] parseResizeIgnoreMask: dimensions mismatch: ${n.w}x${n.h} != ${o.width}x${o.height}`),null;let i=n.w*n.h,s;try{s=atob(n.data)}catch(m){return console.warn("[Settings] parseResizeIgnoreMask: failed to decode base64",m),null}if(s.length!==i)return console.warn(`[Settings] parseResizeIgnoreMask: size mismatch: got ${s.length}, expected ${i}`),null;let l=new Uint8Array(i);for(let m=0;m<i;m++){let f=s.charCodeAt(m);if(f<0||f>255)return console.warn(`[Settings] parseResizeIgnoreMask: invalid byte at index ${m}: ${f}`),null;l[m]=f}return l},e=Ae("wplace-bot-settings");if(!e)return;Object.assign(a,D,e),a.resizeIgnoreMask=t(e.resizeIgnoreMask,a.resizeSettings)??null}catch(e){console.warn("Could not load bot settings:",e)}}var rt={en:{title:"Auto-Image",toggleOverlay:"Toggle Overlay",scanColors:"Scan Colors",uploadImage:"Upload Image",resizeImage:"Resize Image",selectPosition:"Select Position",startPainting:"Start Painting",stopPainting:"Stop Painting",progress:"Progress",pixels:"Pixels",charges:"Charges",initMessage:"Click 'Upload Image' to begin"}};var we={},Me=async(e,t=0)=>{if(we[e])return we[e];let n=`https://skalsech.github.io/WPlace-AutoBOT/custom-main/dist/i18n/${e}.json`.trim(),o=3,i=1e3;try{console.log(t===0?`\u{1F504} Loading ${e} translations from CDN...`:`\u{1F504} Retrying ${e} translations (attempt ${t+1}/${o+1})...`);let s=await fetch(n);if(s.ok){let l=await s.json();if(typeof l=="object"&&l!==null&&Object.keys(l).length>0)return we[e]=l,console.log(`\u{1F4DA} Loaded ${e} translations successfully from CDN (${Object.keys(l).length} keys)`),l;throw console.warn(`\u274C Invalid translation format for ${e}`),new Error("Invalid translation format")}else throw console.warn(`\u274C CDN returned HTTP ${s.status}: ${s.statusText} for ${e} translations`),new Error(`HTTP ${s.status}: ${s.statusText}`)}catch(s){if(console.error(`\u274C Failed to load ${e} translations from CDN (attempt ${t+1}):`,s),t<o){let l=i*Math.pow(2,t);return console.log(`\u23F3 Retrying in ${l}ms...`),await V(l),Me(e,t+1)}}return null},Go=()=>{let e=navigator.language,t=e.split("-")[0];return H.LANGUAGES.includes(e)?e:H.LANGUAGES.includes(t)?t:"en"},Xo=e=>{try{let t=document.createElement("div");t.style.cssText=`
        position: fixed; top: 10px; right: 10px; z-index: 10001;
        background: rgba(255, 193, 7, 0.95); color: #212529; padding: 12px 16px;
        border-radius: 8px; font-size: 14px; font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid rgba(255, 193, 7, 0.8);
        max-width: 300px; word-wrap: break-word;
      `,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.parentNode&&t.remove()},8e3)}catch(t){console.warn("Failed to show translation warning UI:",t)}},Rt=async()=>{if(we.en||await Me("en")||(console.warn("\u26A0\uFE0F Failed to load English translations from CDN, using fallback"),Xo("\u26A0\uFE0F Translation loading failed, using basic fallbacks")),Ft()){let e=Go();we[e]||(await Me(e),a.languageKey=e)}else await Me(a.languageKey),lt();console.log(`\u2705 Translation system initialized. Active language: ${a.languageKey}`)};function g(e,t={}){let n=we[a.languageKey]?.[e];return(!n||n===e)&&a.languageKey!=="en"&&(n=we.en?.[e]),n||(n=rt[a.languageKey]?.[e]||rt.en?.[e]||e,n===e&&console.warn(`\u26A0\uFE0F Missing translation for key: ${e} (language: ${a.languageKey})`)),Object.keys(t).forEach(o=>{let i=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");n=n.replace(new RegExp(`\\{${i(o)}\\}`,"g"),t[o])}),n}function lt(){document.querySelectorAll("[data-i18n-key]").forEach(e=>{let t=e.dataset.i18nKey,n=e.dataset.i18nParams?JSON.parse(e.dataset.i18nParams):{},o=g(t,n);e.dataset.i18nAttr==="title"?e.title=o:e.dataset.i18nAttr==="placeholder"?e.placeholder=o:e.innerText=o})}function Ut(){let e=document.createElement("div");return e.id="wplace-settings-container",e.className="wplace-settings-container-base",e.innerHTML=`
      <div class="wplace-settings-header">
        <div class="wplace-settings-title-wrapper">
          <h3 class="wplace-settings-title">
            <i class="fas fa-cog wplace-settings-icon"></i>
          <span data-i18n-key="settings">${g("settings")}</span>
          </h3>
        <button id="closeSettingsBtn" class="wplace-settings-close-btn" title="${g("close")}" data-i18n-key="close" data-i18n-attr="title">\u2715</button>
        </div>
      </div>

      <div class="wplace-settings-content">
        
        <!-- Token Source Selection -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-key wplace-icon-key"></i>
          <span data-i18n-key="tokenSource">Token Source</span>
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="tokenSourceSelect" class="wplace-settings-select">
            <option value="generator" ${D.tokenSource==="generator"?"selected":""} data-i18n-key="tokenSourceGenerator" class="wplace-settings-option">\u{1F916} Automatic Token Generator (Recommended)</option>
            <option value="hybrid" ${D.tokenSource==="hybrid"?"selected":""} data-i18n-key="tokenSourceHybrid" class="wplace-settings-option">\u{1F504} Generator + Auto Fallback</option>
            <option value="manual" ${D.tokenSource==="manual"?"selected":""} data-i18n-key="tokenSourceManual" class="wplace-settings-option">\u{1F3AF} Manual Pixel Placement</option>
            </select>
          <p class="wplace-settings-description" data-i18n-key="tokenSourceDescription">
              Generator mode creates tokens automatically. Hybrid mode falls back to manual when generator fails. Manual mode only uses pixel placement.
            </p>
          </div>
        </div>

        <!-- Automation Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-robot wplace-icon-robot"></i>
          <span data-i18n-key="automation">${g("automation")}</span>
          </label>
          <!-- Token generator is always enabled - settings moved to Token Source above -->
        </div>

        <!-- Overlay Settings Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-eye wplace-icon-eye"></i>
          <span data-i18n-key="overlaySettings">Overlay Settings</span>
          </label>
          <div class="wplace-settings-section-wrapper wplace-overlay-wrapper">
              <!-- Opacity Slider -->
              <div class="wplace-overlay-opacity-control">
                <div class="wplace-overlay-opacity-header">
                 <span class="wplace-overlay-opacity-label" data-i18n-key="overlayOpacity">Overlay Opacity</span>
                   <div id="overlayOpacityValue" class="wplace-overlay-opacity-value">
                    ${Math.round(D.overlayOpacity*100)}%
                   </div>
                </div>
                <input type="range" id="overlayOpacitySlider" min="0.1" max="1" step="0.05" value="${D.overlayOpacity}" class="wplace-overlay-opacity-slider">
              </div>
              <!-- Blue Marble Toggle -->
              <label for="enableBlueMarbleToggle" class="wplace-settings-toggle">
                  <div>
                    <span class="wplace-settings-toggle-title" data-i18n-key="blueMarbleEffect">Blue Marble Effect</span>
                    <p class="wplace-settings-toggle-description" data-i18n-key="blueMarbleDescription">Renders a dithered "shredded" overlay.</p>
                  </div>
                <input type="checkbox" id="enableBlueMarbleToggle" ${D.blueMarbleEnabled?"checked":""} class="wplace-settings-checkbox"/>
              </label>
          </div>
        </div>

        <!-- Paint Options Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-paint-brush wplace-icon-paint"></i>
          <span data-i18n-key="paintOptions">${g("paintOptions")}</span>
          </label>
          <!-- Pixel Filter Toggles -->
          <div id="pixelFilterControls" class="wplace-settings-section-wrapper wplace-pixel-filter-controls">
            <!-- Paint White Pixels -->
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintWhitePixels">${g("paintWhitePixels")}</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintWhitePixelsDescription">${g("paintWhitePixelsDescription")}</p>
              </div>
            <input type="checkbox" id="settingsPaintWhiteToggle" ${D.paintWhitePixels?"checked":""} class="wplace-settings-checkbox"/>
            </label>
            
            <!-- Paint Transparent Pixels -->
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintTransparentPixels">${g("paintTransparentPixels")}</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintTransparentPixelsDescription">${g("paintTransparentPixelsDescription")}</p>
              </div>
            <input type="checkbox" id="settingsPaintTransparentToggle" ${D.paintTransparentPixels?"checked":""} class="wplace-settings-checkbox"/>
            </label>
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintUnavailablePixels">${g("paintUnavailablePixels")}</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintUnavailablePixelsDescription">${g("paintUnavailablePixelsDescription")}</p>
              </div>
            <input type="checkbox" id="paintUnavailablePixelsToggle" ${D.paintUnavailablePixels?"checked":""} class="wplace-settings-checkbox"/>
            </label>
          </div>
        </div>

        <!-- Speed Control Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-tachometer-alt wplace-icon-speed"></i>
          <span data-i18n-key="paintingSpeed">${g("paintingSpeed")}</span>
          </label>
          
          <!-- Batch Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-dice wplace-icon-dice"></i>
            <span data-i18n-key="batchMode">Batch Mode</span>
            </label>
            <select id="batchModeSelect" class="wplace-settings-select">
              <option value="normal" data-i18n-key="batchModeNormal" class="wplace-settings-option">\u{1F4E6} Normal (Fixed Size)</option>
              <option value="random" data-i18n-key="batchModeRandom" class="wplace-settings-option">\u{1F3B2} Random (Range)</option>
            </select>
          </div>
          
          <!-- Normal Mode: Fixed Size Slider -->
          <div id="normalBatchControls" class="wplace-batch-controls wplace-normal-batch-controls">
            <div class="wplace-speed-slider-container">
              <input type="range" id="speedSlider" min="${H.PAINTING_SPEED.MIN}" max="${H.PAINTING_SPEED.MAX}" value="${D.paintingSpeed}" class="wplace-speed-slider">
              <div id="speedValue" class="wplace-speed-value">${D.paintingSpeed}</div>
            </div>
            <div class="wplace-speed-labels">
              <span class="wplace-speed-min"><i class="fas fa-turtle"></i> ${H.PAINTING_SPEED.MIN}</span>
              <span class="wplace-speed-max"><i class="fas fa-rabbit"></i> ${H.PAINTING_SPEED.MAX}</span>
            </div>
          </div>
          
          <!-- Random Mode: Range Controls -->
          <div id="randomBatchControls" class="wplace-batch-controls wplace-random-batch-controls">
            <div class="wplace-random-batch-grid">
              <div>
                <label class="wplace-random-batch-label">
                  <i class="fas fa-arrow-down wplace-icon-min"></i>
                <span data-i18n-key="minimumBatchSize">Minimum Batch Size</span>
                </label>
                <input type="number" id="randomBatchMin" min="1" max="1000" value="${D.randomBatchMin}" class="wplace-settings-number-input">
              </div>
              <div>
                <label class="wplace-random-batch-label">
                  <i class="fas fa-arrow-up wplace-icon-max"></i>
                <span data-i18n-key="maximumBatchSize">Maximum Batch Size</span>
                </label>
                <input type="number" id="randomBatchMax" min="1" max="1000" value="${D.randomBatchMax}" class="wplace-settings-number-input">
              </div>
            </div>
          <p class="wplace-random-batch-description" data-i18n-key="randomBatchDescription">\u{1F3B2} Random batch size between min and max values</p>
          </div>
          
          <!-- Speed Control Toggle -->
          <label class="wplace-speed-control-toggle">
            <input type="checkbox" id="enableSpeedToggle" ${D.paintingSpeedLimitEnabled?"checked":""} class="wplace-speed-checkbox"/>
          <span data-i18n-key="enablePaintingSpeedLimit">${g("enablePaintingSpeedLimit")}</span>
          </label>
        </div>
        
        <!-- Coordinate Generation Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-route wplace-icon-route"></i>
          <span data-i18n-key="coordinateGeneration">Coordinate Generation</span>
          </label>
          
          <!-- Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-th wplace-icon-table"></i>
            <span data-i18n-key="generationMode">Generation Mode</span>
            </label>
            <select id="coordinateModeSelect" class="wplace-settings-select">
            <option value="rows" data-i18n-key="modeRows" class="wplace-settings-option">\u{1F4CF} Rows (Horizontal Lines)</option>
            <option value="columns" data-i18n-key="modeColumns" class="wplace-settings-option">\u{1F4D0} Columns (Vertical Lines)</option>
            <option value="circle-out" data-i18n-key="modeCircleOut" class="wplace-settings-option">\u2B55 Circle Out (Center \u2192 Edges)</option>
            <option value="circle-in" data-i18n-key="modeCircleIn" class="wplace-settings-option">\u2B55 Circle In (Edges \u2192 Center)</option>
            <option value="blocks" data-i18n-key="modeBlocks" class="wplace-settings-option">\u{1F7EB} Blocks (Ordered)</option>
            <option value="shuffle-blocks" data-i18n-key="modeShuffleBlocks" class="wplace-settings-option">\u{1F3B2} Shuffle Blocks (Random)</option>
            </select>
          </div>
          
          <!-- Direction Selection (only for rows/columns) -->
          <div id="directionControls" class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-compass wplace-icon-compass"></i>
            <span data-i18n-key="startingDirection">Starting Direction</span>
            </label>
            <select id="coordinateDirectionSelect" class="wplace-settings-select">
            <option value="top-left" data-i18n-key="topLeft" class="wplace-settings-option">\u2196\uFE0F Top-Left</option>
            <option value="top-right" data-i18n-key="topRight" class="wplace-settings-option">\u2197\uFE0F Top-Right</option>
            <option value="bottom-left" data-i18n-key="bottomLeft" class="wplace-settings-option">\u2199\uFE0F Bottom-Left</option>
            <option value="bottom-right" data-i18n-key="bottomRight" class="wplace-settings-option">\u2198\uFE0F Bottom-Right</option>
            </select>
          </div>
          
          <!-- Snake Pattern Toggle (only for rows/columns) -->
          <div id="snakeControls" class="wplace-snake-pattern-controls wplace-settings-section-wrapper">
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="snakePattern">Snake Pattern</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="snakePatternDescription">Alternate direction for each row/column (zigzag pattern)</p>
              </div>
            <input type="checkbox" id="coordinateSnakeToggle" ${D.coordinateSnake?"checked":""} class="wplace-settings-checkbox"/>
            </label>
          </div>
          
          <!-- Block Size Controls (only for blocks/shuffle-blocks) -->
          <div id="blockControls" class="wplace-block-size-controls wplace-settings-section-wrapper wplace-shuffle-block-size-controls">
            <div class="wplace-block-size-grid">
              <div>
                <label class="wplace-block-size-label">
                  <i class="fas fa-arrows-alt-h wplace-icon-width"></i>
                <span data-i18n-key="blockWidth">Block Width</span>
                </label>
                <input type="number" id="blockWidthInput" min="1" max="50" value="6" class="wplace-settings-number-input">
              </div>
              <div>
                <label style="display: block; color: rgba(255,255,255,0.8); font-size: 12px; margin-bottom: 8px;">
                  <i class="fas fa-arrows-alt-v wplace-icon-height"></i>
                <span data-i18n-key="blockHeight">Block Height</span>
                </label>
                <input type="number" id="blockHeightInput" min="1" max="50" value="2" class="wplace-settings-number-input">
              </div>
            </div>
          <p class="wplace-block-size-description" data-i18n-key="blockSizeDescription">\u{1F9F1} Block dimensions for block-based generation modes</p>
          </div>
        </div>
        
        <!-- Notifications Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-bell wplace-icon-bell"></i>
          <span data-i18n-key="desktopNotifications">Desktop Notifications</span>
          </label>
          <div class="wplace-settings-section-wrapper wplace-notifications-wrapper">
            <label class="wplace-notification-toggle">
            <span data-i18n-key="enableNotifications">${g("enableNotifications")}</span>
            <input type="checkbox" id="notifEnabledToggle" ${D.notificationsEnabled?"checked":""} class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
            <span data-i18n-key="notifyOnChargesThreshold">${g("notifyOnChargesThreshold")}</span>
            <input type="checkbox" id="notifOnChargesToggle" ${D.notifyOnChargesReached?"checked":""} class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
            <span data-i18n-key="onlyWhenNotFocused">${g("onlyWhenNotFocused")}</span>
            <input type="checkbox" id="notifOnlyUnfocusedToggle" ${D.notifyOnlyWhenUnfocused?"checked":""} class="wplace-notification-checkbox" />
            </label>
            <div class="wplace-notification-interval">
            <span data-i18n-key="repeatEvery">${g("repeatEvery")}</span>
              <input type="number" id="notifIntervalInput" min="1" max="60" value="${D.notificationIntervalMinutes}" class="wplace-notification-interval-input" />
            <span data-i18n-key="minutesPl">${g("minutesPl")}</span>
            </div>
            <div class="wplace-notification-buttons">
            <button id="notifRequestPermBtn" class="wplace-btn wplace-btn-secondary wplace-notification-perm-btn">
              <i class="fas fa-unlock"></i>
              <span data-i18n-key="grantPermission">${g("grantPermission")}</span>
            </button>
            <button id="notifTestBtn" class="wplace-btn wplace-notification-test-btn">
              <i class="fas fa-bell"></i>
              <span data-i18n-key="test">${g("test")}</span>
            </button>
            </div>
          </div>
        </div>

        <!-- Theme Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-palette wplace-icon-palette"></i>
          <span data-i18n-key="themeSettings">${g("themeSettings")}</span>
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="themeSelect" class="wplace-settings-select">
            ${Object.entries(H.THEMES).map(([t,n])=>`<option value="${t}" ${a.themeKey===t?"selected":""} data-i18n-key="theme_${t}" class="wplace-settings-option">${n.name}</option>`).join("")}
            </select>
          </div>
        </div>

        <!-- Language Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-globe wplace-icon-globe"></i>
          <span data-i18n-key="language">${g("language")}</span>
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="languageSelect" class="wplace-settings-select">
            <option value="zh-CN" ${a.languageKey==="zh-CN"?"selected":""} class="wplace-settings-option">\u{1F1E8}\u{1F1F3} \u7B80\u4F53\u4E2D\u6587</option>
            <option value="es-MX" ${a.languageKey==="es-MX"?"selected":""} class="wplace-settings-option">\u{1F1F2}\u{1F1FD} Espa\xF1ol mexicano</option>
            <option value="en" ${a.languageKey==="en"?"selected":""} class="wplace-settings-option">\u{1F1FA}\u{1F1F8} English</option>
            <option value="ru" ${a.languageKey==="ru"?"selected":""} class="wplace-settings-option">\u{1F1F7}\u{1F1FA} \u0420\u0443\u0441\u0441\u043A\u0438\u0439</option>
            <option value="pt" ${a.languageKey==="pt"?"selected":""} class="wplace-settings-option">\u{1F1E7}\u{1F1F7} Portugu\xEAs</option>
            <option value="id" ${a.languageKey==="id"?"selected":""} class="wplace-settings-option">\u{1F1EE}\u{1F1E9} Bahasa Indonesia</option>
            <option value="fr" ${a.languageKey==="fr"?"selected":""} class="wplace-settings-option">\u{1F1EB}\u{1F1F7} Fran\xE7ais</option>
            <option value="tr" ${a.languageKey==="tr"?"selected":""} class="wplace-settings-option">\u{1F1F9}\u{1F1F7} T\xFCrk\xE7e</option>
            <option value="ja" ${a.languageKey==="ja"?"selected":""} class="wplace-settings-option">\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8A9E</option>
            <option value="vi" ${a.languageKey==="vi"?"selected":""} class="wplace-settings-option">\u{1F1FB}\u{1F1F3} Ti\u1EBFng Vi\u1EC7t</option>
            <option value="ko" ${a.languageKey==="ko"?"selected":""} class="wplace-settings-option">\u{1F1F0}\u{1F1F7} \uD55C\uAD6D\uC5B4</option>
            <option value="uk" ${a.languageKey==="uk"?"selected":""} class="wplace-settings-option">\u{1F1FA}\u{1F1E6} \u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430</option>
            <option value="zh-TW" ${a.languageKey==="zh-TW"?"selected":""} class="wplace-settings-option">\u{1F1F9}\u{1F1FC} \u7E41\u9AD4\u4E2D\u6587</option>
            </select>
          </div>
        </div>
      </div>

      <style>
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes settings-slide-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes settings-fade-out {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }

        #speedSlider::-webkit-slider-thumb, #overlayOpacitySlider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3), 0 0 0 2px #4facfe;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        #speedSlider::-webkit-slider-thumb:hover, #overlayOpacitySlider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 3px #4facfe;
        }

        #speedSlider::-moz-range-thumb, #overlayOpacitySlider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3), 0 0 0 2px #4facfe;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        #themeSelect:hover, #languageSelect:hover {
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.2);
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }

        #themeSelect:focus, #languageSelect:focus {
          border-color: #4facfe;
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.3);
        }

        #themeSelect option, #languageSelect option {
          background: #2d3748;
          color: white;
          padding: 10px;
          border-radius: 6px;
        }

        #themeSelect option:hover, #languageSelect option:hover {
          background: #4a5568;
        }

        .wplace-dragging {
          opacity: 0.9;
          box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.2);
          transition: none;
        }

        .wplace-settings-header:hover {
          background: rgba(255,255,255,0.15) !important;
        }

        .wplace-settings-header:active {
          background: rgba(255,255,255,0.2) !important;
        }
      </style>
    `,e}function qt(){let e=document.createElement("div");return e.id="wplace-image-bot-container",e.innerHTML=`
      <div class="wplace-header">
        <div class="wplace-header-title">
          <i class="fas fa-image"></i>
        <span data-i18n-key="title">${g("title")}</span>
        </div>
        <div class="wplace-header-controls">
        <button id="settingsBtn" class="wplace-header-btn" title="${g("settings")}" data-i18n-key="settings" data-i18n-attr="title">
            <i class="fas fa-cog"></i>
          </button>
        <button id="statsBtn" class="wplace-header-btn" title="${g("showStats")}" data-i18n-key="showStats" data-i18n-attr="title">
            <i class="fas fa-chart-bar"></i>
          </button>
        <button id="compactBtn" class="wplace-header-btn" title="${g("compactMode")}" data-i18n-key="compactMode" data-i18n-attr="title">
            <i class="fas fa-compress"></i>
          </button>
        <button id="minimizeBtn" class="wplace-header-btn" title="${g("minimize")}" data-i18n-key="minimize" data-i18n-attr="title">
            <i class="fas fa-minus"></i>
          </button>
        </div>
      </div>
      <div class="wplace-content">
        <!-- Status Section - Always visible -->
        <div class="wplace-status-section">
        <div id="statusText" class="wplace-status status-default" data-i18n-key="initMessage">
            ${g("initMessage")}
          </div>
          <div class="wplace-progress">
            <div id="progressBar" class="wplace-progress-bar" style="width: 0;"></div>
          </div>
        </div>

        <!-- Image Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="imageManagement">${g("imageManagement")}</div>
          <div class="wplace-controls">
            <div class="wplace-row">
            <button id="uploadBtn" class="wplace-btn wplace-btn-upload" disabled title="${g("waitingSetupComplete")}" data-i18n-key="waitingSetupComplete" data-i18n-attr="title">
                <i class="fas fa-upload"></i>
              <span data-i18n-key="uploadImage">${g("uploadImage")}</span>
              </button>
              <button id="resizeBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-expand"></i>
              <span data-i18n-key="resizeImage">${g("resizeImage")}</span>
              </button>
            </div>
            <div class="wplace-row single">
              <button id="selectPosBtn" class="wplace-btn wplace-btn-select" disabled>
                <i class="fas fa-crosshairs"></i>
              <span data-i18n-key="selectPosition">${g("selectPosition")}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Control Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="paintingControl">${g("paintingControl")}</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="startBtn" class="wplace-btn wplace-btn-start" disabled>
                <i class="fas fa-play"></i>
              <span data-i18n-key="startPainting">${g("startPainting")}</span>
              </button>
              <button id="stopBtn" class="wplace-btn wplace-btn-stop" disabled>
                <i class="fas fa-stop"></i>
              <span data-i18n-key="stopPainting">${g("stopPainting")}</span>
              </button>
            </div>
            <div class="wplace-row single">
                <button id="toggleOverlayBtn" class="wplace-btn wplace-btn-overlay" disabled>
                    <i class="fas fa-eye"></i>
              <span data-i18n-key="toggleOverlay">${g("toggleOverlay")}</span>
                </button>
            </div>
          </div>
        </div>

        <!-- Cooldown Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="cooldownSettings">${g("cooldownSettings")}</div>
            <div class="wplace-cooldown-control">
          <label id="cooldownLabel" data-i18n-key="waitCharges">${g("waitCharges")}:</label>
                <div class="wplace-slider-container">
                    <input type="range" id="cooldownSlider" class="wplace-slider" min="1" max="1" value="${a.cooldownChargeThreshold}">
                    <span id="cooldownValue" class="wplace-cooldown-value">${a.cooldownChargeThreshold}</span>
                </div>
            </div>
        </div>

        <!-- Data Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="dataManagement">${g("dataManagement")}</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="saveBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-save"></i>
              <span data-i18n-key="saveData">${g("saveData")}</span>
              </button>
            <button id="loadBtn" class="wplace-btn wplace-btn-primary" disabled title="${g("waitingTokenGenerator")}" data-i18n-key="waitingTokenGenerator" data-i18n-attr="title">
                <i class="fas fa-folder-open"></i>
              <span data-i18n-key="loadData">${g("loadData")}</span>
              </button>
            </div>
            <div class="wplace-row">
              <button id="saveToFileBtn" class="wplace-btn wplace-btn-file" disabled>
                <i class="fas fa-download"></i>
              <span data-i18n-key="saveToFile">${g("saveToFile")}</span>
              </button>
            <button id="loadFromFileBtn" class="wplace-btn wplace-btn-file" disabled title="${g("waitingTokenGenerator")}" data-i18n-key="waitingTokenGenerator" data-i18n-attr="title">
                <i class="fas fa-upload"></i>
              <span data-i18n-key="loadFromFile">${g("loadFromFile")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `,e}function _t(){let e=document.createElement("div");return e.id="wplace-stats-container",e.style.display="block",e.innerHTML=`
    <div class="wplace-header">
      <div class="wplace-header-title">
        <i class="fas fa-chart-bar"></i>
        <span data-i18n-key="paintingStats">${g("paintingStats")}</span>
      </div>
      <div class="wplace-header-controls">
        <button id="refreshChargesBtn" class="wplace-header-btn" title="${g("refreshCharges")}" data-i18n-key="refreshCharges" data-i18n-attr="title">
          <i class="fas fa-sync"></i>
        </button>
        <button id="closeStatsBtn" class="wplace-header-btn" title="${g("closeStats")}" data-i18n-key="closeStats" data-i18n-attr="title">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div class="wplace-content">
      <div class="wplace-stats">
        <div id="statsArea">
          <div id="wplace-init-msg" class="wplace-stat-item">
            <div class="wplace-stat-label">
              <i class="fas fa-info-circle"></i>
              <span data-i18n-key="initMessage">${g("initMessage")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,e}function Yo(){return["wplace-charge-stats","wplace-image-stats","wplace-colors-section"].every(t=>{let n=document.getElementById(t);return n&&getComputedStyle(n).display!=="none"})}function Wt(){if(Yo()){let e=document.getElementById("wplace-init-msg");e&&e.remove()}}function Ht(){let e=document.createElement("div");return e.className="resize-container",e.innerHTML=`
    <h3 class="resize-dialog-title" data-i18n-key="resizeImage">${g("resizeImage")}</h3>
    <div class="resize-controls">
      <label class="resize-control-label">
        Width: <span id="widthValue">0</span>px
        <input type="range" id="widthSlider" class="resize-slider" min="10" max="500" value="100">
      </label>
      <label class="resize-control-label">
        Height: <span id="heightValue">0</span>px
        <input type="range" id="heightSlider" class="resize-slider" min="10" max="500" value="100">
      </label>
      <label class="resize-checkbox-label">
        <input type="checkbox" id="keepAspect" checked>
        <span data-i18n-key="keepAspectRatio">${g("keepAspectRatio")}</span>
      </label>
      <label class="resize-checkbox-label">
        <input type="checkbox" id="paintWhiteToggle" checked>
        <span data-i18n-key="paintWhitePixels">${g("paintWhitePixels")}</span>
      </label>
      <label class="resize-checkbox-label">
        <input type="checkbox" id="paintTransparentToggle" checked>
        <span data-i18n-key="paintTransparentPixels">${g("paintTransparentPixels")}</span>
      </label>
      <div class="resize-zoom-controls">
        <button id="zoomOutBtn" class="wplace-btn resize-zoom-btn" title="${g("zoomOut")}" data-i18n-key="zoomOut" data-i18n-attr="title">
          <i class="fas fa-search-minus"></i>
        </button>
        <input type="range" id="zoomSlider" class="resize-slider resize-zoom-slider" min="0.1" max="20" value="1" step="0.05">
        <button id="zoomInBtn" class="wplace-btn resize-zoom-btn" title="${g("zoomIn")}" data-i18n-key="zoomIn" data-i18n-attr="title">
          <i class="fas fa-search-plus"></i>
        </button>
        <button id="zoomFitBtn" class="wplace-btn resize-zoom-btn" title="${g("fitToView")}" data-i18n-key="fitToView" data-i18n-attr="title">
          ${g("fit")}
        </button>
        <button id="zoomActualBtn" class="wplace-btn resize-zoom-btn" title="${g("actualSize")}" data-i18n-key="actualSize" data-i18n-attr="title">
          ${g("hundred")}
        </button>
        <button id="panModeBtn" class="wplace-btn resize-zoom-btn" title="${g("panMode")}" data-i18n-key="panMode" data-i18n-attr="title">
          <i class="fas fa-hand-paper"></i>
        </button>
        <span id="zoomValue" class="resize-zoom-value">100%</span>
        <div id="cameraHelp" class="resize-camera-help">
          Drag to pan \u2022 Pinch to zoom \u2022 Double\u2011tap to zoom
        </div>
      </div>
    </div>

    <div class="resize-preview-wrapper">
      <div id="resizePanStage" class="resize-pan-stage">
        <div id="resizeCanvasStack" class="resize-canvas-stack resize-canvas-positioned">
          <canvas id="resizeCanvas" class="resize-base-canvas"></canvas>
          <canvas id="maskCanvas" class="resize-mask-canvas"></canvas>
        </div>
      </div>
    </div>

    <div class="resize-tools">
      <div class="resize-tools-container">
        <div class="resize-brush-controls">
          <div class="resize-brush-control">
            <label class="resize-tool-label">Brush</label>
            <div class="resize-tool-input-group">
              <input id="maskBrushSize" type="range" min="1" max="7" step="1" value="1" class="resize-tool-slider">
              <span id="maskBrushSizeValue" class="resize-tool-value">1</span>
            </div>
          </div>
          <div class="resize-brush-control">
            <label class="resize-tool-label">Row/col size</label>
            <div class="resize-tool-input-group">
              <input id="rowColSize" type="range" min="1" max="7" step="1" value="1" class="resize-tool-slider">
              <span id="rowColSizeValue" class="resize-tool-value">1</span>
            </div>
          </div>
        </div>
        <div class="resize-mode-controls">
          <label class="resize-tool-label">Mode</label>
          <div class="mask-mode-group resize-mode-group">
            <button id="maskModeIgnore" class="wplace-btn resize-mode-btn">Ignore</button>
            <button id="maskModeUnignore" class="wplace-btn resize-mode-btn">Unignore</button>
            <button id="maskModeToggle" class="wplace-btn wplace-btn-primary resize-mode-btn">Toggle</button>
          </div>
        </div>
        <button id="clearIgnoredBtn" class="wplace-btn resize-clear-btn" title="Clear all ignored pixels" data-i18n-key="clearAllIgnored" data-i18n-attr="title">Clear</button>
        <button id="invertMaskBtn" class="wplace-btn resize-invert-btn" title="Invert mask" data-i18n-key="invertMask" data-i18n-attr="title">Invert</button>
        <span class="resize-shortcut-help">Shift = Row \u2022 Alt = Column</span>
      </div>
    </div>

    <div class="wplace-section resize-color-palette-section" id="color-palette-section">
      <div class="wplace-section-title">
        <i class="fas fa-palette"></i>&nbsp;Color Palette
      </div>
      <div class="wplace-controls">
        <div class="wplace-row single">
          <label class="resize-color-toggle-label">
            <input type="checkbox" id="showAllColorsToggle" class="resize-color-checkbox">
            <span data-i18n-key="showAllColorsIncluding">${g("showAllColorsIncluding")}</span>
          </label>
        </div>
        <div class="wplace-row" style="display: flex;">
          <button id="selectAllBtn" class="wplace-btn" style="flex: 1;" data-i18n-key="selectAll">Select All</button>
          <button id="unselectAllBtn" class="wplace-btn" style="flex: 1;" data-i18n-key="unselectAll">Unselect All</button>
          <button id="unselectPaidBtn" class="wplace-btn" data-i18n-key="unselectPaid">Unselect Paid</button>
        </div>
        <div id="colors-container" class="wplace-color-grid"></div>
      </div>
    </div>

    <div class="wplace-section resize-advanced-color-section" id="advanced-color-section">
      <div class="wplace-section-title">
        <i class="fas fa-flask"></i>&nbsp;Advanced Color Matching
      </div>
      <div class="resize-advanced-controls">
        <label class="resize-advanced-label">
          <span class="resize-advanced-label-text">Algorithm</span>
          <select id="colorAlgorithmSelect" class="resize-advanced-select">
            <option value="lab" ${a.colorMatchingAlgorithm==="lab"?"selected":""} data-i18n-key="perceptualLab">Perceptual (Lab)</option>
            <option value="legacy" ${a.colorMatchingAlgorithm==="legacy"?"selected":""} data-i18n-key="legacyRgb">Legacy (RGB)</option>
          </select>
        </label>
        <label class="resize-advanced-toggle">
          <div class="resize-advanced-toggle-content">
            <span class="resize-advanced-label-text">Chroma Penalty</span>
            <div class="resize-advanced-description">Preserve vivid colors (Lab only)</div>
          </div>
          <input type="checkbox" id="enableChromaPenaltyToggle" ${a.enableChromaPenalty?"checked":""} class="resize-advanced-checkbox" />
        </label>
        <div class="resize-chroma-weight-control">
          <div class="resize-chroma-weight-header">
            <span data-i18n-key="chromaWeight">${g("chromaWeight")}</span>
            <span id="chromaWeightValue" class="resize-chroma-weight-value">${a.chromaPenaltyWeight}</span>
          </div>
          <input type="range" id="chromaPenaltyWeightSlider" min="0" max="0.5" step="0.01" value="${a.chromaPenaltyWeight}" class="resize-chroma-weight-slider" />
        </div>
        <label class="resize-advanced-toggle">
          <div class="resize-advanced-toggle-content">
            <span class="resize-advanced-label-text">Enable Dithering</span>
            <div class="resize-advanced-description">Floyd\u2013Steinberg error diffusion in preview and applied output</div>
          </div>
          <input type="checkbox" id="enableDitheringToggle" ${a.ditheringEnabled?"checked":""} class="resize-advanced-checkbox" />
        </label>
        <div class="resize-threshold-controls">
          <label class="resize-threshold-label">
            <span class="resize-advanced-label-text">Transparency</span>
            <input type="number" id="transparencyThresholdInput" min="0" max="255" value="${a.customTransparencyThreshold}" class="resize-threshold-input" />
          </label>
          <label class="resize-threshold-label">
            <span class="resize-advanced-label-text">White Thresh</span>
            <input type="number" id="whiteThresholdInput" min="200" max="255" value="${a.customWhiteThreshold}" class="resize-threshold-input" />
          </label>
        </div>
        <button id="resetAdvancedColorBtn" class="wplace-btn resize-reset-advanced-btn" data-i18n-key="resetAdvanced">Reset Advanced</button>
      </div>
    </div>

    <div class="resize-buttons">
      <button id="downloadPreviewBtn" class="wplace-btn wplace-btn-primary">
        <i class="fas fa-download"></i>
        <span data-i18n-key="downloadPreview">${g("downloadPreview")}</span>
      </button>
      <button id="confirmResize" class="wplace-btn wplace-btn-start">
        <i class="fas fa-check"></i>
        <span data-i18n-key="apply">${g("apply")}</span>
      </button>
      <button id="cancelResize" class="wplace-btn wplace-btn-stop">
        <i class="fas fa-times"></i>
        <span data-i18n-key="cancel">${g("cancel")}</span>
      </button>
    </div>
  `,e}function I(e,t="info"){let o=["info","success","warning","error"].includes(t)?t:"info",i=document.createElement("div");i.className=`wplace-alert-base wplace-alert-${o}`,i.textContent=e,i.addEventListener("click",()=>{i.classList.add("fade-out"),setTimeout(()=>document.body.removeChild(i),300)}),document.body.appendChild(i),setTimeout(()=>{i.classList.add("fade-out"),setTimeout(()=>{i.parentElement===document.body&&document.body.removeChild(i)},300)},4e3)}var ct=!1,oe=null,fe=null,re=null,_e=null,De=null;async function Le(){return window.turnstile?(ct=!0,Promise.resolve()):new Promise((e,t)=>{if(document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]')){let o=()=>{window.turnstile?(ct=!0,e()):setTimeout(o,100)};return o()}let n=document.createElement("script");n.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",n.async=!0,n.defer=!0,n.onload=()=>{ct=!0,console.log("\u2705 Turnstile script loaded successfully"),e()},n.onerror=()=>{console.error("\u274C Failed to load Turnstile script"),t(new Error("Failed to load Turnstile"))},document.head.appendChild(n)})}function jo(){return(!oe||!document.body.contains(oe))&&(oe&&oe.remove(),oe=document.createElement("div"),oe.className="wplace-turnstile-hidden",oe.setAttribute("aria-hidden","true"),oe.id="turnstile-widget-container",document.body.appendChild(oe)),oe}function Ko(){if(fe&&document.body.contains(fe))return fe;let e=document.createElement("div");e.id="turnstile-overlay-container",e.className="wplace-turnstile-overlay wplace-overlay-hidden";let t=document.createElement("div");t.textContent=g("turnstileInstructions"),t.dataset.i18nKey="turnstileInstructions",t.className="wplace-turnstile-title";let n=document.createElement("div");n.id="turnstile-overlay-host",n.className="wplace-turnstile-host";let o=document.createElement("button");return o.textContent=g("hideTurnstileBtn"),o.dataset.i18nKey="hideTurnstileBtn",o.className="wplace-turnstile-hide-btn",o.addEventListener("click",()=>e.remove()),e.appendChild(t),e.appendChild(n),e.appendChild(o),document.body.appendChild(e),fe=e,e}async function Oe(e,t="paint"){if(await Le(),re&&_e===e&&window.turnstile?.execute)try{console.log("\u{1F504} Reusing existing Turnstile widget...");let o=await Promise.race([window.turnstile.execute(re,{action:t}),new Promise((i,s)=>setTimeout(()=>s(new Error("Execute timeout")),15e3))]);if(o&&o.length>20)return console.log("\u2705 Token generated via widget reuse"),o}catch(o){console.log("\uFFFD Widget reuse failed, will create a fresh widget:",o.message)}let n=await Jo(e,t);return n&&n.length>20?n:(console.log("\uFFFD Falling back to interactive Turnstile (visible)."),await Zo(e,t))}async function Jo(e,t){return new Promise(n=>{try{if(re&&window.turnstile?.remove)try{window.turnstile.remove(re),console.log("\u{1F9F9} Cleaned up existing Turnstile widget")}catch(s){console.warn("\u26A0\uFE0F Widget cleanup warning:",s.message)}let o=jo();if(o.innerHTML="",!window.turnstile?.render){console.error("\u274C Turnstile not available for rendering"),n(null);return}console.log("\u{1F527} Creating invisible Turnstile widget...");let i=window.turnstile.render(o,{sitekey:e,action:t,size:"invisible",retry:"auto","retry-interval":8e3,callback:s=>{console.log("\u2705 Invisible Turnstile callback"),n(s)},"error-callback":()=>n(null),"timeout-callback":()=>n(null)});if(re=i,_e=e,!i)return n(null);Promise.race([window.turnstile.execute(i,{action:t}),new Promise((s,l)=>setTimeout(()=>l(new Error("Invisible execute timeout")),12e3))]).then(n).catch(()=>n(null))}catch(o){console.error("\u274C Invisible Turnstile creation failed:",o),n(null)}})}async function Zo(e,t){return console.log("\u{1F504} Creating interactive Turnstile widget (visible)"),new Promise(n=>{try{if(re&&window.turnstile?.remove)try{window.turnstile.remove(re)}catch(m){console.warn("\u26A0\uFE0F Widget cleanup warning:",m.message)}let o=Ko();o.classList.remove("wplace-overlay-hidden"),o.style.display="block";let i=o.querySelector("#turnstile-overlay-host");i.innerHTML="";let s=setTimeout(()=>{console.warn("\u23F0 Interactive Turnstile widget timeout"),o.classList.add("wplace-overlay-hidden"),o.style.display="none",n(null)},6e4),l=window.turnstile.render(i,{sitekey:e,action:t,size:"normal",theme:"light",callback:m=>{clearTimeout(s),o.classList.add("wplace-overlay-hidden"),o.style.display="none",console.log("\u2705 Interactive Turnstile completed successfully"),typeof m=="string"&&m.length>20?n(m):(console.warn("\u274C Invalid token from interactive widget"),n(null))},"error-callback":m=>{clearTimeout(s),o.classList.add("wplace-overlay-hidden"),o.style.display="none",console.warn("\u274C Interactive Turnstile error:",m),n(null)}});re=l,_e=e,l?console.log("\u2705 Interactive Turnstile widget created, waiting for user interaction..."):(clearTimeout(s),o.classList.add("wplace-overlay-hidden"),o.style.display="none",console.warn("\u274C Failed to create interactive Turnstile widget"),n(null))}catch(o){console.error("\u274C Interactive Turnstile creation failed:",o),n(null)}})}function Vt(){if(re&&window.turnstile?.remove)try{window.turnstile.remove(re)}catch(e){console.warn("Failed to cleanup Turnstile widget:",e)}oe&&document.body.contains(oe)&&oe.remove(),fe&&document.body.contains(fe)&&fe.remove(),re=null,oe=null,fe=null,_e=null}async function We(e="0x4AAAAAABpqJe8FO0N84q0F"){if(De)return console.log("\u{1F50D} Using cached sitekey:",De),pe()?{sitekey:De,token:le()}:{sitekey:De,token:null};let t=["0x4AAAAAABpqJe8FO0N84q0F","0x4AAAAAABpHqZ-6i7uL0nmG","0x4AAAAAAAJ7xjKAp6Mt_7zw","0x4AAAAAADm5QWx6Ov2LNF2g"],n=async(i,s)=>{if(!i||i.length<10)return null;console.log(`\u{1F50D} Testing sitekey from ${s}:`,i);let l=await Oe(i);return l&&l.length>=20?(console.log(`\u2705 Valid token generated from ${s} sitekey`),J(l),De=i,{sitekey:i,token:l}):(console.log(`\u274C Failed to get token from ${s} sitekey`),null)};try{let i=document.querySelector("[data-sitekey]");if(i){let f=i.getAttribute("data-sitekey"),b=await n(f,"data attribute");if(b)return b}let s=document.querySelector(".cf-turnstile");if(s?.dataset?.sitekey){let f=s.dataset.sitekey,b=await n(f,"turnstile element");if(b)return b}let l=document.querySelectorAll('meta[name*="turnstile"], meta[property*="turnstile"]');for(let f of l){let b=f.getAttribute("content"),p=await n(b,"meta tag");if(p)return p}if(window.__TURNSTILE_SITEKEY){let f=await n(window.__TURNSTILE_SITEKEY,"global variable");if(f)return f}let m=document.querySelectorAll("script");for(let f of m){let p=(f.textContent||f.innerHTML).match(/(?:sitekey|data-sitekey)['"\s[\]:=(]*['"]?([0-9a-zA-Z_-]{20,})['"]?/i);if(p&&p[1]){let r=p[1].replace(/['"]/g,""),u=await n(r,"script content");if(u)return u}}console.log("\u{1F50D} Testing known potential sitekeys...");for(let f of t){let b=await n(f,"known list");if(b)return b}}catch(i){console.warn("\u26A0\uFE0F Error during sitekey detection:",i)}console.log("\u{1F527} Trying fallback sitekey:",e);let o=await n(e,"fallback");return o||(console.error("\u274C No working sitekey or token found."),{sitekey:null,token:null})}var G={token:null,expiryTime:0,generationInProgress:!1,resolveToken:null,tokenPromise:null};G.tokenPromise=new Promise(e=>{G.resolveToken=e});var Qo=24e4;function J(e){G.resolveToken&&(G.resolveToken(e),G.resolveToken=null),G.token=e,G.expiryTime=Date.now()+Qo,console.log("\u2705 Turnstile token set successfully")}function le(){return G.token}function pe(){return G.token&&Date.now()<G.expiryTime}function ea(){G.token=null,G.expiryTime=0,console.log("\u{1F5D1}\uFE0F Token invalidated, will force fresh generation")}async function He(e=!1){if(pe()&&!e)return G.token;if(e&&ea(),G.generationInProgress)return console.log("\u{1F504} Token generation already in progress, waiting..."),await V(2e3),pe()?G.token:null;G.generationInProgress=!0;try{console.log("\u{1F504} Token expired or missing, generating new one...");let t=await dt();if(t&&t.length>20)return J(t),console.log("\u2705 Token captured and cached successfully"),t;console.log("\u26A0\uFE0F Invisible Turnstile failed, forcing browser automation...");let n=await Ve();return n&&n.length>20?(J(n),console.log("\u2705 Fallback token captured successfully"),n):(console.log("\u274C All token generation methods failed"),null)}finally{G.generationInProgress=!1}}async function dt(){let e=performance.now();try{let{sitekey:t,token:n}=await We();if(!t)throw new Error("No valid sitekey found");console.log("\u{1F511} Using sitekey:",t),typeof window<"u"&&window.navigator&&console.log("\u{1F9ED} UA:",window.navigator.userAgent.substring(0,50)+"...","Platform:",window.navigator.platform);let o;if(n&&typeof n=="string"&&n.length>20?(console.log("\u267B\uFE0F Reusing pre-generated Turnstile token"),o=n):pe()?(console.log("\u267B\uFE0F Using existing cached token (from previous session)"),o=G.token):(console.log("\u{1F510} Generating new token with executeTurnstile..."),o=await Oe(t,"paint"),o&&J(o)),o&&typeof o=="string"&&o.length>20){let i=Math.round(performance.now()-e);return console.log(`\u2705 Turnstile token generated successfully in ${i}ms`),o}else throw new Error(`Invalid or empty token received - Length: ${o?.length||0}`)}catch(t){let n=Math.round(performance.now()-e);throw console.error(`\u274C Turnstile token generation failed after ${n}ms:`,t),t}}async function Ve(){return new Promise(async(e,t)=>{try{G.resolveToken||(G.tokenPromise=new Promise(i=>{G.resolveToken=i}));let n=V(2e4).then(()=>t(new Error("Auto-CAPTCHA timed out."))),o=(async()=>{let i=await Ee("button.btn.btn-primary.btn-lg, button.btn-primary.sm\\:btn-xl",200,1e4);if(!i)throw new Error("Could not find the main paint button.");i.click(),await V(500);let s=await Ee("button#color-0",200,5e3);if(!s)throw new Error("Could not find the transparent color button.");s.click(),await V(500);let l=await Ee("canvas",200,5e3);if(!l)throw new Error("Could not find the canvas element.");l.setAttribute("tabindex","0"),l.focus();let m=l.getBoundingClientRect(),f=Math.round(m.left+m.width/2),b=Math.round(m.top+m.height/2);l.dispatchEvent(new MouseEvent("mousemove",{clientX:f,clientY:b,bubbles:!0})),l.dispatchEvent(new KeyboardEvent("keydown",{key:" ",code:"Space",bubbles:!0})),await V(50),l.dispatchEvent(new KeyboardEvent("keyup",{key:" ",code:"Space",bubbles:!0})),await V(500),await V(800),(async()=>{for(;!G.token;){let u=await Ee("button.btn.btn-primary.btn-lg, button.btn.btn-primary.sm\\:btn-xl");if(!u){let c=Array.from(document.querySelectorAll("button.btn-primary"));u=c.length?c[c.length-1]:null}u&&u.click(),await V(500)}})();let r=await G.tokenPromise;await V(300),e(r)})();await Promise.race([o,n])}catch(n){console.error("Auto-CAPTCHA process failed:",n),t(n)}})}var Ge={async paintPixelInRegion(e,t,n,o,i){try{if(await He(),!le)return"token_error";let s={coords:[n,o],colors:[i],t:le},l=await fetch(`https://backend.wplace.live/s0/pixel/${e}/${t}`,{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8"},credentials:"include",body:JSON.stringify(s)});return l.status===403?(console.error("\u274C 403 Forbidden. Turnstile token might be invalid or expired."),J(null),"token_error"):(await l.json())?.painted===1}catch(s){return console.error("Paint request failed:",s),!1}},async getCharges(){let e={charges:0,max:1,cooldown:a.cooldown};try{let t=await fetch("https://backend.wplace.live/me",{credentials:"include"});if(!t.ok)return console.error(`Failed to get charges: HTTP ${t.status}`),e;let n=await t.json();return{charges:n.charges?.count??0,max:n.charges?.max??1,cooldown:n.charges?.cooldownMs??a.cooldown}}catch(t){return console.error("Failed to get charges:",t),e}}};var ce={pollTimer:null,pollIntervalMs:6e4,icon(){return document.querySelector("link[rel~='icon']")?.href||location.origin+"/favicon.ico"},async requestPermission(){if(!("Notification"in window))return I(g("notificationsNotSupported"),"warning"),"denied";if(Notification.permission==="granted")return"granted";try{return await Notification.requestPermission()}catch{return Notification.permission}},canNotify(){return a.notificationsEnabled&&typeof Notification<"u"&&Notification.permission==="granted"},notify(e,t,n="wplace-charges",o=!1){if(!this.canNotify()||!o&&a.notifyOnlyWhenUnfocused&&document.hasFocus())return!1;try{return new Notification(e,{body:t,tag:n,renotify:!0,icon:this.icon(),badge:this.icon(),silent:!1}),!0}catch{return I(t,"info"),!1}},resetEdgeTracking(){a._lastChargesBelow=a.displayCharges<a.cooldownChargeThreshold,a._lastChargesNotifyAt=0},maybeNotifyChargesReached(e=!1){if(!a.notificationsEnabled||!a.notifyOnChargesReached)return;let t=a.displayCharges>=a.cooldownChargeThreshold,n=Date.now(),o=Math.max(1,Number(a.notificationIntervalMinutes||5))*6e4;if(t){let i=a._lastChargesBelow||e,s=n-(a._lastChargesNotifyAt||0)>=o;if(i||s){let l=g("chargesReadyMessage",{current:a.displayCharges,max:a.maxCharges,threshold:a.cooldownChargeThreshold});this.notify(g("chargesReadyNotification"),l,"wplace-notify-charges"),a._lastChargesNotifyAt=n}a._lastChargesBelow=!1}else a._lastChargesBelow=!0},startPolling(){this.stopPolling(),!(!a.notificationsEnabled||!a.notifyOnChargesReached)&&(this.pollTimer=setInterval(async()=>{try{let{charges:e,cooldown:t,max:n}=await Ge.getCharges();a.displayCharges=Math.floor(e),a.cooldown=t,a.maxCharges=Math.max(1,Math.floor(n)),this.maybeNotifyChargesReached()}catch{}},this.pollIntervalMs))},stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)},syncFromState(){this.resetEdgeTracking(),a.notificationsEnabled&&a.notifyOnChargesReached?this.startPolling():this.stopPolling()}};var Gt=()=>new Promise(e=>{let t=document.createElement("input");t.type="file",t.accept="image/png,image/jpeg",t.onchange=()=>{let n=new FileReader;n.onload=()=>e(n.result),n.readAsDataURL(t.files[0])},t.click()}),Xt=(e,t)=>{let n=new Blob([e],{type:"application/json"}),o=URL.createObjectURL(n),i=document.createElement("a");i.href=o,i.download=t,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(o)},Yt=()=>new Promise((e,t)=>{let n=document.createElement("input");n.type="file",n.accept=".json",n.onchange=o=>{let i=o.target.files[0];if(i){let s=new FileReader;s.onload=()=>{try{let l=JSON.parse(s.result);e(l)}catch{t(new Error("Invalid JSON file"))}},s.onerror=()=>t(new Error("File reading error")),s.readAsText(i)}else t(new Error("No file selected"))},n.click()});var be=class{constructor(t){this.imageSrc=t,this.img=null,this.canvas=null,this.ctx=null}async load(){return new Promise((t,n)=>{this.img=new Image,this.img.crossOrigin="anonymous",this.img.onload=()=>{this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("2d"),this.canvas.width=this.img.width,this.canvas.height=this.img.height,this.ctx.drawImage(this.img,0,0),t()},this.img.onerror=n,this.img.src=this.imageSrc})}getDimensions(){return{width:this.canvas.width,height:this.canvas.height}}getPixelData(){return this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height).data}resize(t,n){let o=document.createElement("canvas"),i=o.getContext("2d");return o.width=t,o.height=n,i.imageSmoothingEnabled=!1,i.drawImage(this.canvas,0,0,t,n),this.canvas.width=t,this.canvas.height=n,this.ctx.imageSmoothingEnabled=!1,this.ctx.drawImage(o,0,0),this.ctx.getImageData(0,0,t,n).data}generatePreview(t,n){let o=document.createElement("canvas"),i=o.getContext("2d");return o.width=t,o.height=n,i.imageSmoothingEnabled=!1,i.drawImage(this.img,0,0,t,n),o.toDataURL()}};function pt(e,t,n){if(!e||!t||!n)return null;let o=t*n,i=Math.ceil(o/8),s=new Uint8Array(i),l=0;for(let b=0;b<n;b++){let p=e[b];for(let r=0;r<t;r++){let u=p&&p[r]?1:0,c=l>>3,h=l&7;u&&(s[c]|=1<<h),l++}}let m="",f=32768;for(let b=0;b<s.length;b+=f)m+=String.fromCharCode.apply(null,s.subarray(b,Math.min(b+f,s.length)));return btoa(m)}function jt(e){if(!e||!(!e.version||e.version==="1"||e.version==="1.0"||e.version==="1.1"))return e;try{let n={...e},o=n.imageData?.width,i=n.imageData?.height;if(n.paintedMap&&o&&i){let s=pt(n.paintedMap,o,i);n.paintedMapPacked={width:o,height:i,data:s}}return delete n.paintedMap,n.version="2",n}catch(n){return console.warn("Migration to v2 failed, using original data:",n),e}}function Kt(e){if(!e||e.version==="2.1")return e;let t=e.version==="2"||e.version==="2.0",n=!e.version||e.version==="1"||e.version==="1.0"||e.version==="1.1";if(!t&&!n)return e;try{let o={...e};if(n){let i=o.imageData?.width,s=o.imageData?.height;if(o.paintedMap&&i&&s){let l=pt(o.paintedMap,i,s);o.paintedMapPacked={width:i,height:s,data:l}}delete o.paintedMap}return o.version="2.1",o}catch(o){return console.warn("Migration to v2.1 failed, using original data:",o),e}}function Jt(e){try{let t={...e};return t.version="2.2",t.state.coordinateMode||(t.state.coordinateMode=D.coordinateMode),t.state.coordinateDirection||(t.state.coordinateDirection=D.coordinateDirection),t.state.coordinateSnake||(t.state.coordinateSnake=D.coordinateSnake),t.state.blockWidth||(t.state.blockWidth=D.blockWidth),t.state.blockHeight||(t.state.blockHeight=D.blockHeight),t}catch(t){return console.warn("Migration to v2.2 failed, using original data:",t),e}}function Zt(e){try{let t={...e};return t.version="2.3",t.state&&(delete t.state.coordinateMode,delete t.state.coordinateDirection,delete t.state.coordinateSnake,delete t.state.blockWidth,delete t.state.blockHeight,delete t.state.paintedMapPacked,delete t.state.lastPosition,delete t.state.colorsChecked,delete t.state.imageLoaded,t.state.totalPixels!=null&&(t.state.artTotalPixels=t.state.totalPixels,delete t.state.totalPixels),t.state.paintedPixels!=null&&(t.state.userPaintedPixels=t.state.paintedPixels,delete t.state.paintedPixels)),t}catch(t){return console.warn("Migration to v2.3 failed, using original data:",t),e}}function Qt(){return{timestamp:Date.now(),version:"2.3",state:{artTotalPixels:a.artTotalPixels,userPaintedPixels:a.userPaintedPixels,startPosition:a.startPosition,region:a.region,availableColors:a.availableColors},imageData:a.imageData?{width:a.imageData.width,height:a.imageData.height,pixels:Array.from(a.imageData.pixels),totalPixels:a.imageData.totalPixels}:null}}function en(e){if(!e)return null;let t=e,n=t.version;return(!n||n==="1"||n==="1.0"||n==="1.1")&&(t=jt(t)),(t.version==="2"||t.version==="2.0")&&(t=Kt(t)),t.version==="2.1"&&(t=Jt(t)),t.version==="2.2"&&(t=Zt(t)),t}function ge(){try{let e=Qt(a);return ze("wplace-bot-progress",e)}catch(e){return console.error("Error saving progress:",e),!1}}function Xe(){try{let e=Ae("wplace-bot-progress");if(!e)return null;let t=en(e);return t&&t!==e&&ze("wplace-bot-progress",t),t}catch(e){return console.error("Error loading progress:",e),null}}function gt(e){try{let t=en(e);if(Object.assign(a,t.state),t.imageData){a.imageData={...t.imageData,pixels:new Uint8ClampedArray(t.imageData.pixels)};try{let n=document.createElement("canvas");n.width=a.imageData.width,n.height=a.imageData.height;let o=n.getContext("2d"),i=new ImageData(a.imageData.pixels,a.imageData.width,a.imageData.height);o.putImageData(i,0,0);let s=new be("");s.img=n,s.canvas=n,s.ctx=o,a.imageData.processor=s}catch(n){console.warn("Could not rebuild processor from saved image data:",n)}}return!0}catch(t){return console.error("Error restoring progress:",t),!1}}function tn(){try{let e=Qt(),t=`wplace-bot-progress-${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;return Xt(JSON.stringify(e,null,2),t),!0}catch(e){return console.error("Error saving to file:",e),!1}}async function nn(){try{let e=await Yt();if(!e||!e.state)throw new Error("Invalid file format");return gt(e)}catch(e){throw console.error("Error loading from file:",e),e}}function ve(e,t,n,o=0){let i=t-e;return Math.max(0,i*n-o)}function on(e){if(a.stopFlag)return;let t=a.cooldownChargeThreshold,n=ve(a.preciseCurrentCharges,t,a.cooldown,e),o=qe(n);E("noChargesThreshold","warning",{threshold:t,current:a.displayCharges,time:o},!0)}function ut(e){let t=Math.floor(e/1e3%60),n=Math.floor(e/(1e3*60)%60),o=Math.floor(e/(1e3*60*60)%24),i=Math.floor(e/(1e3*60*60*24)),s="";return i>0&&(s+=`${i}d `),(o>0||i>0)&&(s+=`${o}h `),(n>0||o>0||i>0)&&(s+=`${n}m `),s+=`${t}s`,s}function mt(){let e=a.artTotalPixels-a.userPaintedPixels;return ve(a.preciseCurrentCharges,e,a.cooldown)}function Ye(e,t={},n=[]){let o=document.createElement(e);return Object.entries(t).forEach(([i,s])=>{i==="style"&&typeof s=="object"?Object.assign(o.style,s):i==="className"?o.className=s:i==="innerHTML"?o.innerHTML=s:o.setAttribute(i,s)}),typeof n=="string"?o.textContent=n:Array.isArray(n)&&n.forEach(i=>{typeof i=="string"?o.appendChild(document.createTextNode(i)):o.appendChild(i)}),o}function je(){let e=[],t=[],n=document.querySelectorAll('.tooltip button[id^="color-"]');if(n.length===0)return console.log("\u274C No color elements found on page"),{availableColors:e,unavailableColors:t};function o(i){let s=Number(i.id.replace("color-","")),l=i.style.backgroundColor.match(/\d+/g);if(!l||l.length<3){if(s!==0)return console.warn(`Skipping color element ${i.id} \u2014 cannot parse RGB`),null;{let r=H.COLOR_MAP[s];return r?{id:r.id,name:r.name,rgb:Object.values(r.rgb),isAvailable:!0}:null}}let m=l.map(Number),f=H.COLOR_MAP[s],b=f?f.name:`Unknown Color ${s}`;f||console.warn(`Color id ${s} not found in known colors`);let p=!i.querySelector("svg");return{id:s,name:b,rgb:m,isAvailable:p}}for(let i of n){let s=o(i);s&&(s.isAvailable?e.push(s):t.push(s))}return console.log("=== CAPTURED COLORS STATUS ==="),console.log(`Total available colors: ${e.length}`),console.log(`Total unavailable colors: ${t.length}`),console.log(`Total colors scanned: ${e.length+t.length}`),e.length>0&&(console.log(`
--- AVAILABLE COLORS ---`),e.forEach((i,s)=>{console.log(`${s+1}. ID: ${i.id}, Name: "${i.name}", RGB: (${i.rgb[0]}, ${i.rgb[1]}, ${i.rgb[2]})`)})),t.length>0&&(console.log(`
--- UNAVAILABLE COLORS ---`),t.forEach((i,s)=>{console.log(`${s+1}. ID: ${i.id}, Name: "${i.name}", RGB: (${i.rgb[0]}, ${i.rgb[1]}, ${i.rgb[2]}) [LOCKED]`)})),console.log("=== END COLOR STATUS ==="),{availableColors:e,unavailableColors:t}}function $(e,t,n){e&&e.addEventListener(t,n)}var an=new Map,ae=new Map;function ta(e,t,n){let o=w=>(w/=255,w<=.04045?w/12.92:Math.pow((w+.055)/1.055,2.4)),i=o(e),s=o(t),l=o(n),m=i*.4124+s*.3576+l*.1805,f=i*.2126+s*.7152+l*.0722,b=i*.0193+s*.1192+l*.9505;m/=.95047,f/=1,b/=1.08883;let p=w=>w>.008856?Math.cbrt(w):7.787*w+16/116,r=p(m),u=p(f),c=p(b),h=116*u-16,d=500*(r-u),y=200*(u-c);return[h,d,y]}function Ke(e,t,n){let o=e<<16|t<<8|n,i=an.get(o);return i||(i=ta(e,t,n),an.set(o,i)),i}function Ie(e,t,n,o){if((!o||o.length===0)&&(o=Object.values(H.COLOR_MAP).filter(p=>p.rgb).map(p=>[p.rgb.r,p.rgb.g,p.rgb.b])),a.colorMatchingAlgorithm==="legacy"){let p=1/0,r=[0,0,0,255];for(let u=0;u<o.length;u++){let[c,h,d]=o[u],y=(c+e)/2,w=c-e,T=h-t,k=d-n,v=Math.sqrt(((512+y)*w*w>>8)+4*T*T+((767-y)*k*k>>8));v<p&&(p=v,r=[c,h,d,255])}return r}let[i,s,l]=Ke(e,t,n),m=Math.sqrt(s*s+l*l),f=null,b=1/0;for(let p=0;p<o.length;p++){let[r,u,c]=o[p],[h,d,y]=Ke(r,u,c),w=i-h,T=s-d,k=l-y,v=w*w+T*T+k*k;if(a.enableChromaPenalty&&m>20){let x=Math.sqrt(d*d+y*y);if(x<m){let M=m-x;v+=M*M*a.chromaPenaltyWeight}}if(v<b&&(b=v,f=[r,u,c,255],b===0))break}return f||[0,0,0,255]}function ue(e,t,n){let o=a.customWhiteThreshold||D.customWhiteThreshold;return e>=o&&t>=o&&n>=o}function ie(e){let t=a.customTransparencyThreshold||D.customTransparencyThreshold;return e==null&&console.warn(`Expected to get alpha of pixel, but got ${e}`),e<t}function Je(e,t){let n=new Set(e.map(i=>i.rgb.join(","))),o=new Set(t.map(i=>i.rgb.join(",")));if(n.size!==o.size)return!0;for(let i of n)if(!o.has(i))return!0;return!1}function Ze(e={}){if(e.availableColors){ae.clear();return}for(let t of ae.keys()){let[n,o,i,s]=t.split("|");if(e.colorMatchingAlgorithm&&o!==e.colorMatchingAlgorithm){ae.delete(t);continue}if(e.enableChromaPenalty!==void 0&&i!==(e.enableChromaPenalty?"c":"nc")){ae.delete(t);continue}if(e.chromaPenaltyWeight!==void 0&&Number(s)!==e.chromaPenaltyWeight){ae.delete(t);continue}}}function ht(e,t,n=!1){let o=e.slice(0,3);if(!t||t.length===0)return console.warn(`Couldn't resolve color (${e.join(",")}) because availableColors is empty`),{id:null,rgb:o};if(ie(e[3]))return{id:H.COLOR_MAP[0].id,rgb:H.COLOR_MAP[0].rgb};let i=`${o[0]},${o[1]},${o[2]}|${a.colorMatchingAlgorithm}|${a.enableChromaPenalty?"c":"nc"}|${a.chromaPenaltyWeight}|${n?"exact":"closest"}`;if(ae.has(i))return ae.get(i);if(n){let p=t.find(u=>u.rgb[0]===o[0]&&u.rgb[1]===o[1]&&u.rgb[2]===o[2]),r=p?{id:p.id,rgb:[...p.rgb]}:{id:null,rgb:o};return ae.set(i,r),r}let s=a.customWhiteThreshold||D.customWhiteThreshold;if(o[0]>=s&&o[1]>=s&&o[2]>=s){let p=t.find(r=>r.rgb[0]>=s&&r.rgb[1]>=s&&r.rgb[2]>=s);if(p){let r={id:p.id,rgb:[...p.rgb]};return ae.set(i,r),r}}let l=t[0].id,m=[...t[0].rgb],f=1/0;if(a.colorMatchingAlgorithm==="legacy")for(let p=0;p<t.length;p++){let r=t[p],[u,c,h]=r.rgb,d=(u+o[0])/2,y=u-o[0],w=c-o[1],T=h-o[2],k=Math.sqrt(((512+d)*y*y>>8)+4*w*w+((767-d)*T*T>>8));if(k<f&&(f=k,l=r.id,m=[...r.rgb],k===0))break}else{let[p,r,u]=Ke(o[0],o[1],o[2]),c=Math.sqrt(r*r+u*u),h=a.enableChromaPenalty?a.chromaPenaltyWeight||.15:0;for(let d=0;d<t.length;d++){let y=t[d],[w,T,k]=y.rgb,[v,x,M]=Ke(w,T,k),z=p-v,F=r-x,N=u-M,L=z*z+F*F+N*N;if(h>0&&c>20){let O=Math.sqrt(x*x+M*M);if(O<c){let S=c-O;L+=S*S*h}}if(L<f&&(f=L,l=y.id,m=[...y.rgb],L===0))break}}let b={id:l,rgb:m};if(ae.set(i,b),ae.size>15e3){let p=ae.keys().next().value;ae.delete(p)}return b}function Qe({mode:e,directionControls:t,snakeControls:n,blockControls:o}){let i=e==="rows"||e==="columns",s=e==="blocks"||e==="shuffle-blocks";t&&(t.style.display=i?"block":"none"),n&&(n.style.display=i?"block":"none"),o&&(o.style.display=s?"block":"none")}function sn(e){a.coordinateMode=e.target.value,Qe({mode:a.coordinateMode,directionControls:document.getElementById("#directionControls"),snakeControls:document.getElementById("#snakeControls"),blockControls:document.getElementById("#blockControls")}),U(),console.log(`\u{1F504} Coordinate mode changed to: ${a.coordinateMode}`),I(g("coordinateModeSet",{mode:g(`mode${na(a.coordinateMode)}`)}),"success")}function rn(e){a.coordinateDirection=e.target.value,U(),console.log(`\u{1F9ED} Coordinate direction changed to: ${a.coordinateDirection}`),I(g("coordinateDirectionSet",{direction:g(a.coordinateDirection)}),"success")}function ln(e){a.coordinateSnake=e.target.checked,U(),console.log(`\u{1F40D} Snake pattern ${a.coordinateSnake?"enabled":"disabled"}`),I(g(a.coordinateSnake?"snakeEnabled":"snakeDisabled"),"success")}function cn(e){let t=parseInt(e.target.value,10);t>=1&&t<=50&&(a.blockWidth=t,U())}function dn(e){let t=parseInt(e.target.value,10);t>=1&&t<=50&&(a.blockHeight=t,U())}function na(e){return e.charAt(0).toUpperCase()+e.slice(1)}function me(e,t,n){return function(o){let i=o.target.checked;a[e]=i,U(),console.log(`\u{1F3A8} ${e}: ${i?"ON":"OFF"}`);let s=g(i?t:n);I(s,"success")}}function ft(e,t,n=null){let i=n||(s=>`${Math.round(s*100)}%`);return function(s){let l=parseFloat(s.target.value);if(a[e]=l,U(),console.log(`\u{1F39A}\uFE0F ${e}: ${l}`),t){let m=document.querySelector(t);m&&(m.textContent=i(l))}}}var bt=class{constructor(){this.isEnabled=!1,this.startCoords=null,this.imageBitmap=null,this.chunkedTiles=new Map,this.originalTiles=new Map,this.originalTilesData=new Map,this.tileSize=1e3,this.processPromise=null,this.lastProcessedHash=null,this.workerPool=null}toggle(){return this.isEnabled=!this.isEnabled,console.log(`Overlay ${this.isEnabled?"enabled":"disabled"}.`),this.isEnabled}enable(){this.isEnabled=!0}disable(){this.isEnabled=!1}clear(){this.disable(),this.imageBitmap=null,this.chunkedTiles.clear(),this.originalTiles.clear(),this.originalTilesData.clear(),this.lastProcessedHash=null,this.processPromise&&(this.processPromise=null)}async setImage(t){this.imageBitmap=t,this.lastProcessedHash=null,this.imageBitmap&&this.startCoords&&await this.processImageIntoChunks()}async setPosition(t,n){if(!t||!n){this.startCoords=null,this.chunkedTiles.clear(),this.lastProcessedHash=null;return}this.startCoords={region:n,pixel:t},this.lastProcessedHash=null,this.imageBitmap&&await this.processImageIntoChunks()}_generateProcessHash(){if(!this.imageBitmap||!this.startCoords)return null;let{width:t,height:n}=this.imageBitmap,{x:o,y:i}=this.startCoords.pixel,{x:s,y:l}=this.startCoords.region;return`${t}x${n}_${o},${i}_${s},${l}_${a.blueMarbleEnabled}_${a.overlayOpacity}`}async processImageIntoChunks(){if(!this.imageBitmap||!this.startCoords)return;if(this.processPromise)return this.processPromise;let t=this._generateProcessHash();if(this.lastProcessedHash===t&&this.chunkedTiles.size>0){console.log(`\u{1F4E6} Using cached overlay chunks (${this.chunkedTiles.size} tiles)`);return}this.processPromise=this._doProcessImageIntoChunks();try{await this.processPromise,this.lastProcessedHash=t}finally{this.processPromise=null}}async _doProcessImageIntoChunks(){let t=performance.now();this.chunkedTiles.clear();let{width:n,height:o}=this.imageBitmap,{x:i,y:s}=this.startCoords.pixel,{x:l,y:m}=this.startCoords.region,{startTileX:f,startTileY:b,endTileX:p,endTileY:r}=it(l,m,i,s,n,o,this.tileSize),u=(p-f+1)*(r-b+1);console.log(`\u{1F504} Processing ${u} overlay tiles...`);let c=4,h=[];for(let y=b;y<=r;y++)for(let w=f;w<=p;w++)h.push({tx:w,ty:y});for(let y=0;y<h.length;y+=c){let w=h.slice(y,y+c);await Promise.all(w.map(async({tx:T,ty:k})=>{let v=`${T},${k}`,x=await this._processTile(T,k,n,o,i,s,l,m);x&&this.chunkedTiles.set(v,x)})),y+c<h.length&&await V(0)}let d=performance.now()-t;console.log(`\u2705 Overlay processed ${this.chunkedTiles.size} tiles in ${Math.round(d)}ms`)}async _processTile(t,n,o,i,s,l,m,f){let b=`${t},${n}`,p=(t-m)*this.tileSize-s,r=(n-f)*this.tileSize-l,u=Math.max(0,p),c=Math.max(0,r),h=Math.min(o-u,this.tileSize-(u-p)),d=Math.min(i-c,this.tileSize-(c-r));if(h<=0||d<=0)return null;let y=Math.max(0,-p),w=Math.max(0,-r),T=new OffscreenCanvas(this.tileSize,this.tileSize),k=T.getContext("2d");if(k.imageSmoothingEnabled=!1,k.drawImage(this.imageBitmap,u,c,h,d,y,w,h,d),a.blueMarbleEnabled){let v=k.getImageData(y,w,h,d),x=v.data;for(let M=0;M<x.length;M+=4){let z=M/4,F=Math.floor(z/h);(z%h+F)%2===0&&x[M+3]>0&&(x[M+3]=0)}k.putImageData(v,y,w)}return await T.transferToImageBitmap()}async processAndRespondToTileRequest(t){let{endpoint:n,blobID:o,blobData:i}=t,s=i;if(this.isEnabled&&this.chunkedTiles.size>0){let l=n.match(/(\d+)\/(\d+)\.png/);if(l){let m=parseInt(l[1],10),f=parseInt(l[2],10),b=`${m},${f}`,p=this.chunkedTiles.get(b);try{let r=await createImageBitmap(i);this.originalTiles.set(b,r);try{let u,c;typeof OffscreenCanvas<"u"?(u=new OffscreenCanvas(r.width,r.height),c=u.getContext("2d")):(u=document.createElement("canvas"),u.width=r.width,u.height=r.height,c=u.getContext("2d")),c.imageSmoothingEnabled=!1,c.drawImage(r,0,0);let h=c.getImageData(0,0,r.width,r.height);this.originalTilesData.set(b,{w:r.width,h:r.height,data:new Uint8ClampedArray(h.data)})}catch(u){console.warn("OverlayManager: could not cache ImageData for",b,u)}}catch(r){console.warn("OverlayManager: could not create original bitmap for",b,r)}if(p)try{s=await this._compositeTileOptimized(i,p)}catch(r){console.error("Error compositing overlay:",r),s=i}}}window.postMessage({source:"auto-image-overlay",blobID:o,blobData:s},"*")}async getTilePixelColor(t,n,o,i){let s=`${t},${n}`,l=this.originalTilesData.get(s);if(l&&l.data&&l.w>0&&l.h>0){let f=Math.max(0,Math.min(l.w-1,o)),p=(Math.max(0,Math.min(l.h-1,i))*l.w+f)*4,r=l.data,u=r[p],c=r[p+1],h=r[p+2],d=r[p+3];return[u,c,h,d]}let m=3;for(let f=1;f<=m;f++){let b=this.originalTiles.get(s);if(!b){f===m?console.warn("OverlayManager: no bitmap for",s,"after",m,"attempts"):await V(50*f);continue}try{let p,r;typeof OffscreenCanvas<"u"?(p=new OffscreenCanvas(b.width,b.height),r=p.getContext("2d")):(p=document.createElement("canvas"),p.width=b.width,p.height=b.height,r=p.getContext("2d")),r.imageSmoothingEnabled=!1,r.drawImage(b,0,0);let u=Math.max(0,Math.min(b.width-1,o)),c=Math.max(0,Math.min(b.height-1,i)),h=r.getImageData(u,c,1,1).data,d=h[3];return!a.paintTransparentPixels&&ie(d)?(window._overlayDebug&&console.debug("OverlayManager: pixel transparent (fallback)",s,u,c,d),null):[h[0],h[1],h[2],d]}catch(p){console.warn("OverlayManager: failed to read pixel (attempt",f,")",s,p),f<m?await V(50*f):console.error("OverlayManager: failed to read pixel after",m,"attempts",s)}}return null}async _compositeTileOptimized(t,n){let o=await createImageBitmap(t),i=new OffscreenCanvas(o.width,o.height),s=i.getContext("2d");return s.imageSmoothingEnabled=!1,s.drawImage(o,0,0),s.globalAlpha=a.overlayOpacity,s.globalCompositeOperation="source-over",s.drawImage(n,0,0),await i.convertToBlob({type:"image/png",quality:.95})}async waitForTiles(t,n,o,i,s=0,l=0,m=1e4){let{startTileX:f,startTileY:b,endTileX:p,endTileY:r}=it(t,n,s,l,o,i,this.tileSize),u=[];for(let h=b;h<=r;h++)for(let d=f;d<=p;d++)u.push(`${d},${h}`);if(u.length===0)return!0;let c=Date.now();for(;Date.now()-c<m;){if(a.stopFlag)return console.log("waitForTiles: stopped by user"),!1;if(u.filter(d=>!this.originalTiles.has(d)).length===0)return console.log(`\u2705 All ${u.length} required tiles are loaded`),!0;await V(100)}return console.warn(`\u274C Timeout waiting for tiles: ${u.length} required, 
        ${u.filter(h=>this.originalTiles.has(h)).length} loaded`),!1}};async function yt(){if(!a.imageLoaded||!a.imageData||!a.startPosition||!a.region)return!1;try{let e=new ImageData(a.imageData.pixels,a.imageData.width,a.imageData.height),t=new OffscreenCanvas(a.imageData.width,a.imageData.height);t.getContext("2d").putImageData(e,0,0);let o=await t.transferToImageBitmap();await Y.setImage(o),await Y.setPosition(a.startPosition,a.region),Y.enable();let i=document.getElementById("toggleOverlayBtn");return i&&(i.disabled=!1,i.classList.add("active")),console.log("Overlay restored from data"),!0}catch(e){return console.error("Failed to restore overlay from data:",e),!1}}var Y=new bt;function oa(e){let t=H.THEMES[e];if(!t){console.error(`Unknown theme: ${e}`);return}let n=document.documentElement;Array.from(n.classList).forEach(o=>{o.startsWith("wplace-theme-")&&n.classList.remove(o)}),n.classList.add(t.cssClass)}var pn=e=>{if(!H.THEMES[e]){console.warn(`Theme not found: ${e}`);return}e==="neon-retro"&&$e("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"),oa(e)};var gn=me("paintUnavailablePixels","paintUnavailableEnabled","paintUnavailableSkipped"),un=me("paintTransparentPixels","paintTransparentEnabled","paintTransparentSkipped"),mn=me("paintWhitePixels","paintWhiteEnabled","paintWhiteSkipped"),hn=ft("overlayOpacity","#overlayOpacityValue");async function fn(e){a.blueMarbleEnabled=e.target.checked,U(),a.imageLoaded&&Y.imageBitmap&&(I(g("reprocessingOverlay"),"info"),await Y.processImageIntoChunks(),I(g("overlayUpdated"),"success"))}function bn(e){a.tokenSource=e.target.value,U(),console.log(`\u{1F511} Token source changed to: ${a.tokenSource}`),I(g("tokenSourceSet",{source:{generator:"Automatic Generator",hybrid:"Generator + Auto Fallback",manual:"Manual Pixel Placement"}[a.tokenSource]}),"success")}function yn(e){let t=e.target.value;a.batchMode=t,U(),console.log(`\u{1F4E6} Batch mode changed to: ${t}`);let n=document.querySelector("#normalBatchControls"),o=document.querySelector("#randomBatchControls");n&&o&&(t==="random"?(n.style.display="none",o.style.display="block"):(n.style.display="block",o.style.display="none"));let i=t==="random"?g("randomRange"):g("normalFixedSize");I(g("batchModeSet",{mode:i}),"success")}var wn=ft("paintingSpeed","#speedValue",e=>`${e}`),ke=a.randomBatchMin,xe=a.randomBatchMax,et="max";function aa(){let e=document.querySelector("#randomBatchMin"),t=document.querySelector("#randomBatchMax");e&&(e.value=ke),t&&(t.value=xe)}var vn=Dt(()=>{et==="max"&&ke>xe?ke=xe:et==="min"&&xe<ke&&(xe=ke),a.randomBatchMin=ke,a.randomBatchMax=xe,U(),aa()},350);function kn(e){let t=parseInt(e.target.value,10);isNaN(t)||t<1||t>1e3||(ke=t,et="min",vn())}function xn(e){let t=parseInt(e.target.value,10);isNaN(t)||t<1||t>1e3||(xe=t,et="max",vn())}var Sn=me("paintingSpeedLimitEnabled","paintSpeedLimitEnabled","paintSpeedLimitDisabled");function Tn(e){let t=e.target.value;pn(t),a.themeKey=t,U()}async function Cn(e){let t=e.target.value,n=a.languageKey;a.languageKey=t,U(),await Me(t),lt(),console.log(`\u{1F504} Language switched to ${t} (was ${n})`)}function Pn(){let e=document.getElementById("wplace-settings-container");e&&(e.style.animation="settings-fade-out 0.3s ease-out forwards",e.classList.remove("show"),setTimeout(()=>{e.style.animation=""},300))}var Mn=me("notificationsEnabled","notificationsEnabledGlobally","notificationsDisabledGlobally"),In=me("notifyOnChargesReached","notifyOnChargesEnabled","notifyOnChargesDisabled"),Bn=me("notifyOnlyWhenUnfocused","notifyOnlyUnfocusedEnabled","notifyOnlyUnfocusedDisabled");function $n(e){let t=parseInt(e.target.value,10);isNaN(t)||t<1||t>60||(a.notificationIntervalMinutes=t,U(),console.log(`\u23F0 Notification interval set to: ${t} min`),I(g("notificationIntervalUpdated",{minutes:t}),"success"))}async function En(){await ce.requestPermission()==="granted"?I(g("notificationsPermissionGranted"),"success"):I(g("notificationsPermissionDenied"),"warning"),ce.syncFromState()}function zn(){ce.notify(g("testNotificationTitle"),g("testNotificationMessage"),"wplace-notify-test",!0)}function An(){let e=document.getElementById("wplace-settings-container");if(!e)return;let t=e.querySelector("#closeSettingsBtn");$(t,"click",Pn);let n=e.querySelector("#tokenSourceSelect");$(n,"change",bn);let o=e.querySelector("#overlayOpacitySlider"),i=e.querySelector("#enableBlueMarbleToggle");$(o,"input",hn),$(i,"change",fn);let s=e.querySelector("#paintUnavailablePixelsToggle"),l=e.querySelector("#settingsPaintTransparentToggle"),m=e.querySelector("#settingsPaintWhiteToggle");$(s,"change",gn),$(l,"change",un),$(m,"change",mn);let f=e.querySelector("#batchModeSelect");$(f,"change",yn);let b=e.querySelector("#speedSlider");$(b,"input",wn);let p=e.querySelector("#randomBatchMin"),r=e.querySelector("#randomBatchMax");$(p,"input",kn),$(r,"input",xn);let u=e.querySelector("#enableSpeedToggle");$(u,"change",Sn);let c=e.querySelector("#coordinateModeSelect"),h=e.querySelector("#coordinateDirectionSelect"),d=e.querySelector("#coordinateSnakeToggle"),y=e.querySelector("#blockWidthInput"),w=e.querySelector("#blockHeightInput");$(c,"change",sn),$(h,"change",rn),$(d,"change",ln),$(y,"input",cn),$(w,"input",dn);let T=e.querySelector("#notifEnabledToggle"),k=e.querySelector("#notifOnChargesToggle"),v=e.querySelector("#notifOnlyUnfocusedToggle"),x=e.querySelector("#notifIntervalInput"),M=e.querySelector("#notifRequestPermBtn"),z=e.querySelector("#notifTestBtn");$(T,"change",Mn),$(k,"change",In),$(v,"change",Bn),$(x,"input",$n),$(M,"click",En),$(z,"click",zn);let F=e.querySelector("#themeSelect");$(F,"change",Tn);let N=e.querySelector("#languageSelect");$(N,"change",Cn)}function Dn(){let e=document.getElementById("wplace-stats-container"),n=document.getElementById("wplace-image-bot-container")?.querySelector("#statsBtn");if(!e||!n)return;let o=e.querySelector("#closeStatsBtn"),i=e.querySelector("#refreshChargesBtn");$(o,"click",()=>{e.style.display="none",n.innerHTML='<i class="fas fa-chart-bar"></i>',n.title=g("showStats")}),$(i,"click",async()=>{i.innerHTML='<i class="fas fa-spinner fa-spin"></i>',i.disabled=!0;try{await te(!0)}catch(s){console.error("Error refreshing charges:",s)}finally{i.innerHTML='<i class="fas fa-sync"></i>',i.disabled=!1}})}function Be(){let e=document.getElementById("wplace-image-bot-container"),t=e.querySelector("#saveToFileBtn"),n=e.querySelector("#saveBtn"),o=a.imageLoaded&&a.imageData;n.disabled=!o,t.disabled=!o}function Ln(){if(!a.imageLoaded){I(g("missingRequirements"),"error");return}ge()?(E("autoSaved","success"),I(g("autoSaved"),"success")):I(g("errorSavingProgress"),"error")}async function On(){if(!a.initialSetupComplete){I(g("pleaseWaitInitialSetup"),"warning");return}let e=Xe();if(!e){E("noSavedData","warning"),I(g("noSavedData"),"warning");return}if(confirm(`${g("savedDataFound")}

Saved: ${new Date(e.timestamp).toLocaleString()}
Progress: ${e.state.userPaintedPixels}/${e.state.artTotalPixels} pixels`))if(gt(e)){E("dataLoaded","success"),I(g("dataLoaded"),"success"),Be(),await te(),yt().catch(l=>{console.error("Failed to restore overlay from localStorage:",l)});let o=document.getElementById("uploadBtn"),i=document.getElementById("selectPosBtn");a.hasAvailableColors?(o&&(o.disabled=!1),i&&(i.disabled=!1)):o&&(o.disabled=!1);let s=document.getElementById("startBtn");a.imageLoaded&&a.startPosition&&a.region&&a.hasAvailableColors&&s&&(s.disabled=!1)}else I(g("errorLoadingProgress"),"error")}function Fn(){tn()?(E("fileSaved","success"),I(g("fileSaved"),"success")):I(g("fileError"),"error")}async function Nn(){if(!a.initialSetupComplete){I(g("pleaseWaitFileSetup"),"warning");return}try{if(await nn()){E("fileLoaded","success"),I(g("fileLoaded"),"success"),Be(),await te(),await yt().catch(s=>{console.error("Failed to restore overlay from file:",s)});let t=document.getElementById("uploadBtn"),n=document.getElementById("selectPosBtn"),o=document.getElementById("resizeBtn");a.hasAvailableColors?(t&&(t.disabled=!1),n&&(n.disabled=!1),o&&(o.disabled=!1)):t&&(t.disabled=!1);let i=document.getElementById("startBtn");a.imageLoaded&&a.startPosition&&a.region&&a.hasAvailableColors&&i&&(i.disabled=!1)}}catch(e){e.message==="Invalid JSON file"?I(g("invalidFileFormat"),"error"):I(g("fileError"),"error")}}async function Rn(){if(!a.hasAvailableColors){let{availableColors:n}=je(),o=Array.isArray(n)?n.length:0;if(o===0){E("noColorsKnown","error"),I(g("noColorsKnown"),"error");return}else if(o>0&&Je(a.availableColors,n)){let i=a.availableColors.length;I(g("colorsUpdated",{oldCount:i,newCount:o,diffCount:o-i}),"success"),a.availableColors=n,Ze({availableColors:!0})}}await te();let e=document.getElementById("selectPosBtn"),t=document.getElementById("resizeBtn");e&&(e.disabled=!1);try{E("loadingImage","default");let n=await Gt();if(!n){E("colorsFound","success",{count:a.availableColors.length});return}let o=new be(n);await o.load();let{width:i,height:s}=o.getDimensions(),l=o.getPixelData(),m=0;for(let u=0;u<l.length;u+=4){let c=!a.paintTransparentPixels&&ie(l[u+3]),h=!a.paintWhitePixels&&ue(l[u],l[u+1],l[u+2]);!c&&!h&&m++}a.imageData={width:i,height:s,pixels:l,totalPixels:m,processor:o},a.artTotalPixels=m,a.userPaintedPixels=0,a.resizeSettings=null,a.resizeIgnoreMask=null,a.originalImage={dataUrl:n,width:i,height:s},U();let f=await createImageBitmap(o.img);await Y.setImage(f),Y.enable();let b=document.getElementById("toggleOverlayBtn");b&&(b.disabled=!1,b.classList.add("active"),b.setAttribute("aria-pressed","true")),a.hasAvailableColors&&t&&(t.disabled=!1);let p=document.getElementById("saveBtn");p&&(p.disabled=!1);let r=document.getElementById("startBtn");a.startPosition&&r&&(r.disabled=!1),await te(),Be(),E("imageLoaded","success",{count:m})}catch(n){console.error("Image upload error:",n),E("imageError","error")}}function Un(e,t,n=!1){let o=document.querySelectorAll(".wplace-color-swatch");o&&o.forEach(i=>{let s=i.classList.contains("unavailable");(!s||n)&&(s||i.classList.toggle("active",e))}),t()}function ia(e){let t=document.querySelectorAll(".wplace-color-swatch");t&&t.forEach(n=>{let o=parseInt(n.getAttribute("data-color-id"),10);!isNaN(o)&&o>=32&&n.classList.toggle("active",!1)}),e()}function qn(e,t){let n=e.querySelector("#colors-container"),o=e.querySelector("#showAllColorsToggle");if(!n)return;if(!a.availableColors||a.availableColors.length===0){n.innerHTML=`<div class="wplace-colors-placeholder">${g("uploadImageFirst")}</div>`;return}function i(l){let m=[];document.querySelectorAll(".wplace-color-swatch.active").forEach(b=>{let p=b.getAttribute("data-rgb");if(p){let r=p.split(",").map(Number);m.push(r)}}),a.activeColorPalette=m,typeof l=="function"&&l(m)}function s(l=!1){n.innerHTML="";let m=0,f=0;Object.values(H.COLOR_MAP).forEach(p=>{let{id:r,name:u,rgb:c}=p,h=`${c.r},${c.g},${c.b}`;f++;let d=a.availableColors.some(k=>k.rgb[0]===c.r&&k.rgb[1]===c.g&&k.rgb[2]===c.b);if(!l&&!d)return;d&&m++;let y=Ye("div",{className:"wplace-color-item"}),w=Ye("button",{className:`wplace-color-swatch ${d?"":"unavailable"}`,title:`${u} (ID: ${r})${d?"":" (Unavailable)"}`,"data-rgb":h,"data-color-id":r});w.style.backgroundColor=`rgb(${c.r}, ${c.g}, ${c.b})`,d?w.classList.add("active"):(w.style.opacity="0.4",w.style.filter="grayscale(50%)",w.disabled=!0);let T=Ye("span",{className:"wplace-color-item-name",style:d?"":"color: #888; font-style: italic;"},u+(d?"":" (N/A)"));d&&w.addEventListener("click",()=>{w.classList.toggle("active"),i()}),y.appendChild(w),y.appendChild(T),n.appendChild(y)}),i()}s(!1),o&&o.addEventListener("change",l=>{s(l.target.checked)}),e.querySelector("#selectAllBtn")?.addEventListener("click",()=>Un(!0,i,o?.checked)),e.querySelector("#unselectAllBtn")?.addEventListener("click",()=>Un(!1,i,o?.checked)),e.querySelector("#unselectPaidBtn")?.addEventListener("click",()=>ia(i))}function _n(){let e=null,t=null;return{ensure:n=>((!e||e.length!==n*3)&&(e=new Float32Array(n*3)),(!t||t.length!==n)&&(t=new Uint8Array(n)),{work:e,eligible:t}),reset:()=>{e=null,t=null}}}async function Wn({input:e,state:t,mask:n,findClosestPaletteColor:o,isTransparentPixel:i,isWhitePixel:s,ensureBuffers:l,asyncProgress:m}){let f=e.width,b=e.height,p=f*b,{work:r,eligible:u}=l(p),c=e.data,h=0;for(let y=0;y<b;y++){for(let w=0;w<f;w++){let T=y*f+w,k=T*4,v=c[k],x=c[k+1],M=c[k+2],z=c[k+3],N=!(n&&n[T])&&(t.paintTransparentPixels||!i(z))&&(t.paintWhitePixels||!s(v,x,M));u[T]=N?1:0,r[T*3]=v,r[T*3+1]=x,r[T*3+2]=M,N||(c[k+3]=0)}m&&(y&15)===0&&await Promise.resolve()}let d=(y,w,T,k,v,x)=>{if(y<0||y>=f||w<0||w>=b)return;let M=w*f+y;if(!u[M])return;let z=M*3;r[z]=Math.min(255,Math.max(0,r[z]+T*x)),r[z+1]=Math.min(255,Math.max(0,r[z+1]+k*x)),r[z+2]=Math.min(255,Math.max(0,r[z+2]+v*x))};for(let y=0;y<b;y++){for(let w=0;w<f;w++){let T=y*f+w;if(!u[T])continue;let k=T*3,v=r[k],x=r[k+1],M=r[k+2],[z,F,N]=o(v,x,M,t.activeColorPalette),L=T*4;c[L]=z,c[L+1]=F,c[L+2]=N,c[L+3]=255,h++;let O=v-z,S=x-F,C=M-N;d(w+1,y,O,S,C,7/16),d(w-1,y+1,O,S,C,3/16),d(w,y+1,O,S,C,5/16),d(w+1,y+1,O,S,C,1/16)}m&&await Promise.resolve()}return{pixelsProcessed:h}}function Hn(e){return Wn({...e,input:e.imageData,asyncProgress:!1})}async function Vn(e){return Wn({...e,input:{data:e.data,width:e.width,height:e.height},asyncProgress:!0})}function Gn({panStage:e,canvasStack:t,baseCanvas:n,maskCanvas:o,zoomSlider:i,zoomValue:s,zoomInBtn:l,zoomOutBtn:m,zoomFitBtn:f,zoomActualBtn:b,panModeBtn:p}){let r=1,u=0,c=0,h=0,d=!1,y=0,w=0,T=0,k=0,v=!1,x=!1,M=null,z=0,F=null,N=()=>{if(!e)return;let P=e.getBoundingClientRect(),R=(n.width||1)*r,X=(n.height||1)*r;if(R<=P.width)u=Math.floor((P.width-R)/2);else{let ee=P.width-R;u=Math.min(0,Math.max(ee,u))}if(X<=P.height)c=Math.floor((P.height-X)/2);else{let ee=P.height-X;c=Math.min(0,Math.max(ee,c))}},L=()=>{h||(h=requestAnimationFrame(()=>{N(),t.style.transform=`translate3d(${Math.round(u)}px, ${Math.round(c)}px, 0) scale(${r})`,h=0}))},O=()=>{let P=n.width||1,R=n.height||1;n.style.width=`${P}px`,n.style.height=`${R}px`,o.style.width=`${P}px`,o.style.height=`${R}px`,t.style.width=`${P}px`,t.style.height=`${R}px`,L()},S=P=>{r=Math.max(.05,Math.min(20,P||1)),i&&(i.value=r),O(),s&&(s.textContent=`${Math.round(r*100)}%`)},C=()=>{if(!e)return 1;let P=e.getBoundingClientRect(),R=n.width||1,X=n.height||1,ee=10,de=(P.width-ee)/R,ye=(P.height-ee)/X;return Math.max(.05,Math.min(20,Math.min(de,ye)))},A=()=>{if(!e)return;let P=e.getBoundingClientRect(),R=(n.width||1)*r,X=(n.height||1)*r;u=Math.floor((P.width-R)/2),c=Math.floor((P.height-X)/2),L()},B=P=>{e&&(e.style.cursor=P)},q=()=>{p&&(p.classList.toggle("active",x),p.setAttribute("aria-pressed",x))},ne=()=>{i&&S(parseFloat(i.value))},_=P=>()=>{S(parseFloat(i?.value||1)+P)},W=()=>{S(C()),A()},j=()=>{S(1),A()},Q=()=>{x=!x,q(),B(x?"grab":"")},K=P=>{P.code==="Space"&&(v=!0,B("grab"))},Z=P=>{P.code==="Space"&&(v=!1,d||B(""))},he=P=>{!(P.button===1||P.button===2)&&!v&&!x||(P.preventDefault(),d=!0,y=P.clientX,w=P.clientY,T=u,k=c,B("grabbing"))},Pe=P=>{d&&(u=T+(P.clientX-y),c=k+(P.clientY-w),L())},Bo=()=>{d&&(d=!1,B(x||v?"grab":""))},$o=P=>{if(!P.ctrlKey&&!P.metaKey)return;P.preventDefault();let R=e.getBoundingClientRect(),X=P.clientX-R.left-u,ee=P.clientY-R.top-c,de=Math.abs(P.deltaY)>20?.2:.1,ye=Math.max(.05,Math.min(20,r+(P.deltaY>0?-de:de)));if(ye===r)return;let Re=ye/r;u=u-X*(Re-1),c=c-ee*(Re-1),S(ye)},Eo=P=>{if(P.touches.length===1){let R=P.touches[0];d=!0,y=R.clientX,w=R.clientY,T=u,k=c,B("grabbing");let X=Date.now();if(X-z<300){clearTimeout(F);let ee=Math.abs(r-1)<.01?C():1;S(ee),A()}else z=X,F=setTimeout(()=>{F=null},320)}else if(P.touches.length===2){let[R,X]=P.touches;M=Math.hypot(X.clientX-R.clientX,X.clientY-R.clientY)}},zo=P=>{if(P.touches.length===1&&d){let R=P.touches[0];u=T+(R.clientX-y),c=k+(R.clientY-w),L()}else if(P.touches.length===2&&M!==null){P.preventDefault();let[R,X]=P.touches,ee=Math.hypot(X.clientX-R.clientX,X.clientY-R.clientY),de=e.getBoundingClientRect(),ye=(R.clientX+X.clientX)/2-de.left-u,Re=(R.clientY+X.clientY)/2-de.top-c,Ue=Math.max(.05,Math.min(20,r*(ee/M)));Ue!==r&&(u=u-ye*(Ue/r-1),c=c-Re*(Ue/r-1),S(Ue)),M=ee}},Ao=()=>{d=!1,M=null,B(x||v?"grab":"")},Do=()=>{let P=(R,X,ee,de)=>R?.addEventListener(X,ee,de);P(i,"input",ne),P(l,"click",_(.1)),P(m,"click",_(-.1)),P(f,"click",W),P(b,"click",j),P(p,"click",Q),P(e,"contextmenu",R=>v&&R.preventDefault()),window.addEventListener("keydown",K),window.addEventListener("keyup",Z),P(e,"mousedown",he),window.addEventListener("mousemove",Pe),window.addEventListener("mouseup",Bo),P(e,"wheel",$o,{passive:!1}),P(e,"touchstart",Eo,{passive:!0}),P(e,"touchmove",zo,{passive:!1}),P(e,"touchend",Ao)},Lo=()=>{h&&(cancelAnimationFrame(h),h=0)};return Do(),q(),{applyZoom:S,computeFitZoom:C,centerInView:A,updateZoomLayout:O,get zoomLevel(){return r},isPanInteractionActive(){return x||v},destroy:Lo}}function Xn({maskCtx:e,baseCanvas:t,maskCanvas:n,state:o}){let i=null,s=null,l=null,m=()=>{l={minX:1/0,minY:1/0,maxX:-1,maxY:-1}},f=(d,y)=>{l||m(),l.minX=Math.min(l.minX,d),l.minY=Math.min(l.minY,y),l.maxX=Math.max(l.maxX,d),l.maxY=Math.max(l.maxY,y)},b=()=>{if(!l||l.maxX<l.minX||l.maxY<l.minY)return;let d=Math.max(0,l.minX),y=Math.max(0,l.minY),w=Math.min(n.width-d,l.maxX-d+1),T=Math.min(n.height-y,l.maxY-y+1);w>0&&T>0&&e.putImageData(i,0,0,d,y,w,T),m()},p=(d,y,w=!1)=>{if((!i||i.width!==d||i.height!==y)&&(i=e.createImageData(d,y),s=i.data,w=!0),w){let k=o.resizeIgnoreMask;if(s.fill(0),k){for(let v=0;v<k.length;v++)if(k[v]){let x=v*4;s[x]=255,s[x+1]=0,s[x+2]=0,s[x+3]=150}}e.putImageData(i,0,0),m()}},r=(d,y)=>{let w=d*y;(!o.resizeIgnoreMask||o.resizeIgnoreMask.length!==w)&&(o.resizeIgnoreMask=new Uint8Array(w))};return{ensureOverlayBuffers:p,ensureMaskSize:(d,y)=>{r(d,y),t.width=d,t.height=y,n.width=d,n.height=y,e.clearRect(0,0,d,y),p(d,y,!0)},resetDirty:m,markDirty:f,flushDirty:b,rebuildFromStateMask:()=>{i&&p(n.width,n.height,!0)},getMaskData:()=>s,getMaskImageData:()=>i,destroy:()=>{i=null,s=null,l=null}}}function Yn({widthSlider:e,heightSlider:t,keepAspect:n,baseWidth:o,baseHeight:i,state:s,saveBotSettings:l,updatePreview:m,applyZoom:f,computeFitZoom:b}){let p=!1,r=null,u=()=>{if(n.checked){let k=Math.round(parseInt(e.value,10)/(o/i));t.value=k}m()},c=()=>{if(n.checked){let k=Math.round(parseInt(t.value,10)*(o/i));e.value=k}m()},h=()=>{let k=parseInt(e.value,10),v=parseInt(t.value,10);s.resizeSettings={baseWidth:o,baseHeight:i,width:k,height:v};let x=typeof b=="function"?b():1;!isNaN(x)&&isFinite(x)&&f(x)},d=()=>{r&&clearTimeout(r),r=null,l()},y=()=>{p=!0,r&&clearTimeout(r)},w=()=>{p=!1,h(),d()};return{bind:()=>{let k=(x,M,z)=>x?.addEventListener(M,z),v=(x,M,z)=>x?.removeEventListener(M,z);return k(e,"pointerdown",y),k(t,"pointerdown",y),k(e,"pointerup",w),k(t,"pointerup",w),k(e,"input",u),k(t,"input",c),()=>{v(e,"pointerdown",y),v(t,"pointerdown",y),v(e,"pointerup",w),v(t,"pointerup",w),v(e,"input",u),v(t,"input",c)}},get isDraggingSize(){return p}}}function jn({resizeContainer:e,baseCanvas:t,maskCanvas:n,state:o,saveBotSettings:i,maskOverlay:s,mapClientToPixel:l}){let m=!1,f=1,b=1,p="ignore",r={brush:e.querySelector("#maskBrushSize"),brushVal:e.querySelector("#maskBrushSizeValue"),rowColSize:e.querySelector("#rowColSize"),rowColSizeVal:e.querySelector("#rowColSizeValue"),ignore:e.querySelector("#maskModeIgnore"),unignore:e.querySelector("#maskModeUnignore"),toggle:e.querySelector("#maskModeToggle"),clear:e.querySelector("#clearIgnoredBtn"),invert:e.querySelector("#invertMaskBtn")},u=()=>{let S=[[r.ignore,"ignore"],[r.unignore,"unignore"],[r.toggle,"toggle"]];for(let[C,A]of S){if(!C)continue;let B=p===A;C.classList.toggle("active",B),C.setAttribute("aria-pressed",B?"true":"false")}},c=(S,C)=>{let A=S*C;(!o.resizeIgnoreMask||o.resizeIgnoreMask.length!==A)&&(o.resizeIgnoreMask=new Uint8Array(A))},h=(S,C,A)=>{let B=t.width,q=t.height;c(B,q);let ne=A*A,_=s.getMaskData();for(let W=C-A;W<=C+A;W++)if(!(W<0||W>=q))for(let j=S-A;j<=S+A;j++){if(j<0||j>=B)continue;let Q=j-S,K=W-C;if(Q*Q+K*K>ne)continue;let Z=W*B+j,he=0;if(p==="toggle"?he=o.resizeIgnoreMask[Z]?0:1:p==="ignore"?he=1:p==="unignore"&&(he=0),o.resizeIgnoreMask[Z]=he,_){let Pe=Z*4;_[Pe]=he?255:0,_[Pe+1]=0,_[Pe+2]=0,_[Pe+3]=he?150:0,s.markDirty(j,W)}}},d=S=>{let C=t.width,A=t.height;if(c(C,A),S<0||S>=A)return;let B=Math.floor(b/2),q=Math.max(0,S-B),ne=Math.min(A-1,S+B),_=s.getMaskData();for(let W=q;W<=ne;W++){for(let j=0;j<C;j++){let Q=W*C+j,K=0;if(p==="toggle"?K=o.resizeIgnoreMask[Q]?0:1:p==="ignore"?K=1:p==="unignore"&&(K=0),o.resizeIgnoreMask[Q]=K,_){let Z=Q*4;_[Z]=K?255:0,_[Z+1]=0,_[Z+2]=0,_[Z+3]=K?150:0}}_&&(s.markDirty(0,W),s.markDirty(C-1,W))}},y=S=>{let C=t.width,A=t.height;if(c(C,A),S<0||S>=C)return;let B=Math.floor(b/2),q=Math.max(0,S-B),ne=Math.min(C-1,S+B),_=s.getMaskData();for(let W=q;W<=ne;W++){for(let j=0;j<A;j++){let Q=j*C+W,K=0;if(p==="toggle"?K=o.resizeIgnoreMask[Q]?0:1:p==="ignore"?K=1:p==="unignore"&&(K=0),o.resizeIgnoreMask[Q]=K,_){let Z=Q*4;_[Z]=K?255:0,_[Z+1]=0,_[Z+2]=0,_[Z+3]=K?150:0}}_&&(s.markDirty(W,0),s.markDirty(W,A-1))}},w=()=>s.flushDirty(),T=()=>{f=parseInt(r.brush.value,10)||1,r.brushVal.textContent=f},k=()=>{b=parseInt(r.rowColSize.value,10)||1,r.rowColSizeVal.textContent=b},v=S=>{p=S,u()},x=S=>{if(S.buttons&2||S.buttons&4)return;let{x:C,y:A}=l(S.clientX,S.clientY),B=t.width,q=t.height;if(!(C<0||A<0||C>=B||A>=q)){if(S.shiftKey)d(A);else if(S.altKey)y(C);else{let ne=Math.max(1,Math.floor(f/2));h(C,A,ne)}w()}},M=S=>{S.button===0&&(m=!0,x(S))},z=S=>{m&&x(S)},F=()=>{m&&(m=!1,i())},N=()=>{let S=t.width,C=t.height;c(S,C),o.resizeIgnoreMask.fill(0),s.ensureOverlayBuffers(S,C,!0),w(),i()},L=()=>{let S=o.resizeIgnoreMask;if(!S)return;for(let B=0;B<S.length;B++)S[B]=S[B]?0:1;let C=t.width,A=t.height;s.ensureOverlayBuffers(C,A,!0),w(),i()};return{bind:()=>{let S=(C,A,B)=>C?.addEventListener(A,B);return S(r.brush,"input",T),S(r.rowColSize,"input",k),S(r.ignore,"click",()=>v("ignore")),S(r.unignore,"click",()=>v("unignore")),S(r.toggle,"click",()=>v("toggle")),S(n,"mousedown",M),S(window,"mousemove",z),S(window,"mouseup",F),S(r.clear,"click",N),S(r.invert,"click",L),r.brush&&r.brushVal&&(f=parseInt(r.brush.value,10)||1,r.brushVal.textContent=f),r.rowColSize&&r.rowColSizeVal&&(b=parseInt(r.rowColSize.value,10)||1,r.rowColSizeVal.textContent=b),u(),()=>{let C=(A,B,q)=>A?.removeEventListener(B,q);C(r.brush,"input",T),C(r.rowColSize,"input",k),C(r.ignore,"click",()=>v("ignore")),C(r.unignore,"click",()=>v("unignore")),C(r.toggle,"click",()=>v("toggle")),C(n,"mousedown",M),C(window,"mousemove",z),C(window,"mouseup",F),C(r.clear,"click",N),C(r.invert,"click",L)}}}}function Kn({baseProcessor:e,processor:t,state:n,baseCtx:o,maskCtx:i,baseCanvas:s,maskCanvas:l,canvasStack:m,widthSlider:f,heightSlider:b,widthValue:p,heightValue:r,ensureMaskSize:u,applyFloydSteinbergPreview:c,findClosestPaletteColor:h,isTransparentPixel:d,isWhitePixel:y,ensureDitherBuffers:w,updateZoomLayout:T,maskOverlay:k,isDraggingSize:v}){let x=null,M=0;async function z(){let L=++M,O=parseInt(f.value,10),S=parseInt(b.value,10);if(p.textContent=O,r.textContent=S,u(O,S),m.style.width=`${O}px`,m.style.height=`${S}px`,o.imageSmoothingEnabled=!1,!n.availableColors?.length){e!==t&&(!e.img||!e.canvas)&&await e.load(),o.clearRect(0,0,O,S),o.drawImage(e.img,0,0,O,S),i.clearRect(0,0,l.width,l.height);let B=k.getMaskImageData();B&&i.putImageData(B,0,0),T();return}e!==t&&(!e.img||!e.canvas)&&await e.load(),o.clearRect(0,0,O,S),o.drawImage(e.img,0,0,O,S);let C=o.getImageData(0,0,O,S);if(n.ditheringEnabled&&!v)c({imageData:C,state:n,findClosestPaletteColor:h,isTransparentPixel:d,isWhitePixel:y,ensureDitherBuffers:w});else{let{data:B}=C;for(let q=0;q<B.length;q+=4){let ne=B[q],_=B[q+1],W=B[q+2],j=B[q+3];if(!n.paintTransparentPixels&&d(j)||!n.paintWhitePixels&&y(ne,_,W))B[q+3]=0;else{let[Q,K,Z]=h(ne,_,W,n.activeColorPalette);B[q]=Q,B[q+1]=K,B[q+2]=Z,B[q+3]=255}}}if(L!==M)return;o.putImageData(C,0,0),i.clearRect(0,0,l.width,l.height);let A=k.getMaskImageData();A&&i.putImageData(A,0,0),T()}function F(){x&&clearTimeout(x);let L=()=>{x=null,z()};window.requestIdleCallback?x=setTimeout(()=>requestIdleCallback(L,{timeout:150}),50):x=setTimeout(()=>requestAnimationFrame(L),50)}function N(){x&&(clearTimeout(x),x=null)}return{updateResizePreview:z,schedulePreview:F,destroy:N}}var Ne,Bt,Se,Te,wt,vt,Zn,kt,xt,Fe,tt,St,Tt,Qn,eo,to,no,Ct,se,Ce,oo,Pt,ao,io,so,sa,Mt,It=null,ra=(e,t)=>{Ne=e,Bt=t,Se=e.querySelector("#widthSlider"),Te=e.querySelector("#heightSlider"),wt=e.querySelector("#widthValue"),vt=e.querySelector("#heightValue"),Zn=e.querySelector("#keepAspect"),kt=e.querySelector("#paintWhiteToggle"),xt=e.querySelector("#paintTransparentToggle"),Fe=e.querySelector("#zoomSlider"),tt=e.querySelector("#zoomValue"),St=e.querySelector("#zoomInBtn"),Tt=e.querySelector("#zoomOutBtn"),Qn=e.querySelector("#zoomFitBtn"),eo=e.querySelector("#zoomActualBtn"),to=e.querySelector("#panModeBtn"),no=e.querySelector("#resizePanStage"),Ct=e.querySelector("#resizeCanvasStack"),se=e.querySelector("#resizeCanvas"),Ce=e.querySelector("#maskCanvas"),oo=se.getContext("2d",{alpha:!0}),Pt=Ce.getContext("2d",{alpha:!0}),ao=e.querySelector("#confirmResize"),io=e.querySelector("#cancelResize"),so=e.querySelector("#downloadPreviewBtn"),sa=e.querySelector("#clearIgnoredBtn"),Mt=e.querySelector("#toggleOverlayBtn")};function ro(e,t,n){ra(t,n);let o=e,i,s;if(a.originalImage?.dataUrl)o=new be(a.originalImage.dataUrl),i=a.originalImage.width,s=a.originalImage.height;else{let v=e.getDimensions();i=v.width,s=v.height}let l=a.resizeSettings,m=10,f=i*2;Se.min=Te.min=m,Se.max=Te.max=f;let b=Math.max(m,Math.min(l?.width??i,f)),p=Math.max(m,Math.min(l?.height??s,f));Se.value=b,Te.value=p,wt.textContent=b,vt.textContent=p,Fe.value=1,tt&&(tt.textContent="100%"),kt.checked=a.paintWhitePixels,xt.checked=a.paintTransparentPixels;let r=_n(),u=Xn({maskCtx:Pt,baseCanvas:se,maskCanvas:Ce,state:a}),c=Kn({baseProcessor:o,processor:e,state:a,baseCtx:oo,maskCtx:Pt,baseCanvas:se,maskCanvas:Ce,canvasStack:Ct,widthSlider:Se,heightSlider:Te,widthValue:wt,heightValue:vt,ensureMaskSize:(v,x)=>u.ensureMaskSize(v,x),applyFloydSteinbergPreview:Hn,findClosestPaletteColor:Ie,isTransparentPixel:ie,isWhitePixel:ue,ensureDitherBuffers:v=>r.ensure(v),updateZoomLayout:()=>h.updateZoomLayout(),maskOverlay:u,isDraggingSize:()=>d.isDraggingSize}),h=Gn({panStage:no,canvasStack:Ct,baseCanvas:se,maskCanvas:Ce,zoomSlider:Fe,zoomValue:tt,zoomInBtn:St,zoomOutBtn:Tt,zoomFitBtn:Qn,zoomActualBtn:eo,panModeBtn:to}),d=Yn({widthSlider:Se,heightSlider:Te,keepAspect:Zn,baseWidth:i,baseHeight:s,state:a,saveBotSettings:U,updatePreview:()=>{c.updateResizePreview(),c.schedulePreview()},applyZoom:v=>h.applyZoom(v),computeFitZoom:()=>h.computeFitZoom()}),w=jn({resizeContainer:Ne,baseCanvas:se,maskCanvas:Ce,state:a,saveBotSettings:U,maskOverlay:u,mapClientToPixel:(v,x)=>{let M=se.getBoundingClientRect(),z=M.width/se.width,F=M.height/se.height;return{x:Math.floor((v-M.left)/z),y:Math.floor((x-M.top)/F)}}}),T=d.bind(),k=w.bind();kt.onchange=v=>{a.paintWhitePixels=v.target.checked,c.updateResizePreview(),U()},xt.onchange=v=>{a.paintTransparentPixels=v.target.checked,c.updateResizePreview(),U()},ao.onclick=async()=>{let v=parseInt(Se.value,10),x=parseInt(Te.value,10),M=document.createElement("canvas"),z=M.getContext("2d");M.width=v,M.height=x,z.imageSmoothingEnabled=!1,o!==e&&(!o.img||!o.canvas)&&await o.load(),z.drawImage(o.img,0,0,v,x);let F=z.getImageData(0,0,v,x),N=F.data,L=a.resizeIgnoreMask?.length===v*x?a.resizeIgnoreMask:null,O=0;if(a.ditheringEnabled)O=await Vn({data:N,width:v,height:x,state:a,mask:L,findClosestPaletteColor:Ie,isTransparentPixel:ie,isWhitePixel:ue,ensureDitherBuffers:C=>r.ensure(C)});else for(let C=0;C<N.length;C+=4){let A=N[C],B=N[C+1],q=N[C+2],ne=N[C+3],_=L&&L[C>>2];if(!a.paintTransparentPixels&&ie(ne)||_||!a.paintWhitePixels&&ue(A,B,q)){N[C+3]=0;continue}O++;let[W,j,Q]=Ie(A,B,q,a.activeColorPalette);N[C]=W,N[C+1]=j,N[C+2]=Q,N[C+3]=255}z.putImageData(F,0,0),a.imageData={pixels:new Uint8ClampedArray(F.data),width:v,height:x,totalPixels:O},a.artTotalPixels=O,a.userPaintedPixels=0,a.resizeSettings={baseWidth:i,baseHeight:s,width:v,height:x},U();let S=await createImageBitmap(M);await Y.setImage(S),Y.enable(),Mt.classList.add("active"),Mt.setAttribute("aria-pressed","true"),te(),E("resizeSuccess","success",{width:v,height:x}),Jn()},so.onclick=()=>{try{let v=document.createElement("canvas");v.width=se.width,v.height=se.height;let x=v.getContext("2d");x.imageSmoothingEnabled=!1,x.drawImage(se,0,0),x.drawImage(Ce,0,0);let M=document.createElement("a");M.download="wplace-preview.png",M.href=v.toDataURL(),M.click()}catch(v){console.warn("Failed to download preview:",v)}},io.onclick=Jn,Bt.style.display="block",Ne.style.display="block",qn(Ne,()=>{c.updateResizePreview()}),c.updateResizePreview(),setTimeout(()=>{let v=h.computeFitZoom();isFinite(v)&&(h.applyZoom(v),h.centerInView())},0),It=()=>{try{Fe.replaceWith(Fe.cloneNode(!0)),[St,Tt].forEach(v=>{v?.replaceWith(v.cloneNode(!0))})}catch{}T?.(),k?.(),c.destroy(),h.destroy(),u.destroy(),r.reset()}}function Jn(){It?.(),Bt.style.display="none",Ne.style.display="none",It=null}function lo(e){if(e?.preventDefault(),a.imageLoaded&&a.imageData.processor&&a.hasAvailableColors){let t=document.querySelector(".resize-container"),n=document.querySelector(".resize-overlay");ro(a.imageData.processor,t,n)}else a.hasAvailableColors||I(g("uploadImageFirstColors"),"warning")}function co(){a.stopFlag=!0,a.running=!1;let e=document.getElementById("stopBtn");e&&(e.disabled=!0),E("paintingStoppedByUser","warning"),a.imageLoaded&&a.userPaintedPixels>0&&(ge(),I(g("autoSaved"),"success"))}function po(){let e=Y.toggle(),t=document.getElementById("toggleOverlayBtn");t&&(t.classList.toggle("active",e),t.setAttribute("aria-pressed",e?"true":"false")),I(e?g("overlayEnabled"):g("overlayDisabled"),"info")}function go(e){let t=parseInt(e.target.value,10);a.cooldownChargeThreshold=t;let n=document.getElementById("cooldownValue");n&&(n.textContent=t.toString()),U(),ce.resetEdgeTracking()}function uo(){if(a.selectingPosition)return;a.selectingPosition=!0,a.startPosition=null,a.region=null;let e=document.getElementById("startBtn");e&&(e.disabled=!0),I(g("selectPositionAlert"),"info"),E("waitingPosition","default");let t=async(o,i)=>{if(typeof o=="string"&&o.includes("https://backend.wplace.live/s0/pixel/")&&i?.method?.toUpperCase()==="POST")try{let s=await n(o,i);if((await s.clone().json())?.painted===1){let f=o.match(/\/pixel\/(\d+)\/(\d+)/);f&&f.length>=3&&(a.region={x:Number.parseInt(f[1]),y:Number.parseInt(f[2])});let b=JSON.parse(i.body);if(b?.coords&&Array.isArray(b.coords)){if(a.startPosition={x:b.coords[0],y:b.coords[1]},await Y.setPosition(a.startPosition,a.region),a.imageLoaded){let p=document.getElementById("startBtn");p&&(p.disabled=!1)}window.fetch=n,a.selectingPosition=!1,E("positionSet","success")}}return s}catch(s){return console.error("Fetch hook error:",s),n(o,i)}return n(o,i)},n=window.fetch;window.fetch=t,setTimeout(()=>{a.selectingPosition&&(window.fetch=n,a.selectingPosition=!1,E("positionTimeout","error"),I(g("positionTimeout"),"error"))},12e4)}async function nt(){let e=performance.now();if(a.tokenSource==="manual")return console.log("\u{1F3AF} Manual token source selected - using pixel placement automation"),await Ve();try{let{sitekey:t,token:n}=await We();if(!t)throw new Error("No valid sitekey found");console.log("\u{1F511} Generating Turnstile token for sitekey:",t),console.log("\u{1F9ED} UA:",navigator.userAgent.substring(0,50)+"...","Platform:",navigator.platform),window.turnstile||await Le();let o=null;if(n&&typeof n=="string"&&n.length>20?(console.log("\u267B\uFE0F Reusing pre-generated token from sitekey detection phase"),o=n):pe()?(console.log("\u267B\uFE0F Using existing cached token (from previous operation)"),o=le()):(console.log("\u{1F510} No valid pre-generated or cached token, creating new one..."),o=await Oe(t,"paint"),o&&J(o)),console.log(`\u{1F50D} Token received - Type: ${typeof o}, Value: ${o?typeof o=="string"?o.length>50?o.substring(0,50)+"...":o:JSON.stringify(o):"null/undefined"}, Length: ${o?.length||0}`),typeof o=="string"&&o.length>20){let i=Math.round(performance.now()-e);return console.log(`\u2705 Turnstile token generated successfully in ${i}ms`),o}else throw new Error(`Invalid or empty token received - Type: ${typeof o}, Value: ${JSON.stringify(o)}, Length: ${o?.length||0}`)}catch(t){let n=Math.round(performance.now()-e);if(console.error(`\u274C Turnstile token generation failed after ${n}ms:`,t),a.tokenSource==="hybrid")return console.log("\u{1F504} Hybrid mode: Generator failed, automatically switching to manual pixel placement..."),await Ve();throw t}}async function $t(e,t,n){try{let o=await import("/_app/immutable/chunks/BBb1ALhY.js"),i;try{i=await o._(),console.log("\u2705 WASM initialized successfully")}catch(c){return console.error("\u274C WASM initialization failed:",c),null}try{try{let c=await fetch("https://backend.wplace.live/me",{credentials:"include"}).then(h=>h.ok?h.json():null);c?.id&&(o.i(c.id),console.log("\u2705 user ID set:",c.id))}catch{}}catch(c){console.log("\u26A0\uFE0F Error setting user ID:",c.message)}try{let c=`https://backend.wplace.live/s0/pixel/${e}/${t}`;o.r?(o.r(c),console.log("\u2705 Request URL set:",c)):console.log("\u26A0\uFE0F request_url function (mod.r) not available")}catch(c){console.log("\u26A0\uFE0F Error setting request URL:",c.message)}console.log("\u{1F4DD} payload:",n);let s=new TextEncoder,l=new TextDecoder,m=JSON.stringify(n),f=s.encode(m);console.log("\u{1F4CF} Payload size:",f.length,"bytes"),console.log("\u{1F4C4} Payload string:",m);let b;try{if(!i.__wbindgen_malloc)return console.error("\u274C __wbindgen_malloc function not found"),null;b=i.__wbindgen_malloc(f.length,1),console.log("\u2705 WASM memory allocated, pointer:",b),new Uint8Array(i.memory.buffer,b,f.length).set(f),console.log("\u2705 Data copied to WASM memory")}catch(c){return console.error("\u274C Memory allocation error:",c),null}console.log("\u{1F680} Calling get_pawtected_endpoint_payload...");let p,r,u;try{let c=i.get_pawtected_endpoint_payload(b,f.length);if(console.log("\u2705 Function called, result type:",typeof c,c),Array.isArray(c)&&c.length===2){[p,r]=c,console.log("\u2705 Got output pointer:",p,"length:",r);let h=new Uint8Array(i.memory.buffer,p,r);u=l.decode(h),console.log("\u2705 Token decoded successfully")}else return console.error("\u274C Unexpected function result format:",c),null}catch(c){return console.error("\u274C Function call error:",c),console.error("Stack trace:",c.stack),null}try{i.__wbindgen_free&&p&&r&&(i.__wbindgen_free(p,r,1),console.log("\u2705 Output memory freed")),i.__wbindgen_free&&b&&(i.__wbindgen_free(b,f.length,1),console.log("\u2705 Input memory freed"))}catch(c){console.log("\u26A0\uFE0F Cleanup warning:",c.message)}return console.log(""),console.log("\u{1F389} SUCCESS!"),console.log("\u{1F4CA} Results:"),console.log("   Input coords: [1245984, 1088]"),console.log("   Token length:",u?.length||0),console.log("   Token preview:",u?.substring(0,50)+"..."),console.log(""),console.log("\u{1F511} Full token:"),console.log(u),u}catch(o){return console.error("\u274C Failed to generate fp parameter:",o),null}}async function mo(e,t,n,o=10){let i=0;for(;i<o&&!a.stopFlag;){i++,console.log(`\u{1F504} Attempting to send batch (attempt ${i}/${o}) for region ${t},${n} with ${e.length} pixels`);let s=await la(e,t,n);if(s===!0)return console.log(`\u2705 Batch succeeded on attempt ${i}`),!0;if(s==="token_error"){console.log(`\u{1F511} Token error on attempt ${i}, regenerating...`),E("captchaSolving","warning");try{await nt(),i--;continue}catch(l){console.error(`\u274C Token regeneration failed on attempt ${i}:`,l),E("captchaFailed","error"),await V(5e3)}}else{console.warn(`\u26A0\uFE0F Batch failed on attempt ${i}, retrying...`);let l=Math.min(1e3*Math.pow(2,i-1),3e4),m=Math.random()*1e3;await V(l+m)}}return i>=o&&(console.error(`\u274C Batch failed after ${o} attempts. This will stop painting to prevent infinite loops.`),E("paintingError","error")),!1}async function la(e,t,n){let o=le();if(!o)try{console.log("\u{1F511} Generating Turnstile token for pixel batch..."),o=await nt(),J(o)}catch(l){return console.error("\u274C Failed to generate Turnstile token:",l),"token_error"}let i=new Array(e.length*2),s=new Array(e.length);for(let l=0;l<e.length;l++){let m=e[l];i[l*2]=m.x,i[l*2+1]=m.y,s[l]=m.color}try{let l={coords:i,colors:s,t:o,fp:at(10)},m=await $t(t,n,l),f=await fetch(`https://backend.wplace.live/s0/pixel/${t}/${n}`,{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8","x-pawtect-token":m},credentials:"include",body:JSON.stringify(l)});if(f.status===403){let p=null;try{p=await f.json()}catch{}console.error("\u274C 403 Forbidden. Turnstile token might be invalid or expired.");try{console.log("\u{1F504} Regenerating Turnstile token after 403..."),o=await nt(),J(o);let r={coords:i,colors:s,t:o,fp:at(10)},u=await $t(t,n,r),c=await fetch(`https://backend.wplace.live/s0/pixel/${t}/${n}`,{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8","x-pawtect-token":u},credentials:"include",body:JSON.stringify(r)});return c.status===403?(J(null),"token_error"):(await c.json())?.painted===e.length}catch(r){return console.error("\u274C Token regeneration failed:",r),J(null),"token_error"}}return(await f.json())?.painted===e.length}catch(l){return console.error("Batch paint request failed:",l),!1}}function ca(){let e=Date.now(),t=a.userPaintedPixels-a._lastSavePixelCount,n=e-a._lastSaveTime;return!a._saveInProgress&&t>=25&&n>=3e4}function ho(){if(!ca())return!1;a._saveInProgress=!0;let e=ge();return e&&(a._lastSavePixelCount=a.userPaintedPixels,a._lastSaveTime=Date.now(),console.log(`\u{1F4BE} Auto-saved at ${a.userPaintedPixels} pixels`)),a._saveInProgress=!1,e}function fo(e,t,n,o,i,s,l){let m=[];console.log(`Generating coordinates with 
  mode:`,n,`
  direction:`,o,`
  snake:`,i,`
  blockWidth:`,s,`
  blockHeight:`,l);let f,b,p,r,u,c;switch(o){case"top-left":f=0,b=e,p=1,r=0,u=t,c=1;break;case"top-right":f=e-1,b=-1,p=-1,r=0,u=t,c=1;break;case"bottom-left":f=0,b=e,p=1,r=t-1,u=-1,c=-1;break;case"bottom-right":f=e-1,b=-1,p=-1,r=t-1,u=-1,c=-1;break;default:throw new Error(`Unknown direction: ${o}`)}if(n==="rows")for(let h=r;h!==u;h+=c)if(i&&(h-r)%2!==0)for(let d=b-p;d!==f-p;d-=p)m.push([d,h]);else for(let d=f;d!==b;d+=p)m.push([d,h]);else if(n==="columns")for(let h=f;h!==b;h+=p)if(i&&(h-f)%2!==0)for(let d=u-c;d!==r-c;d-=c)m.push([h,d]);else for(let d=r;d!==u;d+=c)m.push([h,d]);else if(n==="circle-out"){let h=Math.floor(e/2),d=Math.floor(t/2),y=Math.ceil(Math.sqrt(h*h+d*d));for(let w=0;w<=y;w++)for(let T=d-w;T<=d+w;T++)for(let k=h-w;k<=h+w;k++)k>=0&&k<e&&T>=0&&T<t&&Math.max(Math.abs(k-h),Math.abs(T-d))===w&&m.push([k,T])}else if(n==="circle-in"){let h=Math.floor(e/2),d=Math.floor(t/2),y=Math.ceil(Math.sqrt(h*h+d*d));for(let w=y;w>=0;w--)for(let T=d-w;T<=d+w;T++)for(let k=h-w;k<=h+w;k++)k>=0&&k<e&&T>=0&&T<t&&Math.max(Math.abs(k-h),Math.abs(T-d))===w&&m.push([k,T])}else if(n==="blocks"||n==="shuffle-blocks"){let h=[];for(let d=0;d<t;d+=l)for(let y=0;y<e;y+=s){let w=[];for(let T=d;T<Math.min(d+l,t);T++)for(let k=y;k<Math.min(y+s,e);k++)w.push([k,T]);h.push(w)}if(n==="shuffle-blocks")for(let d=h.length-1;d>0;d--){let y=Math.floor(Math.random()*(d+1));[h[d],h[y]]=[h[y],h[d]]}for(let d of h)m.push(...d)}else throw new Error(`Unknown mode: ${n}`);return m}async function Et(e){if(!e||e.pixels.length===0)return!0;let t=e.pixels.length;console.log(`\u{1F4E6} Sending batch with ${t} pixels (region: ${e.regionX},${e.regionY})`);let n=await mo(e.pixels,e.regionX,e.regionY);if(n){if(a.userPaintedPixels+=t,a.fullChargeData={...a.fullChargeData,spentSinceShot:a.fullChargeData.spentSinceShot+t},await te(),E("paintingProgress","default",{painted:a.userPaintedPixels,total:a.artTotalPixels}),ho(),a.paintingSpeedLimitEnabled&&a.paintingSpeed>0&&t>0){let o=1e3/a.paintingSpeed,i=Math.max(100,o*t);await V(i)}}else console.error(`\u274C Batch for ${e.regionX}, ${e.regionY} with ${e.pixels.length} pixels
         failed permanently after retries. Stopping painting.`),a.stopFlag=!0,E("paintingBatchFailed","error");return e.pixels=[],n}async function bo(){let{width:e,height:t,pixels:n}=a.imageData,{x:o,y:i}=a.startPosition,{x:s,y:l}=a.region;if(!await Y.waitForTiles(s,l,e,t,o,i,1e4)){E("overlayTilesNotLoaded","error"),a.stopFlag=!0;return}let f=new Map,b={transparent:0,white:0,alreadyPainted:0,colorUnavailable:0};function p(u,c){let h=(c*e+u)*4,d=n[h],y=n[h+1],w=n[h+2],T=n[h+3];if(!a.paintTransparentPixels&&ie(T))return{eligible:!1,reason:"transparent"};if(!a.paintWhitePixels&&ue(d,y,w))return{eligible:!1,reason:"white"};let k;if(ue(d,y,w))k=H.COLOR_MAP[5];else if(ie(T))k=H.COLOR_MAP[0];else if(k=ht(Ie(d,y,w,a.activeColorPalette),a.availableColors,!a.paintUnavailablePixels),!a.paintUnavailablePixels&&!k.id)return{eligible:!1,reason:"colorUnavailable",r:d,g:y,b:w,a:T,mappedColorId:k.id};return{eligible:!0,r:d,g:y,b:w,a:T,mappedColorId:k.id}}function r(u,c,h,d,y){u!=="transparent"&&console.log(`Skipped pixel for ${u} (id: ${c}, (${h.join(", ")})) at (${d}, ${y})`),b[u]++}try{let u=fo(e,t,a.coordinateMode,a.coordinateDirection,a.coordinateSnake,a.blockWidth,a.blockHeight);e:for(let[c,h]of u){if(a.stopFlag){for(let[L,O]of f.entries())O.pixels.length>0&&(console.log("\u{1F3AF} Sending last batch before user-stop"),await Et(O));break e}let d=p(c,h),y=o+c,w=i+h,T=Math.floor(y/1e3),k=Math.floor(w/1e3),v=y%1e3,x=w%1e3,M=d.mappedColorId;if(!d.eligible){r(d.reason,M,[d.r,d.g,d.b],v,x);continue}let z=`${s+T},${l+k}`;f.has(z)||f.set(z,{regionX:s+T,regionY:l+k,pixels:[]});let F=f.get(z);try{let L=[F.regionX,F.regionY],O=await Y.getTilePixelColor(L[0],L[1],v,x);if(O&&Array.isArray(O)){let S=ht(O,a.availableColors),C=S.id===M;if(C){r("alreadyPainted",M,[d.r,d.g,d.b],v,x);continue}console.debug(`[COMPARE] Pixel at \u{1F4CD} (${v}, ${x}) in region (${s+T}, ${l+k})
  \u251C\u2500\u2500 Current color: rgb(${O.join(", ")}) (id: ${S.id})
  \u251C\u2500\u2500 Target color:  rgb(${d.r}, ${d.g}, ${d.b}, ${d.a}) (id: ${M})
  \u2514\u2500\u2500 Status: ${C?"\u2705 Already painted \u2192 SKIP":"\u{1F534} Needs paint \u2192 PAINT"}
`)}}catch(L){console.error(`[DEBUG] Error checking existing pixel at (${v}, ${x}):`,L),E("paintingPixelCheckFailed","error",{x:v,y:x}),a.stopFlag=!0;break e}F.pixels.push({x:v,y:x,color:M,localX:c,localY:h});let N=da();if(F.pixels.length>=N){if(!await Et(F))break e;F.pixels=[]}if(a.displayCharges<a.cooldownChargeThreshold&&!a.stopFlag&&await Lt(()=>a.displayCharges>=a.cooldownChargeThreshold?(ce.maybeNotifyChargesReached(!0),0):a.stopFlag?0:ve(a.preciseCurrentCharges,a.cooldownChargeThreshold,a.cooldown)),a.stopFlag)break e}for(let[c,h]of f.entries())h.pixels.length>0&&!a.stopFlag&&(console.log("\u{1F3C1} Sending final batch"),await Et(h)||console.warn(`\u26A0\uFE0F Final batch for ${c} failed with ${h.pixels.length} pixels.`))}finally{window._chargesInterval&&clearInterval(window._chargesInterval),window._chargesInterval=null}if(a.stopFlag)ge();else{E("paintingComplete","success",{count:a.userPaintedPixels}),ge(),Y.clear();let u=document.getElementById("toggleOverlayBtn");u&&(u.classList.remove("active"),u.disabled=!0)}console.log("\u{1F4CA} Pixel Statistics:"),console.log(`   Painted: ${a.userPaintedPixels}`),console.log(`   Skipped - Transparent: ${b.transparent}`),console.log(`   Skipped - White (disabled): ${b.white}`),console.log(`   Skipped - Already painted: ${b.alreadyPainted}`),console.log(`   Skipped - Color Unavailable: ${b.colorUnavailable}`),console.log(`   Total processed: ${a.userPaintedPixels+b.transparent+b.white+b.alreadyPainted+b.colorUnavailable}`),te()}function da(){let e;if(a.batchMode==="random"){let o=Math.max(1,a.randomBatchMin),i=Math.max(o,a.randomBatchMax);e=Math.floor(Math.random()*(i-o+1))+o,console.log(`\u{1F3B2} Random batch size generated: ${e} (range: ${o}-${i})`)}else e=a.paintingSpeed;let t=a.displayCharges;return Math.min(e,t)}async function yo(){if(!a.imageLoaded||!a.startPosition||!a.region){E("missingRequirements","error");return}if(await He(),!le())return;a.running=!0,a.stopFlag=!1;let e=document.getElementById("startBtn"),t=document.getElementById("stopBtn"),n=document.getElementById("uploadBtn"),o=document.getElementById("selectPosBtn"),i=document.getElementById("resizeBtn"),s=document.getElementById("saveBtn"),l=document.getElementById("toggleOverlayBtn");e&&(e.disabled=!0),t&&(t.disabled=!1),n&&(n.disabled=!0),o&&(o.disabled=!0),i&&(i.disabled=!0),s&&(s.disabled=!0),l&&(l.disabled=!0),E("startPaintingMsg","success");try{await bo()}catch(m){console.error("Unexpected error:",m),E("paintingError","error")}finally{a.running=!1,t&&(t.disabled=!0),s&&(s.disabled=!1),a.stopFlag?e&&(e.disabled=!1):(e&&(e.disabled=!0),n&&(n.disabled=!1),o&&(o.disabled=!1),i&&(i.disabled=!1)),l&&(l.disabled=!1)}}function wo(){let e=document.getElementById("wplace-settings-container");if(!e)return;e.classList.contains("show")?(e.style.animation="settings-fade-out 0.3s ease-out forwards",e.classList.remove("show"),setTimeout(()=>{e.style.animation=""},300)):(e.classList.add("show"),e.style.animation="settings-slide-in 0.4s ease-out")}function vo(){let e=document.getElementById("wplace-stats-container"),t=document.getElementById("statsBtn");if(!e||!t)return;e.style.display!=="none"?(e.style.display="none",t.innerHTML='<i class="fas fa-chart-bar"></i>',t.title=g("showStats")):(e.style.display="block",t.innerHTML='<i class="fas fa-chart-line"></i>',t.title=g("hideStats"))}function ko(){a.minimized=!a.minimized;let e=document.getElementById("wplace-image-bot-container"),t=e?.querySelector(".wplace-content"),n=document.getElementById("minimizeBtn");a.minimized?(e.classList.add("wplace-minimized"),t.classList.add("wplace-hidden"),n&&(n.innerHTML='<i class="fas fa-expand"></i>',n.title=g("restore"))):(e.classList.remove("wplace-minimized"),t.classList.remove("wplace-hidden"),n&&(n.innerHTML='<i class="fas fa-minus"></i>',n.title=g("minimize"))),U()}function xo(){let e=document.getElementById("wplace-image-bot-container"),t=document.getElementById("compactBtn");e.classList.toggle("wplace-compact"),e.classList.contains("wplace-compact")?t&&(t.innerHTML='<i class="fas fa-expand"></i>',t.title=g("expandMode")):t&&(t.innerHTML='<i class="fas fa-compress"></i>',t.title=g("compactMode"))}function So(){let e=document.getElementById("wplace-image-bot-container");if(!e)return;let t=e.querySelector("#settingsBtn"),n=e.querySelector("#statsBtn"),o=e.querySelector("#minimizeBtn"),i=e.querySelector("#compactBtn"),s=e.querySelector("#uploadBtn"),l=e.querySelector("#resizeBtn"),m=e.querySelector("#selectPosBtn"),f=e.querySelector("#startBtn"),b=e.querySelector("#stopBtn"),p=e.querySelector("#toggleOverlayBtn"),r=e.querySelector("#cooldownSlider"),u=e.querySelector("#saveBtn"),c=e.querySelector("#loadBtn"),h=e.querySelector("#saveToFileBtn"),d=e.querySelector("#loadFromFileBtn");e.querySelectorAll(".wplace-section-title").forEach(y=>{if(!y.querySelector("i.arrow")){let w=document.createElement("i");w.className="fas fa-chevron-down arrow",y.appendChild(w)}$(y,"click",()=>{y.parentElement.classList.toggle("collapsed")})}),$(s,"click",Rn),$(l,"click",lo),$(m,"click",uo),$(f,"click",yo),$(b,"click",co),$(p,"click",po),$(r,"input",go),$(u,"click",Ln),$(c,"click",On),$(h,"click",Fn),$(d,"click",Nn),$(t,"click",wo),$(n,"click",vo),$(o,"click",ko),$(i,"click",xo)}var pa=[{key:"coordinateMode",selector:"#coordinateModeSelect",prop:"value"},{key:"coordinateDirection",selector:"#coordinateDirectionSelect",prop:"value"},{key:"coordinateSnake",selector:"#coordinateSnakeToggle",prop:"checked"},{key:"paintUnavailablePixels",selector:"#paintUnavailablePixelsToggle",prop:"checked"},{key:"paintWhitePixels",selector:"#settingsPaintWhiteToggle",prop:"checked"},{key:"paintTransparentPixels",selector:"#settingsPaintTransparentToggle",prop:"checked"},{key:"paintingSpeed",selector:"#speedSlider",prop:"value"},{key:"paintingSpeedLimitEnabled",selector:"#enableSpeedToggle",prop:"checked"},{key:"batchMode",selector:"#batchModeSelect",prop:"value"},{key:"randomBatchMin",selector:"#randomBatchMin",prop:"value"},{key:"randomBatchMax",selector:"#randomBatchMax",prop:"value"},{key:"overlayOpacity",selector:"#overlayOpacitySlider",prop:"value"},{key:"blueMarbleEnabled",selector:"#enableBlueMarbleToggle",prop:"checked"},{key:"tokenSource",selector:"#tokenSourceSelect",prop:"value"},{key:"colorMatchingAlgorithm",selector:"#colorAlgorithmSelect",prop:"value"},{key:"enableChromaPenalty",selector:"#enableChromaPenaltyToggle",prop:"checked"},{key:"chromaPenaltyWeight",selector:"#chromaPenaltyWeightSlider",prop:"value"},{key:"customTransparencyThreshold",selector:"#transparencyThresholdInput",prop:"value"},{key:"customWhiteThreshold",selector:"#whiteThresholdInput",prop:"value"},{key:"notificationsEnabled",selector:"#notifEnabledToggle",prop:"checked"},{key:"notifyOnChargesReached",selector:"#notifOnChargesToggle",prop:"checked"},{key:"notifyOnlyWhenUnfocused",selector:"#notifOnlyUnfocusedToggle",prop:"checked"},{key:"notificationIntervalMinutes",selector:"#notifIntervalInput",prop:"value"},{key:"themeKey",selector:"#themeSelect",prop:"value"},{key:"languageKey",selector:"#languageSelect",prop:"value"}],ga=[{keys:["paintingSpeed"],update:e=>{let t=document.getElementById("speedValue");t&&(t.textContent=`${e.paintingSpeed}`)}},{keys:["overlayOpacity"],update:e=>{let t=document.getElementById("overlayOpacityValue");t&&(t.textContent=`${Math.round(e.overlayOpacity*100)}%`)}},{keys:["chromaPenaltyWeight"],update:e=>{let t=document.getElementById("chromaWeightValue");t&&(t.textContent=e.chromaPenaltyWeight)}},{keys:["batchMode"],update:e=>{let t=document.getElementById("normalBatchControls"),n=document.getElementById("randomBatchControls");t&&n&&(e.batchMode==="random"?(t.style.display="none",n.style.display="block"):(t.style.display="block",n.style.display="none"))}},{keys:["coordinateMode"],update:e=>{let t=document.getElementById("wplace-settings-container");t&&Qe({mode:e.coordinateMode,directionControls:t.querySelector("#directionControls"),snakeControls:t.querySelector("#snakeControls"),blockControls:t.querySelector("#blockControls")})}}];function To(){for(let e of pa){let t=document.querySelector(e.selector);t&&Object.prototype.hasOwnProperty.call(a,e.key)&&(t[e.prop]=a[e.key])}for(let e of ga)e.keys.some(t=>Object.prototype.hasOwnProperty.call(a,t))&&e.update(a)}function ua(){["wplace-image-bot-container","wplace-settings-container","wplace-stats-container"].forEach(t=>{document.getElementById(t)?.remove()}),document.querySelector(".resize-container")?.remove(),document.querySelector(".resize-overlay")?.remove()}async function ma(){await Rt(),$e("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"),$e("https://skalsech.github.io/WPlace-AutoBOT/custom-main/dist/css/main.css",{"data-wplace-theme":"true"})}function zt(e){let t=0,n=0,o=0,i=0,s=!1,l=e.querySelector(".wplace-header")||e.querySelector(".wplace-settings-header");if(!l){console.warn("No draggable header found for element:",e);return}l.onmousedown=m;function m(p){if(p.target.closest(".wplace-header-btn")||p.target.closest("button"))return;p.preventDefault(),s=!0;let r=e.getBoundingClientRect();e.style.transform="none",e.style.top=r.top+"px",e.style.left=r.left+"px",o=p.clientX,i=p.clientY,e.classList.add("wplace-dragging"),document.onmouseup=b,document.onmousemove=f,document.body.style.userSelect="none"}function f(p){if(!s)return;p.preventDefault(),t=o-p.clientX,n=i-p.clientY,o=p.clientX,i=p.clientY;let r=e.offsetTop-n,u=e.offsetLeft-t,c=e.getBoundingClientRect(),h=window.innerHeight-c.height,d=window.innerWidth-c.width;r=Math.max(0,Math.min(r,h)),u=Math.max(0,Math.min(u,d)),e.style.top=r+"px",e.style.left=u+"px"}function b(){s=!1,e.classList.remove("wplace-dragging"),document.onmouseup=null,document.onmousemove=null,document.body.style.userSelect=""}}function E(e,t="default",n={},o=!1){let i=g(e,n),l=document.getElementById("wplace-image-bot-container").querySelector("#statusText");l.textContent=i,l.className=`wplace-status status-${t}`,o||(l.style.animation="none",l.offsetWidth,l.style.animation="slide-in 0.3s ease-out")}function ha(e=null){let n=document.getElementById("wplace-stats-container")?.querySelector("#statsArea"),o=document.getElementById("wplace-charge-stats");return o||(o=document.createElement("div"),o.id="wplace-charge-stats",o.innerHTML=`
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-bolt"></i> ${g("charges")}</div>
        <div class="wplace-stat-value" id="wplace-stat-charges-value">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-battery-half"></i> ${g("fullChargeIn")}</div>
        <div class="wplace-stat-value" id="wplace-stat-fullcharge-value">--:--:--</div>
      </div>
    `,e&&e.parentNode===n?n.insertBefore(o,e.nextSibling):n.appendChild(o)),o}function fa(e=null){let n=document.getElementById("wplace-stats-container")?.querySelector("#statsArea"),o=document.getElementById("wplace-image-stats");return o||(o=document.createElement("div"),o.id="wplace-image-stats",o.innerHTML=`
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-image"></i> ${g("progress")}</div>
        <div class="wplace-stat-value" id="wplace-stat-progress">--%</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-paint-brush"></i> ${g("pixels")}</div>
        <div class="wplace-stat-value" id="wplace-stat-pixels">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-clock"></i> ${g("estimatedTime")}</div>
        <div class="wplace-stat-value" id="wplace-stat-estimated">--:--</div>
      </div>
    `,e&&e.parentNode===n?n.insertBefore(o,e.nextSibling):n.appendChild(o)),o}function ba(e=null){let n=document.getElementById("wplace-stats-container")?.querySelector("#statsArea"),o=document.getElementById("wplace-colors-section");return o||(o=document.createElement("div"),o.id="wplace-colors-section",o.className="wplace-colors-section",o.innerHTML=`
      <div class="wplace-stat-label" id="wplace-stat-colors-label"></div>
      <div class="wplace-stat-colors-grid" id="wplace-stat-colors-grid"></div>
    `,e&&e.parentNode===n?n.insertBefore(o,e.nextSibling):n.appendChild(o)),o}function Co(e){let t=document.getElementById("wplace-stat-charges-value"),n=document.getElementById("wplace-stat-fullcharge-value");if(!n&&!t)return;if(!a.fullChargeData){n.textContent="--:--:--";return}let{current:o,max:i,cooldownMs:s,startTime:l,spentSinceShot:m}=a.fullChargeData,b=(Date.now()-l)/s,p=o+b-m,r=Math.min(p,i),u;r-Math.floor(r)>=.95?u=Math.ceil(r):u=Math.floor(r),a.displayCharges=Math.max(0,u),a.preciseCurrentCharges=r;let h=ve(r,i,a.cooldown,e),d=qe(h);if(t){let y=`${a.displayCharges} / ${a.maxCharges}`;t.textContent!==y&&(t.textContent=y)}if(a.displayCharges<a.cooldownChargeThreshold&&!a.stopFlag&&a.running&&on(e),n){let y;a.displayCharges>=i?y='<span style="color:#10b981;">FULL</span>':y=`<span style="color:#f59e0b;">${d}</span>`,n.innerHTML!==y&&(n.innerHTML=y)}if(a.imageLoaded){let y=document.getElementById("wplace-stat-estimated");if(!y)return;a.estimatedTime=mt();let w=ut(a.estimatedTime);y.textContent!==w&&(y.textContent=w)}}function ya(){if(!a.imageLoaded)return;let t=document.getElementById("wplace-image-bot-container").querySelector("#progressBar"),n=a.artTotalPixels>0?Math.round(a.userPaintedPixels/a.artTotalPixels*100):0;a.estimatedTime=mt(),t.style.width=`${n}%`,document.getElementById("wplace-stat-progress").textContent=`${n}%`,document.getElementById("wplace-stat-pixels").textContent=`${a.userPaintedPixels}/${a.artTotalPixels}`,document.getElementById("wplace-stat-estimated").textContent=ut(a.estimatedTime)}function wa(){if(!a.hasAvailableColors)return;let e=document.getElementById("wplace-stat-colors-label"),t=document.getElementById("wplace-stat-colors-grid");!e||!t||(e.innerHTML=`<i class="fas fa-palette"></i> ${g("availableColors",{count:a.availableColors.length})}`,t.innerHTML=a.availableColors.map(n=>{let o=`rgb(${n.rgb.join(",")})`;return`<div class="wplace-stat-color-swatch" style="${n.id===0?"background: repeating-linear-gradient(45deg, #ccc 0 2px, #fff 2px 4px);background-size: cover;":`background-color: ${o};`}" title="${g("colorTooltip",{name:n.name,id:n.id,rgb:n.rgb.join(", ")})}"></div>`}).join(""))}async function te(e=!1){let t=!a.fullChargeData?.startTime,n=6e4,i=n+Math.random()*(9e4-n),l=Date.now()-(a.fullChargeData?.startTime||0)>=i;if(e||t||l){let{charges:h,max:d,cooldown:y}=await Ge.getCharges();a.displayCharges=Math.floor(h),a.preciseCurrentCharges=h,a.cooldown=y,a.maxCharges=Math.floor(d)>1?Math.floor(d):a.maxCharges,a.fullChargeData={current:h,max:d,cooldownMs:y,startTime:Date.now(),spentSinceShot:0},ce.maybeNotifyChargesReached()}a.fullChargeInterval&&(clearInterval(a.fullChargeInterval),a.fullChargeInterval=null);let f=1e3;a.fullChargeInterval=setInterval(()=>Co(f),f);let p=document.getElementById("wplace-image-bot-container").querySelector("#cooldownSlider");p.max!==a.maxCharges&&(p.max=a.maxCharges);let{availableColors:r}=je(),u=Array.isArray(r)?r.length:0;if(u===0&&e)I(g("noColorsFound"),"warning");else if(u>0&&Je(a.availableColors,r)){let h=a.availableColors.length;I(g("colorsUpdated",{oldCount:h,newCount:u,diffCount:u-h}),"success"),a.availableColors=r,Ze({availableColors:!0})}let c=document.getElementById("wplace-init-msg");a.imageLoaded&&(c=fa(c)),a.fullChargeData&&(c=ha(c)),a.hasAvailableColors&&(c=ba(c)),ya(),Co(f),wa(),Wt()}var va=()=>{let e=Xe();if(e&&e.state.userPaintedPixels>0){let t=new Date(e.timestamp).toLocaleString(),n=Math.round(e.state.userPaintedPixels/e.state.artTotalPixels*100);I(`${g("savedDataFound")}

Saved: ${t}
Progress: ${e.state.userPaintedPixels}/${e.state.artTotalPixels} pixels (${n}%)
${g("clickLoadToContinue")}`,"info")}};async function Po(){ua(),Nt(),await ma();let e=qt(),t=_t(),n=Ut(),o=Ht(),i=document.createElement("div");i.className="resize-overlay",document.body.append(e,i,o,t,n),So(),Dn(),An(),zt(e),zt(t),zt(n),Be(),setTimeout(va,1e3),To(),ce.syncFromState(),e.style.display="block"}function ot(){a.initialSetupComplete=!0;let e=document.querySelector("#loadBtn"),t=document.querySelector("#loadFromFileBtn"),n=document.querySelector("#uploadBtn");e&&(e.disabled=!1,e.title="",e.style.animation="pulse 0.6s ease-in-out",setTimeout(()=>{e&&(e.style.animation="")},600)),t&&(t.disabled=!1,t.title="",t.style.animation="pulse 0.6s ease-in-out",setTimeout(()=>{t&&(t.style.animation="")},600)),n&&(n.disabled=!1,n.title="",n.style.animation="pulse 0.6s ease-in-out",setTimeout(()=>{n&&(n.style.animation="")},600)),I(g("fileOperationsAvailable"),"success"),console.log("\u2705 File operations (Load/Upload) are now available!")}async function Mo(){if(pe()){console.log("\u2705 Valid token already available, skipping initialization"),E("tokenReady","success"),ot();return}try{console.log("\u{1F527} Initializing Turnstile token generator..."),E("initializingToken","default"),console.log("Attempting to load Turnstile script..."),await Le(),console.log("Turnstile script loaded. Attempting to generate token...");let e=await dt();e?(J(e),console.log("\u2705 Startup token generated successfully"),E("tokenReady","success"),I(g("tokenGeneratorReady"),"success"),ot()):(console.warn("\u26A0\uFE0F Startup token generation failed (no token received), will retry when needed"),E("tokenRetryLater","warning"),ot())}catch(e){console.error("\u274C Critical error during Turnstile initialization:",e),E("tokenRetryLater","warning"),ot()}}function Io(){let t=`(${(()=>{let s=new Map;window.addEventListener("message",m=>{let{source:f,blobID:b,blobData:p}=m.data;if(f==="auto-image-overlay"&&b&&p){let r=s.get(b);typeof r=="function"&&r(p),s.delete(b)}});let l=window.fetch;window.fetch=async function(...m){let f=await l.apply(this,m),b=m[0]instanceof Request?m[0].url:m[0];if(typeof b=="string"){if(b.includes("https://backend.wplace.live/s0/pixel/"))try{let r=JSON.parse(m[1].body);r.t&&(console.log(`\u{1F50D}\u2705 Turnstile Token Captured - Type: ${typeof r.t}, Value: ${r.t?typeof r.t=="string"?r.t.length>50?r.t.substring(0,50)+"...":r.t:JSON.stringify(r.t):"null/undefined"}, Length: ${r.t?.length||0}`),window.postMessage({source:"turnstile-capture",token:r.t},"*"))}catch{}if((f.headers.get("content-type")||"").includes("image/png")&&b.includes(".png")){let r=f.clone();return new Promise(async u=>{let c=crypto.randomUUID(),h=await r.blob();s.set(c,d=>{u(new Response(d,{headers:r.headers,status:r.status,statusText:r.statusText}))}),window.postMessage({source:"auto-image-tile",endpoint:b,blobID:c,blobData:h},"*")})}}return f}}).toString()})()`,n=new Blob([t],{type:"application/javascript"}),o=URL.createObjectURL(n),i=document.createElement("script");i.src=o,i.async=!0,i.onload=()=>{URL.revokeObjectURL(o),i.remove()},i.onerror=()=>{URL.revokeObjectURL(o),console.error("[WPlace-AutoBOT] Failed to inject fetch interceptor via blob")},(document.head||document.documentElement).appendChild(i)}window.addEventListener("message",e=>{let{source:t,endpoint:n,blobID:o,blobData:i,token:s}=e.data;t==="auto-image-tile"&&n&&o&&i&&Y.processAndRespondToTileRequest(e.data),t==="turnstile-capture"&&s&&(J(s),document.querySelector("#statusText")?.textContent.includes("CAPTCHA")&&(I(g("tokenCapturedSuccess"),"success"),E("colorsFound","success",{count:a.availableColors.length})))});Io();Po().then(()=>{setTimeout(Mo,1e3),te(),window.addEventListener("beforeunload",Vt)});})();
