/**
 * win_message.js
 * Modul pentru afișarea mesajelor de câștig în jocul Slot Machine
 * Implementare modulară pentru a păstra codul principal curat
 */

// Inițializăm variabilele necesare
let winMessagesQueue = [];
let isDisplayingWinMessages = false;
let messageDisplayTimeout = null;

/**
 * Inițializează containerele pentru mesaje dacă nu există deja
 * @param {number} containerIndex - Indexul containerului (0, 1 sau 2)
 * @returns {HTMLElement} Containerul pentru mesaje
 */
function initializeMessageContainer(containerIndex = 0) {
    // Ne asigurăm că indexul este valid (0, 1 sau 2)
    containerIndex = Math.min(Math.max(containerIndex, 0), 2);
    
    // Creăm ID-ul specific pentru container
    const containerId = `win-messages-container-${containerIndex}`;
    
    // Verificăm dacă containerul există deja
    let container = document.getElementById(containerId);
    
    // Dacă nu există, îl creăm
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'win-messages-container';
        container.dataset.containerIndex = containerIndex;
        document.body.appendChild(container);
        
        // Adăugăm stilurile prin referință la CSS
        if (containerIndex === 0) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'win_message.css';
            document.head.appendChild(cssLink);
        }
    }
    
    return container;
}

/**
 * Adaugă un mesaj în coada de mesaje pentru a fi afișat ulterior
 * @param {number} symbolIndex - Indexul simbolului câștigător
 * @param {number} count - Numărul de apariții ale simbolului
 * @param {number} win - Valoarea câștigului pentru acest simbol
 * @param {Array} symbolsArray - Array-ul cu căile către imagini pentru simboluri
 */
function queueWinMessage(symbolIndex, count, win, symbolsArray) {
    // Ne asigurăm că avem un path valid către imagine
    // În unele cazuri, simbolurile ar putea să nu aibă path-uri corecte
    let symbolSrc = symbolsArray[symbolIndex];
    
    // Verificăm dacă path-ul către imagine este valid și există
    if (!symbolSrc) {
        console.error('Path invalid pentru simbolul cu indexul:', symbolIndex);
        // Folosim o imagine placeholder dacă path-ul nu este valid
        symbolSrc = 'symbols/default.png';
    }
    
    // Adăugăm mesajul în coadă
    winMessagesQueue.push({
        symbolIndex: symbolIndex,
        count: count,
        win: win,
        symbolSrc: symbolSrc
    });
    
    // Dacă nu există deja un mesaj în curs de afișare, începem afișarea
    if (!isDisplayingWinMessages) {
        displayWinMessages();
    }
}

/**
 * Afișează mesajele de câștig în containere separate pentru fiecare variantă (maxim 3)
 */
function displayWinMessages() {
    if (winMessagesQueue.length === 0) {
        isDisplayingWinMessages = false;
        
        // Eliberăm referința pentru timeout
        if (messageDisplayTimeout) {
            clearTimeout(messageDisplayTimeout);
            messageDisplayTimeout = null;
        }
        
        return;
    }
    
    isDisplayingWinMessages = true;
    
    // Limităm la maxim 3 variante de câștig
    const messagesToProcess = winMessagesQueue.splice(0, Math.min(winMessagesQueue.length, 3));
    
    // Procesăm mesajele și le afișăm în containere separate
    messagesToProcess.forEach((messageInfo, index) => {
        // Obținem containerul corespunzător (0, 1 sau 2) pentru această variantă de câștig
        const container = initializeMessageContainer(index);
        
        // Creăm elementul pentru mesajul de câștig
        const messageElement = document.createElement('div');
        messageElement.className = 'win-message';
        
        // Creăm elementele separate pentru un control mai bun asupra stilării
        const countElement = document.createElement('span');
        countElement.textContent = `${messageInfo.count} x `;
        countElement.className = 'win-count';
        
        const imgContainer = document.createElement('div');
        imgContainer.className = 'win-symbol-container';
        
        const imgElement = document.createElement('img');
        imgElement.src = messageInfo.symbolSrc;
        imgElement.alt = 'Symbol';
        imgElement.className = 'win-symbol-img';
        
        const equalsElement = document.createElement('span');
        equalsElement.textContent = ' = ';
        
        const valueElement = document.createElement('span');
        valueElement.textContent = messageInfo.win;
        valueElement.className = 'win-value';
        
        // Adăugăm elementele în mesaj
        imgContainer.appendChild(imgElement);
        messageElement.appendChild(countElement);
        messageElement.appendChild(imgContainer);
        messageElement.appendChild(equalsElement);
        messageElement.appendChild(valueElement);
        
        // Curățăm containerul existent înainte de a adăuga noul mesaj
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // Adăugăm mesajul în container
        container.appendChild(messageElement);
        
        // Afișăm mesajul cu o animație de fade-in
        setTimeout(() => {
            messageElement.classList.add('visible');
        }, 100);
    });
    
    // Ascundem toate mesajele după 3 secunde
    messageDisplayTimeout = setTimeout(() => {
        // Obținem toate mesajele vizibile și le ascundem cu efect de fade-out
        const currentMessages = document.querySelectorAll('.win-message.visible');
        currentMessages.forEach(msg => {
            msg.classList.remove('visible');
            
            // Setăm un timeout pentru a șterge aceste mesaje după efectul de fade-out
            setTimeout(() => {
                if (msg && msg.parentNode) {
                    msg.parentNode.removeChild(msg);
                }
            }, 500);
        });
        
        // Resetăm starea dacă nu mai sunt alte mesaje în coadă
        if (winMessagesQueue.length === 0) {
            isDisplayingWinMessages = false;
        } else {
            // Dacă mai sunt mesaje în coadă, procesăm următorul set
            setTimeout(displayWinMessages, 100);
        }
        messageDisplayTimeout = null;
    }, 3000); // 3 secunde de afișare
}

/**
 * Curăță toate mesajele și resetează sistemul de afișare
 * Trebuie apelată când începe o nouă rundă de joc
 */
function clearWinMessages() {
    // Oprim orice timeout activ
    if (messageDisplayTimeout) {
        clearTimeout(messageDisplayTimeout);
        messageDisplayTimeout = null;
    }
    
    // Resetăm variabilele de stare
    winMessagesQueue = [];
    isDisplayingWinMessages = false;
    
    // Curățăm toate cele 3 containere posibile de mesaje
    for (let i = 0; i < 3; i++) {
        const container = document.getElementById(`win-messages-container-${i}`);
        if (container) {
            const allMessages = container.querySelectorAll('.win-message');
            
            // Întrerupem toate animațiile și îndepărtăm toate mesajele imediat
            allMessages.forEach(msg => {
                msg.classList.remove('visible');
                if (msg.parentNode) {
                    msg.parentNode.removeChild(msg);
                }
            });
        }
    }
}

// Exportăm funcțiile care vor fi folosite în codul principal
window.WinMessage = {
    queue: queueWinMessage,
    clear: clearWinMessages,
    isDisplaying: () => isDisplayingWinMessages
};
