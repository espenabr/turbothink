import { useState } from "react";
import IconClipboard from "../icons/IconClipboard";
import IconEye from "../icons/IconEye";
import IconFilter from "../icons/IconFilter";
import SortDescendingIcon from "../icons/IconSortDescending";
import IconSquares from "../icons/IconSquares";
import IconX from "../icons/IconX";

type Props = {
    displayActions: boolean;
    onSort: () => void;
    onHighlight: () => void;
    onFilter: () => void;
    onGroup: () => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const ListHeaderIcons = ({
    displayActions,
    onSort,
    onHighlight,
    onFilter,
    onGroup,
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
            {displayActions && (
                <>
                    <span className="icon" onClick={onSort} title="Sort">
                        <SortDescendingIcon />
                    </span>
                    <span className="icon" onClick={onHighlight} title="Highlight">
                        <IconEye />
                    </span>
                    <span className="icon" onClick={onFilter} title="Filter">
                        <IconFilter />
                    </span>
                    <span className="icon" onClick={onGroup} title="Group">
                        <IconSquares />
                    </span>
                </>
            )}
            <span className="icon" onClick={onCopy} title="Copy to clipboard">
                <IconClipboard />
            </span>
            {copied && <div className="copied">Copied!</div>}
            <span className="icon" onClick={onDelete} title="Delete">
                <IconX />
            </span>
        </div>
    );
};

export default ListHeaderIcons;
