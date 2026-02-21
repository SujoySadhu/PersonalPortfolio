import { useEffect, useRef, useState, useMemo } from 'react';

const defaultOptions = {};

export const useScrollAnimation = (options = defaultOptions, triggerOnce = true) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    // Memoize options to prevent IntersectionObserver recreation on every render
    const stableOptions = useMemo(() => ({
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options,
    }), [options]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            stableOptions
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [stableOptions, triggerOnce]);

    return { ref, isVisible };
};

const animationClasses = {
    'fade-up': 'translate-y-8 opacity-0',
    'fade-down': '-translate-y-8 opacity-0',
    'fade-left': 'translate-x-8 opacity-0',
    'fade-right': '-translate-x-8 opacity-0',
    'zoom-in': 'scale-95 opacity-0',
    'zoom-out': 'scale-105 opacity-0',
};

const visibleClasses = 'translate-y-0 translate-x-0 scale-100 opacity-100';

export const ScrollAnimation = ({
    children,
    className = '',
    animation = 'fade-up',
    delay = 0,
    duration = 600,
    triggerOnce = true
}) => {
    const { ref, isVisible } = useScrollAnimation(defaultOptions, triggerOnce);

    return (
        <div
            ref={ref}
            className={`transition-all ease-out ${isVisible ? visibleClasses : animationClasses[animation]
                } ${className}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
                willChange: isVisible ? 'auto' : 'transform, opacity',
            }}
        >
            {children}
        </div>
    );
};

export default useScrollAnimation;
