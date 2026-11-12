const isMobileDevice = () => window.innerWidth <= 900;

const FALL_TERM = "2026/2027-1";
const SPRING_TERM = "2025/2026-2";
const DEFAULT_TERM = FALL_TERM;

let isDashPinned = localStorage.getItem('boun_pin_dash_card') === 'true';

const GRADE_POINTS = {
  'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5,
  'CC': 2.0, 'DC': 1.5, 'DD': 1.0, 'F': 0.0, 'P': null
};

const savedLang = localStorage.getItem('boun_lang');
let currentLang = (savedLang === 'tr' || savedLang === 'en')
  ? savedLang
  : ((navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en');

const translations = {
  tr: {
    appSubtitle: "| Ders & GPA Takip",
    deptLabel: "Bölüm:",
    addMinor: "🎓 Yandal Ekle",
    minorBtnTitle: "Yandal Programı Seç / Düzenle",
    minorLabelPrefix: "Yandal",
    minorRemoveTooltip: "Yandalı Kaldır",
    minorHasTitleSuffix: "(Kaldırmak için ✕ butonuna tıklayın)",
    exportBtn: "📥 JSON İndir",
    exportBtnTitle: "Mevcut ders planınızı ve notlarınızı JSON dosyası olarak indirin",
    importBtn: "📤 JSON Yükle",
    importBtnTitle: "Daha önce indirdiğiniz JSON planını yükleyin",
    feedbackBtn: "💬 Hata / Öneri",
    feedbackBtnTitle: "Hata Bildir veya Öneri Paylaş",
    supportBtn: "☕ Destek Ol",
    supportBtnTitle: "Projeye Destek Ol",
    toastSupportSoon: "☕ Destek bağlantısı yakında eklenecek!",
    resetBtn: "Sıfırla",
    resetBtnTitle: "Bölüm planını sıfırla",
    tabPool: "📋 Ders Havuzu",
    tabSemesters: "📅 Dönemler & Plan",
    remainingTotal: "Kalan / Toplam",
    selectedCourses: "Seçilen Ders",
    selectedCredits: "Seçilen Kredi",
    completed: "Tamamlanan",
    targetCredits: "Hedef Kredi",
    courseUnit: "Ders",
    coursePool: "Ders Havuzu",
    termBlocks: "Dönem Blokları",
    termPrefix: "Dönem",
    summerLabel: "Yaz",
    notTaken: "• Alınmadı",
    passedStatus: "🔒 Verildi",
    failedStatus: "✕ Verilmedi",
    plannedStatus: "• Döneme Eklendi",
    passedCheck: "Verdim",
    completedBadge: "✓ Geçildi",
    repeatBadge: "🔁 Tekrar",
    minorBadge: "🎓 Yandal",
    openCoursePage: "🔗 Ders Sayfasını Aç",
    coursePageTooltip: "için Boğaziçi BUIS ders arama sayfası (yeni sekmede açılır)",
    addToTermPlaceholder: "➕ Döneme Ekle...",
    addToTermBtn: "➕ Döneme Ekle",
    selectTermPrompt: "Eklemek istediğiniz dönemi seçin",
    mobileMenuTitle: "Araçlar",
    electiveInputPlaceholder: "Seçilen Ders Adı/Kodu...",
    gradeTooltip: "Harf Notu",
    removeMinorCourseTitle: "Bu yandal dersini kaldır",
    removeFromTermTitle: "Bu dönemden kaldır",
    otherFaculties: "Diğer Fakülteler",
    otherPrograms: "Diğer Lisans Programları",
    remainingTooltip: (rem, tot) => `Kalan: ${rem} Ders, Toplam: ${tot} Ders`,
    toastAddedToTerm: (code, semLabel) => `✓ ${code} → ${semLabel} eklendi`,
    toastExportSuccess: "✓ Plan başarıyla JSON olarak indirildi!",
    toastImportSuccess: "✓ Plan başarıyla yüklendi!",
    toastMinorApplied: (name, count) => `✓ ${name} seçildi (${count} ders). Dersler sol paneldeki ilgili dönem bloklarına eklendi!`,
    toastMinorRemoved: "Yandal programı kaldırıldı.",
    toastFeedbackSuccess: "✓ Bildiriminiz başarıyla iletildi, teşekkürler!",
    confirmReset: (deptName) => `Yalnızca "${deptName}" bölümü planlamanız sıfırlanacak. Emin misiniz?`,
    confirmOverwriteImport: "Yüklemek istediğiniz plan mevcut planınızın üzerine yazılacak. Devam etmek istiyor musunuz?",
    confirmRemoveMinor: "Mevcut yandal programını ve dönemlerdeki yandal derslerini kaldırmak istediğinize emin misiniz?",
    alertExportError: "Dışa aktarma sırasında bir hata oluştu: ",
    alertImportError: "Hata: JSON dosyası yüklenemedi!\n",
    alertFileReadError: "Dosya okunamadı. Lütfen tekrar deneyin.",
    alertFeedbackRequired: "Lütfen başlık ve açıklama alanlarını eksiksiz doldurun.",
    alertFeedbackError: "Bildirim gönderilirken bir hata oluştu: ",
    tryAgain: "Lütfen tekrar deneyin.",
    serverError: "Sunucu hatası",
    errInvalidJson: "Dosya geçerli bir JSON formatında değil.",
    errEmptyData: "Geçersiz veya boş veri formatı.",
    errNoPlanFound: "JSON dosyasında geçerli bir ders planı veya dönem kaydı bulunamadı.",
    feedbackModalTitle: "💬 Hata / Öneri Bildir",
    feedbackTitleLabel: "Başlık",
    feedbackTitlePlaceholder: "Örn: CMPE 250 önkoşulu hatalı",
    feedbackCategoryLabel: "Kategori",
    feedbackCategories: {
      "Hatalı Ders/Önkoşul": "Hatalı Ders/Önkoşul",
      "Yeni Özellik Önerisi": "Yeni Özellik Önerisi",
      "Arayüz/Hesaplama Hatası": "Arayüz/Hesaplama Hatası",
      "Diğer": "Diğer"
    },
    feedbackDescLabel: "Açıklama",
    feedbackDescPlaceholder: "Detaylı açıklama...",
    cancel: "İptal",
    submit: "Gönder",
    submitting: "Gönderiliyor...",
    minorModalTitle: "🎓 Yandal Programı Seçimi",
    minorSelectLabel: "Yandal Programı Seçin",
    minorNoSelectionOption: "(Yandal Yok / İptal Et)",
    minorPreviewPlaceholder: "Lütfen incelemek istediğiniz bir yandal programı seçin.",
    minorPreviewRemoved: "(Yandal seçilmedi veya mevcut yandal iptal edilecek.)",
    minorTotalCourses: "Toplam Ders:",
    minorCredits: "Kredi:",
    minorAppGpa: "Başvuru GPA:",
    minorPrereq: "Önkoşul:",
    minorSampleDist: "Örnek Ders Dağılımı:",
    minorElectiveLabel: "Seçmeli",
    minorElectiveCourseSuffix: "Seçmeli Dersi",
    minorElectiveTag: "(Yandal Seçmeli)",
    minorPoolDefaultName: "Yandal Seçmeli Dersi",
    minorCancelBtn: "Vazgeç",
    minorApplyBtn: "Yandalı Uygula",
    semGroupLabels: {
      '1.1': '1. Dönem (1. Yıl Güz)',
      '1.2': '2. Dönem (1. Yıl Bahar)',
      '2.1': '3. Dönem (2. Yıl Güz)',
      '2.2': '4. Dönem (2. Yıl Bahar)',
      '3.1': '5. Dönem (3. Yıl Güz)',
      '3.2': '6. Dönem (3. Yıl Bahar)',
      '4.1': '7. Dönem (4. Yıl Güz)',
      '4.2': '8. Dönem (4. Yıl Bahar)',
      'other': 'Diğer / Genel Seçmeliler'
    },
    yearLabels: {
      '0. Yıl (Hazırlık / Erken Dönem)': '0. Yıl (Hazırlık / Erken Dönem)',
      '1. Yıl': '1. Yıl',
      '2. Yıl': '2. Yıl',
      '3. Yıl': '3. Yıl',
      '4. Yıl (Normal Mezuniyet)': '4. Yıl (Normal Mezuniyet)',
      '5. Yıl (1. Uzatma)': '5. Yıl (1. Uzatma)',
      '6. Yıl (2. Uzatma)': '6. Yıl (2. Uzatma)',
      '7. Yıl (Azami Yasal Süre)': '7. Yıl (Azami Yasal Süre)'
    },
    limitTag: "YÖK Sınır",
    loadErrorTitle: "Müfredat Verisi Yüklenemedi!",
    loadErrorDesc: "<code>curriculum.json</code> dosyasının <code>index.html</code> ile aynı klasörde olduğundan ve sayfayı yerel bir sunucu (Live Server vb.) üzerinden açtığınızdan emin olun.",
    loadErrorDetail: "Hata detayı:",
    pinCardTitle: "Kartı Üste Sabitle",
    unpinCardTitle: "Sabitlemeyi Kaldır"
  },
  en: {
    appSubtitle: "| Course & GPA Tracker",
    deptLabel: "Department:",
    addMinor: "🎓 Add Minor",
    minorBtnTitle: "Select / Edit Minor Program",
    minorLabelPrefix: "Minor",
    minorRemoveTooltip: "Remove Minor",
    minorHasTitleSuffix: "(Click ✕ to remove)",
    exportBtn: "📥 Export JSON",
    exportBtnTitle: "Download your current course plan and grades as a JSON file",
    importBtn: "📤 Import JSON",
    importBtnTitle: "Load a previously exported JSON plan",
    feedbackBtn: "💬 Feedback",
    feedbackBtnTitle: "Report an Issue or Share Feedback",
    supportBtn: "☕ Support",
    supportBtnTitle: "Support the Project",
    toastSupportSoon: "☕ Support link coming soon!",
    resetBtn: "Reset",
    resetBtnTitle: "Reset department plan",
    tabPool: "📋 Course Pool",
    tabSemesters: "📅 Semesters & Plan",
    remainingTotal: "Remaining / Total",
    selectedCourses: "Selected Courses",
    selectedCredits: "Selected Credits",
    completed: "Completed",
    targetCredits: "Target Credits",
    courseUnit: "Courses",
    coursePool: "Course Pool",
    termBlocks: "Term Blocks",
    termPrefix: "Term",
    summerLabel: "Summer",
    notTaken: "• Not Taken",
    passedStatus: "🔒 Passed",
    failedStatus: "✕ Failed",
    plannedStatus: "• Planned",
    passedCheck: "Passed",
    completedBadge: "✓ Completed",
    repeatBadge: "🔁 Repeat",
    minorBadge: "🎓 Minor",
    openCoursePage: "🔗 Open Course Page",
    coursePageTooltip: "Boğaziçi BUIS course search page (opens in new tab)",
    addToTermPlaceholder: "➕ Add to Term...",
    addToTermBtn: "➕ Add to Term",
    selectTermPrompt: "Select a term to add",
    mobileMenuTitle: "Tools",
    electiveInputPlaceholder: "Selected Course Name/Code...",
    gradeTooltip: "Letter Grade",
    removeMinorCourseTitle: "Remove this minor course",
    removeFromTermTitle: "Remove from this term",
    otherFaculties: "Other Faculties",
    otherPrograms: "Other Undergraduate Programs",
    remainingTooltip: (rem, tot) => `Remaining: ${rem} Courses, Total: ${tot} Courses`,
    toastAddedToTerm: (code, semLabel) => `✓ ${code} → Added to ${semLabel}`,
    toastExportSuccess: "✓ Plan successfully exported as JSON!",
    toastImportSuccess: "✓ Plan successfully imported!",
    toastMinorApplied: (name, count) => `✓ ${name} selected (${count} courses). Courses added to the corresponding term blocks on the left!`,
    toastMinorRemoved: "Minor program removed.",
    toastFeedbackSuccess: "✓ Your feedback has been submitted, thank you!",
    confirmReset: (deptName) => `Only your "${deptName}" department plan will be reset. Are you sure?`,
    confirmOverwriteImport: "The plan you are importing will overwrite your current plan. Do you want to continue?",
    confirmRemoveMinor: "Are you sure you want to remove the current minor program and its courses from your terms?",
    alertExportError: "An error occurred while exporting: ",
    alertImportError: "Error: Could not import JSON file!\n",
    alertFileReadError: "Could not read file. Please try again.",
    alertFeedbackRequired: "Please fill in both title and description fields.",
    alertFeedbackError: "An error occurred while submitting feedback: ",
    tryAgain: "Please try again.",
    serverError: "Server error",
    errInvalidJson: "The file is not in valid JSON format.",
    errEmptyData: "Invalid or empty data format.",
    errNoPlanFound: "No valid course plan or term records found in the JSON file.",
    feedbackModalTitle: "💬 Report Issue / Feedback",
    feedbackTitleLabel: "Title",
    feedbackTitlePlaceholder: "e.g., CMPE 250 prerequisite is incorrect",
    feedbackCategoryLabel: "Category",
    feedbackCategories: {
      "Hatalı Ders/Önkoşul": "Course / Prerequisite Error",
      "Yeni Özellik Önerisi": "Feature Request",
      "Arayüz/Hesaplama Hatası": "UI / Calculation Bug",
      "Diğer": "Other"
    },
    feedbackDescLabel: "Description",
    feedbackDescPlaceholder: "Detailed description...",
    cancel: "Cancel",
    submit: "Submit",
    submitting: "Submitting...",
    minorModalTitle: "🎓 Minor Program Selection",
    minorSelectLabel: "Select Minor Program",
    minorNoSelectionOption: "(No Minor / Remove)",
    minorPreviewPlaceholder: "Please select a minor program to preview.",
    minorPreviewRemoved: "(No minor selected or current minor will be removed.)",
    minorTotalCourses: "Total Courses:",
    minorCredits: "Credits:",
    minorAppGpa: "Min. Application GPA:",
    minorPrereq: "Prerequisites:",
    minorSampleDist: "Sample Course Distribution:",
    minorElectiveLabel: "Elective",
    minorElectiveCourseSuffix: "Elective Course",
    minorElectiveTag: "(Minor Elective)",
    minorPoolDefaultName: "Minor Elective Course",
    minorCancelBtn: "Cancel",
    minorApplyBtn: "Apply Minor",
    semGroupLabels: {
      '1.1': 'Term 1 (Year 1 Fall)',
      '1.2': 'Term 2 (Year 1 Spring)',
      '2.1': 'Term 3 (Year 2 Fall)',
      '2.2': 'Term 4 (Year 2 Spring)',
      '3.1': 'Term 5 (Year 3 Fall)',
      '3.2': 'Term 6 (Year 3 Spring)',
      '4.1': 'Term 7 (Year 4 Fall)',
      '4.2': 'Term 8 (Year 4 Spring)',
      'other': 'Other / General Electives'
    },
    yearLabels: {
      '0. Yıl (Hazırlık / Erken Dönem)': 'Year 0 (Prep / Early Term)',
      '1. Yıl': 'Year 1',
      '2. Yıl': 'Year 2',
      '3. Yıl': 'Year 3',
      '4. Yıl (Normal Mezuniyet)': 'Year 4 (Regular Graduation)',
      '5. Yıl (1. Uzatma)': 'Year 5 (Extension 1)',
      '6. Yıl (2. Uzatma)': 'Year 6 (Extension 2)',
      '7. Yıl (Azami Yasal Süre)': 'Year 7 (Max Legal Duration)'
    },
    limitTag: "Max Limit",
    loadErrorTitle: "Failed to Load Curriculum Data!",
    loadErrorDesc: "Make sure <code>curriculum.json</code> is in the same folder as <code>index.html</code> and that you are serving the page over a local HTTP server (e.g., Live Server).",
    loadErrorDetail: "Error details:",
    pinCardTitle: "Pin Card",
    unpinCardTitle: "Unpin Card"
  }
};

function t(key) {
  return translations[currentLang][key] ?? translations.tr[key] ?? key;
}

function formatSemLabel(semId) {
  const displaySem = currentLang === 'en'
    ? String(semId).replace('(Yaz)', `(${t('summerLabel')})`)
    : String(semId);
  return `${t('termPrefix')} ${displaySem}`;
}

function translatePrereq(prereqStr) {
  if (!prereqStr || currentLang === 'tr') return prereqStr;
  return String(prereqStr)
    .replace(/Önkoşul:/g, 'Prerequisite:')
    .replace(/Eş koşul:/g, 'Corequisite:')
    .replace(/Hoca Onayı/g, 'Instructor Consent')
    .replace(/Son Sınıf Şartı/g, 'Senior Standing')
    .replace(/İngilizce Yeterlilik \(BUEPT\)/g, 'English Proficiency (BUEPT)')
    .replace(/ veya /g, ' or ')
    .replace(/ ve /g, ' and ');
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLang;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  };
  const setAttr = (id, attr, val) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute(attr, val);
  };

  setText('appSubtitle', t('appSubtitle'));
  setText('deptLabel', t('deptLabel'));
  setText('exportBtn', t('exportBtn'));
  setAttr('exportBtn', 'title', t('exportBtnTitle'));
  setText('importBtn', t('importBtn'));
  setAttr('importBtn', 'title', t('importBtnTitle'));
  setText('feedbackBtn', t('feedbackBtn'));
  setAttr('feedbackBtn', 'title', t('feedbackBtnTitle'));
  setText('supportBtn', t('supportBtn'));
  setAttr('supportBtn', 'title', t('supportBtnTitle'));
  setText('resetBtn', t('resetBtn'));
  setAttr('resetBtn', 'title', t('resetBtnTitle'));

  const langHtml = currentLang === 'tr'
    ? '<span class="lang-active">TR</span> <span class="lang-muted">| EN</span>'
    : '<span class="lang-muted">TR |</span> <span class="lang-active">EN</span>';
  const langLabel = document.getElementById('langToggleLabel');
  if (langLabel) langLabel.innerHTML = langHtml;
  const mobileLangLabel = document.getElementById('mobileLangToggleLabel');
  if (mobileLangLabel) mobileLangLabel.innerHTML = langHtml;
  setAttr('mobileMenuBtn', 'title', t('mobileMenuTitle'));
  setText('termPickerSubtitle', t('selectTermPrompt'));

  setText('tabBtnPool', t('tabPool'));
  setText('tabBtnSemesters', t('tabSemesters'));
  setText('labelRemainingTotal', t('remainingTotal'));
  setText('labelSelectedCourses', t('selectedCourses'));
  setText('labelSelectedCredits', t('selectedCredits'));
  setText('labelCompleted', t('completed'));
  setText('labelTargetCredits', t('targetCredits'));
  setText('sidebarPoolSubtitle', t('termBlocks'));

  // Feedback modal
  setText('feedbackModalTitle', t('feedbackModalTitle'));
  setText('feedbackTitleLabel', t('feedbackTitleLabel'));
  setAttr('feedbackTitle', 'placeholder', t('feedbackTitlePlaceholder'));
  setText('feedbackCategoryLabel', t('feedbackCategoryLabel'));
  setText('feedbackDescLabel', t('feedbackDescLabel'));
  setAttr('feedbackDesc', 'placeholder', t('feedbackDescPlaceholder'));
  setText('feedbackCancelBtn', t('cancel'));
  const fbSubmitBtn = document.getElementById('feedbackSubmitBtn');
  if (fbSubmitBtn && !fbSubmitBtn.disabled) {
    fbSubmitBtn.innerHTML = `<span>${escapeHTML(t('submit'))}</span>`;
  }
  const catSelect = document.getElementById('feedbackCategory');
  if (catSelect) {
    const catMap = t('feedbackCategories');
    Array.from(catSelect.options).forEach(opt => {
      if (catMap[opt.value]) opt.textContent = catMap[opt.value];
    });
  }

  // Minor modal
  setText('minorModalTitle', t('minorModalTitle'));
  setText('minorSelectLabel', t('minorSelectLabel'));
  setText('minorCancelBtn', t('minorCancelBtn'));
  const minorApplyBtn = document.getElementById('minorApplyBtn');
  if (minorApplyBtn) {
    minorApplyBtn.innerHTML = `<span>${escapeHTML(t('minorApplyBtn'))}</span>`;
  }

  updatePinButtonUI();
}

