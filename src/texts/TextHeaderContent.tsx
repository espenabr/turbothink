import { RefObject, useEffect, useState } from "react";
import EditTextName from "./EditTextName";
import TextHeaderIcons from "./TextHeaderIcons";

type Props = {
    name: string;
    displayActions: boolean;
    inputNameRef: RefObject<HTMLInputElement>;
    onUpdateName: (name: string) => void;
    onTransform: () => void;
    onDelete: () => void;
    onCopyToClipboard: () => void;
};

const TextHeaderContent = ({
    name,
    displayActions,
    inputNameRef,
    onTransform,
    onUpdateName,
    onDelete,
    onCopyToClipboard,
}: Props) => {
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
            <span onClick={() => setEditMode(true)} style={{ cursor: "pointer" }}>
                <strong>{name}</strong>
            </span>
            <TextHeaderIcons
                displayActions={displayActions}
                onTransform={onTransform}
                onDelete={onDelete}
                onCopyToClipboard={onCopyToClipboard}
            />
        </>
    );
};

export default TextHeaderContent;
