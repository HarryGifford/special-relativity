precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 view;
uniform mat4 projection;
uniform vec3 velocity;
// Set to true to transform according to Euclidean space.
uniform int useGalilean;
// Set to true to assume no travel time delay for light.
uniform int useNoTimeDelay;
// Used for rendering multiple instances of the same mesh.
#include<instancesDeclaration>

// Varying
varying vec4 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

/**
 * Apply Lorentz/Galilean contraction to the given vector.
 *
 * Here I've just multiplied out the matrix to avoid explicit construction.
 * Taken from B matrix from:
 * https://en.wikipedia.org/wiki/Lorentz_transformation#Proper_transformations
 * `v` is the velocity.
 * `x` is the position to transform.
 * `t` is the time coordinate to transform.
 */
vec3 boost(vec3 v, vec3 x, float t)
{
    float vSq = dot(v, v);
    float gamma = useGalilean == 1 ? 1. : 1. / sqrt(1. - vSq);
    if (vSq <= 1e-4) {
        return x;
    }
    return x + ((gamma - 1.)/vSq * dot(v, x) - t*gamma) * v;
}

/** Transform vertex into the reference frame of the moving camera. */
vec3 transform(vec3 pos)
{
    vec3 v = mat3(view) * velocity;
    float t = useNoTimeDelay == 1 ? 0. : -length(pos);
    vec3 e = boost(v, pos, t);
    return e;
}

void main()
{
#include<instancesVertex>
    vec4 p = vec4(position, 1.);
    mat4 worldView = view * finalWorld;
    // Transform the point into eye space.
    vec4 vp = worldView * p;
    // Perform the boost.
    vPosition = vec4(transform(vp.xyz), vp.w);
    // Assume no shearing. Otherwise the inverse-transpose should be used.
    vNormal = mat3(worldView) * normal;
    gl_Position = projection * vPosition;
    // Transform the texture coordinate verbatim.
    vUV = uv;
}