function toggleLanguage() {
  currentLang = currentLang === 'tr' ? 'en' : 'tr';
  localStorage.setItem('boun_lang', currentLang);
  applyStaticTranslations();
  populateDepartmentSelect();
  populateMinorModalOptions();
  const minorSelect = document.getElementById('minorSelect');
  if (minorSelect) {
    const state = getDeptState(currentDept);
    minorSelect.value = state.selectedMinorId || '';
    handleMinorSelectChange(minorSelect.value);
  }
  initUI();
}

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BOUN_BOLUM_MAP = {
  PHYS: "PHYSICS",
  CHEM: "CHEMISTRY",
  MATH: "MATHEMATICS",
  BIO: "MOLECULAR+BIOLOGY+AND+GENETICS",
  CET: "COMPUTER+EDUCATION+AND+EDUCATIONAL+TECHNOLOGY",
  ED: "EDUCATIONAL+SCIENCES",
  PRED: "PRIMARY+EDUCATION",
  SCED: "MATHEMATICS+AND+SCIENCE+EDUCATION",
  FLED: "FOREIGN+LANGUAGE+EDUCATION",
  LAW: "LAW",
  EC: "ECONOMICS",
  AD: "MANAGEMENT",
  POLS: "POLITICAL+SCIENCE+AND+INTERNATIONAL+RELATIONS",
  TRM: "TOURISM+ADMINISTRATION",
  INTT: "INTERNATIONAL+TRADE",
  MIS: "MANAGEMENT+INFORMATION+SYSTEMS",
  CMPE: "COMPUTER+ENGINEERING",
  EE: "ELECTRICAL+AND+ELECTRONICS+ENGINEERING",
  IE: "INDUSTRIAL+ENGINEERING",
  CE: "CIVIL+ENGINEERING",
  CHE: "CHEMICAL+ENGINEERING",
  ME: "MECHANICAL+ENGINEERING",
  SOC: "SOCIOLOGY",
  PSY: "PSYCHOLOGY",
  HIST: "HISTORY",
  TKL: "TURKISH+LANGUAGE+AND+LITERATURE",
  TR: "TRANSLATION+AND+INTERPRETING+STUDIES",
  INT: "TRANSLATION+AND+INTERPRETING+STUDIES",
  LING: "LINGUISTICS",
  PHIL: "PHILOSOPHY",
  EL: "WESTERN+LANGUAGES+AND+LITERATURES",
  AL: "WESTERN+LANGUAGES+AND+LITERATURES",
  CL: "WESTERN+LANGUAGES+AND+LITERATURES",
  DRA: "WESTERN+LANGUAGES+AND+LITERATURES",
  ENGL: "WESTERN+LANGUAGES+AND+LITERATURES",
  HUM: "HUMANITIES+COURSES+COORDINATORSHIP",
  HTR: "ATATURK+INSTITUTE+FOR+MODERN+TURKISH+HISTORY",
  TK: "TURKISH+COURSES+COORDINATOR",
  AE: { bolum: "SCHOOL+OF+FOREIGN+LANGUAGES", kisaadi: "YADYOK" },
  ESC: "ENVIRONMENTAL+SCIENCES",
  ENGG: "ENGINEERING",
  OHS: "OCCUPATIONAL+HEALTH+AND+SAFETY",
  STS: "SCIENCE+TECHNOLOGY+AND+SOCIETY",
  TID: "TURKISH+SIGN+LANGUAGE",
  TKF: "TURKISH+COURSES+COORDINATOR",
  ARB: "MODERN+LANGUAGES+UNIT",
  ARM: "MODERN+LANGUAGES+UNIT",
  CHIN: "MODERN+LANGUAGES+UNIT",
  FR: "MODERN+LANGUAGES+UNIT",
  GER: "MODERN+LANGUAGES+UNIT",
  GR: "MODERN+LANGUAGES+UNIT",
  HUNG: "MODERN+LANGUAGES+UNIT",
  ITA: "MODERN+LANGUAGES+UNIT",
  JP: "MODERN+LANGUAGES+UNIT",
  KR: "MODERN+LANGUAGES+UNIT",
  LAT: "WESTERN+LANGUAGES+AND+LITERATURES",
  PER: "MODERN+LANGUAGES+UNIT",
  POR: "MODERN+LANGUAGES+UNIT",
  RUS: "MODERN+LANGUAGES+UNIT",
  SPA: "MODERN+LANGUAGES+UNIT",
  CAU: "CAUCASIAN+LANGUAGES+AND+CULTURES"
};

