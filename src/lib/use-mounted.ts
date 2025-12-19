import { useState, useEffect } from "react";

/**
 * Hook that returns true after the component has mounted.
 * Useful for avoiding hydration mismatches with components
 * that generate different content on server vs client.
 */
export function useMounted() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}
