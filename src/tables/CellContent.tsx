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

    const onUpdate = (newContent: string | number | boolean) => {
        onUpdateContent(newContent);
        setEditMode(false);
    };

    return (
        <td>
            {editMode ? (
                <EditCellContent
                    cell={cell}
                    inputRef={inputRef}
                    onUpdate={onUpdate}
                    onCancel={() => setEditMode(false)}
                />
            ) : (
                <span style={{ cursor: "pointer" }} onClick={() => setEditMode(true)}>
                    {cellValue(cell)}
                </span>
            )}
        </td>
    );
};

const cellValue = (cell: Cell): JSX.Element => {
    if (cell.type === "TextCell") {
        return cell.value.length > 0 ? <span>{cell.value}</span> : <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>;
    } else {
        return <span>cell.value.toString()</span>;
    }
};

export default TableCellContent;
