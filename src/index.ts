import {
  Effect,
  Engine,
  SceneLoader,
  Vector3,
  Texture,
  DirectionalLight,
  Mesh,
  VertexBuffer,
  VertexData,
  InstancedMesh,
  AbstractMesh,
  Geometry,
  TransformNode,
  Node
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0";
import { createCanvas } from "./canvas-utils";
import { loadText } from "./load-text";
import { getState, initUi, initSpeedIndicator, getSceneUrl } from "./ui";
import { createCamera } from "./camera";
import { initSkybox } from "./skybox";
import { definesFromUiState, getUniformParams } from "./utils";
import { initShaders } from "./shaders";

import { MaxHeap } from "heap-typed";
import { GeomData, breakupTriangles } from "./breakup-triangles";

type Config = {
  el: HTMLElement;
  sceneFilename: string;
};

type MeshOrGeomData = {
  vertexAttributes: {
    [kind: string]: number[];
  };
  indices: number[];
};

type MeshOrGeomVertexData = {
  [kind: string]: number[];
};

function addBarycentricCoordinates({ vertexAttributes, indices }: MeshOrGeomData) {
  // Find the largest uv index.
  let maxIndex = 0;
  for (const dataKind of Object.keys(vertexAttributes)) {
    const data = vertexAttributes[dataKind];
    if (dataKind.startsWith(VertexBuffer.UVKind)) {
      for (let i = 0; i < data.length; i++) {
        maxIndex = Math.max(maxIndex, data[i]);
      }
    }
  }

  // We need to convert element array to vertex array.
  const meshOrGeomDataOut: MeshOrGeomVertexData = {
  };
  for (const dataKind of Object.keys(vertexAttributes)) {
    const data = vertexAttributes[dataKind];
    const stride = VertexBuffer.DeduceStride(dataKind);
    const newData = [];
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      for (let j = 0; j < stride; j++) {
        newData.push(data[index * stride + j]);
      }
    }
    meshOrGeomDataOut[dataKind] = newData;
  }
  const barycentricData: number[] = [];
  meshOrGeomDataOut[VertexBuffer.UVKind + (maxIndex + 1)] = barycentricData;
  for (let i = 0; i < indices.length; i += 3) {
    barycentricData.push(1, 0, 0);
    barycentricData.push(0, 1, 0);
    barycentricData.push(0, 0, 1);
  }
  return meshOrGeomDataOut;
}

const convertMeshToWireframeMesh = (mesh: Mesh) => {
  const meshOrGeomData: MeshOrGeomData = {
    vertexAttributes: {},
    indices: []
  };
  for (const dataKind of mesh.getVerticesDataKinds()) {
    const data = mesh.getVerticesData(dataKind)!;
    const vdata = [];
    for (let i = 0; i < data.length; i++) {
      vdata.push(data[i]);
    }
    meshOrGeomData.vertexAttributes[dataKind] = vdata;
  }
  const indices = mesh.getIndices()!;
  for (let i = 0; i < indices.length; i++) {
    meshOrGeomData.indices.push(indices[i]);
  }
  const vertexData = addBarycentricCoordinates(meshOrGeomData);
  const vertexDataArray = new VertexData();
  for (const dataKind of Object.keys(vertexData)) {
    const data = vertexData[dataKind];
    vertexDataArray.set(data, dataKind);
  }
  vertexDataArray.applyToMesh(mesh);
  if (mesh.material) {
    mesh.material.wireframe = true;
  }
  return vertexDataArray;
}

function getMaxAbsScaling(node: Node): number {
  if (node instanceof TransformNode) {
    return Math.max(
      Math.abs(node.scaling.x),
      Math.abs(node.scaling.y),
      Math.abs(node.scaling.z));
  }
  return 1;
}

function getInstanceMeshScales(node: Node, maxLength: number, meshLengthMap: Map<string, number> = new Map<string, number>()) {
  function updateMapScale(id: string, newLength: number) {
    const length = meshLengthMap.get(id);
    if (length == null || newLength < length) {
      meshLengthMap.set(id, newLength);
    }
  }

  if (node == null) {
    return;
  }

  const newMaxLength = maxLength / getMaxAbsScaling(node);
  if (node instanceof InstancedMesh) {
    updateMapScale(node.sourceMesh.id, newMaxLength);
  } else if (node instanceof TransformNode) {
    updateMapScale(node.id, newMaxLength);
  }

  for (const child of node.getChildren()) {
    getInstanceMeshScales(child, newMaxLength, meshLengthMap);
  }
}

function breakUpTrianglesInNode(node: Node, maxLength: number, meshLengthMap?: Map<string, number>) {
  if (node == null) {
    return;
  }
  if (meshLengthMap == null) {
    meshLengthMap = new Map<string, number>();
    getInstanceMeshScales(node, maxLength, meshLengthMap);
  }
  if (node instanceof Mesh) {
    const scale = getMaxAbsScaling(node);
    if (scale === 0) {
      return;
    }
    maxLength = meshLengthMap.get(node.id) ?? maxLength;
    maxLength = maxLength / scale;
    const vertexData = breakUpTrianglesWrap(node, maxLength);
    vertexData.applyToMesh(node);
  }

  for (const child of node.getChildren()) {
    breakUpTrianglesInNode(child, maxLength, meshLengthMap);
  }
}

/**
 * Break up triangles in a mesh with an edge longer than the given length.
 * This is needed to avoid artifacts from relativistic corrections.
 * The function repeatedly splits the longest edge of each triangle
 * until all edges are shorter than the given length.
 * @param mesh The mesh to break up.
 * @param maxLength The maximum length of an edge in the mesh.
 */
function breakUpTrianglesWrap(mesh: Geometry | Mesh, maxLength: number) {
  let vertexData: GeomData = {
    vertexAttributes: {
      position: undefined!,
    },
    indices: [],
    strides: {}
  };
  for (const dataKind of mesh.getVerticesDataKinds()) {
    vertexData.vertexAttributes[dataKind] = mesh.getVerticesData(dataKind)!;
    vertexData.strides[dataKind] = VertexBuffer.DeduceStride(dataKind);
  }
  if (vertexData.vertexAttributes.position == null) {
    return new VertexData();
  }
  const indices = mesh.getIndices()!;
  vertexData.indices = indices;
  breakupTriangles(vertexData, maxLength);
  const vertexDataArray = new VertexData();
  for (const dataKind of Object.keys(vertexData.vertexAttributes)) {
    const data = vertexData.vertexAttributes[dataKind];
    vertexDataArray.set(data, dataKind);
  }
  vertexDataArray.indices = vertexData.indices;
  return vertexDataArray;
}

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
  const meshesToAdd: Mesh[] = [];
  const meshesToRemove: InstancedMesh[] = [];

  // Break up large triangles on meshes.
  for (const node of scene.rootNodes) {
    breakUpTrianglesInNode(node, 1);
  }

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
  let defaultPosition =
    defaultCameraInfo?.globalPosition || new Vector3(0, 0, 1);
  const defaultRotation = defaultCameraInfo?.absoluteRotation;
  if (defaultCameraInfo != null) {
    defaultPosition = defaultCameraInfo.globalPosition;
    scene.removeCamera(defaultCameraInfo);
  }
  const camera = createCamera("camera1", defaultPosition, scene);
  scene.activeCamera = camera;

  (window as any).scene = scene;
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
