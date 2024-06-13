document.addEventListener('DOMContentLoaded', () => {
    const localTimeEl = document.getElementById('local-time');
    const timeZoneEl = document.getElementById('time-zone');
    const dateTodayEl = document.getElementById('date-today');
    const dayTodayEl = document.getElementById('day-today');
    const eventDateEl = document.getElementById('event-date');
    const eventDayEl = document.getElementById('event-day');
    const countdownEl = document.getElementById('countdown');
    const offlineMessageEl = document.getElementById('offline-message');
    const incorrectTimeEl = document.getElementById('incorrect-time');
    const incorrectDateEl = document.getElementById('incorrect-date');
    const loadingScreenEl = document.getElementById('loading-screen');
    const mainContentEl = document.getElementById('main-content');
    const toggleModeBtn = document.getElementById('toggle-mode');

    let darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.add(darkMode ? 'dark-mode' : 'light-mode');

    function getNextValentinesDay() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const valentinesDayThisYear = new Date(currentYear, 1, 14);
        if (now > valentinesDayThisYear) {
            return new Date(currentYear + 1, 1, 14);
        }
        return valentinesDayThisYear;
    }

    let valentinesDay = getNextValentinesDay();
    let correctedTime = null;
    let lastServerCheck = 0;
    const serverCheckInterval = 5 * 60 * 1000; // Check every 5 minutes

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function updateTime() {
        let now = correctedTime ? new Date(correctedTime.getTime() + (Date.now() - lastServerCheck)) : new Date();
        const localTimeStr = now.toLocaleTimeString();
        const timeZoneStr = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const dateTodayStr = formatDate(now);
        const dayTodayStr = now.toLocaleDateString(undefined, { weekday: 'long' });

        localTimeEl.innerHTML = `<i class="fas fa-clock"></i> Local Time: ${localTimeStr}`;
        timeZoneEl.innerHTML = `<i class="fas fa-globe"></i> Time Zone: ${timeZoneStr}`;
        dateTodayEl.innerHTML = `<i class="fas fa-calendar-day"></i> Today's Date: ${dateTodayStr}`;
        dayTodayEl.innerHTML = `<i class="fas fa-calendar-week"></i> Today is: ${dayTodayStr}`;
        eventDateEl.innerHTML = `<i class="fas fa-calendar"></i> Valentine's Day Date: ${formatDate(valentinesDay)}`;
        eventDayEl.innerHTML = `<i class="fas fa-calendar-check"></i> Valentine's Day: ${valentinesDay.toLocaleDateString(undefined, { weekday: 'long' })}`;

        const timeLeft = valentinesDay - now;

        if (timeLeft >= 0) {
            const monthsLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24 * 30.44)); // Approximate month length
            const daysLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
            const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);

            countdownEl.innerHTML = `<i class="fas fa-hourglass-half"></i> Time left for Valentine's Day: ${monthsLeft}m ${daysLeft}d ${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
        }

        if (Date.now() - lastServerCheck > serverCheckInterval) {
            checkTimeWithServer();
        }
    }

    function formatTimeDifference(seconds) {
        const days = Math.floor(seconds / (24 * 60 * 60));
        seconds %= 24 * 60 * 60;
        const hours = Math.floor(seconds / (60 * 60));
        seconds %= 60 * 60;
        const minutes = Math.floor(seconds / 60);
        seconds %= 60;

        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        if (seconds > 0) result += `${seconds}s`;

        return result.trim();
    }

    function toggleMode() {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
        document.body.classList.toggle('light-mode', !darkMode);
    }

    toggleModeBtn.addEventListener('click', toggleMode);

    async function checkTimeWithServer() {
        try {
            const response = await fetch('https://worldtimeapi.org/api/ip');
            const data = await response.json();
            const serverTime = new Date(data.utc_datetime);
            const localTime = new Date();
            const timeDifference = Math.abs((serverTime - localTime) / 1000);

            offlineMessageEl.style.display = 'none';
            incorrectTimeEl.style.display = 'none';
            incorrectDateEl.style.display = 'none';

            if (timeDifference > 1) {
                const formattedTimeDifference = formatTimeDifference(Math.floor(timeDifference));
                incorrectTimeEl.style.display = 'block';
                incorrectTimeEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Time error: Your time may be incorrect by ${formattedTimeDifference}.`;
                correctedTime = serverTime;
                lastServerCheck = Date.now();
            }

            const serverDate = new Date(serverTime.toDateString());
            const localDate = new Date(localTime.toDateString());
            const dateDifference = Math.abs((serverDate - localDate) / (1000 * 60 * 60 * 24));

            if (dateDifference > 0) {
                incorrectDateEl.style.display = 'block';
                incorrectDateEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Date error: Your date may be incorrect by ${dateDifference} day(s).`;
                correctedTime = serverTime;
                lastServerCheck = Date.now();
            }
        } catch (error) {
            console.error('Error fetching server time:', error);
            handleOfflineStatus();
        } finally {
            loadingScreenEl.style.display = 'none';
            mainContentEl.style.display = 'block';
        }
    }

    function handleOfflineStatus() {
        offlineMessageEl.style.display = 'block';
        const localTime = new Date();
        const localTimeStr = localTime.toLocaleTimeString();
        const dateTodayStr = formatDate(localTime);

        if (correctedTime) {
            const serverTime = new Date(correctedTime.getTime() + (Date.now() - lastServerCheck));
            const timeDifference = Math.abs((serverTime - localTime) / 1000);
            const serverDate = new Date(serverTime.toDateString());
            const localDate = new Date(localTime.toDateString());
            const dateDifference = Math.abs((serverDate - localDate) / (1000 * 60 * 60 * 24));

            if (timeDifference <= 1 && dateDifference === 0) {
                offlineMessageEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> You are offline. Using device time and date because they are correct.`;
            } else {
                offlineMessageEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> You are offline. Using server time and date because device time and date are incorrect.`;
                correctedTime = serverTime;
            }
        } else {
            offlineMessageEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> You are offline. Unable to verify time and date.`;
        }

        localTimeEl.innerHTML = `<i class="fas fa-clock"></i> Local Time: ${localTimeStr}`;
        dateTodayEl.innerHTML = `<i class="fas fa-calendar-day"></i> Today's Date: ${dateTodayStr}`;
    }

    function handleOnlineStatus() {
        const isOnline = navigator.onLine;
        if (isOnline) {
            checkTimeWithServer();
        } else {
            handleOfflineStatus();
        }
    }

    handleOnlineStatus();

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    setInterval(updateTime, 1000);
});
