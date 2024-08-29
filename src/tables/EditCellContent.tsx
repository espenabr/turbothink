import { useState, KeyboardEvent, RefObject, ClipboardEvent } from "react";
import { Cell } from "../tangible-gpt/model";
import { pasteToInput } from "../common";
import IconArrowBack from "../icons/IconArrowBack";

type Props = {
    cell: Cell;
    inputRef: RefObject<HTMLInputElement>;
    onUpdate: (newContent: string) => void;
    onCancel: () => void;
};

const EditCellContent = ({ cell, inputRef, onUpdate, onCancel }: Props) => {
    const [editInput, setEditInput] = useState<string>(cell.value.toString());

    const onEdit = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && editInput.length > 0) {
            onUpdate(editInput);
        }
    };

    const onPaste = (event: ClipboardEvent) => pasteToInput(event, editInput, setEditInput);

    return (
        <>
            <input
                value={editInput}
                style={{ width: "85%" }}
                onChange={(e) => setEditInput(e.currentTarget.value)}
                onKeyUp={onEdit}
                onPaste={onPaste}
                ref={inputRef}
            />
            <span className="icon" onClick={onCancel}>
                <IconArrowBack />
            </span>
        </>
    );
};

export default EditCellContent;
