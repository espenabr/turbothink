import { CSSProperties, useState } from "react";
import ListItemElement, { Modification } from "./ListItemElement";
import InstructionInput from "./InsertuctionInput";
import TangibleClient from "../tangible-gpt/TangibleClient";
import AddListItem from "./AddListItem";
import AcceptOrRejectSuggestion from "./AcceptOrRejectSuggestion";
import { withoutTrailingDot } from "../common";
import { createListItemId, List, ListId, ListItem, ListItemId } from "../model";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ListHeaderIcons from "./ListHeaderIcons";
import EditListName from "./EditListName";

type FilteredItems = {
    type: "filtered";
    predicate: string;
    items: string[];
};

type SortedItems = {
    type: "sorted";
    orderBy: string;
    items: string[];
};

type HighlightedItems = {
    type: "highlighted";
    predicate: string;
    items: string[];
};

type ItemGroup = {
    name: string;
    items: string[];
};

type GroupedItems = {
    type: "grouped";
    criteria: string;
    groups: ItemGroup[];
};

type SuggestedModification = FilteredItems | SortedItems | HighlightedItems | GroupedItems;

export type Action = "highlight" | "filter" | "sort" | "group";

const groupColors: string[] = [
    "#FFCDD2",
    "#F8BBD0",
    "#E1BEE7",
    "#D1C4E9",
    "#C5CAE9",
    "#BBDEFB",
    "#B2EBF2",
    "#B2DFDB",
    "#C8E6C9",
    "#DCEDC8",
];

const toSortedListItems = (sortedItems: string[], oldItems: ListItem[]): ListItem[] => {
    let unmatchedItems = oldItems.slice();

    return sortedItems.flatMap((si) => {
        const match: ListItem | undefined = unmatchedItems.find((ui) => ui.text === si);

        if (match !== undefined) {
            unmatchedItems = unmatchedItems.filter((ui) => ui.id !== match.id);
            return [match];
        } else {
            return [];
        }
    });
};

type Props = {
    openAiKey: string;
    list: List;
    addItem: (listId: ListId, item: ListItem) => void;
    deleteItem: (listId: ListId, id: ListItemId) => void;
    editItem: (listId: ListId, item: ListItem) => void;
    onGroup: (groups: ItemGroup[]) => void;
    onDeleteList: (listId: ListId) => void;
    onUpdateItems: (listId: ListId, items: ListItem[]) => void;
    onEditTitle: (listId: ListId, newTitle: string) => void;
};

