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

#define saturate(x) clamp(x, 0., 1.)

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
// Camera velocity.
uniform vec3 velocity;
// Velocity of the object.
uniform vec3 objectVelocity;
uniform float time;
uniform float gamma;

uniform vec3 lightDir;

// PBR uniforms.
uniform float metallicFactor;
uniform float roughnessFactor;

varying vec4 lPosition;
// Un-Lorentz transformed variables.
varying vec4 vPosition;
varying vec2 vUV;
varying float t;
#ifdef TANGENT
varying mat3 TBN;
#else
varying vec3 vNormal;
#endif
varying float vInstance;

// PBR textures.
uniform sampler2D albedoSampler;
uniform sampler2D bumpSampler;
uniform sampler2D metallicRoughnessSampler;
// Used for transforming colors.
uniform sampler2D rgbMapSampler;

#ifdef SKYBOX
uniform samplerCube reflectionSampler;
#endif

// Taken from https://wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model
#define SHININESS 16.

vec4 gammaCorrect(vec4 color) {
    return vec4(pow(color.rgb, vec3(2.2)), color.a);
}

vec4 unGammaCorrect(vec4 color) {
    return vec4(pow(color.rgb, vec3(1.0/2.2)), color.a);
}

/** Colorspace conversion functions from http://chilliant.com/rgb2hsv.html. */
vec3 hslToRgb(vec3 hsl) {
    float h = hsl.x;
    float r = abs(6.*h - 3.) - 1.;
    float g = 2. - abs(6. * h - 2.);
    float b = 2. - abs(6. * h - 4.);
    float c = (1. - abs(2. * hsl.z - 1.)) * hsl.y;
    return (saturate(vec3(r, g, b)) - 0.5) * c + hsl.z;
}

/** Colorspace conversion functions from http://chilliant.com/rgb2hsv.html. */
vec3 rgbToHsl(vec3 RGB) {
    vec3 c = RGB;
    vec4 K = vec4(0., -1. / 3., 2. / 3., -1.);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float l = 0.5 * (q.x + min(q.w, q.y));
    float s = d / (1. - abs(2. * l - 1.) + EPS);
    float h = abs(q.z + (q.w - q.y) / (6. * d + EPS));
    return vec3(h, s, l);
}

// Taken from http://www.thetenthplanet.de/archives/1180
mat3 cotangent_frame(vec3 N, vec3 p) {
  // get edge vectors of the pixel triangle
  vec3 dp1 = dFdx(p);
  vec3 dp2 = dFdy(p);
  vec2 duv1 = dFdx(vUV);
  vec2 duv2 = dFdy(vUV); // solve the linear system
  vec3 dp2perp = cross(dp2, N);
  vec3 dp1perp = cross(N, dp1);
  vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
  // construct a scale-invariant frame
  vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
  float invmax = inversesqrt(max(dot(T, T), dot(B, B)));
  return mat3(T * invmax, B * invmax, N);
}

vec3 computeNormal() {
#ifdef BUMP_ENABLED
    // Perform normal mapping.
    vec3 bNormal = 2.*texture2D(bumpSampler, vUV).xyz - 1.;
    if (!gl_FrontFacing) {
        bNormal.xy = -bNormal.xy;
    }
#ifdef TANGENT
    mat3 tbn = TBN;
#else
    bNormal.y *= -1.;
    mat3 tbn = cotangent_frame(normalize(vNormal), -vPosition.xyz);
#endif // TANGENT
    vec3 normal = tbn * normalize(bNormal);
#else
    vec3 normal = vNormal;
#endif // BUMP_ENABLED
    return normalize(normal);
}

/**
 * Finds the direction vector for light coming from a point at infinity
 * traveling through the current pixel.
 */
