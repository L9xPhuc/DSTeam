const sheetId = '1fYEr6uG1YSi3zNnfacF5pguLjQ1KNiRbTXuFACKgN_o';
const apiKey = 'AIzaSyAq7sEvz245Qdp-ED_H64nniECdJV7sNFg';
const range = 'Sheet1!A:Z';  // Điều chỉnh phạm vi tùy theo file của bạn

let allGames = [];
let specialGames = [];
let filteredGames = [];
let showSpecialOnly = false;
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchData();  // Fetch data when the page loads
});

function fetchData() {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`)
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
                    links: [row[8], row[9], row[10], row[11], row[12]],
                };
                allGames.push(game);
                if (game.vietnamese) {
                    specialGames.push(game);
                }
            });
            filterGames();
        })
        .catch(error => console.error('Error fetching data: ', error));
}

function displayGames() {
    const gameList = document.getElementById('game-list');
    gameList.innerHTML = '';
    filteredGames.forEach(game => {
        let html = `<div class="game-item" onclick='showPopup(${JSON.stringify(game).replace(/'/g, "\\'").replace(/"/g, "&quot;")})'>
                        <h2>${game.title}</h2>
                        <img src="${game.image}" alt="${game.title}" class="game-image"/>
                    </div>`;
        gameList.innerHTML += html;
    });
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
    // const linkLabel = ['Việt hóa','Part 1','Part 2','Part 3','Part 4'];
    game.links.forEach((link, index) => {
        if (link) {
            let linkLabel = index === 0 ? "Việt hóa" : `Part ${index + 0}`; // Phần thứ tự bắt đầu từ 1
            popupLinks.innerHTML += `<p>${linkLabel}: <a href="${link}" target="_blank">Tải về</a></p>`;
        }
    });

    document.getElementById('popup').style.display = 'flex';
}

document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('popup').style.display = 'none'; // Sửa lỗi tên phần tử
});

function closePopup(event) {
    if (event.target.id === 'popup' || event.target.id === 'close-popup') {
        document.getElementById('popup').style.display = 'none';
    }
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
