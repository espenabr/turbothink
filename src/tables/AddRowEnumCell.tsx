import { ChangeEvent } from "react";

type Props = {
    value: string;
    options: string[];
    onUpdate: (value: string) => void;
};

const AddEnumCell = ({ value, options, onUpdate }: Props) => {
    const onChangeValue = (event: ChangeEvent<HTMLSelectElement>) => {
        onUpdate(event.currentTarget.value);
    };

    return (
        <>
            <select value={value} onChange={onChangeValue}>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </>
    );
};

export default AddEnumCell;
