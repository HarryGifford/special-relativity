In the following discussion all units are natural (i.e. $c = 1$.)
# Explanation

## Inputs and outputs

We have a set of points in 3D space which are then triangulated to represent the surface of a 3D object. This is a triangular mesh.

Each of the vertices in the mesh is tranformed into camera space, Lorentz boosted and then transformed to screen space.

The shader is a little more complex, since we also support objects that are moving and not just the camera.

We also have a scene, which is made up of a camera, lights and meshes and a set of transformations which tell us how to translate, rotate and scale the objects.

## Lorentz boost

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
