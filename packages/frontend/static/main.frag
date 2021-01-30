#extension GL_OES_standard_derivatives : require
precision highp float;
precision highp int;

/**
    A lot of the code below is pretty hacky in terms of computing the
    colors from Doppler shifting. There's no particular reason for the
    choices that have been made here and there's certainly better ways
    to do it.
*/

#define EPS 1e-5
#define M_PI 3.14159265359
// Wavelength of a time pulse.
#define PULSE_LENGTH 20.

// Hack used as part of computing the light intensity.
// Larger values will cause the beaming light to saturate
// the screen more quickly.
#define INTENSITY_SCALE 0.3

// See https://en.wikipedia.org/wiki/Relativistic_beaming
// Spectral index normally between 0 and 2. Depends on material.
#define SPECTRAL_INDEX 1.

// These are defined based on where the solid R, G, B colors are in the
// RGB map sampler. i.e. the (626 - 380)th pixl will be solid red.
#define MIN_WAVELENGTH 380.
#define MAX_WAVELENGTH 780.
#define R_WAVELENGTH 626.
#define G_WAVELENGTH 534.
#define B_WAVELENGTH 465.

uniform mat4 view;
uniform vec3 velocity;
uniform float time;
uniform float gamma;

varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec2 vUV;
varying float t;

uniform sampler2D albedoSampler;
uniform sampler2D bumpSampler;
uniform sampler2D rgbMapSampler;

#ifdef SKYBOX
uniform samplerCube reflectionSampler;
#endif

// Hardcoded directional light source.
const vec3 light_dir = vec3(-3.0, 5., -4.);

vec3 white = vec3(0.0);

vec4 gammaCorrect(vec4 color) {
    return vec4(pow(color.rgb, vec3(2.2)), color.a);
}

vec4 unGammaCorrect(vec4 color) {
    return vec4(pow(color.rgb, vec3(1.0/2.2)), color.a);
}

vec3 computeNormal() {
    vec3 normal = normalize(vNormal);
#ifdef TANGENT
    // Perform normal mapping.
    vec3 bNormal = 2.*texture2D(bumpSampler, vUV).xyz - 1.;
    if (!gl_FrontFacing) {
        bNormal.xy = -bNormal.xy;
    }
    vec3 tangent = normalize(vTangent);
    tangent = normalize(tangent - dot(tangent, normal) * normal);
    vec3 bitangent = cross(normal, tangent);
    mat3 TBN = mat3(tangent, bitangent, normal);
    normal = TBN * bNormal;
#endif
    return normal;
}

float computeAbberationFromXV(vec3 x, vec3 v) {
    float vSq = dot(v, v);
    if (vSq < EPS) {
        return 1.;
    }
    float vx = dot(v, x);
    float vxn = vx / length(x);
#ifdef GALILEAN
    float abberation = 1. + vxn;
#else
    float ctr = (vxn - vSq) / (1. - vxn);
    float abberation = 1. / (gamma * (1. - ctr));
#endif
    return abberation;
}

/**
 * Finds the direction vector for light coming from a point at infinity
 * traveling through the current pixel.
 */
vec3 computeAbberationDirection(vec3 v, vec3 p) {
    vec3 x = normalize(p);
    float vSq = dot(v, v);
    if (vSq < EPS) {
        return x;
    }
    float vlen = sqrt(vSq);
    vec3 vnorm = v / vlen;
    vec3 xx = x + (gamma - 1.)*dot(x, vnorm)*vnorm;
#ifdef NO_TIME_DELAY
#ifdef SIMULTANEITY_FRAME_CAMERA
    xx += vlen * v;
#endif
#else
    xx -= gamma * v;
#endif // NO_TIME_DELAY
    return normalize(xx);
}

float computeAbberation() {
    vec3 x = normalize(vPosition.xyz);
    vec3 v = mat3(view) * velocity;
    return computeAbberationFromXV(x, v);
}

float transformWavelength(float lambda, float abberationFactor) {
    return clamp(1. / abberationFactor * lambda, 0., 1.);
}

vec3 lookupWavelengthColor(float lambda, float abberationFactor) {
    float wavelengthRange = (MAX_WAVELENGTH - MIN_WAVELENGTH + 1.);
    float x = (lambda - MIN_WAVELENGTH) / wavelengthRange;
    vec2 coord = vec2(transformWavelength(x, abberationFactor), 0.5);
    vec3 color = gammaCorrect(texture2D(rgbMapSampler, coord)).rgb;
    return color;
}

vec3 transformColor(vec3 color, float abberationFactor) {
    vec3 rrbgValue = lookupWavelengthColor(R_WAVELENGTH, abberationFactor);
    vec3 grbgValue = lookupWavelengthColor(G_WAVELENGTH, abberationFactor);
    vec3 brbgValue = lookupWavelengthColor(B_WAVELENGTH, abberationFactor);
    return rrbgValue * color.r + grbgValue * color.g + brbgValue * color.b;
}

/** Performs relativistic beaming calculation. */
float transformIntensity(float intensity, float abberationFactor) {
    return intensity * pow(abberationFactor, 3. - SPECTRAL_INDEX);
}

/**
 * Compute pulse intensity at a given point in time.
 *
 * Used to visualize time delay effects.
 */
float pulseIntensity() {
    return 1. - (sin(2.*M_PI*t / PULSE_LENGTH) + 1.)/2. > 0.5 ? 1. : 0.;
}

vec3 localVelocity() {
#ifdef SKYBOX
    vec3 v = velocity;
#else
    vec3 v = mat3(view) * velocity;
#endif // SKYBOX
    return v;
}

void main(void) {
    vec3 v = localVelocity();
    vec3 xx = computeAbberationDirection(v, vPosition.xyz);
    float abberationFactor = 1. / (gamma * (1. - dot(xx, v)));
#ifdef SKYBOX
    // Used for rendering the skybox environment around the whole scene.
    float intensity = 1.;
    vec4 rawAlbedoColor = gammaCorrect(textureCube(reflectionSampler, xx));
#else
    // Light direction.
    vec3 light = normalize(mat3(view) * light_dir);
    // Surface normal.
    vec3 n = computeNormal();
    // Let's just assume a diffuse surface.
    float intensity = clamp(dot(light, n), 0.1, 1.);
    vec4 rawAlbedoColor = gammaCorrect(texture2D(albedoSampler, vUV));
#ifdef TIME_PULSE
    rawAlbedoColor.x *= pulseIntensity();
#endif // TIME_PULSE
#endif // SKYBOX
    vec4 albedoColor = abs(rawAlbedoColor.a) != 0.0
        ? rawAlbedoColor
        : vec4(white, 1.0);

    vec3 base = albedoColor.rgb;

#ifdef DOPPLER_EFFECT
    // Apply Doppler effect to color.
    base = transformColor(base, abberationFactor);
#endif // DOPPLER_EFFECT

#ifdef RELATIVISTIC_BEAMING
    // Compute relativistic light intensity.
    intensity = transformIntensity(intensity, abberationFactor);
    base = intensity * base;
    // Hack to make it look better in RGB.
    if (intensity > 1.) {
        base += vec3(INTENSITY_SCALE * log(intensity));
    }
#else
    base = intensity * base;
#endif // RELATIVISTIC_BEAMING

    base = clamp(base, 0., 1.);
    if (rawAlbedoColor.a < 0.01) {
        discard;
    }
    vec4 color = vec4(base, 1.0);
    color = unGammaCorrect(color);
    gl_FragColor = color;
}
