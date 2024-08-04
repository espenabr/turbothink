import { KeyboardEvent, useState } from "react";
import { createListItemId, ListItem } from "../model";

type Props = {
    onAdd: (item: ListItem) => void;
};

const AddListItem = ({ onAdd }: Props) => {
    const [itemInput, setItemInput] = useState<string>("");

    const onAddItem = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && itemInput.length > 0) {
            onAdd({ id: createListItemId(), text: itemInput });
            setItemInput("");
        }
    };

    return (
        <input
            value={itemInput}
            style={{ width: "97%" }}
            placeholder="New item"
            onChange={(e) => setItemInput(e.currentTarget.value)}
            onKeyUp={onAddItem}
        />
    );
};

export default AddListItem;
