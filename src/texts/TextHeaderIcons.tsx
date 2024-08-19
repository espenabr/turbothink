import { useState } from "react";
import IconX from "../icons/IconX";
import IconClipboard from "../icons/IconClipboard";
import IconStatusChange from "../icons/IconStatusChange";
import { Tooltip } from "react-tooltip";

type Props = {
    displayActions: boolean;
    onTransform: () => void;
    onDelete: () => void;
    onCopyToClipboard: () => void;
};

const TextHeaderIcons = ({ displayActions, onTransform, onDelete, onCopyToClipboard }: Props) => {
    const [copied, setCopied] = useState<boolean>(false);

    const onCopy = () => {
        setCopied(true);
        onCopyToClipboard();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="icons">
            <Tooltip place="top" id="tooltip" />
            {displayActions && (
                <>
                    <a
                        className="icon"
                        onClick={onTransform}
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Transform text"
                    >
                        <IconStatusChange />
                    </a>
                </>
            )}
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

export default TextHeaderIcons;
