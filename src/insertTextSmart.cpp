#include <napi.h>
#include <string>
#include <algorithm>

// Объявления функций из других файлов
bool InsertTextToWordInternal(const std::wstring& text); // новые внутренние функции
bool InsertTextToExcelInternal(const std::wstring& text);

Napi::Value InsertTextSmart(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 2 || !info[0].IsString() || !info[1].IsString()) {
        Napi::TypeError::New(env, "Ожидается 2 строки: текст и имя процесса").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::u16string u16text = info[0].As<Napi::String>().Utf16Value();
    std::wstring text(u16text.begin(), u16text.end());

    std::string procName = info[1].As<Napi::String>().Utf8Value();
    std::transform(procName.begin(), procName.end(), procName.begin(), ::toupper);

    try {
        if (procName == "WINWORD.EXE") {
            if (!InsertTextToWordInternal(text)) throw std::runtime_error("Ошибка вставки в Word");
        } else if (procName == "EXCEL.EXE") {
            if (!InsertTextToExcelInternal(text)) throw std::runtime_error("Ошибка вставки в Excel");
        } else {
            throw std::runtime_error("Неизвестный процесс: " + procName);
        }

        return Napi::Boolean::New(env, true);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}
