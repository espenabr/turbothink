import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import ListItemContainer, { FilteredOut, Grouped, Modification, Reordered } from "./ListItemContainer";
import { BlockHeight, List, ListItem, ListItemId } from "../model";
import { toSortedListItems } from "./ListBlock";
import { equalArrays } from "../common";

type Props = {
    list: List;
    blockHeight: BlockHeight;
    suggestedModification: SuggestedListModification | null;
    onUpdateList: (updatedList: List) => void;
};

const ListContent = ({ list, blockHeight, suggestedModification, onUpdateList }: Props) => {
    /* Drag & drop */
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
    );
    const onDragEnd = (event: DragEndEvent) => {
        if (event.over !== null) {
            const over = event.over;
            if (event.active.id !== event.over.id) {
                const oldIndex = list.items.findIndex((i) => i.id === event.active.id);
                const newIndex = list.items.findIndex((i) => i.id === over.id);
                const updated = arrayMove(list.items, oldIndex, newIndex);
                onUpdateList({ ...list, items: updated });
            }
        }
    };

    /* Visually indicate potential suggested modification for an item in the list */
    const itemModification = (item: ListItem): Modification | null => {
        if (suggestedModification !== null) {
            switch (suggestedModification.type) {
                case "filtered":
                    return filteredOutItem(item, suggestedModification.items);
                case "sorted":
                    return reorderedItem(item, list.items, suggestedModification);
                case "grouped":
                    return groupedItem(item, suggestedModification.groups);
            }
        }
        return null; // no modification
    };

    const onEditItem = (itemId: ListItemId, newText: string) => {
        const found = list.items.find((i) => i.id === itemId);
        if (found !== undefined) {
            const index = list.items.indexOf(found);
            const updatedItems = list.items.slice();
            updatedItems[index] = { ...found, text: newText };
            onUpdateList({ ...list, items: updatedItems });
        }
    };

    const onDeleteItem = (itemId: ListItemId) => {
        onUpdateList({ ...list, items: list.items.slice().filter((i) => i.id !== itemId) });
    };

    return (
        <div className={itemsClass(blockHeight)}>
            <ul className="list">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={list.items} strategy={verticalListSortingStrategy}>
                        {list.items.map((item) => (
                            <ListItemContainer
                                item={item}
                                canModify={suggestedModification === null}
                                modification={itemModification(item)}
                                onEdit={(newText) => onEditItem(item.id, newText)}
                                onDelete={onDeleteItem}
                                key={item.id}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </ul>
        </div>
    );
};

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

type ItemGroup = {
    name: string;
    items: string[];
};

type GroupedItems = {
    type: "grouped";
    criteria: string;
    groups: ItemGroup[];
};

export type SuggestedListModification = FilteredItems | SortedItems | GroupedItems;

const groupColors: readonly string[] = [
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

const reorderedItem = (item: ListItem, currentItems: ListItem[], suggested: SortedItems): Reordered | null => {
    const suggestedItems = toSortedListItems(suggested.items, currentItems);

    if (suggestedItems.indexOf(item) !== currentItems.indexOf(item)) {
        const index = currentItems.indexOf(item);
        return suggestedItems[index] !== undefined
            ? {
                  type: "reordered",
                  newText: suggestedItems[index].text,
              }
            : null;
    } else {
        return null;
    }
};

const filteredOutItem = (item: ListItem, suggestedValidItems: string[]): FilteredOut | null =>
    !suggestedValidItems.includes(item.text) ? { type: "filteredOut" } : null;

const groupedItem = (item: ListItem, suggestedGroups: ItemGroup[]): Grouped | null => {
    const group = suggestedGroups.find((g) => g.items.includes(item.text));
    if (group !== undefined) {
        const index = suggestedGroups.indexOf(group);
        return {
            type: "grouped",
            groupName: group.name,
            backgroundColor: groupColors[index],
        };
    } else {
        return null;
    }
};

const equalListItems = (a: ListItem, b: ListItem) => a.id === b.id && a.text === b.text;

export const equalLists = (a: List, b: List) =>
    a.id === b.id &&
    a.name === b.name &&
    a.items.length === b.items.length &&
    a.items.every((v, i) => equalListItems(v, b.items[i])) &&
    a.items.length === b.items.length;

const equalItemGroups = (a: ItemGroup, b: ItemGroup) => a.name === b.name && equalArrays(a.items, b.items);

export const equalSuggestedModifications = (
    a: SuggestedListModification | null,
    b: SuggestedListModification | null,
) => {
    if (a === null && b === null) {
        return true;
    } else if (a !== null && b !== null) {
        if (a.type === "grouped" && b.type === "grouped") {
            return (
                a.criteria === b.criteria &&
                a.groups.every((g, i) => g.name === b.groups[i].name && equalItemGroups(g, b.groups[i]))
            );
        } else {
            return a.type === b.type;
        }
    }
    return false;
};

//const areEqual = (prev: Props, next: Props) =>
//    equalLists(prev.list, next.list) &&
//    equalSuggestedModifications(prev.suggestedModification, next.suggestedModification) &&
//    prev.blockHeight === next.blockHeight;

//export default memo(ListContent, areEqual);
export default ListContent;
