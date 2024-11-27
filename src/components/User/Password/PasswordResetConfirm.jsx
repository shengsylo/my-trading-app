import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { handleError, MessageTypeEnum, validatePasswordFormat } from '../../../containers/Core/Utils/utils';
// import './PasswordResetConfirm.css'; // We'll create this file for additional styling
import '../../../styles/style.css'

function PasswordResetConfirm() {
  const { uidb64, token } = useParams();
  const [newPassword, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessages] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const setMessage = (messageText, messageType) => {
    setMessages(messageText);
    setMessageType(messageType);
  };

  useEffect(() => {
    const verifyTokenValidity = async () => {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}api/validate_reset_token/`, {
          uidb64,
          token,
        });
        setIsTokenValid(true);
      } catch (error) {
        setIsTokenValid(false);
        if (error.response && error.response.data) {
          if (error.response.data.error === 'Token expired.' || error.response.data.error === 'Invalid token.') {
            window.alert('This link has expired. Click OK to go back to the login page.');
            navigate('/authForm');
          } else {
            handleError(error, setMessages, setMessageType);
          }
        } else {
          handleError(error, setMessages, setMessageType);
        }
      }
    };

    verifyTokenValidity();
  }, [uidb64, token, navigate]);

  const handlePasswordChange = async (event) => {
    // setMessages("",""); 
    setPassword(event.target.value)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

      const { valid, requirements } = validatePasswordFormat(newPassword);
      console.log("Password :",newPassword)

      if (!valid) {
          setErrors({
            newPassword: "Password must be at least 8 characters long, include uppercase, lowercase, numeric, and special characters."
          });
          
          return;
      }
      if (newPassword !== confirmPassword) {
          setErrors({
              confirmPassword: "Passwords do not match."
          });
          return;
      }
      setErrors("");
      
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match", MessageTypeEnum.DANGER);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}api/password_reset_confirm/`,
        { uidb64, token, new_password: newPassword }
      );
      setMessage(response.data.message, MessageTypeEnum.SUCCESS);
      setTimeout(() => navigate('/authForm', { replace: true }), 3000);
    } catch (error) {
      console.error('Password reset failed:', error.response);
      handleError(error, setMessages, setMessageType);
    }
  };

  if (isTokenValid === null) {
    return (
      <Container fluid className="auth-container">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Verifying your link, please wait...</p>
        </div>
      </Container>
    );
  } else if (isTokenValid) {
    return (
      <Container fluid className="auth-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="auth-card">
            <Card.Body>
              <div className="text-center mb-4">
                <motion.img
                  src="/logo.png"
                  alt="Logo Icon"
                  className="auth-logo rounded-circle"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
                <h2 className="auth-heading">Reset Password</h2>
              </div>
              {message && (
                <motion.div
                  className={`alert alert-${messageType}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {message}
                </motion.div>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="newPassword" className="mb-3">
                  <Form.Label className="text-muted">New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => handlePasswordChange(e)}
                    placeholder="Enter new password"
                    required
                    isInvalid={!!errors.newPassword}
                    className="form-input"
                  />
                </Form.Group>
                <Form.Control.Feedback type="invalid">
                  {errors.newPassword}
                </Form.Control.Feedback>
                <Form.Group controlId="confirmPassword" className="mb-3">
                  <Form.Label className="text-muted">Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    isInvalid={!!errors.confirmPassword}
                    className="form-input"
                  />
                </Form.Group>
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3 auth-button"
                  >
                    Reset Password
                  </Button>
                </motion.div>
              </Form>
            </Card.Body>
          </Card>
        </motion.div>
      </Container>
    );
  } else {
    return null;
  }
}

export default PasswordResetConfirm;