function resolveCourseTerm(courseOrSem, courseCode) {
  let sem = '';
  if (typeof courseOrSem === 'string') {
    sem = courseOrSem.trim();
  } else if (courseOrSem && typeof courseOrSem === 'object' && courseOrSem.sem) {
    sem = String(courseOrSem.sem).trim();
  }

  // Aşama 1: Geçerli müfredat dönemi (.1 veya .2) kontrolü
  if (sem.endsWith('.2')) return SPRING_TERM;
  if (sem.endsWith('.1')) return FALL_TERM;

  // sem yoksa veya yaz dönemi ise courseCode ile curriculum.json'da ara
  const normalizedCode = (courseCode || (courseOrSem && typeof courseOrSem === 'object' ? courseOrSem.code : '') || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');

  if (normalizedCode) {
    const matched = findCourseByCode(normalizedCode);
    if (matched && matched.sem) {
      const matchedSem = String(matched.sem).trim();
      if (matchedSem.endsWith('.2')) return SPRING_TERM;
      if (matchedSem.endsWith('.1')) return FALL_TERM;
    }

    // Aşama 2: Ders numarası teklik / çiftlik çıkarımı (Heuristic Fallback)
    const numMatch = normalizedCode.match(/(\d{3})/) || normalizedCode.match(/(\d+)/);
    if (numMatch) {
      const digits = numMatch[1];
      const lastDigit = parseInt(digits.charAt(digits.length - 1), 10);
      return lastDigit % 2 === 0 ? SPRING_TERM : FALL_TERM;
    }
  }

  return FALL_TERM;
}

function getBounCourseUrl(courseCode, term = FALL_TERM) {
  if (!courseCode || typeof courseCode !== 'string') return null;
  const sanitized = courseCode.trim().toUpperCase();

  // Birden fazla seçenek, alternatif veya belirsizlik içeren durumları ele
  if (sanitized.includes('/') || sanitized.includes('\\') || sanitized.includes('|') ||
      sanitized.includes('--') || sanitized.includes('*') || sanitized.includes('?') ||
      /\b(OR|VEYA)\b/.test(sanitized) ||
      sanitized.includes('SEÇMELİ') || sanitized.includes('SECMELI') ||
      sanitized.includes('ELECTIVE') || sanitized.includes('ELECT')) {
    return null;
  }

  // Sadece net tekil ders kodu: 2-4 harfli önek, isteğe bağlı boşluk, 3 basamaklı ders numarası (opsiyonel harf/ek ile)
  const match = sanitized.match(/^([A-Z]{2,4})\s*(\d{3}[A-Z0-9\.]*)$/);
  if (!match) return null;

  const prefix = match[1];
  const number = match[2];
  const compactCode = `${prefix}${number}`;
  const focusCourse = prefix.length <= 2 ? `${prefix}+${number}.01` : `${prefix}${number}.01`;
  const encodedTerm = encodeURIComponent(term);
  const entry = BOUN_BOLUM_MAP[prefix];

  if (entry) {
    const bolumName = typeof entry === "string" ? entry : entry.bolum;
    const kisaAdi = (typeof entry === "object" && entry.kisaadi) ? entry.kisaadi : prefix;
    return `https://registration.bogazici.edu.tr/login/?page=course-search&semester=${encodedTerm}&q=${compactCode.toLowerCase()}&term=${encodedTerm}&kisaadi=${kisaAdi}&bolum=${bolumName}&focus=${focusCourse}`;
  }

  return `https://registration.bogazici.edu.tr/login/?page=course-search&semester=${encodedTerm}&q=${compactCode.toLowerCase()}`;
}

const yearStructure = [
  { yearLabel: '0. Yıl (Hazırlık / Erken Dönem)', isExtended: false, sems: ['0.1', '0.2', '0.3 (Yaz)'] },
  { yearLabel: '1. Yıl', isExtended: false, sems: ['1.1', '1.2', '1.3 (Yaz)'] },
  { yearLabel: '2. Yıl', isExtended: false, sems: ['2.1', '2.2', '2.3 (Yaz)'] },
  { yearLabel: '3. Yıl', isExtended: false, sems: ['3.1', '3.2', '3.3 (Yaz)'] },
  { yearLabel: '4. Yıl (Normal Mezuniyet)', isExtended: false, sems: ['4.1', '4.2', '4.3 (Yaz)'] },
  { yearLabel: '5. Yıl (1. Uzatma)', isExtended: true, sems: ['5.1', '5.2', '5.3 (Yaz)'] },
  { yearLabel: '6. Yıl (2. Uzatma)', isExtended: true, sems: ['6.1', '6.2', '6.3 (Yaz)'] },
  { yearLabel: '7. Yıl (Azami Yasal Süre)', isExtended: true, tag: 'YÖK Sınır', sems: ['7.1', '7.2', '7.3 (Yaz)'] }
];

const SEMESTER_ORDER = [];
yearStructure.forEach(y => y.sems.forEach(s => SEMESTER_ORDER.push(s)));

function getSemesterOrderIndex(semId) {
  const idx = SEMESTER_ORDER.indexOf(semId);
  if (idx !== -1) return idx;
  const match = String(semId || '').match(/^(\d+)\.(\d+)/);
  if (match) {
    return parseInt(match[1], 10) * 3 + (parseInt(match[2], 10) - 1);
  }
  return Number.MAX_SAFE_INTEGER;
}

function compareSemesters(semA, semB) {
  return getSemesterOrderIndex(semA) - getSemesterOrderIndex(semB);
}

function isRepeatInstance(inst, instances) {
  if (!inst || !Array.isArray(instances)) return false;
  const sameCourse = instances.filter(i => i.courseId === inst.courseId);
  if (sameCourse.length <= 1) return false;

  const sortedSame = [...sameCourse].sort((a, b) => {
    const cmp = compareSemesters(a.semId, b.semId);
    if (cmp !== 0) return cmp;
    return instances.indexOf(a) - instances.indexOf(b);
  });

  return sortedSame[0].instanceId !== inst.instanceId;
}

function refreshRepeatBadges() {
  const state = getDeptState(currentDept);
  const instances = state.instances || [];
  instances.forEach(inst => {
    const card = document.getElementById(`inst-${inst.instanceId}`);
    if (!card) return;
    const titleGroup = card.querySelector('.course-header > div:first-child');
    if (!titleGroup) return;

    const shouldShowRepeat = isRepeatInstance(inst, instances);
    let badge = titleGroup.querySelector('.repeat-badge');
    if (shouldShowRepeat && !badge) {
      badge = document.createElement('span');
      badge.className = 'repeat-badge';
      badge.textContent = t('repeatBadge');
      titleGroup.appendChild(badge);
    } else if (shouldShowRepeat && badge) {
      badge.textContent = t('repeatBadge');
    } else if (!shouldShowRepeat && badge) {
      badge.remove();
    }
  });
}

let departmentsData = {};
let minorsData = {};
let currentDept = localStorage.getItem('boun_active_dept') || 'math';
let globalState = JSON.parse(localStorage.getItem('boun_multi_dept_gpa_state')) || {};

async function loadCurriculum() {
  try {
    const [currResp, minorsResp] = await Promise.all([
      fetch('./curriculum.json'),
      fetch('./minors.json')
    ]);

    if (!currResp.ok) throw new Error(`HTTP Hata: ${currResp.status}`);
    departmentsData = await currResp.json();

    if (minorsResp.ok) {
      try {
        minorsData = await minorsResp.json();
      } catch (mErr) {
        console.warn("minors.json okunamadı:", mErr);
      }
    }

    const availableKeys = Object.keys(departmentsData);
    if (!departmentsData[currentDept]) {
      currentDept = availableKeys[0] || 'math';
    }

    // Bir kerelik geçiş temizliği: Sadece eski otomatik atama sürümünden kalan yandal kayıtlarını temizler
    const LEGACY_CLEANUP_KEY = 'boun_legacy_auto_minor_cleaned_v1';
    if (!localStorage.getItem(LEGACY_CLEANUP_KEY)) {
      let cleanedAutoMinors = false;
      Object.keys(globalState).forEach(k => {
        if (globalState[k] && Array.isArray(globalState[k].instances)) {
          const beforeCount = globalState[k].instances.length;
          globalState[k].instances = globalState[k].instances.filter(inst => {
            // Yalnızca eski otomatik atamadan kalmış (inst_minor_) ve not verilmemiş kayıtları temizle
            const isLegacyAuto = inst.instanceId && String(inst.instanceId).startsWith('inst_minor_') && !inst.passed;
            return !isLegacyAuto;
          });
          if (globalState[k].instances.length !== beforeCount) {
            cleanedAutoMinors = true;
          }
        }
      });
      if (cleanedAutoMinors) {
        saveGlobalState();
      }
      localStorage.setItem(LEGACY_CLEANUP_KEY, 'true');
    }

    applyStaticTranslations();
    populateDepartmentSelect();
    populateMinorModalOptions();
    initUI();
  } catch (err) {
    console.error("Müfredat JSON dosyası yüklenemedi:", err);
    document.body.innerHTML = `
      <div style="padding: 24px; font-family: sans-serif; color: #b91c1c; text-align: center;">
        <h2>${t('loadErrorTitle')}</h2>
        <p>${t('loadErrorDesc')}</p>
        <p style="color: #64748b; font-size: 0.85rem;">${escapeHTML(t('loadErrorDetail'))} ${escapeHTML(err.message)}</p>
      </div>
    `;
  }
}

const FACULTY_EN_MAP = {
  "Fen Fakültesi": "Faculty of Arts and Sciences",
  "Eğitim Fakültesi": "Faculty of Education",
  "Hukuk Fakültesi": "Faculty of Law",
  "İktisadi ve İdari Bilimler Fakültesi": "Faculty of Economics and Administrative Sciences",
  "Mühendislik Fakültesi": "Faculty of Engineering",
  "İnsan ve Toplum Bilimleri Fakültesi": "Faculty of Humanities and Social Sciences",
  "Uygulamalı Bilimler Fakültesi": "School of Applied Disciplines",
  "Diğer Lisans Programları": "Other Undergraduate Programs",
  "Diğer Fakülteler": "Other Faculties"
};

const DEPT_EN_MAP = {
  phys: "Physics (PHYS)",
  chem: "Chemistry (CHEM)",
  math: "Mathematics (MATH)",
  mbg: "Molecular Biology and Genetics (MBG)",
  cet: "Computer Education and Educational Technology (CET)",
  ed: "Guidance and Psychological Counseling (ED)",
  pred: "Early Childhood Education (PRED)",
  sced_sci: "Science Education (SCED_SCI)",
  sced_sec_math: "Secondary School Mathematics Education (SCED_SEC_MATH)",
  sced_math: "Primary Mathematics Education (SCED_MATH)",
  sced_chem: "Chemistry Education (SCED_CHEM)",
  sced_phy: "Physics Education (SCED_PHY)",
  fled: "English Language Teaching (FLED)",
  law: "Law (LAW)",
  econ: "Economics (ECON)",
  mgmt_a: "Management - Program A (MGMT_A)",
  mgmt_b: "Management - Program B (MGMT_B)",
  pols: "Political Science and International Relations (POLS)",
  tour: "Tourism Administration (TOUR)",
  intt: "International Trade (INTT)",
  mis: "Management Information Systems (MIS)",
  cmpe: "Computer Engineering (CMPE)",
  ee: "Electrical and Electronics Engineering (EE)",
  ie: "Industrial Engineering (IE)",
  ce: "Civil Engineering (CE)",
  che: "Chemical Engineering (CHE)",
  me: "Mechanical Engineering (ME)",
  soc: "Sociology (SOC)",
  psy: "Psychology (PSY)",
  hist: "History (HIST)",
  tkl: "Turkish Language and Literature (TKL)",
  transint: "Translation and Interpreting Studies (TRANSINT)",
  ling: "Linguistics (LING)",
  phil: "Philosophy (PHIL)",
  wll: "Western Languages and Literatures (WLL)"
};

const MINOR_EN_MAP = {
  wll_minor: "Western Languages and Literatures (WLL) Minor",
  cmpe_minor: "Computer Engineering (CMPE) Minor",
  cet_minor: "Information and Communication Technologies in Education (CET) Minor",
  ee_minor: "Electrical and Electronics Engineering (EE) Minor",
  ie_prod_minor: "Industrial Engineering: Production and Service Systems Minor",
  ie_or_minor: "Industrial Engineering: Operations Research (OR) Minor",
  econ_minor: "Economics (EC) Minor",
  mgmt_minor: "Management (AD) Minor",
  chem_minor: "Chemistry (CHEM) Minor",
  me_minor: "Mechanical Engineering (ME) Minor",
  mbg_minor: "Molecular Biology and Genetics (MBG) Minor",
  pols_minor: "Political Science and International Relations (POLS) Minor",
  trm_minor: "Tourism Administration (TRM) Minor",
  tkl_minor: "Turkish Language and Literature (TKL) Minor",
  intt_minor: "International Trade (INTT) Minor",
  mis_minor: "Management Information Systems (MIS) Minor"
};

function getLocalizedFacultyName(trFaculty) {
  if (!trFaculty) return '';
  if (currentLang === 'en' && FACULTY_EN_MAP[trFaculty]) {
    return FACULTY_EN_MAP[trFaculty];
  }
  return trFaculty;
}

function getLocalizedDeptName(deptKey) {
  if (currentLang === 'en' && DEPT_EN_MAP[deptKey]) {
    return DEPT_EN_MAP[deptKey];
  }
  return departmentsData[deptKey]?.name || deptKey;
}

function getLocalizedMinorName(minorKey) {
  if (currentLang === 'en' && MINOR_EN_MAP[minorKey]) {
    return MINOR_EN_MAP[minorKey];
  }
  return minorsData[minorKey]?.name || minorKey;
}

/* Fakültelere Göre optgroup Üreten Gelişmiş Seçim Menüsü */
function populateDepartmentSelect() {
  const select = document.getElementById('deptSelect');
  select.innerHTML = '';

  const faculties = {};
  Object.keys(departmentsData).forEach(deptKey => {
    const dept = departmentsData[deptKey];
    const facultyName = dept.faculty ? getLocalizedFacultyName(dept.faculty) : t('otherPrograms');
    if (!faculties[facultyName]) {
      faculties[facultyName] = [];
    }
    faculties[facultyName].push({ key: deptKey, name: getLocalizedDeptName(deptKey) });
  });

  Object.keys(faculties).forEach(facultyName => {
    const group = document.createElement('optgroup');
    group.label = facultyName;

    faculties[facultyName].forEach(dept => {
      const opt = document.createElement('option');
      opt.value = dept.key;
      opt.textContent = dept.name;
      if (dept.key === currentDept) opt.selected = true;
      group.appendChild(opt);
    });

    select.appendChild(group);
  });
}

function populateMinorModalOptions() {
  const select = document.getElementById('minorSelect');
  if (!select) return;
  select.innerHTML = `<option value="">${escapeHTML(t('minorNoSelectionOption'))}</option>`;

  const faculties = {};
  Object.keys(minorsData).forEach(minorKey => {
    const m = minorsData[minorKey];
    const fac = m.faculty ? getLocalizedFacultyName(m.faculty) : t('otherFaculties');
    if (!faculties[fac]) faculties[fac] = [];
    faculties[fac].push({ key: minorKey, name: getLocalizedMinorName(minorKey) });
  });

  Object.keys(faculties).forEach(facultyName => {
    const group = document.createElement('optgroup');
    group.label = facultyName;
    faculties[facultyName].forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.key;
      opt.textContent = m.name;
      group.appendChild(opt);
    });
    select.appendChild(group);
  });
}

