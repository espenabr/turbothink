import IconPencil from "../icons/IconPencil";
import IconX from "../icons/IconX";


type Props = {
    workspaceName: string;
    canBeDeleted: boolean;

    onEnableEdit: () => void;
    onDelete: () => void;
};

const TabContent = ({ workspaceName, canBeDeleted, onEnableEdit, onDelete }: Props) => {
    return (
        <>
            {workspaceName}
            <span style={{ paddingLeft: "10px" }}>
                <span style={{ cursor: "pointer", color: "#424242" }}
                    onClick={() => onEnableEdit()}
                    title="Rename">
                    <IconPencil />
                </span>
                {canBeDeleted && (
                    <span style={{ cursor: "pointer", color: "#424242" }}
                        onClick={() => onDelete()}
                        title="Delete">
                        <IconX />
                    </span>
                )}
            </span>
        </>
    );
};

export default TabContent;