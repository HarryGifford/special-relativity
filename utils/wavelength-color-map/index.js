//@ts-check
/**
 * Generate a PNG for use as a texture for mapping a wavelength to
 * an RGB value.
 *
 * Executed like
 * ```sh
 * node ./utils/wavelength-color-map/index.js out.png https://www.waveformlighting.com/files/color_matching_functions.txt
 * ```
 *
 * The url should have data formatted in the following way:
 * ```txt
 * 380 0.0014 0.0000 0.0065
 * 381 0.0014 0.0000 0.0065
 * ...
 * 780 0.0000 0.0000 0.0000
 * ```
 * where `380` corresponds to a wavelength of 380nm (near-UV.) and should
 * increment by 1nm up to 780nm.
 */

/** */
const process = require("process");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch").default;
const { PNG } = require("pngjs");

const traceFn =
  process.env.DEBUG === "true" ? console.log.bind(console) : () => {};

/**
 * Clip `x` in the range `[mini, maxi]`.
 * @param {number} x Value to clip.
 * @param {number} mini Minimum value `x` may take.
 * @param {number} maxi Minimum value `y` may take.
 */
const clip = (x, mini, maxi) => {
  if (x < mini) {
    return mini;
  }
  if (x > maxi) {
    return maxi;
  }
  return x;
};

/**
 * Apply gamma correction.
 *
 * @param {number} x
 */
const gammaCorrect = (x) => {
  return x < 0.0031308
    ? (323 / 25) * x
    : (211 / 200) * Math.pow(x, 5 / 12) - 11 / 200;
};

/**
 * Convert linear value to the range [0, 255], gamma corrected.
 * @param {number} x
 */
const toByteRange = (x) => {
  return Math.floor(255 * clip(gammaCorrect(x), 0, 1));
};

/**
 * See:
 * https://wikipedia.org/wiki/SRGB#The_forward_transformation_(CIE_XYZ_to_sRGB)
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
const xyzToRgb = (x, y, z) => {
  // cie conversion matrix.
  const cie = [
    [3.24096994, -1.53738318, -0.49861076],
    [-0.96924364, 1.8759675, 0.04155506],
    [0.05563008, -0.20397696, 1.05697151],
  ];
  const r = cie[0][0] * x + cie[0][1] * y + cie[0][2] * z;
  const g = cie[1][0] * x + cie[1][1] * y + cie[1][2] * z;
  const b = cie[2][0] * x + cie[2][1] * y + cie[2][2] * z;

  const rb = toByteRange(r);
  const gb = toByteRange(g);
  const bb = toByteRange(b);
  return [rb, gb, bb];
};

const defaultMatchPointsUrl =
  "https://www.waveformlighting.com/files/color_matching_functions.txt";

const main = async () => {
  const outFilename = process.argv.length > 2 ? process.argv[2] : "./out.png";
  const url = process.argv.length > 3 ? process.argv[3] : defaultMatchPointsUrl;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  const txt = await response.text();
  // Matches something like "380 0.0014 0.0000 0.0065".
  const matcher = /(\d+)\s+([+\-]?\d?\.\d+)\s+([+\-]?\d?\.\d+)\s+([+\-]?\d?\.\d+)/g;
  // @ts-ignore
  const allMatches = Array.from(txt.matchAll(matcher));
  traceFn("Creating image.");
  const png = new PNG({
    width: allMatches.length,
    height: 1,
  });
  traceFn("Image defined.");

  // png.gamma = 2.2;
  allMatches.forEach(([_whole, _wl, xx, yy, zz], idx) => {
    const x = parseFloat(xx);
    const y = parseFloat(yy);
    const z = parseFloat(zz);
    const [r, g, b] = xyzToRgb(x, y, z);
    png.data.writeUInt8(r, 4 * idx);
    png.data.writeUInt8(g, 4 * idx + 1);
    png.data.writeUInt8(b, 4 * idx + 2);
    png.data.writeUInt8(255, 4 * idx + 3);
  });
  traceFn("Image data created.");
  const dest = fs.createWriteStream(path.join(outFilename));
  png
    .pack()
    .pipe(dest)
    .on("finish", () => {
      traceFn("Done!");
      dest.close();
    });
};

main().catch((e) => {
  console.error(e?.message);
  process.exit();
});
