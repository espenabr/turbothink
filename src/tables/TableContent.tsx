import IconX from "../icons/IconX";
import { Table } from "../model";

type Props = {
    table: Table;
    onDeleteColumn: (columnName: string) => void;
    onDeleteRow: (cellValues: string[]) => void;
};

const TableContent = ({ table, onDeleteColumn, onDeleteRow }: Props) => {
    return (
        <table className="table-content">
            <thead>
                <tr>
                    {table.columns.map((c) => (
                        <th key={c.name}>
                            {c.name}
                            &nbsp;
                            <a onClick={() => onDeleteColumn(c.name)}>
                                <IconX />
                            </a>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {table.rows.map((r) => (
                    <tr key={r.cells.map((c) => c.value).join()}>
                        {r.cells.map((c) => (
                            <td key={c.column.name}>{c.value}</td>
                        ))}
                        <td>
                            <a onClick={() => onDeleteRow(r.cells.map((c) => c.value.toString()))}>
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
