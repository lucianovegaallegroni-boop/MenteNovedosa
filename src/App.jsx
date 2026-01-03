import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AgendarCita from './pages/AgendarCita'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/agendar" element={<AgendarCita />} />
    </Routes>
  )
}

export default App
