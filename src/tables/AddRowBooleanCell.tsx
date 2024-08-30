type Props = {
    value: boolean;
    onUpdate: (newValue: boolean) => void;
};

const AddBooleanCell = ({ value, onUpdate }: Props) => {
    const checkboxValue = value ? "checked" : undefined;

    const onClick = () => {
        const newValue = !value;
        onUpdate(newValue);
    };

    return (
        <>
            <input type="checkbox" value={checkboxValue} onClick={onClick} />
        </>
    );
};

export default AddBooleanCell;
