import React, { useEffect, useState } from "react";
import styles from "./statement.module.scss";
import { Link, useNavigate } from "react-router-dom"; 
import { loadWasm } from "../../wasmLoader";
import { generateDocx } from "./generateDocx__Statement";

import Arrow from "../../img/svg/Arrow.svg";



export default function Statement() {


    const [data, setData] = useState(null);
    const [wasm, setWasm] = useState(null);

    const [searchTerm, setSearchTerm] = useState(""); // Добавлено состояние для поиска
    const [filteredItems, setFilteredItems] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        loadWasm().then((wasmModule) => {
            setWasm(wasmModule);

            const jsonData = wasmModule.getData();
            setData(jsonData);
        }).catch((error) => console.error("Ошибка загрузки WASM:", error));

    }, []);


    if (!data) {
        return <p>Загрузка...</p>;
    }

    const handleGoBack = () => {
        navigate(-1);
    }

    const items = [
        "Математика",
        "Физика",
        "Химия",
        "Биология",
        "История",
        "География",
        "Литература",
        "Информатика"
      ];
      const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Фильтрация списка на основе введенного текста
        const filtered = items.filter((item) =>
          item.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredItems(filtered);
      };

    const handleItemClick = (item) => {
        setSearchTerm(item);
        setFilteredItems([]);
    }

    return (
        <div className={styles.statement}>
            <div className={styles.statement__header}>
                <div className={styles.statement__header__img} onClick={handleGoBack}>
                    <Arrow className={styles.statement__header__arrow} />
                </div>

                <h1>Экзаменационная ведомость</h1>
            </div>

            <div className={styles.statement__wrapper}>

                <input
                    className={styles.statement__wrapper__class}
                    type="text"
                    placeholder="Введите учебный предмет"
                />

                <div className={styles.statement__wrapper__group}>
                    <input
                        className={styles.statement__wrapper__group}
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Введите учебный предмет"
                    />

                    {filteredItems.length > 0 && (
                        <ul className={styles.dropdownList}>
                            {filteredItems.map((item, index) => (
                                <li
                                    key={index}
                                    className={styles.dropdownItem}
                                    onClick={() => handleItemClick(item)}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>



            </div>

            <div className={styles.statement__footer}>
                <button onClick={() => generateDocx(data.course, data.semester, data.group, data.students)}>
                    Скачать DOCX
                </button>
            </div>

        </div>
    )
}
