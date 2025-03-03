import React from "react";
import styles from "./TitleBar.module.scss";

import Logo from "../../../electron/assets/IconKitchen-Output/android/play_store_512.ico";

export default function TitleBar() {
    const handleMinimize = () => window.electron.send("minimize-window");
    const handleMaximize = () => window.electron.send("maximize-window");
    const handleClose = () => window.electron.send("close-window");

    const handleMenuClick = (action) => {
        window.electron.send("menu-action", action);
    };

    return (
        <div className={styles.titleBar}>
            <div className={styles.icon}>
            {/* <img src={Logo} alt="App Icon" className={styles.icon_ico} /> */}
            </div>
            

            <div className={styles.menu}>
                <span onClick={() => handleMenuClick("open")}>Файл</span>
                <span onClick={() => handleMenuClick("edit")}>Редактировать</span>
                <span onClick={() => handleMenuClick("help")}>Помощь</span>
            </div>
            <div className={styles.windowControls}>
                {/* <button onClick={handleMinimize}>🗕</button>
                <button onClick={handleMaximize}>🗖</button>
                <button onClick={handleClose}>🗙</button> */}
            </div>
        </div>
    );
}
