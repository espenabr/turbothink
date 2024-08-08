import { useState } from "react";
import IconCheck from "../icons/IconCheck";
import IconX from "../icons/IconX";


type Props = {
    content: string;
    onUpdate: (s: string) => void;
    onCancel: () => void;
};

const EditTextContent = ({ content, onUpdate, onCancel }: Props) => {
    const [value, setValue] = useState<string>(content);

    return (
        <>
            <textarea style={{ width: "97%", height: "100%" }}
                value={value}
                onChange={e => setValue(e.currentTarget.value)}
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