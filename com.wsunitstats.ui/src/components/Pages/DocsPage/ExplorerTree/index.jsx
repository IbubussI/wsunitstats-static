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
    return <EndInternalCollapsedIcon {...other} />
  } else {
    return <IntermediateInternalCollapsedIcon {...other} />
  }
};

const CollapseIcon = (props) => {
  const {
    isLast,
    ...other
  } = props;

  if (isLast) {
    return <EndInternalExpandedIcon {...other} />
  } else {
    return <IntermediateInternalExpandedIcon {...other} />
  }
};

const LeafIcon = (props) => {
  const {
    isLast,
    ...other
  } = props;

  if (isLast) {
    return <EndLeafIcon {...other} />
  } else {
    return <IntermediateLeafIcon {...other} />
  }
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
  const {
    data: {
      id,
      isLeaf,
      isLast,
      label,
      rowIcons
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
  if (isLeaf) {
    nodeSlotIcon = (<LeafIcon isLast={isLast} />);
  } else {
    if (isOpen) {
      nodeSlotIcon = (
        <CollapseIcon isLast={isLast} onClick={() => setOpen(!isOpen)} />
      );
    } else {
      nodeSlotIcon = (
        <ExpandIcon isLast={isLast} onClick={() => setOpen(!isOpen)}/>
      );
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
        <NodeIcon sx={{ width: '24px', height: '24px' }} />
        <Label>
          {label}
        </Label>
      </Box>
    </TreeItem>
  );
};

export const ExplorerTree = React.forwardRef(({ tree, onPathChange, currentPath, onMounted = () => {} }, ref) => {
  const treeRef = React.useRef();

  const navigateToPath = (path) => {
    console.log('open path: ' + path)
    const itemsToOpen = {};
    const pathItems = path.split(Constants.EXPLORER_PATH_SEPARATOR);
    for (let i = 0; i < pathItems.length; ++i) {
      let pathToOpenItems = [];
      for (let j = 0; j < i + 1; ++j) {
        pathToOpenItems.push(pathItems[j]);
      }
      itemsToOpen[pathToOpenItems.join(Constants.EXPLORER_PATH_SEPARATOR)] = true;
    }
    return treeRef.current.recomputeTree(itemsToOpen)
      .then(() => treeRef.current.scrollToItem(path));
  }

  React.useImperativeHandle(ref, () => ({
    navigateToPath
  }));

  React.useEffect(() => {
    console.log('tree ref change ' + treeRef.current)
    if (treeRef.current) {
      onMounted();
    }
    // onMounted function must be executed only once
    // eslint-disable-next-line
  }, [treeRef.current]);

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
        isLeaf: node.children.length === 0,
        isOpenByDefault: node.isExpanded, // mandatory
        isLast,
        label: node.label,
        rowIcons: rowIcons.reverse()
      },
      parent,
      depth,
      node,
    };
  }, []);

  // The `treeWalker` function runs only on tree re-build which is performed
  // whenever the `treeWalker` prop is changed.
  const treeWalker = React.useCallback(function* () {
    // Step [1]: Define the root node of our tree. There can be one or multiple nodes
    for (let i = 0; i < tree.length; i++) {
      const isLast = i + 1 === tree.length;
      yield getNodeData(tree[i], undefined, 0, isLast);
    }

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
  }, [tree, getNodeData]);

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
          width="100%">
          {ExplorerTreeItem}
        </FixedSizeTree>
      )}
    </AutoSizer>
  );
});