function getDeptState(deptKey) {
  if (!globalState[deptKey]) {
    globalState[deptKey] = { instances: [], selectedMinorId: null };
  }
  if (globalState[deptKey].selectedMinorId === undefined) {
    globalState[deptKey].selectedMinorId = null;
  }
  return globalState[deptKey];
}

function findCourseById(courseId) {
  if (!courseId) return null;
  const majorCourse = departmentsData[currentDept]?.courses?.find(c => c.id === courseId);
  if (majorCourse) return majorCourse;
  const minorCourses = getActiveMinorCourseList();
  const minorCourse = minorCourses.find(c => c.id === courseId);
  if (minorCourse) return minorCourse;
  for (const dKey of Object.keys(departmentsData)) {
    const c = departmentsData[dKey].courses?.find(c => c.id === courseId);
    if (c) return c;
  }
  return null;
}

function getCourseForInstance(inst) {
  if (!inst) return null;
  if (inst.minorCourse) return inst.minorCourse;
  return findCourseById(inst.courseId);
}

function saveGlobalState() {
  localStorage.setItem('boun_multi_dept_gpa_state', JSON.stringify(globalState));
  localStorage.setItem('boun_active_dept', currentDept);
}

function changeDepartment(newDept) {
  currentDept = newDept;
  saveGlobalState();
  initUI();
}

function switchMobileTab(tab) {
  const sidebar = document.getElementById('sidebarContainer');
  const main = document.getElementById('years-grid');
  const btnPool = document.getElementById('tabBtnPool');
  const btnSem = document.getElementById('tabBtnSemesters');

  if (tab === 'pool') {
    sidebar.classList.add('active-tab');
    main.classList.remove('active-tab');
    btnPool.classList.add('active');
    btnSem.classList.remove('active');
  } else {
    sidebar.classList.remove('active-tab');
    main.classList.add('active-tab');
    btnPool.classList.remove('active');
    btnSem.classList.add('active');
  }
}

