import {
  Scene,
  Vector3,
  Epsilon,
  UniversalCamera,
  TargetCamera,
} from "@babylonjs/core";

export interface RelativisticCamera extends TargetCamera {
  velocity: Vector3;
  properVelocity: Vector3;
  /** Set the max (coordinate) speed. */
  setMaxSpeed(speed: number | undefined): void;
}

/**
 * Modifications to the default camera to get smooth acceleration and
 * deceleration. This is necessary to get a smooth velocity.
 *
 * This could probably be replaced with a standard physics integrator.
 */
class RelativisticUniversalCamera extends UniversalCamera {
  velocity: Vector3;
  properVelocity: Vector3;
  properAcceleration: Vector3;
  dt: number;

  maxProperSpeed2: number | undefined;
  dragCoefficient: number | undefined;

  public setMaxSpeed(speed: number | undefined) {
    if (speed == null) {
      this.maxProperSpeed2 = undefined;
      this.dragCoefficient = 0;
      return;
    }
    this.speed = speed;
    const maxSpeed2 = speed * speed;
    const gamma2 = maxSpeed2 < 1 ? 1 / (1 - maxSpeed2) : 10000;
    this.maxProperSpeed2 = gamma2 * maxSpeed2;
    this.dragCoefficient = 1 / Math.pow(this.maxProperSpeed2, 1 / 4);
  }

  constructor(name: string, position: Vector3, scene: Scene) {
    super(name, position, scene);
    this.velocity = Vector3.Zero();
    this.properVelocity = Vector3.Zero();
    this.properAcceleration = Vector3.Zero();
    this.dt = 0;

    this.onAfterCheckInputsObservable.add((_camera, _eventState) => {
      let dt = this.dt;
      // Apply acceleration with a drag term.
      this.properAcceleration.copyFrom(this.cameraDirection);
      const dragCoefficient = this.dragCoefficient ?? 0;
      // Scaling the drag factor by the sqrt of the velocity is arbitrary
      // and I just did it because it's cleaner. If you change it then
      // you also need to change the drag coefficient. If below were
      // pow(x, 1/3) then above would be `pow(maxProperSpeed, 1/2*1/3).
      const drag = this.properVelocity
        .normalizeToNew()
        .scale(
          dragCoefficient *
            this.speed *
            this.inertia *
            Math.sqrt(this.properVelocity.length())
        );
      this.properAcceleration.subtractInPlace(drag);

      // Euler integration step.
      this.properVelocity.addInPlace(this.properAcceleration.scale(dt));
      // Compute the normal velocity from the proper velocity.
      let properSpeed2 = this.properVelocity.lengthSquared();
      // If a max speed is set, then we should respect it.
      if (this.maxProperSpeed2 != null && properSpeed2 > this.maxProperSpeed2) {
        this.properVelocity
          .normalize()
          .scaleInPlace(Math.sqrt(this.maxProperSpeed2));
        properSpeed2 = this.maxProperSpeed2;
      }
      const invGamma = 1 / Math.sqrt(1 + properSpeed2);
      this.properVelocity.scaleToRef(invGamma, this.velocity);
      this.position.addInPlace(this.velocity.scale(dt));
    });
  }

  public _computeLocalCameraSpeed() {
    return this.speed;
  }

  public _checkInputs() {
    var engine = this.getEngine();
    // This is taken from the Babylon JS code. Not sure why it's not just
    // `getDeltaTime`.
    this.dt = Math.sqrt(engine.getDeltaTime() / (engine.getFps() * 100.0));
    // Don't allow the timestep to get too large, so clamp it.
    if (this.dt > 0.1) {
      this.dt = 0.1;
    }
    // Reset the camera direction.
    this.cameraDirection.setAll(0);
    // Smoothly stop rotation when rotation is stopped.
    this.cameraRotation.scaleInPlace(Math.exp(-this.dt) * this.inertia);

    super._checkInputs();
  }

  /** Don't allow the default position update. */
  public _updatePosition() {}
}

/**
 * Not great check, but used to determine if we should use a virtual
 * joystick or wasd keyboard.
 */
const runningSmartphone = () => {
  return (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/iPhone/i)
  );
};

const keyForward = 87;
const keyBackward = 83;
const keyUp = 69;
const keyDown = 81;
const keyRight = 68;
const keyLeft = 65;

const initCamera = (camera: RelativisticUniversalCamera) => {
  // Enable WASD keys for camera control.
  camera.keysDownward.push(keyDown);
  camera.keysDown.push(keyBackward);
  camera.keysUpward.push(keyUp);
  camera.keysUp.push(keyForward);
  camera.keysLeft.push(keyLeft);
  camera.keysRight.push(keyRight);
  camera.gamepadAngularSensibility = 100;
  if (runningSmartphone()) {
    camera.inputs.addVirtualJoystick();
  }

  camera.speed = 1.0;
  camera.inertia = 0.9;
  camera.minZ = 0.1;
  camera.maxZ = 10000;
  camera.fov = 0.9;
};

export const createCamera = (
  name: string,
  position: Vector3,
  scene: Scene
): RelativisticCamera => {
  const camera = new RelativisticUniversalCamera(name, position, scene);
  initCamera(camera);
  return camera;
};
