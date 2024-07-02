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
