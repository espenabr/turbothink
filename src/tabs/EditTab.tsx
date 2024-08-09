import { useState, KeyboardEvent, RefObject, ClipboardEvent } from "react";
import IconArrowBack from "../icons/IconArrowBack";
import { pasteToInput } from "../common";

type Props = {
    workspaceName: string;
    inputRef: RefObject<HTMLInputElement>;
    onRename: (newName: string) => void;
    onCancel: () => void;
};

const EditTab = ({ workspaceName, inputRef, onRename, onCancel }: Props) => {
    const [nameInput, setNameInput] = useState<string>(workspaceName);

    const onInputName = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && nameInput.length > 0) {
            onRename(nameInput);
        }
    };

    const onPaste = (event: ClipboardEvent) => pasteToInput(event, nameInput, setNameInput);

    return (
        <>
            <input value={nameInput}
                onChange={(e) => setNameInput(e.currentTarget.value)}
                onKeyUp={onInputName}
                onPaste={onPaste}
                ref={inputRef} />
            <span style={{ cursor: "pointer", color: "green" }} onClick={onCancel}>
                <IconArrowBack />
            </span>
        </>
    );
};

export default EditTab;
