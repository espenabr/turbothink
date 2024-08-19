import { Table } from "../model";
import TableContent from "./TableContent";
import TableHeader from "./TableHeader";
import { ClipboardItem } from "../WorkspaceContainer";

type Props = {
    table: Table;
    onUpdate: (updatedTable: Table) => void;
    onDelete: () => void;
};

const TableElement = ({ table, onUpdate, onDelete }: Props) => {
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
            <div className="table">
                <TableHeader
                    table={table}
                    onDelete={onDelete}
                    onCopyToClipboard={onCopyToClipboard}
                    onRename={onRename}
                />
                <TableContent table={table} />
            </div>
        </div>
    );
};

export default TableElement;
