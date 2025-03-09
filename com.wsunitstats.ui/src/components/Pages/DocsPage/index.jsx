import * as React from 'react';
import * as Constants from 'utils/constants';
import { ExplorerTree } from 'components/Pages/DocsPage/ExplorerTree';
import { Box, Button, Paper, styled, Typography } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import { useValuesToQueryStringSync } from 'components/Hooks/useValuesToQueryStringSync';
import SearchIcon from '@mui/icons-material/Search';
import { PropsTable } from 'components/Pages/DocsPage/PropsTable';
import { useBatchLoader } from 'components/Hooks/useBatchLoader';
import { useTranslation } from 'react-i18next';

const PANEL_GAP = 8;

const PanelContent = styled(Paper)(() => ({
  overflow: 'auto',
  borderRadius: 0,
  height: '100%'
}));

const StyledPanelGroup = styled(PanelGroup)(() => ({
  flex: '1 1',
  height: 'inherit'
}));

const PageRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: '1 1',
  width: '100%',
  flexDirection: 'column',
  gap: PANEL_GAP,
  padding: 8,
  backgroundColor: theme.palette.mode === 'dark' ? 'initial' : theme.palette.docs.main,
  // possible variant for more compact font
  //font: 'normal 11px arial, tahoma, helvetica, sans-serif'
}));

const Input = styled('input')(({ theme }) => ({
  border: 'none',
  width: '100%',
  outline: 'none',
  paddingTop: 0,
  paddingBottom: 0,
  background: `linear-gradient(${theme.palette.docs.input.gStart}, ${theme.palette.docs.input.gEnd} 50%)`,
  font: '14px arial, tahoma, helvetica, sans-serif',
  color: 'inherit',
  lineHeight: 1.8,
  letterSpacing: 0.3
}));

const PathForm = styled('form')(() => ({
  lineHeight: 'initial',
  display: 'flex'
}));

const PathButton = styled(Button)(({ theme }) => ({
  padding: 0,
  border: 'none',

  borderRadius: 'initial',
  background: `linear-gradient(${theme.palette.docs.input.gEnd} 20%, ${theme.palette.docs.input.gStart})`,
  minWidth: '20px'
}));

const PathButtonIcon = styled(SearchIcon)(() => ({
  width: '18px',
  height: '18px',
}));

// replace . accessor with [] one for number indexes to match valid lua syntax
const idToFileName = (id) => id.replaceAll('[', '.').replaceAll('].', '.').replaceAll(']', '');

export const DocsPage = () => {
  const { t } = useTranslation();
  const initialTree = useLoaderData();
  const explorerTreeRef = React.useRef();
  const [searchParams] = useSearchParams();
  const { sync } = useValuesToQueryStringSync();
  const [input, setInput] = React.useState('');
  const [nodeContext, setNodeContext] = React.useState();

  const fetchContextBatch = React.useCallback((batchId) =>
    fetch(new URL(Constants.HOST + Constants.DOCS_DATA_CONTEXT_PATH + "/" + batchId + ".json"))
      .then((response) => response.ok ? response.json() : []), []);
  const loadContext = useBatchLoader(fetchContextBatch, 1, idToFileName);

  const getCurrentPath = React.useCallback(() => {
    return searchParams.get(Constants.PARAM_PATH) || '';
  }, [searchParams]);

  const setCurrentPath = React.useCallback((path) => {
    const map = new Map();
    map.set(Constants.PARAM_PATH, path && path.length > 0 ? [path] : []);
    sync(map);
  }, [sync]);

  const fetchNodeChildren = React.useCallback((id) => {
    const filename = idToFileName(id);
    return fetch(new URL(Constants.HOST + Constants.DOCS_DATA_TREE_PATH + "/" + filename + ".json"))
      .then((response) => response.ok ? response.json() : []);
  }, []);

  React.useEffect(() => {
    const currentPath = getCurrentPath();
    if (currentPath.startsWith(Constants.TREE_HOME_PREFIX)) {
      setInput('');
    } else {
      setInput(currentPath);
    }
  }, [getCurrentPath]);

  const currentPath = getCurrentPath();
  const textContent = nodeContext?.tc;
  const properties = nodeContext?.pr;
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
          <Input text='text' value={input} onChange={(event) => setInput(event.target.value)} />
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
                tree={initialTree}
                onPathChange={setCurrentPath}
                onContextChange={(batchId, itemId) => loadContext(batchId, idToFileName(itemId))
                  .then((context) => setNodeContext(context))}
                currentPath={currentPath}
                fetchNodeChildren={fetchNodeChildren}
                onMounted={() => explorerTreeRef.current.navigateToPath(currentPath)}
                virtualRootPrefix={Constants.TREE_HOME_PREFIX} />
            </Box>
          </PanelContent>
        </Panel>
        <PanelResizeHandle>
          <Box width={PANEL_GAP} />
        </PanelResizeHandle>
        <Panel
          collapsible={true}
          defaultSize={40}
          order={2}>
          <StyledPanelGroup autoSaveId={Constants.LOCAL_MODS_CONENT_PROPS_RESIZABLE_ID} direction='vertical'>
            <Panel>
              <PanelContent style={{ padding: '8px' }}>
                {textContent && textContent.map((entry, i) => {
                  const name = entry.nm;
                  const value = entry.tx;
                  return (
                    <React.Fragment key={i}>
                      <Typography variant='h6' gutterBottom sx={{ fontSize: '1rem' }}>
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
              <Box height={PANEL_GAP} />
            </PanelResizeHandle>
            <Panel>
              <PanelContent>
                <PropsTable
                  resizeAllToRight={true}
                  autoSaveId={Constants.LOCAL_MODS_PROPS_TABLE_COLUMNS_RESIZABLE_ID}
                  dataRows={properties && properties.map((entry) => {
                    const name = entry.nm;
                    const type = entry.tp;
                    const value = entry.vl.toString();
                    return { name, type, value }
                  })}
                  headCells={[
                    { id: 'name', label: t('moddingPropsName'), width: 200 },
                    { id: 'type', label: t('moddingPropsType'), width: 150 },
                    { id: 'value', label: t('moddingPropsValue'), width: 600 }
                  ]} />
              </PanelContent>
            </Panel>
          </StyledPanelGroup>
        </Panel>
      </StyledPanelGroup>
    </PageRoot>
  );
};
