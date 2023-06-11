function TestWorld () {
    return (

        <group scale={200} position={[0, 990, 90]}>
            {/* runway */}
            <mesh
            position={[0,-4.98,0]}
            scale={0.1}
            >
                <boxGeometry args={[2,0.5,10]}/>
                <meshStandardMaterial color='gray'/>
            </mesh>
            {/* sea */}
            <mesh 
            position={[0, -5, 1.5]}
            rotation={[-Math.PI/2, 0, 0]} 
            scale={5}
            >
                <planeGeometry />
                <meshStandardMaterial color='steelblue' />
            </mesh>

            {/* some boxes */}
            <mesh 
            position={[0.5,-4.8,2]}
            rotation={[0, Math.PI/8, 0]}
            scale={0.5}
            >
                <boxGeometry />
                <meshStandardMaterial color='rebeccapurple'/>
            </mesh>
            <mesh 
            position={[-0.5,-4.8,2]}
            rotation={[0, -Math.PI/8, 0]}
            scale={0.8}>
                <boxGeometry />
                <meshStandardMaterial color='plum'/>
            </mesh>
            <mesh 
            position={[0.1,-4.8,2.5]}
            rotation={[0, -Math.PI/3, 0]}
            scale={0.4}>
                <boxGeometry />
                <meshStandardMaterial color='peru'/>
            </mesh>
        </group>
    )
}
export default TestWorld