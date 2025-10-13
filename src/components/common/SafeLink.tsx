import type { ReactNode, FC } from 'react';
import { Link } from 'react-router-dom';
import { buildPath, RouteKey } from '../../routes/paths';

interface SafeLinkProps {
  route: RouteKey;
  params?: Record<string, string | number>;
  children: ReactNode;
  className?: string;
  replace?: boolean;
  prefetch?: 'intent' | 'none';
  onClick?: () => void;
}

export const SafeLink: FC<SafeLinkProps> = ({
  route,
  params,
  children,
  className,
  replace,
  onClick,
}) => {
  const path = buildPath(route, params);

  return (
    <Link
      to={path}
      className={className}
      replace={replace}
      onClick={onClick}
      data-testid={`link-${route}`}
    >
      {children}
    </Link>
  );
};

export default SafeLink;