export enum EventCategory {
    CONFERENCE = 'conférence',
    SPORT = 'sport',
    WORKSHOP = 'atelier',
    OTHER = 'autre'
}

export class Event {
    private static nextId = 1;
    
    public id: number;
    public title: string;
    public description: string;
    public date: Date;
    public location: string;
    public category: EventCategory;
    public maxCapacity: number;
    public createdAt: Date;

    constructor(
        title: string,
        description: string,
        date: Date,
        location: string,
        category: EventCategory,
        maxCapacity: number
    ) {
        if (!title || title.trim().length < 3) {
            throw new Error('Le titre doit contenir au moins 3 caractères');
        }
        
        if (!description || description.trim().length < 10) {
            throw new Error('La description doit contenir au moins 10 caractères');
        }
        
        if (date <= new Date()) {
            throw new Error('La date doit être dans le futur');
        }
        
        if (!location || location.trim().length < 3) {
            throw new Error('Le lieu doit être spécifié');
        }
        
        if (maxCapacity < 1) {
            throw new Error('La capacité doit être d\'au moins 1 personne');
        }

        this.id = Event.nextId++;
        this.title = title.trim();
        this.description = description.trim();
        this.date = date;
        this.location = location.trim();
        this.category = category;
        this.maxCapacity = maxCapacity;
        this.createdAt = new Date();
    }

    public isPast(): boolean {
        return this.date < new Date();
    }

    public getFormattedDate(): string {
        return this.date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}