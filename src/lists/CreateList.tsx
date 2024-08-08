import { useState } from "react";
import TangibleClient from "../tangible-gpt/TangibleClient";
import { withoutPrefix, withoutTrailingDot } from "../common";
import { Block, List, ListId, TextId } from "../model";





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

${instruction}`;
    } else {
        return instruction;
    }
};

type Props = {
    openAiKey: string;
    blocks: Block[];
    onCreateList: (title: string, items: string[]) => void;
};

const CreateList = ({ openAiKey, blocks, onCreateList }: Props) => {
    const [instruction, setInstruction] = useState<string>("");
    const [selectedLists, setSelectedLists] = useState<Set<ListId | TextId>>(new Set<ListId>());
    const [loading, setLoading] = useState<boolean>(false);

    const onInput = async (instruction: string) => {
        const tc = new TangibleClient(openAiKey);
        const prompt = createPrompt(
            instruction,
            blocks.filter((l) => selectedLists.has(l.id)),
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

    const checkboxValue = (id: ListId | TextId) => (selectedLists.has(id) ? "checked" : undefined);

    const onClickCheckbox = (id: ListId | TextId) => {
        if (selectedLists.has(id)) {
            const updatedLists = new Set(selectedLists);
            updatedLists.delete(id);
            setSelectedLists(updatedLists);
        } else {
            setSelectedLists(selectedLists.add(id));
        }
    };

    const onGenerateList = () => {
        if (instruction.length > 0) {
            onInput(instruction);
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
                                    onInput(instruction);
                                    setInstruction("");
                                }
                            }}
                            placeholder="What do you want?"
                        />
                        <br />
                        <button
                            style={{ width: "150px" }}
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
