// Samma färger som webbappens CSS-variabler i index.css, så att de två klienterna ser ut att höra ihop.

// React Native har inga CSS-variabler och ingen kaskad, varje komponent får exakt de stilar den själv anger. 
// Motsvarigheten till :root blir därför ett vanligt objekt som importeras där färgerna behövs.
export const colors = {
  bg: '#f4f5f7',
  surface: '#ffffff',
  border: '#d9dce1',
  text: '#1b1d21',
  textMuted: '#5c6270',

  accent: '#1b7a3e',
  accentDark: '#145c2f',
  accentTint: '#e6f4ea',

  danger: '#b42318',
  dangerDark: '#912018',
  dangerBg: '#fdecea',
};

export const radius = 10;
export const gap = 16;
