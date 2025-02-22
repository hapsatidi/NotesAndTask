import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function HomeScreen({ navigation }) {
  console.log(navigation);
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [mapRegion, setMapRegion] = useState({
    latitude: 0, // Valeur par défaut
    longitude: 0, // Valeur par défaut
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission de localisation nécessaire');
      return;
    }
    let position = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    setMapRegion({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    console.log(position.coords.latitude, position.coords.longitude);
  };

 useEffect(() => {
    userLocation();
  }, []);



  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadNotes();
    });

    return unsubscribe;
  }, [navigation]);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem("notes");
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Erreur chargement notes:", error);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && note.completed) ||
      (filter === "pending" && !note.completed) ||
      (filter === "notes" && note.category === "note") ||
      (filter === "tasks" && note.category === "tâche");

    const matchesSearch =
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.description.toLowerCase().includes(searchText.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const FilterButton = ({ title, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => navigation.navigate("NoteDetail", { note: item })}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.categoryIcon}>
          {item.category === "note" ? "📝" : "✓"}
        </Text>
        <View style={styles.noteContent}>
          <Text
            style={[styles.noteTitle, item.completed && styles.completedText]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.noteDescription,
              item.completed && styles.completedText,
            ]}
          >
            {item.description}
          </Text>
        </View>
        <View style={styles.noteMetadata}>
          <Text style={styles.noteDate}>{item.date}</Text>
          {item.location && <Text style={styles.noteIcon}>📍</Text>}
          {item.photo && <Text style={styles.noteIcon}>📷</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <FilterButton title="Tout" value="all" />
        <FilterButton title="Notes" value="notes" />
        <FilterButton title="Tâches" value="tasks" />
        <FilterButton title="Terminé" value="completed" />
        <FilterButton title="En cours" value="pending" />
      </ScrollView>
    
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={mapRegion}
          showsUserLocation={true} // Affiche la localisation de l'utilisateur
        >
          <Marker coordinate={mapRegion} title="la ou je suis" />
        </MapView>
      </View>
      <TouchableOpacity style={styles.locationButton} onPress={userLocation}>
        <Text style={styles.locationButtonText}>📍 Localisation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddNote")}
      >
        <Text style={styles.addButtonText}>+ Nouvelle Note</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  searchInput: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 10,
    height: 10,
  },
  filterButton: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
    // height:90,
    // flex:1,
    // alignItems:'center',
    // justifyContent:'center'
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
  },
  filterButtonText: {
    color: "black",
  },
  filterButtonTextActive: {
    color: "white",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  noteItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noteDescription: {
    fontSize: 14,
    color: "#666",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  noteMetadata: {
    alignItems: "flex-end",
  },
  noteDate: {
    fontSize: 12,
    color: "#666",
  },
  noteIcon: {
    fontSize: 12,
    marginTop: 4,
  },
  map: {
    width:"100%" , // Dimensions.get('window').width,
    height: "100%",  //Dimensions.get('window').height,
  },

 // Style pour le bouton de localisation
 locationButton: {
  backgroundColor: "#4CAF50", // Couleur de fond
  padding: 15,
  borderRadius: 10, // Bordures arrondies
  alignItems: "center",
  justifyContent: "center",
  marginVertical: 10,
  elevation: 3, // Ombre pour Android
  shadowColor: "#000", // Ombre pour iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},
locationButtonText: {
  color: "white",
  fontSize: 16,
  fontWeight: "bold",
},
});