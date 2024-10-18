import * as React from 'react';
import * as Constants from 'utils/constants';
import { ExplorerTree } from 'components/Pages/DocsPage/ExplorerTree';
import { Box, Typography } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import styled from '@emotion/styled';
import { useSearchParams } from 'react-router-dom';
import { useValuesToQueryStringSync } from 'components/Hooks/useValuesToQueryStringSync';

function rndString(length) {
  let result = '';
  const characters = 'abcdef0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; ++i) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function generateTreeData(size) {
  console.log('generating data tree')
  const tree = {
    id: 'root',
    label: 'root',
    depth: 0,
    isLast: true,
    isExpanded: true,
    isAsync: false,
    children: generateFlatSubtree(size, 'root', 1)
  };

  console.log('generating data tree done')
  return { tree: tree };
}

const generateFlatSubtree = (size, parentId) => {
  const items = [];

  if ((parentId.match(/\./g) || []).length === 3) {
    return items;
  }
  
  for (let k = 0; k < size; ++k) {
    const subId = k.toString();
    const id = parentId + Constants.EXPLORER_PATH_SEPARATOR + subId;
    const child = {
      id: id,
      label: subId,
      //label: rndString(6),
      isLast: k + 1 >= size,
      isAsync: true,
      children: [],
    };
    items.push(child);
  }
  return items;
};

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
      };
    }
    case 'path_changed': {
      return {
        nodeContext: action.nodeContext,
        input: action.input
      };
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
};

export const DocsPage = () => {
  const testTreeData = React.useMemo(() => generateTreeData(3000), []);

  const explorerTreeRef = React.useRef();
  const [searchParams] = useSearchParams();
  const { sync } = useValuesToQueryStringSync();
  const [pageState, dispatch] = React.useReducer(reducer, { input: '' });

  const getCurrentPath = React.useCallback(() => {
    return searchParams.get(Constants.PARAM_PATH) || '';
  }, [searchParams]);

  const setCurrentPath = React.useCallback((path) => {
    const map = new Map();
    map.set(Constants.PARAM_PATH, path && path.length > 0 ? [path] : []);
    sync(map);
  }, [sync]);

  const fetchNodeChildren = React.useCallback((id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateFlatSubtree(3000, id));
      }, 1000)
    });
  }, []);

  const fetchNodeContext = React.useCallback((id) => {
    return new Promise((resolve) => {
      resolve(generateFlatSubtree(3000, id));
    });
  }, []);

  React.useEffect(() => {
    console.log('Docs page use effect');
    const path = getCurrentPath();
    dispatch({
      type: 'path_changed',

      // temporarily
      nodeContext: { textContent: { Name: 'test name' } },
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
          <Input text='text' value={pageState.input} onChange={(event) => dispatch({ type: 'input_changed', input: event.target.value })} />
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
                fetchNodeChildren={fetchNodeChildren}
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