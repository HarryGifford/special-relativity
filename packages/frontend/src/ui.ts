/** UI configuration used in this demo. */
export type UiState = {
  /** Fraction of the speed of light the camera is traveling at. */
  cameraBeta: number;
  /** Use a fixed velocity as the speed of light. */
  useFixedVelocity: boolean;
  /**
   * True to transform according to Euclidean space. False for special
   * relativity.
   */
  galilean: boolean;
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
  galilean: false
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

const createGalileanToggle = () => {
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = uiState.galilean;
  return toggle;
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
    uiState.useFixedVelocity = target.checked;
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

  const toggleLabel = document.createElement("label");
  toggleLabel.innerText = "Assume fixed camera speed:";
  toggleLabel.appendChild(toggle);

  const sliderLabel = document.createElement("label");
  sliderLabel.innerText = "Max camera speed (fraction of c):";
  sliderLabel.appendChild(slider);

  const galileanLabel = document.createElement("label");
  galileanLabel.innerText = "Use Galilean relativity:"
  galileanLabel.appendChild(galileanToggle);

  const uiEl = document.createElement("div");
  uiEl.className = "main-ui";

  const helptext = document.createElement("div");
  helptext.innerText = "Use WASD and mouse to move or touch on smartphone."
  uiEl.appendChild(helptext);
  uiEl.appendChild(sliderLabel);
  uiEl.appendChild(toggleLabel);
  uiEl.appendChild(galileanLabel);
  el.appendChild(uiEl);
};
