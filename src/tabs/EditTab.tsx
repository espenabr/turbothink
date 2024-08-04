import { useState, KeyboardEvent } from "react";
import IconArrowBack from "../icons/IconArrowBack";


type Props = {
    workspaceName: string;

    onRename: (newName: string) => void;
    onCancel: () => void;
};

const EditTab = ({ workspaceName, onRename, onCancel }: Props) => {
    const [nameInput, setNameInput] = useState<string>(workspaceName);

    const onInputName = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && nameInput.length > 0) {
            onRename(nameInput);
        }
    };

    return (
        <>
            <input value={nameInput}
                onChange={e => setNameInput(e.currentTarget.value)}
                onKeyUp={onInputName} />
            <span style={{ cursor: "pointer", color: "green" }} onClick={onCancel}>
                <IconArrowBack />
            </span>
        </>
    );
};

export default EditTab;