import React from "react";
import { View, StyleSheet } from "react-native";
import RCTAztecView from "react-native-aztec";

const NativeEditor = ({
  text,
  setText,
  handleSubmit,
}: {
  text: string;
  setText: (text: string) => void;
  handleSubmit: () => void;
}) => {
  return (
    <View style={styles.container}>
      <RCTAztecView
        value={text}
        onChange={(newContent: string) => setText(newContent)}
        onEnter={() => handleSubmit()}
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
