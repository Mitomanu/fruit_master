// Selectarea elementelor de interfață
const txtbet = document.querySelector('#bet');
const elwin = document.querySelector('#el-win');
const txtwin = document.querySelector('#win');
const elmoney = document.querySelector('#el-money');
const txtmoney = document.querySelector('#money');
const elgame = document.querySelector('#game-area');
const btnbet = document.querySelector('#btn-bet');
const btnspin = document.querySelector('#btn-spin');
const btnputmn = document.querySelector('#btn-putmoney');

// Selectarea sloturilor individuale
const slots = [
    document.querySelector('#slot-1'),
    document.querySelector('#slot-2'),
    document.querySelector('#slot-3'),
    document.querySelector('#slot-4'),
    document.querySelector('#slot-5'),
    document.querySelector('#slot-6'),
    document.querySelector('#slot-7'),
    document.querySelector('#slot-8'),
    document.querySelector('#slot-9')
];
///////////////////////////////////////////////////////////////////////
// Variabile pentru starea jocului
let money = 0;
let bet = 0;
let betstep = 0;
const betarr = [10,20,30,50,100];

// Array-ul cu simbolurile din folderul "items"
const arr = [
    'items/bell.png',
    'items/cherry.png',
    'items/clover.png',
    'items/lemon.png',
    'items/seven.png',
    'items/orange.png',
    'items/plum.png',
    'items/star.png',
    'items/strawberry.png',
    'items/watermelon.png'
];
// Funcție pentru obținerea simbolului în funcție de index
function getItem(i){
    return `<img src="${arr[i]}" class="slot-img" alt="Symbol">`;
}
///////////////////////////////////////////////////////////
// Obține referințele la coloanele din fiecare slot
const slotColumns = [];
for(let i = 0; i < 9; i++) {
    slotColumns.push(slots[i].querySelector('.column'));
}

///////////////////////////////////////////////////////////
// Încărcarea fișierelor audio - mutăm încărcarea în afara funcției startGame
const audioCash = new Audio('media/cash.mp3');
const audioClick = new Audio('media/click.mp3');
const audioSpin = new Audio('media/spin.mp3');
const audioWin = new Audio('media/win.mp3');
const audioOver = new Audio('media/over.mp3');

// Preîncărcăm sunetele pentru a fi pregătite instant
audioCash.preload = 'auto';
audioClick.preload = 'auto';
audioSpin.preload = 'auto';
audioWin.preload = 'auto';
audioOver.preload = 'auto';

