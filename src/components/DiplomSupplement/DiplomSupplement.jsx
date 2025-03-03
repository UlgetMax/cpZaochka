import React, { useState, useEffect } from "react";
import styles from "./diplomSupplement.module.scss";
import { useNavigate } from "react-router-dom";
import { generateDocx__DiplomSupplement } from "./generateDocx__DiplomSupplement";


import Arrow from "../../img/svg/Arrow.svg";

export default function DiplomSupplement() {
    const navigate = useNavigate();
    const [predmet, setPredmet] = useState("");
    const [teacher, setTeacher] = useState("");
    const [specialties, setSpecialties] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [isEditing, setIsEditing] = useState({});
    const [grades, setGrades] = useState({});
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [students, setStudents] = useState([]);
    const [course, setCourse] = useState("");
    const [tables, setTables] = useState([]);



    useEffect(() => {
        if (window.electron && window.electron.getGroups) {
            window.electron.getGroups().then(setGroups).catch(console.error);
            window.electron.getSpecialties().then(setSpecialties).catch(console.error);
        } else {
            console.error("window.electron.getGroups не определен!");
        }
    }, []);

    const handlePrintDocx = () => {
        const tablesData = tables.map((table) => ({
            group: table.group?.name || "—",
            specialization: table.specialization || "—",
            predmet: table.predmet,
            teacher: table.teacher,
            students: table.students.map((student) => ({
                full_name: student.full_name,
                semestrGrades: student.grades?.semestrGrades || "—",
                diplomGrade: student.grades?.diplomGrade || "—",
            })),
        }));

        generateDocx__DiplomSupplement(tablesData);
    };

    const addTable = () => {
        const newTable = {
            id: Date.now(),
            predmet: predmet,
            teacher: teacher,
            students: students,
            grades: {...grades}
        };
        setTables([...tables, newTable]);
        setPredmet("");
        setTeacher("");
        setStudents([]);
        setGrades({});
    };


    const handleGoBack = () => {
        navigate(-1);
    }


    const handleItemClick = (group) => {
        if (!group) {
            setSelectedGroup(null);
            setCourse("");
            setStudents([]);
            return;
        }

        setSelectedGroup(group);

        window.electron.getStudentsByGroup(group.id).then((data) => {
            setStudents(data.map(student => ({
                ...student,
                group_name: group.name,
                specialty_name: student.specialty_id
                    ? (specialties.find(spec => spec.id === student.specialty_id)?.name || "—")
                    : "—",
            })));

            const updatedGrades = {};
            data.forEach(student => {
                updatedGrades[student.id] = { semestrGrades: "", diplomGrade: "" };
            });
            setGrades(updatedGrades);
        });
    };




    const handleGradeChange = (id, field, value) => {
        setGrades(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value, 
            },
        }));
    };


    const handleEditChange = (id, field, value) => {
        setStudents(prev =>
            prev.map(student =>
                student.id === id ? { ...student, [field]: value } : student
            )
        );
    };
    const handleEditTable = (tableId, predmet, teacher) => {
        setTables(prevTables =>
            prevTables.map(table =>
                table.id === tableId
                    ? { ...table, predmet, teacher }
                    : table
            )
        );
    };

    const handleDeleteTable = (tableId) => {
        setTables(prevTables => prevTables.filter(table => table.id !== tableId));
    };

    const handleEdit = (tableId, studentId, field, value) => {
        setTables(prevTables =>
            prevTables.map(table =>
                table.id === tableId ? {
                    ...table,
                    grades: {
                        ...table.grades,
                        [studentId]: {
                            ...table.grades[studentId],
                            [field]: value
                        }
                    }
                } : table
            )
        );
    };

    const handleDelete = (tableId, studentId) => {
        setTables(prevTables =>
            prevTables.map(table =>
                table.id === tableId
                    ? {
                        ...table,
                        students: table.students.filter(student => student.id !== studentId),
                        grades: Object.keys(table.grades).reduce((acc, key) => {
                            if (key !== studentId.toString()) {
                                acc[key] = table.grades[key];
                            }
                            return acc;
                        }, {}),
                    }
                    : table
            )
        );
    };

    const toggleSelectAll = () => {
        setSelectedStudents(prev => (prev.size === students.length ? new Set() : new Set(students.map(s => s.id))));
    };

    const toggleSelectStudent = (id) => {
        setSelectedStudents(prev => {
            const updated = new Set(prev);
            updated.has(id) ? updated.delete(id) : updated.add(id);
            return updated;
        });
    };


    const toggleEdit = (id) => {
        setIsEditing(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const removeStudent = (id) => {
        setStudents(prev => prev.filter(student => student.id !== id));
    };


    const numberToText = (num) => {
        const gradesMap = {
            1: "один",
            2: "два",
            3: "три",
            4: "четыре",
            5: "пять",
            6: "шесть",
            7: "семь",
            8: "восемь",
            9: "девять",
            10: "десять",
        };
        return gradesMap[num] ? `${num} (${gradesMap[num]})` : num;
    };

    const validateSemestrGrades = (input) => {
        const numbers = input
            .split(" ")
            .map((num) => parseInt(num))
            .filter((num) => num >= 1 && num <= 10);

        return numbers.join(" ");
    };

    const validateGrades = (input) => {
        const numbers = input
            .split(" ")
            .map((num) => parseInt(num))
            .filter((num) => num >= 1 && num <= 10);

        return numbers.length > 0 ? numbers[0].toString() : "";
    };



    const validateInputOnFly = (input, isSemestrGrades = true) => {
        if (isSemestrGrades) {
          // Для оценок за семестры разрешаем цифры и пробелы
          return input.replace(/[^0-9\s]/g, "");
        } else {
          // Для отметки к диплому разрешаем только цифры
          return input.replace(/[^0-9]/g, "");
        }
      };

    
    


    return (
        <div className={styles.supplement}>

            <div className={styles.supplement__header}>
                <div className={styles.supplement__header__img} onClick={handleGoBack}>
                    <Arrow className={styles.supplement__header__arrow} />
                </div>

                <h1>Ведомость приложение к диплому</h1>
            </div>


            <div className={styles.supplement__wrapper}>


                <div className={styles.supplement__wrapper__rowInput}>
                    <input
                        className={styles.rowInput__classInput}
                        type="text"
                        placeholder="Учебный предмет"
                        onChange={(e) => setPredmet(e.target.value)}
                    />

                    <input
                        className={styles.rowInput__classInput}
                        type="text"
                        placeholder="Преподаватель"
                        onChange={(e) => setTeacher(e.target.value)}
                    />
                </div>

                <div className={styles.supplement__wrapper__rowSelect}>

                    <select
                        className={styles.rowSelect__groupSelect}
                        value={selectedGroup?.id || ""}
                        onChange={(e) => {
                            const groupId = e.target.value ? parseInt(e.target.value) : null;
                            const group = groups.find(g => g.id === groupId) || null;
                            handleItemClick(group);
                        }}
                    >

                        <option value="">Выберите учебную группу</option>
                        {groups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>


                    {/* 
                    <select
                        className={styles.rowSelect__groupSelect}
                        value={selectedSpecialty}
                        onChange={(e) => {
                            setSelectedSpecialty(e.target.value);
                        }}
                    >
                        <option value="">Выберите специальность</option>
                        {specialties.map(spec => (
                            <option key={spec.id} value={spec.id}>{spec.name}</option>
                        ))}
                    </select> */}


                    <button onClick={addTable}>Добавить таблицу</button>


                </div>

                {students.length > 0 && (
                    <div className={styles.supplement__tableWrapper}>
                        <table className={styles.supplement__table}>
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
                                    <th>ФИО</th>
                                    <th>Группа</th>
                                    <th>Специальность</th>
                                    <th>Оценки за семестры</th>
                                    <th>Отметка к диплому</th>
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
                                                <input
                                                    type="text"
                                                    value={student.full_name}
                                                    onChange={(e) => handleEditChange(student.id, "full_name", e.target.value)}
                                                />
                                            ) : (
                                                student.full_name
                                            )}
                                        </td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <select
                                                    value={student.group_id || ""}
                                                    onChange={(e) => handleEditChange(student.id, "group_id", e.target.value)}
                                                >
                                                    <option value="">Выберите группу</option>
                                                    {groups.map((group) => (
                                                        <option key={group.id} value={group.id}>
                                                            {group.name}
                                                        </option>
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
                                                    {specialties.map((spec) => (
                                                        <option key={spec.id} value={spec.id}>
                                                            {spec.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                student.specialty_name || "—"
                                            )}
                                        </td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <input
                                                    type="text"
                                                    value={grades[student.id]?.semestrGrades || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;

                                                        const validatedValue = validateInputOnFly(value, true);
                                                        handleGradeChange(student.id, "semestrGrades", validatedValue);
                                                    }}
                                                    placeholder="Оценки через пробел"
                                                />
                                            ) : (
                                                grades[student.id]?.semestrGrades
                                                    ?.split(" ")
                                                    .map((num) => numberToText(num))
                                                    .join(", ") || "—"
                                            )}
                                        </td>
                                        <td>
                                            {isEditing[student.id] ? (
                                                <input
                                                    type="text"
                                                    value={grades[student.id]?.diplomGrade || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                      
                                                        const validatedValue = validateInputOnFly(value, false);
                                                        handleGradeChange(student.id, "diplomGrade", validatedValue);
                                                    }}
                                                    placeholder="Итоговая оценка"
                                                />
                                            ) : (
                                                numberToText(grades[student.id]?.diplomGrade) || "—"
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

                <div className={styles.supplement__tableWrapperAdd__add}>
                    {tables.map((table) => (
                        <TableComponent
                            key={table.id}
                            table={table}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onEditTable={handleEditTable}
                            onDeleteTable={handleDeleteTable}
                            numberToText={numberToText} 
                            validateGrades={validateGrades}
                            validateSemestrGrades={validateSemestrGrades}
                            validateInputOnFly={validateInputOnFly}
                        />
                    ))}
                </div>

                
            </div>

            <div className={styles.supplement__footer}>
                <button onClick={handlePrintDocx}>Печатать DOCX</button>
            </div>
        </div>
    )
}


const TableComponent = ({
    table,
    onEdit,
    onDelete,
    onEditTable,
    onDeleteTable,
    numberToText,
    validateGrades,
    validateSemestrGrades,
    validateInputOnFly, 
}) => {
    const [isEditingTable, setIsEditingTable] = useState(false);
    const [editedPredmet, setEditedPredmet] = useState(table.predmet);
    const [editedTeacher, setEditedTeacher] = useState(table.teacher);
    const [isEditingRow, setIsEditingRow] = useState({});

    const handleSave = () => {
        onEditTable(table.id, editedPredmet, editedTeacher);
        setIsEditingTable(false);
    };

    const handleEditRow = (studentId, field, value) => {
        if (field === "semestrGrades") {
          if (!isEditingRow[studentId]) {
            value = validateSemestrGrades(value); 
          }
        } else if (field === "diplomGrade") {
          if (!isEditingRow[studentId]) {
            value = validateGrades(value); 
          }
        }
        onEdit(table.id, studentId, field, value);
      };

    const toggleEditRow = (studentId) => {
        setIsEditingRow((prev) => ({
            ...prev,
            [studentId]: !prev[studentId],
        }));
    };

    return (
        <div className={styles.supplement__tableWrapperAdd}>
            {isEditingTable ? (
                <div className={styles.supplement__tableWrapperAdd__input}>
                    <input
                        type="text"
                        value={editedPredmet}
                        onChange={(e) => setEditedPredmet(e.target.value)}
                        placeholder="Учебный предмет"
                    />
                    <input
                        type="text"
                        value={editedTeacher}
                        onChange={(e) => setEditedTeacher(e.target.value)}
                        placeholder="Преподаватель"
                    />
                    <button onClick={handleSave}>Сохранить</button>
                </div>
            ) : (
                <div className={styles.supplement__tableWrapperAdd__button}>
                    <span>
                        <h3>Учебный предмет: {table.predmet}</h3>
                        <h3>Преподаватель: {table.teacher}</h3>
                    </span>
                    <span className={styles.tableWrapperAdd__button}>
                        <button onClick={() => setIsEditingTable(true)}>Редактировать</button>
                        <button onClick={() => onDeleteTable(table.id)}>Удалить таблицу</button>
                    </span>
                </div>
            )}

            <table className={styles.supplement__table}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ФИО</th>
                        <th>Группа</th>
                        <th>Специальность</th>
                        <th>Оценки за семестры</th>
                        <th>Отметка к диплому</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {table.students.map((student, index) => (
                        <tr key={student.id || index}>
                            <td>{index + 1}</td>
                            <td>
                                {isEditingRow[student.id] ? (
                                    <input
                                        type="text"
                                        value={student.full_name}
                                        onChange={(e) => handleEditRow(student.id, "full_name", e.target.value)}
                                    />
                                ) : (
                                    student.full_name
                                )}
                            </td>
                            <td>
                                {isEditingRow[student.id] ? (
                                    <input
                                        type="text"
                                        value={student.group_name || ""}
                                        onChange={(e) => handleEditRow(student.id, "group_name", e.target.value)}
                                    />
                                ) : (
                                    student.group_name || "—"
                                )}
                            </td>
                            <td>
                                {isEditingRow[student.id] ? (
                                    <input
                                        type="text"
                                        value={student.specialty_name || ""}
                                        onChange={(e) => handleEditRow(student.id, "specialty_name", e.target.value)}
                                    />
                                ) : (
                                    student.specialty_name || "—"
                                )}
                            </td>
                            <td>
                                {isEditingRow[student.id] ? (
                                    <input
                                        type="text"
                                        value={table.grades[student.id]?.["semestrGrades"] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            
                                            const validatedValue = validateInputOnFly(value, true);
                                            handleEditRow(student.id, "semestrGrades", validatedValue);
                                        }}
                                        placeholder="Оценки через пробел"
                                    />
                                ) : (
                                    table.grades[student.id]?.semestrGrades
                                        ?.split(" ")
                                        .map(num => numberToText(num))
                                        .join(", ") || "—"
                                )}
                            </td>
                            <td>
                                {isEditingRow[student.id] ? (
                                    <input
                                        type="text"
                                        value={table.grades[student.id]?.["diplomGrade"] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                         
                                            const validatedValue = validateInputOnFly(value, false);
                                            handleEditRow(student.id, "diplomGrade", validatedValue);
                                        }}
                                        placeholder="Итоговая оценка"
                                    />
                                ) : (
                                    numberToText(table.grades[student.id]?.diplomGrade) || "—"
                                )}
                            </td>
                            <td>
                                <button onClick={() => onDelete(table.id, student.id)}>❌</button>
                                <button onClick={() => toggleEditRow(student.id)}>
                                    {isEditingRow[student.id] ? "Сохранить" : "Редактировать строку"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};