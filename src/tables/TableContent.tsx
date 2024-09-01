import IconPlus from "../icons/IconPlus";
import IconX from "../icons/IconX";
import { Table } from "../model";
import { Row } from "../tangible-gpt/model";
import AddRow from "./AddRow";
import TableCellContent from "./CellContent";
import TableColumnHeader from "./ColumnHeader";

type Props = {
    table: Table;
    onDeleteColumn: (columnIndex: number) => void;
    onDeleteRow: (cellValues: string[]) => void;
    onUpdateColumnHeader: (columnIndex: number, newName: string) => void;
    onUpdateCellContent: (rowIndex: number, columnIndex: number, newContent: string | number | boolean) => void;
    onAddRow: (row: Row) => void;
    onAddColumn: () => void;
};

const TableContent = ({
    table,
    onDeleteColumn,
    onDeleteRow,
    onUpdateColumnHeader,
    onUpdateCellContent,
    onAddRow,
    onAddColumn,
}: Props) => {
    return (
        <table className="table-content">
            <thead>
                <tr>
                    {table.columns.map((column, columnIndex) => (
                        <TableColumnHeader
                            columnName={column.name}
                            onDeleteColumn={() => onDeleteColumn(columnIndex)}
                            onUpdateColumnHeader={(newName) => onUpdateColumnHeader(columnIndex, newName)}
                            key={columnIndex}
                        />
                    ))}
                    <th>
                        <a onClick={onAddColumn}>
                            <IconPlus />
                        </a>
                    </th>
                </tr>
            </thead>
            <tbody>
                {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.cells.map((cell, columnIndex) => (
                            <TableCellContent
                                cell={cell}
                                onUpdateContent={(newContent) => onUpdateCellContent(rowIndex, columnIndex, newContent)}
                                key={columnIndex}
                            />
                        ))}
                        <td>
                            <a onClick={() => onDeleteRow(row.cells.map((c) => c.value.toString()))}>
                                <IconX />
                            </a>
                        </td>
                    </tr>
                ))}
                <AddRow columns={table.columns} onAdd={onAddRow} />
            </tbody>
        </table>
    );
};

export default TableContent;
