import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';

const Indicators = ({ chart }) => {
    const [selectedIndicator, setSelectedIndicator] = useState('');

    const handleAddIndicator = async () => {
        if (chart && selectedIndicator) {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}api/indicator_data/${selectedIndicator}`);
                const indicatorData = response.data.map(item => ({ time: item.timestamp, value: item.value }));

                // Add indicator to the chart based on selectedIndicator
                if (selectedIndicator === 'EMA') {
                    const emaSeries = chart.addLineSeries();
                    emaSeries.setData(indicatorData);
                }
                // ... handle other indicators similarly
            } catch (error) {
                console.error('Error fetching indicator data:', error);
                // Handle error appropriately
            }
        }
    };

    return (
        <div>
            <Form.Select value={selectedIndicator} onChange={(e) => setSelectedIndicator(e.target.value)}>
                <option value="">Select Indicator</option>
                <option value="EMA">EMA</option>
                <option value="RSI">RSI</option>
                {/* ... add more indicator options */}
            </Form.Select>
            <Button onClick={handleAddIndicator}>Add Indicator</Button>
        </div>
    );
};

export default Indicators;