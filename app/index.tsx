import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
  Button,
} from "react-native";
import {
  Images,
  RichText,
  Toolbar,
  ToolbarItem,
  useEditorBridge,
} from "@10play/tentap-editor";
import { useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import { ToolbarContext } from "@10play/tentap-editor/src/RichText/Toolbar/actions";

export default function Index() {
  const [messages, setMessages] = useState([
    { id: Date.now().toString(), content: "<h1>List of markdown as HTML</h1>" },
  ]);

  const handleSubmit = (markdown: string) => {
    if (markdown.trim().length === 0) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content: markdown },
    ]);
  };

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent,
  });
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={exampleStyles.fullScreen}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <>
            <RenderHtml contentWidth={width} source={{ html: item.content }} />
            <View style={{ borderColor: "black", borderWidth: 1 }} />
          </>
        )}
        style={exampleStyles.flatList}
      />
      {Platform.OS === "web" ? (
        <View style={exampleStyles.container}>
          <Toolbar editor={editor} items={[...MY_TOOLBAR_ITEMS]} />
          <RichText editor={editor} />
        </View>
      ) : (
        <View style={exampleStyles.container}>
          <RichText editor={editor} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={exampleStyles.keyboardAvoidingView}
          >
            <Toolbar editor={editor} items={[...MY_TOOLBAR_ITEMS]} />
          </KeyboardAvoidingView>
        </View>
      )}
      <Button
        title="Submit Markdown"
        onPress={async () => {
          handleSubmit(await editor.getHTML());
          editor.setContent("");
        }}
      />
    </SafeAreaView>
  );
}

const exampleStyles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  keyboardAvoidingView: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
  container: {
    margin: 20,
    flex: 1,
  },
  flatList: {
    backgroundColor: "grey",
    flex: 1,
  },
});

const initialContent = `<p>This is a basic example!</p>`;

const MY_TOOLBAR_ITEMS: ToolbarItem[] = [
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleBold(),
    active: ({ editorState }) => editorState.isBoldActive,
    disabled: ({ editorState }) => !editorState.canToggleBold,
    image: () => Images.bold,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleItalic(),
    active: ({ editorState }) => editorState.isItalicActive,
    disabled: ({ editorState }) => !editorState.canToggleItalic,
    image: () => Images.italic,
  },
  {
    onPress:
      ({ setToolbarContext, editorState, editor }) =>
      () => {
        if (Platform.OS === "android") {
          // On android focus outside the editor will lose the tiptap selection so we wait for the next tick and set it with the last selection value we had
          setTimeout(() => {
            editor.setSelection(
              editorState.selection.from,
              editorState.selection.to
            );
          });
        }
        setToolbarContext(ToolbarContext.Link);
      },
    active: ({ editorState }) => editorState.isLinkActive,
    disabled: ({ editorState }) =>
      !editorState.isLinkActive && !editorState.canSetLink,
    image: () => Images.link,
  },
  {
    onPress:
      ({ setToolbarContext }) =>
      () =>
        setToolbarContext(ToolbarContext.Heading),
    active: () => false,
    disabled: ({ editorState }) => !editorState.canToggleHeading,
    image: () => Images.Aa,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleCode(),
    active: ({ editorState }) => editorState.isCodeActive,
    disabled: ({ editorState }) => !editorState.canToggleCode,
    image: () => Images.code,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleUnderline(),
    active: ({ editorState }) => editorState.isUnderlineActive,
    disabled: ({ editorState }) => !editorState.canToggleUnderline,
    image: () => Images.underline,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleStrike(),
    active: ({ editorState }) => editorState.isStrikeActive,
    disabled: ({ editorState }) => !editorState.canToggleStrike,
    image: () => Images.strikethrough,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleBlockquote(),
    active: ({ editorState }) => editorState.isBlockquoteActive,
    disabled: ({ editorState }) => !editorState.canToggleBlockquote,
    image: () => Images.quote,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleOrderedList(),
    active: ({ editorState }) => editorState.isOrderedListActive,
    disabled: ({ editorState }) => !editorState.canToggleOrderedList,
    image: () => Images.orderedList,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.toggleBulletList(),
    active: ({ editorState }) => editorState.isBulletListActive,
    disabled: ({ editorState }) => !editorState.canToggleBulletList,
    image: () => Images.bulletList,
  },
  {
    // Regular list items (li) and task list items both use the
    // same sink command and button just with a different parameter, so we check both states here
    onPress:
      ({ editor, editorState }) =>
      () =>
        editorState.canSink ? editor.sink() : editor.sinkTaskListItem(),
    active: () => false,
    disabled: ({ editorState }) =>
      !editorState.canSink && !editorState.canSinkTaskListItem,
    image: () => Images.indent,
  },
  {
    // Regular list items (li) and task list items both use the
    // same lift command and button just with a different parameter, so we check both states here
    onPress:
      ({ editor, editorState }) =>
      () =>
        editorState.canLift ? editor.lift() : editor.liftTaskListItem(),
    active: () => false,
    disabled: ({ editorState }) =>
      !editorState.canLift && !editorState.canLiftTaskListItem,
    image: () => Images.outdent,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.undo(),
    active: () => false,
    disabled: ({ editorState }) => !editorState.canUndo,
    image: () => Images.undo,
  },
  {
    onPress:
      ({ editor }) =>
      () =>
        editor.redo(),
    active: () => false,
    disabled: ({ editorState }) => !editorState.canRedo,
    image: () => Images.redo,
  },
];
