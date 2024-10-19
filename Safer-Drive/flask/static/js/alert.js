document.addEventListener('DOMContentLoaded', (event) => {
    var audio = document.getElementById('alert-sound');
    audio.play();
    audio.loop = true;
    
    let lat = 0;
    let longi = 0;
    let showDetails = document.querySelector(".showDetails");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log(position);
                const { latitude, longitude } = position.coords;
                lat = latitude;
                longi = longitude;

                showDetails.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
            },
            (error) => {
                showDetails.textContent = error.message;
            }
        );
    }

    function startTimer(audio) {
        var timeLeft = 30;
        var countdownElement = document.querySelector(".countdown");
        countdownElement.textContent = `Time left: ${timeLeft} seconds`;

        var timerInterval = setInterval(function() {
            timeLeft--;
            countdownElement.textContent = `Time left: ${timeLeft} seconds`;

            if (timeLeft <= 0) {
                audio.pause();
                clearInterval(timerInterval);
                fetch('/alert_timeout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ latitude: lat, longitude: longi })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(`${lat} & ${longi}`, data.message);
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
            }
        }, 1000);
    }

    // Call the startTimer function to start the timer
    startTimer(audio);
});

function redirectToHome() {
    fetch('/toggle_prediction', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (!data.is_predicting) {
            window.location.href = '/';
        }
    });
}
