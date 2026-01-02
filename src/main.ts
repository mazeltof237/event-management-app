// Classes de base
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

// Service de gestion
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

    getEventById(id: number): EventItem | undefined {
        return this.events.find(e => e.id === id);
    }

    deleteEvent(eventId: number): boolean {
        const index = this.events.findIndex(e => e.id === eventId);
        if (index !== -1) {
            this.events.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    registerToEvent(eventId: number, userEmail: string): boolean {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            const canRegister = event.canRegister();
            const alreadyRegistered = event.registrations.some(reg => reg === userEmail);
            
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
                event.id = data.id;
                event.registrations = data.registrations || [];
                return event;
            });
        }
    }
}

// Helper pour l'interface
class UIHelper {
    static showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        // Supprimer les notifications existantes
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    static formatCategory(category: string): string {
        const categoryMap: Record<string, string> = {
            'conférence': 'Conférence',
            'sport': 'Sport',
            'atelier': 'Atelier',
            'autre': 'Autre'
        };
        return categoryMap[category] || category;
    }

    static getCategoryColor(category: string): string {
        const colorMap: Record<string, string> = {
            'conférence': '#4CAF50',
            'sport': '#2196F3',
            'atelier': '#FF9800',
            'autre': '#9C27B0'
        };
        return colorMap[category] || '#757575';
    }
}

