import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from './game/Menu/Menu.jsx'
import Game from './game/Game/Game.jsx'
import Scores from './game/Score/Score.jsx'

import './App.css'

import NotFound from './errors/NotFound.jsx'

export default function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Menu />} />
            {/* RUTAS SIN VERIFICAR TODAVIA
            <Route path="/seleccion-modo" element={<SeleccionModo />} />
            <Route path="/seleccion-nivel/:dificultadId" element={<SeleccionNivel />} />
            <Route path="/juego/:levelId" element={<Juego />} />
            <Route path="/puntajes" element={<Puntajes />} />
            <Route path="/perfil" element={<Perfil />} />
            */}

            {/* Esta va SIEMPRE al final */}
            <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
    );
};