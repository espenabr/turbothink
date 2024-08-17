import { useState } from "react";
import IconClipboard from "../icons/IconClipboard";
import IconFilter from "../icons/IconFilter";
import SortDescendingIcon from "../icons/IconSortDescending";
import IconSquares from "../icons/IconSquares";
import IconX from "../icons/IconX";
import { Tooltip } from "react-tooltip";

type Props = {
    displayActions: boolean;
    onSort: () => void;
    onFilter: () => void;
    onGroup: () => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const ListHeaderIcons = ({ displayActions, onSort, onFilter, onGroup, onCopyToClipboard, onDelete }: Props) => {
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
                    <a className="icon" onClick={onSort} data-tooltip-id="tooltip" data-tooltip-content="Sort">
                        <SortDescendingIcon />
                    </a>
                    <a className="icon" onClick={onFilter} data-tooltip-id="tooltip" data-tooltip-content="Filter">
                        <IconFilter />
                    </a>
                    <a className="icon" onClick={onGroup} data-tooltip-id="tooltip" data-tooltip-content="Group">
                        <IconSquares />
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

export default ListHeaderIcons;
