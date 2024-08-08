import { useEffect, useRef, useState } from "react";
import { createListId, createWorkspaceId, List, Workspace, WorkspaceHeader, WorkspaceId, Block, createTextId } from "./model";
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

const loadWorkspaceItems = (workspaceId: WorkspaceId): Block[] => {
    const data = localStorage.getItem(`workspace-${workspaceId}`);
    if (data !== null) {
        return JSON.parse(data) as Block[];
    } else {
        return [];
    }
};

const persistLists = (workspaceId: WorkspaceId, lists: List[]) => {
    localStorage.setItem(`workspace-${workspaceId}`, JSON.stringify(lists));
};

const persistWorkspaceItems = (workspaceId: WorkspaceId, items: Block[]) => {
    localStorage.setItem(`workspace-${workspaceId}`, JSON.stringify(items));
}

const persistOpenAiKey = (s: string) => {
    localStorage.setItem("openAiKey", s);
};

const loadOpenAiKey = () => localStorage.getItem("openAiKey");


const RootPage = () => {
    const [openAiKey, setOpenAiKey] = useState<string | null>(loadOpenAiKey());

    const [workspaceHeaders, setWorkspaceHeaders] = useState<WorkspaceHeader[]>(loadWorkspaces);
    const [workspace, setWorkspace] = useState<Workspace>({
        id: workspaceHeaders[0].id,
        name: workspaceHeaders[0].name,
        blocks: loadWorkspaceItems(workspaceHeaders[0].id)
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
    );

    const containerRef = useRef<HTMLDivElement>(null);

    const pasteItem = (data: string) => {
        try {
            const parsed = JSON.parse(data) as ClipboardItem;
            if (parsed.type === "List") {
                onUpdateBlocks(workspace.id, workspace.blocks.concat({ ...parsed.list, id: createListId() }));
            } else if (parsed.type === "Text") {
                onUpdateBlocks(workspace.id, workspace.blocks.concat({ ...parsed.text, id: createTextId() }));
            } else if (parsed.type === "Workspace") {
                onAddWorkspace({ ...parsed.workspace, id: createWorkspaceId() });
            }
        } catch { /* ignnore */ }
    };

    // paste from clipboard
    useEffect(() => {
        const onPaste = (event: ClipboardEvent) => {
            event.preventDefault();

            const clipboardData = event.clipboardData?.getData("text");
            if (clipboardData !== undefined) {
                pasteItem(clipboardData);
            }
        };

        const pasteHandler = (event: ClipboardEvent) => onPaste(event);
        const container = containerRef.current;
        container?.addEventListener("paste", pasteHandler);

        return () => {
            container?.removeEventListener("paste", pasteHandler);
        };
    }, [workspace]);


    const onAddTab = () => {
        const newWorkspace: WorkspaceHeader = {
            id: createWorkspaceId(),
            name: "New workspace",
        };
        const updatedWorkspaces = workspaceHeaders.slice().concat(newWorkspace);
        setWorkspaceHeaders(updatedWorkspaces);
        setWorkspace({ id: newWorkspace.id, name: newWorkspace.name, blocks: [] });
        persistWorkspaces(updatedWorkspaces);
    };

    const onChangeTab = (workspaceId: WorkspaceId) => {
        setWorkspace({
            id: workspaceId,
            name: workspaceHeaders.find(w => w.id === workspaceId)?.name || workspaceId,
            blocks: loadWorkspaceItems(workspaceId),
        });
    };

    const onDeleteWorkspace = (workspaceId: WorkspaceId) => {
        const index = workspaceHeaders.findIndex((w) => w.id === workspaceId);
        if (index >= 0) {
            const updatedWorkspaces = workspaceHeaders.slice().filter((w) => w.id !== workspaceId);
            setWorkspaceHeaders(updatedWorkspaces);
            persistWorkspaces(updatedWorkspaces);
            if (index > 0) {
                const workspaceId = updatedWorkspaces[index - 1].id;
                setWorkspace({
                    id: workspaceId,
                    name: workspaceHeaders[index].name,
                    blocks: loadWorkspaceItems(workspaceId),
                });
            } else {
                const workspaceId = updatedWorkspaces[0].id;
                setWorkspace({
                    id: workspaceId,
                    name: workspaceHeaders[index].name,
                    blocks: loadWorkspaceItems(workspaceId),
                });
            }
        }
    };

    const onRenameWorkspace = (workspaceId: WorkspaceId, newName: string) => {
        const index = workspaceHeaders.findIndex((w) => w.id === workspaceId);
        if (index >= 0) {
            const updatedWorkspaces = workspaceHeaders.slice();
            updatedWorkspaces[index] = { id: workspaceHeaders[index].id, name: newName };
            setWorkspaceHeaders(updatedWorkspaces);
            persistWorkspaces(updatedWorkspaces);
        }
    };

    const onUpdateBlocks = (workspaceId: WorkspaceId, blocks: Block[]) => {
        setWorkspace({ id: workspaceId, name: workspace.name, blocks: blocks });
        persistWorkspaceItems(workspaceId, blocks);
    };

    const onUpdateWorkspaces = (workspaces: WorkspaceHeader[]) => {
        setWorkspaceHeaders(workspaces);
        persistWorkspaces(workspaces);
    };

    const onDragEnd = (event: DragEndEvent) => {
        if (event.over !== null) {
            const over = event.over;
            if (event.active.id !== event.over.id) {
                const oldIndex = workspaceHeaders.findIndex((i) => i.id === event.active.id);
                const newIndex = workspaceHeaders.findIndex((i) => i.id === over.id);
                const updated = arrayMove(workspaceHeaders, oldIndex, newIndex);
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
            workspace: workspace
        };
        await navigator.clipboard.writeText(JSON.stringify(item));
    };

    const onAddWorkspace = (workspace: Workspace) => {
        const updatedWorkspaces = workspaceHeaders.concat(workspace);
        setWorkspaceHeaders(updatedWorkspaces);
        persistWorkspaces(updatedWorkspaces);
        setWorkspace(workspace);
        persistWorkspaceItems(workspace.id, workspace.blocks);
    };

    return openAiKey === null ? (
        <InputOpenAiKey currentKey={openAiKey || ""} onInput={onInputKey} />
    ) : (
        <div ref={containerRef}>
            <div className="tabs-container">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={workspaceHeaders} strategy={horizontalListSortingStrategy}>
                        {workspaceHeaders.map((w) => (
                            <Tab
                                workspace={w}
                                active={workspace.id === w.id}
                                canBeDeleted={workspaceHeaders.length > 1}
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
                workspace={workspace}
                onUpdateBlocks={onUpdateBlocks} />

            
            <button style={{ marginTop: "100px" }} onClick={() => setOpenAiKey(null)}>Change OpenAI key</button>
        </div>
    );
};

export default RootPage;