import React from "react";
import styles from "./diplomSupplement.module.scss";
import { useNavigate } from "react-router-dom"; 


import Arrow from "../../img/svg/Arrow.svg";

export default function DiplomSupplement() {
    const navigate = useNavigate();


    const handleGoBack = () => {
        navigate(-1);
    }


    return (
        <div className={styles.supplement}>

            <div className={styles.supplement__header}>
                <div className={styles.supplement__header__img} onClick={handleGoBack}>
                    <Arrow className={styles.supplement__header__arrow} />
                </div>

                <h1>Ведомость приложение к диплому</h1>
            </div>

        </div>
    )
} 