export function toBytes32(addr: string): string {
    return `0x000000000000000000000000${addr.slice(2)}`;
}