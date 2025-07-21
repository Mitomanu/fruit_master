/**
 * script_bonus_integration.js
 * Cod pentru integrarea jocului bonus cu jocul normal
 * Autor: ALSOFT 2025
 */

// Funcție pentru a prelua simbolurile vizibile din toate sloturile
function getVisibleSymbols() {
    const visibleSymbols = [];
    
    // Parcurgem cele 9 sloturi și preluăm simbolul vizibil din fiecare
    for(let i = 0; i < 9; i++) {
        const slotColumn = slots[i].querySelector('.column');
        // Găsim primul div care este în limitele vizibile ale slotului
        const visibleElements = slotColumn.querySelectorAll('div');
        
        if (visibleElements.length > 0) {
            // Verificăm simbolul din elementul vizibil (imaginea din div)
            const imgElement = visibleElements[0].querySelector('img');
            if (imgElement) {
                // Adăugăm calea către imagine în lista de simboluri vizibile
                visibleSymbols.push(imgElement.src);
            } else if (visibleElements[0].classList.contains('bonus-empty-space')) {
                visibleSymbols.push(""); // Spațiu gol în jocul bonus
            } else {
                visibleSymbols.push(""); // Niciun simbol în acest slot
            }
        } else {
            visibleSymbols.push(""); // Niciun simbol în acest slot
        }
    }
    
    return visibleSymbols;
}

// Modificăm funcția startGame.checkWin pentru a integra verificarea bonusului
const originalCheckWin = startGame.checkWin;
startGame.checkWin = async function() {
    // Verificăm dacă jocul bonus este deja activ
    if (window.BonusGame && window.BonusGame.isActive) {
        // Obținem simbolurile vizibile
        const visibleSymbols = getVisibleSymbols();
        
        // Verificăm câștigurile în jocul bonus
        const bonusResult = window.BonusGame.checkBonusWin(visibleSymbols, bet);
        
        // Adăugăm câștigul bonus la totalul general
        let totalWin = bonusResult.win;
        money = money + totalWin;
        showMoney();
        
        // Evidențiem simbolurile câștigătoare dacă există
        for (const winInfo of bonusResult.winningSymbols) {
            for (const index of winInfo.indices) {
                const slotColumn = slots[index].querySelector('.column');
                const firstDiv = slotColumn.querySelector('div');
                if (firstDiv) {
                    firstDiv.classList.add('bg');
                }
            }
            
            // Adăugăm mesaj în coada de afișare
            if(window.WinMessage && typeof window.WinMessage.queue === 'function') {
                let symbolSrc;
                if (winInfo.symbolType === 'cherry') {
                    symbolSrc = 'cherry_img/cireasa_1.png';
                } else if (winInfo.symbolType === 'seven') {
                    symbolSrc = 'items/seven.png';
                } else {
                    symbolSrc = 'items/star_scatter.png';
                }
                window.WinMessage.queue(winInfo.symbolType, winInfo.count, winInfo.win, [symbolSrc]);
            }
        }
        
        // Verificăm dacă am obținut jackpot
        if (bonusResult.jackpot) {
            window.BonusGame.showJackpotMessage();
        }
        
        // Verificăm pentru rotiri suplimentare - doar dacă sunt 3+ simboluri star
        const starSymbols = visibleSymbols.filter(path => path.includes('star_scatter'));
        const hasAdditionalSpin = starSymbols.length >= 3;
        
        // Afișăm câștigul
        if (totalWin > 0) {
            showWin(totalWin);
            audioWin.currentTime = 0;
            audioWin.play();
        }
        
        // Actualizăm contorul de rotiri gratuite
        if (hasAdditionalSpin) {
            // Adăugăm încă o rotire gratuită
            window.BonusGame.freeSpins++;
            window.WinMessage.queue('star', starSymbols.length, 0, ['items/star_scatter.png']);
        } else {
            // Scădem rotirea tocmai efectuată
            window.BonusGame.freeSpins--;
        }
        window.BonusGame.updateFreeSpinsCounter();
        
        // Verificăm dacă mai avem rotiri gratuite
        if (window.BonusGame.freeSpins <= 0) {
            // Terminăm jocul bonus după o scurtă pauză pentru a permite vizualizarea câștigurilor
            setTimeout(() => {
                // Anunțăm terminarea jocului bonus
                window.BonusGame.endBonusGame(slots);
                
                // Restaurăm simbolurile originale salvate la începutul jocului bonus
                if (window.BonusGame.originalSymbols && window.BonusGame.originalSymbols.length > 0) {
                    // Curățăm rolele existente
                    for(let i = 0; i < 9; i++) {
                        const slotColumn = slots[i].querySelector('.column');
                        while (slotColumn.firstChild) {
                            slotColumn.removeChild(slotColumn.firstChild);
                        }
                    }
                    
                    // Recreăm simbolurile originale și le afișăm
                    startGame.getStartItems();
                }
                
                // Reluăm jocul normal
                enableBtns();
            }, 3000);
        } else {
            // Continuăm cu următoarea rotire gratuită după o scurtă pauză
            setTimeout(() => {
                Spin();
            }, 2000);
        }
        money = money + totalWin;
        txtmoney.textContent = money;
        
    } else {
        // Apelăm funcția originală pentru verificarea câștigurilor în jocul normal
        const originalResult = originalCheckWin.call(this);
        
        // După verificarea câștigurilor normale, verificăm dacă trebuie activat jocul bonus
        const visibleSymbols = getVisibleSymbols();
        const shouldActivateBonus = window.BonusGame && window.BonusGame.checkBonusActivation(visibleSymbols);
        
        if (shouldActivateBonus && !window.BonusGame.isActive) {
            disableBtns(); // Dezactivăm butoanele pentru a preveni interacțiunea utilizatorului
            
            // Activăm jocul bonus
            await window.BonusGame.activateBonus(visibleSymbols, slots);
            
            // Golim rolele pentru a pregăti jocul bonus
            for(let i = 0; i < 9; i++) {
                const slotColumn = slots[i].querySelector('.column');
                while (slotColumn.firstChild) {
                    slotColumn.removeChild(slotColumn.firstChild);
                }
            }
            
            // Adăugăm simbolurile pentru jocul bonus
            for(let i = 0; i < 9; i++) {
                const slotColumn = slots[i].querySelector('.column');
                const bonusSymbols = window.BonusGame.generateBonusSymbols(5); // Generăm 5 simboluri per rolă
                
                // Adăugăm simbolurile în slot
                for(const symbolObj of bonusSymbols[i]) {
                    const div = document.createElement('div');
                    
                    if (symbolObj.type === "empty") {
                        div.className = 'bonus-empty-space';
                    } else {
                        const img = document.createElement('img');
                        img.src = symbolObj.path;
                        img.alt = 'Symbol';
                        
                        // Aplicăm clasa CSS corectă în funcție de tipul simbolului
                        if (symbolObj.type === "cherry") {
                            img.className = 'slot-img bonus-cherry-symbol';
                        } else {
                            // Pentru simboluri seven și star_scatter
                            img.className = 'slot-img bonus-normal-symbol';
                        }
                        
                        div.appendChild(img);
                    }
                    
                    slotColumn.appendChild(div);
                }
            }
            
            // Începem prima rotire gratuită
            setTimeout(() => {
                startGame.Spin();
            }, 1000);
        }
        
        return originalResult;
    }
};

