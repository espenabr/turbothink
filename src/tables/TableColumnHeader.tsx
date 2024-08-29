import { useEffect, useRef, useState } from "react";
import IconX from "../icons/IconX";
import EditTableColumnName from "./EditTableColumnName";

type Props = {
    columnName: string;
    onDeleteColumn: () => void;
    onUpdateColumnHeader: (newName: string) => void;
};

export default function TableColumnHeader({ columnName, onDeleteColumn, onUpdateColumnHeader }: Props) {
    const [editNameMode, setEditNameMode] = useState<boolean>(false);
    const inputNameRef = useRef<HTMLInputElement>(null);

    // highlight name input on edit
    useEffect(() => {
        if (editNameMode && inputNameRef.current) {
            inputNameRef.current.focus();
            inputNameRef.current.select();
        }
    }, [editNameMode]);

    return (
        <th>
            {editNameMode ? (
                <EditTableColumnName
                    columnName={columnName}
                    inputRef={inputNameRef}
                    onRename={onUpdateColumnHeader}
                    onCancel={() => setEditNameMode(false)}
                />
            ) : (
                <>
                    <span style={{ cursor: "pointer" }} onClick={() => setEditNameMode(true)}>
                        {columnName}
                    </span>
                    &nbsp;
                    <a onClick={onDeleteColumn}>
                        <IconX />
                    </a>
                </>
            )}
        </th>
    );
}
