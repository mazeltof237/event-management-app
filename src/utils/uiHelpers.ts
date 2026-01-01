export class UIHelpers {
    static showNotification(message: string, type: 'success' | 'error' = 'success', duration: number = 3000): void {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), duration);
    }

    static getCategoryColor(category: string): string {
        const colors: Record<string, string> = {
            'conférence': '#4CAF50',
            'sport': '#2196F3',
            'atelier': '#FF9800',
            'autre': '#9C27B0'
        };
        return colors[category] || '#757575';
    }
}