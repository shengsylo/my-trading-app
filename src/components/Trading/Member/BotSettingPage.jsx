import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Switch,
  InputNumber,
  Select,
  Button,
  Alert,
  Typography,
  Space,
  Divider,
  Col,
  Row,
  Spin,
  notification,
} from "antd";
import {
  RobotOutlined,
  DollarOutlined,
  SettingOutlined,
  WarningOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;
const API_BASE_URL = process.env.REACT_APP_API_URL;

const BotSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [botData, setBotData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);

  // Fetch bot settings on component mount
  useEffect(() => {
    fetchBotSettings();
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}trading/wallet/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });
      const data = response?.data[0];
      console.log("response", response);
      setWalletData(data);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.response.data.message,
      });
    }
  };
  const fetchBotSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}trading/bot/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });
      const data = response?.data[0];
      console.log("response", response);
      setBotData(data);
      form.setFieldsValue({
        ...data,
        enabled: data.is_active,
      });
      setIsEnabled(data.is_active);
      setLoading(false);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.response.data.message,
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    console.log("values", values);
    try {
      await axios.put(
        `${API_BASE_URL}trading/bot/${botData.id}/`,
        {
          ...values,
          is_active: values.enabled,
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );

      notification.success({
        message: "Success",
        description: "Bot settings updated successfully",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.response.data.message,
      });
    }
    setSaving(false);
  };

  const toggleBot = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}trading/bot/toggle/`,
        {},
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setIsEnabled(!isEnabled);
      notification.success({
        message: "Success",
        description: `Bot ${isEnabled ? "disabled" : "enabled"} successfully`,
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.response.data.message,
      });
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "400px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <div className="d-flex align-items-center mb-4">
          <RobotOutlined className="fs-2 me-3" />
          <Title level={2} className="mb-0">
            Trading Bot Settings
          </Title>
        </div>

        <Alert
          message="Important Notice"
          description="The trading bot will execute trades based on AI predictions and your configured settings. Please review all settings carefully before enabling automated trading."
          type="warning"
          showIcon
          className="mb-4"
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Card title="Basic Configuration" className="mb-4">
              <Form.Item
                  name="enabled"
                  label="Bot Status"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Enabled"
                    unCheckedChildren="Disabled"
                    onChange={toggleBot}
                  />
                </Form.Item>

                <Form.Item
                  name="symbol"
                  label="Trading Pair"
                  rules={[{ required: true }]}
                >
                  <Select>
                    {/* <Option value="BTC/USD">BTC/USD</Option>
                    <Option value="ETH/USD">ETH/USD</Option> */}
                    <Option value="EUR/USD">EUR/USD</Option>
                    <Option value="XAU/USD">XAU/USD</Option>
                    {/* <Option value="GBP/USD">GBP/USD</Option>
                    <Option value="JPY/USD">JPY/USD</Option> */}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="trade_amount"
                  label="Trade Amount"
                  tooltip={`Your current available free margin is $${walletData?.free_margin}.`}
                  rules={[
                    {
                      required: true,
                      message: "Please input your trade amount!",
                    },
                    {
                      validator: (_, value) => {
                        if (value > walletData?.free_margin) {
                          return Promise.reject(
                            new Error(
                              `Trade amount cannot exceed your free margin of $${walletData?.free_margin}`
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    min={0.1}
                    step={0.1}
                    style={{ width: "100%" }}
                    prefix="$"
                  />
                </Form.Item>

                <Form.Item
                  name="max_daily_trades"
                  label="Maximum Daily Trades"
                  tooltip="A maximum amount of daily trade."
                  rules={[
                    {
                      required: true,
                      message: "Please input your maximum daily trades!",
                    },
                    {
                      type: "number",
                      min: 1,
                      max: 50,
                      message: "Please input a value between 1 and 50.",
                    },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Risk Management" className="mb-4">
                <Form.Item
                  name="risk_level"
                  label="Risk Level"
                  tooltip="Bot will depend on the risk to decide the trade."
                  rules={[
                    {
                      required: true,
                      message: "Please select your risk level!",
                    },
                  ]}
                >
                  <Select>
                    <Option value="low">Conservative (Low Risk)</Option>
                    <Option value="medium">Moderate (Medium Risk)</Option>
                    <Option value="high">Aggressive (High Risk)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="stop_loss"
                  label="Stop Loss (%)"
                  tooltip="Bot will only stop the trade when loss hit the threshold. Min > 0.1%, Max > 20%"
                  rules={[
                    {
                      required: true,
                      message: "Please input your stop loss percentage!",
                    },
                    {
                      type: "number",
                      min: 0.1,
                      max: 20,
                      message: "Please input a value between 0.1 and 20.",
                    },
                  ]}
                >
                  <InputNumber
                    step={0.1}
                    style={{ width: "100%" }}
                    suffix="%"
                  />
                </Form.Item>

                <Form.Item
                  name="take_profit"
                  label="Take Profit (%)"
                  tooltip="Bot will only stop the trade when profit hit the threshold. Min > 0.1%, Max > 50%"
                  rules={[
                    {
                      required: true,
                      message: "Please input your take profit percentage!",
                    },
                    {
                      type: "number",
                      min: 0.1,
                      max: 50,
                      message: "Please input a value between 0.1 and 50.",
                    },
                  ]}
                >
                  <InputNumber
                    step={0.1}
                    style={{ width: "100%" }}
                    suffix="%"
                  />
                </Form.Item>

                <Form.Item
                  name="min_confidence"
                  label="Minimum AI Confidence (%)"
                  tooltip="Bot will only trade when AI prediction confidence exceeds this threshold"
                  rules={[
                    {
                      required: true,
                      message: "Please input your minimum AI confidence!",
                    },
                    {
                      type: "number",
                      min: 50,
                      max: 95,
                      message: "Please input a value between 50 and 95.",
                    },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} suffix="%" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Card title="Market Analysis Settings" className="mb-4">
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="timeframe"
                  label="Analysis Timeframe"
                  rules={[{ required: false }]}
                >
                  <Select>
                    <Option value="5m">5 Minutes</Option>
                    <Option value="15m">15 Minutes</Option>
                    <Option value="1h">1 Hour</Option>
                    <Option value="4h">4 Hours</Option>
                    <Option value="1d">1 Day</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="strategy"
                  label="Trading Strategy"
                  rules={[{ required: false }]}
                >
                  <Select>
                    <Option value="trend_following">Trend Following</Option>
                    <Option value="mean_reversion">Mean Reversion</Option>
                    <Option value="breakout">Breakout Trading</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <div className="d-flex justify-content-end gap-2">
            <Button onClick={() => form.resetFields()} className="me-2">
              Reset
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save Settings
            </Button>
          </div>
        </Form>

        <Divider />

        <div className="mt-4">
          <Title level={4} className="d-flex align-items-center">
            <WarningOutlined className="me-2" /> Important Guidelines
          </Title>
          <ul className="list-unstyled">
            <li className="mb-2">
              <Text>
                • Start with small trade amounts while testing the bot's
                performance
              </Text>
            </li>
            <li className="mb-2">
              <Text>
                • Set conservative stop-loss values to protect your investment
              </Text>
            </li>
            <li className="mb-2">
              <Text>
                • Monitor the bot's performance regularly and adjust settings as
                needed
              </Text>
            </li>
            <li className="mb-2">
              <Text>• The bot uses AI predictions updated every 5 minutes</Text>
            </li>
            <li>
              <Text>
                • Enable email notifications to stay informed about your bot's
                trading activities
              </Text>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default BotSettings;
