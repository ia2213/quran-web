// ============================================================
// Quran Web App — JavaScript
// Utilise l'API Alquran.cloud pour textes et récitations
// ============================================================

const API = 'https://api.alquran.cloud/v1';

// Données des sourates (en dur pour éviter un appel API supplémentaire)
const SURAH_NAMES = [
  'Al-Faatiha','Al-Baqara','Aal-i-Imraan','An-Nisaa','Al-Maaida',
  "Al-An'aam","Al-A'raaf","Al-Anfaal","At-Tawba","Yunus",
  'Hud','Yusuf',"Ar-Ra'd","Ibrahim","Al-Hijr",
  'An-Nahl','Al-Israa','Al-Kahf','Maryam','Taa-Haa',
  'Al-Anbiyaa','Al-Hajj','Al-Muminoon','An-Noor','Al-Furqaan',
  "Ash-Shu'araa","An-Naml","Al-Qasas","Al-Ankaboot","Ar-Room",
  'Luqman','As-Sajda','Al-Ahzaab','Saba','Faatir',
  'Yaseen','As-Saaffaat','Saad','Az-Zumar','Ghafir',
  'Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhaan','Al-Jaathiya',
  'Al-Ahqaf','Muhammad','Al-Fath','Al-Hujuraat','Qaaf',
  'Adh-Dhaariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahmaan',
  'Al-Waaqia','Al-Hadid','Al-Mujaadila','Al-Hashr','Al-Mumtahana',
  'As-Saff',"Al-Jumu'a",'Al-Munaafiqoon','At-Taghaabun','At-Talaaq',
  'At-Tahrim','Al-Mulk','Al-Qalam','Al-Haaqqa',"Al-Ma'aarij",
  'Nooh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyaama',
  'Al-Insaan','Al-Mursalaat','An-Naba',"An-Naazi'at","Abasa","At-Takwir",
  'Al-Infitaar','Al-Mutaffifin','Al-Inshiqaaq','Al-Burooj','At-Taariq',
  "Al-A'laa","Al-Ghaashiya",'Al-Fajr','Al-Balad','Ash-Shams',
  'Al-Lail','Ad-Dhuhaa','Ash-Sharh','At-Tin','Al-Alaq',
  'Al-Qadr','Al-Bayyina','Az-Zalzala','Al-Aadiyaat',"Al-Qaari'a",
  'At-Takaathur','Al-Asr','Al-Humaza','Al-Fil','Quraish',
  "Al-Maa'un",'Al-Kawthar','Al-Kaafiroon','An-Nasr','Al-Masad',
  'Al-Ikhlaas','Al-Falaq','An-Naas',
];

const AYAH_COUNTS = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,
  89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,
  12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,
  30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6,
];

const RECITERS = [
  { id: 'ar.alafasy', label: 'Mishary Rashid Al-Afasy' },
  { id: 'ar.husary', label: 'Mahmoud Khalil Al-Husary' },
  { id: 'ar.husarymujawwad', label: 'Al-Husary (Mujawwad)' },
  { id: 'ar.minshawi', label: 'Mohamed Siddiq El-Minshawi' },
  { id: 'ar.minshawimujawwad', label: 'El-Minshawi (Mujawwad)' },
  { id: 'ar.abdulbasitmurattal', label: 'Abdul Basit (Murattal)' },
  { id: 'ar.abdulbasitmujawwad', label: 'Abdul Basit (Mujawwad)' },
  { id: 'ar.shaatree', label: 'Abu Bakr Al-Shaatree' },
  { id: 'ar.abdurrahmaansudais', label: 'Abdurrahman As-Sudais' },
  { id: 'ar.saoodshuraym', label: 'Saood Al-Shuraym' },
  { id: 'ar.hudhaify', label: 'Ali Al-Hudhaify' },
  { id: 'ar.mahermuaiqly', label: 'Maher Al Muaiqly' },
  { id: 'ar.yasseraldossari', label: 'Yasser Al-Dossari' },
  { id: 'ar.ahmedajamy', label: 'Ahmed Al-Ajamy' },
  { id: 'ar.nasseralqatami', label: 'Nasser Al-Qatami' },
  { id: 'ar.hanirifai', label: 'Hani Ar-Rifai' },
];

