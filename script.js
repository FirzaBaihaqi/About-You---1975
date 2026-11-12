/**
 * ============================================================================
 * ⚙️ PENGATURAN LAGU & WAKTU MULAI (HANYA DIUBAH LEWAT KODE INI)
 * ============================================================================
 */
const CONFIG = {
  // Pilih sumber lagu:
  // - 'auto'    : Otomatis memutar file audio lokal (about_you.webm / about_you.mp3)
  //               agar suara 100% keluar tanpa server, atau YouTube jika file tidak ada
  // - 'youtube' : Mengambil dari YouTube
  // - 'local'   : Menggunakan file audio lokal di folder yang sama
  defaultSource: 'auto',

  // Link penuh YouTube atau ID videonya
  youtubeUrlOrId: 'https://youtu.be/tGv7CUutzqU?si=uQxYUhSISOSD2Sga',

  // Daftar file audio lokal di folder yang sama (otomatis dicoba berurutan)
  localAudioFiles: ['about_you.webm', 'about_you.mp3', 'about_you.m4a'],

  // Menit & detik mulai lagu agar pas dengan lirik
  // (Bagian Carly Holt "There was something about you..." mulai di 3 menit 1.86 detik)
  startMinutes: 3,
  startSeconds: 1.86,

  // Durasi bagian lirik sampai selesai sebelum muncul pesan penutup (dalam detik)
  segmentDuration: 62.5,

  // Tulisan sapaan setelah buka amplop sebelum lagu mulai
  introMessage: 'selamat mendengarkan cantik..',

  // Lama jeda tulisan sapaan tampil sebelum lagu mulai (dalam milidetik)
  introDurationMs: 2400,

  // Kata-kata penutup setelah lagu selesai
  finaleMessage: 'Semangatt ya Cantik'
};

/**
 * ============================================================================
 * TIMELINE LIRIK KARAOKE (SINKRON DENGAN VOKAL ASLI)
 * ============================================================================
 */
const KARAOKE_TIMELINE = [
  {
    start: 2.74,
    parts: [
      ["There was ", 0.35],
      ["something ", 0.40],
      ["about ", 0.35],
      ["yo", 0.15],
      ["u ", 0.70],
      ["that now ", 0.35],
      ["I can't ", 0.35],
      ["re", 0.30],
      ["mem", 0.75],
      ["ber", 0.60]
    ]
  },
  {
    start: 7.65,
    parts: [
      ["It's the same damn ", 0.85],
      ["thing ", 0.65],
      ["that made my ", 0.40],
      ["heart ", 0.45],
      ["sur", 0.25],
      ["ren", 0.85],
      ["der", 0.60]
    ]
  },
  {
    start: 12.65,
    parts: [
      ["And I'll miss ", 0.45],
      ["you ", 0.40],
      ["on a ", 0.20],
      ["tra", 0.30],
      ["in", 0.85]
    ]
  },
  {
    start: 15.12,
    parts: [
      ["I'll miss ", 0.45],
      ["you ", 0.40],
      ["in the ", 0.20],
      ["mor", 0.70],
      ["ning", 0.55]
    ]
  },
  {
    start: 17.64,
    parts: [
      ["I never know ", 0.55],
      ["what to ", 0.25],
      ["think ", 0.40],
      ["a", 0.20],
      ["bout", 0.85]
    ]
  },
  {
    start: 21.77,
    parts: [
      ["I think ", 0.45],
      ["about ", 0.45],
      ["yo", 0.20],
      ["u", 2.40]
    ]
  },
  {
    start: 27.37,
    parts: [
      ["About ", 0.50],
      ["yo", 0.20],
      ["u", 2.50]
    ]
  },
  {
    start: 32.38,
    parts: [
      ["Do you think ", 0.60],
      ["I have ", 0.35],
      ["for", 0.30],
      ["got", 0.35],
      ["ten", 0.65],
      ["", 2.45],
      [" about ", 0.50],
      ["yo", 0.20],
      ["u?", 2.40]
    ]
  },
  {
    start: 42.31,
    parts: [
      ["About ", 0.50],
      ["yo", 0.20],
      ["u", 2.50]
    ]
  },
  {
    start: 47.44,
    parts: [
      ["About ", 0.50],
      ["yo", 0.20],
      ["u", 2.50]
    ]
  },
  {
    start: 52.36,
    parts: [
      ["Do you think ", 0.60],
      ["I have ", 0.35],
      ["for", 0.30],
      ["got", 0.35],
      ["ten", 0.65],
      ["", 2.45],
      [" about ", 0.50],
      ["yo", 0.20],
      ["u?", 2.50]
    ]
  }
];

