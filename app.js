// ============================================================
// Quran Web App — JavaScript
// Fonctionnalités complètes : modes, téléchargement, pages
// ============================================================

const API = 'https://api.alquran.cloud/v1';

// Données des 114 sourates
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
  'As-Saff','Al-Jumu\'a','Al-Munaafiqoon','At-Taghaabun','At-Talaaq',
  'At-Tahrim','Al-Mulk','Al-Qalam','Al-Haaqqa','Al-Ma\'aarij',
  'Nooh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyaama',
  'Al-Insaan','Al-Mursalaat','An-Naba','An-Naazi\'at','Abasa','At-Takwir',
  'Al-Infitaar','Al-Mutaffifin','Al-Inshiqaaq','Al-Burooj','At-Taariq',
  "Al-A'laa","Al-Ghaashiya",'Al-Fajr','Al-Balad','Ash-Shams',
  'Al-Lail','Ad-Dhuhaa','Ash-Sharh','At-Tin','Al-Alaq',
  'Al-Qadr','Al-Bayyina','Az-Zalzala','Al-Aadiyaat','Al-Qaari\'a',
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

// Mini table des 20 dernières sourates pour navigation rapide
const LAST_SURRAHS = [113, 114];

// Récitateurs disponibles
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

// ============================================================
// ÉTAT DE L'APPLICATION
// ============================================================
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
  // Modes de lecture
  readingMode: 'single', // single | range | page | loop
  rangeStart: 1,
  rangeEnd: 5,
  loopEnabled: false,
  // Cache téléchargement
  cache: {
    reciter: null,
    downloadedSurahs: {}, // { surahNum: true }
    downloading: {},
  },
  // Page mode
  currentPage: 1,
};

