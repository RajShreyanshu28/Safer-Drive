
function togglePrediction() {
  fetch('/toggle_prediction', {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    if (data.is_predicting) {
      document.getElementById('start-button').textContent = 'Stop Prediction';
      checkForAlert();
    } else {
      document.getElementById('start-button').textContent = 'Start Prediction';
    }
  });
}

function checkForAlert() {
  fetch('/check_alert')
  .then(response => response.json())
  .then(data => {
    if (data.alert) {
      window.location.href = '/alert';
    } else if (data.yawning) {
      showYawningAlert();
    } else {
      setTimeout(checkForAlert, 1000);
    }
  });
}

function showYawningAlert() {
  var alertBox = document.getElementById('yawning-alert');
  alertBox.style.display = 'block';
  setTimeout(function() {
    alertBox.style.display = 'none';
    checkForAlert(); // Check for new alerts after hiding
  }, 5000); // Hide alert after 5 seconds
}

document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector("phone").addEventListener("click", sendNumber);
});

function sendNumber() {
  const inputNumber = document.getElementById('input-number').value;
  console.log('number received');
  fetch('/process_number', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ number: inputNumber })
  })
  .then(response => response.json())
  .then(data => {
      document.getElementById('response').textContent = data.message;
  })
  .catch(error => {
      console.error('Error:', error);
  });

  
}

document.addEventListener('DOMContentLoaded', (event) => {
const enterButton = document.getElementById('enter-btn');
const mainContent = document.getElementById('main-content');

enterButton.addEventListener('click', () => {
  console.log('Enter button clicked');
  mainContent.classList.add('active');
});
});

document.getElementById('popup-btn').addEventListener('click', function() {
  document.getElementById('popup').style.display = 'flex'; // Show the popup
});

function closePopup() {
  document.getElementById('popup').style.display = 'none'; // Hide the popup
}

