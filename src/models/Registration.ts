export class Registration {
    private static nextId = 1;
    
    public id: number;
    public eventId: number;
    public userId: number;
    public registeredAt: Date;
    public status: 'active' | 'cancelled';

    constructor(eventId: number, userId: number) {
        this.id = Registration.nextId++;
        this.eventId = eventId;
        this.userId = userId;
        this.registeredAt = new Date();
        this.status = 'active';
    }

    public isActive(): boolean {
        return this.status === 'active';
    }
}