const PROCESSED_LINES = KARAOKE_TIMELINE.map((line) => {
  let cursor = line.start;
  const chunks = [];
  let fullText = "";
  for (const [text, duration] of line.parts) {
    chunks.push({
      text,
      start: cursor,
      end: cursor + duration,
      duration
    });
    fullText += text;
    cursor += duration;
  }
  return {
    start: line.start,
    end: cursor,
    fullText: fullText.replace(/\s+/g, " ").trim(),
    chunks
  };
});

/* ============================================================================
 * 1. LATAR BINTANG BERGERAK PELAN
 * ============================================================================ */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
let shootingStars = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
}

function initStars() {
  const count = Math.floor((canvas.width * canvas.height) / 4200);
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.6 + 0.3,
      speedY: -(Math.random() * 0.16 + 0.04),
      speedX: (Math.random() - 0.5) * 0.07,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.018 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.75 ? 330 : (Math.random() > 0.5 ? 220 : 45)
    });
  }
}

function maybeSpawnShootingStar() {
  if (shootingStars.length < 1 && Math.random() < 0.0035) {
    shootingStars.push({
      x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
      y: Math.random() * canvas.height * 0.35,
      len: Math.random() * 65 + 45,
      speed: Math.random() * 5 + 5,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      alpha: 1
    });
  }
}

function renderStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const s of stars) {
    s.x += s.speedX;
    s.y += s.speedY;
    s.twinklePhase += s.twinkleSpeed;

    if (s.y < -5) s.y = canvas.height + 5;
    if (s.x < -5) s.x = canvas.width + 5;
    if (s.x > canvas.width + 5) s.x = -5;

    const twinkle = 0.55 + 0.45 * Math.sin(s.twinklePhase);
    const a = s.alpha * twinkle;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${s.hue}, 80%, 92%, ${a})`;
    ctx.fill();

    if (s.radius > 1.4) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 90%, 85%, ${a * 0.18})`;
      ctx.fill();
    }
  }

  maybeSpawnShootingStar();
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const sh = shootingStars[i];
    sh.x += Math.cos(sh.angle) * sh.speed;
    sh.y += Math.sin(sh.angle) * sh.speed;
    sh.alpha -= 0.016;

    if (sh.alpha <= 0) {
      shootingStars.splice(i, 1);
      continue;
    }

    const tailX = sh.x - Math.cos(sh.angle) * sh.len;
    const tailY = sh.y - Math.sin(sh.angle) * sh.len;
    const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
    grad.addColorStop(0, `rgba(255, 230, 242, ${sh.alpha})`);
    grad.addColorStop(1, `rgba(255, 230, 242, 0)`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sh.x, sh.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  }

  requestAnimationFrame(renderStars);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(renderStars);

/* ============================================================================
 * 2. INISIALISASI AUDIO LOKAL & YOUTUBE
 * ============================================================================ */
const localAudio = document.getElementById('local-audio');
document.getElementById('intro-text').textContent = CONFIG.introMessage;
document.getElementById('finale-text').textContent = CONFIG.finaleMessage;

let ytPlayer = null;
let ytReady = false;
let ytFailed = false;
let pendingYtPlay = false;
let localAudioLoaded = false;
let audioFileCandidateIndex = 0;

function getConfiguredStartOffset() {
  const m = Number(CONFIG.startMinutes) || 0;
  const s = Number(CONFIG.startSeconds) || 0;
  return Math.max(0, m * 60 + s);
}

function tryLoadNextLocalAudio() {
  const candidates = Array.isArray(CONFIG.localAudioFiles)
    ? CONFIG.localAudioFiles
    : [CONFIG.defaultAudioFile || 'about_you.mp3'];

  if (audioFileCandidateIndex >= candidates.length) {
    localAudioLoaded = false;
    return;
  }

  localAudio.src = candidates[audioFileCandidateIndex];
  localAudio.load();
}

localAudio.addEventListener('loadedmetadata', () => {
  localAudioLoaded = true;
});

localAudio.addEventListener('error', () => {
  localAudioLoaded = false;
  audioFileCandidateIndex++;
  tryLoadNextLocalAudio();
});

tryLoadNextLocalAudio();

function extractYouTubeId(input) {
  const trimmed = (input || '').trim();
  const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : trimmed;
}

function ensureYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    initYtPlayer();
    return;
  }
  if (document.getElementById('yt-iframe-api')) return;
  const tag = document.createElement('script');
  tag.id = 'yt-iframe-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  initYtPlayer();
};