// Application principale
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
                'Conférence sur l\'Intelligence Artificielle',
                'Explorez les dernières avancées en IA avec des experts du domaine. Discussion sur l\'éthique et l\'avenir de la technologie.',
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 14, 0),
                'Amphithéâtre A - Bâtiment Principal',
                'conférence',
                150
            );
            
            this.eventService.createEvent(
                'Tournoi Inter-Universités de Basketball',
                'Compétition sportive entre les meilleures équipes universitaires. Finale sous les projecteurs !',
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 0),
                'Complexe Sportif Universitaire',
                'sport',
                60
            );
            
            this.eventService.createEvent(
                'Atelier Développement Web FullStack',
                'Apprenez à créer des applications web modernes avec les dernières technologies. Session pratique.',
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14, 9, 30),
                'Salle Informatique 301',
                'atelier',
                25
            );
            
            this.eventService.createEvent(
                'Gala Annuel des Diplômés',
                'Célébration de la réussite académique avec cocktails, dîner et networking professionnel.',
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21, 20, 0),
                'Grand Palais des Événements',
                'autre',
                200
            );
        }
    }

    private renderApp(): void {
        this.events = this.eventService.getAllEvents();
        
        const appContainer = document.getElementById('app')!;
        appContainer.innerHTML = `
            <div class="app-container">
                <!-- Header -->
                <header class="header">
                    <div class="header-content">
                        <div class="logo">
                            <div class="logo-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="logo-text">
                                <h1>EventManager Pro</h1>
                                <p>Gestion avancée d'événements académiques</p>
                            </div>
                        </div>
                        <div class="header-controls">
                            <button id="themeToggle" class="theme-toggle">
                                <i class="fas ${this.isDarkMode ? 'fa-sun' : 'fa-moon'}"></i>
                            </button>
                            <button id="createEventBtn" class="btn-primary">
                                <i class="fas fa-plus"></i>
                                Nouvel Événement
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Dashboard -->
                <div class="dashboard">
                    <!-- Sidebar -->
                    <aside class="sidebar">
                        <!-- Filtres -->
                        <div class="sidebar-section">
                            <h3 class="sidebar-title">
                                <i class="fas fa-filter"></i>
                                Filtres
                            </h3>
                            <div class="filter-group">
                                <label class="filter-label">Catégorie</label>
                                <div class="select-wrapper">
                                    <select id="categoryFilter" class="form-select">
                                        <option value="">Toutes catégories</option>
                                        <option value="conférence">Conférence</option>
                                        <option value="sport">Sport</option>
                                        <option value="atelier">Atelier</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">Statut</label>
                                <div class="select-wrapper">
                                    <select id="dateFilter" class="form-select">
                                        <option value="all">Tous</option>
                                        <option value="upcoming">À venir</option>
                                        <option value="past">Passés</option>
                                    </select>
                                </div>
                            </div>
                            <button id="applyFilters" class="btn-primary" style="width: 100%; margin-top: 20px;">
                                <i class="fas fa-check"></i>
                                Appliquer
                            </button>
                        </div>

                        <!-- Statistiques -->
                        <div class="sidebar-section">
                            <h3 class="sidebar-title">
                                <i class="fas fa-chart-bar"></i>
                                Statistiques
                            </h3>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-value">${this.events.length}</div>
                                    <div class="stat-label">Événements total</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${this.events.filter(e => !e.isPast()).length}</div>
                                    <div class="stat-label">À venir</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${this.events.reduce((sum, e) => sum + e.registrations.length, 0)}</div>
                                    <div class="stat-label">Inscriptions</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <!-- Main Content -->
                    <main class="content">
                        <div class="content-header">
                            <h2 class="section-title">
                                <i class="fas fa-calendar-day"></i>
                                Événements Disponibles
                            </h2>
                            <div class="search-box">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" id="searchInput" class="search-input" placeholder="Rechercher un événement...">
                            </div>
                        </div>

                        <div id="eventsContainer" class="events-grid">
                            ${this.renderEvents()}
                        </div>
                    </main>
                </div>
            </div>

            <!-- Modal de création d'événement -->
            <div id="createEventModal" class="modal-overlay" style="display: none;">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-plus-circle"></i>
                            Créer un événement
                        </h3>
                    </div>
                    <div class="modal-body">
                        <form id="eventForm">
                            <div class="form-group">
                                <label class="form-label">Titre de l'événement</label>
                                <input type="text" id="eventTitle" class="form-input" placeholder="Ex: Conférence sur l'IA" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <textarea id="eventDescription" class="form-input" rows="4" placeholder="Décrivez votre événement..." required></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Date et heure</label>
                                <input type="datetime-local" id="eventDate" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Lieu</label>
                                <input type="text" id="eventLocation" class="form-input" placeholder="Ex: Centre des Congrès" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Catégorie</label>
                                <select id="eventCategory" class="form-input" required>
                                    <option value="">Sélectionner une catégorie</option>
                                    <option value="conférence">Conférence</option>
                                    <option value="sport">Sport</option>
                                    <option value="atelier">Atelier</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Capacité maximale</label>
                                <input type="number" id="eventCapacity" class="form-input" placeholder="50" min="1" required>
                            </div>
                            <div class="modal-actions">
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-check"></i>
                                    Créer l'événement
                                </button>
                                <button type="button" id="cancelCreate" class="btn-secondary">
                                    <i class="fas fa-times"></i>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal d'inscription -->
            <div id="registrationModal" class="modal-overlay" style="display: none;">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title" id="registrationTitle">
                            <i class="fas fa-user-plus"></i>
                            Inscription
                        </h3>
                    </div>
                    <div class="modal-body" id="registrationContent">
                        <!-- Contenu chargé dynamiquement -->
                    </div>
                </div>
            </div>

            <!-- Modal de détails -->
            <div id="detailsModal" class="modal-overlay" style="display: none;">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title" id="detailsTitle">
                            <i class="fas fa-info-circle"></i>
                            Détails
                        </h3>
                    </div>
                    <div class="modal-body" id="detailsContent">
                        <!-- Contenu chargé dynamiquement -->
                    </div>
                </div>
            </div>
        `;
    }

    private renderEvents(): string {
        if (this.events.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-calendar-times"></i>
                    </div>
                    <h3>Aucun événement trouvé</h3>
                    <p>Créez votre premier événement en cliquant sur "Nouvel Événement"</p>
                </div>
            `;
        }

        return this.events.map(event => {
            const isPast = event.isPast();
            const spotsAvailable = event.getAvailableSpaces();
            const registrationPercentage = (event.registrations.length / event.maxCapacity) * 100;
            const canRegister = event.canRegister();
            
            return `
                <div class="event-card ${isPast ? 'past' : ''}">
                    <div class="event-header">
                        <div class="event-category">${UIHelper.formatCategory(event.category)}</div>
                    </div>
                    <div class="event-content">
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-description">${event.description}</p>
                        
                        <div class="event-meta">
                            <div class="meta-item">
                                <div class="meta-icon">
                                    <i class="fas fa-calendar"></i>
                                </div>
                                <span>${event.getFormattedDate()}</span>
                            </div>
                            <div class="meta-item">
                                <div class="meta-icon">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                                <span>${event.location}</span>
                            </div>
                        </div>

                        <div class="capacity-bar">
                            <div class="capacity-fill" style="width: ${registrationPercentage}%"></div>
                        </div>
                        <div class="capacity-info">
                            <span>${event.registrations.length}/${event.maxCapacity} inscrits</span>
                            <span><strong>${spotsAvailable}</strong> places restantes</span>
                        </div>

                        <div class="event-actions">
                            ${canRegister ? `
                                <button class="btn-primary register-btn" data-id="${event.id}">
                                    <i class="fas fa-user-plus"></i>
                                    S'inscrire
                                </button>
                            ` : `
                                <button class="btn-secondary" disabled>
                                    <i class="fas ${isPast ? 'fa-ban' : 'fa-times-circle'}"></i>
                                    ${isPast ? 'Terminé' : 'Complet'}
                                </button>
                            `}
                            <button class="btn-outline details-btn" data-id="${event.id}">
                                <i class="fas fa-eye"></i>
                                Détails
                            </button>
                            <button class="btn-danger delete-btn" data-id="${event.id}">
                                <i class="fas fa-trash"></i>
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    private setupEventListeners(): void {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
            this.renderApp();
            this.setupEventListeners();
        });

        // Create event button
        document.getElementById('createEventBtn')?.addEventListener('click', () => {
            this.showCreateEventModal();
        });

        // Create event form
        document.getElementById('eventForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateEvent();
        });

        // Cancel create
        document.getElementById('cancelCreate')?.addEventListener('click', () => {
            document.getElementById('createEventModal')!.style.display = 'none';
        });

        // Apply filters
        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.applyFilters();
        });

        // Search input
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.handleSearch((e.target as HTMLInputElement).value);
        });

        // Event delegation for dynamic buttons
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const button = target.closest('button');
            
            if (!button) return;

            if (button.classList.contains('register-btn')) {
                const eventId = button.dataset.id;
                if (eventId) this.showRegistrationModal(parseInt(eventId));
            }
            
            if (button.classList.contains('details-btn')) {
                const eventId = button.dataset.id;
                if (eventId) this.showEventDetails(parseInt(eventId));
            }

            if (button.classList.contains('delete-btn')) {
                const eventId = button.dataset.id;
                if (eventId) this.handleDeleteEvent(parseInt(eventId));
            }
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
                (e.target as HTMLElement).style.display = 'none';
            }
        });
    }

    private showCreateEventModal(): void {
        const modal = document.getElementById('createEventModal')!;
        modal.style.display = 'flex';
        
        const dateInput = document.getElementById('eventDate') as HTMLInputElement;
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        dateInput.min = localDateTime;
        dateInput.value = localDateTime;
    }

    private handleCreateEvent(): void {
        const title = (document.getElementById('eventTitle') as HTMLInputElement).value;
        const description = (document.getElementById('eventDescription') as HTMLTextAreaElement).value;
        const date = new Date((document.getElementById('eventDate') as HTMLInputElement).value);
        const location = (document.getElementById('eventLocation') as HTMLInputElement).value;
        const category = (document.getElementById('eventCategory') as HTMLSelectElement).value;
        const capacity = parseInt((document.getElementById('eventCapacity') as HTMLInputElement).value);

        if (!title || !description || !location || !category || !capacity) {
            UIHelper.showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }

        if (date < new Date()) {
            UIHelper.showNotification('La date doit être dans le futur', 'error');
            return;
        }

        if (capacity < 1) {
            UIHelper.showNotification('La capacité doit être d\'au moins 1 personne', 'error');
            return;
        }

        this.eventService.createEvent(title, description, date, location, category, capacity);
        document.getElementById('createEventModal')!.style.display = 'none';
        this.renderApp();
        this.setupEventListeners();
        UIHelper.showNotification('Événement créé avec succès !', 'success');
    }

    private handleDeleteEvent(eventId: number): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            if (this.eventService.deleteEvent(eventId)) {
                this.renderApp();
                this.setupEventListeners();
                UIHelper.showNotification('Événement supprimé avec succès', 'success');
            }
        }
    }

    private showRegistrationModal(eventId: number): void {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const modal = document.getElementById('registrationModal')!;
        const title = document.getElementById('registrationTitle')!;
        const content = document.getElementById('registrationContent')!;

        title.innerHTML = `<i class="fas fa-user-plus"></i> Inscription : ${event.title}`;
        content.innerHTML = `
            <form id="registerForm">
                <div class="form-group">
                    <label class="form-label">Nom complet</label>
                    <input type="text" id="userName" class="form-input" placeholder="Votre nom" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email institutionnel</label>
                    <input type="email" id="userEmail" class="form-input" placeholder="ex: etudiant@universite.edu" required>
                    <small style="color: var(--text-secondary); font-size: 13px; display: block; margin-top: 6px;">
                        <i class="fas fa-info-circle"></i>
                        Utilisez une adresse email institutionnelle (.edu, .ac., .univ)
                    </small>
                </div>
                <div class="form-group">
                    <div style="background: rgba(99, 102, 241, 0.1); padding: 16px; border-radius: 10px; border: 1px solid rgba(99, 102, 241, 0.2);">
                        <p style="margin-bottom: 8px; font-weight: 600;"><i class="fas fa-clipboard-list"></i> Récapitulatif :</p>
                        <p><i class="fas fa-calendar"></i> ${event.getFormattedDate()}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                        <p><i class="fas fa-users"></i> ${event.getAvailableSpaces()} places disponibles</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-check"></i>
                        Confirmer l'inscription
                    </button>
                    <button type="button" id="cancelRegister" class="btn-secondary">
                        <i class="fas fa-times"></i>
                        Annuler
                    </button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';

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
            UIHelper.showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }

        // Validation email institutionnel
        const institutionalDomains = ['.edu', '.ac.', '.univ', '.universite', '.school', '.college'];
        const isInstitutional = institutionalDomains.some(domain => email.toLowerCase().includes(domain));
        
        if (!isInstitutional) {
            UIHelper.showNotification('Veuillez utiliser une adresse email institutionnelle valide', 'error');
            return;
        }

        if (this.eventService.registerToEvent(event.id, email)) {
            document.getElementById('registrationModal')!.style.display = 'none';
            this.renderApp();
            this.setupEventListeners();
            UIHelper.showNotification('Inscription réussie ! Vous recevrez une confirmation par email.', 'success');
        } else {
            UIHelper.showNotification('Impossible de vous inscrire (places complètes ou déjà inscrit)', 'error');
        }
    }

    private showEventDetails(eventId: number): void {
        const event = this.eventService.getEventById(eventId);
        if (!event) return;

        const modal = document.getElementById('detailsModal')!;
        const title = document.getElementById('detailsTitle')!;
        const content = document.getElementById('detailsContent')!;

        title.textContent = event.title;
        content.innerHTML = `
            <div style="margin-bottom: 24px;">
                <p style="font-size: 15px; line-height: 1.6; color: var(--text-primary); margin-bottom: 20px;">${event.description}</p>
            </div>

            <div style="background: rgba(99, 102, 241, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.1);">
                <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--text-primary);">
                    <i class="fas fa-info-circle"></i> Informations
                </h4>
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Date</div>
                            <div style="font-weight: 500;">${event.getFormattedDate()}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Lieu</div>
                            <div style="font-weight: 500;">${event.location}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                            <i class="fas fa-tag"></i>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Catégorie</div>
                            <div style="font-weight: 500;">${UIHelper.formatCategory(event.category)}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                            <i class="fas fa-users"></i>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Capacité</div>
                            <div style="font-weight: 500;">${event.registrations.length}/${event.maxCapacity} inscrits</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                            ${event.isPast() ? '<i class="fas fa-ban"></i>' : '<i class="fas fa-check"></i>'}
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Statut</div>
                            <div style="font-weight: 500;">${event.isPast() ? 'Terminé' : 'À venir'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="background: rgba(99, 102, 241, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="font-size: 16px; font-weight: 600; color: var(--text-primary);">
                        <i class="fas fa-users"></i> Participants
                    </h4>
                    <span style="font-size: 14px; color: var(--text-secondary);">${event.registrations.length} inscrits</span>
                </div>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${event.registrations.length > 0 
                        ? event.registrations.map(email => `
                            <div style="padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border-color);">
                                <div style="font-weight: 500; font-size: 14px; color: var(--text-primary);">
                                    <i class="fas fa-user-circle"></i> ${email}
                                </div>
                            </div>
                        `).join('')
                        : `<div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                            <div style="font-size: 32px; margin-bottom: 8px;">
                                <i class="fas fa-user-slash"></i>
                            </div>
                            <p>Aucun participant pour le moment</p>
                          </div>`
                    }
                </div>
            </div>

            <div class="modal-actions">
                <button id="closeDetails" class="btn-primary">
                    <i class="fas fa-times"></i>
                    Fermer
                </button>
            </div>
        `;

        modal.style.display = 'flex';

        document.getElementById('closeDetails')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    private applyFilters(): void {
        const categoryFilter = (document.getElementById('categoryFilter') as HTMLSelectElement).value;
        const dateFilter = (document.getElementById('dateFilter') as HTMLSelectElement).value;

        let filtered = this.eventService.getAllEvents();

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
        
        // Mettre à jour les statistiques
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards[0]) {
            statCards[0].querySelector('.stat-value')!.textContent = this.events.length.toString();
            statCards[0].querySelector('.stat-label')!.textContent = 'Événements total';
        }
        if (statCards[1]) {
            statCards[1].querySelector('.stat-value')!.textContent = this.events.filter(e => !e.isPast()).length.toString();
            statCards[1].querySelector('.stat-label')!.textContent = 'À venir';
        }
        if (statCards[2]) {
            statCards[2].querySelector('.stat-value')!.textContent = this.events.reduce((sum, e) => sum + e.registrations.length, 0).toString();
            statCards[2].querySelector('.stat-label')!.textContent = 'Inscriptions';
        }
        
        this.setupEventListeners();
    }
}

// Démarrer l'application
console.log("🚀 Application TypeScript démarrée !");
new EventApp();