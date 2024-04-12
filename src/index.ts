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

function breakUpTrianglesOnePass({ vertexAttributes, indices }: MeshOrGeomData, maxLength: number): boolean {
  const dataKinds = Object.keys(vertexAttributes);

  if (dataKinds.length === 0) {
    return false;
  }
  const positions = vertexAttributes[VertexBuffer.PositionKind]!;

  // Create a new vertex at the midpoint of each edge.
  const edgeToMidpoint = new Map<string, number>();
  const edgeToMidpointValueMap = new Map<string, string>();

  // Helper function to get or create a new vertex at the midpoint of two vertices.
  function getOrCreateMidpointIndex(i1: number, i2: number): number {
    const key = [i1, i2].sort().join(",");
    let index = edgeToMidpoint.get(key);
    if (index == null) {
      for (const dataKind of dataKinds) {
        // Skip unsupported data kinds.
        if (dataKind.startsWith("world")) {
          continue;
        }
        const stride = VertexBuffer.DeduceStride(dataKind);
        const data = vertexAttributes[dataKind]!;
        const d1 = data.slice(i1 * stride, (i1 + 1) * stride);
        const d2 = data.slice(i2 * stride, (i2 + 1) * stride);
        const midpoint = d1.map((v, i) => (v + d2[i]) / 2);
        data.push(...midpoint);
        if (dataKind === VertexBuffer.PositionKind) {
          index = positions.length / stride - 1;
          edgeToMidpoint.set(key, index);
          const value = [
            Math.round(midpoint[0] * 100) / 100,
            Math.round(midpoint[1] * 100) / 100,
            Math.round(midpoint[2] * 100) / 100
          ];
          const valueStr = JSON.stringify(value);
          if (edgeToMidpointValueMap.has(valueStr)) {
            //console.log(edgeToMidpointValueMap.get(valueStr), key);
            //console.log(vertexAttributes, indices);
            //throw new Error("Edge midpoint already exists" + valueStr + JSON.stringify(d1) + JSON.stringify(d2));
          }
          edgeToMidpointValueMap.set(valueStr, key);
        }
      }
      if (index == null) {
        throw new Error("Index should not be null");
      }
    }
    return index;
  }

  // Helper function to add a new triangle.
  function addTriangle(i1: number, i2: number, i3: number, replaceIndex?: number) {
    if (i1 == null || i2 == null || i3 == null) {
      throw new Error("addTriangle: Index should not be null");
    }
    if (replaceIndex != null) {
      indices[replaceIndex] = i1;
      indices[replaceIndex + 1] = i2;
      indices[replaceIndex + 2] = i3;
    } else {
      indices.push(i1, i2, i3);
    }
  }

  function getDistance(i1: number, i2: number) {
    const p1 = new Vector3(
      positions[i1 * 3],
      positions[i1 * 3 + 1],
      positions[i1 * 3 + 2]
    );
    const p2 = new Vector3(
      positions[i2 * 3],
      positions[i2 * 3 + 1],
      positions[i2 * 3 + 2]
    );
    return Vector3.Distance(p1, p2);
  }

  // Keep track of whether the mesh has been modified.
  let modified = false;

  // Keep a queue of triangles to split.
  const queue: [number, number, number, number][] = [];

  // Keep a priority queue of triangles to split.
  const pq = new MaxHeap<[number, number, number, number]>([], {
    comparator: ([_ai, aa, ab, ac], [_bi, ba, bb, bc]) => Math.max(aa, ab, ac) - Math.max(ba, bb, bc)
  });

  // Populate the queue with all triangles.
  for (let i = 0; i < indices.length; i += 3) {
    //queue.push([i, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]);
    pq.add([i, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]);
  }

  // Until the queue is empty, split the longest edge of each triangle.
  while (!pq.isEmpty()) {
    if (indices.length > 9000000) {
      break;
    }
    const [i, prevDist12, prevDist23, prevDist31] = pq.poll()!;//queue.shift()!;
    const i1 = indices[i];
    const i2 = indices[i + 1];
    const i3 = indices[i + 2];

    const dist12 = getDistance(i1, i2);
    const dist23 = getDistance(i2, i3);
    const dist31 = getDistance(i3, i1);

    if (Number.isNaN(dist12) || Number.isNaN(dist23) || Number.isNaN(dist31)) {
      throw new Error("NaN distance found");
    }

    if (!Number.isFinite(dist12) || !Number.isFinite(dist23) || !Number.isFinite(dist31)) {
      throw new Error("Infinite distance found");
    }

    if (dist12 >= prevDist12 && dist23 >= prevDist23 && dist31 >= prevDist31) {
      //throw new Error("Triangle inequality violated");
      //console.log("Distance should be less than the given distance\n" + dist12 + " " + dist23 + " " + dist31 + "\n" + prevDist12 + " " + prevDist23 + " " + prevDist31);
    }

    if (dist12 > maxLength && dist12 >= dist23 && dist12 >= dist31) {
      const i4 = getOrCreateMidpointIndex(i1, i2);
      const d14 = getDistance(i1, i4);
      const d42 = getDistance(i4, i2);
      if (Math.abs(d42 - d14) > 1e-6 || d14 >= dist12 || d42 >= dist12) {
        throw new Error("Triangle inequality violated");
      }
      //const i5 = getOrCreateMidpointIndex(i2, i3);
      // Add the new triangles.
      addTriangle(i3, i4, i2);
      addTriangle(i1, i4, i3, i);
      // Push the new triangles to the queue.
      //queue.push([indices.length - 3, dist31, d42, dist23]);
      //queue.push([i, d14, dist23, dist31]);
      pq.add([indices.length - 3, dist31, d42, dist23]);
      pq.add([i, d14, dist23, dist31]);
      modified = true;
    } else if (dist23 > maxLength && dist23 >= dist12 && dist23 >= dist31) {
      const i5 = getOrCreateMidpointIndex(i2, i3);
      const d25 = getDistance(i2, i5);
      const d53 = getDistance(i5, i3);
      if (Math.abs(d25 - d53) > 1e-6 || d25 >= dist23 || d53 >= dist23) {
        throw new Error("Triangle inequality violated");
      }
      //const i6 = getOrCreateMidpointIndex(i3, i1);
      addTriangle(i1, i5, i3);
      addTriangle(i5, i1, i2, i);
      // Push the new triangles to the queue.
      //queue.push([indices.length - 3, dist12, d53, dist31]);
      //queue.push([i, dist31, dist12, d25]);
      pq.add([indices.length - 3, dist12, d53, dist31]);
      pq.add([i, dist31, dist12, d25]);
      modified = true;
    } else if (dist31 > maxLength && dist31 >= dist12 && dist31 >= dist23) {
      const i6 = getOrCreateMidpointIndex(i3, i1);
      const d36 = getDistance(i3, i6);
      const d61 = getDistance(i6, i1);
      if (Math.abs(d36 - d61) > 1e-6 || d36 >= dist31 || d61 >= dist31) {
        throw new Error("Triangle inequality violated");
      }
      //const i4 = getOrCreateMidpointIndex(i1, i2);
      addTriangle(i6, i2, i3);
      addTriangle(i2, i6, i1, i);
      // Push the new triangles to the queue.
      //queue.push([indices.length - 3, dist12, dist23, d36]);
      //queue.push([i, dist23, d61, dist12]);
      pq.add([indices.length - 3, dist12, dist23, d36]);
      pq.add([i, dist23, d61, dist12]);
      modified = true;
    } else {
      if (dist12 > maxLength || dist23 > maxLength || dist31 > maxLength) {
        throw new Error("Distance should be less than the given distance");
      }
      // addTriangle(i1, i2, i3, i);
    }
  }

  if (modified) {
    console.log("Modified mesh", vertexAttributes[VertexBuffer.PositionKind]!.length, "vertices");
  }
  return modified;
}

