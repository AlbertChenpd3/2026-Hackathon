var enabled = true;
var interval;
chrome.storage.sync.get(["enabled"], (result) => {
    enabled = result.enabled;
    if (enabled) interval = setInterval(update, 100);
    overlay.style.visibility = enabled ? "visible" : "hidden";
    if (canvas) canvas.style.visibility = overlay.style.visibility;
});


const overlay = document.createElement("div");
overlay.style.visibility = "hidden";
overlay.style.position = "fixed";
overlay.style.top = "0px";
overlay.style.left = "0px";
overlay.style.zIndex = "10000";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.userSelect = "none";
overlay.style.pointerEvents = "none";
overlay.style.mixBlendMode = "hard-light";
overlay.style.color = "white";
overlay.style.opacity = "0";
overlay.style.lineHeight = 1;
overlay.style.fontSize = 200/128 + "vh";

document.addEventListener("DOMContentLoaded", function() { 
    document.querySelector("body").insertAdjacentElement("beforeend", overlay);
});

var update = ()=>{
    //overlay.style.filter = `hue-rotate(${Date.now()/100%360}deg)`
}
update();

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'enabled') {
            enabled = newValue;
            overlay.style.visibility = enabled ? "visible" : "hidden";
            if (canvas) canvas.style.visibility = overlay.style.visibility;
            if (enabled) interval = setInterval(update, 100);
            else clearInterval(interval);
        }
        r[key] = newValue;
        if (key === 'curr' || key === 'goal') {
          overlay.style.backgroundImage = `linear-gradient(to right, ${colorToColor(moodToColor(r.curr), 50)} , ${colorToColor(moodToColor(r.curr), 15)} 15%, ${colorToColor(moodToColor(r.goal), 15)} 85%, ${colorToColor(moodToColor(r.goal), 50)})`;
        }
    }
});

var r = {};
chrome.storage.sync.get(["curr", "goal", "opacity", "opacity2", "direction"], (result) => {
    r = result;
    overlay.style.backgroundImage = `linear-gradient(to right, ${colorToColor(moodToColor(r.curr), 50)} , ${colorToColor(moodToColor(r.curr), 15)} 15%, ${colorToColor(moodToColor(r.goal), 15)} 85%, ${colorToColor(moodToColor(r.goal), 50)})`;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "AUDIO_DATA") return;

  const data = msg.data;

  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const intensity = Math.max(...data) / 255;//avg / 255;

  if (!canvas) createCanvas();
  canvas.style.opacity = "" + r.opacity2 / 100;
  overlay.style.opacity = "" + r.opacity * intensity / 100;
  draw(intensity, data, r.curr, r.goal);

  var out = "";
  for (var i = 0; i < data.length; i += 2) {
    for (var j = 0; j < data[i]**2/255 / 10; j++) out += "‒";
    out += "<br>";
  }
  overlay.innerHTML = out;
});

