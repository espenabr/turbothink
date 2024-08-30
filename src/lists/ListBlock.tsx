import { CSSProperties, memo, useState } from "react";
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
    OpenAiConfig,
    ListAction,
} from "../model";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ClipboardItem } from "../model";
import ListHeader from "./ListHeader";
import { ItemGroup, TangibleResponse } from "../tangible-gpt/model";
import ListContent, { equalLists, SuggestedListModification } from "./ListContent";

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

    /* Drag & drop */

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: list.id });
    const style: CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const onUpdateItems = (items: ListItem[]) => {
        onUpdateList({ ...list, items: items });
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

    const onRetryWithAdditionalInstruction = async (instruction: string, action: ListAction) => {
        const tc = new TangibleClient(openAiConfig.key, openAiConfig.model);
        const items = list.items.map((i) => i.text);
        const reasoning = openAiConfig.reasoningStrategy;
        const history = lastResponse?.history;
        const prompt = `I want you to adjust the previous attempt. Please also consider: ${instruction}`;

        setLoading(true);
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

    const onRetryWithInstruction = (instruction: string) => {
        if (suggestedModification !== null) {
            onRetryWithAdditionalInstruction(instruction, toAction(suggestedModification));
        }
    };

    const onCopyToClipboard = async () => {
        const clipboardItem: ClipboardItem = {
            type: "List",
            list: list,
        };
        await navigator.clipboard.writeText(JSON.stringify(clipboardItem));
    };

    /* Direct manipulation */

    const onRenameList = (newName: string) => onUpdateList({ ...list, name: newName });

    const onAddItem = (newItemText: string) => {
        const newItem: ListItem = { id: createListItemId(), text: newItemText };
        onUpdateList({ ...list, items: list.items.concat(newItem) });
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
            <ListContent
                list={list}
                blockHeight={blockHeight}
                onUpdateList={onUpdateList}
                suggestedModification={suggestedModification}
            />
            <div>
                {suggestedModification === null && (
                    <AddListItem onAdd={(newItemText) => onAddItem(newItemText)} onExtendList={onExtendList} />
                )}
            </div>
        </div>
    );
};

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

export const toSortedListItems = (sortedItems: string[], oldItems: ListItem[]): ListItem[] => {
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

const equalOpenAiConfig = (a: OpenAiConfig, b: OpenAiConfig) =>
    a.key === b.key && a.model === b.model && a.reasoningStrategy === b.reasoningStrategy;

const areEqual = (prev: Props, next: Props) =>
    equalOpenAiConfig(prev.openAiConfig, next.openAiConfig) &&
    equalLists(prev.list, next.list) &&
    prev.blockHeight === next.blockHeight;

export default memo(ListElement, areEqual);
