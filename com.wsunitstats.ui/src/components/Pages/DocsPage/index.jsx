import * as React from 'react';
import { ExplorerTree } from 'components/Pages/DocsPage/ExplorerTree';
import { Box } from '@mui/material';

function generateTreeData(size, depth) {
  const root = {
    id: 'root',
    label: '/',
    depth: 0,
    isLast: true,
    isExpanded: true,
    children: []
  };

  let idCounter = 0;
  let currentItems;
  let nextItems = [root];
  for (let i = 1; i < depth + 1; ++i) {
    currentItems = nextItems;
    nextItems = [];
    for (let j = 0; j < currentItems.length; ++j) {
      const currentItem = currentItems[j];
      const currentItemChildren = currentItem.children;
      for (let k = 0; k < size; ++k) {
        const id = (idCounter++).toString() + '-' + i.toString();
        const child = {
          id: id,
          label: id,
          depth: i,
          parent: currentItem.id,
          isLast: k + 1 >= size,
          children: []
        };
        nextItems.push(child);
        currentItemChildren.push(child);
      }
    }
  }

  return [root];
}

export default function DocsPage() {
  const testTree = React.useMemo(() => generateTreeData(10, 4), []);

  return (
    <Box width='100%' height={300}>
      <ExplorerTree treeData={testTree}/>
    </Box>
  );
};