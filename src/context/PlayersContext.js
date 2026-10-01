import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../services/api';

// Samma sortering som servern gör (OrderBy på Nummer), så att ett ändrat tröjnummer flyttar raden direkt i stället för vid 
// nästa hämtning.
function sorteraPaNummer(lista) {
  return [...lista].sort((a, b) => a.nummer - b.nummer || a.id - b.id);
}

const PlayersContext = createContext(null);

// Här skiljer sig mobilen från webben. På webben räckte en vanlig hook, eftersom allt renderas i samma träd under App.
// I mobilen finns två skärmar som båda behöver samma trupp, och navigationen ligger emellan dem.

// Alternativet vore att skicka hela spelarobjektet och en spara-funktion som route params till detaljskärmen.
// Det fungerar inte: React Navigation vill att params ska gå att serialisera, och en funktion gör inte det. Då varnar den
// och tillståndet hamnar dessutom i otakt mellan skärmarna.

// Med Context ligger truppen på ett ställe, routen bär bara ett id, och båda skärmarna ser samma data.
export function PlayersProvider({ children }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Två laddningstillstånd, inte ett. loading används första gången och visar en spinner över hela skärmen. 
  // refreshing används när användaren drar ner i listan, då ska listan ligga kvar och bara snurran i toppen synas.
  const load = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      setPlayers(await api.getPlayers());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Fångar inte fel med flit — detaljskärmen visar felet vid knappen.
  async function savePlayer(id, dto) {
    const updated = await api.updatePlayer(id, dto);
    setPlayers((prev) => sorteraPaNummer(prev.map((p) => (p.id === id ? updated : p))));
    return updated;
  }

  const varde = { players, loading, refreshing, error, reload: load, savePlayer };

  return <PlayersContext.Provider value={varde}>{children}</PlayersContext.Provider>;
}

// Egen hook i stället för att komponenterna importerar PlayersContext och anropar useContext själva. 
// Kontrollen ger ett begripligt fel om någon glömmer att lägga providern runt navigationen, annars blir felet
// "cannot destructure property of null", som inte säger något.
export function usePlayers() {
  const context = useContext(PlayersContext);

  if (!context) {
    throw new Error('usePlayers måste användas inuti en PlayersProvider.');
  }

  return context;
}
