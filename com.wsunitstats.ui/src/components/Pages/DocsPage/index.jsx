import * as React from 'react';
import * as Constants from 'utils/constants';
import { ExplorerTree } from 'components/Pages/DocsPage/ExplorerTree';
import { Box, Typography } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import styled from '@emotion/styled';
import { useSearchParams } from 'react-router-dom';
import { useValuesToQueryStringSync } from 'components/Hooks/useValuesToQueryStringSync';
import { useReducer } from 'react';

function generateTreeData(size, depth) {
  console.log('generating data tree')
  const treeArray = [
    {
      id: 'root',
      label: 'root',
      depth: 0,
      isLast: true,
      isExpanded: true,
      children: []
    }
  ];

  const contextMap = {
    'root': {
      Name: 'root',
      Description: 'Root object'
    }
  };

  //let idCounter = 0;
  let currentItems;
  let nextItems = treeArray;
  for (let i = 1; i < depth + 1; ++i) {
    currentItems = nextItems;
    nextItems = [];
    for (let j = 0; j < currentItems.length; ++j) {
      const currentItem = currentItems[j];
      const currentItemChildren = currentItem.children;
      for (let k = 0; k < size; ++k) {
        //const subId = (idCounter++).toString() + '-' + i.toString();
        const subId = k.toString();
        const id = currentItem.id + Constants.EXPLORER_PATH_SEPARATOR + subId;
        const child = {
          id: id,
          label: subId,
          depth: i,
          parent: currentItem.id,
          isLast: k + 1 >= size,
          children: [],
        };
        nextItems.push(child);
        currentItemChildren.push(child);
        contextMap[id] = {
          textContent: {
            Name: subId,
            //Description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          }
        };
      }
    }
  }

  console.log('generating data tree done')
  return { tree: treeArray, context: contextMap };
  
}

const PANEL_DISTANCE = 8;

const PanelContent = styled(Box)(() => ({
  border: '1px solid #8ac8f4',
  height: '100%',
  backgroundColor: 'white'
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
  padding: 8,
  backgroundColor: '#a6daff80'
}));

const Input = styled('input')(() => ({
  border: 'none',
  width: '100%',
  outline: 'none'
}));

const reducer = (pageState, action) => {
  switch (action.type) {
    case 'input_changed': {
      return {
        nodeContext: pageState.nodeContext,
        input: action.input
      }
    }
    case 'path_changed': {
      return {
        nodeContext: action.nodeContext,
        input: action.input
      }
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
};

export const DocsPage = () => {
  const testTreeData = React.useMemo(() => generateTreeData(30, 3), []);
  const explorerTreeRef = React.useRef();
  const [searchParams] = useSearchParams();
  const { sync } = useValuesToQueryStringSync();
  const [pageState, dispatch] = useReducer(reducer, { input: '' });

  const getCurrentPath = React.useCallback(() => {
    return searchParams.get(Constants.PARAM_PATH) || '';
  }, [searchParams]);

  const setCurrentPath = React.useCallback((path) => {
    const map = new Map();
    map.set(Constants.PARAM_PATH, [path]);
    sync(map);
  }, [sync]);

  React.useEffect(() => {
    console.log('Docs page use effect');
    const path = getCurrentPath();
    dispatch({
      type: 'path_changed',
      nodeContext: testTreeData.context[path],
      input: path
    });
  }, [getCurrentPath, testTreeData.context]);

  const currentPath = getCurrentPath();
  const textContent = pageState.nodeContext?.textContent;
  console.log('render')
  return (
    <PageRoot>
      <PanelContent>
        <form onSubmit={(event) => {
          console.log('change path')
          // prevent page reload
          event.preventDefault();
          const path = event.target[0].value;
          setCurrentPath(path);
          explorerTreeRef.current.navigateToPath(path);
        }}>
          <Input text='text' value={pageState.input} onChange={(event) => dispatch({ type: 'input_changed', input: event.target.value})} />
        </form>
      </PanelContent>
      <StyledPanelGroup autoSaveId={Constants.LOCAL_MODS_COLUMN_1_RESIZABLE_ID} direction="horizontal">
        <Panel
          collapsible={true}
          defaultSize={20}
          order={1}>
          <PanelContent height={400}>
            <Box height='inherit' padding='1px'>
              <ExplorerTree
                ref={explorerTreeRef}
                tree={testTreeData.tree}
                onPathChange={setCurrentPath}
                currentPath={currentPath}
                onMounted={() => explorerTreeRef.current.navigateToPath(currentPath)} />
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
          <PanelContent style={{ padding: '8px' }}>
            {textContent && Object.keys(textContent).map((propName, i) => (
              <React.Fragment key={i}>
                <Typography variant='h6' gutterBottom>
                  {propName}
                </Typography>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  {textContent[propName]}
                </Typography>
              </React.Fragment>
            ))}
          </PanelContent>
        </Panel>
      </StyledPanelGroup>
    </PageRoot>
  );
};