function initYtPlayer() {
  if (ytPlayer) return;
  const videoId = extractYouTubeId(CONFIG.youtubeUrlOrId);
  const startSec = Math.floor(getConfiguredStartOffset());

  ytPlayer = new YT.Player('yt-player', {
    height: '240',
    width: '240',
    videoId: videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      start: startSec
    },
    events: {
      onReady: () => {
        ytReady = true;
        if (pendingYtPlay) {
          pendingYtPlay = false;
          triggerYtPlayback();
        }
      },
      onError: () => {
        ytFailed = true;
        if (isSongRunning && !isFinale && localAudioLoaded) {
          playLocalAudioNow();
        }
      }
    }
  });
}

ensureYouTubeAPI();

function playLocalAudioNow() {
  activeAudioMode = 'local';
  const startOffset = localAudio.duration > 95 ? configuredStartSec : 0;
  try {
    localAudio.currentTime = startOffset;
  } catch (_) {}
  localAudio.muted = false;
  localAudio.volume = 1.0;
  localAudio.play().catch(() => {
    activeAudioMode = 'clock';
  });
}

function triggerYtPlayback() {
  if (!ytPlayer || typeof ytPlayer.playVideo !== 'function') return;
  activeAudioMode = 'youtube';
  try {
    ytPlayer.unMute();
    ytPlayer.setVolume(100);
    ytPlayer.seekTo(configuredStartSec, true);
    ytPlayer.playVideo();
  } catch (_) {}
}

/* ============================================================================
 * 3. ALUR: KLIK AMPLOP -> SAPAAN -> KARAOKE SATU BARIS -> PENUTUP
 * ============================================================================ */
const envelope = document.getElementById('envelope');
const envelopeScene = document.getElementById('envelope-scene');
const introScene = document.getElementById('intro-scene');
const karaokeScene = document.getElementById('karaoke-scene');
const finaleScene = document.getElementById('finale-scene');
const currentLyricEl = document.getElementById('current-lyric');
const progressBar = document.getElementById('progress-bar');
const timeLabel = document.getElementById('time-label');
const replayBtn = document.getElementById('replay-btn');

let isStarted = false;
let isSongRunning = false;
let isFinale = false;
let activeLineIndex = -1;
let startWallClock = 0;
let configuredStartSec = 0;
let activeAudioMode = 'clock';
let animFrameId = null;
let stageTimeouts = [];

function clearStageTimeouts() {
  while (stageTimeouts.length) {
    clearTimeout(stageTimeouts.pop());
  }
}

function startPlayback() {
  if (isStarted) return;
  isStarted = true;
  isSongRunning = false;
  isFinale = false;
  activeLineIndex = -1;
  clearStageTimeouts();

  envelope.classList.add('open');
  configuredStartSec = getConfiguredStartOffset();

  // Unlock izin audio di browser tepat saat klik agar boleh berputar setelah jeda sapaan
  if (localAudioLoaded) {
    localAudio.muted = true;
    localAudio.play().then(() => {
      localAudio.pause();
      localAudio.muted = false;
    }).catch(() => {});
  }

  // 1. Setelah amplop terbuka, sembunyikan amplop & munculkan "selamat mendengarkan cantik.."
  stageTimeouts.push(setTimeout(() => {
    envelopeScene.classList.add('hidden');
    introScene.classList.add('active');
  }, 850));

  // 2. Setelah jeda sapaan selesai, sembunyikan sapaan lalu mulai lagu & lirik
  const introTotalWait = 850 + (Number(CONFIG.introDurationMs) || 2400);
  stageTimeouts.push(setTimeout(() => {
    introScene.classList.remove('active');
  }, introTotalWait));

  stageTimeouts.push(setTimeout(() => {
    beginSongAndLyrics();
  }, introTotalWait + 650));
}

function beginSongAndLyrics() {
  isSongRunning = true;
  const source = CONFIG.defaultSource;
  const isFileProtocol = window.location.protocol === 'file:';

  if ((source === 'local' || source === 'auto' || (source === 'youtube' && isFileProtocol)) && localAudioLoaded) {
    playLocalAudioNow();
  } else if ((source === 'youtube' || source === 'auto') && !ytFailed) {
    if (ytReady) {
      triggerYtPlayback();
    } else {
      pendingYtPlay = true;
    }
  } else if (localAudioLoaded) {
    playLocalAudioNow();
  } else {
    activeAudioMode = 'clock';
  }

  startWallClock = performance.now();
  karaokeScene.classList.add('active');
  currentLyricEl.innerHTML = '<span style="opacity:0.4;font-style:italic">♪ ... ♪</span>';
  animFrameId = requestAnimationFrame(updateKaraokeLoop);
}

