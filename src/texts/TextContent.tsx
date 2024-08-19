import React from "react";

type Props = {
    content: string;
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

const TextContent = ({ content }: Props) => {
    const empty = content.length === 0;

    return (
        <div className="text-display">
            {empty ? <span style={{ fontStyle: "italic" }}>Click to edit</span> : withLineBreaks(content)}
        </div>
    );
};

export default TextContent;
