import { BlockHeight, OpenAiConfig, Table, TableAction, TableInteractionState } from "../model";
import TableContent from "./TableContent";
import TableHeader from "./TableHeader";
import { ClipboardItem } from "../model";
import { useSortable } from "@dnd-kit/sortable";
import { CSSProperties, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import TangibleClient from "../tangible-gpt/TangibleClient";
import { Cell, Column, Row, TangibleResponse, TextCell, TextColumn } from "../tangible-gpt/model";
import { Table as TangibleTable } from "../tangible-gpt/model";
import { equalArrays, withoutElement, withReplacedElement } from "../common";

type Props = {
    openAiConfig: OpenAiConfig;
    table: Table;
    blockHeight: BlockHeight;
    onUpdate: (updatedTable: Table) => void;
    onDelete: () => void;
    onAddRow: (row: Row) => void;
};

const TableElement = ({ openAiConfig, table, blockHeight, onUpdate, onDelete, onAddRow }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [waitingForUserInstruction, setWaitingForUserInstruction] = useState<TableAction | null>(null);

    /* Drag & drop */
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: table.id });
    const style: CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const onCopyToClipboard = async () => {
        const clipboardItem: ClipboardItem = {
            type: "Table",
            table: table,
        };
        await navigator.clipboard.writeText(JSON.stringify(clipboardItem));
    };

    /* Actions using LLM */

    const onAddColumnWithLLM = async (name: string, description: string) => {
        setLoading(true);
        const response = await addColumnWithLLM(openAiConfig, table, name, description);
        if (response.outcome === "Success") {
            onUpdate({ ...table, columns: response.value.columns, rows: response.value.rows });
        }
        setLoading(false);
        setWaitingForUserInstruction(null);
    };

    const onAddRowWithLLM = async (description: string, noOfRows: number) => {
        setLoading(true);
        const response = await additionalRowsWithLLM(openAiConfig, table, description, noOfRows);
        if (response.outcome === "Success") {
            onUpdate({ ...table, rows: table.rows.slice().concat(response.value.rows) });
        }
        setLoading(false);
        setWaitingForUserInstruction(null);
    };

    /* Direct manipulation */

    const onDeleteColumn = (columnIndex: number) => {
        const columns = table.columns;

        onUpdate({
            ...table,
            columns: [...columns.slice(0, columnIndex), ...columns.slice(columnIndex + 1)],
            rows: table.rows.slice().map((r) => ({
                ...r,
                cells: withoutElement(r.cells, columnIndex),
            })),
        });
    };

    const onAddColumn = () => {
        const columns = table.columns;
        const newColumn: TextColumn = { type: "TextColumn", name: "New column" };
        const newCell: TextCell = { type: "TextCell", column: newColumn, value: "" };

        onUpdate({
            ...table,
            columns: columns.slice().concat(newColumn),
            rows: table.rows.slice().map((row) => ({
                cells: row.cells.slice().concat(newCell),
            })),
        });
    };

    const onDeleteRow = (values: string[]) => {
        onUpdate({
            ...table,
            rows: table.rows.filter(
                (r) =>
                    !equalArrays(
                        r.cells.map((c) => c.value.toString()),
                        values,
                    ),
            ),
        });
    };

    const onRename = (newName: string) => onUpdate({ ...table, name: newName });

    const onUpdateCellContent = (rowIndex: number, columnIndex: number, newContent: string | number | boolean) => {
        const row = table.rows[rowIndex];
        const cell = row.cells[columnIndex];

        const updateCell = (updatedCell: Cell) => {
            const updatedRow: Row = {
                ...row,
                cells: withReplacedElement(row.cells, columnIndex, updatedCell),
            };
            onUpdate({
                ...table,
                rows: withReplacedElement(table.rows, rowIndex, updatedRow),
            });
        };

        if (typeof newContent === "string" && (cell.type === "TextCell" || cell.type === "EnumCell")) {
            updateCell({ ...cell, value: newContent });
        } else if (typeof newContent === "number" && cell.type === "NumberCell") {
            updateCell({ ...cell, value: newContent });
        } else if (typeof newContent === "boolean" && cell.type === "BooleanCell") {
            updateCell({ ...cell, value: newContent });
        } else {
            console.warn(`Unable to update cell of type ${cell.type} with ${typeof newContent} value`);
        }
    };

    const onUpdateColumnHeader = (columnIndex: number, newHeader: string) => {
        const columns = table.columns;
        const updatedColumn: Column = { ...columns[columnIndex], name: newHeader };

        onUpdate({
            ...table,
            columns: withReplacedElement(columns, columnIndex, updatedColumn),
            rows: table.rows.map((row) => {
                const cell = row.cells[columnIndex];
                const updatedCell: Cell = { ...cell, column: { ...cell.column, name: newHeader } };
                return {
                    ...row,
                    cells: withReplacedElement(row.cells, columnIndex, updatedCell),
                };
            }),
        });
    };

    return (
        <div className="block">
            <div className="table" ref={setNodeRef} style={style} {...attributes}>
                <TableHeader
                    table={table}
                    interactionState={interactionState(loading, waitingForUserInstruction)}
                    listeners={listeners}
                    onCancel={() => setWaitingForUserInstruction(null)}
                    onRename={onRename}
                    onAddColumn={onAddColumnWithLLM}
                    onAddRowsWithLLM={onAddRowWithLLM}
                    onDelete={onDelete}
                    onWaitForTableInstruction={(action) => setWaitingForUserInstruction(action)}
                    onCopyToClipboard={onCopyToClipboard}
                />
                <div className={tableContentClass(blockHeight)}>
                    <TableContent
                        table={table}
                        onDeleteColumn={onDeleteColumn}
                        onDeleteRow={onDeleteRow}
                        onUpdateColumnHeader={onUpdateColumnHeader}
                        onUpdateCellContent={onUpdateCellContent}
                        onAddRow={onAddRow}
                        onAddColumn={onAddColumn}
                    />
                </div>
            </div>
        </div>
    );
};

const tableContentClass = (blockHeight: BlockHeight) => {
    switch (blockHeight) {
        case "Unlimited":
            return "";
        case "Medium":
            return "scrollable-block medium-block";
        case "Short":
            return "scrollable-block short-block";
        case "Tall":
            return "scrollable-block tall-block";
    }
};

const interactionState = (loading: boolean, waitingForUserInstruction: TableAction | null): TableInteractionState => {
    if (loading) {
        return { type: "Loading" };
    } else if (waitingForUserInstruction === "addColumn") {
        return { type: "WaitingForAddColumnInstruction" };
    } else if (waitingForUserInstruction === "addRow") {
        return { type: "WaitingForAddRowInstruction" };
    } else {
        return { type: "Display" };
    }
};

const addColumnWithLLM = (
    config: OpenAiConfig,
    table: Table,
    columnName: string,
    description: string,
): Promise<TangibleResponse<TangibleTable>> => {
    const tc = new TangibleClient(config.key, config.model);
    const reasoning = config.reasoningStrategy;
    const column: Column = { type: "TextColumn", name: columnName };
    return tc.expectTableWithAddedColumn(column, description, table, undefined, undefined, reasoning);
};

const additionalRowsWithLLM = (
    config: OpenAiConfig,
    table: Table,
    description: string,
    noOfRows: number,
): Promise<TangibleResponse<TangibleTable>> => {
    const tc = new TangibleClient(config.key, config.model);
    const reasoning = config.reasoningStrategy;
    return tc.expectAdditionalRows(table, description, noOfRows, undefined, undefined, reasoning);
};

export default TableElement;