// Încărcăm toate sunetele în memorie pentru a fi disponibile imediat
audioCash.load();
audioClick.load();
audioSpin.load();
audioWin.load();
audioOver.load();
//////////////////////////////////////////////////////////
// Adăugare bani în cont și inițializarea jocului
btnputmn.addEventListener('click',()=>{
    // Redăm sunetul de cash imediat când se apasă butonul
    audioCash.currentTime = 0; // Resetăm sunetul pentru a fi siguri că începe de la început
    audioCash.play();
    
    // Resetăm toate stările anterioare dacă există
    for(const slotCol of slotColumns) {
        // Eliminăm toate elementele existente din slot înainte de a inițializa
        while (slotCol.firstChild) {
            slotCol.removeChild(slotCol.firstChild);
        }
    }
    
    // Adăugăm bani și pornim jocul
    money = 1000;
    elmoney.classList.remove('col-red');
    startGame();
},false);
//////////////////////////////////////////////////////////
function startGame(){
    ///////////////////////////////////////////////////////////
    // Afișarea banilor disponibili
    function showMoney(){
        elwin.style.display = 'none';
        elmoney.style.display = '';
        txtmoney.innerHTML = money;
    }
    showMoney();
    
    // Afișarea câștigurilor
    function showWin(w){
        elmoney.style.display = 'none';
        elwin.style.display = '';
        txtwin.innerHTML = w;
        setTimeout(()=>{
            showMoney();
            enableBtns();
        }, 2000);
    }
    // Notă: Fișierele audio sunt acum încărcate în afara acestei funcții
    // Schimbarea valorii pariului
    function setBet(){
        // Resetăm sunetul pentru a fi siguri că începe de la început
        audioClick.currentTime = 0;
        audioClick.play();
        
        betstep++;
        if(betstep < betarr.length){
            bet = betarr[betstep];
        }else{
            betstep = 0;
            bet = betarr[betstep];
        }
        txtbet.innerHTML = bet;
        elmoney.classList.remove('col-red');
    }
    btnbet.addEventListener('click',setBet,false);
    //////////////////////////////////////////////////////////
    // Crearea elementelor pentru role
    function getRandomInt(){
        var max = arr.length;
        return Math.floor(Math.random()*max);
    }
    
    // Adăugarea simbolurilor în slot
    function addItems(el, n, useAllSymbols = false) {
        if (useAllSymbols) {
            // Adaugă toate simbolurile disponibile în fiecare slot
            // Și amestecă ordinea pentru a fi aleatorii
            let indices = [...Array(arr.length).keys()];
            
            // Amestecă indicii pentru a avea simboluri în ordine aleatoare
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            
            // Adaugă elemente suplimentare aleatorii pentru a ajunge la numărul dorit
            while (indices.length < n) {
                indices.push(getRandomInt());
            }
            
            // Creăm elementele cu simbolurile respective
            for (let i = 0; i < n; i++) {
                let ind = indices[i];
                let d = document.createElement('div');
                d.setAttribute('data-ind', ind);
                d.innerHTML = getItem(ind);
                el.prepend(d);
            }
        } else {
            // Metoda originală - alegere complet aleatorie
            for (let i = 0; i < n; i++) {
                let ind = getRandomInt();
                let d = document.createElement('div');
                d.setAttribute('data-ind', ind);
                d.innerHTML = getItem(ind);
                el.prepend(d);
            }
        }
    }
    // Generarea coloanelor pentru toate sloturile
    function getColumns(){
        // Adăugarea simbolurilor pentru fiecare slot
        for(let i = 0; i < slotColumns.length; i++) {
            // Adăugăm un set complet de simboluri în fiecare slot
            // plus câteva simboluri suplimentare pentru a crea un efect diferit la învârtire
            // Folosim parametrul useAllSymbols=true pentru a ne asigura că toate simbolurile sunt incluse
            addItems(slotColumns[i], arr.length + 5 + i, true);
        }
    }
    /////////////////////////////////////////////////////////
    // Adăugarea simbolurilor inițiale în fiecare slot
    function getStartItems(){
        for(const c of slotColumns){
            // Ne asigurăm că slotul este gol înainte de a adăuga elemente noi
            while (c.firstChild) {
                c.removeChild(c.firstChild);
            }
            
            // Adăugăm un element în fiecare slot pentru a fi vizibil
            // Folosim un simbol aleator pentru starea inițială
            addItems(c, 1, false);
        }
    }

    // Inițializăm sloturile doar dacă jocul este activ
    if (money > 0) {
        getStartItems();
    }
    /////////////////////////////////////////////////////////
    // Check Money
    function checkMoney(){
        if(money > 0 && money >= bet){
            return true;
        }else if(money > 0 && money < bet){
            elmoney.classList.add('col-red');
            audioOver.play();
            return false;
        }else{
            elmoney.classList.add('col-red');
            audioOver.play();
            return false;
        }
    }
    /////////////////////////////////////////////////////////
    // Disabled buttons
    function disableBtns(){
        btnbet.setAttribute('disabled','1');
        btnspin.setAttribute('disabled','1');
    }
    // Enabled buttons
    function enableBtns(){
        btnbet.removeAttribute('disabled');
        btnspin.removeAttribute('disabled');
    }
    // Funcția de învârtire a sloturilor
    function Spin(){
        var check = checkMoney();
        if(check){
            // Resetăm sunetul pentru a fi siguri că începe de la început și îl redăm
            audioSpin.currentTime = 0;
            audioSpin.play();
            
            money = money - bet;
            showMoney();
            disableBtns();
            getColumns();
            
            // Aplicarea tranziției pentru fiecare slot independent
            let completedSlots = 0;
            const totalSlots = slotColumns.length;
            
            for(let i = 0; i < slotColumns.length; i++){
                const c = slotColumns[i];
                // Durata tranziției variază pentru fiecare slot
                const transitionTime = 0.5 + (i * 0.2);
                c.style.transition = `${transitionTime}s ease-out`;
                
                // Calculăm cât de jos trebuie să deplasăm coloana
                var n = c.querySelectorAll('div').length;
                var b = (n - 1) * 160;
                c.style.bottom = `-${b}px`;
                
                // Adăugăm un ascultător pentru finalizarea tranziției
                c.ontransitionend = function() {
                    // Eliminăm ascultătorul pentru a evita apeluri multiple
                    c.ontransitionend = null;
                    
                    // Curățăm slotul după oprire
                    var ditm = c.querySelectorAll('div');
                    for(var j=0; j<ditm.length; j++){
                        if(j>=1){
                            ditm[j].remove();
                        }
                    }
                    c.style.transition = '0s';
                    c.style.bottom = '0px';
                    
                    // Numărăm câte sloturi s-au oprit
                    completedSlots++;
                    
                    // Când toate sloturile s-au oprit, verificăm câștigurile
                    if(completedSlots === totalSlots){
                        checkWin();
                    }
                };
            }
        }
    }
    btnspin.addEventListener('click',Spin,false);
    /////////////////////////////////////////////////////////
    // Verificarea câștigurilor
    function checkWin(){
        // Colectăm simbolurile vizibile din toate cele 9 sloturi
        const slotValues = [];
        for(const c of slotColumns){
            // Obținem valoarea simbolului vizibil din fiecare slot
            if(c.querySelectorAll('div')[0]) {
                var value = Number(c.querySelectorAll('div')[0].dataset.ind);
                slotValues.push(value);
            }
        }
        // Funcție pentru identificarea simbolurilor care apar de mai multe ori
        function copiesArr(arr, copies) {
            let map = new Map();
            for (let elem of arr) {
                let counter = map.get(elem);
                map.set(elem, counter ? counter + 1 : 1);
            }
            let res = [];
            for (let [elem, counter] of map.entries())
                if (counter >= copies)
                    res.push(elem+':'+counter);
            return res;
        }
        
        // Găsește toate simbolurile care apar de cel puțin 3 ori
        var matchingSymbols = copiesArr(slotValues, 3);
        
        // Funcție pentru evidențierea simbolurilor câștigătoare
        function setBG(symbolIndex){
            // Evidențiem toate sloturile cu simbolul câștigător
            for(let i = 0; i < slotColumns.length; i++){
                const c = slotColumns[i];
                var bitem = c.querySelectorAll('div')[0];
                if(bitem && bitem.dataset.ind == symbolIndex){
                    bitem.classList.add('bg');
                    
                    // Adăugăm un efect de scalare pentru a evidenția simbolurile câștigătoare
                    const img = bitem.querySelector('img');
                    if (img) {
                        img.classList.add('winning-symbol');
                    }
                }
            }
        }
        
        // Calculul câștigului
        var stopspin = false;
        var totalWin = 0;
        
        // Procesăm toate simbolurile câștigătoare
        if(matchingSymbols.length > 0){
            stopspin = true;
            
            // Tabel de multiplicatori pentru fiecare simbol în funcție de numărul de apariții
            // Formatul este: [simbolIndex][numărApariții] = multiplicator
            // Pentru 3, 4, 5, 6, 7, 8, 9 simboluri
            const payTable = {
                // Conform array-ului arr, indicii simbolurilor sunt:
                // 0: bell, 1: cherry, 2: clover, 3: lemon, 4: seven, 5: orange, 6: plum, 7: star, 8: strawberry, 9: watermelon
                
                // star (index 7)
                7: {3: 10, 4: 15, 5: 17, 6: 19, 7: 150, 8: 500, 9: 1000},
                
                // seven (index 4)
                4: {3: 8, 4: 10, 5: 15, 6: 18, 7: 100, 8: 250, 9: 500},
                
                // clover (index 2)
                2: {3: 6, 4: 8, 5: 10, 6: 25, 7: 50, 8: 125, 9: 250},
                
                // strawberry (index 8)
                8: {3: 4, 4: 6, 5: 8, 6: 10, 7: 25, 8: 100, 9: 125},
                
                // watermelon (index 9)
                9: {3: 4, 4: 6, 5: 8, 6: 10, 7: 25, 8: 100, 9: 125},
                
                // bell (index 0)
                0: {3: 3, 4: 5, 5: 7, 6: 9, 7: 20, 8: 75, 9: 100},
                
                // plum (index 6)
                6: {3: 3, 4: 4, 5: 6, 6: 8, 7: 12, 8: 50, 9: 75},
                
                // orange (index 5)
                5: {3: 2, 4: 3, 5: 4, 6: 6, 7: 10, 8: 25, 9: 50},
                
                // lemon (index 3)
                3: {3: 2, 4: 3, 5: 4, 6: 6, 7: 10, 8: 25, 9: 50},
                
                // cherry (index 1)
                1: {3: 1, 4: 2, 5: 3, 6: 4, 7: 8, 8: 12, 9: 25}
            };
            
            // Pentru fiecare simbol câștigător
            for(let winSymbol of matchingSymbols) {
                var symbolIndex = Number(winSymbol.split(':')[0]); // Indicele simbolului (0-9)
                var cnt = Number(winSymbol.split(':')[1]);         // Numărul de apariții
                
                // Evidențiem simbolul curent
                setBG(symbolIndex);
                
                // Calculul câștigului pentru acest simbol și număr de apariții
                let symbolWin = 0;
                
                if (payTable[symbolIndex] && payTable[symbolIndex][cnt]) {
                    symbolWin = payTable[symbolIndex][cnt] * bet;
                } else {
                    // Cazul implicit dacă nu găsim simbolul sau numărul de apariții în tabel
                    if(cnt == 3) symbolWin = 3 * bet;
                    if(cnt == 4) symbolWin = 5 * bet;
                    if(cnt == 5) symbolWin = 8 * bet;
                    if(cnt == 6) symbolWin = 10 * bet;
                    if(cnt == 7) symbolWin = 15 * bet;
                    if(cnt == 8) symbolWin = 20 * bet;
                    if(cnt == 9) symbolWin = 50 * bet;
                }
                
                // Adăugăm câștigul pentru acest simbol la totalul general
                totalWin += symbolWin;
            }
        }
        // Afișarea câștigului și actualizarea banilor
        if(stopspin){
            // Resetăm sunetul pentru a fi siguri că începe de la început
            audioWin.currentTime = 0;
            audioWin.play();
            
            showWin(totalWin);
            money = money + totalWin;
        }else{
            enableBtns();
        }
    }
    // Final funcție checkWin
}

