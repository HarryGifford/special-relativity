import { Engine } from "./engine";

// export const readData = (src: string) => fetch(src).then(x => x.arrayBuffer());
export type BufferConfig = {
  gl: WebGL2RenderingContext;
  engine: Engine;
  data: ArrayBuffer;
};

export class Buffer {
  // private engine: Engine;
  private buffer: WebGLBuffer;
  public constructor({ data, engine, gl }: BufferConfig) {
    const buffer = gl.createBuffer();
    if (buffer == null || gl.getError() !== gl.NO_ERROR) {
      throw new Error("Bad buffer.");
    }
    this.buffer = buffer;
    //gl.createVertexArray()
  }

  public cleanup() {
    // this.engine.
  }
}
