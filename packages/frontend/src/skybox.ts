import { Texture, CubeTexture, Scene } from "@babylonjs/core";

export const initSkybox = async (scene: Scene) => {
  const cubeTexture = new CubeTexture("skybox/skybox", scene, [
    "_px.png",
    "_py.png",
    "_pz.png",
    "_nx.png",
    "_ny.png",
    "_nz.png",
  ]);
  cubeTexture.coordinatesMode = Texture.SKYBOX_MODE;
  scene.createDefaultEnvironment({
    environmentTexture: cubeTexture,
    createGround: false,
    skyboxSize: 1000,
    groundSize: 1000,
    skyboxTexture: cubeTexture,
  });
};
