precision highp float;
precision highp int;

// Attributes
attribute vec3 position;

// Uniforms
uniform mat4 view;
uniform mat4 projection;

uniform int useGalilean;
uniform int useNoTimeDelay;
uniform int simultaneityFrame;

// Varying
varying vec4 vPosition;

void main() {
    vPosition = vec4(position, 1.);
    gl_Position = projection * vPosition;
}
