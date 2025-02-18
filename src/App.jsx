// import "./App.css";
import React, {useEffect, useState} from "react";
import { Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Statement from "./components/Statement/Statement";

function App() {

  return (
    <div>

      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/statement" element={<Statement/>}/>
        <Route path="/about" element={<About/>}/>
      </Routes>
    </div>
  );
}

export default App;
