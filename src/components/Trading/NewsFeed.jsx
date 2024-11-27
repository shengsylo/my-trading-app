// src/components/Trading/NewsFeed.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NewsFeed = () => {
    const [news, setNews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}trading/news/`);
                if (Array.isArray(response.data)) {
                    setNews(response.data);
                } else if (typeof response.data === 'object' && response.data.message) {
                    // Handle the case where the API returns a message instead of news data
                    setError(response.data.message);
                } else {
                    setError('Unexpected data format received from the news API');
                }
            } catch (error) {
                console.error('Error fetching news:', error);
                setError('Failed to fetch news. Please try again later.');
            }
        };

        fetchNews();

        // const updateInterval = setInterval(fetchNews, 60000); // Fetch news every minute

        // return () => {
        //     clearInterval(updateInterval);
        // };
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h3>News Feed</h3>
            {news.length === 0 ? (
                <p>No news available at the moment.</p>
            ) : (
                <ul>
                    {news.map((item, index) => (
                        <li key={index}>
                            <h4>{item.headline}</h4>
                            <p>{item.summary}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NewsFeed;