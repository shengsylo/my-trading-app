import React, { useState, useEffect } from 'react';
import { Card, Form, Select, InputNumber, Button, Alert, Typography, Space } from 'antd';

const { Option } = Select;
const { Text } = Typography;

const TradingForm = ({ 
  currencyPairs, 
  walletData, 
  onSubmit, 
  loading,
  onCurrencyPairSelect
}) => {
  const [form] = Form.useForm();
  const [marginRequired, setMarginRequired] = useState(0);
  const [validationMessage, setValidationMessage] = useState(null);
  const [selectedPair, setSelectedPair] = useState(null);

  useEffect(() => {
    calculateMargin();
  }, [form.getFieldValue('lotSize'), selectedPair]);

  const calculateMargin = () => {
    const lotSize = form.getFieldValue('lotSize') || 0;
    if (!selectedPair || !lotSize) {
      setMarginRequired(0);
      return;
    }

    const contractSize = 1000;
    const leverage = 100;
    const currentPrice = selectedPair.current_price;
    
    const requiredMargin = (lotSize * contractSize * currentPrice) / leverage;
    setMarginRequired(requiredMargin);

    if (walletData?.free_margin < requiredMargin) {
      setValidationMessage({
        type: 'error',
        message: `Insufficient free margin. Required: $${requiredMargin}, Available: $${walletData?.free_margin}`
      });
    } else {
      setValidationMessage(null);
    }
  };

  const validatePrices = (values) => {
    if (!selectedPair) return true;
    
    const currentPrice = selectedPair.current_price;
    const { positionType, stopLoss, takeProfit } = values;
    
    if (positionType === 'BUY') {
      if (stopLoss && stopLoss >= currentPrice) {
        setValidationMessage({
          type: 'error',
          message: 'Stop loss must be below current market price for buy positions'
        });
        return false;
      }
      if (takeProfit && takeProfit <= currentPrice) {
        setValidationMessage({
          type: 'error',
          message: 'Take profit must be above current market price for buy positions'
        });
        return false;
      }
    } else if (positionType === 'SELL') {
      if (stopLoss && stopLoss <= currentPrice) {
        setValidationMessage({
          type: 'error',
          message: 'Stop loss must be above current market price for sell positions'
        });
        return false;
      }
      if (takeProfit && takeProfit >= currentPrice) {
        setValidationMessage({
          type: 'error',
          message: 'Take profit must be below current market price for sell positions'
        });
        return false;
      }
    }
    return true;
  };

  const handleCurrencyPairChange = (value) => {
    const pair = currencyPairs.find(p => p.id === value);
    setSelectedPair(pair);
    onCurrencyPairSelect(pair); // Add this line to pass the selected pair up
    form.setFieldsValue({
      stopLoss: null,
      takeProfit: null
    });
    calculateMargin();
  };

  const handleSubmit = async (values) => {
    if (!validatePrices(values)) {
      return;
    }

    if (marginRequired > walletData?.free_margin) {
      return;
    }

    // Transform the data to match the backend expectations
    const formattedValues = {
      ...values,
      currency_pair: values.currencyPair,  // Keep the original currencyPair ID
      currency_pair_id: values.currencyPair,  // Add this field for the backend
      lot_size: parseFloat(values.lotSize),
      stop_loss: values.stopLoss ? parseFloat(values.stopLoss) : null,
      take_profit: values.takeProfit ? parseFloat(values.takeProfit) : null
    };

    // Remove the original currencyPair field as it's not needed
    delete formattedValues.currencyPair;
    delete formattedValues.lotSize;
    delete formattedValues.stopLoss;
    delete formattedValues.takeProfit;

    onSubmit(formattedValues);
  };

  return (
    <Card title="Open New Position" className="mb-3 shadow-lg">
      <Space direction="vertical" className="mb-3" style={{ width: '100%' }}>
        <Text>Required Margin: ${marginRequired}</Text>
        <Text>Available Margin: ${walletData?.free_margin || '0.00'}</Text>
      </Space>

      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="currencyPair"
          label="Currency Pair"
          rules={[{ required: true, message: 'Please select a currency pair' }]}
        >
          <Select 
            placeholder="Select currency pair"
            onChange={handleCurrencyPairChange}
          >
            {currencyPairs.map(pair => (
              <Option key={pair.id} value={pair.id}>
                {pair.symbol} - {pair.current_price}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="positionType"
          label="Position Type"
          rules={[{ required: true, message: 'Please select position type' }]}
        >
          <Select 
            placeholder="Select position type"
            onChange={() => {
              form.setFieldsValue({
                stopLoss: null,
                takeProfit: null
              });
            }}
          >
            <Option value="BUY">Buy</Option>
            <Option value="SELL">Sell</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="lotSize"
          label="Lot Size"
          rules={[
            { required: true, message: 'Please enter lot size' },
            { type: 'number', min: 0.01, max: 100, message: 'Lot size must be between 0.01 and 100' }
          ]}
          tooltip="This will affect your required margin"
        >
          <InputNumber 
            min={0.01} 
            max={100} 
            step={0.01} 
            style={{ width: '100%' }} 
            onChange={() => setTimeout(calculateMargin, 0)}
          />
        </Form.Item>

        <Form.Item 
          name="stopLoss" 
          label="Stop Loss"
          tooltip="Optional - Set a price to automatically close position to limit losses"
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item 
          name="takeProfit" 
          label="Take Profit"
          tooltip="Optional - Set a price to automatically close position to secure profits"
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            disabled={!!validationMessage || marginRequired > (walletData?.free_margin || 0)}
            block
          >
            Open Position
          </Button>
        </Form.Item>
      </Form>
      {validationMessage && (
        <Alert
          message={validationMessage.message}
          type={validationMessage.type}
          showIcon
          className="mb-3"
        />
      )}

    </Card>
  );
};

export default TradingForm;