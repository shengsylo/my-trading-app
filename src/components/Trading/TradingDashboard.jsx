// src/components/trading/TradingDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChartOutlined,
  DashboardOutlined,
  WalletOutlined,
  LineChartOutlined,
  HistoryOutlined,
  SettingOutlined,AppstoreOutlined, PieChartOutlined, RobotOutlined, PropertySafetyOutlined
} from '@ant-design/icons';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL;
const { Header, Sider, Content } = Layout;

const TradingDashboard = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}trading/check-admin/`, { 
          headers: {
            Authorization: `Token ${localStorage.getItem('authToken')}`,
          }
        });
        setIsAdmin(response.data.is_admin); 
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    checkAdminStatus();
  }, []);

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/trading/dashboard'),
    },
    {
      key: '2',
      icon: <WalletOutlined />,
      label: 'Wallet',
      onClick: () => navigate('/trading/wallet'),
    },
    {
      key: '3', // Changed key to 'trading'
      icon: <LineChartOutlined />,
      label: 'Trade',
      onClick: () => navigate('/trading/trade'), 
    },
    {
      key: '4',
      icon: <HistoryOutlined />,
      label: 'History',
      onClick: () => navigate('/trading/history'),
    },
    {
      key: '5',
      icon: <PieChartOutlined />,
      label: 'Performance',
      onClick: () => navigate('/trading/performance'),
    },
    {
      key: '6',
      icon: <RobotOutlined />,
      label: 'Bot Setting',
      onClick: () => navigate('/trading/bot-setting'),
    },
    {
      key: '7',
      icon: <PropertySafetyOutlined />,
      label: 'Bot Manage',
      onClick: () => navigate('/trading/bot-management'),
    },
    {
      key: '8',
      icon: <AppstoreOutlined />,
      label: 'Upgrade',
      onClick: () => navigate('/trading/pricing'),
    }
  ];

  if (isAdmin) {
    menuItems.push({
      key: 'admin',
      icon: <SettingOutlined />,
      label: 'Admin Panel',
      onClick: () => navigate('/trading/admin'),
    });
  }

  return (
    <Layout className="100vh overflow-hidden " >
      {/* Fixed Sider */}
      <Sider
        className=" mt-5 pt-5"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={200}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#001529',
        }}
      >

        {/* Navigation Menu */}
        <Menu
          theme="dark"
          selectedKeys={[selectedKey]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200, // Adjust margin for collapsed sidebar
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Trading Corner</div>
        </Header>

        {/* Content */}
        <Content
          className='mb-5'
          style={{
            margin: '16px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default TradingDashboard;