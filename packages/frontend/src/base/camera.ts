import { mat4, vec3, quat, quat2 } from "gl-matrix";

export type CameraConfig = {
  /** Initial position. */
  position: vec3;
  /** Initial direction. */
  rotation: quat;
  /** Ratio of the width to the height. i.e. `width/height`. */
  aspectRatio: number;
  /** y axis Field of view in radians. */
  fovy?: number;
  /** Near clipping plane. */
  near?: number;
  /** Far clipping plane. */
  far?: number;
};

export class Camera {
  private aspectRatio: number;
  private fovy: number;
  private near: number;
  private far: number;
  private rot: quat2;

  public constructor({
    aspectRatio,
    fovy,
    near,
    far,
    position,
    rotation,
  }: CameraConfig) {
    this.aspectRatio = aspectRatio;
    this.fovy = fovy ?? 0.78;
    this.near = near ?? 0.001;
    this.far = far ?? 1e5;
    this.rot = fromPositionRotation(position, rotation);
  }

  public getProjectionMatrix = (): mat4 => {
    const proj = mat4.create();
    mat4.perspective(proj, this.fovy, this.aspectRatio, this.near, this.far);
    return proj;
  };

  public getViewMatrix = (): mat4 => {
    const view = mat4.create();
    mat4.fromQuat2(view, this.rot);
    return view;
  };

  public getViewProjectionMatrix = (): mat4 => {
    const proj = this.getProjectionMatrix();
    const view = this.getViewMatrix();
    const vp = mat4.create();
    mat4.mul(vp, proj, view);
    return vp;
  };

  public rotate = (dx: number, dy: number): void => {
    const tmpQuat = quat.create();
    quat.fromEuler(tmpQuat, dy, dx, 0);
    quat2.rotateByQuatPrepend(this.rot, tmpQuat, this.rot);
  };

  public translate = (dPos: vec3): void => {
    const tmp = vec3.clone(dPos);
    const tmpQuat = quat2.create();
    quat2.conjugate(tmpQuat, this.rot);
    vec3.transformQuat(tmp, tmp, tmpQuat as any);
    quat2.translate(this.rot, this.rot, tmp);
  };

  public getTranslation = (): vec3 => {
    const tmp = vec3.create();
    quat2.getTranslation(tmp, this.rot);
    return tmp;
  };
}

const fromPositionRotation = (initialPos?: vec3, initialRot?: quat) => {
  const tmp = quat2.create();
  if (initialPos && initialRot) {
    return quat2.fromRotationTranslation(tmp, initialRot, initialPos);
  } else if (initialPos && !initialRot) {
    return quat2.fromTranslation(tmp, initialPos);
  } else if (!initialPos && initialRot) {
    return quat2.fromRotation(tmp, initialRot);
  }
  return quat2.fromRotationTranslationValues(0, 0, 0, 1, 0, 0, 0);
};
