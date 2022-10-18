uniform sampler2D u_texture;
uniform vec2 u_screenCoord;
uniform float u_refractPower;
uniform float u_transparent;
varying vec3 v_normal;

const int LOOP = 16;

#include '../glsl/random.glsl'

void main() {
  vec2 uv = gl_FragCoord.xy / u_screenCoord.xy;
  vec2 refractNormal = v_normal.xy * (1.0 - v_normal.z * 0.85);
  vec3 refractCol = vec3( 0.0 );

  for ( int i = 0; i < LOOP; i ++ ) {
    float slide = float(i) / float(LOOP) * 0.1 + random21(uv) * 0.03;

    vec2 refractUvR = uv - refractNormal * ( u_refractPower + slide * 1.0 ) * u_transparent;
    vec2 refractUvG = uv - refractNormal * ( u_refractPower + slide * 1.5 ) * u_transparent;
    vec2 refractUvB = uv - refractNormal * ( u_refractPower + slide * 2.0 ) * u_transparent;

    refractCol.r += texture2D( u_texture, refractUvR ).r;
    refractCol.g += texture2D( u_texture, refractUvG ).g;
    refractCol.b += texture2D( u_texture, refractUvB ).b;
  }
  refractCol /= float( LOOP );

  gl_FragColor = vec4(refractCol, 1.0);
}