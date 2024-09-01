import { CSSProperties, useEffect, useState, useRef } from "react";
import { BlockHeight, OpenAiConfig, Text, TextAction, TextId, TextInteractionState } from "../model";
import EditTextContent from "./EditTextContent";
import TextContent from "./TextContent";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ClipboardItem } from "../model";
import TangibleClient from "../tangible-gpt/TangibleClient";
import TextHeader from "./TextHeader";
import IconCheck from "../icons/IconCheck";
import IconX from "../icons/IconX";
import { TangibleResponse } from "../tangible-gpt/model";
import { Tooltip } from "react-tooltip";
import { Message } from "../tangible-gpt/GptApiClient";

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
    const [waitingForUserInstruction, setWaitingForUserInstruction] = useState<TextAction | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [textContentInput, setTextContentInput] = useState<string>(text.content);
    const [lastResponse, setLastResponse] = useState<TangibleResponse<string> | null>(null);

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

    const onAccept = () => {
        if (transformedText !== null) {
            onUpdate({ ...text, content: transformedText.newText });
            setTransformedText(null);
        }
    };

    const onRenameText = (newName: string) => onUpdate({ ...text, name: newName });

    const onCopyToClipboard = async () => {
        const clipboardItem: ClipboardItem = {
            type: "Text",
            text: text,
        };
        await navigator.clipboard.writeText(JSON.stringify(clipboardItem));
    };

    const onInitiateTransform = () => setWaitingForUserInstruction("transform");

    /* Transform text using LLM */
    const onAction = async (instruction: string) => {
        if (waitingForUserInstruction === "transform") {
            setLoading(true);
            const transformed = await transformWithLLM(openAiConfig, text.content, instruction);
            if (transformed.outcome === "Success") {
                setTransformedText({ instruction: instruction, newText: transformed.value });
                setLastResponse(transformed);
            }
        }
        setLoading(false);
        setWaitingForUserInstruction(null);
    };

    /* If the user isn't happy, retry with adjustment instruction */
    const onRetryWithAdditionalInstruction = async (instruction: string) => {
        if (lastResponse !== null) {
            setLoading(true);
            const response = await retryTransformWithLLM(openAiConfig, instruction, lastResponse?.history);
            if (response.outcome === "Success") {
                setTransformedText({ instruction: instruction, newText: response.value });
                setLastResponse(response);
            }
        }
        setLoading(false);
    };

    const content = transformedText !== null ? transformedText.newText : text.content;

    const state = interactionState(loading, editContentMode, waitingForUserInstruction, transformedText);

    const onClickContent = () => {
        if (state.type === "Display") {
            setEditContentMode(true);
        }
    };

    return (
        <div className="block">
            <div className="text" style={style} ref={setNodeRef} {...attributes}>
                <TextHeader
                    openAiConfig={openAiConfig}
                    text={text}
                    interactionState={state}
                    listeners={listeners}
                    onAction={onAction}
                    onRename={onRenameText}
                    onCopyToClipboard={onCopyToClipboard}
                    onInitiateTransform={onInitiateTransform}
                    onDelete={() => onDelete(text.id)}
                    onCancel={() => setWaitingForUserInstruction(null)}
                    onAcceptAIModification={onAccept}
                    onRejectAIModification={() => setTransformedText(null)}
                    onRetryWithAdditionalInstruction={onRetryWithAdditionalInstruction}
                />
                <div className={textContentClass(blockHeight, editContentMode)} onClick={onClickContent}>
                    {editContentMode ? (
                        <EditTextContent
                            content={text.content}
                            textContentInput={textContentInput}
                            textAreaRef={textAreaRef}
                            setTextContentInput={setTextContentInput}
                        />
                    ) : (
                        <TextContent content={content} />
                    )}
                </div>
            </div>
            {editContentMode && (
                <div>
                    <Tooltip id="tooltip" />
                    <a onClick={() => onUpdateContent()} data-tooltip-id="tooltip" data-tooltip-content="OK">
                        <IconCheck />
                    </a>
                    <a
                        onClick={() => setEditContentMode(false)}
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Cancel"
                    >
                        <IconX />
                    </a>
                </div>
            )}
        </div>
    );
};

type TransformedText = {
    instruction: string;
    newText: string;
};

const textContentClass = (blockHeight: BlockHeight, editContentMode: boolean): string => {
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

const interactionState = (
    loading: boolean,
    editContentMode: boolean,
    waitingForUserInstruction: TextAction | null,
    transformedText: TransformedText | null,
): TextInteractionState => {
    if (loading) {
        return { type: "Loading" };
    } else if (editContentMode) {
        return { type: "EditTextContent" };
    } else if (waitingForUserInstruction !== null) {
        return { type: "WaitingForUserTextInstruction", action: waitingForUserInstruction };
    } else if (transformedText !== null) {
        return { type: "WaitingForUserAcceptance" };
    } else {
        return { type: "Display" };
    }
};

const transformTextPrompt = (text: string, instruction: string) => {
    return `Given the following text:
${text}
---end of text---

Transform it given the following instruction: ${instruction}
I only want the transformed text back, nothing else`;
};

const transformWithLLM = (
    config: OpenAiConfig,
    text: string,
    instruction: string,
): Promise<TangibleResponse<string>> => {
    const tc = new TangibleClient(config.key, config.model);
    const reasoning = config.reasoningStrategy;
    const prompt = transformTextPrompt(text, instruction);
    return tc.expectPlainText(prompt, undefined, undefined, reasoning);
};

const retryTransformWithLLM = async (
    config: OpenAiConfig,
    instruction: string,
    history: Message[],
): Promise<TangibleResponse<string>> => {
    const tc = new TangibleClient(config.key, config.model);
    const reasoning = config.reasoningStrategy;
    const prompt = `I want you to adjust the previous attempt. Please also consider: ${instruction}`;
    return tc.expectPlainText(prompt, history, undefined, reasoning);
};

export default TextElement;
