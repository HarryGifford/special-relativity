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
  /** Set to true to show a time pulse. */
  timePulse: boolean;
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
  timePulse: false,
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

type FilterPropertiesByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

/** UiState keys that are booleans. */
type BooleanUiKeys = keyof FilterPropertiesByType<UiState, boolean>;

type ToggleProps = {
  attributeName: BooleanUiKeys;
  label: string;
};

const createToggle = ({ attributeName, label }: ToggleProps) => {
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = uiState[attributeName];
  toggle.addEventListener("change", (e) => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    uiState[attributeName] = !!target.checked;
    saveState();
  });
  const toggleLabel = document.createElement("label");
  toggleLabel.appendChild(toggle);
  toggleLabel.append(label);
  return {
    toggleLabel,
    toggle,
  };
};

type PickerOption<T> = {
  label: string;
  value: T;
};

type Picker<T> = {
  el: HTMLElement;
  id: string;
  options: PickerOption<T>[];
  onChange?: (value: T) => void;
};

const createRadioPicker = <T>({ el, id, options, onChange }: Picker<T>) => {
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

  onChange != null &&
    buttons.forEach((button, idx) => {
      const value = options[idx].value;
      button.onclick = () => {
        onChange(value);
      };
    });

  return {
    buttons,
    setValue,
    setDisabled,
  };
};

const createSimultaneityPicker = () => {
  const containerEl = document.createElement("div");
  const { toggle, toggleLabel } = createToggle({
    attributeName: "useNoTimeDelay",
    label: "Assume no light travel time in frame:",
  });
  toggle.addEventListener("change", (e) => {
    const target = e.target;
    if (target == null || !(target instanceof HTMLInputElement)) {
      return;
    }
    const useNoTimeDelay = !!target.checked;
    setDisabled(!useNoTimeDelay);
  });
  containerEl.appendChild(toggleLabel);
  const { setValue, setDisabled } = createRadioPicker({
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
    onChange: (value) => {
      uiState.simultaneityFrame = value;
      saveState();
    },
  });
  setValue(uiState.simultaneityFrame);
  setDisabled(!uiState.useNoTimeDelay);
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
  const { setValue } = createRadioPicker<string>({
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
    onChange: (value) => {
      sessionStorage.relativityScene = value;
      // Reload the browser for simplicity.
      window.location.reload();
    },
  });
  setValue(getSceneUrl());
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

  const { toggleLabel: fixedSpeedToggleLabel } = createToggle({
    attributeName: "useFixedVelocity",
    label: "Assume fixed camera speed",
  });

  const { toggleLabel: galileanToggleLabel } = createToggle({
    attributeName: "galilean",
    label: "Use Galilean relativity",
  });

  const { toggleLabel: relativisticBeamingToggleLabel } = createToggle({
    attributeName: "relativisticBeaming",
    label: "Relativistic beaming",
  });

  const { toggleLabel: dopplerEffectToggleLabel } = createToggle({
    attributeName: "dopplerEffect",
    label: "Doppler effect",
  });

  const { toggleLabel: timePulseToggleLabel } = createToggle({
    attributeName: "timePulse",
    label: "Show synchronization",
  });

  const sliderLabel = document.createElement("label");
  sliderLabel.appendChild(slider);
  sliderLabel.append("Max camera speed (fraction of c)");

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
  uiEl.appendChild(relativisticBeamingToggleLabel);
  uiEl.appendChild(dopplerEffectToggleLabel);
  uiEl.appendChild(simultaneityPicker);
  uiEl.appendChild(timePulseToggleLabel);
  uiEl.appendChild(galileanToggleLabel);
  uiEl.appendChild(fixedSpeedToggleLabel);
  uiEl.appendChild(scenePicker);
  el.appendChild(uiEl);
};
