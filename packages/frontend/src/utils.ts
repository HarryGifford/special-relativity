import { DirectionalLight, ShaderMaterial, Vector3 } from "@babylonjs/core";
import { RelativisticCamera } from "./relativistic-camera";
import { getState, SimultaneityFrame } from "./ui";

export type UniformParams = {
  int?: Record<string, number>;
  float?: Record<string, number>;
  vec3?: Record<string, Vector3>;
};

const ticks = () => {
  return new Date().getTime();
};

const start = ticks();

export const definesFromUiState = () => {
  const {
    galilean,
    simultaneityFrame,
    useFixedVelocity,
    useNoTimeDelay,
    relativisticBeaming,
    dopplerEffect,
    timePulse,
  } = getState();
  const defines = [
    galilean ? "#define GALILEAN" : "",
    useNoTimeDelay
      ? simultaneityFrame == SimultaneityFrame.world
        ? "#define SIMULTANEITY_FRAME_WORLD"
        : "#define SIMULTANEITY_FRAME_CAMERA"
      : "",
    useFixedVelocity ? "#define FIXED_VELOCITY" : "",
    useNoTimeDelay ? "#define NO_TIME_DELAY" : "",
    relativisticBeaming ? "#define RELATIVISTIC_BEAMING" : "",
    dopplerEffect ? "#define DOPPLER_EFFECT" : "",
    timePulse ? "#define TIME_PULSE" : "",
  ];
  return defines;
};

/**
 * Get uniform parameters for shader from UI and camera.
 */
export const getUniformParams = (
  camera: RelativisticCamera,
  light: DirectionalLight
) => {
  const {
    cameraBeta,
    galilean,
    simultaneityFrame,
    useFixedVelocity,
    useNoTimeDelay,
    relativisticBeaming,
    dopplerEffect,
    timePulse,
  } = getState();
  const velocity =
    camera.velocity == null || useFixedVelocity
      ? camera.getDirection(Vector3.Forward()).scale(cameraBeta)
      : camera.velocity;
  const speed = velocity.length();
  const gamma = galilean ? 1 : 1 / Math.sqrt(1 - speed * speed);
  light.computeTransformedInformation();
  const lightDir = light.transformedDirection ?? light.direction;
  lightDir && lightDir.normalize();
  return {
    vec3: {
      velocity,
      lightDir,
    },
    float: {
      time: (ticks() - start) / 1000,
      gamma,
    },
    int: {
      useNoTimeDelay: useNoTimeDelay ? 1 : 0,
      simultaneityFrame,
      useGalilean: galilean ? 1 : 0,
      relativisticBeaming: relativisticBeaming ? 1 : 0,
      dopplerEffect: dopplerEffect ? 1 : 0,
      timePulse: timePulse ? 1 : 0,
    },
  };
};

/** Convenience function for setting a bunch of uniforms on a shader. */
export const setUniforms = (shader: ShaderMaterial, data: UniformParams) => {
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
  if (data.float != null) {
    Object.entries(data.float).forEach(([uniformName, uniformValue]) => {
      shader.setFloat(uniformName, uniformValue);
    });
  }
};
