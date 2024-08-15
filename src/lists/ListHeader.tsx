import { List } from "../model";
import { useEffect, useRef, useState } from "react";
import EditListName from "./EditListName";
import ListInstructionInput from "./ListInsertuctionInput";
import ListHeaderIcons from "./ListHeaderIcons";
import { Action } from "./ListElement";

type Props = {
    openAiKey: string;
    list: List;
    loading: boolean;
    onRenameList: (newName: string) => void;
    onAction: (instruction: string) => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
};

const ListHeader = ({ openAiKey, list, loading, onRenameList, onAction, onCopyToClipboard, onDelete }: Props) => {
    const [editNameMode, setEditNameMode] = useState<boolean>(false);
    const [waitingForInput, setWaitingForInput] = useState<Action | null>(null);

    const inputNameRef = useRef<HTMLInputElement>(null);

    // highlight name input on edit
    useEffect(() => {
        if (editNameMode && inputNameRef.current) {
            inputNameRef.current.focus();
            inputNameRef.current.select();
        }
    }, [editNameMode]);

    const onClickHighlight = () => setWaitingForInput("highlight");
    const onClickFilter = () => setWaitingForInput("filter");
    const onClickSort = () => setWaitingForInput("sort");
    const onClickGroup = () => setWaitingForInput("group");

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
                            openAiKey={openAiKey}
                            onCancel={() => setWaitingForInput(null)}
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
