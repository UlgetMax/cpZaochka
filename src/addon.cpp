#include <napi.h>

extern Napi::Value GetProcesses(const Napi::CallbackInfo& info); 
extern Napi::Value InsertTextToWord(const Napi::CallbackInfo& info);
extern Napi::Value InsertTextToExcel(const Napi::CallbackInfo& info);
extern Napi::Value InsertTextSmart(const Napi::CallbackInfo& info);


Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("getProcesses", Napi::Function::New(env, GetProcesses));

    exports.Set("insertTextSmart", Napi::Function::New(env, InsertTextSmart));

    exports.Set("insertTextToWord", Napi::Function::New(env, InsertTextToWord));
    exports.Set("insertTextToExcel", Napi::Function::New(env, InsertTextToExcel));
    return exports;
}

NODE_API_MODULE(wordAutomation, Init)
