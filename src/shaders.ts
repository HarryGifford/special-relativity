import {
  Scene,
  BaseTexture,
  Material,
  AbstractMesh,
  PBRMaterial,
  BackgroundMaterial,
  ShaderMaterial,
  InstancedMesh,
  VertexBuffer,
  Vector3,
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
    // Need to filter out empty defines for some reason...
    defines = defines.filter(x => x !== "");
    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];
      const mesh = validMeshes[i];
      updateShaderMaterial(scene, rgbMapTexture, material!, mesh, defines);
    }
  };
  const uniformsChange = (uniforms: UniformParams) => {
    for (let i = 0; i < materials.length; i++) {
      const mesh = validMeshes[i];
      const material = materials[i];
      const shaderMaterial = mesh.material;
      // TODO: Add better support for animations.
      // Should really be able to specify a velocity
      // inside the GLTF file instead of using animation.
      if (mesh.parent?.name === "Empty") {
        const v1 = uniforms.vec3?.["velocity"];
        if (v1 != null) {
          const v2 = new Vector3(0, 0, -0.95);
          uniforms.vec3!["objectVelocity"] = v2;
        }
      } else {
        uniforms.vec3!["objectVelocity"] = Vector3.Zero();
      }
      if (!(shaderMaterial instanceof ShaderMaterial)) {
        continue;
      }
      setUniforms(shaderMaterial, uniforms);
      if (material == null) {
        continue;
      }
    }
  };
  return {
    definesChange,
    uniformsChange,
  };
};

const updateShaderUniforms = (material: Material, shader: ShaderMaterial) => {
  const uniformParams: UniformParams = {
    float: {},
    int: {},
    vec3: {},
  };
  if (material instanceof PBRMaterial) {
    uniformParams.float!["metallicFactor"] = material.metallic ?? 1;
    uniformParams.float!["roughnessFactor"] = material.roughness ?? 1;
  }
  setUniforms(shader, uniformParams);
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
    if (material.albedoTexture != null) {
      samplers["albedoSampler"] = material.albedoTexture;
      defines.push("#define ALBEDO_ENABLED");
    }
    if (material.bumpTexture != null) {
      samplers["bumpSampler"] = material.bumpTexture;
      defines.push("#define BUMP_ENABLED");
      if (mesh.isVerticesDataPresent(VertexBuffer.TangentKind)) {
        defines.push("#define TANGENT");
      }
    }
    if (material.metallicTexture != null) {
      samplers["metallicRoughnessSampler"] = material.metallicTexture;
      defines.push("#define METALLIC_ROUGHNESS_ENABLED");
    }
  } else if (material instanceof BackgroundMaterial) {
    if (material.reflectionTexture != null) {
      samplers["reflectionSampler"] = material.reflectionTexture;
    }
    defines.push("#define SKYBOX");
  }
  samplers["rgbMapSampler"] = rgbMapTexture;
  
  const attributes = ["position", "normal", "tangent", "uv"];
  if (mesh.isVerticesDataPresent(VertexBuffer.ColorKind)) {
    attributes.push("color");
    defines.push("#define VERTEX_COLOR_ENABLED");
  }

  const shaderMaterial = new ShaderMaterial(
    "shader" + mesh.name,
    scene,
    {
      vertex: "custom",
      fragment: "custom",
    },
    {
      attributes,
      uniforms: [
        "world",
        "finalWorld",
        "view",
        "projection",
        "velocity",
        "time",
        "lightDir",
        "metallicFactor",
        "roughnessFactor",
        "cameraPosition",
        "objectVelocity"
      ],
      samplers: Object.keys(samplers),
      defines
    }
  );
  Object.entries(samplers).map(([name, texture]) => {
    shaderMaterial.setTexture(name, texture);
  });
  updateShaderUniforms(material, shaderMaterial);
  // If there's already a shadermaterial, then we delete it.
  if (mesh.material instanceof ShaderMaterial) {
    mesh.material.dispose();
  }
  mesh.material = shaderMaterial;
  //mesh.material.backFaceCulling = false;
  //mesh.material.wireframe = false;
};
