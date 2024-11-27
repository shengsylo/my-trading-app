import React, { useState } from 'react';
import { Card, Typography, Table, Button, Modal, Space, Divider } from 'antd';
import { InfoCircleOutlined, CalculatorOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const TradingMetricsInfo = ({ walletData }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const metricsData = [
    {
      key: '1',
      metric: 'Balance',
      formula: 'Initial Deposit + Realized P&L',
      value: walletData?.balance || 0,
      description: 'Your actual account balance from completed trades only, excluding unrealized profits/losses.'
    },
    {
      key: '2',
      metric: 'Equity',
      formula: 'Balance + Unrealized P&L',
      value: walletData?.equity || 0,
      description: 'Total account value including unrealized profits/losses from open positions.'
    },
    {
      key: '3',
      metric: 'Margin',
      formula: '∑(Lot Size × Contract Size × Current Price) ÷ Leverage',
      value: walletData?.margin || 0,
      description: 'Amount reserved for maintaining open positions.'
    },
    {
      key: '4',
      metric: 'Free Margin',
      formula: 'Equity - Margin',
      value: walletData?.free_margin || 0,
      description: 'Available funds for opening new positions.'
    }
  ];

  const columns = [
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
      width: '15%',
    },
    {
      title: 'Formula',
      dataIndex: 'formula',
      key: 'formula',
      width: '25%',
    },
    {
      title: 'Current Value',
      dataIndex: 'value',
      key: 'value',
      width: '15%',
      render: (value) => `$${value}`
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    }
  ];

  const calculationExamples = () => (
    <div className="mt-3 shadow-lg">
      <Title level={4}>Example Calculations</Title>
      <Space direction="vertical" className="w-100">
        <Card size="small" className="mb-2">
          <Text strong>Standard Lot Example (EUR/USD at 1.2000):</Text>
          <Paragraph className="mb-1">
            Without leverage: $120,000 required<br />
            With 1:100 leverage: $1,200 margin required
          </Paragraph>
        </Card>

        <Card size="small" className="mb-2">
          <Text strong>Margin Call Warning:</Text>
          <Paragraph className="mb-1">
            Triggered when Free Margin approaches zero<br />
            Action needed: Close positions or add funds
          </Paragraph>
        </Card>

        <Card size="small">
          <Text strong>Stop Out Level:</Text>
          <Paragraph className="mb-1">
            Occurs when Free Margin becomes negative<br />
            Result: Automatic position closure to prevent further losses
          </Paragraph>
        </Card>
      </Space>
    </div>
  );

  return (
    <>
      <Card 
        title={
          <Space>
            <InfoCircleOutlined />
            <span>Trading Metrics Explained</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<CalculatorOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            View Detailed Calculations
          </Button>
        }
        className=" shadow-lg "
      >
        <Table 
          dataSource={metricsData} 
          columns={columns} 
          pagination={false}
          size="small"
        />
      </Card>

      <Modal
        title="Detailed Trading Metrics Information"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <Typography>
          <Title level={3}>Understanding Trading Metrics</Title>
          <Paragraph>
            Trading metrics help you monitor your account status and make informed decisions
            about position sizing and risk management.
          </Paragraph>
          
          <Divider />
          
          <Title level={4}>Key Metrics Explained</Title>
          <Space direction="vertical" className="w-100">
            {metricsData.map(metric => (
              <Card size="small" key={metric.key} className="mb-2">
                <Text strong>{metric.metric}</Text>
                <Paragraph className="mb-1">
                  Formula: {metric.formula}<br />
                  Current Value: ${metric.value}<br />
                  {metric.description}
                </Paragraph>
              </Card>
            ))}
          </Space>

          {calculationExamples()}
        </Typography>
      </Modal>
    </>
  );
};

export default TradingMetricsInfo;