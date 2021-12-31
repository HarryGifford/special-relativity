/** The root object for a glTF asset. */
export type glTF = {
  /** Names of glTF extensions used somewhere in this asset. */
  extensionsUsed: Array<string>;
  /** Names of glTF extensions required to properly load this asset. */
  extensionsRequired: Array<string>;
  /** An array of accessors.  An accessor is a typed view into a bufferView. */
  accessors: Array<Accessor>;
  /** An array of keyframe animations. */
  animations: Array<Animation>;
  /** Metadata about the glTF asset. */
  asset: Asset;
  /** An array of buffers.  A buffer points to binary geometry, animation, or skins. */
  buffers: Array<Buffer>;
  /** An array of bufferViews.  A bufferView is a view into a buffer generally representing a subset of the buffer. */
  bufferViews: Array<Buffer_View>;
  /** An array of cameras.  A camera defines a projection matrix. */
  cameras: Array<Camera>;
  /** An array of images.  An image defines data used to create a texture. */
  images: Array<Image>;
  /** An array of materials.  A material defines the appearance of a primitive. */
  materials: Array<Material>;
  /** An array of meshes.  A mesh is a set of primitives to be rendered. */
  meshes: Array<Mesh>;
  /** An array of nodes. */
  nodes: Array<Node>;
  /** An array of samplers.  A sampler contains properties for texture filtering and wrapping modes. */
  samplers: Array<Sampler>;
  /** The index of the default scene. */
  scene: glTF_Id;
  /** An array of scenes. */
  scenes: Array<Scene>;
  /** An array of skins.  A skin is defined by joints and matrices. */
  skins: Array<Skin>;
  /** An array of textures. */
  textures: Array<Texture>;
} & glTF_Property;
/** A typed view into a bufferView.  A bufferView contains raw binary data.  An accessor provides a typed view into a bufferView or a subset of a bufferView similar to how WebGL's `vertexAttribPointer()` defines an attribute in a buffer. */
export type Accessor = {
  /** The index of the bufferView. When not defined, accessor must be initialized with zeros; `sparse` property or extensions could override zeros with actual values. */
  bufferView: glTF_Id;
  /** The offset relative to the start of the bufferView in bytes.  This must be a multiple of the size of the component datatype. */
  byteOffset: number;
  /** The datatype of components in the attribute.  All valid values correspond to WebGL enums.  The corresponding typed arrays are `Int8Array`, `Uint8Array`, `Int16Array`, `Uint16Array`, `Uint32Array`, and `Float32Array`, respectively.  5125 (UNSIGNED_INT) is only allowed when the accessor contains indices, i.e., the accessor is only referenced by `primitive.indices`. */
  componentType:
    | 5120 /* BYTE */
    | 5121 /* UNSIGNED_BYTE */
    | 5122 /* SHORT */
    | 5123 /* UNSIGNED_SHORT */
    | 5125 /* UNSIGNED_INT */
    | 5126 /* FLOAT */
    | number;
  /** Specifies whether integer data values should be normalized (`true`) to [0, 1] (for unsigned types) or [-1, 1] (for signed types), or converted directly (`false`) when they are accessed. This property is defined only for accessors that contain vertex attributes or animation output data. */
  normalized: boolean;
  /** The number of attributes referenced by this accessor, not to be confused with the number of bytes or number of components. */
  count: number;
  /** Specifies if the attribute is a scalar, vector, or matrix. */
  type: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4" | string;
  /** Maximum value of each component in this attribute.  Array elements must be treated as having the same data type as accessor's `componentType`. Both min and max arrays have the same length.  The length is determined by the value of the type property; it can be 1, 2, 3, 4, 9, or 16.

`normalized` property has no effect on array values: they always correspond to the actual values stored in the buffer. When accessor is sparse, this property must contain max values of accessor data with sparse substitution applied. */
  max: Array<number>;
  /** Minimum value of each component in this attribute.  Array elements must be treated as having the same data type as accessor's `componentType`. Both min and max arrays have the same length.  The length is determined by the value of the type property; it can be 1, 2, 3, 4, 9, or 16.

`normalized` property has no effect on array values: they always correspond to the actual values stored in the buffer. When accessor is sparse, this property must contain min values of accessor data with sparse substitution applied. */
  min: Array<number>;
  /** Sparse storage of attributes that deviate from their initialization value. */
  sparse: Accessor_Sparse;
} & glTF_Child_of_Root_Property;
export type glTF_Id = number;
/** Sparse storage of attributes that deviate from their initialization value. */
export type Accessor_Sparse = {
  /** The number of attributes encoded in this sparse accessor. */
  count: number;
  /** Index array of size `count` that points to those accessor attributes that deviate from their initialization value. Indices must strictly increase. */
  indices: Accessor_Sparse_Indices;
  /** Array of size `count` times number of components, storing the displaced accessor attributes pointed by `indices`. Substituted values must have the same `componentType` and number of components as the base accessor. */
  values: Accessor_Sparse_Values;
} & glTF_Property;
/** Indices of those attributes that deviate from their initialization value. */
export type Accessor_Sparse_Indices = {
  /** The index of the bufferView with sparse indices. Referenced bufferView can't have ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target. */
  bufferView: glTF_Id;
  /** The offset relative to the start of the bufferView in bytes. Must be aligned. */
  byteOffset: number;
  /** The indices data type.  Valid values correspond to WebGL enums: `5121` (UNSIGNED_BYTE), `5123` (UNSIGNED_SHORT), `5125` (UNSIGNED_INT). */
  componentType:
    | 5121 /* UNSIGNED_BYTE */
    | 5123 /* UNSIGNED_SHORT */
    | 5125 /* UNSIGNED_INT */
    | number;
} & glTF_Property;
export type glTF_Property = {
  extensions: Extension;
  extras: Extras;
};
/** Dictionary object with extension-specific objects. */
export type Extension = {
  [x: string]: {};
};
/** Application-specific data. */
export type Extras = any;
/** Array of size `accessor.sparse.count` times number of components storing the displaced accessor attributes pointed by `accessor.sparse.indices`. */
export type Accessor_Sparse_Values = {
  /** The index of the bufferView with sparse values. Referenced bufferView can't have ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target. */
  bufferView: glTF_Id;
  /** The offset relative to the start of the bufferView in bytes. Must be aligned. */
  byteOffset: number;
} & glTF_Property;
export type glTF_Child_of_Root_Property = {
  /** The user-defined name of this object.  This is not necessarily unique, e.g., an accessor and a buffer could have the same name, or two accessors could even have the same name. */
  name: string;
} & glTF_Property;
/** A keyframe animation. */
export type Animation = {
  /** An array of channels, each of which targets an animation's sampler at a node's property. Different channels of the same animation can't have equal targets. */
  channels: Array<Animation_Channel>;
  /** An array of samplers that combines input and output accessors with an interpolation algorithm to define a keyframe graph (but not its target). */
  samplers: Array<Animation_Sampler>;
} & glTF_Child_of_Root_Property;
/** Targets an animation's sampler at a node's property. */
export type Animation_Channel = {
  /** The index of a sampler in this animation used to compute the value for the target, e.g., a node's translation, rotation, or scale (TRS). */
  sampler: glTF_Id;
  /** The index of the node and TRS property to target. */
  target: Animation_Channel_Target;
} & glTF_Property;
/** The index of the node and TRS property that an animation channel targets. */
export type Animation_Channel_Target = {
  /** The index of the node to target. */
  node: glTF_Id;
  /** The name of the node's TRS property to modify, or the "weights" of the Morph Targets it instantiates. For the "translation" property, the values that are provided by the sampler are the translation along the x, y, and z axes. For the "rotation" property, the values are a quaternion in the order (x, y, z, w), where w is the scalar. For the "scale" property, the values are the scaling factors along the x, y, and z axes. */
  path: "translation" | "rotation" | "scale" | "weights" | string;
} & glTF_Property;
/** Combines input and output accessors with an interpolation algorithm to define a keyframe graph (but not its target). */
export type Animation_Sampler = {
  /** The index of an accessor containing keyframe input values, e.g., time. That accessor must have componentType `FLOAT`. The values represent time in seconds with `time[0] >= 0.0`, and strictly increasing values, i.e., `time[n + 1] > time[n]`. */
  input: glTF_Id;
  /** Interpolation algorithm. */
  interpolation: "LINEAR" | "STEP" | "CUBICSPLINE" | string;
  /** The index of an accessor containing keyframe output values. When targeting translation or scale paths, the `accessor.componentType` of the output values must be `FLOAT`. When targeting rotation or morph weights, the `accessor.componentType` of the output values must be `FLOAT` or normalized integer. For weights, each output element stores `SCALAR` values with a count equal to the number of morph targets. */
  output: glTF_Id;
} & glTF_Property;
/** Metadata about the glTF asset. */
export type Asset = {
  /** A copyright message suitable for display to credit the content creator. */
  copyright: string;
  /** Tool that generated this glTF model.  Useful for debugging. */
  generator: string;
  /** The glTF version that this asset targets. */
  version: string;
  /** The minimum glTF version that this asset targets. */
  minVersion: string;
} & glTF_Property;
/** A buffer points to binary geometry, animation, or skins. */
export type Buffer = {
  /** The uri of the buffer.  Relative paths are relative to the .gltf file.  Instead of referencing an external file, the uri can also be a data-uri. */
  uri: string;
  /** The length of the buffer in bytes. */
  byteLength: number;
} & glTF_Child_of_Root_Property;
/** A view into a buffer generally representing a subset of the buffer. */
export type Buffer_View = {
  /** The index of the buffer. */
  buffer: glTF_Id;
  /** The offset into the buffer in bytes. */
  byteOffset: number;
  /** The length of the bufferView in bytes. */
  byteLength: number;
  /** The stride, in bytes, between vertex attributes.  When this is not defined, data is tightly packed. When two or more accessors use the same bufferView, this field must be defined. */
  byteStride: number;
  /** The target that the GPU buffer should be bound to. */
  target: 34962 /* ARRAY_BUFFER */ | 34963 /* ELEMENT_ARRAY_BUFFER */ | number;
} & glTF_Child_of_Root_Property;
/** A camera's projection.  A node can reference a camera to apply a transform to place the camera in the scene. */
export type Camera = {
  /** An orthographic camera containing properties to create an orthographic projection matrix. */
  orthographic: Camera_Orthographic;
  /** A perspective camera containing properties to create a perspective projection matrix. */
  perspective: Camera_Perspective;
  /** Specifies if the camera uses a perspective or orthographic projection.  Based on this, either the camera's `perspective` or `orthographic` property will be defined. */
  type: "perspective" | "orthographic" | string;
} & glTF_Child_of_Root_Property;
/** An orthographic camera containing properties to create an orthographic projection matrix. */
export type Camera_Orthographic = {
  /** The floating-point horizontal magnification of the view. Must not be zero. */
  xmag: number;
  /** The floating-point vertical magnification of the view. Must not be zero. */
  ymag: number;
  /** The floating-point distance to the far clipping plane. `zfar` must be greater than `znear`. */
  zfar: number;
  /** The floating-point distance to the near clipping plane. */
  znear: number;
} & glTF_Property;
/** A perspective camera containing properties to create a perspective projection matrix. */
export type Camera_Perspective = {
  /** The floating-point aspect ratio of the field of view. When this is undefined, the aspect ratio of the canvas is used. */
  aspectRatio: number;
  /** The floating-point vertical field of view in radians. */
  yfov: number;
  /** The floating-point distance to the far clipping plane. When defined, `zfar` must be greater than `znear`. If `zfar` is undefined, runtime must use infinite projection matrix. */
  zfar: number;
  /** The floating-point distance to the near clipping plane. */
  znear: number;
} & glTF_Property;
/** Image data used to create a texture. Image can be referenced by URI or `bufferView` index. `mimeType` is required in the latter case. */
export type Image = {
  /** The uri of the image.  Relative paths are relative to the .gltf file.  Instead of referencing an external file, the uri can also be a data-uri.  The image format must be jpg or png. */
  uri: string;
  /** The image's MIME type. Required if `bufferView` is defined. */
  mimeType: "image/jpeg" | "image/png" | string;
  /** The index of the bufferView that contains the image. Use this instead of the image's uri property. */
  bufferView: glTF_Id;
} & glTF_Child_of_Root_Property;
/** The material appearance of a primitive. */
export type Material = {
  /** A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology. When not specified, all the default values of `pbrMetallicRoughness` apply. */
  pbrMetallicRoughness: Material_PBR_Metallic_Roughness;
  /** A tangent space normal map. The texture contains RGB components in linear space. Each texel represents the XYZ components of a normal vector in tangent space. Red [0 to 255] maps to X [-1 to 1]. Green [0 to 255] maps to Y [-1 to 1]. Blue [128 to 255] maps to Z [1/255 to 1]. The normal vectors use the convention +X is right and +Y is up. +Z points toward the viewer. In GLSL, this vector would be unpacked like so: `vec3 normalVector = tex2D(<sampled normal map texture value>, texCoord) * 2 - 1`. Client implementations should normalize the normal vectors before using them in lighting equations. */
  normalTexture: Material_Normal_Texture_Info;
  /** The occlusion map texture. The occlusion values are sampled from the R channel. Higher values indicate areas that should receive full indirect lighting and lower values indicate no indirect lighting. These values are linear. If other channels are present (GBA), they are ignored for occlusion calculations. */
  occlusionTexture: Material_Occlusion_Texture_Info;
  /** The emissive map controls the color and intensity of the light being emitted by the material. This texture contains RGB components encoded with the sRGB transfer function. If a fourth component (A) is present, it is ignored. */
  emissiveTexture: Texture_Info;
  /** The RGB components of the emissive color of the material. These values are linear. If an emissiveTexture is specified, this value is multiplied with the texel values. */
  emissiveFactor: Array<number>;
  /** The material's alpha rendering mode enumeration specifying the interpretation of the alpha value of the main factor and texture. */
  alphaMode: "OPAQUE" | "MASK" | "BLEND" | string;
  /** Specifies the cutoff threshold when in `MASK` mode. If the alpha value is greater than or equal to this value then it is rendered as fully opaque, otherwise, it is rendered as fully transparent. A value greater than 1.0 will render the entire material as fully transparent. This value is ignored for other modes. */
  alphaCutoff: number;
  /** Specifies whether the material is double sided. When this value is false, back-face culling is enabled. When this value is true, back-face culling is disabled and double sided lighting is enabled. The back-face must have its normals reversed before the lighting equation is evaluated. */
  doubleSided: boolean;
} & glTF_Child_of_Root_Property;
/** A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology. */
export type Material_PBR_Metallic_Roughness = {
  /** The RGBA components of the base color of the material. The fourth component (A) is the alpha coverage of the material. The `alphaMode` property specifies how alpha is interpreted. These values are linear. If a baseColorTexture is specified, this value is multiplied with the texel values. */
  baseColorFactor: Array<number>;
  /** The base color texture. The first three components (RGB) are encoded with the sRGB transfer function. They specify the base color of the material. If the fourth component (A) is present, it represents the linear alpha coverage of the material. Otherwise, an alpha of 1.0 is assumed. The `alphaMode` property specifies how alpha is interpreted. The stored texels must not be premultiplied. */
  baseColorTexture: Texture_Info;
  /** The metalness of the material. A value of 1.0 means the material is a metal. A value of 0.0 means the material is a dielectric. Values in between are for blending between metals and dielectrics such as dirty metallic surfaces. This value is linear. If a metallicRoughnessTexture is specified, this value is multiplied with the metallic texel values. */
  metallicFactor: number;
  /** The roughness of the material. A value of 1.0 means the material is completely rough. A value of 0.0 means the material is completely smooth. This value is linear. If a metallicRoughnessTexture is specified, this value is multiplied with the roughness texel values. */
  roughnessFactor: number;
  /** The metallic-roughness texture. The metalness values are sampled from the B channel. The roughness values are sampled from the G channel. These values are linear. If other channels are present (R or A), they are ignored for metallic-roughness calculations. */
  metallicRoughnessTexture: Texture_Info;
} & glTF_Property;
/** Reference to a texture. */
export type Texture_Info = {
  /** The index of the texture. */
  index: glTF_Id;
  /** This integer value is used to construct a string in the format `TEXCOORD_<set index>` which is a reference to a key in mesh.primitives.attributes (e.g. A value of `0` corresponds to `TEXCOORD_0`). Mesh must have corresponding texture coordinate attributes for the material to be applicable to it. */
  texCoord: number;
} & glTF_Property;
export type Material_Normal_Texture_Info = {
  /** The scalar multiplier applied to each normal vector of the texture. This value scales the normal vector using the formula: `scaledNormal =  normalize((<sampled normal texture value> * 2.0 - 1.0) * vec3(<normal scale>, <normal scale>, 1.0))`. This value is ignored if normalTexture is not specified. This value is linear. */
  scale: number;
} & Texture_Info;
export type Material_Occlusion_Texture_Info = {
  /** A scalar multiplier controlling the amount of occlusion applied. A value of 0.0 means no occlusion. A value of 1.0 means full occlusion. This value affects the resulting color using the formula: `occludedColor = lerp(color, color * <sampled occlusion texture value>, <occlusion strength>)`. This value is ignored if the corresponding texture is not specified. This value is linear. */
  strength: number;
} & Texture_Info;
/** A set of primitives to be rendered.  A node can contain one mesh.  A node's transform places the mesh in the scene. */
export type Mesh = {
  /** An array of primitives, each defining geometry to be rendered with a material. */
  primitives: Array<Mesh_Primitive>;
  /** Array of weights to be applied to the Morph Targets. */
  weights: Array<number>;
} & glTF_Child_of_Root_Property;
/** Geometry to be rendered with the given material. */
export type Mesh_Primitive = {
  /** A dictionary object, where each key corresponds to mesh attribute semantic and each value is the index of the accessor containing attribute's data. */
  attributes: {
    [x: string]: glTF_Id;
  };
  /** The index of the accessor that contains mesh indices.  When this is not defined, the primitives should be rendered without indices using `drawArrays()`.  When defined, the accessor must contain indices: the `bufferView` referenced by the accessor should have a `target` equal to 34963 (ELEMENT_ARRAY_BUFFER); `componentType` must be 5121 (UNSIGNED_BYTE), 5123 (UNSIGNED_SHORT) or 5125 (UNSIGNED_INT), the latter may require enabling additional hardware support; `type` must be `"SCALAR"`. For triangle primitives, the front face has a counter-clockwise (CCW) winding order. Values of the index accessor must not include the maximum value for the given component type, which triggers primitive restart in several graphics APIs and would require client implementations to rebuild the index buffer. Primitive restart values are disallowed and all index values must refer to actual vertices. As a result, the index accessor's values must not exceed the following maxima: BYTE `< 255`, UNSIGNED_SHORT `< 65535`, UNSIGNED_INT `< 4294967295`. */
  indices: glTF_Id;
  /** The index of the material to apply to this primitive when rendering. */
  material: glTF_Id;
  /** The type of primitives to render. All valid values correspond to WebGL enums. */
  mode:
    | 0 /* POINTS */
    | 1 /* LINES */
    | 2 /* LINE_LOOP */
    | 3 /* LINE_STRIP */
    | 4 /* TRIANGLES */
    | 5 /* TRIANGLE_STRIP */
    | 6 /* TRIANGLE_FAN */
    | number;
  /** An array of Morph Targets, each  Morph Target is a dictionary mapping attributes (only `POSITION`, `NORMAL`, and `TANGENT` supported) to their deviations in the Morph Target. */
  targets: Array<{
    [x: string]: glTF_Id;
  }>;
} & glTF_Property;
/** A node in the node hierarchy.  When the node contains `skin`, all `mesh.primitives` must contain `JOINTS_0` and `WEIGHTS_0` attributes.  A node can have either a `matrix` or any combination of `translation`/`rotation`/`scale` (TRS) properties. TRS properties are converted to matrices and postmultiplied in the `T * R * S` order to compose the transformation matrix; first the scale is applied to the vertices, then the rotation, and then the translation. If none are provided, the transform is the identity. When a node is targeted for animation (referenced by an animation.channel.target), only TRS properties may be present; `matrix` will not be present. */
export type Node = {
  /** The index of the camera referenced by this node. */
  camera: glTF_Id;
  /** The indices of this node's children. */
  children: Array<glTF_Id>;
  /** The index of the skin referenced by this node. When a skin is referenced by a node within a scene, all joints used by the skin must belong to the same scene. */
  skin: glTF_Id;
  /** A floating-point 4x4 transformation matrix stored in column-major order. */
  matrix: Array<number>;
  /** The index of the mesh in this node. */
  mesh: glTF_Id;
  /** The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar. */
  rotation: Array<number>;
  /** The node's non-uniform scale, given as the scaling factors along the x, y, and z axes. */
  scale: Array<number>;
  /** The node's translation along the x, y, and z axes. */
  translation: Array<number>;
  /** The weights of the instantiated Morph Target. Number of elements must match number of Morph Targets of used mesh. */
  weights: Array<number>;
} & glTF_Child_of_Root_Property;
/** Texture sampler properties for filtering and wrapping modes. */
export type Sampler = {
  /** Magnification filter.  Valid values correspond to WebGL enums: `9728` (NEAREST) and `9729` (LINEAR). */
  magFilter: 9728 /* NEAREST */ | 9729 /* LINEAR */ | number;
  /** Minification filter.  All valid values correspond to WebGL enums. */
  minFilter:
    | 9728 /* NEAREST */
    | 9729 /* LINEAR */
    | 9984 /* NEAREST_MIPMAP_NEAREST */
    | 9985 /* LINEAR_MIPMAP_NEAREST */
    | 9986 /* NEAREST_MIPMAP_LINEAR */
    | 9987 /* LINEAR_MIPMAP_LINEAR */
    | number;
  /** S (U) wrapping mode.  All valid values correspond to WebGL enums. */
  wrapS:
    | 33071 /* CLAMP_TO_EDGE */
    | 33648 /* MIRRORED_REPEAT */
    | 10497 /* REPEAT */
    | number;
  /** T (V) wrapping mode.  All valid values correspond to WebGL enums. */
  wrapT:
    | 33071 /* CLAMP_TO_EDGE */
    | 33648 /* MIRRORED_REPEAT */
    | 10497 /* REPEAT */
    | number;
} & glTF_Child_of_Root_Property;
/** The root nodes of a scene. */
export type Scene = {
  /** The indices of each root node. */
  nodes: Array<glTF_Id>;
} & glTF_Child_of_Root_Property;
/** Joints and matrices defining a skin. */
export type Skin = {
  /** The index of the accessor containing the floating-point 4x4 inverse-bind matrices.  The default is that each matrix is a 4x4 identity matrix, which implies that inverse-bind matrices were pre-applied. */
  inverseBindMatrices: glTF_Id;
  /** The index of the node used as a skeleton root. The node must be the closest common root of the joints hierarchy or a direct or indirect parent node of the closest common root. */
  skeleton: glTF_Id;
  /** Indices of skeleton nodes, used as joints in this skin.  The array length must be the same as the `count` property of the `inverseBindMatrices` accessor (when defined). */
  joints: Array<glTF_Id>;
} & glTF_Child_of_Root_Property;
/** A texture and its sampler. */
export type Texture = {
  /** The index of the sampler used by this texture. When undefined, a sampler with repeat wrapping and auto filtering should be used. */
  sampler: glTF_Id;
  /** The index of the image used by this texture. When undefined, it is expected that an extension or other mechanism will supply an alternate texture source, otherwise behavior is undefined. */
  source: glTF_Id;
} & glTF_Child_of_Root_Property;
export const BYTE = 5120;
export const UNSIGNED_BYTE = 5121;
export const SHORT = 5122;
export const UNSIGNED_SHORT = 5123;
export const UNSIGNED_INT = 5125;
export const FLOAT = 5126;
export const ARRAY_BUFFER = 34962;
export const ELEMENT_ARRAY_BUFFER = 34963;
export const POINTS = 0;
export const LINES = 1;
export const LINE_LOOP = 2;
export const LINE_STRIP = 3;
export const TRIANGLES = 4;
export const TRIANGLE_STRIP = 5;
export const TRIANGLE_FAN = 6;
export const NEAREST = 9728;
export const LINEAR = 9729;
export const NEAREST_MIPMAP_NEAREST = 9984;
export const LINEAR_MIPMAP_NEAREST = 9985;
export const NEAREST_MIPMAP_LINEAR = 9986;
export const LINEAR_MIPMAP_LINEAR = 9987;
export const CLAMP_TO_EDGE = 33071;
export const MIRRORED_REPEAT = 33648;
export const REPEAT = 10497;