let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function attachGlobalTooltip(el, htmlContent) {
  const tooltip = document.getElementById('global-tooltip');
  el.addEventListener('mouseenter', () => {
    tooltip.innerHTML = htmlContent;
    tooltip.style.display = 'block';

    const rect = el.getBoundingClientRect();
    const tooltipWidth = 260;
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.top - tooltip.offsetHeight - 8;

    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    if (top < 10) {
      top = rect.bottom + 8;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  });

  el.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
}

function calculateAverages() {
  const state = getDeptState(currentDept);
  const courses = departmentsData[currentDept]?.courses || [];
  const activeMinorCourses = getActiveMinorCourseList();
  const allRequiredCourses = [...courses, ...activeMinorCourses];

  const semesterStats = {};
  const allSems = [];
  yearStructure.forEach(y => y.sems.forEach(s => allSems.push(s)));
  allSems.forEach(s => {
    semesterStats[s] = { totalPoints: 0, totalCredits: 0, earnedCredits: 0, scheduledCredits: 0 };
  });

  const selectedCourseIds = new Set();
  let selectedCreditsTotal = 0;

  state.instances.forEach(inst => {
    const course = getCourseForInstance(inst);
    if (course) {
      selectedCourseIds.add(inst.courseId);
      selectedCreditsTotal += (Number(course.crd) || 0);

      if (semesterStats[inst.semId]) {
        semesterStats[inst.semId].scheduledCredits += (Number(course.crd) || 0);
      }
    }

    if (inst.passed && semesterStats[inst.semId]) {
      if (course) {
        const crd = Number(course.crd) || 0;
        semesterStats[inst.semId].earnedCredits += crd;

        if (inst.grade && GRADE_POINTS[inst.grade] !== null && GRADE_POINTS[inst.grade] !== undefined) {
          const pts = GRADE_POINTS[inst.grade];
          semesterStats[inst.semId].totalPoints += (pts * crd);
          semesterStats[inst.semId].totalCredits += crd;
        }
      }
    }
  });

  allSems.forEach(s => {
    const safeSemId = s.replace(/[^a-zA-Z0-9]/g, '_');
    const badge = document.getElementById(`spa-${safeSemId}`);
    const crdBadge = document.getElementById(`crd-${safeSemId}`);

    const stat = semesterStats[s];
    if (crdBadge && stat) {
      if (stat.scheduledCredits > 0) {
        crdBadge.innerText = `${stat.scheduledCredits} Cr`;
        crdBadge.className = 'sem-crd-badge has-courses';
      } else {
        crdBadge.innerText = `0 Cr`;
        crdBadge.className = 'sem-crd-badge';
      }
    }

    if (badge && stat) {
      if (stat.earnedCredits > 0) {
        const spaStr = stat.totalCredits > 0
          ? (stat.totalPoints / stat.totalCredits).toFixed(2)
          : 'P';
        badge.innerText = `SPA: ${spaStr}`;
        badge.className = 'spa-badge active';
      } else {
        badge.innerText = `SPA: -`;
        badge.className = 'spa-badge';
      }
    }
  });

  // Kronolojik sıralamaya göre aynı courseId için yalnızca en son geçilen (passed: true) kaydı baz al
  const sortedInstances = [...state.instances].sort((a, b) => compareSemesters(a.semId, b.semId));
  const latestPassedByCourse = {};
  const passedCourseIds = new Set();
  let completedCreditsTotal = 0;

  sortedInstances.forEach(inst => {
    if (inst.passed) {
      passedCourseIds.add(inst.courseId);
      const course = getCourseForInstance(inst);
      if (course) {
        latestPassedByCourse[inst.courseId] = {
          grade: inst.grade || 'AA',
          crd: Number(course.crd) || 0
        };
      }
    }
  });

  let cumPoints = 0;
  let cumCredits = 0;

  Object.keys(latestPassedByCourse).forEach(cId => {
    const item = latestPassedByCourse[cId];
    completedCreditsTotal += item.crd;

    if (item.grade !== 'P' && GRADE_POINTS[item.grade] !== null && GRADE_POINTS[item.grade] !== undefined) {
      cumPoints += (GRADE_POINTS[item.grade] * item.crd);
      cumCredits += item.crd;
    }
  });

  const gpa = cumCredits > 0 ? (cumPoints / cumCredits).toFixed(2) : "0.00";
  document.getElementById('gpa-display').innerText = gpa;

  document.getElementById('selected-courses-count').innerText = `${selectedCourseIds.size} ${t('courseUnit')}`;
  document.getElementById('selected-credits').innerText = `${selectedCreditsTotal} Cr`;
  document.getElementById('completed-credits').innerText = `${completedCreditsTotal} Cr (${passedCourseIds.size} ${t('courseUnit')})`;

  const totalRequiredCredits = allRequiredCourses.reduce((sum, c) => sum + (Number(c.crd) || 0), 0);
  document.getElementById('total-credits').innerText = `${totalRequiredCredits} Cr`;

  const passedRequiredCount = allRequiredCourses.filter(c => passedCourseIds.has(c.id)).length;
  const remaining = Math.max(0, allRequiredCourses.length - passedRequiredCount);
  const remainingEl = document.getElementById('remaining-count');
  if (remainingEl) {
    remainingEl.innerHTML = `${remaining} <span style="font-size: 0.72rem; font-weight: 600; opacity: 0.85;">/ ${allRequiredCourses.length}</span>`;
    remainingEl.title = t('remainingTooltip')(remaining, allRequiredCourses.length);
  }
}

function updateSidebarPool() {
  const state = getDeptState(currentDept);
  const majorCourses = departmentsData[currentDept]?.courses || [];
  const activeMinorCourses = getActiveMinorCourseList();
  const allRequiredCourses = [...majorCourses, ...activeMinorCourses];

  const poolTitleEl = document.getElementById('sidebarPoolTitle');
  if (poolTitleEl) {
    poolTitleEl.innerText = `${t('coursePool')} (${allRequiredCourses.length} ${t('courseUnit')})`;
  }

  const pool = document.getElementById('course-pool');
  if (dashCardWrapper && dashCardWrapper.parentNode === pool) {
    dashCardWrapper.remove();
  }
  pool.innerHTML = '';

  const groups = {
    '1.1': [], '1.2': [],
    '2.1': [], '2.2': [],
    '3.1': [], '3.2': [],
    '4.1': [], '4.2': [],
    'other': []
  };

  majorCourses.forEach(course => {
    if (course.sem && groups[course.sem]) {
      groups[course.sem].push(course);
    } else {
      groups['other'].push(course);
    }
  });

  activeMinorCourses.forEach(course => {
    if (course.sem && groups[course.sem]) {
      groups[course.sem].push(course);
    } else {
      groups['other'].push(course);
    }
  });

  const semesterLabels = t('semGroupLabels');
  const isMobile = isMobileDevice();

  Object.keys(groups).forEach(semKey => {
    const groupCourses = groups[semKey];
    if (!groupCourses || groupCourses.length === 0) return;

    const groupContainer = document.createElement('div');
    const colorClass = semKey === 'other' ? 'pool-sem-other' : `pool-sem-${semKey.replace('.', '-')}`;
    groupContainer.className = `pool-sem-group ${colorClass}`;

    const groupHeader = document.createElement('div');
    groupHeader.className = 'pool-sem-header';
    groupHeader.innerHTML = `
      <span>${escapeHTML(semesterLabels[semKey] || formatSemLabel(semKey))}</span>
      <span>${groupCourses.length} ${escapeHTML(t('courseUnit'))}</span>
    `;
    groupContainer.appendChild(groupHeader);

    groupCourses.forEach(course => {
      const courseInstances = state.instances.filter(inst => inst.courseId === course.id);
      const hasPassed = courseInstances.some(inst => inst.passed === true && inst.grade !== 'F');
      const hasFailedOnly = courseInstances.length > 0 && !hasPassed;
      const isPlaced = courseInstances.length > 0 && !hasPassed && !hasFailedOnly;
      const isMinor = !!course.isMinor;

      const poolCard = document.createElement('div');
      const isLocked = hasPassed;
      poolCard.className = `course-card ${isMinor ? 'minor-card' : ''} ${hasPassed ? 'status-passed pool-locked' : (hasFailedOnly ? 'status-failed' : '')}`;
      poolCard.draggable = !isLocked && !isMobile;
      poolCard.dataset.courseId = course.id;

      let statusBadge = `<span class="status-badge pending">${escapeHTML(t('notTaken'))}</span>`;
      if (hasPassed) {
        const sortedPassed = [...courseInstances]
          .filter(inst => inst.passed && inst.grade !== 'F')
          .sort((a, b) => compareSemesters(a.semId, b.semId));
        const passedInst = sortedPassed[sortedPassed.length - 1];
        const gradeText = passedInst ? `(${escapeHTML(passedInst.grade || 'AA')})` : '';
        statusBadge = `<span class="status-badge locked">${escapeHTML(t('passedStatus'))} ${gradeText}</span>`;
      } else if (hasFailedOnly) {
        statusBadge = `<span class="status-badge failed">${escapeHTML(t('failedStatus'))}</span>`;
      } else if (isPlaced) {
        statusBadge = `<span class="status-badge pending" style="color: #0284c7; font-weight: 600;">${escapeHTML(t('plannedStatus'))}</span>`;
      }

      const poolCourseUrl = getBounCourseUrl(course.code, resolveCourseTerm(course, course.code));
      const safeCode = escapeHTML(course.code);
      const safeName = escapeHTML(course.name);
      const safePrereq = course.prereq ? escapeHTML(translatePrereq(course.prereq)) : '';

      poolCard.innerHTML = `
        <div class="course-header">
          <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
            <span class="course-title">${safeCode}</span>
            ${isMinor ? `<span class="minor-badge">${escapeHTML(t('minorBadge'))}</span>` : ''}
          </div>
          <span class="course-credits">${course.crd} Cr</span>
        </div>
        <div class="course-name">${safeName}</div>
        ${safePrereq ? `<div class="course-prereq">${safePrereq}</div>` : ''}
        ${poolCourseUrl ? `
          <div class="course-desc-link-wrap">
            <a href="${escapeHTML(poolCourseUrl)}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="course-desc-link" 
               draggable="false"
               onclick="event.stopPropagation();" 
               title="${safeCode} ${escapeHTML(t('coursePageTooltip'))}">
              ${escapeHTML(t('openCoursePage'))}
            </a>
          </div>
        ` : ''}
        <div class="course-controls" style="margin-top: 4px;">
          ${statusBadge}
          ${!isLocked ? `
            <button type="button" class="mobile-term-pick-btn" onclick="openTermPickerModal('${escapeHTML(course.id)}'); event.stopPropagation();">
              ${escapeHTML(t('addToTermBtn'))}
            </button>
          ` : ''}
        </div>
      `;

      if (!isLocked && !isMobile) {
        poolCard.addEventListener('dragstart', handlePoolDragStart);
        poolCard.addEventListener('dragend', handleDragEnd);
      }

      groupContainer.appendChild(poolCard);
    });

    pool.appendChild(groupContainer);
  });

  applyDashCardPosition();
  calculateAverages();
}

function handleMobileAddCourse(courseId, targetSem, selectEl) {
  if (!targetSem) return;

  const state = getDeptState(currentDept);
  const course = findCourseById(courseId);
  if (!course) return;

  const isMinor = !!course.isMinor;
  const newInst = {
    instanceId: 'inst_' + (isMinor ? 'user_minor_' : '') + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    courseId: courseId,
    semId: targetSem,
    passed: false,
    grade: 'AA',
    customText: '',
    isMinor: isMinor,
    minorCourse: isMinor ? course : undefined
  };

  state.instances.push(newInst);
  saveGlobalState();

  const card = createSemesterCourseCard(newInst, course);
  const targetBox = document.querySelector(`[data-sem-id="${targetSem}"]`);
  if (targetBox) {
    targetBox.appendChild(card);
  }

  if (selectEl) selectEl.value = "";

  refreshRepeatBadges();
  updateSidebarPool();
  showToast(t('toastAddedToTerm')(course.code, formatSemLabel(targetSem)));
}

function initUI() {
  document.getElementById('deptSelect').value = currentDept;

  const activeDeptData = departmentsData[currentDept];
  if (!activeDeptData) return;

  const state = getDeptState(currentDept);
  const yearsGrid = document.getElementById('years-grid');
  yearsGrid.innerHTML = '';

  const yearLabelMap = t('yearLabels');

  yearStructure.forEach(y => {
    const row = document.createElement('div');
    row.className = `year-row ${y.isExtended ? 'extended' : ''}`;

    const title = document.createElement('div');
    title.className = 'year-title';
    title.innerHTML = `
      <span>${escapeHTML(yearLabelMap[y.yearLabel] || y.yearLabel)}</span>
      ${y.tag ? `<span class="limit-tag">${escapeHTML(t('limitTag'))}</span>` : ''}
    `;
    row.appendChild(title);

    const semsContainer = document.createElement('div');
    semsContainer.className = 'semesters-container';

    y.sems.forEach(semId => {
      const box = document.createElement('div');
      box.className = 'semester-box';
      box.dataset.semId = semId;

      const safeSemId = semId.replace(/[^a-zA-Z0-9]/g, '_');
      const curriculumInfo = activeDeptData.curriculumMap ? activeDeptData.curriculumMap[semId] : null;
      const semDisplay = formatSemLabel(semId);

      box.innerHTML = `
        <div class="semester-header">
          <div style="display:flex; align-items:center;">
            <span>${escapeHTML(semDisplay)}</span>
            ${curriculumInfo ? `<span class="info-btn" id="info-btn-${safeSemId}">i</span>` : ''}
          </div>
          <div class="sem-header-badges">
            <span id="crd-${safeSemId}" class="sem-crd-badge">0 Cr</span>
            <span id="spa-${safeSemId}" class="spa-badge">SPA: -</span>
          </div>
        </div>
      `;

      if (curriculumInfo) {
        const listStr = curriculumInfo.map(c => `• ${escapeHTML(c)}`).join('<br>');
        const tooltipContent = `<strong>${escapeHTML(getLocalizedDeptName(currentDept))} (${escapeHTML(semDisplay)}):</strong><br>${listStr}`;
        const infoBtn = box.querySelector(`#info-btn-${safeSemId}`);
        if (infoBtn) attachGlobalTooltip(infoBtn, tooltipContent);
      }

      box.addEventListener('dragover', handleDragOver);
      box.addEventListener('dragleave', handleDragLeave);
      box.addEventListener('drop', handleDrop);

      semsContainer.appendChild(box);
    });

    row.appendChild(semsContainer);
    yearsGrid.appendChild(row);
  });

  state.instances.forEach(inst => {
    const course = getCourseForInstance(inst);
    if (course) {
      const semBox = document.querySelector(`[data-sem-id="${inst.semId}"]`);
      if (semBox) {
        const card = createSemesterCourseCard(inst, course);
        semBox.appendChild(card);
      }
    }
  });

  refreshRepeatBadges();
  updateSidebarPool();
  updateMinorButtonUI();
}

function createSemesterCourseCard(inst, course) {
  const card = document.createElement('div');
  const isPassed = !!inst.passed;
  const isMobile = isMobileDevice();
  const isMinor = !!inst.isMinor || !!course.isMinor;
  const state = getDeptState(currentDept);
  const isRepeat = isRepeatInstance(inst, state.instances);

  card.className = `course-card ${isMinor ? 'minor-card' : ''} ${isPassed ? 'status-passed locked' : 'status-failed'}`;
  card.id = `inst-${inst.instanceId}`;
  card.draggable = !isPassed && !isMobile;
  card.dataset.instanceId = inst.instanceId;

  const currentGrade = inst.grade || 'AA';

  const gradeOptions = Object.keys(GRADE_POINTS).map(g => {
    const valText = GRADE_POINTS[g] !== null ? `(${GRADE_POINTS[g].toFixed(1)})` : '(Pass)';
    return `<option value="${g}" ${currentGrade === g ? 'selected' : ''}>${g} ${valText}</option>`;
  }).join('');

  const isCustomElective = Boolean(course.isElective && inst.customText);
  const effectiveCode = isCustomElective ? inst.customText : course.code;
  const courseUrl = getBounCourseUrl(effectiveCode, resolveCourseTerm(isCustomElective ? null : course, effectiveCode));

  const safeCode = escapeHTML(course.code);
  const safeName = escapeHTML(course.name);
  const safePrereq = course.prereq ? escapeHTML(translatePrereq(course.prereq)) : '';
  const safeCustomText = escapeHTML(inst.customText || '');
  const safeEffectiveCode = escapeHTML(effectiveCode);

  card.innerHTML = `
    <div class="course-header">
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; min-width:0;">
        <span class="course-title">${safeCode}</span>
        ${isMinor ? `<span class="minor-badge">${escapeHTML(t('minorBadge'))}</span>` : ''}
        ${isRepeat ? `<span class="repeat-badge">${escapeHTML(t('repeatBadge'))}</span>` : ''}
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        ${isPassed ? `
          <div class="grade-selector-wrap" title="${escapeHTML(t('gradeTooltip'))}">
            <select class="grade-select" onchange="handleGradeChange('${inst.instanceId}', this.value)">
              ${gradeOptions}
            </select>
          </div>
        ` : ''}
        <span class="course-credits">${course.crd} Cr</span>
        ${!isPassed ? `
          <button class="delete-btn" onclick="removeInstance('${inst.instanceId}')" title="${escapeHTML(isMinor ? t('removeMinorCourseTitle') : t('removeFromTermTitle'))}">✕</button>
        ` : ''}
      </div>
    </div>
    <div class="course-name">${safeName}</div>
    ${safePrereq ? `<div class="course-prereq">${safePrereq}</div>` : ''}
    
    <div class="course-desc-link-wrap" style="${courseUrl ? '' : 'display:none;'}">
      ${courseUrl ? `
        <a href="${escapeHTML(courseUrl)}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="course-desc-link" 
           draggable="false"
           onclick="event.stopPropagation();" 
           title="${safeEffectiveCode} ${escapeHTML(t('coursePageTooltip'))}">
          ${escapeHTML(t('openCoursePage'))}
        </a>
      ` : ''}
    </div>
    
    ${course.isElective ? `
      <input type="text" 
             class="custom-input" 
             placeholder="${escapeHTML(t('electiveInputPlaceholder'))}" 
             value="${safeCustomText}" 
             ${isPassed ? 'disabled style="background:#f1f5f9; cursor:not-allowed;"' : ''}
             oninput="handleInstanceInput('${inst.instanceId}', this.value)">
    ` : ''}

    <div class="course-controls">
      <label style="cursor:pointer; display:flex; align-items:center; gap:5px; font-weight:600;">
        <input type="checkbox" ${isPassed ? 'checked' : ''} onchange="toggleInstancePassed('${inst.instanceId}', this.checked)">
        ${escapeHTML(t('passedCheck'))}
      </label>
      <span class="status-badge ${isPassed ? 'locked' : 'failed'}">
        ${escapeHTML(isPassed ? t('completedBadge') : t('failedStatus'))}
      </span>
    </div>
  `;

  if (!isPassed && !isMobile) {
    card.addEventListener('dragstart', handleInstanceDragStart);
    card.addEventListener('dragend', handleDragEnd);
  }

  return card;
}

let dragType = null;
let draggedId = null;
let dragGhostNode = null;

function createCustomDragImage(sourceEl, e) {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  }

  dragGhostNode = sourceEl.cloneNode(true);
  dragGhostNode.style.width = `${sourceEl.offsetWidth}px`;
  dragGhostNode.style.position = 'fixed';
  dragGhostNode.style.top = '-9999px';
  dragGhostNode.style.left = '-9999px';
  dragGhostNode.style.zIndex = '999999';
  dragGhostNode.style.opacity = '0.98';
  dragGhostNode.style.boxShadow = '0 12px 28px rgba(0, 51, 102, 0.25)';
  dragGhostNode.style.transform = 'scale(1.02)';
  dragGhostNode.style.pointerEvents = 'none';
  document.body.appendChild(dragGhostNode);

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setDragImage(dragGhostNode, sourceEl.offsetWidth / 2, 25);
}

