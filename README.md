Truppen Mobile

Mobilapp för spelarregister. React Native med Expo. Hämtar samma data från samma API som webbappen.

--

Teknik

React Native med Expo, SDK 57

React Navigation med native stack

services/api.js för alla anrop, theme.js för färger och mått

--

Kör projektet

git clone <repo-url>

cd truppen-mobile

npm install

npx expo start

Skanna QR-koden med Expo Go.

--

Tre saker måste stämma:
1. API körs dotnet run i truppen-api
2. API lyssnar på alla nätverkskort, inte bara localhost. Den är redan satt: applicationUrl http://0.0.0.0:5275 i Properties/launchSettings.json
3. Telefonen och datorn är på samma nätverk

Ingen IP-adress behöver skrivas in någonstans.

-- 

Hur appen hittar API

localhost i mobilappen pekar på telefonen, inte på datorn. Appen körs ju på telefonen, medan API finns på datorn, så adressen måste vara datorns IP i det lokala nätverket.

Att skriva in den IP i koden fungerar bara tills nätverket byts. Hemma, i skolan och via mobildata får datorn tre olika adresser, och varje byte skulle betyda en kodändring.

Expo vet redan adressen. Metro servern körs på datorn och telefonen är ansluten till den, så Constants.expoConfig.hostUri innehåller host IP adress. Appen tar värddelen, byter Metros port mot API 5275, och får rätt adress på vilket nätverk som helst.

Går anropet ändå inte fram visas adressen den försökte nå i felmeddelandet, så att det går att se direkt om något blivit fel.

--

Skärmar

Truppen. Lista med alla spelare: bild eller tröjnummer, namn, position och statusbricka. Dra ner för att uppdatera. Tryck på en rad för att öppna detaljvyn.

Detaljvy. Bild i full storlek, tröjnummer, position, linje, klassiskt nummer, status och anteckning. En knapp växlar mellan tillgänglig och skadad, vilket skickas som PUT till API. Ändringen syns direkt i listan när man går tillbaka.

--

Struktur

App.js – navigation och providers

src/screens – PlayerListScreen, PlayerDetailScreen

src/context – PlayersContext, truppen delad mellan skärmarna

src/services – api.js, HTTP och uträkningen av API-adressen

src/theme.js – färger, hörnradie och grundavstånd

--

Val jag gjort

Expo. Går att testa på en fysisk telefon utan att kompilera native kod i Android Studio eller Xcode.
Context i mobilen men inte på webben. På webben renderas allt i samma träd och props räcker. I mobilen är listskärmen och detaljskärmen inte förälder och barn, navigationen ligger emellan. Med Context ligger truppen på ett ställe och båda skärmarna ser samma data.

Routen bär bara ett id. React Navigation kräver att route params går att serialisera, så att de kan sparas när appen läggs i bakgrunden. Ett helt spelarobjekt skulle bli en kopia som blir inaktuell och en funktion går inte att serialisera alls. Detaljvyn slår i stället upp spelaren i contexten.

FlatList i stället för ScrollView med map. FlatList renderar bara de rader som syns och återanvänder dem vid scroll. Med elva spelare märks ingen skillnad, men en ScrollView håller alla rader i minnet hela tiden.

Native stack. Använder iOS och Androids egna navigationskomponenter, så övergångar och svep tillbaka beter sig som i andra appar på telefonen. Alternativet ritar allt i JavaScript.

Mobilen skapar inga spelare och laddar inte upp bilder. Den visar truppen och ändrar status det man behöver på en träning. Att mata in nya spelare hör hemma vid datorn. Samma API, olika användningsfall.

--

Förbättringar för framtiden

Ingen POST och ingen bilduppladdning,

Ingen inloggning,

Kräver att datorn och telefonen är på samma nätverk
