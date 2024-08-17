import { Tooltip } from "react-tooltip";
import IconArrowBack from "../icons/IconArrowBack";
import IconCheck from "../icons/IconCheck";

type Props = {
    onReject: () => void;
    onAccept?: () => void;
};

const AcceptOrRejectAction = ({ onReject, onAccept }: Props) => (
    <span style={{ cursor: "pointer" }}>
        <Tooltip id="tooltip" />
        {onAccept !== undefined && (
            <a className="icon" onClick={onAccept} data-tooltip-id="tooltip" data-tooltip-content="Accept">
                <IconCheck />
            </a>
        )}
        <a className="icon" onClick={onReject} data-tooltip-id="tooltip" data-tooltip-content="Reject">
            <IconArrowBack />
        </a>
    </span>
);

export default AcceptOrRejectAction;
