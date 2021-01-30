import {
  Scene,
  BaseTexture,
  Material,
  AbstractMesh,
  PBRMaterial,
  BackgroundMaterial,
  ShaderMaterial,
  InstancedMesh,
} from "@babylonjs/core";
import { UniformParams, setUniforms } from "./utils";

export type ShaderConfig = {
  scene: Scene;
  rgbMapTexture: BaseTexture;
};

/** Initialize the special relativity shaders. */
export const initShaders = ({ scene, rgbMapTexture }: ShaderConfig) => {
  const validMeshes = scene.meshes.filter(
    (mesh) => !(mesh instanceof InstancedMesh) && mesh.material != null
  );
  const materials = validMeshes.map((mesh) => mesh.material);
  const definesChange = (defines: string[]) => {
    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];
      const mesh = validMeshes[i];
      updateShaderMaterial(scene, rgbMapTexture, material!, mesh, defines);
    }
  };
  const uniformsChange = (uniforms: UniformParams) => {
    for (let i = 0; i < materials.length; i++) {
      const mesh = validMeshes[i];
      const material = mesh.material;
      if (!(material instanceof ShaderMaterial)) {
        continue;
      }
      setUniforms(material, uniforms);
    }
  };
  return {
    definesChange,
    uniformsChange,
  };
};

const updateShaderMaterial = (
  scene: Scene,
  rgbMapTexture: BaseTexture,
  material: Material,
  mesh: AbstractMesh,
  userDefines: string[]
) => {
  const samplers: Record<string, BaseTexture> = {};
  const defines = [...userDefines];
  if (material instanceof PBRMaterial) {
    // Take the pre-defined samplers.
    samplers["albedoSampler"] = material.albedoTexture;
    if (material.bumpTexture != null) {
      samplers["bumpSampler"] = material.bumpTexture;
      defines.push("#define TANGENT");
    }
  } else if (material instanceof BackgroundMaterial) {
    if (material.reflectionTexture != null) {
      samplers["reflectionSampler"] = material.reflectionTexture;
    }
    defines.push("#define SKYBOX");
  }
  samplers["rgbMapSampler"] = rgbMapTexture;
  const shaderMaterial = new ShaderMaterial(
    "shader" + mesh.name,
    scene,
    {
      vertex: "custom",
      fragment: "custom",
    },
    {
      attributes: ["position", "normal", "tangent", "uv"],
      uniforms: [
        "world",
        "finalWorld",
        "view",
        "projection",
        "velocity",
        "time",
      ],
      samplers: Object.keys(samplers),
      defines,
    }
  );
  Object.entries(samplers).map(([name, texture]) => {
    shaderMaterial.setTexture(name, texture);
  });
  // If there's already a shadermaterial, then we delete it.
  if (mesh.material instanceof ShaderMaterial) {
    mesh.material.dispose();
  }
  mesh.material = shaderMaterial;
};
