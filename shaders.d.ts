import { Scene, BaseTexture } from "@babylonjs/core";
import { UniformParams } from "./utils";
export declare type ShaderConfig = {
    scene: Scene;
    rgbMapTexture: BaseTexture;
};
/** Initialize the special relativity shaders. */
export declare const initShaders: ({ scene, rgbMapTexture }: ShaderConfig) => {
    definesChange: (defines: string[]) => void;
    uniformsChange: (uniforms: UniformParams) => void;
};
//# sourceMappingURL=shaders.d.ts.map