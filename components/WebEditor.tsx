import React, { useState, useMemo, useCallback } from "react";
import { Editable, withReact, Slate, ReactEditor } from "slate-react";
import { createEditor, Descendant, BaseEditor } from "slate";
import { withHistory, HistoryEditor } from "slate-history";

// Define a custom type for the editor's value to include 'type' and 'children'
type CustomElement = {
  type: "paragraph" | "code" | "block-quote";
  children: CustomText[];
};
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const WebEditor = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [{ text: "Hello, world!" }],
    } as CustomElement,
  ]);

  const renderElement = useCallback(
    ({
      attributes,
      children,
      element,
    }: {
      attributes: any;
      children: React.ReactNode;
      element: CustomElement;
    }) => {
      switch (element.type) {
        case "code":
          return <code {...attributes}>{children}</code>;
        case "block-quote":
          return <blockquote {...attributes}>{children}</blockquote>;
        default:
          return <p {...attributes}>{children}</p>;
      }
    },
    []
  );

  const renderLeaf = useCallback(
    ({
      attributes,
      children,
      leaf,
    }: {
      attributes: any;
      children: React.ReactNode;
      leaf: CustomText;
    }) => {
      if (leaf.bold) {
        children = <strong>{children}</strong>;
      }
      if (leaf.italic) {
        children = <em>{children}</em>;
      }
      if (leaf.underline) {
        children = <u>{children}</u>;
      }
      return <span {...attributes}>{children}</span>;
    },
    []
  );

  return (
    <Slate
      editor={editor}
      initialValue={value}
      onChange={(newValue: Descendant[]) => setValue(newValue)}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text..."
        spellCheck
        autoFocus
      />
    </Slate>
  );
};

export default WebEditor;
