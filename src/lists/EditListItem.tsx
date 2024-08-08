import { useState, KeyboardEvent, RefObject } from "react";
import IconArrowBack from "../icons/IconArrowBack";

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

    return (
        <>
            <input value={editInput}
                style={{ width: "85%" }}
                onChange={(e) => setEditInput(e.currentTarget.value)}
                onKeyUp={onEditItem}
                ref={inputRef} />
            <span className="icon" style={{ cursor: "pointer" }} onClick={() => onCancel()}>
                <IconArrowBack />
            </span>
        </>
    );
};

export default EditListItem;
