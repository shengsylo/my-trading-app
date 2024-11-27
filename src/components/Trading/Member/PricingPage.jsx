import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  message,
  Modal,
  Spin,
  Typography,
  Badge,
  Tag,
  Space,
} from "antd";
import {
  CheckCircleOutlined,
  RightOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Plan level hierarchy for upgrade validation
const PLAN_LEVELS = {
  basic: 1,
  advanced: 2,
  pro: 3,
};

const PricingPage = () => {
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  const plans = [
    {
      id: "basic",
      title: "Basic Plan",
      price: 0,
      level: PLAN_LEVELS.basic,
      features: [
        "Basic market data",
        "Manual trading",
        "Standard charts",
        "Basic price history",
      ],
    },
    {
      id: "advanced",
      title: "Advanced Plan",
      price: 29.99,
      level: PLAN_LEVELS.advanced,
      features: [
        "Everything in Basic",
        "Advanced price predictions",
        "AI-powered market analysis",
        "Premium technical indicators",
        "Real-time alerts",
        "Trading bot access",
      ],
      recommended: true,
    },
    {
      id: "pro",
      title: "Pro Plan",
      price: 99.99,
      level: PLAN_LEVELS.pro,
      features: [
        "Everything in Advanced",
        "Priority support",
        "Custom trading strategies",
        "Advanced portfolio analytics",
        "Risk management tools",
        "API access",
        "White-label solutions",
      ],
    },
  ];

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}trading/subscription/current/`,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("response",response.data)
      setCurrentSubscription(response.data);
    } catch (error) {
      message.error("Failed to fetch subscription details");
    } finally {
      setLoading(false);
    }
  };

  const isUpgradeAllowed = (planId) => {
    if (!currentSubscription) return true;

    // If subscription is expired, allow any plan purchase
    if (currentSubscription.status !== "ACTIVE") return true;

    const currentLevel = PLAN_LEVELS[currentSubscription.plan_id];
    const targetLevel = PLAN_LEVELS[planId];

    // Only allow upgrades to higher level plans
    return targetLevel > currentLevel;
  };

  const getPlanButton = (plan) => {
    if (currentSubscription?.is_new && plan.id === "basic"){
      return { text: "Current Plan", disabled: true}
    }
    if (
      currentSubscription?.plan_id === plan.id &&
      currentSubscription?.status === "ACTIVE"
    ) {
      return {
        text: "Current Plan",
        disabled: true,
      };
    }

    if (
      currentSubscription?.status === "PENDING" &&
      currentSubscription?.plan_id === plan.id
    ) {
      return {
        text: "Approval Pending",
        disabled: true,
      };
    }

    if (!isUpgradeAllowed(plan.id)||currentSubscription?.status === "PENDING") {
      return {
        text: "Not Available",
        disabled: true,
      };
    }

    return {
      text: currentSubscription?.plan_id ? "Upgrade Now" : "Select Plan",
      disabled: false,
    };
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setIsModalVisible(true);
  };

  const handlePurchaseConfirm = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}trading/plan/purchase/`,
        {
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.title,
          amount: selectedPlan.price,
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data.success) {
        message.success("Plan upgrade request submitted successfully!");
        setIsModalVisible(false);
        fetchCurrentSubscription(); // Refresh subscription data
      }
    } catch (error) {
      console.log("handlePurchaseConfirm",error)
      message.error("Failed to process plan upgrade. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderSubscriptionStatus = () => {
    if (!currentSubscription) return null;

    const formatDate = (date) => dayjs(date).format("MMMM D, YYYY");

    return (
      <Row className="mb-4" justify="center">
        <Col xs={24} className="text-center">
          <Card className="shadow-lg">
            <Title level={4}>Current Subscription Status</Title>
            <div>
              <Tag
                color={
                  currentSubscription.status === "ACTIVE" ? "green" : "orange"
                }
              >
                {currentSubscription.status}
              </Tag>
              {currentSubscription.status === "ACTIVE" && (
                <>
                  <div className="mt-2">
                    <Text type="secondary">
                      <ClockCircleOutlined /> Active since:{" "}
                      {formatDate(currentSubscription.start_date)}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">
                      Expires on: {formatDate(currentSubscription.end_date)}
                    </Text>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spin size="large" />
      </div>
    );
  }

  const handleScrollToPlans = () => {
    document
      .getElementById("plans-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero Section */}
      <div
        style={{
          height: "80vh",
          background: "linear-gradient(to bottom, #001529, #1890ff)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <Title level={1} style={{ color: "#fff" }}>
          Discover the Perfect Plan for Your Trading Needs
        </Title>
        <Text
          style={{ color: "#d6e4ff", fontSize: "1.2rem", maxWidth: "600px" }}
        >
          Choose from a variety of plans tailored to suit your trading
          experience and goals.
        </Text>
        <Button
          type="primary"
          size="large"
          style={{ marginTop: "2rem" }}
          onClick={handleScrollToPlans}
        >
          See Plans <RightOutlined />
        </Button>
      </div>

      {/* Plans Section */}
      <div
        id="plans-section"
        style={{ padding: "4rem 2rem", background: "#f0f2f5" }}
      >
        <div>
          <Row>
            <div className="container-fluid py-5">
              <Row className="justify-content-center mb-5">
                <Col xs={24} className="text-center">
                  <Title level={1}>Choose Your Trading Plan</Title>
                  <Text className="text-muted">
                    Select the plan that best fits your trading needs
                  </Text>
                </Col>
              </Row>

              {renderSubscriptionStatus()}

              <Row gutter={[24, 24]} justify="center">
                {plans.map((plan) => (
                  <Col xs={24} md={12} lg={8} key={plan.id}>
                    <Badge.Ribbon
                      text="Recommended"
                      color="gold"
                      style={{ display: plan.recommended ? "block" : "none" }}
                    >
                      <Card
                        hoverable
                        className={`h-100 ${
                          currentSubscription?.plan_id === plan.id
                            ? "border-primary"
                            : ""
                        }`}
                        style={{
                          textAlign: "center",
                          height: "100%",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {plan.recommended && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              background: "#1890ff",
                              color: "white",
                              padding: "0.5rem 1rem",
                              transform:
                                "rotate(45deg) translateX(30%) translateY(-50%)",
                              width: "200px",
                              textAlign: "center",
                            }}
                          >
                            Recommended
                          </div>
                        )}

                        <Title level={3}>{plan.title}</Title>
                        <Title level={2} className="my-4">
                          ${plan.price}
                          <Text
                            className="text-muted"
                            style={{ fontSize: "1rem" }}
                          >
                            /month
                          </Text>
                        </Title>

                        <div className="feature-list mb-4">
                          {plan.features.map((feature, index) => (
                            <div
                              key={index}
                              className="d-flex align-items-center mb-3"
                              style={{ padding: "0.5rem 1rem" }}
                            >
                              <CheckCircleOutlined className="text-success me-2" />
                              <Text>{feature}</Text>
                            </div>
                          ))}
                        </div>

                        {currentSubscription?.status === "ACTIVE" &&
                          currentSubscription?.plan_id === plan.id && (
                            <Tag color="green" className="mb-3">
                              Current Plan
                            </Tag>
                          )}

                        <Button
                          type={plan.recommended ? "primary" : "default"}
                          size="large"
                          block
                          {...getPlanButton(plan)}
                          onClick={() => handlePlanSelect(plan)}
                        >
                          {getPlanButton(plan).text}
                          {!getPlanButton(plan).disabled && (
                            <RightOutlined className="ms-2" />
                          )}
                        </Button>
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                ))}
              </Row>

              <Modal
                title="Confirm Plan Upgrade"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                  <Button key="back" onClick={() => setIsModalVisible(false)}>
                    Cancel
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handlePurchaseConfirm}
                  >
                    Confirm Upgrade
                  </Button>,
                ]}
              >
                {selectedPlan && (
                  <div>
                    <p>You are about to upgrade to the {selectedPlan.title}</p>
                    <p>Monthly Price: ${selectedPlan.price}</p>
                    <p>
                      This upgrade request will be reviewed by our admin team.
                    </p>
                    <div className="alert alert-info">
                      <small>
                        Note: Your plan will be upgraded once the admin approves
                        your request. You will receive a notification when your
                        upgrade is processed.
                      </small>
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          </Row>
          <Row justify="center" align="middle">
            <div className="mt-5 ">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card className="shadow-lg">
                    <Space direction="vertical">
                      <LineChartOutlined
                        style={{ fontSize: "24px", color: "#1890ff" }}
                      />
                      <Title level={4}>Advanced Price Predictions</Title>
                      <Text>
                        Get access to AI-powered price predictions with up to
                        85% accuracy. Make informed decisions using our advanced
                        technical analysis.
                      </Text>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card className="shadow-lg">
                    <Space direction="vertical">
                      <RobotOutlined
                        style={{ fontSize: "24px", color: "#1890ff" }}
                      />
                      <Title level={4}>Automated Trading Bot</Title>
                      <Text>
                        Set up automated trading strategies based on our AI
                        predictions. Monitor and adjust your bot's performance
                        24/7.
                      </Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </div>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
