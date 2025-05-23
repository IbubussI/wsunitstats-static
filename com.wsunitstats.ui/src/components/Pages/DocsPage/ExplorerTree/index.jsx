import * as React from 'react';
import * as Constants from 'utils/constants';
import {
  BoolPropIcon,
  EndInternalCollapsedIcon,
  EndInternalExpandedIcon,
  EndLeafIcon,
  FolderIcon,
  FuncPropIcon,
  HomeIcon,
  IntermediateInternalCollapsedIcon,
  IntermediateInternalExpandedIcon,
  IntermediateLeafIcon,
  IntermediateLineIcon,
  NodeIcon2,
  NumberPropIcon,
  StringPropIcon,
  TagsPropIcon
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

const NodeIconSelector = (props) => {
  const {
    type,
    ...iconProps
  } = props;
  let Icon = NodeIcon2;

  switch(type) {
    case 'str': 
      Icon = StringPropIcon;
      break;
    case 'bool':
      Icon = BoolPropIcon;
      break;
    case 'num':
      Icon = NumberPropIcon;
      break;
    case 'func':
      Icon = FuncPropIcon;
      break;
    case 'tags':
      Icon = TagsPropIcon;
      break;
    case 'home':
      Icon = HomeIcon;
      break;
    case 'folder':
      Icon = FolderIcon;
      break;
    default:
  }

  return (
    <Icon {...iconProps}/>
  );
}

const Label = styled('div')(({ theme }) => ({
  width: '100%',
  boxSizing: 'border-box',
  minWidth: 0,
  position: 'relative',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
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

function splitPath(path) {
  const pathItems = path.split(Constants.EXPLORER_PATH_SEPARATOR_REGEX);
  pathItems.forEach((pathItem, index, array) => {
    if (pathItem.endsWith(Constants.EXPLORER_PATH_SEPARATOR_END_SQUARE)) {
      array[index] = pathItem.substring(0, pathItem.length - 1);
    }
  });
  return pathItems;
}

function joinPath(pathItems) {
  pathItems.forEach((pathItem, index, array) => {
    if (Constants.EXPLORER_PATH_SQUARE_TARGET_REGEX.test(pathItem)) {
      array[index] = `[${pathItem}]`;
    }
  });
  return pathItems.join(Constants.EXPLORER_PATH_SEPARATOR).replaceAll('.[', '[');
}

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
      contextBatch,
      rowIcons,
      updateChildren,
      loadingState,
      type
    },
    treeData: {
      onPathChange,
      onContextChange,
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
      onContextChange(contextBatch, id);
    }} >
      {rowIcons}
      {nodeSlotIcon}
      <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.2, alignItems: 'center' }}>
        {loadingState.isLoading ? <LoadingIcon /> : <NodeIconSelector type={type} sx={{ width: '24px', height: '24px' }} />}
        <Label>
          {label}
        </Label>
      </Box>
    </TreeItem>
  );
};

export const ExplorerTree = React.forwardRef(({
  tree,
  onPathChange,
  onContextChange,
  currentPath,
  fetchNodeChildren,
  onMounted = () => { },
  virtualRootPrefix
}, ref) => {
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
        resolve(children);
      });
    });
  }, [fetchNodeChildren]);

  const openPath = (path) => {
    const itemsToOpen = {};
    const pathItems = splitPath(path);
    for (let i = 0; i < pathItems.length - 1; ++i) {
      const pathToOpenItems = [];
      for (let j = 0; j <= i; ++j) {
        pathToOpenItems.push(pathItems[j]);
      }
      itemsToOpen[joinPath(pathToOpenItems)] = true;
    }

    return treeRef.current.recomputeTree(itemsToOpen).then(() => {
      // wait because in some cases react-window list might not be loaded immediately after recomputeTree
      setTimeout(() => {
        treeRef.current.scrollToItem(path);
      }, 1);
    });
  };

  const navigateToPath = async (path) => {
    navigationInProgress.current = true;
    const hasVirtualRoot = virtualRootPrefix?.length > 0;
    const prefix = hasVirtualRoot ? virtualRootPrefix + Constants.EXPLORER_PATH_SEPARATOR : '';
    const pathItems = splitPath(prefix + path);
    let currentItem = tree;
    for (let i = 1; i < pathItems.length; ++i) {
      const pathToOpenItems = [];
      const startIndex = hasVirtualRoot ? 1 : 0;
      for (let j = startIndex; j <= i; ++j) {
        pathToOpenItems.push(pathItems[j]);
      }
      const openItemId = joinPath(pathToOpenItems);

      // if item not async it is expected to have children already
      if (currentItem.as) {
        if (currentItem.ch === undefined) {
          currentItem.isLoading = true;
          triggerUpdate();
          currentItem.ch = await fetchChildren(currentItem.id);
          currentItem.isLoading = false;
          triggerUpdate();
        }
      }
      // find next item to load
      currentItem = currentItem?.ch.find((item) => item.id === openItemId);

      // trigger navigation to the recently loaded item 
      setNavigationPath(openItemId);
      if (!currentItem) {
        break;
      }
    }
    // trigger context change if desired path is reached
    if (currentItem) {
      onContextChange(currentItem.cb, path);
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
        isLeaf: () => node.ch === undefined && (!node.as || downloadedIdsRef.current.includes(node.id)),
        isOpenByDefault: node.ex, // mandatory
        isLast,
        label: node.lb,
        contextBatch: node.cb,
        rowIcons: rowIcons.reverse(),
        type: node.tp,
        updateChildren: () => {
          if (node.ch === undefined) {
            return fetchChildren(node.id, true).then((children) => {
              node.ch = children;
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
    // Step [1]: Define the root node of our tree
    yield getNodeData(tree, undefined, 0, true);

    while (true) {
      // Step [2]: Get the parent component back (constructed by prev getNodeData call)
      const parent = yield;

      if (parent.node.ch) {
        for (let i = 0; i < parent.node.ch.length; i++) {
          // Step [3]: Yielding all the children of the provided component. Then we
          // will return for the step [2] with the first children.
          const isLast = i + 1 === parent.node.ch.length;
          yield getNodeData(parent.node.ch[i], parent, parent.depth + 1, isLast);
        }
      }
    }
    // trigger required to rebuild internal tree after async data received
    // eslint-disable-next-line
  }, [updateTrigger, getNodeData]);

  return (
    <AutoSizer disableWidth>
      {({ height }) => (
        <FixedSizeTree
          ref={treeRef}
          treeWalker={treeWalker}
          itemSize={24}
          itemData={{ onPathChange, onContextChange, currentPath }}
          height={height}
          async={true}
          width="100%">
          {ExplorerTreeItem}
        </FixedSizeTree>
      )}
    </AutoSizer>
  );
});
