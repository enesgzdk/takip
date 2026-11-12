const isMobileDevice = () => window.innerWidth <= 900;

const DEFAULT_TERM = "2026/2027-1";

const GRADE_POINTS = {
  'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5,
  'CC': 2.0, 'DC': 1.5, 'DD': 1.0, 'F': 0.0, 'P': null
};

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getBounCourseUrl(courseCode, term = DEFAULT_TERM) {
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

  const cleanCode = match[1] + match[2];
  return `https://registration.bogazici.edu.tr/login/?page=course-search&semester=${encodeURIComponent(term)}&q=${cleanCode.toLowerCase()}`;
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
      badge.textContent = '🔁 Tekrar';
      titleGroup.appendChild(badge);
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

    populateDepartmentSelect();
    populateMinorModalOptions();
    initUI();
  } catch (err) {
    console.error("Müfredat JSON dosyası yüklenemedi:", err);
    document.body.innerHTML = `
      <div style="padding: 24px; font-family: sans-serif; color: #b91c1c; text-align: center;">
        <h2>Müfredat Verisi Yüklenemedi!</h2>
        <p><code>curriculum.json</code> dosyasının <code>index.html</code> ile aynı klasörde olduğundan ve sayfayı yerel bir sunucu (Live Server vb.) üzerinden açtığınızdan emin olun.</p>
        <p style="color: #64748b; font-size: 0.85rem;">Hata detayı: ${escapeHTML(err.message)}</p>
      </div>
    `;
  }
}

