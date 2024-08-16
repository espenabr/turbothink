import { CSSProperties, useState } from "react";
import ListItemElement, { Modification } from "./ListItemContainer";
import TangibleClient from "../tangible-gpt/TangibleClient";
import AddListItem from "./AddListItem";
import AcceptOrRejectSuggestion from "./AcceptOrRejectSuggestion";
import { withoutTrailingDot } from "../common";
import { BlockHeight, createListItemId, List, ListId, ListItem, ListItemId, OpenAiConfig } from "../model";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ClipboardItem } from "../WorkspaceContainer";
import ListHeader from "./ListHeader";

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

type SuggestedListModification = FilteredItems | SortedItems | HighlightedItems | GroupedItems;

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

const itemsClass = (blockHeight: BlockHeight) => {
    switch (blockHeight) {
        case "Unlimited":
            return "";
        case "Short":
            return "scrollable-block short-block";
        case "Medium":
            return "scrollable-block medium-block";
        case "Tall":
            return "scrollable-block tall-block";
    }
};

type Props = {
    openAiConfig: OpenAiConfig;
    list: List;
    blockHeight: BlockHeight;
    onGroup: (groups: ItemGroup[]) => void;
    onDeleteList: (listId: ListId) => void;
    onUpdateList: (updatedList: List) => void;
};

const ListElement = ({ openAiConfig, list, blockHeight, onGroup, onDeleteList, onUpdateList }: Props) => {
    const [suggestedModification, setSuggestedModification] = useState<SuggestedListModification | null>(null);
    const [waitingForInput, setWaitingForInput] = useState<Action | null>(null);

    const [loading, setLoading] = useState<boolean>(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
    );

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: list.id });

    const style: CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const onAction = async (instruction: string) => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const items = list.items;

        setLoading(true);
        if (waitingForInput === "highlight") {
            const response = await tc.expectFiltered(
                items.map((i) => i.text),
                instruction,
                undefined,
                undefined,
                openAiConfig.reasoningStrategy,
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
                undefined,
                undefined,
                openAiConfig.reasoningStrategy,
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
                undefined,
                undefined,
                openAiConfig.reasoningStrategy,
            );
            if (response.outcome === "Success") {
                const suggested: SuggestedListModification = {
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
                undefined,
                undefined,
                openAiConfig.reasoningStrategy,
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

    const onUpdateItems = (items: ListItem[]) => {
        onUpdateList({ ...list, items: items });
    };

    const onAccept = () => {
        switch (suggestedModification?.type) {
            case "filtered":
                onUpdateItems(list.items.filter((i) => suggestedModification.items.includes(i.text)));
                break;
            case "sorted":
                onUpdateItems(toSortedListItems(suggestedModification.items, list.items));
                break;
            case "grouped":
                onGroup(suggestedModification.groups);
                break;
        }
        setSuggestedModification(null);
    };

    const onDelete = () => onDeleteList(list.id);

    const onExtendList = async () => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        if (list.items.length > 0) {
            setLoading(true);
            const response = await tc.expectExtendedItems(
                list.items.map((i) => i.text),
                undefined,
                undefined,
                undefined,
                openAiConfig.reasoningStrategy,
            );
            setLoading(false);
            if (response.outcome === "Success") {
                onUpdateItems(response.value.map((i) => ({ id: createListItemId(), text: i })));
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
                onUpdateItems(updated);
            }
        }
    };

    const onRenameList = (newName: string) => {
        onUpdateList({ ...list, name: newName });
    };

    const onCopyToClipboard = async () => {
        const clipboardItem: ClipboardItem = {
            type: "List",
            list: list,
        };
        await navigator.clipboard.writeText(JSON.stringify(clipboardItem));
    };

    const onEditItemText = (itemId: ListItemId, newText: string) => {
        const found = list.items.find((i) => i.id === itemId);
        if (found !== undefined) {
            const index = list.items.indexOf(found);
            const updatedItems = list.items.slice();
            updatedItems[index] = { ...found, text: newText };
            onUpdateList({ ...list, items: updatedItems });
        }
    };

    const onAddItem = (newItemText: string) => {
        const newItem: ListItem = { id: createListItemId(), text: newItemText };
        onUpdateList({ ...list, items: list.items.concat(newItem) });
    };

    const onDeleteItem = (itemId: ListItemId) => {
        onUpdateItems(list.items.filter((i) => i.id !== itemId));
    };

    return (
        <div className="block" style={style} ref={setNodeRef} {...attributes}>
            <ListHeader
                openAiConfig={openAiConfig}
                list={list}
                loading={loading}
                waitingForInput={waitingForInput}
                listeners={listeners}
                onRenameList={onRenameList}
                onAction={onAction}
                onWaitingForInput={(action) => setWaitingForInput(action)}
                onCopyToClipboard={onCopyToClipboard}
                onDelete={onDelete}
                key={list.id}
            />

            <div className={itemsClass(blockHeight)}>
                <ul className="list">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext items={list.items} strategy={verticalListSortingStrategy}>
                            {list.items.map((item) => (
                                <ListItemElement
                                    item={item}
                                    modification={itemModification(item)}
                                    onEdit={(newText) => onEditItemText(item.id, newText)}
                                    onDelete={onDeleteItem}
                                    key={item.id}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </ul>
            </div>
            <div>
                {suggestedModification === null ? (
                    <AddListItem onAdd={(newItemText) => onAddItem(newItemText)} onExtendList={onExtendList} />
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
            </div>
        </div>
    );
};

export default ListElement;
