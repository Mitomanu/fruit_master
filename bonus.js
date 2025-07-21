/**
 * bonus.js
 * Implementarea modului de joc bonus gratuit pentru Fruit Master
 * Autor: ALSOFT 2025
 */

/**
 * Clasa care gestionează logica jocului bonus
 */
class BonusGame {
    constructor() {
        // Stocăm simbolurile originale de pe role
        this.originalSymbols = [];
        
        // Starea jocului bonus
        this.isActive = false;
        this.freeSpins = 0;
        
        // Probabilități pentru simboluri în jocul bonus (%)
        this.probabilities = {
            empty: 80,
            seven: 10,
            cherry: 7,
            star: 3
        };
        
        // Plăți pentru simboluri în jocul bonus
        this.bonusPayouts = {
            seven: {
                3: 12,  // +50% din plata normală
                4: 15,  // +50% din plata normală
                5: 22,  // +50% din plata normală
                6: 27,  // +50% din plata normală
                7: 150, // +50% din plata normală
                8: 375, // +50% din plata normală
                9: 750  // +50% din plata normală
            },
            cherry: {
                2: 2,
                3: 4,
                4: 10,
                5: 25,
                6: 50,
                7: 75,
                8: 150,
                9: 10000 // Jackpot
            }
        };
    }
    
    /**
     * Verifică dacă jocul bonus trebuie activat
     * @param {Array} visibleSymbols - Array cu toate simbolurile vizibile pe role
     * @returns {boolean} - True dacă trebuie activat jocul bonus
     */
    checkBonusActivation(visibleSymbols) {
        // Numărăm câte simboluri 'star_scatter' sunt vizibile
        let starCount = 0;
        
        for (const symbolPath of visibleSymbols) {
            if (symbolPath.includes('star_scatter.png')) {
                starCount++;
            }
        }
        
        // Activăm bonus dacă sunt cel puțin 4 simboluri star
        return starCount >= 4;
    }
    
    /**
     * Activează jocul bonus
     * @param {Array} slotElements - Elementele DOM pentru role
     */
    activateBonus(slotElements) {
        // Verificăm dacă jocul bonus nu este deja activ
        if (this.isActive) return;
        
        // Salvăm simbolurile actuale pentru a le restaura la final
        this.saveOriginalSymbols(slotElements);
        
        // Setăm starea jocului bonus ca activ
        this.isActive = true;
        this.freeSpins = 1; // Începem cu O SINGURĂ rotire gratuită
        
        // Afișăm contorul de rotiri gratuite
        const freeSpinsCounter = document.getElementById('free-spins-counter');
        if (freeSpinsCounter) {
            freeSpinsCounter.style.display = 'block';
            this.updateFreeSpinsCounter();
        }
        
        // Adăugăm clasa de stil bonus pe role pentru a le marca vizual
        for (const slot of slotElements) {
            slot.classList.add('bonus-slot');
        }
        
        // Afișăm mesaj de bonus
        const bonusMessage = document.getElementById('bonus-message');
        if (bonusMessage) {
            bonusMessage.classList.add('active');
            
            // Ascundem mesajul după o perioadă
            setTimeout(() => {
                bonusMessage.classList.remove('active');
            }, 3000);
        }
        
        // Pornim prima rotire gratuită automat după un scurt delay
        setTimeout(() => {
            // Asigurăm-ne că avem acces la funcția Spin
            if (typeof Spin === 'function') {
                Spin();
            }
        }, 3500);
        return new Promise(resolve => {
            setTimeout(resolve, 3000);
        });
    }
    
