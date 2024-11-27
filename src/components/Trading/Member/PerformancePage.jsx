import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Select,
  Typography,
  Space,
} from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const API_BASE_URL = process.env.REACT_APP_API_URL;

const PerformanceDashboard = () => {
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, "days"),
    moment(),
  ]);
  const [timeframe, setTimeframe] = useState("1d");
  const [currencyPair, setCurrencyPair] = useState("XAU/USD");
  const [performanceData, setPerformanceData] = useState([]);
  const [pricePredict, setPricePredict] = useState([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        // Format dates for API
        const startDate = dateRange[0].format("YYYY-MM-DD");
        const endDate = dateRange[1].format("YYYY-MM-DD");

        const predictionResponse = await axios.get(
          `${API_BASE_URL}trading/price-predictions/`,
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
            params: {
              symbol: currencyPair,
              start_date: startDate,
              end_date: endDate,
            },
          }
        );
        setPricePredict(predictionResponse.data);
        // Fetch ForexPrice data
        const forexResponse = await axios.get(
          `${API_BASE_URL}trading/forex-prices/`,
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
            params: {
              pair: currencyPair,
              timeframe: "M5",
              is_train_dataset: predictionResponse.data.length,
            },
          }
        );

        // Fetch PricePrediction data
        console.log("pricePredict", pricePredict);
        // Match ForexPrice and PricePrediction with more precise timestamp matching
        const matchedData = forexResponse.data.map((forexEntry) => {
          // Parse the timestamp using moment.js, ensuring UTC parsing
          const forexMoment = moment.utc(forexEntry.timestamp);

          // Find a matching prediction within a 5-minute window
          const matchingPrediction = predictionResponse.data.find((pred) => {
            // Parse prediction timestamp in UTC
            const predMoment = moment.utc(pred.prediction_timestamp);

            // Check if timestamps are within 5 minutes of each other
            return (
              Math.abs(forexMoment.diff(predMoment, "minutes")) <= 5 &&
              pred.symbol === currencyPair
            );
          });

          return {
            // Use a more standardized date format
            date: forexMoment.format("YYYY-MM-DDTHH:mm:ss[Z]"),
            predicted: matchingPrediction
              ? parseFloat(matchingPrediction.predicted_price).toFixed(2)
              : null,
            actual: parseFloat(forexEntry.close_price).toFixed(2),
            profit: matchingPrediction
              ? calculateProfit(
                  matchingPrediction.predicted_price,
                  forexEntry.close_price
                )
              : 0,
            confidence: matchingPrediction ? matchingPrediction.confidence : 0,
          };
        });
        const sortedMatchedData = [...matchedData].reverse();

        console.log("matcheddata", matchedData);
        console.log("matcheddata", sortedMatchedData);
        setPerformanceData(sortedMatchedData);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      }
    };

    fetchPerformanceData();
  }, [timeframe, currencyPair, dateRange]);

  // Helper function to calculate profit
  const calculateProfit = (predictedPrice, actualPrice) => {
    return Math.round((actualPrice - predictedPrice) * 100);
  };

  // Calculate performance metrics
  const calculateMetrics = () => {
    if (performanceData.length === 0)
      return {
        accuracy: 0,
        totalProfit: 0,
        successRate: 0,
      };

    const successfulTrades = performanceData.filter(
      (entry) => entry.profit > 0
    );
    const accuracy =
      performanceData.reduce((sum, entry) => sum + (entry.confidence || 0), 0) /
      performanceData.length;
    const totalProfit = performanceData.reduce(
      (sum, entry) => sum + entry.profit,
      0
    );
    const successRate =
      (successfulTrades.length / performanceData.length) * 100;

    return {
      accuracy: accuracy.toFixed(1),
      totalProfit: Math.round(totalProfit),
      successRate: successRate.toFixed(1),
    };
  };

  const metrics = calculateMetrics();

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Predicted Price",
      dataIndex: "predicted",
      key: "predicted",
      render: (value) => (value ? `$${value}` : "N/A"),
    },
    {
      title: "Actual Price",
      dataIndex: "actual",
      key: "actual",
      render: (value) => `$${value}`,
    },
    {
      title: "Difference",
      dataIndex: "profit",
      key: "profit",
      render: (value) => (
        <span style={{ color: value >= 0 ? "#3f8600" : "#cf1322" }}>
          {value >= 0 ? '+' : '-'}${Math.abs(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="performance-dashboard">
      <Space direction="vertical" size="large" className="w-100">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2}>Trading Performance</Title>
          <Space>
            <Select
              style={{ width: 120 }}
              value={currencyPair}
              onChange={setCurrencyPair}
              options={[
                { value: "XAU/USD", label: "XAU/USD" },
                { value: "EUR/USD", label: "EUR/USD" },
                { value: "USD/JPY", label: "USD/JPY" },
              ]}
            />
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
            <Select
              defaultValue="1d"
              onChange={(value) => setTimeframe(value)}
              options={[
                { value: "1d", label: "1 Day" },
                { value: "1w", label: "1 Week" },
                { value: "1m", label: "1 Month" },
                { value: "1y", label: "1 Year" },
              ]}
            />
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Prediction Accuracy"
                value={metrics.accuracy}
                precision={1}
                valueStyle={{ color: "#3f8600" }}
                prefix={<ArrowUpOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Profit"
                value={metrics.totalProfit}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
                prefix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Trades"
                value={performanceData.length}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Success Rate"
                value={metrics.successRate}
                precision={1}
                valueStyle={{ color: "#3f8600" }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Price Prediction vs Actual">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(tickItem) =>
                      moment(tickItem).format("MM/DD HH:mm")
                    }
                  />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip
                    labelFormatter={(label) =>
                      moment(label).format("YYYY-MM-DD HH:mm:ss")
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#8884d8"
                    name="Predicted Price"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#82ca9d"
                    name="Actual Price"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Prediction Confidence">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    stroke="#ff7300"
                    name="Prediction Confidence"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={24}>
            <Card title="Price Predicted">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pricePredict}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="prediction_timestamp" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predicted_price"
                    stroke="#8884d8"
                    name="Predicted Price"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Card title="Detailed Performance History">
          <Table
            columns={columns}
            dataSource={performanceData}
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default PerformanceDashboard;
