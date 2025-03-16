import React, { useState } from "react";
import styles from "./addData.module.scss";
import { useNavigate } from "react-router-dom";
import NavPanel from "../../components/NavPanel/NavPanel";
import AddStudentsData from "../../components/AddStudentsData/AddStudentsData";
// import ManageSpecialties from "./ManageSpecialties";
// import ManageGroups from "./ManageGroups";
import Arrow from "../../img/svg/Arrow.svg";
import AddSpecializedData from "../../components/AddSpecializedData/AddSpecialized";
import AddGroupsData from "../../components/AddGroupsData/AddGroupsData";

export default function AddData() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("students");

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className={styles.addData}>
            <div className={styles.addData__header}>
                <div className={styles.addData__header__img} onClick={handleGoBack}>
                    <Arrow className={styles.addData__header__arrow} />
                </div>
                <h1>Управление данными</h1>
            </div>

        
            <NavPanel activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Контент, который меняется в зависимости от активного раздела */}
            <div className={styles.content}>
                {activeTab === "students" && <AddStudentsData />}
                {activeTab == "specialties" && <AddSpecializedData/>}
                {activeTab == "groups" && <AddGroupsData/>}
            </div>
        </div>
    );
}
