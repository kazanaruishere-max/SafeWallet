# SafeWallet v2: Premium Landing Page Concept
## Awwwards-Level 3D Visual Storytelling

**Philosophy:** Setiap pixel bercerita. Setiap scroll adalah chapter. 3D elements sebagai narrator visual yang konsisten dari hero hingga footer.

---

## Technical Foundation

### Core Stack
```typescript
// Animation & 3D
- GSAP 3.12+ (ScrollTrigger, ScrollSmoother, SplitText)
- Lenis 1.0+ (Smooth scroll dengan momentum physics)
- Three.js r160+ (WebGL 3D scenes)
- GLSL Shaders (Custom particle systems)

// Performance
- @react-three/fiber (React Three.js wrapper)
- @react-three/drei (Helper components)
- @react-three/postprocessing (Bloom, DOF effects)

// Interaction
- locomotive-scroll (Alternative smooth scroll)
- split-type (Advanced text splitting)
```

### 3D Visual Continuity Concept

**The Vault Guardian** - Karakter 3D geometric yang evolve sepanjang scroll:

```
Hero (0%)        → Geometric sphere (locked)
Section 2 (20%)  → Sphere transforms to cube (analyzing)
Section 3 (40%)  → Cube unfolds to shield (protecting)
Section 4 (60%)  → Shield morphs to network (connecting)
Section 5 (80%)  → Network crystallizes to fortress (secured)
Footer (100%)    → Fortress glows golden (mission complete)
```

---

## Section-by-Section Breakdown

### 🎬 SECTION 1: HERO - "The Awakening"

**Visual Concept:**
- Full-screen 3D geometric sphere (800x800px) di center
- Sphere terbuat dari 10,000+ particles emas yang breathe
- Background: Deep gradient (navy → black) dengan subtle grain texture
- Typography: Ultra-large (180px) split by characters untuk reveal animation

**3D Element:**
```typescript
// Particle Sphere (Three.js)
const geometry = new THREE.SphereGeometry(4, 128, 128);
const particles = 10000;

// Custom shader untuk breathing effect
const vertexShader = `
  uniform float uTime;
  varying vec3 vPosition;
  
  void main() {
    vPosition = position;
    vec3 pos = position;
    
    // Breathing animation (expand/contract)
    float breath = sin(uTime * 0.5) * 0.15;
    pos *= (1.0 + breath);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.0;
  }
`;
```

**GSAP Animation Flow:**
```javascript
// 1. Initial load animation
const tl = gsap.timeline();

tl.from('.hero__title-char', {
  yPercent: 120,
  rotateX: -90,
  opacity: 0,
  stagger: 0.02,
  duration: 1.2,
  ease: 'expo.out'
})
.from('.hero__subtitle', {
  y: 40,
  opacity: 0,
  duration: 1,
  ease: 'power3.out'
}, '-=0.8')
.from('.hero__cta', {
  scale: 0.8,
  opacity: 0,
  duration: 0.8,
  ease: 'back.out(1.7)'
}, '-=0.6');

// 2. Scroll-triggered sphere transformation
ScrollTrigger.create({
  trigger: '.hero',
  start: 'top top',
  end: 'bottom top',
  scrub: 1,
  onUpdate: (self) => {
    // Rotate sphere based on scroll progress
    sphere.rotation.y = self.progress * Math.PI * 2;
    
    // Particle size increases as user scrolls
    particleMaterial.uniforms.uSize.value = 2 + (self.progress * 3);
  }
});
```

**Typography Reveal:**
```typescript
// SplitText animation untuk premium feel
const split = new SplitType('.hero__title', { 
  types: 'chars, words',
  tagName: 'span'
});

// Magnetic cursor effect pada CTA button
const button = document.querySelector('.hero__cta');
button.addEventListener('mousemove', (e) => {
  const rect = button.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  
  gsap.to(button, {
    x: x * 0.3,
    y: y * 0.3,
    duration: 0.3,
    ease: 'power2.out'
  });
});
```

