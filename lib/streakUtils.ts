const KEY_STREAK = "narravox_streak";
const KEY_GOAL = "narravox_goal"; // minutos por dia

export interface StreakData {
  currentStreak: number;
  lastActiveDate: string | null; // ISO date YYYY-MM-DD
  todayMinutes: number;
  weekMinutes: number[];  // últimos 7 dias [dom..sab]
  goalMinutes: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayIndex(): number {
  return new Date().getDay(); // 0=dom
}

export function loadStreak(): StreakData {
  if (typeof window === "undefined") return defaultStreak();
  try {
    const raw = localStorage.getItem(KEY_STREAK);
    if (!raw) return defaultStreak();
    const d = JSON.parse(raw) as StreakData;
    return advanceDay(d);
  } catch {
    return defaultStreak();
  }
}

function defaultStreak(): StreakData {
  return {
    currentStreak: 0,
    lastActiveDate: null,
    todayMinutes: 0,
    weekMinutes: [0, 0, 0, 0, 0, 0, 0],
    goalMinutes: parseInt(localStorage?.getItem(KEY_GOAL) ?? "30"),
  };
}

// Avança o estado para o dia atual — reseta streak se saltou um dia
function advanceDay(d: StreakData): StreakData {
  const t = today();
  if (d.lastActiveDate === t) return d;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  const streak = d.lastActiveDate === yStr ? d.currentStreak : 0;

  return {
    ...d,
    currentStreak: streak,
    todayMinutes: 0,
    lastActiveDate: t,
    weekMinutes: resetTodayInWeek(d.weekMinutes),
    goalMinutes: parseInt(localStorage?.getItem(KEY_GOAL) ?? String(d.goalMinutes)),
  };
}

function resetTodayInWeek(week: number[]): number[] {
  const w = [...week];
  w[dayIndex()] = 0;
  return w;
}

function save(d: StreakData): void {
  localStorage.setItem(KEY_STREAK, JSON.stringify(d));
}

export function recordMinutes(minutes: number): StreakData {
  const d = loadStreak();
  const t = today();
  const week = [...d.weekMinutes];
  week[dayIndex()] = (week[dayIndex()] ?? 0) + minutes;

  const todayMins = d.todayMinutes + minutes;
  const goalReached = todayMins >= d.goalMinutes && d.todayMinutes < d.goalMinutes;
  const streak = goalReached ? d.currentStreak + 1 : d.currentStreak;

  const next: StreakData = {
    ...d,
    todayMinutes: todayMins,
    weekMinutes: week,
    lastActiveDate: t,
    currentStreak: streak,
  };
  save(next);
  return next;
}

export function setGoal(minutes: number): void {
  localStorage.setItem(KEY_GOAL, String(minutes));
  const d = loadStreak();
  save({ ...d, goalMinutes: minutes });
}

export function weekProgress(d: StreakData): number {
  const total = d.weekMinutes.reduce((a, b) => a + b, 0);
  const target = d.goalMinutes * 7;
  return Math.min(1, total / target);
}