// État de l'application
const state = {
  currentSurah: 1,
  currentVerse: 1,
  reciter: 'ar.alafasy',
  showArabic: true,
  showTransliteration: false,
  showTranslation: false,
  theme: localStorage.getItem('quran-theme') || 'light',
  isPlaying: false,
  isLoading: false,
  searchQuery: '',
};

// Éléments DOM
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Initialisation
function init() {
  applyTheme(state.theme);
  loadSurahs();
  setupEventListeners();
  setupAudioPlayer();
}

// ============================================================
// THÈME
// ============================================================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('quran-theme', theme);
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(state.theme);
}

// ============================================================
// CHARGEMENT DES SOURATES
// ============================================================
async function loadSurahs() {
  const grid = $('#surahGrid');
  const countEl = $('#surahCount');

  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    // Afficher directement les sourates avec noms en dur
    renderSurahList(grid);
    countEl.textContent = `${SURAH_NAMES.length} sourates`;

    // Chargement des métadonnées en arrière-plan (optionnel)
    fetch(`${API}/surah`)
      .then(r => r.json())
      .then(data => {
        // On a déjà les noms, mais on peut enrichir si besoin
      })
      .catch(() => {});
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      <p>Impossible de charger les sourates. Réessayez.</p>
    </div>`;
  }
}

function renderSurahList(grid) {
  grid.innerHTML = '';
  SURAH_NAMES.forEach((name, i) => {
    const num = i + 1;
    const count = AYAH_COUNTS[i];
    const card = document.createElement('div');
    card.className = 'surah-card' + (num === state.currentSurah ? ' active' : '');
    card.dataset.surah = num;

    // Barres d'audio factices (visuel uniquement)
    const complete = count > 0;
    const dots = Array.from({ length: 5 }, (_, j) =>
      `<span style="width:${(j + 1) * 20}%"></span>`
    ).join('');

    card.innerHTML = `
      <div class="surah-card-number">${num}</div>
      <div class="surah-card-name">${name}</div>
      <div class="surah-card-meta">${count} versets</div>
      <div class="surah-card-audio">
        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <div class="audio-dots">${dots}</div>
      </div>
    `;

    card.addEventListener('click', () => openSurah(num));
    grid.appendChild(card);
  });

  // Scroll to current surah if needed
  const activeCard = grid.querySelector('.surah-card.active');
  if (activeCard) {
    setTimeout(() => {
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}

// ============================================================
// OUVERTURE D'UNE SOURATE
// ============================================================
function openSurah(surahNum) {
  state.currentSurah = surahNum;
  state.currentVerse = 1;
  state.isPlaying = false;

  $('#surahList').style.display = 'none';
  $('#readerSection').style.display = 'block';

  $('#readerSurahName').textContent = SURAH_NAMES[surahNum - 1];
  $('#readerVerseInfo').textContent = `Verset 1 / ${AYAH_COUNTS[surahNum - 1]}`;
  $('#verseNumber').textContent = '1';
  $('#verseNumber').style.opacity = '0';
  $('#arabicText').textContent = 'Chargement...';
  $('#transliterationText').textContent = '';
  $('#translationText').textContent = '';

  updatePlayButton();
  updatePlayerStatus('Prêt');
  $('#audioPlayer').currentTime = 0;
  $('#progressBar').value = 0;
  $('#progressBar').max = AYAH_COUNTS[surahNum - 1];

  // Charger le premier verset
  loadVerse(surahNum, 1);

  // Mettre à jour la liste avec le surah actif
  renderSurahList($('#surahGrid'));
  history.replaceState(null, '', `#surah-${surahNum}`);
}

function closeReader() {
  if (state.isPlaying) stopPlayback();
  $('#readerSection').style.display = 'none';
  $('#surahList').style.display = 'block';
  $('#audioPlayer').pause();
  state.isPlaying = false;
  updatePlayButton();
  renderSurahList($('#surahGrid'));
}

