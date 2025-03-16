import React from "react";

export default function Troubleshooting() {
    return (
        <div>
            <h2>Решение проблем</h2>
            <p>В этом разделе описаны решения для распространенных проблем.</p>
            <ul>
                <li>
                    <strong>Приложение не запускается.</strong>
                    <p>Проверьте, установлены ли все необходимые зависимости.</p>
                </li>
                <li>
                    <strong>Данные не сохраняются.</strong>
                    <p>Убедитесь, что вы подключены к базе данных.</p>
                </li>
            </ul>
        </div>
    );
};
