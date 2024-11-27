import React, { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  message,
  Popconfirm,
  DatePicker,
  Select,
} from "antd";
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL;
const { RangePicker } = DatePicker;
const { Option } = Select; // Get the Option component from Select
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [filters, setFilters] = useState({
    status: null,
    type: null,
    startDate: null,
    endDate: null,
  });

  const handleFiltersChange = (field, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [field]: value }));
  };

  const handleDateChange = (dates, dateStrings) => {
    handleFiltersChange("startDate", dateStrings[0]);
    handleFiltersChange("endDate", dateStrings[1]);
  };

  const fetchPendingTransactions = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}trading/admin/pending-transactions/`,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setPendingTransactions(response.data);
      console.log("setPendingTransactions", response.data);
    } catch (error) {
      message.error("Error fetching pending transactions");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}trading/admin/users/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });
      setUsers(response.data);
      console.log("userssss", response.data);
    } catch (error) {
      message.error("Error fetching users");
    }
  };

  const fetchTransactionHistory = useCallback(async () => {
    try {
      const { status, type, startDate, endDate } = filters;
      const params = {};
      if (status) params.status = status;
      if (type) params.type = type;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axios.get(
        `${API_BASE_URL}trading/admin/transaction/history/`,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
          params: params,
        }
      );
      setTransactionHistory(response.data);
    } catch (error) {
      message.error("Error fetching transaction history");
    }
  }, [filters]); // Add filters as a dependency since it's used inside the function

  useEffect(() => {
    fetchTransactionHistory();
  }, [fetchTransactionHistory]); // Now we only depend on the memoized function

  const handleTransactionAction = async (transactionId, action) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}trading/admin/transaction/${transactionId}/${action}/`,
        null,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );
      message.success(`Transaction ${action}ed successfully`);
      await fetchPendingTransactions(); // Refresh pending transactions
      await fetchTransactionHistory(); // Refresh transaction history
      setIsModalVisible(false);
    } catch (error) {
      message.error(
        `Error ${action}ing transaction: ${error?.response?.data?.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTransactions();
    fetchUsers();
  }, []); // Only run on mount

  const transactionColumns = [
    {
      title: "User",
      dataIndex: ["wallet", "trading_account", "user", "username"],
      key: "user",
      width: 120,
      ellipsis: true,
      sorter: (a, b) => {
        const userA = a.wallet?.trading_account?.user?.username || "";
        const userB = b.wallet?.trading_account?.user?.username || "";
        return userA.localeCompare(userB);
      },
    },
    {
      title: "Type",
      dataIndex: "transaction_type",
      key: "type",
      width: 100,
      ellipsis: true,
      sorter: (a, b) => a.transaction_type.localeCompare(b.transaction_type),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 100,
      render: (amount) => (amount !== undefined ? `$${amount}` : "-"),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "date",
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          onClick={() => {
            setSelectedTransaction(record);
            setIsModalVisible(true);
          }}
          disabled={isLoading}
        >
          Review
        </Button>
      ),
    },
  ];

  const userColumns = [
    {
      title: "Username",
      dataIndex: ["user", "username"],
      key: "username",
      width: 120,
      ellipsis: true,
      sorter: (a, b) => {
        const userA = a.user?.username || "";
        const userB = b.user?.username || "";
        return userA.localeCompare(userB);
      },
    },
    {
      title: "Account Number",
      dataIndex: "account_number",
      key: "account_number",
      width: 150,
      sorter: (a, b) =>
        (a.account_number || "").localeCompare(b.account_number || ""),
    },
    {
      title: "Balance",
      dataIndex: ["wallets"],
      key: "balance",
      width: 120,
      render: (wallets) => {
        if (wallets && wallets.length > 0) {
          const wallet = wallets[0];
          return `${wallet.currency} ${Number(wallet.balance).toFixed(2)}`;
        }
        return "-";
      },
      sorter: (a, b) => {
        const balanceA = a.wallets?.[0]?.balance || 0;
        const balanceB = b.wallets?.[0]?.balance || 0;
        return parseFloat(balanceA) - parseFloat(balanceB);
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      width: 100,
      render: (isActive) => (isActive ? "Active" : "Inactive"),
      sorter: (a, b) =>
        a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1,
    },
  ];

  const transactionHistoryColumns = [
    {
      title: "User",
      dataIndex: ["wallet", "trading_account", "user", "username"],
      key: "user",
      width: 120,
      ellipsis: true,
      sorter: (a, b) => {
        const userA = a.wallet?.trading_account?.user?.username || "";
        const userB = b.wallet?.trading_account?.user?.username || "";
        return userA.localeCompare(userB);
      },
    },
    {
      title: "Type",
      dataIndex: "transaction_type",
      key: "type",
      width: 100,
      ellipsis: true,
      sorter: (a, b) => a.transaction_type.localeCompare(b.transaction_type),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 100,
      render: (amount) => (amount !== undefined ? `$${amount}` : "-"),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      ellipsis: true,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Reference ID",
      dataIndex: "reference_id",
      key: "reference_id",
      width: 120,
      ellipsis: true,
      sorter: (a, b) =>
        (a.reference_id || "").localeCompare(b.reference_id || ""),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 150,
      ellipsis: true,
      sorter: (a, b) =>
        (a.description || "").localeCompare(b.description || ""),
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "date",
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
  ];

  return (
    <div>
      <Tabs
        defaultActiveKey="1"
        onChange={(activeKey) => {
          if (activeKey === "1") {
            fetchPendingTransactions();
          } else if (activeKey === "2") {
            fetchUsers();
          } else if (activeKey === "3") {
            fetchTransactionHistory();
          }
        }}
      >
        <TabPane tab="Pending Transactions" key="1">
          <Table
            columns={transactionColumns}
            dataSource={pendingTransactions}
            rowKey="id"
            users={users}
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            bordered
          />
        </TabPane>
        <TabPane tab="User Management" key="2">
          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            bordered
          />
        </TabPane>
        <TabPane tab="Transaction History" key="3">
          <div>
            <label htmlFor="status-filter">Status:</label>
            <Select
              id="status-filter"
              placeholder={
                <span style={{ color: "white" }}>Select status</span>
              }
              onChange={(value) => handleFiltersChange("status", value)}
              style={{ width: 150, marginRight: "16px" }}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="rejected">Rejected</Option>
            </Select>

            <label htmlFor="type-filter">Type:</label>
            <Select
              id="type-filter"
              placeholder={<span style={{ color: "white" }}>Select type</span>}
              onChange={(value) => handleFiltersChange("type", value)}
              style={{ width: 150, marginRight: "16px" }}
              allowClear
            >
              <Option value="deposit">Deposit</Option>
              <Option value="withdrawal">Withdrawal</Option>
              <Option value="subscription">Subscription</Option>
            </Select>

            <label htmlFor="date-range">Date Range:</label>
            <RangePicker
              id="date-range"
              onChange={handleDateChange}
              format="YYYY-MM-DD"
            />

            <Button
              type="primary"
              onClick={fetchTransactionHistory}
              style={{ marginLeft: "16px" }}
            >
              Apply Filters
            </Button>
          </div>
          <Table
            columns={transactionHistoryColumns}
            dataSource={transactionHistory}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            bordered
          />
        </TabPane>
      </Tabs>

      <Modal
        title="Review Transaction"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Popconfirm
            key="reject"
            title="Are you sure you want to reject this transaction?"
            onConfirm={() =>
              handleTransactionAction(selectedTransaction?.id, "reject")
            }
            okText="Yes"
            cancelText="No"
            disabled={isLoading}
          >
            <Button danger disabled={isLoading}>
              Reject
            </Button>
          </Popconfirm>,
          <Button
            key="approve"
            type="primary"
            onClick={() =>
              handleTransactionAction(selectedTransaction?.id, "approve")
            }
            disabled={isLoading}
          >
            Approve
          </Button>,
        ]}
      >
        {selectedTransaction ? (
          <div>
            <p>
              User:{" "}
              {selectedTransaction?.wallet?.trading_account?.user?.username ||
                "Unknown User"}
            </p>
            <p>Type: {selectedTransaction.transaction_type}</p>
            <p>Amount: ${selectedTransaction.amount}</p>
            <p>
              Date: {new Date(selectedTransaction.created_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <p>No transaction selected.</p>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
