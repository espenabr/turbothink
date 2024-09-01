import { useState } from "react";
import { Cell, Column, Row } from "../tangible-gpt/model";
import AddBooleanCell from "./AddRowBooleanCell";
import AddNumberCell from "./AddRowNumberCell";
import AddTextCellInput from "./AddRowTextCell";
import IconCheck from "../icons/IconCheck";
import AddEnumCell from "./AddRowEnumCell";
import { withReplacedElement } from "../common";

type Props = {
    columns: Column[];
    onAdd: (row: Row) => void;
};

const AddRow = ({ columns, onAdd }: Props) => {
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
            const updated: Cell = { ...cell, type: "BooleanCell", value: newValue };
            setRow({ cells: withReplacedElement(cells, columnIndex, updated) });
        } else if (column.type === "NumberColumn" && typeof newValue === "number") {
            const updated: Cell = { ...cell, type: "NumberCell", value: newValue };
            setRow({ cells: withReplacedElement(cells, columnIndex, updated) });
        } else if (column.type === "EnumColumn" && typeof newValue === "string") {
            const updated: Cell = { ...cell, type: "EnumCell", value: newValue };
            setRow({ cells: withReplacedElement(cells, columnIndex, updated) });
        } else if (column.type === "TextColumn" && typeof newValue === "string") {
            const updated: Cell = { ...cell, type: "TextCell", value: newValue };
            setRow({ cells: withReplacedElement(cells, columnIndex, updated) });
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
        if (cell !== undefined) {
            return cell.type === "TextCell" || cell.type === "EnumCell" ? cell.value : "";
        } else {
            return "";
        }
    };

    const getNumberValue = (columnIndex: number) => {
        const cell = row.cells[columnIndex];
        // TODO handle wrong type
        return cell.type === "NumberCell" ? cell.value : 0;
    };

    return (
        <tr>
            {columns.map((column, columnIndex) => (
                <td key={columnIndex}>
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

export default AddRow;
