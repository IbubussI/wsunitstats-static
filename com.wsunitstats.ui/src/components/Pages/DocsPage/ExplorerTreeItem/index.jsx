import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2GroupTransition,
  TreeItem2Label,
  TreeItem2Root,
  TreeItem2Checkbox,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeItem2DragAndDropOverlay } from '@mui/x-tree-view/TreeItem2DragAndDropOverlay';
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
import { collapseClasses } from '@mui/material';

const StyledTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  padding: 0,
  gap: 0,
}));

const StyledTreeItemLabel = styled(TreeItem2Label)(({ theme }) => ({
  fontSize: '0.8rem'
}));

const StyledTreeItem2IconContainer = styled(TreeItem2IconContainer)(({ theme }) => ({
  width: 'initial',
  'svg': {
    fontSize: '24px'
  }
}));

const StyledItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  [`.${collapseClasses.root}`]: {
    paddingLeft: '0px'
  }
}));

export const ExplorerTreeItem = React.forwardRef(function ExplorerTreeItem(props, ref) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    getDragAndDropOverlayProps,
    publicAPI,
    status,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  const rowIcons = [];
  const item = publicAPI.getItem(itemId);

  for (let i = item.depth; i > 0; --i) {
    // find if parent of of current depth level is last to not add unnecessary lines
    let levelParent = item;
    let isParentLast = false;
    for (let j = 0; j < i; ++j) {
      levelParent = publicAPI.getItem(levelParent.parent);
    }
    isParentLast = levelParent.isLast ? levelParent.isLast : false;
    rowIcons.push(<RowIcon isEmpty={isParentLast} key={i}/>);
  }

  return (
    <TreeItem2Provider itemId={itemId}>
      <StyledItemRoot {...getRootProps(other)}>
        <StyledTreeItemContent {...getContentProps()}>
          {rowIcons}
          <StyledTreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon
              slotProps={{
                expandIcon: { isLast: item.isLast },
                collapseIcon: { isLast: item.isLast },
                endIcon: { isLast: item.isLast }
              }}
              slots={{
                expandIcon: ExpandIcon,
                collapseIcon: CollapseIcon,
                endIcon: EndIcon
              }}
              status={status} />
          </StyledTreeItem2IconContainer>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <NodeIcon sx={{ width: '24px', height: '24px' }}/>
            <TreeItem2Checkbox {...getCheckboxProps()} />
            <StyledTreeItemLabel {...getLabelProps()} />
          </Box>
          <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </StyledTreeItemContent>
        {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
      </StyledItemRoot>
    </TreeItem2Provider>
  );
});

const RowIcon = ({ isEmpty }) => {
  if (isEmpty) {
    return <div style={{ width: '24px', height: '24px' }}></div>;
  } else {
    return <IntermediateLineIcon />;
  }
};

const ExpandIcon = ({ isLast }) => {
  if (isLast) {
    return (<EndInternalCollapsedIcon />);
  } else {
    return (<IntermediateInternalCollapsedIcon />);
  }
};

const CollapseIcon = ({ isLast }) => {
  if (isLast) {
    return (<EndInternalExpandedIcon />);
  } else {
    return (<IntermediateInternalExpandedIcon />);
  }
};

const EndIcon = ({ isLast }) => {
  if (isLast) {
    return (<EndLeafIcon />);
  } else {
    return (<IntermediateLeafIcon />);
  }
};