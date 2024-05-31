import * as Utils from "utils/utils";
import * as Constants from "utils/constants";
import { EntityInfo, SubValue, TagList, Text } from 'components/Atoms/Renderer';
import { FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";

export const getRequirementsData = (requirements, locale) => {
  const unitsAll = requirements.unitsAll ? '(All of below)' : '(One of below)';
  const researchesAll = requirements.researchesAll ? '(All of below)' : '(One of below)';
  const unitRequirements = requirements.units?.map((unit) => {
    return [
      {
        renderer: Text,
        align: 'center',
        data: unit.unitId
      },
      {
        renderer: EntityInfo,
        data: {
          values: [
            {
              primary: unit.unitName,
              secondary: unit.unitNation?.name,
              image: {
                path: unit.unitImage,
                width: 35,
                height: 35,
              },
              link: {
                id: unit.unitId,
                locale: locale,
                path: Utils.getEntityRoute('unit')
              },
              overflow: true
            }
          ]
        }
      },
      {
        renderer: Text,
        data: unit.quantity
      },
    ]
  });

  const researchRequirements = requirements.researches?.map((research) => {
    return [
      {
        renderer: Text,
        align: 'center',
        data: research.researchId
      },
      {
        renderer: EntityInfo,
        data: {
          values: [
            {
              primary: research.researchName,
              image: {
                path: research.researchImage,
                width: 35,
                height: 35,
              },
              link: {
                id: research.researchId,
                locale: locale,
                path: Utils.getEntityRoute('research')
              },
              overflow: true
            }
          ]
        }
      },
    ]
  });

  return {
    label: 'Requirements',
    unitData: {
      label: 'Units',
      subLabel: unitsAll,
      head: [
        `Game${Constants.JS_NBSP}ID`,
        'Unit',
        'Quantity'
      ],
      body: unitRequirements
    },
    researchData: {
      label: 'Researches',
      subLabel: researchesAll,
      head: [
        `Game${Constants.JS_NBSP}ID`,
        'Research'
      ],
      body: researchRequirements
    }
  }
}

export const getDamagesData = (damages, attacksNumber) => {
  const damageData = damages ? damages.map((damage) => {
    let damageValue = attacksNumber > 1 && damage.value > 0 ? attacksNumber + 'x' + damage.value : damage.value;
    return { leftCell: damage.type, rightCell: damageValue }
  }) : [];

  return {
    label: 'Damage',
    variant: 'damage',
    width: '150px',
    rowStyle: {
      leftRowWidth: 'max-content',
      rightRowWidth: '47px',
      firstRowPaddingTop: '5px',
      paddingTop: '0px',
      paddingBottom: '0px'
    },
    content: damageData
  }
}

export const getDamageData = (damage, rightWidth, leftWidth) => {
  return [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Area type',
        value: {
          primaryValue: damage.areaType,
          subValues: [
            {
              label: 'radius',
              value: damage.radius
            },
            {
              label: 'angle',
              value: damage.damageAngle
            }
          ]
        },
        valueRenderer: SubValue,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Friendly damage',
        value: '' + !!damage.damageFriendly,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
  ].filter(element => element.childData.type !== undefined || (element.childData.value !== undefined && (!Array.isArray(element.childData.value) || element.childData.value.length > 0)));
}

export const getWeaponData = (weapon, rotationSpeed, rightWidth, leftWidth) => {
  return [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Reload',
        value: weapon.rechargePeriod + Constants.SECONDS_END_MARKER,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Spread',
        value: weapon.spread && weapon.spread + `${Constants.JS_NBSP}%`,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Area type',
        value: {
          primaryValue: weapon.damage.areaType,
          subValues: [
            {
              label: 'radius',
              value: weapon.damage.radius
            },
            {
              label: 'angle',
              value: weapon.damage.damageAngle
            }
          ]
        },
        valueRenderer: SubValue,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Range',
        value: {
          primaryValue: weapon.distance.min ? weapon.distance.min + '...' + weapon.distance.max : weapon.distance.max,
          subValues: [
            {
              label: 'stop',
              value: weapon.distance.stop
            }
          ]
        },
        valueRenderer: SubValue,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Angle',
        value: weapon.angle,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Rotation speed',
        value: rotationSpeed,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Friendly damage',
        value: '' + !!weapon.damage.damageFriendly,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: `Ground attack${Constants.JS_NBSP}(X)`,
        value: '' + !!weapon.attackGround,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Auto attack',
        value: '' + !!weapon.autoAttack,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Projectile speed',
        value: weapon.projectile?.speed,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: 'Projectile inactive',
        value: weapon.projectile?.timeToStartCollision && weapon.projectile?.timeToStartCollision + Constants.SECONDS_END_MARKER,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
  ].filter(element => element.childData.type !== undefined || (element.childData.value !== undefined && (!Array.isArray(element.childData.value) || element.childData.value.length > 0)));
}

export const getBuffData = (buff, locale) => {
  return {
    label: 'Buff info',
    variant: 'popper',
    tableLayout: 'fixed',
    width: 'max-content',
    rowStyle: {
      firstRowPaddingTop: '10px',
      paddingTop: '4px',
      paddingBottom: '4px'
    },
    content: buff && [
      {
        label: 'Buff',
        renderer: EntityInfo,
        value: buff.entityInfo && {
          values: [
            {
              primary: buff.entityInfo.entityName,
              image: {
                path: buff.entityInfo.entityImage,
                width: 35,
                height: 35,
              },
              link: {
                id: buff.entityInfo.entityId,
                locale: locale,
                path: Utils.getEntityRoute("research")
              },
              overflow: true
            },
          ].filter(element => element),
        },  
      },
      {
        label: 'Duration',
        renderer: Text,
        value: buff.period && buff.period + " sec",
      },
      {
        label: 'Affected units',
        baseline: true,
        renderer: TagList,
        value: buff.affectedUnits && {
          tags: buff.affectedUnits
        }
      }
    ].filter(element => element.value !== undefined)
  }
}

export const getAttackData = (weapon) => {
  return {
    label: 'Attack info',
    variant: 'popper',
    tableLayout: 'fixed',
    width: 'max-content',
    rowStyle: {
      firstRowPaddingTop: '10px',
      paddingTop: '4px',
      paddingBottom: '4px'
    },
    content: [
      {
        label: 'Ammo',
        renderer: Text,
        value: weapon.charges,
      },
      {
        label: 'Damages per projectile',
        renderer: Text,
        value: weapon.damage.damagesCount,
      },
      {
        label: 'Damages per attack',
        renderer: Text,
        value: weapon.attacksPerAttack,
      },
      {
        label: 'Attacks per action',
        renderer: Text,
        value: weapon.attacksPerAction,
      },
      {
        label: 'Attack delay',
        renderer: Text,
        value: weapon.attackDelay && weapon.attackDelay + Constants.SECONDS_END_MARKER,
      },
      {
        label: 'Attack time',
        renderer: Text,
        value: weapon.attackTime && weapon.attackTime + Constants.SECONDS_END_MARKER,
      },
      {
        label: 'Average shot time',
        renderer: Text,
        value: weapon.avgShotTime && weapon.avgShotTime + Constants.SECONDS_END_MARKER,
      }
    ].filter(element => element.value !== undefined)
  }
}

export const getEnvData = (damage) => {
  return {
    label: 'Env info',
    variant: 'popper',
    tableLayout: 'fixed',
    width: 'max-content',
    rowStyle: {
      firstRowPaddingTop: '10px',
      paddingTop: '4px',
      paddingBottom: '4px'
    },
    content: [
      {
        label: 'Damage',
        renderer: Text,
        value: damage.envDamage,
      },
      {
        label: 'Can damage',
        labelBaseline: true,
        renderer: TagList,
        value: damage.envsAffected && {
          tags: damage.envsAffected
        }
      }
    ].filter(element => element.value !== undefined)
  }
}

export const getTagData = (tag) => {
  return {
    variant: 'popper',
    tableLayout: 'fixed',
    width: 'max-content',
    rowStyle: {
      firstRowPaddingTop: '4px',
      paddingTop: '4px',
      paddingBottom: '4px'
    },
    content: [
      {
        label: 'Tag Name',
        renderer: Text,
        value: tag.name,
      },
      {
        label: 'Tag Group',
        renderer: Text,
        value: tag.groupName,
      },
      {
        label: 'Tag ID',
        renderer: Text,
        value: tag.gameId,
      },
    ].filter(element => element.value !== undefined)
  }
}