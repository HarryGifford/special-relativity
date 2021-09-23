/** Reference to a texture. */
export type TextureInfo = {
  /** The index of the texture. */
  index: number;
  /**
   * The set index of texture's TEXCOORD attribute used for texture
   * coordinate mapping.
   *
   * This integer value is used to construct a string in the format
   * `TEXCOORD_<set index>` which is a reference to a key in
   * mesh.primitives.attributes (e.g. A value of `0` corresponds to
   * `TEXCOORD_0`). Mesh must have corresponding texture coordinate
   * attributes for the material to be applicable to it.
   */
  texCoord?: number;
};

/** Material Normal Texture Info. */
export interface NormalTextureInfo extends TextureInfo {
  /**
   * The scalar multiplier applied to each normal vector of the normal
   * texture.
   *
   * The scalar multiplier applied to each normal vector of the texture. This
   * value scales the normal vector using the formula:
   *
   * ```glsl
   * scaledNormal = normalize(
   *     (<sampled normal texture value> * 2.0 - 1.0)
   *    * vec3(<normal scale>, <normal scale>, 1.0)
   * )
   * ```
   * This value is ignored if normalTexture is not specified. This value is
   * linear.
   * @defaultValue 1.0
   */
  scale?: number;
}

/** Material Occlusion Texture Info. */
export interface OcclusionTextureInfo extends TextureInfo {
  /**
   * A scalar multiplier controlling the amount of occlusion applied.
   *
   * A value of 0.0 means no occlusion. A value of 1.0 means full occlusion.
   * This value affects the resulting color using the formula:
   *
   * ```glsl
   * occludedColor = lerp(
   *     color,
   *     color * <sampled occlusion texture value>,
   *     <occlusion strength>
   * )
   * ```
   *
   * This value is ignored if the corresponding texture is not
   * specified. This value is linear.
   *
   * @defaultValue 1.0
   * @minValue 0.0
   * @maxValue 1.0
   */
  strength?: number;
}
