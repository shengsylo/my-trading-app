import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Modal, Form, Input, message } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL;

const WalletDashboard = () => {
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}trading/wallet/`,{
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken')}`,
        }
      });
      message.success("")
      setWalletData(response.data); 
      console.log("response.data.wallets",response.data)
    } catch (error) {
      message.error('Error fetching wallet data');
    }
  };

  const fetchTransactions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}trading/transactions/`,{
          headers: {
            Authorization: `Token ${localStorage.getItem('authToken')}`,
          }
        }
        );
      const data = response.data;
      setTransactions(data);
    } catch (error) {
      message.error('Error fetching transactions');
    }
  };

  const handleDeposit = async (values) => {
    try {
      let response = await axios.post(`${API_BASE_URL}trading/deposit/`, values, {
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
    
      const data = response.data; 
      if (response.status === 201) { 
        message.success('Deposit request submitted successfully');
        fetchWalletData();
        fetchTransactions();
        setIsDepositModalVisible(false);
        form.resetFields();
      } else {
        message.error(response.data.message || 'Error processing deposit'); 
      }
    } catch (error) {
      message.error('Error processing deposit'); 
    }
  }

  const handleWithdraw = async (values) => {
    try {
      let response = await axios.post(`${API_BASE_URL}trading/withdraw/`, values, {
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
    
      const data = response.data; 
      if (response.status === 201) { 
        message.success('Withdrawal request submitted successfully');
        fetchWalletData();
        fetchTransactions();
        setIsWithdrawModalVisible(false);
        form.resetFields();
      } else {
        message.error(response.data.message || 'Error processing withdrawal'); 
      }
    } catch (error) {
      message.error('Error processing withdrawal'); 
    }
  }

  const calculateTotalBalance = () => {
    return (walletData || []).reduce((sum, wallet) => sum + parseFloat(wallet.balance), 0);
  };

  const calculateTotalEquity = () => {
    return (walletData || []).reduce((sum, wallet) => sum + parseFloat(wallet.equity || 0), 0); 
  };

  const calculateTotalFreeMargin = () => {
    return (walletData || []).reduce((sum, wallet) => sum + parseFloat(wallet.free_margin || 0), 0); 
  };

  const transactionColumns = [
    {
      title: 'Type',
      dataIndex: 'transaction_type',
      key: 'type',
      width: 100,
      ellipsis: true,
      sorter: (a, b) => a.transaction_type.localeCompare(b.transaction_type),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => `$${amount}`,
      sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      ellipsis: true,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      {/* Overview Cards */}
      <Row gutter={[24, 24]}>
        {[
          { title: 'Balance', value: calculateTotalBalance() },
          { title: 'Equity', value: calculateTotalEquity() },
          { title: 'Free Margin', value: calculateTotalFreeMargin() },
        ].map((item, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card title={item.title} bordered={false} className="shadow-lg" style={{ textAlign: 'center' }}>
              <h2 style={{ margin: 0, color: '#1890ff' }}>
                <DollarOutlined /> ${item.value.toFixed(2)}
              </h2>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Transactions Table */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card
            title="Transactions"
            extra={
              <>
                <Button 
                  type="primary" 
                  onClick={() => setIsDepositModalVisible(true)} 
                  style={{ marginRight: 8 }}
                >
                  Deposit
                </Button>
                <Button type="default" onClick={() => setIsWithdrawModalVisible(true)}>
                  Withdraw
                </Button>
              </>
            }
            className="shadow-lg"
          >
            <Table
              columns={transactionColumns}
              dataSource={transactions}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              bordered
            />
          </Card>
        </Col>
      </Row>

      {/* Deposit Modal */}
      <Modal
        title="Deposit Funds"
        visible={isDepositModalVisible}
        onCancel={() => setIsDepositModalVisible(false)}
        footer={null}
        centered
        bodyStyle={{ padding: '20px 40px' }}
      >
        <Form form={form} onFinish={handleDeposit} layout="vertical">
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter the amount' },
            ]}
          >
            <Input type="number" prefix="$" placeholder="Enter deposit amount" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Deposit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        title="Withdraw Funds"
        visible={isWithdrawModalVisible}
        onCancel={() => setIsWithdrawModalVisible(false)}
        footer={null}
        centered
        bodyStyle={{ padding: '20px 40px' }}
      >
        <Form form={form} onFinish={handleWithdraw} layout="vertical">
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter the amount' },
              {
                validator: (_, value) =>
                  value <= parseFloat(walletData[0]?.free_margin || "0")
                    ? Promise.resolve()
                    : Promise.reject(new Error('Insufficient funds')),
              },
            ]}
          >
            <Input type="number" prefix="$" placeholder="Enter withdrawal amount" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Withdrawal
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
 
export default WalletDashboard;