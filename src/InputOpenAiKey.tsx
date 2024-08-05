import { useState, KeyboardEvent } from "react";

type Props = {
    currentKey: string;
    onInput: (key: string) => void;
};

const InputOpenAiKey = ({ currentKey, onInput }: Props) => {
    const [keyInput, setKeyInput] = useState<string>(currentKey);

    const validKey = (s: string) => s.length === 56 && s.substring(0, 3) === "sk-";

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
            <div>Enter your OpenAI key</div>
            <input value={keyInput} onKeyUp={onEdit} onChange={(e) => setKeyInput(e.currentTarget.value)} />
            <button onClick={onInputKey}>OK</button>
            {keyInput.length > 0 && !validKey(keyInput) && <span style={{ color: "red" }}>Invalid key!</span>}
        </div>
    );
};

export default InputOpenAiKey;
