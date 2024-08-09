import IconArrowBack from "../icons/IconArrowBack";
import IconCheck from "../icons/IconCheck";

type Props = {
    onReject: () => void;
    onAccept?: () => void;
};

const AcceptOrRejectSuggestion = ({ onReject, onAccept }: Props) => (
    <span style={{ cursor: "pointer" }}>
        {onAccept !== undefined && (
            <span className="icon" onClick={() => onAccept()}>
                <IconCheck />
            </span>
        )}
        <span className="icon" onClick={() => onReject()}>
            <IconArrowBack />
        </span>
    </span>
);

export default AcceptOrRejectSuggestion;
