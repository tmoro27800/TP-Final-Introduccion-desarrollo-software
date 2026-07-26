import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppBackground from "./components/Backgrounds/AppBackground.jsx";
import Menu from './game/Menu/Menu.jsx'
import Game from './game/Game/Game.jsx'
import Score from './game/Score/Score.jsx'
import SelectionMode from './game/SelectionMode/SelectionMode.jsx'
import SelectionLevel from './game/SelectionLevel/SelectionLevel.jsx'
import './App.css'

import NotFound from './errors/NotFound.jsx'

export default function App() {
    return (
        <BrowserRouter>
        <AppBackground />
        <Routes>
            <Route path="/" element={<Menu />} />

            <Route path='/puntajes' element={<Score/>} />

            <Route path="/seleccion-modo" element={<SelectionMode />} />
            <Route path="/seleccion-nivel/:modoId" element={<SelectionLevel />} />
            <Route path="/juego" element={<Game />} />
            <Route path="/juego/:levelId" element={<Game />} />

            {/* RUTAS SIN VERIFICAR TODAVIA
            <Route path="/perfil" element={<Perfil />} />
            */}

            {/* Esta va SIEMPRE al final */}
            <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
    );
};
