import { useEffect, useState } from "react";

export default function InsertText() {
  const [processes, setProcesses] = useState([]);
  const [text, setText] = useState("");
  const [lastFocus, setLastFocus] = useState(null);


  useEffect(() => {
    const updateProcesses = async () => {
      if (window.electron?.getProcesses) {
        const result = await window.electron.getProcesses();
        setProcesses(result);
      }
    };

    updateProcesses(); 
    const interval = setInterval(updateProcesses, 1000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const proc = await window.electron.getActiveProcess();

      if (proc && (proc === "WINWORD.EXE" || proc === "EXCEL.EXE")) {
        await window.electron.setLastActiveProcess(proc);
        setLastFocus(proc);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  const handleInsert = async () => {
    try {
      const result = await window.electron.insertTextSmart(text);
      if (!result) {
        alert("Ошибка вставки текста");
      }
    } catch (err) {
      alert("Ошибка вставки: " + err.message);
    }
  };

  return (
    <div>
      <h1>Открытые процессы:</h1>
      <ul>
        {processes.map((p, i) => (
          <li key={i}>{p.name}</li>
        ))}
      </ul>

      <h2>Вставка текста</h2>
      <input 
        type="text" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: 300 }}
      />
      <button onClick={handleInsert}>Вставить</button>
      <button
        onClick={() => {
          const values = [
            "Иванов И.И.",
            "Петров П.П.",
            "Сидоров С.С."
          ];
          window.electron.insertTextMultiWord(values);
        }}
      >
        🧩 Вставить массив в таблицу Word
      </button>

    </div>
  );
}