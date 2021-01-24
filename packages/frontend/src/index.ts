import {
  Effect,
  Engine,
  SceneLoader,
  TransformNode,
  Vector3,
  Texture,
  MaterialDefines,
  ICustomShaderNameResolveOptions,
  Mesh,
  Scene,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0";
import { createCanvas } from "./canvas-utils";
import { getState, initUi, initSpeedIndicator } from "./ui";
import { createCamera, RelativisticCamera } from "./camera";
import { makeSkybox } from "./skybox";
import { getCameraVelocity, getUniformParams, setUniforms } from "./utils";

export type Config = {
  /** Element to add the canvas and UI to. */
  el: HTMLElement;
  /** URL pointing to a GLTF file representing the scene. */
  sceneUrl: string;
};

const resolveShader = (
  _shaderName: string,
  uniforms: string[],
  _uniformBuffers: string[],
  samplers: string[],
  _defines: MaterialDefines | string[],
  _attributes?: string[],
  _options?: ICustomShaderNameResolveOptions
) => {
  uniforms?.push(
    "velocity",
    "simultaneityFrame",
    "useGalilean",
    "useNoTimeDelay",
    "dopplerEffect",
    "relativisticBeaming",
    "projection"
  );
  samplers?.push("rgbMapSampler");
  return "main";
};

const initRgbMap = () => {
  const rgbMapTexture = new Texture(
    "./lambda_rgb_map.png",
    null,
    false,
    undefined,
    Texture.BILINEAR_SAMPLINGMODE
  );
  return rgbMapTexture;
};

const initScene = async (sceneUrl: string) => {
  const scene = await SceneLoader.LoadAsync(sceneUrl);

  const defaultCameraInfo = scene.getNodeByID("Camera") as TransformNode;
  const defaultPosition = defaultCameraInfo?.position || new Vector3(0, 0, -1);
  const defaultRotation = defaultCameraInfo?.rotationQuaternion;

  const camera = createCamera("camera1", defaultPosition, scene);

  if (defaultRotation != null) {
    camera.rotationQuaternion = defaultRotation;
    camera.update();
  } else {
    camera.setTarget(Vector3.Zero());
  }
  // This attaches the camera to the canvas
  camera.attachControl(true);
  return { scene, camera };
};

const initMeshes = (
  scene: Scene,
  camera: RelativisticCamera,
  rgbMapTexture: Texture
) => {
  scene.meshes.forEach((mesh) => {
    if (!(mesh instanceof Mesh)) {
      return;
    }
    const material = mesh.material;
    if (material == null) {
      return;
    }
    material.customShaderNameResolve = resolveShader;
    mesh.onBeforeDrawObservable.add((mesh) => {
      const uniformParams = getUniformParams(camera);
      const effect = mesh.material?.getEffect();
      if (effect == null) {
        return;
      }
      effect.setTexture("rgbMapSampler", rgbMapTexture);
      setUniforms(effect, uniformParams);
    });
  });
};

const main = async ({ el, sceneUrl }: Config) => {
  initUi(el);
  const canvas = createCanvas(document.body);
  const speedIndicator = initSpeedIndicator(el);

  const engine = new Engine(canvas, true, {
    deterministicLockstep: true,
    lockstepMaxSteps: 4,
  });

  Effect.ShadersRepository = "";
  const { scene, camera } = await initScene(sceneUrl);
  const rgbMapTexture = initRgbMap();
  initMeshes(scene, camera, rgbMapTexture);
  const { skybox, skyboxMaterial } = await makeSkybox(scene);

  // Need to skip this due to movement of vertices from relativistic
  // corrections.
  scene.skipFrustumClipping = true;

  // Skybox is used so that we correctly shade the environment at infinity.
  skyboxMaterial.setTexture("rgbMapSampler", rgbMapTexture);
  skybox.onBeforeDrawObservable.add(skybox => {
    const effect = skybox.material?.getEffect();
    if (effect == null) {
      return;
    }
    setUniforms(effect, getUniformParams(camera));
  });

  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    const { cameraBeta, useFixedVelocity } = getState();
    // Set the maximum allowed speed.
    camera.setMaxSpeed(cameraBeta);
    const velocity = getCameraVelocity(camera, cameraBeta, useFixedVelocity);
    // Set the speed indicator in the UI.
    const speed = velocity.length();
    speedIndicator.innerText = `Speed: ${speed.toFixed(3)}c`;

    scene.render();
  });

  // Watch for browser/canvas resize events
  window.addEventListener("resize", function () {
    engine.resize();
  });
  canvas.focus();
};

main({
  el: document.body,
  // sceneUrl: "Sponza/sponza.gltf",
  sceneUrl: "SubdividedCube.gltf",
}).catch(console.error);
