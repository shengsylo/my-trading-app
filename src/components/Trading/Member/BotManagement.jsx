import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  notification,
  Tooltip,
  Statistic,
  Card,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  CloseOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const { Option } = Select;
const API_BASE_URL = process.env.REACT_APP_API_URL;

const BotPositionManagement = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [performanceModalVisible, setPerformanceModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [form] = Form.useForm();

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}trading/bot-positions/`,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setPositions(response.data);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch bot positions",
      });
    }
    setLoading(false);
  };

  const fetchPerformanceData = async (positionId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}trading/bot-positions/${positionId}/performance/`,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setPerformanceData(response.data.price_timeline);
      setPerformanceModalVisible(true);
      console.log("performance", response);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch performance data",
      });
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleEdit = (position) => {
    setSelectedPosition(position);
    form.setFieldsValue({
      stop_loss: position.stop_loss,
      take_profit: position.take_profit,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      await axios.patch(
        `${API_BASE_URL}trading/bot-positions/${selectedPosition.id}/`,
        values,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );
      message.success("Position updated successfully");
      setEditModalVisible(false);
      fetchPositions();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to update position",
      });
    }
  };

  const closePosition = async (positionId) => {
    try {
      await axios.post(
        `${API_BASE_URL}trading/bot-positions/${positionId}/close/`,
        {},
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );
      message.success("Position closed successfully");
      fetchPositions();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to close position",
      });
    }
  };

  const performanceConfig = {
    data: performanceData,
    xField: "timestamp",
    yField: "pnl",
    point: {
      size: 5,
      shape: "diamond",
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: "PNL",
          value: `$${Number(datum.pnl).toFixed(2)}`,
        };
      },
    },
    smooth: true,
  };

  const columns = [
    {
      title: "Bot ID",
      dataIndex: ["trading_bot", "id"],
      key: "bot_id",
      render: (botId) => (
        <Tooltip title={`Unique identifier for trading bot ${botId}`}>
          {botId}
        </Tooltip>
      ),
    },
    {
      title: "Currency Pair",
      dataIndex: ["currency_pair", "symbol"],
      key: "currency_pair",
      render: (symbol) => (
        <Tooltip title={`Trading pair: ${symbol}`}>{symbol}</Tooltip>
      ),
    },
    {
      title: "Position Type",
      dataIndex: "position_type",
      key: "position_type",
      render: (type) => (
        <span
          className={`badge ${type === "BUY" ? "bg-success" : "bg-danger"}`}
        >
          {type}
        </span>
      ),
    },
    {
      title: "Entry Price",
      dataIndex: "entry_price",
      key: "entry_price",
      render: (price) => (
        <Tooltip title="Price at which the position was opened">
          {Number(price).toFixed(4)}
        </Tooltip>
      ),
    },
    {
      title: "Stop Loss",
      dataIndex: "stop_loss",
      key: "stop_loss",
      render: (stopLoss) => (
        <Tooltip title="Minimum price to exit to limit potential loss">
          {Number(stopLoss).toFixed(4)}
        </Tooltip>
      ),
    },
    {
      title: "Take Profit",
      dataIndex: "take_profit",
      key: "take_profit",
      render: (takeProfit) => (
        <Tooltip title="Target price to exit and realize profit">
          {Number(takeProfit).toFixed(4)}
        </Tooltip>
      ),
    },
    {
      title: "Unrealized PNL",
      dataIndex: "unrealized_pnl",
      key: "unrealized_pnl",
      render: (pnl) => (
        <span
          className={`${parseFloat(pnl) >= 0 ? "text-success" : "text-danger"}`}
        >
          {Number(parseFloat(pnl)).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`badge ${
            status === "OPEN" ? "bg-warning" : "bg-secondary"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="d-flex gap-2">
          {record.status === "OPEN" && (
            <>
              <Tooltip title="Modify position parameters">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEdit(record)}
                >
                  Edit
                </Button>
              </Tooltip>
              <Tooltip title="Manually close this trading position">
                <Button
                  type="danger"
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={() => closePosition(record.id)}
                >
                  Close
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip title="View performance details">
            <Button
              type="default"
              icon={<LineChartOutlined />}
              size="small"
              onClick={() => fetchPerformanceData(record.id)}
            >
              Performance
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const totalUnrealizedPNL = positions.reduce(
    (sum, position) => sum + parseFloat(position.unrealized_pnl),
    0
  );

  const openPositionsCount = positions.filter(
    (p) => p.status === "OPEN"
  ).length;

  const renderPerformanceChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={performanceData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis
          label={{ value: "PNL ($)", angle: -90, position: "insideLeft" }}
        />
        <RechartsTooltip
          formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, "PNL"]}
          labelFormatter={(label) => `Timestamp: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="pnl"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="container-fluid mt-4">
      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Unrealized PNL"
              value={totalUnrealizedPNL}
              precision={2}
              valueStyle={{
                color: totalUnrealizedPNL >= 0 ? "#3f8600" : "#cf1322",
              }}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Open Positions"
              value={openPositionsCount}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <div className="card">
        <div className="card-header">
          <h4>Bot Positions</h4>
        </div>
        <div className="card-body">
          <Table
            columns={columns}
            dataSource={positions}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </div>
      </div>
      <Modal
        title="Edit Position"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="stop_loss"
            label="Stop Loss"
            rules={[{ required: true, message: "Please input stop loss" }]}
          >
            <Input type="number" step="0.00001" />
          </Form.Item>
          <Form.Item
            name="take_profit"
            label="Take Profit"
            rules={[{ required: true, message: "Please input take profit" }]}
          >
            <Input type="number" step="0.00001" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Position
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Position Performance"
        visible={performanceModalVisible}
        onCancel={() => setPerformanceModalVisible(false)}
        width={800}
        footer={null}
      >
        {performanceData.length > 0 ? (
          renderPerformanceChart()
        ) : (
          <p>No performance data available</p>
        )}
      </Modal>{" "}
    </div>
  );
};

export default BotPositionManagement;
