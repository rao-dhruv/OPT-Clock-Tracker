document.addEventListener("DOMContentLoaded", function() {
    const displaySection = document.getElementById("displaySection");
    const inputSection = document.getElementById("inputSection");
    const modifyDateButton = document.getElementById("modifyDateButton");
    const saveDateButton = document.getElementById("saveDate");
    const startDateInput = document.getElementById("startDate");
    const themeToggle = document.getElementById("themeToggle");

    const currentDateElement = document.getElementById("currentDate");
    const currentMonthYearElement = document.getElementById("currentMonthYear");
    const startDateTextElement = document.getElementById("startDateText");
    const startMonthYearElement = document.getElementById("startMonthYear");
    const endDateTextElement = document.getElementById("endDateText");
    const endMonthYearElement = document.getElementById("endMonthYear");

    function displayCurrentDate() {
        const today = new Date();
        currentDateElement.textContent = today.getDate();
        currentMonthYearElement.textContent = `${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`;
    }

    const isDarkTheme = localStorage.getItem("darkTheme") === "true";
  if (isDarkTheme) {
    document.body.classList.add("dark-theme");
    themeToggle.classList.add("active");
  }

    function saveStartDate() {
        const startDate = startDateInput.value;
    
        if (!startDate) {
            alert("Please select your OPT start date as mentioned in your EAD card or the Approval Notice. Thank You.");
            return;
        }

        const [year, month, day] = startDate.split('-').map(Number);
        const start = new Date(year, month - 1, day); 
    
        const end = new Date(start);
        end.setDate(end.getDate() + 90);
    
        chrome.storage.sync.set({ "startDate": start.toISOString(), "endDate": end.toISOString() }, function() {
            calculateDaysLeft();
            inputSection.style.display = "none";
            displaySection.style.display = "block";
        });
    }
        

    function calculateDaysLeft() {
        chrome.storage.sync.get(["startDate", "endDate"], function(data) {
            if (data.startDate && data.endDate) {
                const now = new Date();
                const start = new Date(new Date(data.startDate).toLocaleDateString("en-US", { timeZone: "America/New_York" }));
                const end = new Date(data.endDate);
                const timeDiff = end - now;
                const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
                displayCurrentDate();
                startDateTextElement.textContent = start.getDate();
                startMonthYearElement.textContent = `${start.toLocaleString('default', { month: 'long' })} ${start.getFullYear()}`;
                endDateTextElement.textContent = end.getDate();
                endMonthYearElement.textContent = `${end.toLocaleString('default', { month: 'long' })} ${end.getFullYear()}`;
    
                const daysLeftElement = document.getElementById("daysLeft");
                const iconContainer = document.getElementById("daysLeftContainer");
                const alertMessage = document.getElementById("alertMessage");
    
                if (daysLeft >= 0) {
                    daysLeftElement.textContent = `${daysLeft} days left`;
    
                    if (daysLeft > 60) {
                        iconContainer.style.backgroundColor = "#4CAF50";
                        alertMessage.style.display = "none";
                    } else if (daysLeft > 30 && daysLeft <= 60) {
                        iconContainer.style.backgroundColor = "#FFEB3B";
                        alertMessage.style.display = "none";
                    } else {
                        iconContainer.style.backgroundColor = "#F44336";
                        alertMessage.style.display = "block";
                        alertMessage.textContent = "Hurry up, time is running out!";
                    }
                } else {
                    daysLeftElement.textContent = "0 days left";
                    iconContainer.style.backgroundColor = "#F44336";
                    alertMessage.style.display = "block";
                    alertMessage.textContent = "The 90-day period has ended!";
                }
            }
        });
    }    

    chrome.storage.sync.get(["startDate", "endDate"], function(data) {
        if (data.startDate && data.endDate) {
            inputSection.style.display = "none";
            displaySection.style.display = "block";
            calculateDaysLeft();
        } else {
            displaySection.style.display = "none";
            inputSection.style.display = "block";
        }
    });

    themeToggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-theme");
        localStorage.setItem("darkTheme", !isDarkTheme);
        themeToggle.classList.toggle("active");
      });
    saveDateButton.addEventListener("click", saveStartDate);
    modifyDateButton.addEventListener("click", function() {
        displaySection.style.display = "none";
        inputSection.style.display = "block";
        startDateInput.value = "";
    });
});
