import { useState, KeyboardEvent, ClipboardEvent } from "react";
import { pasteToInput, validKey } from "../common";

type Props = {
    currentKey: string;
    onInput: (key: string) => void;
};

const InputOpenAiKey = ({ currentKey, onInput }: Props) => {
    const [keyInput, setKeyInput] = useState<string>(currentKey);

    // This is quite ugly, but I wasn't able to override paste with default behaviour :-(
    const onPaste = (event: ClipboardEvent) => pasteToInput(event, keyInput, setKeyInput);

    const onInputKey = () => {
        if (validKey(keyInput)) {
            onInput(keyInput);
        }
    };

    const onEdit = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            onInputKey();
        }
    };

    return (
        <div>
            <div style={{ paddingBottom: "20px" }}>
                Your OpenAI key and all your data is only stored locally in your browser and not shared with anyone!
            </div>

            <input
                value={keyInput}
                onKeyUp={onEdit}
                onChange={(e) => setKeyInput(e.currentTarget.value)}
                placeholder="OpenAI key"
                onPaste={onPaste}
            />
            <button onClick={onInputKey}>OK</button>
            {keyInput.length > 0 && !validKey(keyInput) && <span style={{ color: "red" }}>Invalid key!</span>}
        </div>
    );
};

export default InputOpenAiKey;
