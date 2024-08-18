import { CSSProperties, useEffect, useState, useRef } from "react";
import { BlockHeight, OpenAiConfig, Text, TextId } from "../model";
import EditTextContent from "./EditTextContent";
import DisplayTextContent from "./DisplayTextContent";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ClipboardItem } from "../WorkspaceContainer";
import TangibleClient from "../tangible-gpt/TangibleClient";
import AcceptOrRejectAIModification from "../lists/AcceptOrRejectAIModification";
import TextHeader from "./TextHeader";
import IconCheck from "../icons/IconCheck";
import IconX from "../icons/IconX";

type TransformedText = {
    instruction: string;
    newText: string;
};

export type Action = "transform";

const textContentClass = (blockHeight: BlockHeight, editContentMode: boolean) => {
    switch (blockHeight) {
        case "Unlimited":
        case "Medium":
            return editContentMode ? "medium-block" : "text-content scrollable-block medium-block";
        case "Short":
            return editContentMode ? "medium-block" : "text-content scrollable-block short-block";
        case "Tall":
            return editContentMode ? "medium-block" : "text-content scrollable-block tall-block";
    }
};

type Props = {
    openAiConfig: OpenAiConfig;
    text: Text;
    blockHeight: BlockHeight;
    onUpdate: (updatedText: Text) => void;
    onDelete: (textId: TextId) => void;
};

const TextElement = ({ openAiConfig, text, blockHeight, onUpdate, onDelete }: Props) => {
    const [editContentMode, setEditContentMode] = useState<boolean>(false);
    const [transformedText, setTransformedText] = useState<TransformedText | null>(null);
    const [waitingForInput, setWaitingForInput] = useState<Action | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [textContentInput, setTextContentInput] = useState<string>(text.content);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: text.id });

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // highlight name input on edit
    useEffect(() => {
        if (editContentMode && textAreaRef.current) {
            textAreaRef.current.focus();
            textAreaRef.current.select();
        }
    }, [editContentMode]);

    const style: CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const onUpdateContent = () => {
        setEditContentMode(false);
        onUpdate({ ...text, content: textContentInput });
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
            const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);

            setLoading(true);
            const response = await tc.expectPlainText(
                `Given the following text:
${text.content}
---end of text---

Transform it given the following instruction: ${instruction}
I only want the transformed text back, nothing else`,
                undefined,
                undefined,
                openAiConfig.reasoningStrategy,
            );
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
        <div className="block">
            <div className="text" style={style} ref={setNodeRef} {...attributes}>
                <TextHeader
                    openAiConfig={openAiConfig}
                    text={text}
                    loading={loading}
                    waitingForInput={waitingForInput}
                    listeners={listeners}
                    onAction={onAction}
                    onRename={onRenameText}
                    onCopyToClipboard={onCopyToClipboard}
                    onTransform={onTransform}
                    onDelete={() => onDelete(text.id)}
                    onCancel={() => setWaitingForInput(null)}
                />

                <div className={textContentClass(blockHeight, editContentMode)}>
                    {editContentMode ? (
                        <EditTextContent
                            content={text.content}
                            textContentInput={textContentInput}
                            textAreaRef={textAreaRef}
                            setTextContentInput={setTextContentInput}
                        />
                    ) : (
                        <>
                            <DisplayTextContent content={content} onEdit={onEditContent} />
                            {transformedText !== null && (
                                <AcceptOrRejectAIModification
                                    onReject={() => setTransformedText(null)}
                                    onAccept={() => {
                                        onUpdate({ ...text, content: transformedText.newText });
                                        setTransformedText(null);
                                    }}
                                    onRetryWithAdditionalInstruction={() => {
                                        
                                     }}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
            {editContentMode && (
                <div>
                    <span style={{ cursor: "pointer" }}>
                        <span onClick={() => onUpdateContent()}>
                            <IconCheck />
                        </span>
                        <span onClick={() => setEditContentMode(false)}>
                            <IconX />
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
};

export default TextElement;
