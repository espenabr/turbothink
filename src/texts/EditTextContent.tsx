import { useState, ClipboardEvent } from "react";
import IconCheck from "../icons/IconCheck";
import IconX from "../icons/IconX";


type Props = {
    content: string;
    onUpdate: (s: string) => void;
    onCancel: () => void;
};

const EditTextContent = ({ content, onUpdate, onCancel }: Props) => {
    const [value, setValue] = useState<string>(content);

    // This is quite ugly, but I wasn't able to override paste with default behaviour :-(
    const onPaste = (event: ClipboardEvent) => {
        event.stopPropagation();
        const pasted = event.clipboardData.getData("text");
        const textarea = event.target as HTMLTextAreaElement;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        setValue(value.slice(0, start) + pasted + value.slice(end));
    }

    return (
        <>
            <textarea style={{ width: "97%", height: "100%" }}
                value={value}
                onChange={e => setValue(e.currentTarget.value)}
                onPaste={onPaste}
            />
            <span>
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