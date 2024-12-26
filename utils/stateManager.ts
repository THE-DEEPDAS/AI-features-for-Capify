class StateManager {
  private static readonly STORAGE_KEY = 'financial_advice';

  static setAdvice(advice: string[]): boolean {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(advice));
      return true;
    } catch (error) {
      console.error('Failed to store advice:', error);
      return false;
    }
  }

  static getAdvice(): string[] {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve advice:', error);
      return [];
    }
  }

  static clearAdvice(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear advice:', error);
    }
  }
}

export default StateManager;
