import React, { useState, useEffect } from 'react';
import { Table, message, Card, Spin } from 'antd';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}trading/history/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken')}`,
        },
      });
      setTransactions(response.data);
      message.success('Transaction history loaded successfully');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        message.error('Authentication failed. Please log in again.');
      } else {
        message.error('Error fetching transaction history');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Currency Pair',
      dataIndex: ['currency_pair_data', 'symbol'],
      key: 'currency_pair',
    },
    {
      title: 'Type',
      dataIndex: 'position_type',
      key: 'type',
    },
    {
      title: 'Lot Size',
      dataIndex: 'lot_size',
      key: 'lot_size',
    },
    {
      title: 'Entry Price',
      dataIndex: 'entry_price',
      key: 'entry_price',
      render: (price) => (price !== undefined ? `$${parseFloat(price).toFixed(2)}` : '-'),
    },
    {
      title: 'Realized P/L',
      dataIndex: 'realized_pnl',
      key: 'realized_pnl',
      render: (pnl) =>
        pnl !== undefined ? (
          <span style={{ color: pnl >= 0 ? 'green' : 'red' }}>${parseFloat(pnl).toFixed(2)}</span>
        ) : (
          '-'
        ),
    },
    {
      title: 'Closed At',
      dataIndex: 'closed_at',
      key: 'closed_at',
      render: (date) =>
        date ? new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Open',
    },
  ];

  return (
    <Card
      title="Transaction History"
      className="shadow-lg"
      bodyStyle={{ padding: '20px' }}
      style={{ marginTop: '20px' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          bordered
        />
      )}
    </Card>
  );
};

export default History;
