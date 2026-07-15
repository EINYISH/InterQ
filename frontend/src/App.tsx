import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Upload from './pages/Upload'
import Simulation from './pages/Simulation'
import Feedback from './pages/Feedback'
import PrivateRoute from './routes/PrivateRoute'

export default function App() {
  return (
    <div className="min-h-screen bg-[#080C18] text-[#E8EEFF] font-sans">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <Upload />
            </PrivateRoute>
          }
        />
        <Route
          path="/simulation"
          element={
            <PrivateRoute>
              <Simulation />
            </PrivateRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <PrivateRoute>
              <Feedback />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  )
}