function handlePoolDragStart(e) {
  dragType = 'pool';
  draggedId = this.dataset.courseId;
  this.classList.add('is-dragging');
  e.dataTransfer.setData('text/plain', this.dataset.courseId);
  createCustomDragImage(this, e);
}

function handleInstanceDragStart(e) {
  dragType = 'instance';
  draggedId = this.dataset.instanceId;
  this.classList.add('is-dragging');
  e.dataTransfer.setData('text/plain', this.dataset.instanceId);
  createCustomDragImage(this, e);
}

function handleDragEnd() {
  this.classList.remove('is-dragging');
  document.querySelectorAll('.course-card').forEach(c => c.classList.remove('drop-indicator'));
  document.querySelectorAll('.semester-box').forEach(b => b.classList.remove('drag-over'));
  if (dragGhostNode && dragGhostNode.parentNode) {
    dragGhostNode.parentNode.removeChild(dragGhostNode);
    dragGhostNode = null;
  }
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.course-card:not(.is-dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('drag-over');

  const afterElement = getDragAfterElement(this, e.clientY);
  document.querySelectorAll('.course-card').forEach(c => c.classList.remove('drop-indicator'));
  if (afterElement) {
    afterElement.classList.add('drop-indicator');
  }
}

function handleDragLeave() {
  this.classList.remove('drag-over');
  this.querySelectorAll('.course-card').forEach(c => c.classList.remove('drop-indicator'));
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  document.querySelectorAll('.course-card').forEach(c => c.classList.remove('drop-indicator'));

  if (!draggedId) return;

  const semId = this.dataset.semId;
  const state = getDeptState(currentDept);
  const afterElement = getDragAfterElement(this, e.clientY);

  if (dragType === 'pool') {
    const course = findCourseById(draggedId);
    if (!course) return;

    const isMinor = !!course.isMinor;
    const newInst = {
      instanceId: 'inst_' + (isMinor ? 'user_minor_' : '') + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      courseId: draggedId,
      semId: semId,
      passed: false,
      grade: 'AA',
      customText: '',
      isMinor: isMinor,
      minorCourse: isMinor ? course : undefined
    };

    const targetIndex = afterElement
      ? state.instances.findIndex(i => i.instanceId === afterElement.dataset.instanceId)
      : state.instances.length;

    if (targetIndex > -1 && targetIndex < state.instances.length) {
      state.instances.splice(targetIndex, 0, newInst);
    } else {
      state.instances.push(newInst);
    }

    saveGlobalState();

    const card = createSemesterCourseCard(newInst, course);
    if (afterElement) {
      this.insertBefore(card, afterElement);
    } else {
      this.appendChild(card);
    }

  } else if (dragType === 'instance') {
    const instIndex = state.instances.findIndex(i => i.instanceId === draggedId);
    if (instIndex > -1) {
      const inst = state.instances[instIndex];
      if (!inst.passed) {
        inst.semId = semId;

        state.instances.splice(instIndex, 1);
        const targetIndex = afterElement
          ? state.instances.findIndex(i => i.instanceId === afterElement.dataset.instanceId)
          : state.instances.length;

        if (targetIndex > -1 && targetIndex <= state.instances.length) {
          state.instances.splice(targetIndex, 0, inst);
        } else {
          state.instances.push(inst);
        }

        saveGlobalState();

        const card = document.getElementById(`inst-${draggedId}`);
        if (card) {
          if (afterElement) {
            this.insertBefore(card, afterElement);
          } else {
            this.appendChild(card);
          }
        }
      }
    }
  }

  refreshRepeatBadges();
  updateSidebarPool();
  draggedId = null;
  dragType = null;
}

function toggleInstancePassed(instanceId, isChecked) {
  const state = getDeptState(currentDept);
  const inst = state.instances.find(i => i.instanceId === instanceId);
  if (inst) {
    inst.passed = isChecked;
    if (isChecked && !inst.grade) {
      inst.grade = 'AA';
    }
    saveGlobalState();

    const oldCard = document.getElementById(`inst-${instanceId}`);
    const course = getCourseForInstance(inst);
    const newCard = createSemesterCourseCard(inst, course);
    oldCard.parentElement.replaceChild(newCard, oldCard);

    refreshRepeatBadges();
    updateSidebarPool();
  }
}

function handleGradeChange(instanceId, newGrade) {
  const state = getDeptState(currentDept);
  const inst = state.instances.find(i => i.instanceId === instanceId);
  if (inst) {
    inst.grade = newGrade;
    saveGlobalState();
    updateSidebarPool();
  }
}

function handleInstanceInput(instanceId, text) {
  const state = getDeptState(currentDept);
  const inst = state.instances.find(i => i.instanceId === instanceId);
  if (inst) {
    inst.customText = text;
    saveGlobalState();

    const card = document.getElementById(`inst-${instanceId}`);
    if (card) {
      const linkWrap = card.querySelector('.course-desc-link-wrap');
      if (linkWrap) {
        const course = getCourseForInstance(inst);
        const isCustomElective = Boolean(course && course.isElective && text.trim());
        const effectiveCode = isCustomElective ? text.trim() : (course ? course.code : text.trim());
        const newUrl = getBounCourseUrl(effectiveCode, resolveCourseTerm(isCustomElective ? null : course, effectiveCode));
        if (newUrl) {
          const safeEffectiveCode = escapeHTML(effectiveCode);
          linkWrap.innerHTML = `
            <a href="${escapeHTML(newUrl)}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="course-desc-link" 
               draggable="false"
               onclick="event.stopPropagation();" 
               title="${safeEffectiveCode} ${escapeHTML(t('coursePageTooltip'))}">
              ${escapeHTML(t('openCoursePage'))}
            </a>
          `;
          linkWrap.style.display = 'block';
        } else {
          linkWrap.innerHTML = '';
          linkWrap.style.display = 'none';
        }
      }
    }
  }
}

function removeInstance(instanceId) {
  const state = getDeptState(currentDept);
  state.instances = state.instances.filter(i => i.instanceId !== instanceId);
  saveGlobalState();

  const card = document.getElementById(`inst-${instanceId}`);
  if (card) card.remove();

  refreshRepeatBadges();
  updateSidebarPool();
}

function resetCurrentDept() {
  const deptName = getLocalizedDeptName(currentDept);
  if (confirm(t('confirmReset')(deptName))) {
    globalState[currentDept] = { instances: [], selectedMinorId: null };
    saveGlobalState();
    initUI();
  }
}

function exportDataAsJSON() {
  try {
    const activeDeptData = departmentsData[currentDept];
    const currentDeptState = getDeptState(currentDept);

    const exportPayload = {
      app: "boun-program-tracker",
      version: 1,
      exportedAt: new Date().toISOString(),
      activeDept: currentDept,
      activeDeptName: activeDeptData?.name || currentDept,
      selectedMinorId: currentDeptState.selectedMinorId || null,
      summary: {
        plannedCoursesCount: currentDeptState.instances.length,
        passedCoursesCount: currentDeptState.instances.filter(i => i.passed).length,
        selectedMinorId: currentDeptState.selectedMinorId || null
      },
      globalState: globalState
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const safeDept = currentDept.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `boun_plan_${safeDept}_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);

    showToast(t('toastExportSuccess'));
  } catch (err) {
    console.error("Dışa aktarma hatası:", err);
    alert(t('alertExportError') + err.message);
  }
}

function importDataFromJSON(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const rawText = e.target.result;
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (jsonErr) {
        throw new Error(t('errInvalidJson'));
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error(t('errEmptyData'));
      }

      let candidateState = null;
      let targetDept = null;

      // 1. Standart app formatı: { globalState: { ... }, activeDept: '...' } veya { state: { ... } }
      const stateObj = parsed.globalState || parsed.state;
      if (stateObj && typeof stateObj === 'object' && !Array.isArray(stateObj)) {
        candidateState = stateObj;
        if (parsed.activeDept && departmentsData[parsed.activeDept]) {
          targetDept = parsed.activeDept;
        }
      }
      // 2. Tek bir bölümün instances nesnesi: { instances: [...] }
      else if (Array.isArray(parsed.instances)) {
        candidateState = { ...globalState };
        candidateState[currentDept] = {
          instances: parsed.instances,
          selectedMinorId: parsed.selectedMinorId || null
        };
      }
      // 3. Doğrudan instances dizisi: [ { courseId, semId, ... } ]
      else if (Array.isArray(parsed)) {
        candidateState = { ...globalState };
        candidateState[currentDept] = { instances: parsed, selectedMinorId: null };
      }
      // 4. Doğrudan ham globalState nesnesi: { phys: { instances: [...] }, math: { ... } }
      else if (typeof parsed === 'object') {
        const hasDeptInstances = Object.keys(parsed).some(k => parsed[k] && Array.isArray(parsed[k].instances));
        if (hasDeptInstances) {
          candidateState = parsed;
          if (parsed.activeDept && departmentsData[parsed.activeDept]) {
            targetDept = parsed.activeDept;
          }
        }
      }

      if (!candidateState) {
        throw new Error(t('errNoPlanFound'));
      }

      // Güvenlik ve veri temizleme: her bölümün instances'ının dizi olduğundan emin ol
      Object.keys(candidateState).forEach(k => {
        if (!candidateState[k] || !Array.isArray(candidateState[k].instances)) {
          candidateState[k] = { instances: [], selectedMinorId: candidateState[k]?.selectedMinorId || null };
        } else {
          candidateState[k].instances = candidateState[k].instances.filter(inst => inst && inst.courseId && inst.semId);
          if (candidateState[k].selectedMinorId === undefined) {
            candidateState[k].selectedMinorId = null;
          }
        }
      });

      if (parsed.selectedMinorId !== undefined && candidateState[targetDept || currentDept]) {
        candidateState[targetDept || currentDept].selectedMinorId = parsed.selectedMinorId;
      }

      // Mevcut verisi varsa kullanıcıya nazikçe onay sor
      const activeCurrentInstances = (globalState[currentDept]?.instances || []).length;
      if (activeCurrentInstances > 0) {
        const confirmOverwrite = confirm(t('confirmOverwriteImport'));
        if (!confirmOverwrite) {
          event.target.value = '';
          return;
        }
      }

      globalState = candidateState;
      if (targetDept && departmentsData[targetDept]) {
        currentDept = targetDept;
      }

      saveGlobalState();

      const deptSelect = document.getElementById('deptSelect');
      if (deptSelect) deptSelect.value = currentDept;

      initUI();
      showToast(t('toastImportSuccess'));
    } catch (err) {
      console.error("İçe aktarma hatası:", err);
      alert(t('alertImportError') + err.message);
    } finally {
      event.target.value = '';
    }
  };

  reader.onerror = function() {
    alert(t('alertFileReadError'));
    event.target.value = '';
  };

  reader.readAsText(file, "UTF-8");
}

/* ============================================================
   Yandal Programı (Minor Program) Yönetimi
   ============================================================ */
function findCourseByCode(code) {
  if (!code) return null;
  const clean = code.replace(/\s+/g, '').toUpperCase();
  for (const dKey of Object.keys(departmentsData)) {
    const list = departmentsData[dKey].courses || [];
    const found = list.find(c => c.code && c.code.replace(/\s+/g, '').toUpperCase() === clean);
    if (found) return found;
  }
  return null;
}

function getMinorCourseList(minorKey) {
  if (!minorKey || !minorsData[minorKey]) return [];
  const minor = minorsData[minorKey];
  const result = [];
  const addedCodes = new Set();

  // 1. Zorunlu dersler
  if (Array.isArray(minor.compulsoryCourses)) {
    minor.compulsoryCourses.forEach(c => {
      const cleanCode = (c.code || '').trim();
      if (!cleanCode || addedCodes.has(cleanCode.toUpperCase())) return;
      addedCodes.add(cleanCode.toUpperCase());
      const ref = findCourseByCode(cleanCode);
      result.push({
        id: `minor_${minorKey}_${cleanCode.replace(/[^a-zA-Z0-9]/g, '_')}`,
        code: cleanCode,
        name: c.name || (ref ? ref.name : cleanCode),
        crd: Number(c.crd) || (ref ? Number(ref.crd) : 3),
        isMinor: true,
        isElective: false
      });
    });
  }

  // 2. Seçmeli havuzları (electivePools)
  if (Array.isArray(minor.electivePools)) {
    minor.electivePools.forEach(pool => {
      const firstOpt = (pool.options || []).find(opt => !addedCodes.has(opt.trim().toUpperCase()));
      const optCode = firstOpt || (pool.poolName || 'Seçmeli');
      addedCodes.add(optCode.toUpperCase());
      const ref = findCourseByCode(optCode);
      result.push({
        id: `minor_${minorKey}_${optCode.replace(/[^a-zA-Z0-9]/g, '_')}`,
        code: optCode,
        name: (ref ? ref.name : `${pool.poolName || 'Yandal Seçmeli Dersi'}`),
        crd: (ref ? Number(ref.crd) : 3),
        isMinor: true,
        isElective: true
      });
    });
  }

  // 3. Seçmeli opsiyon listesi (electiveOptions)
  const targetTotal = minor.requirements?.totalCourses || 6;
  if (Array.isArray(minor.electiveOptions)) {
    for (const optCode of minor.electiveOptions) {
      if (result.length >= targetTotal) break;
      const cleanCode = (optCode || '').trim();
      if (!cleanCode || addedCodes.has(cleanCode.toUpperCase())) continue;
      addedCodes.add(cleanCode.toUpperCase());
      const ref = findCourseByCode(cleanCode);
      result.push({
        id: `minor_${minorKey}_${cleanCode.replace(/[^a-zA-Z0-9]/g, '_')}`,
        code: cleanCode,
        name: ref ? ref.name : `${cleanCode} (Yandal Seçmeli)`,
        crd: ref ? Number(ref.crd) : 3,
        isMinor: true,
        isElective: true
      });
    }
  }

  // 4. Eğer hala hedef ders sayısına ulaşılmadıysa genel seçmeli yuvası oluştur
  let tagMatch = minor.name.match(/\(([A-Z]+)\)/);
  let tag = tagMatch ? tagMatch[1] : (minorKey.split('_')[0] || 'Yandal').toUpperCase();
  let elecCounter = 1;
  while (result.length < targetTotal) {
    const codeName = `${tag} Seçmeli ${elecCounter}`;
    result.push({
      id: `minor_${minorKey}_elec_${elecCounter}`,
      code: codeName,
      name: `${minor.name} Seçmeli Dersi`,
      crd: 3,
      isMinor: true,
      isElective: true
    });
    elecCounter++;
  }

  return result;
}

function getActiveMinorCourseList() {
  const state = getDeptState(currentDept);
  const minorKey = state.selectedMinorId;
  if (!minorKey || !minorsData[minorKey]) return [];
  const allMinorCourses = getMinorCourseList(minorKey);

  // Ana dal müfredatındaki ders kodlarını topla (Ortak dersleri atlamak için)
  const majorCourses = departmentsData[currentDept]?.courses || [];
  const majorCodes = new Set();
  majorCourses.forEach(c => {
    if (c.code) majorCodes.add(c.code.replace(/\s+/g, '').toUpperCase());
  });

  // Ana dalda olanları filtrele (duplication check)
  const filtered = allMinorCourses.filter(mc => {
    const normalized = mc.code.replace(/\s+/g, '').toUpperCase();
    return !majorCodes.has(normalized);
  });

  // 3. yarıyıldan (2.1) başlayarak dönem bloklarına yerleştir: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2
  const targetSemesters = ['2.1', '2.2', '3.1', '3.2', '4.1', '4.2'];
  filtered.forEach((course, idx) => {
    course.sem = idx < targetSemesters.length ? targetSemesters[idx] : '4.2';
    course.isMinor = true;
  });

  return filtered;
}

function applyMinor(minorKey) {
  if (!minorKey || !minorsData[minorKey]) {
    removeCurrentMinor(true);
    return;
  }

  // Önceki yandal derslerini temizle (kullanıcının ana dalına ve notlarına dokunmadan)
  removeCurrentMinor(false);

  const state = getDeptState(currentDept);
  const minor = minorsData[minorKey];

  // Yandal ID'sini kaydet: dersler doğrudan dönemlere değil, soldaki ders havuzunda ilgili dönem bloklarına eklenir
  state.selectedMinorId = minorKey;
  saveGlobalState();
  initUI();

  const minorCourses = getActiveMinorCourseList();
  showToast(t('toastMinorApplied')(getLocalizedMinorName(minorKey), minorCourses.length));
}

function removeCurrentMinor(shouldSave = true) {
  const state = getDeptState(currentDept);
  state.instances = (state.instances || []).filter(inst => {
    const isMinorInst = inst.isMinor || inst.minorCourse ||
      (inst.courseId && String(inst.courseId).startsWith('minor_')) ||
      (inst.instanceId && String(inst.instanceId).startsWith('inst_minor_'));
    return !isMinorInst;
  });
  state.selectedMinorId = null;
  if (shouldSave) {
    saveGlobalState();
    initUI();
    showToast(t('toastMinorRemoved'));
  }
}

function removeMinor(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  if (confirm(t('confirmRemoveMinor'))) {
    removeCurrentMinor(true);
  }
}

function updateMinorButtonUI() {
  const minorBtn = document.getElementById('minorBtn');
  if (!minorBtn) return;
  const state = getDeptState(currentDept);
  const minorId = state.selectedMinorId;

  if (minorId && minorsData[minorId]) {
    const localizedMinorName = getLocalizedMinorName(minorId);
    const match = localizedMinorName.match(/\(([^)]+)\)/);
    const shortName = match ? match[1] : localizedMinorName.replace(/Yandalı?|Minor/gi, '').trim();
    minorBtn.className = 'minor-btn has-minor';
    minorBtn.innerHTML = `🎓 ${escapeHTML(t('minorLabelPrefix'))}: ${escapeHTML(shortName)} <span class="minor-remove-btn" onclick="removeMinor(event)" title="${escapeHTML(t('minorRemoveTooltip'))}">✕</span>`;
    minorBtn.title = `${localizedMinorName} ${t('minorHasTitleSuffix')}`;
  } else {
    minorBtn.className = 'minor-btn';
    minorBtn.innerHTML = escapeHTML(t('addMinor'));
    minorBtn.title = t('minorBtnTitle');
  }
}

function openMinorModal() {
  const modal = document.getElementById('minorModal');
  if (!modal) return;
  const select = document.getElementById('minorSelect');
  const state = getDeptState(currentDept);
  if (select) {
    select.value = state.selectedMinorId || "";
    handleMinorSelectChange(select.value);
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMinorModal() {
  const modal = document.getElementById('minorModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function handleMinorBackdropClick(event) {
  if (event.target && event.target.id === 'minorModal') {
    closeMinorModal();
  }
}

function handleMinorSelectChange(minorKey) {
  const previewBox = document.getElementById('minorPreviewBox');
  if (!previewBox) return;

  if (!minorKey || !minorsData[minorKey]) {
    previewBox.innerHTML = `
      <div style="color: #64748b; font-style: italic;">
        ${escapeHTML(t('minorPreviewRemoved'))}
      </div>
    `;
    return;
  }

  const minor = minorsData[minorKey];
  const req = minor.requirements || {};
  let reqHtml = '';
  if (req.totalCourses) reqHtml += `<span>📚 ${escapeHTML(t('minorTotalCourses'))} <strong>${req.totalCourses}</strong></span>`;
  if (req.totalCredits) reqHtml += `<span>🎯 ${escapeHTML(t('minorCredits'))} <strong>${req.totalCredits} Cr</strong></span>`;
  if (req.gpa) reqHtml += `<span>⭐ ${escapeHTML(t('minorAppGpa'))} <strong>${req.gpa.toFixed(2)}</strong></span>`;
  if (req.applicationPrereq && req.applicationPrereq.length > 0) {
    reqHtml += `<span>📋 ${escapeHTML(t('minorPrereq'))} <strong>${escapeHTML(req.applicationPrereq.join(', '))}</strong></span>`;
  }

  const courseList = getMinorCourseList(minorKey);
  const coursesPreview = courseList.map(c => `<code>${escapeHTML(c.code)}</code> (${c.crd} Cr)`).join(', ');

  previewBox.innerHTML = `
    <div class="minor-preview-title">${escapeHTML(getLocalizedMinorName(minorKey))}</div>
    <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 8px;">🏛️ ${escapeHTML(getLocalizedFacultyName(minor.faculty || ''))}</div>
    ${reqHtml ? `<div class="minor-preview-reqs">${reqHtml}</div>` : ''}
    <div style="margin-top: 8px; font-size: 0.82rem; color: #334155;">
      <strong>${escapeHTML(t('minorSampleDist'))}</strong><br>
      <span style="font-size: 0.78rem; color: #475569;">${coursesPreview}</span>
    </div>
    ${minor.notes ? `<div style="margin-top: 6px; font-size: 0.75rem; color: #94a3b8; font-style: italic;">ℹ️ ${escapeHTML(minor.notes)}</div>` : ''}
  `;
}

function handleApplyMinorFromModal() {
  const select = document.getElementById('minorSelect');
  const selectedKey = select ? select.value : "";

  if (!selectedKey) {
    removeCurrentMinor(true);
    closeMinorModal();
    return;
  }

  applyMinor(selectedKey);
  closeMinorModal();
}

/* ============================================================
   Geri Bildirim / Issue Bildir Mekanizması
   ============================================================ */
const FEEDBACK_API_URL = "https://takip-phi.vercel.app/api/issue";

function openFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const titleInput = document.getElementById('feedbackTitle');
      if (titleInput) titleInput.focus();
    }, 120);
  }
}

function closeFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function handleFeedbackBackdropClick(event) {
  if (event.target && event.target.id === 'feedbackModal') {
    closeFeedbackModal();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const feedbackModal = document.getElementById('feedbackModal');
    if (feedbackModal && feedbackModal.classList.contains('open')) {
      closeFeedbackModal();
    }
    const minorModal = document.getElementById('minorModal');
    if (minorModal && minorModal.classList.contains('open')) {
      closeMinorModal();
    }
  }
});

async function handleFeedbackSubmit(event) {
  event.preventDefault();

  const titleInput = document.getElementById('feedbackTitle');
  const categorySelect = document.getElementById('feedbackCategory');
  const descInput = document.getElementById('feedbackDesc');
  const submitBtn = document.getElementById('feedbackSubmitBtn');

  const title = (titleInput ? titleInput.value : "").trim();
  const category = (categorySelect ? categorySelect.value : "Diğer");
  const description = (descInput ? descInput.value : "").trim();

  if (!title || !description) {
    alert(t('alertFeedbackRequired'));
    return;
  }

  const originalBtnHtml = `<span>${escapeHTML(t('submit'))}</span>`;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="issue-spinner"></span>
      <span>${escapeHTML(t('submitting'))}</span>
    `;
  }

  try {
    const response = await fetch(FEEDBACK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        category: category,
        description: description
      })
    });

    if (!response.ok) {
      let errorMsg = `${t('serverError')} (${response.status})`;
      try {
        const data = await response.json();
        if (data && (data.error || data.message)) {
          errorMsg = data.error || data.message;
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }

    // Başarılı
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    closeFeedbackModal();
    showToast(t('toastFeedbackSuccess'));
  } catch (err) {
    console.error("Geri bildirim hatası:", err);
    alert(`${t('alertFeedbackError')}${err.message || t('tryAgain')}`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>${escapeHTML(t('submit'))}</span>`;
    }
  }
}

const dashCardWrapper = document.getElementById('dashCardWrapper');

function updatePinButtonUI() {
  const btn = document.getElementById('pinDashBtn');
  if (!btn) return;
  btn.classList.toggle('pinned', isDashPinned);
  const titleText = isDashPinned ? t('unpinCardTitle') : t('pinCardTitle');
  btn.title = titleText;
  btn.setAttribute('aria-label', titleText);
  btn.setAttribute('aria-pressed', isDashPinned ? 'true' : 'false');
}

function applyDashCardPosition() {
  if (!dashCardWrapper) return;
  const fixedTop = document.getElementById('sidebarFixedTop');
  const pool = document.getElementById('course-pool');

  if (isDashPinned) {
    if (fixedTop && dashCardWrapper.parentNode !== fixedTop) {
      fixedTop.prepend(dashCardWrapper);
    } else if (fixedTop && fixedTop.firstElementChild !== dashCardWrapper) {
      fixedTop.prepend(dashCardWrapper);
    }
  } else {
    if (pool && (dashCardWrapper.parentNode !== pool || pool.firstElementChild !== dashCardWrapper)) {
      pool.prepend(dashCardWrapper);
    }
  }
}

function toggleDashPin() {
  isDashPinned = !isDashPinned;
  localStorage.setItem('boun_pin_dash_card', isDashPinned ? 'true' : 'false');
  updatePinButtonUI();
  applyDashCardPosition();
}

// --- Mobil Açılır Araç Menüsü (#toolsDropdown) ---
function toggleToolsDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('toolsDropdown');
  const menuBtn = document.getElementById('mobileMenuBtn');
  if (!dropdown) return;
  const willOpen = !dropdown.classList.contains('open');
  dropdown.classList.toggle('open', willOpen);
  if (menuBtn) menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

function closeToolsDropdown() {
  const dropdown = document.getElementById('toolsDropdown');
  const menuBtn = document.getElementById('mobileMenuBtn');
  if (dropdown) dropdown.classList.remove('open');
  if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('toolsDropdown');
  const menuBtn = document.getElementById('mobileMenuBtn');
  if (!dropdown || !dropdown.classList.contains('open')) return;
  if (dropdown.contains(e.target) || (menuBtn && menuBtn.contains(e.target))) return;
  closeToolsDropdown();
});

function handleSupportClick(event) {
  const el = event ? event.currentTarget : document.getElementById('supportBtn');
  const href = el ? (el.getAttribute('href') || '').trim() : '';
  if (!href || href === '#') {
    if (event) event.preventDefault();
    showToast(t('toastSupportSoon'));
    return;
  }
  if (event) event.preventDefault();
  window.open(href, '_blank', 'noopener,noreferrer');
}

const toolsDropdownEl = document.getElementById('toolsDropdown');
if (toolsDropdownEl) {
  toolsDropdownEl.addEventListener('click', (e) => {
    if (e.target.closest('button, a')) {
      closeToolsDropdown();
    }
  });
}

// --- Mobil Dönem Seçim Modalı (Bottom Sheet) ---
let selectedTermPickerCourseId = null;

function openTermPickerModal(courseId) {
  const modal = document.getElementById('termPickerModal');
  const titleEl = document.getElementById('termPickerTitle');
  const subtitleEl = document.getElementById('termPickerSubtitle');
  const bodyEl = document.getElementById('termPickerBody');
  const course = findCourseById(courseId);
  if (!modal || !bodyEl || !course) return;

  selectedTermPickerCourseId = courseId;
  if (subtitleEl) subtitleEl.textContent = t('selectTermPrompt');
  if (titleEl) titleEl.textContent = `${course.code} - ${course.name}`;

  const yearLabelMap = t('yearLabels');
  bodyEl.innerHTML = yearStructure.map(y => `
    <div class="term-picker-year-group">
      <div class="term-picker-year-label">${escapeHTML(yearLabelMap[y.yearLabel] || y.yearLabel)}</div>
      <div class="term-picker-grid">
        ${y.sems.map(semId => `
          <button type="button" class="term-picker-btn" onclick="selectTermFromPicker('${escapeHTML(semId)}')">
            ${escapeHTML(formatSemLabel(semId))}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTermPickerModal() {
  const modal = document.getElementById('termPickerModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  selectedTermPickerCourseId = null;
}

function handleTermPickerBackdropClick(event) {
  if (event.target && event.target.id === 'termPickerModal') {
    closeTermPickerModal();
  }
}

function selectTermFromPicker(semId) {
  if (selectedTermPickerCourseId && semId) {
    handleMobileAddCourse(selectedTermPickerCourseId, semId, null);
  }
  closeTermPickerModal();
}

// --- Mobil Swipe (Sağa / Sola Kaydırma) Sekme Geçişi ---
(function initMobileSwipeTabs() {
  const appMain = document.querySelector('.app-main');
  if (!appMain) return;

  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeValid = false;

  const isHorizontallyScrollable = (target) => {
    let el = target;
    while (el && el !== appMain) {
      const style = window.getComputedStyle(el);
      const overflowX = style ? style.overflowX : '';
      if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 2) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  };

  appMain.addEventListener('touchstart', (e) => {
    if (window.innerWidth > 900 || e.touches.length !== 1) {
      swipeValid = false;
      return;
    }
    const target = e.target;
    if (target.closest('select, input, textarea') || isHorizontallyScrollable(target)) {
      swipeValid = false;
      return;
    }
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
    swipeValid = true;
  }, { passive: true });

  appMain.addEventListener('touchend', (e) => {
    if (!swipeValid || window.innerWidth > 900 || !e.changedTouches || e.changedTouches.length === 0) {
      swipeValid = false;
      return;
    }
    swipeValid = false;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX;
    const deltaY = touch.clientY - swipeStartY;

    if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        switchMobileTab('semesters');
      } else {
        switchMobileTab('pool');
      }
    }
  }, { passive: true });
})();

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    closeToolsDropdown();
  }
  initUI();
});

updatePinButtonUI();
applyDashCardPosition();
loadCurriculum();
