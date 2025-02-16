export async function loadWasm() {
  try {
    let wasmUrl;

    if (import.meta.env.MODE === "development") {
      wasmUrl = "/test.wasm"; // В dev-режиме
    } else {
      const wasmPath = await window.electron.getWasmPath();
      wasmUrl = `file://${wasmPath.replace(/\\/g, "/")}`;
    }

    console.log("WASM URL:", wasmUrl);

    const wasmBinary = await fetch(wasmUrl).then((res) => res.arrayBuffer());
    const module = await import("@/wasm/test.js");

    const wasmInstance = await module.default({ wasmBinary });

    return {
      wasmInstance,
      ccall: wasmInstance.ccall.bind(wasmInstance),
      getData: () => {
        const jsonStr = wasmInstance.ccall("getData", "string", [], []);
        return JSON.parse(jsonStr);
      },
    };
  } catch (error) {
    console.error("Ошибка загрузки WASM:", error);
    throw error;
  }
}
