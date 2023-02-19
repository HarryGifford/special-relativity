import { Texture, Scene, EquiRectangularCubeTexture } from "@babylonjs/core";

export const initSkybox = async (scene: Scene) => {
  const cubeTexture = await new Promise<EquiRectangularCubeTexture>(
    (resolve, reject) => {
      const cubeTexture = new EquiRectangularCubeTexture(
        "space/starmap_2020.jpg",
        scene,
        2048,
        undefined,
        undefined,
        () => { resolve(cubeTexture) },
        reject
      );
    });

  cubeTexture.coordinatesMode = Texture.SKYBOX_MODE;
  scene.createDefaultEnvironment({
    createGround: false,
    skyboxSize: 1000,
    groundSize: 1000,
    skyboxTexture: cubeTexture,
  });
};
