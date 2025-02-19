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






async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    // fullscreen: true,
    // width: 1600,
    // height: 800,
    width,
    height,
    // kiosk: true,
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
              student.firstName,
              student.lastName,
              student.middleName || null,
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
      SELECT id, CONCAT(last_name, ' ', first_name, ' ', COALESCE(middle_name, '')) AS full_name 
      FROM students WHERE group_id = $1
    `, [groupId]);
    return res.rows; // [{ id: 1, full_name: 'Иванов Иван Иванович' }, ...]
  } catch (err) {
    console.error("Ошибка получения студентов:", err);
    return [];
  }
});




///

ipcMain.handle("get-wasm-path", () => {
  return path.join(process.resourcesPath, "test.wasm");
});


app.whenReady().then(async() => {
  await setupDatabase();

  const menuTemplate = [
    {
      label: "Файл",
      submenu: [
        { label: "Открыть", click: () => console.log("Открыть файл") },
        { type: "separator" },
        { label: "Выход", role: "quit" },
      ],
    },
  ];
  
  const menu = Menu.buildFromTemplate(menuTemplate);

  Menu.setApplicationMenu(menu);
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
