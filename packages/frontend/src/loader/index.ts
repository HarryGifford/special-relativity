import gltf from "@sr/gltf";
import { Engine, Mesh, MeshPrimitive, Node, Scene } from "../base";
import { Accessor } from "../base/accessor";
import { BufferView } from "../base/bufferview";
import { trsFromTrsm } from "../base/utils";
import { loadText } from "../load-text";

const loadGltfScene = async (filename: string) => {
  const gltfStr = await loadText(filename);
  const gltf = JSON.parse(gltfStr) as gltf.glTF;
};

class GltfLoader {
  private meshes: Mesh[];
  private accessors: Accessor[];
  private nodes: Node[];
  private bufferViews: BufferView[];
  public constructor(gltf: gltf.glTF) {
    this.bufferViews = (gltf.bufferViews || []).map(this.convertBufferView);
    this.accessors = (gltf.accessors || []).map(this.convertAccessor);
    this.meshes = (gltf.meshes || []).map(this.convertMesh);
    this.nodes = (gltf.nodes || []).map(this.convertNode);
  }

  public createScene = (engine: Engine): Scene => {
    return new Scene({
      engine,
    });
  };

  public convertBufferView = (gltfbufferview: gltf.Buffer_View) => {
    const bufferView = new BufferView({
      byteOffset: gltfbufferview.byteOffset,
      byteLength: gltfbufferview.byteLength,
      byteStride: gltfbufferview.byteStride,
      target: gltfbufferview.target,
    });
    return bufferView;
  };

  public convertAccessor = (acc: gltf.Accessor) => {
    const accessor = new Accessor({
      byteOffset: acc.byteOffset,
      componentType: acc.componentType,
      normalized: acc.normalized,
      type: acc.type,
      bufferView: this.bufferViews[acc.bufferView],
      count: acc.count
    });
    return accessor;
  };

  public convertMeshPrimitive = (
    gltfmeshprimitive: gltf.Mesh_Primitive
  ): MeshPrimitive => {
    const attributes: Record<string, Accessor> = {};
    Object.entries(gltfmeshprimitive.attributes).forEach(
      ([name, accessorIdx]) => {
        const accessor = this.accessors[accessorIdx];
        attributes[name] = accessor;
      }
    );
    const meshPrimitive = new MeshPrimitive({
      attributes,
      indices: this.accessors[gltfmeshprimitive.indices],
      mode: gltfmeshprimitive.mode,
    });
    return meshPrimitive;
  };

  public convertMesh = (gltfmesh: gltf.Mesh): Mesh => {
    const primitives = gltfmesh.primitives.map(this.convertMeshPrimitive);
    const mesh = new Mesh({
      name: gltfmesh.name,
      primitives,
    });
    return mesh;
  };

  public convertNode = (gltfnode: gltf.Node) => {
    const trs = trsFromTrsm(gltfnode as any);
    const node = new Node({
      ...trs,
      mesh: this.meshes[gltfnode.mesh],
    });
    return node;
  };
}

export type LoadGltfConfig = {
  engine: Engine;
  gltf: gltf.glTF;
};

export const loadGltf = ({ engine, gltf }: LoadGltfConfig) => {
  const loader = new GltfLoader(gltf);
  const scene = loader.createScene(engine);
};
