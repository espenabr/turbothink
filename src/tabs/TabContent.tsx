import { useState } from "react";
import IconClipboard from "../icons/IconClipboard";
import IconX from "../icons/IconX";
import { Tooltip } from "react-tooltip";

type Props = {
    workspaceName: string;
    canBeDeleted: boolean;
    active: boolean;
    onEnableEdit: () => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const TabContent = ({ workspaceName, canBeDeleted, active, onEnableEdit, onCopyToClipboard, onDelete }: Props) => {
    const [copied, setCopied] = useState<boolean>(false);

    const onCopy = () => {
        setCopied(true);
        onCopyToClipboard();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="tab-item">
            <Tooltip place="top" id="tooltip" />
            <a onClick={onEnableEdit} style={{ cursor: "pointer" }}>
                {active ? <strong>{workspaceName}</strong> : workspaceName}
            </a>
            <span className="tab-icons" style={{ paddingLeft: "10px" }}>
                <a onClick={onCopy} data-tooltip-id="tooltip" data-tooltip-content="Copy workspace to clipboard">
                    <IconClipboard />
                </a>
                {copied && <div className="copied">Copied!</div>}
                {canBeDeleted && (
                    <a onClick={() => onDelete()} data-tooltip-id="tooltip" data-tooltip-content="Close">
                        <IconX />
                    </a>
                )}
            </span>
        </div>
    );
};

export default TabContent;
