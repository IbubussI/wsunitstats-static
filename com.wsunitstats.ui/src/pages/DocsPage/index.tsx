import * as React from 'react';
import * as Constants from '@/utils/constants';
import { ExplorerTree } from '@/pages/DocsPage/ExplorerTree';
import { Box, Button, Link, Paper, styled, Typography } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import { useValuesToQueryStringSync } from '@/hooks/useValuesToQueryStringSync';
import SearchIcon from '@mui/icons-material/Search';
import { PropsTable } from '@/pages/DocsPage/PropsTable';
import { useTranslation } from 'react-i18next';
import {
  assignChildIds,
  assignTreeIds,
  type EngineNode,
  getProperties,
  getTextEntries,
  idToFileName
} from '@/pages/DocsPage/engineTree';

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

/** Selected node with its children (loaded on demand for some nodes), the properties of an object are its leaf children */
interface Selection {
  node: EngineNode;
  children?: EngineNode[];
}

interface ExplorerTreeHandle {
  navigateToPath: (path: string) => Promise<void>;
  isNavigationInProgress: () => boolean;
}

const fetchJsonOrEmpty = (path: string) => fetch(path).then((response) => response.ok ? response.json() : []);

export const DocsPage = () => {
  const { t } = useTranslation();
  const initialTree = useLoaderData() as EngineNode;
  // nodes hold only their keys, the paths are built from them
  const tree = React.useMemo(() => assignTreeIds(initialTree), [initialTree]);
  const explorerTreeRef = React.useRef<ExplorerTreeHandle>(null);
  const [searchParams] = useSearchParams();
  const { sync } = useValuesToQueryStringSync();
  const [input, setInput] = React.useState('');
  const [selection, setSelection] = React.useState<Selection>();
  // children loaded on demand by node path, shared by the tree and the properties of the selected node
  const childrenCache = React.useRef(new Map<string, Promise<EngineNode[]>>());
  // the last selected node, to ignore children loaded for a node selected earlier
  const selectedNode = React.useRef<EngineNode>(undefined);

  const getCurrentPath = React.useCallback(() => {
    return searchParams.get(Constants.PARAM_PATH) || '';
  }, [searchParams]);

  const setCurrentPath = React.useCallback((path: string) => {
    const map = new Map<string, string[]>();
    map.set(Constants.PARAM_PATH, path && path.length > 0 ? [path] : []);
    sync(map);
  }, [sync]);

  const fetchNodeChildren = React.useCallback((node: EngineNode) => {
    const id = node.id!;
    let children = childrenCache.current.get(id);
    if (!children) {
      children = fetchJsonOrEmpty(Constants.DOCS_DATA_TREE_PATH + "/" + idToFileName(id) + ".json")
        .then((loaded: EngineNode[]) => assignChildIds(node, loaded) ?? []);
      childrenCache.current.set(id, children);
    }
    return children;
  }, []);

  const selectNode = React.useCallback((node: EngineNode) => {
    selectedNode.current = node;
    if (node.ch || !node.as) {
      setSelection({ node, children: node.ch });
    } else {
      setSelection({ node });
      fetchNodeChildren(node).then((children) => {
        if (selectedNode.current === node) {
          setSelection({ node, children });
        }
      });
    }
  }, [fetchNodeChildren]);

  const navigateToPath = (path: string) => {
    const explorerTree = explorerTreeRef.current;
    if (explorerTree && !explorerTree.isNavigationInProgress()) {
      setCurrentPath(path);
      explorerTree.navigateToPath(path);
    }
  };

  React.useEffect(() => {
    const currentPath = getCurrentPath();
    if (currentPath.startsWith(Constants.TREE_HOME_PREFIX)) {
      setInput('');
    } else {
      setInput(currentPath);
    }
  }, [getCurrentPath]);

  const currentPath = getCurrentPath();
  const textEntries = selection && getTextEntries(selection.node);
  const properties = selection && getProperties(selection.node, selection.children);
  return (
    <PageRoot>
      <PanelContent>
        <PathForm onSubmit={(event) => {
          // prevent page reload
          event.preventDefault();
          navigateToPath(input);
        }}>
          <Input type='text' value={input} onChange={(event) => setInput(event.target.value)} />
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
          <PanelContent>
            <Box height='inherit' padding='1px'>
              <ExplorerTree
                ref={explorerTreeRef}
                tree={tree}
                onPathChange={setCurrentPath}
                onSelect={selectNode}
                currentPath={currentPath}
                fetchNodeChildren={fetchNodeChildren}
                onMounted={() => explorerTreeRef.current?.navigateToPath(currentPath)}
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
                {textEntries && textEntries.map((entry, i) =>
                  <React.Fragment key={i}>
                    <Typography variant='h6' gutterBottom sx={{ fontSize: '1rem' }}>
                      {entry.name}
                    </Typography>
                    <Typography variant='body2' color='textSecondary' gutterBottom>
                      {entry.isLink
                        // the same subtree exported once, open it
                        ? <Link component='button' variant='body2' sx={{ textAlign: 'left' }} onClick={() => navigateToPath(entry.text)}>
                          {entry.text}
                        </Link>
                        : entry.text}
                    </Typography>
                  </React.Fragment>)}
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
                  dataRows={properties}
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
