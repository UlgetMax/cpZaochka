import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home/Home";
import InsertText from "./components/insertText/insertText";
import InsertReplacePlaceholder from "./components/InsertReplacePlaceholder/InsertReplacePlaceholder";

function App() {
  
  return (
    <div>
      <Routes>
        {/* <Route path="/" element={<Home/>}/> */}
        <Route path="/insertText" element={<InsertText/>}/>
        <Route path="/" element={<InsertReplacePlaceholder/>}/>
      </Routes>
    </div>
  );
}

export default App;