// ============================================================
// UTILITAIRES
// ============================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================================
// INITIALISATION
// ============================================================
function init() {
  applyTheme(state.theme);
  loadSurahs();
  setupEventListeners();
  setupAudioPlayer();
  loadCacheStatus();
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
    renderSurahList(grid);
    countEl.textContent = `${SURAH_NAMES.length} sourates`;
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      <p>Impossible de charger les sourates.</p>
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

    const dots = Array.from({ length: 5 }, (_, j) =>
      `<span style="width:${(j + 1) * 20}%"></span>`
    ).join('');

    // Badge de téléchargement si disponible
    let downloadBadge = '';
    if (state.cache.downloadedSurahs[num]) {
      downloadBadge = `<div class="surah-downloaded-badge" style="position:absolute;top:6px;right:6px;font-size:10px;color:var(--primary);font-weight:600">✓</div>`;
    }

    card.innerHTML = `
      ${downloadBadge}
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

  const activeCard = grid.querySelector('.surah-card.active');
  if (activeCard) {
    setTimeout(() => {
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}

// ============================================================
// OUVERTURE/FERMETURE LECTEUR
// ============================================================
function openSurah(surahNum) {
  state.currentSurah = surahNum;
  state.currentVerse = 1;
  state.isPlaying = false;
  state.loopEnabled = false;

  $('#surahList').style.display = 'none';
  $('#readerSection').style.display = 'block';

  $('#readerSurahName').textContent = SURAH_NAMES[surahNum - 1];
  const total = AYAH_COUNTS[surahNum - 1];
  $('#readerVerseInfo').textContent = `Verset 1 / ${total}`;
  $('#verseNumber').textContent = '1';
  $('#verseNumber').style.opacity = '0';
  $('#arabicText').textContent = 'Chargement...';
  $('#transliterationText').textContent = '';
  $('#translationText').textContent = '';

  updatePlayButton();
  updatePlayerStatus('Prêt');
  $('#audioPlayer').currentTime = 0;
  $('#progressBar').value = 0;

  // Configurer mode selon selection
  configureModeUI();

  loadVerse(surahNum, 1);
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
// MODES DE LECTURE
// ============================================================
function configureModeUI() {
  // Cacher tous les configs
  $('#rangeConfig').style.display = 'none';
  $('#pageConfig').style.display = 'none';

  // Afficher selon mode
  if (state.readingMode === 'range') {
    $('#rangeConfig').style.display = 'block';
    $('#rangeStart').value = state.rangeStart;
    $('#rangeEnd').value = Math.min(state.rangeEnd, AYAH_COUNTS[state.currentSurah - 1]);
  } else if (state.readingMode === 'page') {
    $('#pageConfig').style.display = 'block';
    $('#pageInput').value = state.currentPage;
  }
}

function setReadingMode(mode) {
  state.readingMode = mode;
  state.loopEnabled = false;

  // Update chips
  $$('.mode-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.mode === mode);
  });

  configureModeUI();
}

function applyRange() {
  let start = parseInt($('#rangeStart').value, 10) || 1;
  let end = parseInt($('#rangeEnd').value, 10) || 5;
  const max = AYAH_COUNTS[state.currentSurah - 1];

  start = Math.max(1, Math.min(start, max));
  end = Math.max(start, Math.min(end, max));

  state.rangeStart = start;
  state.rangeEnd = end;
  state.currentVerse = start;

  updatePlayerStatus(`Plage: verset ${start}-${end}`);
  loadVerse(state.currentSurah, start);
}

function applyPage() {
  let page = parseInt($('#pageInput').value, 10) || 1;
  const maxPage = 604;
  page = Math.max(1, Math.min(page, maxPage));
  state.currentPage = page;

  // Calculer le verset approximatif pour cette page
  // Les pages coraniques sont numérotées 1-604
  // On utilise une approximation basée sur la distribution
  const verse = estimateVerseForPage(state.currentSurah, page);
  if (verse) {
    state.currentVerse = verse;
    updatePlayerStatus(`Page ${page}`);
    loadVerse(state.currentSurah, verse);
  }
}

function estimateVerseForPage(surah, page) {
  // Approximation: chaque page contient environ 15 versets en moyenne
  // Pour une estimation plus précise, on utiliserait une API de pagination
  if (page < 1) return 1;
  const basePerPage = 15;
  const verse = Math.min((page - 1) * basePerPage + 1, AYAH_COUNTS[surah - 1]);
  return verse >= 1 ? verse : 1;
}

// ============================================================
// CHARGEMENT DES VERSETS
// ============================================================
async function loadVerse(surah, verse) {
  if (verse > AYAH_COUNTS[surah - 1] || verse < 1) return;
  if (surah < 1 || surah > 114) return;

  state.currentVerse = verse;
  $('#verseNumber').textContent = verse;
  $('#readerVerseInfo').textContent = `Verset ${verse} / ${AYAH_COUNTS[surah - 1]}`;
  $('#verseNumber').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });

  const [arabic, translit, translation] = await Promise.all([
    fetchArabic(surah, verse),
    fetchTransliteration(surah, verse),
    fetchTranslation(surah, verse),
  ]);

  if (state.showArabic && arabic) $('#arabicText').textContent = arabic;
  if (state.showTransliteration && translit) $('#transliterationText').textContent = translit;
  if (state.showTranslation && translation) $('#translationText').textContent = translation;

  // Si on est en mode boucle, marquer la fin
  if (state.readingMode === 'loop' && verse >= AYAH_COUNTS[surah - 1]) {
    state.loopEnabled = true;
  }
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
let animationId = null;

function setupAudioPlayer() {
  const audio = $('#audioPlayer');

  audio.addEventListener('timeupdate', () => {
    const pct = (audio.currentTime / (audio.duration || 1)) * 100;
    $('#progressBar').value = Math.min(pct, 100);
    updatePlayerTime(formatTime(audio.currentTime));
  });

  audio.addEventListener('ended', () => {
    onAudioEnded();
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

  // Vérifier cache d'abord
  const cached = checkLocalCache(url);
  if (cached) {
    playFromCache(cached);
    return;
  }

  setupAudioContext();

  fetch(url)
    .then(r => r.arrayBuffer())
    .then(buffer => audioCtx.decodeAudioData(buffer))
    .then(buffer => {
      currentAudioBuffer = buffer;
      playBuffer(buffer);

      // Téléchargement en arrière-plan pour cache
      cacheAudio(url, buffer);
    })
    .catch(e => {
      console.error('Audio load error:', e);
      updatePlayerStatus('Erreur audio');
    });
}

function playFromCache(buffer) {
  playBuffer(buffer);
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
    if (state.isPlaying) onAudioEnded();
  };

  state.isPlaying = true;
  updatePlayButton();
  updatePlayerStatus('Lecture...');
  startAudioVisualizer();
}

function startAudioVisualizer() {
  if (animationId) cancelAnimationFrame(animationId);

  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

  function updateBars() {
    analyserNode.getByteFrequencyData(dataArray);
    const cards = $$('.surah-card');
    cards.forEach(card => {
      const bars = card.querySelector('.audio-dots span');
      if (bars) {
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
  $$('.surah-card-audio .audio-dots span').forEach(span => {
    span.style.width = '';
    span.style.background = '';
  });
}

function togglePlayback() {
  if (state.isPlaying) {
    stopPlayback();
  } else {
    // En mode range, jouer la plage
    if (state.readingMode === 'range') {
      playRange();
      return;
    }
    // En mode boucle, jouer le verset courant
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

function playRange() {
  const start = state.rangeStart;
  const end = state.rangeEnd;
  let current = start;

  function playNext() {
    if (current > end) {
      // Fin de la plage
      stopPlayback();
      updatePlayerStatus('Plage terminée');
      state.currentVerse = start;
      return;
    }

    state.currentVerse = current;
    loadVerse(state.currentSurah, current).then(() => {
      getRecitationUrl(state.currentSurah, current, state.reciter)
        .then(url => {
          if (url) {
            playAudioFromUrl(url);
            // Quand le buffer se termine, passer au suivant
            // (géré par sourceNode.onended -> onAudioEnded)
          } else {
            current++;
            playNext();
          }
        })
        .catch(() => {
          current++;
          playNext();
        });
    });
  }

  playNext();
}

function onAudioEnded() {
  if (state.readingMode === 'range') {
    // La plage gère son propre passage
    return;
  }

  if (state.loopEnabled) {
    // Rejouer le même verset
    const url = getRecitationUrl(state.currentSurah, state.currentVerse, state.reciter);
    url.then(u => { if (u) playAudioFromUrl(u); });
  } else {
    nextVerse();
  }
}

// ============================================================
// NAVIGATION
// ============================================================
function prevVerse() {
  if (state.readingMode === 'range') {
    if (state.currentVerse > state.rangeStart) {
      state.currentVerse--;
    }
    return;
  }

  if (state.currentVerse > 1) {
    state.currentVerse--;
  } else if (state.currentSurah > 1) {
    state.currentSurah--;
    state.currentVerse = AYAH_COUNTS[state.currentSurah - 1];
  }
  loadVerse(state.currentSurah, state.currentVerse).then(() => {
    if (state.isPlaying) {
      const url = getRecitationUrl(state.currentSurah, state.currentVerse, state.reciter);
      url.then(u => { if (u) playAudioFromUrl(u); });
    }
  });
}

function nextVerse() {
  const max = AYAH_COUNTS[state.currentSurah - 1];

  if (state.readingMode === 'range' && state.currentVerse < state.rangeEnd) {
    state.currentVerse++;
    return;
  }

  if (state.currentVerse < max) {
    state.currentVerse++;
  } else if (state.currentSurah < 114) {
    state.currentSurah++;
    state.currentVerse = 1;
  }
  loadVerse(state.currentSurah, state.currentVerse).then(() => {
    if (state.isPlaying) {
      const url = getRecitationUrl(state.currentSurah, state.currentVerse, state.reciter);
      url.then(u => { if (u) playAudioFromUrl(u); });
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
// URL DE RÉCITATION
// ============================================================
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

// ============================================================
// CACHE OFFLINE (IndexedDB)
// ============================================================
const DB_NAME = 'QuranCache';
const DB_VERSION = 1;
const STORE_NAME = 'audio';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'url' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function checkLocalCache(url) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(url);
      req.onsuccess = () => {
        if (req.result) {
          const audioBuffer = audioCtx.decodeAudioData(req.result.buffer);
          resolve(audioBuffer);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function cacheAudio(url, buffer) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ url, buffer: buffer.copyToArray() });
  } catch (e) {
    console.warn('Cache error:', e);
  }
}

// ============================================================
// TÉLÉCHARGEMENT POUR HORS-LIGNE
// ============================================================
async function downloadSurah(surahNum) {
  if (state.cache.downloading[surahNum]) {
    updatePlayerStatus('Déjà téléchargement...');
    return;
  }

  state.cache.downloading[surahNum] = true;
  updatePlayerStatus(`Téléchargement sourate ${surahNum}...`);

  const total = AYAH_COUNTS[surahNum - 1];
  let downloaded = 0;

  try {
    for (let verse = 1; verse <= total; verse++) {
      const url = await getRecitationUrl(surahNum, verse, state.reciter);

      if (url) {
        try {
          const response = await fetch(url);
          const buffer = await response.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(buffer);

          // Cache l'audio
          await cacheAudio(url, audioBuffer);
          downloaded++;
        } catch (e) {
          console.warn(`Verse ${verse} download failed`);
        }
      }

      // Mise à jour progression
      const pct = Math.round((downloaded / total) * 100);
      updatePlayerStatus(`${surahNum}: ${downloaded}/${total} (${pct}%)`);
    }

    // Marquer comme téléchargé
    state.cache.downloadedSurahs[surahNum] = true;
    localStorage.setItem('quran-downloaded', JSON.stringify(state.cache.downloadedSurahs));
    updatePlayerStatus(`Sourate ${surahNum} téléchargée!`);
    renderSurahList($('#surahGrid'));
    loadCacheStatus();

  } catch (e) {
    updatePlayerStatus('Erreur téléchargement');
  } finally {
    state.cache.downloading[surahNum] = false;
  }
}

function loadCacheStatus() {
  try {
    const saved = localStorage.getItem('quran-downloaded');
    if (saved) {
      state.cache.downloadedSurahs = JSON.parse(saved);
      renderSurahList($('#surahGrid'));
    }
  } catch {}
}

async function handleDownloadClick() {
  const surah = state.currentSurah;

  if (state.cache.downloadedSurahs[surah]) {
    // Déjà téléchargé, vider le cache
    if (confirm(`La sourate ${surah} est déjà téléchargée. Voulez-vous la supprimer du cache?`)) {
      // Pour simplifier, on ne supprime pas individuellement
      updatePlayerStatus('Cache déjà présent');
    }
    return;
  }

  if (confirm(`Télécharger la sourate ${surah} (${AYAH_COUNTS[surah-1]} versets) pour consultation hors-ligne?\n Cela peut prendre quelques minutes.`)) {
    await downloadSurah(surah);
  }
}

// ============================================================
// UI HELPERS
// ============================================================
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
// ÉVÉNEMENTS
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

  // Progress bar
  const progressBar = $('#progressBar');
  progressBar.addEventListener('input', () => {
    if ($('#audioPlayer').duration) {
      $('#audioPlayer').currentTime = (progressBar.value / 100) * $('#audioPlayer').duration;
    }
  });

  // Sélecteur récitateur
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
      const url = getRecitationUrl(state.currentSurah, state.currentVerse, state.reciter);
      url.then(u => { if (u) playAudioFromUrl(u); });
    }
  });

  // Modes de lecture
  $$('.mode-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      setReadingMode(chip.dataset.mode);
    });
  });

  // Appliquer plage
  $('#rangeApplyBtn').addEventListener('click', applyRange);

  // Appliquer page
  $('#pageGoBtn').addEventListener('click', applyPage);
  $('#pageInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyPage();
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

  // Swipe tactile
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

  // Téléchargement
  $('#downloadBtn').addEventListener('click', handleDownloadClick);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', init);

// Liens profonds
window.addEventListener('popstate', () => {
  const hash = location.hash;
  if (hash.startsWith('#surah-')) {
    const num = parseInt(hash.split('-')[1], 10);
    if (num >= 1 && num <= 114) openSurah(num);
  }
});

if (location.hash.startsWith('#surah-')) {
  const num = parseInt(location.hash.split('-')[1], 10);
  if (num >= 1 && num <= 114) {
    setTimeout(() => openSurah(num), 300);
  }
}
