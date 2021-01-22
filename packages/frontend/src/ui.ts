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
  /** Set to true to enable relativistic beaming. */
  relativisticBeaming: boolean;
  /** Set to true to doppler shift the wavelength of light. */
  dopplerEffect: boolean;
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
  simultaneityFrame: SimultaneityFrame.camera,
  relativisticBeaming: false,
  dopplerEffect: false
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
  slider.inputMode = "decimal";
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

const createRelativisticBeamingToggle = () => {
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = uiState.relativisticBeaming;
  return toggle;
};

const createDopplerEffectToggle = () => {
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = uiState.dopplerEffect;
  return toggle;
};

const createSimultaneityPicker = () => {
  const container = document.createElement("div");

  const noTimeDelayLabel = document.createElement("label");
  const noTimeDelayToggle = createNoTimeDelayToggle();
  noTimeDelayLabel.appendChild(noTimeDelayToggle);
  noTimeDelayLabel.append("Assume no light travel time in frame:")
  container.appendChild(noTimeDelayLabel);

  const cameraButton = document.createElement("input");
  cameraButton.name = "simultaneity-frame";
  cameraButton.type = "radio";
  cameraButton.disabled = !uiState.useNoTimeDelay;
  cameraButton.checked = uiState.simultaneityFrame === SimultaneityFrame.camera;
  cameraButton.value = `${SimultaneityFrame.camera}`;
  const cameraButtonLabel = document.createElement("label");
  cameraButtonLabel.appendChild(cameraButton);
  cameraButtonLabel.append("Camera");

  const worldButton = document.createElement("input");
  worldButton.name = "simultaneity-frame";
  worldButton.type = "radio";
  worldButton.disabled = !uiState.useNoTimeDelay;
  worldButton.checked = uiState.simultaneityFrame === SimultaneityFrame.world;
  worldButton.value = `${SimultaneityFrame.world}`;
  const worldButtonLabel = document.createElement("label");
  worldButtonLabel.appendChild(worldButton);
  worldButtonLabel.append("World");

  noTimeDelayToggle.addEventListener("change", e => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    const useNoTimeDelay = !!target.checked;
    uiState.useNoTimeDelay = useNoTimeDelay;
    saveState();

    worldButton.disabled = !useNoTimeDelay;
    cameraButton.disabled = !useNoTimeDelay;
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
  worldButton.onclick = onClick;
  cameraButton.onclick = onClick;

  container.appendChild(worldButtonLabel);
  container.appendChild(cameraButtonLabel);

  return container;
}

export const initSpeedIndicator = (el: HTMLElement) => {
  const speedIndicator = document.createElement("div");
  speedIndicator.classList.add("speed-indicator");
  el.appendChild(speedIndicator);
  return speedIndicator;
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

  const relativisticBeamingToggle = createRelativisticBeamingToggle();
  relativisticBeamingToggle.addEventListener("change", (e) => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    uiState.relativisticBeaming = !!target.checked;
    saveState();
  });

  const dopplerEffectToggle = createDopplerEffectToggle();
  dopplerEffectToggle.addEventListener("change", (e) => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    uiState.dopplerEffect = !!target.checked;
    saveState();
  });

  const sliderLabel = document.createElement("label");
  sliderLabel.appendChild(slider);
  sliderLabel.append("Max camera speed (fraction of c)");

  const toggleLabel = document.createElement("label");
  toggleLabel.appendChild(toggle);
  toggleLabel.append("Assume fixed camera speed");

  const galileanLabel = document.createElement("label");
  galileanLabel.appendChild(galileanToggle);
  galileanLabel.append("Use Galilean relativity");

  const relativisticBeamingLabel = document.createElement("label");
  relativisticBeamingLabel.appendChild(relativisticBeamingToggle);
  relativisticBeamingLabel.append("Relativistic beaming");

  const dopplerEffectLabel = document.createElement("label");
  dopplerEffectLabel.appendChild(dopplerEffectToggle);
  dopplerEffectLabel.append("Doppler effect");

  const simultaneityPicker = createSimultaneityPicker();

  const uiEl = document.createElement("details");
  uiEl.className = "main-ui";
  const summaryEl = document.createElement("summary");
  summaryEl.innerText = "Help / Settings"
  uiEl.appendChild(summaryEl);

  const helptext = document.createElement("div");
  helptext.innerText = "Use WASD and mouse to move or touch on smartphone."
  uiEl.appendChild(helptext);
  uiEl.appendChild(sliderLabel);
  uiEl.appendChild(relativisticBeamingLabel);
  uiEl.appendChild(dopplerEffectLabel);
  uiEl.appendChild(simultaneityPicker);
  uiEl.appendChild(toggleLabel);
  uiEl.appendChild(galileanLabel);
  el.appendChild(uiEl);
};
