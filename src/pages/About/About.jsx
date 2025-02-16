import { useEffect, useState } from "react";
import { loadWasm } from "../../wasmLoader";
import { generateDocx } from "../../generateDocx";
import { Link } from "react-router-dom";

export default function About() {

    return (
        <div>
            <h1>Страница О нас</h1>

            <Link to={"/"}>Домой</Link>
        </div>
    )
}