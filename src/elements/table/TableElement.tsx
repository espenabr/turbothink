import { Table } from "../../tangible-gpt/model";
import TableHeaderElement from "./TableHeaderElement";
import TableRowElement from "./TableRowElement";



type Props = {
    table: Table;

};

const TableElement = ({ table }: Props) => {


    return (
        <table>
            <TableHeaderElement columns={table.columns} />
            {table.rows.map(r => (
                <TableRowElement row={r} />
            ))}
        </table>
    );
};


export default TableElement;