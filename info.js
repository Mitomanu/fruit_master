/**
 * info.js
 * Script pentru funcționalitatea panelului de informații din jocul Fruit Master
 * Autor: ALSOFT 2025
 */

// Creăm un namespace pentru funcționalitățile de informații pentru a evita conflictele globale
const InfoPanel = {
    // Referințe DOM
    infoButton: null,      // Butonul info din joc
    infoPanel: null,       // Panelul de informații
    closeButton: null,     // Butonul de închidere a panelului
    nextButton: null,      // Butonul pentru pagina următoare
    prevButton: null,      // Butonul pentru pagina anterioară
    page1: null,           // Prima pagină
    page2: null,           // A doua pagină
    currentPage: 1,        // Pagina curentă afișată
    
    // Metoda de inițializare
    init: function() {
        // Obținem referințele la elementele necesare
        this.infoButton = document.getElementById('info-button');
        this.infoPanel = document.getElementById('info-panel');
        this.closeButton = document.getElementById('close-button');
        this.nextButton = document.getElementById('next-button');
        this.prevButton = document.getElementById('prev-button');
        this.page1 = document.getElementById('info-page-1');
        this.page2 = document.getElementById('info-page-2');
        
        // Verificăm dacă am găsit elementele principale
        if (!this.infoButton || !this.infoPanel || !this.closeButton) {
            console.error('Unele elemente principale nu au fost găsite!');
            return;
        }
        
        // Verificăm dacă am găsit elementele de navigare
        if (!this.nextButton || !this.prevButton || !this.page1 || !this.page2) {
            console.error('Elementele de navigare nu au fost găsite!');
            return;
        }
        
        // Inițializăm event listener-ii
        this.initEventListeners();
        
        // Adăugăm log pentru debug
        console.log('Panelul de informații a fost inițializat cu succes!');
    },
    
    // Inițializare event listeners
    initEventListeners: function() {
        // Event listener pentru butonul de informații
        this.infoButton.addEventListener('click', () => {
            console.log('Butonul de informații a fost apăsat!');
            this.openInfoPanel();
        });
        
        // Event listener pentru butonul de închidere
        this.closeButton.addEventListener('click', () => {
            console.log('Butonul de închidere a fost apăsat!');
            this.closeInfoPanel();
        });
        
        // Event listener pentru butonul de navigare înainte
        this.nextButton.addEventListener('click', () => {
            console.log('Navigare la pagina următoare');
            this.navigateToPage(2);
        });
        
        // Event listener pentru butonul de navigare înapoi
        this.prevButton.addEventListener('click', () => {
            console.log('Navigare la pagina anterioară');
            this.navigateToPage(1);
        });
        
        // Prevenim propagarea click-urilor în interiorul panelului
        this.infoPanel.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    },
    
    // Deschide panelul de informații cu efect de zoom
    openInfoPanel: function() {
        this.infoPanel.classList.add('active');
        // Resetarea la prima pagină la deschiderea panelului
        if (this.currentPage !== 1) {
            this.navigateToPage(1, false); // false pentru a nu aplica animația la deschidere
        }
    },
    
    // Închide panelul de informații
    closeInfoPanel: function() {
        this.infoPanel.classList.remove('active');
    },
    
    // Navigare între pagini
    navigateToPage: function(pageNumber, animate = true) {
        // Dacă suntem deja pe pagina respectivă, nu facem nimic
        if (this.currentPage === pageNumber) {
            return;
        }
        
        // Folosim direct stiluri pentru a asigura tranziții consistente
        // În loc de clase CSS care pot fi problematice cu adăugare/eliminare
        if (pageNumber === 1) {
            // Tranziție de la pagina 2 la pagina 1
            console.log('Navighare la pagina 1');
            
            // Resetăm stilurile direct fără să folosim clase
            if (animate) {
                // Animație: Pagina 1 vine de la stânga, pagina 2 merge spre dreapta
                this.page1.style.transition = 'transform 0.5s ease-in-out';
                this.page2.style.transition = 'transform 0.5s ease-in-out';
            } else {
                // Fără animație
                this.page1.style.transition = 'none';
                this.page2.style.transition = 'none';
            }
            
            // Aplicăm transformările
            this.page1.style.transform = 'translateX(0)';
            this.page2.style.transform = 'translateX(100%)';
            
        } else if (pageNumber === 2) {
            // Tranziție de la pagina 1 la pagina 2
            console.log('Navighare la pagina 2');
            
            // Resetăm stilurile direct fără să folosim clase
            if (animate) {
                // Animație: Pagina 1 merge spre stânga, pagina 2 vine de la dreapta
                this.page1.style.transition = 'transform 0.5s ease-in-out';
                this.page2.style.transition = 'transform 0.5s ease-in-out';
            } else {
                // Fără animație
                this.page1.style.transition = 'none';
                this.page2.style.transition = 'none';
            }
            
            // Aplicăm transformările
            this.page1.style.transform = 'translateX(-100%)';
            this.page2.style.transform = 'translateX(0)';
        }
        
        // Actualizăm pagina curentă
        this.currentPage = pageNumber;
    }
};

// Adicționare CSS pentru panelul de informații
function addInfoStylesheet() {
    // Verificăm dacă stilul a fost deja adăugat
    if (!document.querySelector('link[href="info.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'info.css';
        document.head.appendChild(link);
    }
}

// Inițializare după încărcarea completă a paginii
document.addEventListener('DOMContentLoaded', () => {
    addInfoStylesheet();
    InfoPanel.init();
    console.log('Scriptul info.js a fost încărcat!');
});