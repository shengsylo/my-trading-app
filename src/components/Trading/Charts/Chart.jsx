// // src/components/Trading/Charts/Chart.jsx
// import React, { useEffect, useRef, useState } from 'react';
// import { createChart } from 'lightweight-charts';

// const Chart = ({ data }) => {
//   const chartContainerRef = useRef(null);
//   const [chart, setChart] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     setIsLoading(true); 
//  // Start loading

//     const initChart = async () => {
//       try {
//         if (chartContainerRef.current) {
//           const newChart = createChart(chartContainerRef.current, {
//             width: chartContainerRef.current.clientWidth, 
//             height: 400,
//             layout: {
//               backgroundColor: '#ffffff',
//               textColor: '#333',
//             },
//             grid: {
//               vertLines: {
//                 color: '#eee',
//               },
//               horzLines: {
//                 color: '#eee',
//               },
//             },
//             // ... other chart configuration options
//           });

//           setChart(newChart); 
//           setError(null); 

//           // Set initial data if available
//           if (data && data.length > 0) {
//             const candlestickSeries = newChart.addCandlestickSeries();
//             candlestickSeries.setData(data);
//           } else {
//             setError('No data available for the chart.');
//           }
//         } 
//       } catch (error) {
//         console.error('Error creating chart:', error);
//         setError('Failed to create chart. Please try again later.');
//       } finally {
//         setIsLoading(false); 
//       }
//     };

//     initChart();

//     return () => {
//       if (chart) {
//         chart.remove();
//         setChart(null);
//       }
//     };
//   }, [chart, data]); // Empty dependency array - runs only once on mount

//   // useEffect to update chart data when 'data' prop changes
//   useEffect(() => {
//     if (chart && data && data.length > 0) {
//       chart.timeScale().fitContent();
//       const series = chart?.getSeries()?.[0]; // Use optional chaining
//       if (series) {
//         series.setData(data);
//       }
//     }
//   }, [chart, data]);
//     return (
//     <div>
//       {isLoading && <div>Loading chart...</div>} 
//       {error && <div className="alert alert-danger">{error}</div>} 
//       {!isLoading && !error && (
//         <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
//       )}
//     </div>
//   );
// };

// export default Chart;

