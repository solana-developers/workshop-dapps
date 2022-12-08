import React from 'react';

const cn = (...args: string[]) => args.join(' ');

type CardProps = {
    className?: string;
    children?: React.ReactNode;
    tabIndex?: number;
    blur?: boolean;
    border?: boolean;
};

const Card = ({
    className,
    children,
    tabIndex,
    border = true,
    blur = true,
}: CardProps) =>

    (
        <div
            className={cn(
                className,
                border && 'border border-white',
                blur &&
                ' bg-base bg-opacity-70 backdrop-blur-lg firefox:bg-opacity-90',
                'rounded-3xl',
            )}
            tabIndex={tabIndex}
        >
            {children}
        </div>
    )

export default Card;
