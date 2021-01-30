import {
  Effect,
  Engine,
  SceneLoader,
  TransformNode,
  Vector3,
  Texture,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0";
import { createCanvas } from "./canvas-utils";
import { loadText } from "./load-text";
import { getState, initUi, initSpeedIndicator, getSceneUrl } from "./ui";
import { createCamera } from "./camera";
import { initSkybox } from "./skybox";
import { definesFromUiState, getUniformParams } from "./utils";
import { initShaders } from "./shaders";

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

  const defaultCameraInfo = scene.getNodeByID("Camera") as TransformNode;
  const defaultPosition =
    defaultCameraInfo?.position || new Vector3(0, 0.33, -9);
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
  initSkybox(scene);

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
  // Set relevant defines for the first render.
  definesChange(definesFromUiState());

  // Register a render loop to repeatedly render the scene.
  engine.runRenderLoop(function () {
    const { cameraBeta } = getState();
    // Set the maximum allowed speed.
    camera.setMaxSpeed(cameraBeta);
    const uniformParams = getUniformParams(camera);
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
