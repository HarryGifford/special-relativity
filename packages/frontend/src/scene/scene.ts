import { RelativisticCamera } from "../relativistic-camera";
import { Node } from "@babylonjs/core";

export interface SrNode {

}

export interface SrScene {
  camera: RelativisticCamera
  nodes: Node[];
}