// ----

  console.log("Content: script loaded");

  let currentMood = "Happy";
  let goalMood = "Calm";
  let canvas, ctx;
  let blobs = [];
  const BLOB_COUNT = 30;
  let width, height;
  let animationFrame;

  function initBlobs() {
    blobs = [];
    for (let i = 0; i < BLOB_COUNT; i++) {
      blobs.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        radius: 0.05 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }
    console.log("Content: blobs initialized");
  }

  function createCanvas() {
    if (document.getElementById("music-visualizer-canvas")) {
      console.log("Content: canvas already exists");
      return;
    }
    canvas = document.createElement("canvas");
    canvas.id = "music-visualizer-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "999999";
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = "0.85";
    canvas.style.mixBlendMode = "screen";
    document.body.appendChild(canvas);
    resizeCanvas();
    ctx = canvas.getContext("2d"); // <-- THIS WAS MISSING
    window.addEventListener('resize', resizeCanvas);
    initBlobs();
    console.log("Content: canvas created and appended");
  }

  function resizeCanvas() {
    if (!canvas) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    console.log("Content: canvas resized to", width, height);
  }

  function moodToColor(mood) {
    const map = {
      Calm: { h: 200, s: 80, l: 60 },
      Energized: { h: 10, s: 90, l: 60 },
      Inspired: { h: 280, s: 80, l: 65 },
      Balanced: { h: 120, s: 70, l: 55 },
      Happy: { h: 50, s: 90, l: 65 },
      Relaxed: { h: 150, s: 70, l: 60 },
      Anxious: { h: 30, s: 80, l: 55 },
      Sad: { h: 210, s: 70, l: 50 },
      Tired: { h: 270, s: 50, l: 45 }
    };
    return map[mood] || map.Calm;
  }

  function colorToColor(color, opacity) {
    return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${opacity/100})`;
  }

  function drawBlob(x, y, radius, hue, sat, light, volFactor) {
    try {
      const grad = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
      const alpha = ((-4*volFactor*(volFactor - 1))**2 * .3 * 100) * 0.01;
      grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light + (100 - light) / 2}%, ${alpha})`);
      grad.addColorStop((-4*volFactor*(volFactor - 1))**2*(.5**.5), `hsla(${hue}, ${sat}%, ${light}%, ${alpha * 0.2})`);
      grad.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0)`);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    } catch (e) {
      console.error("Content: drawBlob error:", e.message);
    }
  }

  function draw(volume, data, currentMoodVal, goalMoodVal) {
    if (!ctx) {
      console.warn("Content: draw called but ctx is null");
      return;
    }
    if (!canvas) {
      console.warn("Content: draw called but canvas is null");
      return;
    }

    currentMood = currentMoodVal || currentMood;
    goalMood = goalMoodVal || goalMood;

    try {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, width, height);

      const volFactor = Math.min(volume / 255, 1.0);
      const goalColor = moodToColor(goalMood);
      const currentColor = moodToColor(currentMood);

      blobs.forEach((blob, i) => {
        blob.vx += (Math.random() - 0.5) * 0.002 + (Math.random() - 0.5) * (data[i*4]/255)**2 * 0.01;
        blob.vy += (Math.random() - 0.5) * 0.002 + (Math.random() - 0.5) * (data[i*4]/255)**2 * 0.01;
        blob.vx *= 0.99;
        blob.vy *= 0.99;
        if (r.direction === 'static' || r.direction === 'vert') blob.vx = 0;
        if (r.direction === 'static' || r.direction === 'horiz') blob.vy = 0;
        else if (r.direction === 'diag') blob.vy = blob.vx;// * (blob.vy > 0 ? 1 : -1);
        blob.x += blob.vx / 5;
        blob.y += blob.vy / 5;

        if (blob.x < -0.1) blob.x = 1.1;
        if (blob.x > 1.1) blob.x = -0.1;
        if (blob.y < -0.1) blob.y = 1.1;
        if (blob.y > 1.1) blob.y = -0.1;

        const baseRadius = Math.min(width, height) * (data[i*4]/255)**2 * 3 * 0.1;
        const pulse = Math.sin(performance.now() * 0.005 + blob.phase) * 0.1 + 1;
        const radius = baseRadius * pulse;
        const screenX = blob.x * width;
        const screenY = blob.y * height;

        const mix = (i / (BLOB_COUNT - 1));
        const minhue = Math.min(goalColor.h, currentColor.h);
        const maxhue = Math.max(goalColor.h, currentColor.h);
        const hue = maxhue - minhue < minhue + 360 - maxhue ? (goalColor.h * (1 - mix) + currentColor.h * mix) % 360 : goalColor.h === minhue ? ((goalColor.h + 360) * (1 - mix) + currentColor.h * mix) % 360 : (goalColor.h * (1 - mix) + (currentColor.h + 360) * mix) % 360;
        const sat = goalColor.s * (1 - mix) + currentColor.s * mix;
        const light = goalColor.l * (1 - mix) + currentColor.l * mix;

        drawBlob(screenX, screenY, radius, hue, sat, light, (data[i*4]/255));

        if (!data[i*4] || !radius) blobs[i] = {
          x: Math.random(),
          y: Math.random(),
          vx: (Math.random() - 0.5) * 0.02,
          vy: (Math.random() - 0.5) * 0.02,
          radius: 0.05 + Math.random() * 0.1,
          phase: Math.random() * Math.PI * 2
        };
      });
    } catch (e) {
      console.error("Content: draw error:", e);
    }
  }

  function animate() {
    animationFrame = requestAnimationFrame(animate);
  }
  animate();

  console.log("Content: message listener registered");
