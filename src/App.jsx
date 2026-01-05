import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AgendarCita from './pages/AgendarCita'
import Agenda from './pages/Agenda'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/agendar" element={<AgendarCita />} />
      <Route path="/agenda" element={<Agenda />} />
    </Routes>
  )
}

export default App
