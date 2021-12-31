import { mat4, quat, vec3 } from "gl-matrix";
import { Mesh } from "./mesh";

export type NodeConfig = {
  translation: vec3;
  rotation: quat;
  scale: vec3;
  mesh: Mesh;
};

export class Node {
  private translation: vec3;
  private rotation: quat;
  private scale: vec3;
  public constructor({ translation, rotation, scale }: NodeConfig) {
    this.translation = translation;
    this.rotation = rotation;
    this.scale = scale;
  }

  public getTransform = (): mat4 => {
    const result = mat4.create();
    mat4.fromRotationTranslationScale(
      result,
      this.rotation,
      this.translation,
      this.scale
    );
    return result;
  };
}
