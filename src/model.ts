import { Brand } from "./common";
import { v4 as uuid } from "uuid";
import { GptModel, ReasoningStrategy } from "./tangible-gpt/model";
import { ListAction } from "./lists/ListElement";

export type ListId = Brand<string, "ListId">;
export type ListItemId = Brand<string, "ListItemId">;
export type WorkspaceId = Brand<string, "WorkspaceId">;
export type TextId = Brand<string, "TextId">;

export const createListId = () => uuid() as ListId;
export const createTextId = () => uuid() as TextId;
export const createListItemId = () => uuid() as ListItemId;
export const createWorkspaceId = () => uuid() as WorkspaceId;

export type ListItem = {
    id: ListItemId;
    text: string;
};

export type List = {
    type: "List";
    id: ListId;
    name: string;
    items: ListItem[];
};

export type Text = {
    type: "Text";
    id: TextId;
    name: string;
    content: string;
};

export type Block = List | Text;

export type WorkspaceHeader = {
    id: WorkspaceId;
    name: string;
};

export type Workspace = {
    id: WorkspaceId;
    name: string;
    blocks: Block[];
};

/* Interaction states */

type WaitingForUserInstruction = {
    type: "WaitingForUserInstruction";
    action: ListAction;
};

type WaitingForUserAcceptance = {
    type: "WaitingForUserAcceptance";
};

type Loading = {
    type: "Loading";
};

type Display = {
    type: "Display"
};

export type InteractionState = WaitingForUserInstruction | WaitingForUserAcceptance | Loading | Display;

/* Config */

export type OpenAiConfig = {
    key: string;
    model: GptModel;
    reasoningStrategy: ReasoningStrategy;
};

export type BlockHeight = "Unlimited" | "Short" | "Medium" | "Tall";