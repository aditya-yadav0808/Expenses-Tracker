import { Utensils, ShoppingCart, Car, ShoppingBag, Film, HeartPulse, Zap, Home, GraduationCap, Shield, Tag, Briefcase, Laptop, TrendingUp, Gift, Coffee, Plane, Smartphone, Music, Dumbbell, Wallet } from 'lucide-react';
export const ICONS = { Utensils, ShoppingCart, Car, ShoppingBag, Film, HeartPulse, Zap, Home, GraduationCap, Shield, Tag, Briefcase, Laptop, TrendingUp, Gift, Coffee, Plane, Smartphone, Music, Dumbbell, Wallet };
export const CategoryIcon = ({ name, ...props }) => { const I = ICONS[name] || Tag; return <I aria-hidden="true" {...props} />; };
