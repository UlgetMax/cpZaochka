import React, {useState, useEffect} from "react"
import styles from "./addStudentsData.module.scss";
import { useNavigate } from "react-router-dom";
import { DOMParser } from "@xmldom/xmldom";
import PizZip from "pizzip";
// import { generateDocx } from "./generateDocx__addStudents";

import Arrow from "../../img/svg/Arrow.svg";

export default function AddStudentsData() {

    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [isEditing, setIsEditing] = useState({});


    useEffect(() => {
        if (window.electron) {
            window.electron.getGroups().then(setGroups).catch(console.error);
            window.electron.getSpecialties?.().then(setSpecialties).catch(console.error);
        } else {
            console.error("Electron API не доступен!");
        }
    }, []);


    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const zip = new PizZip(content);
                const xml = zip.files["word/document.xml"].asText();
                parseDocxTable(xml);
            };
            reader.readAsBinaryString(file);
        }
    };

    const parseDocxTable = (xml) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "text/xml");
    
        const rows = doc.getElementsByTagName("w:tr"); // Получаем все строки таблицы
        const extractedStudents = [];
    
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName("w:t");
    
            // Собираем весь текст из ячеек строки
            const fullName = Array.from(cells)
                .map(cell => cell.textContent.trim())
                .join(" ")
                .replace(/\s+/g, " "); // Убираем лишние пробелы
    
            if (!fullName) {
                console.warn(`В строке ${i} пустое ФИО, пропускаем`);
                continue;
            }
    
            // Разделяем ФИО на части
            const parts = fullName.split(" ");
            let lastName = "";
            let firstName = "";
            let middleName = "";
    
            if (parts.length === 2) {
                [lastName, firstName] = parts;
            } else if (parts.length === 3) {
                [lastName, firstName, middleName] = parts;
            } else if (parts.length >= 4) {
                lastName = parts[0];
                firstName = parts.slice(1, parts.length - 1).join("").replace(/\s+/g, ""); // Убираем разрывы внутри имени
                middleName = parts[parts.length - 1]; 
            }
    
            extractedStudents.push({
                id: Date.now() + i, 
                lastName,
                firstName,
                middleName,
            });
        }
    
        console.log("Извлечённые студенты:", extractedStudents);
        setStudents(extractedStudents);
    };
    
    
    const handleSave = () => {
        if (!selectedGroup || !selectedSpecialty) {
            alert("Выберите группу и специальность!");
            return;
        }

        const studentsWithIds = students.map(student => ({
            ...student,
            group_id: selectedGroup,
            specialty_id: selectedSpecialty,
        }));

        window.electron.addStudents(studentsWithIds)
            .then(() => {
                alert("Данные успешно сохранены!");
                setStudents([]);
            })
            .catch(err => {
                console.error("Ошибка сохранения данных:", err);
                alert("Ошибка при сохранении данных");
            });
    };


    const addStudentManually = () => {
        const newStudent = {
            id: Date.now(), 
            lastName: "",
            firstName: "",
            middleName: "",
        };
        setStudents(prev => [...prev, newStudent]);
        setIsEditing(prev => ({ ...prev, [newStudent.id]: true }));
    };
   
    const removeStudent = (id) => {
        setStudents(prev => prev.filter(student => student.id !== id));
        setIsEditing(prev => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
    };


    const handleEditChange = (id, field, value) => {
        setStudents(prev =>
            prev.map(student =>
                student.id === id ? { ...student, [field]: value } : student
            )
        );
    };


    const toggleEdit = (id) => {
        setIsEditing(prev => ({ ...prev, [id]: !prev[id] }));
    };


    return (
        <div className={styles.addStudents}>

            <div className={styles.addStudents__wrapper}>

                <div className={styles.addStudents__wrapper__input}>
                    <select className={styles.addStudents__wrapper__input__group} value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                        <option value="">Выберите группу</option>
                        {groups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>

                    <select className={styles.addStudents__wrapper__input__specialties} value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
                        <option value="">Выберите специальность</option>
                        {specialties.map(spec => (
                            <option key={spec.id} value={spec.id}>{spec.name}</option>
                        ))}
                    </select>


                    <button>Найти учащегося</button>
                    
                </div>
                
                <div className={styles.addStudents__wrapper__buttons}>
                    <input type="file" accept=".docx" onChange={handleFileUpload} />
                    <button onClick={addStudentManually}>Добавить студента</button>
                    <button onClick={handleSave}>Сохранить</button>
                </div>
                

                {students.length > 0 && (
                    <div className={styles.addStudents__wrapper__table}>
                        <table className={styles.studentsTable}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Фамилия</th>
                                    <th>Имя</th>
                                    <th>Отчество</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <input
                                                    type="text"
                                                    value={student.lastName}
                                                    onChange={(e) => handleEditChange(student.id, "lastName", e.target.value)}
                                                />
                                            ) : (
                                                student.lastName
                                            )}
                                        </td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <input
                                                    type="text"
                                                    value={student.firstName}
                                                    onChange={(e) => handleEditChange(student.id, "firstName", e.target.value)}
                                                />
                                            ) : (
                                                student.firstName
                                            )}
                                        </td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <input
                                                    type="text"
                                                    value={student.middleName}
                                                    onChange={(e) => handleEditChange(student.id, "middleName", e.target.value)}
                                                />
                                            ) : (
                                                student.middleName
                                            )}
                                        </td>
                                        <td>
                                            <button onClick={() => toggleEdit(student.id)}>
                                                {isEditing[student.id] ? "Сохранить" : "✏️"}
                                            </button>
                                            <button onClick={() => removeStudent(student.id)}>❌</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>

    )
}