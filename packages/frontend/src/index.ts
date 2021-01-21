import {
  Effect,
  Engine,
  InstancedMesh,
  PBRMaterial,
  SceneLoader,
  ShaderMaterial,
  TransformNode,
  Vector3,
  Texture
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0";
import { createCanvas } from "./canvas-utils";
import { loadText } from "./load-text";
import { getState, initUi, initSpeedIndicator } from "./ui";
import { createCamera } from "./camera";

const main = async () => {
  const el = document.body;
  el.style.display = "flex";
  el.style.flexDirection = "column";
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

  scene.clearColor.set(0.2, 0.3, 0.6, 1);
  const rgbMapTexture = new Texture("./lambda_rgb_map.png", scene, false, undefined, Texture.BILINEAR_SAMPLINGMODE);

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
            "relativisticBeaming"
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

  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    const {
      cameraBeta,
      galilean,
      simultaneityFrame,
      useFixedVelocity,
      useNoTimeDelay,
      relativisticBeaming,
      dopplerEffect
    } = getState();

    // Set the maximum allowed speed.
    camera.setMaxSpeed(cameraBeta);

    let velocity =
      camera.velocity == null || useFixedVelocity
        ? camera.getDirection(Vector3.Forward()).scale(cameraBeta)
        : camera.velocity;
    shaders.forEach((shader) => {
      shader
        .setVector3("velocity", velocity)
        .setInt("useNoTimeDelay", useNoTimeDelay ? 1 : 0)
        .setInt("simultaneityFrame", simultaneityFrame)
        .setInt("useGalilean", galilean ? 1 : 0)
        .setInt("relativisticBeaming", relativisticBeaming ? 1 : 0)
        .setInt("dopplerEffect", dopplerEffect ? 1 : 0);
    });
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
