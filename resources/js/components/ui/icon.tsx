import type { IconType } from 'react-icons/lu';

interface IconProps {
    iconNode?: IconType | null;
    className?: string;
}

export function Icon({ iconNode: IconComponent, className }: IconProps) {
    if (!IconComponent) {
        return null;
    }

    return <IconComponent className={className} />;
}
