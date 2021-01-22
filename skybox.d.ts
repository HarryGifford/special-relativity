import { ShaderMaterial, CubeTexture, Scene, Mesh } from "@babylonjs/core";
export declare const makeSkybox: (scene: Scene) => Promise<{
    skybox: Mesh;
    skyboxMaterial: ShaderMaterial;
    cubeTexture: CubeTexture;
}>;
//# sourceMappingURL=skybox.d.ts.map