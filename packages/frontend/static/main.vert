precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform float time;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 velocity;
uniform vec3 cameraPosition;

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

float gammaFactor(float vSq) {
    float gamma = useGalilean == 1 ? 1. : 1. / sqrt(1. - vSq);
    return gamma;
}

float gammaFactorW(float wSq) {
    float gamma = useGalilean == 1 ? 1. : sqrt(1. + wSq);
    return gamma;
}

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
    float gamma = gammaFactor(vSq);
    if (vSq <= 1e-4) {
        return x;
    }
    return x + ((gamma - 1.)/vSq * dot(v, x) - t*gamma) * v;
}

/** Transform vertex into the reference frame of the moving camera. */
vec3 transform(vec3 pos, vec3 vel)
{
    float t = useNoTimeDelay == 1 ? 0. : -length(pos);
    vec3 e = boost(vel, pos, t);
    return e;
}

vec3 rotateZ(vec3 v, float t) {
return vec3(v.x * cos(t) + v.z * sin(t), v.y, -v.x * sin(t) + v.z * cos(t));
}

void main()
{
#include<instancesVertex>
    float omega = 0.9;
    float t = omega * time;
    vec3 pp = position;//rotateZ(position, t);
    vec4 p = vec4(pp, 1.);
    vec4 px = vec4(-t, 0., 0., 0.);
    mat4 worldView = view * finalWorld;
    // Transform the point into eye space.
    vec4 vp = (finalWorld * p + px);
    vec3 v = omega * cross(pp.xyz, vec3(0., 1., 0.));
    // v += vec3(omega * 1., 0., 0.);
    v /= gammaFactorW(dot(v, v));
    // Perform the boost.
    vec4 vpp = vp;
    vec3 vvv = inverse(transpose(mat3(finalWorld))) * v;
    vec4 vvPosition = view * vec4(transform(vpp.xyz, vvv), vpp.w);// - view * px;
    vPosition = vec4(transform(vvPosition.xyz, mat3(view) * velocity), vvPosition.w);
    // Assume no shearing. Otherwise the inverse-transpose should be used.
    vNormal = mat3(worldView) * normal;
    gl_Position = projection * vPosition;
    // Transform the texture coordinate verbatim.
    vUV = uv;
}
