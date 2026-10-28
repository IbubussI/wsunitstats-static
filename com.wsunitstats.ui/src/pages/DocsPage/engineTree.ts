import * as Constants from '@/utils/constants';

/**
 * Node of the engine data tree (docs/tree files). The files hold only the key of a node: its path (id) is built
 * from the keys of its parents when the node is loaded, all the details shown for it are derived from the node
 */
export interface EngineNode {
  /** key in the parent object, index in the parent array */
  k: string;
  /** value of a leaf: string, number, boolean, function args, active tags ({0,5,12}); target path of a link */
  v?: string;
  /** type id: str, bool, num, func, tags, obj, root, home, folder, link */
  tp: string;
  /** open by default */
  ex?: boolean;
  /** the children are in a separate file, loaded on demand */
  as?: boolean;
  ch?: EngineNode[];
  /** path of the node, set when it is loaded, e.g. gameplay.root.unitType[27].paths */
  id?: string;
  isLoading?: boolean;
}

/** Text shown above the properties of a node; a link entry navigates to its text */
export interface TextEntry {
  name: string;
  text: string;
  isLink?: boolean;
}

export interface PropertyRow {
  name: string;
  type: string;
  value: string;
}

const HOME_TYPE = 'home';
const FOLDER_TYPE = 'folder';
const FUNCTION_TYPE = 'func';
const TAGS_TYPE = 'tags';
const LINK_TYPE = 'link';
const LEAF_TYPES = ['str', 'bool', 'num', FUNCTION_TYPE, TAGS_TYPE];
const TAGS_COUNT = 64;

const TYPE_LABELS: Record<string, string> = {
  str: 'String',
  bool: 'Boolean',
  num: 'Number',
  obj: 'Object',
  func: 'Function',
  tags: 'Tags',
  root: 'TreeRoot',
  home: 'Home',
  folder: 'Folder',
  link: 'Link'
};

/** Path of a child: keys starting with a digit (indexes) are written as [key], the same as paths are split and joined */
const getChildId = (parent: EngineNode, key: string) => parent.tp === HOME_TYPE
  ? key
  : Constants.EXPLORER_PATH_SQUARE_TARGET_REGEX.test(key)
    ? `${parent.id}[${key}]`
    : `${parent.id}${Constants.EXPLORER_PATH_SEPARATOR}${key}`;

/** Sets the ids of the children of the node and of their loaded children */
export const assignChildIds = (parent: EngineNode, children: EngineNode[] | undefined = parent.ch) => {
  children?.forEach(child => {
    child.id = getChildId(parent, child.k);
    assignChildIds(child);
  });
  return children;
};

/** Sets the ids of the home node of the tree and of its loaded descendants */
export const assignTreeIds = (home: EngineNode) => {
  home.id ??= Constants.TREE_HOME_PREFIX;
  assignChildIds(home);
  return home;
};

/** File name of the children of a node loaded on demand: the path with dots only */
export const idToFileName = (id: string) => id.replaceAll('[', '.').replaceAll('].', '.').replaceAll(']', '');

export const getNodeLabel = (node: EngineNode) => {
  if (node.tp === FUNCTION_TYPE) {
    return node.k + node.v;
  }
  if (node.tp === LINK_TYPE) {
    return `${node.k} → ${getEnginePath(node.v!)}`;
  }
  return node.v !== undefined ? `${node.k}: ${node.v}` : node.k;
};

/** Path in the engine: without the folder (gameplay, visual) */
const getEnginePath = (id: string) => id.substring(id.indexOf('.') + 1);

/** Value of a leaf as shown in the properties, functions with their name */
const getLeafValue = (node: EngineNode) => node.tp === FUNCTION_TYPE ? node.k + node.v : node.v!;

const getFunctionArgs = (node: EngineNode) => node.v!.replaceAll(/[()]/g, '');

/** Bits of the active tags of a tags value ({0,5,12}) */
const getTagsBits = (node: EngineNode) => {
  const tags = node.v!.slice(1, -1);
  return tags.length > 0 ? tags.split(',').map(Number) : [];
};

const getTagsDecimal = (bits: number[]) => bits.reduce((sum, bit) => sum + (1n << BigInt(bit)), 0n).toString();

const getTagsBinary = (bits: number[]) => Array.from({ length: TAGS_COUNT }, (_, i) => bits.includes(TAGS_COUNT - 1 - i) ? '1' : '0')
  .join('');

/** Name, path and other text about the node */
export const getTextEntries = (node: EngineNode): TextEntry[] => {
  const id = node.id!;
  switch (node.tp) {
    case HOME_TYPE:
    case FOLDER_TYPE:
      return [];
    case FUNCTION_TYPE:
      return [
        { name: 'Engine path', text: getEnginePath(id) },
        { name: 'Function Name', text: node.k },
        { name: 'Function Args', text: getFunctionArgs(node) }
      ];
    case TAGS_TYPE: {
      const bits = getTagsBits(node);
      return [
        { name: 'Name', text: node.k },
        { name: 'Engine path', text: getEnginePath(id) },
        { name: 'Decimal value', text: getTagsDecimal(bits) },
        { name: 'Binary value', text: getTagsBinary(bits) },
        { name: 'Active tags', text: bits.join(',') }
      ];
    }
    case LINK_TYPE:
      return [
        { name: 'Name', text: node.k },
        { name: 'Engine path', text: getEnginePath(id) },
        // the same subtree is exported once, the other places refer to it
        { name: 'Same as', text: node.v!, isLink: true }
      ];
    default:
      return [
        { name: 'Name', text: node.k },
        { name: 'Engine path', text: getEnginePath(id) }
      ];
  }
};

/**
 * Properties of the node: the value of a leaf, or the leaf children of an object
 * @param children children of an object node (loaded on demand for some nodes)
 */
export const getProperties = (node: EngineNode, children: EngineNode[] | undefined): PropertyRow[] => {
  switch (node.tp) {
    case HOME_TYPE:
    case FOLDER_TYPE:
    case LINK_TYPE:
      return [];
    case FUNCTION_TYPE:
      return [
        { name: '__args', type: 'Function Args', value: getFunctionArgs(node) },
        { name: '__self', type: TYPE_LABELS[node.tp], value: getLeafValue(node) }
      ];
    case TAGS_TYPE:
      return [
        { name: 'value', type: TYPE_LABELS.num, value: getTagsDecimal(getTagsBits(node)) },
        { name: '__self', type: TYPE_LABELS[node.tp], value: node.v! }
      ];
    default:
      if (LEAF_TYPES.includes(node.tp)) {
        return [{ name: '__self', type: TYPE_LABELS[node.tp], value: node.v! }];
      }
      return (children ?? [])
        .filter(child => LEAF_TYPES.includes(child.tp))
        .map(child => ({ name: child.k, type: TYPE_LABELS[child.tp], value: getLeafValue(child) }));
  }
};