// ============================================================
// CHARGEMENT DES VERSETS
// ============================================================
async function loadVerse(surah, verse) {
  if (verse > AYAH_COUNTS[surah - 1]) return;
  if (verse < 1) return;

  state.currentVerse = verse;
  $('#verseNumber').textContent = verse;
  $('#readerVerseInfo').textContent =
    `Verset ${verse} / ${AYAH_COUNTS[surah - 1]}`;
  $('#verseNumber').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });

  // Charger tout en parallèle
  const [arabic, translit, translation] = await Promise.all([
    fetchArabic(surah, verse),
    fetchTransliteration(surah, verse),
    fetchTranslation(surah, verse),
  ]);

  if (state.showArabic && arabic) {
    $('#arabicText').textContent = arabic;
  }
  if (state.showTransliteration && translit) {
    $('#transliterationText').textContent = translit;
  }
  if (state.showTranslation && translation) {
    $('#translationText').textContent = translation;
  }

  return { arabic, translit, translation };
}

async function fetchArabic(surah, verse) {
  try {
    const r = await fetch(`${API}/ayah/${surah}:${verse}/quran-uthmani`);
    const d = await r.json();
    return d.data?.text || '';
  } catch { return ''; }
}

async function fetchTransliteration(surah, verse) {
  try {
    const r = await fetch(`${API}/ayah/${surah}:${verse}/en.transliteration`);
    const d = await r.json();
    return d.data?.text || '';
  } catch { return ''; }
}

async function fetchTranslation(surah, verse) {
  try {
    const r = await fetch(`${API}/ayah/${surah}:${verse}/fr.hamidullah`);
    const d = await r.json();
    return d.data?.text || '';
  } catch { return ''; }
}

// ============================================================
// AUDIO
// ============================================================
let audioCtx = null;
let currentAudioBuffer = null;
let sourceNode = null;
let gainNode = null;
let analyserNode = null;
let audioData = null;
let animationId = null;

function setupAudioPlayer() {
  const audio = $('#audioPlayer');

  audio.addEventListener('timeupdate', () => {
    const pct = (audio.currentTime / (audio.duration || 1)) * 100;
    $('#progressBar').value = Math.min(pct, 100);
    updatePlayerTime(formatTime(audio.currentTime));
  });

  audio.addEventListener('ended', () => {
    nextVerse();
  });

  audio.addEventListener('loadedmetadata', () => {
    $('#progressBar').max = audio.duration || 0;
  });
}

function setupAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 1;
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    gainNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playAudioFromUrl(url) {
  if (state.isPlaying) return;

  setupAudioContext();

  fetch(url)
    .then(r => r.arrayBuffer())
    .then(buffer => audioCtx.decodeAudioData(buffer))
    .then(buffer => {
      currentAudioBuffer = buffer;
      playBuffer(buffer);
    })
    .catch(e => {
      console.error('Audio load error:', e);
      updatePlayerStatus('Erreur audio');
    });
}

function playBuffer(buffer) {
  if (sourceNode) {
    try { sourceNode.stop(); } catch {}
  }

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = buffer;
  sourceNode.connect(gainNode);
  sourceNode.start(0);
  sourceNode.onended = () => {
    if (state.isPlaying) nextVerse();
  };

  state.isPlaying = true;
  updatePlayButton();
  updatePlayerStatus('Lecture...');

  // Analyser pour les barres d'audio
  startAudioVisualizer();
}

function startAudioVisualizer() {
  if (animationId) cancelAnimationFrame(animationId);

  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

  function updateBars() {
    analyserNode.getByteFrequencyData(dataArray);

    // Mettre à jour les barres visuelles si dans une sourate
    const cards = $$('.surah-card');
    cards.forEach(card => {
      const bars = card.querySelector('.audio-dots span');
      if (bars) {
        // Effet visuel simple basé sur l'énergie
        const energy = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const pct = Math.max(10, Math.min(100, energy));
        bars.style.width = pct + '%';
        bars.style.background = state.isPlaying ? 'var(--primary)' : 'var(--text-tertiary)';
      }
    });

    if (state.isPlaying) {
      animationId = requestAnimationFrame(updateBars);
    }
  }
  updateBars();
}

