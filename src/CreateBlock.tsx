import { useState } from "react";
import TangibleClient from "./tangible-gpt/TangibleClient";
import { Block, List, ListId, OpenAiConfig, Text, TextId } from "./model";
import { withoutPrefix, withoutTrailingDot } from "./common";

const describeContent = (block: Block) => {
    switch (block.type) {
        case "List":
            return `${block.name}:\n` + block.items.map((i) => i.text).join(", ");
        case "Text":
            return `${block.name}:\n` + block.content;
    }
};

const describeLists = (lists: List[]) =>
    "The following lists of items are useful information:\n" + lists.map(describeContent).join("\n") + "\n";

const describeTexts = (texts: Text[]) =>
    "The following is fulful information:\n" + texts.map(describeContent).join("\n") + "\n";

const createPrompt = (instruction: string, blocks: Block[]) => {
    if (blocks.length > 0) {
        const lists = blocks.filter((b) => b.type === "List");
        const texts = blocks.filter((b) => b.type === "Text");

        if (lists.length > 0 && texts.length > 0) {
            return `${describeLists(lists)}
${describeTexts(texts)}

${instruction}`;
        } else if (lists.length > 0) {
            return `${describeLists(lists)}

${instruction}`;
        } else if (texts.length > 0) {
            return `${describeTexts(texts)}

${instruction}`;
        } else {
            return instruction;
        }
    } else {
        return instruction;
    }
};

type Props = {
    openAiConfig: OpenAiConfig;
    blocks: Block[];
    onCreateList: (name: string, items: string[]) => void;
    onCreateText: (name: string, content: string) => void;
};

const CreateBlock = ({ openAiConfig, blocks, onCreateList, onCreateText }: Props) => {
    const [instruction, setInstruction] = useState<string>("");

    const [selectedBlocks, setSelectedBlocks] = useState<(TextId | ListId)[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const onCreateListInput = async (instruction: string) => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const prompt = createPrompt(
            instruction,
            blocks.filter((b) => selectedBlocks.includes(b.id)),
        );
        setLoading(true);
        const response = await tc.expectItems(prompt, undefined, undefined, openAiConfig.reasoningStrategy);
        setLoading(false);
        if (response.outcome === "Success") {
            onCreateList(
                instruction,
                response.value.map((i) => withoutPrefix(i)).map((i) => withoutTrailingDot(i)),
            );
        }
    };

    const onCreateTextInput = async (instruction: string) => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const prompt = createPrompt(
            instruction,
            blocks.filter((b) => selectedBlocks.includes(b.id)),
        );
        setLoading(true);
        const response = await tc.expectPlainText(prompt);
        setLoading(false);
        if (response.outcome === "Success") {
            onCreateText(instruction, response.value);
        }
    };

    const checkboxValue = (id: ListId | TextId) => (selectedBlocks.includes(id) ? "checked" : undefined);

    const onClickCheckbox = (id: ListId | TextId) => {
        if (selectedBlocks.includes(id)) {
            const updatedBlocks = selectedBlocks.slice().filter((b) => b !== id);
            setSelectedBlocks(updatedBlocks);
        } else {
            setSelectedBlocks(selectedBlocks.concat(id));
        }
    };

    const onGenerateList = () => {
        onCreateListInput(instruction);
        setInstruction("");
    };

    const onGenerateText = () => {
        onCreateTextInput(instruction);
        setInstruction("");
    };

    const allowIncludeContext = blocks.length > 0;

    return (
        <div className="create-list">
            {loading ? (
                <div
                    style={{
                        marginTop: "100px",
                        marginBottom: "100px",
                        marginLeft: "130px",
                    }}
                    className="spinner"
                />
            ) : (
                <>
                    <div
                        style={{
                            textAlign: "center",
                            paddingTop: "20px",
                            paddingBottom: "10px",
                        }}
                    >
                        <button className="list-button" onClick={() => onCreateList("Draft list", [])}>
                            Empty list
                        </button>
                        <button
                            className="list-button"
                            style={{ marginLeft: "10px" }}
                            onClick={() => onCreateText("Draft text", "")}
                        >
                            Empty text
                        </button>
                    </div>

                    <hr style={{ border: "none", borderTop: "1px dotted #000" }} />

                    <div
                        style={{
                            textAlign: "center",
                            paddingTop: "20px",
                            paddingBottom: "20px",
                        }}
                    >
                        <input
                            value={instruction}
                            className="instruction-input"
                            onChange={(e) => setInstruction(e.currentTarget.value)}
                            onKeyUp={(e) => {
                                if (e.key === "Enter" && instruction.length > 0) {
                                    onCreateListInput(instruction);
                                    setInstruction("");
                                }
                            }}
                            placeholder="What do you want?"
                        />
                        <br />
                        <button
                            style={{ width: "100px" }}
                            disabled={instruction.length <= 0}
                            onClick={() => onGenerateList()}
                        >
                            Generate list
                        </button>
                        <button
                            style={{ width: "100px", marginLeft: "10px" }}
                            disabled={instruction.length <= 0}
                            onClick={() => onGenerateText()}
                        >
                            Generate text
                        </button>
                    </div>

                    {allowIncludeContext && (
                        <div style={{ paddingLeft: "20px", paddingBottom: "20px" }}>
                            {blocks.length > 0 && (
                                <div style={{ paddingBottom: "5px", fontWeight: "bold" }}>Based on...</div>
                            )}
                            {blocks.map((block) => (
                                <div key={block.id}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            style={{ paddingRight: "10px" }}
                                            name={block.name}
                                            value={checkboxValue(block.id)}
                                            onClick={() => onClickCheckbox(block.id)}
                                        />
                                        {block.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CreateBlock;
