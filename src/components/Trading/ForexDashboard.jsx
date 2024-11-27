// trading/ForexDashBoard.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts";
import {
  Card,
  Select,
  Button,
  Tabs,
  Space,
  Spin,
  Switch,
  message,
  Slider,
  InputNumber,
  Row,
  Col,
  Input,
  Typography,
  Radio,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import axios from "axios";
import debounce from "lodash/debounce";

const { TabPane } = Tabs;
const { Text } = Typography;
const { TextArea } = Input;

const ForexDashboard = () => {
  const [selectedPair, setSelectedPair] = useState("XAU/USD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("M1");
  const [currencyPairs, setCurrencyPairs] = useState([]);
  const [timeframes, setTimeframes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataRange, setDataRange] = useState({ start: 0, end: 100 });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });
  const [selectedTab, setSelectedTab] = useState("price");
  const [showPlaceholder, setShowPlaceholder] = useState(true); // State to control placeholder visibility
  const textAreaRef = useRef(null); // Ref to access the TextArea element
  const [indicators, setIndicators] = useState({
    showSMA: true,
    showEMA: false,
    showRSI: false,
    showMACD: false,
    showBollingerBands: false,
    smaPeriod: 20,
    emaPeriod: 20,
    rsiPeriod: 14,
    macdShortPeriod: 12,
    macdLongPeriod: 26,
    macdSignalPeriod: 9,
    bollingerBandsPeriod: 20,
    bollingerBandsStdDev: 2,
  });

  const [customFormula, setCustomFormula] = useState("");
  const [customIndicatorData, setCustomIndicatorData] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const mathFunctions = {
    // Basic operations
    abs: Math.abs,
    max: Math.max,
    min: Math.min,
    pow: Math.pow,
    sqrt: Math.sqrt,
    log: Math.log,
    exp: Math.exp,

    // Trigonometric functions
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,

    // Statistical functions
    mean: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
    median: (arr) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    },
    std: (arr) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return Math.sqrt(
        arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length
      );
    },
  };

  // Enhanced SMA calculation with customizable period
  const calculateSMA = (data, period) => {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(null);
        continue;
      }

      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, val) => acc + parseFloat(val.close_price), 0);
      sma.push(sum / period);
    }
    return sma;
  };

  // Enhanced EMA calculation with customizable period
  const calculateEMA = (data, period) => {
    const ema = [];
    const multiplier = 2 / (period + 1);

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        ema.push(parseFloat(data[i].close_price));
        continue;
      }

      const currentEMA =
        parseFloat(data[i].close_price) * multiplier +
        ema[i - 1] * (1 - multiplier);
      ema.push(currentEMA);
    }
    return ema;
  };

  // Corrected RSI calculation
  const calculateRSI = (data, period) => {
    const rsi = [];
    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 1; i < data.length; i++) {
      const change =
        parseFloat(data[i].close_price) - parseFloat(data[i - 1].close_price);
      if (i <= period) {
        avgGain += change > 0 ? change : 0;
        avgLoss += change < 0 ? Math.abs(change) : 0;
        rsi.push(null);
      } else {
        avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period;
        avgLoss =
          (avgLoss * (period - 1) + (change < 0 ? Math.abs(change) : 0)) /
          period;
        const rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      }
    }

    return rsi;
  };

  // MACD Calculation
  const calculateMACD = (data, shortPeriod, longPeriod, signalPeriod) => {
    // Calculate EMA helper function
    const calculateEMA = (values, period) => {
      const k = 2 / (period + 1);
      const ema = [];
      let prevEMA = values[0];

      for (let i = 0; i < values.length; i++) {
        if (i === 0) {
          ema.push(values[0]);
        } else {
          prevEMA = values[i] * k + prevEMA * (1 - k);
          ema.push(prevEMA);
        }
      }
      return ema;
    };

    // Get close prices array
    const prices = data.map((d) => parseFloat(d.close_price));

    // Calculate EMAs
    const shortEMA = calculateEMA(prices, shortPeriod);
    const longEMA = calculateEMA(prices, longPeriod);

    // Calculate MACD line
    const macdLine = shortEMA.map((short, i) => short - longEMA[i]);

    // Calculate Signal line (9-day EMA of MACD line)
    const signalLine = calculateEMA(macdLine, signalPeriod);

    // Calculate Histogram
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

    return {
      macdLine,
      signalLine,
      histogram,
    };
  };

  // Bollinger Bands Calculation
  const calculateBollingerBands = (data, period, stdDev) => {
    const upperBand = [];
    const middleBand = [];
    const lowerBand = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upperBand.push(null);
        middleBand.push(null);
        lowerBand.push(null);
      } else {
        const slice = data
          .slice(i - period + 1, i + 1)
          .map((item) => parseFloat(item.close_price));
        const sma = slice.reduce((acc, val) => acc + val, 0) / period;
        const std = Math.sqrt(
          slice.reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / period
        );

        middleBand.push(sma);
        upperBand.push(sma + stdDev * std);
        lowerBand.push(sma - stdDev * std);
      }
    }

    return { upperBand, middleBand, lowerBand };
  };

  // Evaluate Custom Formula
  const evaluateCustomFormula = (formula, data) => {
    try {
      // Enhanced context with more technical analysis functions
      const context = {
        ...mathFunctions,
        data: data.map((item) => ({
          close: parseFloat(item.close_price),
          open: parseFloat(item.open_price),
          high: parseFloat(item.high_price),
          low: parseFloat(item.low_price),
          volume: parseFloat(item.volume || 0),
          timestamp: new Date(item.timestamp).getTime(),
        })),

        // Enhanced statistical functions
        sma: (prices, period) => {
          if (prices.length < period) return null;
          return prices.slice(-period).reduce((a, b) => a + b) / period;
        },

        ema: (prices, period) => {
          if (prices.length < period) return null;
          const k = 2 / (period + 1);
          let ema = prices[0];
          for (let i = 1; i < prices.length; i++) {
            ema = prices[i] * k + ema * (1 - k);
          }
          return ema;
        },

        roc: (prices, period) => {
          if (prices.length < period) return null;
          return (
            ((prices[prices.length - 1] - prices[prices.length - period]) /
              prices[prices.length - period]) *
            100
          );
        },

        stdDev: (prices, period) => {
          if (prices.length < period) return null;
          const slice = prices.slice(-period);
          const mean = slice.reduce((a, b) => a + b) / period;
          const squaredDiffs = slice.map((x) => Math.pow(x - mean, 2));
          return Math.sqrt(squaredDiffs.reduce((a, b) => a + b) / period);
        },

        window: [],
        index: 0,
      };

      // Create a function from the formula with enhanced safety checks
      const safeFormula = new Function(
        "ctx",
        `
        try {
          with(ctx) {
            ${formula}
          }
        } catch (e) {
          console.error('Formula evaluation error:', e);
          return null;
        }
      `
      );

      // Calculate for each data point with proper windowing
      return data.map((_, index) => {
        context.index = index;
        context.window = data
          .slice(Math.max(0, index - 50), index + 1)
          .map((item) => parseFloat(item.close_price));
        return safeFormula(context);
      });
    } catch (error) {
      console.error("Error in custom formula:", error);
      return Array(data.length).fill(null);
    }
  };

  // Debounced data processing with new indicators
  const processChartData = useCallback(
    debounce((rawData) => {
      const smaData = calculateSMA(rawData, indicators.smaPeriod);
      const emaData = calculateEMA(rawData, indicators.emaPeriod);
      const rsiData = calculateRSI(rawData, indicators.rsiPeriod);
      const macdData = calculateMACD(
        rawData,
        indicators.macdShortPeriod,
        indicators.macdLongPeriod,
        indicators.macdSignalPeriod
      );
      const bollingerBandsData = calculateBollingerBands(
        rawData,
        indicators.bollingerBandsPeriod,
        indicators.bollingerBandsStdDev
      );

      let customData = [];
      if (customFormula) {
        customData = evaluateCustomFormula(customFormula, rawData);
      }

      const enrichedData = rawData.map((item, index) => ({
        ...item,
        timestamp: new Date(item.timestamp).toLocaleString(),
        sma: smaData[index],
        ema: emaData[index],
        rsi: rsiData[index],
        macd: macdData.macdLine[index],
        signal: macdData.signalLine[index],
        histogram: macdData.histogram[index],
        upperBand: bollingerBandsData.upperBand[index],
        middleBand: bollingerBandsData.middleBand[index],
        lowerBand: bollingerBandsData.lowerBand[index],
        customIndicator: customData[index],
      }));

      setChartData(enrichedData);
    }, 300),
    [indicators, customFormula]
  );

  const MACDChart = ({ data }) => (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
          />
          <YAxis yAxisId="macd" domain={["auto", "auto"]} />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="macd"
            type="monotone"
            dataKey="macd"
            stroke="#2196F3"
            name="MACD"
            dot={false}
          />
          <Line
            yAxisId="macd"
            type="monotone"
            dataKey="signal"
            stroke="#FF9800"
            name="Signal"
            dot={false}
          />
          <Bar
            yAxisId="macd"
            dataKey="histogram"
            fill="#4CAF50"
            name="Histogram"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [pairsResponse, timeframesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}trading/currency-pairs/`),
          axios.get(`${API_BASE_URL}trading/timeframes/`),
        ]);

        setCurrencyPairs(pairsResponse.data);
        setTimeframes(timeframesResponse.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        message.error("Failed to load initial data");
      }
    };

    fetchInitialData();
  }, [API_BASE_URL]);

  // Price data fetch
  useEffect(() => {
    const fetchPriceData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}trading/forex-prices/`,
          {
            params: {
              pair: selectedPair,
              timeframe: selectedTimeframe,
            },
          }
        );

        processChartData(response.data);
      } catch (error) {
        console.error("Error fetching price data:", error);
        message.error("Failed to load price data");
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [selectedPair, selectedTimeframe, API_BASE_URL, processChartData]);

  // Chart navigation handlers
  const moveLeft = () => {
    const rangeSize = visibleRange.end - visibleRange.start;
    const newStart = Math.max(0, visibleRange.start - rangeSize * 0.1);
    const newEnd = newStart + rangeSize;
    setVisibleRange({ start: newStart, end: newEnd });
  };

  const moveRight = () => {
    const rangeSize = visibleRange.end - visibleRange.start;
    const newEnd = Math.min(100, visibleRange.end + rangeSize * 0.1);
    const newStart = newEnd - rangeSize;
    setVisibleRange({ start: newStart, end: newEnd });
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 5, 400);
    setZoomLevel(newZoom);
    updateVisibleRange(newZoom); // Call the function to update the range
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 5, 25);
    setZoomLevel(newZoom);
    updateVisibleRange(newZoom); // Call the function to update the range
  };

  const handleRangeChange = (range) => {
    const newZoom = 100 / ((range[1] - range[0]) / 100); // Calculate zoom based on range
    setZoomLevel(newZoom);
    setVisibleRange({ start: range[0], end: range[1] });
  };

  const updateVisibleRange = (newZoom) => {
    const center = (visibleRange.start + visibleRange.end) / 2;
    const rangeSize = (100 / newZoom) * 100;
    setVisibleRange({
      start: Math.max(0, center - rangeSize / 2),
      end: Math.min(100, center + rangeSize / 2),
    });
  };

  // Get visible data
  const getVisibleData = () => {
    const startIndex = Math.floor(
      chartData.length * (visibleRange.start / 100)
    );
    const endIndex = Math.ceil(chartData.length * (visibleRange.end / 100));
    return chartData.slice(startIndex, endIndex);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}trading/forex-prices/`, {
        params: {
          pair: selectedPair,
          timeframe: selectedTimeframe,
        },
      });

      processChartData(response.data);
      message.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowPlaceholder(customFormula === "");
  }, [customFormula]);

  return (
    <div
      style={{
        padding: "8px",
        backgroundColor: "black",
        color: "white",
        justifyContent: "center",
        display: "flex",
      }}
    >
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%", gap: "8px" }}
      >
        <Card style={{ backgroundColor: "#101014", border: "none" }}>
          <Space
            style={{
              marginBottom: "5px",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Space>
              <Select
                value={selectedPair}
                onChange={setSelectedPair}
                style={{ width: 120, color: "#101014" }}
                options={currencyPairs.map((pair) => ({
                  value: pair.symbol,
                  label: pair.symbol,
                }))}
              />

              <Select
                value={selectedTimeframe}
                onChange={setSelectedTimeframe}
                style={{ width: 100 }}
                options={timeframes.map((tf) => ({
                  value: tf.name,
                  label: tf.name,
                }))}
              />
            </Space>

            <Space>
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
              <Button icon={<LeftOutlined />} onClick={moveLeft} />
              <Button icon={<RightOutlined />} onClick={moveRight} />
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={handleRefresh}
              />
            </Space>
          </Space>

          <Tabs
            defaultActiveKey="price"
            tabBarGutter={48}
            activeKey={selectedTab} // Use a different state variable for the active tab
            onChange={(key) => setSelectedTab(key)} // Update selectedTab on tab change
          >
            {/* Price Chart Tab - Simplified */}
            <TabPane
              tab={
                <span
                  style={{
                    color: "white",
                    opacity: selectedTab === "price" ? 1 : 0.5,
                  }}
                >
                  Price Chart
                </span>
              }
              key="price"
            >
              <Spin spinning={loading}>
                <div style={{ height: 500 }}>
                  <ResponsiveContainer
                    width="100%"
                    height="90%"
                    style={{ color: "white", backgroundColor: "#101014" }}
                  >
                    <LineChart
                      data={getVisibleData()}
                      style={{
                        backgroundColor: "black",
                        borderRadius: "2%",
                        paddingTop: "1%",
                        paddingRight: "1%",
                      }}
                    >
                      <CartesianGrid stroke="#333" />
                      <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        interval={Math.max(
                          0,
                          Math.floor(chartData.length / 10) - 1
                        )}
                        textAnchor="end"
                        tickFormatter={(timestamp) => {
                          const date = new Date(timestamp);
                          if (
                            selectedTimeframe === "M1" ||
                            selectedTimeframe === "M5"
                          ) {
                            return date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                          } else {
                            return date.toLocaleDateString();
                          }
                        }}
                      />
                      <YAxis domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#25282C",
                          border: "none",
                          color: "white",
                          padding: "5px 10px",
                          borderRadius: "4px",
                        }}
                        labelStyle={{ color: "white" }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "25px" }} />
                      <Line
                        type="monotone"
                        dataKey="close_price"
                        stroke="#1890ff"
                        name="Price"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Spin>
              <div style={{ marginRight: "3%", marginLeft: "3%" }}>
                <Slider
                  range
                  value={[visibleRange.start, visibleRange.end]}
                  onChange={handleRangeChange}
                  marks={{
                    0: {
                      style: { color: "white" },
                      label: "Start",
                    },
                    50: {
                      // Add a mark at the middle (50)
                      style: { color: "white" },
                      label: "Middle",
                    },
                    100: {
                      style: { color: "white" },
                      label: "End",
                    },
                  }}
                  trackStyle={{ backgroundColor: "#1890ff" }} // Change track color
                  handleStyle={[
                    { backgroundColor: "#1890ff" },
                    { backgroundColor: "#1890ff" },
                  ]} // Change handle color
                  railStyle={{ backgroundColor: "#333" }} // Change rail color
                  dotStyle={{ borderColor: "#1890ff" }} // Change dot color
                />
              </div>
            </TabPane>

            {/* Indicators Tab - Comprehensive */}
            <TabPane
              tab={
                <span
                  style={{
                    color: "white",
                    opacity: selectedTab === "indicators" ? 1 : 0.5,
                  }}
                >
                  Indicators Tab
                </span>
              }
              key="indicators"
            >
              <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Space wrap>
                      <Switch
                        checked={indicators.showSMA}
                        onChange={(checked) =>
                          setIndicators((prev) => ({
                            ...prev,
                            showSMA: checked,
                          }))
                        }
                        checkedChildren="SMA"
                        unCheckedChildren="SMA"
                      />
                      {indicators.showSMA && (
                        <InputNumber
                          size="small"
                          min={2}
                          max={50}
                          value={indicators.smaPeriod}
                          onChange={(value) =>
                            setIndicators((prev) => ({
                              ...prev,
                              smaPeriod: value,
                            }))
                          }
                          addonBefore="Period"
                        />
                      )}

                      <Switch
                        checked={indicators.showEMA}
                        onChange={(checked) =>
                          setIndicators((prev) => ({
                            ...prev,
                            showEMA: checked,
                          }))
                        }
                        checkedChildren="EMA"
                        unCheckedChildren="EMA"
                      />
                      {indicators.showEMA && (
                        <InputNumber
                          size="small"
                          min={2}
                          max={50}
                          value={indicators.emaPeriod}
                          onChange={(value) =>
                            setIndicators((prev) => ({
                              ...prev,
                              emaPeriod: value,
                            }))
                          }
                          addonBefore="Period"
                        />
                      )}

                      <Switch
                        checked={indicators.showRSI}
                        onChange={(checked) =>
                          setIndicators((prev) => ({
                            ...prev,
                            showRSI: checked,
                          }))
                        }
                        checkedChildren="RSI"
                        unCheckedChildren="RSI"
                      />
                      {indicators.showRSI && (
                        <InputNumber
                          size="small"
                          min={2}
                          max={50}
                          value={indicators.rsiPeriod}
                          onChange={(value) =>
                            setIndicators((prev) => ({
                              ...prev,
                              rsiPeriod: value,
                            }))
                          }
                          addonBefore="Period"
                        />
                      )}

                      <Switch
                        checked={indicators.showMACD}
                        onChange={(checked) =>
                          setIndicators((prev) => ({
                            ...prev,
                            showMACD: checked,
                          }))
                        }
                        checkedChildren="MACD"
                        unCheckedChildren="MACD"
                      />
                      {indicators.showMACD && (
                        <Space>
                          <InputNumber
                            size="small"
                            min={2}
                            max={50}
                            value={indicators.macdShortPeriod}
                            onChange={(value) =>
                              setIndicators((prev) => ({
                                ...prev,
                                macdShortPeriod: value,
                              }))
                            }
                            addonBefore="Short"
                          />
                          <InputNumber
                            size="small"
                            min={2}
                            max={50}
                            value={indicators.macdLongPeriod}
                            onChange={(value) =>
                              setIndicators((prev) => ({
                                ...prev,
                                macdLongPeriod: value,
                              }))
                            }
                            addonBefore="Long"
                          />
                          <InputNumber
                            size="small"
                            min={2}
                            max={50}
                            value={indicators.macdSignalPeriod}
                            onChange={(value) =>
                              setIndicators((prev) => ({
                                ...prev,
                                macdSignalPeriod: value,
                              }))
                            }
                            addonBefore="Signal"
                          />
                        </Space>
                      )}

                      <Switch
                        checked={indicators.showBollingerBands}
                        onChange={(checked) =>
                          setIndicators((prev) => ({
                            ...prev,
                            showBollingerBands: checked,
                          }))
                        }
                        checkedChildren="Bollinger"
                        unCheckedChildren="Bollinger"
                      />
                      {indicators.showBollingerBands && (
                        <Space>
                          <InputNumber
                            size="small"
                            min={5}
                            max={50}
                            value={indicators.bollingerBandsPeriod}
                            onChange={(value) =>
                              setIndicators((prev) => ({
                                ...prev,
                                bollingerBandsPeriod: value,
                              }))
                            }
                            addonBefore="Period"
                          />
                          <InputNumber
                            size="small"
                            min={0.1}
                            max={5}
                            step={0.1}
                            value={indicators.bollingerBandsStdDev}
                            onChange={(value) =>
                              setIndicators((prev) => ({
                                ...prev,
                                bollingerBandsStdDev: value,
                              }))
                            }
                            addonBefore="StdDev"
                          />
                        </Space>
                      )}
                    </Space>
                  </Col>

                  <Col span={24}>
                    <div style={{ height: 500 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getVisibleData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" />
                          <YAxis domain={["auto", "auto"]} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="close_price"
                            stroke="#1890ff"
                            name="Price"
                            dot={false}
                          />
                          {indicators.showSMA && (
                            <Line
                              type="monotone"
                              dataKey="sma"
                              stroke="#faad14"
                              name={`SMA(${indicators.smaPeriod})`}
                              dot={false}
                            />
                          )}
                          {indicators.showEMA && (
                            <Line
                              type="monotone"
                              dataKey="ema"
                              stroke="#52c41a"
                              name={`EMA(${indicators.emaPeriod})`}
                              dot={false}
                            />
                          )}
                          {indicators.showRSI && (
                            <Line
                              type="monotone"
                              dataKey="rsi"
                              stroke="#f5222d"
                              name={`RSI(${indicators.rsiPeriod})`}
                              dot={false}
                            />
                          )}
                          {indicators.showBollingerBands && (
                            <>
                              <Line
                                type="monotone"
                                dataKey="upperBand"
                                stroke="#ff4d4f"
                                name="Upper Band"
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="middleBand"
                                stroke="#faad14"
                                name="Middle Band"
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="lowerBand"
                                stroke="#52c41a"
                                name="Lower Band"
                                dot={false}
                              />
                            </>
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {indicators.showMACD && (
                      <MACDChart data={getVisibleData()} />
                    )}
                  </Col>
                </Row>
              </Spin>
            </TabPane>

            {/* Enhanced Custom Formula Tab */}
            <TabPane
              tab={
                <span
                  style={{
                    color: "white",
                    opacity: selectedTab === "custom" ? 1 : 0.5,
                  }}
                >
                  Custom Analysis
                </span>
              }
              key="custom"
            >
              <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card
                      title="Advanced Formula Examples"
                      style={{
                        backgroundColor: "#101014", // Dark background color
                        border: "none", // Remove border
                      }}
                      headStyle={{
                        color: "white", // White title color
                        borderBottom: "none", // Remove title divider line
                      }}
                      bodyStyle={{ padding: "16px" }} // Adjust padding if needed
                    >
                      <Radio.Group
                        onChange={(e) => setCustomFormula(e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Radio
                            value={`
