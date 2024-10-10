import * as React from 'react';
import * as Constants from 'utils/constants';
import { ExplorerTree } from 'components/Pages/DocsPage/ExplorerTree';
import { Box, InputLabel, TextField } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import styled from '@emotion/styled';

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

const PANEL_DISTANCE = 8;

const PanelContent = styled(Box)(() => ({
  border: '1px solid #8ac8f4',
  height: '100%'
}));

const StyledPanelGroup = styled(PanelGroup)(() => ({
  flex: '1 1',
  height: 'inherit'
}));

const PageRoot = styled(Box)(() => ({
  display: 'flex',
  flex: '1 1',
  width: '100%',
  flexDirection: 'column',
  gap: 8,
  padding: 8
}));

const Input = styled('input')(() => ({
  border: 'none',
  width: '100%',
  outline: 'none'
}));

export default function DocsPage() {
  const testTree = React.useMemo(() => generateTreeData(10, 4), []);

  return (
    <PageRoot>
      <PanelContent>
        <Input text='text'></Input>
      </PanelContent>
      <StyledPanelGroup autoSaveId={Constants.LOCAL_MODS_COLUMN_1_RESIZABLE_ID} direction="horizontal">
        <Panel
          collapsible={true}
          defaultSize={20}
          order={1}>
          <PanelContent height={400}>
            <Box height='inherit' padding='1px'>
              <ExplorerTree treeData={testTree} />
            </Box>
          </PanelContent>
        </Panel>
        <PanelResizeHandle>
          <Box width={PANEL_DISTANCE} />
        </PanelResizeHandle>
        <Panel
          collapsible={true}
          defaultSize={40}
          order={2}>
          <PanelContent>content</PanelContent>
        </Panel>
      </StyledPanelGroup>
    </PageRoot>
  );
};