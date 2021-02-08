precision highp float;
precision highp int;

#define WORLD_ENUM 0
#define CAMERA_ENUM 1
#define EPS 1e-5

// Attributes
attribute vec4 position;
attribute vec3 normal;
attribute vec4 tangent;
attribute vec2 uv;

// Uniforms
uniform mat4 view;
uniform mat4 projection;
uniform vec3 velocity;
uniform vec3 objectVelocity;
uniform float gamma;
uniform float time;
uniform vec3 cameraPosition;

// Used for rendering multiple instances of the same mesh.
#include<instancesDeclaration>

// Varying
varying vec4 lPosition;
varying vec4 vPosition;
varying vec2 vUV;
varying float t;
#ifdef TANGENT
varying mat3 TBN;
#else
varying vec3 vNormal;
#endif

/**
 * Apply Lorentz/Galilean contraction to the given vector.
 *
 * Here I've just multiplied out the matrix to avoid explicit construction.
 * Taken from B matrix from:
 * https://en.wikipedia.org/wiki/Lorentz_transformation#Proper_transformations
 * `q` is the position to transform. `q.w` is the time component.
 * `v` is the velocity.
 */
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
#ifdef GALILEAN
    float invGamma = 1.;
#else
    float vSq = dot(v, v);
    float invGamma = sqrt(1. - vSq);
#endif // GALILEAN
    // Simultaneous events in the camera's frame.
    // Solve t' = gamma * (t - <v,x>), for t.
    return t * invGamma + dot(v, x);
#endif

#endif
#else
#ifdef GALILEAN
    float b = dot(v, x);
    float t1 = -b - sqrt(b*b + dot(x, x));
    return t + t1;
#else
    // Time taken for light to reach the camera is just the distance
    // to reach the point where the light was emitted. Here we assume
    // the camera is located at the origin.
    return t - length(x);
#endif // GALILEAN
#endif // NO_TIME_DELAY
}

/**
 * Add two relativistic velocities.
 *
 * From https://en.wikipedia.org/wiki/Velocity-addition_formula
 */
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

void main() {
#ifdef SKYBOX
    vPosition = position;
    lPosition = position;
    vec4 vp = vec4(mat3(view) * vec3(position), position.w);
    gl_Position = projection * vp;
#else
    #include<instancesVertex>
    vec4 wPosition = finalWorld * position;
    vec3 mNormal = normalize(normal);
    vec3 mTangent = normalize(tangent.xyz);
    vec3 mBitangent = cross(mNormal, mTangent) * tangent.w;
#ifdef TANGENT
    TBN = mat3(view) * mat3(finalWorld) * mat3(mTangent, mBitangent, mNormal);
#else
    // Assume no shearing. Otherwise the inverse-transpose should be used.
    vec3 wNormal = mat3(finalWorld) * normal;
    vNormal = mat3(view) * wNormal;
#endif
    vec3 camPos = cameraPosition.xyz;
    // Transform the point into eye space.
    vPosition = view * wPosition;
    // Transform velocities into eye space.
    vec3 v = mat3(view) * velocity;
    vec3 u = mat3(view) * objectVelocity;
    // Intersection event time.
    float tEvent = eventTime(0., vPosition.xyz, velocityAdd(v, u));
    // Perform the boost.
    vec4 tx1 = vec4(vPosition.xyz, tEvent);
    tx1 = boost(tx1, u);
    tx1 = boost(tx1, v);
    lPosition = vec4(tx1.xyz, vPosition.w);
    gl_Position = projection * lPosition;
    // Transform the texture coordinate verbatim.
    vUV = uv;
    t = tx1.w;
#endif // SKYBOX
}
