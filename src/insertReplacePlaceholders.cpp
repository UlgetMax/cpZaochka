#include <napi.h>
#include "utils.h"
#include <comdef.h>
#include <string>
#include <vector>
#include <utility>
#include <map>

Napi::Value ReplacePlaceholdersInWord(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsObject()) {
        Napi::TypeError::New(env, "Expected an object with replacements").ThrowAsJavaScriptException();
        return env.Null();
    }

    HRESULT hr = CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);
    if (FAILED(hr)) {
        Napi::Error::New(env, "Failed to initialize COM").ThrowAsJavaScriptException();
        return env.Null();
    }

    CLSID clsid;
    IUnknown* pUnknown = nullptr;
    IDispatch* pWordApp = nullptr;

    try {
        Napi::Object replacementsObj = info[0].As<Napi::Object>();
        std::vector<std::pair<std::wstring, std::wstring>> replacements;
        
        Napi::Array keys = replacementsObj.GetPropertyNames();
        for (uint32_t i = 0; i < keys.Length(); i++) {
            Napi::Value key = keys[i];
            Napi::Value value = replacementsObj.Get(key);
            
            if (key.IsString() && value.IsString()) {
                // Используем Utf16Value для получения широких строк
                std::u16string u16key = key.As<Napi::String>().Utf16Value();
                std::u16string u16value = value.As<Napi::String>().Utf16Value();
                
                // Конвертируем u16string в wstring
                std::wstring wkey(u16key.begin(), u16key.end());
                std::wstring wvalue(u16value.begin(), u16value.end());
                
                replacements.emplace_back(wkey, wvalue);
            }
        }

        hr = CLSIDFromProgID(L"Word.Application", &clsid);
        if (FAILED(hr)) throw std::runtime_error("Word is not installed");

        hr = GetActiveObject(clsid, NULL, &pUnknown);
        if (FAILED(hr)) throw std::runtime_error("Word is not running");

        hr = pUnknown->QueryInterface(IID_IDispatch, (void**)&pWordApp);
        pUnknown->Release();
        if (FAILED(hr)) throw std::runtime_error("Failed to get Word IDispatch");

        // Остальной код остается без изменений
        DISPID dispIDDoc;
        VARIANT resultDoc;
        VariantInit(&resultDoc);
        DISPPARAMS noArgs = { nullptr, nullptr, 0, 0 };

        if (FAILED(GetDispID(pWordApp, L"ActiveDocument", &dispIDDoc)) ||
            FAILED(pWordApp->Invoke(dispIDDoc, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &resultDoc, nullptr, nullptr)) ||
            resultDoc.vt != VT_DISPATCH) {
            throw std::runtime_error("Failed to get ActiveDocument");
        }

        IDispatch* pDoc = resultDoc.pdispVal;

        DISPID dispIDContent;
        VARIANT contentResult;
        VariantInit(&contentResult);
        if (FAILED(GetDispID(pDoc, L"Content", &dispIDContent)) ||
            FAILED(pDoc->Invoke(dispIDContent, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &contentResult, nullptr, nullptr)) ||
            contentResult.vt != VT_DISPATCH) {
            SafeRelease(&pDoc);
            throw std::runtime_error("Failed to get Content");
        }

        IDispatch* pRange = contentResult.pdispVal;

        DISPID dispIDFind;
        VARIANT findResult;
        VariantInit(&findResult);

        if (FAILED(GetDispID(pRange, L"Find", &dispIDFind)) ||
            FAILED(pRange->Invoke(dispIDFind, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &findResult, nullptr, nullptr)) ||
            findResult.vt != VT_DISPATCH) {
            SafeRelease(&pRange);
            SafeRelease(&pDoc);
            throw std::runtime_error("Failed to get Find");
        }

        IDispatch* pFind = findResult.pdispVal;

        auto SetProperty = [](IDispatch* obj, const wchar_t* name, VARIANT val) {
            DISPID dispID;
            DISPID namedPut = DISPID_PROPERTYPUT;
            DISPPARAMS dp = { &val, &namedPut, 1, 1 };
            if (SUCCEEDED(GetDispID(obj, name, &dispID))) {
                obj->Invoke(dispID, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT, &dp, nullptr, nullptr, nullptr);
            }
        };

        DISPID dispIDText;
        if (FAILED(GetDispID(pRange, L"Text", &dispIDText))) {
            SafeRelease(&pFind);
            SafeRelease(&pRange);
            SafeRelease(&pDoc);
            throw std::runtime_error("Failed to get Text property ID");
        }

        DISPID dispIDExecute;
        if (FAILED(GetDispID(pFind, L"Execute", &dispIDExecute))) {
            SafeRelease(&pFind);
            SafeRelease(&pRange);
            SafeRelease(&pDoc);
            throw std::runtime_error("Failed to get Execute method");
        }

        DISPID namedPut = DISPID_PROPERTYPUT;

        for (const auto& replacement : replacements) {
            const std::wstring& findText = replacement.first;
            const std::wstring& replaceText = replacement.second;

            VARIANT findTextVar;
            findTextVar.vt = VT_BSTR;
            findTextVar.bstrVal = SysAllocString(findText.c_str());

            VARIANT forwardVar;
            forwardVar.vt = VT_BOOL;
            forwardVar.boolVal = VARIANT_TRUE;
            
            VARIANT wrapVar;
            wrapVar.vt = VT_I4;
            wrapVar.lVal = 1;

            SetProperty(pFind, L"Text", findTextVar);
            SetProperty(pFind, L"Forward", forwardVar);
            SetProperty(pFind, L"Wrap", wrapVar);

            VARIANT_BOOL found = VARIANT_FALSE;
            do {
                VARIANT result;
                VariantInit(&result);
                DISPPARAMS dpNoArgs = { nullptr, nullptr, 0, 0 };
                hr = pFind->Invoke(dispIDExecute, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &dpNoArgs, &result, nullptr, nullptr);
                if (FAILED(hr)) break;

                found = result.boolVal;
                if (found == VARIANT_TRUE) {
                    VARIANT newText;
                    newText.vt = VT_BSTR;
                    newText.bstrVal = SysAllocString(replaceText.c_str());

                    DISPPARAMS dpSet = { &newText, &namedPut, 1, 1 };
                    pRange->Invoke(dispIDText, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT, &dpSet, nullptr, nullptr, nullptr);

                    SysFreeString(newText.bstrVal);
                }
            } while (found == VARIANT_TRUE);

            SysFreeString(findTextVar.bstrVal);
        }

        SafeRelease(&pFind);
        SafeRelease(&pRange);
        SafeRelease(&pDoc);
        SafeRelease(&pWordApp);
        CoUninitialize();

        return Napi::Boolean::New(env, true);
    } catch (const std::exception& ex) {
        SafeRelease(&pWordApp);
        CoUninitialize();
        Napi::Error::New(env, ex.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}