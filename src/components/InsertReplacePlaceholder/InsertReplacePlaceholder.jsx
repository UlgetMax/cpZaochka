import { useEffect, useState } from "react";

export default function InsertReplacePlaceholder() {
  const [processes, setProcesses] = useState([]);
  const [lastFocus, setLastFocus] = useState(null);

  useEffect(() => {
    const updateData = async () => {
      if (window.electron?.getProcesses) {
        const processesResult = await window.electron.getProcesses();
        setProcesses(processesResult);
      }

      const proc = await window.electron.getActiveProcess();
      if (proc && (proc === "WINWORD.EXE" || proc === "EXCEL.EXE")) {
        await window.electron.setLastActiveProcess(proc);
        setLastFocus(proc);
      }
    };

    updateData();
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePlaceholderInsert = async () => {
    const placeholders = {
      "($student_name)": "Иванов И.И.",
      "($teacher)": "Смирнова А.А.",
      "($specialization)": "Правоведение",
      "текст": "ЗАМЕНА"
    };

    if (!lastFocus || lastFocus !== "WINWORD.EXE") {
      alert("⚠️ Поддерживается только Word. Откройте активный документ Word.");
      return;
    }

    try {
      const result = await window.electron.replacePlaceholdersInWord(placeholders);
      if (!result) {
        alert("⚠️ Метки не были заменены. Убедитесь, что документ Word открыт.");
      }
    } catch (err) {
      alert(`❌ Ошибка: ${err.message}`);
      console.error("Ошибка в ReplacePlaceholdersInWord:", err);
    }
  };

  return (
    <div>
      <h2>🧠 Автозаполнение по шаблону</h2>
      <ul>
        {processes.map((p, i) => (
          <li key={i}>{p.name}</li>
        ))}
      </ul>
      <p>Активный процесс: <b>{lastFocus}</b></p>
      <button onClick={handlePlaceholderInsert}>📄 Заменить метки</button>

    </div>
  );
}