const ListElement = ({
    openAiKey,
    list,
    addItem,
    deleteItem,
    editItem,
    onGroup,
    onDeleteList,
    onUpdateItems,
    onEditTitle,
}: Props) => {
    const [suggestedModification, setSuggestedModification] = useState<SuggestedModification | null>(null);
    const [waitingForInput, setWaitingForInput] = useState<Action | null>(null);
    const [editNameMode, setEditNameMode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
    );
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: list.id });

    const onClickHighlight = () => setWaitingForInput("highlight");
    const onClickFilter = () => setWaitingForInput("filter");
    const onClickSort = () => setWaitingForInput("sort");
    const onClickGroup = () => setWaitingForInput("group");

    const onHighlightInput = async (instruction: string) => {
        const tc = new TangibleClient(openAiKey);
        const items = list.items;

        setLoading(true);
        if (waitingForInput === "highlight") {
            const response = await tc.expectFiltered(
                items.map((i) => i.text),
                instruction,
            );
            if (response.outcome === "Success") {
                setSuggestedModification({
                    type: "highlighted",
                    predicate: instruction,
                    items: response.value,
                });
            }
        } else if (waitingForInput === "filter") {
            const response = await tc.expectFiltered(
                items.map((i) => i.text),
                instruction,
            );
            if (response.outcome === "Success") {
                setSuggestedModification({
                    type: "filtered",
                    predicate: instruction,
                    items: response.value,
                });
            }
        } else if (waitingForInput === "sort") {
            const response = await tc.expectSorted(
                items.map((i) => i.text),
                instruction,
            );
            if (response.outcome === "Success") {
                const suggested: SuggestedModification = {
                    type: "sorted",
                    orderBy: instruction,
                    items: response.value,
                };
                setSuggestedModification(suggested);
            }
        } else if (waitingForInput === "group") {
            const response = await tc.expectGroups(
                items.map((i) => i.text),
                undefined,
                instruction,
            );
            if (response.outcome === "Success") {
                setSuggestedModification({
                    type: "grouped",
                    criteria: instruction,
                    groups: response.value.map((g) => ({
                        name: g.name,
                        items: g.items.map((i) => withoutTrailingDot(i)),
                    })),
                });
            }
        }
        setLoading(false);
        setWaitingForInput(null);
    };

    const onReject = () => {
        if (suggestedModification !== null) {
            setSuggestedModification(null);
        }
    };

    const onAccept = () => {
        switch (suggestedModification?.type) {
            case "filtered":
                onUpdateItems(
                    list.id,
                    list.items.filter((i) => suggestedModification.items.includes(i.text)),
                );
                break;
            case "sorted":
                onUpdateItems(list.id, toSortedListItems(suggestedModification.items, list.items));
                break;
            case "grouped":
                onGroup(suggestedModification.groups);
                break;
        }
        setSuggestedModification(null);
    };

    const onDelete = () => onDeleteList(list.id);

    const onExtendList = async () => {
        const tc = new TangibleClient(openAiKey);
        if (list.items.length > 0) {
            setLoading(true);
            const response = await tc.expectExtendedItems(list.items.map((i) => i.text));
            setLoading(false);
            if (response.outcome === "Success") {
                onUpdateItems(
                    list.id,
                    response.value.map((i) => ({ id: createListItemId(), text: i })),
                );
            }
        }
    };

    const itemModification = (item: ListItem): Modification | null => {
        if (suggestedModification !== null) {
            if (suggestedModification.type === "highlighted" && suggestedModification.items.includes(item.text)) {
                return { type: "highlighted" };
            } else if (suggestedModification.type === "filtered" && !suggestedModification.items.includes(item.text)) {
                return { type: "filteredOut" };
            } else if (suggestedModification.type === "sorted") {
                const items = list.items;
                if (items.length === suggestedModification.items.length) {
                    const suggestedItems = toSortedListItems(suggestedModification.items, items);

                    if (suggestedItems.indexOf(item) !== items.indexOf(item)) {
                        const index = items.indexOf(item);
                        return suggestedItems[index] !== undefined
                            ? {
                                  type: "reordered",
                                  newText: suggestedItems[index].text,
                              }
                            : null;
                    } else {
                        return null;
                    }
                }
            } else if (suggestedModification.type === "grouped") {
                const group = suggestedModification.groups.find((g) => g.items.includes(item.text));
                if (group !== undefined) {
                    const index = suggestedModification.groups.indexOf(group);
                    return {
                        type: "grouped",
                        groupName: group.name,
                        backgroundColor: groupColors[index],
                    };
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
        return null;
    };

    const onDragEnd = (event: DragEndEvent) => {
        if (event.over !== null) {
            const over = event.over;
            if (event.active.id !== event.over.id) {
                const oldIndex = list.items.findIndex((i) => i.id === event.active.id);
                const newIndex = list.items.findIndex((i) => i.id === over.id);
                const updated = arrayMove(list.items, oldIndex, newIndex);
                onUpdateItems(list.id, updated);
            }
        }
    };

    const onRenameList = (newName: string) => {
        setEditNameMode(false);
        onEditTitle(list.id, newName);
    };

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <ul className="list" style={style} ref={setNodeRef} {...attributes} {...listeners}>
            <li className="list-item" style={{ backgroundColor: "lightGray" }}>
                {loading ? (
                    <div className="spinner" />
                ) : editNameMode ? (
                    <EditListName
                        listName={list.name}
                        onRename={onRenameList}
                        onCancel={() => setEditNameMode(false)}
                    />
                ) : (
                    <>
                        {waitingForInput !== null ? (
                            <InstructionInput
                                openAiKey={openAiKey}
                                onCancel={() => setWaitingForInput(null)}
                                currentItems={list.items}
                                onInput={onHighlightInput}
                                action={waitingForInput}
                            />
                        ) : (
                            <>
                                <span onClick={() => setEditNameMode(true)}>
                                    <strong>{list.name}</strong>
                                </span>
                                <ListHeaderIcons
                                    onSort={onClickSort}
                                    onHighlight={onClickHighlight}
                                    onFilter={onClickFilter}
                                    onGroup={onClickGroup}
                                    onExtendList={onExtendList}
                                    onDelete={onDelete}
                                />
                            </>
                        )}
                    </>
                )}
            </li>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={list.items} strategy={verticalListSortingStrategy}>
                    {list.items.map((item) => (
                        <ListItemElement
                            item={item}
                            modification={itemModification(item)}
                            onEdit={(item) => editItem(list.id, item)}
                            onDelete={(id) => deleteItem(list.id, id)}
                            key={item.id}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <li>
                {suggestedModification === null ? (
                    <AddListItem onAdd={(item) => addItem(list.id, item)} />
                ) : (
                    <AcceptOrRejectSuggestion
                        onReject={onReject}
                        onAccept={
                            suggestedModification?.type === "filtered" ||
                            suggestedModification?.type === "sorted" ||
                            suggestedModification?.type === "grouped"
                                ? onAccept
                                : undefined
                        }
                    />
                )}
            </li>
        </ul>
    );
};

export default ListElement;
