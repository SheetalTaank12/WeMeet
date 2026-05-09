
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import HistoryComponent from './pages/history';

function App() {
  return (
    <>
    <Router>
      <AuthProvider>
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />

          <Route path="/:url" element={<VideoMeetComponent />} />
          <Route path="/home" element={<HomeComponent />} />
          <Route path='/history' element={<HistoryComponent/>}/>
      </Routes>
      </AuthProvider>
    </Router>
    </>
  );
}

export default App;
