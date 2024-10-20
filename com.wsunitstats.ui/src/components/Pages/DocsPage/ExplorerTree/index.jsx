import * as React from 'react';
import * as Constants from 'utils/constants';
import {
  EndInternalCollapsedIcon,
  EndInternalExpandedIcon,
  EndLeafIcon,
  IntermediateInternalCollapsedIcon,
  IntermediateInternalExpandedIcon,
  IntermediateLeafIcon,
  IntermediateLineIcon,
  NodeIcon
} from 'components/Pages/DocsPage/Svg';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeTree } from 'react-vtree';
import { Box } from '@mui/material';
import styled from '@emotion/styled';
import { useTheme } from '@mui/material/styles';
import './index.css';

const RowIcon = (props) => {
  const {
    isEmpty,
    ...other
  } = props;

  if (isEmpty) {
    return <div style={{ width: '24px', minWidth: '24px', height: '24px', minHeight: '24px', }}></div>;
  } else {
    return <IntermediateLineIcon {...other} />;
  }
};

const ExpandIcon = (props) => {
  const {
    isLast,
    ...other
  } = props;

  if (isLast) {
    return <EndInternalCollapsedIcon {...other} />;
  } else {
    return <IntermediateInternalCollapsedIcon {...other} />;
  }
};

const CollapseIcon = (props) => {
  const {
    isLast,
    ...other
  } = props;

  if (isLast) {
    return <EndInternalExpandedIcon {...other} />;
  } else {
    return <IntermediateInternalExpandedIcon {...other} />;
  }
};

const LeafIcon = (props) => {
  const {
    isLast,
    ...other
  } = props;

  if (isLast) {
    return <EndLeafIcon {...other} />;
  } else {
    return <IntermediateLeafIcon {...other} />;
  }
};

const LoadingIcon = () => {
  return (
    <div style={{ minWidth: '24px' }}>
      <div className='loader' />
    </div>
  );
};

const Label = styled('div')(({ theme }) => ({
  width: '100%',
  boxSizing: 'border-box',
  minWidth: 0,
  position: 'relative',
  overflow: 'hidden',
  ...theme.typography.body1,
  fontSize: '0.8rem'
}));

const TreeItem = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
}));

// Node component receives all the data we created in the `treeWalker` +
// internal openness state (`isOpen`), function to change internal openness
// state (`setOpen`) and `style` parameter that should be added to the root div.
const ExplorerTreeItem = (props) => {
  const theme = useTheme();
  const [, triggerUpdate] = React.useReducer((v) => v + 1, 0);

  const {
    data: {
      id,
      isLeaf,
      isLast,
      label,
      rowIcons,
      updateChildren,
      loadingState
    },
    treeData: {
      onPathChange,
      currentPath
    },
    isOpen,
    style,
    setOpen
  } = props;

  let nodeSlotIcon;
  if (isLeaf()) {
    nodeSlotIcon = <LeafIcon isLast={isLast} />;
  } else {
    if (isOpen) {
      nodeSlotIcon = <CollapseIcon isLast={isLast} onClick={(event) => {
        event.stopPropagation();
        setOpen(false);
      }} />;
    } else {
      nodeSlotIcon = <ExpandIcon isLast={isLast} onClick={async (event) => {
        event.stopPropagation();
        if (!loadingState.isLoading) {
          loadingState.setIsLoading(true);
          triggerUpdate();
          await updateChildren();
          await setOpen(true);
          loadingState.setIsLoading(false);
          triggerUpdate();
        }
      }} />;
    }
  }

  return (
    <TreeItem tabIndex='-1' style={{
      ...style,
      // make element max width to fill all possible overflow
      // to have background color work for all width (more than 100%)
      // in case of horizontal scroll
      width: '100vw',
      backgroundColor: currentPath === id
        ? theme.palette.action.selected
        : undefined
    }} onClick={() => {
      onPathChange(id);
    }} >
      {rowIcons}
      {nodeSlotIcon}
      <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {loadingState.isLoading ? <LoadingIcon/> : <NodeIcon sx={{ width: '24px', height: '24px' }} />}
        <Label>
          {label}
        </Label>
      </Box>
    </TreeItem>
  );
};

