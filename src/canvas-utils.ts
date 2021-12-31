export const createCanvas = (el: HTMLElement): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.width = el.clientWidth;
  canvas.height = el.clientHeight;
  canvas.style.position = "fixed";
  canvas.tabIndex = 0;

  window.addEventListener("resize", _e => {
    canvas.width = el.clientWidth;
    canvas.height = el.clientHeight;
  })

  el.appendChild(canvas);
  return canvas;
};

/**
 * Create and initialize the canvas and add to the DOM.
 *
 * @param el Element to add the canvas to.
 */
export const createGlContext = (
  canvas: HTMLCanvasElement
): WebGL2RenderingContext => {
  const gl = canvas.getContext("webgl2", {
    antialias: true,
  });

  if (gl == null) {
    throw new Error("Unable to create WebGL 2 context.");
  }

  return gl;
};
