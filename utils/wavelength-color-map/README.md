# wavelength-color-map

Generate a PNG for use as a texture for mapping a wavelength to an RGB value.

## Usage

```sh
node ./utils/wavelength-color-map/index.js out.png https://www.waveformlighting.com/files/color_matching_functions.txt
```

The url should have data formatted as follows:

```txt
380 0.0014 0.0000 0.0065
381 0.0014 0.0000 0.0065
...
780 0.0000 0.0000 0.0000
```

where `380` corresponds to a wavelength of 380nm (near-UV.) and should increment by 1nm up to 780nm.
