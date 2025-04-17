#include <napi.h>
#include <windows.h>
#include <comdef.h>
#include <oleauto.h>
#include <string>
#include <map>

std::wstring Utf8ToWide(const std::string& str) {
    int len = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, nullptr, 0);
    if (len <= 1) return L"";
    std::wstring result(len - 1, L'\0');
    MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, &result[0], len);
    return result;
}

Napi::Value ReplacePlaceholdersInWord(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsObject()) {
        Napi::TypeError::New(env, "Expected object").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::map<std::wstring, std::wstring> replacements;
    Napi::Object dict = info[0].As<Napi::Object>();
    Napi::Array keys = dict.GetPropertyNames();
    for (uint32_t i = 0; i < keys.Length(); ++i) {
        std::string key = keys.Get(i).As<Napi::String>();
        std::string val = dict.Get(key).As<Napi::String>();
        replacements[Utf8ToWide(key)] = Utf8ToWide(val);
    }

    HRESULT hr = CoInitialize(nullptr);
    if (FAILED(hr)) {
        Napi::Error::New(env, "COM initialization failed").ThrowAsJavaScriptException();
        return env.Null();
    }

    bool success = false;
    IDispatch *pWord = nullptr, *pDoc = nullptr, *pContent = nullptr;
    VARIANT result;
    VariantInit(&result);

    try {
        CLSID clsid;
        hr = CLSIDFromProgID(L"Word.Application", &clsid);
        if (FAILED(hr)) throw std::runtime_error("CLSIDFromProgID failed");

        hr = GetActiveObject(clsid, nullptr, (IUnknown**)&pWord);
        if (FAILED(hr) || !pWord) throw std::runtime_error("Word is not running or cannot be accessed");

        // Get ActiveDocument
        DISPID dispID;
        OLECHAR* name = L"ActiveDocument";
        DISPPARAMS noArgs = { nullptr, nullptr, 0, 0 };

        hr = pWord->GetIDsOfNames(IID_NULL, &name, 1, LOCALE_USER_DEFAULT, &dispID);
        if (FAILED(hr)) throw std::runtime_error("Cannot get ActiveDocument");

        VariantClear(&result);
        hr = pWord->Invoke(dispID, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &result, nullptr, nullptr);
        if (FAILED(hr) || result.vt != VT_DISPATCH || !result.pdispVal) throw std::runtime_error("ActiveDocument is not accessible");

        pDoc = result.pdispVal;

        // Get Content
        name = L"Content";
        VariantClear(&result);
        hr = pDoc->GetIDsOfNames(IID_NULL, &name, 1, LOCALE_USER_DEFAULT, &dispID);
        if (FAILED(hr)) throw std::runtime_error("No Content in document");

        hr = pDoc->Invoke(dispID, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &result, nullptr, nullptr);
        if (FAILED(hr) || result.vt != VT_DISPATCH || !result.pdispVal) throw std::runtime_error("Content is not accessible");

        pContent = result.pdispVal;

        // Get current text
        name = L"Text";
        VariantClear(&result);
        hr = pContent->GetIDsOfNames(IID_NULL, &name, 1, LOCALE_USER_DEFAULT, &dispID);
        if (FAILED(hr)) throw std::runtime_error("Cannot get Text");

        hr = pContent->Invoke(dispID, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &result, nullptr, nullptr);
        if (FAILED(hr) || result.vt != VT_BSTR || !result.bstrVal) throw std::runtime_error("Text is not accessible");

        std::wstring text(result.bstrVal);
        SysFreeString(result.bstrVal);

        for (const auto& pair : replacements) {
            size_t pos = 0;
            while ((pos = text.find(pair.first, pos)) != std::wstring::npos) {
                text.replace(pos, pair.first.length(), pair.second);
                pos += pair.second.length();
            }
        }

        // Set updated text
        VARIANT newText;
        VariantInit(&newText);
        newText.vt = VT_BSTR;
        newText.bstrVal = SysAllocString(text.c_str());

        DISPPARAMS setParams = { &newText, nullptr, 1, 0 };
        hr = pContent->Invoke(dispID, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT, &setParams, nullptr, nullptr, nullptr);
        SysFreeString(newText.bstrVal);

        success = SUCCEEDED(hr);
    }
    catch (const std::exception& ex) {
        OutputDebugStringA(("❌ ReplaceText ERROR: " + std::string(ex.what()) + "\n").c_str());
        Napi::Error::New(env, ex.what()).ThrowAsJavaScriptException();
    }

    if (pContent) pContent->Release();
    if (pDoc) pDoc->Release();
    if (pWord) pWord->Release();
    VariantClear(&result);
    CoUninitialize();

    return Napi::Boolean::New(env, success);
}
