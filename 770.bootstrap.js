(self.webpackChunkcreate_wasm_app=self.webpackChunkcreate_wasm_app||[]).push([[770],{770:(e,t,n)=>{"use strict";n.r(t);var a=n(7734);n(6790);const i=async e=>{const t=await fetch(e);if(!t.ok)throw new Error(t.statusText);return t.text()},o=()=>{sessionStorage.uiState=JSON.stringify(c)},s={cameraBeta:.95,useFixedVelocity:!1,useNoTimeDelay:!1,galilean:!1,simultaneityFrame:0},r=()=>null!=sessionStorage.uiState?JSON.parse(sessionStorage.uiState):s;let c=r();const l=e=>{c=r();const t=(()=>{const e=document.createElement("input");return e.type="number",e.min="0",e.max="1",e.step="0.005",e.inputMode="decimal",e.value=c.cameraBeta?.toString(),e.title="Camera speed as a fraction of the speed of light.",e})();t.addEventListener("change",(e=>{const t=e.target;if(null==t||!(t instanceof HTMLInputElement))return;const n=parseFloat(t.value);Number.isNaN(n)||(c.cameraBeta=n,o())}));const n=(()=>{const e=document.createElement("input");return e.type="checkbox",e.checked=c.useFixedVelocity,e})();n.addEventListener("change",(e=>{const t=e.target;if(null==t||!(t instanceof HTMLInputElement))return;const n=t.checked;c.useFixedVelocity=n,o()}));const a=(()=>{const e=document.createElement("input");return e.type="checkbox",e.checked=c.galilean,e})();a.addEventListener("change",(e=>{const t=e.target;null!=t&&t instanceof HTMLInputElement&&(c.galilean=!!t.checked,o())}));const i=document.createElement("label");i.appendChild(t),i.append("Max camera speed (fraction of c)");const s=document.createElement("label");s.appendChild(n),s.append("Assume fixed camera speed");const l=document.createElement("label");l.appendChild(a),l.append("Use Galilean relativity");const d=(()=>{const e=document.createElement("div"),t=document.createElement("label"),n=(()=>{const e=document.createElement("input");return e.type="checkbox",e.checked=c.useNoTimeDelay,e})();t.appendChild(n),t.append("Assume no light travel time in frame:"),e.appendChild(t);const a=document.createElement("input");a.name="simultaneity-frame",a.type="radio",a.disabled=!c.useNoTimeDelay,a.checked=0===c.simultaneityFrame,a.value="0";const i=document.createElement("label");i.appendChild(a),i.append("World");const s=document.createElement("input");s.name="simultaneity-frame",s.type="radio",s.disabled=!c.useNoTimeDelay,s.checked=1===c.simultaneityFrame,s.value="1";const r=document.createElement("label");r.appendChild(s),r.append("Camera"),n.addEventListener("change",(e=>{const t=e.target;if(null==t||!(t instanceof HTMLInputElement))return;const n=!!t.checked;c.useNoTimeDelay=n,o(),a.disabled=!n,s.disabled=!n}));const l=e=>{const t=e.target;if(null==t||!(t instanceof HTMLInputElement))return;const n=parseInt(t.value,10);c.simultaneityFrame=n,o()};return a.onclick=l,s.onclick=l,e.appendChild(i),e.appendChild(r),e})(),p=document.createElement("div");p.className="main-ui";const u=document.createElement("div");u.innerText="Use WASD and mouse to move or touch on smartphone.",p.appendChild(u),p.appendChild(i),p.appendChild(d),p.appendChild(s),p.appendChild(l),e.appendChild(p)};class d extends a.xcu{constructor(e,t,n){super(e,t,n),this.velocity=a.Pa4.Zero(),this.properVelocity=a.Pa4.Zero(),this.properAcceleration=a.Pa4.Zero(),this.dt=0,this.onAfterCheckInputsObservable.add(((e,t)=>{let n=this.dt;if(this.cameraDirection.length()<=a.kn4)this.properVelocity.scaleInPlace(Math.exp(-n)*this.inertia);else{this.properAcceleration.copyFrom(this.cameraDirection);const e=this.properVelocity.add(this.properAcceleration.scale(n));(null==this.maxProperSpeed2||e.lengthSquared()<this.maxProperSpeed2)&&this.properVelocity.copyFrom(e)}const i=this.properVelocity.lengthSquared(),o=1/Math.sqrt(1+i);this.properVelocity.scaleToRef(o,this.velocity),this.position.addInPlace(this.velocity.scale(n))}))}setMaxSpeed(e){if(null==e)return void(this.maxProperSpeed2=void 0);const t=e*e,n=1/(1-t);this.maxProperSpeed2=n*t}_computeLocalCameraSpeed(){return this.speed}_checkInputs(){var e=this.getEngine();this.dt=Math.sqrt(e.getDeltaTime()/(100*e.getFps())),this.cameraDirection.setAll(0),this.cameraRotation.scaleInPlace(Math.exp(-this.dt)*this.inertia),super._checkInputs()}_updatePosition(){}}(async()=>{const e=document.body;e.style.display="flex",e.style.flexDirection="column",l(e);const t=document.createElement("div");t.style.flex="1 1 auto",document.body.appendChild(t);const n=(e=>{const t=document.createElement("canvas");return t.style.position="absolute",t.width=e.clientWidth,t.height=e.clientHeight,t.style.position="fixed",t.tabIndex=0,window.addEventListener("resize",(n=>{t.width=e.clientWidth,t.height=e.clientHeight})),e.appendChild(t),t})(t),o=(e=>{const t=document.createElement("div");return t.classList.add("speed-indicator"),e.appendChild(t),t})(e),[s,c]=await Promise.all([i("main.vert"),i("main.frag")]),p=new a.D4V(n,!0,{deterministicLockstep:!0,lockstepMaxSteps:4});a.Qmf.ShadersStore.customVertexShader=s,a.Qmf.ShadersStore.customFragmentShader=c;const u=await a.n0n.LoadAsync(window.location.href,"SubdividedCube.gltf",p),m=u.getNodeByID("Camera"),h=m?.position||new a.Pa4(0,0,-1),y=m?.rotationQuaternion,f=((e,t,n)=>{const a=new d("camera1",t,n);return(e=>{e.keysDownward.push(81),e.keysDown.push(83),e.keysUpward.push(69),e.keysUp.push(87),e.keysLeft.push(65),e.keysRight.push(68),e.gamepadAngularSensibility=100,(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/iPhone/i))&&e.inputs.addVirtualJoystick(),e.speed=.5,e.inertia=.9,e.minZ=.1,e.maxZ=1e4,e.fov=.9})(a),a})(0,h,u);null!=y?(f.rotationQuaternion=y,f.update()):f.setTarget(a.Pa4.Zero()),f.attachControl(!0),u.clearColor.set(.2,.3,.6,1),u.skipFrustumClipping=!0;const g=u.meshes.filter((e=>!(e instanceof a.SPe))).map((e=>{const t=e.material?.albedoTexture,n=new a.jyz("shader"+e.name,u,{vertexSource:s,fragmentSource:c},{attributes:["position","normal","uv"],uniforms:["world","finalWorld","worldView","worldViewProjection","view","projection","viewProjection","velocity","textureSampler","simultaneityFrame","useGalilean","useNoTimeDelay"],defines:null!=t?["#define HAS_TEXTURE"]:[]});return null!=t&&n.setTexture("textureSampler",t),e.material=n,n}));p.runRenderLoop((function(){const{cameraBeta:e,galilean:t,simultaneityFrame:n,useFixedVelocity:i,useNoTimeDelay:s}=r();f.setMaxSpeed(e);let c=null==f.velocity||i?f.getDirection(a.Pa4.Forward()).scale(e):f.velocity;g.forEach((e=>{e.setVector3("velocity",c).setInt("useNoTimeDelay",s?1:0).setInt("simultaneityFrame",n).setInt("useGalilean",null!=t&&t?1:0)}));const l=c.length();o.innerText=`Speed: ${l.toFixed(3)}c`,u.render()})),window.addEventListener("resize",(function(){p.resize()})),n.focus()})().catch(console.error)}}]);
//# sourceMappingURL=770.bootstrap.js.map