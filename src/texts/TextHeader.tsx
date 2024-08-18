import { useRef, useState } from "react";
import { OpenAiConfig, Text, TextInteractionState } from "../model";
import TextHeaderContent from "./TextHeaderContent";
import TextInstructionInput from "./TextInstructionInput";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import AcceptOrRejectAIModification from "../lists/AcceptOrRejectAIModification";

type Props = {
    openAiConfig: OpenAiConfig;
    text: Text;
    interactionState: TextInteractionState;
    listeners: SyntheticListenerMap | undefined;
    onAction: (instruction: string) => void;
    onRename: (newName: string) => void;
    onCopyToClipboard: () => void;
    onTransform: () => void;
    onDelete: () => void;
    onCancel: () => void;
    onAcceptAIModification: () => void;
    onRejectAIModification: () => void;
    onRetryWithAdditionalInstruction: (instruction: string) => void;
};

const TextHeader = ({
    openAiConfig,
    text,
    interactionState,
    listeners,
    onAction,
    onRename,
    onCopyToClipboard,
    onTransform,
    onDelete,
    onCancel,
    onAcceptAIModification,
    onRejectAIModification,
    onRetryWithAdditionalInstruction,
}: Props) => {
    const [editNameMode, setEditNameMode] = useState<boolean>(false);
    const inputNameRef = useRef<HTMLInputElement>(null);

    return (
        <div className="text-header" {...listeners}>
            {interactionState.type === "Loading" ? (
                <div className="spinner" />
            ) : interactionState.type === "WaitingForUserTextInstruction" ? (
                <TextInstructionInput
                    openAiConfig={openAiConfig}
                    currentContent={text.content}
                    onInput={(instruction) => onAction(instruction)}
                    onCancel={onCancel}
                />
            ) : interactionState.type === "WaitingForUserAcceptance" ? (
                <AcceptOrRejectAIModification
                    onAccept={onAcceptAIModification}
                    onReject={onRejectAIModification}
                    onRetryWithAdditionalInstruction={onRetryWithAdditionalInstruction}
                />
            ) : (
                <TextHeaderContent
                    name={text.name}
                    displayActions={interactionState.type === "Display"}
                    inputNameRef={inputNameRef}
                    editContentMode={editNameMode}
                    onUpdateName={(name) => onRename(name)}
                    onTransform={onTransform}
                    onDelete={onDelete}
                    onCopyToClipboard={onCopyToClipboard}
                    setEditNameMode={setEditNameMode}
                />
            )}
        </div>
    );
};

export default TextHeader;
