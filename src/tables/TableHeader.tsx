import { useRef, useState } from "react";
import TableHeaderContent from "./TableHeaderContent";
import { Table, TableAction, TableInteractionState } from "../model";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import AddColumnInstructionInput from "./AddColumnInstructionInput";
import AddRowInstructionInput from "./AddRowInstructionInput";

type Props = {
    table: Table;
    interactionState: TableInteractionState;
    listeners: SyntheticListenerMap | undefined;
    onCancel: () => void;
    onRename: (newName: string) => void;
    onAddColumn: (name: string, description: string) => void;
    onAddRowsWithLLM: (description: string, noOfRows: number) => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
    onWaitForTableInstruction: (action: TableAction) => void;
};

const TableHeader = ({
    table,
    interactionState,
    listeners,
    onCancel,
    onRename,
    onAddColumn,
    onAddRowsWithLLM,
    onCopyToClipboard,
    onDelete,
    onWaitForTableInstruction,
}: Props) => {
    const [editNameMode, setEditNameMode] = useState<boolean>(false);
    const inputNameRef = useRef<HTMLInputElement>(null);

    return (
        <div className="table-header" {...listeners}>
            {interactionState.type === "WaitingForAddColumnInstruction" ? (
                <AddColumnInstructionInput onAddColumn={onAddColumn} onCancel={onCancel} />
            ) : interactionState.type === "WaitingForAddRowInstruction" ? (
                <AddRowInstructionInput onAddRow={onAddRowsWithLLM} onCancel={onCancel} />
            ) : interactionState.type === "Loading" ? (
                <div className="spinner" />
            ) : (
                <TableHeaderContent
                    name={table.name}
                    inputNameRef={inputNameRef}
                    editNameMode={editNameMode}
                    onInitiateAddColumn={() => onWaitForTableInstruction("addColumn")}
                    onInitiateAddRow={() => onWaitForTableInstruction("addRow")}
                    onUpdateName={(name) => onRename(name)}
                    onDelete={onDelete}
                    onCopyToClipboard={onCopyToClipboard}
                    setEditNameMode={setEditNameMode}
                />
            )}
        </div>
    );
};

export default TableHeader;
