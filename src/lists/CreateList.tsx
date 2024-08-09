import { useState } from "react";
import TangibleClient from "../tangible-gpt/TangibleClient";
import { Block, ListId, TextId } from "../model";
import { withoutPrefix, withoutTrailingDot } from "../common";





const describeContent = (block: Block) => {
    switch (block.type) {
        case "List":
            return block.items.map((i) => i.text).join(", ");
        case "Text":
            return block.content;
    }
};

const createPrompt = (instruction: string, blocks: Block[]) => {
    if (blocks.length > 0) {
        const description = blocks
            .map((block) => `${block.name}: ${describeContent(block)}`)
            .join("\n");
        return `The following lists of items are useful information:
${description}

Based on this information:
${instruction}`;
    } else {
        return instruction;
    }
};

type Props = {
    openAiKey: string;
    blocks: Block[];
    onCreateList: (name: string, items: string[]) => void;
    onCreateText: (name: string) => void;
};

const CreateList = ({ openAiKey, blocks, onCreateList, onCreateText }: Props) => {
    const [instruction, setInstruction] = useState<string>("");

    const [selectedBlocks, setSelectedBlocks] = useState<(TextId | ListId)[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const onCreateListInput = async (instruction: string) => {
        const tc = new TangibleClient(openAiKey);
        const prompt = createPrompt(
            instruction,
            blocks.filter((b) => selectedBlocks.includes(b.id)),
        );
        setLoading(true);
        const response = await tc.expectItems(prompt);
        setLoading(false);
        if (response.outcome === "Success") {
            onCreateList(
                instruction,
                response.value.map((i) => withoutPrefix(i)).map((i) => withoutTrailingDot(i)),
            );
        }
    };

    const checkboxValue = (id: ListId | TextId) => (selectedBlocks.includes(id) ? "checked" : undefined);

    const onClickCheckbox = (id: ListId | TextId) => {
        if (selectedBlocks.includes(id)) {
            const updatedBlocks = selectedBlocks.slice().filter(b => b !== id);
            setSelectedBlocks(updatedBlocks);
        } else {
            setSelectedBlocks(selectedBlocks.concat(id));
        }

    };

    const onGenerateList = () => {
        if (instruction.length > 0) {
            onCreateListInput(instruction);
            setInstruction("");
        }
    };

    return (
        <div className="createList">
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
                            Create empty list
                        </button>
                        <button className="list-button" style={{ marginLeft: "10px" }} onClick={() => onCreateText("Draft text")}>
                            Create text
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
                        <input value={instruction}
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
                        <button style={{ width: "150px" }}
                            disabled={instruction.length <= 0}
                            onClick={() => onGenerateList()}
                        >
                            Generate list
                        </button>
                    </div>

                    <div style={{ paddingLeft: "20px", paddingBottom: "20px" }}>
                        {blocks.length > 0 && (
                            <div style={{ paddingBottom: "5px", fontWeight: "bold" }}>Context (optional)</div>
                        )}
                        {blocks.map((block) => (
                            <div>
                                <label>
                                    <input type="checkbox"
                                        style={{ paddingRight: "10px" }}
                                        name={block.name}
                                        key={block.id}
                                        value={checkboxValue(block.id)}
                                        onClick={() => onClickCheckbox(block.id)} />
                                    {block.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CreateList;
