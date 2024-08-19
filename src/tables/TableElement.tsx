import { BlockHeight, Table } from "../model";
import TableContent from "./TableContent";
import TableHeader from "./TableHeader";
import { ClipboardItem } from "../WorkspaceContainer";
import { useSortable } from "@dnd-kit/sortable";
import { CSSProperties } from "react";
import { CSS } from "@dnd-kit/utilities";

type Props = {
    table: Table;
    blockHeight: BlockHeight;
    onUpdate: (updatedTable: Table) => void;
    onDelete: () => void;
};

const TableElement = ({ table, blockHeight, onUpdate, onDelete }: Props) => {
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

    return (
        <div className="block">
            <div className="table" ref={setNodeRef} style={style} {...attributes}>
                <TableHeader
                    table={table}
                    listeners={listeners}
                    onDelete={onDelete}
                    onCopyToClipboard={onCopyToClipboard}
                    onRename={onRename}
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

export default TableElement;
