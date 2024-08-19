import { useRef, useState } from "react";
import TableHeaderContent from "./TableHeaderContent";
import { Table } from "../model";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

type Props = {
    table: Table;
    listeners: SyntheticListenerMap | undefined;
    onRename: (newName: string) => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const TableHeader = ({ table, listeners, onRename, onCopyToClipboard, onDelete }: Props) => {
    const [editNameMode, setEditNameMode] = useState<boolean>(false);
    const inputNameRef = useRef<HTMLInputElement>(null);

    return (
        <div className="table-header" {...listeners}>
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
