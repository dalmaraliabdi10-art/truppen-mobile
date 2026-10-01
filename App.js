import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlayersProvider } from './src/context/PlayersContext';
import PlayerDetailScreen from './src/screens/PlayerDetailScreen';
import PlayerListScreen from './src/screens/PlayerListScreen';
import { colors } from './src/theme';

// Native stack i stället för den JavaScript-baserade stacken. Den använder iOS och Androids egna navigationskomponenter, 
// så övergångar och svep-tillbaka-gesten beter sig som i vilken annan app som helst på telefonen.
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // Ordningen på de tre wrapparna är inte godtycklig.
    // SafeAreaProvider ytterst: den mäter var hacket och hemknappsraden är.
    // PlayersProvider utanför NavigationContainer: truppen måste ligga ovanför navigationen för att båda skärmarna ska nå samma data.
    <SafeAreaProvider>
      <PlayersProvider>
        <NavigationContainer>
          <Stack.Navigator
            // screenOptions gäller alla skärmar i stacken, så färgerna behöver inte upprepas per skärm.
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen
              name="PlayerList"
              component={PlayerListScreen}
              // name är det interna id:t som navigate() använder.
              // title är det användaren läser i rubriken.
              options={{ title: 'Truppen' }}
            />

            {/* Ingen title här. Rubriken sätts av skärmen själv med navigation.setOptions, eftersom namnet bara finns i 
            contexten — routen bär bara ett id. */}
            <Stack.Screen name="PlayerDetail" component={PlayerDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>

        <StatusBar style="auto" />
      </PlayersProvider>
    </SafeAreaProvider>
  );
}