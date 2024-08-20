import { BlockHeight, OpenAiConfig, Table, TableAction, TableInteractionState } from "../model";
import TableContent from "./TableContent";
import TableHeader from "./TableHeader";
import { ClipboardItem } from "../model";
import { useSortable } from "@dnd-kit/sortable";
import { CSSProperties, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import TangibleClient from "../tangible-gpt/TangibleClient";
import { Column } from "../tangible-gpt/model";

type Props = {
    openAiConfig: OpenAiConfig;
    table: Table;
    blockHeight: BlockHeight;
    onUpdate: (updatedTable: Table) => void;
    onDelete: () => void;
};

const TableElement = ({ openAiConfig, table, blockHeight, onUpdate, onDelete }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [waitingForUserInstruction, setWaitingForUserInstruction] = useState<TableAction | null>(null);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: table.id });

    const style: CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const onRename = (newName: string) => onUpdate({ ...table, name: newName });

    const onCopyToClipboard = async () => {
        const clipboardItem: ClipboardItem = {
            type: "Table",
            table: table,
        };
        await navigator.clipboard.writeText(JSON.stringify(clipboardItem));
    };

    const onAddColumn = async (name: string, description: string) => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const reasoning = openAiConfig.reasoningStrategy;

        const column: Column = { type: "TextColumn", name: name };
        setLoading(true);
        const response = await tc.expectTableWithAddedColumn(
            column,
            description,
            table,
            undefined,
            undefined,
            reasoning,
        );
        if (response.outcome === "Success") {
            onUpdate({ ...table, columns: response.value.columns, rows: response.value.rows });
        }
        setLoading(false);
        setWaitingForUserInstruction(null);
    };

    const onAddRow = async (description: string, noOfRows: number) => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const reasoning = openAiConfig.reasoningStrategy;

        setLoading(true);
        const response = await tc.expectAdditionalRows(table, description, noOfRows, undefined, undefined, reasoning);
        if (response.outcome === "Success") {
            onUpdate({ ...table, rows: table.rows.slice().concat(response.value.rows) });
        }
        setLoading(false);
        setWaitingForUserInstruction(null);
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
                    onAddColumn={onAddColumn}
                    onAddRow={onAddRow}
                    onDelete={onDelete}
                    onWaitForTableInstruction={(action) => setWaitingForUserInstruction(action)}
                    onCopyToClipboard={onCopyToClipboard}
                />
                <div className={tableContentClass(blockHeight)}>
                    <TableContent table={table} />
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

export default TableElement;
