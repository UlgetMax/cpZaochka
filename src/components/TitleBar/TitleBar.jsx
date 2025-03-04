import React, {useState, useEffect, useRef} from "react";
import styles from "./TitleBar.module.scss";

import Logo from "../../../electron/assets/IconKitchen-Output/android/play_store_512.ico";

export default function TitleBar() {
    const handleMinimize = () => window.electron.send("minimize-window");
    const handleMaximize = () => window.electron.send("maximize-window");
    const handleClose = () => window.electron.send("close-window");
    
    const [openDropdown, setOpenDropdown] = useState(null);
    const menuRef = useRef(null);

    const handleMenuClick = (event, action) => {
        event.stopPropagation(); 
        setOpenDropdown(openDropdown === action ? null : action);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.titleBar}>

            <div className={styles.titleBar__wrapper}>
                

                <div className={styles.titleBar__wrapper__tools}>
                    <div className={styles.icon}>
                        <img src={Logo} alt="App Icon" className={styles.icon_ico} />
                    </div>


                    <div className={styles.menu} ref={menuRef}>
                        <div className={styles.menuItem} onClick={(e) => handleMenuClick(e, "open")}>
                            <span>Файл</span>
                            {openDropdown === "open" && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownItem}>Новый файл</div>
                                    <div className={styles.dropdownItem}>Открыть</div>
                                    <div className={styles.dropdownItem}>Сохранить</div>
                                </div>
                            )}
                        </div>

                        <div className={styles.menuItem} onClick={(e) => handleMenuClick(e, "edit")}>
                            <span>Редактировать</span>
                            {openDropdown === "edit" && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownItem}>Вырезать</div>
                                    <div className={styles.dropdownItem}>Копировать</div>
                                    <div className={styles.dropdownItem}>Вставить</div>
                                </div>
                            )}
                        </div>

                        <div className={styles.menuItem} onClick={(e) => handleMenuClick(e, "help")}>
                            <span>Помощь</span>
                            {openDropdown === "help" && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownItem}>Документация</div>
                                    <div className={styles.dropdownItem}>О программе</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.windowControls}>
                    <button onClick={handleMinimize}>🗕</button>
                    <button onClick={handleMaximize}>🗖</button>
                    <button onClick={handleClose}>🗙</button>
                </div>
            </div>
            
        </div>
    );
}
