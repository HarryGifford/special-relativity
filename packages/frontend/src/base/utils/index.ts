import { vec3, quat, mat4 } from "gl-matrix";

export type Trsm = {
  translation?: vec3;
  rotation?: quat;
  scale?: vec3;
  matrix?: mat4;
};

export type Trs = {
  translation: vec3;
  rotation: quat;
  scale: vec3;
};

export const trsFromTrsm = (trsm: Trsm): Trs => {
  const translation = trsm.translation ?? vec3.create();
  const rotation = trsm.rotation ?? quat.create();
  const scale = trsm.scale ?? vec3.create();
  if (trsm.matrix != null) {
    mat4.getTranslation(translation, trsm.matrix);
    mat4.getRotation(rotation, trsm.matrix);
    mat4.getScaling(scale, trsm.matrix);
  }
  if (trsm.translation == null) {
    vec3.zero(translation);
  }
  if (trsm.rotation == null) {
    quat.identity(rotation);
  }
  if (trsm.scale == null) {
    vec3.set(scale, 1, 1, 1);
  }
  return {
    translation,
    rotation,
    scale,
  };
};

export const matrixFromTrsm = ({
  translation,
  rotation,
  scale,
  matrix,
}: Trsm) => {
  if (matrix != null) {
    return matrix;
  }
  const tmp = mat4.create();
  if (translation != null) {
    if (rotation != null) {
      if (scale != null) {
        mat4.fromRotationTranslationScale(tmp, rotation, translation, scale);
        return tmp;
      } else {
        mat4.fromRotationTranslation(tmp, rotation, translation);
        return tmp;
      }
    } /* rotation == null */ else {
      if (scale == null) {
        mat4.fromTranslation(tmp, translation);
        return tmp;
      }
    }
  } /* translation == null */ else {
    if (scale != null && rotation == null) {
      mat4.fromScaling(tmp, scale);
      return tmp;
    }
  }
  let rot: quat;
  if (rotation != null) {
    rot = rotation;
  } else {
    rot = quat.create();
    quat.identity(rot);
  }
  let trans: vec3;
  if (translation != null) {
    trans = translation;
  } else {
    trans = vec3.create();
    vec3.zero(trans);
  }
  let scal: vec3;
  if (scale != null) {
    scal = scale;
  } else {
    scal = vec3.create();
    vec3.set(scal, 1, 1, 1);
  }

  mat4.fromRotationTranslationScale(tmp, rot, trans, scal);
  return tmp;
};
