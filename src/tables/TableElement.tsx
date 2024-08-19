import { Table } from "../model";

type Props = {
    table: Table;
};

const TableElement = ({ table }: Props) => {
    return (
        <div>
            <div className="block">
                <table style={{ width: "100%" }}>
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
            </div>
        </div>
    );
};

export default TableElement;
