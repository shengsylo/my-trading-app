import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { handleError, MessageTypeEnum } from '../../../containers/Core/Utils/utils';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessages] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const setMessage = (messageText, messageType) => {
    setMessages(messageText);
    setMessageType(messageType);
  };
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}api/forgot_password/`, {
            email,
        });
        navigate('/password-reset-done'); 
        
        setMessage(response.data.message, MessageTypeEnum.SUCCESS);
        
    } catch (error) {
        handleError(error, setMessages, setMessageType); 
    }

  };

  return (
    <Container fluid className="auth-container">
      <Card className="login-card p-4 shadow-sm">
        <Card.Body>
          <div className="text-center mb-4">
            <img src="/logo.png" alt="Logo Icon" className="mb-5 w-25 rounded-circle" />
            <h2>Forgot Your Password?</h2>
          </div>
          {message && (<div className={`alert alert-${messageType}`}> {message}</div>)}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="email">
              <Form.Label className='text-muted'>Enter your email address and we'll send you a link to reset your password.</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mt-3">
              Send Reset Link
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ForgotPassword;
