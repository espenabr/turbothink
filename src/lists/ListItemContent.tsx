import { CSSProperties } from "react";
import IconX from "../icons/IconX";
import { Modification } from "./ListItemElement";


type Props = {
    text: string;
    modification: Modification | null;

    onEnableEdit: () => void;
    onDelete: () => void;
};

const ListItemContent = ({ text, modification, onEnableEdit, onDelete }: Props) => {
    const textStyle = (mod: Modification | null): CSSProperties => {
        if (mod !== null && mod.type === "reordered") {
            return { color: "lightGray", textDecoration: "line-through" }
        } else {
            return {};
        }
    };

    return (
        <>
            {modification?.type === "reordered" && (
                <span style={{ paddingRight: "10px" }}>{modification.newText}</span>
            )}
            <span onClick={() => onEnableEdit()} style={textStyle(modification)}>
                {text}
            </span>
            <div className="icons" style={{ backgroundColor: "white" }}>
                <span className="icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => onDelete()}
                    title="Delete">
                    <IconX />
                </span>
            </div>
        </>
    );
};

export default ListItemContent;