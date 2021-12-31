import gltf from "@sr/gltf";
import { BufferView } from "./bufferview";

export type AccessorConfig = {
  bufferView: BufferView;
  componentType: number;
  type: string;
  byteOffset: number;
  normalized: boolean;
  count: number;
};

const accessorComponentSize = (elem: AccessorConfig) => {
  switch (elem.componentType) {
    case gltf.BYTE:
    case gltf.UNSIGNED_BYTE:
      return 1;
    case gltf.SHORT:
    case gltf.UNSIGNED_SHORT:
      return 2;
    case gltf.FLOAT:
    case gltf.UNSIGNED_INT:
      return 4;
    default:
      return 4;
  }
};

const accessorNumElements = (elem: AccessorConfig) => {
  switch (elem.type) {
    case "SCALAR":
      return 1;
    case "VEC2":
      return 2;
    case "VEC3":
      return 3;
    case "VEC4":
      return 4;
    case "MAT2":
      return 4;
    case "MAT3":
      return 9;
    case "MAT4":
      return 16;
    default:
      return 1;
  }
};

const getAccessorSize = (accessor: AccessorConfig) => {
  return accessorComponentSize(accessor) * accessorNumElements(accessor);
};

export class Accessor {
  public count: number;
  public size: number;
  public componentType: number;
  public normalized: boolean;
  public stride: number;
  public offset: number;
  public constructor(config: AccessorConfig) {
    this.count = config.count;
    this.size = getAccessorSize(config);
    this.componentType = config.componentType;
    this.normalized = config.normalized;
    this.stride = config.bufferView.byteStride;
    this.offset = config.byteOffset;
  }

  public bindVaryingAttribute = (
    gl: WebGL2RenderingContext,
    variableLocation: number
  ) => {

    gl.vertexAttribPointer(
      variableLocation,
      this.size,
      this.componentType,
      this.normalized,
      this.stride,
      this.offset
    );
  };
}
