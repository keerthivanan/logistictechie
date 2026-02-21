'use client';

import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';

export type RaysOrigin =
    | 'top-center'
    | 'top-left'
    | 'top-right'
    | 'right'
    | 'left'
    | 'bottom-center'
    | 'bottom-right'
    | 'bottom-left';

interface LightRaysProps {
    raysOrigin?: RaysOrigin;
    anchorOffset?: { x?: number; y?: number };
    raysColor?: string;
    raysSpeed?: number;
    lightSpread?: number;
    rayLength?: number;
    pulsating?: boolean;
    fadeDistance?: number;
    saturation?: number;
    followMouse?: boolean;
    mouseInfluence?: number;
    noiseAmount?: number;
    distortion?: number;
    className?: string;
}

const DEFAULT_COLOR = '#ffffff';

const hexToRgb = (hex: string): [number, number, number] => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const getAnchorAndDir = (
    origin: RaysOrigin,
    w: number,
    h: number,
    anchorOffset?: { x?: number; y?: number }
): { anchor: [number, number]; dir: [number, number] } => {
    const outside = 0.2;
    const res = (() => {
        switch (origin) {
            case 'top-left':
                return { anchor: [0, -outside * h] as [number, number], dir: [0, 1] as [number, number] };
            case 'top-right':
                return { anchor: [w, -outside * h] as [number, number], dir: [0, 1] as [number, number] };
            case 'left':
                return { anchor: [-outside * w, 0.5 * h] as [number, number], dir: [1, 0] as [number, number] };
            case 'right':
                return { anchor: [(1 + outside) * w, 0.5 * h] as [number, number], dir: [-1, 0] as [number, number] };
            case 'bottom-left':
                return { anchor: [0, (1 + outside) * h] as [number, number], dir: [0, -1] as [number, number] };
            case 'bottom-center':
                return { anchor: [0.5 * w, (1 + outside) * h] as [number, number], dir: [0, -1] as [number, number] };
            case 'bottom-right':
                return { anchor: [w, (1 + outside) * h] as [number, number], dir: [0, -1] as [number, number] };
            default: // "top-center"
                return { anchor: [0.5 * w, -outside * h] as [number, number], dir: [0, 1] as [number, number] };
        }
    })();

    if (anchorOffset) {
        if (anchorOffset.x !== undefined) res.anchor[0] += anchorOffset.x;
        if (anchorOffset.y !== undefined) res.anchor[1] += anchorOffset.y;
    }
    return res;
};

type Vec2 = [number, number];
type Vec3 = [number, number, number];

interface Uniforms {
    iTime: { value: number };
    iResolution: { value: Vec2 };
    rayPos: { value: Vec2 };
    rayDir: { value: Vec2 };
    raysColor: { value: Vec3 };
    raysSpeed: { value: number };
    lightSpread: { value: number };
    rayLength: { value: number };
    pulsating: { value: number };
    fadeDistance: { value: number };
    saturation: { value: number };
    mousePos: { value: Vec2 };
    mouseInfluence: { value: number };
    noiseAmount: { value: number };
    distortion: { value: number };
}

