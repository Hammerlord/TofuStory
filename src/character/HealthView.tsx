import { Heart } from "../images";
import Tooltip from "../view/Tooltip";
import Icon from "../icon/Icon";
import { createUseStyles } from "react-jss";
import classNames from "classnames";

const useStyles = createUseStyles({
    icon: {
        "&.injured .text": {
            color: "#ff9b94",
        },
    },
});

const Health = ({ HP, maxHP }) => {
    const toOneDecimal = (num) => Math.round(num * 10) / 10;
    const classes = useStyles();
    return (
        <Tooltip
            title={
                <div>
                    {HP} / {maxHP} HP ({toOneDecimal(HP / maxHP) * 100}%)
                </div>
            }
        >
            <span>
                <Icon
                    icon={<Heart />}
                    size={"lg"}
                    text={HP}
                    className={classNames(classes.icon, {
                        injured: HP < maxHP,
                    })}
                />
            </span>
        </Tooltip>
    );
};

export default Health;
