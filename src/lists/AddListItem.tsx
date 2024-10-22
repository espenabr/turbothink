import { KeyboardEvent, useState, ClipboardEvent } from "react";
import IconPlaylistAdd from "../icons/IconPlaylistAdd";
import { pasteToInput } from "../common";
import { Tooltip } from "react-tooltip";

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

    // This is quite ugly, but I wasn't able to override paste with default behaviour :-(
    const onPaste = (event: ClipboardEvent) => pasteToInput(event, itemInput, setItemInput);

    return (
        <>
            <Tooltip id="tooltip" />
            <a onClick={onExtendList} data-tooltip-id="tooltip" data-tooltip-content="Extend list">
                <IconPlaylistAdd />
            </a>
            <input
                value={itemInput}
                style={{ width: "87%", marginLeft: "10px" }}
                placeholder="New item"
                onChange={(e) => setItemInput(e.currentTarget.value)}
                onKeyUp={onAddItem}
                onPaste={onPaste}
            />
        </>
    );
};

export default AddListItem;
