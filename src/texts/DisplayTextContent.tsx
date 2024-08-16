import React from "react";

type Props = {
    content: string;
    onEdit: () => void;
};

const withLineBreaks = (s: string) => (
    <>
        {s.split("\n").map((line) => (
            <React.Fragment key={line}>
                {line}
                <br />
            </React.Fragment>
        ))}
    </>
);

const DisplayTextContent = ({ content, onEdit }: Props) => {
    const empty = content.length === 0;

    return (
        <div onClick={onEdit} className="text-display">
            {empty ? <span style={{ fontStyle: "italic" }}>Click to edit</span> : withLineBreaks(content)}
        </div>
    );
};

export default DisplayTextContent;
