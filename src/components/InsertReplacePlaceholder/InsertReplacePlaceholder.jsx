import { useEffect, useState } from "react";

export default function InsertReplacePlaceholder() {
  const [processes, setProcesses] = useState([]);
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


  const handlePlaceholderInsert = async () => {
    const placeholders = {
      "($student_name)": "Иванов И.И.",
      "($teacher)": "Смирнова А.А.",
      "($specialization)": "Правоведение"
    };
  
    try {
      const result = await window.electron.replacePlaceholdersInWord(placeholders);
  
      if (!result) {
        alert("⚠️ Не удалось заменить метки. Убедитесь, что открыт документ Word.");
      }
    } catch (err) {
      alert("⚠️ Ошибка: " + err.message);
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
          <p>🧠 Последний фокус: <b>{lastFocus}</b></p>


          <button onClick={handlePlaceholderInsert}>
              🧠 Автозаполнение по шаблону
          </button>




      </div>
  );
}