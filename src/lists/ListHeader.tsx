import { ListInteractionState, List, OpenAiConfig, ListAction } from "../model";
import { useEffect, useRef, useState } from "react";
import EditListName from "./EditListName";
import ListInstructionInput from "./ListInsertuctionInput";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import AcceptOrRejectAIModification from "./AcceptOrRejectAIModification";
import ListHeaderContent from "./ListHeaderContent";

type Props = {
    openAiConfig: OpenAiConfig;
    list: List;
    interactionState: ListInteractionState;
    listeners: SyntheticListenerMap | undefined;
    onRenameList: (newName: string) => void;
    onAction: (instruction: string) => void;
    onWaitForUserInstruction: (action: ListAction | null) => void;
    onCopyToClipboard: () => void;
    onDelete: () => void;
    onRejectAIModification: () => void;
    onAcceptAIModification: () => void;
    onRetryWithAdditionalInstruction: (instruction: string) => void;
};

const ListHeader = ({
    openAiConfig,
    list,
    interactionState,
    listeners,
    onRenameList,
    onAction,
    onWaitForUserInstruction,
    onCopyToClipboard,
    onDelete,
    onRejectAIModification,
    onAcceptAIModification,
    onRetryWithAdditionalInstruction,
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

    const onInitiateFilter = () => onWaitForUserInstruction("filter");
    const onInitiateSort = () => onWaitForUserInstruction("sort");
    const onInitiateGroup = () => onWaitForUserInstruction("group");

    const displayActions = list.items.length > 1;
    const displayIcons = interactionState.type !== "WaitingForUserAcceptance";

    return (
        <div className="list-header" {...listeners}>
            {interactionState.type === "Loading" ? (
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
                    {interactionState.type === "WaitingForUserListInstruction" ? (
                        <ListInstructionInput
                            openAiConfig={openAiConfig}
                            onCancel={() => onWaitForUserInstruction(null)}
                            list={list}
                            onInput={onAction}
                            action={interactionState.action}
                        />
                    ) : interactionState.type === "WaitingForUserAcceptance" ? (
                        <AcceptOrRejectAIModification
                            onReject={onRejectAIModification}
                            onAccept={onAcceptAIModification}
                            onRetryWithAdditionalInstruction={onRetryWithAdditionalInstruction}
                        />
                    ) : (
                        <ListHeaderContent
                            listName={list.name}
                            displayIcons={displayIcons}
                            displayActions={displayActions}
                            onInitiateSort={onInitiateSort}
                            onInitiateFilter={onInitiateFilter}
                            onInitiateGroup={onInitiateGroup}
                            onCopyToClipboard={onCopyToClipboard}
                            onDelete={onDelete}
                            onEnableEdit={() => setEditNameMode(true)}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default ListHeader;
