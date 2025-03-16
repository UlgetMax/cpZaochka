import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Statement from "./components/Statement/Statement";
import DiplomSupplement from "./components/DiplomSupplement/DiplomSupplement";
import AddData from "./pages/AddData/AddData";
import TitleBar from "./components/TitleBar/TitleBar";
import HelpSystem from "./pages/HelpSystem/HelpSystem";
import FAQ from "./components/HelpSystemComponent/FAQ";
import Instructions from "./components/HelpSystemComponent/Instructions";
import Troubleshooting from "./components/HelpSystemComponent/Troubleshooting";

function App() {
    return (
        <div>
            <TitleBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/statement" element={<Statement />} />
                <Route path="/diplomsupplement" element={<DiplomSupplement />} />
                <Route path="/addData" element={<AddData />} />
                <Route path="/help" element={<HelpSystem />}>
                    <Route path="instructions" element={<Instructions />} />
                    <Route path="faq" element={<FAQ />} />
                    <Route path="troubleshooting" element={<Troubleshooting />} />
                    <Route index element={<Instructions />} /> {/* По умолчанию */}
                </Route>
                <Route path="/about" element={<About />} />
            </Routes>
        </div>
    );
}

export default App;