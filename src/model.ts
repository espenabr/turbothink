import { Brand } from "./common";
import { v4 as uuid } from "uuid";
import { GptModel } from "./tangible-gpt/model";

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

/* Config */

export type OpenAiConfig = {
    key: string;
    model: GptModel;
};

export type BlockHeight = "Unlimited" | "Short" | "Medium" | "Tall";