**Scroll Indicator:**
- Animated chevron yang pulse
- Text "Scroll to explore" dengan fade in/out
- Disappears after 2 seconds atau first scroll

---

### 🔒 SECTION 2: PROBLEM STATEMENT - "The Threat"

**Visual Concept:**
- Sphere dari hero mulai **deform** menjadi chaotic particles
- Particles scatter dengan velocity berbeda (simulasi data breach)
- Background darkens (navy → deep red gradient)
- Statistics counter dengan bleeding effect

**3D Transformation:**
```javascript
// Sphere to chaos transition
ScrollTrigger.create({
  trigger: '.problem',
  start: 'top center',
  end: 'center center',
  scrub: 1,
  onUpdate: (self) => {
    // Particles scatter dari center
    particles.forEach((particle, i) => {
      const angle = (i / particles.length) * Math.PI * 2;
      const radius = self.progress * 5; // Scatter radius
      
      particle.position.x = Math.cos(angle) * radius;
      particle.position.y = Math.sin(angle) * radius;
      particle.position.z = (Math.random() - 0.5) * radius;
    });
    
    // Color shift: gold → red
    particleMaterial.color.lerp(new THREE.Color(0xff0000), self.progress);
  }
});
```

**Statistics Animation:**
```javascript
// Counting animation dengan Odometer effect
const stats = [
  { target: 70, suffix: '%', label: 'No Emergency Fund' },
  { target: 100, suffix: 'B', label: 'Lost to Scams (Rp)' },
  { target: 41, suffix: '%', label: 'Hidden APR' }
];

stats.forEach(stat => {
  ScrollTrigger.create({
    trigger: '.stat',
    start: 'top 80%',
    onEnter: () => {
      gsap.to(stat, {
        current: stat.target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: function() {
          // Update DOM dengan formatted number
          updateCounter(this.targets()[0].current);
        }
      });
    }
  });
});
```

**Background Effect:**
```css
/* Animated grain texture */
.problem {
  background: 
    linear-gradient(180deg, #0a0a1a 0%, #2a0a0a 100%),
    url('data:image/svg+xml,...') /* Noise texture */;
  background-blend-mode: overlay;
  animation: grain 8s steps(10) infinite;
}

@keyframes grain {
  0%, 100% { background-position: 0 0; }
  10% { background-position: -5% -10%; }
  /* ... more steps for organic grain movement */
}
```

---

### 🛡️ SECTION 3: SOLUTION - "The Shield Awakens"

**Visual Concept:**
- Chaotic particles **re-converge** membentuk geometric shield
- Shield rotates slowly (gyroscope effect)
- Hexagonal grid pattern emerges dari center shield
- Typography appears dengan slice reveal animation

**3D Shield Formation:**
```javascript
// Particles reform ke shield geometry
const shieldGeometry = new THREE.ShapeGeometry(shieldShape);
const shieldPoints = shieldGeometry.attributes.position;

ScrollTrigger.create({
  trigger: '.solution',
  start: 'top center',
  end: 'center center',
  scrub: 1,
  onUpdate: (self) => {
    particles.forEach((particle, i) => {
      const targetPos = shieldPoints.array[i * 3];
      
      // Lerp dari posisi chaos ke posisi shield
      particle.position.x = THREE.MathUtils.lerp(
        particle.position.x,
        targetPos.x,
        self.progress
      );
      
      // Add rotation untuk dramatic effect
      particle.rotation.z = self.progress * Math.PI * 2;
    });
    
    // Color: red → gold
    particleMaterial.color.lerp(new THREE.Color(0xF2A971), self.progress);
  }
});
```

