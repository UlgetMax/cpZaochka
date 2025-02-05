# React Electron + Vite

Стартовое приложение с настроенной сборкой проекта и запуска.
Чтобы запустить ### `npm run dev` в данном режиме запускается настольное приложение, где пользователь может в реальном вермени просматривать изменения.

# Сборка приложения
1. ### `npm run build`
2. ### `npx electron-builder`

После выполнения данных команд в папке ### **dist_electron/win-unpacked** содеражится долгожданный ### .exe файл, а в директории выше **установщик**.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
