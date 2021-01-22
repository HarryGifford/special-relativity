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
import { getState, initUi, initSpeedIndicator } from "./ui";
import { createCamera } from "./camera";
import { makeSkybox } from "./skybox";
import { getUniformParams, setUniforms } from "./utils";

const main = async () => {
  const el = document.body;
  initUi(el);
  const canvasContainer = document.createElement("div");
  canvasContainer.style.flex = "1 1 auto";
  document.body.appendChild(canvasContainer);
  const canvas = createCanvas(canvasContainer);

  const speedIndicator = initSpeedIndicator(el);

  const [vertexShaderSrc, fragShaderSrc] = await Promise.all([
    loadText("main.vert"),
    loadText("main.frag"),
  ]);

  const engine = new Engine(canvas, true, {
    deterministicLockstep: true,
    lockstepMaxSteps: 4,
  });

  Effect.ShadersStore["customVertexShader"] = vertexShaderSrc;

  Effect.ShadersStore["customFragmentShader"] = fragShaderSrc;

  const scene = await SceneLoader.LoadAsync(
    window.location.href,
    "SubdividedCube.gltf",
    engine
  );

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
    .filter((mesh) => !(mesh instanceof InstancedMesh))
    .map((mesh) => {
      const material = mesh.material as PBRMaterial;
      const albedo = material?.albedoTexture;

      const shaderMaterial = new ShaderMaterial(
        "shader" + mesh.name,
        scene,
        {
          vertexSource: vertexShaderSrc,
          fragmentSource: fragShaderSrc,
        },
        {
          attributes: ["position", "normal", "uv"],
          uniforms: [
            "world",
            "finalWorld",
            "worldView",
            "worldViewProjection",
            "view",
            "projection",
            "viewProjection",
            "velocity",
            "textureSampler",
            "simultaneityFrame",
            "useGalilean",
            "useNoTimeDelay",
            "rgbMapSampler",
            "dopplerEffect",
            "relativisticBeaming",
          ],
          defines: albedo != null ? ["#define HAS_TEXTURE"] : [],
        }
      );
      shaderMaterial.setTexture("rgbMapSampler", rgbMapTexture);
      if (albedo != null) {
        shaderMaterial.setTexture("textureSampler", albedo);
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
      setUniforms(shader, uniformParams);
    });

    const velocity = uniformParams.vec3.velocity;
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

main().catch(console.error);
