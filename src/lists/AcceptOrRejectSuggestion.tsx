import IconArrowBack from "../icons/IconArrowBack";
import IconCheck from "../icons/IconCheck";

type Props = {
    onReject: () => void;
    onAccept?: () => void;
};

const AcceptOrRejectSuggestion = ({ onReject, onAccept }: Props) => (
    <>
        {onAccept !== undefined && (
            <span className="icon" onClick={() => onAccept()}><IconCheck /></span>
        )}
        <span className="icon"
            onClick={() => onReject()}><IconArrowBack /></span>
    </>
);

export default AcceptOrRejectSuggestion;