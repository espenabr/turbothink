import { useState, KeyboardEvent, RefObject, ClipboardEvent } from "react";
import IconArrowBack from "../icons/IconArrowBack";
import { pasteToInput } from "../common";

type Props = {
    listName: string;
    inputRef: RefObject<HTMLInputElement>;
    onRename: (newName: string) => void;
    onCancel: () => void;
};

const EditListName = ({ listName, inputRef, onRename, onCancel }: Props) => {
    const [editInput, setEditInput] = useState<string>(listName);

    const onEditListName = (event: KeyboardEvent<HTMLInputElement>) => {
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
                onKeyUp={onEditListName}
                onPaste={onPaste}
                ref={inputRef}
            />
            <span className="icon" onClick={onCancel}>
                <IconArrowBack />
            </span>
        </>
    );
};

export default EditListName;