**Hexagonal Grid Reveal:**
```javascript
// SVG hexagonal pattern dengan mask animation
const hexagons = document.querySelectorAll('.hex-grid__cell');

ScrollTrigger.create({
  trigger: '.solution__grid',
  start: 'top 70%',
  onEnter: () => {
    gsap.from(hexagons, {
      scale: 0,
      opacity: 0,
      stagger: {
        amount: 1.5,
        from: 'center', // Expand dari center
        grid: 'auto'
      },
      ease: 'back.out(1.7)'
    });
  }
});
```

**Typography Slice Reveal:**
```javascript
// Text reveal dengan clip-path animation
const titleClip = gsap.timeline({
  scrollTrigger: {
    trigger: '.solution__title',
    start: 'top 80%',
  }
});

titleClip.from('.solution__title', {
  clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', // Collapsed
  duration: 1.2,
  ease: 'expo.inOut'
})
.to('.solution__title', {
  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', // Expanded
  duration: 1.2,
  ease: 'expo.inOut'
}, '-=0.8');
```

---

### ⚡ SECTION 4: FEATURES - "The Trinity"

**Visual Concept:**
- Shield **unfolds** menjadi 3 pieces (trifold animation)
- Each piece transforms jadi feature card dengan 3D depth
- Cards float dengan parallax depth berbeda
- Hover effect: Card tilts dengan realistic shadow

**3D Unfold Animation:**
```javascript
// Shield breaks menjadi 3 geometric pieces
const pieces = [
  { id: 'health', rotation: -20, position: { x: -4, y: 2 } },
  { id: 'scam', rotation: 0, position: { x: 0, y: 0 } },
  { id: 'coach', rotation: 20, position: { x: 4, y: 2 } }
];

ScrollTrigger.create({
  trigger: '.features',
  start: 'top center',
  end: 'center center',
  scrub: 1,
  onUpdate: (self) => {
    pieces.forEach((piece, i) => {
      const mesh = scene.getObjectByName(piece.id);
      
      // Position
      mesh.position.x = piece.position.x * self.progress;
      mesh.position.y = piece.position.y * self.progress;
      
      // Rotation
      mesh.rotation.z = THREE.MathUtils.degToRad(piece.rotation * self.progress);
      
      // Scale slightly for emphasis
      mesh.scale.setScalar(1 + (self.progress * 0.2));
    });
  }
});
```

**Feature Cards 3D Tilt:**
```javascript
// Realistic 3D tilt on hover (VanillaTilt.js alternative)
const cards = document.querySelectorAll('.feature-card');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10; // Max 10deg
    const rotateY = (centerX - x) / 10;
    
    gsap.to(card, {
      rotationX: rotateX,
      rotationY: rotateY,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000
    });
    
    // Update box-shadow untuk depth
    const shadowX = (x - centerX) / 10;
    const shadowY = (y - centerY) / 10;
    card.style.boxShadow = `${shadowX}px ${shadowY}px 40px rgba(242, 169, 113, 0.3)`;
  });
  
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
    card.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
  });
});
```

**Parallax Depth:**
```javascript
// Multi-layer parallax untuk depth perception
const layers = [
  { selector: '.features__bg', speed: 0.3 },
  { selector: '.feature-card', speed: 0.6 },
  { selector: '.features__glow', speed: 0.9 }
];

layers.forEach(layer => {
  gsap.to(layer.selector, {
    y: () => -window.innerHeight * layer.speed,
    ease: 'none',
    scrollTrigger: {
      trigger: '.features',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    }
  });
});
```

---

### 🌐 SECTION 5: TECHNOLOGY - "The Fortress"

**Visual Concept:**
- 3 feature pieces **merge back** membentuk fortress/vault
- Fortress berputar 360° dengan wireframe aesthetic
- Technical specs appear sebagai holographic labels
- Matrix rain effect di background (The Matrix style)

