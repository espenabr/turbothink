import { memo } from "react";
import ListHeaderIcons from "./ListHeaderIcons";

type Props = {
    listName: string;
    displayIcons: boolean;
    displayActions: boolean;
    onEnableEdit: () => void;
    onInitiateSort: () => void;
    onInitiateFilter: () => void;
    onInitiateGroup: () => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const ListHeaderContent = ({
    listName,
    displayIcons,
    displayActions,
    onEnableEdit,
    onInitiateSort,
    onInitiateFilter,
    onInitiateGroup,
    onCopyToClipboard,
    onDelete,
}: Props) => (
    <>
        <span onClick={onEnableEdit} style={{ cursor: "pointer" }}>
            <strong>{listName}</strong>
        </span>
        {displayIcons && (
            <ListHeaderIcons
                displayActions={displayActions}
                onInitiateSort={onInitiateSort}
                onInitiateFilter={onInitiateFilter}
                onInitiateGroup={onInitiateGroup}
                onCopyToClipboard={onCopyToClipboard}
                onDelete={onDelete}
            />
        )}
    </>
);

const areEqual = (prev: Props, next: Props) =>
    prev.listName === next.listName &&
    prev.displayActions === next.displayActions &&
    prev.displayIcons === next.displayIcons;

export default memo(ListHeaderContent, areEqual);
