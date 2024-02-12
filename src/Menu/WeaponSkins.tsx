import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Popper from "@material-ui/core/Popper";
import classNames from "classnames";
import { RefObject, useRef, useState } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
        borderRight: "1px solid rgba(255, 255, 255, 0.3)",
        margin: "0 4px",
    },
    itemContainer: {
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
    },
    menuToggle: {
        boxSizing: "content-box",
        height: "50px",
        width: "50px",
        padding: "4px 8px",
        verticalAlign: "top",
        "& img": {
            width: "50px",
        },
    },
    item: {
        boxSizing: "content-box",
        height: "50px",
        width: "50px",
        margin: "4px",
        padding: "4px",
        display: "inline-block",
        verticalAlign: "top",
        "& img": {
            width: "50px",
        },
    },
    selectedItem: {
        border: "1px solid rgba(255, 255, 255, 0.8)",
    },
    menu: {
        background: "rgba(50, 46, 46, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: "4px",
        fontFamily: "Barlow",
        zIndex: "1000",
        color: "white",
        maxWidth: 300,
    },
    menuInner: {
        padding: "16px",
    },
    header: {
        fontSize: "18px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.4)",
        paddingBottom: "8px",
        marginBottom: "8px",
    },
    useButtonContainer: {
        marginTop: "8px",
    },
});

const WeaponSkins = ({ player, onSelectWeaponSkin }) => {
    const [weaponSkinInventoryOpen, setWeaponSkinInventoryOpen] = useState(false);
    const menuAnchor = useRef() as RefObject<HTMLDivElement>;
    const classes = useStyles();

    const handleClose = () => {
        setWeaponSkinInventoryOpen(false);
    };

    return (
        <div className={classes.root} ref={menuAnchor}>
            <div onClick={() => setWeaponSkinInventoryOpen((prev) => !prev)} className={classes.menuToggle}>
                <img src={player.weapon} alt="Currently equipped" />
            </div>
            {weaponSkinInventoryOpen && (
                <Popper anchorEl={menuAnchor.current} open={true} placement={"bottom-start"} className={classes.menu}>
                    <ClickAwayListener onClickAway={handleClose}>
                        <div className={classes.menuInner}>
                            <div className={classes.header}>Weapon Skins</div>
                            {(player.weaponSkins || []).map(({ name, image }) => (
                                <div
                                    onClick={() => onSelectWeaponSkin(image)}
                                    key={name}
                                    className={classNames(classes.item, {
                                        [classes.selectedItem]: image === player.weapon,
                                    })}
                                >
                                    <img src={image} alt={name} title={name} />
                                </div>
                            ))}
                        </div>
                    </ClickAwayListener>
                </Popper>
            )}
        </div>
    );
};

export default WeaponSkins;
