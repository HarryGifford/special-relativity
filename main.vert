precision highp float;

// When defined, special relativistic effects will be shown.
// #define ENABLE_RELATIVITY

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform mat4 worldView;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 velocity;
// Set to true to transform according to Euclidean space.
uniform int useGalilean;

// Used for rendering multiple instances of the same mesh.
#include<instancesDeclaration>

// Varying
varying vec4 vPosition;
varying vec2 vUV;

// Construct the Lorentz matrix.
// This corresponds to B(v) taken from:
// https://en.wikipedia.org/wiki/Lorentz_transformation#Proper_transformations
mat4 lorentz(vec3 v)
{
    float vSq = dot(v, v);
    if (vSq <= 0.0001) {
        return mat4(1.);
    }
    float gamma = 1. / sqrt(1. - vSq);
    // four velocity.
    vec4 v4 = vec4(-gamma * v, gamma);
    float de = (gamma - 1.0) / vSq;
    vec4 v1 = vec4(1.0 + de * v.x * v.x, de * v.x * v.y, de * v.x * v.z, v4.x);
    vec4 v2 = vec4(de * v.y * v.x, 1.0 + de * v.y * v.y, de * v.y * v.z, v4.y);
    vec4 v3 = vec4(de * v.z * v.x, de * v.z * v.y, 1.0 + de * v.z * v.z, v4.z);
    return mat4(v1, v2, v3, v4);
}

// Matrix used when assuming a fixed speed of light but in a Euclidean space.
mat4 galilean(vec3 v)
{
    float gamma = 1.0;
    // four velocity.
    vec4 v4 = vec4(-v, 1.0);
    vec4 v1 = vec4(1.0, 0.0, 0.0, v4.x);
    vec4 v2 = vec4(0.0, 1.0, 0.0, v4.y);
    vec4 v3 = vec4(0.0, 0.0, 1.0, v4.z);
    return mat4(v1, v2, v3, v4);
}

/**
 * Transform `pos` into the reference frame of the moving camera.
 */
vec3 boost(vec3 pos)
{
    vec3 v = (view * vec4(-velocity, 0.0)).xyz;
    float delta = length(pos);
    vec4 e2 = vec4(pos.x, pos.y, pos.z, -delta);
    vec4 e1 = useGalilean == 1 ? galilean(-v) * e2 : lorentz(-v) * e2;
    return e1.xyz;
}

void main()
{
#include<instancesVertex>

    vec4 p = vec4(position, 1.);
    // Transform the point into eye space.
    vec4 vp = view * finalWorld * p;
    // Perform the boost.
    vPosition = vec4(boost(vp.xyz), vp.w);
    gl_Position = projection * vPosition;

    // Transform the texture coordinate verbatim.
    vUV = uv;
}