**3D Fortress Assembly:**
```javascript
// Pieces re-merge dengan complex animation path
ScrollTrigger.create({
  trigger: '.technology',
  start: 'top center',
  end: 'center center',
  scrub: 1,
  onUpdate: (self) => {
    pieces.forEach((piece, i) => {
      const mesh = scene.getObjectByName(piece.id);
      
      // Return to center dengan easing
      const progress = self.progress;
      mesh.position.x *= (1 - progress);
      mesh.position.y *= (1 - progress);
      mesh.rotation.z *= (1 - progress);
      
      // Opacity fade untuk merge effect
      mesh.material.opacity = 1 - (progress * 0.5);
    });
    
    // Reveal fortress mesh
    fortressMesh.material.opacity = self.progress;
    fortressMesh.rotation.y = self.progress * Math.PI * 2;
  }
});
```

**Wireframe Aesthetic:**
```javascript
// Custom wireframe shader dengan glow
const wireframeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uGlowColor: { value: new THREE.Color(0xF2A971) }
  },
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uGlowColor;
    varying vec3 vPosition;
    
    void main() {
      // Edge detection untuk wireframe glow
      float edge = length(fwidth(vPosition));
      float glow = 1.0 - smoothstep(0.0, 0.02, edge);
      
      vec3 color = uGlowColor * glow;
      gl_FragColor = vec4(color, glow);
    }
  `,
  wireframe: true,
  transparent: true
});
```

**Matrix Rain Background:**
```javascript
// Digital rain effect (optimized Canvas2D)
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const columns = Math.floor(canvas.width / 20);
const drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#0F0';
  ctx.font = '15px monospace';
  
  drops.forEach((y, i) => {
    const text = Math.random() > 0.5 ? '1' : '0';
    const x = i * 20;
    ctx.fillText(text, x, y * 20);
    
    if (y * 20 > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  });
}

gsap.ticker.add(drawMatrix);
```

---

### 💎 SECTION 6: TESTIMONIALS - "The Proof"

**Visual Concept:**
- Infinite horizontal carousel dengan momentum physics
- Each testimonial card = floating glass card dengan blur
- Avatar photos dengan liquid morph transition
- Star ratings animate dengan SVG path animation

**Infinite Carousel:**
```javascript
// Draggable infinite carousel dengan Lenis momentum
const carousel = document.querySelector('.testimonials__carousel');
let isDragging = false;
let startX, scrollLeft;

// Duplicate items untuk seamless loop
const items = [...carousel.children];
items.forEach(item => {
  carousel.appendChild(item.cloneNode(true));
});

carousel.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.pageX - carousel.offsetLeft;
  scrollLeft = carousel.scrollLeft;
});

carousel.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const x = e.pageX - carousel.offsetLeft;
  const walk = (x - startX) * 2; // Scroll speed multiplier
  carousel.scrollLeft = scrollLeft - walk;
  
  // Infinite loop logic
  if (carousel.scrollLeft <= 0) {
    carousel.scrollLeft = carousel.scrollWidth / 2;
  }
  if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
    carousel.scrollLeft = 0;
  }
});

// Auto-scroll dengan GSAP
gsap.to(carousel, {
  scrollLeft: '+=1000',
  duration: 20,
  ease: 'none',
  repeat: -1,
  modifiers: {
    scrollLeft: gsap.utils.unitize(value => {
      return value % (carousel.scrollWidth / 2);
    })
  }
});
```

**Glass Morphism Cards:**
```css
.testimonial-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  /* Gradient border effect */
  position: relative;
}

.testimonial-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, 
    rgba(242, 169, 113, 0.5), 
    transparent 50%, 
    rgba(242, 169, 113, 0.2));
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
}
```

**Avatar Liquid Morph:**
```javascript
// SVG morphing animation untuk avatar transitions
const avatars = document.querySelectorAll('.testimonial__avatar');

