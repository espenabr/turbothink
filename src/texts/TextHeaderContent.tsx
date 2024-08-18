import { RefObject, useEffect } from "react";
import EditTextName from "./EditTextName";
import TextHeaderIcons from "./TextHeaderIcons";

type Props = {
    name: string;
    displayActions: boolean;
    inputNameRef: RefObject<HTMLInputElement>;
    editContentMode: boolean;
    onUpdateName: (name: string) => void;
    onTransform: () => void;
    onDelete: () => void;
    onCopyToClipboard: () => void;
    setEditNameMode: (value: boolean) => void;
};

const TextHeaderContent = ({
    name,
    displayActions,
    inputNameRef,
    editContentMode,
    onTransform,
    onUpdateName,
    onDelete,
    onCopyToClipboard,
    setEditNameMode,
}: Props) => {
    const onUpdate = (updated: string) => {
        setEditNameMode(false);
        onUpdateName(updated);
    };

    // highlight name input on edit
    useEffect(() => {
        if (editContentMode && inputNameRef.current) {
            inputNameRef.current.focus();
            inputNameRef.current.select();
        }
    }, [editContentMode]);

    return editContentMode ? (
        <EditTextName name={name} onRename={onUpdate} onCancel={() => setEditNameMode(false)} inputRef={inputNameRef} />
    ) : (
        <>
            <span onClick={() => setEditNameMode(true)} style={{ cursor: "pointer" }}>
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
