import { Table } from "../model";

type Props = {
    table: Table;
};

const TableContent = ({ table }: Props) => {
    return (
        <table className="table-content">
            <thead>
                <tr>
                    {table.columns.map((c) => (
                        <th key={c.name}>{c.name}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {table.rows.map((r) => (
                    <tr>
                        {r.cells.map((c) => (
                            <td key={c.column.name}>{c.value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TableContent;
