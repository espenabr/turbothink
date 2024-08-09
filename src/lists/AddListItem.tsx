import { KeyboardEvent, useState } from "react";
import IconPlaylistAdd from "../icons/IconPlaylistAdd";

type Props = {
    onAdd: (text: string) => void;
    onExtendList: () => void;
};

const AddListItem = ({ onAdd, onExtendList }: Props) => {
    const [itemInput, setItemInput] = useState<string>("");

    const onAddItem = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && itemInput.length > 0) {
            onAdd(itemInput);
            setItemInput("");
        }
    };

    return (
        <>
            <span style={{ cursor: "pointer" }}
                title="Extend list"
                onClick={onExtendList}>
                <IconPlaylistAdd />
            </span>
            <input value={itemInput}
                style={{ width: "87%", marginLeft: "10px" }}
                placeholder="New item"
                onChange={(e) => setItemInput(e.currentTarget.value)}
                onKeyUp={onAddItem} />
        </>
    );
};

export default AddListItem;
