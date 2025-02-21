import React, {useState, useEffect} from "react"
import styles from "./addStudentsData.module.scss";
import { useNavigate } from "react-router-dom";
import { DOMParser } from "@xmldom/xmldom";
import PizZip from "pizzip";


export default function AddStudentsData() {

    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [isEditing, setIsEditing] = useState({});


    useEffect(() => {
        if (window.electron) {
            window.electron.getGroups().then(setGroups).catch(console.error);
            window.electron.getSpecialties().then(setSpecialties).catch(console.error);
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
        const rows = doc.getElementsByTagName("w:tr");
        const extractedStudents = [];

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName("w:t");
            const fullName = Array.from(cells)
                .map(cell => cell.textContent.trim())
                .join(" ")
                .replace(/\s+/g, " ");
            if (!fullName) continue;

            const parts = fullName.split(" ");
            let last_name = parts[0] || "";
            let first_name = parts[1] || "";
            let middle_name = parts[2] || "";

            extractedStudents.push({
                id: Date.now() + i, 
                last_name,
                first_name,
                middle_name,
                group_id: null,
                specialty_id: null,
            });
        }
        setStudents(extractedStudents);
    };

    const handleSave = () => {
        if (students.length === 0) return;
    
        window.electron.addStudents(students)
            .then((response) => {
                if (response.success) {
                    alert("Данные успешно сохранены!");
                    setStudents([]);
                    setSelectedStudents(new Set());
                } else {
                    alert("Ошибка при сохранении данных: " + response.error);
                }
            })
            .catch(err => {
                console.error("Ошибка сохранения:", err);
                alert("Ошибка при сохранении данных");
            });
    };

    const handleBulkUpdate = () => {
        const updatedStudents = students.filter(student => selectedStudents.has(student.id));
        if (updatedStudents.length === 0) {
            alert("Выберите хотя бы одного студента!");
            return;
        }
    
        window.electron.updateStudents(updatedStudents)
            .then((response) => {
                if (response.success) {
                    alert("Изменения сохранены!");
                    setStudents(prev => prev.filter(student => !selectedStudents.has(student.id)));
                    setSelectedStudents(new Set());
                } else {
                    alert("Ошибка при обновлении данных: " + response.error);
                }
            })
            .catch(err => {
                console.error("Ошибка обновления:", err);
                alert("Ошибка при обновлении данных");
            });
    };

    const removeSelectedStudents = () => {
        if (selectedStudents.size === 0) return;
    
     
        const confirmDelete = window.confirm("Вы уверены, что хотите удалить выбранные записи? Это действие нельзя отменить.");
        if (!confirmDelete) return;
    

        const studentsToDelete = students.filter(student => selectedStudents.has(student.id));
    
 
        window.electron.deleteStudents(studentsToDelete)
            .then((response) => {
                if (response.success) {
                    alert("Записи успешно удалены!");
                    setStudents(prev => prev.filter(student => !selectedStudents.has(student.id)));
                    setSelectedStudents(new Set());
                } else {
                    alert("Ошибка при удалении записей: " + response.error);
                }
            })
            .catch(err => {
                console.error("Ошибка удаления:", err);
                alert("Ошибка при удалении записей");
            });
    };

    const addStudentManually = () => {
        const newStudent = {
            id: Date.now(),
            last_name: "",
            first_name: "",
            middle_name: "",
            group_id: null,
            specialty_id: null,
        };
        setStudents(prev => [...prev, newStudent]);
    };

    const handleEditChange = (id, field, value) => {
        setStudents(prev => prev.map(student => student.id === id ? { ...student, [field]: value } : student));
    };

    const toggleSelectStudent = (id) => {
        setSelectedStudents(prev => {
            const updated = new Set(prev);
            updated.has(id) ? updated.delete(id) : updated.add(id);
            return updated;
        });
    };

    const toggleSelectAll = () => {
        setSelectedStudents(prev => (prev.size === students.length ? new Set() : new Set(students.map(s => s.id))));
    };

    const handleFindStudents = () => {
        if (!selectedGroup && !selectedSpecialty) {
            alert("Выберите группу или специальность!");
            return;
        }
    
        window.electron.getStudentsByGroupAndSpecialty(
            selectedGroup ? parseInt(selectedGroup) : null,
            selectedSpecialty ? parseInt(selectedSpecialty) : null
        )
            .then((data) => {
                setStudents(data.map(student => ({
                    ...student,
                    group_id: student.group_id,  // Сохраняем ID группы
                    specialty_id: student.specialty_id,  // Сохраняем ID специальности
                    group_name: student.group_name || "—",  // Используем правильные названия
                    specialty_name: student.specialty_name || "—"
                })));
            })
            .catch(console.error);
    };
    
    const updateSelectedStudentsGroupOrSpecialty = (field, value) => {
        setStudents(prev =>
            prev.map(student =>
                selectedStudents.has(student.id) || student.id === null 
                    ? { 
                        ...student, 
                        [field]: value, 
                        group_name: field === "group_id" 
                            ? groups.find(g => g.id == value)?.name || "—" 
                            : student.group_name,
                        specialty_name: field === "specialty_id" 
                            ? specialties.find(s => s.id == value)?.name || "—" 
                            : student.specialty_name
                    }
                    : student
            )
        );
    };
    

    const toggleEdit = (id) => {
        setIsEditing(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const removeStudent = (id) => {
        setStudents(prev => prev.filter(student => student.id !== id));
    };
    

    return (
        <div className={styles.addStudents}>

            <div className={styles.addStudents__wrapper}>

                <div className={styles.addStudents__wrapper__input}>
                    <select
                        value={selectedGroup}
                        onChange={(e) => {
                            setSelectedGroup(e.target.value);
                            updateSelectedStudentsGroupOrSpecialty("group_id", e.target.value);
                        }}
                    >
                        <option value="">Выберите группу</option>
                        {groups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedSpecialty}
                        onChange={(e) => {
                            setSelectedSpecialty(e.target.value);
                            updateSelectedStudentsGroupOrSpecialty("specialty_id", e.target.value);
                        }}
                    >
                        <option value="">Выберите специальность</option>
                        {specialties.map(spec => (
                            <option key={spec.id} value={spec.id}>{spec.name}</option>
                        ))}
                    </select>


                    <button onClick={handleFindStudents}>Найти учащихся</button>

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
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.size === students.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>#</th>
                                    <th>Фамилия</th>
                                    <th>Имя</th>
                                    <th>Отчество</th>
                                    <th>Группа</th>
                                    <th>Специальность</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.id || index}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.has(student.id)}
                                                onChange={() => toggleSelectStudent(student.id)}
                                            />
                                        </td>
                                        <td>{index + 1}</td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <input type="text" value={student.last_name} onChange={(e) => handleEditChange(student.id, "last_name", e.target.value)} />
                                            ) : (
                                                student.last_name
                                            )}
                                        </td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <input type="text" value={student.first_name} onChange={(e) => handleEditChange(student.id, "first_name", e.target.value)} />
                                            ) : (
                                                student.first_name
                                            )}
                                        </td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <input type="text" value={student.middle_name} onChange={(e) => handleEditChange(student.id, "middle_name", e.target.value)} />
                                            ) : (
                                                student.middle_name
                                            )}
                                        </td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <select
                                                    value={student.group_id || ""}
                                                    onChange={(e) => handleEditChange(student.id, "group_id", e.target.value)}
                                                >
                                                    <option value="">Выберите группу</option>
                                                    {groups.map(group => (
                                                        <option key={group.id} value={group.id}>{group.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                student.group_name || "—"
                                            )}
                                        </td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <select
                                                    value={student.specialty_id || ""}
                                                    onChange={(e) => handleEditChange(student.id, "specialty_id", e.target.value)}
                                                >
                                                    <option value="">Выберите специальность</option>
                                                    {specialties.map(spec => (
                                                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                student.specialty_name || "—"
                                            )}
                                        </td>
                                        <td>
                                            <button onClick={() => toggleEdit(student.id)}>✏️</button>
                                            <button onClick={() => removeStudent(student.id)}>❌</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                )}

                {selectedStudents.size > 0 && (
                    <div className={styles.addStudents__wrapper__editButtons}>
                        <button className={styles.addStudents__wrapper__editButtons__save} onClick={handleBulkUpdate}>Применить изменения</button>
                        <button className={styles.addStudents__wrapper__editButtons__delete} onClick={removeSelectedStudents}>Удалить выбранные</button>
                    </div>
                )}
            </div>

        </div>

    )
}