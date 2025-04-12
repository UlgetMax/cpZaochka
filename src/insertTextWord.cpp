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

Napi::Value InsertTextToWord(const Napi::CallbackInfo& info) {
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
    IDispatch* pWordApp = nullptr;
    IDispatch* pSelection = nullptr;
    IDispatch* pDocument = nullptr;

    try {
        CLSID clsid;
        HRESULT hr = CLSIDFromProgID(L"Word.Application", &clsid);
        if (FAILED(hr)) throw std::runtime_error("Word is not installed");

        IUnknown* pUnknown = nullptr;
        hr = GetActiveObject(clsid, NULL, &pUnknown);
        if (FAILED(hr) || !pUnknown)
            throw std::runtime_error("Cannot find running instance of Word");

        hr = pUnknown->QueryInterface(IID_IDispatch, (void**)&pWordApp);
        pUnknown->Release();
        if (FAILED(hr)) throw std::runtime_error("Cannot get IDispatch from Word");

        {
            DISPID dispID;
            OLECHAR* name = L"Visible";
            VARIANT arg;
            arg.vt = VT_BOOL;
            arg.boolVal = VARIANT_TRUE;
            DISPPARAMS dp = { &arg, NULL, 1, 0 };
            if (SUCCEEDED(pWordApp->GetIDsOfNames(IID_NULL, &name, 1, LOCALE_USER_DEFAULT, &dispID))) {
                pWordApp->Invoke(dispID, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT, &dp, NULL, NULL, NULL);
            }
        }

        {
            DISPID dispID;
            OLECHAR* prop = L"ActiveDocument";
            VARIANT result;
            VariantInit(&result);
            DISPPARAMS noArgs = { nullptr, nullptr, 0, 0 };

            if (SUCCEEDED(pWordApp->GetIDsOfNames(IID_NULL, &prop, 1, LOCALE_USER_DEFAULT, &dispID)) &&
                SUCCEEDED(pWordApp->Invoke(dispID, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &result, NULL, NULL)) &&
                result.vt == VT_DISPATCH) {
                pDocument = result.pdispVal;
            } else {
                DISPID dispIDDocs;
                OLECHAR* docsName = L"Documents";
                if (SUCCEEDED(pWordApp->GetIDsOfNames(IID_NULL, &docsName, 1, LOCALE_USER_DEFAULT, &dispIDDocs))) {
                    VARIANT docsResult;
                    VariantInit(&docsResult);
                    if (SUCCEEDED(pWordApp->Invoke(dispIDDocs, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &docsResult, NULL, NULL))) {
                        IDispatch* pDocuments = docsResult.pdispVal;

                        DISPID dispIDAdd;
                        OLECHAR* addName = L"Add";
                        if (SUCCEEDED(pDocuments->GetIDsOfNames(IID_NULL, &addName, 1, LOCALE_USER_DEFAULT, &dispIDAdd))) {
                            VARIANT newDoc;
                            VariantInit(&newDoc);
                            if (SUCCEEDED(pDocuments->Invoke(dispIDAdd, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &noArgs, &newDoc, NULL, NULL)) &&
                                newDoc.vt == VT_DISPATCH) {
                                pDocument = newDoc.pdispVal;
                            }
                        }
                        SafeRelease(&pDocuments);
                    }
                }
            }

            if (!pDocument)
                throw std::runtime_error("Failed to get or create Word document");
        }

        {
            DISPID dispIDSel;
            OLECHAR* selName = L"Selection";
            VARIANT result;
            VariantInit(&result);
            DISPPARAMS noArgs = { nullptr, nullptr, 0, 0 };
            if (FAILED(pWordApp->GetIDsOfNames(IID_NULL, &selName, 1, LOCALE_USER_DEFAULT, &dispIDSel)) ||
                FAILED(pWordApp->Invoke(dispIDSel, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &noArgs, &result, NULL, NULL)) ||
                result.vt != VT_DISPATCH)
                throw std::runtime_error("Cannot get Selection");

            pSelection = result.pdispVal;
        }

        {
            DISPID dispIDTypeText;
            OLECHAR* methodName = L"TypeText";
            if (FAILED(pSelection->GetIDsOfNames(IID_NULL, &methodName, 1, LOCALE_USER_DEFAULT, &dispIDTypeText)))
                throw std::runtime_error("Cannot find TypeText method");

            VARIANT arg;
            arg.vt = VT_BSTR;
            arg.bstrVal = bstrText;
            DISPPARAMS dp = { &arg, NULL, 1, 0 };

            if (FAILED(pSelection->Invoke(dispIDTypeText, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &dp, NULL, NULL, NULL)))
                throw std::runtime_error("Failed to insert text");
        }

        SysFreeString(bstrText);
        SafeRelease(&pSelection);
        SafeRelease(&pDocument);
        SafeRelease(&pWordApp);
        CoUninitialize();

        return Napi::Boolean::New(env, true);
    }
    catch (const std::exception& e) {
        if (bstrText) SysFreeString(bstrText);
        SafeRelease(&pSelection);
        SafeRelease(&pDocument);
        SafeRelease(&pWordApp);
        CoUninitialize();
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}
