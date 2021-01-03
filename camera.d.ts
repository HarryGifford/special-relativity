import { Scene, Vector3, TargetCamera } from "@babylonjs/core";
export interface RelativisticCamera extends TargetCamera {
    velocity: Vector3;
    properVelocity: Vector3;
    /** Set the max (coordinate) speed. */
    setMaxSpeed(speed: number | undefined): void;
}
export declare const createCamera: (name: string, position: Vector3, scene: Scene) => RelativisticCamera;
//# sourceMappingURL=camera.d.ts.map