varying vec3 v_normal;

void main() {
  v_normal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}