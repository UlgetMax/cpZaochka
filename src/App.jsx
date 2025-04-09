import { useEffect, useState } from "react";

function App() {
  const [processes, setProcesses] = useState([]);
  const [textToInsert, setTextToInsert] = useState("");
  const [students, setStudents] = useState([
    "Иванов Иван",
    "Петров Петр",
    "Сидоров Сидор",
    "Алексеев Алексей",
    "Федоров Федор"
  ]);
  const [insertMode, setInsertMode] = useState("text"); // "text" или "list"

  useEffect(() => {
    const checkProcesses = async () => {
      if (window.electron) {
        const result = await window.electron.invoke("check-processes");
        setProcesses(result);
      }
    };

    checkProcesses();
    const interval = setInterval(checkProcesses, 1000); // Проверяем каждую секунду

    return () => clearInterval(interval);
  }, []);

  const handleInsertText = async () => {
    try {
      if (processes.some((proc) => proc.name === "Microsoft Word")) {
        if (insertMode === "text") {
          await window.electron.invoke("insert-text-word", textToInsert);
        } else {
          await window.electron.invoke("insert-list-word", students);
        }
      } else if (processes.some((proc) => proc.name === "Microsoft Excel")) {
        if (insertMode === "text") {
          await window.electron.invoke("insert-text-excel", textToInsert);
        } else {
          await window.electron.invoke("insert-list-excel", students);
        }
      } else {
        alert("Word или Excel не запущены");
      }
    } catch (error) {
      alert(`Ошибка при вставке: ${error}`);
    }
  };
  
  

  const handleInsertDocxWord = async () => {
    try {
      const result = await window.electron.invoke("insert-docx-word");
      alert(result); // Можно добавить какое-то сообщение
    } catch (error) {
      alert(`Ошибка при вставке ведомости в Word: ${error}`);
    }
  };

  return (
    <div>
      <h1>Отслеживание Word и Excel</h1>
      {processes.length > 0 ? (
        <ul>
          {processes.map((proc, index) => (
            <li key={index}>{proc.name}</li>
          ))}
        </ul>
      ) : (
        <p>Word и Excel не запущены.</p>
      )}

      <div>



        <label>
          <select value={insertMode} onChange={(e) => setInsertMode(e.target.value)}>
            <option value="text">Вставить текст</option>
            <option value="list">Вставить список</option>
          </select>
        </label>

        {insertMode === "text" ? (
          <input
            type="text"
            value={textToInsert}
            onChange={(e) => setTextToInsert(e.target.value)}
            placeholder="Введите текст для вставки"
          />
        ) : (
          <ul>
            {students.map((student, index) => (
              <li key={index}>{student}</li>
            ))}
          </ul>
        )}

        <button onClick={handleInsertText}>Вставить текст в Word или Excel</button>
        <button onClick={handleInsertDocxWord}>Вставить ведомость в Word</button>
      </div>
    </div>
  );
}

export default App;
