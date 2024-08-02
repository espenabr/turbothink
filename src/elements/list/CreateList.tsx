import { useState } from "react";
import TangibleClient from "../../tangible-gpt/TangibleClient";
import { withoutPrefix, withoutTrailingDot } from "../../common";
import { List, ListId } from "../../model";


const createPrompt = (instruction: string, lists: List[]) => {
    if (lists.length > 0) {
        const listsDescription = lists.map(list => `${list.name}: ${list.items.map(i => i.text).join(", ")}`).join("\n");
        return `The following lists of items are useful information:
${listsDescription}

${instruction}`;
    } else {
        return instruction;
    }
};

type Props = {
    openAiKey: string;
    lists: List[];
    onCreateList: (title: string, items: string[]) => void;
};

const CreateList = ({ openAiKey, lists, onCreateList }: Props) => {
    const [instruction, setInstruction] = useState<string>("");
    const [selectedLists, setSelectedLists] = useState<Set<ListId>>(new Set<ListId>());
    const [loading, setLoading] = useState<boolean>(false);

    const onInput = async (instruction: string) => {
        const tc = new TangibleClient(openAiKey);
        const prompt = createPrompt(instruction, lists.filter(l => selectedLists.has(l.id)));

        setLoading(true);
        const response = await tc.expectItems(prompt);
        setLoading(false);
        if (response.outcome === "Success") {
            onCreateList(instruction, response.value.map(i => withoutPrefix(i)).map(i => withoutTrailingDot(i)));
        }
    };

    const checkboxValue = (listId: ListId) => selectedLists.has(listId) ? "checked" : undefined;
    const onClickCheckbox = (listId: ListId) => {
        if (selectedLists.has(listId)) {
            const updatedLists = new Set(selectedLists);
            updatedLists.delete(listId);
            setSelectedLists(updatedLists);
        } else {
            setSelectedLists(selectedLists.add(listId));
        }
    };

    return (
        <div className="createList">
            {loading ? (
                <div style={{ marginTop: "100px", marginBottom: "100px", marginLeft: "130px" }} className="spinner" />
            ) : (
                <>
                    <div style={{ textAlign: "center", paddingTop: "20px", paddingBottom: "10px" }}>
                        <button style={{ width: "150px" }} onClick={() => onCreateList("Draft list", [])}>Create empty list</button>
                    </div>

                    <hr style={{ border: "none", borderTop: "1px dotted #000" }}/>

                    <div style={{ textAlign: "center", paddingTop: "20px", paddingBottom: "20px" }}>
                        <input value={instruction}
                            style={{ width: "220px" }}
                                onChange={e => setInstruction(e.currentTarget.value)}
                                onKeyUp={e => {
                                    if (e.key === "Enter" && instruction.length > 0) {
                                        onInput(instruction);
                                        setInstruction("");
                                    }
                                }}
                                placeholder="What do you want?"
                            />
                        <br/>
                        <button style={{ width: "150px" }}
                            disabled={instruction.length <= 0}
                            onClick={() => {
                                if (instruction.length > 0) {
                                    onInput(instruction);
                                    setInstruction("");
                                }
                        }}>Generate list</button>
                    </div>

                    <div style={{ paddingLeft: "20px", paddingBottom: "20px" }}>
                        {lists.length > 0 && (
                            <div style={{ paddingBottom: "5px", fontWeight: "bold" }}>Context (optional)</div>
                        )}
                        {lists.map(list => (
                            <div>
                                <label>
                                    <input type="checkbox"
                                        name={list.name}
                                        key={list.id}
                                        value={checkboxValue(list.id)}
                                        onClick={() => onClickCheckbox(list.id)}
                                    />
                                    &nbsp;&nbsp;{list.name}
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