function getElapsedSeconds() {
  if (activeAudioMode === 'local' && !localAudio.paused && !localAudio.ended) {
    const base = localAudio.duration > 95 ? configuredStartSec : 0;
    return Math.max(0, localAudio.currentTime - base);
  }
  if (activeAudioMode === 'youtube' && ytReady && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    const state = ytPlayer.getPlayerState ? ytPlayer.getPlayerState() : -1;
    if (state === 1) {
      const ytTime = ytPlayer.getCurrentTime();
      if (ytTime >= configuredStartSec - 0.5) {
        return Math.max(0, ytTime - configuredStartSec);
      }
    }
  }
  return (performance.now() - startWallClock) / 1000;
}

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function buildLineDOM(lineIndex) {
  const line = PROCESSED_LINES[lineIndex];
  currentLyricEl.innerHTML = '';
  currentLyricEl.classList.remove('line-enter');
  void currentLyricEl.offsetWidth;
  currentLyricEl.classList.add('line-enter');

  line.chunks.forEach((chunk, idx) => {
    if (!chunk.text) return;

    const span = document.createElement('span');
    span.className = 'karaoke-chunk';
    span.dataset.chunkIndex = idx;
    span.textContent = chunk.text;

    const fill = document.createElement('span');
    fill.className = 'fill';
    fill.textContent = chunk.text;
    span.appendChild(fill);

    currentLyricEl.appendChild(span);
  });
}

function updateKaraokeLoop() {
  if (!isSongRunning || isFinale) return;

  const elapsed = getElapsedSeconds();
  const total = CONFIG.segmentDuration;

  const pct = Math.min(100, (elapsed / total) * 100);
  progressBar.style.width = `${pct}%`;
  timeLabel.textContent = `${formatTime(elapsed)} / ${formatTime(total)}`;

  if (elapsed >= total || (activeAudioMode === 'local' && localAudio.ended && elapsed > 10)) {
    showFinale();
    return;
  }

  let foundIndex = -1;
  for (let i = 0; i < PROCESSED_LINES.length; i++) {
    const line = PROCESSED_LINES[i];
    const nextStart = i + 1 < PROCESSED_LINES.length ? PROCESSED_LINES[i + 1].start : total;
    if (elapsed >= line.start && elapsed < nextStart) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex !== -1) {
    if (foundIndex !== activeLineIndex) {
      activeLineIndex = foundIndex;
      buildLineDOM(foundIndex);
    }

    const line = PROCESSED_LINES[foundIndex];
    const chunkEls = currentLyricEl.querySelectorAll('.karaoke-chunk');
    chunkEls.forEach((el) => {
      const idx = parseInt(el.dataset.chunkIndex, 10);
      const chunk = line.chunks[idx];
      let prog = 0;
      if (elapsed >= chunk.end) {
        prog = 1;
      } else if (elapsed > chunk.start) {
        prog = (elapsed - chunk.start) / Math.max(0.01, chunk.duration);
      }
      el.style.setProperty('--progress', prog.toFixed(3));
    });
  }

  animFrameId = requestAnimationFrame(updateKaraokeLoop);
}

function showFinale() {
  isFinale = true;
  if (animFrameId) cancelAnimationFrame(animFrameId);

  if (activeAudioMode === 'local' && !localAudio.paused) {
    let vol = localAudio.volume;
    const fadeTimer = setInterval(() => {
      vol = Math.max(0, vol - 0.08);
      localAudio.volume = vol;
      if (vol <= 0) {
        localAudio.pause();
        localAudio.volume = 1.0;
        clearInterval(fadeTimer);
      }
    }, 180);
  } else if (activeAudioMode === 'youtube' && ytReady && ytPlayer && ytPlayer.pauseVideo) {
    setTimeout(() => {
      try { ytPlayer.pauseVideo(); } catch (_) {}
    }, 2500);
  }

  karaokeScene.classList.remove('active');
  setTimeout(() => {
    finaleScene.classList.add('active');
  }, 600);
}

function resetExperience() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  clearStageTimeouts();
  isStarted = false;
  isSongRunning = false;
  isFinale = false;
  activeLineIndex = -1;
  pendingYtPlay = false;

  if (!localAudio.paused) localAudio.pause();
  if (ytReady && ytPlayer && ytPlayer.pauseVideo) {
    try { ytPlayer.pauseVideo(); } catch (_) {}
  }

  finaleScene.classList.remove('active');
  karaokeScene.classList.remove('active');
  introScene.classList.remove('active');
  envelope.classList.remove('open');
  envelopeScene.classList.remove('hidden');
  progressBar.style.width = '0%';
}

envelope.addEventListener('click', startPlayback);
envelope.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    startPlayback();
  }
});

replayBtn.addEventListener('click', resetExperience);
