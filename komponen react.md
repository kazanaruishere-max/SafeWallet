#BACKGROUND#
npx shadcn@latest add @react-bits/LightRays-TS-TW

#USAGE:
import LightRays from './LightRays';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LightRays
    raysOrigin="top-center"
    raysColor="#ffffff"
    raysSpeed={1}
    lightSpread={0.5}
    rayLength={3}
    followMouse={true}
    mouseInfluence={0.1}
    noiseAmount={0}
    distortion={0}
    className="custom-rays"
    pulsating={false}
    fadeDistance={1}
    saturation={1}
/>
</div>
# CODE:
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
h: number
): { anchor: [number, number]; dir: [number, number] } => {
const outside = 0.2;
switch (origin) {
case 'top-left':
return { anchor: [0, -outside * h], dir: [0, 1] };
case 'top-right':
return { anchor: [w, -outside * h], dir: [0, 1] };
case 'left':
return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
case 'right':
return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
case 'bottom-left':
return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
case 'bottom-center':
return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
case 'bottom-right':
return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
default: // "top-center"
return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
}
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
vUv = position \* 0.5 + 0.5;
gl_Position = vec4(position, 0.0, 1.0);
}`;

      const frag = `precision highp float;

uniform float iTime;
uniform vec2 iResolution;

uniform vec2 rayPos;
uniform vec2 rayDir;
uniform vec3 raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2 mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
return fract(sin(dot(st.xy, vec2(12.9898,78.233))) \* 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
float seedA, float seedB, float speed) {
vec2 sourceToCoord = coord - raySource;
vec2 dirNorm = normalize(sourceToCoord);
float cosAngle = dot(dirNorm, rayRefDirection);

float distortedAngle = cosAngle + distortion _ sin(iTime _ 2.0 + length(sourceToCoord) _ 0.01) _ 0.2;

float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

float distance = length(sourceToCoord);
float maxDistance = iResolution.x \* rayLength;
float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

float fadeFalloff = clamp((iResolution.x _ fadeDistance - distance) / (iResolution.x _ fadeDistance), 0.5, 1.0);
float pulse = pulsating > 0.5 ? (0.8 + 0.2 _ sin(iTime _ speed \* 3.0)) : 1.0;

float baseStrength = clamp(
(0.45 + 0.15 _ sin(distortedAngle _ seedA + iTime _ speed)) +
(0.3 + 0.2 _ cos(-distortedAngle _ seedB + iTime _ speed)),
0.0, 1.0
);

return baseStrength _ lengthFalloff _ fadeFalloff _ spreadFactor _ pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

vec2 finalRayDir = rayDir;
if (mouseInfluence > 0.0) {
vec2 mouseScreenPos = mousePos \* iResolution.xy;
vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
}

vec4 rays1 = vec4(1.0) _
rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
1.5 _ raysSpeed);
vec4 rays2 = vec4(1.0) _
rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
1.1 _ raysSpeed);

fragColor = rays1 _ 0.5 + rays2 _ 0.4;

if (noiseAmount > 0.0) {
float n = noise(coord _ 0.01 + iTime _ 0.1);
fragColor.rgb _= (1.0 - noiseAmount + noiseAmount _ n);
}

float brightness = 1.0 - (coord.y / iResolution.y);
fragColor.x _= 0.1 + brightness _ 0.8;
fragColor.y _= 0.3 + brightness _ 0.6;
fragColor.z _= 0.5 + brightness _ 0.5;

if (saturation != 1.0) {
float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
}

fragColor.rgb \*= raysColor;
}

