import { useState } from "react";
import TangibleClient from "../tangible-gpt/TangibleClient";
import IconArrowBack from "../icons/IconArrowBack";
import IconRefresh from "../icons/IconRefresh";
import IconBubbleText from "../icons/IconBubbleText";
import { OpenAiConfig } from "../model";
import { Tooltip } from "react-tooltip";

type Props = {
    openAiConfig: OpenAiConfig;
    currentContent: string;
    onInput: (s: string) => void;
    onCancel: () => void;
};

const TextInstructionInput = ({ openAiConfig, currentContent, onInput, onCancel }: Props) => {
    const [instruction, setInstruction] = useState<string>("");
    const [suggestions, setSuggestions] = useState<string[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const onSuggestOptions = async () => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const prompt = `Given the following text:
${currentContent}

Suggest 5 different ways that this text can be transformed (no language translation suggestions please)`;
        setLoading(true);
        const response = await tc.expectItems(prompt, undefined, undefined, openAiConfig.reasoningStrategy);
        setLoading(false);
        if (response.outcome === "Success") {
            setSuggestions(response.value);
        }
    };

    const onConfirmSuggestion = (suggestion: string) => onInput(suggestion);

    return (
        <div>
            {loading ? (
                <div className="spinner" />
            ) : suggestions !== null ? (
                <div>
                    <strong>Select suggestion</strong>
                    &nbsp; &nbsp;
                    <span
                        style={{ cursor: "pointer", color: "#424242" }}
                        onClick={() => {
                            setSuggestions(null);
                            onCancel();
                        }}
                    >
                        <IconArrowBack />
                    </span>
                    &nbsp;
                    <span style={{ cursor: "pointer" }} title="Retry" onClick={onSuggestOptions}>
                        <IconRefresh />
                    </span>
                    <ul style={{ paddingTop: "10px" }}>
                        {suggestions.map((suggestion) => (
                            <li className="suggestion" onClick={() => onConfirmSuggestion(suggestion)}>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <>
                    <input
                        placeholder="Translate to Spanish (example)"
                        autoFocus
                        style={{ width: "210px" }}
                        onChange={(e) => setInstruction(e.currentTarget.value)}
                        onKeyUp={(e) => {
                            if (e.key === "Enter") {
                                onInput(instruction);
                            }
                        }}
                    />
                    <span style={{ paddingLeft: "8px", cursor: "pointer" }}>
                        <Tooltip id="tooltip" />
                        <a
                            className="icon"
                            onClick={() => {
                                setSuggestions(null);
                                onCancel();
                            }}
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Cancel"
                        >
                            <IconArrowBack />
                        </a>
                        &nbsp;
                        <a className="icon"
                          onClick={onSuggestOptions}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Suggest options">
                            <IconBubbleText />
                        </a>
                    </span>
                </>
            )}
        </div>
    );
};

export default TextInstructionInput;
