import { RefObject, useEffect } from "react";
import TableHeaderIcons from "./TableHeaderIcons";
import EditTableName from "./EditTableName";

type Props = {
    name: string;
    editNameMode: boolean;
    inputNameRef: RefObject<HTMLInputElement>;
    onUpdateName: (name: string) => void;
    onDelete: () => void;
    onCopyToClipboard: () => void;
    setEditNameMode: (value: boolean) => void;
};

const TableHeaderContent = ({
    name,
    editNameMode,
    inputNameRef,
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
        if (editNameMode && inputNameRef.current) {
            inputNameRef.current.focus();
            inputNameRef.current.select();
        }
    }, [editNameMode]);

    return editNameMode ? (
        <EditTableName
            name={name}
            onRename={onUpdate}
            onCancel={() => setEditNameMode(false)}
            inputRef={inputNameRef}
        />
    ) : (
        <>
            <span onClick={() => setEditNameMode(true)} style={{ cursor: "pointer" }}>
                <strong>{name}</strong>
            </span>
            <TableHeaderIcons onDelete={onDelete} onCopyToClipboard={onCopyToClipboard} />
        </>
    );
};

export default TableHeaderContent;