// Advanced Momentum Oscillator
const momentum = close - window[Math.max(0, window.length - 10)];
const normalized = momentum / window[Math.max(0, window.length - 10)] * 100;
return normalized;
                          `}
                          >
                            <Text strong style={{ color: "white" }}>
                              Momentum Oscillator
                            </Text>
                            <Text type="secondary" style={{ color: "#797f86" }}>
                              {" "}
                              Measures price momentum with normalization
                            </Text>
                          </Radio>

                          <Radio
                            value={`
// Double Exponential Moving Average (DEMA)
const ema1 = mean(window);
const ema2 = mean(window.map((_, i) => i < 10 ? null : mean(window.slice(i-10, i))));
return 2 * ema1 - ema2;
                          `}
                            style={{ color: "white" }}
                          >
                            <Text strong style={{ color: "white" }}>
                              Double EMA
                            </Text>
                            <Text type="secondary" style={{ color: "#797f86" }}>
                              {" "}
                              Reduces lag in trending markets
                            </Text>
                          </Radio>

                          <Radio
                            value={`
// Volatility Ratio
const stdDev = std(window);
const avgPrice = mean(window);
const upperBand = avgPrice + stdDev * 2;
const lowerBand = avgPrice - stdDev * 2;
return ((close - lowerBand) / (upperBand - lowerBand)) * 100;
                          `}
                          >
                            <Text strong style={{ color: "white" }}>
                              Volatility Ratio
                            </Text>
                            <Text type="secondary" style={{ color: "#797f86" }}>
                              {" "}
                              Measures price relative to volatility bands
                            </Text>
                          </Radio>

                          <Radio
                            value={`
