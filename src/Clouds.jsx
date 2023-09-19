import { useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { useControls } from "leva";
import * as THREE from "three";
import vertex from "./shaders/clouds/vertex.glsl";
import fragment from "./shaders/clouds/fragment.glsl";

const CloudMaterial = shaderMaterial(
    {
        u_time: 0.0,
        u_freq: 2.0,
        u_scale: 1.0,
        u_thickness: 50.0,
        u_is_scatter: true,

        u_light_pos: new THREE.Vector3(),
        u_light_dir: new THREE.Vector3(),
        u_light_color: new THREE.Color(),
    },
    vertex,
    fragment
);
extend({ CloudMaterial });

function Clouds() {
    const t = useRef();
    const shaderMaterial = useRef();

    const { color, position } = useControls("Light", {
        color: { value: { r: 141, g: 54, b: 0 } },
        position: { value: { x: 0.0, y: 0, z: 0.0 }, step: 0.5 },
    });

    const { noise, scale, thickness, scatter } = useControls("Cloud", {
        noise: { value: 1.5, step: 0.1, min: 0.5, max: 20.0 },
        scale: { value: 4.0, step: 0.1, min: 1.0, max: 20.0 },
        thickness: { value: 50.0, step: 1, min: 1.0, max: 100.0 },
        scatter: { value: true },
    });

    useFrame((state, delta) => {
        shaderMaterial.current.u_time = state.clock.elapsedTime;
        shaderMaterial.current.u_freq = noise;
        shaderMaterial.current.u_scale = scale;
        shaderMaterial.current.u_thickness = thickness;
        shaderMaterial.current.u_light_pos.copy(position);
        shaderMaterial.current.u_light_color.copy(color);
        shaderMaterial.current.u_is_scatter = scatter;
    });

    return (
        <mesh position={[0, 0, 0]} ref={t}>
            <boxGeometry args={[scale, scale, scale]} />
            <cloudMaterial
                ref={shaderMaterial}
                key={CloudMaterial.key}
                transparent
                side={THREE.BackSide}
            />
        </mesh>
    );
}
export default Clouds;
