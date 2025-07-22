// Modul pentru gestionarea rotirilor gratuite (free spins)
window.FreeSpins = (function() {
    // Variabile private ale modulului
    let isActive = false;
    let freeSpinsContainer = null;
    let messageElement = null;
    let savedSymbols = []; // Aici vom salva simbolurile
    
    // Inițializarea containerului pentru mesaje
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
    
    // Funcție pentru activarea rotirilor gratuite
    function activateFreeSpins(slotValues) {
        // Dezactivăm butoanele în timpul jocului bonus
        if (typeof startGame !== 'undefined' && 
            typeof startGame.disableBtns === 'function') {
            startGame.disableBtns();
        }
        
        // Setăm starea ca activă
        isActive = true;
        
        // 1. PRIMA DATĂ - Salvăm simbolurile existente pe role
        saveSlotSymbols();
        
        // 2. Golim rolele (eliminăm simbolurile)
        clearSlotSymbols();
        
        // 3. Schimbăm fundalul rolelor la roșu
        document.getElementById('game-area').classList.add('bonus-active');
        
        // 4. Afișăm mesajul pentru jocul bonus după un mic delay
        setTimeout(() => {
            showMessage('BONUS GAME STARTED', 5000);
        }, 100);
        
        console.log('Free Spins activate: Scatter count - ', 
                     slotValues.filter(v => v === 7).length);
                     
        // 5. După 5 secunde, revenim la jocul normal
        setTimeout(() => {
            // Eliminăm clasa pentru starea de bonus - resetarea fundalului rolelor
            document.getElementById('game-area').classList.remove('bonus-active');
            
            // Restaurăm simbolurile pe role
            restoreSlotSymbols();
            
            // Resetăm starea
            isActive = false;
            
            // Reactivăm butoanele
            if (typeof startGame !== 'undefined' && 
                typeof startGame.enableBtns === 'function') {
                startGame.enableBtns();
            }
            
            console.log('Free Spins ended, returning to base game');
        }, 5000);
    }
    
    // Inițializăm containerul la încărcarea modulului
    initMessageContainer();
    
    // Interfața publică a modulului
    return {
        activateFreeSpins: activateFreeSpins,
        isActive: function() { return isActive; }
    };
})();
