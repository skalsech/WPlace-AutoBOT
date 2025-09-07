// ==UserScript==
// @name         WPlace AutoBOT
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Автоматизация и улучшения для W-Place
// @author       Ты
// @match        https://w-place.com/*
// @match        https://*.w-place.com/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @connect      cdn.jsdelivr.net
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @resource     THEME-CSS https://cdn.jsdelivr.net/gh/yourname/wplace-auto-bot@main/dist/css/theme.css
// @resource     I18N-EN    https://cdn.jsdelivr.net/gh/yourname/wplace-auto-bot@main/dist/i18n/en.json
// @resource     I18N-RU    https://cdn.jsdelivr.net/gh/yourname/wplace-auto-bot@main/dist/i18n/ru.json
// ==/UserScript==

(()=>{var gn=Object.create;var Aa=Object.defineProperty;var un=Object.getOwnPropertyDescriptor;var pn=Object.getOwnPropertyNames;var hn=Object.getPrototypeOf,mn=Object.prototype.hasOwnProperty;var fn=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(a,o)=>(typeof require<"u"?require:a)[o]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var bn=(t,a,o,n)=>{if(a&&typeof a=="object"||typeof a=="function")for(let i of pn(a))!mn.call(t,i)&&i!==o&&Aa(t,i,{get:()=>a[i],enumerable:!(n=un(a,i))||n.enumerable});return t};var wn=(t,a,o)=>(o=t!=null?gn(hn(t)):{},bn(a||!t||!t.__esModule?Aa(o,"default",{value:t,enumerable:!0}):o,t));var T={COOLDOWN_DEFAULT:31e3,TRANSPARENCY_THRESHOLD:100,WHITE_THRESHOLD:250,LOG_INTERVAL:10,PAINTING_SPEED:{MIN:1,MAX:1e3,DEFAULT:5},BATCH_MODE:"normal",RANDOM_BATCH_RANGE:{MIN:3,MAX:20},PAINTING_SPEED_ENABLED:!0,AUTO_CAPTCHA_ENABLED:!0,TOKEN_SOURCE:"generator",COOLDOWN_CHARGE_THRESHOLD:1,NOTIFICATIONS:{ENABLED:!1,ON_CHARGES_REACHED:!0,ONLY_WHEN_UNFOCUSED:!0,REPEAT_MINUTES:5},OVERLAY:{OPACITY_DEFAULT:.2,BLUE_MARBLE_DEFAULT:!1,ditheringEnabled:!1},COLOR_MAP:{0:{id:0,name:"Transparent",rgb:{r:222,g:250,b:206}},1:{id:1,name:"Black",rgb:{r:0,g:0,b:0}},2:{id:2,name:"Dark Gray",rgb:{r:60,g:60,b:60}},3:{id:3,name:"Gray",rgb:{r:120,g:120,b:120}},4:{id:4,name:"Light Gray",rgb:{r:210,g:210,b:210}},5:{id:5,name:"White",rgb:{r:255,g:255,b:255}},6:{id:6,name:"Deep Red",rgb:{r:96,g:0,b:24}},7:{id:7,name:"Red",rgb:{r:237,g:28,b:36}},8:{id:8,name:"Orange",rgb:{r:255,g:127,b:39}},9:{id:9,name:"Gold",rgb:{r:246,g:170,b:9}},10:{id:10,name:"Yellow",rgb:{r:249,g:221,b:59}},11:{id:11,name:"Light Yellow",rgb:{r:255,g:250,b:188}},12:{id:12,name:"Dark Green",rgb:{r:14,g:185,b:104}},13:{id:13,name:"Green",rgb:{r:19,g:230,b:123}},14:{id:14,name:"Light Green",rgb:{r:135,g:255,b:94}},15:{id:15,name:"Dark Teal",rgb:{r:12,g:129,b:110}},16:{id:16,name:"Teal",rgb:{r:16,g:174,b:166}},17:{id:17,name:"Light Teal",rgb:{r:19,g:225,b:190}},18:{id:18,name:"Dark Blue",rgb:{r:40,g:80,b:158}},19:{id:19,name:"Blue",rgb:{r:64,g:147,b:228}},20:{id:20,name:"Cyan",rgb:{r:96,g:247,b:242}},21:{id:21,name:"Indigo",rgb:{r:107,g:80,b:246}},22:{id:22,name:"Light Indigo",rgb:{r:153,g:177,b:251}},23:{id:23,name:"Dark Purple",rgb:{r:120,g:12,b:153}},24:{id:24,name:"Purple",rgb:{r:170,g:56,b:185}},25:{id:25,name:"Light Purple",rgb:{r:224,g:159,b:249}},26:{id:26,name:"Dark Pink",rgb:{r:203,g:0,b:122}},27:{id:27,name:"Pink",rgb:{r:236,g:31,b:128}},28:{id:28,name:"Light Pink",rgb:{r:243,g:141,b:169}},29:{id:29,name:"Dark Brown",rgb:{r:104,g:70,b:52}},30:{id:30,name:"Brown",rgb:{r:149,g:104,b:42}},31:{id:31,name:"Beige",rgb:{r:248,g:178,b:119}},32:{id:32,name:"Medium Gray",rgb:{r:170,g:170,b:170}},33:{id:33,name:"Dark Red",rgb:{r:165,g:14,b:30}},34:{id:34,name:"Light Red",rgb:{r:250,g:128,b:114}},35:{id:35,name:"Dark Orange",rgb:{r:228,g:92,b:26}},36:{id:36,name:"Light Tan",rgb:{r:214,g:181,b:148}},37:{id:37,name:"Dark Goldenrod",rgb:{r:156,g:132,b:49}},38:{id:38,name:"Goldenrod",rgb:{r:197,g:173,b:49}},39:{id:39,name:"Light Goldenrod",rgb:{r:232,g:212,b:95}},40:{id:40,name:"Dark Olive",rgb:{r:74,g:107,b:58}},41:{id:41,name:"Olive",rgb:{r:90,g:148,b:74}},42:{id:42,name:"Light Olive",rgb:{r:132,g:197,b:115}},43:{id:43,name:"Dark Cyan",rgb:{r:15,g:121,b:159}},44:{id:44,name:"Light Cyan",rgb:{r:187,g:250,b:242}},45:{id:45,name:"Light Blue",rgb:{r:125,g:199,b:255}},46:{id:46,name:"Dark Indigo",rgb:{r:77,g:49,b:184}},47:{id:47,name:"Dark Slate Blue",rgb:{r:74,g:66,b:132}},48:{id:48,name:"Slate Blue",rgb:{r:122,g:113,b:196}},49:{id:49,name:"Light Slate Blue",rgb:{r:181,g:174,b:241}},50:{id:50,name:"Light Brown",rgb:{r:219,g:164,b:99}},51:{id:51,name:"Dark Beige",rgb:{r:209,g:128,b:81}},52:{id:52,name:"Light Beige",rgb:{r:255,g:197,b:165}},53:{id:53,name:"Dark Peach",rgb:{r:155,g:82,b:73}},54:{id:54,name:"Peach",rgb:{r:209,g:128,b:120}},55:{id:55,name:"Light Peach",rgb:{r:250,g:182,b:164}},56:{id:56,name:"Dark Tan",rgb:{r:123,g:99,b:82}},57:{id:57,name:"Tan",rgb:{r:156,g:132,b:107}},58:{id:58,name:"Dark Slate",rgb:{r:51,g:57,b:65}},59:{id:59,name:"Slate",rgb:{r:109,g:117,b:141}},60:{id:60,name:"Light Slate",rgb:{r:179,g:185,b:209}},61:{id:61,name:"Dark Stone",rgb:{r:109,g:100,b:63}},62:{id:62,name:"Stone",rgb:{r:148,g:140,b:107}},63:{id:63,name:"Light Stone",rgb:{r:205,g:197,b:158}}},THEMES:{classic:{name:"Classic",cssClass:"wplace-theme-classic"},"classic-light":{name:"Classic Light",cssClass:"wplace-theme-classic-light"},"neon-retro":{name:"Neon Retro",cssClass:"wplace-theme-neon"}},currentThemeKey:"classic",PAINT_UNAVAILABLE:!1,COORDINATE_MODE:"rows",COORDINATE_DIRECTION:"bottom-left",COORDINATE_SNAKE:!0,COORDINATE_BLOCK_WIDTH:6,COORDINATE_BLOCK_HEIGHT:2},yn=(t={})=>{let{maxLength:a=100,shouldLog:o=!1,label:n="LocalStorage"}=t;return(i,l)=>{let r;try{r=JSON.stringify(l)}catch(w){return console.groupCollapsed(`\u26A0\uFE0F ${n}: Could not serialize value`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",i),console.log("%cValue (failed to serialize):","font-weight: bold; color: #d6333f;",l),console.log("%cError:","color: #999;",w),console.groupEnd(),!1}try{if(localStorage.setItem(i,r),o){let w=r.length>a?r.slice(0,a)+"...":r;console.groupCollapsed(`\u{1F4BE} ${n}: Saved to localStorage`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",i),console.log("%cValue:","font-weight: bold; color: #50c878;",w),r.length>a&&console.log("%cFull serialized value:","color: #999;",r),console.groupEnd()}}catch(w){return console.groupCollapsed(`\u274C ${n}: Could not save to localStorage`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",i),console.log("%cValue (failed to save):","font-weight: bold; color: #d6333f;",l),console.log("%cSerialized (partial):","color: #999;",r),console.log("%cError:","color: #999;",w),console.groupEnd(),!1}return!0}},vn=(t={})=>{let{shouldLog:a=!1,label:o="Storage"}=t;return(n,i=null)=>{let l=localStorage.getItem(n);if(l===null)return a&&(console.groupCollapsed(`\u{1F50D} ${o}: Key not found`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",n),console.log("%cUsing default:","color: #999;",i),console.groupEnd()),i;let r=l,w=!1;try{r=JSON.parse(l),w=!0}catch(y){if(typeof l=="string"){if(l.length>100||/[\x00-\x1F\x7F-\x9F]/.test(l)||/[\uFFFD]/.test(l)||l.trim()==="")return a&&(console.groupCollapsed(`\u274C ${o}: Invalid or corrupted data`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",n),console.log("%cRaw value:","color: #d6333f;",l),console.log("%cError:","color: #999;",y),console.log("%cUsing default:","color: #666;",i),console.groupEnd()),i;a&&(console.groupCollapsed(`\u{1F7E1} ${o}: Raw string (not JSON)`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",n),console.log("%cValue:","color: #50c878;",l),console.groupEnd())}}return w&&a&&(console.groupCollapsed(`\u2705 ${o}: Loaded (JSON)`),console.log("%cKey:","font-weight: bold; color: #4a90e2;",n),console.log("%cValue:","font-weight: bold; color: #50c878;",r),console.groupEnd()),r}},je=yn({maxLength:80}),Wt=vn(),Tn=t=>{if(!T.THEMES[t]){console.warn(`Theme not found: ${t}`);return}T.currentThemeKey=t,e.currentThemeKey==="neon-retro"&&s.appendLinkOnce("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"),je("wplace_theme",t),_a()};function _a(){let t=T.THEMES[T.currentThemeKey];if(!t){console.error(`Unknown theme: ${T.currentThemeKey}`);return}let a=document.documentElement;Array.from(a.classList).forEach(o=>{o.startsWith("wplace-theme-")&&a.classList.remove(o)}),a.classList.add(t.cssClass)}var Sn=()=>{let t=Wt("wplace_theme");t&&T.THEMES[t]?T.currentThemeKey=t:T.currentThemeKey="classic"},sa=new Map,Fe={},la=["en","ru","pt","vi","fr","id","tr","zh-CN","zh-TW","ja","ko","uk"],Ft=async(t,a=0)=>{if(Fe[t])return Fe[t];let o=`https://skalsech.github.io/WPlace-AutoBOT/custom-main/lang/${t}.json`,n=3,i=1e3;try{console.log(a===0?`\u{1F504} Loading ${t} translations from CDN...`:`\u{1F504} Retrying ${t} translations (attempt ${a+1}/${n+1})...`);let l=await fetch(o);if(l.ok){let r=await l.json();if(typeof r=="object"&&r!==null&&Object.keys(r).length>0)return Fe[t]=r,console.log(`\u{1F4DA} Loaded ${t} translations successfully from CDN (${Object.keys(r).length} keys)`),r;throw console.warn(`\u274C Invalid translation format for ${t}`),new Error("Invalid translation format")}else throw console.warn(`\u274C CDN returned HTTP ${l.status}: ${l.statusText} for ${t} translations`),new Error(`HTTP ${l.status}: ${l.statusText}`)}catch(l){if(console.error(`\u274C Failed to load ${t} translations from CDN (attempt ${a+1}):`,l),a<n){let r=i*Math.pow(2,a);return console.log(`\u23F3 Retrying in ${r}ms...`),await s.sleep(r),Ft(t,a+1)}}return null},Cn=async()=>{let t=Wt("wplace_language"),a=navigator.language,o=a.split("-")[0],n="en";try{t&&la.includes(t)?(n=t,console.log(`\u{1F504} Using saved language preference: ${n}`)):la.includes(a)?(n=a,je("wplace_language",a),console.log(`\u{1F504} Using browser locale: ${n}`)):la.includes(o)?(n=o,je("wplace_language",o),console.log(`\u{1F504} Using browser language: ${n}`)):console.log("\u{1F504} No matching language found, using English fallback"),e.language=n,n!=="en"&&!Fe[n]&&(await Ft(n)||(console.warn(`\u26A0\uFE0F Failed to load ${n} translations, falling back to English`),e.language="en",je("wplace_language","en")))}catch(i){console.error("\u274C Error in loadLanguagePreference:",i),e.language="en"}},Ba=t=>{try{let a=document.createElement("div");a.style.cssText=`
        position: fixed; top: 10px; right: 10px; z-index: 10001;
        background: rgba(255, 193, 7, 0.95); color: #212529; padding: 12px 16px;
        border-radius: 8px; font-size: 14px; font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid rgba(255, 193, 7, 0.8);
        max-width: 300px; word-wrap: break-word;
      `,a.textContent=t,document.body.appendChild(a),setTimeout(()=>{a.parentNode&&a.remove()},8e3)}catch(a){console.warn("Failed to show translation warning UI:",a)}},xn=async()=>{try{console.log("\u{1F310} Initializing translation system..."),Fe.en||await Ft("en")||(console.warn("\u26A0\uFE0F Failed to load English translations from CDN, using fallback"),Ba("\u26A0\uFE0F Translation loading failed, using basic fallbacks")),await Cn(),console.log(`\u2705 Translation system initialized. Active language: ${e.language}`)}catch(t){console.error("\u274C Translation initialization failed:",t),e.language||(e.language="en"),console.warn("\u26A0\uFE0F Using fallback translations due to initialization failure"),Ba("\u26A0\uFE0F Translation system error, using basic English")}},La={en:{title:"WPlace Auto-Image",toggleOverlay:"Toggle Overlay",scanColors:"Scan Colors",uploadImage:"Upload Image",resizeImage:"Resize Image",selectPosition:"Select Position",startPainting:"Start Painting",stopPainting:"Stop Painting",progress:"Progress",pixels:"Pixels",charges:"Charges",initMessage:"Click 'Upload Image' to begin"}},e={running:!1,processing:!1,artTotalPixels:0,totalPaintedPixels:0,userPaintedPixels:0,availableColors:[],activeColorPalette:[],paintWhitePixels:!0,fullChargeData:null,fullChargeInterval:null,paintTransparentPixels:!1,displayCharges:0,preciseCurrentCharges:0,maxCharges:1,cooldown:T.COOLDOWN_DEFAULT,imageData:null,stopFlag:!1,startPosition:null,selectingPosition:!1,region:null,minimized:!1,estimatedTime:0,language:"en",paintingSpeed:T.PAINTING_SPEED.DEFAULT,batchMode:T.BATCH_MODE,randomBatchMin:T.RANDOM_BATCH_RANGE.MIN,randomBatchMax:T.RANDOM_BATCH_RANGE.MAX,cooldownChargeThreshold:T.COOLDOWN_CHARGE_THRESHOLD,chargesThresholdInterval:null,tokenSource:T.TOKEN_SOURCE,initialSetupComplete:!1,overlayOpacity:T.OVERLAY.OPACITY_DEFAULT,blueMarbleEnabled:T.OVERLAY.BLUE_MARBLE_DEFAULT,ditheringEnabled:!0,colorMatchingAlgorithm:"lab",enableChromaPenalty:!0,chromaPenaltyWeight:.15,customTransparencyThreshold:T.TRANSPARENCY_THRESHOLD,customWhiteThreshold:T.WHITE_THRESHOLD,resizeSettings:null,originalImage:null,resizeIgnoreMask:null,paintUnavailablePixels:T.PAINT_UNAVAILABLE,coordinateMode:T.COORDINATE_MODE,coordinateDirection:T.COORDINATE_DIRECTION,coordinateSnake:T.COORDINATE_SNAKE,blockWidth:T.COORDINATE_BLOCK_WIDTH,blockHeight:T.COORDINATE_BLOCK_HEIGHT,notificationsEnabled:T.NOTIFICATIONS.ENABLED,notifyOnChargesReached:T.NOTIFICATIONS.ON_CHARGES_REACHED,notifyOnlyWhenUnfocused:T.NOTIFICATIONS.ONLY_WHEN_UNFOCUSED,notificationIntervalMinutes:T.NOTIFICATIONS.REPEAT_MINUTES,_lastChargesNotifyAt:0,_lastChargesBelow:!0,_lastSavePixelCount:0,_lastSaveTime:0,_saveInProgress:!1,paintedMap:null,get hasAvailableColors(){return!!this.availableColors.length},get imageLoaded(){return!!this.imageData}},be=()=>{},zt=null,da=class{constructor(){this.isEnabled=!1,this.startCoords=null,this.imageBitmap=null,this.chunkedTiles=new Map,this.originalTiles=new Map,this.originalTilesData=new Map,this.tileSize=1e3,this.processPromise=null,this.lastProcessedHash=null,this.workerPool=null}toggle(){return this.isEnabled=!this.isEnabled,console.log(`Overlay ${this.isEnabled?"enabled":"disabled"}.`),this.isEnabled}enable(){this.isEnabled=!0}disable(){this.isEnabled=!1}clear(){this.disable(),this.imageBitmap=null,this.chunkedTiles.clear(),this.originalTiles.clear(),this.originalTilesData.clear(),this.lastProcessedHash=null,this.processPromise&&(this.processPromise=null)}async setImage(a){this.imageBitmap=a,this.lastProcessedHash=null,this.imageBitmap&&this.startCoords&&await this.processImageIntoChunks()}async setPosition(a,o){if(!a||!o){this.startCoords=null,this.chunkedTiles.clear(),this.lastProcessedHash=null;return}this.startCoords={region:o,pixel:a},this.lastProcessedHash=null,this.imageBitmap&&await this.processImageIntoChunks()}_generateProcessHash(){if(!this.imageBitmap||!this.startCoords)return null;let{width:a,height:o}=this.imageBitmap,{x:n,y:i}=this.startCoords.pixel,{x:l,y:r}=this.startCoords.region;return`${a}x${o}_${n},${i}_${l},${r}_${e.blueMarbleEnabled}_${e.overlayOpacity}`}async processImageIntoChunks(){if(!this.imageBitmap||!this.startCoords)return;if(this.processPromise)return this.processPromise;let a=this._generateProcessHash();if(this.lastProcessedHash===a&&this.chunkedTiles.size>0){console.log(`\u{1F4E6} Using cached overlay chunks (${this.chunkedTiles.size} tiles)`);return}this.processPromise=this._doProcessImageIntoChunks();try{await this.processPromise,this.lastProcessedHash=a}finally{this.processPromise=null}}async _doProcessImageIntoChunks(){let a=performance.now();this.chunkedTiles.clear();let{width:o,height:n}=this.imageBitmap,{x:i,y:l}=this.startCoords.pixel,{x:r,y:w}=this.startCoords.region,{startTileX:y,startTileY:d,endTileX:c,endTileY:p}=s.calculateTileRange(r,w,i,l,o,n,this.tileSize),b=(c-y+1)*(p-d+1);console.log(`\u{1F504} Processing ${b} overlay tiles...`);let m=4,f=[];for(let P=d;P<=p;P++)for(let k=y;k<=c;k++)f.push({tx:k,ty:P});for(let P=0;P<f.length;P+=m){let k=f.slice(P,P+m);await Promise.all(k.map(async({tx:A,ty:M})=>{let q=`${A},${M}`,R=await this._processTile(A,M,o,n,i,l,r,w);R&&this.chunkedTiles.set(q,R)})),P+m<f.length&&await s.sleep(0)}let u=performance.now()-a;console.log(`\u2705 Overlay processed ${this.chunkedTiles.size} tiles in ${Math.round(u)}ms`)}async _processTile(a,o,n,i,l,r,w,y){let d=`${a},${o}`,c=(a-w)*this.tileSize-l,p=(o-y)*this.tileSize-r,b=Math.max(0,c),m=Math.max(0,p),f=Math.min(n-b,this.tileSize-(b-c)),u=Math.min(i-m,this.tileSize-(m-p));if(f<=0||u<=0)return null;let P=Math.max(0,-c),k=Math.max(0,-p),A=new OffscreenCanvas(this.tileSize,this.tileSize),M=A.getContext("2d");if(M.imageSmoothingEnabled=!1,M.drawImage(this.imageBitmap,b,m,f,u,P,k,f,u),e.blueMarbleEnabled){let q=M.getImageData(P,k,f,u),R=q.data;for(let J=0;J<R.length;J+=4){let ie=J/4,te=Math.floor(ie/f);(ie%f+te)%2===0&&R[J+3]>0&&(R[J+3]=0)}M.putImageData(q,P,k)}return await A.transferToImageBitmap()}async processAndRespondToTileRequest(a){let{endpoint:o,blobID:n,blobData:i}=a,l=i;if(this.isEnabled&&this.chunkedTiles.size>0){let r=o.match(/(\d+)\/(\d+)\.png/);if(r){let w=parseInt(r[1],10),y=parseInt(r[2],10),d=`${w},${y}`,c=this.chunkedTiles.get(d);try{let p=await createImageBitmap(i);this.originalTiles.set(d,p);try{let b,m;typeof OffscreenCanvas<"u"?(b=new OffscreenCanvas(p.width,p.height),m=b.getContext("2d")):(b=document.createElement("canvas"),b.width=p.width,b.height=p.height,m=b.getContext("2d")),m.imageSmoothingEnabled=!1,m.drawImage(p,0,0);let f=m.getImageData(0,0,p.width,p.height);this.originalTilesData.set(d,{w:p.width,h:p.height,data:new Uint8ClampedArray(f.data)})}catch(b){console.warn("OverlayManager: could not cache ImageData for",d,b)}}catch(p){console.warn("OverlayManager: could not create original bitmap for",d,p)}if(c)try{l=await this._compositeTileOptimized(i,c)}catch(p){console.error("Error compositing overlay:",p),l=i}}}window.postMessage({source:"auto-image-overlay",blobID:n,blobData:l},"*")}async getTilePixelColor(a,o,n,i){let l=`${a},${o}`,r=this.originalTilesData.get(l);if(r&&r.data&&r.w>0&&r.h>0){let y=Math.max(0,Math.min(r.w-1,n)),c=(Math.max(0,Math.min(r.h-1,i))*r.w+y)*4,p=r.data,b=p[c],m=p[c+1],f=p[c+2],u=p[c+3];return[b,m,f,u]}let w=3;for(let y=1;y<=w;y++){let d=this.originalTiles.get(l);if(!d){y===w?console.warn("OverlayManager: no bitmap for",l,"after",w,"attempts"):await s.sleep(50*y);continue}try{let c,p;typeof OffscreenCanvas<"u"?(c=new OffscreenCanvas(d.width,d.height),p=c.getContext("2d")):(c=document.createElement("canvas"),c.width=d.width,c.height=d.height,p=c.getContext("2d")),p.imageSmoothingEnabled=!1,p.drawImage(d,0,0);let b=Math.max(0,Math.min(d.width-1,n)),m=Math.max(0,Math.min(d.height-1,i)),f=p.getImageData(b,m,1,1).data,u=f[3];return!e.paintTransparentPixels&&s.isTransparentPixel(u)?(window._overlayDebug&&console.debug("OverlayManager: pixel transparent (fallback)",l,b,m,u),null):[f[0],f[1],f[2],u]}catch(c){console.warn("OverlayManager: failed to read pixel (attempt",y,")",l,c),y<w?await s.sleep(50*y):console.error("OverlayManager: failed to read pixel after",w,"attempts",l)}}return null}async _compositeTileOptimized(a,o){let n=await createImageBitmap(a),i=new OffscreenCanvas(n.width,n.height),l=i.getContext("2d");return l.imageSmoothingEnabled=!1,l.drawImage(n,0,0),l.globalAlpha=e.overlayOpacity,l.globalCompositeOperation="source-over",l.drawImage(o,0,0),await i.convertToBlob({type:"image/png",quality:.95})}async waitForTiles(a,o,n,i,l=0,r=0,w=1e4){let{startTileX:y,startTileY:d,endTileX:c,endTileY:p}=s.calculateTileRange(a,o,l,r,n,i,this.tileSize),b=[];for(let f=d;f<=p;f++)for(let u=y;u<=c;u++)b.push(`${u},${f}`);if(b.length===0)return!0;let m=Date.now();for(;Date.now()-m<w;){if(e.stopFlag)return console.log("waitForTiles: stopped by user"),!1;if(b.filter(u=>!this.originalTiles.has(u)).length===0)return console.log(`\u2705 All ${b.length} required tiles are loaded`),!0;await s.sleep(100)}return console.warn(`\u274C Timeout waiting for tiles: ${b.length} required, 
        ${b.filter(f=>this.originalTiles.has(f)).length} loaded`),!1}},xe=new da;async function Da(t,a,o){try{let n=await import("/_app/immutable/chunks/BBb1ALhY.js"),i;try{i=await n._(),console.log("\u2705 WASM initialized successfully")}catch(m){return console.error("\u274C WASM initialization failed:",m),null}try{try{let m=await fetch("https://backend.wplace.live/me",{credentials:"include"}).then(f=>f.ok?f.json():null);m?.id&&(n.i(m.id),console.log("\u2705 user ID set:",m.id))}catch{}}catch(m){console.log("\u26A0\uFE0F Error setting user ID:",m.message)}try{let m=`https://backend.wplace.live/s0/pixel/${t}/${a}`;n.r?(n.r(m),console.log("\u2705 Request URL set:",m)):console.log("\u26A0\uFE0F request_url function (mod.r) not available")}catch(m){console.log("\u26A0\uFE0F Error setting request URL:",m.message)}console.log("\u{1F4DD} payload:",o);let l=new TextEncoder,r=new TextDecoder,w=JSON.stringify(o),y=l.encode(w);console.log("\u{1F4CF} Payload size:",y.length,"bytes"),console.log("\u{1F4C4} Payload string:",w);let d;try{if(!i.__wbindgen_malloc)return console.error("\u274C __wbindgen_malloc function not found"),null;d=i.__wbindgen_malloc(y.length,1),console.log("\u2705 WASM memory allocated, pointer:",d),new Uint8Array(i.memory.buffer,d,y.length).set(y),console.log("\u2705 Data copied to WASM memory")}catch(m){return console.error("\u274C Memory allocation error:",m),null}console.log("\u{1F680} Calling get_pawtected_endpoint_payload...");let c,p,b;try{let m=i.get_pawtected_endpoint_payload(d,y.length);if(console.log("\u2705 Function called, result type:",typeof m,m),Array.isArray(m)&&m.length===2){[c,p]=m,console.log("\u2705 Got output pointer:",c,"length:",p);let f=new Uint8Array(i.memory.buffer,c,p);b=r.decode(f),console.log("\u2705 Token decoded successfully")}else return console.error("\u274C Unexpected function result format:",m),null}catch(m){return console.error("\u274C Function call error:",m),console.error("Stack trace:",m.stack),null}try{i.__wbindgen_free&&c&&p&&(i.__wbindgen_free(c,p,1),console.log("\u2705 Output memory freed")),i.__wbindgen_free&&d&&(i.__wbindgen_free(d,y.length,1),console.log("\u2705 Input memory freed"))}catch(m){console.log("\u26A0\uFE0F Cleanup warning:",m.message)}return console.log(""),console.log("\u{1F389} SUCCESS!"),console.log("\u{1F4CA} Results:"),console.log("   Input coords: [1245984, 1088]"),console.log("   Token length:",b?.length||0),console.log("   Token preview:",b?.substring(0,50)+"..."),console.log(""),console.log("\u{1F511} Full token:"),console.log(b),b}catch(n){return console.error("\u274C Failed to generate fp parameter:",n),null}}var we=null,pa=0,ra=!1,ze=null,lt=new Promise(t=>{ze=t});var Oa=10,kn=24e4;function nt(t){ze&&(ze(t),ze=null),we=t,pa=Date.now()+kn,console.log("\u2705 Turnstile token set successfully")}function rt(){return we&&Date.now()<pa}function En(){we=null,pa=0,console.log("\u{1F5D1}\uFE0F Token invalidated, will force fresh generation")}async function za(t=!1){if(rt()&&!t)return we;if(t&&En(),ra)return console.log("\u{1F504} Token generation already in progress, waiting..."),await s.sleep(2e3),rt()?we:null;ra=!0;try{console.log("\u{1F504} Token expired or missing, generating new one...");let a=await Na();if(a&&a.length>20)return nt(a),console.log("\u2705 Token captured and cached successfully"),a;console.log("\u26A0\uFE0F Invisible Turnstile failed, forcing browser automation...");let o=await ga();return o&&o.length>20?(nt(o),console.log("\u2705 Fallback token captured successfully"),o):(console.log("\u274C All token generation methods failed"),null)}finally{ra=!1}}async function Na(){let t=performance.now();try{let{sitekey:a,token:o}=await s.obtainSitekeyAndToken();if(!a)throw new Error("No valid sitekey found");console.log("\u{1F511} Using sitekey:",a),typeof window<"u"&&window.navigator&&console.log("\u{1F9ED} UA:",window.navigator.userAgent.substring(0,50)+"...","Platform:",window.navigator.platform);let n=null;if(o&&typeof o=="string"&&o.length>20?(console.log("\u267B\uFE0F Reusing pre-generated Turnstile token"),n=o):rt()?(console.log("\u267B\uFE0F Using existing cached token (from previous session)"),n=we):(console.log("\u{1F510} Generating new token with executeTurnstile..."),n=await s.executeTurnstile(a,"paint"),n&&nt(n)),n&&typeof n=="string"&&n.length>20){let i=Math.round(performance.now()-t);return console.log(`\u2705 Turnstile token generated successfully in ${i}ms`),n}else throw new Error(`Invalid or empty token received - Length: ${n?.length||0}`)}catch(a){let o=Math.round(performance.now()-t);throw console.error(`\u274C Turnstile token generation failed after ${o}ms:`,a),a}}async function ga(){return new Promise(async(t,a)=>{try{ze||(lt=new Promise(i=>{ze=i}));let o=s.sleep(2e4).then(()=>a(new Error("Auto-CAPTCHA timed out."))),n=(async()=>{let i=await s.waitForSelector("button.btn.btn-primary.btn-lg, button.btn-primary.sm\\:btn-xl",200,1e4);if(!i)throw new Error("Could not find the main paint button.");i.click(),await s.sleep(500);let l=await s.waitForSelector("button#color-0",200,5e3);if(!l)throw new Error("Could not find the transparent color button.");l.click(),await s.sleep(500);let r=await s.waitForSelector("canvas",200,5e3);if(!r)throw new Error("Could not find the canvas element.");r.setAttribute("tabindex","0"),r.focus();let w=r.getBoundingClientRect(),y=Math.round(w.left+w.width/2),d=Math.round(w.top+w.height/2);r.dispatchEvent(new MouseEvent("mousemove",{clientX:y,clientY:d,bubbles:!0})),r.dispatchEvent(new KeyboardEvent("keydown",{key:" ",code:"Space",bubbles:!0})),await s.sleep(50),r.dispatchEvent(new KeyboardEvent("keyup",{key:" ",code:"Space",bubbles:!0})),await s.sleep(500),await s.sleep(800),(async()=>{for(;!we;){let b=await s.waitForSelector("button.btn.btn-primary.btn-lg, button.btn.btn-primary.sm\\:btn-xl");if(!b){let m=Array.from(document.querySelectorAll("button.btn-primary"));b=m.length?m[m.length-1]:null}b&&b.click(),await s.sleep(500)}})();let p=await lt;await s.sleep(300),t(p)})();await Promise.race([n,o])}catch(o){console.error("Auto-CAPTCHA process failed:",o),a(o)}})}function Pn(t){let a=document.createElement("script");a.textContent=`(${t})();`,document.documentElement?.appendChild(a),a.remove()}Pn(()=>{let t=new Map;window.addEventListener("message",o=>{let{source:n,blobID:i,blobData:l}=o.data;if(n==="auto-image-overlay"&&i&&l){let r=t.get(i);typeof r=="function"&&r(l),t.delete(i)}});let a=window.fetch;window.fetch=async function(...o){let n=await a.apply(this,o),i=o[0]instanceof Request?o[0].url:o[0];if(typeof i=="string"){if(i.includes("https://backend.wplace.live/s0/pixel/"))try{let r=JSON.parse(o[1].body);r.t&&(console.log(`\u{1F50D}\u2705 Turnstile Token Captured - Type: ${typeof r.t}, Value: ${r.t?typeof r.t=="string"?r.t.length>50?r.t.substring(0,50)+"...":r.t:JSON.stringify(r.t):"null/undefined"}, Length: ${r.t?.length||0}`),window.postMessage({source:"turnstile-capture",token:r.t},"*"))}catch{}if((n.headers.get("content-type")||"").includes("image/png")&&i.includes(".png")){let r=n.clone();return new Promise(async w=>{let y=crypto.randomUUID(),d=await r.blob();t.set(y,c=>{w(new Response(c,{headers:r.headers,status:r.status,statusText:r.statusText}))}),window.postMessage({source:"auto-image-tile",endpoint:i,blobID:y,blobData:d},"*")})}}return n}});window.addEventListener("message",t=>{let{source:a,endpoint:o,blobID:n,blobData:i,token:l}=t.data;a==="auto-image-tile"&&o&&n&&i&&xe.processAndRespondToTileRequest(t.data),a==="turnstile-capture"&&l&&(nt(l),document.querySelector("#statusText")?.textContent.includes("CAPTCHA")&&(s.showAlert(s.t("tokenCapturedSuccess"),"success"),H("colorsFound","success",{count:e.availableColors.length})))});var s={randStr(t,a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"){let o=()=>{if(typeof crypto<"u"&&crypto.getRandomValues){let n=new Uint32Array(1);return crypto.getRandomValues(n),n[0]%a.length}return Math.floor(Math.random()*a.length)};return[...Array(t)].map(()=>a[o()]).join("")},sleep:t=>new Promise(a=>setTimeout(a,t)),dynamicSleep:async function(t){let a=Math.max(0,await t());for(;a>0;){let o=a>5e3?2e3:a>1e3?500:100;await this.sleep(Math.min(o,a)),a=Math.max(0,await t())}},appendLinkOnce(t,a={}){if(Array.from(document.head.querySelectorAll("link")).some(i=>i.href===t))return;let n=document.createElement("link");n.rel="stylesheet",n.href=t;for(let[i,l]of Object.entries(a))n.setAttribute(i,l);document.head.appendChild(n)},waitForSelector:async(t,a=200,o=5e3)=>{let n=Date.now();for(;Date.now()-n<o;){let i=document.querySelector(t);if(i)return i;await s.sleep(a)}return null},msToTimeText(t){let a=Math.ceil(t/1e3),o=Math.floor(a/3600),n=Math.floor(a%3600/60),i=a%60;return o>0?`${o}h ${n}m ${i}s`:n>0?`${n}m ${i}s`:`${i}s`},calculateTileRange(t,a,o,n,i,l,r=1e3){let w=o+i,y=n+l;return{startTileX:t+Math.floor(o/r),startTileY:a+Math.floor(n/r),endTileX:t+Math.floor((w-1)/r),endTileY:a+Math.floor((y-1)/r)}},turnstileLoaded:!1,_turnstileContainer:null,_turnstileOverlay:null,_turnstileWidgetId:null,_lastSitekey:null,async loadTurnstile(){return window.turnstile?(this.turnstileLoaded=!0,Promise.resolve()):new Promise((t,a)=>{if(document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]')){let n=()=>{window.turnstile?(this.turnstileLoaded=!0,t()):setTimeout(n,100)};return n()}let o=document.createElement("script");o.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",o.async=!0,o.defer=!0,o.onload=()=>{this.turnstileLoaded=!0,console.log("\u2705 Turnstile script loaded successfully"),t()},o.onerror=()=>{console.error("\u274C Failed to load Turnstile script"),a(new Error("Failed to load Turnstile"))},document.head.appendChild(o)})},ensureTurnstileContainer(){return(!this._turnstileContainer||!document.body.contains(this._turnstileContainer))&&(this._turnstileContainer&&this._turnstileContainer.remove(),this._turnstileContainer=document.createElement("div"),this._turnstileContainer.className="wplace-turnstile-hidden",this._turnstileContainer.setAttribute("aria-hidden","true"),this._turnstileContainer.id="turnstile-widget-container",document.body.appendChild(this._turnstileContainer)),this._turnstileContainer},ensureTurnstileOverlayContainer(){if(this._turnstileOverlay&&document.body.contains(this._turnstileOverlay))return this._turnstileOverlay;let t=document.createElement("div");t.id="turnstile-overlay-container",t.className="wplace-turnstile-overlay wplace-overlay-hidden";let a=document.createElement("div");a.textContent=s.t("turnstileInstructions"),a.className="wplace-turnstile-title";let o=document.createElement("div");o.id="turnstile-overlay-host",o.className="wplace-turnstile-host";let n=document.createElement("button");return n.textContent=s.t("hideTurnstileBtn"),n.className="wplace-turnstile-hide-btn",n.addEventListener("click",()=>t.remove()),t.appendChild(a),t.appendChild(o),t.appendChild(n),document.body.appendChild(t),this._turnstileOverlay=t,t},async executeTurnstile(t,a="paint"){if(await this.loadTurnstile(),this._turnstileWidgetId&&this._lastSitekey===t&&window.turnstile?.execute)try{console.log("\u{1F504} Reusing existing Turnstile widget...");let n=await Promise.race([window.turnstile.execute(this._turnstileWidgetId,{action:a}),new Promise((i,l)=>setTimeout(()=>l(new Error("Execute timeout")),15e3))]);if(n&&n.length>20)return console.log("\u2705 Token generated via widget reuse"),n}catch(n){console.log("\uFFFD Widget reuse failed, will create a fresh widget:",n.message)}let o=await this.createTurnstileWidget(t,a);return o&&o.length>20?o:(console.log("\uFFFD Falling back to interactive Turnstile (visible)."),await this.createTurnstileWidgetInteractive(t,a))},async createTurnstileWidget(t,a){return new Promise(o=>{try{if(this._turnstileWidgetId&&window.turnstile?.remove)try{window.turnstile.remove(this._turnstileWidgetId),console.log("\u{1F9F9} Cleaned up existing Turnstile widget")}catch(l){console.warn("\u26A0\uFE0F Widget cleanup warning:",l.message)}let n=this.ensureTurnstileContainer();if(n.innerHTML="",!window.turnstile?.render){console.error("\u274C Turnstile not available for rendering"),o(null);return}console.log("\u{1F527} Creating invisible Turnstile widget...");let i=window.turnstile.render(n,{sitekey:t,action:a,size:"invisible",retry:"auto","retry-interval":8e3,callback:l=>{console.log("\u2705 Invisible Turnstile callback"),o(l)},"error-callback":()=>o(null),"timeout-callback":()=>o(null)});if(this._turnstileWidgetId=i,this._lastSitekey=t,!i)return o(null);Promise.race([window.turnstile.execute(i,{action:a}),new Promise((l,r)=>setTimeout(()=>r(new Error("Invisible execute timeout")),12e3))]).then(o).catch(()=>o(null))}catch(n){console.error("\u274C Invisible Turnstile creation failed:",n),o(null)}})},async createTurnstileWidgetInteractive(t,a){return console.log("\u{1F504} Creating interactive Turnstile widget (visible)"),new Promise(o=>{try{if(this._turnstileWidgetId&&window.turnstile?.remove)try{window.turnstile.remove(this._turnstileWidgetId)}catch(w){console.warn("\u26A0\uFE0F Widget cleanup warning:",w.message)}let n=this.ensureTurnstileOverlayContainer();n.classList.remove("wplace-overlay-hidden"),n.style.display="block";let i=n.querySelector("#turnstile-overlay-host");i.innerHTML="";let l=setTimeout(()=>{console.warn("\u23F0 Interactive Turnstile widget timeout"),n.classList.add("wplace-overlay-hidden"),n.style.display="none",o(null)},6e4),r=window.turnstile.render(i,{sitekey:t,action:a,size:"normal",theme:"light",callback:w=>{clearTimeout(l),n.classList.add("wplace-overlay-hidden"),n.style.display="none",console.log("\u2705 Interactive Turnstile completed successfully"),typeof w=="string"&&w.length>20?o(w):(console.warn("\u274C Invalid token from interactive widget"),o(null))},"error-callback":w=>{clearTimeout(l),n.classList.add("wplace-overlay-hidden"),n.style.display="none",console.warn("\u274C Interactive Turnstile error:",w),o(null)}});this._turnstileWidgetId=r,this._lastSitekey=t,r?console.log("\u2705 Interactive Turnstile widget created, waiting for user interaction..."):(clearTimeout(l),n.classList.add("wplace-overlay-hidden"),n.style.display="none",console.warn("\u274C Failed to create interactive Turnstile widget"),o(null))}catch(n){console.error("\u274C Interactive Turnstile creation failed:",n),o(null)}})},cleanupTurnstile(){if(this._turnstileWidgetId&&window.turnstile?.remove)try{window.turnstile.remove(this._turnstileWidgetId)}catch(t){console.warn("Failed to cleanup Turnstile widget:",t)}this._turnstileContainer&&document.body.contains(this._turnstileContainer)&&this._turnstileContainer.remove(),this._turnstileOverlay&&document.body.contains(this._turnstileOverlay)&&this._turnstileOverlay.remove(),this._turnstileWidgetId=null,this._turnstileContainer=null,this._turnstileOverlay=null,this._lastSitekey=null},async obtainSitekeyAndToken(t="0x4AAAAAABpqJe8FO0N84q0F"){if(this._cachedSitekey)return console.log("\u{1F50D} Using cached sitekey:",this._cachedSitekey),rt()?{sitekey:this._cachedSitekey,token:we}:{sitekey:this._cachedSitekey,token:null};let a=["0x4AAAAAABpqJe8FO0N84q0F","0x4AAAAAABpHqZ-6i7uL0nmG","0x4AAAAAAAJ7xjKAp6Mt_7zw","0x4AAAAAADm5QWx6Ov2LNF2g"],o=async(i,l)=>{if(!i||i.length<10)return null;console.log(`\u{1F50D} Testing sitekey from ${l}:`,i);let r=await this.executeTurnstile(i);return r&&r.length>=20?(console.log(`\u2705 Valid token generated from ${l} sitekey`),nt(r),this._cachedSitekey=i,{sitekey:i,token:r}):(console.log(`\u274C Failed to get token from ${l} sitekey`),null)};try{let i=document.querySelector("[data-sitekey]");if(i){let y=i.getAttribute("data-sitekey"),d=await o(y,"data attribute");if(d)return d}let l=document.querySelector(".cf-turnstile");if(l?.dataset?.sitekey){let y=l.dataset.sitekey,d=await o(y,"turnstile element");if(d)return d}let r=document.querySelectorAll('meta[name*="turnstile"], meta[property*="turnstile"]');for(let y of r){let d=y.getAttribute("content"),c=await o(d,"meta tag");if(c)return c}if(window.__TURNSTILE_SITEKEY){let y=await o(window.__TURNSTILE_SITEKEY,"global variable");if(y)return y}let w=document.querySelectorAll("script");for(let y of w){let c=(y.textContent||y.innerHTML).match(/(?:sitekey|data-sitekey)['"\s[\]:=(]*['"]?([0-9a-zA-Z_-]{20,})['"]?/i);if(c&&c[1]){let p=c[1].replace(/['"]/g,""),b=await o(p,"script content");if(b)return b}}console.log("\u{1F50D} Testing known potential sitekeys...");for(let y of a){let d=await o(y,"known list");if(d)return d}}catch(i){console.warn("\u26A0\uFE0F Error during sitekey detection:",i)}console.log("\u{1F527} Trying fallback sitekey:",t);let n=await o(t,"fallback");return n||(console.error("\u274C No working sitekey or token found."),{sitekey:null,token:null})},createElement:(t,a={},o=[])=>{let n=document.createElement(t);return Object.entries(a).forEach(([i,l])=>{i==="style"&&typeof l=="object"?Object.assign(n.style,l):i==="className"?n.className=l:i==="innerHTML"?n.innerHTML=l:n.setAttribute(i,l)}),typeof o=="string"?n.textContent=o:Array.isArray(o)&&o.forEach(i=>{typeof i=="string"?n.appendChild(document.createTextNode(i)):n.appendChild(i)}),n},t:(t,a={})=>{let o=`${e.language}_${t}`;if(sa.has(o)){let i=sa.get(o);return Object.keys(a).forEach(l=>{i=i.replace(`{${l}}`,a[l])}),i}if(Fe[e.language]?.[t]){let i=Fe[e.language][t];return sa.set(o,i),Object.keys(a).forEach(l=>{i=i.replace(`{${l}}`,a[l])}),i}if(e.language!=="en"&&Fe.en?.[t]){let i=Fe.en[t];return Object.keys(a).forEach(l=>{i=i.replace(`{${l}}`,a[l])}),i}let n=La[e.language]?.[t]||La.en?.[t]||t;return Object.keys(a).forEach(i=>{n=n.replace(new RegExp(`\\{${i}\\}`,"g"),a[i])}),n===t&&t!=="undefined"&&console.warn(`\u26A0\uFE0F Missing translation for key: ${t} (language: ${e.language})`),n},showAlert:(t,a="info")=>{let n=["info","success","warning","error"].includes(a)?a:"info",i=document.createElement("div");i.className=`wplace-alert-base wplace-alert-${n}`,i.textContent=t,i.addEventListener("click",()=>{i.classList.add("fade-out"),setTimeout(()=>document.body.removeChild(i),300)}),document.body.appendChild(i),setTimeout(()=>{i.classList.add("fade-out"),setTimeout(()=>{i.parentElement===document.body&&document.body.removeChild(i)},300)},4e3)},colorDistance:(t,a)=>Math.sqrt(Math.pow(t[0]-a[0],2)+Math.pow(t[1]-a[1],2)+Math.pow(t[2]-a[2],2)),_labCache:new Map,_rgbToLab:(t,a,o)=>{let n=k=>(k/=255,k<=.04045?k/12.92:Math.pow((k+.055)/1.055,2.4)),i=n(t),l=n(a),r=n(o),w=i*.4124+l*.3576+r*.1805,y=i*.2126+l*.7152+r*.0722,d=i*.0193+l*.1192+r*.9505;w/=.95047,y/=1,d/=1.08883;let c=k=>k>.008856?Math.cbrt(k):7.787*k+16/116,p=c(w),b=c(y),m=c(d),f=116*b-16,u=500*(p-b),P=200*(b-m);return[f,u,P]},_lab:(t,a,o)=>{let n=t<<16|a<<8|o,i=s._labCache.get(n);return i||(i=s._rgbToLab(t,a,o),s._labCache.set(n,i)),i},findClosestPaletteColor:(t,a,o,n)=>{if((!n||n.length===0)&&(n=Object.values(T.COLOR_MAP).filter(c=>c.rgb).map(c=>[c.rgb.r,c.rgb.g,c.rgb.b])),e.colorMatchingAlgorithm==="legacy"){let c=1/0,p=[0,0,0,255];for(let b=0;b<n.length;b++){let[m,f,u]=n[b],P=(m+t)/2,k=m-t,A=f-a,M=u-o,q=Math.sqrt(((512+P)*k*k>>8)+4*A*A+((767-P)*M*M>>8));q<c&&(c=q,p=[m,f,u,255])}return p}let[i,l,r]=s._lab(t,a,o),w=Math.sqrt(l*l+r*r),y=null,d=1/0;for(let c=0;c<n.length;c++){let[p,b,m]=n[c],[f,u,P]=s._lab(p,b,m),k=i-f,A=l-u,M=r-P,q=k*k+A*A+M*M;if(e.enableChromaPenalty&&w>20){let R=Math.sqrt(u*u+P*P);if(R<w){let J=w-R;q+=J*J*e.chromaPenaltyWeight}}if(q<d&&(d=q,y=[p,b,m,255],d===0))break}return y||[0,0,0,255]},isWhitePixel:(t,a,o)=>{let n=e.customWhiteThreshold||T.WHITE_THRESHOLD;return t>=n&&a>=n&&o>=n},isTransparentPixel:t=>{let a=e.customTransparencyThreshold||T.TRANSPARENCY_THRESHOLD;return t==null&&console.warn(`Expected to get alpha of pixel, but got ${t}`),t<a},colorsChanged(t,a){let o=new Set(t.map(i=>i.rgb.join(","))),n=new Set(a.map(i=>i.rgb.join(",")));if(o.size!==n.size)return!0;for(let i of o)if(!n.has(i))return!0;return!1},invalidateColorCache(t={}){if(t.availableColors){Le.clear();return}for(let a of Le.keys()){let[o,n,i,l]=a.split("|");if(t.colorMatchingAlgorithm&&n!==t.colorMatchingAlgorithm){Le.delete(a);continue}if(t.enableChromaPenalty!==void 0&&i!==(t.enableChromaPenalty?"c":"nc")){Le.delete(a);continue}if(t.chromaPenaltyWeight!==void 0&&Number(l)!==t.chromaPenaltyWeight){Le.delete(a);continue}}},resolveColor(t,a,o=!1){let n=t.slice(0,3);if(!a||a.length===0)return console.warn(`Couldn't resolve color (${t.join(",")}) because availableColors is empty`),{id:null,rgb:n};if(s.isTransparentPixel(t[3]))return{id:T.COLOR_MAP[0].id,rgb:T.COLOR_MAP[0].rgb};let i=`${n[0]},${n[1]},${n[2]}|${e.colorMatchingAlgorithm}|${e.enableChromaPenalty?"c":"nc"}|${e.chromaPenaltyWeight}|${o?"exact":"closest"}`;if(Le.has(i))return Le.get(i);if(o){let c=a.find(b=>b.rgb[0]===n[0]&&b.rgb[1]===n[1]&&b.rgb[2]===n[2]),p=c?{id:c.id,rgb:[...c.rgb]}:{id:null,rgb:n};return Le.set(i,p),p}let l=e.customWhiteThreshold||T.WHITE_THRESHOLD;if(n[0]>=l&&n[1]>=l&&n[2]>=l){let c=a.find(p=>p.rgb[0]>=l&&p.rgb[1]>=l&&p.rgb[2]>=l);if(c){let p={id:c.id,rgb:[...c.rgb]};return Le.set(i,p),p}}let r=a[0].id,w=[...a[0].rgb],y=1/0;if(e.colorMatchingAlgorithm==="legacy")for(let c=0;c<a.length;c++){let p=a[c],[b,m,f]=p.rgb,u=(b+n[0])/2,P=b-n[0],k=m-n[1],A=f-n[2],M=Math.sqrt(((512+u)*P*P>>8)+4*k*k+((767-u)*A*A>>8));if(M<y&&(y=M,r=p.id,w=[...p.rgb],M===0))break}else{let[c,p,b]=s._lab(n[0],n[1],n[2]),m=Math.sqrt(p*p+b*b),f=e.enableChromaPenalty?e.chromaPenaltyWeight||.15:0;for(let u=0;u<a.length;u++){let P=a[u],[k,A,M]=P.rgb,[q,R,J]=s._lab(k,A,M),ie=c-q,te=p-R,ke=b-J,ve=ie*ie+te*te+ke*ke;if(f>0&&m>20){let se=Math.sqrt(R*R+J*J);if(se<m){let Ie=m-se;ve+=Ie*Ie*f}}if(ve<y&&(y=ve,r=P.id,w=[...P.rgb],ve===0))break}}let d={id:r,rgb:w};if(Le.set(i,d),Le.size>15e3){let c=Le.keys().next().value;Le.delete(c)}return d},createImageUploader:()=>new Promise(t=>{let a=document.createElement("input");a.type="file",a.accept="image/png,image/jpeg",a.onchange=()=>{let o=new FileReader;o.onload=()=>t(o.result),o.readAsDataURL(a.files[0])},a.click()}),createFileDownloader:(t,a)=>{let o=new Blob([t],{type:"application/json"}),n=URL.createObjectURL(o),i=document.createElement("a");i.href=n,i.download=a,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(n)},createFileUploader:()=>new Promise((t,a)=>{let o=document.createElement("input");o.type="file",o.accept=".json",o.onchange=n=>{let i=n.target.files[0];if(i){let l=new FileReader;l.onload=()=>{try{let r=JSON.parse(l.result);t(r)}catch{a(new Error("Invalid JSON file"))}},l.onerror=()=>a(new Error("File reading error")),l.readAsText(i)}else a(new Error("No file selected"))},o.click()}),extractColors:()=>{let t=[],a=[],o=document.querySelectorAll('.tooltip button[id^="color-"]');if(o.length===0)return console.log("\u274C No color elements found on page"),{availableColors:t,unavailableColors:a};function n(i){let l=Number(i.id.replace("color-","")),r=i.style.backgroundColor.match(/\d+/g);if(!r||r.length<3){if(l!==0)return console.warn(`Skipping color element ${i.id} \u2014 cannot parse RGB`),null;{let p=T.COLOR_MAP[l];return p?{id:p.id,name:p.name,rgb:Object.values(p.rgb),isAvailable:!0}:null}}let w=r.map(Number),y=T.COLOR_MAP[l],d=y?y.name:`Unknown Color ${l}`;y||console.warn(`Color id ${l} not found in known colors`);let c=!i.querySelector("svg");return{id:l,name:d,rgb:w,isAvailable:c}}for(let i of o){let l=n(i);l&&(l.isAvailable?t.push(l):a.push(l))}return console.log("=== CAPTURED COLORS STATUS ==="),console.log(`Total available colors: ${t.length}`),console.log(`Total unavailable colors: ${a.length}`),console.log(`Total colors scanned: ${t.length+a.length}`),t.length>0&&(console.log(`
--- AVAILABLE COLORS ---`),t.forEach((i,l)=>{console.log(`${l+1}. ID: ${i.id}, Name: "${i.name}", RGB: (${i.rgb[0]}, ${i.rgb[1]}, ${i.rgb[2]})`)})),a.length>0&&(console.log(`
--- UNAVAILABLE COLORS ---`),a.forEach((i,l)=>{console.log(`${l+1}. ID: ${i.id}, Name: "${i.name}", RGB: (${i.rgb[0]}, ${i.rgb[1]}, ${i.rgb[2]}) [LOCKED]`)})),console.log("=== END COLOR STATUS ==="),{availableColors:t,unavailableColors:a}},formatTime:t=>{let a=Math.floor(t/1e3%60),o=Math.floor(t/(1e3*60)%60),n=Math.floor(t/(1e3*60*60)%24),i=Math.floor(t/(1e3*60*60*24)),l="";return i>0&&(l+=`${i}d `),(n>0||i>0)&&(l+=`${n}h `),(o>0||n>0||i>0)&&(l+=`${o}m `),l+=`${a}s`,l},calculateEstimatedTime:()=>{let t=e.artTotalPixels-e.userPaintedPixels;return Ut(e.preciseCurrentCharges,t,e.cooldown)},initializePaintedMap:(t,a)=>{(!e.paintedMap||e.paintedMap.length!==a)&&(e.paintedMap=Array(a).fill().map(()=>Array(t).fill(!1)),console.log(`\u{1F4CB} Initialized painted map: ${t}x${a}`))},markPixelPainted:(t,a,o=0,n=0)=>{let i=t+o,l=a+n;e.paintedMap&&e.paintedMap[l]&&i>=0&&i<e.paintedMap[l].length&&(e.paintedMap[l][i]=!0)},isPixelPainted:(t,a,o=0,n=0)=>{let i=t+o,l=a+n;return e.paintedMap&&e.paintedMap[l]&&i>=0&&i<e.paintedMap[l].length?e.paintedMap[l][i]:!1},shouldAutoSave:()=>{let t=Date.now(),a=e.userPaintedPixels-e._lastSavePixelCount,o=t-e._lastSaveTime;return!e._saveInProgress&&a>=25&&o>=3e4},performSmartSave:()=>{if(!s.shouldAutoSave())return!1;e._saveInProgress=!0;let t=s.saveProgress();return t&&(e._lastSavePixelCount=e.userPaintedPixels,e._lastSaveTime=Date.now(),console.log(`\u{1F4BE} Auto-saved at ${e.userPaintedPixels} pixels`)),e._saveInProgress=!1,t},packPaintedMapToBase64:(t,a,o)=>{if(!t||!a||!o)return null;let n=a*o,i=Math.ceil(n/8),l=new Uint8Array(i),r=0;for(let d=0;d<o;d++){let c=t[d];for(let p=0;p<a;p++){let b=c&&c[p]?1:0,m=r>>3,f=r&7;b&&(l[m]|=1<<f),r++}}let w="",y=32768;for(let d=0;d<l.length;d+=y)w+=String.fromCharCode.apply(null,l.subarray(d,Math.min(d+y,l.length)));return btoa(w)},unpackPaintedMapFromBase64:(t,a,o)=>{if(!t||!a||!o)return null;let n=atob(t),i=new Uint8Array(n.length);for(let w=0;w<n.length;w++)i[w]=n.charCodeAt(w);let l=Array(o).fill().map(()=>Array(a).fill(!1)),r=0;for(let w=0;w<o;w++)for(let y=0;y<a;y++){let d=r>>3,c=r&7;l[w][y]=(i[d]>>c&1)===1,r++}return l},migrateProgressToV2:t=>{if(!t||!(!t.version||t.version==="1"||t.version==="1.0"||t.version==="1.1"))return t;try{let o={...t},n=o.imageData?.width,i=o.imageData?.height;if(o.paintedMap&&n&&i){let l=s.packPaintedMapToBase64(o.paintedMap,n,i);o.paintedMapPacked={width:n,height:i,data:l}}return delete o.paintedMap,o.version="2",o}catch(o){return console.warn("Migration to v2 failed, using original data:",o),t}},migrateProgressToV21:t=>{if(!t||t.version==="2.1")return t;let a=t.version==="2"||t.version==="2.0",o=!t.version||t.version==="1"||t.version==="1.0"||t.version==="1.1";if(!a&&!o)return t;try{let n={...t};if(o){let i=n.imageData?.width,l=n.imageData?.height;if(n.paintedMap&&i&&l){let r=s.packPaintedMapToBase64(n.paintedMap,i,l);n.paintedMapPacked={width:i,height:l,data:r}}delete n.paintedMap}return n.version="2.1",n}catch(n){return console.warn("Migration to v2.1 failed, using original data:",n),t}},migrateProgressToV22:t=>{try{let a={...t};return a.version="2.2",a.state.coordinateMode||(a.state.coordinateMode=T.COORDINATE_MODE),a.state.coordinateDirection||(a.state.coordinateDirection=T.COORDINATE_DIRECTION),a.state.coordinateSnake||(a.state.coordinateSnake=T.COORDINATE_SNAKE),a.state.blockWidth||(a.state.blockWidth=T.COORDINATE_BLOCK_WIDTH),a.state.blockHeight||(a.state.blockHeight=T.COORDINATE_BLOCK_HEIGHT),a}catch(a){return console.warn("Migration to v2.2 failed, using original data:",a),t}},migrateProgressToV23:t=>{try{let a={...t};return a.version="2.3",a.state&&(delete a.state.coordinateMode,delete a.state.coordinateDirection,delete a.state.coordinateSnake,delete a.state.blockWidth,delete a.state.blockHeight,delete a.state.paintedMapPacked,delete a.state.lastPosition,delete a.state.colorsChecked,delete a.state.imageLoaded,a.state.totalPixels!=null&&(a.state.artTotalPixels=a.state.totalPixels,delete a.state.totalPixels),a.state.paintedPixels!=null&&(a.state.userPaintedPixels=a.state.paintedPixels,delete a.state.paintedPixels)),a}catch(a){return console.warn("Migration to v2.3 failed, using original data:",a),t}},buildPaintedMapPacked(){if(e.paintedMap&&e.imageData){let t=s.packPaintedMapToBase64(e.paintedMap,e.imageData.width,e.imageData.height);if(t)return{width:e.imageData.width,height:e.imageData.height,data:t}}return null},buildProgressData(){return{timestamp:Date.now(),version:"2.3",state:{artTotalPixels:e.artTotalPixels,userPaintedPixels:e.userPaintedPixels,startPosition:e.startPosition,region:e.region,availableColors:e.availableColors},imageData:e.imageData?{width:e.imageData.width,height:e.imageData.height,pixels:Array.from(e.imageData.pixels),totalPixels:e.imageData.totalPixels}:null}},migrateProgress(t){if(!t)return null;let a=t,o=a.version;return(!o||o==="1"||o==="1.0"||o==="1.1")&&(a=s.migrateProgressToV2(a)),(a.version==="2"||a.version==="2.0")&&(a=s.migrateProgressToV21(a)),a.version==="2.1"&&(a=s.migrateProgressToV22(a)),a.version==="2.2"&&(a=s.migrateProgressToV23(a)),a},saveProgress:()=>{try{let t=s.buildProgressData(e);return je("wplace-bot-progress",t)}catch(t){return console.error("Error saving progress:",t),!1}},loadProgress:()=>{try{let t=Wt("wplace-bot-progress");if(!t)return null;let a=s.migrateProgress(t);return a&&a!==t&&je("wplace-bot-progress",a),a}catch(t){return console.error("Error loading progress:",t),null}},clearProgress:()=>{try{return localStorage.removeItem("wplace-bot-progress"),e._lastSavePixelCount=0,e._lastSaveTime=0,console.log("\u{1F4CB} Progress and painted map cleared"),!0}catch(t){return console.error("Error clearing progress:",t),!1}},restoreProgress:t=>{try{let a=s.migrateProgress(t);if(Object.assign(e,a.state),a.imageData){e.imageData={...a.imageData,pixels:new Uint8ClampedArray(a.imageData.pixels)};try{let o=document.createElement("canvas");o.width=e.imageData.width,o.height=e.imageData.height;let n=o.getContext("2d"),i=new ImageData(e.imageData.pixels,e.imageData.width,e.imageData.height);n.putImageData(i,0,0);let l=new vt("");l.img=o,l.canvas=o,l.ctx=n,e.imageData.processor=l}catch(o){console.warn("Could not rebuild processor from saved image data:",o)}}return!0}catch(a){return console.error("Error restoring progress:",a),!1}},saveProgressToFile:()=>{try{let t=s.buildProgressData(),a=`wplace-bot-progress-${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;return s.createFileDownloader(JSON.stringify(t,null,2),a),!0}catch(t){return console.error("Error saving to file:",t),!1}},loadProgressFromFile:async()=>{try{let t=await s.createFileUploader();if(!t||!t.state)throw new Error("Invalid file format");return s.restoreProgress(t)}catch(t){throw console.error("Error loading from file:",t),t}},restoreOverlayFromData:async()=>{if(!e.imageLoaded||!e.imageData||!e.startPosition||!e.region)return!1;try{let t=new ImageData(e.imageData.pixels,e.imageData.width,e.imageData.height),a=new OffscreenCanvas(e.imageData.width,e.imageData.height);a.getContext("2d").putImageData(t,0,0);let n=await a.transferToImageBitmap();await xe.setImage(n),await xe.setPosition(e.startPosition,e.region),xe.enable();let i=document.getElementById("toggleOverlayBtn");return i&&(i.disabled=!1,i.classList.add("active")),console.log("Overlay restored from data"),!0}catch(t){return console.error("Failed to restore overlay from data:",t),!1}},updateCoordinateUI({mode:t,directionControls:a,snakeControls:o,blockControls:n}){let i=t==="rows"||t==="columns",l=t==="blocks"||t==="shuffle-blocks";a&&(a.style.display=i?"block":"none"),o&&(o.style.display=i?"block":"none"),n&&(n.style.display=l?"block":"none")}},vt=class{constructor(a){this.imageSrc=a,this.img=null,this.canvas=null,this.ctx=null}async load(){return new Promise((a,o)=>{this.img=new Image,this.img.crossOrigin="anonymous",this.img.onload=()=>{this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("2d"),this.canvas.width=this.img.width,this.canvas.height=this.img.height,this.ctx.drawImage(this.img,0,0),a()},this.img.onerror=o,this.img.src=this.imageSrc})}getDimensions(){return{width:this.canvas.width,height:this.canvas.height}}getPixelData(){return this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height).data}resize(a,o){let n=document.createElement("canvas"),i=n.getContext("2d");return n.width=a,n.height=o,i.imageSmoothingEnabled=!1,i.drawImage(this.canvas,0,0,a,o),this.canvas.width=a,this.canvas.height=o,this.ctx.imageSmoothingEnabled=!1,this.ctx.drawImage(n,0,0),this.ctx.getImageData(0,0,a,o).data}generatePreview(a,o){let n=document.createElement("canvas"),i=n.getContext("2d");return n.width=a,n.height=o,i.imageSmoothingEnabled=!1,i.drawImage(this.img,0,0,a,o),n.toDataURL()}},Ra={async paintPixelInRegion(t,a,o,n,i){try{if(await za(),!we)return"token_error";let l={coords:[o,n],colors:[i],t:we},r=await fetch(`https://backend.wplace.live/s0/pixel/${t}/${a}`,{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8"},credentials:"include",body:JSON.stringify(l)});return r.status===403?(console.error("\u274C 403 Forbidden. Turnstile token might be invalid or expired."),we=null,lt=new Promise(y=>{ze=y}),"token_error"):(await r.json())?.painted===1}catch(l){return console.error("Paint request failed:",l),!1}},async getCharges(){let t={charges:0,max:1,cooldown:T.COOLDOWN_DEFAULT};try{let a=await fetch("https://backend.wplace.live/me",{credentials:"include"});if(!a.ok)return console.error(`Failed to get charges: HTTP ${a.status}`),t;let o=await a.json();return{charges:o.charges?.count??0,max:o.charges?.max??1,cooldown:o.charges?.cooldownMs??T.COOLDOWN_DEFAULT}}catch(a){return console.error("Failed to get charges:",a),t}}},Ke={pollTimer:null,pollIntervalMs:6e4,icon(){return document.querySelector("link[rel~='icon']")?.href||location.origin+"/favicon.ico"},async requestPermission(){if(!("Notification"in window))return s.showAlert(s.t("notificationsNotSupported"),"warning"),"denied";if(Notification.permission==="granted")return"granted";try{return await Notification.requestPermission()}catch{return Notification.permission}},canNotify(){return e.notificationsEnabled&&typeof Notification<"u"&&Notification.permission==="granted"},notify(t,a,o="wplace-charges",n=!1){if(!this.canNotify()||!n&&e.notifyOnlyWhenUnfocused&&document.hasFocus())return!1;try{return new Notification(t,{body:a,tag:o,renotify:!0,icon:this.icon(),badge:this.icon(),silent:!1}),!0}catch{return s.showAlert(a,"info"),!1}},resetEdgeTracking(){e._lastChargesBelow=e.displayCharges<e.cooldownChargeThreshold,e._lastChargesNotifyAt=0},maybeNotifyChargesReached(t=!1){if(!e.notificationsEnabled||!e.notifyOnChargesReached)return;let a=e.displayCharges>=e.cooldownChargeThreshold,o=Date.now(),n=Math.max(1,Number(e.notificationIntervalMinutes||5))*6e4;if(a){let i=e._lastChargesBelow||t,l=o-(e._lastChargesNotifyAt||0)>=n;if(i||l){let r=s.t("chargesReadyMessage",{current:e.displayCharges,max:e.maxCharges,threshold:e.cooldownChargeThreshold});this.notify(s.t("chargesReadyNotification"),r,"wplace-notify-charges"),e._lastChargesNotifyAt=o}e._lastChargesBelow=!1}else e._lastChargesBelow=!0},startPolling(){this.stopPolling(),!(!e.notificationsEnabled||!e.notifyOnChargesReached)&&(this.pollTimer=setInterval(async()=>{try{let{charges:t,cooldown:a,max:o}=await Ra.getCharges();e.displayCharges=Math.floor(t),e.cooldown=a,e.maxCharges=Math.max(1,Math.floor(o)),this.maybeNotifyChargesReached()}catch{}},this.pollIntervalMs))},stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)},syncFromState(){this.resetEdgeTracking(),e.notificationsEnabled&&e.notifyOnChargesReached?this.startPolling():this.stopPolling()}},Le=new Map,H=()=>{},_e=t=>{},yt=()=>{};function Rt(){e.activeColorPalette=[];let t=document.querySelectorAll(".wplace-color-swatch.active");t&&t.forEach(a=>{let o=a.getAttribute("data-rgb");if(o){let n=o.split(",").map(Number);e.activeColorPalette.push(n)}}),document.querySelector(".resize-container")?.style.display==="block"&&be()}function $a(t,a=!1){let o=document.querySelectorAll(".wplace-color-swatch");o&&o.forEach(n=>{let i=n.classList.contains("unavailable");(!i||a)&&(i||n.classList.toggle("active",t))}),Rt()}function In(){let t=document.querySelectorAll(".wplace-color-swatch");t&&t.forEach(a=>{let o=parseInt(a.getAttribute("data-color-id"),10);!isNaN(o)&&o>=32&&a.classList.toggle("active",!1)}),Rt()}function Mn(t){let a=t.querySelector("#colors-container"),o=t.querySelector("#showAllColorsToggle");if(!a)return;if(!e.availableColors||e.availableColors.length===0){a.innerHTML=`<div class="wplace-colors-placeholder">${s.t("uploadImageFirst")}</div>`;return}function n(i=!1){a.innerHTML="";let l=0,r=0;Object.values(T.COLOR_MAP).forEach(y=>{let{id:d,name:c,rgb:p}=y,b=`${p.r},${p.g},${p.b}`;r++;let m=e.availableColors.some(k=>k.rgb[0]===p.r&&k.rgb[1]===p.g&&k.rgb[2]===p.b);if(!i&&!m)return;m&&l++;let f=s.createElement("div",{className:"wplace-color-item"}),u=s.createElement("button",{className:`wplace-color-swatch ${m?"":"unavailable"}`,title:`${c} (ID: ${d})${m?"":" (Unavailable)"}`,"data-rgb":b,"data-color-id":d});u.style.backgroundColor=`rgb(${p.r}, ${p.g}, ${p.b})`,m?u.classList.add("active"):(u.style.opacity="0.4",u.style.filter="grayscale(50%)",u.disabled=!0);let P=s.createElement("span",{className:"wplace-color-item-name",style:m?"":"color: #888; font-style: italic;"},c+(m?"":" (N/A)"));m&&u.addEventListener("click",()=>{u.classList.toggle("active"),Rt()}),f.appendChild(u),f.appendChild(P),a.appendChild(f)}),Rt()}n(!1),o&&o.addEventListener("change",i=>{n(i.target.checked)}),t.querySelector("#selectAllBtn")?.addEventListener("click",()=>$a(!0,o?.checked)),t.querySelector("#unselectAllBtn")?.addEventListener("click",()=>$a(!1,o?.checked)),t.querySelector("#unselectPaidBtn")?.addEventListener("click",()=>In())}async function ua(){let t=performance.now();if(e.tokenSource==="manual")return console.log("\u{1F3AF} Manual token source selected - using pixel placement automation"),await ga();try{let{sitekey:a,token:o}=await s.obtainSitekeyAndToken();if(!a)throw new Error("No valid sitekey found");console.log("\u{1F511} Generating Turnstile token for sitekey:",a),console.log("\u{1F9ED} UA:",navigator.userAgent.substring(0,50)+"...","Platform:",navigator.platform),window.turnstile||await s.loadTurnstile();let n=null;if(o&&typeof o=="string"&&o.length>20?(console.log("\u267B\uFE0F Reusing pre-generated token from sitekey detection phase"),n=o):rt()?(console.log("\u267B\uFE0F Using existing cached token (from previous operation)"),n=we):(console.log("\u{1F510} No valid pre-generated or cached token, creating new one..."),n=await s.executeTurnstile(a,"paint"),n&&nt(n)),console.log(`\u{1F50D} Token received - Type: ${typeof n}, Value: ${n?typeof n=="string"?n.length>50?n.substring(0,50)+"...":n:JSON.stringify(n):"null/undefined"}, Length: ${n?.length||0}`),typeof n=="string"&&n.length>20){let i=Math.round(performance.now()-t);return console.log(`\u2705 Turnstile token generated successfully in ${i}ms`),n}else throw new Error(`Invalid or empty token received - Type: ${typeof n}, Value: ${JSON.stringify(n)}, Length: ${n?.length||0}`)}catch(a){let o=Math.round(performance.now()-t);if(console.error(`\u274C Turnstile token generation failed after ${o}ms:`,a),e.tokenSource==="hybrid")return console.log("\u{1F504} Hybrid mode: Generator failed, automatically switching to manual pixel placement..."),await ga();throw a}}async function Wa(){let t=document.getElementById("wplace-image-bot-container"),a=document.getElementById("wplace-stats-container"),o=document.getElementById("wplace-settings-container"),n=document.querySelector(".resize-container"),i=document.querySelector(".resize-overlay");t&&t.remove(),a&&a.remove(),o&&o.remove(),n&&n.remove(),i&&i.remove(),await xn(),s.appendLinkOnce("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"),s.appendLinkOnce("https://skalsech.github.io/WPlace-AutoBOT/custom-main/auto-image-styles.css",{"data-wplace-theme":"true"});let l=document.createElement("div");l.id="wplace-image-bot-container",l.innerHTML=`
      <div class="wplace-header">
        <div class="wplace-header-title">
          <i class="fas fa-image"></i>
          <span>${s.t("title")}</span>
        </div>
        <div class="wplace-header-controls">
          <button id="settingsBtn" class="wplace-header-btn" title="${s.t("settings")}">
            <i class="fas fa-cog"></i>
          </button>
          <button id="statsBtn" class="wplace-header-btn" title="${s.t("showStats")}">
            <i class="fas fa-chart-bar"></i>
          </button>
          <button id="compactBtn" class="wplace-header-btn" title="${s.t("compactMode")}">
            <i class="fas fa-compress"></i>
          </button>
          <button id="minimizeBtn" class="wplace-header-btn" title="${s.t("minimize")}">
            <i class="fas fa-minus"></i>
          </button>
        </div>
      </div>
      <div class="wplace-content">
        <!-- Status Section - Always visible -->
        <div class="wplace-status-section">
          <div id="statusText" class="wplace-status status-default">
            ${s.t("initMessage")}
          </div>
          <div class="wplace-progress">
            <div id="progressBar" class="wplace-progress-bar" style="width: 0%"></div>
          </div>
        </div>

        <!-- Image Section -->
        <div class="wplace-section">
          <div class="wplace-section-title">\u{1F5BC}\uFE0F Image Management</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="uploadBtn" class="wplace-btn wplace-btn-upload" disabled title="${s.t("waitingSetupComplete")}">
                <i class="fas fa-upload"></i>
                <span>${s.t("uploadImage")}</span>
              </button>
              <button id="resizeBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-expand"></i>
                <span>${s.t("resizeImage")}</span>
              </button>
            </div>
            <div class="wplace-row single">
              <button id="selectPosBtn" class="wplace-btn wplace-btn-select" disabled>
                <i class="fas fa-crosshairs"></i>
                <span>${s.t("selectPosition")}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Control Section -->
        <div class="wplace-section">
          <div class="wplace-section-title">\u{1F3AE} Painting Control</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="startBtn" class="wplace-btn wplace-btn-start" disabled>
                <i class="fas fa-play"></i>
                <span>${s.t("startPainting")}</span>
              </button>
              <button id="stopBtn" class="wplace-btn wplace-btn-stop" disabled>
                <i class="fas fa-stop"></i>
                <span>${s.t("stopPainting")}</span>
              </button>
            </div>
            <div class="wplace-row single">
                <button id="toggleOverlayBtn" class="wplace-btn wplace-btn-overlay" disabled>
                    <i class="fas fa-eye"></i>
                    <span>${s.t("toggleOverlay")}</span>
                </button>
            </div>
          </div>
        </div>

        <!-- Cooldown Section -->
        <div class="wplace-section">
            <div class="wplace-section-title">\u23F1\uFE0F ${s.t("cooldownSettings")}</div>
            <div class="wplace-cooldown-control">
                <label id="cooldownLabel">${s.t("waitCharges")}:</label>
                <div class="wplace-slider-container">
                    <input type="range" id="cooldownSlider" class="wplace-slider" min="1" max="1" value="${e.cooldownChargeThreshold}">
                    <span id="cooldownValue" class="wplace-cooldown-value">${e.cooldownChargeThreshold}</span>
                </div>
            </div>
        </div>

        <!-- Data Section -->
        <div class="wplace-section">
          <div class="wplace-section-title">\u{1F4BE} Data Management</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="saveBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-save"></i>
                <span>${s.t("saveData")}</span>
              </button>
              <button id="loadBtn" class="wplace-btn wplace-btn-primary" disabled title="${s.t("waitingTokenGenerator")}">
                <i class="fas fa-folder-open"></i>
                <span>${s.t("loadData")}</span>
              </button>
            </div>
            <div class="wplace-row">
              <button id="saveToFileBtn" class="wplace-btn wplace-btn-file" disabled>
                <i class="fas fa-download"></i>
                <span>${s.t("saveToFile")}</span>
              </button>
              <button id="loadFromFileBtn" class="wplace-btn wplace-btn-file" disabled title="${s.t("waitingTokenGenerator")}">
                <i class="fas fa-upload"></i>
                <span>${s.t("loadFromFile")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;let r=document.createElement("div");r.id="wplace-stats-container",r.style.display="block",r.innerHTML=`
      <div class="wplace-header">
        <div class="wplace-header-title">
          <i class="fas fa-chart-bar"></i>
          <span>${s.t("paintingStats")}</span>
        </div>
        <div class="wplace-header-controls">
          <button id="refreshChargesBtn" class="wplace-header-btn" title="${s.t("refreshCharges")}">
            <i class="fas fa-sync"></i>
          </button>
          <button id="closeStatsBtn" class="wplace-header-btn" title="${s.t("closeStats")}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="wplace-content">
        <div class="wplace-stats">
          <div id="statsArea">
            <div id="wplace-init-msg" class="wplace-stat-item">
              <div class="wplace-stat-label">
                <i class="fas fa-info-circle"></i> ${s.t("initMessage")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;function w(){return["wplace-charge-stats","wplace-image-stats","wplace-colors-section"].every(v=>{let B=document.getElementById(v);return B&&getComputedStyle(B).display!=="none"})}function y(){if(w()){let h=document.getElementById("wplace-init-msg");h&&h.remove()}}let d=document.createElement("div");d.id="wplace-settings-container",d.className="wplace-settings-container-base",d.innerHTML=`
      <div class="wplace-settings-header">
        <div class="wplace-settings-title-wrapper">
          <h3 class="wplace-settings-title">
            <i class="fas fa-cog wplace-settings-icon"></i>
            ${s.t("settings")}
          </h3>
          <button id="closeSettingsBtn" class="wplace-settings-close-btn">\u2715</button>
        </div>
      </div>

      <div class="wplace-settings-content">
        
        <!-- Token Source Selection -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-key wplace-icon-key"></i>
            Token Source
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="tokenSourceSelect" class="wplace-settings-select">
              <option value="generator" ${e.tokenSource==="generator"?"selected":""} class="wplace-settings-option">\u{1F916} Automatic Token Generator (Recommended)</option>
              <option value="hybrid" ${e.tokenSource==="hybrid"?"selected":""} class="wplace-settings-option">\u{1F504} Generator + Auto Fallback</option>
              <option value="manual" ${e.tokenSource==="manual"?"selected":""} class="wplace-settings-option">\u{1F3AF} Manual Pixel Placement</option>
            </select>
            <p class="wplace-settings-description">
              Generator mode creates tokens automatically. Hybrid mode falls back to manual when generator fails. Manual mode only uses pixel placement.
            </p>
          </div>
        </div>

        <!-- Automation Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-robot wplace-icon-robot"></i>
            ${s.t("automation")}
          </label>
          <!-- Token generator is always enabled - settings moved to Token Source above -->
        </div>

        <!-- Overlay Settings Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-eye wplace-icon-eye"></i>
            Overlay Settings
          </label>
          <div class="wplace-settings-section-wrapper wplace-overlay-wrapper">
              <!-- Opacity Slider -->
              <div class="wplace-overlay-opacity-control">
                <div class="wplace-overlay-opacity-header">
                   <span class="wplace-overlay-opacity-label">Overlay Opacity</span>
                   <div id="overlayOpacityValue" class="wplace-overlay-opacity-value">
                    ${Math.round(e.overlayOpacity*100)}%
                   </div>
                </div>
                <input type="range" id="overlayOpacitySlider" min="0.1" max="1" step="0.05" value="${e.overlayOpacity}" class="wplace-overlay-opacity-slider">
              </div>
              <!-- Blue Marble Toggle -->
              <label for="enableBlueMarbleToggle" class="wplace-settings-toggle">
                  <div>
                      <span class="wplace-settings-toggle-title">Blue Marble Effect</span>
                      <p class="wplace-settings-toggle-description">Renders a dithered "shredded" overlay.</p>
                  </div>
                  <input type="checkbox" id="enableBlueMarbleToggle" ${e.blueMarbleEnabled?"checked":""} class="wplace-settings-checkbox"/>
              </label>
          </div>
        </div>

        <!-- Paint Options Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-paint-brush wplace-icon-paint"></i>
            ${s.t("paintOptions")}
          </label>
          <!-- Pixel Filter Toggles -->
          <div id="pixelFilterControls" class="wplace-settings-section-wrapper wplace-pixel-filter-controls">
            <!-- Paint White Pixels -->
            <label class="wplace-settings-toggle">
              <div>
                <span class="wplace-settings-toggle-title">
                  ${s.t("paintWhitePixels")}
                </span>
                <p class="wplace-settings-toggle-description">
                  ${s.t("paintWhitePixelsDescription")}
                </p>
              </div>
              <input type="checkbox" id="settingsPaintWhiteToggle" ${e.paintWhitePixels?"checked":""} 
                class="wplace-settings-checkbox"
              />
            </label>
            
            <!-- Paint Transparent Pixels -->
            <label class="wplace-settings-toggle">
              <div>
                <span class="wplace-settings-toggle-title">
                  ${s.t("paintTransparentPixels")}
                </span>
                <p class="wplace-settings-toggle-description">
                  ${s.t("paintTransparentPixelsDescription")}
                </p>
              </div>
              <input type="checkbox" id="settingsPaintTransparentToggle" ${e.paintTransparentPixels?"checked":""} 
                class="wplace-settings-checkbox"
              />
            </label>
            <label class="wplace-settings-toggle">
              <div>
                <span class="wplace-settings-toggle-title">${s.t("paintUnavailablePixels")}</span>
                <p class="wplace-settings-toggle-description">${s.t("paintUnavailablePixelsDescription")}</p>
              </div>
              <input type="checkbox" id="paintUnavailablePixelsToggle" ${e.paintUnavailablePixels?"checked":""} class="wplace-settings-checkbox"/>
            </label>
          </div>
        </div>

        <!-- Speed Control Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-tachometer-alt wplace-icon-speed"></i>
            ${s.t("paintingSpeed")}
          </label>
          
          <!-- Batch Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-dice wplace-icon-dice"></i>
              Batch Mode
            </label>
            <select id="batchModeSelect" class="wplace-settings-select">
              <option value="normal" class="wplace-settings-option">\u{1F4E6} Normal (Fixed Size)</option>
              <option value="random" class="wplace-settings-option">\u{1F3B2} Random (Range)</option>
            </select>
          </div>
          
          <!-- Normal Mode: Fixed Size Slider -->
          <div id="normalBatchControls" class="wplace-batch-controls wplace-normal-batch-controls">
            <div class="wplace-speed-slider-container">
              <input type="range" id="speedSlider" min="${T.PAINTING_SPEED.MIN}" max="${T.PAINTING_SPEED.MAX}" value="${T.PAINTING_SPEED.DEFAULT}" class="wplace-speed-slider">
              <div id="speedValue" class="wplace-speed-value">${T.PAINTING_SPEED.DEFAULT} (batch size)</div>
            </div>
            <div class="wplace-speed-labels">
              <span class="wplace-speed-min"><i class="fas fa-turtle"></i> ${T.PAINTING_SPEED.MIN}</span>
              <span class="wplace-speed-max"><i class="fas fa-rabbit"></i> ${T.PAINTING_SPEED.MAX}</span>
            </div>
          </div>
          
          <!-- Random Mode: Range Controls -->
          <div id="randomBatchControls" class="wplace-batch-controls wplace-random-batch-controls">
            <div class="wplace-random-batch-grid">
              <div>
                <label class="wplace-random-batch-label">
                  <i class="fas fa-arrow-down wplace-icon-min"></i>
                  Minimum Batch Size
                </label>
                <input type="number" id="randomBatchMin" min="1" max="1000" value="${T.RANDOM_BATCH_RANGE.MIN}" class="wplace-settings-number-input">
              </div>
              <div>
                <label class="wplace-random-batch-label">
                  <i class="fas fa-arrow-up wplace-icon-max"></i>
                  Maximum Batch Size
                </label>
                <input type="number" id="randomBatchMax" min="1" max="1000" value="${T.RANDOM_BATCH_RANGE.MAX}" class="wplace-settings-number-input">
              </div>
            </div>
            <p class="wplace-random-batch-description">
              \u{1F3B2} Random batch size between min and max values
            </p>
          </div>
          
          <!-- Speed Control Toggle -->
          <label class="wplace-speed-control-toggle">
            <input type="checkbox" id="enableSpeedToggle" ${T.PAINTING_SPEED_ENABLED?"checked":""} class="wplace-speed-checkbox"/>
            <span>${s.t("enablePaintingSpeedLimit")}</span>
          </label>
        </div>
        
        <!-- Coordinate Generation Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-route wplace-icon-route"></i>
            Coordinate Generation
          </label>
          
          <!-- Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-th wplace-icon-table"></i>
              Generation Mode
            </label>
            <select id="coordinateModeSelect" class="wplace-settings-select">
              <option value="rows" class="wplace-settings-option">\u{1F4CF} Rows (Horizontal Lines)</option>
              <option value="columns" class="wplace-settings-option">\u{1F4D0} Columns (Vertical Lines)</option>
              <option value="circle-out" class="wplace-settings-option">\u2B55 Circle Out (Center \u2192 Edges)</option>
              <option value="circle-in" class="wplace-settings-option">\u2B55 Circle In (Edges \u2192 Center)</option>
              <option value="blocks" class="wplace-settings-option">\u{1F7EB} Blocks (Ordered)</option>
              <option value="shuffle-blocks" class="wplace-settings-option">\u{1F3B2} Shuffle Blocks (Random)</option>
            </select>
          </div>
          
          <!-- Direction Selection (only for rows/columns) -->
          <div id="directionControls" class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-compass wplace-icon-compass"></i>
              Starting Direction
            </label>
            <select id="coordinateDirectionSelect" class="wplace-settings-select">
              <option value="top-left" class="wplace-settings-option">\u2196\uFE0F Top-Left</option>
              <option value="top-right" class="wplace-settings-option">\u2197\uFE0F Top-Right</option>
              <option value="bottom-left" class="wplace-settings-option">\u2199\uFE0F Bottom-Left</option>
              <option value="bottom-right" class="wplace-settings-option">\u2198\uFE0F Bottom-Right</option>
            </select>
          </div>
          
          <!-- Snake Pattern Toggle (only for rows/columns) -->
          <div id="snakeControls" class="wplace-snake-pattern-controls wplace-settings-section-wrapper">
            <label class="wplace-settings-toggle">
              <div>
                <span class="wplace-settings-toggle-title">Snake Pattern</span>
                <p class="wplace-settings-toggle-description">Alternate direction for each row/column (zigzag pattern)</p>
              </div>
              <input type="checkbox" id="coordinateSnakeToggle" ${e.coordinateSnake?"checked":""} class="wplace-settings-checkbox"/>
            </label>
          </div>
          
          <!-- Block Size Controls (only for blocks/shuffle-blocks) -->
          <div id="blockControls" class="wplace-block-size-controls wplace-settings-section-wrapper wplace-shuffle-block-size-controls">
            <div class="wplace-block-size-grid">
              <div>
                <label class="wplace-block-size-label">
                  <i class="fas fa-arrows-alt-h wplace-icon-width"></i>
                  Block Width
                </label>
                <input type="number" id="blockWidthInput" min="1" max="50" value="6" class="wplace-settings-number-input">
              </div>
              <div>
                <label style="display: block; color: rgba(255,255,255,0.8); font-size: 12px; margin-bottom: 8px;">
                  <i class="fas fa-arrows-alt-v wplace-icon-height"></i>
                  Block Height
                </label>
                <input type="number" id="blockHeightInput" min="1" max="50" value="2" class="wplace-settings-number-input">
              </div>
            </div>
            <p class="wplace-block-size-description">
              \u{1F9F1} Block dimensions for block-based generation modes
            </p>
          </div>
        </div>
        
        <!-- Notifications Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-bell wplace-icon-bell"></i>
            Desktop Notifications
          </label>
          <div class="wplace-settings-section-wrapper wplace-notifications-wrapper">
            <label class="wplace-notification-toggle">
              <span>${s.t("enableNotifications")}</span>
              <input type="checkbox" id="notifEnabledToggle" ${e.notificationsEnabled?"checked":""} class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
              <span>${s.t("notifyOnChargesThreshold")}</span>
              <input type="checkbox" id="notifOnChargesToggle" ${e.notifyOnChargesReached?"checked":""} class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
              <span>${s.t("onlyWhenNotFocused")}</span>
              <input type="checkbox" id="notifOnlyUnfocusedToggle" ${e.notifyOnlyWhenUnfocused?"checked":""} class="wplace-notification-checkbox" />
            </label>
            <div class="wplace-notification-interval">
              <span>${s.t("repeatEvery")}</span>
              <input type="number" id="notifIntervalInput" min="1" max="60" value="${e.notificationIntervalMinutes}" class="wplace-notification-interval-input" />
              <span>${s.t("minutesPl")}</span>
            </div>
            <div class="wplace-notification-buttons">
              <button id="notifRequestPermBtn" class="wplace-btn wplace-btn-secondary wplace-notification-perm-btn"><i class="fas fa-unlock"></i><span>${s.t("grantPermission")}</span></button>
              <button id="notifTestBtn" class="wplace-btn wplace-notification-test-btn"><i class="fas fa-bell"></i><span>${s.t("test")}</span></button>
            </div>
          </div>
        </div>

        <!-- Theme Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-palette wplace-icon-palette"></i>
            ${s.t("themeSettings")}
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="themeSelect" class="wplace-settings-select">
            ${Object.entries(T.THEMES).map(([h,v])=>`<option value="${h}" ${T.currentThemeKey===h?"selected":""} class="wplace-settings-option">${v.name}</option>`).join("")}
            </select>
          </div>
        </div>

        <!-- Language Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-globe wplace-icon-globe"></i>
            ${s.t("language")}
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="languageSelect" class="wplace-settings-select">
              <option value="vi" ${e.language==="vi"?"selected":""} class="wplace-settings-option">\u{1F1FB}\u{1F1F3} Ti\u1EBFng Vi\u1EC7t</option>
              <option value="id" ${e.language==="id"?"selected":""} class="wplace-settings-option">\u{1F1EE}\u{1F1E9} Bahasa Indonesia</option>
              <option value="ru" ${e.language==="ru"?"selected":""} class="wplace-settings-option">\u{1F1F7}\u{1F1FA} \u0420\u0443\u0441\u0441\u043A\u0438\u0439</option>
              <option value="uk" ${e.language==="uk"?"selected":""} class="wplace-settings-option">\u{1F1FA}\u{1F1E6} \u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430</option>
              <option value="en" ${e.language==="en"?"selected":""} class="wplace-settings-option">\u{1F1FA}\u{1F1F8} English</option>
              <option value="pt" ${e.language==="pt"?"selected":""} class="wplace-settings-option">\u{1F1E7}\u{1F1F7} Portugu\xEAs</option>
              <option value="fr" ${e.language==="fr"?"selected":""} class="wplace-settings-option">\u{1F1EB}\u{1F1F7} Fran\xE7ais</option>
              <option value="tr" ${e.language==="tr"?"selected":""} class="wplace-settings-option">\u{1F1F9}\u{1F1F7} T\xFCrk\xE7e</option>
              <option value="zh-CN" ${e.language==="zh-CN"?"selected":""} class="wplace-settings-option">\u{1F1E8}\u{1F1F3} \u7B80\u4F53\u4E2D\u6587</option>
              <option value="zh-TW" ${e.language==="zh-TW"?"selected":""} class="wplace-settings-option">\u{1F1F9}\u{1F1FC} \u7E41\u9AD4\u4E2D\u6587</option>
              <option value="ja" ${e.language==="ja"?"selected":""} class="wplace-settings-option">\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8A9E</option>
              <option value="ko" ${e.language==="ko"?"selected":""} class="wplace-settings-option">\u{1F1F0}\u{1F1F7} \uD55C\uAD6D\uC5B4</option>
              </select>
          </div>
        </div>
      </div>

        <div class="wplace-settings-footer">
             <button id="applySettingsBtn" class="wplace-settings-apply-btn">
                 <i class="fas fa-check"></i> ${s.t("applySettings")}
          </button>
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
    `;let c=document.createElement("div");c.className="resize-container",c.innerHTML=`
      <h3 class="resize-dialog-title">${s.t("resizeImage")}</h3>
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
          ${s.t("keepAspectRatio")}
        </label>
        <label class="resize-checkbox-label">
            <input type="checkbox" id="paintWhiteToggle" checked>
            ${s.t("paintWhitePixels")}
        </label>
        <label class="resize-checkbox-label">
            <input type="checkbox" id="paintTransparentToggle" checked>
            ${s.t("paintTransparentPixels")}
        </label>
        <div class="resize-zoom-controls">
          <button id="zoomOutBtn" class="wplace-btn resize-zoom-btn" title="${s.t("zoomOut")}"><i class="fas fa-search-minus"></i></button>
          <input type="range" id="zoomSlider" class="resize-slider resize-zoom-slider" min="0.1" max="20" value="1" step="0.05">
          <button id="zoomInBtn" class="wplace-btn resize-zoom-btn" title="${s.t("zoomIn")}"><i class="fas fa-search-plus"></i></button>
          <button id="zoomFitBtn" class="wplace-btn resize-zoom-btn" title="${s.t("fitToView")}">${s.t("fit")}</button>
          <button id="zoomActualBtn" class="wplace-btn resize-zoom-btn" title="${s.t("actualSize")}">${s.t("hundred")}</button>
          <button id="panModeBtn" class="wplace-btn resize-zoom-btn" title="${s.t("panMode")}">
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
          <button id="clearIgnoredBtn" class="wplace-btn resize-clear-btn" title="Clear all ignored pixels">Clear</button>
          <button id="invertMaskBtn" class="wplace-btn resize-invert-btn" title="Invert mask">Invert</button>
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
                      <span>${s.t("showAllColorsIncluding")}</span>
                  </label>
              </div>
              <div class="wplace-row" style="display: flex;">
                  <button id="selectAllBtn" class="wplace-btn" style="flex: 1;">Select All</button>
                  <button id="unselectAllBtn" class="wplace-btn" style="flex: 1;">Unselect All</button>
                  <button id="unselectPaidBtn" class="wplace-btn">Unselect Paid</button>
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
              <option value="lab" ${e.colorMatchingAlgorithm==="lab"?"selected":""}>Perceptual (Lab)</option>
            <option value="legacy" ${e.colorMatchingAlgorithm==="legacy"?"selected":""}>Legacy (RGB)</option>
            </select>
          </label>
          <label class="resize-advanced-toggle">
            <div class="resize-advanced-toggle-content">
              <span class="resize-advanced-label-text">Chroma Penalty</span>
              <div class="resize-advanced-description">Preserve vivid colors (Lab only)</div>
            </div>
            <input type="checkbox" id="enableChromaPenaltyToggle" ${e.enableChromaPenalty?"checked":""} class="resize-advanced-checkbox" />
          </label>
          <div class="resize-chroma-weight-control">
            <div class="resize-chroma-weight-header">
              <span>${s.t("chromaWeight")}</span>
              <span id="chromaWeightValue" class="resize-chroma-weight-value">${e.chromaPenaltyWeight}</span>
            </div>
            <input type="range" id="chromaPenaltyWeightSlider" min="0" max="0.5" step="0.01" value="${e.chromaPenaltyWeight}" class="resize-chroma-weight-slider" />
          </div>
          <label class="resize-advanced-toggle">
            <div class="resize-advanced-toggle-content">
              <span class="resize-advanced-label-text">Enable Dithering</span>
              <div class="resize-advanced-description">Floyd\u2013Steinberg error diffusion in preview and applied output</div>
            </div>
            <input type="checkbox" id="enableDitheringToggle" ${e.ditheringEnabled?"checked":""} class="resize-advanced-checkbox" />
          </label>
          <div class="resize-threshold-controls">
            <label class="resize-threshold-label">
              <span class="resize-advanced-label-text">Transparency</span>
              <input type="number" id="transparencyThresholdInput" min="0" max="255" value="${e.customTransparencyThreshold}" class="resize-threshold-input" />
            </label>
            <label class="resize-threshold-label">
              <span class="resize-advanced-label-text">White Thresh</span>
              <input type="number" id="whiteThresholdInput" min="200" max="255" value="${e.customWhiteThreshold}" class="resize-threshold-input" />
            </label>
          </div>
          <button id="resetAdvancedColorBtn" class="wplace-btn resize-reset-advanced-btn">Reset Advanced</button>
        </div>
      </div>

      <div class="resize-buttons">
        <button id="downloadPreviewBtn" class="wplace-btn wplace-btn-primary">
          <i class="fas fa-download"></i>
          <span>${s.t("downloadPreview")}</span>
        </button>
        <button id="confirmResize" class="wplace-btn wplace-btn-start">
          <i class="fas fa-check"></i>
          <span>${s.t("apply")}</span>
        </button>
        <button id="cancelResize" class="wplace-btn wplace-btn-stop">
          <i class="fas fa-times"></i>
          <span>${s.t("cancel")}</span>
        </button>
      </div>
    `;let p=document.createElement("div");p.className="resize-overlay",document.body.appendChild(l),document.body.appendChild(p),document.body.appendChild(c),document.body.appendChild(r),document.body.appendChild(d),l.style.display="block";let b=l.querySelector("#uploadBtn"),m=l.querySelector("#resizeBtn"),f=l.querySelector("#selectPosBtn"),u=l.querySelector("#startBtn"),P=l.querySelector("#stopBtn"),k=l.querySelector("#saveBtn"),A=l.querySelector("#loadBtn"),M=l.querySelector("#saveToFileBtn"),q=l.querySelector("#loadFromFileBtn");l.querySelectorAll(".wplace-section-title").forEach(h=>{if(!h.querySelector("i.arrow")){let v=document.createElement("i");v.className="fas fa-chevron-down arrow",h.appendChild(v)}h.addEventListener("click",()=>{h.parentElement.classList.toggle("collapsed")})}),A&&(A.disabled=!e.initialSetupComplete,A.title=e.initialSetupComplete?"":"\u{1F504} Waiting for initial setup to complete..."),q&&(q.disabled=!e.initialSetupComplete,q.title=e.initialSetupComplete?"":"\u{1F504} Waiting for initial setup to complete..."),b&&(b.disabled=!e.initialSetupComplete,b.title=e.initialSetupComplete?"":"\u{1F504} Waiting for initial setup to complete...");let R=l.querySelector("#minimizeBtn"),J=l.querySelector("#compactBtn"),ie=l.querySelector("#statsBtn"),te=l.querySelector("#toggleOverlayBtn"),ke=l.querySelector("#statusText"),ve=l.querySelector("#progressBar"),se=r.querySelector("#statsArea"),Ie=l.querySelector(".wplace-content"),Ne=r.querySelector("#closeStatsBtn"),Re=r.querySelector("#refreshChargesBtn"),Je=l.querySelector("#cooldownSlider"),ct=l.querySelector("#cooldownValue");(!b||!f||!u||!P)&&console.error("Some UI elements not found:",{uploadBtn:!!b,selectPosBtn:!!f,startBtn:!!u,stopBtn:!!P});let Ht=l.querySelector(".wplace-header");Ze(l);function Ze(h){let v=0,B=0,W=0,ae=0,le=!1,re=h.querySelector(".wplace-header")||h.querySelector(".wplace-settings-header");if(!re){console.warn("No draggable header found for element:",h);return}re.onmousedown=ce;function ce(Z){if(Z.target.closest(".wplace-header-btn")||Z.target.closest("button"))return;Z.preventDefault(),le=!0;let z=h.getBoundingClientRect();h.style.transform="none",h.style.top=z.top+"px",h.style.left=z.left+"px",W=Z.clientX,ae=Z.clientY,h.classList.add("wplace-dragging"),document.onmouseup=ue,document.onmousemove=ge,document.body.style.userSelect="none"}function ge(Z){if(!le)return;Z.preventDefault(),v=W-Z.clientX,B=ae-Z.clientY,W=Z.clientX,ae=Z.clientY;let z=h.offsetTop-B,de=h.offsetLeft-v,Ce=h.getBoundingClientRect(),De=window.innerHeight-Ce.height,me=window.innerWidth-Ce.width;z=Math.max(0,Math.min(z,De)),de=Math.max(0,Math.min(de,me)),h.style.top=z+"px",h.style.left=de+"px"}function ue(){le=!1,h.classList.remove("wplace-dragging"),document.onmouseup=null,document.onmousemove=null,document.body.style.userSelect=""}}Ze(r),Ze(l),ie&&Ne&&(ie.addEventListener("click",()=>{r.style.display!=="none"?(r.style.display="none",ie.innerHTML='<i class="fas fa-chart-bar"></i>',ie.title=s.t("showStats")):(r.style.display="block",ie.innerHTML='<i class="fas fa-chart-line"></i>',ie.title=s.t("hideStats"))}),Ne.addEventListener("click",()=>{r.style.display="none",ie.innerHTML='<i class="fas fa-chart-bar"></i>',ie.title=s.t("showStats")}),Re&&Re.addEventListener("click",async()=>{Re.innerHTML='<i class="fas fa-spinner fa-spin"></i>',Re.disabled=!0;try{await _e(!0)}catch(h){console.error("Error refreshing charges:",h)}finally{Re.innerHTML='<i class="fas fa-sync"></i>',Re.disabled=!1}})),r&&ie&&(ie.innerHTML='<i class="fas fa-chart-bar"></i>',ie.title=s.t("showStats"));let ot=l.querySelector("#settingsBtn"),it=d.querySelector("#closeSettingsBtn"),Qe=d.querySelector("#applySettingsBtn");if(ot&&it&&Qe){ot.addEventListener("click",()=>{d.classList.contains("show")?(d.style.animation="settings-fade-out 0.3s ease-out forwards",d.classList.remove("show"),setTimeout(()=>{d.style.animation=""},300)):(d.classList.add("show"),d.style.animation="settings-slide-in 0.4s ease-out")}),it.addEventListener("click",()=>{d.style.animation="settings-fade-out 0.3s ease-out forwards",d.classList.remove("show"),setTimeout(()=>{d.style.animation=""},300)}),Qe.addEventListener("click",()=>{let D=document.getElementById("colorAlgorithmSelect");D&&(e.colorMatchingAlgorithm=D.value,s.invalidateColorCache({colorMatchingAlgorithm:e.colorMatchingAlgorithm}));let N=document.getElementById("enableChromaPenaltyToggle");N&&(e.enableChromaPenalty=N.checked,s.invalidateColorCache({enableChromaPenalty:e.enableChromaPenalty}));let He=document.getElementById("chromaPenaltyWeightSlider");He&&(e.chromaPenaltyWeight=parseFloat(He.value)||.15,s.invalidateColorCache({chromaPenaltyWeight:e.chromaPenaltyWeight}));let St=document.getElementById("transparencyThresholdInput");if(St){let K=parseInt(St.value,10);!isNaN(K)&&K>=0&&K<=255&&(e.customTransparencyThreshold=K)}let st=document.getElementById("whiteThresholdInput");if(st){let K=parseInt(st.value,10);!isNaN(K)&&K>=200&&K<=255&&(e.customWhiteThreshold=K)}T.TRANSPARENCY_THRESHOLD=e.customTransparencyThreshold,T.WHITE_THRESHOLD=e.customWhiteThreshold;let Ct=document.getElementById("notifEnabledToggle"),xt=document.getElementById("notifOnChargesToggle"),kt=document.getElementById("notifOnlyUnfocusedToggle"),fe=document.getElementById("notifIntervalInput");if(Ct&&(e.notificationsEnabled=!!Ct.checked),xt&&(e.notifyOnChargesReached=!!xt.checked),kt&&(e.notifyOnlyWhenUnfocused=!!kt.checked),fe){let K=parseInt(fe.value,10);!isNaN(K)&&K>=1&&K<=60&&(e.notificationIntervalMinutes=K)}V(),s.showAlert(s.t("settingsSaved"),"success"),it.click(),Ke.syncFromState()}),Ze(d);let h=d.querySelector("#tokenSourceSelect");h&&h.addEventListener("change",D=>{e.tokenSource=D.target.value,V(),console.log(`\u{1F511} Token source changed to: ${e.tokenSource}`);let N={generator:"Automatic Generator",hybrid:"Generator + Auto Fallback",manual:"Manual Pixel Placement"};s.showAlert(s.t("tokenSourceSet",{source:N[e.tokenSource]}),"success")});let v=d.querySelector("#batchModeSelect"),B=d.querySelector("#normalBatchControls"),W=d.querySelector("#randomBatchControls"),ae=d.querySelector("#randomBatchMin"),le=d.querySelector("#randomBatchMax");v&&v.addEventListener("change",D=>{e.batchMode=D.target.value,B&&W&&(D.target.value==="random"?(B.style.display="none",W.style.display="block"):(B.style.display="block",W.style.display="none")),V(),console.log(`\u{1F4E6} Batch mode changed to: ${e.batchMode}`),s.showAlert(s.t("batchModeSet",{mode:e.batchMode==="random"?s.t("randomRange"):s.t("normalFixedSize")}),"success")}),ae&&ae.addEventListener("input",D=>{let N=parseInt(D.target.value);N>=1&&N<=1e3&&(e.randomBatchMin=N,le&&N>e.randomBatchMax&&(e.randomBatchMax=N,le.value=N),V())}),le&&le.addEventListener("input",D=>{let N=parseInt(D.target.value);N>=1&&N<=1e3&&(e.randomBatchMax=N,ae&&N<e.randomBatchMin&&(e.randomBatchMin=N,ae.value=N),V())});let re=d.querySelector("#languageSelect");re&&re.addEventListener("change",async D=>{let N=D.target.value;e.language=N,je("wplace_language",N),await Ft(N),setTimeout(()=>{d.style.display="none",Wa()},100)});let ce=d.querySelector("#themeSelect");ce&&ce.addEventListener("change",D=>{let N=D.target.value;Tn(N)});let ge=d.querySelector("#overlayOpacitySlider"),ue=d.querySelector("#overlayOpacityValue"),Z=d.querySelector("#enableBlueMarbleToggle"),z=d.querySelector("#settingsPaintWhiteToggle"),de=d.querySelector("#settingsPaintTransparentToggle");ge&&ue&&ge.addEventListener("input",D=>{let N=parseFloat(D.target.value);e.overlayOpacity=N,ue.textContent=`${Math.round(N*100)}%`}),z&&(z.checked=e.paintWhitePixels,z.addEventListener("change",D=>{e.paintWhitePixels=D.target.checked,V(),console.log(`\u{1F3A8} Paint white pixels: ${e.paintWhitePixels?"ON":"OFF"}`);let N=e.paintWhitePixels?"White pixels in the template will be painted":"White pixels will be skipped";s.showAlert(N,"success")})),de&&(de.checked=e.paintTransparentPixels,de.addEventListener("change",D=>{e.paintTransparentPixels=D.target.checked,V(),console.log(`\u{1F3A8} Paint transparent pixels: ${e.paintTransparentPixels?"ON":"OFF"}`);let N=e.paintTransparentPixels?"Transparent pixels in the template will be painted with the closest available color":"Transparent pixels will be skipped";s.showAlert(N,"success")}));let Ce=d.querySelector("#speedSlider"),De=d.querySelector("#speedValue");Ce&&De&&Ce.addEventListener("input",D=>{let N=parseInt(D.target.value,10);e.paintingSpeed=N,De.textContent=`${N} (batch size)`,V()}),Z&&Z.addEventListener("click",async()=>{e.blueMarbleEnabled=Z.checked,e.imageLoaded&&xe.imageBitmap&&(s.showAlert(s.t("reprocessingOverlay"),"info"),await xe.processImageIntoChunks(),s.showAlert(s.t("overlayUpdated"),"success"))});let me=d.querySelector("#notifRequestPermBtn"),$=d.querySelector("#notifTestBtn");me&&me.addEventListener("click",async()=>{await Ke.requestPermission()==="granted"?s.showAlert(s.t("notificationsEnabled"),"success"):s.showAlert(s.t("notificationsPermissionDenied"),"warning")}),$&&$.addEventListener("click",()=>{Ke.notify(s.t("testNotificationTitle"),s.t("testNotificationMessage"),"wplace-notify-test",!0)})}let Me=c.querySelector("#widthSlider"),Ae=c.querySelector("#heightSlider"),ha=c.querySelector("#widthValue"),ma=c.querySelector("#heightValue"),fa=c.querySelector("#keepAspect"),ba=c.querySelector("#paintWhiteToggle"),wa=c.querySelector("#paintTransparentToggle"),We=c.querySelector("#zoomSlider"),Tt=c.querySelector("#zoomValue"),dt=c.querySelector("#zoomInBtn"),gt=c.querySelector("#zoomOutBtn"),ya=c.querySelector("#zoomFitBtn"),va=c.querySelector("#zoomActualBtn"),ut=c.querySelector("#panModeBtn"),Se=c.querySelector("#resizePanStage"),pt=c.querySelector("#resizeCanvasStack"),G=c.querySelector("#resizeCanvas"),he=c.querySelector("#maskCanvas"),et=G.getContext("2d"),Ue=he.getContext("2d"),Fa=c.querySelector("#confirmResize"),Ua=c.querySelector("#cancelResize"),Ha=c.querySelector("#downloadPreviewBtn"),Nn=c.querySelector("#clearIgnoredBtn"),qt=d.querySelector("#coordinateModeSelect"),Yt=d.querySelector("#coordinateDirectionSelect"),Vt=d.querySelector("#coordinateSnakeToggle"),qa=d.querySelector("#directionControls"),Ya=d.querySelector("#snakeControls"),Va=d.querySelector("#blockControls"),Gt=d.querySelector("#blockWidthInput"),Xt=d.querySelector("#blockHeightInput"),Kt=d.querySelector("#paintUnavailablePixelsToggle");Kt&&(Kt.checked=e.paintUnavailablePixels,Kt.addEventListener("change",h=>{e.paintUnavailablePixels=h.target.checked,V(),console.log(`\u{1F3A8} Paint unavailable colors: ${e.paintUnavailablePixels?"ON":"OFF"}`);let v=e.paintUnavailablePixels?"Unavailable template colors will be painted with the closest available color":"Unavailable template colors will be skipped";s.showAlert(v,"success")})),qt&&(qt.value=e.coordinateMode,qt.addEventListener("change",h=>{e.coordinateMode=h.target.value,s.updateCoordinateUI({mode:e.coordinateMode,directionControls:qa,snakeControls:Ya,blockControls:Va}),V(),console.log(`\u{1F504} Coordinate mode changed to: ${e.coordinateMode}`),s.showAlert(`Coordinate mode set to: ${e.coordinateMode}`,"success")})),Yt&&(Yt.value=e.coordinateDirection,Yt.addEventListener("change",h=>{e.coordinateDirection=h.target.value,V(),console.log(`\u{1F9ED} Coordinate direction changed to: ${e.coordinateDirection}`),s.showAlert(`Coordinate direction set to: ${e.coordinateDirection}`,"success")})),Vt&&(Vt.checked=e.coordinateSnake,Vt.addEventListener("change",h=>{e.coordinateSnake=h.target.checked,V(),console.log(`\u{1F40D} Snake pattern ${e.coordinateSnake?"enabled":"disabled"}`),s.showAlert(`Snake pattern ${e.coordinateSnake?"enabled":"disabled"}`,"success")})),Gt&&(Gt.value=e.blockWidth,Gt.addEventListener("input",h=>{let v=parseInt(h.target.value);v>=1&&v<=50&&(e.blockWidth=v,V())})),Xt&&(Xt.value=e.blockHeight,Xt.addEventListener("change",h=>{let v=parseInt(h.target.value);v>=1&&v<=50&&(e.blockHeight=v,V())})),J&&J.addEventListener("click",()=>{l.classList.toggle("wplace-compact"),l.classList.contains("wplace-compact")?(J.innerHTML='<i class="fas fa-expand"></i>',J.title=s.t("expandMode")):(J.innerHTML='<i class="fas fa-compress"></i>',J.title=s.t("compactMode"))}),R&&R.addEventListener("click",()=>{e.minimized=!e.minimized,e.minimized?(l.classList.add("wplace-minimized"),Ie.classList.add("wplace-hidden"),R.innerHTML='<i class="fas fa-expand"></i>',R.title=s.t("restore")):(l.classList.remove("wplace-minimized"),Ie.classList.remove("wplace-hidden"),R.innerHTML='<i class="fas fa-minus"></i>',R.title=s.t("minimize")),V()}),te&&te.addEventListener("click",()=>{let h=xe.toggle();te.classList.toggle("active",h),te.setAttribute("aria-pressed",h?"true":"false"),s.showAlert(h?s.t("overlayEnabled"):s.t("overlayDisabled"),"info")}),e.minimized?(l.classList.add("wplace-minimized"),Ie.classList.add("wplace-hidden"),R&&(R.innerHTML='<i class="fas fa-expand"></i>',R.title=s.t("restore"))):(l.classList.remove("wplace-minimized"),Ie.classList.remove("wplace-hidden"),R&&(R.innerHTML='<i class="fas fa-minus"></i>',R.title=s.t("minimize"))),k&&k.addEventListener("click",()=>{if(!e.imageLoaded){s.showAlert(s.t("missingRequirements"),"error");return}s.saveProgress()?(H("autoSaved","success"),s.showAlert(s.t("autoSaved"),"success")):s.showAlert(s.t("errorSavingProgress"),"error")}),A&&A.addEventListener("click",()=>{if(!e.initialSetupComplete){s.showAlert(s.t("pleaseWaitInitialSetup"),"warning");return}let h=s.loadProgress();if(!h){H("noSavedData","warning"),s.showAlert(s.t("noSavedData"),"warning");return}confirm(`${s.t("savedDataFound")}

Saved: ${new Date(h.timestamp).toLocaleString()}
Progress: ${h.state.userPaintedPixels}/${h.state.artTotalPixels} pixels`)&&(s.restoreProgress(h)?(H("dataLoaded","success"),s.showAlert(s.t("dataLoaded"),"success"),yt(),_e(),s.restoreOverlayFromData().catch(W=>{console.error("Failed to restore overlay from localStorage:",W)}),e.hasAvailableColors?(b.disabled=!1,f.disabled=!1):b.disabled=!1,e.imageLoaded&&e.startPosition&&e.region&&e.hasAvailableColors&&(u.disabled=!1)):s.showAlert(s.t("errorLoadingProgress"),"error"))}),M&&M.addEventListener("click",()=>{s.saveProgressToFile()?(H("fileSaved","success"),s.showAlert(s.t("fileSaved"),"success")):s.showAlert(s.t("fileError"),"error")}),q&&q.addEventListener("click",async()=>{if(!e.initialSetupComplete){s.showAlert(s.t("pleaseWaitFileSetup"),"warning");return}try{await s.loadProgressFromFile()&&(H("fileLoaded","success"),s.showAlert(s.t("fileLoaded"),"success"),yt(),await _e(),await s.restoreOverlayFromData().catch(v=>{console.error("Failed to restore overlay from file:",v)}),e.hasAvailableColors?(b.disabled=!1,f.disabled=!1,m.disabled=!1):b.disabled=!1,e.imageLoaded&&e.startPosition&&e.region&&e.hasAvailableColors&&(u.disabled=!1))}catch(h){h.message==="Invalid JSON file"?s.showAlert(s.t("invalidFileFormat"),"error"):s.showAlert(s.t("fileError"),"error")}}),H=(h,v="default",B={},W=!1)=>{let ae=s.t(h,B);ke.textContent=ae,ke.className=`wplace-status status-${v}`,W||(ke.style.animation="none",ke.offsetWidth,ke.style.animation="slide-in 0.3s ease-out")};function Ga(h=null){let v=document.getElementById("wplace-charge-stats");return v||(v=document.createElement("div"),v.id="wplace-charge-stats",v.innerHTML=`
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-bolt"></i> ${s.t("charges")}</div>
        <div class="wplace-stat-value" id="wplace-stat-charges-value">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-battery-half"></i> ${s.t("fullChargeIn")}</div>
        <div class="wplace-stat-value" id="wplace-stat-fullcharge-value">--:--:--</div>
      </div>
    `.trim(),h&&h.parentNode===se?se.insertBefore(v,h.nextSibling):se.appendChild(v)),v}function Xa(h=null){let v=document.getElementById("wplace-image-stats");return v||(v=document.createElement("div"),v.id="wplace-image-stats",v.innerHTML=`
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-image"></i> ${s.t("progress")}</div>
        <div class="wplace-stat-value" id="wplace-stat-progress">--%</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-paint-brush"></i> ${s.t("pixels")}</div>
        <div class="wplace-stat-value" id="wplace-stat-pixels">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-clock"></i> ${s.t("estimatedTime")}</div>
        <div class="wplace-stat-value" id="wplace-stat-estimated">--:--</div>
      </div>
    `,h&&h.parentNode===se?se.insertBefore(v,h.nextSibling):se.appendChild(v)),v}function Ka(h=null){let v=document.getElementById("wplace-colors-section");return v||(v=document.createElement("div"),v.id="wplace-colors-section",v.className="wplace-colors-section",v.innerHTML=`
      <div class="wplace-stat-label" id="wplace-stat-colors-label"></div>
      <div class="wplace-stat-colors-grid" id="wplace-stat-colors-grid"></div>
    `,h&&h.parentNode===se?se.insertBefore(v,h.nextSibling):se.appendChild(v)),v}function Ta(h){let v=document.getElementById("wplace-stat-charges-value"),B=document.getElementById("wplace-stat-fullcharge-value");if(!B&&!v)return;if(!e.fullChargeData){B.textContent="--:--:--";return}let{current:W,max:ae,cooldownMs:le,startTime:re,spentSinceShot:ce}=e.fullChargeData,ue=(Date.now()-re)/le,Z=W+ue-ce,z=Math.min(Z,ae),de;z-Math.floor(z)>=.95?de=Math.ceil(z):de=Math.floor(z),e.displayCharges=Math.max(0,de),e.preciseCurrentCharges=z;let De=Ut(z,ae,e.cooldown,h),me=s.msToTimeText(De);if(v){let $=`${e.displayCharges} / ${e.maxCharges}`;v.textContent!==$&&(v.textContent=$)}if(e.displayCharges<e.cooldownChargeThreshold&&!e.stopFlag&&e.running&&An(h),B){let $;e.displayCharges>=ae?$='<span style="color:#10b981;">FULL</span>':$=`<span style="color:#f59e0b;">${me}</span>`,B.innerHTML!==$&&(B.innerHTML=$)}if(e.imageLoaded){let $=document.getElementById("wplace-stat-estimated");if(!$)return;e.estimatedTime=s.calculateEstimatedTime();let D=s.formatTime(e.estimatedTime);$.textContent!==D&&($.textContent=D)}}function ja(){if(!e.imageLoaded)return;let h=e.artTotalPixels>0?Math.round(e.userPaintedPixels/e.artTotalPixels*100):0;e.estimatedTime=s.calculateEstimatedTime(),ve.style.width=`${h}%`,document.getElementById("wplace-stat-progress").textContent=`${h}%`,document.getElementById("wplace-stat-pixels").textContent=`${e.userPaintedPixels}/${e.artTotalPixels}`,document.getElementById("wplace-stat-estimated").textContent=s.formatTime(e.estimatedTime)}function Ja(){if(!e.hasAvailableColors)return;let h=document.getElementById("wplace-stat-colors-label"),v=document.getElementById("wplace-stat-colors-grid");!h||!v||(h.innerHTML=`<i class="fas fa-palette"></i> ${s.t("availableColors",{count:e.availableColors.length})}`,v.innerHTML=e.availableColors.map(B=>{let W=`rgb(${B.rgb.join(",")})`;return`<div class="wplace-stat-color-swatch" style="${B.id===0?"background: repeating-linear-gradient(45deg, #ccc 0 2px, #fff 2px 4px);background-size: cover;":`background-color: ${W};`}" title="${s.t("colorTooltip",{name:B.name,id:B.id,rgb:B.rgb.join(", ")})}"></div>`}).join(""))}_e=async(h=!1)=>{let v=!e.fullChargeData?.startTime,B=6e4,ae=B+Math.random()*(9e4-B),re=Date.now()-(e.fullChargeData?.startTime||0)>=ae;if(h||v||re){let{charges:de,max:Ce,cooldown:De}=await Ra.getCharges();e.displayCharges=Math.floor(de),e.preciseCurrentCharges=de,e.cooldown=De,e.maxCharges=Math.floor(Ce)>1?Math.floor(Ce):e.maxCharges,e.fullChargeData={current:de,max:Ce,cooldownMs:De,startTime:Date.now(),spentSinceShot:0},Ke.maybeNotifyChargesReached()}e.fullChargeInterval&&(clearInterval(e.fullChargeInterval),e.fullChargeInterval=null);let ge=1e3;e.fullChargeInterval=setInterval(()=>Ta(ge),ge),Je.max!==e.maxCharges&&(Je.max=e.maxCharges);let{availableColors:ue}=s.extractColors(),Z=Array.isArray(ue)?ue.length:0;if(Z===0&&h)s.showAlert(s.t("noColorsFound"),"warning");else if(Z>0&&s.colorsChanged(e.availableColors,ue)){let de=e.availableColors.length;s.showAlert(s.t("colorsUpdated",{oldCount:de,newCount:Z,diffCount:Z-de}),"success"),e.availableColors=ue,s.invalidateColorCache({availableColors:!0})}let z=document.getElementById("wplace-init-msg");e.imageLoaded&&(z=Xa(z)),e.fullChargeData&&(z=Ga(z)),e.hasAvailableColors&&(z=Ka(z)),ja(),Ta(ge),Ja(),y()},yt=()=>{let h=e.imageLoaded&&e.imageData;k.disabled=!h,M.disabled=!h},yt();function Za(h){let v=h,B,W;if(e.originalImage?.dataUrl)v=new vt(e.originalImage.dataUrl),B=e.originalImage.width,W=e.originalImage.height;else{let g=h.getDimensions();B=g.width,W=g.height}let ae=B/W,le=e.resizeSettings;Me.max=B*2,Ae.max=W*2;let re=B,ce=W;le&&Number.isFinite(le.width)&&Number.isFinite(le.height)&&le.width>0&&le.height>0&&(re=le.width,ce=le.height),re=Math.max(parseInt(Me.min,10)||10,Math.min(re,parseInt(Me.max,10))),ce=Math.max(parseInt(Ae.min,10)||10,Math.min(ce,parseInt(Ae.max,10))),Me.value=re,Ae.value=ce,ha.textContent=re,ma.textContent=ce,We.value=1,Tt&&(Tt.textContent="100%"),ba.checked=e.paintWhitePixels,wa.checked=e.paintTransparentPixels;let ge=null,ue=0,Z=!1,z=1,de=null,Ce=null,De=g=>((!de||de.length!==g*3)&&(de=new Float32Array(g*3)),(!Ce||Ce.length!==g)&&(Ce=new Uint8Array(g)),{work:de,eligible:Ce}),me=null,$=null,D=null,N=()=>{D={minX:1/0,minY:1/0,maxX:-1,maxY:-1}},He=(g,S)=>{D||N(),g<D.minX&&(D.minX=g),S<D.minY&&(D.minY=S),g>D.maxX&&(D.maxX=g),S>D.maxY&&(D.maxY=S)},St=()=>{if(!D||D.maxX<D.minX||D.maxY<D.minY)return;let g=Math.max(0,D.minX),S=Math.max(0,D.minY),C=Math.min(he.width-g,D.maxX-g+1),x=Math.min(he.height-S,D.maxY-S+1);C>0&&x>0&&Ue.putImageData(me,0,0,g,S,C,x),N()},st=(g,S,C=!1)=>{if((!me||me.width!==g||me.height!==S)&&(me=Ue.createImageData(g,S),$=me.data,C=!0),C){let x=e.resizeIgnoreMask,E=$;if(E.fill(0),x){for(let I=0;I<x.length;I++)if(x[I]){let O=I*4;E[O]=255,E[O+1]=0,E[O+2]=0,E[O+3]=150}}Ue.putImageData(me,0,0),N()}},Ct=(g,S)=>{(!e.resizeIgnoreMask||e.resizeIgnoreMask.length!==g*S)&&(e.resizeIgnoreMask=new Uint8Array(g*S)),G.width=g,G.height=S,he.width=g,he.height=S,Ue.clearRect(0,0,he.width,he.height),st(g,S,!0)};be=async()=>{let g=++ue,S=parseInt(Me.value,10),C=parseInt(Ae.value,10);if(z=parseFloat(We.value),ha.textContent=S,ma.textContent=C,Ct(S,C),pt.style.width=S+"px",pt.style.height=C+"px",et.imageSmoothingEnabled=!1,!e.availableColors||e.availableColors.length===0){v!==h&&(!v.img||!v.canvas)&&await v.load(),et.clearRect(0,0,S,C),et.drawImage(v.img,0,0,S,C),Ue.clearRect(0,0,he.width,he.height),me&&Ue.putImageData(me,0,0),Jt();return}v!==h&&(!v.img||!v.canvas)&&await v.load(),et.clearRect(0,0,S,C),et.drawImage(v.img,0,0,S,C);let x=et.getImageData(0,0,S,C),E=x.data,I=()=>{let O=S,_=C,j=O*_,{work:U,eligible:Y}=De(j);for(let F=0;F<_;F++)for(let X=0;X<O;X++){let ee=F*O+X,ye=ee*4,Ee=E[ye],Q=E[ye+1],ne=E[ye+2],oe=E[ye+3],pe=(e.paintTransparentPixels||!s.isTransparentPixel(oe))&&(e.paintWhitePixels||!s.isWhitePixel(Ee,Q,ne));Y[ee]=pe?1:0,U[ee*3]=Ee,U[ee*3+1]=Q,U[ee*3+2]=ne,pe||(E[ye+3]=0)}let L=(F,X,ee,ye,Ee,Q)=>{if(F<0||F>=O||X<0||X>=_)return;let ne=X*O+F;if(!Y[ne])return;let oe=ne*3;U[oe]=Math.min(255,Math.max(0,U[oe]+ee*Q)),U[oe+1]=Math.min(255,Math.max(0,U[oe+1]+ye*Q)),U[oe+2]=Math.min(255,Math.max(0,U[oe+2]+Ee*Q))};for(let F=0;F<_;F++)for(let X=0;X<O;X++){let ee=F*O+X;if(!Y[ee])continue;let ye=ee*3,Ee=U[ye],Q=U[ye+1],ne=U[ye+2],[oe,pe,Oe]=s.findClosestPaletteColor(Ee,Q,ne,e.activeColorPalette),Pe=ee*4;E[Pe]=oe,E[Pe+1]=pe,E[Pe+2]=Oe,E[Pe+3]=255;let Be=Ee-oe,Te=Q-pe,Xe=ne-Oe;L(X+1,F,Be,Te,Xe,7/16),L(X-1,F+1,Be,Te,Xe,3/16),L(X,F+1,Be,Te,Xe,5/16),L(X+1,F+1,Be,Te,Xe,1/16)}};if(e.ditheringEnabled&&!Z)I();else for(let O=0;O<E.length;O+=4){let _=E[O],j=E[O+1],U=E[O+2],Y=E[O+3];if(!e.paintTransparentPixels&&s.isTransparentPixel(Y)||!e.paintWhitePixels&&s.isWhitePixel(_,j,U)){E[O+3]=0;continue}let[L,F,X]=s.findClosestPaletteColor(_,j,U,e.activeColorPalette);E[O]=L,E[O+1]=F,E[O+2]=X,E[O+3]=255}g===ue&&(et.putImageData(x,0,0),Ue.clearRect(0,0,he.width,he.height),me&&Ue.putImageData(me,0,0),Jt())};let xt=()=>{fa.checked&&(Ae.value=Math.round(parseInt(Me.value,10)/ae)),be();let g=parseInt(Me.value,10),S=parseInt(Ae.value,10);e.resizeSettings={baseWidth:B,baseHeight:W,width:g,height:S},V();let C=typeof qe=="function"?qe():1;!isNaN(C)&&isFinite(C)&&$e(C)},kt=()=>{fa.checked&&(Me.value=Math.round(parseInt(Ae.value,10)*ae)),be();let g=parseInt(Me.value,10),S=parseInt(Ae.value,10);e.resizeSettings={baseWidth:B,baseHeight:W,width:g,height:S},V();let C=typeof qe=="function"?qe():1;!isNaN(C)&&isFinite(C)&&$e(C)};ba.onchange=g=>{e.paintWhitePixels=g.target.checked,be(),V()},wa.onchange=g=>{e.paintTransparentPixels=g.target.checked,be(),V()};let fe=0,K=0,en=()=>{let g=Se?.getBoundingClientRect()||{width:0,height:0},S=(G.width||1)*z,C=(G.height||1)*z;if(S<=g.width)fe=Math.floor((g.width-S)/2);else{let x=g.width-S;fe=Math.min(0,Math.max(x,fe))}if(C<=g.height)K=Math.floor((g.height-C)/2);else{let x=g.height-C;K=Math.min(0,Math.max(x,K))}},jt=0,Et=()=>{jt||(jt=requestAnimationFrame(()=>{en(),pt.style.transform=`translate3d(${Math.round(fe)}px, ${Math.round(K)}px, 0) scale(${z})`,jt=0}))},Jt=()=>{let g=G.width||1,S=G.height||1;G.style.width=g+"px",G.style.height=S+"px",he.style.width=g+"px",he.style.height=S+"px",pt.style.width=g+"px",pt.style.height=S+"px",Et()},$e=g=>{z=Math.max(.05,Math.min(20,g||1)),We.value=z,Jt(),Tt&&(Tt.textContent=`${Math.round(z*100)}%`)};We.addEventListener("input",()=>{$e(parseFloat(We.value))}),dt&&dt.addEventListener("click",()=>$e(parseFloat(We.value)+.1)),gt&&gt.addEventListener("click",()=>$e(parseFloat(We.value)-.1));let qe=()=>{let g=Se?.getBoundingClientRect();if(!g)return 1;let S=G.width||1,C=G.height||1,x=10,E=(g.width-x)/S,I=(g.height-x)/C;return Math.max(.05,Math.min(20,Math.min(E,I)))};ya&&ya.addEventListener("click",()=>{$e(qe()),ht()}),va&&va.addEventListener("click",()=>{$e(1),ht()});let ht=()=>{if(!Se)return;let g=Se.getBoundingClientRect(),S=(G.width||1)*z,C=(G.height||1)*z;fe=Math.floor((g.width-S)/2),K=Math.floor((g.height-C)/2),Et()},Ye=!1,Pt=0,It=0,Mt=0,At=0,Ve=!1,tt=!1,tn=g=>g.button===1||g.button===2,at=g=>{Se&&(Se.style.cursor=g)},an=g=>tt||Ve||tn(g),Ca=()=>{ut&&(ut.classList.toggle("active",tt),ut.setAttribute("aria-pressed",tt?"true":"false"))};if(ut&&(Ca(),ut.addEventListener("click",()=>{tt=!tt,Ca(),at(tt?"grab":"")})),Se){Se.addEventListener("contextmenu",x=>{Ve&&x.preventDefault()}),window.addEventListener("keydown",x=>{x.code==="Space"&&(Ve=!0,at("grab"))}),window.addEventListener("keyup",x=>{x.code==="Space"&&(Ve=!1,Ye||at(""))}),Se.addEventListener("mousedown",x=>{an(x)&&(x.preventDefault(),Ye=!0,Pt=x.clientX,It=x.clientY,Mt=fe,At=K,at("grabbing"))}),window.addEventListener("mousemove",x=>{if(!Ye)return;let E=x.clientX-Pt,I=x.clientY-It;fe=Mt+E,K=At+I,Et()}),window.addEventListener("mouseup",()=>{Ye&&(Ye=!1,at(Ve?"grab":""))}),Se.addEventListener("wheel",x=>{if(!x.ctrlKey&&!x.metaKey)return;x.preventDefault();let E=Se.getBoundingClientRect(),I=x.clientX-E.left-fe,O=x.clientY-E.top-K,_=z,j=Math.max(.05,Math.min(.5,Math.abs(x.deltaY)>20?.2:.1)),U=Math.max(.05,Math.min(20,_+(x.deltaY>0?-j:j)));if(U===_)return;let Y=U/_;fe=fe-I*(Y-1),K=K-O*(Y-1),$e(U)},{passive:!1});let g=null,S=0,C=null;Se.addEventListener("touchstart",x=>{if(x.touches.length===1){let E=x.touches[0];Ye=!0,Pt=E.clientX,It=E.clientY,Mt=fe,At=K,at("grabbing");let I=Date.now();if(I-S<300){let O=Math.abs(z-1)<.01?qe():1;$e(O),ht(),C&&clearTimeout(C)}else S=I,C=setTimeout(()=>{C=null},320)}else if(x.touches.length===2){let[E,I]=x.touches;g=Math.hypot(I.clientX-E.clientX,I.clientY-E.clientY)}},{passive:!0}),Se.addEventListener("touchmove",x=>{if(x.touches.length===1&&Ye){let E=x.touches[0],I=E.clientX-Pt,O=E.clientY-It;fe=Mt+I,K=At+O,Et()}else if(x.touches.length===2&&g!=null){x.preventDefault();let[E,I]=x.touches,O=Math.hypot(I.clientX-E.clientX,I.clientY-E.clientY),_=Se.getBoundingClientRect(),j=(E.clientX+I.clientX)/2-_.left-fe,U=(E.clientY+I.clientY)/2-_.top-K,Y=z,L=O/(g||O),F=Math.max(.05,Math.min(20,Y*L));F!==Y&&(fe=fe-j*(F/Y-1),K=K-U*(F/Y-1),$e(F)),g=O}},{passive:!1}),Se.addEventListener("touchend",()=>{Ye=!1,g=null,at(tt||Ve?"grab":"")})}let Zt=()=>{ge&&clearTimeout(ge);let g=()=>{ge=null,be()};window.requestIdleCallback?ge=setTimeout(()=>requestIdleCallback(g,{timeout:150}),50):ge=setTimeout(()=>requestAnimationFrame(g),50)},xa=()=>{Z=!0},ka=()=>{Z=!1,Zt()};Me.addEventListener("pointerdown",xa),Ae.addEventListener("pointerdown",xa),Me.addEventListener("pointerup",ka),Ae.addEventListener("pointerup",ka),Me.addEventListener("input",()=>{xt(),Zt()}),Ae.addEventListener("input",()=>{kt(),Zt()});let Bt=!1,nn=-1,on=-1,Lt=1,mt=1,Ge="ignore",ft=c.querySelector("#maskBrushSize"),Qt=c.querySelector("#maskBrushSizeValue"),ea=c.querySelector("#maskModeIgnore"),ta=c.querySelector("#maskModeUnignore"),aa=c.querySelector("#maskModeToggle"),Ea=c.querySelector("#clearIgnoredBtn"),Pa=c.querySelector("#invertMaskBtn"),bt=c.querySelector("#rowColSize"),na=c.querySelector("#rowColSizeValue"),Ia=()=>{let g=[[ea,"ignore"],[ta,"unignore"],[aa,"toggle"]];for(let[S,C]of g){if(!S)continue;let x=Ge===C;S.classList.toggle("active",x),S.setAttribute("aria-pressed",x?"true":"false")}},oa=g=>{Ge=g,Ia()};ft&&Qt&&(ft.addEventListener("input",()=>{Lt=parseInt(ft.value,10)||1,Qt.textContent=Lt}),Qt.textContent=ft.value,Lt=parseInt(ft.value,10)||1),bt&&na&&(bt.addEventListener("input",()=>{mt=parseInt(bt.value,10)||1,na.textContent=mt}),na.textContent=bt.value,mt=parseInt(bt.value,10)||1),ea&&ea.addEventListener("click",()=>oa("ignore")),ta&&ta.addEventListener("click",()=>oa("unignore")),aa&&aa.addEventListener("click",()=>oa("toggle")),Ia();let sn=(g,S)=>{let C=G.getBoundingClientRect(),x=C.width/G.width,E=C.height/G.height,I=(g-C.left)/x,O=(S-C.top)/E,_=Math.floor(I),j=Math.floor(O);return{x:_,y:j}},ia=(g,S)=>{(!e.resizeIgnoreMask||e.resizeIgnoreMask.length!==g*S)&&(e.resizeIgnoreMask=new Uint8Array(g*S))},ln=(g,S,C,x)=>{let E=G.width,I=G.height;ia(E,I);let O=C*C;for(let _=S-C;_<=S+C;_++)if(!(_<0||_>=I))for(let j=g-C;j<=g+C;j++){if(j<0||j>=E)continue;let U=j-g,Y=_-S;if(U*U+Y*Y<=O){let L=_*E+j,F=e.resizeIgnoreMask[L];if(Ge==="toggle"?F=F?0:1:Ge==="ignore"?F=1:F=0,e.resizeIgnoreMask[L]=F,$){let X=L*4;F?($[X]=255,$[X+1]=0,$[X+2]=0,$[X+3]=150):($[X]=0,$[X+1]=0,$[X+2]=0,$[X+3]=0),He(j,_)}}}},rn=(g,S)=>{let C=G.width,x=G.height;if(ia(C,x),g<0||g>=x)return;let E=Math.floor(mt/2),I=Math.max(0,g-E),O=Math.min(x-1,g+E);for(let _=I;_<=O;_++){for(let j=0;j<C;j++){let U=_*C+j,Y=e.resizeIgnoreMask[U];if(Ge==="toggle"?Y=Y?0:1:Ge==="ignore"?Y=1:Y=0,e.resizeIgnoreMask[U]=Y,$){let L=U*4;Y?($[L]=255,$[L+1]=0,$[L+2]=0,$[L+3]=150):($[L]=0,$[L+1]=0,$[L+2]=0,$[L+3]=0)}}$&&(He(0,_),He(C-1,_))}},cn=(g,S)=>{let C=G.width,x=G.height;if(ia(C,x),g<0||g>=C)return;let E=Math.floor(mt/2),I=Math.max(0,g-E),O=Math.min(C-1,g+E);for(let _=I;_<=O;_++){for(let j=0;j<x;j++){let U=j*C+_,Y=e.resizeIgnoreMask[U];if(Ge==="toggle"?Y=Y?0:1:Ge==="ignore"?Y=1:Y=0,e.resizeIgnoreMask[U]=Y,$){let L=U*4;Y?($[L]=255,$[L+1]=0,$[L+2]=0,$[L+3]=150):($[L]=0,$[L+1]=0,$[L+2]=0,$[L+3]=0)}}$&&(He(_,0),He(_,x-1))}},dn=()=>{St()},Ma=g=>{if((g.buttons&4)===4||(g.buttons&2)===2||Ve)return;let{x:S,y:C}=sn(g.clientX,g.clientY),x=G.width,E=G.height;if(S<0||C<0||S>=x||C>=E)return;let I=Math.max(1,Math.floor(Lt/2));g.shiftKey?rn(C):g.altKey?cn(S):ln(S,C,I),nn=S,on=C,dn()};he.addEventListener("mousedown",g=>{g.button===1||g.button===2||Ve||(Bt=!0,Ma(g))}),he.addEventListener("touchstart",g=>{},{passive:!0}),he.addEventListener("touchmove",g=>{},{passive:!0}),he.addEventListener("touchend",g=>{},{passive:!0}),window.addEventListener("mousemove",g=>{Bt&&Ma(g)}),window.addEventListener("mouseup",()=>{Bt&&(Bt=!1,V())}),Ea&&Ea.addEventListener("click",()=>{let g=G.width,S=G.height;e.resizeIgnoreMask&&e.resizeIgnoreMask.fill(0),st(g,S,!0),be(),V()}),Pa&&Pa.addEventListener("click",()=>{if(!e.resizeIgnoreMask)return;for(let C=0;C<e.resizeIgnoreMask.length;C++)e.resizeIgnoreMask[C]=e.resizeIgnoreMask[C]?0:1;let g=G.width,S=G.height;st(g,S,!0),be(),V()}),Fa.onclick=async()=>{let g=parseInt(Me.value,10),S=parseInt(Ae.value,10),C=document.createElement("canvas"),x=C.getContext("2d");C.width=g,C.height=S,x.imageSmoothingEnabled=!1,v!==h&&(!v.img||!v.canvas)&&await v.load(),x.drawImage(v.img,0,0,g,S);let E=x.getImageData(0,0,g,S),I=E.data,O=0,_=e.resizeIgnoreMask&&e.resizeIgnoreMask.length===g*S?e.resizeIgnoreMask:null,j=async()=>{let L=g,F=S,X=L*F,{work:ee,eligible:ye}=De(X);for(let Q=0;Q<F;Q++){for(let ne=0;ne<L;ne++){let oe=Q*L+ne,pe=oe*4,Oe=I[pe],Pe=I[pe+1],Be=I[pe+2],Te=I[pe+3],wt=!(_&&_[oe])&&(e.paintTransparentPixels||!s.isTransparentPixel(Te))&&(e.paintWhitePixels||!s.isWhitePixel(Oe,Pe,Be));ye[oe]=wt?1:0,ee[oe*3]=Oe,ee[oe*3+1]=Pe,ee[oe*3+2]=Be,wt||(I[pe+3]=0)}(Q&15)===0&&await Promise.resolve()}let Ee=(Q,ne,oe,pe,Oe,Pe)=>{if(Q<0||Q>=L||ne<0||ne>=F)return;let Be=ne*L+Q;if(!ye[Be])return;let Te=Be*3;ee[Te]=Math.min(255,Math.max(0,ee[Te]+oe*Pe)),ee[Te+1]=Math.min(255,Math.max(0,ee[Te+1]+pe*Pe)),ee[Te+2]=Math.min(255,Math.max(0,ee[Te+2]+Oe*Pe))};for(let Q=0;Q<F;Q++){for(let ne=0;ne<L;ne++){let oe=Q*L+ne;if(!ye[oe])continue;let pe=oe*3,Oe=ee[pe],Pe=ee[pe+1],Be=ee[pe+2],[Te,Xe,wt]=s.findClosestPaletteColor(Oe,Pe,Be,e.activeColorPalette),Dt=oe*4;I[Dt]=Te,I[Dt+1]=Xe,I[Dt+2]=wt,I[Dt+3]=255,O++;let Ot=Oe-Te,$t=Pe-Xe,_t=Be-wt;Ee(ne+1,Q,Ot,$t,_t,7/16),Ee(ne-1,Q+1,Ot,$t,_t,3/16),Ee(ne,Q+1,Ot,$t,_t,5/16),Ee(ne+1,Q+1,Ot,$t,_t,1/16)}await Promise.resolve()}};if(e.ditheringEnabled)await j();else for(let L=0;L<I.length;L+=4){let F=I[L],X=I[L+1],ee=I[L+2],ye=I[L+3],Ee=_&&_[L>>2],Q=!e.paintTransparentPixels&&s.isTransparentPixel(ye)||Ee,ne=!e.paintWhitePixels&&s.isWhitePixel(F,X,ee);if(Q||ne){I[L+3]=0;continue}O++;let[oe,pe,Oe]=s.findClosestPaletteColor(F,X,ee,e.activeColorPalette);I[L]=oe,I[L+1]=pe,I[L+2]=Oe,I[L+3]=255}x.putImageData(E,0,0);let U=new Uint8ClampedArray(E.data);e.imageData.pixels=U,e.imageData.width=g,e.imageData.height=S,e.imageData.totalPixels=O,e.artTotalPixels=O,e.userPaintedPixels=0,e.resizeSettings={baseWidth:B,baseHeight:W,width:g,height:S},V();let Y=await createImageBitmap(C);await xe.setImage(Y),xe.enable(),te.classList.add("active"),te.setAttribute("aria-pressed","true"),_e(),H("resizeSuccess","success",{width:g,height:S}),Sa()},Ha.onclick=()=>{try{let g=G.width,S=G.height,C=document.createElement("canvas");C.width=g,C.height=S;let x=C.getContext("2d");x.imageSmoothingEnabled=!1,x.drawImage(G,0,0),x.drawImage(he,0,0);let E=document.createElement("a");E.download="wplace-preview.png",E.href=C.toDataURL(),E.click()}catch(g){console.warn("Failed to download preview:",g)}},Ua.onclick=Sa,p.style.display="block",c.style.display="block",Mn(c),be(),zt=()=>{try{We.replaceWith(We.cloneNode(!0))}catch{}try{dt&&dt.replaceWith(dt.cloneNode(!0))}catch{}try{gt&&gt.replaceWith(gt.cloneNode(!0))}catch{}},setTimeout(()=>{if(typeof qe=="function"){let g=qe();!isNaN(g)&&isFinite(g)&&($e(g),ht())}else ht()},0)}function Sa(){try{typeof zt=="function"&&zt()}catch{}p.style.display="none",c.style.display="none",be=()=>{};try{typeof cancelAnimationFrame=="function"&&_panRaf&&cancelAnimationFrame(_panRaf)}catch{}try{_previewTimer&&(clearTimeout(_previewTimer),_previewTimer=null)}catch{}_maskImageData=null,_maskData=null,_dirty=null,_ditherWorkBuf=null,_ditherEligibleBuf=null,zt=null}b&&b.addEventListener("click",async()=>{let{availableColors:h}=s.extractColors(),v=Array.isArray(h)?h.length:0;if(v===0){H("noColorsKnown","error"),s.showAlert(s.t("noColorsKnown"),"error");return}else if(v>0&&s.colorsChanged(e.availableColors,h)){let B=e.availableColors.length;s.showAlert(s.t("colorsUpdated",{oldCount:B,newCount:v,diffCount:v-B}),"success"),e.availableColors=h,s.invalidateColorCache({availableColors:!0})}_e(),f.disabled=!1,e.imageLoaded&&(m.disabled=!1);try{H("loadingImage","default");let B=await s.createImageUploader();if(!B){H("colorsFound","success",{count:e.availableColors.length});return}let W=new vt(B);await W.load();let{width:ae,height:le}=W.getDimensions(),re=W.getPixelData(),ce=0;for(let ue=0;ue<re.length;ue+=4){let Z=!e.paintTransparentPixels&&s.isTransparentPixel(re[ue+3]),z=!e.paintWhitePixels&&s.isWhitePixel(re[ue],re[ue+1],re[ue+2]);!Z&&!z&&ce++}e.imageData={width:ae,height:le,pixels:re,totalPixels:ce,processor:W},e.artTotalPixels=ce,e.userPaintedPixels=0,e.resizeSettings=null,e.resizeIgnoreMask=null,e.originalImage={dataUrl:B,width:ae,height:le},V();let ge=await createImageBitmap(W.img);await xe.setImage(ge),xe.enable(),te.disabled=!1,te.classList.add("active"),te.setAttribute("aria-pressed","true"),e.hasAvailableColors&&(m.disabled=!1),k.disabled=!1,e.startPosition&&(u.disabled=!1),_e(),yt(),H("imageLoaded","success",{count:ce})}catch{H("imageError","error")}}),m&&m.addEventListener("click",()=>{e.imageLoaded&&e.imageData.processor&&e.hasAvailableColors?Za(e.imageData.processor):e.hasAvailableColors||s.showAlert(s.t("uploadImageFirstColors"),"warning")}),f&&f.addEventListener("click",async()=>{if(e.selectingPosition)return;e.selectingPosition=!0,e.startPosition=null,e.region=null,u.disabled=!0,s.showAlert(s.t("selectPositionAlert"),"info"),H("waitingPosition","default");let h=async(B,W)=>{if(typeof B=="string"&&B.includes("https://backend.wplace.live/s0/pixel/")&&W?.method?.toUpperCase()==="POST")try{let ae=await v(B,W);if((await ae.clone().json())?.painted===1){let ce=B.match(/\/pixel\/(\d+)\/(\d+)/);ce&&ce.length>=3&&(e.region={x:Number.parseInt(ce[1]),y:Number.parseInt(ce[2])});let ge=JSON.parse(W.body);ge?.coords&&Array.isArray(ge.coords)&&(e.startPosition={x:ge.coords[0],y:ge.coords[1]},await xe.setPosition(e.startPosition,e.region),e.imageLoaded&&(u.disabled=!1),window.fetch=v,e.selectingPosition=!1,H("positionSet","success"))}return ae}catch{return v(B,W)}return v(B,W)},v=window.fetch;window.fetch=h,setTimeout(()=>{e.selectingPosition&&(window.fetch=v,e.selectingPosition=!1,H("positionTimeout","error"),s.showAlert(s.t("positionTimeout"),"error"))},12e4)});async function Qa(){if(!e.imageLoaded||!e.startPosition||!e.region){H("missingRequirements","error");return}if(await za(),!!we){e.running=!0,e.stopFlag=!1,u.disabled=!0,P.disabled=!1,b.disabled=!0,f.disabled=!0,m.disabled=!0,k.disabled=!0,te.disabled=!0,H("startPaintingMsg","success");try{await Ln()}catch(h){console.error("Unexpected error:",h),H("paintingError","error")}finally{e.running=!1,P.disabled=!0,k.disabled=!1,e.stopFlag?u.disabled=!1:(u.disabled=!0,b.disabled=!1,f.disabled=!1,m.disabled=!1),te.disabled=!1}}}u&&u.addEventListener("click",Qa),P&&P.addEventListener("click",()=>{e.stopFlag=!0,e.running=!1,P.disabled=!0,H("paintingStoppedByUser","warning"),e.imageLoaded&&e.userPaintedPixels>0&&(s.saveProgress(),s.showAlert(s.t("autoSaved"),"success"))}),setTimeout(()=>{let h=s.loadProgress();if(h&&h.state.userPaintedPixels>0){let v=new Date(h.timestamp).toLocaleString(),B=Math.round(h.state.userPaintedPixels/h.state.artTotalPixels*100);s.showAlert(`${s.t("savedDataFound")}

Saved: ${v}
Progress: ${h.state.userPaintedPixels}/${h.state.artTotalPixels} pixels (${B}%)
${s.t("clickLoadToContinue")}`,"info")}},1e3),Je&&ct&&Je.addEventListener("input",h=>{let v=parseInt(h.target.value);e.cooldownChargeThreshold=v,ct.textContent=v.toString(),V(),Ke.resetEdgeTracking()}),_n(),Ke.syncFromState()}function Ut(t,a,o,n=0){let i=a-t;return Math.max(0,i*o-n)}function An(t){if(e.stopFlag)return;let a=e.cooldownChargeThreshold,o=Ut(e.preciseCurrentCharges,a,e.cooldown,t),n=s.msToTimeText(o);H("noChargesThreshold","warning",{threshold:a,current:e.displayCharges,time:n},!0)}function Bn(t,a,o,n,i,l,r){let w=[];console.log(`Generating coordinates with 
  mode:`,o,`
  direction:`,n,`
  snake:`,i,`
  blockWidth:`,l,`
  blockHeight:`,r);let y,d,c,p,b,m;switch(n){case"top-left":y=0,d=t,c=1,p=0,b=a,m=1;break;case"top-right":y=t-1,d=-1,c=-1,p=0,b=a,m=1;break;case"bottom-left":y=0,d=t,c=1,p=a-1,b=-1,m=-1;break;case"bottom-right":y=t-1,d=-1,c=-1,p=a-1,b=-1,m=-1;break;default:throw new Error(`Unknown direction: ${n}`)}if(o==="rows")for(let f=p;f!==b;f+=m)if(i&&(f-p)%2!==0)for(let u=d-c;u!==y-c;u-=c)w.push([u,f]);else for(let u=y;u!==d;u+=c)w.push([u,f]);else if(o==="columns")for(let f=y;f!==d;f+=c)if(i&&(f-y)%2!==0)for(let u=b-m;u!==p-m;u-=m)w.push([f,u]);else for(let u=p;u!==b;u+=m)w.push([f,u]);else if(o==="circle-out"){let f=Math.floor(t/2),u=Math.floor(a/2),P=Math.ceil(Math.sqrt(f*f+u*u));for(let k=0;k<=P;k++)for(let A=u-k;A<=u+k;A++)for(let M=f-k;M<=f+k;M++)M>=0&&M<t&&A>=0&&A<a&&Math.max(Math.abs(M-f),Math.abs(A-u))===k&&w.push([M,A])}else if(o==="circle-in"){let f=Math.floor(t/2),u=Math.floor(a/2),P=Math.ceil(Math.sqrt(f*f+u*u));for(let k=P;k>=0;k--)for(let A=u-k;A<=u+k;A++)for(let M=f-k;M<=f+k;M++)M>=0&&M<t&&A>=0&&A<a&&Math.max(Math.abs(M-f),Math.abs(A-u))===k&&w.push([M,A])}else if(o==="blocks"||o==="shuffle-blocks"){let f=[];for(let u=0;u<a;u+=r)for(let P=0;P<t;P+=l){let k=[];for(let A=u;A<Math.min(u+r,a);A++)for(let M=P;M<Math.min(P+l,t);M++)k.push([M,A]);f.push(k)}if(o==="shuffle-blocks")for(let u=f.length-1;u>0;u--){let P=Math.floor(Math.random()*(u+1));[f[u],f[P]]=[f[P],f[u]]}for(let u of f)w.push(...u)}else throw new Error(`Unknown mode: ${o}`);return w}async function ca(t){if(!t||t.pixels.length===0)return!0;let a=t.pixels.length;console.log(`\u{1F4E6} Sending batch with ${a} pixels (region: ${t.regionX},${t.regionY})`);let o=await On(t.pixels,t.regionX,t.regionY);if(o){if(t.pixels.forEach(n=>{e.userPaintedPixels++}),e.fullChargeData={...e.fullChargeData,spentSinceShot:e.fullChargeData.spentSinceShot+a},_e(),H("paintingProgress","default",{painted:e.userPaintedPixels,total:e.artTotalPixels}),s.performSmartSave(),T.PAINTING_SPEED_ENABLED&&e.paintingSpeed>0&&a>0){let n=1e3/e.paintingSpeed,i=Math.max(100,n*a);await s.sleep(i)}}else console.error(`\u274C Batch for ${t.regionX}, ${t.regionY} with ${t.pixels.length} pixels
         failed permanently after retries. Stopping painting.`),e.stopFlag=!0,H("paintingBatchFailed","error");return t.pixels=[],o}async function Ln(){let{width:t,height:a,pixels:o}=e.imageData,{x:n,y:i}=e.startPosition,{x:l,y:r}=e.region;if(!await xe.waitForTiles(l,r,t,a,n,i,1e4)){H("overlayTilesNotLoaded","error"),e.stopFlag=!0;return}let y=new Map,d={transparent:0,white:0,alreadyPainted:0,colorUnavailable:0};function c(b,m){let f=(m*t+b)*4,u=o[f],P=o[f+1],k=o[f+2],A=o[f+3];if(!e.paintTransparentPixels&&s.isTransparentPixel(A))return{eligible:!1,reason:"transparent"};if(!e.paintWhitePixels&&s.isWhitePixel(u,P,k))return{eligible:!1,reason:"white"};let M;if(s.isWhitePixel(u,P,k))M=T.COLOR_MAP[5];else if(s.isTransparentPixel(A))M=T.COLOR_MAP[0];else if(M=s.resolveColor(s.findClosestPaletteColor(u,P,k,e.activeColorPalette),e.availableColors,!e.paintUnavailablePixels),!e.paintUnavailablePixels&&!M.id)return{eligible:!1,reason:"colorUnavailable",r:u,g:P,b:k,a:A,mappedColorId:M.id};return{eligible:!0,r:u,g:P,b:k,a:A,mappedColorId:M.id}}function p(b,m,f,u,P){b!=="transparent"&&console.log(`Skipped pixel for ${b} (id: ${m}, (${f.join(", ")})) at (${u}, ${P})`),d[b]++}try{let b=Bn(t,a,e.coordinateMode,e.coordinateDirection,e.coordinateSnake,e.blockWidth,e.blockHeight);e:for(let[m,f]of b){if(e.stopFlag){for(let[ve,se]of y.entries())se.pixels.length>0&&(console.log("\u{1F3AF} Sending last batch before user-stop"),await ca(se));break e}let u=c(m,f),P=n+m,k=i+f,A=Math.floor(P/1e3),M=Math.floor(k/1e3),q=P%1e3,R=k%1e3,J=u.mappedColorId;if(!u.eligible){p(u.reason,J,[u.r,u.g,u.b],q,R);continue}let ie=`${l+A},${r+M}`;y.has(ie)||y.set(ie,{regionX:l+A,regionY:r+M,pixels:[]});let te=y.get(ie);try{let ve=[te.regionX,te.regionY],se=await xe.getTilePixelColor(ve[0],ve[1],q,R);if(se&&Array.isArray(se)){let Ie=s.resolveColor(se,e.availableColors),Ne=Ie.id===J;if(Ne){p("alreadyPainted",J,[u.r,u.g,u.b],q,R);continue}console.debug(`[COMPARE] Pixel at \u{1F4CD} (${q}, ${R}) in region (${l+A}, ${r+M})
  \u251C\u2500\u2500 Current color: rgb(${se.join(", ")}) (id: ${Ie.id})
  \u251C\u2500\u2500 Target color:  rgb(${u.r}, ${u.g}, ${u.b}, ${u.a}) (id: ${J})
  \u2514\u2500\u2500 Status: ${Ne?"\u2705 Already painted \u2192 SKIP":"\u{1F534} Needs paint \u2192 PAINT"}
`)}}catch(ve){console.error(`[DEBUG] Error checking existing pixel at (${q}, ${R}):`,ve),H("paintingPixelCheckFailed","error",{x:q,y:R}),e.stopFlag=!0;break e}te.pixels.push({x:q,y:R,color:J,localX:m,localY:f});let ke=Dn();if(te.pixels.length>=ke){if(!await ca(te))break e;te.pixels=[]}if(e.displayCharges<e.cooldownChargeThreshold&&!e.stopFlag&&await s.dynamicSleep(()=>e.displayCharges>=e.cooldownChargeThreshold?(Ke.maybeNotifyChargesReached(!0),0):e.stopFlag?0:Ut(e.preciseCurrentCharges,e.cooldownChargeThreshold,e.cooldown)),e.stopFlag)break e}for(let[m,f]of y.entries())f.pixels.length>0&&!e.stopFlag&&(console.log("\u{1F3C1} Sending final batch"),await ca(f)||console.warn(`\u26A0\uFE0F Final batch for ${m} failed with ${f.pixels.length} pixels.`))}finally{window._chargesInterval&&clearInterval(window._chargesInterval),window._chargesInterval=null}if(e.stopFlag)s.saveProgress();else{H("paintingComplete","success",{count:e.userPaintedPixels}),s.saveProgress(),xe.clear();let b=document.getElementById("toggleOverlayBtn");b&&(b.classList.remove("active"),b.disabled=!0)}console.log("\u{1F4CA} Pixel Statistics:"),console.log(`   Painted: ${e.userPaintedPixels}`),console.log(`   Skipped - Transparent: ${d.transparent}`),console.log(`   Skipped - White (disabled): ${d.white}`),console.log(`   Skipped - Already painted: ${d.alreadyPainted}`),console.log(`   Skipped - Color Unavailable: ${d.colorUnavailable}`),console.log(`   Total processed: ${e.userPaintedPixels+d.transparent+d.white+d.alreadyPainted+d.colorUnavailable}`),_e()}function Dn(){let t;if(e.batchMode==="random"){let n=Math.max(1,e.randomBatchMin),i=Math.max(n,e.randomBatchMax);t=Math.floor(Math.random()*(i-n+1))+n,console.log(`\u{1F3B2} Random batch size generated: ${t} (range: ${n}-${i})`)}else t=e.paintingSpeed;let a=e.displayCharges;return Math.min(t,a)}async function On(t,a,o,n=Oa){let i=0;for(;i<n&&!e.stopFlag;){i++,console.log(`\u{1F504} Attempting to send batch (attempt ${i}/${n}) for region ${a},${o} with ${t.length} pixels`);let l=await $n(t,a,o);if(l===!0)return console.log(`\u2705 Batch succeeded on attempt ${i}`),!0;if(l==="token_error"){console.log(`\u{1F511} Token error on attempt ${i}, regenerating...`),H("captchaSolving","warning");try{await ua(),i--;continue}catch(r){console.error(`\u274C Token regeneration failed on attempt ${i}:`,r),H("captchaFailed","error"),await s.sleep(5e3)}}else{console.warn(`\u26A0\uFE0F Batch failed on attempt ${i}, retrying...`);let r=Math.min(1e3*Math.pow(2,i-1),3e4),w=Math.random()*1e3;await s.sleep(r+w)}}return i>=n&&(console.error(`\u274C Batch failed after ${n} attempts (MAX_BATCH_RETRIES=${Oa}). This will stop painting to prevent infinite loops.`),H("paintingError","error")),!1}async function $n(t,a,o){let n=we;if(!n)try{console.log("\u{1F511} Generating Turnstile token for pixel batch..."),n=await ua(),we=n}catch(r){return console.error("\u274C Failed to generate Turnstile token:",r),lt=new Promise(w=>{ze=w}),"token_error"}let i=new Array(t.length*2),l=new Array(t.length);for(let r=0;r<t.length;r++){let w=t[r];i[r*2]=w.x,i[r*2+1]=w.y,l[r]=w.color}try{let r={coords:i,colors:l,t:n,fp:s.randStr(10)},w=await Da(a,o,r),y=await fetch(`https://backend.wplace.live/s0/pixel/${a}/${o}`,{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8","x-pawtect-token":w},credentials:"include",body:JSON.stringify(r)});if(y.status===403){let c=null;try{c=await y.json()}catch{}console.error("\u274C 403 Forbidden. Turnstile token might be invalid or expired.");try{console.log("\u{1F504} Regenerating Turnstile token after 403..."),n=await ua(),we=n;let p={coords:i,colors:l,t:n,fp:s.randStr(10)},b=await Da(a,o,p),m=await fetch(`https://backend.wplace.live/s0/pixel/${a}/${o}`,{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8","x-pawtect-token":b},credentials:"include",body:JSON.stringify(p)});return m.status===403?(we=null,lt=new Promise(u=>{ze=u}),"token_error"):(await m.json())?.painted===t.length}catch(p){return console.error("\u274C Token regeneration failed:",p),we=null,lt=new Promise(b=>{ze=b}),"token_error"}}return(await y.json())?.painted===t.length}catch(r){return console.error("Batch paint request failed:",r),!1}}function V(){try{let t={paintingSpeed:e.paintingSpeed,paintingSpeedEnabled:document.getElementById("enableSpeedToggle")?.checked,batchMode:e.batchMode,randomBatchMin:e.randomBatchMin,randomBatchMax:e.randomBatchMax,cooldownChargeThreshold:e.cooldownChargeThreshold,tokenSource:e.tokenSource,minimized:e.minimized,overlayOpacity:e.overlayOpacity,blueMarbleEnabled:document.getElementById("enableBlueMarbleToggle")?.checked,ditheringEnabled:e.ditheringEnabled,colorMatchingAlgorithm:e.colorMatchingAlgorithm,enableChromaPenalty:e.enableChromaPenalty,chromaPenaltyWeight:e.chromaPenaltyWeight,customTransparencyThreshold:e.customTransparencyThreshold,customWhiteThreshold:e.customWhiteThreshold,paintWhitePixels:e.paintWhitePixels,paintTransparentPixels:e.paintTransparentPixels,resizeSettings:e.resizeSettings,paintUnavailablePixels:e.paintUnavailablePixels,coordinateMode:e.coordinateMode,coordinateDirection:e.coordinateDirection,coordinateSnake:e.coordinateSnake,blockWidth:e.blockWidth,blockHeight:e.blockHeight,resizeIgnoreMask:e.resizeIgnoreMask&&e.resizeSettings&&e.resizeSettings.width*e.resizeSettings.height===e.resizeIgnoreMask.length?{w:e.resizeSettings.width,h:e.resizeSettings.height,data:btoa(String.fromCharCode(...e.resizeIgnoreMask))}:null,notificationsEnabled:e.notificationsEnabled,notifyOnChargesReached:e.notifyOnChargesReached,notifyOnlyWhenUnfocused:e.notifyOnlyWhenUnfocused,notificationIntervalMinutes:e.notificationIntervalMinutes,originalImage:e.originalImage};T.PAINTING_SPEED_ENABLED=t.paintingSpeedEnabled,je("wplace-bot-settings",t)}catch(t){console.warn("Could not save bot settings:",t)}}function _n(){try{let t=Wt("wplace-bot-settings");if(!t)return;if(e.paintingSpeed=t.paintingSpeed||T.PAINTING_SPEED.DEFAULT,e.batchMode=t.batchMode||T.BATCH_MODE,e.randomBatchMin=t.randomBatchMin||T.RANDOM_BATCH_RANGE.MIN,e.randomBatchMax=t.randomBatchMax||T.RANDOM_BATCH_RANGE.MAX,e.cooldownChargeThreshold=t.cooldownChargeThreshold||T.COOLDOWN_CHARGE_THRESHOLD,e.tokenSource=t.tokenSource||T.TOKEN_SOURCE,e.minimized=t.minimized??!1,T.PAINTING_SPEED_ENABLED=t.paintingSpeedEnabled??!1,T.AUTO_CAPTCHA_ENABLED=t.autoCaptchaEnabled??!1,e.overlayOpacity=t.overlayOpacity??T.OVERLAY.OPACITY_DEFAULT,e.blueMarbleEnabled=t.blueMarbleEnabled??T.OVERLAY.BLUE_MARBLE_DEFAULT,e.ditheringEnabled=t.ditheringEnabled??!1,e.colorMatchingAlgorithm=t.colorMatchingAlgorithm||"lab",e.enableChromaPenalty=t.enableChromaPenalty??!0,e.chromaPenaltyWeight=t.chromaPenaltyWeight??.15,e.customTransparencyThreshold=t.customTransparencyThreshold??T.TRANSPARENCY_THRESHOLD,e.customWhiteThreshold=t.customWhiteThreshold??T.WHITE_THRESHOLD,e.paintWhitePixels=t.paintWhitePixels??!0,e.paintTransparentPixels=t.paintTransparentPixels??!1,e.resizeSettings=t.resizeSettings??null,e.originalImage=t.originalImage??null,e.paintUnavailablePixels=t.paintUnavailablePixels??T.PAINT_UNAVAILABLE,e.coordinateMode=t.coordinateMode??T.COORDINATE_MODE,e.coordinateDirection=t.coordinateDirection??T.COORDINATE_DIRECTION,e.coordinateSnake=t.coordinateSnake??T.COORDINATE_SNAKE,e.blockWidth=t.blockWidth??T.COORDINATE_BLOCK_WIDTH,e.blockHeight=t.blockHeight??T.COORDINATE_BLOCK_HEIGHT,e.notificationsEnabled=t.notificationsEnabled??T.NOTIFICATIONS.ENABLED,e.notifyOnChargesReached=t.notifyOnChargesReached??T.NOTIFICATIONS.ON_CHARGES_REACHED,e.notifyOnlyWhenUnfocused=t.notifyOnlyWhenUnfocused??T.NOTIFICATIONS.ONLY_WHEN_UNFOCUSED,e.notificationIntervalMinutes=t.notificationIntervalMinutes??T.NOTIFICATIONS.REPEAT_MINUTES,t.resizeIgnoreMask&&t.resizeIgnoreMask.data&&e.resizeSettings&&t.resizeIgnoreMask.w===e.resizeSettings.width&&t.resizeIgnoreMask.h===e.resizeSettings.height)try{let ot=atob(t.resizeIgnoreMask.data),it=new Uint8Array(ot.length);for(let Qe=0;Qe<ot.length;Qe++)it[Qe]=ot.charCodeAt(Qe);e.resizeIgnoreMask=it}catch{e.resizeIgnoreMask=null}else e.resizeIgnoreMask=null;let a=document.getElementById("coordinateModeSelect");a&&(a.value=e.coordinateMode);let o=document.getElementById("coordinateDirectionSelect");o&&(o.value=e.coordinateDirection);let n=document.getElementById("coordinateSnakeToggle");n&&(n.checked=e.coordinateSnake);let i=document.getElementById("wplace-settings-container"),l=i.querySelector("#directionControls"),r=i.querySelector("#snakeControls"),w=i.querySelector("#blockControls");s.updateCoordinateUI({mode:e.coordinateMode,directionControls:l,snakeControls:r,blockControls:w});let y=document.getElementById("paintUnavailablePixelsToggle");y&&(y.checked=e.paintUnavailablePixels);let d=i.querySelector("#settingsPaintWhiteToggle");d&&(d.checked=e.paintWhitePixels);let c=i.querySelector("#settingsPaintTransparentToggle");c&&(c.checked=e.paintTransparentPixels);let p=document.getElementById("speedSlider");p&&(p.value=e.paintingSpeed);let b=document.getElementById("speedValue");b&&(b.textContent=`${e.paintingSpeed} (batch size)`);let m=document.getElementById("enableSpeedToggle");m&&(m.checked=T.PAINTING_SPEED_ENABLED);let f=document.getElementById("batchModeSelect");f&&(f.value=e.batchMode);let u=document.getElementById("normalBatchControls"),P=document.getElementById("randomBatchControls");u&&P&&(e.batchMode==="random"?(u.style.display="none",P.style.display="block"):(u.style.display="block",P.style.display="none"));let k=document.getElementById("randomBatchMin");k&&(k.value=e.randomBatchMin);let A=document.getElementById("randomBatchMax");A&&(A.value=e.randomBatchMax);let M=document.getElementById("cooldownSlider");M&&(M.value=e.cooldownChargeThreshold);let q=document.getElementById("cooldownValue");q&&(q.textContent=e.cooldownChargeThreshold.toString());let R=document.getElementById("overlayOpacitySlider");R&&(R.value=e.overlayOpacity);let J=document.getElementById("overlayOpacityValue");J&&(J.textContent=`${Math.round(e.overlayOpacity*100)}%`);let ie=document.getElementById("enableBlueMarbleToggle");ie&&(ie.checked=e.blueMarbleEnabled);let te=document.getElementById("tokenSourceSelect");te&&(te.value=e.tokenSource);let ke=document.getElementById("colorAlgorithmSelect");ke&&(ke.value=e.colorMatchingAlgorithm);let ve=document.getElementById("enableChromaPenaltyToggle");ve&&(ve.checked=e.enableChromaPenalty);let se=document.getElementById("chromaPenaltyWeightSlider");se&&(se.value=e.chromaPenaltyWeight);let Ie=document.getElementById("chromaWeightValue");Ie&&(Ie.textContent=e.chromaPenaltyWeight);let Ne=document.getElementById("transparencyThresholdInput");Ne&&(Ne.value=e.customTransparencyThreshold);let Re=document.getElementById("whiteThresholdInput");Re&&(Re.value=e.customWhiteThreshold);let Je=document.getElementById("notifEnabledToggle");Je&&(Je.checked=e.notificationsEnabled);let ct=document.getElementById("notifOnChargesToggle");ct&&(ct.checked=e.notifyOnChargesReached);let Ht=document.getElementById("notifOnlyUnfocusedToggle");Ht&&(Ht.checked=e.notifyOnlyWhenUnfocused);let Ze=document.getElementById("notifIntervalInput");Ze&&(Ze.value=e.notificationIntervalMinutes),Ke.resetEdgeTracking()}catch(t){console.warn("Could not load bot settings:",t)}}console.log("\u{1F680} WPlace Auto-Image with Turnstile Token Generator loaded");function Nt(){e.initialSetupComplete=!0;let t=document.querySelector("#loadBtn"),a=document.querySelector("#loadFromFileBtn"),o=document.querySelector("#uploadBtn");t&&(t.disabled=!1,t.title="",t.style.animation="pulse 0.6s ease-in-out",setTimeout(()=>{t&&(t.style.animation="")},600)),a&&(a.disabled=!1,a.title="",a.style.animation="pulse 0.6s ease-in-out",setTimeout(()=>{a&&(a.style.animation="")},600)),o&&(o.disabled=!1,o.title="",o.style.animation="pulse 0.6s ease-in-out",setTimeout(()=>{o&&(o.style.animation="")},600)),s.showAlert(s.t("fileOperationsAvailable"),"success"),console.log("\u2705 File operations (Load/Upload) are now available!")}async function zn(){if(rt()){console.log("\u2705 Valid token already available, skipping initialization"),H("tokenReady","success"),Nt();return}try{console.log("\u{1F527} Initializing Turnstile token generator..."),H("initializingToken","default"),console.log("Attempting to load Turnstile script..."),await s.loadTurnstile(),console.log("Turnstile script loaded. Attempting to generate token...");let t=await Na();t?(nt(t),console.log("\u2705 Startup token generated successfully"),H("tokenReady","success"),s.showAlert(s.t("tokenGeneratorReady"),"success"),Nt()):(console.warn("\u26A0\uFE0F Startup token generation failed (no token received), will retry when needed"),H("tokenRetryLater","warning"),Nt())}catch(t){console.error("\u274C Critical error during Turnstile initialization:",t),H("tokenRetryLater","warning"),Nt()}}Sn();_a();Wa().then(()=>{setTimeout(zn,1e3),_e(),setTimeout(()=>{let a=document.getElementById("chromaPenaltyWeightSlider"),o=document.getElementById("chromaWeightValue"),n=document.getElementById("resetAdvancedColorBtn"),i=document.getElementById("colorAlgorithmSelect"),l=document.getElementById("enableChromaPenaltyToggle"),r=document.getElementById("transparencyThresholdInput"),w=document.getElementById("whiteThresholdInput"),y=document.getElementById("enableDitheringToggle");i&&i.addEventListener("change",d=>{e.colorMatchingAlgorithm=d.target.value,V(),be()}),l&&l.addEventListener("change",d=>{e.enableChromaPenalty=d.target.checked,V(),be()}),a&&o&&a.addEventListener("input",d=>{e.chromaPenaltyWeight=parseFloat(d.target.value)||.15,o.textContent=e.chromaPenaltyWeight.toFixed(2),V(),be()}),r&&r.addEventListener("change",d=>{let c=parseInt(d.target.value,10);!isNaN(c)&&c>=0&&c<=255&&(e.customTransparencyThreshold=c,T.TRANSPARENCY_THRESHOLD=c,V(),be())}),w&&w.addEventListener("change",d=>{let c=parseInt(d.target.value,10);!isNaN(c)&&c>=200&&c<=255&&(e.customWhiteThreshold=c,T.WHITE_THRESHOLD=c,V(),be())}),y&&y.addEventListener("change",d=>{e.ditheringEnabled=d.target.checked,V(),be()}),n&&n.addEventListener("click",()=>{e.colorMatchingAlgorithm="lab",e.enableChromaPenalty=!0,e.chromaPenaltyWeight=.15,s.invalidateColorCache({colorMatchingAlgorithm:e.colorMatchingAlgorithm,enableChromaPenalty:e.enableChromaPenalty,chromaPenaltyWeight:e.chromaPenaltyWeight}),e.customTransparencyThreshold=T.TRANSPARENCY_THRESHOLD=100,e.customWhiteThreshold=T.WHITE_THRESHOLD=250,V();let d=document.getElementById("colorAlgorithmSelect");d&&(d.value="lab");let c=document.getElementById("enableChromaPenaltyToggle");c&&(c.checked=!0),a&&(a.value=.15),o&&(o.textContent="0.15"),r&&(r.value=100),w&&(w.value=250),be(),s.showAlert(s.t("advancedColorSettingsReset"),"success")})},500),window.addEventListener("beforeunload",()=>{s.cleanupTurnstile()})});})();
