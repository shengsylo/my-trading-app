// src/components/Shared/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import { FaSearch, FaHome, FaChartLine } from 'react-icons/fa';

function Header() {
    return (
        <header className="header-container">
            <Navbar bg="github-gray" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="logo-brand">
                        <img
                            alt="Logo"
                            src="/logo.png"
                            width="40"
                            height="40"
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
                                className="me-2"
                                aria-label="Search"
                            />
                            <Button variant="outline-light"><FaSearch /></Button>
                        </Form>
                        <Nav>
                            <Nav.Link as={Link} to="/" className="nav-item">
                                <FaHome className="me-1" /> Home
                            </Nav.Link>
                            <Nav.Link as={Link} to="/dashboard" className="nav-item">
                                <FaChartLine className="me-1" /> Dashboard
                            </Nav.Link>
                            {/* Add other navigation links here */}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}

export default Header;
