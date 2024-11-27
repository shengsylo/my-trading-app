export const MessageTypeEnum = {
    SUCCESS: 'success',
    DANGER: 'danger'
};

export const handleError = (error, setMessage, setMessageType) => {
    if (error.response && error.response.data) {
        setMessage(error.response.data.error || 'An unexpected error occurred. Please try again later.', setMessageType(MessageTypeEnum.DANGER));
    } else {
        setMessage('An unexpected error occurred. Please try again later.', setMessageType(MessageTypeEnum.DANGER));
    }
    console.error('Error:', error);
};

export const validatePasswordFormat = (password) => {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numeric: /[0-9]/.test(password),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    const valid = Object.values(requirements).every(Boolean);
    return { valid, requirements };
};
