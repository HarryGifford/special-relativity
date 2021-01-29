precision highp float;
precision highp int;

// Attributes
attribute vec4 position;

// Uniforms
uniform mat4 projection;

// Varying
varying vec4 vPosition;
// We use the same fragment shader as main, so we need to define
// all out variables that are used in the fragment shader.
varying vec3 vNormal;
varying vec3 vTangent;
varying vec2 vUV;
varying float t;

void main() {
    vPosition = position;
    gl_Position = projection * vPosition;
}
