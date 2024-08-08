import CreateList from "./lists/CreateList";
import ListElement from "./lists/ListElement";
import { createListId, createListItemId, List, ListId, ListItem, ListItemId, Workspace, WorkspaceId, Block } from "./model";
import { ItemGroup } from "./tangible-gpt/model";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";

type ClipboardList = {
    type: "List";
    list: List;
};

type ClipboardText = {
    type: "Text";
    content: string;
};

type ClipboardWorkspace = {
    type: "Workspace";
    workspace: Workspace;
};

export type ClipboardItem = ClipboardList | ClipboardText | ClipboardWorkspace;

type Props = {
    openAiKey: string;
    workspace: Workspace;
    onUpdateBlocks: (workspaceId: WorkspaceId, items: Block[]) => void;
};

const WorkspaceContainer = ({ openAiKey, workspace: workspace, onUpdateBlocks: onUpdateBlocks }: Props) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
    );

    const workspaceId = workspace.id;
    const blocks = workspace.blocks;

    
    const onUpdateListItems = (listId: ListId, items: ListItem[]) => {
        const index = workspace.blocks.findIndex((l) => l.id === listId);
        if (index >= 0) {

            // finne lista
            const list = workspace.blocks[index];

            if (list.type === "List") {
                const updatedBlocks = workspace.blocks.slice();
                updatedBlocks[index] = {
                    type: "List",
                    id: list.id,
                    name: list.name,
                    items: items
                };
                onUpdateBlocks(workspaceId, updatedBlocks);
            }
        }
    };

    const listItems = (listId: ListId) => {
        const lists: List[] = blocks.filter(b => b.type === "List");
        return lists.find(b => b.id === listId)?.items;
    };

    const onAddItem = (listId: ListId, item: ListItem) => {
        const items = listItems(listId);
        if (items !== undefined) {
            onUpdateListItems(listId, items.slice().concat(item));
        }
    };

    const onDeleteItem = (listId: ListId, id: ListItemId) => {
        const items = listItems(listId);
        if (items !== undefined) {
            onUpdateListItems(
                listId,
                items.slice().filter((i) => i.id !== id),
            );
        }
    };

    const editItem = (listId: ListId, item: ListItem) => {
        const items = listItems(listId);
        if (items !== undefined) {
            onUpdateListItems(
                listId,
                items.slice().map((i) => (i.id === item.id ? { id: i.id, text: item.text } : i)),
            );
        }
    };

    const onGroup = (groups: ItemGroup[]) => {
        const newLists: List[] = groups.map((g) => ({
            type: "List",
            id: createListId(),
            name: g.name,
            items: g.items.map((i) => ({ id: createListItemId(), text: i })),
        }));
        onUpdateBlocks(workspaceId, blocks.slice().concat(newLists));
    };

    const onEditTitle = (listId: ListId, newTitle: string) => {
        const list = blocks.find((l) => l.id === listId);
        if (list !== undefined && list.type === "List") {
            const updatedList: List = {
                type: "List",
                id: list.id,
                name: newTitle,
                items: list.items,
            };
            const index = blocks.indexOf(list);
            const updatedLists = blocks.slice();
            updatedLists[index] = updatedList;
            onUpdateBlocks(workspaceId, updatedLists);
        }
    };

    const onCreateList = (name: string, items: string[]) => {
        const listItems: ListItem[] = items.map((i) => ({
            id: createListItemId(),
            text: i,
        }));
        const updatedLists: Block[] = blocks.slice().concat({
            type: "List",
            id: createListId(),
            name: name,
            items: listItems,
        });
        onUpdateBlocks(workspaceId, updatedLists);
    };

    const onDeleteList = (listId: ListId) => {
        const updatedLists = blocks.slice().filter((l) => l.id !== listId);
        onUpdateBlocks(workspaceId, updatedLists);
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
                    {blocks.map((block) => block.type === "List" ? (
                        <div className="grid-item" key={block.id}>
                            <ListElement
                                openAiKey={openAiKey}
                                list={block}
                                addItem={onAddItem}
                                deleteItem={onDeleteItem}
                                editItem={editItem}
                                onGroup={onGroup}
                                onDeleteList={onDeleteList}
                                onUpdateItems={onUpdateListItems}
                                onEditTitle={onEditTitle}
                                key={block.id}
                            />
                        </div>
                    ) : (
                        <div>text block</div>
                    ))}
                </SortableContext>
            </DndContext>

            <CreateList openAiKey={openAiKey} blocks={blocks} onCreateList={onCreateList} />
        </div>
    );
};

export default WorkspaceContainer;
