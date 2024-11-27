import React, { useMemo } from 'react';
import { Card, Progress, Alert, Space, Typography, Row, Col, Tooltip, Statistic } from 'antd';
import { 
  WarningOutlined, 
  SafetyOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  DollarOutlined,
  PercentageOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const PositionRiskMonitor = ({ walletData, positions }) => {
  console.log("position",positions)
  // Enhanced risk calculations
  const calculations = useMemo(() => {
    if (!positions || !walletData) {
      return {
        totalMarginUsed: 0,
        totalRiskPercentage: 0,
        marginLevel: 100,
        totalExposure: 0,
        profitablePositions: 0,
        averagePositionSize: 0,
        riskRewardRatio: 0
      };
    }
  
    // Calculate fields
    const totalMarginUsed = positions.reduce(
      (acc, pos) => acc + parseFloat(pos.required_margin || 0),
      0
    );
  
    const totalExposure = positions.reduce((acc, pos) => {
      const lotSize = parseFloat(pos.lot_size || 0);
      const currentPrice = parseFloat(pos.currency_pair_data?.current_price || 0);
      return acc + lotSize * currentPrice;
    }, 0);
  
    const profitablePositions = positions.filter(pos => parseFloat(pos.unrealized_pnl || 0) > 0).length;

    const averagePositionSize = positions.length ? totalExposure / positions.length : 0;
  
    const riskRewardSum = positions.reduce((acc, pos) => {
      const takeProfit = parseFloat(pos.take_profit || 0);
      const stopLoss = parseFloat(pos.stop_loss || 0);
      return acc + (takeProfit - stopLoss);
    }, 0);
    
    const riskRewardRatio = positions.length ? riskRewardSum / positions.length : 0;
  
    return {
      totalMarginUsed,
      totalRiskPercentage: (totalMarginUsed / walletData.equity) * 100,
      marginLevel: walletData.margin ? (walletData.equity / walletData.margin) * 1000 : 1000,
      totalExposure,
      profitablePositions,
      averagePositionSize,
      riskRewardRatio
    };
  }, [positions, walletData]);
    

  const getRiskStatus = (riskPercentage) => {
    if (riskPercentage >= 80) return 'exception';
    if (riskPercentage >= 50) return 'warning';
    return 'success';
  };

  const getMarginLevelStatus = (level) => {
    if (level <= 110) return 'exception';
    if (level <= 150) return 'warning';
    if (level <= 200) return 'normal';
    return 'success';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  const formatMarginLevel = (percent) => {
    return `${percent.toFixed(1)}/1000`;
  };

  return (
    <Card 
      title={<span><SafetyOutlined /> Advanced Risk Monitor</span>}
      className="shadow-lg"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Title level={5}>
              Margin Level
              <Tooltip title="Higher is better. Shows your account's health relative to used margin.">
                <PercentageOutlined className="ms-2" />
              </Tooltip>
            </Title>
            <Progress
              percent={(calculations.marginLevel / 1000) * 100} // Convert to percentage of 1000
              success={{ percent: (calculations.marginLevel / 1000) * 100 }}
              format={() => formatMarginLevel(calculations.marginLevel)}
              strokeColor="#52c41a"
              trailColor="#f5f5f5"
            />
          </Col>
          <Col xs={24} lg={12}>
            <Title level={5}>
              Account Risk Level
              <Tooltip title="Lower is better. Shows how much of your equity is at risk.">
                <WarningOutlined className="ms-2" />
              </Tooltip>
            </Title>
            <Progress
              percent={calculations.totalRiskPercentage}
              status={getRiskStatus(calculations.totalRiskPercentage)}
              format={(percent) => `${percent.toFixed(1)}%`}
              strokeWidth={15}
            />
          </Col>
        </Row>

        {calculations.marginLevel < 150 && (
          <Alert
            message="Critical Margin Warning"
            description={
              <div>
                <p>Your margin level is critically low at {calculations.marginLevel.toFixed(1)}%.</p>
                <ul className="mb-0">
                  <li>Consider closing some positions immediately</li>
                  <li>Add more funds to your account</li>
                  <li>Review your risk management strategy</li>
                </ul>
              </div>
            }
            type="error"
            showIcon
            icon={<WarningOutlined />}
            className="mb-3"
          />
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="text-center h-100">
              <Statistic
                title="Open Positions"
                value={positions?.filter(position => position.status === "OPEN").length || 0}
                prefix={<SafetyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="text-center h-100">
              <Statistic
                title="Total Exposure"
                value={calculations.totalExposure}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: calculations.totalExposure > 0 ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="text-center h-100">
              <Statistic
                title="Profitable Positions"
                value={calculations.profitablePositions}
                suffix={`/ ${positions?.filter(position => position.status === "OPEN").length || 0}`}
                valueStyle={{ color: calculations.profitablePositions > 0 ? '#52c41a' : '#ff4d4f' }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="text-center h-100">
              <Statistic
                title="Avg Position Size"
                value={calculations.averagePositionSize}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: calculations.averagePositionSize > 0 ? '#1890ff' : '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card size="small" className="bg-light">
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Account Equity: </Text>
                  <Text>{formatCurrency(walletData?.equity || 0)}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Used Margin: </Text>
                  <Text>{formatCurrency(calculations.totalMarginUsed)}</Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default PositionRiskMonitor;