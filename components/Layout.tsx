import React, { ReactNode } from 'react';
import DashboardLayout from './layouts/DashboardLayout';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;
