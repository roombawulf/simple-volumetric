import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import Model from "./Model";
import useCamRig from "./hooks/useCamRig";
import usePlaneControls from "./hooks/usePlaneControls";
import { flightModel } from "./flightModel";

function Player () {

    const controls = usePlaneControls()

    const camRig = useCamRig()
    const player = useRef()

    useFrame((state, delta) => {
        flightModel(player.current, controls, delta)

        const dt1 = 1 - Math.exp(-50 * delta)
        const dt2 = 1 - Math.exp(-20 * delta)
        // camRig.position.copy(player.current.position)

        camRig.position.lerp(player.current.position, dt1)
        camRig.quaternion.slerp(player.current.quaternion, dt2)

    }, -1)
    // -1 priority render so we handle before camera updates in useCamRig() hook

    return (
        <Model ref={player} />
    )
}
export default Player