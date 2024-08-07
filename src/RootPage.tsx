import { useState } from "react";
import { createWorkspaceId, List, Workspace, WorkspaceHeader, WorkspaceId } from "./model";
import WorkspaceContainer, { ClipboardItem } from "./WorkspaceContainer";
import IconPlus from "./icons/IconPlus";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import Tab from "./tabs/Tab";
import InputOpenAiKey from "./InputOpenAiKey";

const loadWorkspaces = (): WorkspaceHeader[] => {
    const workspaces = localStorage.getItem("workspaces");
    if (workspaces === null) {
        const defaultWorkspace: WorkspaceHeader = {
            id: createWorkspaceId(),
            name: "My workspace",
        };

        localStorage.setItem("workspaces", JSON.stringify([defaultWorkspace]));
        return [defaultWorkspace];
    } else {
        return JSON.parse(workspaces);
    }
};

const persistWorkspaces = (workspaces: WorkspaceHeader[]) => {
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

const persistOpenAiKey = (s: string) => {
    localStorage.setItem("openAiKey", s);
};

const loadOpenAiKey = () => localStorage.getItem("openAiKey");


const RootPage = () => {
    const [openAiKey, setOpenAiKey] = useState<string | null>(loadOpenAiKey());

    const [workspaces, setWorkspaces] = useState<WorkspaceHeader[]>(loadWorkspaces);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace>({
        id: workspaces[0].id,
        name: workspaces[0].name,
        lists: loadLists(workspaces[0].id),
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
    );

    const onAddTab = () => {
        const newWorkspace: WorkspaceHeader = {
            id: createWorkspaceId(),
            name: "New workspace",
        };
        const updatedWorkspaces = workspaces.slice().concat(newWorkspace);
        setWorkspaces(updatedWorkspaces);
        setActiveWorkspace({ id: newWorkspace.id, name: newWorkspace.name, lists: [] });
        persistWorkspaces(updatedWorkspaces);
    };

    const onChangeTab = (workspaceId: WorkspaceId) => {
        setActiveWorkspace({
            id: workspaceId,
            name: workspaces.find(w => w.id === workspaceId)?.name || workspaceId,
            lists: loadLists(workspaceId),
        });
    };

    const onDeleteWorkspace = (workspaceId: WorkspaceId) => {
        const index = workspaces.findIndex((w) => w.id === workspaceId);
        if (index >= 0) {
            const updatedWorkspaces = workspaces.slice().filter((w) => w.id !== workspaceId);
            setWorkspaces(updatedWorkspaces);
            persistWorkspaces(updatedWorkspaces);
            if (index > 0) {
                const workspaceId = updatedWorkspaces[index - 1].id;
                setActiveWorkspace({
                    id: workspaceId,
                    name: workspaces[index].name,
                    lists: loadLists(workspaceId),
                });
            } else {
                const workspaceId = updatedWorkspaces[0].id;
                setActiveWorkspace({
                    id: workspaceId,
                    name: workspaces[index].name,
                    lists: loadLists(workspaceId),
                });
            }
        }
    };

    const onRenameWorkspace = (workspaceId: WorkspaceId, newName: string) => {
        const index = workspaces.findIndex((w) => w.id === workspaceId);
        if (index >= 0) {
            const updatedWorkspaces = workspaces.slice();
            updatedWorkspaces[index] = { id: workspaces[index].id, name: newName };
            setWorkspaces(updatedWorkspaces);
            persistWorkspaces(updatedWorkspaces);
        }
    };

    const onUpdateLists = (workspaceId: WorkspaceId, lists: List[]) => {
        setActiveWorkspace({ id: workspaceId, name: activeWorkspace.name, lists: lists });
        persistLists(workspaceId, lists);
    };

    const onUpdateWorkspaces = (workspaces: WorkspaceHeader[]) => {
        setWorkspaces(workspaces);
        persistWorkspaces(workspaces);
    };

    const onDragEnd = (event: DragEndEvent) => {
        if (event.over !== null) {
            const over = event.over;
            if (event.active.id !== event.over.id) {
                const oldIndex = workspaces.findIndex((i) => i.id === event.active.id);
                const newIndex = workspaces.findIndex((i) => i.id === over.id);
                const updated = arrayMove(workspaces, oldIndex, newIndex);
                onUpdateWorkspaces(updated);
            }
        }
    };

    const onInputKey = (k: string) => {
        setOpenAiKey(k);
        persistOpenAiKey(k);
    };

    const onCopyWorkspaceToClipboard = async () => {
        const item: ClipboardItem = {
            type: "Workspace",
            workspace: activeWorkspace
        };
        await navigator.clipboard.writeText(JSON.stringify(item));
    };

    const onAddWorkspace = (workspace: Workspace) => {
        const updatedWorkspaces = workspaces.concat(workspace);
        setWorkspaces(updatedWorkspaces);
        persistWorkspaces(updatedWorkspaces);
        setActiveWorkspace(workspace);
        persistLists(workspace.id, workspace.lists);
    };

    return openAiKey === null ? (
        <InputOpenAiKey currentKey={openAiKey || ""} onInput={onInputKey} />
    ) : (
        <div>
            <div className="tabs-container">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={workspaces} strategy={horizontalListSortingStrategy}>
                        {workspaces.map((w) => (
                            <Tab
                                workspace={w}
                                active={activeWorkspace.id === w.id}
                                canBeDeleted={workspaces.length > 1}
                                onDelete={onDeleteWorkspace}
                                onChangeTab={onChangeTab}
                                onRename={onRenameWorkspace}
                                onCopyToClipboard={onCopyWorkspaceToClipboard}
                                key={w.id}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
                <div className="tab" onClick={onAddTab}>
                    <strong>
                        <IconPlus />
                    </strong>
                </div>
            </div>
            <WorkspaceContainer openAiKey={openAiKey}
                activeWorkspace={activeWorkspace}
                onUpdateLists={onUpdateLists}
                onAddWorkspace={onAddWorkspace} />

            <button onClick={() => setOpenAiKey(null)}>Change OpenAI key</button>
        </div>
    );
};

export default RootPage;