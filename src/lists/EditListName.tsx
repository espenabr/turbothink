import { useState, KeyboardEvent } from "react";
import IconArrowBack from "../icons/IconArrowBack";

type Props = {
    listName: string;
    onRename: (newName: string) => void;
    onCancel: () => void;
};

const EditListName = ({ listName, onRename, onCancel }: Props) => {
    const [editInput, setEditInput] = useState<string>(listName);

    const onEditListName = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && editInput.length > 0) {
            onRename(editInput);
        }
    };

    return (
        <>
            <input
                value={editInput}
                style={{ width: "85%" }}
                onChange={(e) => setEditInput(e.currentTarget.value)}
                onKeyUp={onEditListName}
            />
            <span className="icon" onClick={onCancel}>
                <IconArrowBack />
            </span>
        </>
    );
};

export default EditListName;
