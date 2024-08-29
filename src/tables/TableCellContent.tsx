import { useEffect, useRef, useState } from "react";
import { Cell } from "../tangible-gpt/model";
import EditCellContent from "./EditCellContent";

type Props = {
    cell: Cell;
    onUpdateContent: (newContent: string | number | boolean) => void;
};

const TableCellContent = ({ cell, onUpdateContent }: Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // highlight name input on edit
    useEffect(() => {
        if (editMode && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editMode]);

    return (
        <td>
            {editMode ? (
                <EditCellContent
                    cell={cell}
                    inputRef={inputRef}
                    onUpdate={onUpdateContent}
                    onCancel={() => setEditMode(false)}
                />
            ) : (
                <span style={{ cursor: "pointer" }} onClick={() => setEditMode(true)}>
                    {cell.value}
                </span>
            )}
        </td>
    );
};

export default TableCellContent;
