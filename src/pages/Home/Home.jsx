import { useEffect, useState } from "react";
import styles from "./home.module.scss";
import { Link } from "react-router-dom"; 
import { loadWasm } from "../../wasmLoader";
import { generateDocx } from "../../generateDocx";

export default function Home() {

    const [dbStatus, setDbStatus] = useState("Проверка подключения...");
    // const [users, setUsers] = useState([]);

    // const [data, setData] = useState(null);
    // const [wasm, setWasm] = useState(null);

    useEffect(() => {
        window.electron.checkDbStatus().then(setDbStatus);
    }, []);

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
            <h1>Главная Страница</h1>
            <h2>{dbStatus}</h2>
            <div className={styles.home__wrapper}>

                <Link className={styles.home__block} to={"/statement"}>


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