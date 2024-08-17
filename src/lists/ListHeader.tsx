import { List, OpenAiConfig } from "../model";
import { useEffect, useRef, useState } from "react";
import EditListName from "./EditListName";
import ListInstructionInput from "./ListInsertuctionInput";
import ListHeaderIcons from "./ListHeaderIcons";
import { Action } from "./ListElement";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import AcceptOrRejectAction from "./AcceptOrRejectAction";

type Props = {
    openAiConfig: OpenAiConfig;
    list: List;
    loading: boolean;
    waitingForInput: Action | null;
    listeners: SyntheticListenerMap | undefined;
    waitingForModificationResponse: boolean;
    onRenameList: (newName: string) => void;
    onAction: (instruction: string) => void;
    onWaitingForInput: (action: Action | null) => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;

    onReject: () => void;
    onAccept: () => void;
};

const ListHeader = ({
    openAiConfig,
    list,
    loading,
    waitingForInput,
    listeners,
    waitingForModificationResponse,
    onRenameList,
    onAction,
    onWaitingForInput,
    onCopyToClipboard,
    onDelete,

    onReject,
    onAccept,
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
                            list={list}
                            onInput={onAction}
                            action={waitingForInput}
                        />
                    ) : waitingForModificationResponse ? (
                        <AcceptOrRejectAction onReject={onReject} onAccept={onAccept} />
                    ) : (
                        <>
                            <span onClick={() => setEditNameMode(true)} style={{ cursor: "pointer" }}>
                                <strong>{list.name}</strong>
                            </span>
                            {!waitingForModificationResponse && (
                                <ListHeaderIcons
                                    displayActions={displayActions}
                                    onSort={onClickSort}
                                    onFilter={onClickFilter}
                                    onGroup={onClickGroup}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onDelete={onDelete}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ListHeader;
