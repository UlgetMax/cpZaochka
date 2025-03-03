import React, {useEffect, useState} from "react";
import { Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Statement from "./components/Statement/Statement";
import DiplomSupplement from "./components/DiplomSupplement/DiplomSupplement";
import AddData from "./pages/AddData/AddData";
import TitleBar from "./components/TitleBar/TitleBar";

function App() {

  return (
    <div>
      <TitleBar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/statement" element={<Statement/>}/>
        <Route path="/diplomsupplement" element={<DiplomSupplement/>}/>
        <Route path="/addData" element={<AddData/>}/>

        <Route path="/about" element={<About/>}/>
      </Routes>
    </div>
  );
}

export default App;