// Definim o funcție globală Spin care va fi folosită în locul funcției startGame.Spin
function Spin() {
    // Verificăm dacă suntem în jocul bonus
    if (window.BonusGame && window.BonusGame.isActive) {
        // Nu trebuie să verificăm banii în jocul bonus
        // Și nu scădem pariul
        
        if(window.WinMessage && typeof window.WinMessage.clear === 'function') {
            window.WinMessage.clear();
        }
        
        audioSpin.currentTime = 0;
        audioSpin.play();
        
        // Dezactivăm butoanele în timpul rotirii
        disableBtns();
        
        // Generează simboluri specifice pentru jocul bonus
        // doar: cireasa_N.png, seven.png, star_scatter.png, sau spații goale
        const bonusSymbols = window.BonusGame.generateBonusSymbols(100);
        
        for(let i = 0; i < slotColumns.length; i++){
            // Curățăm orice elemente anterioare din coloană
            const slotColumn = slotColumns[i];
            while (slotColumn.firstChild) {
                slotColumn.removeChild(slotColumn.firstChild);
            }
            
            // Adăugăm noile simboluri specifice jocului bonus
            addItems(slotColumn, bonusSymbols[i]);
        }
    } else {
        // Comportamentul normal al funcției Spin
        // Verificăm banii disponibili
        var check = checkMoney();
        if(check){
            // Resetăm mesajele de câștig în cazul unei noi rotiri
            if(window.WinMessage && typeof window.WinMessage.clear === 'function') {
                window.WinMessage.clear();
            }
            
            audioSpin.currentTime = 0;
            audioSpin.play();
            
            money = money - bet;
            showMoney();
            disableBtns();
            getColumns();
        }
    }
}

// Suprascrierea funcției addItems pentru a gestiona simbolurile în jocul bonus
const originalAddItems = addItems;
function addItems(el, n, useAllSymbols = false) {
    if (window.BonusGame && window.BonusGame.isActive) {
        // În jocul bonus, adăugăm simboluri specifice pentru bonus
        const slotIndex = slots.findIndex(slot => slot.querySelector('.column') === el);
        
        for(let i = 0; i < n; i++) {
            const div = document.createElement('div');
            const symbolObj = window.BonusGame.getBonusSymbol(slotIndex);
            
            if (symbolObj.type === "empty") {
                div.className = 'bonus-empty-space';
            } else {
                const img = document.createElement('img');
                img.src = symbolObj.path;
                img.alt = 'Symbol';
                
                // Aplicăm clasele CSS corecte în funcție de tipul simbolului
                if (symbolObj.type === "cherry") {
                    img.className = 'slot-img bonus-cherry-symbol';
                } else {
                    // pentru simboluri seven și star
                    img.className = 'slot-img bonus-normal-symbol';
                }
                
                div.appendChild(img);
            }
            
            el.appendChild(div);
        }
    } else {
        // În jocul normal, folosim comportamentul original
        const itemsArray = ['items/cherry.png', 'items/lemon.png', 'items/orange.png', 'items/plum.png', 'items/bell.png', 'items/strawberry.png', 'items/watermelon.png', 'items/clover.png', 'items/seven.png', 'items/star_scatter.png'];
        
        for(let i = 0; i < n; i++) {
            const div = document.createElement('div');
            const img = document.createElement('img');
            img.src = itemsArray[Math.floor(Math.random() * itemsArray.length)];
            img.className = 'slot-img';
            img.alt = 'Symbol';
            div.appendChild(img);
            el.appendChild(div);
        }
        return el;
    }
};
