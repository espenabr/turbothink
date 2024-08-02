import { closestCenter, DndContext, DragEndEvent, PointerSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSSProperties, useState } from "react";
import { CSS } from '@dnd-kit/utilities';


export type Item = {
    id: UniqueIdentifier;
    text: string;
};

type Props = {
    listItems: Item[];
};

const DndKitPlayground = ({ listItems }: Props) => {
    const [items, setItems] = useState<UniqueIdentifier[]>(listItems.map(i => i.id));

    const sensors = useSensors(
        useSensor(PointerSensor)
    );

    const onDragEnd = (event: DragEndEvent) => {
        if (event.over !== null) {
            const over = event.over;

            if (event.active.id !== event.over.id) {
                setItems((items) => {
                    const oldIndex = items.indexOf(event.active.id);
                    const newIndex = items.indexOf(over.id);
                    return arrayMove(items, oldIndex, newIndex);
                })
            }
        }
    };

    return (
        <div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={items}>
                    <ul>
                        {items.map(id => {
                            const item = listItems.find(li => li.id === id);
                            return (
                                <SortableItem id={id} text={item?.text || "sjait"} />
                            );
                        })}
                    </ul>
                </SortableContext>
            </DndContext>
        </div>
    );
};

type SortableItemProps = {
    id: UniqueIdentifier;
    text: string;
};

export const SortableItem = ({ id, text }: SortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {text}
        </li>
    )
};

export default DndKitPlayground;