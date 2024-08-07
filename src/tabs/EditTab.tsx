import { useState, KeyboardEvent, RefObject } from "react";
import IconArrowBack from "../icons/IconArrowBack";

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

    return (
        <>
            <input value={nameInput}
                onChange={(e) => setNameInput(e.currentTarget.value)}
                onKeyUp={onInputName}
                ref={inputRef} />
            <span style={{ cursor: "pointer", color: "green" }} onClick={onCancel}>
                <IconArrowBack />
            </span>
        </>
    );
};

export default EditTab;
