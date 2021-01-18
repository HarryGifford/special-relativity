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
vec3 transform(vec3 pos, vec3 vel, float t)
{
    vec3 e = boost(vel, pos, t);
    return e;
}

vec3 rotateZ(vec3 v, float t) {
return vec3(v.x * cos(t) + v.z * sin(t), v.y, -v.x * sin(t) + v.z * cos(t));
}

vec4 transformPosition(mat4 M, vec4 p, float t) {
    vec4 p1 = vec4(rotateZ(p.xyz, t), p.w);
    vec4 pm = M * p1;
    return pm;
}

#define OMEGA 0.9

float computeT(mat4 worldView) {
    float t = OMEGA * time;
    for (int i = 0; i < 15; i++) {
        vec4 p = vec4(position, 1.);
        p = transformPosition(worldView, p, t);
        t = -length(p.xyz);
    }
    return t;
}

void main()
{
#include<instancesVertex>
    vec3 pp = position;//rotateZ(position, t);
    vec4 p = vec4(pp, 1.);
    vec4 px = vec4(0., 0., 0., 0.);
    mat4 worldView = view * finalWorld;
    float t = computeT(worldView);
    pp = rotateZ(position, t);
    // Transform the point into eye space.
    vec4 vp = transformPosition(worldView, p, t);
    vec3 v = OMEGA * cross(pp.xyz, vec3(0., 1., 0.));
    // v += vec3(omega * 1., 0., 0.);
    // Perform the boost.
    vec4 vpp = vp;
    vec3 vvv = mat3(view * finalWorld) * v;
    vvv /= gammaFactorW(dot(vvv, vvv));
    float t1 = useNoTimeDelay == 1 ? 0. : -length(vpp.xyz);
    vec3 vt = transform(vpp.xyz, vvv, t1);
    vec4 vvPosition = view * vec4(vt, vpp.w);// - view * px;
    vec3 cameraVelocity = mat3(view) * velocity;
    float t2 = gammaFactor(dot(vvPosition.xyz, vvPosition.xyz)) * (t1 - dot(cameraVelocity, vvPosition.xyz));
    vPosition = vec4(transform(vvPosition.xyz, cameraVelocity, t2), vvPosition.w);
    // Assume no shearing. Otherwise the inverse-transpose should be used.
    vNormal = mat3(worldView) * normal;
    gl_Position = projection * vPosition;
    // Transform the texture coordinate verbatim.
    vUV = uv;
}
