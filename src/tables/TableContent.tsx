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
                        <th>{c.name}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {table.rows.map((r) => (
                    <tr>
                        {r.cells.map((c) => (
                            <td>{c.value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TableContent;
