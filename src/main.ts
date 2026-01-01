console.log("🚀 Application TypeScript démarrée !");

class EventItem {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  category: string;
  maxCapacity: number;
  registrations: string[] = [];

  constructor(title: string, description: string, date: Date, location: string, category: string, maxCapacity: number) {
    this.id = Date.now();
    this.title = title;
    this.description = description;
    this.date = date;
    this.location = location;
    this.category = category;
    this.maxCapacity = maxCapacity;
  }

  isPast(): boolean {
    return this.date < new Date();
  }

  getFormattedDate(): string {
    return this.date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canRegister(): boolean {
    return this.registrations.length < this.maxCapacity && !this.isPast();
  }

  getAvailableSpaces(): number {
    return this.maxCapacity - this.registrations.length;
  }
}

class EventService {
  private events: EventItem[] = [];

  createEvent(title: string, description: string, date: Date, location: string, category: string, maxCapacity: number): EventItem {
    const event = new EventItem(title, description, date, location, category, maxCapacity);
    this.events.push(event);
    this.saveToLocalStorage();
    return event;
  }

  getAllEvents(): EventItem[] {
    this.loadFromLocalStorage();
    return this.events;
  }

  deleteEvent(eventId: number): void {
    this.events = this.events.filter(e => e.id !== eventId);
    this.saveToLocalStorage();
  }

  registerToEvent(eventId: number, userEmail: string): boolean {
  const event = this.events.find(e => e.id === eventId);
  if (event) {
    const canRegister = event.canRegister();
    let alreadyRegistered = false;
    for (const registration of event.registrations) {
      if (registration === userEmail) {
      alreadyRegistered = true;
      break;
      }
    }
    
    if (canRegister && !alreadyRegistered) {
      event.registrations.push(userEmail);
      this.saveToLocalStorage();
      return true;
    }
  }
  return false;
}

  private saveToLocalStorage(): void {
    localStorage.setItem('events', JSON.stringify(this.events));
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('events');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.events = parsed.map((data: any) => {
        const event = new EventItem(
          data.title,
          data.description,
          new Date(data.date),
          data.location,
          data.category,
          data.maxCapacity
        );
        event.registrations = data.registrations || [];
        return event;
      });
    }
  }
}

class EventApp {
  private eventService = new EventService();
  private events: EventItem[] = [];
  private isDarkMode = localStorage.getItem('darkMode') === 'true';

  constructor() {
    this.init();
  }

  private init(): void {
    document.addEventListener('DOMContentLoaded', () => {
      this.applyTheme();
      this.initializeDemoData();
      this.renderApp();
      this.setupEventListeners();
    });
  }

  private applyTheme(): void {
    const html = document.documentElement;
    if (this.isDarkMode) {
      html.classList.add('dark-mode');
    } else {
      html.classList.remove('dark-mode');
    }
  }

