import { Row } from "../../tangible-gpt/model";
import TableCellElement from "./TableCellElement";


type Props = {
    row: Row;
};

const TableRowElement = ({row}: Props) => {
    return (
        <tr>
            {row.cells.map(c => (
                <TableCellElement cell={c} />
            ))}
        </tr>
    );
};

export default TableRowElement;