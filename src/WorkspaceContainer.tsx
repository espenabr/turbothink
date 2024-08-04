import CreateList from "./lists/CreateList";
import ListElement from "./lists/ListElement";
import { createListId, createListItemId, List, ListId, ListItem, ListItemId, WorkspaceId } from "./model";
import { ItemGroup } from "./tangible-gpt/model";
import { ActiveWorkspace } from "./RootPage";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";

type Props = {
    openAiKey: string;
    activeWorkspace: ActiveWorkspace;
    onUpdateLists: (workspaceId: WorkspaceId, lists: List[]) => void;
};

const WorkspaceContainer = ({ openAiKey, activeWorkspace, onUpdateLists }: Props) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
    );

    const workspaceId = activeWorkspace.workspaceId;
    const lists = activeWorkspace.lists;

    const onUpdateItems = (listId: ListId, items: ListItem[]) => {
        const index = lists.findIndex((l) => l.id === listId);
        if (index >= 0) {
            const updatedLists = lists.slice();
            updatedLists[index] = {
                id: lists[index].id,
                name: lists[index].name,
                items: items,
            };
            onUpdateLists(workspaceId, updatedLists);
        }
    };

    const listItems = (listId: ListId) => lists.find((l) => l.id === listId)?.items;

    const onAddItem = (listId: ListId, item: ListItem) => {
        const items = listItems(listId);
        if (items !== undefined) {
            onUpdateItems(listId, items.slice().concat(item));
        }
    };

    const onDeleteItem = (listId: ListId, id: ListItemId) => {
        const items = listItems(listId);
        if (items !== undefined) {
            onUpdateItems(
                listId,
                items.slice().filter((i) => i.id !== id),
            );
        }
    };

    const editItem = (listId: ListId, item: ListItem) => {
        const items = listItems(listId);
        if (items !== undefined) {
            onUpdateItems(
                listId,
                items.slice().map((i) => (i.id === item.id ? { id: i.id, text: item.text } : i)),
            );
        }
    };

    const onGroup = (groups: ItemGroup[]) => {
        const newLists: List[] = groups.map((g) => ({
            id: createListId(),
            name: g.name,
            items: g.items.map((i) => ({ id: createListItemId(), text: i })),
        }));
        onUpdateLists(workspaceId, lists.slice().concat(newLists));
    };

    const onEditTitle = (listId: ListId, newTitle: string) => {
        const list = lists.find((l) => l.id === listId);
        if (list !== undefined) {
            const updatedList: List = {
                id: list.id,
                name: newTitle,
                items: list.items,
            };
            const index = lists.indexOf(list);
            const updatedLists = lists.slice();
            updatedLists[index] = updatedList;
            onUpdateLists(workspaceId, updatedLists);
        }
    };

    const onCreateList = (name: string, items: string[]) => {
        const listItems: ListItem[] = items.map((i) => ({
            id: createListItemId(),
            text: i,
        }));
        const updatedLists = lists.slice().concat({
            id: createListId(),
            name: name,
            items: listItems,
        });
        onUpdateLists(workspaceId, updatedLists);
    };

    const onDeleteList = (listId: ListId) => {
        const updatedLists = lists.slice().filter((l) => l.id !== listId);
        onUpdateLists(workspaceId, updatedLists);
    };

    const onDragEnd = (event: DragEndEvent) => {
        if (event.over !== null) {
            const over = event.over;
            if (event.active.id !== event.over.id) {
                const oldIndex = lists.findIndex((l) => l.id === event.active.id);
                const newIndex = lists.findIndex((l) => l.id === over.id);
                const updated = arrayMove(lists, oldIndex, newIndex);
                onUpdateLists(workspaceId, updated);
            }
        }
    };

    return (
        <div className="grid-container">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={lists} strategy={rectSortingStrategy}>
                    {lists.map((list) => (
                        <div className="grid-item" key={list.id}>
                            <ListElement
                                openAiKey={openAiKey}
                                list={list}
                                addItem={onAddItem}
                                deleteItem={onDeleteItem}
                                editItem={editItem}
                                onGroup={onGroup}
                                onDeleteList={onDeleteList}
                                onUpdateItems={onUpdateItems}
                                onEditTitle={onEditTitle}
                                key={list.id}
                            />
                        </div>
                    ))}
                </SortableContext>
            </DndContext>

            <CreateList openAiKey={openAiKey} lists={lists} onCreateList={onCreateList} />
        </div>
    );
};

export default WorkspaceContainer;
