import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
// import './AuthForm.css';
import { handleError, MessageTypeEnum, validatePasswordFormat } from '../../../containers/Core/Utils/utils';
import { motion } from 'framer-motion'; // You'll need to install framer-motion
import '../../../styles/style.css'

function AuthForm() {
    const [view, setView] = useState('login'); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [message, setMessages] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [errors, setErrors] = useState({});
    
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            navigate('/profile');
        }
    }, [ navigate]);

    const setMessage = (messageText, messageType) => {
        setMessages(messageText);
        setMessageType(messageType);
    };

    const switchView = (newView) => {
        setView(newView);
        setMessage("","")
        
        setShowPasswordField(false); // Reset password field visibility
        // setEmail(''); // Reset email field
        setPassword('');
        setConfirmPassword("");
    };

    const handleContinue = async (event) => {
        event.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
        setMessage('Invalid email address.',MessageTypeEnum.DANGER); 
        return; 
        }

        try {
            let x ='';
            if(view === 'register')
                x = `verify_email_register`;
            else 
                x = `verify_email`;
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}api/${x}/`, // Call verification endpoint
                { email }
            );
            setShowPasswordField(true);
            setMessage(response.data.message,MessageTypeEnum.SUCCESS);
        } catch (error) {
            handleError(error, setMessages, setMessageType); 
        }
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("View :",view)
        if( view === 'register') {
            const { valid, requirements } = validatePasswordFormat(password);
            console.log("Password :",password)

            if (!valid) {
                setErrors({
                    password: "Password must be at least 8 characters long, include uppercase, lowercase, numeric, and special characters."
                });
                return;
            }
            if (password !== confirmPassword) {
                setErrors({
                    confirmPassword: "Passwords do not match."
                });
                return;
            }
            setErrors("")
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}api/users/`, {
                    username,
                    password,
                    email,
                });
                localStorage.setItem('authToken', response.data.token);
                console.log('Registration successful:', response.data);
                setMessage('Registration successful. Redirecting to profile...',MessageTypeEnum.SUCCESS);
                setTimeout(() => navigate('/profile'), 2000); // Redirect after 2 seconds
            } catch (error) {
                handleError(error, setMessages, setMessageType); 
            }
        }else{
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}api/login/`, {
                    email,
                    password,
                });
                localStorage.setItem('authToken', response.data.token);
                setMessage('Login successful. Redirecting to home page...',MessageTypeEnum.SUCCESS);
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } catch (error) {
                handleError(error, setMessages, setMessageType); 
            }
        }
    };

    const handleEmailChange = async (event) => {
        if(showPasswordField){
            setShowPasswordField(false);
        }
        setPassword("")
        setConfirmPassword("")
        setMessages("",""); 
        setEmail(event.target.value)
    };

    const handlePasswordChange = async (event) => {
      setMessages("",""); 
      setPassword(event.target.value)
    };



    return (
        <Container fluid className="auth-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="auth-card bg-dark">
            <Card.Body className='bg-dark'>
                <div className="text-center mb-4">
                    <motion.img
                    src="/logo.png"
                    alt="Logo Icon"
                    className="auth-logo rounded-circle"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    />
                    <h2 className="auth-heading">
                    {view === 'login' ? 'Welcome Back' : 'Create Your Account'}
                    </h2>
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
                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label className="bg-dark">Email address</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e)}
                      placeholder="Enter email address"
                      required
                      className="form-input"
                    />
                  </Form.Group>
                  
                  {showPasswordField && (
                    <>
                      <Form.Group controlId="password" className="mb-3">
                        <Form.Label className="bg-dark">Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={password}
                          onChange={(e) => handlePasswordChange(e)}
                          placeholder="Enter password"
                          required
                          isInvalid={!!errors.password}
                          className="form-input"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>
                      {view === 'register' && (
                        <Form.Group controlId="confirmPassword" className="mb-3">
                          <Form.Label className="">Confirm Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            isInvalid={!!errors.confirmPassword}
                            required
                            className="form-input"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                      )}
                      {view === 'register' && (
                        <Form.Group controlId="username" className="mb-3">
                          <Form.Label className="">Username</Form.Label>
                          <Form.Control
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            isInvalid={!!errors.username}
                            required
                            className="form-input"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.username}
                          </Form.Control.Feedback>
                        </Form.Group>
                      )}
                      <div className="text-end mb-3">
                        <Button variant="link" onClick={() => navigate('/forgot_password')} className="p-0">
                          Forgot password?
                        </Button>
                      </div>
                    </>
                  )}
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="primary"
                      type="submit"
                      onClick={!showPasswordField ? handleContinue : undefined}
                      className="w-100 mb-3 auth-button"
                    >
                      {!showPasswordField ? 'Continue' : (view === 'login' ? 'Log In' : 'Register')}
                    </Button>
                  </motion.div>
                  <div className="mt-3 text-center">
                    {view === 'login' ? (
                      <span>
                        Don't have an account?{' '}
                        <Button variant="link" onClick={() => switchView('register')} className="p-0">
                          Sign up
                        </Button>
                      </span>
                    ) : (
                      <span>
                        Already have an account?{' '}
                        <Button variant="link" onClick={() => switchView('login')} className="p-0">
                          Log in
                        </Button>
                      </span>
                    )}
                  </div>
                </Form>
                <div className="mt-4 text-center small ">
                  Not your computer? Use Guest mode to sign in privately.
                  <br />
                  <a href="continue here" className="text-primary">
                    Learn more
                  </a>
                </div>
                <hr />
                <div className="text-center">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="outline-primary" className="w-100 mb-2 social-button">
                      <img src="/google-icon.png" alt="Google Icon" className="icon me-2" /> Sign in with Google
                    </Button>
                  </motion.div>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Container>
      );
    }
    
export default AuthForm;
    
