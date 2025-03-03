const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require('path');
const { Client } = require("pg");



const isDev = process.env.NODE_ENV === 'development';




const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "123456",
  database: "zaochka",
  port: 5555,
});

client.connect().catch(err => console.error("Ошибка подключения к БД:", err));

async function setupDatabase() {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS specialties (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        course INTEGER NOT NULL,
        semester INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        middle_name TEXT,
        group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
        specialty_id INTEGER REFERENCES specialties(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        middle_name TEXT,
        subject TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS exams (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
        date DATE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        grade INTEGER NOT NULL CHECK (grade >= 0 AND grade <= 10)
      );
    `);
    console.log("Таблицы успешно проверены/созданы");
  } catch (err) {
    console.error("Ошибка при создании таблиц:", err);
  }
}

async function getStudents() {
  try {
    const res = await client.query("SELECT * FROM students");
    return res.rows;
  } catch (err) {
    console.error("Ошибка запроса студентов:", err);
    return [];
  }
}



module.exports = {
  client,
  setupDatabase,
  getStudents,
};




console.log("__dirname:", __dirname); // Папка, где находится main.js
console.log("process.cwd():", process.cwd()); // Текущая рабочая директория (где запущен процесс)

async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    // fullscreen: true,
    // width: 1600,
    // height: 800,
    width,
    height,
    frame: false,
    titleBarStyle: 'hidden', 
    icon: path.join(__dirname, "assets/IconKitchen-Output/android/ic_college_Zaochka.ico"),
    // resizable: false,
    // kiosk: true,
    titleBarOverlay: {
      color: '#242424', // Цвет заголовка 
      symbolColor: '#ffffff', // Цвет кнопок закрытия/сворачивания
      height: 40, // Высота панели
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.maximize();

  if (isDev) {
    win.loadURL('http://localhost:6969');
  } else {
    win.loadURL(`file://${path.join(__dirname, "../dist/index.html")}`);
  }

  win.webContents.openDevTools();
}


ipcMain.on("minimize-window", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

ipcMain.on("maximize-window", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
      if (win.isMaximized()) {
          win.unmaximize();
      } else {
          win.maximize();
      }
  }
});

ipcMain.on("close-window", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

ipcMain.on("menu-action", (_, action) => {
  switch (action) {
      case "open":
          console.log("Открытие файла...");
          break;
      case "edit":
          console.log("Редактирование...");
          break;
      case "help":
          console.log("Помощь...");
          break;
      default:
          console.log("Неизвестное действие:", action);
  }
});



//BD 


ipcMain.handle("get-students", async () => {
  return await getStudents();
});

ipcMain.handle("check-db", async () => {
  try {
    await client.query("SELECT 1");
    return "Подключено к БД";
  } catch (err) {
    console.error("Ошибка подключения к БД:", err);
    return `Ошибка: ${err.message}`;
  }
});


ipcMain.handle("get-groups", async () => {
  try {
    const res = await client.query("SELECT id, name FROM groups");
    return res.rows; // [{ id: 1, name: 'П-303' }, ...]
  } catch (err) {
    console.error("Ошибка получения групп:", err);
    return [];
  }
});

ipcMain.handle("get-specialties", async () => {
  try {
    const res = await client.query("SELECT id, name FROM specialties");
    return res.rows;
  } catch (err) {
    console.error("Ошибка получения специальностей:", err);
    return [];
  }
});

ipcMain.handle("add-students", async (event, students) => {
  try {
    const query = `
          INSERT INTO students (first_name, last_name, middle_name, group_id, specialty_id)
          VALUES ($1, $2, $3, $4, $5)
      `;

    for (const student of students) {
      await client.query(query, [
        student.first_name,
        student.last_name,
        student.middle_name || null,
        student.group_id,
        student.specialty_id,
      ]);
    }

    return { success: true };
  } catch (err) {
    console.error("Ошибка добавления студентов:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("get-students-by-group", async (_, groupId) => {
  try {
    const res = await client.query(`
      SELECT id, 
             CONCAT(last_name, ' ', first_name, ' ', COALESCE(middle_name, '')) AS full_name,
             specialty_id
      FROM students 
      WHERE group_id = $1
    `, [groupId]);
    return res.rows; // [{ id: 1, full_name: 'Иванов Иван Иванович', specialty_id: 1 }, ...]
  } catch (err) {
    console.error("Ошибка получения студентов:", err);
    return [];
  }
});

ipcMain.handle("get-students-by-group-and-specialty", async (_, groupId, specialtyId) => {
  try {
    const res = await client.query(`
      SELECT s.id, s.last_name, s.first_name, s.middle_name, s.group_id, s.specialty_id, g.name as group_name, sp.name as specialty_name
      FROM students s
      LEFT JOIN groups g ON s.group_id = g.id
      LEFT JOIN specialties sp ON s.specialty_id = sp.id
      WHERE ($1::int IS NULL OR s.group_id = $1)
      AND ($2::int IS NULL OR s.specialty_id = $2)
    `, [groupId, specialtyId]);
    return res.rows;
  } catch (err) {
    console.error("Ошибка получения студентов:", err);
    return [];
  }
});


ipcMain.handle("update-students", async (event, students) => {
  try {
    const query = `
          UPDATE students
          SET first_name = $1, last_name = $2, middle_name = $3, group_id = $4, specialty_id = $5
          WHERE id = $6
      `;

    for (const student of students) {
      await client.query(query, [
        student.first_name,
        student.last_name,
        student.middle_name || null,
        student.group_id,
        student.specialty_id,
        student.id,
      ]);
    }

    return { success: true };
  } catch (err) {
    console.error("Ошибка обновления студентов:", err);
    return { success: false, error: err.message };
  }
});


ipcMain.handle("delete-students", async (event, students) => {
  try {
    const query = `
          DELETE FROM students
          WHERE id = $1
      `;

    for (const student of students) {
      await client.query(query, [student.id]);
    }

    return { success: true };
  } catch (err) {
    console.error("Ошибка удаления студентов:", err);
    return { success: false, error: err.message };
  }
});



///BD

ipcMain.handle("get-wasm-path", () => {
  return path.join(process.resourcesPath, "test.wasm");
});


app.whenReady().then(async () => {
  await setupDatabase();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
