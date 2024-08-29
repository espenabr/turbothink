import { useState, KeyboardEvent, ClipboardEvent, RefObject } from "react";
import { pasteToInput } from "../common";
import IconArrowBack from "../icons/IconArrowBack";

type Props = {
    columnName: string;
    inputRef: RefObject<HTMLInputElement>;
    onRename: (newName: string) => void;
    onCancel: () => void;
};

const EditTableColumnName = ({ columnName, inputRef, onRename, onCancel }: Props) => {
    const [editInput, setEditInput] = useState<string>(columnName);

    const onEdittName = (event: KeyboardEvent<HTMLInputElement>) => {
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
                onKeyUp={onEdittName}
                onPaste={onPaste}
                ref={inputRef}
            />
            <span className="icon" onClick={onCancel}>
                <IconArrowBack />
            </span>
        </>
    );
};

export default EditTableColumnName;