void main() {
vec4 color;
mainImage(color, gl_FragCoord.xy);
gl_FragColor = color;
}`;

      const uniforms: Uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },

        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },

        raysColor: { value: hexToRgb(raysColor) },
        raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread },
        rayLength: { value: rayLength },
        pulsating: { value: pulsating ? 1.0 : 0.0 },
        fadeDistance: { value: fadeDistance },
        saturation: { value: saturation },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: mouseInfluence },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion }
      };
      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: vert,
        fragment: frag,
        uniforms
      });
      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const updatePlacement = () => {
        if (!containerRef.current || !renderer) return;

        renderer.dpr = Math.min(window.devicePixelRatio, 2);

        const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
        renderer.setSize(wCSS, hCSS);

        const dpr = renderer.dpr;
        const w = wCSS * dpr;
        const h = hCSS * dpr;

        uniforms.iResolution.value = [w, h];

        const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
      };

      const loop = (t: number) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) {
          return;
        }

        uniforms.iTime.value = t * 0.001;

        if (followMouse && mouseInfluence > 0.0) {
          const smoothing = 0.92;

          smoothMouseRef.current.x = smoothMouseRef.current.x * smoothing + mouseRef.current.x * (1 - smoothing);
          smoothMouseRef.current.y = smoothMouseRef.current.y * smoothing + mouseRef.current.y * (1 - smoothing);

          uniforms.mousePos.value = [smoothMouseRef.current.x, smoothMouseRef.current.y];
        }

        try {
          renderer.render({ scene: mesh });
          animationIdRef.current = requestAnimationFrame(loop);
        } catch (error) {
          console.warn('WebGL rendering error:', error);
          return;
        }
      };

      window.addEventListener('resize', updatePlacement);
      updatePlacement();
      animationIdRef.current = requestAnimationFrame(loop);

      cleanupFunctionRef.current = () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }

        window.removeEventListener('resize', updatePlacement);

        if (renderer) {
          try {
            const canvas = renderer.gl.canvas;
            const loseContextExt = renderer.gl.getExtension('WEBGL_lose_context');
            if (loseContextExt) {
              loseContextExt.loseContext();
            }

            if (canvas && canvas.parentNode) {
              canvas.parentNode.removeChild(canvas);
            }
          } catch (error) {
            console.warn('Error during WebGL cleanup:', error);
          }
        }

        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
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
distortion
]);

useEffect(() => {
if (!uniformsRef.current || !containerRef.current || !rendererRef.current) return;

    const u = uniformsRef.current;
    const renderer = rendererRef.current;

    u.raysColor.value = hexToRgb(raysColor);
    u.raysSpeed.value = raysSpeed;
    u.lightSpread.value = lightSpread;
    u.rayLength.value = rayLength;
    u.pulsating.value = pulsating ? 1.0 : 0.0;
    u.fadeDistance.value = fadeDistance;
    u.saturation.value = saturation;
    u.mouseInfluence.value = mouseInfluence;
    u.noiseAmount.value = noiseAmount;
    u.distortion.value = distortion;

    const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
    const dpr = renderer.dpr;
    const { anchor, dir } = getAnchorAndDir(raysOrigin, wCSS * dpr, hCSS * dpr);
    u.rayPos.value = anchor;
    u.rayDir.value = dir;

}, [
raysColor,
raysSpeed,
lightSpread,
raysOrigin,
rayLength,
pulsating,
fadeDistance,
saturation,
mouseInfluence,
noiseAmount,
distortion
]);

useEffect(() => {
const handleMouseMove = (e: MouseEvent) => {
if (!containerRef.current || !rendererRef.current) return;
const rect = containerRef.current.getBoundingClientRect();
const x = (e.clientX - rect.left) / rect.width;
const y = (e.clientY - rect.top) / rect.height;
mouseRef.current = { x, y };
};

    if (followMouse) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }

}, [followMouse]);

return (

<div
ref={containerRef}
className={`w-full h-full pointer-events-none z-[3] overflow-hidden relative ${className}`.trim()}
/>
);
};

export default LightRays;

Scroll Velocity
npx shadcn@latest add @react-bits/ScrollVelocity-TS-TW

# Usage:

import ScrollVelocity from './ScrollVelocity';

<ScrollVelocity
texts={['React Bits', 'Scroll Down']}
velocity={50}
className="custom-scroll-text"
/>

#Code:
import React, { useRef, useLayoutEffect, useState } from 'react';
import {
motion,
useScroll,
useSpring,
useTransform,
useMotionValue,
useVelocity,
useAnimationFrame
} from 'motion/react';

interface VelocityMapping {
input: [number, number];
output: [number, number];
}

interface VelocityTextProps {
children: React.ReactNode;
baseVelocity: number;
scrollContainerRef?: React.RefObject<HTMLElement>;
className?: string;
damping?: number;
stiffness?: number;
numCopies?: number;
velocityMapping?: VelocityMapping;
parallaxClassName?: string;
scrollerClassName?: string;
parallaxStyle?: React.CSSProperties;
scrollerStyle?: React.CSSProperties;
}

interface ScrollVelocityProps {
scrollContainerRef?: React.RefObject<HTMLElement>;
texts: string[];
velocity?: number;
className?: string;
damping?: number;
stiffness?: number;
numCopies?: number;
velocityMapping?: VelocityMapping;
parallaxClassName?: string;
scrollerClassName?: string;
parallaxStyle?: React.CSSProperties;
scrollerStyle?: React.CSSProperties;
}

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>): number {
const [width, setWidth] = useState(0);

useLayoutEffect(() => {
function updateWidth() {
if (ref.current) {
setWidth(ref.current.offsetWidth);
}
}
updateWidth();
window.addEventListener('resize', updateWidth);
return () => window.removeEventListener('resize', updateWidth);
}, [ref]);

return width;
}

export const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
scrollContainerRef,
texts = [],
velocity = 100,
className = '',
damping = 50,
stiffness = 400,
numCopies = 6,
velocityMapping = { input: [0, 1000], output: [0, 5] },
parallaxClassName,
scrollerClassName,
parallaxStyle,
scrollerStyle
}) => {
function VelocityText({
children,
baseVelocity = velocity,
scrollContainerRef,
className = '',
damping,
stiffness,
numCopies,
velocityMapping,
parallaxClassName,
scrollerClassName,
parallaxStyle,
scrollerStyle
}: VelocityTextProps) {
const baseX = useMotionValue(0);
const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
const { scrollY } = useScroll(scrollOptions);
const scrollVelocity = useVelocity(scrollY);
const smoothVelocity = useSpring(scrollVelocity, {
damping: damping ?? 50,
stiffness: stiffness ?? 400
});
const velocityFactor = useTransform(
smoothVelocity,
velocityMapping?.input || [0, 1000],
velocityMapping?.output || [0, 5],
{ clamp: false }
);

    const copyRef = useRef<HTMLSpanElement>(null);
    const copyWidth = useElementWidth(copyRef);

    function wrap(min: number, max: number, v: number): number {
      const range = max - min;
      const mod = (((v - min) % range) + range) % range;
      return mod + min;
    }

    const x = useTransform(baseX, v => {
      if (copyWidth === 0) return '0px';
      return `${wrap(-copyWidth, 0, v)}px`;
    });

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
      let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }

      moveBy += directionFactor.current * moveBy * velocityFactor.get();
      baseX.set(baseX.get() + moveBy);
    });

    const spans = [];
    for (let i = 0; i < numCopies!; i++) {
      spans.push(
        <span className={`flex-shrink-0 ${className}`} key={i} ref={i === 0 ? copyRef : null}>
          {children}
        </span>
      );
    }

    return (
      <div className={`${parallaxClassName} relative overflow-hidden`} style={parallaxStyle}>
        <motion.div
          className={`${scrollerClassName} flex whitespace-nowrap text-center font-sans text-4xl font-bold tracking-[-0.02em] drop-shadow md:text-[5rem] md:leading-[5rem]`}
          style={{ x, ...scrollerStyle }}
        >
          {spans}
        </motion.div>
      </div>
    );

}

return (

<section>
{texts.map((text: string, index: number) => (
<VelocityText
key={index}
className={className}
baseVelocity={index % 2 !== 0 ? -velocity : velocity}
scrollContainerRef={scrollContainerRef}
damping={damping}
stiffness={stiffness}
numCopies={numCopies}
velocityMapping={velocityMapping}
parallaxClassName={parallaxClassName}
scrollerClassName={scrollerClassName}
parallaxStyle={parallaxStyle}
scrollerStyle={scrollerStyle} >
{text}&nbsp;
</VelocityText>
))}
</section>
);
};

export default ScrollVelocity;

Circular Gallery
npx shadcn@latest add @react-bits/CircularGallery-TS-TW

# Usage:

import CircularGallery from './CircularGallery'

<div style={{ height: '600px', position: 'relative' }}>
  <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} scrollEase={0.02}
  bend={9}
  borderRadius={0.12}
  scrollSpeed={2}
  scrollEase={0.05}
/>
</div>

# Code:

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

type GL = Renderer['gl'];

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
let timeout: number;
return function (this: any, ...args: Parameters<T>) {
window.clearTimeout(timeout);
timeout = window.setTimeout(() => func.apply(this, args), wait);
};
}

function lerp(p1: number, p2: number, t: number): number {
return p1 + (p2 - p1) \* t;
}

function autoBind(instance: any): void {
const proto = Object.getPrototypeOf(instance);
Object.getOwnPropertyNames(proto).forEach(key => {
if (key !== 'constructor' && typeof instance[key] === 'function') {
instance[key] = instance[key].bind(instance);
}
});
}

function getFontSize(font: string): number {
const match = font.match(/(\d+)px/);
return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(
gl: GL,
text: string,
font: string = 'bold 30px monospace',
color: string = 'black'
): { texture: Texture; width: number; height: number } {
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
if (!context) throw new Error('Could not get 2d context');

context.font = font;
const metrics = context.measureText(text);
const textWidth = Math.ceil(metrics.width);
const fontSize = getFontSize(font);
const textHeight = Math.ceil(fontSize \* 1.2);

canvas.width = textWidth + 20;
canvas.height = textHeight + 20;

context.font = font;
context.fillStyle = color;
context.textBaseline = 'middle';
context.textAlign = 'center';
context.clearRect(0, 0, canvas.width, canvas.height);
context.fillText(text, canvas.width / 2, canvas.height / 2);

const texture = new Texture(gl, { generateMipmaps: false });
texture.image = canvas;
return { texture, width: canvas.width, height: canvas.height };
}

interface TitleProps {
gl: GL;
plane: Mesh;
renderer: Renderer;
text: string;
textColor?: string;
font?: string;
}

class Title {
gl: GL;
plane: Mesh;
renderer: Renderer;
text: string;
textColor: string;
font: string;
mesh!: Mesh;

constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }: TitleProps) {
autoBind(this);
this.gl = gl;
this.plane = plane;
this.renderer = renderer;
this.text = text;
this.textColor = textColor;
this.font = font;
this.createMesh();
}

createMesh() {
const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
const geometry = new Plane(this.gl);
const program = new Program(this.gl, {
vertex: `         attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
fragment: `         precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
uniforms: { tMap: { value: texture } },
transparent: true
});
this.mesh = new Mesh(this.gl, { geometry, program });
const aspect = width / height;
const textHeightScaled = this.plane.scale.y _ 0.15;
const textWidthScaled = textHeightScaled _ aspect;
this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
this.mesh.position.y = -this.plane.scale.y _ 0.5 - textHeightScaled _ 0.5 - 0.05;
this.mesh.setParent(this.plane);
}
}

interface ScreenSize {
width: number;
height: number;
}

interface Viewport {
width: number;
height: number;
}

interface MediaProps {
geometry: Plane;
gl: GL;
image: string;
index: number;
length: number;
renderer: Renderer;
scene: Transform;
screen: ScreenSize;
text: string;
viewport: Viewport;
bend: number;
textColor: string;
borderRadius?: number;
font?: string;
}

class Media {
extra: number = 0;
geometry: Plane;
gl: GL;
image: string;
index: number;
length: number;
renderer: Renderer;
scene: Transform;
screen: ScreenSize;
text: string;
viewport: Viewport;
bend: number;
textColor: string;
borderRadius: number;
font?: string;
program!: Program;
plane!: Mesh;
title!: Title;
scale!: number;
padding!: number;
width!: number;
widthTotal!: number;
x!: number;
speed: number = 0;
isBefore: boolean = false;
isAfter: boolean = false;

constructor({
geometry,
gl,
image,
index,
length,
renderer,
scene,
screen,
text,
viewport,
bend,
textColor,
borderRadius = 0,
font
}: MediaProps) {
this.geometry = geometry;
this.gl = gl;
this.image = image;
this.index = index;
this.length = length;
this.renderer = renderer;
this.scene = scene;
this.screen = screen;
this.text = text;
this.viewport = viewport;
this.bend = bend;
this.textColor = textColor;
this.borderRadius = borderRadius;
this.font = font;
this.createShader();
this.createMesh();
this.createTitle();
this.onResize();
}

createShader() {
const texture = new Texture(this.gl, {
generateMipmaps: true
});
this.program = new Program(this.gl, {
depthTest: false,
depthWrite: false,
vertex: `         precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
fragment: `
precision highp float;
uniform vec2 uImageSizes;
uniform vec2 uPlaneSizes;
uniform sampler2D tMap;
uniform float uBorderRadius;
varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);

          // Smooth antialiasing for edges
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };

}

createMesh() {
this.plane = new Mesh(this.gl, {
geometry: this.geometry,
program: this.program
});
this.plane.setParent(this.scene);
}

createTitle() {
this.title = new Title({
gl: this.gl,
plane: this.plane,
renderer: this.renderer,
text: this.text,
textColor: this.textColor,
font: this.font
});
}

update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }

}

onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
if (screen) this.screen = screen;
if (viewport) {
this.viewport = viewport;
if (this.plane.program.uniforms.uViewportSizes) {
this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
}
}
this.scale = this.screen.height / 1500;
this.plane.scale.y = (this.viewport.height _ (900 _ this.scale)) / this.screen.height;
this.plane.scale.x = (this.viewport.width _ (700 _ this.scale)) / this.screen.width;
this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
this.padding = 2;
this.width = this.plane.scale.x + this.padding;
this.widthTotal = this.width _ this.length;
this.x = this.width _ this.index;
}
}

interface AppConfig {
items?: { image: string; text: string }[];
bend?: number;
textColor?: string;
borderRadius?: number;
font?: string;
scrollSpeed?: number;
scrollEase?: number;
}

class App {
container: HTMLElement;
scrollSpeed: number;
scroll: {
ease: number;
current: number;
target: number;
last: number;
position?: number;
};
onCheckDebounce: (...args: any[]) => void;
renderer!: Renderer;
gl!: GL;
camera!: Camera;
scene!: Transform;
planeGeometry!: Plane;
medias: Media[] = [];
mediasImages: { image: string; text: string }[] = [];
screen!: { width: number; height: number };
viewport!: { width: number; height: number };
raf: number = 0;

boundOnResize!: () => void;
boundOnWheel!: (e: Event) => void;
boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
boundOnTouchUp!: () => void;

isDown: boolean = false;
start: number = 0;

constructor(
container: HTMLElement,
{
items,
bend = 1,
textColor = '#ffffff',
borderRadius = 0,
font = 'bold 30px Figtree',
scrollSpeed = 2,
scrollEase = 0.05
}: AppConfig
) {
document.documentElement.classList.remove('no-js');
this.container = container;
this.scrollSpeed = scrollSpeed;
this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
this.createRenderer();
this.createCamera();
this.createScene();
this.onResize();
this.createGeometry();
this.createMedias(items, bend, textColor, borderRadius, font);
this.update();
this.addEventListeners();
}

createRenderer() {
this.renderer = new Renderer({
alpha: true,
antialias: true,
dpr: Math.min(window.devicePixelRatio || 1, 2)
});
this.gl = this.renderer.gl;
this.gl.clearColor(0, 0, 0, 0);
this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
}

createCamera() {
this.camera = new Camera(this.gl);
this.camera.fov = 45;
this.camera.position.z = 20;
}

createScene() {
this.scene = new Transform();
}

createGeometry() {
this.planeGeometry = new Plane(this.gl, {
heightSegments: 50,
widthSegments: 100
});
}

createMedias(
items: { image: string; text: string }[] | undefined,
bend: number = 1,
textColor: string,
borderRadius: number,
font: string
) {
const defaultItems = [
{
image: `https://picsum.photos/seed/1/800/600?grayscale`,
text: 'Bridge'
},
{
image: `https://picsum.photos/seed/2/800/600?grayscale`,
text: 'Desk Setup'
},
{
image: `https://picsum.photos/seed/3/800/600?grayscale`,
text: 'Waterfall'
},
{
image: `https://picsum.photos/seed/4/800/600?grayscale`,
text: 'Strawberries'
},
{
image: `https://picsum.photos/seed/5/800/600?grayscale`,
text: 'Deep Diving'
},
{
image: `https://picsum.photos/seed/16/800/600?grayscale`,
text: 'Train Track'
},
{
image: `https://picsum.photos/seed/17/800/600?grayscale`,
text: 'Santorini'
},
{
image: `https://picsum.photos/seed/8/800/600?grayscale`,
text: 'Blurry Lights'
},
{
image: `https://picsum.photos/seed/9/800/600?grayscale`,
text: 'New York'
},
{
image: `https://picsum.photos/seed/10/800/600?grayscale`,
text: 'Good Boy'
},
{
image: `https://picsum.photos/seed/21/800/600?grayscale`,
text: 'Coastline'
},
{
image: `https://picsum.photos/seed/12/800/600?grayscale`,
text: 'Palm Trees'
}
];
const galleryItems = items && items.length ? items : defaultItems;
this.mediasImages = galleryItems.concat(galleryItems);
this.medias = this.mediasImages.map((data, index) => {
return new Media({
geometry: this.planeGeometry,
gl: this.gl,
image: data.image,
index,
length: this.mediasImages.length,
renderer: this.renderer,
scene: this.scene,
screen: this.screen,
text: data.text,
viewport: this.viewport,
bend,
textColor,
borderRadius,
font
});
});
}

