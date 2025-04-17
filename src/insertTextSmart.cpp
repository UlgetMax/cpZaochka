#include <napi.h>
#include <windows.h>
#include <tlhelp32.h>  
#include <string>

extern Napi::Value InsertTextToWord(const Napi::CallbackInfo& info);
extern Napi::Value InsertTextToExcel(const Napi::CallbackInfo& info);

std::string g_lastProcess = "";

Napi::Value SetLastActiveProcess(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected process name").ThrowAsJavaScriptException();
        return env.Null();
    }

    g_lastProcess = info[0].As<Napi::String>().Utf8Value();
    OutputDebugStringA(("SetLastActiveProcess: " + g_lastProcess + "\n").c_str());
    return Napi::Boolean::New(env, true);
}

// Кросс-архитектурный метод получения активного процесса
std::string GetActiveProcessName() {
    HWND hwnd = GetForegroundWindow();
    if (!hwnd) return "";

    DWORD pid = 0;
    GetWindowThreadProcessId(hwnd, &pid);
    if (pid == 0) return "";

    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (snapshot == INVALID_HANDLE_VALUE) return "";

    PROCESSENTRY32 pe;
    pe.dwSize = sizeof(PROCESSENTRY32);

    std::string result = "";

    if (Process32First(snapshot, &pe)) {
        do {
            if (pe.th32ProcessID == pid) {
                result = pe.szExeFile;
                break;
            }
        } while (Process32Next(snapshot, &pe));
    }

    CloseHandle(snapshot);
    return result;
}

Napi::Value GetActiveProcessName(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string processName = ::GetActiveProcessName();
    return Napi::String::New(env, processName);
}

Napi::Value InsertTextSmart(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    std::string processName = g_lastProcess;

    if (processName == "WINWORD.EXE") {
        return InsertTextToWord(info);
    } else if (processName == "EXCEL.EXE") {
        return InsertTextToExcel(info);
    } else {
        std::string msg = "Unsupported process: " + processName;
        Napi::Error::New(env, msg).ThrowAsJavaScriptException();
        return env.Null();
    }
}
