import { useState, KeyboardEvent } from "react";
import { Tooltip } from "react-tooltip";
import IconArrowBack from "../icons/IconArrowBack";

type Props = {
    onAddRow: (description: string) => void;
    onCancel: () => void;
};

const AddRowInstructionInput = ({ onAddRow, onCancel }: Props) => {
    const [descriptionInput, setDescriptionInput] = useState<string>("");

    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && descriptionInput.length > 0) {
            onAddRow(descriptionInput);
            setDescriptionInput("");
        }
    };

    return (
        <>
            <input
                placeholder="Describe row (optional)"
                autoFocus
                style={{ width: "240px" }}
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.currentTarget.value)}
                onKeyUp={onKeyUp}
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
