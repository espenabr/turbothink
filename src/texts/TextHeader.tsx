import { RefObject, useEffect, useState } from "react";
import EditTextName from "./EditTextName";
import TextHeaderIcons from "./TextHeaderIcons";

type Props = {
    name: string;
    inputNameRef: RefObject<HTMLInputElement>;
    onUpdateName: (name: string) => void;
    onTransform: () => void;
    onDelete: () => void;
    onCopyToClipboard: () => void;
};

const TextHeader = ({ name, inputNameRef, onTransform, onUpdateName, onDelete, onCopyToClipboard }: Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);

    const onUpdate = (updated: string) => {
        setEditMode(false);
        onUpdateName(updated);
    };

    // highlight name input on edit
    useEffect(() => {
        if (editMode && inputNameRef.current) {
            inputNameRef.current.focus();
            inputNameRef.current.select();
        }
    }, [editMode]);

    return editMode ? (
        <EditTextName name={name} onRename={onUpdate} onCancel={() => setEditMode(false)} inputRef={inputNameRef} />
    ) : (
        <>
            <span onClick={() => setEditMode(true)}>
                <strong>{name}</strong>
            </span>
            <TextHeaderIcons onTransform={onTransform} onDelete={onDelete} onCopyToClipboard={onCopyToClipboard} />
        </>
    );
};

export default TextHeader;
