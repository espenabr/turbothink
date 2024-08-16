import InputOpenAiKey from "./InputOpenAiKey";
import { GptModel, ReasoningStrategy } from "./tangible-gpt/model";
import { BlockHeight } from "./model";
import IconBrandGithub from "./icons/IconBrandGithub";

type ModelOption = {
    value: GptModel;
    label: string;
};

type BlockHeightOption = {
    value: BlockHeight;
    label: string;
};

type ReasoningStrategyOption = {
    value: ReasoningStrategy;
    label: string;
};

type Props = {
    openAiKey: string;
    gptModel: GptModel;
    blockHeight: BlockHeight;
    reasoningStrategy: ReasoningStrategy;
    onUpdateBlockHeight: (blockHeight: BlockHeight) => void;
    onUpdateGptModel: (model: GptModel) => void;
    onUpdateReasoningStrategy: (strategy: ReasoningStrategy) => void;
    onUpdateKey: (key: string) => void;
};

const Settings = ({
    openAiKey,
    gptModel,
    blockHeight,
    reasoningStrategy,
    onUpdateKey,
    onUpdateGptModel,
    onUpdateReasoningStrategy,
    onUpdateBlockHeight,
}: Props) => {
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
        onUpdateBlockHeight(value);
    };

    const blockHeightOptions: BlockHeightOption[] = [
        { value: "Unlimited", label: "Unlimited" },
        { value: "Short", label: "Short" },
        { value: "Medium", label: "Medium" },
        { value: "Tall", label: "Tall" },
    ];

    const reasoningStrategyOptions: ReasoningStrategyOption[] = [
        { value: "Simple", label: "Default" },
        { value: "ThinkStepByStep", label: "Think step by step" },
        { value: "SuggestMultipleAndPickOne", label: "Suggest multiple pick one" },
    ];

    const onChangeReasoningStrategy = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value as ReasoningStrategy;
        onUpdateReasoningStrategy(value);
    };

    const onOpenGithubRepo = () => window.open("https://github.com/espenabr/turbothink", "_blank");

    return (
        <div>
            {validKey(openAiKey) ? (
                <>
                    <span className="settings-element">
                        Model:&nbsp;
                        <select value={gptModel} onChange={onChangeModel}>
                            {modelOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </span>
                    <span className="settings-element">
                        Element height:&nbsp;
                        <select value={blockHeight} onChange={onChangeBlockHeight}>
                            {blockHeightOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </span>

                    <span className="settings-element">
                        Reasoning strategy:&nbsp;
                        <select value={reasoningStrategy} onChange={onChangeReasoningStrategy}>
                            {reasoningStrategyOptions.map((o) => (
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
            <span className="settings-element github-reference" onClick={onOpenGithubRepo}>
                <IconBrandGithub />
                <span style={{ marginLeft: "5px" }}>Github</span>
            </span>
        </div>
    );
};

export default Settings;
