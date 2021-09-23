import { Gltf, GltfNode } from "@sr/gltf-types";
import { SrScene } from "./scene";
import { Matrix, Node, Quaternion } from "@babylonjs/core";

type CameraProps = {
  type: "perspective";
  fovy: number;
  position: [number, number, number];
  rotation: [number, number, number, number];
  near: number;
  far?: number;
};

class GltfSceneProcessor {
  private gltf: Gltf;
  private nodes: Node[];
  private idCounter: number;
  public constructor(gltf: Gltf) {
    this.gltf = gltf;
    this.nodes = [];
    this.idCounter = 0;
  }

  private getNodeId = (prefix: string = "node") => {
    return prefix + ++this.idCounter;
  };

  public processNode = (gltfNode: GltfNode) => {
    const node = new Node(gltfNode.name || this.getNodeId());
  };

  private getCameraPropsFromNodes = (
    nodes: number[],
    transforms: GltfNode[]
  ): CameraProps | undefined => {
    if (nodes == null) {
      return undefined;
    }
    for (const nodeId of nodes) {
      const node = this.gltf.nodes[nodeId];
      if (node.camera == null && node.children != null) {
        transforms.push(node);
        const cameraProps = this.getCameraPropsFromNodes(
          node.children,
          transforms
        );
        if (cameraProps != null) {
          return cameraProps;
        }
        transforms.pop();
      } else if (node.camera != null) {
        let allTransform = Matrix.Identity();
        const gltfCamera = this.gltf.cameras?.[node.camera];
        for (const ctransform of transforms) {
          let mulMatrix = Matrix.Identity();
          if (ctransform.matrix) {
            Matrix.FromArrayToRef(ctransform.matrix, 0, mulMatrix);
            allTransform = allTransform.multiply(mulMatrix);
          } else {
            if (ctransform.translation) {
              mulMatrix = Matrix.Translation(
                ctransform.translation[0],
                ctransform.translation[1],
                ctransform.translation[2]
              );
              allTransform = allTransform.multiply(mulMatrix);
            }
            if (ctransform.rotation) {
              const rotation = Quaternion.FromArray(ctransform.rotation);
              rotation.toRotationMatrix(mulMatrix);
              allTransform = allTransform.multiply(mulMatrix);
            }
            if (ctransform.scale) {
              Matrix.ScalingToRef(
                ctransform.scale[0],
                ctransform.scale[1],
                ctransform.scale[2],
                mulMatrix
              );
              allTransform = allTransform.multiply(mulMatrix);
            }
          }
        }
        const position = allTransform.getTranslation();
        const direction = Quaternion.FromRotationMatrix(
          allTransform.getRotationMatrix()
        );
        /*const camera = createCamera(
          node.name || this.getNodeId("camera"),
          position
        );*/
        /*const camera = createCamera(
          node.name || this.getNodeId("camera"),
        )*/
        switch (gltfCamera?.type) {
          case "perspective":
            return {
              type: "perspective",
              position: position.asArray() as [number, number, number],
              rotation: direction.asArray() as [number, number, number, number],
              fovy: gltfCamera.perspective.yfov,
              near: gltfCamera.perspective.znear,
              far: gltfCamera.perspective.zfar,
            };
        }
      }
    }
  };

  public getDefaultCamera = () => {
    const gltf = this.gltf;
    const scene = gltf.scenes[gltf.scene ?? 0];
    const cameraProps = this.getCameraPropsFromNodes(scene.nodes, []);
    console.log(cameraProps);
  };
}

export const sceneFromGltf = (gltf: Gltf): SrScene => {
  const scene = {
    camera: undefined as any,
    nodes: undefined as any,
  };
  const sceneProcessor = new GltfSceneProcessor(gltf);
  sceneProcessor.getDefaultCamera();
  return scene;
};
