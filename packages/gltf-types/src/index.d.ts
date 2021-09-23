import { Material } from "./material";
import { ChildOfRoot } from "./base";

export * from "./base";
export * from "./material";
export * from "./pbr";
export * from "./texture-info";

export interface GltfNode {
  name?: string;
  mesh: number;
  camera?: number;
  children: number[];
  matrix: number[];
  translation: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
}

export interface GltfPrimitive {
  attributes: {
    POSITION: number;
    NORMAL?: number;
    TANGENT?: number;
    TEXCOORD_0?: number;
    TEXCOORD_1?: number;
    COLOR_0?: number;
  };
  indices: number;
  mode: number;
  material: number;
}

export interface GltfMesh extends ChildOfRoot {
  primitives: GltfPrimitive[];
}

export interface GltfAccessor {
  bufferView: number;
  byteOffset: number;
  componentType: number;
  count: number;
  max: number[];
  min: number[];
  type: GltfElementType.SCALAR | GltfElementType.VEC3;
}

export interface GltfBuffer {
  byteLength: number;
  uri: string;
}

export const enum GltfMagTextureParams {
  NEAREST = 9728,
  LINEAR = 9729,
}

export const enum GltfMinTextureParams {
  NEAREST = 9728,
  LINEAR = 9729,
  NEAREST_MIPMAP_NEAREST = 9984,
  LINEAR_MIPMAP_NEAREST = 9985,
  NEAREST_MIPMAP_LINEAR = 9986,
  LINEAR_MIPMAP_LINEAR = 9987,
}

export const enum GltfTextureWrapParams {
  REPEAT = 10497,
  CLAMP_TO_EDGE = 33071,
  MIRRORED_REPEAT = 33648,
}

export const enum GlDrawMode {
  POINTS = 0,
  LINES = 1,
  LINE_LOOP = 2,
  LINE_STRIP = 3,
  TRIANGLES = 4,
  TRIANGLE_STRIP = 5,
  TRIANGLE_FAN = 6,
}

export const enum GlBufferTarget {
  ARRAY_BUFFER = 34962,
  ELEMENT_ARRAY_BUFFER = 34963,
}

export const enum GltfComponentType {
  BYTE = 5120,
  UNSIGNED_BYTE = 5121,
  SHORT = 5122,
  UNSIGNED_SHORT = 5123,
  UNSIGNED_INT = 5125,
  FLOAT = 5126,
}

export const enum GltfElementType {
  SCALAR = "SCALAR",
  VEC2 = "VEC2",
  VEC3 = "VEC3",
  VEC4 = "VEC4",
  MAT2 = "MAT2",
  MAT3 = "MAT3",
  MAT4 = "MAT4",
}

export interface GltfBufferView {
  buffer: number;
  byteOffset: number;
  byteLength: number;
  byteStride: number;
  target: GlBufferTarget;
}

export interface GltfSampler {
  magFilter: number;
  minFilter: number;
  wrapS: number;
  wrapT: number;
}

export interface GltfTexture {
  sampler: number;
  source: number;
}

export interface GltfImage {
  uri: string;
}

export interface GltfScene {
  nodes: number[];
}

export interface GltfOrthographicCamera extends ChildOfRoot {
  type: "orthographic";
  orthographic: {
    xmag: number;
    ymax: number;
    zfar: number;
    znear: number;
  };
}

/**
 * A perspective camera containing properties to create a perspective
 * projection matrix.
 */
export interface GltfPerspectiveCamera extends ChildOfRoot {
  type: "perspective";
  perspective: {
    /**
     * The floating-point aspect ratio of the field of view.
     *
     * When this is undefined, the aspect ratio of the canvas is used.
     */
    aspectRatio?: number;
    /** The floating-point vertical field of view in radians. */
    yfov: number;
    /**
     * The floating-point distance to the far clipping plane.
     *
     * When defined, `zfar` must be greater than `znear`. If `zfar` is
     * undefined, runtime must use infinite projection matrix. */
    zfar?: number;
    /** The floating-point distance to the near clipping plane. */
    znear: number;
  };
}

export type GltfCamera = GltfOrthographicCamera | GltfPerspectiveCamera;

export interface Gltf {
  accessors: GltfAccessor[];
  buffers: GltfBuffer[];
  bufferViews: GltfBufferView[];
  cameras?: GltfCamera[];
  images: GltfImage[];
  materials: Material[];
  meshes: GltfMesh[];
  nodes: GltfNode[];
  samplers: GltfSampler[];
  scene: number;
  scenes: GltfScene[];
  textures: GltfTexture[];
}
