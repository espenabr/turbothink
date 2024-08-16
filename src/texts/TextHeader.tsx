import { useRef } from "react";
import { OpenAiConfig, Text } from "../model";
import TextHeaderContent from "./TextHeaderContent";
import TextInstructionInput from "./TextInstructionInput";
import { Action } from "./TextElement";

type Props = {
    openAiConfig: OpenAiConfig;
    text: Text;
    loading: boolean;
    waitingForInput: Action | null;
    onAction: (instruction: string) => void;
    onRename: (newName: string) => void;
    onCopyToClipboard: () => void;
    onTransform: () => void;
    onDelete: () => void;
    onCancel: () => void;
};

const TextHeader = ({
    openAiConfig,
    text,
    loading,
    waitingForInput,
    onAction,
    onRename,
    onCopyToClipboard,
    onTransform,
    onDelete,
    onCancel,
}: Props) => {
    const inputNameRef = useRef<HTMLInputElement>(null);

    return (
        <div className="text-header">
            {loading ? (
                <div className="spinner" />
            ) : waitingForInput ? (
                <TextInstructionInput
                    openAiConfig={openAiConfig}
                    currentContent={text.content}
                    onInput={(instruction) => onAction(instruction)}
                    onCancel={onCancel}
                />
            ) : (
                <TextHeaderContent
                    name={text.name}
                    inputNameRef={inputNameRef}
                    onUpdateName={(name) => onRename(name)}
                    onTransform={onTransform}
                    onDelete={onDelete}
                    onCopyToClipboard={onCopyToClipboard}
                />
            )}
        </div>
    );
};

export default TextHeader;
