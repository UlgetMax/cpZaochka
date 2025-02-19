import React, { useEffect, useState } from "react";
import styles from "./statement.module.scss";
import { useNavigate } from "react-router-dom"; 
import { generateDocx } from "./generateDocx__Statement";

import Arrow from "../../img/svg/Arrow.svg";



export default function Statement() {

    const [searchTerm, setSearchTerm] = useState("");
    const [groups, setGroups] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [students, setStudents] = useState([]);
    const [editedStudents, setEditedStudents] = useState({});
    const [isEditing, setIsEditing] = useState({});

    const [predmet, setPredmet] = useState("");
    const [course, setCourse] = useState(""); 
    const [semester, setSemester] = useState(""); 


    const navigate = useNavigate();

    useEffect(() => {
        if (window.electron && window.electron.getGroups) {
            window.electron.getGroups().then(setGroups).catch(console.error);
          } else {
            console.error("window.electron.getGroups не определен!");
          }          
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setFilteredItems(groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())));
        } else {
            setFilteredItems([]);
        }
    }, [searchTerm, groups]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleItemClick = (group) => {
        setSelectedGroup(group);
        setSearchTerm(group.name);
        setFilteredItems([]);

        window.electron.getStudentsByGroup(group.id).then((data) => {
            setStudents(data);

            const updatedEditedStudents = {};
            data.forEach(student => {
                updatedEditedStudents[student.id] = student.full_name;
            });
            setEditedStudents(updatedEditedStudents);
        });
    };

    

    const handleGoBack = () => {
        navigate(-1);
    }

    const handleEditChange = (id, value) => {
        setEditedStudents(prev => ({
            ...prev,
            [id]: value
        }));
    };
    const toggleEdit = (id) => {
        setIsEditing(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };


    const handleDownloadDocx = () => {
        if (!students || !Array.isArray(students) || students.length === 0) {
            console.error("Ошибка: Список студентов пуст или не определён.");
            return;
        }
    
        const formattedStudents = students.map(student => ({
            id: student.id,
            name: editedStudents[student.id] || student.full_name 
        }));
    
        generateDocx(course, semester, selectedGroup?.name || "Не выбрано", formattedStudents, "ПОиТ", predmet, "Панасюк Наталья");
    };
    
    


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
                    className={styles.statement__wrapper__classInput}
                    type="text"
                    placeholder="учебный предмет"
                    onChange={(e) => setPredmet(e.target.value)}
                />


                <div className={styles.statement__wrapper__Row}>
                    <div className={styles.statement__wrapper__group}>
                        <input
                            className={styles.statement__wrapper__groupInput}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            placeholder="Выберите учебную группу"
                        />

                        {filteredItems.length > 0 && (
                            <ul className={styles.dropdownList}>
                                {filteredItems.map((item) => (
                                    <li
                                        key={item.id}
                                        className={styles.dropdownItem}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        {item.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className={styles.statement__wrapper__curs}>
                        <input
                            className={styles.statement__wrapper__cursInput}
                            type="text"
                            placeholder="Курс"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                        />
                    </div>

                    <div className={styles.statement__wrapper__semester}>
                        <input
                            className={styles.statement__wrapper__semesterInput}
                            type="text"
                            placeholder="Семестр"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        />
                    </div>
                </div>

                {selectedGroup && (
                    <div className={styles.statement__tableWrapper}>
                        <table className={styles.statement__table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>ФИО</th>
                                    <th></th> 
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student, index) => (
                                        <tr key={student.id}>
                                            <td className={styles.id__col}>{index + 1}</td>
                                            <td className={styles.fio__col}>
                                                {isEditing[student.id] ? (
                                                    <input
                                                        type="text"
                                                        value={editedStudents[student.id] || ""}
                                                        onChange={(e) => handleEditChange(student.id, e.target.value)}
                                                    />
                                                ) : (
                                                    editedStudents[student.id]
                                                )}
                                            </td>
                                            <td>
                                                <Arrow
                                                    className={styles.editIcon}
                                                    onClick={() => toggleEdit(student.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">Нет студентов в этой группе</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}


            </div>

            <div className={styles.statement__footer}>
                <button className={styles.statement__footer__btn} onClick={handleDownloadDocx}>
                    Скачать DOCX
                </button>
            </div>

        </div>
    )
}
