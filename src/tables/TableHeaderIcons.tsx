import { Tooltip } from "react-tooltip";
import IconClipboard from "../icons/IconClipboard";
import IconX from "../icons/IconX";
import { useState } from "react";
import IconRowInsertBottom from "../icons/IconRowInsertBottom";
import IconColumnInsertRight from "../icons/IconColumnInsertRight";

type Props = {
    onInitiateAddColumn: () => void;
    onInitiateAddRow: () => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const TableHeaderIcons = ({ onInitiateAddColumn, onInitiateAddRow, onCopyToClipboard, onDelete }: Props) => {
    const [copied, setCopied] = useState<boolean>(false);

    const onCopy = () => {
        setCopied(true);
        onCopyToClipboard();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="icons">
            <Tooltip place="top" id="tooltip" />
            <a
                className="icon"
                onClick={onInitiateAddColumn}
                data-tooltip-id="tooltip"
                data-tooltip-content="Add column"
            >
                <IconColumnInsertRight />
            </a>
            <a className="icon" onClick={onInitiateAddRow} data-tooltip-id="tooltip" data-tooltip-content="Add row">
                <IconRowInsertBottom />
            </a>

            <a className="icon" onClick={onCopy} data-tooltip-id="tooltip" data-tooltip-content="Copy to clipboard">
                <IconClipboard />
            </a>
            {copied && <div className="copied">Copied!</div>}
            <a className="icon" onClick={onDelete} data-tooltip-id="tooltip" data-tooltip-content="Close">
                <IconX />
            </a>
        </div>
    );
};

export default TableHeaderIcons;
