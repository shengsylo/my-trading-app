import React from 'react';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { Button, Result } from 'antd';

function ErrorPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      color: 'white', 
      backgroundColor: '#18181b' 
    }}> 
      <Result
        status="404"
        title={<span style={{ color: 'white' }}>404</span>}
        subTitle={<span style={{ color: 'white' }}>Sorry, the page you visited does not exist.</span>}
        extra={
          <Nav.Link as={Link} to="/" className="nav-item">
            <Button type="primary">Back Home</Button>
          </Nav.Link>
        }
      />
    </div>
  );
}

export default ErrorPage;