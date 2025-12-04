
import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Link, Image as ImageIcon, Heading, List, ListOrdered, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onImageRequest?: () => void; // New prop to trigger external picker
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, onImageRequest }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      if (editorRef.current.innerHTML === '' && content !== '') {
          editorRef.current.innerHTML = content;
      }
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        editorRef.current.focus();
        onChange(editorRef.current.innerHTML);
    }
  };

  const handleImage = () => {
    if (onImageRequest) {
      // Use external handler (Admin Panel Image Picker)
      onImageRequest();
    } else {
      // Fallback
      const url = prompt('Введите URL изображения:');
      if (url) execCmd('insertImage', url);
    }
  };

  const handleLink = () => {
    const url = prompt('Введите URL ссылки:');
    if (url) execCmd('createLink', url);
  };

  // Expose a method for parent to insert image URL at cursor/end
  // Since we can't easily use refs from parent without forwardRef, 
  // we can rely on the parent updating the 'content' prop, but 
  // standard execCommand is better for insertion at cursor.
  // However, since we are in a parent-controlled loop, let's allow
  // the parent to call a function if we export it, or better yet,
  // rely on the parent simply updating the state.
  
  // NOTE: Ideally, the parent component handles the selection and then 
  // re-renders this component. But for 'insertImage', we need the cursor position.
  // A simple hack for this demo: The parent will set a global/context variable 
  // or we can listen to a custom event? 
  // Simplest: The parent calls a method on this component instance?
  // Let's stick to: Parent passes new content string? No, that loses cursor.
  // 
  // Correct simple approach for this architecture:
  // The 'onImageRequest' tells parent "I want an image".
  // The parent opens modal.
  // The parent gets URL.
  // The parent calls a specific prop `insertImageRef`? No.
  //
  // Let's add a `useEffect` that listens for an external trigger if we wanted, 
  // OR we can export the `execCmd` functionality. 
  
  // Actually, to keep it simple: 
  // We will assume the user clicks the button here, the modal opens, 
  // and when the modal closes, it returns the URL to the parent, 
  // which then needs to insert it. 
  // Since `document.execCommand` works on the active editable area, 
  // if we lose focus to the modal, we might lose the position.
  // We'll save the selection before calling onImageRequest.

  const savedSelection = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedSelection.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    }
  };

  // We can expose a function to insert image via a prop that changes? 
  // Or better, duplicate the insert logic in the parent? No.
  // Let's use a mutable ref object passed from parent to child to communicate back.
  
  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        <ToolbarButton icon={Bold} onClick={() => execCmd('bold')} title="Жирный" />
        <ToolbarButton icon={Italic} onClick={() => execCmd('italic')} title="Курсив" />
        <ToolbarButton icon={Underline} onClick={() => execCmd('underline')} title="Подчеркнутый" />
        <div className="w-px h-6 bg-slate-300 mx-2"></div>
        <ToolbarButton icon={Heading} onClick={() => execCmd('formatBlock', '<h2>')} title="Заголовок" />
        <div className="w-px h-6 bg-slate-300 mx-2"></div>
        <ToolbarButton icon={List} onClick={() => execCmd('insertUnorderedList')} title="Список" />
        <ToolbarButton icon={ListOrdered} onClick={() => execCmd('insertOrderedList')} title="Нумерованный список" />
        <div className="w-px h-6 bg-slate-300 mx-2"></div>
        <ToolbarButton icon={Link} onClick={handleLink} title="Ссылка" />
        <ToolbarButton 
            icon={ImageIcon} 
            onClick={() => {
                saveSelection();
                handleImage();
            }} 
            title="Изображение" 
        />
        <div className="w-px h-6 bg-slate-300 mx-2"></div>
        <ToolbarButton icon={Undo} onClick={() => execCmd('undo')} title="Отменить" />
        <ToolbarButton icon={Redo} onClick={() => execCmd('redo')} title="Повторить" />
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        // Restore selection when focusing if we saved it?
        className="flex-grow p-4 outline-none prose prose-slate max-w-none overflow-y-auto"
        style={{ minHeight: '300px' }}
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>

      {/* Hidden button to be triggered by parent to insert image */}
      <button 
        id="rte-insert-image-trigger"
        className="hidden"
        data-url=""
        onClick={(e) => {
            restoreSelection();
            const url = (e.currentTarget as HTMLButtonElement).dataset.url;
            if (url) execCmd('insertImage', url);
        }}
      ></button>
    </div>
  );
};

const ToolbarButton = ({ icon: Icon, onClick, title }: any) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="p-2 text-slate-600 hover:text-brand-orange hover:bg-slate-100 rounded transition-colors"
      title={title}
    >
      <Icon size={18} />
    </button>
);

export default RichTextEditor;
