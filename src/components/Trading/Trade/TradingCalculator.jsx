import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Select, Typography, Row, Col, Divider } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const TradingCalculator = ({ selectedPair, leverage = 100 }) => {
  const [lotSize, setLotSize] = useState(0.01);
  const [calculations, setCalculations] = useState({
    requiredMargin: 0,
    pipValue: 0,
    potentialProfit: 0,
    potentialLoss: 0
  });

  useEffect(() => {
    if (selectedPair?.current_price) {
      calculateValues();
    }
  }, [lotSize, selectedPair]);

  const calculateValues = () => {
    const contractSize = 1000; // Standard lot size
    const currentPrice = selectedPair.current_price;
    
    // Calculate required margin
    const requiredMargin = (lotSize * contractSize * currentPrice) / leverage;
    
    // Calculate pip value (assuming 4 decimal places for most pairs)
    const pipValue = lotSize * contractSize * 0.0001;
    
    // Calculate potential profit/loss (assuming 50 pip movement)
    const potentialProfit = pipValue * 50;
    const potentialLoss = pipValue * 50;

    setCalculations({
      requiredMargin,
      pipValue,
      potentialProfit,
      potentialLoss
    });
  };

  return (
    <Card 
      title={
        <span>
          <CalculatorOutlined className="mr-2" />
          Position Calculator
        </span>
      }
      className="shadow-lg"
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Lot Size">
              <InputNumber
                value={lotSize}
                onChange={setLotSize}
                min={0.01}
                max={100}
                step={0.01}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Current Price">
              <InputNumber
                value={Number(selectedPair?.current_price).toFixed(2)}
                disabled
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Title level={5}>Required Margin</Title>
            <Text>${Number(calculations.requiredMargin).toFixed(2)}</Text>
          </Col>
          <Col span={12}>
            <Title level={5}>Pip Value</Title>
            <Text>${Number(calculations.pipValue).toFixed(2)}</Text>
          </Col>
          <Col span={12}>
            <Title level={5}>Potential Profit (50 pips)</Title>
            <Text type="success">${Number(calculations.potentialProfit).toFixed(2)}</Text>
          </Col>
          <Col span={12}>
            <Title level={5}>Potential Loss (50 pips)</Title>
            <Text type="danger">${Number(calculations.potentialLoss).toFixed(2)}</Text>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default TradingCalculator;