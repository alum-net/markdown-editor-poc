import { useState } from "react";
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import Markdown from "react-native-marked";

export default function Index() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([
    { id: Date.now().toString(), content: "# Hello world" },
  ]);

  const handleSubmit = () => {
    if (text.trim().length === 0) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content: text },
    ]);

    setText("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Markdown value={item.content} />}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputContainer}></View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    backgroundColor: "white",
  },
  input: {
    padding: 10,
  },
});
