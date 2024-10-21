import * as React from 'react';
import * as Constants from 'utils/constants';
import { ExplorerTree } from 'components/Pages/DocsPage/ExplorerTree';
import { Box, Button, Typography } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import styled from '@emotion/styled';
import { useSearchParams } from 'react-router-dom';
import { useValuesToQueryStringSync } from 'components/Hooks/useValuesToQueryStringSync';
import SearchIcon from '@mui/icons-material/Search';
import { PropsTable } from 'components/Pages/DocsPage/PropsTable';

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
  return {
    id: 'root',
    label: 'root',
    isLast: true,
    isExpanded: true,
    isAsync: false,
    children: generateFlatSubtree(size, 'root', 1)
  };
}

function generateNodeContext(id) {
  return id && {
    textContent: {
      Path: id,
      Description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    properties: {
      id: {
        type: 'String',
        value: id
      },
      property1: {
        type: 'String',
        value: rndString(id.length)
      },
      property5: {
        type: 'Boolean',
        value: true
      },
      property6: {
        type: 'Boolean',
        value: false
      },
      property7: {
        type: 'Number',
        value: Math.random() * (id.length**10)
      },
    }
  };
}

const generateFlatSubtree = (size, parentId) => {
  const items = [];

  if ((parentId.match(/\./g) || []).length === 10) {
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

const PanelContent = styled('div')(() => ({
  overflow: 'auto',
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
  backgroundColor: '#a6daff80',
  // possible variant for more compact font
  //font: 'normal 11px arial, tahoma, helvetica, sans-serif'
}));

const Input = styled('input')(() => ({
  border: 'none',
  width: '100%',
  outline: 'none',
  lineHeight: 1.5,
  paddingTop: 0,
  paddingBottom: 0,
  background: 'linear-gradient(#daf1f7, #fff 50%)',
}));

const PathForm = styled('form')(() => ({
  lineHeight: 'initial',
  display: 'flex'
}));

const PathButton = styled(Button)(() => ({
  padding: 0,
  border: 'none',
  borderLeft: '1px solid #8ac8f4',
  borderRadius: 'initial',
  background: 'linear-gradient(#f7f7f9 20%, #dfe5e6)',
  '&:hover': {
    background: '#cee3ea',
    transition: 'none'
  },
  minWidth: '20px'
}));

const PathButtonIcon = styled(SearchIcon)(() => ({
  width: '18px',
  height: '18px',
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
      resolve(generateNodeContext(id));
    });
  }, []);

  React.useEffect(() => {
    (async () => {
      const path = getCurrentPath();
      dispatch({
        type: 'path_changed',

        // temporarily
        nodeContext: await fetchNodeContext(path),
        input: path
      });
    })();
  }, [getCurrentPath, fetchNodeContext]);

  const currentPath = getCurrentPath();
  const textContent = pageState.nodeContext?.textContent;
  const properties = pageState.nodeContext?.properties;
  return (
    <PageRoot>
      <PanelContent>
        <PathForm onSubmit={(event) => {
          // prevent page reload
          event.preventDefault();
          if (!explorerTreeRef.current.isNavigationInProgress()) {
            const path = event.target[0].value;
            setCurrentPath(path);
            explorerTreeRef.current.navigateToPath(path);
          }
        }}>
          <Input text='text' value={pageState.input} onChange={(event) => 
            dispatch({ type: 'input_changed', input: event.target.value })} />
          <PathButton type='submit' variant='text'>
            <PathButtonIcon />
          </PathButton>
        </PathForm>
      </PanelContent>
      <StyledPanelGroup
        autoSaveId={Constants.LOCAL_MODS_TREE_CONENT_RESIZABLE_ID}
        direction='horizontal'>
        <Panel
          collapsible={true}
          defaultSize={20}
          order={1}>
          <PanelContent height={400}>
            <Box height='inherit' padding='1px'>
              <ExplorerTree
                ref={explorerTreeRef}
                tree={testTreeData}
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
          <StyledPanelGroup autoSaveId={Constants.LOCAL_MODS_CONENT_PROPS_RESIZABLE_ID} direction='vertical'>
            <Panel>
              <PanelContent style={{ padding: '8px' }}>
                {textContent && Object.entries(textContent).map((entry, i) => {
                  const name = entry[0];
                  const value = entry[1];
                  return (
                    <React.Fragment key={i}>
                      <Typography variant='h6' gutterBottom>
                        {name}
                      </Typography>
                      <Typography variant='body2' color='textSecondary' gutterBottom>
                        {value}
                      </Typography>
                    </React.Fragment>
                  );
                })}
              </PanelContent>
            </Panel>
            <PanelResizeHandle>
              <Box height={PANEL_DISTANCE} />
            </PanelResizeHandle>
            <Panel>
              <PanelContent>
                <PropsTable
                  resizeAllToRight={true}
                  autoSaveId={Constants.LOCAL_MODS_PROPS_TABLE_COLUMNS_RESIZABLE_ID}
                  dataRows={properties && Object.entries(properties).map((entry) => {
                    const propName = entry[0];
                    const prop = entry[1];
                    const type = prop.type.toString();
                    const value = prop.value.toString();
                    return { name: propName, type, value }
                  })}
                  headCells={[
                    { id: 'name', label: 'Name', width: 200 },
                    { id: 'type', label: 'Type', width: 150 },
                    { id: 'value', label: 'Value', width: 600 }
                  ]} />
              </PanelContent>
            </Panel>
          </StyledPanelGroup>
        </Panel>
      </StyledPanelGroup>
    </PageRoot>
  );
};