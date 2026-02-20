import { User } from '../types';

const STORAGE_KEY = 'sway_users';
const CURRENT_USER_KEY = 'sway_current_user';
const DAILY_CREDITS = 10;

interface StoredUser extends User {
  password?: string; // In a real app, this would be hashed. Here it's just for simulation.
}

export const userService = {
  getUsers(): Record<string, StoredUser> {
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : {};
  },

  saveUsers(users: Record<string, StoredUser>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  },

  checkAndResetCredits(user: User): boolean {
    const today = new Date().toISOString().split('T')[0];
    if (user.lastCreditReset !== today) {
      user.credits = DAILY_CREDITS;
      user.lastCreditReset = today;
      return true;
    }
    return false;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (!userStr) return null;
    
    const tempUser = JSON.parse(userStr);
    const users = this.getUsers();
    const user = users[tempUser.email];
    
    if (user) {
      if (this.checkAndResetCredits(user)) {
        this.saveUsers(users);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
      return user;
    }
    return null;
  },

  login(email: string, name?: string): User {
    const users = this.getUsers();
    let user = users[email];
    const today = new Date().toISOString().split('T')[0];

    if (!user) {
      // New User
      user = {
        name: name || email.split('@')[0],
        email,
        isPremium: false,
        credits: DAILY_CREDITS,
        lastCreditReset: today,
      };
      users[email] = user;
    } else {
      // Existing User - Check Daily Reset
      this.checkAndResetCredits(user);
    }

    this.saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  deductCredit(email: string): User {
    const users = this.getUsers();
    const user = users[email];

    if (!user) throw new Error('User not found');

    // Check for reset before deducting
    this.checkAndResetCredits(user);

    if (user.isPremium) {
        this.saveUsers(users); // Save in case reset happened
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user; 
    }

    if (user.credits > 0) {
      user.credits -= 1;
      this.saveUsers(users);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } else {
      // Save in case reset happened (though unlikely to reach here if reset happened and gave 10 credits)
      this.saveUsers(users);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      throw new Error('Insufficient credits');
    }
  },

  upgradeUser(email: string): User {
    const users = this.getUsers();
    const user = users[email];

    if (!user) throw new Error('User not found');

    user.isPremium = true;
    // user.credits = 9999; // Optional: visually show unlimited or just rely on flag
    
    this.saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
};
