import { ShaderMaterial, Vector3 } from "@babylonjs/core";
import { RelativisticCamera } from "./camera";
export declare type UniformParams = {
    int?: Record<string, number>;
    vec3?: Record<string, Vector3>;
};
/**
 * Get uniform parameters for shader from UI and camera.
 */
export declare const getUniformParams: (camera: RelativisticCamera) => {
    vec3: {
        velocity: Vector3;
    };
    int: {
        useNoTimeDelay: number;
        simultaneityFrame: import("./ui").SimultaneityFrame;
        useGalilean: number;
        relativisticBeaming: number;
        dopplerEffect: number;
    };
};
/** Convenience function for setting a bunch of uniforms on a shader. */
export declare const setUniforms: (shader: ShaderMaterial, data: UniformParams) => void;
//# sourceMappingURL=utils.d.ts.map