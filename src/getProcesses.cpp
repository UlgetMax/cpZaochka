#include <napi.h>
#include <windows.h>
#include <tlhelp32.h>
#include <string>

Napi::Value GetProcesses(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Array result = Napi::Array::New(env);
    int idx = 0;

    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (snapshot == INVALID_HANDLE_VALUE) return result;

    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);

    if (Process32First(snapshot, &entry)) {
        do {
            std::string exe(entry.szExeFile);
            if (exe == "WINWORD.EXE" || exe == "EXCEL.EXE") {
                Napi::Object obj = Napi::Object::New(env);
                obj.Set("name", exe == "WINWORD.EXE" ? "Microsoft Word" : "Microsoft Excel");
                result.Set(idx++, obj);
            }
        } while (Process32Next(snapshot, &entry));
    }

    CloseHandle(snapshot);
    return result;
}
