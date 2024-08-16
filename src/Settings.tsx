import { useState } from "react";
import InputOpenAiKey from "./InputOpenAiKey";
import { GptModel } from "./tangible-gpt/model";

type ModelOption = {
    value: GptModel;
    label: string;
};

export type BlockHeight = "Unlimited" | "Short" | "Medium" | "Tall";

type BlockHeightOption = {
    value: BlockHeight;
    label: string;
};

type Props = {
    openAiKey: string;
    gptModel: GptModel;
    onUpdateGptModel: (model: GptModel) => void;
    onUpdateKey: (key: string) => void;
};

const Settings = ({ openAiKey, gptModel, onUpdateKey, onUpdateGptModel }: Props) => {
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
        onUpdateGptModel(value);
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
                    <span style={{ marginLeft: "40px" }}>
                        Model:&nbsp;
                        <select value={gptModel} onChange={onChangeModel}>
                            {modelOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </span>
                    <span style={{ marginLeft: "10px", visibility: "hidden" }}>
                        Element height:&nbsp;
                        <select value={selectedBlockHeight} onChange={onChangeBlockHeight}>
                            {blockHeightOptions.map((o) => (
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