export const ExplorerTree = React.forwardRef(({ tree, onPathChange, currentPath, fetchNodeChildren, onMounted = () => {} }, ref) => {
  const treeRef = React.useRef();
  // save loaded ids to not display expand icon and fetch children if prev fetch loaded nothing
  const downloadedIdsRef = React.useRef([]);
  const navigationInProgress = React.useRef(false);
  const [navigationPath, setNavigationPath] = React.useState();
  const [updateTrigger, triggerUpdate] = React.useReducer((v) => v + 1, 0);

  const fetchChildren = React.useCallback((id) => {
    return fetchNodeChildren(id).then((children) => {
      return new Promise((resolve) => {
        downloadedIdsRef.current.push(id);
        return resolve(children);
      });
    });
  }, [fetchNodeChildren]);

  const openPath = (path) => {
    const itemsToOpen = {};
    const pathItems = path.split(Constants.EXPLORER_PATH_SEPARATOR);
    for (let i = 0; i < pathItems.length - 1; ++i) {
      const pathToOpenItems = [];
      for (let j = 0; j <= i; ++j) {
        pathToOpenItems.push(pathItems[j]);
      }
      itemsToOpen[pathToOpenItems.join(Constants.EXPLORER_PATH_SEPARATOR)] = true;
    }

    return treeRef.current.recomputeTree(itemsToOpen).then(() => {
      // wait because in some cases react-window list might not be loaded immediately after recomputeTree
      setTimeout(() => {
        treeRef.current.scrollToItem(path);
      }, 1)
    });
  };

  const navigateToPath = async (path) => {
    navigationInProgress.current = true;
    const pathItems = path.split(Constants.EXPLORER_PATH_SEPARATOR);
    let currentItem = tree;
    for (let i = 1; i < pathItems.length; ++i) {
      const pathToOpenItems = [];
      for (let j = 0; j <= i; ++j) {
        pathToOpenItems.push(pathItems[j]);
      }
      const openItemId = pathToOpenItems.join(Constants.EXPLORER_PATH_SEPARATOR);

      // if item not async it is expected to have children already
      if (currentItem.isAsync) {
        if (currentItem.children.length === 0) {
          currentItem.isLoading = true;
          triggerUpdate();
          currentItem.children = await fetchChildren(currentItem.id);
          currentItem.isLoading = false;
          triggerUpdate();
        }
      }
      // find next item to load
      currentItem = currentItem.children.find((item) => item.id === openItemId);

      // trigger navigation to the recently loaded item 
      setNavigationPath(openItemId);
      if (!currentItem) {
        break;
      }
    }
    navigationInProgress.current = false;
  };

  const isNavigationInProgress = () => {
    return navigationInProgress.current;
  };

  React.useImperativeHandle(ref, () => ({
    navigateToPath,
    isNavigationInProgress
  }));

  React.useEffect(() => {
    if (treeRef.current) {
      onMounted();
    }
    // onMounted function must be executed only once
    // eslint-disable-next-line
  }, [treeRef.current]);

  // expand tree and scroll to path after it items are uploaded
  React.useEffect(() => {
    if (navigationPath) {
      openPath(navigationPath);
    }
  }, [navigationPath]);

  // Constructs the object that will be sent back during the treeWalker function work
  const getNodeData = React.useCallback((node, parent, depth, isLast) => {
    const rowIcons = [];

    let levelParent = parent;
    for (let i = 0; i < depth; ++i) {
      // not add unnecessary line if parent of current depth level
      // is the last withing its parent children
      rowIcons.push(<RowIcon isEmpty={levelParent.data.isLast} key={i} />);
      levelParent = levelParent.parent;
    }

    return {
      data: {
        id: node.id.toString(), // mandatory
        isLeaf: () => node.children.length === 0 && (!node.isAsync || downloadedIdsRef.current.includes(node.id)),
        isOpenByDefault: node.isExpanded, // mandatory
        isLast,
        label: node.label,
        rowIcons: rowIcons.reverse(),
        updateChildren: () => {
          if (node.children.length === 0) {
            return fetchChildren(node.id, true).then((children) => {
              node.children = children;
              triggerUpdate();
            });
          } else {
            return Promise.resolve();
          }
        },
        loadingState: {
          isLoading: node.isLoading,
          setIsLoading: function (isLoading) {
            this.isLoading = isLoading;
          }
        }
      },
      parent,
      depth,
      node,
    };
  }, [fetchChildren]);

  // The `treeWalker` function runs only on tree re-build which is performed
  // whenever the `treeWalker` prop is changed.
  const treeWalker = React.useCallback(function* () {
    console.log('tree walker invoked')
    // Step [1]: Define the root node of our tree
    yield getNodeData(tree, undefined, 0, true);

    while (true) {
      // Step [2]: Get the parent component back (constructed by prev getNodeData call)
      const parent = yield;

      for (let i = 0; i < parent.node.children.length; i++) {
        // Step [3]: Yielding all the children of the provided component. Then we
        // will return for the step [2] with the first children.
        const isLast = i + 1 === parent.node.children.length;
        yield getNodeData(parent.node.children[i], parent, parent.depth + 1, isLast);
      }
    }
    // trigger required to rebuild internal tree after async data received
    // eslint-disable-next-line
  }, [updateTrigger, getNodeData]);

  console.log('render tree')
  return (
    <AutoSizer disableWidth>
      {({ height }) => (
        <FixedSizeTree
          ref={treeRef}
          treeWalker={treeWalker}
          itemSize={24}
          itemData={{ onPathChange, currentPath }}
          height={height}
          async={true}
          width="100%">
          {ExplorerTreeItem}
        </FixedSizeTree>
      )}
    </AutoSizer>
  );
});
