import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import styles from "./EditeurTexte.module.css";

function EditeurTexte({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, Color],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className={styles.wrapper}>
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("bold") ? styles.actif : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <b>G</b>
        </button>
        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("italic") ? styles.actif : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <i>I</i>
        </button>
        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("underline") ? styles.actif : ""}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <u>S</u>
        </button>
        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("strike") ? styles.actif : ""}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}>
          <s>B</s>
        </button>

        <div className={styles.separateur} />

        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("heading", { level: 1 }) ? styles.actif : ""}`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }>
          H1
        </button>
        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("heading", { level: 2 }) ? styles.actif : ""}`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }>
          H2
        </button>
        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("heading", { level: 3 }) ? styles.actif : ""}`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }>
          H3
        </button>

        <div className={styles.separateur} />

        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("bulletList") ? styles.actif : ""}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          ≡
        </button>
        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("orderedList") ? styles.actif : ""}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </button>
        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("blockquote") ? styles.actif : ""}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          "
        </button>
        <button
          type="button"
          className={`${styles.btn} ${editor.isActive("codeBlock") ? styles.actif : ""}`}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          {"<>"}
        </button>

        <div className={styles.separateur} />

        <label className={styles.btnCouleur} title="Couleur du texte">
          A
          <input
            type="color"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </label>

        <button
          type="button"
          className={styles.btn}
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }>
          ✕
        </button>
      </div>

      {/* ── Zone d'écriture ── */}
      <EditorContent
        editor={editor}
        className={styles.contenu}
        placeholder={placeholder}
      />
    </div>
  );
}

export default EditeurTexte;
