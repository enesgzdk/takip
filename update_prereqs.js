const fs = require('fs');
const path = require('path');

// 1. Dosya yolları
const preqPath = path.join(__dirname, 'preq.json');
const currPath = path.join(__dirname, 'curriculum.json');
const backupPath = path.join(__dirname, 'curriculum.backup.json');

// Güvenlik için mevcut curriculum.json dosyasının yedeğini al
fs.copyFileSync(currPath, backupPath);
console.log('✓ curriculum.json yedeği alındı: curriculum.backup.json');

const preqData = JSON.parse(fs.readFileSync(preqPath, 'utf8'));
const currData = JSON.parse(fs.readFileSync(currPath, 'utf8'));

// 2. Önkoşul temizleme ve formatlama fonksiyonu
function cleanPrereqItem(p, courseCode) {
  if (!p || typeof p !== 'string') return '';
  let s = p.trim();
  if (!s || s.toLowerCase() === 'none') return '';

  // 1. İngilizce yeterlilik şartları (BUEPT / TOEFL / IELTS)
  if (/buept|toefl|ielts/i.test(s)) {
    return 'İngilizce Yeterlilik (BUEPT)';
  }

  // 2. Tek başına hoca onayı
  if (/^\s*(?:on\s+)?consent\s+of\s+(?:the\s+)?instructor\s*$/i.test(s)) {
    return 'Hoca Onayı';
  }

  // 3. Tek başına veya hoca onayıyla birlikte son sınıf şartı
  if (/^\s*(?:senior|4th\s+year)\s+standing(?:\s+in\s+[a-z]+)?(?:\s+(?:and|or)\s+consent\s+of\s+(?:the\s+)?instructor)?\s*$/i.test(s)) {
    return 'Son Sınıf Şartı';
  }

  // 4. Alternatifli durumlarda hoca onayını kaldır (örn: "MATH 221 or consent of instructor" -> "MATH 221")
  s = s.replace(/[,;/]?\s*\bor\s+(?:the\s+)?consent\s+of\s+(?:the\s+)?instructor(?:\s+for\s+[a-z0-9\s]+)?/gi, '');
  s = s.replace(/[,;/]?\s*\band\s+(?:the\s+)?consent\s+of\s+(?:the\s+)?instructor/gi, '');
  s = s.replace(/\s+consent\s+of\s+(?:the\s+)?instructor/gi, '');

  // 5. Birleşik metinler içindeki senior / 4th year standing ifadelerini kısalt
  s = s.replace(/\b(?:senior|4th\s+year)\s+standing(?:\s+in\s+[a-z]+)?\b/gi, 'Son Sınıf Şartı');

  // 6. Eş koşul (Corequisite) formatlama
  s = s.replace(/^(?:Prerequisite\s+or\s+)?Corequisite:\s*/i, 'Eş koşul: ');
  s = s.replace(/,\s*concurrent\s+with\s*(\d{3})/i, (m, num) => {
    const deptMatch = courseCode.match(/^[A-Z]+/);
    const dept = deptMatch ? deptMatch[0] : '';
    return ', Eş koşul: ' + (dept ? dept + ' ' : '') + num;
  });

  // 7. 'JP 101 and 102' gibi kısaltmaları 'JP 101 and JP 102' şeklinde tamamla
  s = s.replace(/\b([A-Za-z]{2,5})\s*(\d{3})\s+(and|or)\s+(\d{3})\b/g, '$1 $2 $3 $1 $4');

  // 8. Tek başına kalan ders numaralarını dersin kendi bölüm koduyla tamamla (örn: EC 310 içindeki "102" -> "EC 102")
  if (/^\d{3}[A-Za-z0-9\.]*$/.test(s)) {
    const deptMatch = courseCode.match(/^[A-Za-z]+/);
    if (deptMatch) s = deptMatch[0].toUpperCase() + ' ' + s;
  }

  // 9. Bölüm kodlarının büyük harfe normalize edilmesi (CmpE -> CMPE, Phys -> PHYS vb.)
  s = s.replace(/\b([A-Za-z]{2,5})\s*(\d{3}[A-Za-z0-9\.]*)\b/g, (m, dept, num) => {
    if (['AND', 'FOR', 'THE', 'OR'].includes(dept.toUpperCase())) return m;
    return dept.toUpperCase() + ' ' + num;
  });

  // 10. Temizlik sonrası kalan fazla noktalama ve boşlukları düzelt
  s = s.replace(/;\s*$/, '').replace(/,\s*$/, '').replace(/\(\s*\)/g, '').trim();
  s = s.replace(/\s{2,}/g, ' ');

  if (/^[,\s;\(\)\/]+$/.test(s)) return '';

  return s;
}

// 3. preq.json verilerini hızlı erişim sözlüğüne dönüştür
const preqMap = new Map();

preqData.forEach(item => {
  if (!item.course_code) return;
  const normalizedKey = item.course_code.trim().toUpperCase();
  const rawList = Array.isArray(item.prerequisites) ? item.prerequisites : [];
  
  const cleanedItems = rawList
    .map(p => cleanPrereqItem(p, normalizedKey))
    .filter(Boolean);

  if (cleanedItems.length > 0) {
    const joined = cleanedItems.join(', ');
    const formattedPrereq = 'Önkoşul: ' + joined;
    preqMap.set(normalizedKey, formattedPrereq);
  }
});

console.log(`✓ preq.json'dan ${preqMap.size} adet geçerli önkoşul kaydı hazırlandı.`);

// 4. curriculum.json dosyasını güncelle
let updatedCount = 0;
let removedCount = 0;
let totalCourses = 0;

Object.keys(currData).forEach(deptKey => {
  const dept = currData[deptKey];
  if (!dept || !Array.isArray(dept.courses)) return;

  dept.courses.forEach(course => {
    totalCourses++;
    const code = (course.code || '').trim().toUpperCase();
    let assignedPrereq = null;

    // 1. Birebir tam eşleşme kontrolü (örn: "MATH 102")
    if (preqMap.has(code)) {
      assignedPrereq = preqMap.get(code);
    } 
    // 2. Eğik çizgi (slash) içeren alternatif ders kodları (örn: "AE 111/AE 112", "SOC 224/262")
    else if (code.includes('/')) {
      const parts = code
        .split('/')
        .map(p => p.trim().toUpperCase())
        .filter(p => !['--', 'HSS', 'LIT', 'MLE'].includes(p));

      for (const part of parts) {
        if (preqMap.has(part)) {
          assignedPrereq = preqMap.get(part);
          break;
        }
      }
    }

    if (assignedPrereq) {
      course.prereq = assignedPrereq;
      updatedCount++;
    } else {
      if (course.prereq) removedCount++;
      delete course.prereq;
    }
  });
});

// 5. UTF-8 formatında dosyayı kaydet
fs.writeFileSync(currPath, JSON.stringify(currData, null, 2), 'utf8');

console.log('====================================================');
console.log(`✓ Müfredat güncellemesi başarıyla tamamlandı!`);
console.log(`• Toplam Taranan Ders Sayısı: ${totalCourses}`);
console.log(`• Başarıyla Önkoşul Eklenen/Güncellenen Ders Sayısı: ${updatedCount}`);
console.log(`• Önkoşulu Olmadığı İçin Temizlenen Ders Sayısı: ${removedCount}`);
console.log(`• Hedef Dosya: ${currPath}`);
console.log('====================================================');
