{
  "targets": [
    {
      "target_name": "wordAutomation",
      "sources": [
        "src/addon.cpp",
        "src/getProcesses.cpp",
        "src/insertTextWord.cpp",
        "src/insertTextExcel.cpp",
        "src/insertTextSmart.cpp"
        ],
      "include_dirs": [
        "<!(node -p \"require.resolve('node-addon-api').replace(/\\\\/g, '/').replace('/index.js', '')\")"
      ],
      "libraries": ["ole32.lib", "oleaut32.lib"],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS",
        "WINVER=0x0601",
        "_WIN32_WINNT=0x0601"
      ],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1,
          "AdditionalOptions": ["/EHsc", "/std:c++17"]
        },
        "VCLinkerTool": {
          "AdditionalDependencies": ["ole32.lib", "oleaut32.lib"]
        }
      }
    }
  ]
}