onTouchDown(e: MouseEvent | TouchEvent) {
this.isDown = true;
this.scroll.position = this.scroll.current;
this.start = 'touches' in e ? e.touches[0].clientX : e.clientX;
}

onTouchMove(e: MouseEvent | TouchEvent) {
if (!this.isDown) return;
const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
const distance = (this.start - x) _ (this.scrollSpeed _ 0.025);
this.scroll.target = (this.scroll.position ?? 0) + distance;
}

onTouchUp() {
this.isDown = false;
this.onCheck();
}

onWheel(e: Event) {
const wheelEvent = e as WheelEvent;
const delta = wheelEvent.deltaY || (wheelEvent as any).wheelDelta || (wheelEvent as any).detail;
this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) \* 0.2;
this.onCheckDebounce();
}

onCheck() {
if (!this.medias || !this.medias[0]) return;
const width = this.medias[0].width;
const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
const item = width \* itemIndex;
this.scroll.target = this.scroll.target < 0 ? -item : item;
}

onResize() {
this.screen = {
width: this.container.clientWidth,
height: this.container.clientHeight
};
this.renderer.setSize(this.screen.width, this.screen.height);
this.camera.perspective({
aspect: this.screen.width / this.screen.height
});
const fov = (this.camera.fov _ Math.PI) / 180;
const height = 2 _ Math.tan(fov / 2) _ this.camera.position.z;
const width = height _ this.camera.aspect;
this.viewport = { width, height };
if (this.medias) {
this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
}
}

