// Code from https://stackoverflow.com/questions/53540348/js-async-await-tasks-queue
/* eslint-disable max-classes-per-file */
class Queue {
    private _items: any[];

    constructor() { this._items = []; }

    enqueue(item: any) { this._items.push(item); }

    dequeue() { return this._items.shift(); }

    get size() { return this._items.length; }
}

export class AutoQueue extends Queue {
    private _pendingPromise: boolean;

    constructor() {
        super();
        this._pendingPromise = false;
    }

    enqueue(action: Function) {
        return new Promise((resolve, reject) => {
            super.enqueue({ action, resolve, reject });
            this.dequeue();
        });
    }

    async dequeue() {
        if (this._pendingPromise) return false;

        const item = super.dequeue();

        if (!item) return false;

        try {
            this._pendingPromise = true;

            const payload = await item.action(this);

            this._pendingPromise = false;
            item.resolve(payload);
        } catch (e) {
            this._pendingPromise = false;
            item.reject(e);
        } finally {
            this.dequeue();
        }

        return true;
    }
}
