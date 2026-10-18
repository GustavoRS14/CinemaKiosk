import React from 'react';
import './Navbar.css';

export type NavbarProps = {
  className?: string;
  children?: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
};

export const Navbar = ({
  className = '',
  children,
  orientation = 'horizontal',
}: NavbarProps) => {
  return (
    <nav
      className={`navbar ${className}`.trim()}
      data-orientation={orientation}
    >
      {React.Children.map(children, (child) => {
        // Safely inject the Navbar's orientation into each NavbarButton child
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { orientation } as React.HTMLAttributes<HTMLElement>);
        }
        return child;
      })}
    </nav>
  );
};
