/* =====================================================
   CUSTOMIZE ME
   The only values you should need to touch are here.
   ===================================================== */
const BIRTHDAY_DATE = "2027-07-30T00:00:00"; // change the surprise's unlock date/time
const BIRTHDAY_NAME  = "Sweetheart";          // change to the person's name

/* =====================================================
   ELEMENT REFERENCES
   ===================================================== */
const constructionPage = document.getElementById("constructionPage");
const birthdayPage     = document.getElementById("birthdayPage");
const unlockDateText   = document.getElementById("unlockDateText");
const birthdayNameEl   = document.getElementById("birthdayName");

const cdDays  = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMins  = document.getElementById("cd-mins");
const cdSecs  = document.getElementById("cd-secs");

let countdownInterval = null;
let hasUnlocked = false;

/* =====================================================
   INIT — apply customizable values to the page
   ===================================================== */
function applyCustomValues() {
  birthdayNameEl.textContent = BIRTHDAY_NAME;

  const d = new Date(BIRTHDAY_DATE);
  const formatted = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  unlockDateText.textContent = formatted;

  // Show the optional anime decoration only if assets/anime-character.png actually exists.
  // Add your own (non-copyrighted) image there and it will appear automatically.
  const decoWrap = document.getElementById("animeDecoration");
  const decoImg = document.getElementById("animeDecorationImg");
  if (decoWrap && decoImg) {
    decoImg.addEventListener("load", () => decoWrap.classList.remove("hidden"));
    decoImg.addEventListener("error", () => decoWrap.classList.add("hidden"));
  }
}

/* =====================================================
   CORE DATE-GATING LOGIC
   ===================================================== */
function checkBirthday() {
  const now = new Date();
  const birthday = new Date(BIRTHDAY_DATE);

  if (now >= birthday) {
    if (!hasUnlocked) unlockBirthdayPage();
  } else {
    updateCountdown(birthday, now);
  }
}

function updateCountdown(birthday, now) {
  const diff = birthday - now;

  if (diff <= 0) {
    unlockBirthdayPage();
    return;
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins  = Math.floor((diff / (1000 * 60)) % 60);
  const secs  = Math.floor((diff / 1000) % 60);

  cdDays.textContent  = String(days).padStart(2, "0");
  cdHours.textContent = String(hours).padStart(2, "0");
  cdMins.textContent  = String(mins).padStart(2, "0");
  cdSecs.textContent  = String(secs).padStart(2, "0");
}

function unlockBirthdayPage() {
  hasUnlocked = true;
  if (countdownInterval) clearInterval(countdownInterval);

  // smooth cross-fade instead of an instant swap
  constructionPage.style.transition = "opacity 0.8s ease";
  constructionPage.style.opacity = "0";

  setTimeout(() => {
    constructionPage.classList.add("hidden");
    birthdayPage.classList.remove("hidden");
    birthdayPage.style.opacity = "0";
    requestAnimationFrame(() => {
      birthdayPage.style.transition = "opacity 1s ease";
      birthdayPage.style.opacity = "1";
    });

    startCelebrationEffects();
  }, 800);
}

/* =====================================================
   CELEBRATION — runs once, when the birthday page reveals
   ===================================================== */
function startCelebrationEffects() {
  launchConfettiBurst();
  typeOutMessage();
  observeSections();
}

/* =====================================================
   TYPING / FADE ANIMATION FOR THE PERSONAL MESSAGE
   ===================================================== */
function typeOutMessage() {
  const el = document.getElementById("personalMessage");
  const fullText = el.getAttribute("data-full-text");
  el.textContent = "";
  let i = 0;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    el.textContent = fullText;
    return;
  }

  function typeChar() {
    if (i < fullText.length) {
      el.textContent += fullText.charAt(i);
      i++;
      setTimeout(typeChar, 18);
    }
  }
  typeChar();
}

/* =====================================================
   SCROLL-TRIGGERED SECTION FADE-IN
   ===================================================== */
function observeSections() {
  const sections = document.querySelectorAll("#birthdayPage .section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.2 }
  );
  sections.forEach((s) => observer.observe(s));
}

/* =====================================================
   SURPRISE BUTTON
   ===================================================== */
const surpriseBtn    = document.getElementById("surpriseBtn");
const surpriseReveal = document.getElementById("surpriseReveal");

surpriseBtn.addEventListener("click", () => {
  surpriseReveal.classList.remove("hidden");
  surpriseBtn.style.display = "none";
  launchConfettiBurst();
  surpriseReveal.scrollIntoView({ behavior: "smooth", block: "center" });
});

