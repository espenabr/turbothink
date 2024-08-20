import { CSSProperties } from "react";
import IconX from "../icons/IconX";
import { Modification } from "./ListItemContainer";

type Props = {
    text: string;
    modification: Modification | null;
    canDelete: boolean;
    onEnableEdit: () => void;
    onDelete: () => void;
};

const ListItemContent = ({ text, modification, canDelete, onEnableEdit, onDelete }: Props) => {
    const textStyle = (mod: Modification | null): CSSProperties => {
        if (mod !== null && mod.type === "reordered") {
            return { color: "lightGray", textDecoration: "line-through" };
        } else {
            return { cursor: "pointer" };
        }
    };

    return (
        <>
            {modification?.type === "reordered" && <span style={{ paddingRight: "10px" }}>{modification.newText}</span>}
            <span onClick={() => onEnableEdit()} style={textStyle(modification)}>
                {text}
            </span>
            {canDelete && (
                <div className="icons" style={{ backgroundColor: "white" }}>
                    <a className="icon" onClick={() => onDelete()} title="Delete">
                        <IconX />
                    </a>
                </div>
            )}
        </>
    );
};

export default ListItemContent;
