import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from '../../components/Shared/Header/Header';
import AuthForm from '../../components/User/Auth/AuthForm';
import Profile from '../../components/User/Profile/Profile';
import ForgotPassword from '../../components/User/Password/ForgotPassword'
import PasswordResetDone from '../../components/User/Password/PasswordResetDone';
import PasswordResetConfirm from '../../components/User/Password/PasswordResetConfirm'
import Dashboard from '../../components/Dashboard/Dashboard'
import ErrorPage from '../../components/ErrorPage/ErrorPage'
// import Logout from '../../components/User/Logout/Logout';
import ProtectedRoute from '../Route/ProtectedRoute/ProtectedRoute.jsx';
import Footer from '../../components/Shared/Footer/Footer';
import ActivateEmail from '../../components/User/Auth/ActivateEmail';
import RealTimeMarketData from '../../components/Trading/RealTimeMarketData.jsx'
import LandingPage from '../../components/LandingPage/LandingPage.jsx'
import CommunityPostList from '../../components/Community/CommunityPostList.jsx';
import ForexDashboard from '../../components/Trading/ForexDashboard.jsx';
import TradingDashboard from '../../components/Trading/TradingDashboard.jsx'
import AdminDashboard from '../../components/Trading/Admin/AdminDashboard.jsx'
import WalletDashboard from '../../components/Trading/Wallet/WalletDashboard.jsx'
import Trade from '../../components/Trading/Trade/Trade.jsx'
import History from '../../components/Trading/History/History.jsx'
import PerformanceDashboard from '../../components/Trading/Member/PerformancePage.jsx'
import BotSettingPage from '../../components/Trading/Member/BotSettingPage.jsx'
import PricingPage from '../../components/Trading/Member/PricingPage.jsx'
import BotPositionManagement from '../../components/Trading/Member/BotManagement.jsx'
import { usePageViewTracker } from '../Route/ProtectedRoute/RouteLoggingService.js';
import './App.css'
function App() {
  return (
    <BrowserRouter> {/* BrowserRouter is the top-level component */}
      <div className="app-container d-flex flex-column vh-100"> {/* Make app-container take full viewport height */}
        <Header /> 
        <MainContent className="flex-grow-1" /> 
        <Footer /> 
      </div>
    </BrowserRouter>
  );
}

function MainContent() {
  const location = useLocation(); // Now useLocation is within the context of BrowserRouter
  usePageViewTracker(); // Call the hook here

  console.log("ROUTE Path > ", location.pathname); 

  return (
    <div className="main-content-wrapper flex-grow-1 pt-5 mt-4 pb-4" style={{backgroundColor: "black"}}> 
      <main className="flex-grow-1 ">
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/authform' element={<AuthForm />} />
          <Route path="/profile" element={<ProtectedRoute Element={Profile} />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/forex-dashboard' element={<ForexDashboard />} />
          <Route path='/forgot_password' element={<ForgotPassword />} />
          <Route path='/password-reset-done' element={<PasswordResetDone />} />
          <Route path="/password-reset-confirm/:uidb64/:token/" element={<PasswordResetConfirm />} />
          <Route path="/activate_email/:uidb64/:token/" element={<ActivateEmail />} />
          {/* <Route path="/real_time_market_data" element={<RealTimeMarketData />} /> */}
          <Route path="/community" element={<ProtectedRoute Element={CommunityPostList} />} />
          <Route path="/trading" element={<ProtectedRoute Element={TradingDashboard} />}> 
            {/* <Route path="dashboard" element={<TradingDashboard />} />  */}
            <Route path="wallet" element={<ProtectedRoute Element={WalletDashboard} />} />
            <Route path="trade" element={<ProtectedRoute Element={Trade} />} /> 
            <Route path="history" element={<ProtectedRoute Element={History} />} /> 
            <Route path="admin" element={<ProtectedRoute Element={AdminDashboard} />} />
            <Route path="dashboard" element={<ProtectedRoute Element={RealTimeMarketData} />} />
            <Route path="performance" element={<ProtectedRoute Element={PerformanceDashboard} />} />
            <Route path="bot-management" element={<ProtectedRoute Element={BotPositionManagement} />} />
            <Route path="bot-setting" element={<ProtectedRoute Element={BotSettingPage} />} />
            <Route path="pricing" element={<ProtectedRoute Element={PricingPage} />} />
            <Route path="" element={<ProtectedRoute Element={RealTimeMarketData} />} />
            <Route path='*' element={<ProtectedRoute Element={ErrorPage} />} />
          </Route>

          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

