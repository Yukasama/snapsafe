import React, { useRef, useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { TouchableOpacity, ScrollView, Alert } from "react-native";
import { router, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import { loadOrCreateRSAKeyPair } from "@/crypto/keyManager";
import { useUser } from "@/context/UserContext";
import { encryptContent } from "@/crypto/encryptContent";
import { sendEncryptedMessage, getPublicKey } from "@/api/backend";
import { config } from "@/config/config";
import { Chat, useChats } from "@/context/ChatContext";


const ContactItem = ({
  contact,
  isSelected,
  onToggle,
}: {
  contact: Chat;
  isSelected: boolean;
  onToggle: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onToggle}>
      <Box className="flex-row items-center p-4 border-b border-outline-700">
        <Box
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            isSelected ? "bg-blue-500 border-blue-500" : "border-typography-400"
          }`}
        >
          {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
        </Box>

        <Box className="w-12 h-12 rounded-full bg-background-200 items-center justify-center mr-3">
          <Text className="text-2xl">{contact.avatar}</Text>
        </Box>

        <Text className="text-typography-white font-medium text-lg">{contact.name}</Text>
      </Box>
    </TouchableOpacity>
  );
};

export default function ContactSelectionScreen() {
  const { imageUri } = useLocalSearchParams();
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const { chats, getCurrentChat } = useChats();
  const navigation = useRouter();
  const { username } = useUser();

  const contacts = [
    { id: 1, name: "Note to Self", avatar: "👨‍💼", username: username },
    { id: 2, name: "Sarah Wilson", avatar: "👩‍🎨", username: '' },
    { id: 3, name: "Team Group", avatar: "👥", username: '' },
    { id: 4, name: "Mom", avatar: "👩‍🦳", username: '' },
    { id: 5, name: "Alex Johnson", avatar: "👨‍💻", username: '' },
    { id: 6, name: "Emma Davis", avatar: "👩‍🦰", username: '' },
  ];

  const hasRunOnce = useRef(false);
  useFocusEffect(() => {
    if (!hasRunOnce.current) {
      hasRunOnce.current = true;
      const id = getCurrentChat()?.id;
      if (id) {
        toggleContact(id);
        console.debug("Pre-selecting chat with ID:", id);
      }
    }
  });

  const toggleContact = (contactId: number) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const selectAll = () => {
    if (selectedContacts.length === chats.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(chats.map((contact) => contact.id));
    }
  };

  const handleSend = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert("No chats selected", "Please select at least one contact to send to.");
      return;
    }

    try {
      console.debug("Preparing to send encrypted image...");
      const { publicKey } = await loadOrCreateRSAKeyPair();
      console.debug("Public Key PEM:", publicKey);

      if (!imageUri || typeof imageUri !== "string") throw new Error("No image URI found");

      const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
  encoding: 'base64', 
});

      const imageBuffer = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0)).buffer;

      for (const contactId of selectedContacts) {
        const recipient = chats.find((c) => c.id === contactId);
        if (!recipient) continue;

        const recipientUserId = recipient.username;
        const { publicKey: recipientKey } = await getPublicKey(recipientUserId!);

        const { encryptedContent: encryptedImage, encryptedAESKey, iv } = await encryptContent(imageBuffer, recipientKey);

        await sendEncryptedMessage({
          senderId: username!,
          recipientId: recipientUserId,
          iv,
          encryptedKey: encryptedAESKey,
          content: encryptedImage,
          type: "image",
        });
      }

      navigation.replace("/");
    } catch (err) {
      console.error("Send failed:", err);
      Alert.alert("Error", "Failed to send encrypted image.");
    }
  };

  const allSelected = selectedContacts.length === chats.length;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Box className="flex-1">
        <Box className="flex-row justify-between items-center p-4 border-b border-outline-700">
          <TouchableOpacity onPress={() => router.back()}>
            <Box className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
              <Text className="text-white text-xl">←</Text>
            </Box>
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Send To</Text>
          <TouchableOpacity onPress={selectAll}>
            <Text className="text-blue-500 text-md">{allSelected ? "Deselect All" : "Select All"}</Text>
          </TouchableOpacity>
        </Box>

        <Box className="px-4 py-2 bg-background-800">
          <Text className="text-typography-400 text-sm">
            {selectedContacts.length} of {chats.length} chats selected
          </Text>
        </Box>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {chats.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              isSelected={selectedContacts.includes(contact.id)}
              onToggle={() => toggleContact(contact.id)}
            />
          ))}
        </ScrollView>

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
