'use client';

import {usePathname} from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import React, {Fragment, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {Home} from "lucide-react";

const normalizePathname = (pathname: string) => {
  if (!pathname) return '/';
  return pathname.replace(/\/+$/, '') || '/';
};

const Breadcrumbs = () => {
  const rawPathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = useMemo(() => normalizePathname(rawPathname), [rawPathname]);

  const pathSegments = useMemo(
    () => pathname.split('/').filter(segment => segment !== ''),
    [pathname]
  );

  if (!mounted) {
    return null;
  }

  const isDashboard = pathname === '/dashboard';

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isDashboard ? (
            <BreadcrumbPage>
              <Home className="h-4 w-4" />
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isDashboard && pathSegments.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
        {!isDashboard && pathSegments.map((segment, index) => {
          const href = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          const label = segment
            .replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          return (
            <Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;