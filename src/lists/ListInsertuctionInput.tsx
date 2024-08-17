import { useState } from "react";
import TangibleClient from "../tangible-gpt/TangibleClient";
import { withoutPrefix } from "../common";
import { Action } from "./ListElement";
import { ListItem, OpenAiConfig } from "../model";
import IconArrowBack from "../icons/IconArrowBack";
import IconRefresh from "../icons/IconRefresh";
import IconBubbleText from "../icons/IconBubbleText";
import { Tooltip } from "react-tooltip";

type Props = {
    openAiConfig: OpenAiConfig;
    currentItems: ListItem[];
    action: Action;
    onInput: (s: string) => void;
    onCancel: () => void;
};

const createPrompt = (action: Action, items: ListItem[]): string => {
    const itemsDescription = items.map((i) => i.text).join(", ");

    switch (action) {
        case "sort":
            return `Given the following items: ${itemsDescription}

What are the 5 most obvious ways to sort these items? In ways, I mean things like "by severity", "by price", "by relevance", "by age"; etc
The intention is to get suggestions so it's easier for a person to figure out how to sort them`;
        case "highlight":
        case "filter":
            return `Given the following items: ${itemsDescription}
        
            What are the 5 most obvious criterias for highlighting certain items? For example in a list of products, a criteria could be "very expensive"`;
        case "group":
            return `Given the following items: ${items.map((i) => i.text).join(", ")}

            What are the 5 most obvious ways to group these items? In ways, I mean things like "by severity", "by color", "by intention", "by age", etc
            Ideally the items should be grouped into more than two groups.
            The intention is to get suggestions so it's easier for a person to figure out a way to group them`;
    }
};

const instructionPlaceholder = (action: Action) => {
    switch (action) {
        case "filter":
            return "Expensive items (example)";
        case "sort":
            return "Complex to simple (example)";
        case "group":
            return "By color (example)";
        case "highlight":
            return "Popular items (example)";
    }
};

const ListInstructionInput = ({ openAiConfig, currentItems, action, onInput, onCancel }: Props) => {
    const [content, setContent] = useState<string>("");
    const [suggestions, setSuggestions] = useState<string[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const onSuggestOptions = async () => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const prompt = createPrompt(action, currentItems);

        setLoading(true);
        const response = await tc.expectItems(prompt, undefined, undefined, openAiConfig.reasoningStrategy);
        setLoading(false);
        if (response.outcome === "Success") {
            setSuggestions(response.value.map(withoutPrefix));
        }
    };

    const onConfirmSuggestion = (suggestion: string) => onInput(suggestion);

    return (
        <div>
            {loading ? (
                <div className="spinner" />
            ) : suggestions ? (
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
                        {suggestions.map((g) => (
                            <li className="suggestion" onClick={() => onConfirmSuggestion(g)} key={g}>
                                {g}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <>
                    <input
                        placeholder={instructionPlaceholder(action)}
                        autoFocus
                        style={{ width: "210px" }}
                        onChange={(e) => setContent(e.currentTarget.value)}
                        onKeyUp={(e) => {
                            if (e.key === "Enter") {
                                onInput(content);
                            }
                        }}
                    />
                    <span style={{ paddingLeft: "8px", cursor: "pointer" }}>
                        <Tooltip id="tooltip" />
                        <span
                            className="icon"
                            onClick={() => {
                                setSuggestions(null);
                                onCancel();
                            }}
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Cancel"
                        >
                            <IconArrowBack />
                        </span>
                        &nbsp;
                        <span
                            className="icon"
                            onClick={onSuggestOptions}
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Suggest options"
                        >
                            <IconBubbleText />
                        </span>
                    </span>
                </>
            )}
        </div>
    );
};

export default ListInstructionInput;
