import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../../components/Shared/Header/Header';
import AuthForm from '../../components/User/Auth/AuthForm';
import Profile from '../../components/User/Profile/Profile';
import Dashboard from '../../components/Dashboard/Dashboard'
import ErrorPage from '../../components/ErrorPage/ErrorPage'
// import Logout from '../../components/User/Logout/Logout';
import ProtectedRoute from '../Route/ProtectedRoute/ProtectedRoute.jsx';
import './App.css'
import Footer from '../../components/Shared/Footer/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
      <Header />
        <Routes>
            <Route path='/' element={<AuthForm />} />
            <Route path='/authform' element={<AuthForm />} />
            <Route path="/profile" element={<ProtectedRoute Element={Profile} />} />  
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='*' element={<ErrorPage />} />
        </Routes>{}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
