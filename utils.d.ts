import { DirectionalLight, ShaderMaterial, Vector3 } from "@babylonjs/core";
import { RelativisticCamera } from "./camera";
import { SimultaneityFrame } from "./ui";
export declare type UniformParams = {
    int?: Record<string, number>;
    float?: Record<string, number>;
    vec3?: Record<string, Vector3>;
};
export declare const definesFromUiState: () => string[];
/**
 * Get uniform parameters for shader from UI and camera.
 */
export declare const getUniformParams: (camera: RelativisticCamera, light: DirectionalLight) => {
    vec3: {
        velocity: Vector3;
        lightDir: Vector3;
    };
    float: {
        time: number;
        gamma: number;
    };
    int: {
        useNoTimeDelay: number;
        simultaneityFrame: SimultaneityFrame;
        useGalilean: number;
        relativisticBeaming: number;
        dopplerEffect: number;
        timePulse: number;
    };
};
/** Convenience function for setting a bunch of uniforms on a shader. */
export declare const setUniforms: (shader: ShaderMaterial, data: UniformParams) => void;
//# sourceMappingURL=utils.d.ts.map