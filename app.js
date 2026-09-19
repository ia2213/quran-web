// ============================================================
// Quran Web App — JavaScript
// ============================================================

const API = 'https://api.alquran.cloud/v1';

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
// ÉTAT GLOBAL — visible depuis l'accueil
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
  searchQuery: '',
  // Options globales (accueil)
  readingMode: 'single',
  rangeStart: 1,
  rangeEnd: 5,
  loopEnabled: false,
  currentPage: 1,
  // Cache
  downloadedSurahs: {},
  downloading: {},
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================================
// INIT
// ============================================================
function init() {
  applyTheme(state.theme);
  loadSurahs();
  setupEventListeners();
  setupAudioPlayer();
  loadCacheStatus();

  // Synchroniser les éléments UI globaux avec l'état
  syncGlobalUI();
}

function syncGlobalUI() {
  // Chips de mode
  $$('.mode-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.mode === state.readingMode);
  });

  // Loop toggle
  const loopBtn = $('#loopToggle');
  loopBtn.classList.toggle('active', state.loopEnabled);
  loopBtn.querySelector('span').textContent = state.loopEnabled ? 'Boucle ✓' : 'Boucle';

  // Range config visibility
  $('#rangeConfigGlobal').style.display = state.readingMode === 'range' ? 'block' : 'none';
  $('#rangeStartGlobal').value = state.rangeStart;
  $('#rangeEndGlobal').value = state.rangeEnd;

  // Page config visibility
  $('#pageConfigGlobal').style.display = state.readingMode === 'page' ? 'block' : 'none';
  $('#pageInputGlobal').value = state.currentPage;

  // Reciter select
  const reciterSelect = $('#reciterSelect');
  // (déjà peuplé dans setupEventListeners)
  reciterSelect.value = state.reciter;
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
// SOURATES
// ============================================================
function loadSurahs() {
  const grid = $('#surahGrid');
  const countEl = $('#surahCount');
  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  try {
    renderSurahList(grid);
    countEl.textContent = `${SURAH_NAMES.length} sourates`;
  } catch {
    grid.innerHTML = '<div class="empty-state"><p>Impossible de charger les sourates.</p></div>';
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

    const badge = state.downloadedSurahs[num] ? '<span class="surah-downloaded-badge" style="position:absolute;top:6px;right:6px;font-size:10px;color:var(--primary);font-weight:600">✓</span>' : '';

    card.innerHTML = `
      ${badge}
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

  const active = grid.querySelector('.surah-card.active');
  if (active) {
    setTimeout(() => active.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }
}

// ============================================================
// LECTEUR
// ============================================================
function openSurah(surahNum) {
  state.currentSurah = surahNum;
  state.currentVerse = 1;
  state.isPlaying = false;

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
// MODE (global)
// ============================================================
function setReadingMode(mode) {
  state.readingMode = mode;
  state.loopEnabled = false;
  // Sync global UI
  $$('.mode-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.mode === mode);
  });
  $('#rangeConfigGlobal').style.display = mode === 'range' ? 'block' : 'none';
  $('#pageConfigGlobal').style.display = mode === 'page' ? 'block' : 'none';
  $('#loopToggle').classList.toggle('active', state.loopEnabled);
  $('#loopToggle').querySelector('span').textContent = state.loopEnabled ? 'Boucle ✓' : 'Boucle';
}

function applyGlobalRange() {
  let start = parseInt($('#rangeStartGlobal').value, 10) || 1;
  let end = parseInt($('#rangeEndGlobal').value, 10) || 5;
  const max = AYAH_COUNTS[state.currentSurah - 1] || 100;
  start = Math.max(1, Math.min(start, max));
  end = Math.max(start, Math.min(end, max));
  state.rangeStart = start;
  state.rangeEnd = end;

  if (state.currentSurah > 0 && $('#readerSection').style.display !== 'none') {
    state.currentVerse = start;
    updatePlayerStatus(`Plage: verset ${start}-${end}`);
    loadVerse(state.currentSurah, start);
  } else {
    updatePlayerStatus(`Plage définie: verset ${start}-${end}`);
  }
}

function applyGlobalPage() {
  let page = parseInt($('#pageInputGlobal').value, 10) || 1;
  page = Math.max(1, Math.min(page, 604));
  state.currentPage = page;

  if (state.currentSurah > 0 && $('#readerSection').style.display !== 'none') {
    const verse = estimateVerseForPage(state.currentSurah, page);
    if (verse) {
      state.currentVerse = verse;
      updatePlayerStatus(`Page ${page}`);
      loadVerse(state.currentSurah, verse);
    }
  } else {
    updatePlayerStatus(`Page ${page} (choisissez une sourate)`);
  }
}

function estimateVerseForPage(surah, page) {
  if (page < 1) return 1;
  const basePerPage = 15;
  return Math.min((page - 1) * basePerPage + 1, AYAH_COUNTS[surah - 1]);
}

// ============================================================
// BOUCLE (global)
// ============================================================
function toggleLoop() {
  state.loopEnabled = !state.loopEnabled;
  const btn = $('#loopToggle');
  btn.classList.toggle('active', state.loopEnabled);
  btn.querySelector('span').textContent = state.loopEnabled ? 'Boucle ✓' : 'Boucle';
  updatePlayerStatus(state.loopEnabled ? 'Boucle activée' : 'Boucle désactivée');
}

// ============================================================
// RÉCITATEUR (global)
// ============================================================
function setReciter(reciterId) {
  state.reciter = reciterId;
  const select = $('#reciterSelect');
  if (select) select.value = reciterId;
  if (state.isPlaying) {
    stopPlayback();
    playCurrentVerse();
  }
}

// ============================================================
// VERSETS
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
// AUDIO — native <audio> element (pas d'AudioContext)
// ============================================================
function setupAudioPlayer() {
  const audio = $('#audioPlayer');

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    $('#progressBar').value = Math.min(pct, 100);
    updatePlayerTime(formatTime(audio.currentTime));
  });

  audio.addEventListener('ended', () => {
    onAudioEnded();
  });

  audio.addEventListener('error', () => {
    console.error('Audio error');
    stopPlayback();
    updatePlayerStatus('Erreur audio');
  });
}

function playCurrentVerse() {
  if (state.isPlaying) return;
  const surah = state.currentSurah;
  const verse = state.currentVerse;
  const url = getRecitationUrl(surah, verse, state.reciter);
  url.then(u => {
    if (u) playAudioUrl(u);
    else updatePlayerStatus('Audio non disponible');
  }).catch(() => updatePlayerStatus('Erreur'));
}

function playAudioUrl(url) {
  if (state.isPlaying) return;

  const audio = $('#audioPlayer');
  audio.src = url;
  audio.style.display = 'none';

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(e => {
      console.error('Playback failed:', e);
      updatePlayerStatus('Erreur lecture');
      state.isPlaying = false;
      updatePlayButton();
    });
  }

  state.isPlaying = true;
  updatePlayButton();
  updatePlayerStatus('Lecture...');
}

function stopPlayback() {
  const audio = $('#audioPlayer');
  audio.pause();
  audio.currentTime = 0;
  state.isPlaying = false;
  updatePlayButton();
  updatePlayerStatus('En pause');
  $('#progressBar').value = 0;
}

function togglePlayback() {
  if (state.isPlaying) {
    stopPlayback();
  } else {
    // Mode range: jouer la plage
    if (state.readingMode === 'range') {
      playRange();
      return;
    }
    playCurrentVerse();
  }
}

function playRange() {
  const start = state.rangeStart;
  const end = state.rangeEnd;
  let current = start;

  function playNext() {
    if (current > end) {
      stopPlayback();
      updatePlayerStatus('Plage terminée');
      state.currentVerse = start;
      return;
    }

    state.currentVerse = current;
    loadVerse(state.currentSurah, current).then(() => {
      const url = getRecitationUrl(state.currentSurah, current, state.reciter);
      url.then(u => {
        if (u) {
          const audio = $('#audioPlayer');
          audio.src = u;
          audio.play().catch(() => {
            current++;
            playNext();
          });
        } else {
          current++;
          playNext();
        }
      }).catch(() => {
        current++;
        playNext();
      });
    });
  }

  playNext();
}

function onAudioEnded() {
  if (state.readingMode === 'range') return; // géré par playRange

  if (state.loopEnabled) {
    // Rejouer le même verset
    const url = getRecitationUrl(state.currentSurah, state.currentVerse, state.reciter);
    url.then(u => { if (u) playAudioUrl(u); });
  } else {
    nextVerse();
  }
}

// ============================================================
// NAVIGATION
// ============================================================
function prevVerse() {
  if (state.readingMode === 'range') {
    if (state.currentVerse > state.rangeStart) state.currentVerse--;
    return;
  }

  if (state.currentVerse > 1) {
    state.currentVerse--;
  } else if (state.currentSurah > 1) {
    state.currentSurah--;
    state.currentVerse = AYAH_COUNTS[state.currentSurah - 1];
  }
  loadVerse(state.currentSurah, state.currentVerse).then(() => {
    if (state.isPlaying) playCurrentVerse();
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
    if (state.isPlaying) playCurrentVerse();
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
    // Fallback EveryAyah
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
// TÉLÉCHARGEMENT
// ============================================================
async function downloadSurah(surahNum) {
  if (state.downloading[surahNum]) {
    updatePlayerStatus('Déjà en cours...');
    return;
  }

  state.downloading[surahNum] = true;
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
          // TODO: stocker en cache (IndexedDB) si besoin
          downloaded++;
        } catch { console.warn(`Verse ${verse} failed`); }
      }
      const pct = Math.round((downloaded / total) * 100);
      updatePlayerStatus(`${surahNum}: ${downloaded}/${total} (${pct}%)`);
    }

    state.downloadedSurahs[surahNum] = true;
    localStorage.setItem('quran-downloaded', JSON.stringify(state.downloadedSurahs));
    updatePlayerStatus(`Sourate ${surahNum} téléchargée!`);
    renderSurahList($('#surahGrid'));
    loadCacheStatus();
  } catch {
    updatePlayerStatus('Erreur téléchargement');
  } finally {
    state.downloading[surahNum] = false;
  }
}

function loadCacheStatus() {
  try {
    const saved = localStorage.getItem('quran-downloaded');
    if (saved) {
      state.downloadedSurahs = JSON.parse(saved);
      renderSurahList($('#surahGrid'));
    }
  } catch {}
}

async function handleDownloadClick() {
  const surah = state.currentSurah;

  if (state.downloadedSurahs[surah]) {
    if (confirm(`Sourate ${surah} déjà téléchargée. Supprimer du cache?`)) {
      delete state.downloadedSurahs[surah];
      localStorage.setItem('quran-downloaded', JSON.stringify(state.downloadedSurahs));
      renderSurahList($('#surahGrid'));
      loadCacheStatus();
    }
    return;
  }

  if (confirm(`Télécharger la sourate ${surah} (${AYAH_COUNTS[surah-1]} versets) pour consultation hors-ligne? Cela peut prendre quelques minutes.`)) {
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
  $('#themeToggle').addEventListener('click', toggleTheme);
  $('#backToList').addEventListener('click', closeReader);
  $('#playBtn').addEventListener('click', togglePlayback);
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

  // Reciter select
  const reciterSelect = $('#reciterSelect');
  RECITERS.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.label;
    reciterSelect.appendChild(opt);
  });
  reciterSelect.value = state.reciter;
  reciterSelect.addEventListener('change', () => {
    setReciter(reciterSelect.value);
  });

  // Global mode chips
  $$('.mode-chip').forEach(chip => {
    chip.addEventListener('click', () => setReadingMode(chip.dataset.mode));
  });

  // Global loop toggle
  $('#loopToggle').addEventListener('click', toggleLoop);

  // Global range apply
  $('#rangeApplyBtnGlobal').addEventListener('click', applyGlobalRange);

  // Global page go
  $('#pageGoBtnGlobal').addEventListener('click', applyGlobalPage);
  $('#pageInputGlobal').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyGlobalPage();
  });

  // Text options
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

  // Search
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

  // Keyboard shortcuts
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

  // Touch swipe
  let touchStartX = 0, touchStartY = 0;
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
      if (dx > 0) prevVerse(); else nextVerse();
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 80) {
      if (dy > 0) prevSurah(); else nextSurah();
    }
  }, { passive: true });

  // Download
  $('#downloadBtn').addEventListener('click', handleDownloadClick);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', init);

// Deep links
window.addEventListener('popstate', () => {
  const hash = location.hash;
  if (hash.startsWith('#surah-')) {
    const num = parseInt(hash.split('-')[1], 10);
    if (num >= 1 && num <= 114) openSurah(num);
  }
});

if (location.hash.startsWith('#surah-')) {
  const num = parseInt(location.hash.split('-')[1], 10);
  if (num >= 1 && num <= 114) setTimeout(() => openSurah(num), 300);
}
