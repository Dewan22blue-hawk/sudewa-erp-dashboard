import { LucideIcon } from 'lucide-react';
import React from 'react';

/**
 * Navigation Item Configuration
 * Supports hierarchical menu structure dengan parent-child relationships
 */
export interface MenuItem {
    label: string;
    href?: string;
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
    children?: MenuItem[];
    exact?: boolean;
}
