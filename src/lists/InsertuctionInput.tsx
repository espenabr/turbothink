import { useState } from "react";
import TangibleClient from "../tangible-gpt/TangibleClient";
import { withoutPrefix } from "../common";
import { Action } from "./ListElement";
import { ListItem } from "../model";
import IconArrowBack from "../icons/IconArrowBack";
import IconRefresh from "../icons/IconRefresh";
import IconBubbleText from "../icons/IconBubbleText";


type Props = {
    openAiKey: string;
    currentItems: ListItem[];
    action: Action;
    onInput: (s: string) => void;
    onCancel: () => void;
};

const createPrompt = (action: Action, items: ListItem[]): string => {
    const itemsDescription = items.map(i => i.text).join(", ");

    switch (action) {
        case "sort":
            return `Given the following items: ${itemsDescription}

What are the 5 most obvious ways to sort these items? In ways, I mean things like "by severity", "by price", "by relevance", "by age"; etc
The intention is to get suggestions so it's easier for a person to figure out how to sort them`;
        case "highlight":
        case "filter":
            return `Given the following items: ${itemsDescription}
        
            What are the most obvious criterias for highlighting certain items? For example in a list of products, a criteria could be "very expensive"`
        case "group":
            return `Given the following items: ${items.map(i => i.text).join(", ")}

            What are the 5 most obvious ways to group these items? In ways, I mean things like "by severity", "by color", "by intention", "by age", etc
            Ideally the items should be grouped into more than two groups.
            The intention is to get suggestions so it's easier for a person to figure out a way to group them`;
    }
};

const InstructionInput = ({openAiKey, currentItems, action, onInput, onCancel}: Props) => {
    const [content, setContent] = useState<string>("");
    const [suggestedGroupings, setSuggestedGroupings] = useState<string[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const onSuggestOptions = async () => {
        const tc = new TangibleClient(openAiKey);
        const prompt = createPrompt(action, currentItems);

        setLoading(true);
        const response = await tc.expectItems(prompt);
        setLoading(false);
        if (response.outcome === "Success") {
            setSuggestedGroupings(response.value.map(withoutPrefix));
        }
    };

    const onGroupBySuggestion = (suggestion: string) => {
        onInput(suggestion);
    };

    return (
        <div>
            {loading ? (
                <div className="spinner" />
            ) : suggestedGroupings ? (
                <div>
                    <strong>Select grouping</strong>
                    &nbsp;
                    &nbsp;
                    <span style={{ cursor: "pointer", color: "#424242" }} onClick={() => {
                        setSuggestedGroupings(null);
                        onCancel();
                    }}><IconArrowBack /></span>
                    &nbsp;
                    <span style={{ cursor: "pointer" }} title="Retry" onClick={onSuggestOptions}><IconRefresh /></span>

                    <ul style={{paddingTop: "10px"}}>
                        {suggestedGroupings.map(g => (
                            <li className="suggestion" onClick={() => onGroupBySuggestion(g)}>{g}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <>
                    <input placeholder="Instruction"
                        autoFocus
                        onChange={e => setContent(e.currentTarget.value)}
                        onKeyUp={e => {
                            if (e.key === "Enter") {
                                onInput(content);
                            }
                        }}
                    />
                    &nbsp;
                    <span className="icon" onClick={() => {
                        setSuggestedGroupings(null);
                        onCancel();
                    }}><IconArrowBack /></span>
                    &nbsp;
                    <span className="icon" 
                        title="Suggest options"
                        onClick={onSuggestOptions}><IconBubbleText /></span>
                </>
            )}
        </div>
    );
};

/* Surprise me icon: 😮 */

export default InstructionInput;