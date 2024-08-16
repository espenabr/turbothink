import { ClipboardEvent, RefObject } from "react";
import { pasteToInput } from "../common";

type Props = {
    content: string;
    textContentInput: string;
    textAreaRef: RefObject<HTMLTextAreaElement>;
    setTextContentInput: (value: string) => void;
};

const EditTextContent = ({ textContentInput, textAreaRef, setTextContentInput }: Props) => {
    const onPaste = (event: ClipboardEvent) => pasteToInput(event, textContentInput, setTextContentInput);

    return (
        <>
            <textarea
                className="text-area"
                ref={textAreaRef}
                value={textContentInput}
                onChange={(e) => setTextContentInput(e.currentTarget.value)}
                onPaste={onPaste}
            />
        </>
    );
};

export default EditTextContent;
