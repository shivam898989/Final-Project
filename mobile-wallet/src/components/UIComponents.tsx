import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StatusBadgeProps {
    status: 'active' | 'expired' | 'revoked' | 'valid' | 'invalid' | 'pending';
}

/**
 * Reusable status badge component
 */
export function StatusBadge({ status }: StatusBadgeProps) {
    const colors: Record<string, string> = {
        active: '#00b894',
        valid: '#00b894',
        expired: '#f0a500',
        pending: '#f0a500',
        revoked: '#e94560',
        invalid: '#e94560',
    };

    const color = colors[status] || '#8b8b8b';

    return (
        <View style={[styles.badge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.badgeText, { color }]}>{status.toUpperCase()}</Text>
        </View>
    );
}

interface CardProps {
    title: string;
    children: React.ReactNode;
    accentColor?: string;
}

/**
 * Reusable card component with accent border
 */
export function Card({ title, children, accentColor = '#e94560' }: CardProps) {
    return (
        <View style={[styles.card, { borderLeftColor: accentColor }]}>
            {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
            {children}
        </View>
    );
}

interface ActionButtonProps {
    title: string;
    icon: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
}

/**
 * Reusable action button
 */
export function ActionButton({
    title,
    icon,
    onPress,
    variant = 'primary',
}: ActionButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.button, variant === 'secondary' && styles.buttonSecondary]}
            onPress={onPress}
        >
            <Text style={styles.buttonIcon}>{icon}</Text>
            <Text
                style={[
                    styles.buttonText,
                    variant === 'secondary' && styles.buttonTextSecondary,
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#16213e',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 3,
    },
    cardTitle: {
        color: '#e94560',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    button: {
        backgroundColor: '#e94560',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#0f3460',
    },
    buttonIcon: {
        fontSize: 18,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonTextSecondary: {
        color: '#e94560',
    },
});
