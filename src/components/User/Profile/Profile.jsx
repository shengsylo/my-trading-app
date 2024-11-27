import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleError, validatePasswordFormat } from '../../../containers/Core/Utils/utils';
import { Container, Card, Form, Button, Row, Col, Image, Nav } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './Profile.css';

function Profile() {
    const formFields = {
        public_profile: [
            {
                controlId: 'first_name',
                label: 'First Name',
                type: 'text',
                name: 'first_name',
            },
            {
                controlId: 'last_name',
                label: 'Last Name',
                type: 'text',
                name: 'last_name',
            },
            {
                controlId: 'userName',
                label: 'User Name',
                type: 'text',
                name: 'userName',
            },
            {
                controlId: 'email',
                label: 'Email',
                type: 'email',
                name: 'email',
                readOnly: true,
            },
            {
                controlId: 'mobile_number',
                label: 'Mobile Number',
                type: 'tel',
                name: 'mobile_number',
            },
            {
                controlId: 'gender',
                label: 'Gender',
                type: 'radio', // Changed to radio button for gender
                name: 'gender',
                options: ['Male', 'Female', 'Prefer Not Say'], // Replace with your actual options
            },
            {
                controlId: 'address',
                label: 'Residential Address',
                type: 'textarea', // Use textarea for multi-line address input
                name: 'address',
            },
            {
                controlId: 'address_line1',
                label: 'Address Line 1',
                type: 'text',
                name: 'address_line1',
            },
            {
                controlId: 'address_line2',
                label: 'Address Line 2',
                type: 'text',
                name: 'address_line2',
            },
            {
                controlId: 'postcode',
                label: 'Postcode',
                type: 'text',
                name: 'postcode',
            },
            {
                controlId: 'city',
                label: 'City',
                type: 'text',
                name: 'city',
            },
            {
                controlId: 'state',
                label: 'State/Province',
                type: 'text',
                name: 'state',
            },
            {
                controlId: 'country',
                label: 'Country',
                type: 'text',
                name: 'country',
            },
        ],
        account_settings: [
            {
                controlId: 'current_password',
                label: 'Current Password',
                type: 'password',
                name: 'current_password',
            },
            {
                controlId: 'new_password',
                label: 'New Password',
                type: 'password',
                name: 'new_password',
            },
            {
                controlId: 'confirm_new_password',
                label: 'Confirm New Password',
                type: 'password',
                name: 'confirm_new_password',
            },
            {
                controlId: 'privacy_preferences',
                label: 'Profile Visibility',
                type: 'select',
                name: 'privacy_preferences',
                options: ['Public', 'Friends Only', 'Private'],
            },
            {
                controlId: 'communication_preferences',
                label: 'Communication Preferences',
                type: 'select',
                name: 'communication_preferences',
                options: ['Email', 'SMS', 'Push Notifications'],
            },
            {
                controlId: 'notifications',
                label: 'Receive Notifications',
                type: 'checkbox',
                name: 'notifications',
            },
            {
                controlId: 'acknowledgment',
                label: 'Acknowledgment',
                type: 'checkbox',
                name: 'acknowledgment',
                text: 'I acknowledge the terms and conditions and agree to the privacy policy.',
            },
        ],
    };

    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        userName: '',
        email: '',
        mobile_number: '',
        country_code: '+60', // Default country code (you can change this)
        gender: '', 
        address: '',
        address_line1: '', // New field for address line 1
        address_line2: '', // New field for address line 2
        postcode: '',
        city: '',
        state: '',
        country: '',
        avatar: null,

        current_password: '',
        new_password: '',
        confirm_new_password: '',
        // two_factor_auth: false,
        privacy_preferences: 'Public',
        communication_preferences: 'Email',
        notifications: false,
        acknowledgment: false,
    });


    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [activeSection, setActiveSection] = useState('public_profile'); // State to manage active section
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('authToken');
            try {
                if (token) {
                    const response = await axios.post(`${process.env.REACT_APP_API_URL}users_profiles/me/`, { token });
                    // Assuming the backend returns user data in the response
                    setProfile(prevProfile => ({
                        ...prevProfile,
                        first_name: response.data.first_name,
                        last_name: response.data.last_name,
                        userName: response.data.username,
                        email: response.data.email,
                        mobile_number: response.data.mobile_number,
                        country_code: response.data.address,
                        gender: response.data.gender,
                        address: response.data.address,
                        address_line1: response.data.address_line1,                        
                        address_line2: response.data.address_line2,
                        postcode: response.data.postcode,
                        city: response.data.city,
                        state: response.data.state,
                        country: response.data.country,
                        avatar: response.data.avatar,
                        privacy_preferences: response.data.privacy_preferences,
                        communication_preferences: response.data.communication_preferences,
                        notifications: response.data.notifications,
                    }));
                }
            } catch (error) {
                handleError(error, setMessage, setMessageType);
            }
        };
        fetchUserProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMessage("")
        setProfile(prevProfile => {
          const updatedProfile = {
            ...prevProfile,
            [name]: type === 'checkbox' ? checked : value,
          };
        //   console.log(updatedProfile); // Log the updated profile state
          return updatedProfile;
        });
      };
      

    const handleSubmit = async (e, section) => {
        e.preventDefault();
        try {
            // Send updated profile data to the server
            const token = localStorage.getItem('authToken'); 
            if (section === 'account_settings') {

                if (!profile.acknowledgment) {
                    setMessage('Please acknowledge the terms and conditions and privacy policy', 'danger');
                    return;
                }
                console.log("Password :",profile)
            
                if (profile.current_password !== "" && profile.new_password !== "" && profile.confirm_new_password !== ""){
                    // 1. Validate Passwords (Client-Side)
                    if (profile.new_password !== profile.confirm_new_password) {
                        setMessage('New passwords do not match', 'danger');
                        return;
                    }

                    const { valid, requirements } = validatePasswordFormat(profile.new_password);

                    if (!valid) {
                        setErrors("Password must be at least 8 characters long, include uppercase, lowercase, numeric, and special characters.");
                        return;
                    }

                    // 2. Send API Request to Update Password
                    await axios.post(
                        `${process.env.REACT_APP_API_URL}users/change_password/`, // Replace with your actual endpoint
                        {
                        current_password: profile.current_password,
                        new_password: profile.new_password,
                        },
                        {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                        }
                    );

                    // 3. Handle Success
                    setMessage('Password updated successfully', 'success');
                }
               
                // delete profile.notifications;
                delete profile.acknowledgment;
                delete profile.current_password;
                delete profile.new_password;
                delete profile.confirm_new_password;
          
 
                // 4. Clear Password Fields (Optional)
                setProfile(prevProfile => ({
                    ...prevProfile,
                    current_password: '',
                    new_password: '',
                    confirm_new_password: '',
                }));

                console.log('Handle password change logic'); 
                setMessage('Account settings updated successfully');
                setMessageType('success');  
            }
            await axios.put(`${process.env.REACT_APP_API_URL}users_profiles/update/`, profile, {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });
            setMessage('Profile updated successfully');
            setMessageType('success');
    
        } catch (error) {
            handleError(error, setMessage, setMessageType);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}api/logout/`);
            localStorage.removeItem('authToken');
            navigate('/authForm');
        } catch (error) {
            handleError(error, setMessage, setMessageType);
        }
    };

    // Handle avatar upload
    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
      
        const getBase64 = (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Read   
      
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
          });
        }
      
        try {
          const base64 = await getBase64(file);
          console.log("FILE UPLOAD", base64);
          setProfile(prevProfile => ({ ...prevProfile, avatar: base64 }));
        } catch (error) {
          console.error('Error converting to base64:', error);
        }
    };
      

    // Handle avatar delete
    const handleAvatarDelete = () => {
        setProfile(prevProfile => ({ ...prevProfile, avatar: null }));
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'public_profile':
                return (
                    <div>
                        {/* Public Profile UI */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        ></motion.div>
                    {/* <Card className="profile-card"> */}
                    <Card.Body className='bg-dark' >
                        <div className="text-center mb-4">
                            <div className='mb-5'>
                                <Image
                                    style={{backgroundColor:"white"}}
                                    src={profile.avatar ? profile.avatar : '/logo.png'}
                                    roundedCircle
                                    width={180}
                                    height={180}
                                />
                            </div>
                            <div className="mt-2">
                                <Button
                                    // variant="outline-secondary"
                                    className="bg-secondary"
                                    onClick={() => document.getElementById('avatarUpload').click()}
                                >
                                    Upload New
                                </Button>
                                <Button
                                    // variant="outline-danger"
                                    className="ms-2 bg-danger"
                                    onClick={handleAvatarDelete}
                                >
                                    Delete avatar
                                </Button>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    id="avatarUpload"
                                    onChange={handleAvatarUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>
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

                        <Form onSubmit={handleSubmit} className='bg-dark'>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group controlId="first_name">
                                        <Form.Label className='bg-dark'>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="first_name"
                                            value={profile.first_name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your first name"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="last_name ">
                                        <Form.Label className='bg-dark'>Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="last_name"
                                            value={profile.last_name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your last name"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group controlId="userName" className="mb-3">
                                <Form.Label className='bg-dark'>UserName</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="userName"
                                    value={profile.userName}
                                    readOnly
                                />
                            </Form.Group>

                            <Form.Group controlId="email" className="mb-3">
                                <Form.Label className='bg-dark'>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    readOnly
                                />
                            </Form.Group>

                            <Form.Group controlId="mobile_number" className="mb-3">
                                <Form.Label className='bg-dark'>Mobile Number</Form.Label>
                                <Row>
                                    <Col md={3}>
                                        <Form.Select
                                            name="country_code"
                                            value={profile.country_code}
                                            onChange={handleInputChange}
                                        >
                                            <option value="+60">+60</option>
                                            {/* Add other country codes as needed */}
                                        </Form.Select>
                                    </Col>
                                    <Col md={9}>
                                        <Form.Control
                                            type="tel"
                                            name="mobile_number"
                                            value={profile.mobile_number}
                                            onChange={handleInputChange}
                                            placeholder="Enter your mobile number"
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>

                            <Form.Group controlId="gender" className="mb-3">
                                <Form.Label className='bg-dark'>Gender</Form.Label>
                                <div>
                                    {['Male', 'Female', 'Prefer Not Say'].map((gender, index) => (
                                        <Form.Check
                                            inline
                                            key={index}
                                            label={gender}
                                            type="radio"
                                            name="gender"
                                            value={gender} 
                                            checked={profile.gender === gender}
                                            onChange={handleInputChange}
                                        />
                                    ))}
                                </div>
                            </Form.Group>


                            <Form.Group controlId="id" className="mb-3">
                                <Form.Label className='bg-dark'>ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="id"
                                    value="1559 000 7788 8DER"
                                    readOnly
                                />
                            </Form.Group>

                            {/* <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group controlId="taxIdNumber">
                                        <Form.Label>Tax Identification Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="taxIdNumber"
                                            value={profile.taxIdNumber}
                                            onChange={handleInputChange}
                                            placeholder="Enter your tax ID number"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="taxCountry">
                                        <Form.Label>Tax Identification Country</Form.Label>
                                        <Form.Select
                                            name="taxCountry"
                                            value={profile.taxCountry || 'Nigeria'}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Nigeria">Nigeria</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row> */}

                            <Form.Group controlId="address_line1" className="mb-3">
                                <Form.Label className='bg-dark'>Address Line 1</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address_line1"
                                    value={profile.address_line1}
                                    onChange={handleInputChange}
                                    placeholder="Enter your address line 1"
                                />
                            </Form.Group>

                            <Form.Group controlId="address_line2" className="mb-3">
                                <Form.Label className='bg-dark'>Address Line 2</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address_line2"
                                    value={profile.address_line2}
                                    onChange={handleInputChange}
                                    placeholder="Enter your address line 2"
                                />
                            </Form.Group>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group controlId="city">
                                        <Form.Label className='bg-dark'>City</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="city"
                                            value={profile.city}
                                            onChange={handleInputChange}
                                            placeholder="Enter your city"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="state">
                                        <Form.Label className='bg-dark'>State/Province/Region</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="state"
                                            value={profile.state}
                                            onChange={handleInputChange}
                                            placeholder="Enter your state/province/region"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group controlId="postcode">
                                        <Form.Label className='bg-dark'>Postcode</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="postcode"
                                            value={profile.postcode}
                                            onChange={handleInputChange}
                                            placeholder="Enter your postcode"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="country">
                                        <Form.Label className='bg-dark'>Country</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="country"
                                            value={profile.country}
                                            onChange={handleInputChange}
                                            placeholder="Enter your country"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button  type="submit" className="w-100 mb-3 auth-button bg-success">
                                    Save Changes
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button  onClick={handleLogout} className="w-100 mb-3 auth-button bg-danger">
                                    Logout
                                </Button>
                            </motion.div>
                        </Form>

                    </Card.Body>
                    {/* </Card> */}
                    </div>
                );
                case 'account_settings':
                    return (
                        <div>
                            {/* Public Profile UI */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            ></motion.div>
                        {/* <Card className="profile-card"> */}
                        <h2><b><u> Account Settings </u></b></h2>
                        <Card.Body className='bg-dark'>
                            <Form onSubmit={(e) => handleSubmit(e, 'account_settings')}>
                                {formFields.account_settings.map((field) => (
                                    <Form.Group controlId={field.controlId} className="mb-3" key={field.controlId}>
                                        <Form.Label className='bg-dark'>{field.label}</Form.Label>
                                      
                                        {field.type === 'select' ? (
                                            <Form.Select
                                                name={field.name}
                                                value={profile[field.name] || ''}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                {field.options.map((option, index) => (
                                                    <option key={index} value={option}>{option}</option>
                                                ))}
                                            </Form.Select>
                                        ) : field.type === 'checkbox' ? (
                                            <Form.Check
                                                type="checkbox"
                                                name={field.name}
                                                label={field.text || ''}
                                                checked={profile[field.name]}
                                                onChange={handleInputChange}
                                                required
                                            />
                                         ) : (field.type === 'password' &&  field.controlId !== 'current_password')? (
                                            <Form.Control
                                                type={field.type}
                                                name={field.name}
                                                value={profile[field.name] || ''}
                                                onChange={handleInputChange}
                                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                                isInvalid={!!errors}
                                            />
                                        ) : (
                                            <Form.Control
                                                type={field.type}
                                                name={field.name}
                                                value={profile[field.name] || ''}
                                                onChange={handleInputChange}
                                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                                readOnly={field.readOnly || false}
                                            />
                                        )}
                                        <Form.Control.Feedback type="invalid">
                                            {errors}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                ))}
                
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Button variant="outline-dark" type="submit" className="w-100 mb-3 auth-button bg-success">
                                        Save Changes
                                    </Button>
                                </motion.div>
                            </Form>
                        </Card.Body>
                
                        </div>
                        );
            default:
                return <div>Select a section from the sidebar</div>;
        }
    };

    return (
        <Container fluid className="profile-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Row>
                    <Col md={3}>
                        <Nav variant="pills" className="flex-column bg-dark">
                            <Nav.Item>
                                <Nav.Link active={activeSection === 'public_profile'} onClick={() => {setActiveSection('public_profile'); setMessage('');}}>
                                    Public Profile
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link active={activeSection === 'account_settings'} onClick={() => {setActiveSection('account_settings'); setMessage('');}}>
                                    Account Settings
                                </Nav.Link>
                            </Nav.Item>
                            {/* Add more Nav.Link items for other sections */}
                        </Nav>
                    </Col>
                    <Col md={9}>
                        <Card className="profile-card bg-dark">
                            <Card.Body className='bg-dark'>
                                {renderSection()}
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
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </motion.div>
        </Container>

    );
}

export default Profile;
