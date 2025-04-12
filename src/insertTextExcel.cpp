#include <napi.h>
#include <windows.h>
#include <comdef.h>
#include <oleauto.h>
#include <string>

template<class T>
void SafeRelease(T** ppT) {
    if (*ppT) {
        (*ppT)->Release();
        *ppT = NULL;
    }
}

Napi::Value InsertTextToExcel(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    std::u16string u16text = info[0].As<Napi::String>().Utf16Value();
    std::wstring text(u16text.begin(), u16text.end());
    BSTR bstrText = SysAllocString(text.c_str());
    if (!bstrText) {
        Napi::Error::New(env, "Memory allocation failed").ThrowAsJavaScriptException();
        return env.Null();
    }
    
    CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);
    
    IDispatch* pExcelApp = nullptr;
    IDispatch* pWorkbook = nullptr;
    IDispatch* pCell = nullptr;
    
    try {
        // Получение Excel.Application
        CLSID clsid;
        HRESULT hr = CLSIDFromProgID(L"Excel.Application", &clsid);
        if (FAILED(hr)) throw std::runtime_error("Excel is not installed");
    
        IUnknown* pUnknown = nullptr;
        hr = GetActiveObject(clsid, NULL, &pUnknown);
        if (FAILED(hr) || !pUnknown)
            throw std::runtime_error("Cannot find running instance of Excel");
    
        hr = pUnknown->QueryInterface(IID_IDispatch, (void**)&pExcelApp);
        pUnknown->Release();
        if (FAILED(hr)) throw std::runtime_error("Cannot get IDispatch from Excel");
    
        // Получаем ActiveWorkbook (если нет, создаем новый)
        {
            DISPID dispID;
            OLECHAR* prop = L"ActiveWorkbook";
            VARIANT result;
            VariantInit(&result);
            DISPPARAMS noArgs = { nullptr, nullptr, 0, 0 };
    
            if (SUCCEEDED(pExcelApp->GetIDsOfNames(IID_NULL, &prop, 1, LOCALE_USER_DEFAULT, &dispID)) &&
                SUCCEEDED(pExcelApp->Invoke(dispID, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &result, NULL, NULL)) &&
                result.vt == VT_DISPATCH) {
                pWorkbook = result.pdispVal;
            } else {
                // Workbooks.Add
                DISPID dispIDWorkbooks, dispIDAdd;
                OLECHAR* workbooksName = L"Workbooks";
                OLECHAR* addName = L"Add";
    
                VARIANT wbResult;
                VariantInit(&wbResult);
                if (SUCCEEDED(pExcelApp->GetIDsOfNames(IID_NULL, &workbooksName, 1, LOCALE_USER_DEFAULT, &dispIDWorkbooks)) &&
                    SUCCEEDED(pExcelApp->Invoke(dispIDWorkbooks, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &wbResult, NULL, NULL))) {
    
                    IDispatch* pWorkbooks = wbResult.pdispVal;
    
                    if (SUCCEEDED(pWorkbooks->GetIDsOfNames(IID_NULL, &addName, 1, LOCALE_USER_DEFAULT, &dispIDAdd))) {
                        VARIANT newWb;
                        VariantInit(&newWb);
                        if (SUCCEEDED(pWorkbooks->Invoke(dispIDAdd, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &noArgs, &newWb, NULL, NULL)) &&
                            newWb.vt == VT_DISPATCH) {
                            pWorkbook = newWb.pdispVal;
                        }
                    }
    
                    SafeRelease(&pWorkbooks);
                }
            }
    
            if (!pWorkbook)
                throw std::runtime_error("Failed to get or create Excel workbook");
        }
    
        // Получаем ActiveCell
        {
            DISPID dispID;
            OLECHAR* cellProp = L"ActiveCell";
            VARIANT result;
            VariantInit(&result);
            DISPPARAMS noArgs = { nullptr, nullptr, 0, 0 };
    
            if (FAILED(pExcelApp->GetIDsOfNames(IID_NULL, &cellProp, 1, LOCALE_USER_DEFAULT, &dispID)) ||
                FAILED(pExcelApp->Invoke(dispID, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &result, NULL, NULL)) ||
                result.vt != VT_DISPATCH)
                throw std::runtime_error("Cannot get ActiveCell");
    
            pCell = result.pdispVal;
        }
    
        // Устанавливаем значение ячейки
        {
            DISPID dispIDValue;
            OLECHAR* valName = L"Value";
            if (FAILED(pCell->GetIDsOfNames(IID_NULL, &valName, 1, LOCALE_USER_DEFAULT, &dispIDValue)))
                throw std::runtime_error("Cannot find Value");
    
            DISPID dispidNamed = DISPID_PROPERTYPUT;
            VARIANT val;
            val.vt = VT_BSTR;
            val.bstrVal = bstrText;
    
            DISPPARAMS dpVal = { &val, &dispidNamed, 1, 1 };
    
            if (FAILED(pCell->Invoke(dispIDValue, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT, &dpVal, NULL, NULL, NULL)))
                throw std::runtime_error("Failed to set cell value");
        }
    
        // Очистка
        SysFreeString(bstrText);
        SafeRelease(&pCell);
        SafeRelease(&pWorkbook);
        SafeRelease(&pExcelApp);
        CoUninitialize();
    
        return Napi::Boolean::New(env, true);
    }
    catch (const std::exception& e) {
        if (bstrText) SysFreeString(bstrText);
        SafeRelease(&pCell);
        SafeRelease(&pWorkbook);
        SafeRelease(&pExcelApp);
        CoUninitialize();
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}   