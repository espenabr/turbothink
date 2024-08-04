import { CSSProperties, KeyboardEvent, useState } from "react";
import { CSS } from '@dnd-kit/utilities';
import { ListItem, ListItemId } from "../model";
import IconX from "../icons/IconX";
import IconArrowBack from "../icons/IconArrowBack";
import { useSortable } from "@dnd-kit/sortable";


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

const textStyle = (mod: Modification | null): CSSProperties => {
    if (mod !== null && mod.type === "reordered") {
        return { color: "lightGray", textDecoration: "line-through" }
    } else {
        return {};
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
    const [editInput, setEditInput] = useState<string>(item.text);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    const style: CSSProperties = {
        ...itemStyle(modification),
        transform: CSS.Transform.toString(transform),
        transition
    };

    const onEditItem = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && editInput.length > 0) {
            setEditMode(false);
            onEdit({ id: item.id, text: editInput });
        }
    };

    return (
        <li className="list-item"
            style={style}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            title={modification?.type === "grouped" ? modification.groupName : undefined}>
            {editMode ? (
                <>
                    <input value={editInput}
                        onChange={e => setEditInput(e.currentTarget.value)}
                        onKeyUp={onEditItem} />
                    &nbsp;
                    <span style={{ cursor: "pointer", color: "green" }} onClick={() => setEditMode(false)}><IconArrowBack /></span>
                </>
            ) : (
                <>
                    {modification?.type === "reordered" && (
                        <span style={{ paddingRight: "10px" }}>{modification.newText}</span>
                    )}
                    <span onClick={() => setEditMode(true)}
                        style={textStyle(modification)}>{item.text}</span>
                    <div className="icons" style={{backgroundColor: "white"}}>
                        <span className="icon"
                            onClick={() => onDelete(item.id)}
                            title="Delete"><IconX /></span>
                    </div>
                </>
            )}
        </li>
    );
};

export default ListItemElement;