update() {
this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
if (this.medias) {
this.medias.forEach(media => media.update(this.scroll, direction));
}
this.renderer.render({ scene: this.scene, camera: this.camera });
this.scroll.last = this.scroll.current;
this.raf = window.requestAnimationFrame(this.update.bind(this));
}

addEventListeners() {
this.boundOnResize = this.onResize.bind(this);
this.boundOnWheel = this.onWheel.bind(this);
this.boundOnTouchDown = this.onTouchDown.bind(this);
this.boundOnTouchMove = this.onTouchMove.bind(this);
this.boundOnTouchUp = this.onTouchUp.bind(this);
window.addEventListener('resize', this.boundOnResize);
window.addEventListener('mousewheel', this.boundOnWheel);
window.addEventListener('wheel', this.boundOnWheel);
window.addEventListener('mousedown', this.boundOnTouchDown);
window.addEventListener('mousemove', this.boundOnTouchMove);
window.addEventListener('mouseup', this.boundOnTouchUp);
window.addEventListener('touchstart', this.boundOnTouchDown);
window.addEventListener('touchmove', this.boundOnTouchMove);
window.addEventListener('touchend', this.boundOnTouchUp);
}

destroy() {
window.cancelAnimationFrame(this.raf);
window.removeEventListener('resize', this.boundOnResize);
window.removeEventListener('mousewheel', this.boundOnWheel);
window.removeEventListener('wheel', this.boundOnWheel);
window.removeEventListener('mousedown', this.boundOnTouchDown);
window.removeEventListener('mousemove', this.boundOnTouchMove);
window.removeEventListener('mouseup', this.boundOnTouchUp);
window.removeEventListener('touchstart', this.boundOnTouchDown);
window.removeEventListener('touchmove', this.boundOnTouchMove);
window.removeEventListener('touchend', this.boundOnTouchUp);
if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
}
}
}

