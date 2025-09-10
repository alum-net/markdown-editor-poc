import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { AztecNative } from "react-native-aztec";

const NativeEditor = () => {
  const [content, setContent] = useState("");

  return (
    <View style={styles.container}>
      <AztecNative
        value={content}
        onChange={(newContent: string) => setContent(newContent)}
        placeholder="Enter some text..."
        style={styles.editor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  editor: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
  },
});

export default NativeEditor;