function stopPlayback() {
  if (sourceNode) {
    try { sourceNode.stop(); } catch {}
    sourceNode = null;
  }
  state.isPlaying = false;
  if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
  updatePlayButton();
  updatePlayerStatus('En pause');
  $('#audioPlayer').currentTime = 0;
  $('#progressBar').value = 0;

  // Réinitialiser les barres
  $$('.surah-card-audio .audio-dots span').forEach(span => {
    span.style.width = '';
    span.style.background = '';
  });
}

function togglePlayback() {
  if (state.isPlaying) {
    stopPlayback();
  } else {
    // Trouver l'URL de récitation pour le verset actuel
    const surah = state.currentSurah;
    const verse = state.currentVerse;
    getRecitationUrl(surah, verse, state.reciter)
      .then(url => {
        if (url) playAudioFromUrl(url);
        else updatePlayerStatus('Audio non disponible');
      })
      .catch(() => updatePlayerStatus('Erreur'));
  }
}

async function getRecitationUrl(surah, verse, reciter) {
  try {
    const r = await fetch(`${API}/ayah/${surah}:${verse}/${reciter}`);
    const d = await r.json();
    return d.data?.audio || null;
  } catch {
    // Fallback vers EveryAyah CDN
    const map = {
      'ar.alafasy': 'Alafasy_128kbps',
      'ar.husary': 'Husary_128kbps',
      'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_192kbps',
    };
    const folder = map[reciter] || 'Alafasy_128kbps';
    return `https://everyayah.com/data/${folder}/${String(surah).padStart(3, '0')}${String(verse).padStart(3, '0')}.mp3`;
  }
}

