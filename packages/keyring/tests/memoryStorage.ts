import { KeyRingStorage } from "@enkryptcom/types"

class MemoryStorage implements KeyRingStorage {

    private storage: { [key: string]: string } = {}

    getItem(key: string): string {
        return this.storage[key]
    }

    setItem(key: string, value: string): void {
        this.storage[key] = value
    };

    removeItem(key: string): void {
        delete this.storage[key]
    }

    clear(): void {
        this.storage = {}
    }
}

export default MemoryStorage