// Trade.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Table, notification, message, Button, Space, Typography } from 'antd';
import axios from 'axios';
import TradingForm from './TradeForm';
import TradingCalculator from './TradingCalculator';
import PositionRiskMonitor from './PositionRiskMonitor';
import TradingMetricsInfo from './TradingMetricsInfo';
import { 
  SafetyOutlined, 
  ArrowUpOutlined, 
  DollarOutlined,
  PercentageOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Trade = () => {
  const [walletData, setWalletData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [currencyPairs, setCurrencyPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCurrencyPair, setSelectedCurrencyPair] = useState(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    fetchWalletData();
    fetchPositions();
    fetchCurrencyPairs();

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        message.loading("")
        fetchWalletData();
        fetchPositions();
        fetchCurrencyPairs();
      }
    }, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}trading/wallet/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken')}`
        }
      });
      setWalletData(response.data[0]);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch wallet data'
      });
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}trading/positions/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken')}`
        }
      });
      setPositions(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch positions'
      });
    }
  };

  const fetchCurrencyPairs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}trading/currency-pairs/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken')}`
        }
      });
      setCurrencyPairs(response.data);
      console.log("fetchCurrencyPairs",response.data)
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch currency pairs'
      });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    console.log("values",values)
    try {
      const payload = {
        currency_pair: values.currency_pair, // Ensure it's a number
        currency_pair_id: values.currency_pair, // Ensure it's a number
        position_type: values.positionType,
        lot_size: values.lot_size, // Ensure 2 decimal places
        stop_loss: values.stop_loss ? values.stop_loss : null,
        take_profit: values.take_profit ? values.take_profit : null
      };

      console.log('Sending payload:', payload); // Debug log

      const response = await axios.post(
        `${API_BASE_URL}trading/positions/`, 
        payload,
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', response.data); // Debug log
      
      message.success('Position opened successfully');
      fetchPositions();
      fetchWalletData();
    } catch (error) {
      console.error('Error response:', error.response?.data); // Debug log
      
      let errorMessage = 'Failed to open position';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else {
          const fieldErrors = [];
          Object.entries(error.response.data).forEach(([field, errors]) => {
            const errorMessage = Array.isArray(errors) ? errors[0] : errors;
            fieldErrors.push(`${field}: ${errorMessage}`);
          });
          
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n');
          }
        }
      }
      
      notification.error({
        message: 'Error Opening Position',
        description: errorMessage,
        duration: 5
      });
    } finally {
      setLoading(false);
    }
  };
  const closePosition = async (positionId) => {
    try {
      await axios.post(`${API_BASE_URL}trading/positions/${positionId}/close/`, {}, {
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken')}`
        }
      });
      
      message.success('Position closed successfully');
      fetchPositions();
      fetchWalletData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to close position'
      });
    }
  };

  const positionColumns = [
    {
      title: 'Currency Pair',
      dataIndex: ['currency_pair', 'symbol'],
      key: 'currency_pair'
    },
    {
      title: 'Current Price',
      dataIndex: ['currency_pair', 'current_price'],
      key: 'current_price',
      render:(value) => (
        <span>{Number(value).toFixed(2)}</span>
      )
    },
    {
      title: 'Type',
      dataIndex: 'position_type',
      key: 'position_type'
    },
    {
      title: 'Lot Size',
      dataIndex: 'lot_size',
      key: 'lot_size'
    },
    {
      title: 'Entry Price',
      dataIndex: 'entry_price',
      key: 'entry_price',
      render:(value) => (
        <span>{Number(value).toFixed(2)}</span>
      )
    },
    {
      title: 'S/L',
      dataIndex: 'stop_loss',
      key: 'stop_loss',
      render: (value) => (
        <span style={{ color: 'red' }}>
          {value?Number(value).toFixed(0):'-'}
        </span>
      )
    },
    {
      title: 'T/P',
      dataIndex: 'take_profit',
      key: 'take_profit',
      render: (value) => (
        <span style={{ color: 'red' }}>
          {value?Number(value).toFixed(0):'-'}
        </span>
      )
    },
    {
      title: 'Unrealized P/L',
      dataIndex: 'unrealized_pnl',
      key: 'unrealized_pnl',
      render: (value) => (
        <span style={{ color: value >= 0 ? 'green' : 'red' }}>
          {Number(value).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          danger 
          onClick={() => closePosition(record.id)}
          disabled={record.status !== 'OPEN'}
        >
          {record.status === 'OPEN' ? 'Close' : 'Closed'}
        </Button>
      )
    }
  ];

  return (
    <div className="container-fluid mt-4">
      <Row gutter={[16, 16]} justify="space-around" align="middle" style={{ margin: "20px 0" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="shadow-lg"
            style={{
              background: "#e3f7fc",
              borderRadius: "12px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
                  <DollarOutlined style={{ marginRight: "8px", color: "#0079d3" }} />
                  Balance
                </Text>
              }
              value={walletData?.balance || 0}
              precision={2}
              valueStyle={{ fontSize: "24px", color: "#0079d3" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="shadow-lg"
            style={{
              background: "#f9f7e8",
              borderRadius: "12px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#ff9800", fontSize: "16px" }}>
                  <SafetyOutlined style={{ marginRight: "8px", color: "#d68c1c" }} />
                  Equity
                </Text>
              }
              value={walletData?.equity || 0}
              precision={2}
              valueStyle={{ fontSize: "24px", color: "#d68c1c" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="shadow-lg"
            style={{
              background: "#fff0f6",
              borderRadius: "12px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#eb2f96", fontSize: "16px" }}>
                  <PercentageOutlined style={{ marginRight: "8px", color: "#cf1322" }} />
                  Margin
                </Text>
              }
              value={walletData?.margin || 0}
              precision={2}
              valueStyle={{ fontSize: "24px", color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="shadow-lg"
            style={{
              background: "#f6ffed",
              borderRadius: "12px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                  <ArrowUpOutlined style={{ marginRight: "8px", color: "#389e0d" }} />
                  Free Margin
                </Text>
              }
              value={walletData?.free_margin || 0}
              precision={2}
              valueStyle={{ fontSize: "24px", color: "#389e0d" }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Metrics information row */}
      <Row className="mt-4" justify="center">
        <Col xs={24} md={20}>
          <TradingMetricsInfo walletData={walletData} />
        </Col>
      </Row>

      {/* Trading interface row */}
      <Row gutter={[24, 24]} className="mt-4">
        {/* Left Section: Trading Form and Calculator */}
        <Col xs={24} md={10} lg={8}>
          <Card className="shadow-lg p-3 bg-light">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <TradingForm 
                currencyPairs={currencyPairs}
                walletData={walletData}
                onSubmit={handleSubmit}
                loading={loading}
                onCurrencyPairSelect={(pair) => setSelectedCurrencyPair(pair)}
              />
              <TradingCalculator selectedPair={selectedCurrencyPair} />
            </Space>
          </Card>
        </Col>

        {/* Right Section: Risk Monitor and Open Positions */}
        <Col xs={24} md={14} lg={16}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Risk Monitoring" className="shadow-lg p-3">
              <PositionRiskMonitor 
                walletData={walletData}
                positions={positions}
              />
            </Card>
            <Card title="Open Positions" className="shadow-lg p-3">
              <Table
                columns={positionColumns}
                dataSource={positions.filter(position => position.status === 'OPEN')}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default Trade;