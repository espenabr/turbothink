import CreateBlock from "./CreateBlock";
import ListElement from "./lists/ListElement";
import {
    createListId,
    createListItemId,
    List,
    ListId,
    ListItem,
    Workspace,
    WorkspaceId,
    Block,
    Text,
    createTextId,
    TextId,
    OpenAiConfig,
    BlockHeight,
} from "./model";
import { ItemGroup } from "./tangible-gpt/model";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import TextElement from "./texts/TextElement";

type ClipboardList = {
    type: "List";
    list: List;
};

type ClipboardText = {
    type: "Text";
    text: Text;
};

type ClipboardWorkspace = {
    type: "Workspace";
    workspace: Workspace;
};

export type ClipboardItem = ClipboardList | ClipboardText | ClipboardWorkspace;

type Props = {
    openAiConfig: OpenAiConfig;
    workspace: Workspace;
    blockHeight: BlockHeight;
    onUpdateBlocks: (workspaceId: WorkspaceId, items: Block[]) => void;
};

const WorkspaceContainer = ({ openAiConfig, workspace, blockHeight, onUpdateBlocks }: Props) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
    );

    const workspaceId = workspace.id;
    const blocks = workspace.blocks;

    const onGroup = (groups: ItemGroup[], afterListId: ListId) => {
        const newLists: List[] = groups.map((g) => ({
            type: "List",
            id: createListId(),
            name: g.name,
            items: g.items.map((i) => ({ id: createListItemId(), text: i })),
        }));

        const index = blocks.findIndex((b) => b.id === afterListId);
        const updatedBlocks = [...blocks.slice(0, index + 1), ...newLists, ...blocks.slice(index + 1)];

        onUpdateBlocks(workspace.id, updatedBlocks);
    };

    const onUpdateList = (updatedList: List) => {
        const found = blocks.find((l) => l.id === updatedList.id);
        if (found !== undefined && found.type === "List") {
            const index = blocks.indexOf(found);
            const updatedBlocks = blocks.slice();
            updatedBlocks[index] = updatedList;
            onUpdateBlocks(workspaceId, updatedBlocks);
        }
    };

    const onCreateList = (name: string, items: string[]) => {
        const listItems: ListItem[] = items.map((i) => ({
            id: createListItemId(),
            text: i,
        }));
        const updatedBlocks: Block[] = blocks.slice().concat({
            type: "List",
            id: createListId(),
            name: name,
            items: listItems,
        });
        onUpdateBlocks(workspaceId, updatedBlocks);
    };

    const onCreateText = (name: string, content: string) => {
        const text: Text = {
            type: "Text",
            id: createTextId(),
            name: name,
            content: content,
        };
        onUpdateBlocks(workspaceId, blocks.slice().concat(text));
    };

    const onUpdateText = (text: Text) => {
        const found = blocks.find((b) => b.id === text.id);
        if (found !== undefined && found.type === "Text") {
            const updatedText: Text = {
                type: "Text",
                id: found.id,
                name: text.name,
                content: text.content,
            };
            const index = blocks.indexOf(found);
            const updatedBlocks = blocks.slice();
            updatedBlocks[index] = updatedText;
            onUpdateBlocks(workspaceId, updatedBlocks);
        }
    };

    const onDeleteBlock = (id: ListId | TextId) => {
        const updatedBlocks = blocks.slice().filter((b) => b.id !== id);
        onUpdateBlocks(workspaceId, updatedBlocks);
    };

    const onDragEnd = (event: DragEndEvent) => {
        if (event.over !== null) {
            const over = event.over;
            if (event.active.id !== event.over.id) {
                const oldIndex = blocks.findIndex((l) => l.id === event.active.id);
                const newIndex = blocks.findIndex((l) => l.id === over.id);
                const updated = arrayMove(blocks, oldIndex, newIndex);
                onUpdateBlocks(workspaceId, updated);
            }
        }
    };

    return (
        <div className="grid-container">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={blocks} strategy={rectSortingStrategy}>
                    {blocks.map((block) =>
                        block.type === "List" ? (
                            <div className="grid-item" key={block.id}>
                                <ListElement
                                    openAiConfig={openAiConfig}
                                    list={block}
                                    blockHeight={blockHeight}
                                    onGroup={(groups) => onGroup(groups, block.id)}
                                    onDeleteList={onDeleteBlock}
                                    onUpdateList={onUpdateList}
                                    key={block.id}
                                />
                            </div>
                        ) : (
                            <div className="grid-item" key={block.id}>
                                <TextElement
                                    openAiConfig={openAiConfig}
                                    text={block}
                                    blockHeight={blockHeight}
                                    onUpdate={onUpdateText}
                                    onDelete={onDeleteBlock}
                                    key={block.id}
                                />
                            </div>
                        ),
                    )}
                </SortableContext>
            </DndContext>

            <CreateBlock
                openAiConfig={openAiConfig}
                blocks={blocks}
                onCreateList={onCreateList}
                onCreateText={onCreateText}
            />
        </div>
    );
};

export default WorkspaceContainer;
