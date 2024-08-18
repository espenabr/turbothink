import { useState } from "react";
import IconClipboard from "../icons/IconClipboard";
import IconFilter from "../icons/IconFilter";
import SortDescendingIcon from "../icons/IconSortDescending";
import IconSquares from "../icons/IconSquares";
import IconX from "../icons/IconX";
import { Tooltip } from "react-tooltip";

type Props = {
    displayActions: boolean;
    onInitiateSort: () => void;
    onInitiateFilter: () => void;
    onInitiateGroup: () => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const ListHeaderIcons = ({
    displayActions,
    onInitiateSort,
    onInitiateFilter,
    onInitiateGroup,
    onCopyToClipboard,
    onDelete,
}: Props) => {
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
                    <a className="icon" onClick={onInitiateSort} data-tooltip-id="tooltip" data-tooltip-content="Sort">
                        <SortDescendingIcon />
                    </a>
                    <a
                        className="icon"
                        onClick={onInitiateFilter}
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Filter"
                    >
                        <IconFilter />
                    </a>
                    <a
                        className="icon"
                        onClick={onInitiateGroup}
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Group"
                    >
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
