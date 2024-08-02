import { useState } from "react";
import Tab from "./Tab";
import { createWorkspaceId, List, Workspace, WorkspaceId } from "./model";
import WorkspaceContainer from "./WorkspaceContainer";
import IconSquarePlus from "./icons/IconSquarePlus";
import IconPlus from "./icons/IconPlus";



const loadWorkspaces = (): Workspace[] => {
    const workspaces = localStorage.getItem("workspaces");
    if (workspaces === null) {
        const defaultWorkspace: Workspace = {
            id: createWorkspaceId(),
            name: "My workspace"
        };

        localStorage.setItem("workspaces", JSON.stringify([defaultWorkspace]));
        return [defaultWorkspace];
    } else {
        return JSON.parse(workspaces);
    }
};

const persistWorkspaces = (workspaces: Workspace[]) => {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
};

const loadLists = (workspaceId: WorkspaceId): List[] => {
    const data = localStorage.getItem(`workspace-${workspaceId}`);
    if (data !== null) {
        return JSON.parse(data) as List[];
    } else {
        return [];
    }
};

const persistLists = (workspaceId: WorkspaceId, lists: List[]) => {
    localStorage.setItem(`workspace-${workspaceId}`, JSON.stringify(lists));
};

export type ActiveWorkspace = {
    workspaceId: WorkspaceId;
    lists: List[];
};

const RootPage = () => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>(loadWorkspaces);
    const [activeWorkspace, setActiveWorkspace] = useState<ActiveWorkspace>({ workspaceId: workspaces[0].id, lists: loadLists(workspaces[0].id) });

    const onAddTab = () => {
        const newWorkspace: Workspace = {
            id: createWorkspaceId(),
            name: "New workspace"
        };
        const updatedWorkspaces = workspaces.slice().concat(newWorkspace);
        setWorkspaces(updatedWorkspaces);
        setActiveWorkspace({ workspaceId: newWorkspace.id, lists: [] });
        persistWorkspaces(updatedWorkspaces);
    };

    const onChangeTab = (workspaceId: WorkspaceId) => {
        setActiveWorkspace({workspaceId: workspaceId, lists: loadLists(workspaceId)});
    };

    const onDelete = (workspaceId: WorkspaceId) => {
        const index = workspaces.findIndex(w => w.id === workspaceId);
        if (index >= 0) {
            const updatedWorkspaces = workspaces.slice().filter(w => w.id !== workspaceId);

            setWorkspaces(updatedWorkspaces);
            persistWorkspaces(updatedWorkspaces);

            if (index > 0) {
                const workspaceId = updatedWorkspaces[index - 1].id;
                setActiveWorkspace({workspaceId: workspaceId, lists: loadLists(workspaceId)});
            } else {
                alert("null")
                const workspaceId = updatedWorkspaces[0].id;
                setActiveWorkspace({workspaceId: workspaceId, lists: loadLists(workspaceId)});
            }
        }
    };

    const onRename = (workspaceId: WorkspaceId, newName: string) => {
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (workspace !== undefined) {
            const updatedWorkspace: Workspace = {
                id: workspace.id,
                name: newName
            };
            const index = workspaces.indexOf(workspace);
            const updatedWorkspaces = workspaces.slice();
            updatedWorkspaces[index] = updatedWorkspace;
            setWorkspaces(updatedWorkspaces);
            persistWorkspaces(updatedWorkspaces);
        }
    };

    const onUpdateLists = (workspaceId: WorkspaceId, lists: List[]) => {
        setActiveWorkspace({workspaceId: workspaceId, lists: lists});
        persistLists(workspaceId, lists);
    };

    return (
        <div>
            <div className="tabs-container">
                {workspaces.map(w => (
                    <Tab workspace={w}
                        active={activeWorkspace.workspaceId === w.id}
                        canBeDeleted={workspaces.length > 1}
                        onDelete={onDelete}
                        onChangeTab={onChangeTab}
                        onRename={onRename}
                        key={w.id}
                    />
                ))}
                <div className="tab" style={{ cursor: "pointer" }} onClick={onAddTab}>
                    <strong><IconPlus /></strong>
                </div>
            </div>
            <WorkspaceContainer activeWorkspace={activeWorkspace} onUpdateLists={onUpdateLists} />
        </div>
    );
};

export default RootPage;