precision highp float;
precision highp int;

#define WORLD_ENUM 0
#define CAMERA_ENUM 1

// Attributes
attribute vec4 position;
attribute vec3 normal;
attribute vec4 tangent;
attribute vec2 uv;

// Uniforms
uniform mat4 view;
uniform mat4 projection;
uniform vec3 velocity;
uniform float gamma;
uniform float time;
// Used for rendering multiple instances of the same mesh.
#include<instancesDeclaration>

// Varying
varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec2 vUV;
varying float t;

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
    if (vSq <= 1e-4) {
        return x;
    }
#ifdef GALILEAN
    return x - t * v;
#else
    float vx = dot(v, x);
    return x + ((gamma - 1.) / vSq * vx - t * gamma) * v;
#endif
}

/**
 * Compute the time the light was emitted from the source vertex that
 * reaches the camera at time 0.
 *
 * This function has a bunch of cases due to the allowed input parameters.
 */
float eventTime(float t, vec3 x, vec3 v) {
#ifdef NO_TIME_DELAY
#ifdef GALILEAN
    return t;
#else

#ifdef SIMULTANEITY_FRAME_WORLD
    // Simultaneous events in the world's frame.
    return t;
#endif
#ifdef SIMULTANEITY_FRAME_CAMERA
    // Simultaneous events in the camera's frame.
    // Solve t' = gamma * (t - <v,x>), for t.
    return t / gamma + dot(v, x);
#endif

#endif // GALILEAN
#else
    // Time taken for light to reach the camera is just the distance
    // to reach the point where the light was emitted. Here we assume
    // the camera is located at the origin.
    return t - length(x);
#endif // NO_TIME_DELAY
}

/** Transform vertex into the reference frame of the moving camera. */
vec3 transform(vec3 x, vec3 v) {
    float t = eventTime(0., x, v);
    vec3 e = boost(v, x, t);
    return e;
}

void main() {
#ifdef SKYBOX
    vPosition = position;
    vec4 vp = vec4(mat3(view) * vec3(position), position.w);
    gl_Position = projection * vp;
#else
    #include<instancesVertex>
    vec4 wPosition = finalWorld * position;
    vec3 wNormal = mat3(finalWorld) * normal;
    vec3 wTangent = mat3(finalWorld) * tangent.xyz * tangent.w;

    // Transform the point into eye space.
    vec4 vp = view * wPosition;
    vec3 v = mat3(view) * velocity;
    // Perform the boost.
    vPosition = vec4(transform(vp.xyz, v), vp.w);
    // Assume no shearing. Otherwise the inverse-transpose should be used.
    vNormal = mat3(view) * wNormal;
    vTangent = mat3(view) * wTangent;
    gl_Position = projection * vPosition;
    // Transform the texture coordinate verbatim.
    vUV = uv;
    // Transform the time coordinate.
#ifdef NO_TIME_DELAY
    float tw = time;
#else
    float tw = time - length(vp.xyz);
#endif
    t = eventTime(tw, vp.xyz, v);
#endif // SKYBOX
}
