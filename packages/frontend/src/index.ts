import {
  Effect,
  Engine,
  SceneLoader,
  Vector3,
  Texture,
  DirectionalLight,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0";
import { createCanvas } from "./canvas-utils";
import { loadText } from "./load-text";
import { getState, initUi, initSpeedIndicator, getSceneUrl } from "./ui";
import { createCamera } from "./relativistic-camera";
import { initSkybox } from "./skybox";
import { definesFromUiState, getUniformParams } from "./utils";
import { initShaders } from "./shaders";

import {} from "./camera";

import { sceneFromGltf, loadGltf } from "./scene";

type Config = {
  el: HTMLElement;
  sceneFilename: string;
};

const main = async ({ el, sceneFilename }: Config) => {
  const canvas = createCanvas(el);

  const speedIndicator = initSpeedIndicator(el);

  const [vertexSource, fragmentSource] = await Promise.all([
    loadText("main.vert"),
    loadText("main.frag"),
  ]);

  const engine = new Engine(canvas, true);

  Effect.ShadersStore["customVertexShader"] = vertexSource;

  Effect.ShadersStore["customFragmentShader"] = fragmentSource;

  const scene = await SceneLoader.LoadAsync(sceneFilename);
  sceneFromGltf(await loadGltf(sceneFilename));

  const directionalLights = (scene.lights || []).filter(
    (light) => light instanceof DirectionalLight
  ) as DirectionalLight[];
  if (directionalLights.length === 0) {
    const position = new Vector3(3, -5, 4);
    const light = new DirectionalLight("dir-light", position, scene);
    light.intensity = 10;
    directionalLights.push(light);
  }
  const light = directionalLights[0];

  // Find default camera in scene and replace it with relativistic camera.
  const defaultCameraInfo =
    scene.cameras && scene.cameras.length > 0 ? scene.cameras[0] : undefined;
  const defaultPosition =
    defaultCameraInfo?.globalPosition || new Vector3(0, 0, 1);
  const defaultRotation = defaultCameraInfo?.absoluteRotation;
  if (defaultCameraInfo != null) {
    scene.removeCamera(defaultCameraInfo);
  }
  const camera = createCamera("camera1", defaultPosition, scene);
  scene.activeCamera = camera;

  (window as any).camera = camera;

  if (defaultRotation != null) {
    camera.rotationQuaternion = defaultRotation;
    // This is needed due to virtual joystick not handling
    // certain rotations correctly.
    camera.setTarget(camera.getFrontPosition(1));
  } else {
    camera.setTarget(Vector3.Zero());
  }
  // This attaches the camera to the canvas
  camera.attachControl(true);

  const rgbMapTexture = new Texture(
    "./lambda_rgb_map.png",
    scene,
    false,
    undefined,
    Texture.BILINEAR_SAMPLINGMODE
  );

  // Need to skip this due to movement of vertices from relativistic
  // corrections.
  scene.skipFrustumClipping = true;
  await initSkybox(scene);

  const { definesChange, uniformsChange } = initShaders({
    scene,
    rgbMapTexture,
  });

  initUi({
    el,
    onStateChange: () => {
      definesChange(definesFromUiState());
    },
  });

  engine.onBeginFrameObservable.addOnce(() => {
    // Set relevant defines for the first render.
    definesChange(definesFromUiState());
  });

  // Register a render loop to repeatedly render the scene.
  engine.runRenderLoop(function () {
    const { cameraBeta } = getState();
    // Set the maximum allowed speed.
    camera.setMaxSpeed(cameraBeta);
    const uniformParams = getUniformParams(camera, light);
    uniformsChange(uniformParams);

    const speed = uniformParams.vec3.velocity.length();
    const gamma = uniformParams.float.gamma;
    // Set the speed indicator in the UI.
    speedIndicator.innerHTML = [
      `Speed: ${speed.toFixed(3)}c`,
      `Gamma: ${gamma.toFixed(3)}`,
    ].join("<br/>");
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
  sceneFilename: getSceneUrl(),
}).catch(console.error);
