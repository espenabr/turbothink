import { useState, KeyboardEvent } from "react";
import { Tooltip } from "react-tooltip";
import IconArrowBack from "../icons/IconArrowBack";

type Props = {
    onAddColumn: (name: string, description: string) => void;
    onCancel: () => void;
};

const AddColumnInstructionInput = ({ onAddColumn, onCancel }: Props) => {
    const [columNameInput, setColumnNameInput] = useState<string>("");
    const [columnDescriptionInput, setColumnDescriptionInput] = useState<string>("");

    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && columNameInput.length > 0) {
            onAddColumn(columNameInput, columnDescriptionInput);
        }
    };

    return (
        <>
            <input
                placeholder="Column name"
                autoFocus
                style={{ width: "80px" }}
                value={columNameInput}
                onChange={(e) => setColumnNameInput(e.currentTarget.value)}
                onKeyUp={onKeyUp}
            />
            <input
                placeholder="Description"
                style={{ width: "120px" }}
                value={columnDescriptionInput}
                onChange={(e) => setColumnDescriptionInput(e.currentTarget.value)}
                onKeyUp={onKeyUp}
            />

            <span style={{ paddingLeft: "8px", cursor: "pointer" }}>
                <Tooltip id="tooltip" />
                <span
                    className="icon"
                    onClick={() => {
                        setColumnNameInput("");
                        setColumnDescriptionInput("");
                        onCancel();
                    }}
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Cancel"
                >
                    <IconArrowBack />
                </span>
            </span>
        </>
    );
};

export default AddColumnInstructionInput;
