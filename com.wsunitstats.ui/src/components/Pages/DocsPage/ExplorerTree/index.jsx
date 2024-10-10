import * as React from 'react';
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
import { alpha } from '@mui/material/styles';

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

  // styles from original mui x tree view item
  ':focus': {
    backgroundColor: theme.vars
      ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
      : alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
    '&:hover': {
      backgroundColor: theme.vars
        ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.hoverOpacity}))`
        : alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
        ),
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: theme.vars
          ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
          : alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
  '&:hover': {
    backgroundColor: (theme.vars || theme).palette.action.hover,
    // Reset on touch devices, it doesn't add specificity
    '@media (hover: none)': {
      backgroundColor: 'transparent',
    },
  },
}));

// Node component receives all the data we created in the `treeWalker` +
// internal openness state (`isOpen`), function to change internal openness
// state (`setOpen`) and `style` parameter that should be added to the root div.
const ExplorerTreeItem = ({ data: { isLeaf, isLast, label, rowIcons }, isOpen, style, setOpen }) => {
  let nodeSlotIcon;
  if (isLeaf) {
    nodeSlotIcon = (<LeafIcon isLast={isLast} />);
  } else {
    if (isOpen) {
      nodeSlotIcon = (
        <CollapseIcon isLast={isLast} />
      );
    } else {
      nodeSlotIcon = (
        <ExpandIcon isLast={isLast} />
      );
    }
  }

  return (
    <TreeItem tabIndex='-1' style={{ ...style, cursor: 'pointer' }} onClick={() => setOpen(!isOpen)} >
      {rowIcons}
      {nodeSlotIcon}
      <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <NodeIcon sx={{ width: '24px', height: '24px' }}/>
        <Label>
          {label}
        </Label>
      </Box>
    </TreeItem>
  );
};

export const ExplorerTree = ({ treeData }) => {
  // This helper function constructs the object that will be sent back 
  // at the step [2] during the treeWalker function work. 
  // Except for the mandatory `data` field you can put any additional data here.
  const getNodeData = (node, parent, depth, isLast) => {
    const rowIcons = [];

    for (let i = depth; i > 0; --i) {
      // find if parent of of current depth level is last to not add unnecessary lines
      let levelParent = parent;
      let isParentLast = false;
      for (let j = 0; j < i - 1; ++j) {
        levelParent = levelParent.parent;
      }
      isParentLast = levelParent.data.isLast ? levelParent.data.isLast : false;
      rowIcons.push(<RowIcon isEmpty={isParentLast} key={i} />);
    }

    return {
      data: {
        id: node.id.toString(), // mandatory
        isLeaf: node.children.length === 0,
        isOpenByDefault: node.isExpanded, // mandatory
        label: node.label,
        rowIcons: rowIcons,
        isLast,
      },
      parent,
      depth,
      node,
    };
  };

  // The `treeWalker` function runs only on tree re-build which is performed
  // whenever the `treeWalker` prop is changed.
  function* treeWalker() {
    // Step [1]: Define the root node of our tree. There can be one or
    // multiple nodes.
    for (let i = 0; i < treeData.length; i++) {
      const isLast = i + 1 === treeData.length;
      yield getNodeData(treeData[i], undefined, 0, isLast);
    }

    while (true) {
      // Step [2]: Get the parent component back. It will be the object
      // the `getNodeData` function constructed, so you can read any data from it.
      const parent = yield;

      for (let i = 0; i < parent.node.children.length; i++) {
        // Step [3]: Yielding all the children of the provided component. Then we
        // will return for the step [2] with the first children.
        const isLast = i + 1 === parent.node.children.length;
        yield getNodeData(parent.node.children[i], parent, parent.depth + 1, isLast);
      }
    }
  }

  return (
    <AutoSizer disableWidth>
      {({ height }) => (
        <FixedSizeTree
          treeWalker={treeWalker}
          itemSize={24}
          height={height}
          width="100%">
          {ExplorerTreeItem}
        </FixedSizeTree>
      )}
    </AutoSizer>
  );
}
