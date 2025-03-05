import React, { useEffect, useState, useRef } from "react";
import styles from "./addSpecializedData.module.scss";

export default function AddSpecializedData() {

    const [specialties, setSpecialties] = useState([]);
    const [newSpecialty, setNewSpecialty] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const inputRef = useRef(null); 

    useEffect(() => {
        if (window.electron) {
            window.electron.getSpecialties().then(setSpecialties).catch(console.error);
        }
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.disabled = false; 
                inputRef.current.focus();
            }
        }, 0);
    }, [specialties]);


    const handleAddSpecialty = async () => {
        if (!newSpecialty.trim()) {
            alert("Название специальности не может быть пустым!");
            setNewSpecialty("");
            inputRef.current.disabled = false; // Разблокируем
            inputRef.current?.focus();
            return;
        }

        try {
            const response = await window.electron.addSpecialty(newSpecialty);
            if (response.success) {
                const updatedSpecialties = await window.electron.getSpecialties();
                setSpecialties(updatedSpecialties);
                setNewSpecialty("");

                setTimeout(() => {
                    inputRef.current.disabled = false;
                    inputRef.current?.focus();
                }, 0);
            } else {
                alert("Ошибка при добавлении специальности: " + response.error);
            }
        } catch (err) {
            console.error("Ошибка при добавлении специальности:", err);
            alert("Ошибка при добавлении специальности");
        }
    };

    const handleDeleteSpecialty = async (id) => {
        const confirmDelete = window.confirm("Вы уверены, что хотите удалить эту специальность?");
        if (!confirmDelete) return;

        try {
            const response = await window.electron.deleteSpecialty(id);
            if (response.success) {
                // Обновляем список после удаления
                const updatedSpecialties = await window.electron.getSpecialties();
                setSpecialties(updatedSpecialties);
            } else {
                alert("Ошибка при удалении специальности: " + response.error);
            }
        } catch (err) {
            console.error("Ошибка удаления специальности:", err);
            alert("Ошибка при удалении специальности");
        }
    };
    
    
    const handleEditSpecialty = (id) => {
        if (!editingName.trim()) {
            alert("Название специальности не может быть пустым!");
            return;
        }
    
        window.electron.updateSpecialty(id, editingName) // Используем updateSpecialty
            .then((response) => {
                if (response.success) {
                    setSpecialties(prev => 
                        prev.map(spec => 
                            spec.id === id ? { ...spec, name: editingName } : spec
                        )
                    );
                    setEditingId(null);
                    setEditingName("");
                } else {
                    alert("Ошибка при обновлении специальности: " + response.error);
                }
            })
            .catch(err => {
                console.error("Ошибка обновления специальности:", err);
                alert("Ошибка при обновлении специальности");
            });
    };
    
    

    return (
        <div className={styles.addSpecializedData}>

        
            <div className={styles.addSpecialtyForm}>
                <input
                    type="text"
                    placeholder="Название специальности"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    ref={inputRef}
                    disabled={true}
                />
                <button onClick={handleAddSpecialty}>Добавить</button>
            </div>

        
            <table className={styles.specialtiesTable}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Название</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {specialties.map((specialty, index) => (
                        <tr key={specialty.id}>
                            <td>{index + 1}</td>
                            <td>
                                {editingId === specialty.id ? (
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                    />
                                ) : (
                                    specialty.name
                                )}
                            </td>
                            <td>
                                {editingId === specialty.id ? (
                                    <>
                                        <button onClick={() => handleEditSpecialty(specialty.id)}>Сохранить</button>
                                        <button onClick={() => setEditingId(null)}>Отмена</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => {
                                            setEditingId(specialty.id);
                                            setEditingName(specialty.name);
                                        }}>✏️</button>
                                        <button onClick={() => handleDeleteSpecialty(specialty.id)}>❌</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}