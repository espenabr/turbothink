import { useState } from "react";
import IconX from "../icons/IconX";
import IconClipboard from "../icons/IconClipboard";
import IconStatusChange from "../icons/IconStatusChange";

type Props = {
    onTransform: () => void;
    onDelete: () => void;
    onCopyToClipboard: () => void;
};

const TextHeaderIcons = ({ onTransform, onDelete, onCopyToClipboard }: Props) => {
    const [copied, setCopied] = useState<boolean>(false);

    const onCopy = () => {
        setCopied(true);
        onCopyToClipboard();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="icons">
            <span className="icon" onClick={onTransform} title="Transform text">
                <IconStatusChange />
            </span>
            <span className="icon" onClick={onCopy} title="Copy to clipboard">
                <IconClipboard />
            </span>
            {copied && <div className="copied">Copied!</div>}
            <span className="icon" onClick={onDelete}>
                <IconX />
            </span>
        </div>
    );
};

export default TextHeaderIcons;
