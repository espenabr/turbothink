import { useState } from "react";
import IconClipboard from "../icons/IconClipboard";
import IconX from "../icons/IconX";

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
            <span onClick={onEnableEdit} style={{ cursor: "pointer" }}>
                {active ? <strong>{workspaceName}</strong> : workspaceName}
            </span>
            <span className="tab-icons" style={{ paddingLeft: "10px" }}>
                <span
                    style={{ cursor: "pointer", color: "#424242" }}
                    onClick={onCopy}
                    title="Copy workspace to clipboard"
                >
                    <IconClipboard />
                </span>
                {copied && <div className="copied">Copied!</div>}
                {canBeDeleted && (
                    <span style={{ cursor: "pointer", color: "#424242" }} onClick={() => onDelete()} title="Delete">
                        <IconX />
                    </span>
                )}
            </span>
        </div>
    );
};

export default TabContent;
