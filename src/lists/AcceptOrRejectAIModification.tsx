import { Tooltip } from "react-tooltip";
import IconArrowBack from "../icons/IconArrowBack";
import IconCheck from "../icons/IconCheck";
import { useState, KeyboardEvent } from "react";

type Props = {
    onReject: () => void;
    onAccept: () => void;
    onRetryWithAdditionalInstruction: (instruction: string) => void;
};

const AcceptOrRejectAIModification = ({ onReject, onAccept, onRetryWithAdditionalInstruction }: Props) => {
    const [input, setInput] = useState<string>("");

    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            onRetryWithAdditionalInstruction(input);
            setInput("");
        }
    };

    return (
        <span>
            <Tooltip id="tooltip" />
            {onAccept !== undefined && (
                <a className="icon" onClick={onAccept} data-tooltip-id="tooltip" data-tooltip-content="Accept">
                    <IconCheck />
                </a>
            )}
            <a className="icon" onClick={onReject} data-tooltip-id="tooltip" data-tooltip-content="Reject">
                <IconArrowBack />
            </a>
            <input
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                onKeyUp={onKeyUp}
                placeholder="Not quite happy? Explain..."
                style={{ marginLeft: "20px", width: "210px" }}
            />
        </span>
    );
};

export default AcceptOrRejectAIModification;
