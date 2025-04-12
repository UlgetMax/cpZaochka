import { useEffect, useState } from "react";

function App() {
  const [processes, setProcesses] = useState([]);
  const [text, setText] = useState("");
  const [lastProcess, setLastProcess] = useState(null);
  

  useEffect(() => {
    const updateProcesses = async () => {
      if (window.electron?.getProcesses) {
        const result = await window.electron.getProcesses();
        setProcesses(result);
        console.log("Обновлено:", result);
      }
    };

    updateProcesses(); 

    const interval = setInterval(updateProcesses, 1000); 
    return () => clearInterval(interval);
  }, []);

  const handleInsertText = async () => {
    if (window.electron?.insertTextToWord) {
      try {
        const result = await window.electron.insertTextToWord(text);
        if (result.error) {
          alert("Ошибка вставки: " + result.error);
        }
      } catch (err) {
        alert("Произошла ошибка: " + err.message);
      }
    } else {
      alert("Функция insertTextToWord недоступна");
    }
  };

  const handleCaptureProcess = async () => {
    const proc = await window.electron.getActiveProcess();
    if (proc) {
      setLastProcess(proc.toUpperCase());
      console.log("Сохранён процесс:", proc);
    }
  };

  const handleInsertSmart = async () => {
    if (!lastProcess) {
      alert("Сначала наведитесь на Word/Excel и нажмите 'Запомнить процесс'");
      return;
    }

    const result = await window.electron.insertTextSmart(text, lastProcess);
    if (result.success) {
      alert("Вставлено!");
    } else {
      alert("Ошибка: " + result.error);
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

      <h2>Вставка текста в Word</h2>
      <input 
        type="text" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: 300 }}
      />
      {/* <button onClick={handleSmartInsert} style={{ marginLeft: 10 }}>
        Вставить текст в Word - Excel
      </button> */}
      {/* <button onClick={handleInsertTextExcel} style={{ marginLeft: 10 }}>
        Вставить текст в Excel
      </button> */}
      <button onClick={handleCaptureProcess}>📌 Запомнить активный процесс</button>
      <button onClick={handleInsertSmart}>🔤 Вставить</button>
      {lastProcess && <p>Процесс: {lastProcess}</p>}
    </div>
  );
}

export default App;
