import { useState } from "react";
import TangibleClient from "./tangible-gpt/TangibleClient";
import { Block, BlockId, createTableId, List, ListId, OpenAiConfig, Table, TableId, Text, TextId } from "./model";
import { withoutPrefix, withoutTrailingDot } from "./common";
import SpecifyColumns from "./tables/SpecifyColumns";
import { Column } from "./tangible-gpt/model";

const describeList = (list: List) => `${list.name}:\n` + list.items.map((i) => i.text).join(", ");

const describeText = (text: Text) => `${text.name}:\n` + text.content;

const describeTable = (table: Table) => {
    const header = table.columns.map((c) => c.name).join(";");
    const rows = table.rows.map((r) => r.cells.map((c) => c.value).join(";")).join("\n");

    return `Table named ${table.name} with header and rows:
${header}
${rows}`;
};

const describeLists = (lists: List[]) =>
    "The following lists of items are useful information:\n" + lists.map(describeList).join("\n") + "\n";

const describeTexts = (texts: Text[]) =>
    "The following is useful information:\n" + texts.map(describeText).join("\n") + "\n";

const describeTables = (tables: Table[]) =>
    "The following tables are useful information:\n" + tables.map(describeTable).join("\n") + "\n";

const createContextPrompt = (instruction: string, blocks: Block[]) => {
    if (blocks.length > 0) {
        const lists = blocks.filter((b) => b.type === "List");
        const texts = blocks.filter((b) => b.type === "Text");
        const tables = blocks.filter((b) => b.type === "Table");

        const listsDescription =
            lists.length > 0
                ? `
${describeLists(lists)}

${instruction}`
                : "";

        const textsDescription =
            texts.length > 0
                ? `
${describeTexts(texts)}

${instruction}`
                : "";

        const tablesDescription =
            tables.length > 0
                ? `
${describeTables(tables)}
        
${instruction}`
                : "";

        return listsDescription + textsDescription + tablesDescription;
    } else {
        return instruction;
    }
};

type Props = {
    openAiConfig: OpenAiConfig;
    blocks: Block[];
    onCreateList: (name: string, items: string[]) => void;
    onCreateText: (name: string, content: string) => void;
    onCreateTable: (table: Table) => void;
};

const CreateBlock = ({ openAiConfig, blocks, onCreateList, onCreateText, onCreateTable }: Props) => {
    const [instruction, setInstruction] = useState<string>("");
    const [specifyTableColumns, setSpecifyTableColumns] = useState<boolean>(false);

    const [selectedBlocks, setSelectedBlocks] = useState<(TextId | ListId | TableId)[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const onCreateListInput = async (instruction: string) => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const prompt = createContextPrompt(
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
        const prompt = createContextPrompt(
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

    const onGenerateTable = async (instruction: string, columns: Column[]) => {
        const reasoning = openAiConfig.reasoningStrategy;
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const prompt = createContextPrompt(
            instruction,
            blocks.filter((b) => selectedBlocks.includes(b.id)),
        );
        setLoading(true);
        const response = await tc.expectTable(prompt, columns, undefined, undefined, reasoning);
        if (response.outcome === "Success") {
            onCreateTable({
                type: "Table",
                id: createTableId(),
                name: instruction,
                columns: response.value.columns,
                rows: response.value.rows,
            });
        }
        setSpecifyTableColumns(false);
        setInstruction("");
        setLoading(false);
    };

    const checkboxValue = (id: BlockId) => (selectedBlocks.includes(id) ? "checked" : undefined);

    const onClickCheckbox = (id: BlockId) => {
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

    return specifyTableColumns ? (
        <SpecifyColumns
            instruction={instruction}
            loading={loading}
            onGenerateTable={(columns) => onGenerateTable(instruction, columns)}
            onCancel={() => setSpecifyTableColumns(false)}
        />
    ) : (
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
                        <button className="list-button" onClick={() => onCreateList("My list", [])}>
                            New list
                        </button>
                        <button
                            className="list-button"
                            style={{ marginLeft: "10px" }}
                            onClick={() => onCreateText("My text snippet", "")}
                        >
                            New text
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
                            style={{ width: "200px" }}
                            onChange={(e) => setInstruction(e.currentTarget.value)}
                            onKeyUp={(e) => {
                                if (e.key === "Enter" && instruction.length > 0) {
                                    onCreateListInput(instruction);
                                    setInstruction("");
                                }
                            }}
                            placeholder="Describe what to generate"
                        />
                        <br />

                        <button
                            style={{ width: "50px" }}
                            disabled={instruction.length <= 0}
                            onClick={() => onGenerateList()}
                        >
                            List
                        </button>
                        <button
                            style={{ width: "50px", marginLeft: "10px" }}
                            disabled={instruction.length <= 0}
                            onClick={() => onGenerateText()}
                        >
                            Text
                        </button>
                        <button
                            style={{ width: "50px", marginLeft: "10px" }}
                            disabled={instruction.length <= 0}
                            onClick={() => setSpecifyTableColumns(true)}
                        >
                            Table
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
