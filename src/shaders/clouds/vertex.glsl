varying vec3 v_position;

void main() {

    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    v_position = worldPosition.xyz;

    vec4 viewPosition = viewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;

}
