import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { secondsFormatter } from "@/utils/secondsFormatter.js";
import './ScreenTimeChart.css';
import { useEffect, useState } from "react";

// Register Chart.js components and animations
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Function to generate gradient colors for chart bars based on --color-primary
const generateGradientColors = (count) => {
    const colors = [];
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();

    for (let i = 0; i < count; i++) {
        // Create a gradient using the primary color
        colors.push(`linear-gradient(90deg, ${primaryColor} 0%, hsla(0, 0%, 100%, 0.8) 100%)`);
    }
    return colors;
};

/**
 * ScreenTimeChart component for displaying screen time data as a horizontal bar chart
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - The data to display in the chart
 * @param {string} props.title - The title of the chart
 * @param {string} props.labelField - The field to use for labels (default: 'app')
 * @param {string} props.valueField - The field to use for values (default: 'usage')
 * @param {string} props.datasetLabel - The label for the dataset (default: 'Screen Time')
 * @param {string} props.borderColor - The border color for the bars (default: 'rgba(75, 192, 192, 1)')
 */
export default function ScreenTimeChart({
    data,
    title = 'Screen Time',
    labelField = 'app',
    valueField = 'usage',
    datasetLabel = 'Screen Time (seconds)',
    borderColor = 'rgba(23, 189, 189, 0.7)'
}) {
    const [chartHeight, setChartHeight] = useState(400); // Default height
    useEffect(() => {
        const calculateHeight = () => {
            const baseHeight = 200; // Base height for the chart
            const itemHeight = 40; // Height per item
            const newHeight = baseHeight + data.data.length * itemHeight; // Calculate new height
            console.log(data.data.length);
            console.log(newHeight);
            setChartHeight(newHeight);
        };

        calculateHeight(); // Set initial height
    }, [data]); // Recalculate height when data length changes



    // Limit to top 15 items for better visualization if there are too many
    let sortedIndices = [];
    sortedIndices = Array.from(Array(data.data.length).keys());


    // Generate gradient colors
    const gradientColors = generateGradientColors(data.labels.length);
    // Prepare chart data based on input format
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: datasetLabel,
                data: data.data,
                backgroundColor: gradientColors,
                borderColor: borderColor,
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 28,
                maxBarThickness: 40,
            },
        ],
    };

    // Chart options
    const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1500,
            easing: 'easeOutQuart'
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'white',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'rectRounded'
                },
            },
            title: {
                display: true,
                text: title,
                color: 'white',
                font: {
                    size: 18,
                    weight: 'bold',
                    family: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(20, 20, 20, 0.9)',
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${secondsFormatter(context.raw)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    color: 'white',
                    font: {
                        size: 13
                    },
                    padding: 8,
                    // Truncate long labels
                    callback: function (value, index) {
                        const label = this.getLabelForValue(value);
                        return label.length > 25 ? label.substring(0, 22) + '...' : label;
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                },
            },
            x: {
                min: 0,
                ticks: {
                    stepSize: 3600, // 1 hour in seconds
                    color: 'white',
                    font: {
                        size: 12
                    },
                    callback: function (value) {
                        return secondsFormatter(value);
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
            },
        },
    };


    let hasData = true;
    return (
        <div className="chart-container" style={{ height: chartHeight }}>
            {hasData ? (
                <Bar
                    data={chartData}
                    options={chartOptions}
                />
            ) : (
                <div style={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "16px",
                    fontStyle: "italic"
                }}>
                    <p>No screen time data available</p>
                </div>
            )}
        </div>
    );
} 