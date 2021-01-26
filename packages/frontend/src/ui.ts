export const enum SimultaneityFrame {
  world = 0,
  camera = 1,
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

const diceUrl = "SubdividedCube.gltf";
const sponzaUrl =
  "https://specialrelativitymeshes.z5.web.core.windows.net/Sponza/sponza.gltf";

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
  dopplerEffect: false,
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
  slider.title = "Camera speed as a fraction of the speed of light.";
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

type PickerOption<T> = {
  label: string;
  value: T;
};

type Picker<T> = {
  el: HTMLElement;
  id: string;
  options: PickerOption<T>[];
};

const createRadioPicker = <T>({ el, id, options }: Picker<T>) => {
  const buttons = options.map(({ value }) => {
    const button = document.createElement("input");
    button.name = id;
    button.type = "radio";
    button.value = String(value);
    return button;
  });

  const containerEl = el;
  for (let idx = 0; idx < options.length; idx++) {
    const labelEl = document.createElement("label");
    labelEl.appendChild(buttons[idx]);
    labelEl.append(options[idx].label);
    containerEl.append(labelEl);
  }

  const setValue = (value: T) => {
    for (let idx = 0; idx < options.length; idx++) {
      const { value: buttonValue } = options[idx];
      const button = buttons[idx];
      button.checked = buttonValue === value;
    }
  };

  const setDisabled = (disabled: boolean) => {
    for (let idx = 0; idx < options.length; idx++) {
      const button = buttons[idx];
      button.disabled = disabled;
    }
  };

  const onChange = (handler: (value: T) => void) => {
    buttons.forEach((button, idx) => {
      const value = options[idx].value;
      button.onclick = (e: MouseEvent) => {
        const target = e.target;
        if (target == null || !(target instanceof HTMLInputElement)) {
          return;
        }
        const value = options[idx].value;
        handler(value);
      };
    });
  };

  return {
    buttons,
    onChange,
    setValue,
    setDisabled,
  };
};

const createSimultaneityPicker = () => {
  const containerEl = document.createElement("div");
  const noTimeDelayLabel = document.createElement("label");
  const noTimeDelayToggle = createNoTimeDelayToggle();
  noTimeDelayLabel.appendChild(noTimeDelayToggle);
  noTimeDelayLabel.append("Assume no light travel time in frame:");
  noTimeDelayToggle.addEventListener("change", (e) => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    const useNoTimeDelay = !!target.checked;
    uiState.useNoTimeDelay = useNoTimeDelay;
    saveState();
    setDisabled(!useNoTimeDelay);
  });
  containerEl.appendChild(noTimeDelayLabel);
  const { onChange, setValue, setDisabled } = createRadioPicker({
    el: containerEl,
    id: "simultaneity-frame",
    options: [
      {
        label: "Camera",
        value: SimultaneityFrame.camera,
      },
      {
        label: "World",
        value: SimultaneityFrame.world,
      },
    ],
  });
  setValue(uiState.simultaneityFrame);
  setDisabled(!uiState.useNoTimeDelay);
  onChange((value) => {
    uiState.simultaneityFrame = value;
    saveState();
  });
  return containerEl;
};

export const getSceneUrl = (): string => {
  return sessionStorage.relativityScene || "SubdividedCube.gltf";
};

const createScenePicker = () => {
  const containerEl = document.createElement("div");
  const label = document.createElement("label");
  label.append("Scene:");
  containerEl.appendChild(label);
  const { onChange, setValue } = createRadioPicker<string>({
    el: containerEl,
    id: "scene-picker",
    options: [
      {
        label: "Dice",
        value: diceUrl,
      },
      {
        label: "Sponza",
        value: sponzaUrl,
      },
    ],
  });
  setValue(getSceneUrl());
  onChange((value) => {
    sessionStorage.relativityScene = value;
    // Reload the browser for simplicity.
    window.location.reload();
  });
  return containerEl;
};

export const initSpeedIndicator = (el: HTMLElement) => {
  const speedIndicator = document.createElement("div");
  speedIndicator.classList.add("speed-indicator");
  el.appendChild(speedIndicator);
  return speedIndicator;
};

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
  });

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
  const scenePicker = createScenePicker();

  const uiEl = document.createElement("details");
  uiEl.className = "main-ui";
  const summaryEl = document.createElement("summary");
  summaryEl.innerText = "Help / Settings";
  uiEl.appendChild(summaryEl);

  const helptext = document.createElement("div");
  helptext.innerText = "Use WASD and mouse to move or touch on smartphone.";
  uiEl.appendChild(helptext);
  uiEl.appendChild(sliderLabel);
  uiEl.appendChild(relativisticBeamingLabel);
  uiEl.appendChild(dopplerEffectLabel);
  uiEl.appendChild(simultaneityPicker);
  uiEl.appendChild(toggleLabel);
  uiEl.appendChild(galileanLabel);
  uiEl.appendChild(scenePicker);
  el.appendChild(uiEl);
};