const LightRays: React.FC<LightRaysProps> = ({
    raysOrigin = 'top-center',
    anchorOffset,
    raysColor = DEFAULT_COLOR,
    raysSpeed = 1,
    lightSpread = 1,
    rayLength = 2,
    pulsating = false,
    fadeDistance = 1.0,
    saturation = 1.0,
    followMouse = true,
    mouseInfluence = 0.1,
    noiseAmount = 0.0,
    distortion = 0.0,
    className = ''
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const uniformsRef = useRef<Uniforms | null>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
    const animationIdRef = useRef<number | null>(null);
    const meshRef = useRef<Mesh | null>(null);
    const cleanupFunctionRef = useRef<(() => void) | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        observerRef.current = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observerRef.current.observe(containerRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible || !containerRef.current) return;

        if (cleanupFunctionRef.current) {
            cleanupFunctionRef.current();
            cleanupFunctionRef.current = null;
        }

        const initializeWebGL = async () => {
            if (!containerRef.current) return;

            await new Promise(resolve => setTimeout(resolve, 10));

            if (!containerRef.current) return;

            const renderer = new Renderer({
                dpr: Math.min(window.devicePixelRatio, 2),
                alpha: true
            });
            rendererRef.current = renderer;

            const gl = renderer.gl;
            gl.canvas.style.width = '100%';
            gl.canvas.style.height = '100%';

            while (containerRef.current.firstChild) {
                containerRef.current.removeChild(containerRef.current.firstChild);
            }
            containerRef.current.appendChild(gl.canvas);

            const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

            const frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Function to calculate ray strength
float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  // Vertical gradient darkening
  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

            const geometry = new Triangle(gl);
            const program = new Program(gl, {
                vertex: vert,
                fragment: frag,
                uniforms: {
                    iTime: { value: 0 },
                    iResolution: { value: [gl.canvas.width, gl.canvas.height] },
                    rayPos: { value: [0, 0] },
                    rayDir: { value: [0, 1] },
                    raysColor: { value: hexToRgb(raysColor) },
                    raysSpeed: { value: raysSpeed },
                    lightSpread: { value: lightSpread },
                    rayLength: { value: rayLength },
                    pulsating: { value: pulsating ? 1 : 0 },
                    fadeDistance: { value: fadeDistance },
                    saturation: { value: saturation },
                    mousePos: { value: [0.5, 0.5] },
                    mouseInfluence: { value: mouseInfluence },
                    noiseAmount: { value: noiseAmount },
                    distortion: { value: distortion }
                }
            });

            const mesh = new Mesh(gl, { geometry, program });
            meshRef.current = mesh;
            uniformsRef.current = program.uniforms as unknown as Uniforms;

            const handleResize = () => {
                if (!containerRef.current || !rendererRef.current) return;
                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;
                rendererRef.current.setSize(width, height);
                if (uniformsRef.current) {
                    uniformsRef.current.iResolution.value = [width, height];
                    const { anchor, dir } = getAnchorAndDir(raysOrigin, width, height, anchorOffset);
                    uniformsRef.current.rayPos.value = anchor;
                    uniformsRef.current.rayDir.value = dir;
                }
            };

            const handleMouseMove = (e: MouseEvent) => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                mouseRef.current.x = (e.clientX - rect.left) / rect.width;
                mouseRef.current.y = (e.clientY - rect.top) / rect.height;
            };

            window.addEventListener('resize', handleResize);
            if (followMouse) window.addEventListener('mousemove', handleMouseMove);
            handleResize();

            const update = (t: number) => {
                if (!uniformsRef.current || !rendererRef.current || !meshRef.current) return;
                animationIdRef.current = requestAnimationFrame(update);

                smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.05;
                smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.05;

                uniformsRef.current.iTime.value = t * 0.001;
                uniformsRef.current.mousePos.value = [smoothMouseRef.current.x, smoothMouseRef.current.y];
                rendererRef.current.render({ scene: meshRef.current });
            };
            animationIdRef.current = requestAnimationFrame(update);

            cleanupFunctionRef.current = () => {
                window.removeEventListener('resize', handleResize);
                if (followMouse) window.removeEventListener('mousemove', handleMouseMove);
                if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
                if (gl.canvas.parentElement) gl.canvas.parentElement.removeChild(gl.canvas);
                gl.getExtension('WEBGL_lose_context')?.loseContext();
            };
        };

        initializeWebGL();

        return () => {
            if (cleanupFunctionRef.current) {
                cleanupFunctionRef.current();
                cleanupFunctionRef.current = null;
            }
        };
    }, [
        isVisible,
        raysOrigin,
        raysColor,
        raysSpeed,
        lightSpread,
        rayLength,
        pulsating,
        fadeDistance,
        saturation,
        followMouse,
        mouseInfluence,
        noiseAmount,
        distortion,
        anchorOffset
    ]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden ${className}`}
            style={{ background: 'transparent' }}
        />
    );
};

export default LightRays;
