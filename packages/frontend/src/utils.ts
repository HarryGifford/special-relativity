import { Effect, ShaderMaterial, Vector3 } from "@babylonjs/core";
import { RelativisticCamera } from "./camera";
import { getState } from "./ui";

export type UniformParams = {
  int?: Record<string, number>;
  vec3?: Record<string, Vector3>;
};

export const getCameraVelocity = (
  camera: RelativisticCamera,
  cameraBeta: number,
  useFixedVelocity: boolean
) => {
  const velocity =
    camera.velocity == null || useFixedVelocity
      ? camera.getDirection(Vector3.Forward()).scale(cameraBeta)
      : camera.velocity;
  return velocity;
};

/**
 * Get uniform parameters for shader from UI and camera.
 */
export const getUniformParams = (camera: RelativisticCamera) => {
  const {
    cameraBeta,
    galilean,
    simultaneityFrame,
    useFixedVelocity,
    useNoTimeDelay,
    relativisticBeaming,
    dopplerEffect,
  } = getState();
  const velocity = getCameraVelocity(camera, cameraBeta, useFixedVelocity);
  return {
    vec3: {
      velocity,
    },
    int: {
      useNoTimeDelay: useNoTimeDelay ? 1 : 0,
      simultaneityFrame,
      useGalilean: galilean ? 1 : 0,
      relativisticBeaming: relativisticBeaming ? 1 : 0,
      dopplerEffect: dopplerEffect ? 1 : 0,
    },
  };
};

/** Convenience function for setting a bunch of uniforms on a shader. */
export const setUniforms = (
  shader: ShaderMaterial | Effect,
  data: UniformParams
) => {
  if (data.int != null) {
    Object.entries(data.int).forEach(([uniformName, uniformValue]) => {
      shader.setInt(uniformName, uniformValue);
    });
  }
  if (data.vec3 != null) {
    Object.entries(data.vec3).forEach(([uniformName, uniformValue]) => {
      shader.setVector3(uniformName, uniformValue);
    });
  }
};
