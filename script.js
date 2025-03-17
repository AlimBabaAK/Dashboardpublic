const city = "Flawil";
const country = "Switzerland";
const postalCode = "9230"; // Postleitzahl für genauere Gebetszeiten

// 🕰️ Echtzeit-Uhr
function updateTime() {
    let now = new Date();
    document.getElementById('date').innerText = now.toLocaleDateString("de-DE");
    document.getElementById('time').innerText = now.toLocaleTimeString("de-DE");
}
setInterval(updateTime, 1000);
updateTime();

// 📅 Standarddatum auf heute setzen
let today = new Date();
let year = today.getFullYear();
let month = String(today.getMonth() + 1).padStart(2, '0'); // Monat ist 0-basiert
let day = String(today.getDate()).padStart(2, '0');
let todayFormatted = `${year}-${month}-${day}`;
document.getElementById('date-picker').value = todayFormatted;

// 🕌 Gebetszeiten abrufen
async function getPrayerTimes(date = "") {
    let apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&postalcode=${postalCode}&method=2`; //method 2
    if (date) {
        let [year, month, day] = date.split("-");
        apiUrl += `&day=${day}&month=${month}&year=${year}`;
    }

    try {
        let response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Fehler beim Abrufen der Gebetszeiten: " + response.statusText);
        }
        let data = await response.json();
        let timings = data.data.timings;

        // Gebetszeiten anzeigen
        document.getElementById('fajr').innerText = timings.Fajr;
        document.getElementById('dhuhr').innerText = timings.Dhuhr;
        document.getElementById('asr').innerText = timings.Asr;
        document.getElementById('maghrib').innerText = timings.Maghrib;
        document.getElementById('isha').innerText = timings.Isha;

        // Gebetszeiten markieren und Zeit bis zum nächsten Gebet anzeigen
        highlightCurrentPrayerTime(timings);
        timeUntilNextPrayer(timings);
        timeUntilMaghrib(timings)
    } catch (error) {
        console.error("Fehler beim Abrufen der Gebetszeiten:", error);
        alert("Fehler beim Abrufen der Gebetszeiten. Bitte überprüfe deine Internetverbindung.");
    }
}

// 📅 Datumsauswahl für Gebetszeiten
document.getElementById("date-picker").addEventListener("change", (event) => {
    let selectedDate = event.target.value;
    getPrayerTimes(selectedDate); // Gebetszeiten für das ausgewählte Datum abrufen
});

// 🔍 Aktuelle Gebetszeit markieren
function highlightCurrentPrayerTime(timings) {
    let now = new Date();
    let selectedDate = document.getElementById('date-picker').value;
    let selectedDateString = new Date(selectedDate);
    let todayDate = new Date();

    // check if selected date is not today
    if (selectedDateString.getDate() != todayDate.getDate() || selectedDateString.getMonth() != todayDate.getMonth() || selectedDateString.getFullYear() != todayDate.getFullYear()){
        let prayerTimes = {
            Fajr: timings.Fajr,
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha
        };
        for (let prayer in prayerTimes) {
            document.getElementById(prayer.toLowerCase()).style.color = "white"; // Standardfarbe
        }
        return
    }


    let currentTime = now.getHours() * 60 + now.getMinutes(); // Aktuelle Zeit in Minuten

    let prayerTimes = {
        Fajr: timings.Fajr,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha
    };

    for (let prayer in prayerTimes) {
        let [hours, minutes] = prayerTimes[prayer].split(':');
        let prayerTime = parseInt(hours) * 60 + parseInt(minutes); // Gebetszeit in Minuten

        if (currentTime >= prayerTime && currentTime < prayerTime + 10) { // 10 Minuten Toleranz
            document.getElementById(prayer.toLowerCase()).style.color = "yellow"; // Markierung
        } else {
            document.getElementById(prayer.toLowerCase()).style.color = "white"; // Standardfarbe
        }
    }
}

// ⏳ Zeit bis zum nächsten Gebet anzeigen und automatisch aktualisieren
function timeUntilNextPrayer(timings) {
    let now = new Date();
    let selectedDate = document.getElementById('date-picker').value;
    let selectedDateString = new Date(selectedDate);
    let todayDate = new Date();
    if (selectedDateString.getDate() != todayDate.getDate() || selectedDateString.getMonth() != todayDate.getMonth() || selectedDateString.getFullYear() != todayDate.getFullYear()){
        document.getElementById('next-prayer').innerText = "";
        setTimeout(() => {
            timeUntilNextPrayer(timings);
        }, 60000); 
        return
    }

    let currentTime = now.getHours() * 60 + now.getMinutes(); // Aktuelle Zeit in Minuten

    let prayerTimes = {
        Fajr: timings.Fajr,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha
    };

    let nextPrayer = null;
    let minDiff = Infinity;

    for (let prayer in prayerTimes) {
        let [hours, minutes] = prayerTimes[prayer].split(':');
        let prayerTime = parseInt(hours) * 60 + parseInt(minutes); // Gebetszeit in Minuten

        if (prayerTime > currentTime && (prayerTime - currentTime) < minDiff) {
            minDiff = prayerTime - currentTime;
            nextPrayer = prayer;
        }
    }

    if (nextPrayer) {
        let hours = Math.floor(minDiff / 60);
        let minutes = minDiff % 60;
        document.getElementById('next-prayer').innerText = `Nächstes Gebet (${nextPrayer}) in ${hours}h ${minutes}m`;
    } else {
        document.getElementById('next-prayer').innerText = "Alle Gebete für heute sind vorbei.";
    }

    // Automatisch alle 60 Sekunden aktualisieren
    setTimeout(() => {
        timeUntilNextPrayer(timings);
    }, 60000); // 60.000 Millisekunden = 1 Minute
}

// ⏳ Zeit bis zum Maghrib-Gebet anzeigen
function timeUntilMaghrib(timings) {
    let now = new Date();
    let selectedDate = document.getElementById('date-picker').value;
    let selectedDateString = new Date(selectedDate);
    let todayDate = new Date();
    if (selectedDateString.getDate() != todayDate.getDate() || selectedDateString.getMonth() != todayDate.getMonth() || selectedDateString.getFullYear() != todayDate.getFullYear()){
        document.getElementById('time-to-maghrib').innerText = "";
        return
    }
    let currentTime = now.getHours() * 60 + now.getMinutes();
    let [hours, minutes] = timings.Maghrib.split(':');
    let maghribTime = parseInt(hours) * 60 + parseInt(minutes);
    let diff = maghribTime - currentTime;

    if (diff > 0) {
        let hours = Math.floor(diff / 60);
        let minutes = diff % 60;
        document.getElementById('time-to-maghrib').innerText = `Zeit bis Maghrib: ${hours}h ${minutes}m`;
    } else {
        document.getElementById('time-to-maghrib').innerText = "Maghrib ist vorbei.";
    }

    // Automatisch alle 60 Sekunden aktualisieren
    setTimeout(() => {
        timeUntilMaghrib(timings);
    }, 60000);
}

// 📖 Wechselnde Quranverse (alle 30s)
async function getQuranVerse() {
    try {
        let verses = [
            "Und gedenke deines Herrn in deinem Herzen in Demut und Furcht und ohne laute Worte, am Morgen und am Abend, und sei nicht einer der Unachtsamen. (7:205)",
            "Wahrlich, mit der Schwierigkeit kommt die Erleichterung. (94:5)",
            "Und Wir haben den Quran ja leicht zum Dhikr gemacht. Aber gibt es jemanden, der bedenkt? (54:17)"
        ];

        let randomVerse = verses[Math.floor(Math.random() * verses.length)];
        document.getElementById('quran-text').innerText = randomVerse;
    } catch (error) {
        console.error("Fehler beim Abrufen des Quranverses:", error);
    }
}
getQuranVerse();
setInterval(getQuranVerse, 30000);

// 📜 Hadith abrufen (lokal)
function getHadith() {
    let hadiths = [
        "Der Prophet (ﷺ) sagte: 'Die besten unter euch sind diejenigen, die den besten Charakter haben.' (Bukhari)",
        "Der Prophet (ﷺ) sagte: 'Wer an Allah und den Jüngsten Tag glaubt, soll Gutes sprechen oder schweigen.' (Bukhari)",
        "Der Prophet (ﷺ) sagte: 'Allah ist gütig und liebt die Güte in allen Dingen.' (Bukhari)"
    ];

    let randomHadith = hadiths[Math.floor(Math.random() * hadiths.length)];
    document.getElementById('hadith-text').innerText = randomHadith;
}
getHadith();

// Initiale Gebetszeiten laden
getPrayerTimes(todayFormatted);
