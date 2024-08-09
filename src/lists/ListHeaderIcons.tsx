import { useState } from "react";
import IconClipboard from "../icons/IconClipboard";
import IconEye from "../icons/IconEye";
import IconFilter from "../icons/IconFilter";
import SortDescendingIcon from "../icons/IconSortDescending";
import IconSquares from "../icons/IconSquares";
import IconX from "../icons/IconX";


type Props = {
    onSort: () => void;
    onHighlight: () => void;
    onFilter: () => void;
    onGroup: () => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const ListHeaderIcons = ({ onSort: onClickSort, onHighlight: onClickHighlight, onFilter: onClickFilter, onGroup: onClickGroup, onCopyToClipboard, onDelete }: Props) => {
    const [copied, setCopied] = useState<boolean>(false);

    const onCopy = () => {
        setCopied(true);
        onCopyToClipboard();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="icons">
            <span className="icon" onClick={onClickSort} title="Sort"><SortDescendingIcon /></span>
            <span className="icon" onClick={onClickHighlight} title="Highlight"><IconEye /></span>
            <span className="icon" onClick={onClickFilter} title="Filter"><IconFilter /></span>
            <span className="icon" onClick={onClickGroup} title="Group"><IconSquares /></span>
            <span className="icon" onClick={onCopy} title="Copy to clipboard"><IconClipboard /></span>
            {copied && (
                <div className="copied">
                    Copied!
                </div>
            )}
            <span className="icon" onClick={onDelete} title="Delete"><IconX /></span>
        </div>
    );
};

export default ListHeaderIcons;