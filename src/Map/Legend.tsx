import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { TreasureChestImage } from "../images";
import { CampingIcon, CrossedSwordsIcon, HouseIcon, JapaneseOgreIcon, MedalIcon, MoneyBagIcon, QuestionMarkIcon } from "../images/icons";

const useStyles = createUseStyles({
    legend: {
        margin: 0,
        padding: 16,
        borderRadius: 4,
        background: "rgba(0, 0, 0, 0.75)",
        position: "fixed",
        right: 16,
        bottom: 16,
        color: "white",
        listStyle: "none",
        "& li": {
            margin: "4px 0",
        },
    },
    legendHeader: {
        textAlign: "center",
        fontWeight: "bold",
        paddingBottom: 4,
    },
    legendItemText: {
        lineHeight: "28px",
        verticalAlign: "top",
        marginLeft: 2,
    },
});

const Legend = () => {
    const classes = useStyles();
    return (
        <ul className={classes.legend}>
            <div className={classes.legendHeader}>Legend</div>
            <li>
                <Icon icon={<CrossedSwordsIcon />} /> <span className={classes.legendItemText}>Battle</span>
            </li>
            <li>
                <Icon icon={<MedalIcon />} /> <span className={classes.legendItemText}>Elite Battle</span>
            </li>
            <li>
                <Icon icon={<JapaneseOgreIcon />} /> <span className={classes.legendItemText}>Boss</span>
            </li>
            <li>
                <Icon icon={<CampingIcon />} /> <span className={classes.legendItemText}>Campsite</span>
            </li>
            <li>
                <Icon icon={<MoneyBagIcon />} /> <span className={classes.legendItemText}>Shop</span>
            </li>
            <li>
                <Icon icon={TreasureChestImage} /> <span className={classes.legendItemText}>Treasure</span>
            </li>
            <li>
                <Icon icon={<QuestionMarkIcon />} /> <span className={classes.legendItemText}>Event</span>
            </li>
            <li>
                <Icon icon={<HouseIcon />} /> <span className={classes.legendItemText}>City</span>
            </li>
        </ul>
    );
};

export default Legend;
