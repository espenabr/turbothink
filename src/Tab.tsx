import { CSSProperties, useState } from "react";
import { Workspace, WorkspaceId } from "./model";
import IconX from "./icons/IconX";
import IconPencil from "./icons/IconPencil";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { KeyboardEvent } from "react";
import IconArrowBack from "./icons/IconArrowBack";

type Props = {
    workspace: Workspace;
    active: boolean;
    canBeDeleted: boolean;
    onDelete: (id: WorkspaceId) => void;
    onChangeTab: (id: WorkspaceId) => void;
    onRename: (id: WorkspaceId, newName: string) => void;
};

const Tab = ({ workspace, active, canBeDeleted, onDelete, onChangeTab, onRename }: Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const [nameInput, setNameInput] = useState<string>(workspace.name);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: workspace.id });

    const tabClass = active ? "active-tab" : "tab";
    const onEdit = () => setEditMode(true);
    const onCancel = () => setEditMode(false);

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const onInputName = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && nameInput.length > 0) {
            onRename(workspace.id, nameInput);
            setEditMode(false);
        }
    };

    return (
        <div className={tabClass}
            onClick={() => onChangeTab(workspace.id)}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}>
            {editMode ? (
                <>
                    <input value={nameInput}
                        onChange={e => setNameInput(e.currentTarget.value)}
                        onKeyUp={onInputName} />
                    <span style={{ cursor: "pointer", color: "green" }} onClick={onCancel}><IconArrowBack /></span>
                </>
            ) : (
                <>
                    {workspace.name}
                    <span className="tab-icons-container">
                        <span style={{ cursor: "pointer", color: "#424242" }}
                            onClick={onEdit}
                            title="Rename"><IconPencil /></span>
                        {canBeDeleted && (
                            <span style={{ cursor: "pointer", color: "#424242" }}
                                onClick={() => onDelete(workspace.id)}
                                title="Delete"><IconX /></span>
                        )}
                    </span>
                </>
            )}
        </div>
    );
};

export default Tab;