import { Event } from '../models/Event';
import { User } from '../models/User';
import { Registration } from '../models/Registration';

export class RegistrationService {
    private registrations: Registration[] = [];
    private users: User[] = [];
    private static instance: RegistrationService;

    private constructor() {}

    public static getInstance(): RegistrationService {
        if (!RegistrationService.instance) {
            RegistrationService.instance = new RegistrationService();
        }
        return RegistrationService.instance;
    }

    public registerUser(event: Event, userName: string, userEmail: string): Registration {
        if (event.isPast()) {
            throw new Error('Cet événement est déjà passé');
        }

        const currentRegistrations = this.getEventRegistrations(event.id).length;
        if (currentRegistrations >= event.maxCapacity) {
            throw new Error('L\'événement est complet');
        }

        let user = this.findUserByEmail(userEmail);
        if (!user) {
            user = new User(userName, userEmail);
            this.users.push(user);
        }

        if (this.registrations.some(r => r.eventId === event.id && r.userId === user!.id && r.isActive())) {
            throw new Error('Vous êtes déjà inscrit à cet événement');
        }

        const registration = new Registration(event.id, user.id);
        this.registrations.push(registration);
        this.saveToLocalStorage();
        
        return registration;
    }

    public getEventRegistrations(eventId: number): Registration[] {
        return this.registrations.filter(reg => reg.eventId === eventId && reg.isActive());
    }

    private findUserByEmail(email: string): User | undefined {
        return this.users.find(user => user.email === email.toLowerCase());
    }

    public getUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    private saveToLocalStorage(): void {
        localStorage.setItem('registrations', JSON.stringify(this.registrations));
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    private loadFromLocalStorage(): void {
        const storedReg = localStorage.getItem('registrations');
        const storedUsers = localStorage.getItem('users');
        
        if (storedReg) this.registrations = JSON.parse(storedReg);
        if (storedUsers) this.users = JSON.parse(storedUsers);
    }
}