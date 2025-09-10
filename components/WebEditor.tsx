import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Editable, withReact, Slate, ReactEditor, useSlate } from "slate-react";
import {
  createEditor,
  Descendant,
  BaseEditor,
  Transforms,
  Editor,
  Element as SlateElement,
  Text,
  Range,
} from "slate";
import { withHistory, HistoryEditor } from "slate-history";

// ---------- Types ----------
type CustomElement = {
  type:
    | "paragraph"
    | "code"
    | "block-quote"
    | "heading-one"
    | "heading-two"
    | "bulleted-list"
    | "numbered-list"
    | "list-item"
    | "link";
  url?: string;
  children: CustomText[];
};
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// ---------- Utils ----------
const LIST_TYPES = ["numbered-list", "bulleted-list"];

const isMarkActive = (editor: Editor, format: keyof CustomText) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format: keyof CustomText) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });
  return !!match;
};

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  });

  const newType = isActive ? "paragraph" : isList ? "list-item" : format;

  Transforms.setNodes(
    editor,
    { type: newType },
    { match: (n) => Editor.isBlock(editor, n) }
  );

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block, {
      match: (n) => n.type === "list-item",
    });
  }
};

// ---------- Toolbar ----------
const Button = ({
  active,
  onMouseDown,
  children,
}: {
  active: boolean;
  onMouseDown: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown();
      }}
      style={{
        padding: "4px 6px",
        border: "1px solid #ccc",
        borderRadius: 3,
        background: active ? "#e6f0ff" : "white",
        cursor: "pointer",
      }}
      type="button"
    >
      {children}
    </button>
  );
};

const MarkButton = ({
  format,
  icon,
}: {
  format: keyof CustomText;
  icon: React.ReactNode;
}) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={() => toggleMark(editor, format)}
    >
      {icon}
    </Button>
  );
};

const BlockButton = ({
  format,
  icon,
}: {
  format: CustomElement["type"];
  icon: React.ReactNode;
}) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={() => toggleBlock(editor, format)}
    >
      {icon}
    </Button>
  );
};

// ---------- Markdown serializer (simplified) ----------
const serializeLeaf = (leaf: CustomText, text: string) => {
  let out = text;
  if (leaf.code) out = "`" + out + "`";
  if (leaf.bold) out = `**${out}**`;
  if (leaf.italic) out = `*${out}*`;
  if (leaf.strikethrough) out = `~~${out}~~`;
  if (leaf.underline) out = `<u>${out}</u>`;
  return out;
};

const serialize = (nodes: Descendant[]): string =>
  nodes
    .map((node) => {
      if (Text.isText(node)) return serializeLeaf(node, node.text);
      const children = serialize(node.children as Descendant[]);
      switch (node.type) {
        case "heading-one":
          return `# ${children}`;
        case "heading-two":
          return `## ${children}`;
        case "block-quote":
          return `> ${children}`;
        case "bulleted-list":
          return (node.children as CustomElement[])
            .map((li) => `- ${serialize(li.children)}`)
            .join("\n");
        case "numbered-list":
          return (node.children as CustomElement[])
            .map((li, i) => `${i + 1}. ${serialize(li.children)}`)
            .join("\n");
        case "code":
          return "```\n" + children + "\n```";
        case "link":
          return `[${children}](${node.url})`;
        default:
          return children;
      }
    })
    .join("\n");

// ---------- Editor ----------
const WebEditor = ({
  text,
  setText,
  handleSubmit,
}: {
  text: string;
  setText: (text: string) => void;
  handleSubmit: () => void;
}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [{ text: text || "Hello, world!" }],
    } as CustomElement,
  ]);

  useEffect(() => {
    if (text === "") {
      setValue([
        { type: "paragraph", children: [{ text: "" }] } as CustomElement,
      ]);
    }
  }, [text]);

  const handleEditorChange = useCallback(
    (newValue: Descendant[]) => {
      setValue(newValue);
      const md = serialize(newValue);
      setText(md);
    },
    [setText]
  );

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
          return (
            <pre {...attributes} style={{ background: "#f6f8fa", padding: 8 }}>
              <code>{children}</code>
            </pre>
          );
        case "block-quote":
          return (
            <blockquote
              {...attributes}
              style={{ borderLeft: "3px solid #ccc", paddingLeft: 8 }}
            >
              {children}
            </blockquote>
          );
        case "heading-one":
          return <h1 {...attributes}>{children}</h1>;
        case "heading-two":
          return <h2 {...attributes}>{children}</h2>;
        case "bulleted-list":
          return <ul {...attributes}>{children}</ul>;
        case "numbered-list":
          return <ol {...attributes}>{children}</ol>;
        case "list-item":
          return <li {...attributes}>{children}</li>;
        case "link":
          return (
            <a {...attributes} href={element.url} target="_blank">
              {children}
            </a>
          );
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
      if (leaf.bold) children = <strong>{children}</strong>;
      if (leaf.italic) children = <em>{children}</em>;
      if (leaf.underline) children = <u>{children}</u>;
      if (leaf.strikethrough) children = <del>{children}</del>;
      if (leaf.code)
        children = (
          <code style={{ background: "#f6f8fa", padding: "2px 4px" }}>
            {children}
          </code>
        );
      return <span {...attributes}>{children}</span>;
    },
    []
  );

  return (
    <Slate editor={editor} initialValue={value} onChange={handleEditorChange}>
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 6,
          borderBottom: "1px solid #ddd",
          marginBottom: 6,
          flexWrap: "wrap",
        }}
      >
        <MarkButton format="bold" icon={<strong>B</strong>} />
        <MarkButton format="italic" icon={<em>I</em>} />
        <MarkButton format="underline" icon={<u>U</u>} />
        <MarkButton format="strikethrough" icon={<s>S</s>} />
        <MarkButton format="code" icon={<code>{`</>`}</code>} />

        <BlockButton format="heading-one" icon={"H1"} />
        <BlockButton format="heading-two" icon={"H2"} />
        <BlockButton format="block-quote" icon={"❝"} />
        <BlockButton format="numbered-list" icon={"1."} />
        <BlockButton format="bulleted-list" icon={"•"} />
        <BlockButton format="code" icon={"{ }"} />
      </div>

      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text..."
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit();
            editor.children.map(() => {
              Transforms.delete(editor, { at: [0] });
            });
            editor.children = [
              {
                type: "paragraph",
                children: [{ text: "" }],
              },
            ];
          }
        }}
      />
    </Slate>
  );
};

export default WebEditor;
