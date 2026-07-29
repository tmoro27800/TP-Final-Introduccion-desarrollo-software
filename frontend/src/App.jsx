import { BrowserRouter, Routes, Route } from "react-router-dom";

import Menu from './juego/Menu/Menu.jsx'
import Puntaje from './juego/Puntaje/Puntaje.jsx'
import Juego from './juego/Juego/Juego.jsx'

import SeleccionModo from './juego/SeleccionModo/SeleccionModo.jsx'
import SeleccionNivel from './juego/SeleccionNivel/SeleccionNivel.jsx'
import AppFondo from './componentes/Fondos/AppFondo.jsx'
import NoEncontrada from './errores/NoEncontrada.jsx'
import { ConfiguracionProvider } from './juego/Configuracion/ConfiguracionContext.jsx'
import { MusicaProvider } from './juego/Musica/MusicaContext.jsx'

import './App.css'

export default function App() {
    return (
        // ConfiguracionProvider por fuera de todo: cualquier pantalla
        // (Menu, Juego, etc.) puede leer/cambiar controles, audio e idioma
        // con useConfiguracion(). Ver juego/Configuracion/ConfiguracionContext.jsx.
        // MusicaProvider necesita leer esa configuración (el toggle de
        // musica), por eso va adentro.
        <ConfiguracionProvider>
        <MusicaProvider>
        <BrowserRouter>
        <AppFondo />
        <Routes>
            <Route path="/" element={<Menu />} />

            <Route path='/puntajes' element={<Puntaje/>} />

            <Route path="/seleccion-modo" element={<SeleccionModo />} />
            <Route path="/seleccion-nivel/:modoId" element={<SeleccionNivel />} />
            <Route path="/juego" element={<Juego />} />
            <Route path="/juego/:levelId" element={<Juego />} />

            {/* Paginas que no existen (404) */}
            <Route path="*" element={<NoEncontrada />} />

        </Routes>
        </BrowserRouter>
        </MusicaProvider>
        </ConfiguracionProvider>
    );
};
