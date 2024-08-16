import { useState } from "react";
import InputOpenAiKey from "./InputOpenAiKey";

type GptModel = "gpt-4" | "gpt-4-turbo" | "gpt-4o" | "gpt-4o-mini" | "gpt-3.5" | "gpt-3.5-turbo";

type ModelOption = {
    value: GptModel;
    label: string;
};

type BlockHeight = "Unlimited" | "Short" | "Medium" | "Tall";

type BlockHeightOption = {
    value: BlockHeight;
    label: string;
};

type Props = {
    openAiKey: string;
    onUpdateKey: (key: string) => void;
};

const Settings = ({ openAiKey, onUpdateKey }: Props) => {
    const [selecteModel, setSelectedModel] = useState<GptModel>("gpt-4");
    const [selectedBlockHeight, setSelectedBlockHeight] = useState<BlockHeight>("Unlimited");

    const validKey = (s: string) => s.length === 56 && s.substring(0, 3) === "sk-";

    const modelOptions: ModelOption[] = [
        { value: "gpt-4", label: "GPT-4" },
        { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini" },
        { value: "gpt-3.5", label: "GPT-3.5" },
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    ];

    const onChangeModel = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value as GptModel;
        setSelectedModel(value);
    };

    const onChangeBlockHeight = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value as BlockHeight;
        setSelectedBlockHeight(value);
    };

    const blockHeightOptions: BlockHeightOption[] = [
        { value: "Unlimited", label: "Unlimited" },
        { value: "Short", label: "Short" },
        { value: "Medium", label: "Medium" },
        { value: "Tall", label: "Tall" },
    ];

    return (
        <div>
            {validKey(openAiKey) ? (
                <>
                    <span style={{ marginLeft: "10px" }}>
                        Element height:&nbsp;
                        <select value={selecteModel} onChange={onChangeModel}>
                            {blockHeightOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </span>
                    <span style={{ marginLeft: "40px" }}>
                        Model:&nbsp;
                        <select value={selectedBlockHeight} onChange={onChangeBlockHeight}>
                            {modelOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </span>
                </>
            ) : (
                <InputOpenAiKey currentKey={openAiKey} onInput={onUpdateKey} />
            )}
        </div>
    );
};

export default Settings;