avatars.forEach(avatar => {
  const blob = avatar.querySelector('.blob-shape');
  
  gsap.to(blob, {
    morphSVG: {
      shape: 'M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10',
      // Multiple morph targets untuk organic feel
      type: 'rotational'
    },
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
});
```

---

### 🚀 SECTION 7: CTA - "The Gateway"

**Visual Concept:**
- Full-screen immersive CTA
- Fortress dari section sebelumnya **opens** seperti portal
- Particles flow INTO the portal (invitation metaphor)
- Button dengan liquid hover effect dan ripple animation

**Portal Opening:**
```javascript
ScrollTrigger.create({
  trigger: '.cta',
  start: 'top center',
  end: 'center center',
  scrub: 1,
  onUpdate: (self) => {
    // Fortress splits open
    fortressLeft.position.x = -5 * self.progress;
    fortressRight.position.x = 5 * self.progress;
    
    // Reveal bright light dari inside
    portalLight.intensity = self.progress * 5;
    
    // Camera dolly forward
    camera.position.z = 10 - (self.progress * 5);
  }
});
```

**Particle Flow:**
```javascript
// Particles attracted to portal center
const portalCenter = new THREE.Vector3(0, 0, 0);

function animateParticleFlow() {
  particles.forEach(particle => {
    const direction = portalCenter.clone().sub(particle.position);
    direction.normalize();
    
    // Apply force toward portal
    particle.velocity.add(direction.multiplyScalar(0.01));
    particle.position.add(particle.velocity);
    
    // Reset particle when reaches center
    if (particle.position.distanceTo(portalCenter) < 0.5) {
      particle.position.set(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      );
      particle.velocity.set(0, 0, 0);
    }
  });
}

gsap.ticker.add(animateParticleFlow);
```

**Liquid Button:**
```javascript
// SVG liquid distortion pada hover
const button = document.querySelector('.cta__button');
const liquidPath = button.querySelector('.liquid-path');

button.addEventListener('mouseenter', () => {
  gsap.to(liquidPath, {
    attr: {
      d: 'M0,50 Q50,0 100,50 T200,50' // Wave shape
    },
    duration: 0.6,
    ease: 'elastic.out(1, 0.3)'
  });
});

button.addEventListener('mouseleave', () => {
  gsap.to(liquidPath, {
    attr: {
      d: 'M0,50 L200,50' // Flat
    },
    duration: 0.4,
    ease: 'power2.inOut'
  });
});

// Ripple effect on click
button.addEventListener('click', (e) => {
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  button.appendChild(ripple);
  
  gsap.from(ripple, {
    scale: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: () => ripple.remove()
  });
});
```

---

### 🌟 SECTION 8: FOOTER - "The Constellation"

**Visual Concept:**
- Fortress transforms jadi constellation/network
- Each navigation link = star node
- Lines connect between nodes dengan pulse animation
- Background: Deep space dengan parallax stars

**Constellation Network:**
```javascript
// Convert fortress mesh to node network
const nodes = [
  { id: 'about', position: { x: -3, y: 2 } },
  { id: 'features', position: { x: 0, y: 3 } },
  { id: 'pricing', position: { x: 3, y: 2 } },
  { id: 'contact', position: { x: 0, y: -2 } }
];

// Create connections
const connections = [
  ['about', 'features'],
  ['features', 'pricing'],
  ['pricing', 'contact'],
  ['contact', 'about']
];

connections.forEach(([from, to]) => {
  const line = createGlowingLine(
    nodes.find(n => n.id === from).position,
    nodes.find(n => n.id === to).position
  );
  
  // Pulse animation
  gsap.to(line.material, {
    opacity: 0.3,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
});
```

**Parallax Stars:**
```javascript
// Multi-layer star field
const starLayers = [
  { count: 200, speed: 0.1, size: 1 },
  { count: 100, speed: 0.3, size: 2 },
  { count: 50, speed: 0.5, size: 3 }
];

starLayers.forEach(layer => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(layer.count * 3);
  
  for (let i = 0; i < layer.count; i++) {
    positions[i * 3] = Math.random() * 2000 - 1000;
    positions[i * 3 + 1] = Math.random() * 2000 - 1000;
    positions[i * 3 + 2] = Math.random() * 2000 - 1000;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // Scroll parallax
  gsap.to(geometry.attributes.position.array, {
    scrollTrigger: {
      trigger: '.footer',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        for (let i = 0; i < positions.length; i += 3) {
          geometry.attributes.position.array[i + 2] += layer.speed * self.direction;
        }
        geometry.attributes.position.needsUpdate = true;
      }
    }
  });
});
```

---

## Premium Micro-Interactions

### 1. Cursor Trailer
```javascript
// Custom cursor dengan gradient trail
const cursor = document.querySelector('.cursor');
const cursorTrail = [];

for (let i = 0; i < 20; i++) {
  const trail = document.createElement('div');
  trail.classList.add('cursor-trail');
  document.body.appendChild(trail);
  cursorTrail.push(trail);
}

let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  gsap.to(cursor, {
    x: mouseX,
    y: mouseY,
    duration: 0.1
  });
  
  // Trail follows dengan delay
  cursorTrail.forEach((trail, i) => {
    gsap.to(trail, {
      x: mouseX,
      y: mouseY,
      duration: 0.3 + (i * 0.02),
      ease: 'power2.out'
    });
  });
});
```

### 2. Magnetic Elements
```javascript
// Magnetic pull effect untuk interactive elements
const magneticElements = document.querySelectorAll('.magnetic');

magneticElements.forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 100;
    
    if (distance < maxDistance) {
      const strength = 1 - (distance / maxDistance);
      
      gsap.to(el, {
        x: x * strength * 0.5,
        y: y * strength * 0.5,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  });
});
```

### 3. Text Reveal on Scroll
```javascript
// Sophisticated text reveal dengan clip-path
const revealTexts = document.querySelectorAll('.reveal-text');

