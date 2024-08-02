import { useState } from "react";
import { Workspace, WorkspaceId } from "./model";
import IconX from "./icons/IconX";
import IconPencil from "./icons/IconPencil";


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

    const tabClass = active ? "active-tab" : "tab";

    const onEdit = () => {
        setEditMode(true);
    };

    const onCancel = () => {
        setEditMode(false);
    };

    return (
        <div className={tabClass} onClick={() => onChangeTab(workspace.id)}>
            {editMode ? (
                <>
                    <input value={nameInput}
                        onChange={e => setNameInput(e.currentTarget.value)}
                        onKeyUp={e => {
                            if (e.key === "Enter" && nameInput.length > 0) {
                                onRename(workspace.id, nameInput);
                                setEditMode(false);
                            }
                        }} />
                    <span style={{ cursor: "pointer", color: "green" }} onClick={() => {
                        onCancel();
                    }}>↩</span>
                </>
            ) : (
                <>
                    {workspace.name}
                        <span style={{ cursor: "pointer", color: "#424242" }}
                            onClick={() => onEdit()}
                            title="Rename"><IconPencil /></span>
                        {canBeDeleted && (
                            <span style={{ cursor: "pointer", color: "#424242" }}
                                onClick={() => onDelete(workspace.id)}
                                title="Delete"><IconX /></span>
                        )}
                </>
            )}
        </div>
    );
};

export default Tab;