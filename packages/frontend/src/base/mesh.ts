import { Accessor } from "./accessor";

export type MeshPrimitiveConfig = {
  attributes: { [x: string]: Accessor };
  indices?: Accessor;
  mode: number;
};
export class MeshPrimitive {
  private attributes: MeshPrimitiveConfig["attributes"];
  private indices?: Accessor;
  private mode: number;
  private vao: WebGLVertexArrayObject | null;
  public constructor({ attributes, indices, mode }: MeshPrimitiveConfig) {
    this.attributes = attributes;
    this.indices = indices;
    this.mode = mode;
    this.vao = null;
  }

  public bind = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
    this.vao = gl.createVertexArray();
    if (this.vao == null) {
      throw new Error("Unable to create VAO.");
    }
    gl.bindVertexArray(this.vao);
    Object.entries(this.attributes).forEach(([name, accessor]) => {
      const attribLocation = gl.getAttribLocation(program, name);
      accessor.bindVaryingAttribute(gl, attribLocation);
    });
  };

  public unbind = (gl: WebGL2RenderingContext) => {
    gl.deleteVertexArray(this.vao);
  };

  public render = (gl: WebGL2RenderingContext) => {
    gl.bindVertexArray(this.vao);
    if (this.indices != null) {
      gl.drawElements(
        this.mode,
        this.indices.count,
        this.indices.componentType,
        this.indices.offset ?? 0
      );
    } else {
      throw new Error("Not yet implemented!");
      // gl.drawArrays(this.mode, 0, this.attributes.POSITION.count);
    }
  };
}

export type MeshConfig = {
  name?: string;
  primitives: MeshPrimitive[];
};
export class Mesh {
  private name?: string;
  private primitives: MeshPrimitive[];
  public constructor({ name, primitives }: MeshConfig) {
    this.name = name;
    this.primitives = primitives;
  }
}
