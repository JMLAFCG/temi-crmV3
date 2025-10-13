import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { paths, RouteKey, buildPath } from '../routes/paths';

interface SafeLinkProps {
  route: RouteKey;
  params?: Record<string, string>;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const SafeLink: FC<SafeLinkProps> = ({
  route,
  params,
  children,
  className,
  onClick,
}) => {
  const path = paths[route];
  if (!path) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Route inconnue: ${route}`);
    }
    return (
      <span className={`${className} cursor-not-allowed opacity-50`} aria-disabled="true">
        {children}
      </span>
    );
  }

  const finalPath = params ? buildPath(route, params) : path;

  return (
    <Link 
      className={className} 
      to={finalPath} 
      onClick={onClick}
      data-testid={`link-${route}`}
    >
      {children}
    </Link>
  );
};

export default SafeLink;
