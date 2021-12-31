# special-relativity

[**Live WebGL demo**](https://harrygifford.github.io/special-relativity/)

This project shows how the geometry of the world looks under
special relativistic transformations. You can see a live demo
[here](https://harrygifford.github.io/special-relativity/). You can see effects such as Terrell rotation, Doppler shifting and the headlight effect. Note that the
page uses WebGL. If you cannot use WebGL, there is a video
[here](https://youtu.be/109s5HbdWs0).

[![Accelerating along a street at at relativistic speeds.](./assets/close-to-the-speed-of-light.gif)](https://harrygifford.github.io/special-relativity/)

Accelerating along a street at at relativistic speeds. You can see the
geometric effects of [abberation](https://en.wikipedia.org/wiki/Relativistic_aberration) and [Terrell rotation](https://en.wikipedia.org/wiki/Terrell_rotation).

See `overview.ipynb` for details of the math (which unfortunately can't be rendered in README markdown.)

## Usage

Go to the live demo above. You can rotate with the mouse and you can move the
camera with the following keys:

| Key | Description    |
| --- | -------------- |
| `W` | Move forward.  |
| `A` | Move left.     |
| `S` | Move backward. |
| `D` | Move right.    |
| `E` | Move up.       |
| `Q` | Move down.     |

On cell phone you can use your thumbs to touch the screen and two virtual
joysticks will appear. You can then use these to move around.

You can also plug in a game controller and use the analog sticks to
move around.

### Options

When you open the page you will see a bunch of options. They are

**Max camera speed**: Maximum speed the camera can move at. Should be a number above 0 and below 1 where 1 corresponds to the speed of light.

**Relativistic beaming**: Shows the ["headlight effect"](https://en.wikipedia.org/wiki/Relativistic_beaming) where various effects cause the luminosity of
different objects to change with velocity.

**Doppler effect**: Shows the [relativistic Doppler effect](https://en.wikipedia.org/wiki/Relativistic_Doppler_effect).

**Assume no light travel time**: Shows the geometry of the objects assuming no time delay. This requires us to assume a reference frame because the "now" slice will be different in different reference frames. There are two obvious choices:

- Camera: Assume the world is moving and the camera is at rest. This means the world will look
  compressed in the direction perpendicular to the direction of motion.
- World: Assume the world is at rest and the camera is moving. In this case the camera's sensor is length contracted, but the light entering the camera is not. This means objects will appear stretched because the light from an object will be spread over a larger portion of the sensor.

**Show synchronization**: Causes the blue color channel to pulse at the same
time in the world frame of reference. Useful for inspecting time delay
and time dilation.

**Use Galilean relativity**: Assumes no special relativity. Note that the rasterizer won't render things correctly for speeds greater than the speed of light.

**Assume fixed camera speed**: Assumes the camera is moving forward a fixed velocity relative to the environment but without actually moving the camera.

**Scene**: Either "Dice" which is a set of dice all in a row or Sponza, which is a beautiful atrium commonly used for rendering.

## Development

First run `pnpm install` to install all the dependencies and then run `pnpm run start` to start a live demo on your computer.

The directory `utils` contains packages related to development or that
only need to be built/executed infrequently. For example
`wavelength-color-map` is used to generate the texture for mapping
Doppler shifted colors.

## Overview of code

The code is located under `src` and `static`. The project uses [babylonjs](https://www.babylonjs.com/) to provide a basic engine and to load the GLTF model. We use shaders to apply the actual special relativistic transformations.

If you are interested in the actual code that transforms geometry according to special relativity, go to `static/main.vert` and to see the code that transforms the colors, go to `static/main.frag`. This will require knowledge of Shaders.

`static/main.vert` is the GLSL shader that applies the Lorentz transform
to the vertices.

`static/frag.glsl` is a basic diffuse shader. Nothing special in here.

`src/camera.ts` contains code to control the camera and how quickly it speeds
up and slows down so that the acceleration is smooth. I decided to work in
proper velocity instead of regular velocity since it made for smoother motion.

## Sources

I used the fantastic [Relativity visualized](https://www.spacetimetravel.org/tompkins/tompkins.html) site to get a better understanding and for the idea of rendering a bunch of dice.

See [Chapter 4 of Daniel Weiskopf's dissertation](https://publikationen.uni-tuebingen.de/xmlui/bitstream/handle/10900/48159/pdf/01dissertation.pdf) for a great and detailed treatment.

Similar to [A Slower Speed of Light](http://gamelab.mit.edu/games/a-slower-speed-of-light/) although I didn't use their code because I wanted to understand relativity myself.

Sponza model take from [glTF-Sample-Models](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/Sponza).

Background from [NASA/Goddard Space Flight Center Scientific Visualization Studio](
  https://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=4851).

## Known issues

- The camera's acceleration is ad hoc. I want a simple way to make the camera
  speed up to a maximum velocity in the direction of movement when a key is
  pressed and then slow down to a stop when the key is released.

- Shading model is very basic.

- The Doppler and headlight effects are messily implemented in the Fragment
  shader. It could probably be done in a separate pass.

- No support objects moving in anything other than a straight line. I tried to implement a rotating
  wheel but it's difficult to compute the intersection with between the light
  ray's path and the wheel's position.

- No support for users opening their own models without modifying the code.
  Two things here: first is adding a UI for opening a GLTF file and then
  passing it to the babylon loader. The second is to subdivide large triangles
  automatically so that straight surfaces transform correctly.

- The Galilean relativity isn't correct.

## Contributions

Feel free to open a PR or issue (either for bugs, features or questions) and
I will review when I can.
