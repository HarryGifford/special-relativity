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
// Set to 0 for world frame and for camera frame.
uniform int simultaneityFrame;
// Set to true to transform according to Euclidean space.
uniform int useGalilean;
// Set to true to assume no travel time delay for light.
uniform int useNoTimeDelay;
// Used for rendering multiple instances of the same mesh.
#include<instancesDeclaration>

// Varying
varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vTangent;
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
    float invGamma = useGalilean == 1 ? 1. : sqrt(1. - vSq);
    float vx = dot(v, x);

    if (vSq <= 1e-4) {
        return x;
    }
    float gamma = 1. / invGamma;
    return x + ((gamma - 1.)/vSq * vx - t*gamma) * v;
}

/**
 * Compute the time the light was emitted from the source vertex that
 * reaches the camera at time 0.
 *
 * This function has a bunch of cases due to the allowed input parameters.
 */
float eventTime(vec3 x, vec3 v) {
    if (useNoTimeDelay == 1) {
        if (useGalilean == 1) {
            return 0.;
        }
        if (simultaneityFrame == WORLD_ENUM) {
            // Simultaneous events in the world frame.
            return 0.;
        } else {
            // Simultaneous events in the camera's frame.
            // Solve t' = gamma * (t - <v,x>), where t' = 0,
            // gives us t = <v,x>.
            return dot(v, x);
        }
    } else {
        // Time taken for light to reach the camera is just the distance
        // to reach the point where the light was emitted. Here we assume
        // the camera is located at the origin.
        return -length(x);
    }
}

/** Transform vertex into the reference frame of the moving camera. */
vec3 transform(vec3 x, vec3 v) {
    float t = eventTime(x, v);
    vec3 e = boost(v, x, t);
    return e;
}

void main() {
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
}
