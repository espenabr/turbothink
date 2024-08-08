import React from "react";


type Props = {
    content: string;
    onEdit: () => void;
};


const withLineBreaks = (s: string) => (
    <>
        {s.split("\n").map((line) => (
            <React.Fragment>
                {line}
                <br />
            </React.Fragment>
        ))}
    </>
);

const DisplayTextContent = ({ content, onEdit }: Props) => {
    return (
        <div onClick={onEdit} className="text-display">
            {withLineBreaks(content)}
        </div>
    );
};

export default DisplayTextContent;