vec3 computeAbberationDirection(vec3 v, vec3 p) {
    vec3 x = normalize(p);
    float vSq = dot(v, v);
    float vlen = sqrt(vSq);
    if (vlen <= EPS) {
        return x;
    }
    vec3 vnorm = v / vlen;
#ifdef GALILEAN
    float gamma = 1.;
#else
    float gamma = 1./sqrt(1. - vSq);
#endif
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

float transformWavelength(float lambda, float abberationFactor) {
    return saturate(1. / abberationFactor * lambda);
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

/** Get relativistic beaming factor. */
float beamingIntensity(float abberationFactor) {
    return pow(abberationFactor, 3. - SPECTRAL_INDEX);
}

/** Compute abberation factor between a normalized direction and velocity. */
float computeAbberationFactor(vec3 dir, vec3 v) {
    #ifdef GALILEAN
    float gamma = 1.;
#else
    float gamma = 1./(1. - dot(v, v));
#endif
    float abberationFactor = 1. / (gamma * (1. - dot(dir, v)));
    return abberationFactor;
}

/**
 * Compute pulse intensity at a given point in time.
 *
 * Used to visualize time delay effects.
 */
float pulseIntensity() {
    return 1. - (sin(2.*M_PI*t / PULSE_LENGTH) + 1.)/2. > 0.5 ? 1. : 0.;
}

vec3 velocityAdd(vec3 u, vec3 v) {
#ifdef GALILEAN
    return u + v;
#endif
    float uv = dot(u, v);
    if (uv > 0.999) {
        return u;
    }
    float vSq = dot(v, v);
    float invGamma = sqrt(1. - vSq);
    return 1./(1. + uv) * (invGamma * u + v + 1./(invGamma + 1.)*uv*v);
}

vec4 boost(vec4 q, vec3 v) {
    vec3 x = q.xyz;
    float t = q.w;
    float vSq = dot(v, v);
    if (vSq < EPS) {
        return q;
    }
#ifdef GALILEAN
    return vec4(x - t*v, t);
#else
    float gamma = 1./sqrt(1. - vSq);
    float vx = dot(v, x);
    vec3 xp = x + ((gamma - 1.) / vSq * vx - t * gamma) * v;
    float tp = gamma * (t - vx);
    return vec4(xp, tp);
#endif
}

/** Get the relative velocity of the object in camera space. */
vec3 computeRelativeVelocity() {
#ifdef SKYBOX
    vec3 v = velocity;
#else
    vec3 v = mat3(view) * velocity;
    vec3 u = mat3(view) * objectVelocity;
    v = velocityAdd(u, v);
#endif // SKYBOX
    return v;
}

vec3 computeLighting() {
    vec3 u = mat3(view) * objectVelocity;
    // Light direction.
    vec3 light = -mat3(view) * normalize(lightDir);
    light = computeAbberationDirection(u, light);
    // Surface normal.
    vec3 n = computeNormal();
    // Let's just assume a diffuse surface.
    float lambertian = clamp(dot(light, n), 0.1, 1.);
#ifdef ALBEDO_ENABLED
    vec4 albedoColor = gammaCorrect(texture2D(albedoSampler, vUV));
    if (albedoColor.a < 0.01) {
        discard;
    }
#else
    vec4 albedoColor = vec4(1.);
#endif // ALBEDO_ENABLED

    vec3 diffuse = lambertian * albedoColor.rgb;
#ifdef METALLIC_ROUGHNESS_ENABLED
    vec3 V = normalize(-vPosition.xyz);
    vec3 H = normalize(light + V);
    vec4 metallicRoughness = texture2D(metallicRoughnessSampler, vUV);
    float roughness = roughnessFactor * metallicRoughness.g;
    float metallic = metallicFactor * metallicRoughness.b;

    vec3 base = roughness * diffuse;
    // Specular highlights using simple Blinn-Phong shading model.
    float spec = saturate(dot(n, H));
    base += metallic * pow(spec, SHININESS) * vec3(1.);
#else
    vec3 base = diffuse;
#endif // METALLIC_ROUGHNESS_ENABLED
    return base;
}

void main(void) {
    vec3 v = computeRelativeVelocity();
#if defined(DOPPLER_EFFECT) || defined(RELATIVISTIC_BEAMING) || defined(SKYBOX)
    vec3 xDir = normalize(lPosition.xyz);
    float abberationFactor = computeAbberationFactor(xDir, v);
#endif // DOPPLER_EFFECT || RELATIVISTIC_BEAMING || SKYBOX
#ifdef SKYBOX
    xDir = computeAbberationDirection(v, xDir);
    // Used for rendering the skybox environment around the whole scene.
    vec3 base = gammaCorrect(textureCube(reflectionSampler,  xDir)).rgb;
#else
    vec3 base = computeLighting();
#ifdef TIME_PULSE
    base.x *= pulseIntensity();
#endif // TIME_PULSE
#endif // SKYBOX

#ifdef DOPPLER_EFFECT
    // Apply Doppler effect to color.
    base = transformColor(base, abberationFactor);
#endif // DOPPLER_EFFECT

#ifdef RELATIVISTIC_BEAMING
    // Compute relativistic light intensity.
    float intensity = beamingIntensity(abberationFactor);
    vec3 baseHsl = rgbToHsl(saturate(base));
    baseHsl.z *= intensity;
    base = hslToRgb(baseHsl);
#endif // RELATIVISTIC_BEAMING
    base = saturate(base);
    vec4 color = vec4(base, 1.0);
    color = unGammaCorrect(color);
    gl_FragColor = color;
}
