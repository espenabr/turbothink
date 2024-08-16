import { useEffect, useRef, useState } from "react";
import {
    createListId,
    createWorkspaceId,
    Workspace,
    WorkspaceHeader,
    WorkspaceId,
    Block,
    createTextId,
    OpenAiConfig,
    BlockHeight,
} from "./model";
import WorkspaceContainer, { ClipboardItem } from "./WorkspaceContainer";
import IconPlus from "./icons/IconPlus";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import Tab from "./tabs/Tab";
import Settings from "./Settings";
import { GptModel, ReasoningStrategy } from "./tangible-gpt/model";

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

const persistWorkspaceHeaders = (workspaces: WorkspaceHeader[]) => {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
};

const loadWorkspaceItems = (workspaceId: WorkspaceId): Block[] => {
    const data = localStorage.getItem(`workspace-${workspaceId}`);
    if (data !== null) {
        return JSON.parse(data) as Block[];
    } else {
        return [];
    }
};

const persistWorkspaceItems = (workspaceId: WorkspaceId, items: Block[]) => {
    localStorage.setItem(`workspace-${workspaceId}`, JSON.stringify(items));
};

const persistOpenAiKey = (s: string) => {
    localStorage.setItem("openAiKey", s);
};

const loadOpenAiKey = () => localStorage.getItem("openAiKey");

const RootPage = () => {
    const [openAiKey, setOpenAiKey] = useState<string | null>(loadOpenAiKey());
    const [gptModel, setGptModel] = useState<GptModel>("gpt-4");
    const [blockHeight, setBlockHeight] = useState<BlockHeight>("Unlimited");
    const [reasoningStrategy, setReasoningStrategy] = useState<ReasoningStrategy>("Simple");

    const [workspaceHeaders, setWorkspaceHeaders] = useState<WorkspaceHeader[]>(loadWorkspaces);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>({
        id: workspaceHeaders[0].id,
        name: workspaceHeaders[0].name,
        blocks: loadWorkspaceItems(workspaceHeaders[0].id),
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
                onUpdateBlocks(
                    currentWorkspace.id,
                    currentWorkspace.blocks.concat({ ...parsed.list, id: createListId() }),
                );
            } else if (parsed.type === "Text") {
                onUpdateBlocks(
                    currentWorkspace.id,
                    currentWorkspace.blocks.concat({ ...parsed.text, id: createTextId() }),
                );
            } else if (parsed.type === "Workspace") {
                onAddWorkspace({ ...parsed.workspace, id: createWorkspaceId() });
            }
        } catch {
            /* ignnore */
        }
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
    }, [currentWorkspace]);

    const onAddTab = () => {
        const newWorkspace: WorkspaceHeader = {
            id: createWorkspaceId(),
            name: "New workspace",
        };
        const updatedWorkspaces = workspaceHeaders.slice().concat(newWorkspace);
        setWorkspaceHeaders(updatedWorkspaces);
        setCurrentWorkspace({ id: newWorkspace.id, name: newWorkspace.name, blocks: [] });
        persistWorkspaceHeaders(updatedWorkspaces);
    };

    const onChangeTab = (workspaceId: WorkspaceId) => {
        setCurrentWorkspace({
            id: workspaceId,
            name: workspaceHeaders.find((w) => w.id === workspaceId)?.name || workspaceId,
            blocks: loadWorkspaceItems(workspaceId),
        });
    };

    const onDeleteWorkspace = (workspaceIdToDelete: WorkspaceId) => {
        const replacementWorkspace = workspaceHeaders.find((w) => w.id !== workspaceIdToDelete);
        const workspaceToDelete = workspaceHeaders.find((w) => w.id === workspaceIdToDelete);

        if (replacementWorkspace !== undefined && workspaceToDelete !== undefined) {
            const updatedWorkspaceHeaders = workspaceHeaders.filter((h) => h.id !== workspaceIdToDelete).slice();

            const loaded = loadWorkspaceItems(replacementWorkspace.id);
            setCurrentWorkspace({ ...replacementWorkspace, blocks: loaded });
            setWorkspaceHeaders(updatedWorkspaceHeaders);
            persistWorkspaceHeaders(updatedWorkspaceHeaders);

            // embarrasing hack, but need to figure out why the workspace isn't rerendered
            location.reload();
        }
    };

    const onRenameWorkspace = (workspaceId: WorkspaceId, newName: string) => {
        const index = workspaceHeaders.findIndex((w) => w.id === workspaceId);
        if (index >= 0) {
            const updatedWorkspaces = workspaceHeaders.slice();
            updatedWorkspaces[index] = { id: workspaceHeaders[index].id, name: newName };
            setWorkspaceHeaders(updatedWorkspaces);
            persistWorkspaceHeaders(updatedWorkspaces);
        }
    };

    const onUpdateBlocks = (workspaceId: WorkspaceId, blocks: Block[]) => {
        setCurrentWorkspace({ id: workspaceId, name: currentWorkspace.name, blocks: blocks });
        persistWorkspaceItems(workspaceId, blocks);
    };

    const onUpdateWorkspaces = (workspaces: WorkspaceHeader[]) => {
        setWorkspaceHeaders(workspaces);
        persistWorkspaceHeaders(workspaces);
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
            workspace: currentWorkspace,
        };
        await navigator.clipboard.writeText(JSON.stringify(item));
    };

    const onAddWorkspace = (workspace: Workspace) => {
        const updatedWorkspaces = workspaceHeaders.concat(workspace);
        setWorkspaceHeaders(updatedWorkspaces);
        persistWorkspaceHeaders(updatedWorkspaces);
        setCurrentWorkspace(workspace);
        persistWorkspaceItems(workspace.id, workspace.blocks);
    };

    const openAiConfig: OpenAiConfig = {
        key: openAiKey || "",
        model: gptModel,
        reasoningStrategy: reasoningStrategy,
    };

    return (
        <div ref={containerRef}>
            <div className="header">
                <Settings
                    openAiKey={openAiKey || ""}
                    gptModel={gptModel}
                    blockHeight={blockHeight}
                    reasoningStrategy={reasoningStrategy}
                    onUpdateBlockHeight={setBlockHeight}
                    onUpdateReasoningStrategy={setReasoningStrategy}
                    onUpdateKey={(key) => onInputKey(key)}
                    onUpdateGptModel={setGptModel}
                />
            </div>

            <div className="tabs-container">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={workspaceHeaders} strategy={horizontalListSortingStrategy}>
                        {workspaceHeaders.map((w) => (
                            <Tab
                                workspace={w}
                                active={currentWorkspace.id === w.id}
                                canBeDeleted={workspaceHeaders.length > 1}
                                onDelete={() => onDeleteWorkspace(w.id)}
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
            <WorkspaceContainer
                openAiConfig={openAiConfig}
                workspace={currentWorkspace}
                blockHeight={blockHeight}
                onUpdateBlocks={onUpdateBlocks}
                key={currentWorkspace.id}
            />
        </div>
    );
};

export default RootPage;