revealTexts.forEach(text => {
  const chars = new SplitType(text, { types: 'chars' });
  
  gsap.from(chars.chars, {
    scrollTrigger: {
      trigger: text,
      start: 'top 80%',
    },
    yPercent: 100,
    opacity: 0,
    rotateX: -90,
    stagger: 0.02,
    duration: 0.8,
    ease: 'back.out(1.7)'
  });
});
```

### 4. Scroll Progress Indicator
```javascript
// Circular progress indicator
const progressRing = document.querySelector('.progress-ring__circle');
const radius = progressRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
progressRing.style.strokeDashoffset = circumference;

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = scrollTop / docHeight;
  
  const offset = circumference - (scrollPercent * circumference);
  progressRing.style.strokeDashoffset = offset;
});
```

---

## Performance Optimization

### 1. Three.js Performance
```javascript
// Adaptive quality based on FPS
const stats = new Stats();
let currentQuality = 'high';

function checkPerformance() {
  const fps = stats.getFPS();
  
  if (fps < 30 && currentQuality !== 'low') {
    // Reduce particle count
    particleCount = Math.floor(particleCount * 0.5);
    
    // Disable expensive effects
    bloomPass.enabled = false;
    
    currentQuality = 'low';
  }
}

gsap.ticker.add(checkPerformance);
```

### 2. Lazy Loading 3D Scenes
```javascript
// Load heavy 3D scenes only when visible
const lazyScenes = document.querySelectorAll('.lazy-scene');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.loaded) {
      const sceneId = entry.target.dataset.scene;
      loadScene(sceneId);
      entry.target.loaded = true;
    }
  });
}, { threshold: 0.1 });

lazyScenes.forEach(scene => observer.observe(scene));
```

### 3. Debounced Resize Handler
```javascript
// Prevent resize event spam
const handleResize = gsap.utils.debounce(() => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  ScrollTrigger.refresh();
}, 250);

