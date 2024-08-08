import { KeyboardEvent, RefObject, useState, ClipboardEvent } from "react";
import IconArrowBack from "../icons/IconArrowBack";


type Props = {
    name: string;
    inputRef: RefObject<HTMLInputElement>;
    onRename: (newName: string) => void;
    onCancel: () => void;
};

const EditTextName = ({ name, inputRef, onRename, onCancel }: Props) => {
    const [editInput, setEditInput] = useState<string>(name);

    const onUpdateTextName = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && editInput.length > 0) {
            onRename(editInput);
        }
    };

    const onPaste = (event: ClipboardEvent) => {
        event.stopPropagation();
        const pastedText = event.clipboardData.getData("text");
        setEditInput(pastedText);
    };

    return (
        <>
            <input value={editInput}
                style={{ width: "85%" }}
                onChange={(e) => setEditInput(e.currentTarget.value)}
                onKeyUp={onUpdateTextName}
                onPaste={e => onPaste(e)}
                ref={inputRef}
            />
            <span className="icon"
                style={{ cursor: "pointer" }}
                onClick={onCancel}>
                <IconArrowBack />
            </span>
        </>
    );
};

export default EditTextName;