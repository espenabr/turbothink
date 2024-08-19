import { useState, KeyboardEvent } from "react";
import { Column } from "../tangible-gpt/model";
import IconX from "../icons/IconX";
import IconArrowBack from "../icons/IconArrowBack";
import IconCheck from "../icons/IconCheck";

type Props = {
    instruction: string;
    loading: boolean;
    onGenerateTable: (columns: Column[]) => void;
    onCancel: () => void;
};

const SpecifyColumns = ({ instruction, loading, onGenerateTable, onCancel }: Props) => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [columnNameInput, setColumnNameInput] = useState<string>("");

    const addColumn = (name: string) => {
        const newColumn: Column = {
            type: "TextColumn",
            name: name,
        };
        const updatedColumns = columns.slice().concat(newColumn);
        setColumns(updatedColumns);
    };

    const onClickAdd = () => {
        addColumn(columnNameInput);
        setColumnNameInput("");
    };

    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            onClickAdd();
        }
    };

    const onDelete = (column: Column) => {
        setColumns(columns.filter((c) => c !== column));
    };

    return (
        <div className="create-list">
            {loading ? (
                <div
                    style={{
                        marginTop: "100px",
                        marginBottom: "100px",
                        marginLeft: "130px",
                    }}
                    className="spinner"
                />
            ) : (
                <>
                    <h3>Generate table</h3>
                    <div>Instruction: {instruction}</div>
                    <br />

                    {columns.map((c) => (
                        <div>
                            {c.name}
                            <a onClick={() => onDelete(c)} style={{ cursor: "pointer" }}>
                                <IconX />
                            </a>
                        </div>
                    ))}
                    <input
                        value={columnNameInput}
                        onChange={(e) => setColumnNameInput(e.currentTarget.value)}
                        onKeyUp={onKeyUp}
                        placeholder="Column name"
                    />
                    <button onClick={onClickAdd}>Add</button>

                    <br />
                    <br />
                    <div>
                        <a onClick={() => onGenerateTable(columns)} style={{ cursor: "pointer" }}>
                            <IconCheck />
                        </a>
                        <a onClick={onCancel} style={{ cursor: "pointer" }}>
                            <IconArrowBack />
                        </a>
                    </div>
                </>
            )}
        </div>
    );
};

export default SpecifyColumns;
