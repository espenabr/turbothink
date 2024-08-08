import { useEffect, useRef, useState } from "react";
import { Text } from "../model";
import EditTextContent from "./EditTextContent";
import DisplayTextContent from "./DisplayTextContent";
import EditTextName from "./EditTextName";


type Props = {
    text: Text;
    onUpdate: (updatedText: Text) => void;
}

const TextElement = ({ text, onUpdate }: Props) => {
    const [editNameMode, setEditNameMode] = useState<boolean>(false);
    const [editContentMode, setEditContentMode] = useState<boolean>(false);
    const inputNameRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className="text">
            <div className="text-header">
                {editNameMode ? (
                    <EditTextName name={text.name}
                        onRename={onUpdateName}
                        onCancel={() => setEditNameMode(false)}
                        inputRef={inputNameRef} />
                ) : (
                    <span onClick={() => setEditNameMode(true)}>
                        <strong>{text.name}</strong>
                    </span>
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