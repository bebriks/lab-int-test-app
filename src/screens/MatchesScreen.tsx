import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { MATCHES_URL } from '../config';
import localMatches from '../../data/matches.json';
import { useFavorites } from '../hooks/useFavorites';
import { Match, MatchFilter, MatchesResponse } from '../types/match';
import { isUpcomingMatch } from '../utils/matchUtils';

export function MatchesScreen() {
  const { isFavorite, toggle } = useFavorites();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<MatchFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadMatches = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(MATCHES_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload: MatchesResponse = await response.json();
      if (
        !payload ||
        typeof payload !== 'object' ||
        !Array.isArray(payload.matches)
      ) {
        throw new Error('Некорректный формат ответа');
      }

      setMatches(payload.matches);
      setUpdatedAt(new Date());
    } catch {
      if (MATCHES_URL.includes('/OWNER/REPO/')) {
        setMatches((localMatches as MatchesResponse).matches);
        setUpdatedAt(new Date());
        setError('Серверный адрес не настроен, показаны данные из проекта.');
      } else {
        setError('Не удалось загрузить матчи. Проверьте соединение и повторите попытку.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const visibleMatches = useMemo(() => {
    if (filter === 'finished') {
      return matches.filter((match) => match.status === 'finished');
    }
    if (filter === 'upcoming') {
      return matches.filter(isUpcomingMatch);
    }
    return matches;
  }, [filter, matches]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.secondaryText}>Загружаем матчи...</Text>
      </View>
    );
  }

  if (error && matches.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{error}</Text>
        <Pressable style={styles.button} onPress={() => loadMatches()}>
          <Text style={styles.buttonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.container}
      data={visibleMatches}
      keyExtractor={(match) => match.id}
      renderItem={({ item }) => (
        <MatchCard
          match={item}
          favorite={isFavorite(item.id)}
          onToggleFavorite={() => toggle(item.id)}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadMatches(true)} />
      }
      ListHeaderComponent={
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Матчи тура</Text>
            <Pressable
              style={styles.refreshButton}
              onPress={() => loadMatches(true)}
              disabled={refreshing}
            >
              <Text style={styles.refreshText}>Обновить</Text>
            </Pressable>
          </View>
          {updatedAt && <UpdatedAgo since={updatedAt} />}
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.filters}>
            {([
              ['all', 'Все'],
              ['upcoming', 'Предстоящие'],
              ['finished', 'Завершённые'],
            ] as const).map(([value, label]) => (
              <Pressable
                key={value}
                style={[styles.filter, filter === value && styles.activeFilter]}
                onPress={() => setFilter(value)}
              >
                <Text style={[styles.filterText, filter === value && styles.activeFilterText]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.message}>
            {matches.length === 0 ? 'Матчей пока нет.' : 'В этом фильтре матчей нет.'}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginTop: 16,
  },
  filter: {
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  activeFilter: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    color: '#374151',
    fontSize: 13,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryText: {
    color: '#6b7280',
    marginTop: 12,
  },
  message: {
    color: '#374151',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#b91c1c',
    marginTop: 8,
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
});