/* Fakültelere Göre optgroup Üreten Gelişmiş Seçim Menüsü */
function populateDepartmentSelect() {
  const select = document.getElementById('deptSelect');
  select.innerHTML = '';

  const faculties = {};
  Object.keys(departmentsData).forEach(deptKey => {
    const dept = departmentsData[deptKey];
    const facultyName = dept.faculty || "Diğer Lisans Programları";
    if (!faculties[facultyName]) {
      faculties[facultyName] = [];
    }
    faculties[facultyName].push({ key: deptKey, name: dept.name });
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
  select.innerHTML = '<option value="">(Yandal Yok / İptal Et)</option>';

  const faculties = {};
  Object.keys(minorsData).forEach(minorKey => {
    const m = minorsData[minorKey];
    const fac = m.faculty || "Diğer Fakülteler";
    if (!faculties[fac]) faculties[fac] = [];
    faculties[fac].push({ key: minorKey, name: m.name });
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

  document.getElementById('selected-courses-count').innerText = `${selectedCourseIds.size} Ders`;
  document.getElementById('selected-credits').innerText = `${selectedCreditsTotal} Cr`;
  document.getElementById('completed-credits').innerText = `${completedCreditsTotal} Cr (${passedCourseIds.size} Ders)`;

  const totalRequiredCredits = allRequiredCourses.reduce((sum, c) => sum + (Number(c.crd) || 0), 0);
  document.getElementById('total-credits').innerText = `${totalRequiredCredits} Cr`;

  const passedRequiredCount = allRequiredCourses.filter(c => passedCourseIds.has(c.id)).length;
  const remaining = Math.max(0, allRequiredCourses.length - passedRequiredCount);
  const remainingEl = document.getElementById('remaining-count');
  if (remainingEl) {
    remainingEl.innerHTML = `${remaining} <span style="font-size: 0.72rem; font-weight: 600; opacity: 0.85;">/ ${allRequiredCourses.length}</span>`;
    remainingEl.title = `Kalan: ${remaining} Ders, Toplam: ${allRequiredCourses.length} Ders`;
  }
}

function updateSidebarPool() {
  const state = getDeptState(currentDept);
  const majorCourses = departmentsData[currentDept]?.courses || [];
  const activeMinorCourses = getActiveMinorCourseList();
  const allRequiredCourses = [...majorCourses, ...activeMinorCourses];

  const poolTitleEl = document.getElementById('sidebarPoolTitle');
  if (poolTitleEl) {
    poolTitleEl.innerText = `Ders Havuzu (${allRequiredCourses.length} Ders)`;
  }

  const pool = document.getElementById('course-pool');
  pool.innerHTML = '';

  const allSems = [];
  yearStructure.forEach(y => y.sems.forEach(s => allSems.push(s)));
  const semOptions = allSems.map(s => `<option value="${s}">Dönem ${s}</option>`).join('');

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

  const semesterLabels = {
    '1.1': '1. Dönem (1. Yıl Güz)',
    '1.2': '2. Dönem (1. Yıl Bahar)',
    '2.1': '3. Dönem (2. Yıl Güz)',
    '2.2': '4. Dönem (2. Yıl Bahar)',
    '3.1': '5. Dönem (3. Yıl Güz)',
    '3.2': '6. Dönem (3. Yıl Bahar)',
    '4.1': '7. Dönem (4. Yıl Güz)',
    '4.2': '8. Dönem (4. Yıl Bahar)',
    'other': 'Diğer / Genel Seçmeliler'
  };

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
      <span>${semesterLabels[semKey] || ('Dönem ' + semKey)}</span>
      <span>${groupCourses.length} Ders</span>
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

      let statusBadge = '<span class="status-badge pending">• Alınmadı</span>';
      if (hasPassed) {
        const sortedPassed = [...courseInstances]
          .filter(inst => inst.passed && inst.grade !== 'F')
          .sort((a, b) => compareSemesters(a.semId, b.semId));
        const passedInst = sortedPassed[sortedPassed.length - 1];
        const gradeText = passedInst ? `(${escapeHTML(passedInst.grade || 'AA')})` : '';
        statusBadge = `<span class="status-badge locked">🔒 Verildi ${gradeText}</span>`;
      } else if (hasFailedOnly) {
        statusBadge = '<span class="status-badge failed">✕ Verilmedi</span>';
      } else if (isPlaced) {
        statusBadge = '<span class="status-badge pending" style="color: #0284c7; font-weight: 600;">• Döneme Eklendi</span>';
      }

      const poolCourseUrl = getBounCourseUrl(course.code);
      const safeCode = escapeHTML(course.code);
      const safeName = escapeHTML(course.name);
      const safePrereq = course.prereq ? escapeHTML(course.prereq) : '';

      poolCard.innerHTML = `
        <div class="course-header">
          <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
            <span class="course-title">${safeCode}</span>
            ${isMinor ? '<span class="minor-badge">🎓 Yandal</span>' : ''}
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
               title="${safeCode} için Boğaziçi BUIS ders arama sayfası (yeni sekmede açılır)">
              🔗 Ders Sayfasını Aç
            </a>
          </div>
        ` : ''}
        <div class="course-controls" style="margin-top: 4px;">
          ${statusBadge}
        </div>
        
        ${!isLocked ? `
          <div class="mobile-add-wrap">
            <select class="mobile-add-select" onchange="handleMobileAddCourse('${escapeHTML(course.id)}', this.value, this)">
              <option value="">➕ Döneme Ekle...</option>
              ${semOptions}
            </select>
          </div>
        ` : ''}
      `;

      if (!isLocked && !isMobile) {
        poolCard.addEventListener('dragstart', handlePoolDragStart);
        poolCard.addEventListener('dragend', handleDragEnd);
      }

      groupContainer.appendChild(poolCard);
    });

    pool.appendChild(groupContainer);
  });

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
  showToast(`✓ ${course.code} → Dönem ${targetSem}'e eklendi`);
}

function initUI() {
  document.getElementById('deptSelect').value = currentDept;

  const activeDeptData = departmentsData[currentDept];
  if (!activeDeptData) return;

  const state = getDeptState(currentDept);
  const yearsGrid = document.getElementById('years-grid');
  yearsGrid.innerHTML = '';

  yearStructure.forEach(y => {
    const row = document.createElement('div');
    row.className = `year-row ${y.isExtended ? 'extended' : ''}`;

    const title = document.createElement('div');
    title.className = 'year-title';
    title.innerHTML = `
      <span>${y.yearLabel}</span>
      ${y.tag ? `<span class="limit-tag">${y.tag}</span>` : ''}
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

      box.innerHTML = `
        <div class="semester-header">
          <div style="display:flex; align-items:center;">
            <span>Dönem ${semId}</span>
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
        const tooltipContent = `<strong>${escapeHTML(activeDeptData.name)} (${escapeHTML(semId)}):</strong><br>${listStr}`;
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

  const effectiveCode = (course.isElective && inst.customText) ? inst.customText : course.code;
  const courseUrl = getBounCourseUrl(effectiveCode);

  const safeCode = escapeHTML(course.code);
  const safeName = escapeHTML(course.name);
  const safePrereq = course.prereq ? escapeHTML(course.prereq) : '';
  const safeCustomText = escapeHTML(inst.customText || '');
  const safeEffectiveCode = escapeHTML(effectiveCode);

  card.innerHTML = `
    <div class="course-header">
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; min-width:0;">
        <span class="course-title">${safeCode}</span>
        ${isMinor ? '<span class="minor-badge">🎓 Yandal</span>' : ''}
        ${isRepeat ? '<span class="repeat-badge">🔁 Tekrar</span>' : ''}
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        ${isPassed ? `
          <div class="grade-selector-wrap" title="Harf Notu">
            <select class="grade-select" onchange="handleGradeChange('${inst.instanceId}', this.value)">
              ${gradeOptions}
            </select>
          </div>
        ` : ''}
        <span class="course-credits">${course.crd} Cr</span>
        ${!isPassed ? `
          <button class="delete-btn" onclick="removeInstance('${inst.instanceId}')" title="${isMinor ? 'Bu yandal dersini kaldır' : 'Bu dönemden kaldır'}">✕</button>
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
           title="${safeEffectiveCode} için Boğaziçi BUIS ders arama sayfası (yeni sekmede açılır)">
          🔗 Ders Sayfasını Aç
        </a>
      ` : ''}
    </div>
    
    ${course.isElective ? `
      <input type="text" 
             class="custom-input" 
             placeholder="Seçilen Ders Adı/Kodu..." 
             value="${safeCustomText}" 
             ${isPassed ? 'disabled style="background:#f1f5f9; cursor:not-allowed;"' : ''}
             oninput="handleInstanceInput('${inst.instanceId}', this.value)">
    ` : ''}

    <div class="course-controls">
      <label style="cursor:pointer; display:flex; align-items:center; gap:5px; font-weight:600;">
        <input type="checkbox" ${isPassed ? 'checked' : ''} onchange="toggleInstancePassed('${inst.instanceId}', this.checked)">
        Verdim
      </label>
      <span class="status-badge ${isPassed ? 'locked' : 'failed'}">
        ${isPassed ? '✓ Geçildi' : '✕ Verilmedi'}
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
        const effectiveCode = (course && course.isElective && text.trim()) ? text.trim() : (course ? course.code : text.trim());
        const newUrl = getBounCourseUrl(effectiveCode);
        if (newUrl) {
          const safeEffectiveCode = escapeHTML(effectiveCode);
          linkWrap.innerHTML = `
            <a href="${escapeHTML(newUrl)}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="course-desc-link" 
               draggable="false"
               onclick="event.stopPropagation();" 
               title="${safeEffectiveCode} için Boğaziçi BUIS ders arama sayfası (yeni sekmede açılır)">
              🔗 Ders Sayfasını Aç
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
  const deptName = departmentsData[currentDept]?.name || currentDept;
  if (confirm(`Yalnızca "${deptName}" bölümü planlamanız sıfırlanacak. Emin misiniz?`)) {
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

    showToast("✓ Plan başarıyla JSON olarak indirildi!");
  } catch (err) {
    console.error("Dışa aktarma hatası:", err);
    alert("Dışa aktarma sırasında bir hata oluştu: " + err.message);
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
        throw new Error("Dosya geçerli bir JSON formatında değil.");
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error("Geçersiz veya boş veri formatı.");
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
        throw new Error("JSON dosyasında geçerli bir ders planı veya dönem kaydı bulunamadı.");
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
        const confirmOverwrite = confirm("Yüklemek istediğiniz plan mevcut planınızın üzerine yazılacak. Devam etmek istiyor musunuz?");
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
      showToast("✓ Plan başarıyla yüklendi!");
    } catch (err) {
      console.error("İçe aktarma hatası:", err);
      alert("Hata: JSON dosyası yüklenemedi!\n" + err.message);
    } finally {
      event.target.value = '';
    }
  };

  reader.onerror = function() {
    alert("Dosya okunamadı. Lütfen tekrar deneyin.");
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
  showToast(`✓ ${minor.name} seçildi (${minorCourses.length} ders). Dersler sol paneldeki ilgili dönem bloklarına eklendi!`);
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
    showToast("Yandal programı kaldırıldı.");
  }
}

function removeMinor(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  if (confirm("Mevcut yandal programını ve dönemlerdeki yandal derslerini kaldırmak istediğinize emin misiniz?")) {
    removeCurrentMinor(true);
  }
}

function updateMinorButtonUI() {
  const minorBtn = document.getElementById('minorBtn');
  if (!minorBtn) return;
  const state = getDeptState(currentDept);
  const minorId = state.selectedMinorId;

  if (minorId && minorsData[minorId]) {
    const minor = minorsData[minorId];
    const match = minor.name.match(/\(([^)]+)\)/);
    const shortName = match ? match[1] : minor.name.replace(/Yandalı?/i, '').trim();
    minorBtn.className = 'minor-btn has-minor';
    minorBtn.innerHTML = `🎓 Yandal: ${escapeHTML(shortName)} <span class="minor-remove-btn" onclick="removeMinor(event)" title="Yandalı Kaldır">✕</span>`;
    minorBtn.title = `${minor.name} (Kaldırmak için ✕ butonuna tıklayın)`;
  } else {
    minorBtn.className = 'minor-btn';
    minorBtn.innerHTML = `🎓 Yandal Ekle`;
    minorBtn.title = "Yandal Programı Seç ve Dönemlere Ekle";
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
        (Yandal seçilmedi veya mevcut yandal iptal edilecek.)
      </div>
    `;
    return;
  }

  const minor = minorsData[minorKey];
  const req = minor.requirements || {};
  let reqHtml = '';
  if (req.totalCourses) reqHtml += `<span>📚 Toplam Ders: <strong>${req.totalCourses}</strong></span>`;
  if (req.totalCredits) reqHtml += `<span>🎯 Kredi: <strong>${req.totalCredits} Cr</strong></span>`;
  if (req.gpa) reqHtml += `<span>⭐ Başvuru GPA: <strong>${req.gpa.toFixed(2)}</strong></span>`;
  if (req.applicationPrereq && req.applicationPrereq.length > 0) {
    reqHtml += `<span>📋 Önkoşul: <strong>${escapeHTML(req.applicationPrereq.join(', '))}</strong></span>`;
  }

  const courseList = getMinorCourseList(minorKey);
  const coursesPreview = courseList.map(c => `<code>${escapeHTML(c.code)}</code> (${c.crd} Cr)`).join(', ');

  previewBox.innerHTML = `
    <div class="minor-preview-title">${escapeHTML(minor.name)}</div>
    <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 8px;">🏛️ ${escapeHTML(minor.faculty || '')}</div>
    ${reqHtml ? `<div class="minor-preview-reqs">${reqHtml}</div>` : ''}
    <div style="margin-top: 8px; font-size: 0.82rem; color: #334155;">
      <strong>Örnek Ders Dağılımı:</strong><br>
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
    alert("Lütfen başlık ve açıklama alanlarını eksiksiz doldurun.");
    return;
  }

  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "<span>Gönder</span>";

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="issue-spinner"></span>
      <span>Gönderiliyor...</span>
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
      let errorMsg = `Sunucu hatası (${response.status})`;
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
    showToast("✓ Bildiriminiz başarıyla iletildi, teşekkürler!");
  } catch (err) {
    console.error("Geri bildirim hatası:", err);
    alert(`Bildirim gönderilirken bir hata oluştu: ${err.message || "Lütfen tekrar deneyin."}`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
}

/* Mobilde Akıllı Scroll & Kart Gizleme / Gösterme Sistemi */
let lastPoolScrollTop = 0;
let isTogglingCard = false;
const poolScrollEl = document.getElementById('course-pool');
const dashCardWrapper = document.getElementById('dashCardWrapper');
const sidebarFixedTop = document.getElementById('sidebarFixedTop');

function setCardState(shouldCollapse) {
  if (!isMobileDevice()) return;
  const isCurrentlyCollapsed = dashCardWrapper.classList.contains('collapsed');
  if (isCurrentlyCollapsed === shouldCollapse || isTogglingCard) return;

  const previousHeight = dashCardWrapper.offsetHeight;
  isTogglingCard = true;

  if (shouldCollapse) {
    dashCardWrapper.classList.add('collapsed');
  } else {
    dashCardWrapper.classList.remove('collapsed');
  }

  requestAnimationFrame(() => {
    const heightDiff = previousHeight - dashCardWrapper.offsetHeight;
    if (shouldCollapse && heightDiff > 0 && poolScrollEl.scrollTop > heightDiff) {
      poolScrollEl.scrollTop -= (heightDiff * 0.4);
    }
    setTimeout(() => {
      isTogglingCard = false;
      lastPoolScrollTop = poolScrollEl.scrollTop;
    }, 280);
  });
}

poolScrollEl.addEventListener('scroll', () => {
  if (!isMobileDevice() || isTogglingCard) return;

  const currentScroll = poolScrollEl.scrollTop;
  const scrollDiff = currentScroll - lastPoolScrollTop;

  if (currentScroll <= 15) {
    setCardState(false);
  } else if (scrollDiff > 12 && currentScroll > 50) {
    setCardState(true);
  } else if (scrollDiff < -8) {
    setCardState(false);
  }

  lastPoolScrollTop = currentScroll;
}, { passive: true });

let touchStartY = 0;
sidebarFixedTop.addEventListener('touchstart', (e) => {
  if (!isMobileDevice()) return;
  if (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

sidebarFixedTop.addEventListener('touchmove', (e) => {
  if (!isMobileDevice() || !touchStartY) return;
  if (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;

  const touchCurrentY = e.touches[0].clientY;
  const deltaY = touchStartY - touchCurrentY;

  poolScrollEl.scrollTop += deltaY;
  touchStartY = touchCurrentY;

  if (deltaY > 6) {
    setCardState(true);
  } else if (deltaY < -6) {
    setCardState(false);
  }
}, { passive: true });

sidebarFixedTop.addEventListener('touchend', () => {
  touchStartY = 0;
}, { passive: true });

window.addEventListener('resize', () => {
  if (!isMobileDevice()) {
    dashCardWrapper.classList.remove('collapsed');
  }
  initUI();
});

loadCurriculum();
