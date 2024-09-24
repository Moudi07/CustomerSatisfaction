let agePieChart, customerTypePieChart, typeOfTravelPieChart, classPieChart, overallResultsChart;

// Function to load survey data and update charts
async function loadSurveyData() {
  try {
    const response = await fetch('http://localhost:5000/api/surveys');
    let surveyData = await response.json();

    // Helper function to calculate the distribution for a given attribute
    function calculateDistribution(attribute) {
      return surveyData.reduce((acc, survey) => {
        const attributeValue = survey[attribute];
        acc[attributeValue] = (acc[attributeValue] || 0) + 1;
        return acc;
      }, {});
    }

    // Generate the four pie charts

    // Age Distribution
    const ageDistribution = calculateDistribution('age');
    if (agePieChart) agePieChart.destroy();  // Destroy existing chart before creating new one
    const ctxAge = document.getElementById('agePieChart').getContext('2d');
    agePieChart = new Chart(ctxAge, {
      type: 'pie',
      data: {
        labels: Object.keys(ageDistribution),
        datasets: [{
          data: Object.values(ageDistribution),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          borderWidth: 1
        }]
      }
    });

    // Customer Type Distribution
    const customerTypeDistribution = calculateDistribution('customerType');
    if (customerTypePieChart) customerTypePieChart.destroy();
    const ctxCustomerType = document.getElementById('customerTypePieChart').getContext('2d');
    customerTypePieChart = new Chart(ctxCustomerType, {
      type: 'pie',
      data: {
        labels: Object.keys(customerTypeDistribution),
        datasets: [{
          data: Object.values(customerTypeDistribution),
          backgroundColor: ['#F7464A', '#46BFBD'],
          borderColor: ['#F7464A', '#46BFBD'],
          borderWidth: 1
        }]
      }
    });

    // Type of Travel Distribution
    const typeOfTravelDistribution = calculateDistribution('typeOfTravel');
    if (typeOfTravelPieChart) typeOfTravelPieChart.destroy();
    const ctxTypeOfTravel = document.getElementById('typeOfTravelPieChart').getContext('2d');
    typeOfTravelPieChart = new Chart(ctxTypeOfTravel, {
      type: 'pie',
      data: {
        labels: Object.keys(typeOfTravelDistribution),
        datasets: [{
          data: Object.values(typeOfTravelDistribution),
          backgroundColor: ['#FDB45C', '#46BFBD'],
          borderColor: ['#FDB45C', '#46BFBD'],
          borderWidth: 1
        }]
      }
    });

    // Class Distribution
    const classDistribution = calculateDistribution('class');
    if (classPieChart) classPieChart.destroy();
    const ctxClass = document.getElementById('classPieChart').getContext('2d');
    classPieChart = new Chart(ctxClass, {
      type: 'pie',
      data: {
        labels: Object.keys(classDistribution),
        datasets: [{
          data: Object.values(classDistribution),
          backgroundColor: ['#36A2EB', '#FF6384', '#9966FF'],
          borderColor: ['#36A2EB', '#FF6384', '#9966FF'],
          borderWidth: 1
        }]
      }
    });

    // Overall Results: Line Graph for Average Ratings Across All Attributes
    const attributes = [
      'seatComfort', 'departureArrivalTime', 'foodAndDrink', 'gateLocation',
      'inflightWifi', 'inflightEntertainment', 'onlineSupport', 'easeOfOnlineBooking',
      'onBoardService', 'legRoomService', 'baggageHandling', 'checkinService', 
      'cleanliness', 'onlineBoarding'
    ];

    const overallAverages = attributes.map(attribute => {
      const total = surveyData.reduce((acc, survey) => acc + parseInt(survey[attribute]), 0);
      return total / surveyData.length;
    });

    if (overallResultsChart) overallResultsChart.destroy();
    const ctxOverall = document.getElementById('overallResultsChart').getContext('2d');
    overallResultsChart = new Chart(ctxOverall, {
      type: 'line',
      data: {
        labels: attributes.map(attr => attr.replace(/([A-Z])/g, ' $1')), // Format attribute names
        datasets: [{
          label: 'Overall Average Ratings',
          data: overallAverages,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          fill: false,  // Do not fill under the line
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 5
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching survey data:', error);
  }
}

// Call this function to reload charts dynamically after submitting the form
function reloadCharts() {
  loadSurveyData(); // Reload the charts after submitting new data
}

// Form submission logic
surveyForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  
  // Form data collection logic
  const formData = {
    customerType: document.getElementById('customerType').value,
    age: document.getElementById('age').value,
    typeOfTravel: document.getElementById('typeOfTravel').value,
    class: document.getElementById('class').value,
    seatComfort: document.getElementById('seatComfort').value,
    departureArrivalTime: document.getElementById('departureArrivalTime').value,
    foodAndDrink: document.getElementById('foodAndDrink').value,
    gateLocation: document.getElementById('gateLocation').value,
    inflightWifi: document.getElementById('inflightWifi').value,
    inflightEntertainment: document.getElementById('inflightEntertainment').value,
    onlineSupport: document.getElementById('onlineSupport').value,
    easeOfOnlineBooking: document.getElementById('easeOfOnlineBooking').value,
    onBoardService: document.getElementById('onBoardService').value,
    legRoomService: document.getElementById('legRoomService').value,
    baggageHandling: document.getElementById('baggageHandling').value,
    checkinService: document.getElementById('checkinService').value,
    cleanliness: document.getElementById('cleanliness').value,
    onlineBoarding: document.getElementById('onlineBoarding').value
  };

  try {
    const response = await fetch('http://localhost:5000/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      document.getElementById('responseMessage').innerText = 'Survey submitted successfully!';
      surveyForm.reset();

      // Reload charts after form submission
      reloadCharts();

    } else {
      document.getElementById('responseMessage').innerText = 'Error submitting survey. Please try again.';
    }
  } catch (error) {
    document.getElementById('responseMessage').innerText = 'Error submitting survey. Please try again.';
  }
});

// Load all data when the page loads
loadSurveyData();
