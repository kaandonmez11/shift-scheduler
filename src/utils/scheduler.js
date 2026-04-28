import { checkIsHoliday } from './holidays';

export const generateSchedule = (year, month, employees, settings, startDay = 1, customHolidays = []) => {
  const {
    dayShiftHours = 8,
    nightShiftHours = 16,
    dailyDayTarget = 3,
    dailyNightTarget = 2,
    aShiftHours = 8,
    bShiftHours = 5,
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

      if (dayOfWeek === 0) {
        schedule[emp.id][d] = '-';
      } else if (dayOfWeek === 6) {
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

  const mainEmployees = employees.filter(emp => emp.seniority !== 'hamile' && emp.seniority !== 'sorumlu');

  for (let day = startDay; day <= numDays; day++) {

    const hamileOnDuty = employees.filter(emp =>
      emp.seniority === 'hamile' && schedule[emp.id][day] === FIXED_DAY
    ).length;
    const effectiveDayTarget = dailyDayTarget - hamileOnDuty;

    let availableForDay = [];
    let availableForNight = [];
    let assignedDayCount = 0;
    let assignedNightCount = 0;

    mainEmployees.forEach(emp => {
      const reqShift = emp.requestedShifts?.[day];

      // İzin isteği (yeni yapı veya eski requestedOffDays)
      if (reqShift === 'İzin' || emp.requestedOffDays?.includes(day)) {
        schedule[emp.id][day] = 'İzin';
        return;
      }

      // Sabit vardiya isteği — doğrudan ata, havuza ekleme
      if (reqShift === DAY) {
        schedule[emp.id][day] = DAY;
        currentHours[emp.id] += dayShiftHours;
        shiftCounts[emp.id].day++;
        assignedDayCount++;
        return;
      }

      if (reqShift === NIGHT) {
        schedule[emp.id][day] = NIGHT;
        currentHours[emp.id] += nightShiftHours;
        shiftCounts[emp.id].night++;
        assignedNightCount++;
        return;
      }

      const yestShift = day > 1 ? schedule[emp.id][day - 1] : '-';
      const prevYestShift = day > 2 ? schedule[emp.id][day - 2] : '-';

      let canDay = true;
      let canNight = true;

      if (yestShift === NIGHT) canDay = false;
      if (emp.seniority === 'yeni') canNight = false;
      if (yestShift === NIGHT && prevYestShift === NIGHT) canNight = false;

      if (canDay) availableForDay.push(emp);
      if (canNight) availableForNight.push(emp);
    });

    shuffle(availableForDay);
    shuffle(availableForNight);

    const getScore = (emp, type) => {
      let score = currentHours[emp.id];
      if (type === 'day') score += shiftCounts[emp.id].day * 5;
      if (type === 'night') score += shiftCounts[emp.id].night * 8;
      if (type === 'night' && day > 1 && schedule[emp.id][day - 1] === NIGHT) score += 500;
      return score;
    };

    availableForDay.sort((a, b) => getScore(a, 'day') - getScore(b, 'day'));
    availableForNight.sort((a, b) => getScore(a, 'night') - getScore(b, 'night'));

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
  }

  return { schedule, actualHours: currentHours };
};
