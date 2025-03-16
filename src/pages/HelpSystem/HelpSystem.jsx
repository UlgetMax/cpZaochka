import React from "react";
import styles from "./helpSystem.module.scss";
import { Link, Outlet } from "react-router-dom";

export default function HelpSystem() {
    return (
        <div className={styles.helpSystem}>
            <h1>Справочная система</h1>
            <div className={styles.helpSystem__container}>
                <nav className={styles.helpSystem__sidebar}>
                    <ul>
                        <li>
                            <Link to="instructions" className={styles.helpSystem__sidebar__text}>
                                Инструкции
                            </Link>
                        </li>
                        <li>
                            <Link to="faq" className={styles.helpSystem__sidebar__text}>
                                Часто задаваемые вопросы
                            </Link>
                        </li>
                        <li>
                            <Link to="troubleshooting" className={styles.helpSystem__sidebar__text}>
                                Решение проблем
                            </Link>
                        </li>
                    </ul>
                </nav>


                <main className={styles.helpSystem__content}>
                    <Outlet /> 
                </main>
            </div>
        </div>
    );
}