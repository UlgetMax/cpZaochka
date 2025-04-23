#pragma once
#include <windows.h>
#include <oleauto.h>

template<class T>
void SafeRelease(T** ppT) {
    if (*ppT) {
        (*ppT)->Release();
        *ppT = NULL;
    }
}


inline HRESULT GetDispID(IDispatch* disp, const wchar_t* name, DISPID* dispid) {
    LPOLESTR olestr = const_cast<LPOLESTR>(name);
    return disp->GetIDsOfNames(IID_NULL, &olestr, 1, LOCALE_USER_DEFAULT, dispid);
}