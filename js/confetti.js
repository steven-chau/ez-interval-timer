window.TimerApp = window.TimerApp || {};

(function(exports) {
  'use strict';

  var COLORS = [
    '#e94560', '#f39c12', '#f1c40f', '#2ecc71', '#3498db',
    '#9b59b6', '#1abc9c', '#e74c3c', '#f0627a', '#ff6f00'
  ];

  var canvas, ctx, particles, animId;
  var PARTICLE_COUNT = 80; // per cannon

  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:100;pointer-events:none;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }

  function removeCanvas() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    canvas = null;
    ctx = null;
    particles = null;
  }

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function createParticle(x, y, angleMin, angleMax) {
    var angle = (angleMin + Math.random() * (angleMax - angleMin)) * Math.PI / 180;
    var speed = 8 + Math.random() * 14;
    return {
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: -Math.sin(angle) * speed,
      size: 6 + Math.random() * 8,
      color: randomColor(),
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
      life: 1,
      decay: 0.003 + Math.random() * 0.007,
      shape: Math.random() > 0.3 ? 'rect' : 'circle'
    };
  }

  function animate() {
    if (!ctx || !particles) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var alive = false;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (p.life <= 0) continue;

      alive = true;
      p.vy += 0.2; // gravity
      p.vx *= 0.995; // air drag
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;
      p.opacity = Math.max(0, p.life);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (alive) {
      animId = requestAnimationFrame(animate);
    } else {
      animId = null;
      setTimeout(removeCanvas, 500);
    }
  }

  function fire() {
    removeCanvas();
    createCanvas();

    particles = [];

    // Left cannon — fires up-right
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(0, canvas.height, 20, 65));
    }

    // Right cannon — fires up-left
    for (var j = 0; j < PARTICLE_COUNT; j++) {
      particles.push(createParticle(canvas.width, canvas.height, 115, 160));
    }

    animId = requestAnimationFrame(animate);
  }

  function stop() {
    removeCanvas();
  }

  exports.Confetti = {
    fire: fire,
    stop: stop
  };

})(window.TimerApp);