    /**
     * Salvează simbolurile originale înainte de a intra în jocul bonus
     * @param {Array} slotElements - Elementele DOM pentru role
     */
    saveOriginalSymbols(slotElements) {
        // Resetăm array-ul original de simboluri
        this.originalSymbols = [];
        
        // Parcurgem fiecare slot și salvăm informațiile despre simbol
        for (let i = 0; i < slotElements.length; i++) {
            const slotColumn = slotElements[i].querySelector('.column');
            if (slotColumn) {
                const firstDiv = slotColumn.querySelector('div');
                if (firstDiv) {
                    const imgElement = firstDiv.querySelector('img');
                    if (imgElement) {
                        // Salvăm sursa imaginii pentru restaurare ulterioară
                        this.originalSymbols.push({
                            index: i,
                            src: imgElement.src,
                            classes: imgElement.className
                        });
                    } else {
                        this.originalSymbols.push({
                            index: i,
                            src: null,
                            classes: ''
                        });
                    }
                }
            }
        }
        
        // Logare pentru depanare
        console.log('Simboluri originale salvate:', this.originalSymbols.length);
    }
    
    /**
     * Generează un simbol pentru jocul bonus în funcție de probabilități
     * @param {number} slotIndex - Indexul rolei (0-8)
     * @returns {Object} - Obiect cu informații despre simbol
     */
    getBonusSymbol(slotIndex) {
        // Pentru simbolurile cireașă, folosim imaginea specifică pentru poziția exactă
        // slotIndex este între 0-8 corespunzând pozițiilor pe rolă
        const cherryIndex = slotIndex + 1; // cireasa_1.png la cireasa_9.png
        
        // Probabilitățile pentru diferite tipuri de simboluri
        const random = Math.random() * 100;
        
        // Simboluri posibile: cireasa_N.png, seven.png, star_scatter.png sau spațiu gol
        if (random < this.probabilities.empty) {
            return { 
                path: "", // Spațiu gol
                type: "empty"
            }; 
        } else if (random < this.probabilities.empty + this.probabilities.seven) {
            return { 
                path: "items/seven.png",
                type: "seven" 
            };
        } else if (random < this.probabilities.empty + this.probabilities.seven + this.probabilities.cherry) {
            // Specificăm direct calea către imaginea cireasa_N.png corespunzătoare poziției
            return { 
                path: `cherry_img/cireasa_${cherryIndex}.png`,
                type: "cherry"
            };
        } else {
            return { 
                path: "items/star_scatter.png",
                type: "star"
            };
        }
    }
    
    /**
     * Generează simbolurile pentru toate rolele în jocul bonus
     * @param {number} numberOfSymbols - Câte simboluri să genereze per rolă
     * @returns {Array} - Un array cu simboluri pentru fiecare rolă
     */
    generateBonusSymbols(numberOfSymbols) {
        const symbolsForReels = [];
        
        for (let i = 0; i < 9; i++) {
            const reelSymbols = [];
            for (let j = 0; j < numberOfSymbols; j++) {
                const symbol = this.getBonusSymbol(i);
                reelSymbols.push(symbol);
            }
            symbolsForReels.push(reelSymbols);
        }
        
        return symbolsForReels;
    }
    
    /**
     * Verifică câștigurile în jocul bonus
     * @param {Array} visibleSymbols - Simbolurile vizibile pe role
     * @param {number} bet - Valoarea pariului
     * @returns {Object} - Informații despre câștiguri
     */
    checkBonusWin(visibleSymbols, bet) {
        // Inițializăm rezultatul
        const result = {
            win: 0,                 // Suma câștigată
            winningSymbols: [],     // Informații despre simbolurile câștigătoare
            jackpot: false,         // Dacă s-a obținut jackpot
            additionalFreeSpin: false // Dacă s-a obținut o rotire gratuită suplimentară
        };
        
        // Verificăm pentru simboluri star_scatter (DOAR pentru rotiri gratuite, fără câștig bănesc)
        let starCount = 0;
        const starIndices = [];
        
        for (let i = 0; i < visibleSymbols.length; i++) {
            if (visibleSymbols[i].includes('star_scatter.png')) {
                starCount++;
                starIndices.push(i);
            }
        }
        
        // Doar acordăm rotiri gratuite pentru 3+ simboluri scatter, fără câștig bănesc
        if (starCount >= 3) {
            result.additionalFreeSpin = true;
            
            // Adăugăm informații despre simbolurile scatter pentru a fi evidențiate, dar fără câștig bănesc
            result.winningSymbols.push({
                indices: starIndices,
                symbolType: 'star',
                count: starCount,
                win: 0  // Nu oferă câștig bănesc
            });
        }
        
        // Verificăm câștigurile pentru seven și cherry
        this.checkSymbolType(visibleSymbols, 'seven.png', bet, result);
        this.checkCherrySymbols(visibleSymbols, bet, result);
        
        return result;
    }
    
