import { useState } from "react";
import { Cell, Column, Row } from "../tangible-gpt/model";
import AddBooleanCell from "./AddBooleanCell";
import AddNumberCell from "./AddNumberCell";
import AddTextCellInput from "./AddTextCellInput";
import IconCheck from "../icons/IconCheck";
import AddEnumCell from "./AddEnumCell";

type Props = {
    columns: Column[];
    onAdd: (row: Row) => void;
};

const AddTableRow = ({ columns, onAdd }: Props) => {
    const [row, setRow] = useState<Row>(emptyRow(columns));

    const onAddRow = () => {
        onAdd(row);
        setRow(emptyRow(columns));
    };

    const onUpdate = (columnIndex: number, newValue: string | number | boolean) => {
        const column = columns[columnIndex];
        const cells = row.cells;
        const cell = cells[columnIndex];

        if (column.type === "BooleanColumn" && typeof newValue === "boolean") {
            setRow({
                cells: [
                    ...cells.slice(0, columnIndex),
                    { ...cell, type: "BooleanCell", value: newValue },
                    ...cells.slice(columnIndex + 1),
                ],
            });
        } else if (column.type === "NumberColumn" && typeof newValue === "number") {
            setRow({
                cells: [
                    ...cells.slice(0, columnIndex),
                    { ...cell, type: "NumberCell", value: newValue },
                    ...cells.slice(columnIndex + 1),
                ],
            });
        } else if (column.type === "EnumColumn" && typeof newValue === "string") {
            setRow({
                cells: [
                    ...cells.slice(0, columnIndex),
                    { ...cell, type: "EnumCell", value: newValue },
                    ...cells.slice(columnIndex + 1),
                ],
            });
        } else if (column.type === "TextColumn" && typeof newValue === "string") {
            setRow({
                cells: [
                    ...cells.slice(0, columnIndex),
                    { ...cell, type: "TextCell", value: newValue },
                    ...cells.slice(columnIndex + 1),
                ],
            });
        }
    };

    const getBooleanValue = (columnIndex: number) => {
        const cell = row.cells[columnIndex];
        // TODO handle wrong type
        return cell.type === "BooleanCell" ? cell.value : false;
    };

    const getStringValue = (columnIndex: number) => {
        const cell = row.cells[columnIndex];
        // TOOD handle wrong type
        return cell.type === "TextCell" || cell.type === "EnumCell" ? cell.value : "";
    };

    const getNumberValue = (columnIndex: number) => {
        const cell = row.cells[columnIndex];
        // TODO handle wrong type
        return cell.type === "NumberCell" ? cell.value : 0;
    };

    return (
        <tr>
            {columns.map((column, columnIndex) => (
                <td key={column.name}>
                    {column.type === "BooleanColumn" ? (
                        <AddBooleanCell
                            value={getBooleanValue(columnIndex)}
                            onUpdate={(newValue) => onUpdate(columnIndex, newValue)}
                        />
                    ) : column.type === "EnumColumn" ? (
                        <AddEnumCell
                            value={getStringValue(columnIndex)}
                            options={column.options}
                            onUpdate={(newValue) => onUpdate(columnIndex, newValue)}
                        />
                    ) : column.type === "TextColumn" ? (
                        <AddTextCellInput
                            value={getStringValue(columnIndex)}
                            onUpdate={(newValue) => onUpdate(columnIndex, newValue)}
                            onEnter={onAddRow}
                        />
                    ) : (
                        <AddNumberCell
                            value={getNumberValue(columnIndex)}
                            onUpdate={(newValue) => onUpdate(columnIndex, newValue)}
                            onEnter={onAddRow}
                        />
                    )}
                </td>
            ))}
            <td>
                <a onClick={onAddRow}>
                    <IconCheck />
                </a>
            </td>
        </tr>
    );
};

const emptyRow = (columns: Column[]): Row => ({ cells: columns.map(toEmptyCell) });

const toEmptyCell = (column: Column): Cell => {
    switch (column.type) {
        case "BooleanColumn":
            return { type: "BooleanCell", column: column, value: false };
        case "NumberColumn":
            return { type: "NumberCell", column: column, value: 0 };
        case "EnumColumn":
            return { type: "EnumCell", column: column, value: column.options[0] };
        case "TextColumn":
            return { type: "TextCell", column: column, value: "" };
    }
};

export default AddTableRow;
