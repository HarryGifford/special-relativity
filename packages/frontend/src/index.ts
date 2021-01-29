import {
  Effect,
  Engine,
  InstancedMesh,
  PBRMaterial,
  SceneLoader,
  ShaderMaterial,
  TransformNode,
  Vector3,
  Texture,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0";
import { createCanvas } from "./canvas-utils";
import { loadText } from "./load-text";
import { getState, initUi, initSpeedIndicator, getSceneUrl } from "./ui";
import { createCamera } from "./camera";
import { makeSkybox } from "./skybox";
import { getUniformParams, setUniforms } from "./utils";

type Config = {
  el: HTMLElement;
  sceneFilename: string;
};

const main = async ({ el, sceneFilename }: Config) => {
  initUi(el);
  const canvas = createCanvas(el);

  const speedIndicator = initSpeedIndicator(el);

  const [vertexShaderSrc, fragShaderSrc] = await Promise.all([
    loadText("main.vert"),
    loadText("main.frag"),
  ]);

  const engine = new Engine(canvas, true);

  Effect.ShadersStore["customVertexShader"] = vertexShaderSrc;

  Effect.ShadersStore["customFragmentShader"] = fragShaderSrc;

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

  const shaders = scene.meshes
    .filter((mesh) => !(mesh instanceof InstancedMesh) && mesh.material != null)
    .map((mesh) => {
      const material = mesh.material as PBRMaterial;
      if (material == null) {
        throw new Error("Material should not be null");
      }
      const albedo = material.albedoTexture;
      const bump = material.bumpTexture;

      const shaderMaterial = new ShaderMaterial(
        "shader" + mesh.name,
        scene,
        {
          vertexSource: vertexShaderSrc,
          fragmentSource: fragShaderSrc,
        },
        {
          attributes: ["position", "normal", "tangent", "uv"],
          uniforms: [
            "world",
            "finalWorld",
            "view",
            "projection",
            "velocity",
            "simultaneityFrame",
            "useGalilean",
            "useNoTimeDelay",
            "dopplerEffect",
            "relativisticBeaming",
            "time",
            "timePulse"
          ],
          samplers: ["albedoSampler", "bumpSampler", "rgbMapSampler"],
          defines: bump != null ? ["#define TANGENT"] : [],
        }
      );
      shaderMaterial.setTexture("rgbMapSampler", rgbMapTexture);
      if (albedo != null) {
        shaderMaterial.setTexture("albedoSampler", albedo);
      }
      if (bump != null) {
        shaderMaterial.setTexture("bumpSampler", bump);
      }
      mesh.material = shaderMaterial;
      return shaderMaterial;
    });

  // Skybox is used so that we correctly shade the environment at infinity.
  const { skyboxMaterial } = await makeSkybox(scene);
  skyboxMaterial.setTexture("rgbMapSampler", rgbMapTexture);

  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    const { cameraBeta } = getState();
    // Set the maximum allowed speed.
    camera.setMaxSpeed(cameraBeta);
    const uniformParams = getUniformParams(camera);
    setUniforms(skyboxMaterial, uniformParams);
    shaders.forEach((shader) => {
      setUniforms(shader!, uniformParams);
    });

    const velocity = uniformParams.vec3.velocity;
    // Set the speed indicator in the UI.
    const speed = velocity.length();
    const gamma = 1 / Math.sqrt(1 - speed * speed);
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