window.addEventListener('resize', handleResize);
```

---

## CSS Architecture

### Design Tokens
```css
:root {
  /* Colors */
  --color-primary: #F2A971;
  --color-bg-dark: #0a0a1a;
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.7);
  
  /* Typography */
  --font-display: 'Clash Display', sans-serif;
  --font-body: 'General Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --space-unit: 8px;
  --space-xs: calc(var(--space-unit) * 2);
  --space-sm: calc(var(--space-unit) * 3);
  --space-md: calc(var(--space-unit) * 5);
  --space-lg: calc(var(--space-unit) * 8);
  --space-xl: calc(var(--space-unit) * 13);
  
  /* Effects */
  --blur-glass: blur(20px);
  --shadow-elevation-1: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-elevation-2: 0 8px 32px rgba(0, 0, 0, 0.2);
  --shadow-elevation-3: 0 16px 64px rgba(0, 0, 0, 0.3);
}
```

### Premium Glassmorphism
```css
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: var(--blur-glass) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-elevation-3);
  
  /* Gradient border */
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      135deg,
      var(--color-primary),
      transparent
    );
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
}
```

---

## File Structure
```
src/
├── components/
│   ├── 3d/
│   │   ├── ParticleSphere.tsx
│   │   ├── ShieldMesh.tsx
│   │   ├── FortressModel.tsx
│   │   └── PortalEffect.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Problem.tsx
│   │   ├── Solution.tsx
│   │   ├── Features.tsx
│   │   ├── Technology.tsx
│   │   ├── Testimonials.tsx
│   │   ├── CTA.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Cursor.tsx
├── lib/
│   ├── animations/
│   │   ├── scroll-animations.ts
│   │   ├── text-reveals.ts
│   │   └── particle-systems.ts
│   ├── three/
│   │   ├── scene-manager.ts
│   │   ├── shader-materials.ts
│   │   └── performance-monitor.ts
│   └── utils/
│       ├── lerp.ts
│       └── viewport.ts
├── shaders/
│   ├── particle.vert
│   ├── particle.frag
│   ├── wireframe.vert
│   └── wireframe.frag
└── styles/
    ├── globals.css
    ├── animations.css
    └── typography.css
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Setup Next.js 15 + TypeScript
- [ ] Install GSAP + Lenis + Three.js
- [ ] Create base layout + smooth scroll
- [ ] Implement custom cursor
- [ ] Design token system

### Phase 2: 3D Core (Week 2)
- [ ] Particle sphere implementation
- [ ] Shield geometry creation
- [ ] Fortress model integration
- [ ] Shader material setup
- [ ] Performance monitoring

### Phase 3: Sections (Week 3-4)
- [ ] Hero section + animations
- [ ] Problem section + particle chaos
- [ ] Solution section + shield reform
- [ ] Features section + 3D unfold
- [ ] Technology section + wireframe
- [ ] Testimonials carousel
- [ ] CTA portal effect
- [ ] Footer constellation

### Phase 4: Polish (Week 5)
- [ ] Micro-interactions
- [ ] Loading screen
- [ ] Responsive optimization
- [ ] Accessibility (ARIA labels)
- [ ] Performance audit
- [ ] Cross-browser testing

### Phase 5: Launch (Week 6)
- [ ] SEO optimization
- [ ] Analytics integration
- [ ] Deploy to Vercel
- [ ] Submit to Awwwards

---

## Awwwards Submission Strategy

**Category:** Site of the Day  
**Tags:** #WebGL #GSAP #3D #FinTech #Premium

**Jury Appeal Points:**
1. ✅ Technical Excellence: Custom shaders + advanced GSAP
2. ✅ Innovation: 3D visual continuity throughout scroll
3. ✅ Storytelling: Each section = narrative chapter
4. ✅ Performance: 60 FPS despite heavy 3D
5. ✅ Originality: Zero templates, 100% custom code

**Submission Assets:**
- 4K screen recording (60fps)
- Mobile responsive demo
- Code breakdown article
- Behind-the-scenes process

---

**Status:** Ready for Implementation ✅  
**Complexity:** Enterprise-level  
**Timeline:** 6 weeks  
**Awwwards Potential:** 8.5/10
