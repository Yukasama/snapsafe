import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { TouchableOpacity, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Mock contacts (using the same data as chat contacts)
const contacts = [
  { id: 1, name: "John Doe", avatar: "👨‍💼" },
  { id: 2, name: "Sarah Wilson", avatar: "👩‍🎨" },
  { id: 3, name: "Team Group", avatar: "👥" },
  { id: 4, name: "Mom", avatar: "👩‍🦳" },
  { id: 5, name: "Alex Johnson", avatar: "👨‍💻" },
  { id: 6, name: "Emma Davis", avatar: "👩‍🦰" },
];

const ContactItem = ({
  contact,
  isSelected,
  onToggle,
}: {
  contact: (typeof contacts)[0];
  isSelected: boolean;
  onToggle: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onToggle}>
      <Box className="flex-row items-center p-4 border-b border-outline-700">
        {/* Checkbox */}
        <Box
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            isSelected ? "bg-blue-500 border-blue-500" : "border-typography-400"
          }`}
        >
          {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
        </Box>

        {/* Avatar */}
        <Box className="w-12 h-12 rounded-full bg-background-200 items-center justify-center mr-3">
          <Text className="text-2xl">{contact.avatar}</Text>
        </Box>

        {/* Name */}
        <Text className="text-typography-white font-medium text-lg">{contact.name}</Text>
      </Box>
    </TouchableOpacity>
  );
};

export default function ContactSelectionScreen() {
  const { imageUri, stickers } = useLocalSearchParams();
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const navigation = useRouter();

  const toggleContact = (contactId: number) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const selectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((contact) => contact.id));
    }
  };
  const handleSend = () => {
    if (selectedContacts.length === 0) {
      Alert.alert("No contacts selected", "Please select at least one contact to send to.");
      return;
    }

    // Navigate directly to home after sending (simulating successful send)
    navigation.replace("/");
  };

  const allSelected = selectedContacts.length === contacts.length;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Box className="flex-1">
        {/* Header */}
        <Box className="flex-row justify-between items-center p-4 border-b border-outline-700">
          <TouchableOpacity onPress={() => navigation.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Send To</Text>
          <TouchableOpacity onPress={selectAll}>
            <Text className="text-blue-500 text-lg">{allSelected ? "Deselect All" : "Select All"}</Text>
          </TouchableOpacity>
        </Box>

        {/* Selected count */}
        <Box className="px-4 py-2 bg-background-800">
          <Text className="text-typography-400 text-sm">
            {selectedContacts.length} of {contacts.length} contacts selected
          </Text>
        </Box>

        {/* Contact list */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {contacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              isSelected={selectedContacts.includes(contact.id)}
              onToggle={() => toggleContact(contact.id)}
            />
          ))}
        </ScrollView>

        {/* Send button */}
        <Box className="p-4 border-t border-outline-700">
          <TouchableOpacity
            onPress={handleSend}
            disabled={selectedContacts.length === 0}
            activeOpacity={selectedContacts.length === 0 ? 1 : 0.7}
          >
            <Box
              className={`py-4 rounded-full items-center ${
                selectedContacts.length > 0 ? "bg-blue-500" : "bg-background-600"
              }`}
            >
              <Text
                className={`font-bold text-lg ${selectedContacts.length > 0 ? "text-white" : "text-typography-400"}`}
              >
                Send to {selectedContacts.length} contact{selectedContacts.length !== 1 ? "s" : ""}
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
