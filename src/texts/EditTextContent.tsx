import { ClipboardEvent } from "react";
import { pasteToInput } from "../common";

type Props = {
    content: string;
    textContentInput: string;
    setTextContentInput: (value: string) => void;
};

const EditTextContent = ({ textContentInput, setTextContentInput }: Props) => {
    const onPaste = (event: ClipboardEvent) => pasteToInput(event, textContentInput, setTextContentInput);

    return (
        <>
            <textarea
                className="text-area"
                value={textContentInput}
                onChange={(e) => setTextContentInput(e.currentTarget.value)}
                onPaste={onPaste}
            />
        </>
    );
};

export default EditTextContent;
