/**
 * Aylık Vardiya Dağıtım Algoritması (Scheduler / Kural Motoru)
 * 
 * @param {number} year - Yıl (Örn: 2026)
 * @param {number} month - Ay (Örn: 5)
 * @param {Array} employees - Personel Listesi [{ id, name, seniority, requestedOffDays }]
 * @param {Object} settings - Ayarlar { dayShiftHours, nightShiftHours, targetMonthlyHours, dailyDayTarget, dailyNightTarget }
 * @returns {Object} Sonuç Matrisi { schedule: { empId: { day: 'S'|'N'|'İzin'|'-' } }, actualHours: { empId: hours } }
 */
export const generateSchedule = (year, month, employees, settings) => {
  // Varsayılan kotalar (Kullanıcı girmezse 3 Gündüz, 2 Gece)
  const { 
    dayShiftHours = 8, 
    nightShiftHours = 12, 
    dailyDayTarget = 3,
    dailyNightTarget = 2
  } = settings;

  const numDays = new Date(year, month, 0).getDate();
  const schedule = {};
  const currentHours = {};

  // 1. Durum Başlangıcı (State Init)
  employees.forEach(emp => {
    schedule[emp.id] = {};
    currentHours[emp.id] = 0;
    for (let d = 1; d <= numDays; d++) {
      schedule[emp.id][d] = '-';
    }
  });

  // Ay içindeki her gün için sırayla dağıtım yapılır
  for (let day = 1; day <= numDays; day++) {
    
    let availableForDay = [];
    let availableForNight = [];

    // O gün için kimlerin uygun olduğunu filtrele
    employees.forEach(emp => {
      // KURAL 1: Kullanıcı bu günü izin (boş) gün olarak talep ettiyse
      if (emp.requestedOffDays && emp.requestedOffDays.includes(day)) {
        schedule[emp.id][day] = 'İzin';
        return; // Gün döngüsünde bu personel için başka işleme gerek yok
      }

      // Geçmiş günler
      const yestShift = day > 1 ? schedule[emp.id][day - 1] : '-';
      const prevYestShift = day > 2 ? schedule[emp.id][day - 2] : '-';
      
      let canDay = true;
      let canNight = true;

      // KURAL 2: Personel dün Gece Nöbeti (N) tuttuysa bugün kesinlikle Sabah (S) alamaz. (Dinlenme mecburiyeti)
      if (yestShift === 'N') {
        canDay = false;
      }

      // KURAL (Kıdem): 'Yeni' olanlar asla Gece (N) Nöbetine kalamaz.
      if (emp.seniority === 'yeni') {
        canNight = false;
      }

      // KURAL 3 (Tıkanıklık İzni): Peş peşe nöbet istenmez. Ancak en az eleman bile yoksa MAX 2 gün üst üste tutabilir.
      // Eger eleman dun ve onceki gun ust uste iki kez gece yazildiysa, bugün fiziki olarak kesinlikle N alamaz.
      if (yestShift === 'N' && prevYestShift === 'N') {
        canNight = false;
      }

      // Uygunluk havuzlarına kayıt
      if (canDay) availableForDay.push(emp);
      if (canNight) availableForNight.push(emp);
    });

    // -------------------------------------------------------------
    // Puanlama & Dengeleme (Sorting System)
    // En az saate sahip olan kişi (saat açlığı çeken) vardiyayı kapar.
    
    // Gündüz sıralaması
    availableForDay.sort((a, b) => currentHours[a.id] - currentHours[b.id]);
    
    // Gece sıralaması
    availableForNight.sort((a, b) => {
      // Dün gece nöbetçi olan bir personelin bugün de nöbet almaması için "Cezalandırma Puanı" ekliyoruz.
      // Böylelikle sadece havuzda gerçekten "Başka kimse kalmamışsa" son çare olarak nöbet üstüne nöbet alır.
      const penaltyA = (day > 1 && schedule[a.id][day - 1] === 'N') ? 1000 : 0;
      const penaltyB = (day > 1 && schedule[b.id][day - 1] === 'N') ? 1000 : 0;
      
      const scoreA = currentHours[a.id] + penaltyA;
      const scoreB = currentHours[b.id] + penaltyB;
      
      return scoreA - scoreB;
    });

    // -------------------------------------------------------------
    // Vardiya Atamaları (Limitsiz Eleman Olsa Bile Hedef Kotaya Kadar Kısıtlanır)
    
    let assignedNightCount = 0;
    let assignedDayCount = 0;

    // ÖNCELİK GECEYE: Nöbet daha kritiktir ve kuralları daha sıkıdır.
    for (let emp of availableForNight) {
      if (assignedNightCount >= dailyNightTarget) break; 
      
      schedule[emp.id][day] = 'N';
      currentHours[emp.id] += nightShiftHours;
      assignedNightCount++;
    }

    // SONRA GÜNDÜZ: Kalan elemanlardan gündüz hedefini tamamla.
    for (let emp of availableForDay) {
      if (assignedDayCount >= dailyDayTarget) break;
      
      // Personel eğer yukarda geceye çekildiyse aynı anda sabaha da gelemez (Bir günde iki farklı nöbet yok)
      if (schedule[emp.id][day] === 'N') continue;

      schedule[emp.id][day] = 'S';
      currentHours[emp.id] += dayShiftHours;
      assignedDayCount++;
    }

    // Not: "Eleman yetersiz olacak olursa minimum 1" kuralı şu anlama gelir;
    // Puanlama, hedefe ulaşana kadar personelleri çeker. Zaten havuzda 1 kişi kalmışsa
    // for döngüsü sadece o 1 kişiyi atar ve kotayı (%100 eleman yokluğu durumunda) elinden 
    // geldiğince, kuralları ezip sistemi kırmadan gerçekleştirmiş olur.
  }

  return { schedule, actualHours: currentHours };
};
