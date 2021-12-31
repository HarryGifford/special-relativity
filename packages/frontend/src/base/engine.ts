import gltf from "@sr/gltf";

export type EngineConfig = {
  gl: WebGL2RenderingContext;
}

export class Engine {
  private gl: WebGL2RenderingContext;
  constructor({ gl }: EngineConfig) {
    this.gl = gl;
  }

  public loadBuffer = (buffer: gltf.Buffer) => {
    const bufferid = this.gl.createBuffer();

  }
}
