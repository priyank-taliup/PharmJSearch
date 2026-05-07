import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PasscodeGate from './components/PasscodeGate'
import JobListingsPage from './pages/JobListingsPage'
import JobDetailPage from './pages/JobDetailPage'
import './App.css'

function App() {
  return (
    <PasscodeGate>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<JobListingsPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </PasscodeGate>
  )
}

export default App
