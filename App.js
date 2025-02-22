import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from './Pages/HomeScreen';
import AddNoteScreen from './Pages/AddNoteScreen';
import NoteDetailScreen from'./Pages/NotesDetailScreen';
import SplashScreen from 'react-native-splash-screen';
const Stack = createStackNavigator();   

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Notes & Tasks" }}
        />
        <Stack.Screen
          name="AddNote"
          component={AddNoteScreen}
          options={{ title: "Nouvelle Note" }}
        />
        <Stack.Screen
          name="NoteDetail"
          component={NoteDetailScreen}
          options={{ title: "Détails" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
 );

}