import { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { usePlayers } from '../context/PlayersContext';
import { imageUrl } from '../services/api';
import { colors, gap, radius } from '../theme';

export default function PlayerDetailScreen({ route, navigation }) {
  // Routen bär bara ett id — inte hela spelaren och ingen funktion. Allt annat hämtas ur contexten.
  const { id } = route.params;

  const { players, savePlayer } = usePlayers();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Spelaren slås upp i listan varje rendering. Det betyder att när status ändras uppdateras contexten, den här skärmen renderas om 
  // och den nya statusen syns direkt, utan att något skickas mellan skärmarna.
  const player = players.find((p) => p.id === id);

  // useLayoutEffect i stället för useEffect: rubriken sätts innan skärmen ritas ut, 
  // så användaren hinner inte se den gamla titeln blinka förbi.
  useLayoutEffect(() => {
    navigation.setOptions({ title: player ? player.namn : 'Spelare' });
  }, [navigation, player]);

  if (!player) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Spelaren finns inte längre i truppen.</Text>
      </View>
    );
  }

  const bild = imageUrl(player.bildPath);
  const skadad = player.status === 'Skadad';

  async function bytStatus() {
    setError(null);
    setSaving(true);

    try {
      // PUT ersätter hela resursen — PlayerUpdateDto kräver alla fält. Skickar man bara status svarar servern 400 eftersom [Required] 
      // på Namn och Position slår till. Därför skickas de oförändrade med.
      await savePlayer(player.id, {
        namn: player.namn,
        nummer: player.nummer,
        position: player.position,
        anteckning: player.anteckning,
        status: skadad ? 'Tillgänglig' : 'Skadad',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.innehall}>
      <View style={styles.media}>
        {bild ? (
          <Image source={{ uri: bild }} style={styles.bild} />
        ) : (
          <Text style={styles.stortNummer}>{player.nummer}</Text>
        )}
      </View>

      <View style={styles.kort}>
        <Rad etikett="Tröjnummer" varde={`#${player.nummer}`} />
        <Rad etikett="Position" varde={player.position} />
        <Rad etikett="Linje" varde={player.linje} />
        {/* Wingback och Mittback saknar klassiskt nummer och får null. Raden utelämnas då helt i stället för att visa tomt. */}
        {player.klassisktNummer && (
          <Rad etikett="Klassiskt nummer" varde={player.klassisktNummer} />
        )}
        <Rad etikett="Status" varde={player.status} />
      </View>

      {player.anteckning ? (
        <View style={styles.kort}>
          <Text style={styles.etikett}>Anteckning</Text>
          <Text style={styles.anteckning}>{player.anteckning}</Text>
        </View>
      ) : null}

      {error && <Text style={styles.fel}>{error}</Text>}

      <Pressable
        style={[styles.knapp, skadad ? styles.knappOk : styles.knappSkada, saving && styles.knappLast]}
        onPress={bytStatus}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.knappText}>
            {skadad ? 'Markera som tillgänglig' : 'Markera som skadad'}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

// Liten hjälpkomponent för etikett–värde-raderna. Sparar upprepning och gör att alla rader garanterat ser likadana ut.
function Rad({ etikett, varde }) {
  return (
    <View style={styles.rad}>
      <Text style={styles.etikett}>{etikett}</Text>
      <Text style={styles.varde}>{varde}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  innehall: {
    padding: gap,
    gap: 12,
  },
  media: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
  },
  bild: {
    width: '100%',
    height: '100%',
    // contain i stället för cover här: i detaljvyn ska hela porträttet synas, inte en beskuren del av det.
    resizeMode: 'contain',
  },
  stortNummer: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.textMuted,
  },
  kort: {
    padding: 14,
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
  },
  rad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  etikett: {
    fontSize: 13,
    color: colors.textMuted,
  },
  varde: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    // flexShrink låter värdet krympa i stället för att trycka ut etiketten när texten är lång.
    flexShrink: 1,
    textAlign: 'right',
  },
  anteckning: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
  fel: {
    padding: 12,
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius,
  },
  knapp: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: radius,
  },
  knappOk: {
    backgroundColor: colors.accent,
  },
  knappSkada: {
    backgroundColor: colors.danger,
  },
  knappLast: {
    opacity: 0.6,
  },
  knappText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  muted: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});