import { checkIsHoliday, getArefeDays } from './holidays';

export const generateSchedule = (year, month, employees, settings, startDay = 1, customHolidays = []) => {
  const {
    dayShiftHours = 8,
    nightShiftHours = 16,
    dailyDayTarget = 3,
    dailyNightTarget = 2,
    aShiftHours = 8,
    bShiftHours = 5,
    maxConsecutiveWorkDays = 6,
    targetMonthlyHours = 180,
    shiftLabels = { day: 'D', night: 'N', fixedDay: 'A', fixedHalfDay: 'B' }
  } = settings;

  const { day: DAY, night: NIGHT, fixedDay: FIXED_DAY, fixedHalfDay: FIXED_HALF } = shiftLabels;

  const numDays = new Date(year, month, 0).getDate();
  const schedule = {};
  const currentHours = {};
  const shiftCounts = {};

  employees.forEach(emp => {
    schedule[emp.id] = {};
    currentHours[emp.id] = emp.initialBalance || 0;
    shiftCounts[emp.id] = { day: 0, night: 0 };
    for (let d = 1; d <= numDays; d++) {
      schedule[emp.id][d] = '-';
    }
  });

  // Hamile ve Sorumlu için sabit program ön-ataması
  const arefeDays = getArefeDays(year, month, customHolidays);

  employees.forEach(emp => {
    if (emp.seniority !== 'hamile' && emp.seniority !== 'sorumlu') return;

    for (let d = startDay; d <= numDays; d++) {
      const reqShift = emp.requestedShifts?.[d];
      if (reqShift === 'İzin' || emp.requestedOffDays?.includes(d)) {
        schedule[emp.id][d] = 'İzin';
        continue;
      }

      if (checkIsHoliday(year, month, d, customHolidays)) {
        schedule[emp.id][d] = '-';
        continue;
      }

      const dayOfWeek = new Date(year, month - 1, d).getDay();
      const isArefe = arefeDays.includes(d);

      if (dayOfWeek === 0) {
        schedule[emp.id][d] = '-';
      } else if (isArefe || dayOfWeek === 6) {
        schedule[emp.id][d] = FIXED_HALF;
        currentHours[emp.id] += bShiftHours;
      } else {
        schedule[emp.id][d] = FIXED_DAY;
        currentHours[emp.id] += aShiftHours;
      }
    }
  });

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const isWorkingShift = (s) => s !== '-' && s !== 'İzin';

  const countConsecutiveWorkDays = (empId, currentDay) => {
    let count = 0;
    for (let d = currentDay - 1; d >= 1; d--) {
      const s = schedule[empId][d];
      if (isWorkingShift(s)) {
        count++;
      } else if (s === '-' && d > 1 && schedule[empId][d - 1] === NIGHT) {
        // Nöbet çıkışı günü: nöbetin "ikinci günü" sayılır, sayacı kırmaz
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  const mainEmployees = employees.filter(emp => emp.seniority !== 'hamile' && emp.seniority !== 'sorumlu');

  // Çalışma saatlerini aya eşit dağıtmak için tempo referans değerleri
  const totalSchedulingDays = numDays - startDay + 1;
  const idealHoursPerDay = targetMonthlyHours / totalSchedulingDays;

  for (let day = startDay; day <= numDays; day++) {

    const hamileOnDuty = employees.filter(emp =>
      emp.seniority === 'hamile' && schedule[emp.id][day] === FIXED_DAY
    ).length;
    const effectiveDayTarget = dailyDayTarget - hamileOnDuty;

    // Tempoda olan (önce seç) ve temponun önünde olan (yedek) iki ayrı havuz
    const daysElapsed = day - startDay;
    const idealHoursSoFar = idealHoursPerDay * daysElapsed;

    let primaryDay = [], primaryNight = [];
    let secondaryDay = [], secondaryNight = [];
    let reserveDay = [], reserveNight = []; // yumuşak kural ihlalleri — minimum kadro dolmazsa kullanılır
    let assignedDayCount = 0;
    let assignedNightCount = 0;

    mainEmployees.forEach(emp => {
      const reqShift = emp.requestedShifts?.[day];

      // Kesin kural: İzin
      if (reqShift === 'İzin' || emp.requestedOffDays?.includes(day)) {
        schedule[emp.id][day] = 'İzin';
        return;
      }

      const yestShift = day > 1 ? schedule[emp.id][day - 1] : '-';
      const prevYestShift = day > 2 ? schedule[emp.id][day - 2] : '-';
      const twoNightsInRow = yestShift === NIGHT && prevYestShift === NIGHT;

      // Kesin kurallar: nöbet sonrası gündüz yasak, iki nöbet sonrası üçüncü gece yasak
      const hardBlockDay = yestShift === NIGHT;
      const hardBlockNight = emp.seniority === 'yeni' || twoNightsInRow;

      // Sabit vardiya isteği — kesin kurallar dışında doğrudan ata
      if (reqShift === DAY && !hardBlockDay) {
        schedule[emp.id][day] = DAY;
        currentHours[emp.id] += dayShiftHours;
        shiftCounts[emp.id].day++;
        assignedDayCount++;
        return;
      }
      if (reqShift === NIGHT && !hardBlockNight) {
        schedule[emp.id][day] = NIGHT;
        currentHours[emp.id] += nightShiftHours;
        shiftCounts[emp.id].night++;
        assignedNightCount++;
        return;
      }

      // Yumuşak kural: ardışık gün limiti veya hedef saat → reserve havuza al
      const softExclude =
        countConsecutiveWorkDays(emp.id, day) >= maxConsecutiveWorkDays ||
        currentHours[emp.id] >= targetMonthlyHours;

      if (softExclude) {
        if (!hardBlockDay)   reserveDay.push(emp);
        if (!hardBlockNight) reserveNight.push(emp);
        return;
      }

      // Normal havuz: tempo durumuna ve nöbet çıkışına göre primary/secondary
      const isAheadOfPace = currentHours[emp.id] > idealHoursSoFar;
      const nightForcedBackup = yestShift === NIGHT; // nöbet çıkışı → secondary

      if (!hardBlockDay) {
        if (!isAheadOfPace) primaryDay.push(emp);
        else secondaryDay.push(emp);
      }

      if (!hardBlockNight) {
        if (nightForcedBackup || isAheadOfPace) secondaryNight.push(emp);
        else primaryNight.push(emp);
      }
    });

    shuffle(primaryDay);   shuffle(primaryNight);
    shuffle(secondaryDay); shuffle(secondaryNight);
    shuffle(reserveDay);   shuffle(reserveNight);

    const getScore = (emp, type) => {
      let score = currentHours[emp.id] - idealHoursSoFar;
      if (type === 'day') score += shiftCounts[emp.id].day * 5;
      if (type === 'night') score += shiftCounts[emp.id].night * 8;
      if (type === 'night' && day > 1 && schedule[emp.id][day - 1] === NIGHT) score += 500;
      return score;
    };

    primaryDay.sort((a, b) => getScore(a, 'day') - getScore(b, 'day'));
    primaryNight.sort((a, b) => getScore(a, 'night') - getScore(b, 'night'));
    secondaryDay.sort((a, b) => getScore(a, 'day') - getScore(b, 'day'));
    secondaryNight.sort((a, b) => getScore(a, 'night') - getScore(b, 'night'));
    reserveDay.sort((a, b) => getScore(a, 'day') - getScore(b, 'day'));
    reserveNight.sort((a, b) => getScore(a, 'night') - getScore(b, 'night'));

    // Tempo grubundakiler önce, yedek grup sona; reserve en sona
    const availableForDay = [...primaryDay, ...secondaryDay];
    const availableForNight = [...primaryNight, ...secondaryNight];

    let selectedDay = null;
    let selectedNight = null;

    for (let s of availableForDay) {
      for (let n of availableForNight) {
        if (s.id !== n.id) { selectedDay = s; selectedNight = n; break; }
      }
      if (selectedDay) break;
    }

    if (!selectedDay && !selectedNight) {
      if (availableForNight.length > 0) selectedNight = availableForNight[0];
      else if (availableForDay.length > 0) selectedDay = availableForDay[0];
    }

    if (selectedDay) {
      schedule[selectedDay.id][day] = DAY;
      currentHours[selectedDay.id] += dayShiftHours;
      shiftCounts[selectedDay.id].day++;
      assignedDayCount++;
    }

    if (selectedNight) {
      schedule[selectedNight.id][day] = NIGHT;
      currentHours[selectedNight.id] += nightShiftHours;
      shiftCounts[selectedNight.id].night++;
      assignedNightCount++;
    }

    for (let emp of availableForNight) {
      if (assignedNightCount >= dailyNightTarget) break;
      if (schedule[emp.id][day] !== '-') continue;
      schedule[emp.id][day] = NIGHT;
      currentHours[emp.id] += nightShiftHours;
      shiftCounts[emp.id].night++;
      assignedNightCount++;
    }

    for (let emp of availableForDay) {
      if (assignedDayCount >= effectiveDayTarget) break;
      if (schedule[emp.id][day] !== '-') continue;
      schedule[emp.id][day] = DAY;
      currentHours[emp.id] += dayShiftHours;
      shiftCounts[emp.id].day++;
      assignedDayCount++;
    }

    // Normal havuzlar yetersiz kaldıysa reserve (yumuşak kural ihlalleri) devreye girer
    for (let emp of reserveNight) {
      if (assignedNightCount >= dailyNightTarget) break;
      if (schedule[emp.id][day] !== '-') continue;
      schedule[emp.id][day] = NIGHT;
      currentHours[emp.id] += nightShiftHours;
      shiftCounts[emp.id].night++;
      assignedNightCount++;
    }

    for (let emp of reserveDay) {
      if (assignedDayCount >= effectiveDayTarget) break;
      if (schedule[emp.id][day] !== '-') continue;
      schedule[emp.id][day] = DAY;
      currentHours[emp.id] += dayShiftHours;
      shiftCounts[emp.id].day++;
      assignedDayCount++;
    }
  }

  return { schedule, actualHours: currentHours };
};
