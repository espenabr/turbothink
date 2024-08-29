import IconX from "../icons/IconX";
import { Table } from "../model";
import TableCellContent from "./TableCellContent";
import TableColumnHeader from "./TableColumnHeader";

type Props = {
    table: Table;
    onDeleteColumn: (columnIndex: number) => void;
    onDeleteRow: (cellValues: string[]) => void;
    onUpdateColumnHeader: (columnIndex: number, newName: string) => void;
    onUpdateCellContent: (rowIndex: number, columnIndex: number, newContent: string | number | boolean) => void;
};

const TableContent = ({ table, onDeleteColumn, onDeleteRow, onUpdateColumnHeader, onUpdateCellContent }: Props) => {
    return (
        <table className="table-content">
            <thead>
                <tr>
                    {table.columns.map((c, i) => (
                        <TableColumnHeader
                            columnIndex={i}
                            columnName={c.name}
                            onDeleteColumn={() => onDeleteColumn(i)}
                            onUpdateColumnHeader={(newName) => onUpdateColumnHeader(i, newName)}
                            key={c.name}
                        />
                    ))}
                </tr>
            </thead>
            <tbody>
                {table.rows.map((row, rowIndex) => (
                    <tr key={row.cells.map((c) => c.value).join()}>
                        {row.cells.map((cell, columnIndex) => (
                            <TableCellContent
                                cell={cell}
                                onUpdateContent={(newContent) => onUpdateCellContent(rowIndex, columnIndex, newContent)}
                            />
                        ))}
                        <td>
                            <a onClick={() => onDeleteRow(row.cells.map((c) => c.value.toString()))}>
                                <IconX />
                            </a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TableContent;
