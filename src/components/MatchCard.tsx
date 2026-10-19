import { StyleSheet, Text, View } from 'react-native';
import { FavoriteButton } from './FavoriteButton';
import { formatMatchStart, statusLabels } from '../utils/matchUtils';
import { Match } from '../types/match';

type Props = {
  match: Match;
  favorite: boolean;
  onToggleFavorite: () => void;
};

export function MatchCard({ match, favorite, onToggleFavorite }: Props) {
  const status = statusLabels[match.status] ?? 'Статус уточняется';
  const score = match.score ? `${match.score.home} : ${match.score.away}` : '—';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatMatchStart(match.startsAt)}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.status}>{status}</Text>
          <FavoriteButton active={favorite} onPress={onToggleFavorite} />
        </View>
      </View>
      <View style={styles.teamsRow}>
        <View style={styles.teams}>
          <Text style={styles.team}>{match.home.name}</Text>
          <Text style={styles.team}>{match.away.name}</Text>
        </View>
        <Text style={styles.score}>{score}</Text>
      </View>
      {match.status === 'live' && match.minute !== undefined && (
        <Text style={styles.liveMinute}>{match.minute} мин</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  date: {
    color: '#6b7280',
    fontSize: 13,
  },
  status: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  teamsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teams: {
    flex: 1,
    gap: 8,
  },
  team: {
    fontSize: 16,
    fontWeight: '600',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
  },
  liveMinute: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 12,
  },
});