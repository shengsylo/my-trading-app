import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import { FaSearch, FaHome, FaChartLine, FaUser, FaChartBar } from 'react-icons/fa';

function Header() {
    const location = useLocation(); // Hook to get the current URL path

    return (
        <header className="header-container sticky-top position-fixed vw-100 mb-5">
            <Navbar variant="dark" expand="lg" className='ps-3 pe-3'>
                <Navbar.Brand as={Link} to="/" className="logo-brand">
                    <img
                        alt="Logo"
                        src="/logo.png"
                        width="55"
                        height="55"
                        className="d-inline-block align-top"
                    />{' '}
                    Forex Genius
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Form className="d-flex me-2 search-form">
                        <FormControl
                            type="search"
                            placeholder="Search"
                            className="me-2 bg-primary"
                            aria-label="Search"
                        />
                        <Button variant="outline-light"><FaSearch /></Button>
                    </Form>
                    <Nav>
                        <Nav.Link 
                            as={Link} 
                            to="/" 
                            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            <FaHome className="me-1" /> Home
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/community" 
                            className={`nav-item ${location.pathname === '/community' ? 'active' : ''}`}
                        >
                            <FaChartLine className="me-1" /> Forum
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/forex-dashboard" 
                            className={`nav-item ${location.pathname === '/forex-dashboard' ? 'active' : ''}`}
                        >
                            <FaChartBar className="me-1" /> Graph
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/trading" 
                            className={`nav-item ${location.pathname.startsWith('/trading') ? 'active' : ''}`}
                        >
                            <FaChartLine className="me-1" /> Trading Corner
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/profile" 
                            className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
                        >
                            <FaUser className="me-1" /> Profile
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </header>
    );
}

export default Header;
