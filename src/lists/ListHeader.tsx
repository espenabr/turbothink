import { List, OpenAiConfig } from "../model";
import { useEffect, useRef, useState } from "react";
import EditListName from "./EditListName";
import ListInstructionInput from "./ListInsertuctionInput";
import ListHeaderIcons from "./ListHeaderIcons";
import { Action } from "./ListElement";

type Props = {
    openAiConfig: OpenAiConfig;
    list: List;
    loading: boolean;
    waitingForInput: Action | null;
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

    return (
        <div className="list-header">
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