// Funcționalitate pentru butonul de fullscreen
const fullscreenButton = document.getElementById('fullscreen-button');
const fullscreenIcon = document.getElementById('fullscreen-icon');

// Funcție pentru a verifica dacă browser-ul este în modul fullscreen
function isFullScreen() {
    return !!(document.fullscreenElement || document.mozFullScreenElement || 
             document.webkitFullscreenElement || document.msFullscreenElement);
}

// Funcție pentru a intra în modul fullscreen
function enterFullScreen() {
    const docElement = document.documentElement;
    if (docElement.requestFullscreen) {
        docElement.requestFullscreen();
    } else if (docElement.mozRequestFullScreen) { // Firefox
        docElement.mozRequestFullScreen();
    } else if (docElement.webkitRequestFullscreen) { // Chrome, Safari și Opera
        docElement.webkitRequestFullscreen();
    } else if (docElement.msRequestFullscreen) { // IE/Edge
        docElement.msRequestFullscreen();
    }
}

// Funcție pentru a ieși din modul fullscreen
function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari și Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}

// Funcție pentru a schimba imaginea în funcție de starea de fullscreen
function updateFullscreenIcon() {
    if (isFullScreen()) {
        fullscreenIcon.src = 'buttons/exit_fullscreen.png';
        fullscreenIcon.alt = 'Ieșire din fullscreen';
    } else {
        fullscreenIcon.src = 'buttons/fullscreen.png';
        fullscreenIcon.alt = 'Fullscreen';
    }
}

// Event listener pentru click pe butonul de fullscreen
fullscreenButton.addEventListener('click', () => {
    if (isFullScreen()) {
        exitFullScreen();
    } else {
        enterFullScreen();
    }
});

// Event listeners pentru schimbările de stare fullscreen
document.addEventListener('fullscreenchange', updateFullscreenIcon);
document.addEventListener('mozfullscreenchange', updateFullscreenIcon);
document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
document.addEventListener('MSFullscreenChange', updateFullscreenIcon);