import { Match } from '../types/match';

export const statusLabels: Record<string, string> = {
  finished: 'Завершён',
  live: 'Идёт сейчас',
  scheduled: 'Запланирован',
  postponed: 'Перенесён',
};

export function formatMatchStart(startsAt: string | null) {
  if (!startsAt) {
    return 'Дата и время уточняются';
  }

  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) {
    return 'Дата и время уточняются';
  }

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isUpcomingMatch(match: Match) {
  return match.status !== 'finished';
}