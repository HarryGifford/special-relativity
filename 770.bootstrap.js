(self.webpackChunkcreate_wasm_app=self.webpackChunkcreate_wasm_app||[]).push([[770],{770:(e,t,n)=>{"use strict";n.r(t);var a=n(7734);n(6790);const i=async e=>{const t=await fetch(e);if(!t.ok)throw new Error(t.statusText);return t.text()},o=()=>{sessionStorage.uiState=JSON.stringify(c)},s={cameraBeta:.95,useFixedVelocity:!1,useNoTimeDelay:!1,galilean:!1},r=()=>null!=sessionStorage.uiState?JSON.parse(sessionStorage.uiState):s;let c=r();class l extends a.xcu{constructor(e,t,n){super(e,t,n),this.velocity=a.Pa4.Zero(),this.properVelocity=a.Pa4.Zero(),this.properAcceleration=a.Pa4.Zero(),this.dt=0,this.onAfterCheckInputsObservable.add(((e,t)=>{let n=this.dt;if(this.cameraDirection.length()<=a.kn4)this.properVelocity.scaleInPlace(Math.exp(-n)*this.inertia);else{this.properAcceleration.copyFrom(this.cameraDirection);const e=this.properVelocity.add(this.properAcceleration.scale(n));(null==this.maxProperSpeed2||e.lengthSquared()<this.maxProperSpeed2)&&this.properVelocity.copyFrom(e)}const i=this.properVelocity.lengthSquared(),o=1/Math.sqrt(1+i);this.properVelocity.scaleToRef(o,this.velocity),this.position.addInPlace(this.velocity.scale(n))}))}setMaxSpeed(e){if(null==e)return void(this.maxProperSpeed2=void 0);const t=e*e,n=1/(1-t);this.maxProperSpeed2=n*t}_computeLocalCameraSpeed(){return this.speed}_checkInputs(){var e=this.getEngine();this.dt=Math.sqrt(e.getDeltaTime()/(100*e.getFps())),this.cameraDirection.setAll(0),this.cameraRotation.scaleInPlace(Math.exp(-this.dt)*this.inertia),super._checkInputs()}_updatePosition(){}}(async()=>{const e=document.body;e.style.display="flex",e.style.flexDirection="column",(e=>{c=r();const t=(()=>{const e=document.createElement("input");return e.type="number",e.min="0",e.max="1",e.step="0.005",e.value=c.cameraBeta?.toString(),e.title="Camera speed as a fraction of the speed of light.",e})();t.addEventListener("change",(e=>{const t=e.target;if(null==t||!(t instanceof HTMLInputElement))return;const n=parseFloat(t.value);Number.isNaN(n)||(c.cameraBeta=n,o())}));const n=(()=>{const e=document.createElement("input");return e.type="checkbox",e.checked=c.useFixedVelocity,e})();n.addEventListener("change",(e=>{const t=e.target;null!=t&&t instanceof HTMLInputElement&&(c.useFixedVelocity=t.checked,o())}));const a=(()=>{const e=document.createElement("input");return e.type="checkbox",e.checked=c.useNoTimeDelay,e})();a.addEventListener("change",(e=>{const t=e.target;null!=t&&t instanceof HTMLInputElement&&(c.useNoTimeDelay=!!t.checked,o())}));const i=(()=>{const e=document.createElement("input");return e.type="checkbox",e.checked=c.galilean,e})();i.addEventListener("change",(e=>{const t=e.target;null!=t&&t instanceof HTMLInputElement&&(c.galilean=!!t.checked,o())}));const s=document.createElement("label");s.innerText="Assume fixed camera speed:",s.appendChild(n);const l=document.createElement("label");l.innerText="Max camera speed (fraction of c):",l.appendChild(t);const d=document.createElement("label");d.innerText="Assume no light travel time delay:",d.appendChild(a);const p=document.createElement("label");p.innerText="Use Galilean relativity:",p.appendChild(i);const u=document.createElement("div");u.className="main-ui";const h=document.createElement("div");h.innerText="Use WASD and mouse to move or touch on smartphone.",u.appendChild(h),u.appendChild(l),u.appendChild(s),u.appendChild(d),u.appendChild(p),e.appendChild(u)})(e);const t=document.createElement("div");t.style.flex="1 1 auto",document.body.appendChild(t);const n=(e=>{const t=document.createElement("canvas");return t.style.position="absolute",t.width=e.clientWidth,t.height=e.clientHeight,t.style.position="fixed",t.tabIndex=0,window.addEventListener("resize",(n=>{t.width=e.clientWidth,t.height=e.clientHeight})),e.appendChild(t),t})(t),[s,d]=await Promise.all([i("main.vert"),i("main.frag")]),p=new a.D4V(n,!0,{deterministicLockstep:!0,lockstepMaxSteps:4});a.Qmf.ShadersStore.customVertexShader=s,a.Qmf.ShadersStore.customFragmentShader=d;const u=await a.n0n.LoadAsync(window.location.href,"SubdividedCube.gltf",p),h=u.getNodeByID("Camera"),m=h?.position||new a.Pa4(0,0,-1),y=h?.rotationQuaternion,g=((e,t,n)=>{const a=new l("camera1",t,n);return(e=>{e.keysDownward.push(81),e.keysDown.push(83),e.keysUpward.push(69),e.keysUp.push(87),e.keysLeft.push(65),e.keysRight.push(68),e.gamepadAngularSensibility=100,(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/iPhone/i))&&e.inputs.addVirtualJoystick(),e.speed=.5,e.inertia=.9,e.minZ=.1,e.maxZ=1e4,e.fov=.9})(a),a})(0,m,u);null!=y?(g.rotationQuaternion=y,g.update()):g.setTarget(a.Pa4.Zero()),g.attachControl(!0),u.clearColor.set(.2,.3,.6,1),u.skipFrustumClipping=!0;const f=u.meshes.filter((e=>!(e instanceof a.SPe))).map((e=>{const t=e.material?.albedoTexture,n=new a.jyz("shader"+e.name,u,{vertexSource:s,fragmentSource:d},{attributes:["position","normal","uv"],uniforms:["world","finalWorld","worldView","worldViewProjection","view","projection","viewProjection","velocity","textureSampler","useGalilean","useNoTimeDelay"],defines:null!=t?["#define HAS_TEXTURE"]:[]});return null!=t&&n.setTexture("textureSampler",t),e.material=n,n}));p.runRenderLoop((function(){const{cameraBeta:e,galilean:t,useFixedVelocity:n,useNoTimeDelay:i}=r();g.setMaxSpeed(e);let o=null==g.velocity||n?g.getDirection(a.Pa4.Forward()).scale(e):g.velocity;f.forEach((e=>{e.setVector3("velocity",o).setInt("useNoTimeDelay",i?1:0).setInt("useGalilean",null!=t&&t?1:0)})),u.render()})),window.addEventListener("resize",(function(){p.resize()})),n.focus()})().catch(console.error)}}]);
//# sourceMappingURL=770.bootstrap.js.map