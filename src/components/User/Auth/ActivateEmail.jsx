import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { handleError, MessageTypeEnum } from '../../../containers/Core/Utils/utils';
import '../../../styles/style.css'; 

function ActivateEmail() {
    const { uidb64, token } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessages] = useState(null);
    const [messageType, setMessageType] = useState(null);
    
    const setMessage = (messageText, messageType) => {
        setMessages(messageText);
        setMessageType(messageType);
    };

    useEffect(() => {
        const activateEmail = async () => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}users/activate_email/`, {
                  uidb64,
                  token,
                });

                setMessage(response.data.message, MessageTypeEnum.SUCCESS);
                setTimeout(() => navigate('/authForm'), 3000); 
            } catch (error) {
                console.error('Verification failed:', error);
                handleError(error, setMessages, setMessageType); 
            } finally {
                setIsLoading(false);
            }
        };

        activateEmail();
    }, [uidb64, token, navigate]);

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
                            <h2 className="auth-heading">Account Activation</h2>
                        </div>

                        {isLoading && (
                            <div className="text-center">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        )}

                        {message && (
                            <motion.div
                                className={`alert alert-${messageType}`}
                                style = {{textAlign:'center'}}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {message}
                            </motion.div>
                        )}

                    </Card.Body>
                </Card>
            </motion.div>
        </Container>
    );
}

export default ActivateEmail;