function updatePlayButton() {
  const playIcon = document.querySelector('.play-icon');
  const pauseIcon = document.querySelector('.pause-icon');
  if (state.isPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
}

function updatePlayerStatus(text) {
  $('#playerStatus').textContent = text;
}

function updatePlayerTime(time) {
  $('#playerTime').textContent = formatTime(time);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ============================================================
// NAVIGATION
// ============================================================
function prevVerse() {
  if (state.currentVerse > 1) {
    state.currentVerse--;
  } else if (state.currentSurah > 1) {
    state.currentSurah--;
    state.currentVerse = AYAH_COUNTS[state.currentSurah - 2];
  }
  loadVerse(state.currentSurah, state.currentVerse).then(() => {
    if (state.isPlaying) {
      getRecitationUrl(state.currentSurah, state.currentVerse, state.reciter)
        .then(url => { if (url) playAudioFromUrl(url); });
    }
  });
}

function nextVerse() {
  const max = AYAH_COUNTS[state.currentSurah - 1];
  if (state.currentVerse < max) {
    state.currentVerse++;
  } else if (state.currentSurah < 114) {
    state.currentSurah++;
    state.currentVerse = 1;
  }
  loadVerse(state.currentSurah, state.currentVerse).then(() => {
    if (state.isPlaying) {
      getRecitationUrl(state.currentSurah, state.currentVerse, state.reciter)
        .then(url => { if (url) playAudioFromUrl(url); });
    }
  });
}

function prevSurah() {
  if (state.currentSurah > 1) {
    state.currentSurah--;
    state.currentVerse = 1;
    loadVerse(state.currentSurah, state.currentVerse);
    if (state.isPlaying) stopPlayback();
    renderSurahList($('#surahGrid'));
  }
}

function nextSurah() {
  if (state.currentSurah < 114) {
    state.currentSurah++;
    state.currentVerse = 1;
    loadVerse(state.currentSurah, state.currentVerse);
    if (state.isPlaying) stopPlayback();
    renderSurahList($('#surahGrid'));
  }
}

// ============================================================
// EVENEMENTS
// ============================================================
function setupEventListeners() {
  // Thème
  $('#themeToggle').addEventListener('click', toggleTheme);

  // Retour
  $('#backToList').addEventListener('click', closeReader);

  // Play/Pause
  $('#playBtn').addEventListener('click', togglePlayback);

  // Navigation
  $('#prevVerseBtn').addEventListener('click', prevVerse);
  $('#nextVerseBtn').addEventListener('click', nextVerse);
  $('#prevSurahBtn').addEventListener('click', prevSurah);
  $('#nextSurahBtn').addEventListener('click', nextSurah);

  // Progrès bar
  const progressBar = $('#progressBar');
  progressBar.addEventListener('input', () => {
    if ($('#audioPlayer').duration) {
      $('#audioPlayer').currentTime =
        (progressBar.value / 100) * $('#audioPlayer').duration;
    }
  });

  // Sélecteur de récitateur
  const reciterSelect = $('#reciterSelect');
  RECITERS.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.label;
    reciterSelect.appendChild(opt);
  });
  reciterSelect.value = state.reciter;
  reciterSelect.addEventListener('change', () => {
    state.reciter = reciterSelect.value;
    if (state.isPlaying) {
      stopPlayback();
      const url = getRecitationUrl(
        state.currentSurah, state.currentVerse, state.reciter
      );
      url.then(u => { if (u) playAudioFromUrl(u); });
    }
  });

  // Options texte
  $$('.opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const opt = btn.dataset.opt;
      const isActive = btn.classList.toggle('active');

      if (opt === 'arabic') state.showArabic = isActive;
      if (opt === 'transliteration') state.showTransliteration = isActive;
      if (opt === 'translation') state.showTranslation = isActive;

      $('#verseArabic').style.display = state.showArabic ? '' : 'none';
      $('#verseTransliteration').style.display = state.showTransliteration ? '' : 'none';
      $('#verseTranslation').style.display = state.showTranslation ? '' : 'none';
    });
  });

  // Recherche
  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');
  const searchClear = $('#searchClear');

  searchInput.addEventListener('input', () => {
    state.searchQuery = searchInput.value.trim().toLowerCase();
    searchClear.style.display = state.searchQuery ? '' : 'none';

    if (state.searchQuery.length < 2) {
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';
    searchResults.innerHTML = '';

    const matches = SURAH_NAMES
      .map((name, i) => ({ num: i + 1, name, count: AYAH_COUNTS[i] }))
      .filter(s => s.name.toLowerCase().includes(state.searchQuery) ||
                   s.num.toString().includes(state.searchQuery))
      .slice(0, 8);

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-result-item" style="color:var(--text-tertiary);cursor:default">Aucun résultat</div>';
      return;
    }

    matches.forEach(s => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div class="sr-number">${s.num}</div>
        <div class="sr-info">
          <div class="sr-name">${s.name}</div>
          <div class="sr-meta">${s.count} versets</div>
        </div>
      `;
      item.addEventListener('click', () => {
        searchResults.style.display = 'none';
        searchInput.value = '';
        searchClear.style.display = 'none';
        openSurah(s.num);
      });
      searchResults.appendChild(item);
    });
  });

  // Fermer la recherche au clic en dehors
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      searchResults.style.display = 'none';
    }
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    searchClear.style.display = 'none';
    searchResults.style.display = 'none';
    searchInput.focus();
  });

  // Raccourcis clavier
  document.addEventListener('keydown', (e) => {
    // Ignore si on édite un input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        if ($('#readerSection').style.display !== 'none') togglePlayback();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if ($('#readerSection').style.display !== 'none') prevVerse();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if ($('#readerSection').style.display !== 'none') nextVerse();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if ($('#readerSection').style.display !== 'none') prevSurah();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if ($('#readerSection').style.display !== 'none') nextSurah();
        break;
      case 'm':
      case 'M':
        toggleTheme();
        break;
    }
  });

  // Touch swipe pour la navigation
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    if ($('#readerSection').style.display === 'none') return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if ($('#readerSection').style.display === 'none') return;
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) prevVerse();
      else nextVerse();
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 80) {
      if (dy > 0) prevSurah();
      else nextSurah();
    }
  }, { passive: true });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', init);

// Gérer les liens profonds
window.addEventListener('popstate', () => {
  const hash = location.hash;
  if (hash.startsWith('#surah-')) {
    const num = parseInt(hash.split('-')[1], 10);
    if (num >= 1 && num <= 114) openSurah(num);
  }
});

// Si y'a un hash au chargement
if (location.hash.startsWith('#surah-')) {
  const num = parseInt(location.hash.split('-')[1], 10);
  if (num >= 1 && num <= 114) {
    setTimeout(() => openSurah(num), 300);
  }
}
