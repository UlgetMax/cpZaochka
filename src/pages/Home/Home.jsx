import { useEffect, useState } from "react";
import styles from "./home.module.scss";
import { Link } from "react-router-dom"; 
import { loadWasm } from "../../wasmLoader";
import { generateDocx } from "../../generateDocx";

export default function Home() {

    const [dbStatus, setDbStatus] = useState("Проверка подключения...");
    const [searchTerm, setSearchTerm] = useState("");
    
    const blocks = [
        { id: 1, title: "Экзаменационная ведомость", path: "/statement", className: styles.statement },
        { id: 2, title: "Приложение к диплому", path: "/diplomsupplement", className: styles.grades },
        { id: 3, title: "Учебное расписание", path: "/schedule", className: styles.schedule },
        { id: 4, title: "Список студентов", path: "/students", className: styles.students },
        { id: 5, title: "Преподаватели", path: "/teachers", className: styles.teachers },
    ];

    // const [users, setUsers] = useState([]);

    // const [data, setData] = useState(null);
    // const [wasm, setWasm] = useState(null);

    useEffect(() => {
        window.electron.checkDbStatus().then(setDbStatus);
    }, []);

    const filteredBlocks = blocks.filter(block =>
        block.title.toLowerCase().includes(searchTerm.toLowerCase())
    );



    // useEffect(() => {
    //     window.electron.getUsers().then(setUsers);
    // }, []);

    // useEffect(() => {
    //     loadWasm().then((wasmModule) => {
    //         setWasm(wasmModule);

    //         const jsonData = wasmModule.getData();
    //         setData(jsonData);
    //     }).catch((error) => console.error("Ошибка загрузки WASM:", error));

    // }, []);


    // if (!data) {
    //     return <p>Загрузка...</p>;
    // }



    return (
        <div className={styles.home}>
            <div className={styles.home__header}>

                <div className={styles.home__header__addData}>
                    <Link to={"/addData"} className={styles.home__addData__btn}>
                        Добавить данные
                    </Link>
                    <h2>{dbStatus}</h2>
                </div>

                <h1>Главная Страница</h1>

                <input
                    className={styles.home__header__classInput}
                    type="text"
                    placeholder="Поиск..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            
            
            <div className={styles.home__wrapper}>

                {filteredBlocks.length > 0 ? (
                    filteredBlocks.map(block => (
                        <Link key={block.id} className={`${styles.home__block} ${block.className}`} to={block.path}>
                            <div className={styles.home__textTitle}>{block.title}</div>
                        </Link>
                    ))
                ) : (
                    <p className={styles.noResults}>Ничего не найдено</p>
                )}


                {/* Статичные блоки */}


                {/* <Link className={`${styles.home__block} ${styles.statement}`} to={"/statement"}>


                    <div className={styles.home__textTitle}>
                        Экзаменационная ведомость
                    </div>

                </Link>
                

                <Link className={`${styles.home__block} ${styles.grades}`} to={"/diplomsupplement"}>


                    <div className={styles.home__textTitle}>
                        Приложение к диплому
                    </div>

                </Link>

                <Link className={styles.home__block} to={"/about"}>


                    <div className={styles.home__textTitle}>
                        Text
                    </div>

                </Link>

                <Link className={styles.home__block} to={"/about"}>


                    <div className={styles.home__textTitle}>
                        Text
                    </div>

                </Link>

                <Link className={styles.home__block} to={"/about"}>


                    <div className={styles.home__textTitle}>
                        Text
                    </div>

                </Link> */}

                
                
            </div>

            {/* <p>{dbStatus}</p> */}
            {/* {users.map((user, index) => (
                <li key={index}>
                    {user.firstname} {user.lastname} - {user.location}
                </li>
            ))} */}
            {/* <h1>Документ для {data.group}</h1>
            <button onClick={() => generateDocx(data.course, data.semester, data.group, data.students)}>
                Скачать DOCX
            </button> */}



        </div>
    )
}