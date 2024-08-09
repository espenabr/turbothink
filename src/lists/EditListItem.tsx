import { useState, KeyboardEvent, RefObject, ClipboardEvent } from "react";
import IconArrowBack from "../icons/IconArrowBack";
import { pasteToInput } from "../common";

type Props = {
    name: string;
    inputRef: RefObject<HTMLInputElement>;
    onEdit: (newName: string) => void;
    onCancel: () => void;
};

const EditListItem = ({ name: text, inputRef, onEdit, onCancel }: Props) => {
    const [editInput, setEditInput] = useState<string>(text);

    const onEditItem = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && editInput.length > 0) {
            onEdit(editInput);
        }
    };

    const onPaste = (event: ClipboardEvent) => pasteToInput(event, editInput, setEditInput);

    return (
        <>
            <input value={editInput}
                style={{ width: "85%" }}
                onChange={(e) => setEditInput(e.currentTarget.value)}
                onKeyUp={onEditItem}
                onPaste={onPaste}
                ref={inputRef} />
            <span className="icon" style={{ cursor: "pointer" }} onClick={() => onCancel()}>
                <IconArrowBack />
            </span>
        </>
    );
};

export default EditListItem;
