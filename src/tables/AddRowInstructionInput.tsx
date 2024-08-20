import { useState, KeyboardEvent, ChangeEvent } from "react";
import { Tooltip } from "react-tooltip";
import IconArrowBack from "../icons/IconArrowBack";

type Props = {
    onAddRow: (description: string, noOfRows: number) => void;
    onCancel: () => void;
};

const AddRowInstructionInput = ({ onAddRow, onCancel }: Props) => {
    const [noOfRows, setNoOfRows] = useState<string>("1");
    const [descriptionInput, setDescriptionInput] = useState<string>("");

    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && noOfRows !== "") {
            try {
                const n = parseInt(noOfRows);
                onAddRow(descriptionInput, n);
                setDescriptionInput("");
            } catch {}
        }
    };

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;
        if (value === "") {
            setNoOfRows(value);
        } else {
            try {
                const n = parseInt(event.currentTarget.value);
                if (n < 100) {
                    setNoOfRows("" + n);
                }
            } catch {}
        }
    };

    return (
        <>
            <input
                placeholder="Describe row (optional)"
                autoFocus
                style={{ width: "220px" }}
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.currentTarget.value)}
                onKeyUp={onKeyUp}
            />

            <input
                placeholder="No. of rows"
                style={{ width: "20px", textAlign: "center" }}
                value={noOfRows}
                onChange={onChange}
            />

            <span style={{ paddingLeft: "8px", cursor: "pointer" }}>
                <Tooltip id="tooltip" />
                <span
                    className="icon"
                    onClick={() => {
                        setDescriptionInput("");
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

export default AddRowInstructionInput;
