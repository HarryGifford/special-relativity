import {
  Animation,
  AnimationGroup,
  CubicEase,
  EasingFunction,
  IEasingFunction,
  RuntimeAnimation,
  TargetedAnimation,
  Vector3,
  VideoRecorder,
} from "@babylonjs/core";
import { RelativisticCamera } from "./camera";

/** position/velocity/acceleration function. */
const positionFn = {
  position: (t: number): number => {
    if (t < 0.5) {
      return 4 * t * t * t;
    }
    const ttg = 2 - 2 * t;
    return 1 - (ttg * ttg * ttg) / 2;
  },
  velocity: (t: number): number => {
    if (t < 0.5) {
      return 12 * t * t;
    }
    const ttg = 1 - t;
    return 12 * ttg * ttg;
  },
  acceleration: (t: number): number => {
    if (t < 0.5) {
      return 24 * t;
    }
    const ttg = t - 1;
    return 24 * ttg;
  },
};

class CubicPositionEase implements IEasingFunction {
  ease = positionFn.position;
}

class QuadraticVelocityEase implements IEasingFunction {
  ease = (gradient: number): number => {
    if (gradient < 0.5) {
      return 4 * gradient * gradient * gradient;
    }
    const ttg = 2 - 2 * gradient;
    return 1 - (ttg * ttg * ttg) / 2;
  };
}

const animateCamera = (
  cam: RelativisticCamera,
  fps: number,
  duration: number
) => {
  const engine = cam.getEngine();

  const positionAnimation = new Animation(
    "position1",
    "position",
    fps,
    Animation.ANIMATIONTYPE_VECTOR3
  );
  positionAnimation.setEasingFunction({
    ease: positionFn.position,
  } as EasingFunction);

  const velocityAnimation = new Animation(
    "velocity1",
    "properVelocity",
    fps,
    Animation.ANIMATIONTYPE_VECTOR3
  );
  const animationGroup = new AnimationGroup("main");
  animationGroup.addTargetedAnimation(positionAnimation, cam);
  animationGroup.addTargetedAnimation(velocityAnimation, cam);

  return new Promise<void>((resolve) => {
    const anim = Animation.CreateAndStartAnimation(
      "at5",
      cam,
      "properVelocity",
      fps,
      Math.floor(duration * fps),
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 0.95 / Math.sqrt(1 - 0.95 * 0.95)),
      0,
      ease,
      resolve
    );
    anim?.onAnimationLoopObservable.add((eventData, eventState) => {
      eventData.getAnimations()[0].currentValue;
    });
  });
};

export type RecordVideoConfig = {
  camera: RelativisticCamera;
  fps: number;
};

/** Work in progress... Move the camera and record a video. */
export const recordVideo = ({ camera, fps }: RecordVideoConfig) => {
  const engine = camera.getEngine();
  engine.setSize(640, 480);
  const recorder = new VideoRecorder(engine, {
    mimeType: "video/webm;codec=vp9",
    fps,
    recordChunckSize: undefined as any,
  });
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      recorder.startRecording("moving-fast.webm", 30);
      animateCamera(camera, fps, 7).then(() => {
        setTimeout(() => {
          recorder.stopRecording();
          resolve();
        }, 3000);
      });
    }, 500);
  });
};
