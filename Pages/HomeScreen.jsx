import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment"; //  Importation de moment.js pour gérer les dates



export default function HomeScreen({ navigation }) {
  console.log(navigation);
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState('jour');//  Ajout d'un état pour la période sélectionnée

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

//  Fonction pour vérifier si une note appartient à la période sélectionnée
const isWithinPeriod = (dateString) => {
  const noteDate = moment(dateString, "YYYY-MM-DD"); //  Conversion de la date en objet moment.js
  const today = moment(); //  Date actuelle

  switch (selectedPeriod) {
    case "jour":
      return noteDate.isSame(today, "day"); //  Compare avec la date du jour
    case "semaine":
      return noteDate.isSame(today, "week"); //  Compare avec la semaine actuelle
    case "mois":
      return noteDate.isSame(today, "month"); // Compare avec le mois actuel
    default:
      return true; //  Si aucune période n'est sélectionnée, on affiche tout
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


      const matchesPeriod = isWithinPeriod(note.date); //  Ajout du filtre de période


    return matchesFilter && matchesSearch && matchesPeriod;
  });

  

{/*Fonction pour créer un bouton de filtre générique (catégorie ou période)*/}
const FilterButton = ({ title, value, isPeriod = false }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isPeriod
          ? selectedPeriod === value && styles.filterButtonActive // Sélection visuelle pour la période
          : filter === value && styles.filterButtonActive, //Sélection visuelle pour les catégories
      ]}
      onPress={() => (isPeriod ? setSelectedPeriod(value) : setFilter(value))} // 🔄 Met à jour l'état selon si c'est un filtre de période ou de catégorie
    >
  <Text
        style={[
          styles.filterButtonText,
          isPeriod
            ? selectedPeriod === value && styles.filterButtonTextActive
            : filter === value && styles.filterButtonTextActive,
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
        <FilterButton title="Jour" value="jour" isPeriod />
        <FilterButton title="Semaine" value="semaine" isPeriod />
        <FilterButton title="Mois" value="mois" isPeriod />
      </ScrollView>

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
});