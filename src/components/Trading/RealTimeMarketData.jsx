import React, { useState, useEffect, useRef } from 'react';
import { Select, Card, Button, Space, Spin, Alert, Typography, Statistic, Row, Col, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { createChart } from 'lightweight-charts';

const { Option } = Select;
const { Title } = Typography;

function RealTimeMarketData() {
    const chartContainerRef = useRef();
    const [chart, setChart] = useState(null);
    const [currencyPair, setCurrencyPair] = useState('EURUSD');
    const [timeframe, setTimeframe] = useState('1h');
    const [priceData, setPriceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastPrice, setLastPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(0);

    // Currency pairs configuration
    const currencyPairs = [
        { value: 'EURUSD', label: 'EUR/USD' },
        { value: 'GBPUSD', label: 'GBP/USD' },
        { value: 'USDJPY', label: 'USD/JPY' },
        { value: 'XAUUSD', label: 'XAU/USD' },
        { value: 'BTCUSD', label: 'BTC/USD' },
    ];

    // Timeframe configuration
    const timeframes = [
        { value: '1m', label: '1 Minute' },
        { value: '5m', label: '5 Minutes' },
        { value: '15m', label: '15 Minutes' },
        { value: '1h', label: '1 Hour' },
        // { value: '4h', label: '4 Hours' },
        { value: '1d', label: '1 Day' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/trading/market_data/${currencyPair}/${timeframe}/`
                );
                
                if (response.data && response.data.length > 0) {
                    const formattedData = response.data.map(item => ({
                        time: item.timestamp,
                        open: item.open,
                        high: item.high,
                        low: item.low,
                        close: item.close
                    }));
                    
                    setPriceData(formattedData);
                    
                    // Update last price and price change
                    const currentPrice = formattedData[formattedData.length - 1].close;
                    const previousPrice = lastPrice || formattedData[formattedData.length - 2]?.close;
                    
                    setLastPrice(currentPrice);
                    if (previousPrice) {
                        const change = ((currentPrice - previousPrice) / previousPrice) * 100;
                        setPriceChange(change);
                    }
                    
                    setError(null);
                } else {
                    setError('No data available for the selected currency pair and timeframe.');
                }
            } catch (err) {
                console.error('Error fetching market data:', err);
                setError(err.response?.data?.error || 'Failed to fetch market data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
            message.success("")
        };

        fetchData();
        
        // Set up polling interval
        const intervalId = setInterval(fetchData, 30000); // Poll every minute
        
        return () => clearInterval(intervalId);
    }, [currencyPair, timeframe]);

    useEffect(() => {
        if (!chartContainerRef.current || priceData.length === 0) return;

        const chartInstance = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 500,
            layout: {
                background: { color: '#ffffff' },
                textColor: '#333333',
            },
            grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                mode: 1,
            },
        });

        const candleSeries = chartInstance.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        candleSeries.setData(priceData);
        setChart(chartInstance);

        // Handle window resize
        const handleResize = () => {
            chartInstance.applyOptions({
                width: chartContainerRef.current.clientWidth,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstance.remove();
        };
    }, [priceData]);

    // Event handlers
    const handleCurrencyPairChange = (value) => {
        setCurrencyPair(value);
    };

    const handleTimeframeChange = (value) => {
        setTimeframe(value);
    };

    const handleRefresh = () => {
        // Trigger a manual data refresh
        setIsLoading(true);
        // Re-fetch data using the current currency pair and timeframe
    };

    return (
        <Container fluid className="py-4">
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={18}>
                    <Card 
                        title={
                            <Space>
                                <Title level={4}>{`${currencyPair} Price Chart`}</Title>
                                {lastPrice && (
                                    <Statistic
                                        value={lastPrice}
                                        precision={5}
                                        valueStyle={{ color: priceChange >= 0 ? '#3f8600' : '#cf1322' }}
                                        prefix={priceChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        suffix={`${Math.abs(priceChange).toFixed(2)}%`}
                                    />
                                )}
                            </Space>
                        }
                        extra={
                            <Space>
                                <Select
                                    value={currencyPair}
                                    onChange={handleCurrencyPairChange}
                                    style={{ width: 120 }}
                                >
                                    {currencyPairs.map(pair => (
                                        <Option key={pair.value} value={pair.value}>
                                            {pair.label}
                                        </Option>
                                    ))}
                                </Select>
                                <Select
                                    value={timeframe}
                                    onChange={handleTimeframeChange}
                                    style={{ width: 120 }}
                                >
                                    {timeframes.map(tf => (
                                        <Option key={tf.value} value={tf.value}>
                                            {tf.label}
                                        </Option>
                                    ))}
                                </Select>
                                <Button
                                    type="primary"
                                    icon={<ReloadOutlined />}
                                    onClick={handleRefresh}
                                    loading={isLoading}
                                >
                                    Refresh
                                </Button>
                            </Space>
                        }
                    >
                        {error && (
                            <Alert
                                message="Error"
                                description={error}
                                type="error"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}
                        
                        <div style={{ height: 500, position: 'relative' }}>
                            {isLoading && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                }}>
                                    <Spin size="large" />
                                </div>
                            )}
                            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} lg={6}>
                    <Card title="Market Overview">
                        {currencyPairs.map(pair => (
                            <Card.Grid style={{ width: '100%' }} key={pair.value}>
                                <Statistic
                                    title={pair.label}
                                    value={Math.random() * 100} // Replace with actual market data
                                    precision={4}
                                    valueStyle={{
                                        color: Math.random() > 0.5 ? '#3f8600' : '#cf1322',
                                    }}
                                    prefix={Math.random() > 0.5 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                    suffix="."
                                />
                            </Card.Grid>
                        ))}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-4">
                <Col span={24}>
                    <Card title="Trading Activity">
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title="24h Volume"
                                    value={93843}
                                    precision={0}
                                    prefix="$"
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="24h High"
                                    value={lastPrice ? lastPrice * 1.01 : 0}
                                    precision={5}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="24h Low"
                                    value={lastPrice ? lastPrice * 0.99 : 0}
                                    precision={5}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="24h Change"
                                    value={priceChange}
                                    precision={2}
                                    valueStyle={{
                                        color: priceChange >= 0 ? '#3f8600' : '#cf1322',
                                    }}
                                    suffix="%"
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default RealTimeMarketData;