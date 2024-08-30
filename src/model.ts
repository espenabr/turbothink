import { Brand } from "./common";
import { v4 as uuid } from "uuid";
import { Column, GptModel, ReasoningStrategy, Row } from "./tangible-gpt/model";

export type ListId = Brand<string, "ListId">;
export type ListItemId = Brand<string, "ListItemId">;
export type WorkspaceId = Brand<string, "WorkspaceId">;
export type TextId = Brand<string, "TextId">;
export type TableId = Brand<string, "TableId">;

export type BlockId = ListId | TextId | TableId;

export const createListId = () => uuid() as ListId;
export const createTextId = () => uuid() as TextId;
export const createListItemId = () => uuid() as ListItemId;
export const createWorkspaceId = () => uuid() as WorkspaceId;
export const createTableId = () => uuid() as TableId;

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

export type Table = {
    type: "Table";
    id: TableId;
    name: string;
    columns: Column[];
    rows: Row[];
};

export type Block = List | Text | Table;

export type WorkspaceHeader = {
    id: WorkspaceId;
    name: string;
};

export type Workspace = {
    id: WorkspaceId;
    name: string;
    blocks: Block[];
};

/* Actions */
export type ListAction = "filter" | "sort" | "group";
export type TextAction = "transform";
export type TableAction = "addColumn" | "addRow";

/* Interaction states */

type WaitingForListInstruction = {
    type: "WaitingForUserListInstruction";
    action: ListAction;
};

type WaitingForUserAcceptance = {
    type: "WaitingForUserAcceptance";
};

type Loading = {
    type: "Loading";
};

type Display = {
    type: "Display";
};

type WaitingForTextInstruction = {
    type: "WaitingForUserTextInstruction";
    action: TextAction;
};

type EditTextContent = {
    type: "EditTextContent";
};

type WaitingForAddColumnInstruction = {
    type: "WaitingForAddColumnInstruction";
};

type WaitingForAddRowInstruction = {
    type: "WaitingForAddRowInstruction";
};

export type ListInteractionState = WaitingForListInstruction | WaitingForUserAcceptance | Loading | Display;
export type TextInteractionState =
    | WaitingForTextInstruction
    | EditTextContent
    | WaitingForUserAcceptance
    | Loading
    | Display;
export type TableInteractionState = WaitingForAddColumnInstruction | WaitingForAddRowInstruction | Loading | Display;

/* Clipboard */

type ClipboardList = {
    type: "List";
    list: List;
};

type ClipboardText = {
    type: "Text";
    text: Text;
};

type ClipboardTable = {
    type: "Table";
    table: Table;
};

type ClipboardWorkspace = {
    type: "Workspace";
    workspace: Workspace;
};

export type ClipboardItem = ClipboardList | ClipboardText | ClipboardWorkspace | ClipboardTable;

/* Config */

export type OpenAiConfig = {
    key: string;
    model: GptModel;
    reasoningStrategy: ReasoningStrategy;
};

export type BlockHeight = "Unlimited" | "Short" | "Medium" | "Tall";
