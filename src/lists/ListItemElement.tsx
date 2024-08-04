import { CSSProperties, useState } from "react";
import { CSS } from '@dnd-kit/utilities';
import { ListItem, ListItemId } from "../model";
import { useSortable } from "@dnd-kit/sortable";
import EditListItem from "./EditListItem";
import ListItemContent from "./ListItemContent";


export type Highlighted = {
    type: "highlighted";
};

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

export type Modification = Highlighted | FilteredOut | Reordered | Grouped;

const itemStyle = (mod: Modification | null): CSSProperties => {
    if (mod === null) {
        return {};
    } else {
        switch (mod.type) {
            case "highlighted":
                return { backgroundColor: "#f2f7be" };
            case "filteredOut":
                return { backgroundColor: "#aaaaaa" };
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
    onEdit: (item: ListItem) => void;
    onDelete: (id: ListItemId) => void;
};

const ListItemElement = ({ item, modification, onEdit, onDelete }: Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    const style: CSSProperties = {
        ...itemStyle(modification),
        transform: CSS.Transform.toString(transform),
        transition
    };

    const onEditItem = (newText: string) => {
        setEditMode(false);
        onEdit({ id: item.id, text: newText });
    };

    return (
        <li className="list-item"
            style={style}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            title={modification?.type === "grouped" ? modification.groupName : undefined}>
            {editMode ? (
                <EditListItem text={item.text} 
                    onEdit={onEditItem} 
                    onCancel={() => setEditMode(false)} />
            ) : (
                <ListItemContent text={item.text}
                    modification={modification}
                    onEnableEdit={() => setEditMode(true)}
                    onDelete={() => onDelete(item.id)} />
            )}
        </li>
    );
};

export default ListItemElement;