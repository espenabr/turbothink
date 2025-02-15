import { KeyboardEvent, RefObject, useState, ClipboardEvent } from "react";
import IconArrowBack from "../icons/IconArrowBack";
import { pasteToInput } from "../common";

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

    const onPaste = (event: ClipboardEvent) => pasteToInput(event, editInput, setEditInput);

    return (
        <>
            <input
                value={editInput}
                style={{ width: "85%" }}
                onChange={(e) => setEditInput(e.currentTarget.value)}
                onKeyUp={onUpdateTextName}
                onPaste={onPaste}
                ref={inputRef}
            />
            <a className="icon" onClick={onCancel}>
                <IconArrowBack />
            </a>
        </>
    );
};

export default EditTextName;
