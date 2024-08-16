import { List, OpenAiConfig } from "../model";
import { useEffect, useRef, useState } from "react";
import EditListName from "./EditListName";
import ListInstructionInput from "./ListInsertuctionInput";
import ListHeaderIcons from "./ListHeaderIcons";
import { Action } from "./ListElement";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

type Props = {
    openAiConfig: OpenAiConfig;
    list: List;
    loading: boolean;
    waitingForInput: Action | null;
    listeners: SyntheticListenerMap | undefined;
    onRenameList: (newName: string) => void;
    onAction: (instruction: string) => void;
    onWaitingForInput: (action: Action | null) => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const ListHeader = ({
    openAiConfig,
    list,
    loading,
    waitingForInput,
    listeners,
    onRenameList,
    onAction,
    onWaitingForInput,
    onCopyToClipboard,
    onDelete,
}: Props) => {
    const [editNameMode, setEditNameMode] = useState<boolean>(false);

    const inputNameRef = useRef<HTMLInputElement>(null);

    // highlight name input on edit
    useEffect(() => {
        if (editNameMode && inputNameRef.current) {
            inputNameRef.current.focus();
            inputNameRef.current.select();
        }
    }, [editNameMode]);

    const onClickHighlight = () => onWaitingForInput("highlight");
    const onClickFilter = () => onWaitingForInput("filter");
    const onClickSort = () => onWaitingForInput("sort");
    const onClickGroup = () => onWaitingForInput("group");

    const displayActions = list.items.length > 1;

    return (
        <div className="list-header" {...listeners}>
            {loading ? (
                <div className="spinner" />
            ) : editNameMode ? (
                <EditListName
                    listName={list.name}
                    onRename={(newName) => {
                        setEditNameMode(false);
                        onRenameList(newName);
                    }}
                    onCancel={() => setEditNameMode(false)}
                    inputRef={inputNameRef}
                />
            ) : (
                <>
                    {waitingForInput !== null ? (
                        <ListInstructionInput
                            openAiConfig={openAiConfig}
                            onCancel={() => onWaitingForInput(null)}
                            currentItems={list.items}
                            onInput={onAction}
                            action={waitingForInput}
                        />
                    ) : (
                        <>
                            <span onClick={() => setEditNameMode(true)} style={{ cursor: "pointer" }}>
                                <strong>{list.name}</strong>
                            </span>
                            <ListHeaderIcons
                                displayActions={displayActions}
                                onSort={onClickSort}
                                onHighlight={onClickHighlight}
                                onFilter={onClickFilter}
                                onGroup={onClickGroup}
                                onCopyToClipboard={onCopyToClipboard}
                                onDelete={onDelete}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ListHeader;
