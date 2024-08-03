import { CSSProperties, useState } from "react";
import ListItemElement, { Modification } from "./ListItemElement";
import InstructionInput from "../InsertuctionInput";
import TangibleClient from "../../tangible-gpt/TangibleClient";
import AddListItem from "./AddListItem";
import AcceptOrRejectSuggestion from "../AcceptOrRejectSuggestion";
import { withoutTrailingDot } from "../../common";
import { createListItemId, List, ListId, ListItem, ListItemId } from "../../model";
import SortDescendingIcon from "../../icons/IconSortDescending";
import IconEye from "../../icons/IconEye";
import IconSquares from "../../icons/IconSquares";
import IconPlaylistAdd from "../../icons/IconPlaylistAdd";
import IconX from "../../icons/IconX";
import IconArrowBack from "../../icons/IconArrowBack";
import IconFilter from "../../icons/IconFilter";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';


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
}

type GroupedItems = {
    type: "grouped";
    criteria: string;
    groups: ItemGroup[];
};

type SuggestedModification = FilteredItems | SortedItems | HighlightedItems | GroupedItems;

export type Action = "highlight" | "filter" | "sort" | "group";

const toSortedListItems = (sortedItems: string[], oldItems: ListItem[]): ListItem[] => {
    let unmatchedItems = oldItems.slice();

    return sortedItems.flatMap(si => {
        const match: ListItem | undefined = unmatchedItems.find(ui => ui.text === si);

        if (match !== undefined) {
            unmatchedItems = unmatchedItems.filter(ui => ui.id !== match.id);
            return [match];
        } else {
            return [];
        }
    });
};

type Props = {
    openAiKey: string;
    list: List,
    addItem: (listId: ListId, item: ListItem) => void;
    deleteItem: (listId: ListId, id: ListItemId) => void;
    editItem: (listId: ListId, item: ListItem) => void;
    onFilter: (listId: ListId, items: ListItem[]) => void;
    onSort: (listId: ListId, items: ListItem[]) => void;
    onGroup: (listId: ListId, groups: ItemGroup[]) => void;
    onDeleteList: (listId: ListId) => void;
    onUpdateItems: (listId: ListId, items: ListItem[]) => void;
    onEditTitle: (listId: ListId, newTitle: string) => void;
};

