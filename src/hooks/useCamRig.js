import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";

import * as THREE from 'three'

function useCamRig () {
    const { camera } = useThree()

    const rig = useMemo(() => new THREE.Object3D(), [])

    useEffect(() => {
        rig.add(camera)
        camera.position.set(0, 3, -10)
        camera.lookAt(rig.position)
    },[])

    useFrame(() => {
        rig.updateWorldMatrix(true, true)
    })

    return rig
}
export default useCamRig