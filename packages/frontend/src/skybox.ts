import {
  ShaderMaterial,
  Texture,
  CubeTexture,
  Scene,
  MeshBuilder,
  Mesh
} from "@babylonjs/core";
import { loadText } from "./load-text";

export const makeSkybox = async (scene: Scene) => {
  const skybox = MeshBuilder.CreateBox("skybox", {
    size: 1000,
    sideOrientation: Mesh.BACKSIDE,
  });
  const [vertexShaderSrc, fragShaderSrc] = await Promise.all([
    loadText("skybox.vert"),
    loadText("main.frag"),
  ]);
  const skyboxMaterial = new ShaderMaterial(
    "skybox",
    scene,
    {
      vertexSource: vertexShaderSrc,
      fragmentSource: fragShaderSrc,
    },
    {
      attributes: ["position", "normal", "uv"],
      uniforms: [
        "view",
        "projection",
        "velocity",
        "simultaneityFrame",
        "useGalilean",
        "useNoTimeDelay",
        "dopplerEffect",
        "relativisticBeaming",
      ],
      samplers: [
        "skyboxSampler",
        "rgbMapSampler",
      ],
      defines: ["#define SKYBOX"]
    },
  );
  skybox.infiniteDistance = true;
  skybox.material = skyboxMaterial;
  const cubeTexture = new CubeTexture("skybox/skybox", scene, [
    "_px.png",
    "_py.png",
    "_pz.png",
    "_nx.png",
    "_ny.png",
    "_nz.png",
  ]);
  cubeTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.setTexture("skyboxSampler", cubeTexture);
  return {
    skybox,
    skyboxMaterial,
    cubeTexture,
  };
};
