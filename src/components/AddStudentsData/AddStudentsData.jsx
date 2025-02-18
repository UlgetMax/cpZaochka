import React from "react"
import styles from "./dddStudentsData.module.scss";
import { loadWasm } from "../../wasmLoader";
import { generateDocx } from "./generateDocx__Statement";

export default function AddStudentsData() {

    const [dbData, setDbData] = useState([]);
    const [data, setData] = useState(null);
    const [wasm, setWasm] = useState(null);

    const navigate = useNavigate();

    const InputForm = ({ onSubmit }) => {
        const [inputValue, setInputValue] = useState("");

        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit(inputValue);
            setInputValue("");
        };

        return (
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Введите ФИО студента"
                />
                <button type="submit">Добавить</button>
            </form>
        );
    };

    const DataTable = ({ data }) => {
        if (!data || !data.students) {
            return <p>Нет данных для отображения</p>;
        }

        return (
            <div>
                <h2>Курс: {data.course}</h2>
                <h2>Семестр: {data.semester}</h2>
                <h2>Группа: {data.group}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.students.map((student, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{student}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };



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

    const handleAddData = (newStudent) => {
        // Добавление студента в данные
        const updatedData = {
            ...data,
            students: [...data.students, newStudent],
        };
        setData(updatedData);
    };

    return (
        <div className={styles.statement}>
            <div className={styles.statement__header}>

                <h1>Экзаменационная ведомость</h1>
            </div>

            <div className={styles.statement__wrapper}>

                <InputForm onSubmit={handleAddData} />

                {/* Таблица для отображения данных */}
                <DataTable data={dbData} />

            </div>

            <div className={styles.statement__footer}>
                <button onClick={() => generateDocx(data.course, data.semester, data.group, data.students)}>
                    Скачать DOCX
                </button>
            </div>

        </div>
    )
}