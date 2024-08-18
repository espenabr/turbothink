import { CSSProperties, useEffect, useRef, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { ListItem, ListItemId } from "../model";
import { useSortable } from "@dnd-kit/sortable";
import EditListItem from "./EditListItem";
import ListItemContent from "./ListItemContent";

export type FilteredOut = {
    type: "filteredOut";
};

export type Reordered = {
    type: "reordered";
    newText: string;
};

export type Grouped = {
    type: "grouped";
    groupName: string;
    backgroundColor: string;
};

export type Modification = FilteredOut | Reordered | Grouped;

const itemStyle = (mod: Modification | null): CSSProperties => {
    if (mod === null) {
        return {};
    } else {
        switch (mod.type) {
            case "filteredOut":
                return { textDecoration: "line-through", opacity: "30%", borderBottom: "1px solid #888" };
            case "reordered":
                return {};
            case "grouped":
                return { backgroundColor: mod.backgroundColor };
        }
    }
};

type Props = {
    item: ListItem;
    modification: Modification | null;
    canModify: boolean;
    onEdit: (newText: string) => void;
    onDelete: (id: ListItemId) => void;
};

const ListItemElement = ({ item, modification, canModify, onEdit, onDelete }: Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const inputRef = useRef<HTMLInputElement>(null);

    // highlight input on edit
    useEffect(() => {
        if (editMode && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editMode]);

    const style: CSSProperties = {
        ...itemStyle(modification),
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const onEditItem = (newText: string) => {
        setEditMode(false);
        onEdit(newText);
    };

    const myListeners = !canModify ? undefined : listeners;

    return (
        <li
            className="list-item"
            style={style}
            ref={setNodeRef}
            {...attributes}
            {...myListeners}
            title={modification?.type === "grouped" ? modification.groupName : undefined}
        >
            {editMode ? (
                <EditListItem
                    name={item.text}
                    onEdit={onEditItem}
                    onCancel={() => setEditMode(false)}
                    inputRef={inputRef}
                />
            ) : (
                <ListItemContent
                    text={item.text}
                    modification={modification}
                    canDelete={canModify}
                    onEnableEdit={() => (canModify ? setEditMode(true) : {})}
                    onDelete={() => onDelete(item.id)}
                />
            )}
        </li>
    );
};

export default ListItemElement;
