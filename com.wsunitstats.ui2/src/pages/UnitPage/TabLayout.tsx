import * as React from 'react';
import { GridGroup, ResizableGrid } from '@/components/layout/ResizableGrid';

interface TabLayoutProps {
  title: string;
  minWidth: number;
  columnWidth: number;
  paddingTop?: number;
  children: React.ReactNode;
}

/** Tab title and resizable container with a grid of the tab content */
export const TabLayout = ({ title, minWidth, columnWidth, paddingTop, children }: TabLayoutProps) => (
  <>
    <h3>{title}</h3>
    <ResizableGrid minWidth={minWidth} paddingTop={paddingTop}>
      <GridGroup columnWidth={columnWidth}>
        {children}
      </GridGroup>
    </ResizableGrid>
  </>
);
