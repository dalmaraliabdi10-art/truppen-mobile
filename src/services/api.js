import Constants from 'expo-constants';

// Telefonen och datorn är två olika maskiner på nätverket. localhost i appen pekar på telefonen själv, 
// inte på datorn där API:et körs, så adressen måste vara datorns IP i det lokala nätverket.
// Att hårdkoda den IP fungerar bara tills nätverket byts, alltså hemma, i skolan och via mobildata får datorn tre olika adresser.
// Expo vet redan adressen: Metro-servern körs på datorn och telefonen är ansluten till den. 
// Constants.expoConfig.hostUri innehåller den som "192.168.0.135:8081". Man tar värddelen och byter ut porten mot API.
const API_PORT = 5275;

function harledBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];

  // Reserv om hostUri saknas, till exempel i en byggd app utan Metro.
  return `http://${host ?? 'localhost'}:${API_PORT}`;
}

export const BASE_URL = harledBaseUrl();

// Samma mönster som i webbappen: fetch kastar bara när anropet inte gick fram alls. 
// Ett svar med 400 eller 404 räknas som lyckat av fetch, så response.ok måste kontrolleras separat.
async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch {
    // På mobil är det här det vanligaste felet: fel nätverk, API inte igång eller brandväggen på datorn. 
    // Adressen tas med i meddelandet eftersom den räknas fram och inte syns någon annanstans.
    throw new Error(`Kunde inte nå API:et på ${BASE_URL}.`);
  }

  if (!response.ok) {
    throw new Error(await lasFelmeddelande(response));
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function lasFelmeddelande(response) {
  try {
    const body = await response.json();

    // Egna 404- och 400-svar från controllern: { "message": "..." }
    if (body.message) {
      return body.message;
    }

    // Automatisk validering från [ApiController]: ProblemDetails med ett errors-objekt där varje fält har en lista med meddelanden.
    if (body.errors) {
      return Object.values(body.errors).flat().join(' ');
    }

    if (body.title) {
      return body.title;
    }
  } catch {
    // Svaret var inte JSON. Då får statuskoden räcka.
  }

  return `Något gick fel (${response.status}).`;
}

export function getPlayers() {
  return request('/api/players');
}

export function getPlayer(id) {
  return request(`/api/players/${id}`);
}

export function updatePlayer(id, player) {
  return request(`/api/players/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player),
  });
}

// API sparar bildens sökväg relativt, t.ex. /uploads/abc123.jpg. Här byggs den ihop till en adress som Image-komponenten kan hämta.
export function imageUrl(bildPath) {
  return bildPath ? `${BASE_URL}${bildPath}` : null;
}
