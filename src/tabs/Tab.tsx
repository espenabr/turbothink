import { CSSProperties, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { WorkspaceHeader, WorkspaceId } from "../model";
import EditTab from "./EditTab";
import TabContent from "./TabContent";

type Props = {
    workspace: WorkspaceHeader;
    active: boolean;
    canBeDeleted: boolean;
    onDelete: (id: WorkspaceId) => void;
    onChangeTab: (id: WorkspaceId) => void;
    onRename: (id: WorkspaceId, newName: string) => void;
    onCopyToClipboard: () => void;
};

const Tab = ({ workspace, active, canBeDeleted, onDelete, onChangeTab, onRename, onCopyToClipboard }: Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: workspace.id });
    const inputRef = useRef<HTMLInputElement>(null);

    // highlight input on edit
    useEffect(() => {
        if (editMode && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editMode]);

    const tabClass = active ? "active-tab" : "tab";

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const onRenameTab = (nweName: string) => {
        onRename(workspace.id, nweName);
        setEditMode(false);
    };

    return (
        <div
            className={tabClass}
            onClick={() => onChangeTab(workspace.id)}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            {editMode ? (
                <EditTab workspaceName={workspace.name}
                    onRename={onRenameTab}
                    onCancel={() => setEditMode(false)}
                    inputRef={inputRef} />
            ) : (
                <TabContent
                    workspaceName={workspace.name}
                    canBeDeleted={canBeDeleted}
                    onEnableEdit={() => setEditMode(true)}
                    onDelete={() => onDelete(workspace.id)}
                    onCopyToClipboard={onCopyToClipboard}
                />
            )}
        </div>
    );
};

export default Tab;
