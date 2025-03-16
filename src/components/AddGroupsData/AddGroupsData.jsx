import React, { useEffect, useState } from "react";
import styles from "./addGroupsData.module.scss";

export default function AddGroupsData() {
    const [groups, setGroups] = useState([]);
    const [newGroup, setNewGroup] = useState({ name: "", course: "", semester: "" });
    const [editingId, setEditingId] = useState(null);
    const [editingGroup, setEditingGroup] = useState({ name: "", course: "", semester: "" });

    useEffect(() => {
        window.electron.getGroups().then(setGroups).catch(console.error);
    }, [groups]); 
    

    const handleAddGroup = async () => {
        if (!newGroup.name.trim() || !newGroup.course || !newGroup.semester) {
            alert("Все поля должны быть заполнены!");
            return;
        }

        try {
            const response = await window.electron.addGroup(newGroup);
            if (response.success) {
                const updatedGroups = await window.electron.getGroups();
                setGroups(updatedGroups);
                setNewGroup({ name: "", course: "", semester: "" });
            } else {
                alert("Ошибка при добавлении группы: " + response.error);
            }
        } catch (err) {
            console.error("Ошибка при добавлении группы:", err);
            alert("Ошибка при добавлении группы");
        }
    };

    const handleEditGroup = async (id) => {
        if (!editingGroup.name.trim() || !editingGroup.course || !editingGroup.semester) {
            alert("Все поля должны быть заполнены!");
            return;
        }

        try {
            const response = await window.electron.updateGroup(id, editingGroup);
            if (response.success) {
                const updatedGroups = await window.electron.getGroups();
                setGroups(updatedGroups);
                setEditingId(null);
                setEditingGroup({ name: "", course: "", semester: "" });
            } else {
                alert("Ошибка при редактировании группы: " + response.error);
            }
        } catch (err) {
            console.error("Ошибка при редактировании группы:", err);
            alert("Ошибка при редактировании группы");
        }
    };

    const handleDeleteGroup = async (id) => {
        const confirmDelete = window.confirm("Вы уверены, что хотите удалить эту группу?");
        if (!confirmDelete) return;

        try {
            const response = await window.electron.deleteGroup(id);
            if (response.success) {
                const updatedGroups = await window.electron.getGroups();
                setGroups(updatedGroups);
            } else {
                alert("Ошибка при удалении группы: " + response.error);
            }
        } catch (err) {
            console.error("Ошибка удаления группы:", err);
            alert("Ошибка при удалении группы");
        }
    };

    return (
        <div className={styles.addGroupsData}>
            <div className={styles.addGroupForm}>
                <input
                    type="text"
                    placeholder="Название группы"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Курс"
                    min="1"
                    max="4"
                    value={newGroup.course}
                    onChange={(e) => setNewGroup({ ...newGroup, course: Number(e.target.value) })}

                />
                <input
                    type="number"
                    placeholder="Семестр"
                    min="1"
                    max="8"
                    value={newGroup.semester}
                    onChange={(e) => setNewGroup({ ...newGroup, semester: e.target.value })}
                />
                <button onClick={handleAddGroup}>Добавить</button>
            </div>

            <table className={styles.groupsTable}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Название</th>
                        <th>Курс</th>
                        <th>Семестр</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {groups.map((group, index) => (
                        <tr key={group.id}>
                            <td>{index + 1}</td>
                            <td>{editingId === group.id ? (
                                <input type="text" value={editingGroup.name} onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })} />
                            ) : (group.name)}</td>
                            <td>{editingId === group.id ? (
                                <input type="number" min="1" max="4" value={editingGroup.course} onChange={(e) => setEditingGroup({ ...editingGroup, course: Number(e.target.value) })} />
                            ) : (group.course)}</td>
                            <td>{editingId === group.id ? (
                                <input type="number" min="1" max="8" value={editingGroup.semester} onChange={(e) => setEditingGroup({ ...editingGroup, semester: Number(e.target.value) })} />
                            ) : (group.semester)}</td>
                            <td>
                                {editingId === group.id ? (
                                    <>
                                        <button onClick={() => handleEditGroup(group.id)}>Сохранить</button>
                                        <button onClick={() => setEditingId(null)}>Отмена</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setEditingId(group.id); setEditingGroup(group); }}>✏️</button>
                                        <button onClick={() => handleDeleteGroup(group.id)}>❌</button>
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
