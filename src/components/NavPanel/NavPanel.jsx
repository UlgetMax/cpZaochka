import React from "react";
import styles from "./navPanel.module.scss";

export default function NavPanel({ activeTab, setActiveTab }) {
    return (
        <div className={styles.navPanel}>
            <button 
                className={activeTab === "students" ? styles.active : ""} 
                onClick={() => setActiveTab("students")}
            >
                Учащиеся
            </button>

            <button 
                className={activeTab === "specialties" ? styles.active : ""} 
                onClick={() => setActiveTab("specialties")}
            >
                Специальности
            </button>

            <button 
                className={activeTab === "groups" ? styles.active : ""} 
                onClick={() => setActiveTab("groups")}
            >
                Группы
            </button>
        </div>
    );
}
