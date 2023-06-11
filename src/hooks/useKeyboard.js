import { useState, useEffect } from "react";

function useKeyboard() {
    const [keysPressed, setKeysPressed] = useState([]);

    const handleKeyDown = (event) => {
        const { key } = event;
        if (!keysPressed.includes(key)) {
            setKeysPressed((prevKeys) => [...prevKeys, key]);
        }
    };

    const handleKeyUp = (event) => {
        const { key } = event;
        setKeysPressed((prevKeys) => prevKeys.filter((k) => k !== key));
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    },[]);

    return keysPressed
}
export default useKeyboard;
