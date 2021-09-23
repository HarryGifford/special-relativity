import { quat, quat2, vec3, mat4 } from "gl-matrix";

export type PerspectiveConfig = {
  aspectRatio: number;
  yfov: number;
  zfar?: number;
  znear: number;
};

class Camera {
  private projection: mat4;
  private trans: quat2;
  public constructor() {
    this.projection = mat4.create();
    this.trans = quat2.create();
    quat2.identity(this.trans);
  }

  public getViewMatrix = () => {
    const viewMatrix = mat4.create();
    mat4.fromQuat2(viewMatrix, this.trans);
    return viewMatrix;
  }

  public getProjectionMatrix = () => this.projection;

  public setPerspective = ({
    yfov,
    znear,
    zfar,
    aspectRatio,
  }: PerspectiveConfig) => {
    mat4.perspective(this.projection, yfov, aspectRatio, znear, zfar!);
  };

  public transformFromMat4 = (mat: mat4) => {
    quat2.fromMat4(this.trans, mat);
  };

  public transformFromRotationPosition = (rotation: quat, position: vec3) => {
    quat2.fromRotationTranslation(this.trans, rotation, position);
  };
}

export {};
