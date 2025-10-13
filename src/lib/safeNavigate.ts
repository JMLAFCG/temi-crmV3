import { NavigateFunction } from 'react-router-dom';
import { buildPath, RouteKey } from '../routes/paths';

export function safeNavigate(
  navigate: NavigateFunction,
  route: RouteKey,
  params?: Record<string, string | number>,
  options?: { replace?: boolean }
): void {
  const path = buildPath(route, params);
  navigate(path, { replace: options?.replace });
}

export default safeNavigate;