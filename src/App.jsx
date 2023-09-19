import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Clouds from "./Clouds";

function App() {
    return (
        <Canvas>
            <Clouds />
            <OrbitControls />

            <mesh position={[0, 0, -5]} scale={0.5}>
                <sphereGeometry />
                <meshStandardMaterial color="aliceblue" />
            </mesh>

            <ambientLight intensity={0.5} />
            <spotLight
                position={[1000, 1000, 1000]}
                angle={0.15}
                penumbra={1}
            />
            <pointLight position={[-1000, -1000, -1000]} />
        </Canvas>
    );
}

export default App;
