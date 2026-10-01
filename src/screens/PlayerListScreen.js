import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { usePlayers } from '../context/PlayersContext';
import { imageUrl } from '../services/api';
import { colors, gap, radius } from '../theme';

// En rad i listan. Motsvarar PlayerCard på webben, men betydligt enklare: 
// här finns ingen redigering, det hör hemma i detaljvyn.
function PlayerRow({ player, onPress }) {
  const bild = imageUrl(player.bildPath);
  const skadad = player.status === 'Skadad';

  return (
    // Pressable i stället för View. style kan vara en funktion som får { pressed },
    // så blir raden lite nedtonad medan fingret ligger kvar, vilket är mobilens motsvarighet till :hover och :active på webben.
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.media}>
        {bild ? (
          <Image source={{ uri: bild }} style={styles.bild} />
        ) : (
          <Text style={styles.nummer}>{player.nummer}</Text>
        )}
      </View>

      <View style={styles.rowText}>
        <Text style={styles.namn} numberOfLines={1}>
          {player.namn}
        </Text>
        <Text style={styles.position} numberOfLines={1}>
          #{player.nummer} · {player.position}
        </Text>
      </View>

      <View style={[styles.badge, skadad ? styles.badgeSkadad : styles.badgeOk]}>
        <Text style={[styles.badgeText, skadad ? styles.badgeTextSkadad : styles.badgeTextOk]}>
          {skadad ? 'Skadad' : 'Tillgänglig'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function PlayerListScreen({ navigation }) {
  const { players, loading, refreshing, error, reload } = usePlayers();

  if (loading) {
    return (
      <View style={styles.center}>
        {/* ActivityIndicator är plattformens egen spinner — iOS och Android ritar var sin. 
        Det är poängen med React Native: komponenten är densamma, utseendet blir det användaren känner igen. */}
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.muted}>Laddar truppen…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.knapp} onPress={() => reload()}>
          <Text style={styles.knappText}>Försök igen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    // FlatList i stället för ScrollView med en map. FlatList renderar bara de rader som syns och återanvänder dem när man scrollar. 
    // Med elva spelare spelar det ingen roll, 
    // men med några hundra blir en ScrollView långsam eftersom varje rad då finns i minnet hela tiden.
    <FlatList
      data={players}
      // keyExtractor motsvarar key i webbens map. Den måste returnera en sträng, så id konverteras.
      keyExtractor={(player) => String(player.id)}
      renderItem={({ item }) => (
        <PlayerRow
          player={item}
          // Bara id:t skickas med. Hela spelaren och funktioner går inte att serialisera, 
          // och detaljskärmen hämtar ändå sin data ur contexten. Varför skicka med något som redan finns på ett ställe?
          // På grund av det här är det inte heller nödvändigt att skicka med en spara-funktion, 
          // eftersom detaljskärmen kan anropa contextens savePlayer direkt.
          onPress={() => navigation.navigate('PlayerDetail', { id: item.id })}
        />
      )}
      contentContainerStyle={styles.lista}
      // Dra ner för att uppdatera — ett mönster som bara finns på mobil. 
      // Kopplat till refreshing, inte loading, så att listan ligger kvar medan den hämtas om.
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => reload({ refresh: true })}
          tintColor={colors.accent}
        />
      }
      ListEmptyComponent={<Text style={styles.muted}>Truppen är tom.</Text>}
    />
  );
}

// StyleSheet.create i stället för CSS. Stilarna är vanliga objekt, måtten är enhetslösa (densitetsoberoende pixlar, inte px eller rem) 
// och det finns ingen kaskad, en stil ärvs inte av barnen.
const styles = StyleSheet.create({
  lista: {
    padding: gap,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
  },
  rowPressed: {
    backgroundColor: colors.bg,
  },
  media: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.bg,
    borderRadius: radius,
  },
  bild: {
    width: '100%',
    height: '100%',
    // resizeMode cover motsvarar object-fit: cover i CSS.
    resizeMode: 'cover',
  },
  nummer: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  rowText: {
    // flex: 1 gör att textkolumnen tar resten av bredden. Utan den trycker ett långt namn ut badgen utanför skärmen.
    flex: 1,
  },
  namn: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  position: {
    fontSize: 13,
    color: colors.textMuted,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  badgeOk: {
    backgroundColor: colors.accentTint,
  },
  badgeSkadad: {
    backgroundColor: colors.dangerBg,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextOk: {
    color: colors.accentDark,
  },
  badgeTextSkadad: {
    color: colors.dangerDark,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  muted: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
  knapp: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: colors.accent,
    borderRadius: radius,
  },
  knappText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
