import { Canvas } from "@react-three/fiber"
import Player from "./Player"
import { OrbitControls } from "@react-three/drei"
import TestWorld from "./TestWorld"


function App() {
    return (
        <Canvas >

            <TestWorld />
            <Player />
            {/* <OrbitControls /> */}

            <ambientLight intensity={0.5} />
            <spotLight position={[1000, 1000, 1000]} angle={0.15} penumbra={1} />
            <pointLight position={[-1000, -1000, -1000]} />
        </Canvas>
    )
}

export default App
