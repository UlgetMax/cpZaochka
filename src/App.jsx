import { useEffect, useState } from "react";
import "./App.css";
import { loadWasm } from "./wasmLoader";  // Файл для загрузки WASM

function App() {
  const [a, setA] = useState(5);
  const [b, setB] = useState(10);
  const [message, setMessage] = useState("Привет из React!");

  useEffect(() => {
    loadWasm().then((wasmModule) => {
      wasmModule._printMessage(a, b, message);
    }).catch((error) => {
      console.error("Ошибка загрузки WebAssembly:", error);
    });
  }, [a, b, message]);

  return (
    <div>
      <h1>React + WebAssembly</h1>
      <p>Число 1: {a}</p>
      <p>Число 2: {b}</p>
      <p>Сообщение: {message}</p>
    </div>
  );
}

export default App;