function printNodeHierarchy(node: Node, depth: number = 0) {
  const indent = "  ".repeat(depth);
  const scale = node instanceof TransformNode || node instanceof AbstractMesh ? node.scaling.toString() : Vector3.One().toString();
  console.log(`${indent}${node.getClassName()} ${node.name} Scale: ${scale}`);
  for (const child of node.getChildren()) {
    printNodeHierarchy(child, depth + 1);
  }
}
(window as any).printNodeHierarchy = printNodeHierarchy;

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
    console.log("Max length", maxLength, node.name, node.id);
    const vertexData = breakUpTriangles(node, maxLength);
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
function breakUpTriangles(mesh: Geometry | Mesh, maxLength: number) {
  let vertexData: MeshOrGeomData = {
    vertexAttributes: {},
    indices: []
  };
  for (const dataKind of mesh.getVerticesDataKinds()) {
    const data = mesh.getVerticesData(dataKind)!;
    const vdata = [];
    for (let i = 0; i < data.length; i++) {
      vdata.push(data[i]);
    }
    vertexData.vertexAttributes[dataKind] = vdata;
  }
  const indices = mesh.getIndices()!;
  for (let i = 0; i < indices.length; i++) {
    vertexData.indices.push(indices[i]);
  }
  breakUpTrianglesOnePass(vertexData, maxLength);
  const vertexDataArray = new VertexData();
  for (const dataKind of Object.keys(vertexData.vertexAttributes)) {
    const data = vertexData.vertexAttributes[dataKind];
    vertexDataArray.set(data, dataKind);
  }
  vertexDataArray.indices = vertexData.indices;
  (window as any).arrs = (window as any).arrs || [];
  (window as any).arrs.push(vertexData, mesh);
  //vertexDataArray.applyToMesh(mesh);
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

  /*meshesToAdd.forEach((mesh) => scene.addMesh(mesh));
  meshesToRemove.forEach((mesh) => scene.removeMesh(mesh));
  scene.meshes.forEach((mesh) => {
    console.log("mesh.name", mesh.name, mesh.getClassName());
    if (mesh instanceof Mesh) {
      const vertexData = breakUpTriangles(mesh, 0.1);
      vertexData.applyToMesh(mesh);
    }
  });*/

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
