import IconArrowDown from "../icons/IconArrowBack";
import IconCheck from "../icons/IconCheck";

type Props = {
    onReject: () => void;
    onAccept?: () => void;
};

const AcceptOrRejectSuggestion = ({ onReject, onAccept }: Props) => {

    return (
        <>
            <span className="icon"
                onClick={() => onReject()}><IconArrowDown /></span>
            {onAccept !== undefined && (
                <span className="icon"
                    onClick={() => onAccept()}><IconCheck /></span>
            )}
        </>
    );
};

export default AcceptOrRejectSuggestion;