// Price Rate of Change with Smoothing
const roc = ((close - window[0]) / window[0]) * 100;
const smooth = mean(window.map((p, i) => 
  i < 5 ? null : ((p - window[i-5]) / window[i-5]) * 100
).filter(v => v !== null));
return smooth;
                          `}
                          >
                            <Text strong style={{ color: "white" }}>
                              Smoothed ROC
                            </Text>
                            <Text type="secondary" style={{ color: "#797f86" }}>
                              {" "}
                              Rate of change with moving average smoothing
                            </Text>
                          </Radio>

                          <Radio
                            value={`
// Custom Multi-timeframe RSI
const gains = window.map((p, i) => i === 0 ? 0 : Math.max(0, p - window[i-1]));
const losses = window.map((p, i) => i === 0 ? 0 : Math.max(0, window[i-1] - p));
const avgGain = mean(gains.slice(-14));
const avgLoss = mean(losses.slice(-14));
return 100 - (100 / (1 + (avgGain / avgLoss)));
                          `}
                          >
                            <Text strong style={{ color: "white" }}>
                              Advanced RSI
                            </Text>
                            <Text type="secondary" style={{ color: "#797f86" }}>
                              {" "}
                              RSI with custom calculation method
                            </Text>
                          </Radio>
                        </Space>
                      </Radio.Group>
                    </Card>
                  </Col>

                  <Col span={24}>
                    <div style={{ position: "relative" }}>
                      <TextArea
                        ref={textAreaRef} // Add the ref to the TextArea
                        value={customFormula}
                        onChange={(e) => {
                          setCustomFormula(e.target.value);
                          setShowPlaceholder(e.target.value === ""); // Update placeholder visibility
                        }}
                        placeholder=" "
                        rows={6}
                        style={{
                          fontFamily: "monospace",
                          backgroundColor: "#141414",
                          color: "white",
                          border: "none",
                          textAlign: "left",
                        }}
                      />
                      {showPlaceholder && ( // Conditionally render the placeholder
                        <div
                          style={{
                            position: "absolute",
                            top: "5px",
                            left: "10px",
                            color: "white",
                            pointerEvents: "none",
                          }}
                        >
                          Enter your custom formula or modify an example...
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col span={24}>
                    <div style={{ height: 500, backgroundColor: "#101014" }}>
                      {" "}
                      {/* Dark background for chart container */}
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={getVisibleData()}
                          style={{
                            backgroundColor: "black",
                            borderRadius: "2%",
                            paddingTop: "1%",
                            paddingRight: "1%",
                          }} // Dark background for chart
                        >
                          <CartesianGrid stroke="#333" />
                          <XAxis
                            dataKey="timestamp"
                            tick={{ fill: "white", fontSize: 12 }} // White x-axis tick labels
                            angle={-45}
                            interval={Math.max(
                              0,
                              Math.floor(chartData.length / 10) - 1
                            )}
                            textAnchor="end"
                            tickFormatter={(timestamp) => {
                              const date = new Date(timestamp);
                              if (
                                selectedTimeframe === "M1" ||
                                selectedTimeframe === "M5"
                              ) {
                                return date.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                              } else {
                                return date.toLocaleDateString();
                              }
                            }}
                            stroke="white" // White x-axis line
                          />
                          <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fill: "white" }} // White y-axis tick labels
                            stroke="white" // White y-axis line
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#25282C",
                              border: "none",
                              color: "white",
                              padding: "5px 10px",
                              borderRadius: "4px",
                            }}
                            labelStyle={{ color: "white" }}
                          />
                          <Legend
                            wrapperStyle={{
                              paddingTop: "25px",
                              color: "white",
                            }} // White legend text
                          />
                          <Line
                            type="monotone"
                            dataKey="close_price"
                            stroke={(data) => {
                              if (data.length > 1) {
                                const firstClose = parseFloat(
                                  data[0].close_price
                                );
                                const lastClose = parseFloat(
                                  data[data.length - 1].close_price
                                );
                                return lastClose > firstClose ? "green" : "red";
                              } else {
                                return "#1890ff";
                              }
                            }}
                            name="Price"
                            dot={false}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="customIndicator"
                            stroke="#722ed1"
                            name="Custom Indicator"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Col>
                </Row>
              </Spin>
            </TabPane>
          </Tabs>
        </Card>

        {/* Chart Settings Panel */}
        <Card
          title="Chart Settings"
          style={{
            marginBottom: 16,
            backgroundColor: "#101014", // Use #101014 for background
            border: "none",
          }}
          headStyle={{
            color: "white",
            borderBottom: "none",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              {" "}
              {/* Make the Zoom Level card take the whole row */}
              <Space direction="vertical" style={{ width: "100%" }}>
                <div style={{ marginRight: "2%", marginLeft: "2%" }}>
                  <Card
                    size="small"
                    title="Zoom Level"
                    style={{
                      backgroundColor: "#101014", // Use #101014 for background
                      border: "none",
                    }}
                    headStyle={{
                      color: "white",
                      borderBottom: "none",
                    }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <Slider
                      min={25}
                      max={400}
                      value={zoomLevel}
                      onChange={(value) => {
                        const center =
                          (visibleRange.start + visibleRange.end) / 2;
                        const rangeSize = (100 / value) * 100;
                        setZoomLevel(value);
                        setVisibleRange((prevRange) => ({
                          ...prevRange,
                          start: Math.max(0, center - rangeSize / 2),
                          end: Math.min(100, center + rangeSize / 2),
                        }));
                      }}
                      trackStyle={{ backgroundColor: "#1890ff" }}
                      handleStyle={[
                        { backgroundColor: "#1890ff" },
                        { backgroundColor: "#1890ff" },
                      ]}
                      railStyle={{ backgroundColor: "#333" }}
                      dotStyle={{ borderColor: "#1890ff" }}
                      marks={{
                        25: {
                          style: { color: "white" },
                          label: "25%",
                        },
                        100: {
                          style: { color: "white" },
                          label: "100%",
                        },
                        150: {
                          style: { color: "white" },
                          label: "150%",
                        },
                        200: {
                          style: { color: "white" },
                          label: "200%",
                        },
                        400: {
                          style: { color: "white" },
                          label: "400%",
                        },
                      }}
                    />
                  </Card>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default ForexDashboard;
