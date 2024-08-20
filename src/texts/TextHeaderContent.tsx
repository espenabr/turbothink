import { RefObject, useEffect } from "react";
import EditTextName from "./EditTextName";
import TextHeaderIcons from "./TextHeaderIcons";

type Props = {
    name: string;
    displayActions: boolean;
    inputNameRef: RefObject<HTMLInputElement>;
    editNameMode: boolean;
    onUpdateName: (name: string) => void;
    onInitiateTransform: () => void;
    onDelete: () => void;
    onCopyToClipboard: () => void;
    setEditNameMode: (value: boolean) => void;
};

const TextHeaderContent = ({
    name,
    displayActions,
    inputNameRef,
    editNameMode,
    onInitiateTransform,
    onUpdateName,
    onDelete,
    onCopyToClipboard,
    setEditNameMode,
}: Props) => {
    // highlight name input on edit
    useEffect(() => {
        if (editNameMode && inputNameRef.current) {
            inputNameRef.current.focus();
            inputNameRef.current.select();
        }
    }, [editNameMode]);

    const onUpdate = (updated: string) => {
        setEditNameMode(false);
        onUpdateName(updated);
    };

    return editNameMode ? (
        <EditTextName name={name} onRename={onUpdate} onCancel={() => setEditNameMode(false)} inputRef={inputNameRef} />
    ) : (
        <>
            <span onClick={() => setEditNameMode(true)} style={{ cursor: "pointer" }}>
                <strong>{name}</strong>
            </span>
            <TextHeaderIcons
                displayActions={displayActions}
                onInitiateTransform={onInitiateTransform}
                onDelete={onDelete}
                onCopyToClipboard={onCopyToClipboard}
            />
        </>
    );
};

export default TextHeaderContent;
