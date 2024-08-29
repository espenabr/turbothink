import { Message } from "./GptApiClient.ts";

export type GptModel = "gpt-4" | "gpt-4-turbo" | "gpt-4o" | "gpt-4o-mini" | "gpt-3.5" | "gpt-3.5-turbo";

type IntegerParam = {
    type: "integer";
    name: string;
};

type StringParam = {
    type: "string";
    name: string;
};

type EnumParam = {
    type: "enum";
    name: string;
    enum: string[];
};

type DoubleParam = {
    type: "double";
    name: string;
};

type BooleanParam = {
    type: "boolean";
    name: string;
};

export type Param = IntegerParam | StringParam | EnumParam | BooleanParam | DoubleParam;

export type FunctionCall<I = string, O = string> = {
    name: string;
    description: string;
    params: Param[];
    function: (params: I) => Promise<O>;
};

export type ReasoningStrategy = "Simple" | "ThinkStepByStep" | "SuggestMultipleAndPickOne";

export type TangibleResponse<T> = TangibleResponseSuccess<T> | TangibleResponseFailure;

export type TangibleResponseSuccess<T> = {
    outcome: "Success";
    value: T;
    rawMessage: string;
    history: Message[];
};

export type TangibleResponseFailure = {
    outcome: "Failure";
    reason: string;
    rawMessage: string;
    history: Message[];
};

export type TangibleOptionResponseSuccess<T> = {
    outcome: "Success";
    value: T | null;
    rawMessage: string;
    history: Message[];
};

export type TangibleOptionResponse<T> = TangibleOptionResponseSuccess<T> | TangibleResponseFailure;

export type TangibleEitherResponse<L, R> = {
    value: L | R;
    rawMessage: string;
    history: Message[];
};

export type TextColumn = {
    type: "TextColumn";
    name: string;
};

export type BooleanColumn = {
    type: "BooleanColumn";
    name: string;
};

export type NumberColumn = {
    type: "NumberColumn";
    name: string;
};

export type EnumColumn = {
    type: "EnumColumn";
    name: string;
    options: string[];
};

export type Column = TextColumn | BooleanColumn | NumberColumn | EnumColumn;

export type TextCell = {
    type: "TextCell";
    value: string;
    column: Column;
};

export type BooleanCell = {
    type: "BooleanCell";
    value: boolean;
    column: Column;
};

export type NumberCell = {
    type: "NumberCell";
    value: number;
    column: Column;
};

export type EnumCell = {
    type: "EnumCell";
    value: string;
    column: Column;
};

export type Cell = TextCell | BooleanCell | NumberCell | EnumCell;

export type Row = {
    cells: Cell[];
};

export type Table = {
    columns: Column[];
    rows: Row[];
};

export type ItemGroup = {
    name: string;
    items: string[];
};

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];
export type JSONSerializable = JSONObject | JSONArray | JSONValue;
