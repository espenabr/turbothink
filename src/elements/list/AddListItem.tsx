import { useState } from "react";
import { createListItemId, ListItem } from "../../model";


type Props = {
    onAdd: (item: ListItem) => void;
};

const AddListItem = ({onAdd}: Props) => {
    const [itemInput, setItemInput] = useState<string>("");

    return (
        <input value={itemInput}
            placeholder="New item"
            onChange={e => setItemInput(e.currentTarget.value)}
            onKeyUp={e => {
                if (e.key === "Enter" && itemInput.length > 0) {
                    onAdd({ id: createListItemId(), text: itemInput});
                    setItemInput("");
                }
            }}
        />
    );
};

export default AddListItem;