import { Event, EventCategory } from '../models/Event';

export class EventService {
    private events: Event[] = [];
    private static instance: EventService;

    private constructor() {}

    public static getInstance(): EventService {
        if (!EventService.instance) {
            EventService.instance = new EventService();
        }
        return EventService.instance;
    }

    public createEvent(
        title: string,
        description: string,
        date: Date,
        location: string,
        category: EventCategory,
        maxCapacity: number
    ): Event {
        const event = new Event(title, description, date, location, category, maxCapacity);
        this.events.push(event);
        this.saveToLocalStorage();
        return event;
    }

    public getAllEvents(): Event[] {
        this.loadFromLocalStorage();
        return [...this.events].sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    public getEventById(id: number): Event | undefined {
        return this.events.find(event => event.id === id);
    }

    public filterEvents(category?: EventCategory): Event[] {
        if (!category) return this.getAllEvents();
        return this.events.filter(event => event.category === category);
    }

    public deleteEvent(id: number): boolean {
        const index = this.events.findIndex(event => event.id === id);
        if (index !== -1) {
            this.events.splice(index, 1);
            this.saveToLocalStorage();
            return true;
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
                const event = new Event(
                    data.title,
                    data.description,
                    new Date(data.date),
                    data.location,
                    data.category,
                    data.maxCapacity
                );
                event.id = data.id;
                return event;
            });
        }
    }

    public initializeDemoData(): void {
        if (this.events.length === 0) {
            const today = new Date();
            this.createEvent(
                'Conférence IA',
                'Découvrez les dernières avancées en intelligence artificielle',
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 14, 0),
                'Amphithéâtre A',
                EventCategory.CONFERENCE,
                100
            );
            
            this.createEvent(
                'Tournoi Football',
                'Tournoi inter-classes de football',
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 0),
                'Stade universitaire',
                EventCategory.SPORT,
                40
            );
        }
    }
}