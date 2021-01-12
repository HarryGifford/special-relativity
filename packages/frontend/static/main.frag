#extension GL_OES_standard_derivatives : require
precision highp float;
precision highp int;

uniform int useGalilean;

varying vec4 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

uniform sampler2D textureSampler;
uniform vec3 velocity;
uniform mat4 view;

vec3 white = vec3(0.0);

vec4 gammaCorrect(vec4 color) {
    return vec4(pow(color.rgb, vec3(2.2)), color.a);
}

vec4 unGammaCorrect(vec4 color) {
    return vec4(pow(color.rgb, vec3(1.0/2.2)), color.a);
}

// Don't know how to transform the normals, so let's just compute them
// using the fragment derivatives.
vec3 computeNormal1() {
    vec3 dnormx = dFdx(vPosition.xyz);
    vec3 dnormy = dFdy(vPosition.xyz);
    return normalize(cross(dnormy, dnormx));
}

vec3 computeNormal() {
    return normalize(vNormal);
}

vec3 boost(vec3 v, vec3 x, float t)
{
    float vSq = dot(v, v);
    float gamma = useGalilean == 1 ? 1. : 1. / sqrt(1. - vSq);
    if (vSq <= 1e-4) {
        return x;
    }
    return x + ((gamma - 1.)/vSq * dot(v, x) - t*gamma) * v;
}

/** Transform vertex into ?? frame for computing normal. */
vec3 normalTransform(vec3 pos)
{
    vec3 v = mat3(view) * velocity;
    float t = length(pos);
    vec3 e = boost(v, pos, t);
    return e;
}

void main(void) {

    // Eye direction.
    vec3 e = normalize(normalTransform(vPosition.xyz));
    // Surface normal.
    vec3 n = computeNormal();
    // Let's just assume a diffuse surface.
    float intensity = clamp(dot(-e, n), 0.1, 1.);

    vec4 rawAlbedoColor = gammaCorrect(texture2D(textureSampler, vUV));
    vec3 albedoColor = abs(rawAlbedoColor.w) != 0.0
        ? rawAlbedoColor.xyz
        : white;

    vec3 base = intensity * albedoColor;
    vec4 color = vec4(base, 1.0);
    color = unGammaCorrect(color);
    gl_FragColor = color;
}
