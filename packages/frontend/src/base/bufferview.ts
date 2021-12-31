export type BufferViewConfig = {
  /** The offset into the buffer in bytes. */
  byteOffset: number;
  /** The length of the bufferView in bytes. */
  byteLength: number;
  /** The stride, in bytes, between vertex attributes.  When this is not defined, data is tightly packed. When two or more accessors use the same bufferView, this field must be defined. */
  byteStride: number;
  /** The target that the GPU buffer should be bound to. */
  target: 34962 /* ARRAY_BUFFER */ | 34963 /* ELEMENT_ARRAY_BUFFER */ | number;
};

export class BufferView {
  public byteStride: number;

  private byteOffset: number;
  private byteLength: number;
  private target: number;
  private buffer: WebGLBuffer | null;
  public constructor({
    byteOffset,
    byteStride,
    byteLength,
    target
  }: BufferViewConfig) {
    this.byteOffset = byteOffset;
    this.byteLength = byteLength;
    this.target = target;
    this.byteStride = byteStride;
    this.buffer = null;
  }

  public init = (gl: WebGL2RenderingContext, data: ArrayBuffer) => {
    const buffer = gl.createBuffer();
    if (buffer == null) {
      throw new Error("Bad buffer.");
    }
    this.buffer = buffer;
    gl.bindBuffer(this.target, buffer);
    const view = new DataView(data, this.byteOffset, this.byteLength);
    gl.bufferData(this.target, view, gl.STATIC_DRAW);
  };

  public cleanup = (gl: WebGL2RenderingContext) => {
    gl.deleteBuffer(this.buffer);
  };
}
