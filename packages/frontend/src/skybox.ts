import { Texture, Scene, EquiRectangularCubeTexture } from "@babylonjs/core";

export const initSkybox = async (scene: Scene) => {
  const cubeTexture = new EquiRectangularCubeTexture(
    "space/starmap_2020.jpg",
    scene,
    1024
  );

  cubeTexture.coordinatesMode = Texture.SKYBOX_MODE;
  scene.createDefaultEnvironment({
    environmentTexture: cubeTexture,
    createGround: false,
    skyboxSize: 1000,
    groundSize: 1000,
    skyboxTexture: cubeTexture,
  });
};
