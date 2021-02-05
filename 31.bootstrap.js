(self.webpackChunksr_frontend=self.webpackChunksr_frontend||[]).push([[31],{9031:(e,t,a)=>{"use strict";a.r(t);var n=a(7734);a(6790);const i=async e=>{const t=await fetch(e);if(!t.ok)throw new Error(t.statusText);return t.text()},s="dice.gltf",o={cameraBeta:.95,useFixedVelocity:!1,useNoTimeDelay:!1,galilean:!1,simultaneityFrame:1,relativisticBeaming:!1,dopplerEffect:!1,timePulse:!1},r=()=>null!=sessionStorage.uiState?JSON.parse(sessionStorage.uiState):o;let l=r();const c=({attributeName:e,label:t,save:a})=>{const n=document.createElement("input");n.type="checkbox",n.checked=l[e],n.addEventListener("change",(t=>{const n=t.target;null!=n&&n instanceof HTMLInputElement&&(l[e]=!!n.checked,a())}));const i=document.createElement("label");return i.appendChild(n),i.append(t),{toggleLabel:i,toggle:n}},d=({el:e,id:t,options:a,onChange:n})=>{const i=a.map((({value:e})=>{const a=document.createElement("input");return a.name=t,a.type="radio",a.value=String(e),a})),s=e;for(let e=0;e<a.length;e++){const t=document.createElement("label");t.appendChild(i[e]),t.append(a[e].label),s.append(t)}return null!=n&&i.forEach(((e,t)=>{const i=a[t].value;e.onclick=()=>{n(i)}})),{buttons:i,setValue:e=>{for(let t=0;t<a.length;t++){const{value:n}=a[t];i[t].checked=n===e}},setDisabled:e=>{for(let t=0;t<a.length;t++)i[t].disabled=e}}},p=()=>sessionStorage.relativityScene||s;class m extends n.xcu{constructor(e,t,a){super(e,t,a),this.velocity=n.Pa4.Zero(),this.properVelocity=n.Pa4.Zero(),this.properAcceleration=n.Pa4.Zero(),this.dt=0,this.onAfterCheckInputsObservable.add(((e,t)=>{let a=this.dt;this.properAcceleration.copyFrom(this.cameraDirection);const n=this.dragCoefficient??0,i=this.properVelocity.normalizeToNew().scale(n*this.speed*this.inertia*Math.sqrt(this.properVelocity.length()));this.properAcceleration.subtractInPlace(i),this.properVelocity.addInPlace(this.properAcceleration.scale(a));let s=this.properVelocity.lengthSquared();null!=this.maxProperSpeed2&&s>this.maxProperSpeed2&&(this.properVelocity.normalize().scaleInPlace(Math.sqrt(this.maxProperSpeed2)),s=this.maxProperSpeed2);const o=1/Math.sqrt(1+s);this.properVelocity.scaleToRef(o,this.velocity),this.position.addInPlace(this.velocity.scale(a))}))}setMaxSpeed(e){if(null==e)return this.maxProperSpeed2=void 0,void(this.dragCoefficient=0);this.speed=e;const t=e*e,a=t<1?1/(1-t):1e4;this.maxProperSpeed2=a*t,this.dragCoefficient=1/Math.pow(this.maxProperSpeed2,1/4)}_computeLocalCameraSpeed(){return this.speed}_checkInputs(){var e=this.getEngine();this.dt=Math.sqrt(e.getDeltaTime()/(100*e.getFps())),this.dt>.1&&(this.dt=.1),this.cameraDirection.setAll(0),this.cameraRotation.scaleInPlace(Math.exp(-this.dt)*this.inertia),super._checkInputs()}_updatePosition(){}}const u=()=>(new Date).getTime(),h=u(),g=()=>{const{galilean:e,simultaneityFrame:t,useFixedVelocity:a,useNoTimeDelay:n,relativisticBeaming:i,dopplerEffect:s,timePulse:o}=r();return[e?"#define GALILEAN":"",n?0==t?"#define SIMULTANEITY_FRAME_WORLD":"#define SIMULTANEITY_FRAME_CAMERA":"",a?"#define FIXED_VELOCITY":"",n?"#define NO_TIME_DELAY":"",i?"#define RELATIVISTIC_BEAMING":"",s?"#define DOPPLER_EFFECT":"",o?"#define TIME_PULSE":""]},f=(e,t)=>{null!=t.int&&Object.entries(t.int).forEach((([t,a])=>{e.setInt(t,a)})),null!=t.vec3&&Object.entries(t.vec3).forEach((([t,a])=>{e.setVector3(t,a)})),null!=t.float&&Object.entries(t.float).forEach((([t,a])=>{e.setFloat(t,a)}))},b=(e,t,a,i,s)=>{const o={},r=[...s];a instanceof n.YVB?(null!=a.albedoTexture&&(o.albedoSampler=a.albedoTexture,r.push("#define ALBEDO_ENABLED")),null!=a.bumpTexture&&(o.bumpSampler=a.bumpTexture,r.push("#define BUMP_ENABLED"),i.isVerticesDataPresent(n.oZy.TangentKind)&&r.push("#define TANGENT")),null!=a.metallicTexture&&(o.metallicRoughnessSampler=a.metallicTexture,r.push("#define METALLIC_ROUGHNESS_ENABLED"))):a instanceof n.Iij&&(null!=a.reflectionTexture&&(o.reflectionSampler=a.reflectionTexture),r.push("#define SKYBOX")),o.rgbMapSampler=t;const l=new n.jyz("shader"+i.name,e,{vertex:"custom",fragment:"custom"},{attributes:["position","normal","tangent","uv"],uniforms:["world","finalWorld","view","projection","velocity","time","lightDir","metallicFactor","roughnessFactor"],samplers:Object.keys(o),defines:r});Object.entries(o).map((([e,t])=>{l.setTexture(e,t)})),((e,t)=>{const a={float:{},int:{},vec3:{}};e instanceof n.YVB&&(a.float.metallicFactor=e.metallic??1,a.float.roughnessFactor=e.roughness??1),f(t,a)})(a,l),i.material instanceof n.jyz&&i.material.dispose(),i.material=l};(async({el:e,sceneFilename:t})=>{const a=(e=>{const t=document.createElement("canvas");return t.style.position="absolute",t.width=e.clientWidth,t.height=e.clientHeight,t.style.position="fixed",t.tabIndex=0,window.addEventListener("resize",(a=>{t.width=e.clientWidth,t.height=e.clientHeight})),e.appendChild(t),t})(e),o=(e=>{const t=document.createElement("div");return t.classList.add("speed-indicator"),e.appendChild(t),t})(e),[v,y]=await Promise.all([i("main.vert"),i("main.frag")]),E=new n.D4V(a,!0);n.Qmf.ShadersStore.customVertexShader=v,n.Qmf.ShadersStore.customFragmentShader=y;const S=await n.n0n.LoadAsync(t),x=(S.lights||[]).filter((e=>e instanceof n.Ox3));if(0===x.length){const e=new n.Pa4(3,-5,4),t=new n.Ox3("dir-light",e,S);t.intensity=10,x.push(t)}const T=x[0],C=S.cameras&&S.cameras.length>0?S.cameras[0]:void 0,L=C?.globalPosition||new n.Pa4(0,0,1),w=C?.absoluteRotation;null!=C&&S.removeCamera(C);const P=((e,t,a)=>{const n=new m("camera1",t,a);return(e=>{e.keysDownward.push(81),e.keysDown.push(83),e.keysUpward.push(69),e.keysUp.push(87),e.keysLeft.push(65),e.keysRight.push(68),e.gamepadAngularSensibility=100,(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/iPhone/i))&&e.inputs.addVirtualJoystick(),e.speed=1,e.inertia=.9,e.minZ=.1,e.maxZ=1e4,e.fov=.9})(n),n})(0,L,S);S.activeCamera=P,null!=w?(P.rotationQuaternion=w,P.setTarget(P.getFrontPosition(1))):P.setTarget(n.Pa4.Zero()),P.attachControl(!0);const D=new n.xEZ("./lambda_rgb_map.png",S,!1,void 0,n.xEZ.BILINEAR_SAMPLINGMODE);S.skipFrustumClipping=!0,await(async e=>{const t=new n.BtG("skybox/skybox",e,["_px.png","_py.png","_pz.png","_nx.png","_ny.png","_nz.png"]);t.coordinatesMode=n.xEZ.SKYBOX_MODE,e.createDefaultEnvironment({environmentTexture:t,createGround:!1,skyboxSize:1e3,groundSize:1e3,skyboxTexture:t})})(S);const{definesChange:A,uniformsChange:N}=(({scene:e,rgbMapTexture:t})=>{const a=e.meshes.filter((e=>!(e instanceof n.SPe)&&null!=e.material)),i=a.map((e=>e.material));return{definesChange:n=>{for(let s=0;s<i.length;s++){const o=i[s],r=a[s];b(e,t,o,r,n)}},uniformsChange:e=>{for(let t=0;t<i.length;t++){const s=a[t],o=(i[t],s.material);o instanceof n.jyz&&f(o,e)}}}})({scene:S,rgbMapTexture:D});(({el:e,onStateChange:t})=>{l=r();const a=()=>{sessionStorage.uiState=JSON.stringify(l),t&&t(l)},n=(()=>{const e=document.createElement("input");return e.type="number",e.min="0",e.max="1",e.step="0.005",e.inputMode="decimal",e.value=l.cameraBeta?.toString(),e.title="Camera speed as a fraction of the speed of light.",e})();n.addEventListener("change",(e=>{const n=e.target;if(null==n||!(n instanceof HTMLInputElement))return;const i=parseFloat(n.value);Number.isNaN(i)||(l.cameraBeta=i,a(),t&&t(r()))}));const{toggleLabel:i}=c({attributeName:"useFixedVelocity",label:"Assume fixed camera speed",save:a}),{toggleLabel:o}=c({attributeName:"galilean",label:"Use Galilean relativity",save:a}),{toggleLabel:m}=c({attributeName:"relativisticBeaming",label:"Relativistic beaming",save:a}),{toggleLabel:u}=c({attributeName:"dopplerEffect",label:"Doppler effect",save:a}),{toggleLabel:h}=c({attributeName:"timePulse",label:"Show synchronization",save:a}),g=document.createElement("label");g.appendChild(n),g.append("Max camera speed (fraction of c)");const f=(e=>{const t=document.createElement("div"),{toggle:a,toggleLabel:n}=c({attributeName:"useNoTimeDelay",label:"Assume no light travel time in frame:",save:e});a.addEventListener("change",(e=>{const t=e.target;if(null==t||!(t instanceof HTMLInputElement))return;const a=!!t.checked;s(!a)})),t.appendChild(n);const{setValue:i,setDisabled:s}=d({el:t,id:"simultaneity-frame",options:[{label:"Camera",value:1},{label:"World",value:0}],onChange:t=>{l.simultaneityFrame=t,e()}});return i(l.simultaneityFrame),s(!l.useNoTimeDelay),t})(a),b=(()=>{const e=document.createElement("div"),t=document.createElement("label");t.append("Scene:"),e.appendChild(t);const{setValue:a}=d({el:e,id:"scene-picker",options:[{label:"Dice",value:s},{label:"Sponza",value:"https://specialrelativitymeshes.z5.web.core.windows.net/Sponza/sponza.gltf"}],onChange:e=>{sessionStorage.relativityScene=e,window.location.reload()}});return a(p()),e})(),v=document.createElement("details");v.className="main-ui";const y=document.createElement("summary");y.innerText="Help / Settings",v.appendChild(y);const E=document.createElement("div");E.innerText="Use WASD and mouse to move or touch on smartphone.",v.appendChild(E),v.appendChild(g),v.appendChild(m),v.appendChild(u),v.appendChild(f),v.appendChild(h),v.appendChild(o),v.appendChild(i),v.appendChild(b),e.appendChild(v)})({el:e,onStateChange:()=>{A(g())}}),E.onBeginFrameObservable.addOnce((()=>{A(g())})),E.runRenderLoop((function(){const{cameraBeta:e}=r();P.setMaxSpeed(e);const t=((e,t)=>{const{cameraBeta:a,galilean:i,simultaneityFrame:s,useFixedVelocity:o,useNoTimeDelay:l,relativisticBeaming:c,dopplerEffect:d,timePulse:p}=r(),m=null==e.velocity||o?e.getDirection(n.Pa4.Forward()).scale(a):e.velocity,g=m.length(),f=i?1:1/Math.sqrt(1-g*g);t.computeTransformedInformation();const b=t.transformedDirection??t.direction;return b&&b.normalize(),{vec3:{velocity:m,lightDir:b},float:{time:(u()-h)/1e3,gamma:f},int:{useNoTimeDelay:l?1:0,simultaneityFrame:s,useGalilean:i?1:0,relativisticBeaming:c?1:0,dopplerEffect:d?1:0,timePulse:p?1:0}}})(P,T);N(t);const a=t.vec3.velocity.length(),i=t.float.gamma;o.innerHTML=[`Speed: ${a.toFixed(3)}c`,`Gamma: ${i.toFixed(3)}`].join("<br/>"),S.render()})),window.addEventListener("resize",(function(){E.resize()})),a.focus()})({el:document.body,sceneFilename:p()}).catch(console.error)}}]);
//# sourceMappingURL=31.bootstrap.js.map