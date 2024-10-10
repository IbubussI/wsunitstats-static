import * as React from 'react';
import Box from '@mui/material/Box';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { ExplorerTreeItem } from 'components/Pages/DocsPage/ExplorerTreeItem';
import { ExplorerTreeVirtualized } from './ExplorerTreeVirtualized';

const MUI_X_PRODUCTS = [
  {
    id: 'root',
    label: 'root',
    depth: 0,
    isLast: true,
    children: [
      {
        id: '1',
        label: '1',
        depth: 1,
        parent: 'root',
        children: [
          {
            id: '1-1',
            label: '1-1',
            depth: 2,
            parent: '1',
          },
          {
            id: '1-2',
            label: '1-2',
            depth: 2,
            parent: '1',
            children: [
              {
                id: '1-2-1',
                label: '1-2-1',
                depth: 3,
                parent: '1-2',
              },
              {
                id: '1-2-2',
                label: '1-2-2',
                depth: 3,
                parent: '1-2',
              },
              {
                id: '1-2-3',
                label: '1-2-3',
                depth: 3,
                parent: '1-2',
                isLast: true
              },
            ]
          },
          {
            id: '1-3',
            label: '1-3',
            depth: 2,
            parent: '1',
            isLast: true,
            children: [
              {
                id: '1-3-1',
                label: '1-3-1',
                depth: 3,
                parent: '1-3',
              },
              {
                id: '1-3-2',
                label: '1-3-2',
                depth: 3,
                parent: '1-3',
              },
              {
                id: '1-3-3',
                label: '1-3-3',
                depth: 3,
                parent: '1-3',
                isLast: true,
                children: [
                  {
                    id: '1-3-3-1',
                    label: '1-3-3-1',
                    depth: 4,
                    parent: '1-3-3',
                  },
                  {
                    id: '1-3-3-2',
                    label: '1-3-3-2',
                    depth: 4,
                    parent: '1-3-3',
                  },
                  {
                    id: '1-3-3-3',
                    label: '1-3-3-3',
                    depth: 4,
                    parent: '1-3-3',
                    isLast: true
                  },
                ]
              },
            ]
          },
        ]
      },
      {
        id: '2',
        label: '2',
        depth: 1,
        parent: 'root',
      },
      {
        id: '3',
        label: '3',
        depth: 1,
        parent: 'root',
        isLast: true,
        children: [
          {
            id: '3-1',
            label: '3-1',
            depth: 2,
            parent: '3',
          },
          {
            id: '3-2',
            label: '3-2',
            depth: 2,
            parent: '3',
          },
          {
            id: '3-3',
            label: '3-3',
            depth: 2,
            parent: '3',
            isLast: true
          },
        ]
      },
    ],
  }
];

function generate(size, depth) {
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
  const generated = React.useMemo(() => generate(10, 4), []);

  /* Mui solution (not virtualized):
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <RichTreeView
        defaultExpandedItems={['root']}
        slots={{
          item: ExplorerTreeItem,
        }}
        items={generated}
      />
    </Box>
   */
  return (
    <Box sx = {{ display: 'flex', flexDirection: 'row'}}>
      
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <RichTreeView
        defaultExpandedItems={['root']}
        slots={{
          item: ExplorerTreeItem,
        }}
        items={generated}
      />
    </Box>

      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <ExplorerTreeVirtualized treeData={generated}/>
      </Box>
    </Box>
  );
};