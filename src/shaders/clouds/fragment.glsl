varying vec3 v_position;

uniform bool u_is_scatter;
uniform float u_time;
uniform float u_freq;
uniform float u_scale;
uniform float u_thickness;
uniform vec3 u_light_color;
uniform vec3 u_light_pos;
uniform vec3 u_light_dir;

const int MAX_STEPS = 100;
const float MARCH_STEP = 0.01;
const float EPS = 0.01;
const float MAX_DIST = 100.0;

const float SDF_SPHERE_RADIUS = 5.0;
const float SIGMA_A = 0.0;
const float SIGMA_S = 1.0;
const float SIGMA_E = SIGMA_A + SIGMA_S;

//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

float sdBox( vec3 p, vec3 b ) {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdSphere( vec3 p, float s ) {
    return length(p) - s;
}

float beerLambert (float sigma_a, float dist ) {
    return exp( -dist * sigma_a );
}

float phaseFunction() {
    return 1.0/(4.0*3.14);
}

vec3 evaluateLight ( vec3 pos ) {
    vec3 lightPos = u_light_pos;
    vec3 lightCol = 25.0 * (u_light_color / 256.0);
    vec3 L = lightPos-pos;
    return lightCol * 1.0/dot(L,L);
}

vec4 cloudRayMarch( vec3 rayOrigin, vec3 rayDir ) {

    vec4 cloudColor = vec4( 0.0, 0.0, 0.0, 1.0 );
    float dist = 0.0;

    for ( int i = 0; i < MAX_STEPS; i++ ) {

        vec3 samplePos = rayOrigin + ( rayDir * dist );

        float sdf = sdSphere( samplePos, 0.5 * u_scale );

        // are we inside of the sphere? { sdf < EPSILON } is considered to be negative.
        if ( sdf < EPS ) {

            float density = u_thickness * max( 0.0, cnoise( u_freq * samplePos + u_time ) ) * smoothstep(EPS, -0.25, sdf);
            float transmittance = exp( -SIGMA_E * MARCH_STEP * density );
            vec3 luminance = evaluateLight( samplePos ) * ( u_is_scatter ?  phaseFunction() : 1.0 );
            vec3 integScatter = luminance - luminance * transmittance;
            cloudColor.rgb += integScatter * cloudColor.a;
            cloudColor.a *= transmittance;

            // break the loop when alpha is too small (not visible)
            if (cloudColor.a < 0.001) {
                cloudColor.a = 0.0;
                break;
            }

        }
        // if intersecting the sphere, we step by MARCH_STEP
        // otherwise we step by sdf's returned value (if it is bigger than MARCH_STEP)
        dist += sdf < EPS ? MARCH_STEP : max(sdf, MARCH_STEP);
    }
    return vec4(cloudColor.rgb, 1.0 - cloudColor.a);
}

void main () {
    
    vec3 rayOrigin = cameraPosition;
    vec3 rayDir = normalize(v_position - cameraPosition);

    
    vec4 color = cloudRayMarch( rayOrigin, rayDir );
    gl_FragColor = color;
    // gl_FragColor = vec4(cameraPosition, 1.0);
}