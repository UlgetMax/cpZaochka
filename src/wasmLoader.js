export async function loadWasm() {
  const wasmBinary = await fetch("/test.wasm").then((res) => res.arrayBuffer());
  const module = await import("@/wasm/test.js");

  const wasmInstance = await module.default({ wasmBinary });

  function readWasmString(ptr) {
    const memory = wasmInstance.HEAPU8;
    let str = "";
    let i = ptr;

    while (memory[i] !== 0) {
      str += String.fromCharCode(memory[i]);
      i++;
    }

    return str;
  }

  return {
    getMessage: () => {
      const ptr = wasmInstance._getMessage();
      return readWasmString(ptr);
    },
  };
}
