import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
    return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Game />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/puntajes" element={<Scores />} />
        </Routes>
    </BrowserRouter>
    );
}

export default App;