interface CircularGalleryProps {
items?: { image: string; text: string }[];
bend?: number;
textColor?: string;
borderRadius?: number;
font?: string;
scrollSpeed?: number;
scrollEase?: number;
}

export default function CircularGallery({
items,
bend = 3,
textColor = '#ffffff',
borderRadius = 0.05,
font = 'bold 30px Figtree',
scrollSpeed = 2,
scrollEase = 0.05
}: CircularGalleryProps) {
const containerRef = useRef<HTMLDivElement>(null);
useEffect(() => {
if (!containerRef.current) return;
const app = new App(containerRef.current, {
items,
bend,
textColor,
borderRadius,
font,
scrollSpeed,
scrollEase
});
return () => {
app.destroy();
};
}, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);
return <div className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing" ref={containerRef} />;
}

Flowing Menu
npx shadcn@latest add @react-bits/FlowingMenu-TS-TW

#Usage:
import FlowingMenu from './FlowingMenu'

const demoItems = [
{ link: '#', text: 'Mojave', image: 'https://picsum.photos/600/400?random=1' },
{ link: '#', text: 'Sonoma', image: 'https://picsum.photos/600/400?random=2' },
{ link: '#', text: 'Monterey', image: 'https://picsum.photos/600/400?random=3' },
{ link: '#', text: 'Sequoia', image: 'https://picsum.photos/600/400?random=4' }
];

