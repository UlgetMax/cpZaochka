import React from "react";

import styles from "./helpSystemComponent.module.scss";

export default function Instructions() {
    return (
        <div className={styles.instructions}>
            <h2>Инструкции по использованию</h2>
            <p>В этом разделе вы найдете пошаговые инструкции по использованию приложения.</p>
            <ul>
                <li>Как добавить нового студента.</li>
                <li>Как редактировать данные студента.</li>
                <li>Как удалить студента.</li>
            </ul>
        </div>
    );
};
