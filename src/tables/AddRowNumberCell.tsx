import { KeyboardEvent, ChangeEvent } from "react";

type Props = {
    value: number;
    onUpdate: (value: number) => void;
    onEnter: () => void;
};

const AddNumberCell = ({ value, onUpdate, onEnter }: Props) => {
    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && value.toString().length > 0) {
            onEnter();
        }
    };

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        try {
            onUpdate(parseFloat(event.currentTarget.value));
        } catch {}
    };

    return (
        <>
            <input value={value.toString()} onChange={onChange} onKeyUp={onKeyUp} />
        </>
    );
};

export default AddNumberCell;
