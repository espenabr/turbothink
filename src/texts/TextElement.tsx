import { CSSProperties, useEffect, useRef, useState } from "react";
import { Text, TextId } from "../model";
import EditTextContent from "./EditTextContent";
import DisplayTextContent from "./DisplayTextContent";
import EditTextName from "./EditTextName";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import TextHeaderIcons from "./TextHeaderIcons";
import { ClipboardItem } from "../WorkspaceContainer";


type Props = {
    text: Text;
    onUpdate: (updatedText: Text) => void;
    onDelete: (textId: TextId) => void;
};

const TextElement = ({ text, onUpdate, onDelete }: Props) => {
    const [editNameMode, setEditNameMode] = useState<boolean>(false);
    const [editContentMode, setEditContentMode] = useState<boolean>(false);
    const inputNameRef = useRef<HTMLInputElement>(null);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: text.id });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // highlight name input on edit
    useEffect(() => {
        if (editNameMode && inputNameRef.current) {
            inputNameRef.current.focus();
            inputNameRef.current.select();
        }
    }, [editNameMode]);

    const onUpdateContent = (content: string) => {
        setEditContentMode(false);
        onUpdate({ ...text, content: content });
    };

    const onUpdateName = (name: string) => {
        setEditNameMode(false);
        onUpdate({ ...text, name: name });
    };

    const onCopyToClipboard = async () => {
        const clipboardItem: ClipboardItem = {
            type: "Text",
            text: text
        };
        await navigator.clipboard.writeText(JSON.stringify(clipboardItem));
    };

    return (
        <div className="text" style={style} ref={setNodeRef} {...attributes} {...listeners}>
            <div className="list-item" style={{ background: "lightGray" }} onPaste={(event) => {
                event.preventDefault();
            }}>
                {editNameMode ? (
                    <EditTextName name={text.name}
                        onRename={onUpdateName}
                        onCancel={() => setEditNameMode(false)}
                        inputRef={inputNameRef} />
                ) : (
                    <>
                        <span onClick={() => setEditNameMode(true)}>
                            <strong>{text.name}</strong>
                        </span>
                        <TextHeaderIcons onDelete={() => onDelete(text.id)}
                            onCopyToClipboard={onCopyToClipboard} />
                    </>
                )}
            </div>
            <div className="text-content">
                {editContentMode ? (
                    <EditTextContent content={text.content}
                        onUpdate={onUpdateContent}
                        onCancel={() => setEditContentMode(false)} />
                ) : (
                    <DisplayTextContent content={text.content}
                        onEdit={() => setEditContentMode(true)} />
                )}
            </div>
        </div>
    );
};

export default TextElement;