<div style={{ height: '600px', position: 'relative' }}>
  <FlowingMenu items={demoItems}
  speed={15}
  textColor="#ffffff"
  bgColor="#060010"
  marqueeBgColor="#ffffff"
  marqueeTextColor="#060010"
  borderColor="#ffffff"
/>
</div>

#Code:
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface MenuItemData {
link: string;
text: string;
image: string;
}

interface FlowingMenuProps {
items?: MenuItemData[];
speed?: number;
textColor?: string;
bgColor?: string;
marqueeBgColor?: string;
marqueeTextColor?: string;
borderColor?: string;
}

interface MenuItemProps extends MenuItemData {
speed: number;
textColor: string;
marqueeBgColor: string;
marqueeTextColor: string;
borderColor: string;
isFirst: boolean;
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({
items = [],
speed = 15,
textColor = '#fff',
bgColor = '#060010',
marqueeBgColor = '#fff',
marqueeTextColor = '#060010',
borderColor = '#fff'
}) => {
return (
<div className="w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
<nav className="flex flex-col h-full m-0 p-0">
{items.map((item, idx) => (
<MenuItem
key={idx}
{...item}
speed={speed}
textColor={textColor}
marqueeBgColor={marqueeBgColor}
marqueeTextColor={marqueeTextColor}
borderColor={borderColor}
isFirst={idx === 0}
/>
))}
</nav>
</div>
);
};

const MenuItem: React.FC<MenuItemProps> = ({
link,
text,
image,
speed,
textColor,
marqueeBgColor,
marqueeTextColor,
borderColor,
isFirst
}) => {
const itemRef = useRef<HTMLDivElement>(null);
const marqueeRef = useRef<HTMLDivElement>(null);
const marqueeInnerRef = useRef<HTMLDivElement>(null);
const animationRef = useRef<gsap.core.Tween | null>(null);
const [repetitions, setRepetitions] = useState(4);

const animationDefaults = { duration: 0.6, ease: 'expo' };

const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number): 'top' | 'bottom' => {
const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
};

useEffect(() => {
const calculateRepetitions = () => {
if (!marqueeInnerRef.current) return;
const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part') as HTMLElement;
if (!marqueeContent) return;
const contentWidth = marqueeContent.offsetWidth;
const viewportWidth = window.innerWidth;
const needed = Math.ceil(viewportWidth / contentWidth) + 2;
setRepetitions(Math.max(4, needed));
};

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);

}, [text, image]);