    /**
     * Verifică câștigurile pentru un anumit tip de simbol
     * @param {Array} visibleSymbols - Simbolurile vizibile
     * @param {string} symbolType - Tipul de simbol de verificat
     * @param {number} bet - Valoarea pariului
     * @param {Object} result - Obiectul rezultat pentru actualizare
     */
    checkSymbolType(visibleSymbols, symbolType, bet, result) {
        let count = 0;
        const symbolIndices = [];
        
        for (let i = 0; i < visibleSymbols.length; i++) {
            if (visibleSymbols[i].includes(symbolType)) {
                count++;
                symbolIndices.push(i);
            }
        }
        
        // Verificăm dacă avem un câștig pentru acest tip de simbol
        if (count >= 3) {
            let multiplier = 0;
            
            if (symbolType === 'seven.png' && this.bonusPayouts.seven[count]) {
                multiplier = this.bonusPayouts.seven[count];
                result.win += bet * multiplier;
                result.winningSymbols.push({
                    indices: symbolIndices,
                    symbolType: symbolType,
                    count: count,
                    win: bet * multiplier
                });
            }
        }
    }
    
    /**
     * Verifică câștigurile pentru simbolurile cireașă
     * @param {Array} visibleSymbols - Simbolurile vizibile
     * @param {number} bet - Valoarea pariului
     * @param {Object} result - Obiectul rezultat pentru actualizare
     */
    checkCherrySymbols(visibleSymbols, bet, result) {
        let cherryCount = 0;
        const cherryIndices = [];
        
        for (let i = 0; i < visibleSymbols.length; i++) {
            if (visibleSymbols[i].includes('cireasa_')) {
                cherryCount++;
                cherryIndices.push(i);
            }
        }
        
        // Verificăm dacă avem un câștig pentru simbolurile cireașă
        if (cherryCount >= 2 && this.bonusPayouts.cherry[cherryCount]) {
            const multiplier = this.bonusPayouts.cherry[cherryCount];
            result.win += bet * multiplier;
            
            // Verificăm dacă am obținut jackpot-ul (9 simboluri cireașă)
            if (cherryCount === 9) {
                result.jackpot = true;
            }
            
            result.winningSymbols.push({
                indices: cherryIndices,
                symbolType: 'cherry',
                count: cherryCount,
                win: bet * multiplier
            });
        }
    }
    
    /**
     * Afișează mesajul de jackpot
     */
    showJackpotMessage() {
        const jackpotMessage = document.getElementById('jackpot-message');
        jackpotMessage.classList.add('active');
        
        // Ascundem mesajul după o perioadă
        setTimeout(() => {
            jackpotMessage.classList.remove('active');
        }, 5000);
    }
    
    /**
     * Termină jocul bonus și restaurează jocul normal
     * @param {Array} slotElements - Elementele DOM pentru role
     */
    endBonusGame(slotElements) {
        this.isActive = false;
        this.freeSpins = 0;
        
        // Ascundem contorul de rotiri gratuite
        const freeSpinsCounter = document.getElementById('free-spins-counter');
        freeSpinsCounter.style.display = 'none';
        
        // Eliminăm clasa de stil bonus de pe role
        for (const slot of slotElements) {
            slot.classList.remove('bonus-slot');
        }
    }
    
    /**
     * Actualizează contorul de rotiri gratuite
     */
    updateFreeSpinsCounter() {
        const freeSpinsCounter = document.getElementById('free-spins-counter');
        freeSpinsCounter.textContent = `Rotiri gratuite: ${this.freeSpins}`;
    }
}

// Creăm instanța globală a jocului bonus
window.BonusGame = new BonusGame();
