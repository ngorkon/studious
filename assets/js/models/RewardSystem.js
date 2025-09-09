class RewardSystem {
    constructor(store) {
        this.store = store;
        this.points = this.store.get('rewardPoints') || 0;
    }

    addPoints(amount) {
        this.points += amount;
        this.store.set('rewardPoints', this.points);
    }

    getPoints() {
        return this.points;
    }
}

