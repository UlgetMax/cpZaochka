import { useEffect, useState } from "react";
import { loadWasm } from "../../wasmLoader";
import { generateDocx } from "../../generateDocx";
import { Link } from "react-router-dom";


export default function About() {

    const [data, setData] = useState(null);
    const [wasm, setWasm] = useState(null);

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
    

    return (
        <div>
            <h1>Страница О нас</h1>

            <Link to={"/"}>Домой</Link>

            <h1>Документ для {data.group}</h1>
            <button onClick={() => generateDocx(data.course, data.semester, data.group, data.students)}>
                Скачать DOCX
            </button> 
        </div>
    )
}