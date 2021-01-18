export const enum SimultaneityFrame {
  world = 0,
  camera = 1
}

/** UI configuration used in this demo. */
export type UiState = {
  /** Fraction of the speed of light the camera is traveling at. */
  cameraBeta: number;
  /** Use a fixed velocity as the speed of light. */
  useFixedVelocity: boolean;
  /** Don't take into account travel time of light to reach camera. */
  useNoTimeDelay: boolean;
  /**
   * True to transform according to Euclidean space. False for special
   * relativity.
   */
  galilean: boolean;
  /**
   * Used with `useNoTimeDelay` to define which frame to use to define
   * when events are simultaneous.
   */
  simultaneityFrame: SimultaneityFrame;
};

/**
 * Save the state to session storage, which is preserved until the browser is
 * closed.
 */
const saveState = () => {
  sessionStorage.uiState = JSON.stringify(uiState);
};

const defaultUiState: UiState = {
  cameraBeta: 0.95,
  useFixedVelocity: false,
  useNoTimeDelay: false,
  galilean: false,
  simultaneityFrame: SimultaneityFrame.world
};

export const getState = (): UiState => {
  return sessionStorage.uiState != null
    ? JSON.parse(sessionStorage.uiState)
    : defaultUiState;
};

let uiState: UiState = getState();

const createSpeedSlider = () => {
  const slider = document.createElement("input");
  slider.type = "number";
  slider.min = "0";
  slider.max = "1";
  slider.step = "0.005";
  slider.value = uiState.cameraBeta?.toString();
  slider.title =
    "Camera speed as a fraction of the speed of light."
  return slider;
};

const createFixedSpeedToggle = () => {
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = uiState.useFixedVelocity;
  return toggle;
};

const createNoTimeDelayToggle = () => {
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = uiState.useNoTimeDelay;
  return toggle;
};

const createGalileanToggle = () => {
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = uiState.galilean;
  return toggle;
};

const createSimultaneityPicker = () => {
  const container = document.createElement("div");

  const noTimeDelayLabel = document.createElement("label");
  const noTimeDelayToggle = createNoTimeDelayToggle();
  noTimeDelayLabel.appendChild(noTimeDelayToggle);
  noTimeDelayLabel.append("Assume no light travel time in frame:")
  container.appendChild(noTimeDelayLabel);

  const button1 = document.createElement("input");
  button1.name = "simultaneity-frame";
  button1.type = "radio";
  button1.disabled = !uiState.useNoTimeDelay;
  button1.checked = uiState.simultaneityFrame === SimultaneityFrame.world;
  button1.value = `${SimultaneityFrame.world}`;
  const button1Label = document.createElement("label");
  button1Label.appendChild(button1);
  button1Label.append("World");

  const button2 = document.createElement("input");
  button2.name = "simultaneity-frame";
  button2.type = "radio";
  button2.disabled = !uiState.useNoTimeDelay;
  button2.checked = uiState.simultaneityFrame === SimultaneityFrame.camera;
  button2.value = `${SimultaneityFrame.camera}`;
  const button2Label = document.createElement("label");
  button2Label.appendChild(button2);
  button2Label.append("Camera");

  noTimeDelayToggle.addEventListener("change", e => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    const useNoTimeDelay = !!target.checked;
    uiState.useNoTimeDelay = useNoTimeDelay;
    saveState();

    button1.disabled = !useNoTimeDelay;
    button2.disabled = !useNoTimeDelay;
  });

  const onClick = (e: MouseEvent) => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    const value = parseInt(target.value, 10) as SimultaneityFrame;
    uiState.simultaneityFrame = value;
    saveState();
  }
  button1.onclick = onClick;
  button2.onclick = onClick;

  container.appendChild(button1Label);
  container.appendChild(button2Label);

  return container;
}

/** Element to add the UI to. */
export const initUi = (el: HTMLElement) => {
  uiState = getState();

  const slider = createSpeedSlider();
  slider.addEventListener("change", (e) => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    const currValue = parseFloat(target.value);
    if (!Number.isNaN(currValue)) {
      uiState.cameraBeta = currValue;
      saveState();
    }
  });

  const toggle = createFixedSpeedToggle();
  toggle.addEventListener("change", (e) => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    const useFixedVelocity = target.checked;
    uiState.useFixedVelocity = useFixedVelocity;
    saveState();
  });

  const galileanToggle = createGalileanToggle();
  galileanToggle.addEventListener("change", (e) => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    uiState.galilean = !!target.checked;
    saveState();
  })

  const sliderLabel = document.createElement("label");
  sliderLabel.appendChild(slider);
  sliderLabel.append("Max camera speed (fraction of c)");

  const toggleLabel = document.createElement("label");
  toggleLabel.appendChild(toggle);
  toggleLabel.append("Assume fixed camera speed");

  const galileanLabel = document.createElement("label");
  galileanLabel.appendChild(galileanToggle);
  galileanLabel.append("Use Galilean relativity");

  const simultaneityPicker = createSimultaneityPicker();

  const uiEl = document.createElement("div");
  uiEl.className = "main-ui";

  const helptext = document.createElement("div");
  helptext.innerText = "Use WASD and mouse to move or touch on smartphone."
  uiEl.appendChild(helptext);
  uiEl.appendChild(sliderLabel);
  uiEl.appendChild(simultaneityPicker);
  uiEl.appendChild(toggleLabel);
  uiEl.appendChild(galileanLabel);
  el.appendChild(uiEl);
};
