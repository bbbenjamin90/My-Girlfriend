/* ==========================================================================
   CANVAS PARTICLES PHYSICS ENGINE (Floating Hearts & Stars)
   ========================================================================== */
const canvas = document.getElementById('heartsCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 80;
        this.size = Math.random() * 14 + 6;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = Math.sin(Math.random() * Math.PI) * 0.8;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.hue = Math.random() * 40 + 320; // Soft pink to rose gradient
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.type = Math.random() > 0.35 ? 'heart' : 'star';
    }

    update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.y * 0.01) * 0.5 + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y < -40 || this.x < -40 || this.x > canvas.width + 40) {
            this.reset();
        }
    }

    drawHeart() {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = `hsla(${this.hue}, 100%, 72%, ${this.opacity})`;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size / 10, this.size / 10);
        
        // Bezier Curve Heart Rendering
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-5, -5, -10, 0, 0, 10);
        ctx.bezierCurveTo(10, 0, 5, -5, 0, 0);
        ctx.fill();
        ctx.restore();
    }

    drawStar() {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = `hsla(45, 100%, 75%, ${this.opacity})`;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const spikes = 5;
        const outerRadius = this.size / 1.5;
        const innerRadius = outerRadius / 2;

        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;

        ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(0, -outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    draw() {
        if (this.type === 'heart') {
            this.drawHeart();
        } else {
            this.drawStar();
        }
    }
}

// Particle Physics System Controller
class ParticleSystem {
    constructor(count = 45) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle());
        }
        this.animate = this.animate.bind(this);
        this.animate();
    }

    animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(this.animate);
    }
}

// Spawn Canvas Particle System
window.particleEngine = new ParticleSystem(50);