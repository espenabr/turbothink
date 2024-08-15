import { useState, ClipboardEvent } from "react";
import IconCheck from "../icons/IconCheck";
import IconX from "../icons/IconX";
import { pasteToInput } from "../common";

type Props = {
    content: string;
    onUpdate: (s: string) => void;
    onCancel: () => void;
};

const EditTextContent = ({ content, onUpdate, onCancel }: Props) => {
    const [value, setValue] = useState<string>(content);

    const onPaste = (event: ClipboardEvent) => pasteToInput(event, value, setValue);

    return (
        <>
            <textarea
                style={{ width: "100%", height: "91%" }}
                value={value}
                onChange={(e) => setValue(e.currentTarget.value)}
                onPaste={onPaste}
            />
            <span style={{ cursor: "pointer" }}>
                <span onClick={() => onUpdate(value)}>
                    <IconCheck />
                </span>
                <span onClick={() => onCancel()}>
                    <IconX />
                </span>
            </span>
        </>
    );
};

export default EditTextContent;
