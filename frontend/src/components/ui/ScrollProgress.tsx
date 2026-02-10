"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "./button";

export function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <>
            {/* Top Progress Bar */}
            <motion.div className="scroll-progress" style={{ scaleX }} />

            {/* Back to Top Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
                className="fixed bottom-32 right-8 z-[90]"
            >
                <Button
                    onClick={scrollToTop}
                    className="h-14 w-14 rounded-none bg-white text-black hover:bg-gray-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center group"
                >
                    <ChevronUp className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                </Button>
            </motion.div>
        </>
    );
}

