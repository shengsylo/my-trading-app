// src/components/User/Forms/PasswordResetDone.jsx
import React from 'react';
import { Container, Card } from 'react-bootstrap';

function PasswordResetDone() {
  return (
    <Container fluid className="auth-container">
      <Card className="login-card p-4 shadow-sm">
        <Card.Body>
          <div className="text-center mb-4">
            <img src="/logo.png" alt="Logo Icon" className="mb-5 w-25 rounded-circle" />
          </div>
          <div className="text-center"> {/* Center align text */}
            <p>We've emailed you instructions for setting your password,</p>
            <p>if an account exists with the email you entered. You should receive them shortly.</p>

            <p>If you don't receive an email, please make sure you've entered the address you registered with, and check your spam folder.</p>
          </div>

        </Card.Body>
      </Card>
    </Container>
  );
}

export default PasswordResetDone;