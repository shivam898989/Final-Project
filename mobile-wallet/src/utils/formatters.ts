/**
 * Crypto utilities for the mobile wallet
 */

/**
 * Truncate a DID or address for display
 */
export function truncateAddress(address: string, chars = 6): string {
    if (address.length <= chars * 2 + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Truncate a DID for display
 */
export function truncateDID(did: string, chars = 8): string {
    const parts = did.split(':');
    if (parts.length < 3) return did;
    const identifier = parts.slice(2).join(':');
    return `${parts[0]}:${parts[1]}:${truncateAddress(identifier, chars)}`;
}

/**
 * Format a currency value for Indian Rupees
 */
export function formatINR(amount: number): string {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format a date for display
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format relative time
 */
export function timeAgo(dateString: string): string {
    const seconds = Math.floor(
        (Date.now() - new Date(dateString).getTime()) / 1000
    );
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
}
