export class User {
    private static nextId = 1;
    
    public id: number;
    public name: string;
    public email: string;
    public registeredAt: Date;

    constructor(name: string, email: string) {
        if (!name || name.trim().length < 2) {
            throw new Error('Le nom doit contenir au moins 2 caractères');
        }

        if (!this.isValidInstitutionalEmail(email)) {
            throw new Error('Veuillez utiliser une adresse email institutionnelle (.edu, .ac, .univ, etc.)');
        }

        this.id = User.nextId++;
        this.name = name.trim();
        this.email = email.toLowerCase().trim();
        this.registeredAt = new Date();
    }

    private isValidInstitutionalEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        const institutionalDomains = ['.edu', '.ac.', '.univ-', '.universite', '.school', '.college'];
        return institutionalDomains.some(domain => email.toLowerCase().includes(domain));
    }

    public getInitials(): string {
        const names = this.name.split(' ');
        return names.length >= 2 
            ? (names[0][0] + names[1][0]).toUpperCase()
            : this.name.substring(0, 2).toUpperCase();
    }
}