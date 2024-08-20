import { CSSProperties, useState } from "react";
import ListItemElement, { FilteredOut, Grouped, Modification, Reordered } from "./ListItemContainer";
import TangibleClient from "../tangible-gpt/TangibleClient";
import AddListItem from "./AddListItem";
import { withoutTrailingDot } from "../common";
import {
    BlockHeight,
    createListItemId,
    ListInteractionState,
    List,
    ListId,
    ListItem,
    ListItemId,
    OpenAiConfig,
    ListAction,
} from "../model";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ClipboardItem } from "../model";
import ListHeader from "./ListHeader";
import { TangibleResponse } from "../tangible-gpt/model";

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

type SuggestedListModification = FilteredItems | SortedItems | GroupedItems;

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

const toAction = (suggestedModification: SuggestedListModification): ListAction => {
    switch (suggestedModification.type) {
        case "filtered":
            return "filter";
        case "sorted":
            return "sort";
        case "grouped":
            return "group";
    }
};

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

const interactionState = (
    loading: boolean,
    waitingForUserInstruction: ListAction | null,
    suggestedModification: SuggestedListModification | null,
): ListInteractionState => {
    if (loading) {
        return { type: "Loading" };
    } else if (waitingForUserInstruction !== null) {
        return { type: "WaitingForUserListInstruction", action: waitingForUserInstruction };
    } else if (suggestedModification !== null) {
        return { type: "WaitingForUserAcceptance" };
    } else {
        return { type: "Display" };
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
    const [waitingForUserInstruction, setWaitingForUserInstruction] = useState<ListAction | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [lastResponse, setLastResponse] = useState<TangibleResponse<string[]> | TangibleResponse<ItemGroup[]> | null>(
        null,
    );

    /* Drag & drop stuff */

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

    /* Perform action based on user instruction using LLM */
    const onAction = async (instruction: string) => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const items = list.items.map((i) => i.text);
        const reasoning = openAiConfig.reasoningStrategy;

        setLoading(true);
        if (waitingForUserInstruction === "filter") {
            const response = await tc.expectFiltered(items, instruction, undefined, undefined, reasoning);
            if (response.outcome === "Success") {
                updateFilterModification(instruction, response.value);
                setLastResponse(response);
            }
        } else if (waitingForUserInstruction === "sort") {
            const response = await tc.expectSorted(items, instruction, undefined, undefined, reasoning);
            if (response.outcome === "Success") {
                updateSortModification(instruction, response.value);
                setLastResponse(response);
            }
        } else if (waitingForUserInstruction === "group") {
            const response = await tc.expectGroups(items, undefined, instruction, undefined, undefined, reasoning);
            if (response.outcome === "Success") {
                const groups = response.value.map((g) => ({
                    name: g.name,
                    items: g.items.map((i) => withoutTrailingDot(i)),
                }));
                updateGroupModification(instruction, groups);
                setLastResponse(response);
            }
        }
        setLoading(false);
        setWaitingForUserInstruction(null);
    };

    /* If the user isn't happy with the suggested modification, try again with additional adjustment */

    const onRetryWithInstruction = (instruction: string) => {
        if (suggestedModification !== null) {
            onRetryWithAdditionalInstruction(instruction, toAction(suggestedModification));
        }
    };

    const onRetryWithAdditionalInstruction = async (instruction: string, action: ListAction) => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const items = list.items.map((i) => i.text);
        const reasoning = openAiConfig.reasoningStrategy;
        const history = lastResponse?.history;
        const prompt = `I want you to adjust the previous attempt. Please also consider: ${instruction}`;

        if (action === "filter") {
            const response = await tc.expectFiltered(items, prompt, history, undefined, reasoning);
            if (response.outcome === "Success") {
                updateFilterModification(instruction, response.value);
                setLastResponse(response);
            }
        } else if (action === "sort") {
            const response = await tc.expectSorted(items, prompt, history, undefined, reasoning);
            if (response.outcome === "Success") {
                updateSortModification(instruction, response.value);
                setLastResponse(response);
            }
        } else if (action === "group") {
            const response = await tc.expectGroups(items, undefined, prompt, history, undefined, reasoning);
            if (response.outcome === "Success") {
                const groups = response.value.map((g) => ({
                    name: g.name,
                    items: g.items.map((i) => withoutTrailingDot(i)),
                }));
                updateGroupModification(instruction, groups);
                setLastResponse(response);
            }
        }
        setLoading(false);
        setWaitingForUserInstruction(null);
    };

    const onUpdateItems = (items: ListItem[]) => onUpdateList({ ...list, items: items });

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

    const onCopyToClipboard = async () => {
        const clipboardItem: ClipboardItem = {
            type: "List",
            list: list,
        };
        await navigator.clipboard.writeText(JSON.stringify(clipboardItem));
    };

    /* Direct list manipulation */

    const onRenameList = (newName: string) => onUpdateList({ ...list, name: newName });

    const onEditItem = (itemId: ListItemId, newText: string) => {
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

    const onDelete = () => onDeleteList(list.id);

    /* Extend the list with one item using LLM (based on list content) */
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

    /* Show propposed modifications for user to accept or reject */

    const updateFilterModification = (instruction: string, updatedItems: string[]) =>
        setSuggestedModification({ type: "filtered", predicate: instruction, items: updatedItems });

    const updateSortModification = (instruction: string, updatedItems: string[]) =>
        setSuggestedModification({ type: "sorted", orderBy: instruction, items: updatedItems });

    const updateGroupModification = (instruction: string, groups: ItemGroup[]) =>
        setSuggestedModification({ type: "grouped", criteria: instruction, groups: groups });

    /* Accept or reject proposed modifications */

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

    const onReject = () => setSuggestedModification(null);

    return (
        <div className="block" style={style} ref={setNodeRef} {...attributes}>
            <ListHeader
                openAiConfig={openAiConfig}
                list={list}
                interactionState={interactionState(loading, waitingForUserInstruction, suggestedModification)}
                listeners={listeners}
                onRenameList={onRenameList}
                onAction={onAction}
                onWaitForUserInstruction={(action) => setWaitingForUserInstruction(action)}
                onCopyToClipboard={onCopyToClipboard}
                onDelete={onDelete}
                onAcceptAIModification={onAccept}
                onRejectAIModification={onReject}
                onRetryWithAdditionalInstruction={onRetryWithInstruction}
                key={list.id}
            />
            <div className={itemsClass(blockHeight)}>
                <ul className="list">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext items={list.items} strategy={verticalListSortingStrategy}>
                            {list.items.map((item) => (
                                <ListItemElement
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
            <div>
                {suggestedModification === null && (
                    <AddListItem onAdd={(newItemText) => onAddItem(newItemText)} onExtendList={onExtendList} />
                )}
            </div>
        </div>
    );
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

export default ListElement;