/* =====================================================
   MUSIC TOGGLE (requires a user click to satisfy autoplay policies)
   ===================================================== */
const musicToggle = document.getElementById("musicToggle");
const birthdayMusic = document.getElementById("birthdayMusic");
let isPlaying = false;

musicToggle.addEventListener("click", () => {
  if (isPlaying) {
    birthdayMusic.pause();
    musicToggle.classList.remove("playing");
    musicToggle.setAttribute("aria-label", "Play birthday music");
  } else {
    birthdayMusic.play().catch(() => {
      // Replace assets/birthday-music.mp3 with a real audio file for playback to work.
      console.warn("Add a real audio file at assets/birthday-music.mp3 to enable playback.");
    });
    musicToggle.classList.add("playing");
    musicToggle.setAttribute("aria-label", "Pause birthday music");
  }
  isPlaying = !isPlaying;
});

/* =====================================================
   AMBIENT BACKGROUND — sakura petals, hearts, and sparkles
   drifting softly behind both pages.
   ===================================================== */
(function ambientBackground() {
  const canvas = document.getElementById("bgCanvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // keep the particle count light for mobile performance
  const PARTICLE_COUNT = prefersReducedMotion ? 0 : (window.innerWidth < 640 ? 20 : 34);
  const kinds = ["petal", "heart", "sparkle", "petal", "sparkle"];
  const petalColors = ["#ffb3d1", "#f79cc0", "#ffc9df", "#d8c2f0"];

  function makeParticle() {
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    return {
      kind,
      x: Math.random() * width,
      y: Math.random() * height,
      size: kind === "sparkle" ? Math.random() * 3 + 2 : Math.random() * 8 + 6,
      speedY: Math.random() * 0.4 + 0.15,
      drift: (Math.random() - 0.5) * 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 0.6,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      alpha: Math.random() * 0.4 + 0.35,
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(makeParticle());

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHeart(p) {
    const s = p.size * 0.09;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = p.alpha * 0.8;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, 4 * s);
    ctx.bezierCurveTo(-8 * s, -4 * s, -4 * s, -10 * s, 0, -3 * s);
    ctx.bezierCurveTo(4 * s, -10 * s, 8 * s, -4 * s, 0, 4 * s);
    ctx.fill();
    ctx.restore();
  }

  function drawSparkle(p) {
    const flicker = (Math.sin(p.twinkle) + 1) / 2;
    ctx.save();
    ctx.globalAlpha = p.alpha * (0.4 + flicker * 0.6);
    ctx.fillStyle = "#fff8fb";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.y += p.speedY;
      p.sway += p.swaySpeed;
      p.x += p.drift + Math.sin(p.sway) * 0.3;
      p.rotation += p.rotationSpeed;
      p.twinkle += 0.02;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }

      if (p.kind === "petal") drawPetal(p);
      else if (p.kind === "heart") drawHeart(p);
      else drawSparkle(p);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* =====================================================
   CONFETTI / SAKURA CELEBRATION BURST
   ===================================================== */
function launchConfettiBurst() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#ffb3d1", "#f79cc0", "#d8c2f0", "#b48ee0", "#fff8fb"];
  const pieces = [];
  const COUNT = window.innerWidth < 640 ? 60 : 110;

  for (let i = 0; i < COUNT; i++) {
    const isHeart = Math.random() < 0.3;
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      w: Math.random() * 7 + 4,
      h: Math.random() * 10 + 6,
      isHeart,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 2.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  let frame = 0;
  const maxFrames = 220;

  function drawPiece(p) {
    ctx.save();
    ctx.globalAlpha = Math.max(p.opacity, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    if (p.isHeart) {
      const s = p.w * 0.16;
      ctx.beginPath();
      ctx.moveTo(0, 4 * s);
      ctx.bezierCurveTo(-8 * s, -4 * s, -4 * s, -10 * s, 0, -3 * s);
      ctx.bezierCurveTo(4 * s, -10 * s, 8 * s, -4 * s, 0, 4 * s);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let stillAlive = false;
    pieces.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      if (frame > maxFrames * 0.6) p.opacity -= 0.02;

      if (p.opacity > 0) {
        stillAlive = true;
        drawPiece(p);
      }
    });

    if (stillAlive && frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}

window.addEventListener("resize", () => {
  const confettiCanvas = document.getElementById("confettiCanvas");
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

/* =====================================================
   BOOTSTRAP
   ===================================================== */
applyCustomValues();
checkBirthday(); // run once immediately on load
countdownInterval = setInterval(checkBirthday, 1000); // then every second
