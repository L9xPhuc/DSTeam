const sheetId = '1KAxcw2K-_PIKqPa6FPrD6a9sQ65VqAX0t9QSGCaGizQ';
const gameDataRange = 'GameData!A:Z';  // Phạm vi dữ liệu game
const updateDataRange = 'UpdateData!A:Z';  // Phạm vi dữ liệu bản cập nhật
const apiKey = 'AIzaSyAq7sEvz245Qdp-ED_H64nniECdJV7sNFg';

let allGames = [];
let specialGames = [];
let filteredGames = [];
let showSpecialOnly = false;
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchData();  // Fetch data when the page loads
});

function fetchData() {
    // Fetch game data
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${gameDataRange}?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            allGames = [];
            specialGames = [];
            rows.forEach((row, index) => {
                if (index === 0) return;  // Bỏ qua hàng tiêu đề
                let game = {
                    title: row[0],
                    image: row[1],
                    minRequirements: row[2],
                    recRequirements: row[3],
                    version: row[4],
                    notes: row[5],
                    vietnamese: row[6] && row[6].toLowerCase() === 'có',
                    updateNote: row[7],
                    vietnameseLink: row[8],
                    updateFlag: row[9] && row[9].toLowerCase() === 'có' ? 'UpdateData' : null,
                    links: [row[10], row[11], row[12], row[13], row[14]]
                };
                allGames.push(game);
                if (game.vietnamese) {
                    specialGames.push(game);
                }
            });
            filterGames();
        })
        .catch(error => console.error('Error fetching game data: ', error));
}

function fetchUpdates(game) {
    if (game.updateFlag) {
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${updateDataRange}?key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const rows = data.values;
                game.updates = [];
                rows.forEach((row, index) => {
                    if (index === 0) return;  // Bỏ qua hàng tiêu đề
                    if (row[0] === game.title) {  // So sánh tên game để lấy đúng bản cập nhật
                        game.updates.push({
                            title: row[1],
                            link: row[2] || ''
                        });
                    }
                });
                showPopup(game);
            })
            .catch(error => console.error('Error fetching update data: ', error));
    } else {
        showPopup(game);  // Nếu không có thông tin bản cập nhật
    }
}

function showPopup(game) {
    document.getElementById('popup-title').textContent = game.title;
    document.getElementById('popup-image').src = game.image;
    document.getElementById('popup-minRequirements').innerHTML = formatTextWithNewLines(game.minRequirements);
    document.getElementById('popup-recRequirements').innerHTML = formatTextWithNewLines(game.recRequirements);
    document.getElementById('popup-version').textContent = game.version;
    document.getElementById('popup-notes').innerHTML = formatTextWithNewLines(game.notes);
    document.getElementById('popup-updateNote').innerHTML = formatTextWithNewLines(game.updateNote);

    const popupLinks = document.getElementById('popup-links');
    popupLinks.innerHTML = '';  // Clear existing content
    if (game.vietnameseLink) {
        popupLinks.innerHTML += `<p>Việt hóa: <a href="${game.vietnameseLink}" target="_blank">Tải về</a></p>`;
    }
    game.links.forEach((link, index) => {
        if (link) {
            let linkLabel = index === 0 ? "Part 1" : `Part ${index + 1}`; // Phần thứ tự bắt đầu từ 1
            popupLinks.innerHTML += `<p>${linkLabel}: <a href="${link}" target="_blank">Tải về</a></p>`;
        }
    });

    // Hiển thị các bản cập nhật
    const popupUpdates = document.getElementById('popup-updates');
    popupUpdates.innerHTML = ''; // Clear existing content
    if (game.updates && game.updates.length > 0) {
        popupUpdates.innerHTML = '<h3>Các bản cập nhật:</h3>';
        game.updates.forEach(update => {
            popupUpdates.innerHTML += `<p>${update.title}: <a href="${update.link}" target="_blank">Tải về</a></p>`;
        });
    } else {
        popupUpdates.innerHTML = '<p>Không có bản cập nhật.</p>';
    }

    document.getElementById('popup').style.display = 'flex';
}

function formatTextWithNewLines(text) {
    return text ? text.replace(/\n/g, '<br/>') : '';
}

function filterGames() {
    filteredGames = allGames.filter(game => {
        let matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesSpecial = !showSpecialOnly || game.vietnamese;
        return matchesSearch && matchesSpecial;
    });
    displayGames();
}

function displayGames() {
    const gameList = document.getElementById('game-list');
    gameList.innerHTML = '';
    filteredGames.forEach(game => {
        let html = `<div class="game-item" onclick='fetchUpdates(${JSON.stringify(game).replace(/'/g, "\\'").replace(/"/g, "&quot;")})'>
                        <h2>${game.title}</h2>
                        <img src="${game.image}" alt="${game.title}" class="game-image"/>
                    </div>`;
        gameList.innerHTML += html;
    });
}

document.getElementById('toggle-special').addEventListener('change', (event) => {
    showSpecialOnly = event.target.checked;
    filterGames();
});

document.getElementById('search-button').addEventListener('click', () => {
    searchQuery = document.getElementById('search-box').value;
    filterGames();
});

document.getElementById('search-box').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        searchQuery = event.target.value;
        filterGames();
    }
});

function closePopup(event) {
    if (event.target.id === 'popup' || event.target.id === 'close-popup') {
        document.getElementById('popup').style.display = 'none';
    }
}

// Hiển thị popup lưu ý và overlay khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('note-popup').classList.add('show');
    document.getElementById('overlay').classList.add('show');
    document.body.classList.add('no-scroll');
});

// Đóng popup lưu ý và overlay khi nhấn nút đóng
document.getElementById('close-note').addEventListener('click', () => {
    document.getElementById('note-popup').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
    document.body.classList.remove('no-scroll');
});