  private toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme();
  }

  private initializeDemoData(): void {
    const events = this.eventService.getAllEvents();
    if (events.length === 0) {
      const today = new Date();
      this.eventService.createEvent(
        'Conférence sur l\'IA',
        'Découvrez les dernières avancées en intelligence artificielle avec des experts du domaine',
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 14, 0),
        'Amphithéâtre A',
        'conférence',
        100
      );
      
      this.eventService.createEvent(
        'Tournoi de Football',
        'Tournoi inter-classes de football avec finales époustouflantes',
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 0),
        'Stade universitaire',
        'sport',
        40
      );
      
      this.eventService.createEvent(
        'Atelier Programmation',
        'Initiation à la programmation web avec HTML, CSS et JavaScript',
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14, 9, 30),
        'Salle informatique 203',
        'atelier',
        25
      );
    }
  }

  private renderApp(): void {
    this.events = this.eventService.getAllEvents();
    
    const appHTML = `
      <style>
        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f5f5f5;
          --text-primary: #333333;
          --text-secondary: #666666;
          --border-color: #e0e0e0;
          --btn-primary-bg: #007bff;
          --btn-primary-hover: #0056b3;
        }

        html.dark-mode {
          --bg-primary: #1e1e1e;
          --bg-secondary: #2d2d2d;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --border-color: #404040;
          --btn-primary-bg: #0056b3;
          --btn-primary-hover: #003d82;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          transition: background-color 0.3s, color 0.3s;
        }

        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .header {
          background: linear-gradient(135deg, var(--btn-primary-bg) 0%, #0056b3 100%);
          color: white;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .logo h1 {
          font-size: 28px;
          margin-bottom: 5px;
        }

        .subtitle {
          font-size: 12px;
          opacity: 0.9;
        }

        .header-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .theme-toggle {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }

        .theme-toggle:hover {
          background: rgba(255,255,255,0.3);
        }

        .main-content {
          display: flex;
          flex: 1;
          gap: 20px;
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .sidebar {
          width: 280px;
          background-color: var(--bg-secondary);
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          height: fit-content;
        }

        .sidebar-section {
          margin-bottom: 25px;
        }

        .sidebar-section h3 {
          font-size: 16px;
          margin-bottom: 15px;
          color: var(--text-primary);
        }

        .filter-group {
          margin-bottom: 15px;
        }

        .filter-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .form-select, .form-input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 5px;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-size: 14px;
          margin-bottom: 10px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background-color: var(--bg-primary);
          border-radius: 5px;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .stat-value {
          font-weight: bold;
          color: var(--btn-primary-bg);
        }

        .events-section {
          flex: 1;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 20px;
        }

        .section-header h2 {
          font-size: 24px;
        }

        .search-box {
          flex: 1;
          max-width: 400px;
        }

        #searchInput {
          width: 100%;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .event-card {
          background-color: var(--bg-secondary);
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid var(--border-color);
        }

        .event-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }

        .event-card.past {
          opacity: 0.7;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .event-category {
          display: inline-block;
          padding: 5px 12px;
          background-color: var(--btn-primary-bg);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .past-badge {
          padding: 5px 12px;
          background-color: #dc3545;
          color: white;
          border-radius: 20px;
          font-size: 12px;
        }

        .event-title {
          font-size: 18px;
          margin-bottom: 10px;
          color: var(--text-primary);
        }

        .event-description {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .event-details {
          margin-bottom: 15px;
        }

        .detail {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .detail span:first-child {
          min-width: 20px;
        }

        .event-registrations {
          background-color: var(--bg-primary);
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .registrations-count {
          font-weight: bold;
          color: var(--btn-primary-bg);
        }

        .event-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary, .btn-outline, .btn-danger {
          padding: 10px 16px;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 600;
          flex: 1;
          min-width: 100px;
        }

        .btn-primary {
          background-color: var(--btn-primary-bg);
          color: white;
        }

        .btn-primary:hover {
          background-color: var(--btn-primary-hover);
        }

        .btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #5a6268;
        }

        .btn-outline {
          background-color: transparent;
          color: var(--btn-primary-bg);
          border: 1px solid var(--btn-primary-bg);
        }

        .btn-outline:hover {
          background-color: var(--btn-primary-bg);
          color: white;
        }

        .btn-danger {
          background-color: #dc3545;
          color: white;
          flex: 0;
        }

        .btn-danger:hover {
          background-color: #c82333;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: var(--bg-primary);
          border-radius: 8px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        }

        .modal-content h2 {
          margin-bottom: 15px;
          color: var(--text-primary);
        }

        .modal-content p {
          color: var(--text-secondary);
          margin-bottom: 15px;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .modal-actions button {
          flex: 1;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .main-content {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }

          .header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .section-header {
            flex-direction: column;
          }
        }
      </style>

      <div class="app-container">
        <header class="header">
          <div class="logo">
            <h1>🎯 Gestion d'Événements</h1>
            <p class="subtitle">Application TypeScript - Licence 2</p>
          </div>
          <div class="header-actions">
            <button id="themeToggle" class="theme-toggle">
              ${this.isDarkMode ? '☀️ Clair' : '🌙 Sombre'}
            </button>
            <button id="createEventBtn" class="btn-primary">+ Créer un événement</button>
          </div>
        </header>

        <div class="main-content">
          <aside class="sidebar">
            <div class="sidebar-section">
              <h3>🔍 Filtres</h3>
              <div class="filter-group">
                <label>Catégorie</label>
                <select id="categoryFilter" class="form-select">
                  <option value="">Toutes les catégories</option>
                  <option value="conférence">Conférence</option>
                  <option value="sport">Sport</option>
                  <option value="atelier">Atelier</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Date</label>
                <select id="dateFilter" class="form-select">
                  <option value="all">Toutes les dates</option>
                  <option value="upcoming">À venir</option>
                  <option value="past">Passés</option>
                </select>
              </div>
              <button id="applyFilters" class="btn-primary">Appliquer les filtres</button>
            </div>

            <div class="sidebar-section stats">
              <h3>📊 Statistiques</h3>
              <div class="stat-item">
                <span>Événements total</span>
                <span class="stat-value">${this.events.length}</span>
              </div>
              <div class="stat-item">
                <span>À venir</span>
                <span class="stat-value">${this.events.filter(e => !e.isPast()).length}</span>
              </div>
              <div class="stat-item">
                <span>Inscriptions total</span>
                <span class="stat-value">${this.events.reduce((sum, e) => sum + e.registrations.length, 0)}</span>
              </div>
            </div>
          </aside>

          <main class="events-section">
            <div class="section-header">
              <h2>📅 Événements (${this.events.length})</h2>
              <div class="search-box">
                <input type="text" id="searchInput" placeholder="Rechercher un événement...">
              </div>
            </div>

            <div id="eventsContainer" class="events-grid">
              ${this.renderEvents()}
            </div>
          </main>
        </div>

        <div id="createEventModal" class="modal" style="display: none;">
          <div class="modal-content">
            <h2>Créer un nouvel événement</h2>
            <form id="eventForm">
              <input type="text" id="eventTitle" placeholder="Titre de l'événement" required class="form-input">
              <textarea id="eventDescription" placeholder="Description" required class="form-input" rows="3"></textarea>
              <input type="datetime-local" id="eventDate" required class="form-input">
              <input type="text" id="eventLocation" placeholder="Lieu" required class="form-input">
              <select id="eventCategory" required class="form-input">
                <option value="">Catégorie</option>
                <option value="conférence">Conférence</option>
                <option value="sport">Sport</option>
                <option value="atelier">Atelier</option>
                <option value="autre">Autre</option>
              </select>
              <input type="number" id="eventCapacity" placeholder="Capacité maximale" min="1" required class="form-input">
              <div class="modal-actions">
                <button type="submit" class="btn-primary">Créer l'événement</button>
                <button type="button" id="cancelCreate" class="btn-secondary">Annuler</button>
              </div>
            </form>
          </div>
        </div>

        <div id="registrationModal" class="modal" style="display: none;">
          <div class="modal-content"></div>
        </div>

        <div id="detailsModal" class="modal" style="display: none;">
          <div class="modal-content"></div>
        </div>
      </div>
    `;

    document.body.innerHTML = appHTML;
  }

  private renderEvents(): string {
    if (this.events.length === 0) {
      return `<div class="empty-state"><p>Aucun événement trouvé</p></div>`;
    }

    return this.events.map(event => {
      const isPast = event.isPast();
      const spotsAvailable = event.getAvailableSpaces();
      
      return `
        <div class="event-card ${isPast ? 'past' : ''}">
          <div class="event-header">
            <span class="event-category">${event.category}</span>
            ${isPast ? '<span class="past-badge">Terminé</span>' : ''}
          </div>
          <h3 class="event-title">${event.title}</h3>
          <p class="event-description">${event.description}</p>
          <div class="event-details">
            <div class="detail">
              <span>📅</span>
              <span>${event.getFormattedDate()}</span>
            </div>
            <div class="detail">
              <span>📍</span>
              <span>${event.location}</span>
            </div>
            <div class="detail">
              <span>👥</span>
              <span>${event.registrations.length}/${event.maxCapacity} inscrits</span>
            </div>
          </div>
          <div class="event-registrations">
            Places disponibles: <span class="registrations-count">${spotsAvailable}</span>
          </div>
          <div class="event-actions">
            ${!isPast && spotsAvailable > 0 ? `
              <button class="btn-primary register-btn" data-id="${event.id}">
                S'inscrire
              </button>
            ` : ''}
            <button class="btn-outline details-btn" data-id="${event.id}">
              Détails
            </button>
            <button class="btn-danger delete-btn" data-id="${event.id}">
              Supprimer
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  private setupEventListeners(): void {
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      this.toggleTheme();
      this.renderApp();
      this.setupEventListeners();
    });

    document.getElementById('createEventBtn')?.addEventListener('click', () => {
      this.showCreateEventModal();
    });

    document.getElementById('eventForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateEvent();
    });

    document.getElementById('cancelCreate')?.addEventListener('click', () => {
      document.getElementById('createEventModal')!.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('register-btn')) {
        const eventId = target.dataset.id;
        if (eventId) this.showRegistrationModal(parseInt(eventId));
      }
      
      if (target.classList.contains('details-btn')) {
        const eventId = target.dataset.id;
        if (eventId) this.showEventDetails(parseInt(eventId));
      }

      if (target.classList.contains('delete-btn')) {
        const eventId = target.dataset.id;
        if (eventId) this.handleDeleteEvent(parseInt(eventId));
      }
    });

    document.getElementById('applyFilters')?.addEventListener('click', () => {
      this.applyFilters();
    });

    document.getElementById('searchInput')?.addEventListener('input', (e) => {
      this.handleSearch((e.target as HTMLInputElement).value);
    });
  }

  private showCreateEventModal(): void {
    const modal = document.getElementById('createEventModal')!;
    modal.style.display = 'block';
    
    const dateInput = document.getElementById('eventDate') as HTMLInputElement;
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    dateInput.min = localDateTime;
  }

  private handleCreateEvent(): void {
    const title = (document.getElementById('eventTitle') as HTMLInputElement).value;
    const description = (document.getElementById('eventDescription') as HTMLTextAreaElement).value;
    const date = new Date((document.getElementById('eventDate') as HTMLInputElement).value);
    const location = (document.getElementById('eventLocation') as HTMLInputElement).value;
    const category = (document.getElementById('eventCategory') as HTMLSelectElement).value;
    const capacity = parseInt((document.getElementById('eventCapacity') as HTMLInputElement).value);

    if (!title || !description || !location || !category || !capacity) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.eventService.createEvent(title, description, date, location, category, capacity);
    document.getElementById('createEventModal')!.style.display = 'none';
    this.renderApp();
    this.setupEventListeners();
    alert('✅ Événement créé avec succès !');
  }

  private handleDeleteEvent(eventId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.eventService.deleteEvent(eventId);
      this.renderApp();
      this.setupEventListeners();
      alert('✅ Événement supprimé !');
    }
  }

  private showRegistrationModal(eventId: number): void {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    const modalContent = `
      <h2>Inscription à: ${event.title}</h2>
      <p>Veuillez utiliser une adresse email institutionnelle (.edu, .ac, .univ)</p>
      <form id="registerForm">
        <input type="text" id="userName" placeholder="Votre nom complet" required class="form-input">
        <input type="email" id="userEmail" placeholder="ex: etudiant@universite.edu" required class="form-input">
        <div class="modal-actions">
          <button type="submit" class="btn-primary">Confirmer l'inscription</button>
          <button type="button" id="cancelRegister" class="btn-secondary">Annuler</button>
        </div>
      </form>
    `;

    const modal = document.getElementById('registrationModal')!;
    const content = modal.querySelector('.modal-content')!;
    content.innerHTML = modalContent;
    modal.style.display = 'block';

    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegistration(event);
    });

    document.getElementById('cancelRegister')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  private handleRegistration(event: EventItem): void {
    const name = (document.getElementById('userName') as HTMLInputElement).value;
    const email = (document.getElementById('userEmail') as HTMLInputElement).value;

    if (!name || !email) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (!email.includes('.edu') && !email.includes('.ac.') && !email.includes('.univ')) {
      alert('Veuillez utiliser une adresse email institutionnelle');
      return;
    }

    if (this.eventService.registerToEvent(event.id, email)) {
      document.getElementById('registrationModal')!.style.display = 'none';
      this.renderApp();
      this.setupEventListeners();
      alert('✅ Inscription réussie !');
    } else {
      alert('❌ Inscription échouée. Les places sont peut-être complètes ou vous êtes déjà inscrit.');
    }
  }

  private showEventDetails(eventId: number): void {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    const registrations = event.registrations.length > 0 
      ? `\n\n📋 Inscrits (${event.registrations.length}):\n${event.registrations.join('\n')}`
      : '\n\n📋 Aucun inscrit';

    const modalContent = `
      <h2>${event.title}</h2>
      <div class="event-details">
        <div class="detail"><span>📝</span><span>${event.description}</span></div>
        <div class="detail"><span>📅</span><span>${event.getFormattedDate()}</span></div>
        <div class="detail"><span>📍</span><span>${event.location}</span></div>
        <div class="detail"><span>🏷️</span><span>${event.category}</span></div>
        <div class="detail"><span>👥</span><span>${event.registrations.length}/${event.maxCapacity} inscrits</span></div>
        <div class="detail"><span>${event.isPast() ? '❌' : '✅'}</span><span>${event.isPast() ? 'Événement terminé' : 'Événement à venir'}</span></div>
      </div>
      <h3 style="margin-top: 20px;">Inscrits (${event.registrations.length})</h3>
      <div style="max-height: 200px; overflow-y: auto; background-color: var(--bg-secondary); padding: 10px; border-radius: 5px; margin-bottom: 20px;">
        ${event.registrations.length > 0 
          ? event.registrations.map(reg => `<p style="margin: 5px 0;">${reg}</p>`).join('')
          : '<p style="color: var(--text-secondary);">Aucun inscrit</p>'
        }
      </div>
      <div class="modal-actions">
        <button id="closeDetails" class="btn-secondary">Fermer</button>
      </div>
    `;

    const modal = document.getElementById('detailsModal')!;
    const content = modal.querySelector('.modal-content')!;
    content.innerHTML = modalContent;
    modal.style.display = 'block';

    document.getElementById('closeDetails')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  private applyFilters(): void {
    const categoryFilter = (document.getElementById('categoryFilter') as HTMLSelectElement).value;
    const dateFilter = (document.getElementById('dateFilter') as HTMLSelectElement).value;

    let filtered = this.events;

    if (categoryFilter) {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (dateFilter === 'upcoming') {
      filtered = filtered.filter(e => !e.isPast());
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(e => e.isPast());
    }

    this.events = filtered;
    this.renderFilteredEvents();
  }

  private handleSearch(query: string): void {
    const allEvents = this.eventService.getAllEvents();
    this.events = allEvents.filter(e => 
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.description.toLowerCase().includes(query.toLowerCase()) ||
      e.location.toLowerCase().includes(query.toLowerCase())
    );
    this.renderFilteredEvents();
  }

  private renderFilteredEvents(): void {
    const container = document.getElementById('eventsContainer')!;
    container.innerHTML = this.renderEvents();
    this.setupEventListeners();
  }
}

console.log("🔄 Initialisation de l'application...");
new EventApp();