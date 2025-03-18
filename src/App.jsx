import { useEffect, useState } from "react";

function App() {
  const [processes, setProcesses] = useState([]);
  const [textToInsert, setTextToInsert] = useState("");
  const [row, setRow] = useState(1); // добавляем состояние для строки
  const [column, setColumn] = useState(1); // добавляем состояние для столбца

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
    if (textToInsert) {
      try {
        if (processes.some((proc) => proc.name === "Microsoft Word")) {
          await window.electron.invoke("insert-text-word", textToInsert);
        } else if (processes.some((proc) => proc.name === "Microsoft Excel")) {
          await window.electron.invoke("insert-text-excel", textToInsert, row, column); // передаем row и column
        } else {
          alert("Word или Excel не запущены");
        }
      } catch (error) {
        alert(`Ошибка при вставке текста: ${error}`);
      }
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
        <input
          type="text"
          value={textToInsert}
          onChange={(e) => setTextToInsert(e.target.value)}
          placeholder="Введите текст для вставки"
        />
        <div>
          <label>
            Строка:
            <input
              type="number"
              value={row}
              onChange={(e) => setRow(parseInt(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            Столбец:
            <input
              type="number"
              value={column}
              onChange={(e) => setColumn(parseInt(e.target.value))}
            />
          </label>
        </div>
        <button onClick={handleInsertText}>Вставить текст в Word или Excel</button>
        <button onClick={handleInsertDocxWord}>Вставить ведомость в Word</button>
      </div>
    </div>
  );
}

export default App;