useEffect(() => {
const setupMarquee = () => {
if (!marqueeInnerRef.current) return;
const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part') as HTMLElement;
if (!marqueeContent) return;
const contentWidth = marqueeContent.offsetWidth;
if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1
      });
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };

}, [text, image, repetitions, speed]);

const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
const rect = itemRef.current.getBoundingClientRect();
const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);

};

const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
const rect = itemRef.current.getBoundingClientRect();
const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);

};

return (
<div
className="flex-1 relative overflow-hidden text-center"
ref={itemRef}
style={{ borderTop: isFirst ? 'none' : `1px solid ${borderColor}` }} >
<a
className="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-[4vh]"
href={link}
onMouseEnter={handleMouseEnter}
onMouseLeave={handleMouseLeave}
style={{ color: textColor }} >
{text}
</a>
<div
className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
ref={marqueeRef}
style={{ backgroundColor: marqueeBgColor }} >
<div className="h-full w-fit flex" ref={marqueeInnerRef}>
{[...Array(repetitions)].map((\_, idx) => (
<div className="marquee-part flex items-center flex-shrink-0" key={idx} style={{ color: marqueeTextColor }}>
<span className="whitespace-nowrap uppercase font-normal text-[4vh] leading-[1] px-[1vw]">{text}</span>
<div
className="w-[200px] h-[7vh] my-[2em] mx-[2vw] py-[1em] rounded-[50px] bg-cover bg-center"
style={{ backgroundImage: `url(${image})` }}
/>
</div>
))}
</div>
</div>
</div>
);
};

export default FlowingMenu;
