import { Column } from "../../tangible-gpt/model"

type Props = {
    columns: Column[];
}

const TableHeaderElement = ({columns}: Props) => {
    return (
        <tr>
            {columns.map(c => (
                <th>{c.name}</th>
            ))}
        </tr>
    );
};

export default TableHeaderElement;