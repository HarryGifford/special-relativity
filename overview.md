# Overview

In the following discussion all units are natural (i.e. $c = 1$.)

## Inputs and outputs

We have a mesh, a set of points that define triangles in 3D space which represent the surface of a 3D object.

We also have a scene, which is made up of a camera, lights and meshes and a set of transformations which tell us how to translate, rotate and scale the objects.

## Lorentz boost

Let's first consider an object at rest, with the camera moving with velocity $\vec{v}$. We know the location of the object. The distance betweem the object and camera tells us the time, that is $t = -d/c$ where $c$ is the speed of light.

Given a coordinate $(\vec{x}, t)$ in one space we want to find new coordinates $(\vec{x}', t')$ in a frame with velocity $\vec{v}$.

$$
\begin{align}
\vec{x}' &= \vec{x} + \left(\frac{\gamma - 1}{\left\langle \vec{v}, \vec{v}\right\rangle}\left\langle \vec{v},\vec{x}\right\rangle - \gamma t\right) \vec{v}\\
t' &= \gamma\left(t - \left\langle \vec{v},\vec{x}\right\rangle\right)
\end{align}
$$


For the background we have points at infinity so the above formulas don't work. But we can derive a boosted direction vector by taking the above expression and taking a limit as the length of $x$ goes to infinity. If we assume we have a direction $\hat{x}$ then

$$
\begin{align}
\hat{x}' &= \frac{\hat{x} + \left(\gamma - 1\right) \left\langle \hat{v},\hat{x}\right\rangle \hat{v}}{\left\lVert\hat{x} + \left(\gamma - 1\right) \left\langle \hat{v},\hat{x}\right\rangle \hat{v}\right\rVert}
\end{align}
$$

where $\hat{x}$ means a vector with unit length.

## Doppler shift

The only information we have about the color of an object is from RGB textures. So we assume that for a given texture color, the light reflected from that point in the point's reference frame will be given in three wavelengths: red, green and blue in proportion to the RGB texture values. For mapping purposes, I assumed the following wavelength conversions:

| Color | Wavelength (nm) |
| ------| ---------------:|
| Red   | 626             |
| Green | 534             |
| Blue  | 465             |

For mapping intensity, I didn't use anything formal and instead used a mapping that resulted in something that looks reasonable.
