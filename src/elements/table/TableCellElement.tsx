import { Cell } from "../../tangible-gpt/model";


type Props = {
    cell: Cell;
};

const TableCellElement = ({cell} : Props) => {
    return (
        <>
            {cell.value}
        </>
    )
};

export default TableCellElement;