const ListElement = ({ openAiKey, list, addItem, deleteItem, editItem, onFilter, onSort, onGroup, onDeleteList, onUpdateItems, onEditTitle }: Props) => {
    const [suggestedModification, setSuggestedModification] = useState<SuggestedModification | null>(null);
    const [waitingForInput, setWaitingForInput] = useState<Action | null>(null);
    const [editTitleMode, setEditTitleMode] = useState<boolean>(false);
    const [editInput, setEditInput] = useState<string>(list.name);
    const [loading, setLoading] = useState<boolean>(false);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 5 } }));

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: list.id });

    const onClickHighlight = () => setWaitingForInput("highlight");
    const onClickFilter = () => setWaitingForInput("filter");
    const onClickSort = () => setWaitingForInput("sort");
    const onClickGroup = () => setWaitingForInput("group");

    const onHighlightInput = async (instruction: string) => {
        const tc = new TangibleClient(openAiKey);
        const items = list.items;

        if (waitingForInput === "highlight") {
            setLoading(true);
            const response = await tc.expectFiltered(items.map(i => i.text), instruction);
            setLoading(false);
            if (response.outcome === "Success") {
                const suggested: SuggestedModification = {
                    type: "highlighted",
                    predicate: instruction,
                    items: response.value
                };
                setSuggestedModification(suggested);
            }
        } else if (waitingForInput === "filter") {
            setLoading(true);
            const response = await tc.expectFiltered(items.map(i => i.text), instruction);
            setLoading(false);
            if (response.outcome === "Success") {
                const suggested: SuggestedModification = {
                    type: "filtered",
                    predicate: instruction,
                    items: response.value
                };
                setSuggestedModification(suggested);
            }
        } else if (waitingForInput === "sort") {
            setLoading(true);
            const response = await tc.expectSorted(items.map(i => i.text), instruction);
            setLoading(false);
            if (response.outcome === "Success") {
                const suggested: SuggestedModification = {
                    type: "sorted",
                    orderBy: instruction,
                    items: response.value
                };
                setSuggestedModification(suggested);
            }
        } else if (waitingForInput === "group") {
            setLoading(true);
            const response = await tc.expectGroups(items.map(i => i.text), undefined, instruction);
            setLoading(false);
            if (response.outcome === "Success") {
                const suggested: SuggestedModification = {
                    type: "grouped",
                    criteria: instruction,
                    groups: response.value.map(g => ({
                        name: g.name,
                        items: g.items.map(i => withoutTrailingDot(i))
                    }))
                };
                setSuggestedModification(suggested);
            }
        }
        setWaitingForInput(null);
    };
    const onReject = () => {
        if (suggestedModification !== null) {
            setSuggestedModification(null);
        }
    };
    const onAccept = () => {
        if (suggestedModification?.type === "filtered") {
            const validItems = list.items.filter(i => suggestedModification.items.includes(i.text));
            onFilter(list.id, validItems);
        } else if (suggestedModification?.type === "sorted") {
            const sortedItems = toSortedListItems(suggestedModification.items, list.items);
            onSort(list.id, sortedItems);
        } else if (suggestedModification?.type === "grouped") {
            onGroup(list.id, suggestedModification.groups);
        }
        setSuggestedModification(null);
    };
    const onDelete = () => {
        onDeleteList(list.id);
    };
    const onExtendList = async () => {
        const tc = new TangibleClient(openAiKey);

        if (list.items.length > 0) {
            setLoading(true);
            const response = await tc.expectExtendedItems(list.items.map(i => i.text));
            setLoading(false);
            if (response.outcome === "Success") {
                const items: ListItem[] = response.value.map(i => ({ id: createListItemId(), text: i }));
                onUpdateItems(list.id, items);
            }
        }
    }

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
                        return suggestedItems[index] !== undefined ? {
                            type: "reordered",
                            newText: suggestedItems[index].text
                        } : null;
                    } else {
                        return null;
                    }
                }
            } else if (suggestedModification.type === "grouped") {
                const group = suggestedModification.groups.find(g => g.items.includes(item.text));
                const colors: string[] = [
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
                if (group !== undefined) {
                    const index = suggestedModification.groups.indexOf(group);
                    return {
                        type: "grouped",
                        groupName: group.name,
                        backgroundColor: colors[index]
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

    const handleDragEnd = (event: DragEndEvent) => {
        if (event.over !== null) {
            const over = event.over;
            if (event.active.id !== event.over.id) {
                const oldIndex = list.items.findIndex(i => i.id === event.active.id);
                const newIndex = list.items.findIndex(i => i.id === over.id);
                const updated = arrayMove(list.items, oldIndex, newIndex);
                onUpdateItems(list.id, updated);
            }
        }
    };

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <ul className="list"
            style={style}
            ref={setNodeRef}
            {...attributes}
            {...listeners}>
            <li className="list-item" style={{ backgroundColor: "lightGray" }}>
                {loading ? (
                    <div className="spinner" />
                ) : editTitleMode ? (
                    <>
                        <input value={editInput}
                            onChange={e => setEditInput(e.currentTarget.value)}
                            onKeyUp={e => {
                                if (e.key === "Enter" && editInput.length > 0) {
                                    setEditTitleMode(false);
                                    onEditTitle(list.id, editInput);
                                }
                            }}
                        />
                        <span className="icon" onClick={() => setEditTitleMode(false)}><IconArrowBack /></span>
                    </>
                ) : (
                    <>
                        {waitingForInput !== null ? (
                            <InstructionInput openAiKey={openAiKey}
                                onCancel={() => setWaitingForInput(null)}
                                currentItems={list.items}
                                onInput={onHighlightInput}
                                action={waitingForInput}
                            />
                        ) : (
                            <>
                                <span onClick={() => setEditTitleMode(true)}>
                                    <strong>{list.name}</strong>
                                </span>
                                <div className="icons">
                                    <span className="icon" onClick={onClickSort}><SortDescendingIcon /></span>
                                    <span className="icon" onClick={onClickHighlight} title="Highlight"><IconEye /></span>
                                    <span className="icon" onClick={onClickFilter} title="Filter"><IconFilter /></span>
                                    <span className="icon" onClick={onClickGroup} title="Group"><IconSquares /></span>
                                    <span className="icon" onClick={onExtendList} title="Extend"><IconPlaylistAdd /></span>
                                    <span className="icon" onClick={onDelete} title="Delete"><IconX /></span>
                                </div>
                            </>
                        )}
                    </>
                )}
            </li>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}>

                <SortableContext items={list.items} strategy={verticalListSortingStrategy}>
                    {list.items.map(item => (
                        <ListItemElement item={item}
                            modification={itemModification(item)}
                            onEdit={item => editItem(list.id, item)}
                            onDelete={id => deleteItem(list.id, id)}
                            key={item.id}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <li>
                {suggestedModification === null ? (
                    <AddListItem onAdd={item => addItem(list.id, item)} />
                ) : (
                    <AcceptOrRejectSuggestion onReject={onReject}
                        onAccept={suggestedModification?.type === "filtered" || suggestedModification?.type === "sorted" || suggestedModification?.type === "grouped" ? onAccept : undefined} />
                )}
            </li>
        </ul>
    );
};

export default ListElement;