import { Brand } from "./common";
import { v4 as uuid } from "uuid";

export type ListId = Brand<string, `ListId`>;
export type ListItemId = Brand<string, `ListItemId`>;
export type WorkspaceId = Brand<string, `WorkspaceId`>;

export const createListId = () => uuid() as ListId;
export const createListItemId = () => uuid() as ListItemId;
export const createWorkspaceId = () => uuid() as WorkspaceId;

export type ListItem = {
    id: ListItemId;
    text: string;
};

export type List = {
    id: ListId;
    name: string;
    items: ListItem[];
};

export type Workspace = {
    id: WorkspaceId;
    name: string;
};
