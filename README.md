# React Electron + Vite + С == С++

Стартовое приложение с настроенной сборкой проекта и запуска.
Чтобы запустить `npm run dev` в данном режиме запускается настольное приложение, где пользователь может в реальном вермени просматривать изменения.

# Сборка приложения
1. ### `npm run build`
2. ### `npx electron-builder`

После выполнения данных команд в папке 
### dist_electron/win-unpacked 
содеражится долгожданный  **.exe** файл, а в директории выше **установщик**.

Чтобы применить С или С++ код необходимо установить [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) также его можно склонировать с резпозитория [GitHub] (https://github.com/emscripten-core/emsdk).
Необходимо зайти в попку слонированного репозитория, открыть консоль и ввести команды: 
### ./emsdk install latest 
### ./emsdk activate latest --permanent
### ./emsdk_env.ps1

__Консоль не закрываем.__

Затем добавляете в папку **emsdk** к примеру файл test.cpp с кодом:

```C++
#include <emscripten.h>
#include <string>

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    void printMessage(int a, int b, const char* msg) {
        printf("Number 1: %d\n", a);
        printf("Number 2: %d\n", b);
        printf("Message: %s\n", msg);
    }
}
```

Затем необходимо написать в консоль команду:
### emcc test.cpp -o test.js -s MODULARIZE -s EXPORT_ES6=1 -s ENVIRONMENT=web

После этого создается 2 файла: test.js и test.wasm
После чего переносим эти файлы в проект. В папку public -> test.wasm  В папку src/wasm -> test.js
