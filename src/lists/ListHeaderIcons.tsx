import IconEye from "../icons/IconEye";
import IconFilter from "../icons/IconFilter";
import IconPlaylistAdd from "../icons/IconPlaylistAdd";
import SortDescendingIcon from "../icons/IconSortDescending";
import IconSquares from "../icons/IconSquares";
import IconX from "../icons/IconX";


type Props = {
    onSort: () => void;
    onHighlight: () => void;
    onFilter: () => void;
    onGroup: () => void;
    onExtendList: () => void;
    onDelete: () => void;
};

const ListHeaderIcons = ({ onSort: onClickSort, onHighlight: onClickHighlight, onFilter: onClickFilter, onGroup: onClickGroup, onExtendList, onDelete }: Props) => (
    <div className="icons">
        <span className="icon" onClick={onClickSort}><SortDescendingIcon /></span>
        <span className="icon" onClick={onClickHighlight} title="Highlight"><IconEye /></span>
        <span className="icon" onClick={onClickFilter} title="Filter"><IconFilter /></span>
        <span className="icon" onClick={onClickGroup} title="Group"><IconSquares /></span>
        <span className="icon" onClick={onExtendList} title="Extend"><IconPlaylistAdd /></span>
        <span className="icon" onClick={onDelete} title="Delete"><IconX /></span>
    </div> 
);

export default ListHeaderIcons;