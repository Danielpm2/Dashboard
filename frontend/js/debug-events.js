// Debug helper pour tester les event listeners
function debugEvents() {
    console.log('=== DEBUG EVENT LISTENERS ===');
    
    // Test si les éléments existent
    const events = document.querySelectorAll('.event-item');
    console.log('Nombre d\'événements trouvés:', events.length);
    
    events.forEach((event, index) => {
        console.log(`Événement ${index + 1}:`, {
            id: event.dataset.eventId,
            hasEditBtn: !!event.querySelector('.edit-event-btn'),
            hasDeleteBtn: !!event.querySelector('.delete-event-btn')
        });
        
        const editBtn = event.querySelector('.edit-event-btn');
        const deleteBtn = event.querySelector('.delete-event-btn');
        
        if (editBtn) {
            console.log('Edit button dataset:', editBtn.dataset);
        }
        if (deleteBtn) {
            console.log('Delete button dataset:', deleteBtn.dataset);
        }
    });
    
    // Test manual click
    const firstEditBtn = document.querySelector('.edit-event-btn');
    if (firstEditBtn) {
        console.log('Premier bouton edit trouvé, ID:', firstEditBtn.dataset.eventId);
        console.log('Bouton cliquable:', firstEditBtn.style.pointerEvents !== 'none');
    }
    
    const firstDeleteBtn = document.querySelector('.delete-event-btn');
    if (firstDeleteBtn) {
        console.log('Premier bouton delete trouvé, ID:', firstDeleteBtn.dataset.eventId);
        console.log('Bouton cliquable:', firstDeleteBtn.style.pointerEvents !== 'none');
    }
}

// Lancer le debug automatiquement
setTimeout(debugEvents, 2000);

// Ajouter au window pour debug manuel
window.debugEvents = debugEvents;
