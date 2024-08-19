import { useRef, useState } from "react";
import TableHeaderContent from "./TableHeaderContent";
import { Table } from "../model";

type Props = {
    table: Table;
    onRename: (newName: string) => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const TableHeader = ({ table, onRename, onCopyToClipboard, onDelete }: Props) => {
    const [editNameMode, setEditNameMode] = useState<boolean>(false);
    const inputNameRef = useRef<HTMLInputElement>(null);

    return (
        <div className="text-header">
            <TableHeaderContent
                name={table.name}
                inputNameRef={inputNameRef}
                editNameMode={editNameMode}
                onUpdateName={(name) => onRename(name)}
                onDelete={onDelete}
                onCopyToClipboard={onCopyToClipboard}
                setEditNameMode={setEditNameMode}
            />
        </div>
    );
};

export default TableHeader;
