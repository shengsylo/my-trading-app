import { useLocation } from 'react-router-dom';
import { useEffect } from 'react'; 
import axios from 'axios';

const logPageView = async (pathname) => {
  console.log("hi", pathname);
  try {
    const response = await axios.post( // Use axios.post directly
      `${process.env.REACT_APP_API_URL}api/log-page-view/`, 
      { pathname }, // Pass pathname as data
      { headers: { 'Content-Type': 'application/json' } } 
    );
    console.log("response", response);
  } catch (error) {
    console.error("error", error); // Use console.error for errors
  }
};

export const usePageViewTracker = () => {
  const location = useLocation();
  useEffect(() => {
    logPageView(location.pathname);
  }, [location.pathname]); 
};