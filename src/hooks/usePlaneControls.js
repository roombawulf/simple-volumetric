import { useEffect, useMemo } from "react";
import useKeyboard from "./useKeyboard";

function usePlaneControls() {
    const keysPressed = useKeyboard();
    
    const controlState = useMemo(() => {
        return {
            PITCH_UP: keysPressed.includes("w"),
            PITCH_DOWN: keysPressed.includes("s"),
            ROLL_LEFT: keysPressed.includes("a"),
            ROLL_RIGHT: keysPressed.includes("d"),
            THROTTLE_UP: keysPressed.includes("z"),
            THROTTLE_DOWN: keysPressed.includes("x"),
        };
    });
    
    return controlState;
}
export default usePlaneControls;
