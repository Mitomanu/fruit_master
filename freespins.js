// Modul pentru gestionarea rotirilor gratuite (free spins)
window.FreeSpins = (function() {
    // Variabile private ale modulului
    let isActive = false;
    let freeSpinsContainer = null;
    let messageElement = null;
    let savedSymbols = []; // Aici vom salva simbolurile
    let bonusSound = null; // Variabilă pentru sunetul de bonus
    let freeSpinsCount = 0; // Numărul de rotiri gratuite disponibile
    let freeSpinsCounterElement = null; // Elementul care afișează numărul de rotiri
    
    // Inițializarea containerului pentru mesaje și contorul de rotiri
    function initMessageContainer() {
        // Verificăm dacă containerul există deja
        if (document.getElementById('free-spins-message')) {
            return;
        }
        
        // Cream containerul pentru mesajele de free spins
        freeSpinsContainer = document.createElement('div');
        freeSpinsContainer.id = 'free-spins-container';
        
        // Cream elementul pentru mesaj
        messageElement = document.createElement('div');
        messageElement.id = 'free-spins-message';
        messageElement.style.display = 'none';
        
        // Adăugăm elementul în container și apoi în DOM
        freeSpinsContainer.appendChild(messageElement);
        document.getElementById('game-area').prepend(freeSpinsContainer);
        
        // Inițializăm/creăm elementul pentru contorul de rotiri gratuite
        freeSpinsCounterElement = document.getElementById('free-spins-counter');
        
        // Dacă elementul nu există în DOM, îl creăm
        if (!freeSpinsCounterElement) {
            console.log('Crearea elementului pentru contorul de rotiri gratuite');
            freeSpinsCounterElement = document.createElement('div');
            freeSpinsCounterElement.id = 'free-spins-counter';
            freeSpinsCounterElement.style.display = 'none';
            freeSpinsCounterElement.style.position = 'absolute';
            freeSpinsCounterElement.style.transform = 'translateX(-50%)';
            freeSpinsCounterElement.style.backgroundColor = '#ff5722';
            freeSpinsCounterElement.style.color = 'white';
            freeSpinsCounterElement.style.padding = '10px 20px';
            freeSpinsCounterElement.style.borderRadius = '5px';
            freeSpinsCounterElement.style.fontWeight = 'bold';
            freeSpinsCounterElement.style.fontSize = '24px';
            freeSpinsCounterElement.style.zIndex = '1000';
            document.getElementById('game-area').parentNode.insertBefore(freeSpinsCounterElement, document.getElementById('game-area'));
        }
    }
    
    // Funcție pentru afișarea mesajului de free spins
    function showMessage(text, duration) {
        // Ne asigurăm că containerul este inițializat
        if (!freeSpinsContainer) {
            initMessageContainer();
        }
        
        // Setăm mesajul și îl afișăm
        messageElement.textContent = text;
        messageElement.style.display = 'block';
        
        // Ascundem mesajul după durata specificată
        setTimeout(() => {
            messageElement.style.display = 'none';
            
            // Dacă există butoane dezactivate, le reactivăm
            if (typeof startGame !== 'undefined' && 
                typeof startGame.enableBtns === 'function') {
                startGame.enableBtns();
            }
        }, duration);
    }
    
    // Funcție pentru salvarea simbolurilor de pe role
    function saveSlotSymbols() {
        savedSymbols = [];
        // Găsim toate mini-sloturile (rolele)
        const slots = document.querySelectorAll('.mini-slot');
        
        // Pentru fiecare mini-slot, salvăm conținutul div.column
        slots.forEach(slot => {
            const column = slot.querySelector('.column');
            if (column) {
                // Salvăm conținutul HTML al coloanei
                savedSymbols.push({
                    slotId: slot.id,
                    content: column.innerHTML
                });
            }
        });
        
        console.log('Simboluri salvate:', savedSymbols.length);
    }
    
    // Funcție pentru golirea rolelor (eliminarea simbolurilor)
    function clearSlotSymbols() {
        const slots = document.querySelectorAll('.mini-slot .column');
        slots.forEach(column => {
            column.innerHTML = ''; // Golim conținutul
        });
        console.log('Rolele au fost golite');
    }
    
    // Funcție pentru restaurarea simbolurilor pe role
    function restoreSlotSymbols() {
        savedSymbols.forEach(item => {
            const slot = document.getElementById(item.slotId);
            if (slot) {
                const column = slot.querySelector('.column');
                if (column) {
                    column.innerHTML = item.content;
                }
            }
        });
        console.log('Simbolurile au fost restaurate');
    }
    
    // Funcție pentru generarea și afișarea simbolurilor aleatorii pe role
    function showRandomSymbols() {
        console.log('Generarea și afișarea simbolurilor aleatorii pe rolele roșii');
        
        // Definim toate simbolurile posibile comune
        const commonSymbols = [
            'cherry_img/seven.png',
            'cherry_img/star_scatter.png',
            '' // spațiu gol
        ];
        
        // Găsim toate mini-sloturile (rolele) - avem 9 role (3x3)
        const slots = document.querySelectorAll('.mini-slot');
        
        // Pentru fiecare rolă, generăm un simbol aleatoriu
        slots.forEach((slot, index) => {
            // Determinăm numărul rolei (1-9)
            const slotNumber = index + 1;
            
            // Determinăm dacă această rolă poate avea o cireașă specifică
            const specificCherryImg = `cherry_img/cireasa_${slotNumber}.png`;
            
            // Creăm array-ul de posibilități pentru această rolă
            // Includem și cireașa specifică pentru această poziție
            const possibleSymbols = [...commonSymbols, specificCherryImg];
            
            // Alegem aleatoriu un simbol din array
            const randomIndex = Math.floor(Math.random() * possibleSymbols.length);
            const chosenSymbol = possibleSymbols[randomIndex];
            
            // Găsim elementul column pentru această rolă
            const column = slot.querySelector('.column');
            if (column) {
                if (chosenSymbol === '') {
                    // Spațiu gol - nu afișăm nimic
                    column.innerHTML = '';
                } else {
                    // Afișăm imaginea aleasă cu dimensiuni potrivite pentru rolele de 160px înălțime
                    column.innerHTML = `<div class="symbol" style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                        <img src="${chosenSymbol}" alt="Symbol" style="width: 98%; height: 98%; object-fit: contain;">
                    </div>`;
                }
            }
        });
    }
    
    // Funcție pentru actualizarea afișării contorului de rotiri gratuite
    function updateFreeSpinsCounter() {
        if (freeSpinsCounterElement) {
            freeSpinsCounterElement.textContent = `ROTIRI BONUS: ${freeSpinsCount}`;
            
            // Afișăm sau ascundem contorul în funcție de numărul de rotiri
            if (freeSpinsCount > 0) {
                freeSpinsCounterElement.style.display = 'block';
            } else {
                freeSpinsCounterElement.style.display = 'none';
            }
        }
    }
    
    // Funcție pentru verificarea câștigurilor în timpul rotirii gratuite
    function checkBonusWin() {
        // Colectăm simbolurile vizibile din toate cele 9 sloturi
        const slotValues = [];
        const slotColumns = document.querySelectorAll('.mini-slot .column');
        let emptySpacesCount = 0;
        
        for(const c of slotColumns){
            // Obținem valoarea simbolului vizibil din fiecare slot
            if(c.querySelectorAll('div')[0]) {
                var value = Number(c.querySelectorAll('div')[0].dataset.ind);
                slotValues.push(value);
            } else {
                // Dacă nu există div (spațiu gol), marcăm cu -1
                slotValues.push(-1);
                emptySpacesCount++;
            }
        }
        
        console.log('Verificare câștiguri bonus, simboluri:', slotValues);
        console.log('Număr spații goale detectate:', emptySpacesCount);
        
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
        
        // Verificăm numărul de simboluri scatter (star_scatter, index 7)
        const scatterCount = slotValues.filter(v => v === 7).length;
        
        // Dacă sunt cel puțin 3 simboluri scatter, acordăm o rotire suplimentară
        if (scatterCount >= 3) {
            console.log('Rotire bonus suplimentară acordată pentru', scatterCount, 'simboluri scatter');
            freeSpinsCount += 1;
            updateFreeSpinsCounter();
            
            // Afișăm un mesaj temporar pentru rotirea suplimentară
            if (messageElement) {
                messageElement.textContent = '+1 ROTIRE BONUS!';
                messageElement.style.display = 'block';
                messageElement.style.color = '#ffff00';
                messageElement.style.fontSize = '20px';
                messageElement.style.fontWeight = 'bold';
                
                // Ascundem mesajul după 1.5 secunde
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 1500);
            }
            
            // Afișăm un mesaj special pentru rotirea suplimentară
            if(window.WinMessage && typeof window.WinMessage.queue === 'function') {
                window.WinMessage.queue(7, scatterCount, 0, null, 'ROT. SUPLIMENTARĂ!');
            }
            
            // Redăm un sunet special pentru rotirea suplimentară
            const extraSpinSound = new Audio('media/extra_spin.mp3');
            extraSpinSound.volume = 0.8;
            extraSpinSound.play().catch(error => {
                console.log('Eroare la redarea sunetului pentru rotirea suplimentară:', error);
            });
        }
        
        // Funcție pentru evidențierea simbolurilor câștigătoare
        function setBG(symbolIndex) {
            // Evidențiem toate sloturile cu simbolul câștigător
            const slotColumns = document.querySelectorAll('.mini-slot .column');
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
        var totalWin = 0;
        
        // Verificăm mai întâi cazul special: 9 spații goale
        if(emptySpacesCount === 9) {
            console.log('CAZUL SPECIAL: 9 spații goale detectate! Premiu special: 100x miza');
            
            // Obținem valoarea pariului din elementul HTML
            let bet = 20; // Valoare implicită
            const betElement = document.getElementById('bet');
            if (betElement) {
                bet = Number(betElement.textContent);
            }
            
            // Acordăm premiul special: 100 x miza
            totalWin = 100 * bet;
            
            // Afișăm un mesaj special pentru această situație
            if(window.WinMessage && typeof window.WinMessage.queue === 'function') {
                const itemsArray = [
                    'items/bell.png',
                    'items/cherry.png',
                    'items/clover.png',
                    'items/lemon.png',
                    'items/seven.png',
                    'items/orange.png',
                    'items/plum.png',
                    'items/star_scatter.png',
                    'items/strawberry.png',
                    'items/watermelon.png'
                ];
                // Folosim un mesaj special pentru 9 spații goale
                window.WinMessage.queue(-1, 9, totalWin, itemsArray, 'PREMIU SPECIAL!');
            }
        }
        // Procesăm toate simbolurile câștigătoare, doar dacă nu avem 9 spații goale
        else if(matchingSymbols.length > 0){
            // Tabel de multiplicatori pentru fiecare simbol în funcție de numărul de apariții
            // În rotirile gratuite, avem doar 3 tipuri de simboluri plus spații goale
            const bonusPayTable = {
                // Scatter - nu plătește nimic, doar acordă rotiri suplimentare
                7: {3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},  // star_scatter
                
                // Seven - triplu față de jocul de bază
                // Joc de bază: 3: 4, 4: 6, 5: 8, 6: 9, 7: 50, 8: 75, 9: 250
                4: {3: 12, 4: 18, 5: 24, 6: 27, 7: 150, 8: 225, 9: 750},    // seven
                
                // Cireșe - valori speciale pentru JACKPOT
                1: {2: 10, 3: 20, 4: 50, 5: 100, 6: 250, 7: 500, 8: 1000, 9: 100000},  // cherry (JACKPOT la 9 simboluri)
                
                // Spații goale - câștig special
                '-1': {9: 100}  // 9 spații goale aduc un premiu de 100x miza
            };
            
            // Obținem valoarea pariului din elementul HTML
            let bet = 20; // Valoare implicită
            const betElement = document.getElementById('bet');
            if (betElement) {
                bet = Number(betElement.textContent);
            }
            
            // Pentru fiecare simbol câștigător
            for(let winSymbol of matchingSymbols) {
                var symbolIndex = Number(winSymbol.split(':')[0]); // Indicele simbolului (0-9)
                var cnt = Number(winSymbol.split(':')[1]);         // Numărul de apariții
                
                // Evidențiem simbolul curent
                setBG(symbolIndex);
                
                // Calculul câștigului pentru acest simbol și număr de apariții
                let symbolWin = 0;
                
                if (bonusPayTable[symbolIndex] && bonusPayTable[symbolIndex][cnt]) {
                    symbolWin = bonusPayTable[symbolIndex][cnt] * bet;
                } else {
                    // Cazul implicit dacă nu găsim simbolul sau numărul de apariții în tabel
                    if(cnt == 3) symbolWin = 6 * bet;  // Dublare față de jocul normal
                    if(cnt == 4) symbolWin = 10 * bet;
                    if(cnt == 5) symbolWin = 16 * bet;
                    if(cnt == 6) symbolWin = 20 * bet;
                    if(cnt == 7) symbolWin = 30 * bet;
                    if(cnt == 8) symbolWin = 40 * bet;
                    if(cnt == 9) symbolWin = 100 * bet;
                }
                
                // Adăugăm câștigul pentru acest simbol la totalul general
                totalWin += symbolWin;
                
                // Adăugăm mesajul în coada de afișare, dacă modulul este disponibil
                if(window.WinMessage && typeof window.WinMessage.queue === 'function') {
                    const itemsArray = [
                        'items/bell.png',
                        'items/cherry.png',
                        'items/clover.png',
                        'items/lemon.png',
                        'items/seven.png',
                        'items/orange.png',
                        'items/plum.png',
                        'items/star_scatter.png',
                        'items/strawberry.png',
                        'items/watermelon.png'
                    ];
                    window.WinMessage.queue(symbolIndex, cnt, symbolWin, itemsArray);
                }
            }
        }
        
        // Afișarea câștigului și actualizarea banilor
        if(totalWin > 0){
            // Redăm sunetul de câștig
            const audioWin = new Audio('media/win.mp3');
            audioWin.play();
            
            // Afișăm câștigul și actualizăm banii
            const txtwin = document.getElementById('win');
            const elwin = document.getElementById('el-win');
            const txtmoney = document.getElementById('money');
            
            if (txtwin) txtwin.textContent = totalWin;
            if (elwin) elwin.style.display = 'inline';
            
            // Actualizăm valoarea banilor
            if (txtmoney) {
                const currentMoney = Number(txtmoney.textContent);
                txtmoney.textContent = currentMoney + totalWin;
            }
        }
        
        return slotValues;
    }
    
    // Actualizăm tabloul de plată pentru bonusul de rotiri gratuite
    function updateBonusPayTable() {
        // Aici putem modifica tabloul de plată pentru simbolurile din jocul bonus
        // Acest lucru permite un control mai bun asupra bonusurilor câștigate
    }
    
    // Funcție pentru generarea valorilor de simboluri pentru toate cele 9 sloturi din jocul bonus
    // Această funcție asigură că fiecare poziție primește doar simbolurile permise pentru ea
    function generateBonusSlotValues() {
        console.log('Generarea valorilor pentru sloturile din jocul bonus');
        
        // Rezultatele vor fi stocate aici - un array de 9 valori (3x3 grid)
        const rezultate = [];
        
        // Parcurgem toate cele 9 poziții (3x3 grid)
        for(let i = 0; i < 9; i++) {
            // Determinăm poziția (coloană și rând) pentru acest slot
            const colIndex = i % 3;  // 0, 1, sau 2 (coloană)
            const rowIndex = Math.floor(i / 3);  // 0, 1, sau 2 (rând)
            
            // Determinăm ce simbol cherry poate apărea în această poziție specifică
            let cherryForThisPosition = null;
            if (colIndex === 0 && rowIndex === 0) cherryForThisPosition = 8;  // Cherry_1
            else if (colIndex === 1 && rowIndex === 0) cherryForThisPosition = 9;  // Cherry_2
            else if (colIndex === 2 && rowIndex === 0) cherryForThisPosition = 10; // Cherry_3
            else if (colIndex === 0 && rowIndex === 1) cherryForThisPosition = 11; // Cherry_4
            else if (colIndex === 1 && rowIndex === 1) cherryForThisPosition = 12; // Cherry_5
            else if (colIndex === 2 && rowIndex === 1) cherryForThisPosition = 13; // Cherry_6
            else if (colIndex === 0 && rowIndex === 2) cherryForThisPosition = 14; // Cherry_7
            else if (colIndex === 1 && rowIndex === 2) cherryForThisPosition = 15; // Cherry_8
            else if (colIndex === 2 && rowIndex === 2) cherryForThisPosition = 16; // Cherry_9
            
            // Simbolurile permise pentru această poziție
            // Seven (6), star_scatter (7), cherry specific pentru poziție, și spațiu gol (-1)
            const permitedSymbolsForThisPosition = [6, 7, -1];
            if (cherryForThisPosition !== null) {
                permitedSymbolsForThisPosition.push(cherryForThisPosition);
            }
            
            // Alegem un simbol aleator din cele permise
            const randomIndex = Math.floor(Math.random() * permitedSymbolsForThisPosition.length);
            const selectedSymbol = permitedSymbolsForThisPosition[randomIndex];
            
            // Adăugăm simbolul ales în rezultate
            rezultate.push(selectedSymbol);
        }
        
        console.log('Simboluri generate pentru sloturile bonus:', rezultate);
        return rezultate;
    }
    
    // Funcție pentru pornirea unei rotiri gratuite
    function startFreeSpin() {
        if (freeSpinsCount <= 0) {
            console.log('Nu mai sunt rotiri bonus disponibile');
            return;
        }
        
        // Decrementăm numărul de rotiri gratuite
        freeSpinsCount--;
        updateFreeSpinsCounter();
        
        // Dezactivăm butonul BONUS SPIN temporar pentru a preveni apăsările multiple
        const bonusSpinButton = document.getElementById('btn-spin');
        if (bonusSpinButton) {
            bonusSpinButton.disabled = true;
        }
        
        console.log('Pornirea rotirii bonus cu animație reală ca în jocul de bază');
        
        // Resetăm mesajele de câștig la începutul unei noi rotiri
        if(window.WinMessage && typeof window.WinMessage.clear === 'function') {
            window.WinMessage.clear();
        }
        
        // Redăm sunetul de rotire
        const audioSpin = new Audio('media/spin.mp3');
        audioSpin.play();
        
        // Generăm valorile finale pentru toate pozițiile ÎNAINTE de rotire
        const rezultateFinale = generateBonusSlotValues();
        console.log('Simboluri finale generate pentru runda bonus:', rezultateFinale);
        
        // Obținem toate coloanele/sloturile
        const slotColumns = document.querySelectorAll('.mini-slot .column');
        
        // Variabile pentru a urmări finalizarea tuturor coloanelor
        let completedSlots = 0;
        const totalSlots = slotColumns.length;
        
        // PREGĂTIREA COLOANELOR PENTRU ROTIRE
        for(let i = 0; i < slotColumns.length; i++) {
            const c = slotColumns[i];
            c.style.transition = 'none'; // Dezactivăm tranziția pentru resetare
            c.style.bottom = '0px';
            
            // Golim complet coloana
            while(c.firstChild) {
                c.removeChild(c.firstChild);
            }
            
            // Determinăm ce coloană și rând reprezintă acest slot
            const colIndex = i % 3;  // 0, 1, sau 2 (coloană)
            const rowIndex = Math.floor(i / 3);  // 0, 1, sau 2 (rând)
            
            // Index pentru accesarea rezultatului final potrivit în array-ul de rezultate
            const slotIndexFinal = rowIndex * 3 + colIndex;
            const finalSymbolValue = rezultateFinale[slotIndexFinal];
            
            // Pregătim sloturile pentru animație - similar cu jocul de bază
            // Creăm 20-30 de sloturi aleatorii pentru o rotire convingătoare
            const numSlotsToCreate = 20 + Math.floor(Math.random() * 10);
            
            // Creăm elementele div pentru fiecare slot
            for(let j = 0; j < numSlotsToCreate; j++) {
                const div = document.createElement('div');
                div.className = 'item';
                
                // Pentru ultimul slot (care va fi vizibil), folosim simbolul final
                // Pentru celelalte, alegem aleatoriu dintre Seven, Star sau cherry specific poziției
                let symbolValue;
                
                if (j === numSlotsToCreate - 1) {
                    // Ultimul slot - folosim simbolul final pre-determinat
                    symbolValue = finalSymbolValue;
                } else {
                    // Sloturi pentru animație - simboluri aleatorii
                    const randomValue = Math.floor(Math.random() * 3);
                    if (randomValue === 0) symbolValue = 6; // Seven
                    else if (randomValue === 1) symbolValue = 7; // Star scatter
                    else {
                        // Cherry specific pentru poziție (8-16 pentru Cherry_1 până la Cherry_9)
                        symbolValue = 8 + slotIndexFinal;
                    }
                }
                
                // Setăm indicele simbolului pentru div
                div.dataset.ind = symbolValue;
                
                // Adăugăm imaginea corespunzătoare
                const img = document.createElement('img');
                img.className = 'slot-img';
                
                // Setăm sursa imaginii în funcție de simbolul ales
                switch(symbolValue) {
                    case 6: // Seven
                        img.src = 'cherry_img/seven.png';
                        break;
                    case 7: // Star Scatter
                        img.src = 'cherry_img/star_scatter.png';
                        break;
                    case 8: // Cherry_1
                        img.src = 'cherry_img/cireasa_1.png';
                        break;
                    case 9: // Cherry_2
                        img.src = 'cherry_img/cireasa_2.png';
                        break;
                    case 10: // Cherry_3
                        img.src = 'cherry_img/cireasa_3.png';
                        break;
                    case 11: // Cherry_4
                        img.src = 'cherry_img/cireasa_4.png';
                        break;
                    case 12: // Cherry_5
                        img.src = 'cherry_img/cireasa_5.png';
                        break;
                    case 13: // Cherry_6
                        img.src = 'cherry_img/cireasa_6.png';
                        break;
                    case 14: // Cherry_7
                        img.src = 'cherry_img/cireasa_7.png';
                        break;
                    case 15: // Cherry_8
                        img.src = 'cherry_img/cireasa_8.png';
                        break;
                    case 16: // Cherry_9
                        img.src = 'cherry_img/cireasa_9.png';
                        break;
                    default:
                        img.src = 'cherry_img/seven.png';
                        break;
                }
                
                div.appendChild(img);
                c.appendChild(div);
            }
        }
        
        // Un mic delay pentru a permite pregătirea completă a coloanelor înainte de animație
        setTimeout(() => {
            // ROTIREA PROPRIU-ZISĂ
            for(let i = 0; i < slotColumns.length; i++) {
                const c = slotColumns[i];
                
                // Durata de rotire variabilă pentru fiecare coloană (staggered effect)
                const transitionTime = 0.5 + (i * 0.2);
                c.style.transition = `${transitionTime}s ease-out`;
                
                // Calculăm cât de jos trebuie să se deplaseze coloana
                // Obținem toate div-urile create
                const divs = c.querySelectorAll('div');
                const totalHeight = divs.length * divs[0].offsetHeight;
                
                // Setăm poziția bottom pentru a începe animația de rotire
                c.style.bottom = `-${totalHeight - (3 * divs[0].offsetHeight)}px`;
                
                // Adăugăm handler pentru finalizarea tranziției
                c.ontransitionend = function() {
                    // Eliminăm event listener-ul pentru a evita apeluri multiple
                    c.ontransitionend = null;
                    
                    // Curățăm coloana, păstrând doar ultimele 3 div-uri (cele vizibile)
                    const allDivs = c.querySelectorAll('div');
                    const divsToKeep = 3;
                    
                    // Dacă avem mai multe div-uri decât avem nevoie
                    if (allDivs.length > divsToKeep) {
                        // Eliminăm div-urile în plus, începând de la primul
                        for (let j = 0; j < allDivs.length - divsToKeep; j++) {
                            c.removeChild(allDivs[j]);
                        }
                    }
                    
                    // Resetăm poziția coloanei fără tranziție
                    c.style.transition = 'none';
                    c.style.bottom = '0px';
                    
                    // Incrementăm contorul pentru coloanele finalizate
                    completedSlots++;
                    
                    // Când toate coloanele au terminat rotirea, verificăm rezultatul
                    if (completedSlots === totalSlots) {
                        console.log('Toate coloanele s-au oprit, verificăm rezultatul...');
                        
                        // Așteptăm puțin înainte de a procesa rezultatul
                        setTimeout(() => {
                            // Apelăm onSpinComplete pentru a verifica câștigurile
                            onSpinComplete(rezultateFinale);
                        }, 300);
                    }
                };
            }
        }, 100);
    }
    
    // Funcție pentru finalizarea jocului bonus și revenirea la starea normală
    function endBonusGame() {
        console.log('Finalizare joc bonus - nu mai sunt rotiri disponibile');
        
        // Primul mesaj de final pentru jocul bonus cu un stil mai vizibil
        if (messageElement) {
            messageElement.textContent = 'JOCUL BONUS S-A ÎNCHEIAT!';
            messageElement.style.display = 'block';
            messageElement.style.fontSize = '36px';
            messageElement.style.color = '#FFD700'; // Culoare aurie
            messageElement.style.textShadow = '2px 2px 4px #000';
            
            // Adaugăm un efect de tranziție pentru mesaj
            messageElement.style.transition = 'all 0.5s ease';
            messageElement.style.opacity = '1';
            
            // Adaugăm un efect de pulsare mai intens
            messageElement.style.animation = 'pulsate 0.8s infinite alternate';
        }
        
        // Redăm un sunet special pentru finalul jocului bonus
        if(window.audioWin) {
            window.audioWin.currentTime = 0;
            window.audioWin.play();
        }
        
        // Așteptăm 4 secunde pentru a oferi o tranziție mai lină înainte de a reveni la jocul normal
        setTimeout(() => {
            // Ascundem mesajul de final
            if (messageElement) {
                messageElement.style.display = 'none';
            }
            
            // Eliminăm clasa pentru starea de bonus (resetarea fundalului)
            const gameArea = document.getElementById('game-area');
            if (gameArea) {
                gameArea.classList.remove('bonus-active');
            }
            
            // Eliminăm și clasa bonus-mode de pe container-ul părinte
            const gameContainer = document.querySelector('.c-game');
            if (gameContainer) {
                gameContainer.classList.remove('bonus-mode');
            }
            
            // Restaurăm simbolurile pe role
            restoreSlotSymbols();
            
            // Ascundem contorul de rotiri gratuite
            if (freeSpinsCounterElement) {
                freeSpinsCounterElement.style.display = 'none';
            }
            
            // Resetarea butonului de spin la forma inițială
            console.log('Reinițializarea butonului SPIN...');
            
            const oldButton = document.getElementById('btn-spin');
            if (oldButton) {
                // Eliminăm clasa bonus-spin și resetăm conținutul
                oldButton.classList.remove('bonus-spin');
                oldButton.innerHTML = 'SPIN';
                oldButton.disabled = false;
                
                // Clonăm și înlocuim butonul pentru a elimina orice event listener existent
                const newButton = oldButton.cloneNode(true);
                if (oldButton.parentNode) {
                    oldButton.parentNode.replaceChild(newButton, oldButton);
                    
                    // Adăugăm event listener direct pentru a evita reîncărcarea script.js
                    newButton.addEventListener('click', function() {
                        console.log('SPIN button clicked');
                        try {
                            // Încercăm să accesăm Spin direct ca o funcție locală
                            if (typeof btnspin !== 'undefined' && btnspin) {
                                // Simulăm un click direct pe buton pentru a declanșa handler-ul original
                                setTimeout(function() {
                                    console.log('Simulare click pe butonul original');
                                    // Un click event simulat poate declanșa event listener-ul original
                                    btnspin.click();
                                }, 100);
                            } else {
                                // Dacă nu putem găsi handler-ul, oferă un mesaj de ajutor
                                console.log('Nu s-a putut găsi butonul original pentru simulare');
                                alert('Reîncărcați pagina pentru a continua jocul.');
                                location.reload();
                            }
                        } catch (e) {
                            console.error('Eroare la activarea butonului SPIN:', e);
                            alert('Reîncărcați pagina pentru a continua jocul.');
                            location.reload();
                        }
                    });
                }
            } else {
                // Dacă nu găsim butonul, încercăm să-l recreăm
                console.log('Butonul de SPIN nu a fost găsit, încercăm să îl recreăm');
                const spinContainer = document.querySelector('.spin-btn') || document.querySelector('.btn-container');
                if (spinContainer) {
                    const newSpinButton = document.createElement('button');
                    newSpinButton.id = 'btn-spin';
                    newSpinButton.innerHTML = 'SPIN';
                    newSpinButton.disabled = false;
                    spinContainer.innerHTML = '';
                    spinContainer.appendChild(newSpinButton);
                    
                    // Reîncărcăm script.js pentru a reinițializa tot jocul
                    const scriptElement = document.createElement('script');
                    scriptElement.src = 'script.js';
                    document.body.appendChild(scriptElement);
                }
            }
            
            // Reactivăm butoanele bet și insert credit
            const betButton = document.getElementById('btn-bet');
            const insertCreditButton = document.getElementById('btn-insert');
            
            if (betButton) {
                betButton.classList.remove('btn-disabled');
                betButton.disabled = false;
            }
            
            if (insertCreditButton) {
                insertCreditButton.classList.remove('btn-disabled');
                insertCreditButton.disabled = false;
            }
            
            // Resetăm starea
            isActive = false;
            if (typeof startGame !== 'undefined' && 
                typeof startGame.enableBtns === 'function') {
                startGame.enableBtns();
            }
            
            console.log('Jocul bonus s-a terminat, revenire la jocul de bază');
        }, 4000); // Așteptăm 4 secunde pentru o tranziție mai lină
    }
    
    // Funcție pentru activarea rotirilor gratuite
    function activateFreeSpins(slotValues) {
        // Asigurăm inițializarea contorului și a mesajului
        initMessageContainer();

        // Dezactivăm butoanele bet și insert credit în timpul jocului bonus
        const betButton = document.getElementById('btn-bet');
        const insertCreditButton = document.getElementById('btn-insert');
        if (betButton) {
            betButton.classList.add('btn-disabled');
            betButton.disabled = true;
        }
        if (insertCreditButton) {
            insertCreditButton.classList.add('btn-disabled');
            insertCreditButton.disabled = true;
        }
        
        // Modificăm aspectul butonului de spin pentru jocul bonus
        const spinButton = document.getElementById('btn-spin');
        if (spinButton) {
            spinButton.classList.add('bonus-spin');
            spinButton.innerHTML = 'BONUS<br>SPIN';
            
            // Dezactivăm temporar butonul până când va fi gata jocul bonus
            spinButton.disabled = true;
        }
        
        // Setăm starea ca activă
        isActive = true;
        
        // Setăm numărul inițial de rotiri gratuite la 1, conform cerinței
        freeSpinsCount = 1;
        console.log('Free Spins activate: O singură rotire gratuită inițială');
        
        // Actualizăm contorul imediat pentru a fi siguri că e vizibil
        updateFreeSpinsCounter();
        
        // 1. PRIMA DATĂ - Redăm sunetul și afișăm mesajul pentru jocul bonus
        console.log('Pas 1: Redarea sunetului și afișarea mesajului');
        
        // Obținem durata sunetului și redăm sunetul
        const soundDuration = playBonusSound();
        
        // Afișăm mesajul cu numărul de rotiri gratuite
        showMessage(`JOC BONUS: ${freeSpinsCount} ROTIRI GRATUITE!`, soundDuration);
        
        // După durata sunetului, salvăm și golim simbolurile
        setTimeout(() => {
            // 2. Salvăm simbolurile existente pe role
            console.log('Pas 2: Salvarea simbolurilor');
            saveSlotSymbols();
            
            // 3. Golim rolele (eliminăm simbolurile)
            console.log('Pas 3: Golirea rolelor');
            clearSlotSymbols();
            
            // După 1 secundă, schimbăm fundalul la roșu
            setTimeout(() => {
                // 4. Schimbăm fundalul rolelor la roșu
                console.log('Pas 4: Schimbarea fundalului la roșu');
                document.getElementById('game-area').classList.add('bonus-active');
                
                // Adăugăm clasa bonus-mode la container-ul părinte pentru a activa afișarea câștigului bonus
                const gameContainer = document.querySelector('.c-game');
                if (gameContainer) {
                    gameContainer.classList.add('bonus-mode');
                }
                
                // Afișăm contorul de rotiri gratuite din nou, după schimbarea fundalului
                updateFreeSpinsCounter();
                
                // Mic delay pentru a lăsa fundalul roșu să fie vizibil complet (500ms)
                setTimeout(() => {
                    // 5. Afișăm simboluri aleatorii pe rolele roșii
                    console.log('Pas 5: Afișarea simbolurilor aleatorii');
                    showRandomSymbols();
                    
                    // Activăm butonul BONUS SPIN pentru a permite utilizatorului să pornească jocul bonus
                    const spinButton = document.getElementById('btn-spin');
                    if (spinButton) {
                        console.log('Activarea butonului BONUS SPIN pentru jocul bonus');
                        spinButton.disabled = false;
                        
                        // Configurăm butonul să apeleze startFreeSpin la apăsare
                        // Mai întâi, eliminăm orice event listener anterior
                        const newSpinButton = spinButton.cloneNode(true);
                        spinButton.parentNode.replaceChild(newSpinButton, spinButton);
                        
                        // Adăugăm noul event listener pentru rotirea bonus
                        newSpinButton.addEventListener('click', function() {
                            // Dezactivăm butonul temporar pentru a preveni apăsările multiple
                            this.disabled = true;
                            // Pornirea rotirii gratuite
                            startFreeSpin();
                        });
                    }
                }, 500); // delay pentru afișarea simbolurilor după ce fundalul devine roșu
            }, 1000);
        }, soundDuration);
    }
    
    // Funcție pentru încărcarea și redarea sunetului de bonus
    function playBonusSound() {
        // Creăm un nou obiect Audio pentru sunetul de bonus
        bonusSound = new Audio('media/bonus_win.mp3');
        
        // Setăm volumul (opțional, valoare între 0 și 1)
        bonusSound.volume = 1.0;
        
        // Redarea sunetului
        bonusSound.play()
            .then(() => {
                console.log('Sunet bonus început');
            })
            .catch(error => {
                console.error('Eroare la redarea sunetului bonus:', error);
            });
            
        // Returnează durata sunetului în milisecunde (4 secunde)
        return 4000;
    }
    
    // Inițializăm containerul la încărcarea modulului
    initMessageContainer();
    // Funcție apelată după ce rotirea s-a terminat și s-a verificat câștigul
    function onSpinComplete(slotValues) {
        console.log('Rotire gratuită finalizată, verificăm câștigurile și simbolurile scatter');
        console.log('Simboluri vizibile la sfârșitul rotirii:', slotValues);
        
        // Re-activăm butonul BONUS SPIN pentru a permite următoarea rotire
        const bonusSpinButton = document.getElementById('btn-spin');
        if (bonusSpinButton) {
            bonusSpinButton.disabled = false;
        }
        
        // Verificăm numărul de simboluri scatter (star_scatter, index 7)
        // Folosim slotValues transmis ca parametru și ne asigurăm că este un array
        const scatterCount = Array.isArray(slotValues) ? slotValues.filter(v => v === 7).length : 0;
        console.log('Număr de simboluri scatter detectate:', scatterCount);
        
        // Dacă sunt cel puțin 3 simboluri scatter, acordăm o rotire suplimentară
        if (scatterCount >= 3) {
            console.log('Rotire bonus suplimentară acordată pentru', scatterCount, 'simboluri scatter');
            freeSpinsCount += 1;
            updateFreeSpinsCounter();
            
            // Afișăm un mesaj temporar pentru rotirea suplimentară
            if (messageElement) {
                messageElement.textContent = '+1 ROTIRE BONUS!';
                messageElement.style.display = 'block';
                messageElement.style.color = '#ffff00';
                messageElement.style.fontSize = '20px';
                messageElement.style.fontWeight = 'bold';
                
                // Ascundem mesajul după 1.5 secunde
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 1500);
            }
            
            // Redăm un sunet special pentru rotirea suplimentară
            if(window.audioExtra) {
                window.audioExtra.currentTime = 0;
                window.audioExtra.play();
            }
        }
        
        // Așteptăm 2 secunde înainte de a continua sau de a încheia jocul bonus
        setTimeout(() => {
            if (freeSpinsCount > 0) {
                // Mai avem rotiri gratuite, activăm butonul BONUS SPIN
                const spinButton = document.getElementById('btn-spin');
                if (spinButton) {
                    console.log('Activarea butonului BONUS SPIN pentru următoarea rotire');
                    
                    // Resetarea completă a butonului pentru a înlătura orice event listener anterior
                    const newSpinButton = document.createElement('button');
                    newSpinButton.id = 'btn-spin';
                    newSpinButton.classList.add('bonus-spin');
                    newSpinButton.innerHTML = 'BONUS<br>SPIN';
                    newSpinButton.disabled = false;
                    
                    // Înlocuirea completă a butonului vechi
                    if (spinButton.parentNode) {
                        spinButton.parentNode.replaceChild(newSpinButton, spinButton);
                    }
                    
                    // Adăugarea explicită a event listener-ului nou
                    newSpinButton.onclick = function() {
                        console.log('Butonul BONUS SPIN a fost apăsat');
                        // Dezactivare temporară
                        this.disabled = true;
                        // Pornirea următoarei rotiri gratuite
                        startFreeSpin();
                    };
                }
            } else {
                // Nu mai sunt rotiri disponibile, încheiem jocul bonus
                console.log('Joc bonus terminat: nu mai sunt rotiri disponibile');
                endBonusGame();
            }
        }, 2000); // Am redus timpul de așteptare la 2 secunde, conform cerinței
    }
    
    // Interfața publică a modulului
    return {
        activateFreeSpins: activateFreeSpins,
        isActive: function() { return isActive; },
        onSpinComplete: onSpinComplete
    };
})();
