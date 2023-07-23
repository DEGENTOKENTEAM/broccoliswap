import { useEffect } from "react";

export default function useDisableScroll (lock?: boolean) {
    useEffect(() => {
        const html = document.querySelector("html");
        if (html) {
            html.style.overflow = lock ? "hidden" : "auto";
        }
    }, [lock]); // condition to watch to perform side effect
}