import { CSSProperties, useState } from "react";
import { Text, TextId } from "../model";
import EditTextContent from "./EditTextContent";
import DisplayTextContent from "./DisplayTextContent";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ClipboardItem } from "../WorkspaceContainer";
import TangibleClient from "../tangible-gpt/TangibleClient";
import AcceptOrRejectSuggestion from "../lists/AcceptOrRejectSuggestion";
import TextHeader from "./TextHeader";

type TransformedText = {
    instruction: string;
    newText: string;
};

export type Action = "transform";

type Props = {
    openAiKey: string;
    text: Text;
    onUpdate: (updatedText: Text) => void;
    onDelete: (textId: TextId) => void;
};

const TextElement = ({ openAiKey, text, onUpdate, onDelete }: Props) => {
    const [editContentMode, setEditContentMode] = useState<boolean>(false);
    const [transformedText, setTransformedText] = useState<TransformedText | null>(null);
    const [waitingForInput, setWaitingForInput] = useState<Action | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: text.id });

    const style: CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const onUpdateContent = (content: string) => {
        setEditContentMode(false);
        onUpdate({ ...text, content: content });
    };

    const onRenameText = (newName: string) => onUpdate({ ...text, name: newName });

    const onCopyToClipboard = async () => {
        const clipboardItem: ClipboardItem = {
            type: "Text",
            text: text,
        };
        await navigator.clipboard.writeText(JSON.stringify(clipboardItem));
    };

    const onTransform = () => setWaitingForInput("transform");

    const onAction = async (instruction: string) => {
        console.log(waitingForInput);

        if (waitingForInput === "transform") {
            const tc = new TangibleClient(openAiKey);

            setLoading(true);
            const response = await tc.expectPlainText(`Given the following text:
${text.content}
---end of text---

Transform it given the following instruction: ${instruction}
I only want the transformed text back, nothing else`);
            if (response.outcome === "Success") {
                setTransformedText({ instruction: instruction, newText: response.value });
            }
        }
        setLoading(false);
    };

    const content = transformedText !== null ? transformedText.newText : text.content;

    const onEditContent = () => {
        if (transformedText === null) {
            setEditContentMode(true);
        }
    };

    return (
        <div className="text" style={style} ref={setNodeRef} {...attributes} {...listeners}>
            <TextHeader
                openAiKey={openAiKey}
                text={text}
                loading={loading}
                waitingForInput={waitingForInput}
                onAction={onAction}
                onRename={onRenameText}
                onCopyToClipboard={onCopyToClipboard}
                onTransform={onTransform}
                onDelete={() => onDelete(text.id)}
                onCancel={() => setWaitingForInput(null)}
            />

            <div className="text-content">
                {editContentMode ? (
                    <EditTextContent
                        content={text.content}
                        onUpdate={onUpdateContent}
                        onCancel={() => setEditContentMode(false)}
                    />
                ) : (
                    <>
                        <DisplayTextContent content={content} onEdit={onEditContent} />
                        {transformedText !== null && (
                            <AcceptOrRejectSuggestion
                                onReject={() => setTransformedText(null)}
                                onAccept={() => {
                                    onUpdate({ ...text, content: transformedText.newText });
                                    setTransformedText(null);
                                }}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TextElement;
