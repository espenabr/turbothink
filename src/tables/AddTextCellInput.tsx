import { KeyboardEvent, ClipboardEvent } from "react";
import { pasteToInput } from "../common";

type Props = {
    value: string;
    onUpdate: (newValue: string) => void;
    onEnter: () => void;
};

const AddTextCellInput = ({ value, onUpdate, onEnter }: Props) => {
    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && value.length > 0) {
            onEnter();
        }
    };

    const onPaste = (event: ClipboardEvent) => pasteToInput(event, value, onUpdate);

    return (
        <>
            <input
                value={value}
                onChange={(e) => onUpdate(e.currentTarget.value)}
                onKeyUp={onKeyUp}
                onPaste={onPaste}
            />
        </>
    );
};

export default AddTextCellInput;
