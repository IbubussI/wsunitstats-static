import * as Utils from "utils/utils";
import * as Constants from "utils/constants";
import { EntityInfo, SubValue, TagList, Text } from 'components/Atoms/Renderer';
import { FlexibleTableDoubleCellRow } from "components/Layout/FlexibleTable";

export const getRequirementsData = (requirements, locale, t) => {
  const unitsAll = requirements.unitsAll ? t('requirementsAll') : t('requirementsOne');
  const researchesAll = requirements.researchesAll ? t('requirementsAll') : t('requirementsOne');
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
              primary: t(unit.unitName),
              secondary: t(unit.unitNation?.name),
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
        data: t(unit.quantityStr, { min: unit.quantityMin, max: unit.quantityMax })
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
              primary: t(research.researchName),
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
    label: t('requirementsLabel'),
    unitData: {
      label: t('requirementsUnitsLabel'),
      subLabel: unitsAll,
      head: [
        t('gameID').replace(" ", Constants.JS_NBSP),
        t('requirementsUnitsUnit').replace(" ", Constants.JS_NBSP),
        t('requirementsUnitsQuantity').replace(" ", Constants.JS_NBSP)
      ],
      body: unitRequirements
    },
    researchData: {
      label: t('requirementsResearchesLabel'),
      subLabel: researchesAll,
      head: [
        t('gameID').replace(" ", Constants.JS_NBSP),
        t('requirementsResearchesResearch').replace(" ", Constants.JS_NBSP)
      ],
      body: researchRequirements
    }
  }
}

export const getDamagesData = (damages, attacksNumber, t) => {
  const damageData = damages ? damages.map((damage) => {
    let damageValue = attacksNumber > 1 && damage.value > 0 ? attacksNumber + 'x' + damage.value : damage.value;
    return { leftCell: t(damage.type), rightCell: damageValue }
  }) : [];

  return {
    label: t('damagesLabel'),
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

export const getDamageData = (damage, rightWidth, leftWidth, t) => {
  return [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('damageAreaCell'),
        value: {
          primaryValue: t(damage.areaType),
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
        label: t('damageFriendlyCell'),
        value: t('' + !!damage.damageFriendly),
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
  ].filter(element => element.childData.type !== undefined || (element.childData.value !== undefined && (!Array.isArray(element.childData.value) || element.childData.value.length > 0)));
}

export const getWeaponData = (weapon, rotationSpeed, rightWidth, leftWidth, t) => {
  return [
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('weaponReloadCell'),
        value: weapon.rechargePeriod + t(Constants.SECONDS_END_MARKER),
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('weaponSpreadCell'),
        value: weapon.spread && weapon.spread + `${Constants.JS_NBSP}%`,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 1,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('damageAreaCell'),
        value: {
          primaryValue: t(weapon.damage.areaType),
          subValues: [
            {
              label: t('damageAreaCellRadius'),
              value: weapon.damage.radius
            },
            {
              label: t('damageAreaCellAngle'),
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
        label: t('weaponRangeCell'),
        value: {
          primaryValue: weapon.distance.min ? weapon.distance.min + '...' + weapon.distance.max : weapon.distance.max,
          subValues: [
            {
              label: t('weaponRangeCellStop'),
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
        label: t('weaponAngleCell'),
        value: weapon.angle,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('weaponRotationSpeedCell'),
        value: rotationSpeed,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('damageFriendlyCell'),
        value: t('' + !!weapon.damage.damageFriendly),
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('weaponGroundAttackCell'),
        value: t('' + !!weapon.attackGround),
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('weaponAutoAttackCell'),
        value: t('' + !!weapon.autoAttack),
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('weaponProjectileSpeedCell'),
        value: weapon.projectile?.speed,
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
    {
      column: 2,
      renderer: FlexibleTableDoubleCellRow,
      childData: {
        label: t('weaponProjectileInactiveCell'),
        value: weapon.projectile?.timeToStartCollision && weapon.projectile?.timeToStartCollision + t(Constants.SECONDS_END_MARKER),
        widthRight: rightWidth,
        widthLeft: leftWidth
      }
    },
  ].filter(element => element.childData.type !== undefined || (element.childData.value !== undefined && (!Array.isArray(element.childData.value) || element.childData.value.length > 0)));
}

export const getBuffData = (buff, locale, t) => {
  return {
    label: t('buffInfoLabel'),
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
        label: t('buffCell'),
        renderer: EntityInfo,
        value: buff.entityInfo && {
          values: [
            {
              primary: t(buff.entityInfo.entityName),
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
        label: t('buffDuration'),
        renderer: Text,
        value: buff.period && buff.period + t(Constants.SECONDS_END_MARKER),
      },
      {
        label: t('buffAffectedUnits'),
        baseline: true,
        renderer: TagList,
        value: buff.affectedUnits && {
          tags: buff.affectedUnits
        }
      }
    ].filter(element => element.value !== undefined)
  }
}

export const getAttackData = (weapon, t) => {
  return {
    label: t('attackInfoLabel'),
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
        label: t('attackAmmoCell'),
        renderer: Text,
        value: weapon.charges,
      },
      {
        label: t('attackDPPCell'),
        renderer: Text,
        value: weapon.damage.damagesCount,
      },
      {
        label: t('attackDPACell'),
        renderer: Text,
        value: weapon.attacksPerAttack,
      },
      {
        label: t('attackAPACell'),
        renderer: Text,
        value: weapon.attacksPerAction,
      },
      {
        label: t('attackDelayCell'),
        renderer: Text,
        value: weapon.attackDelay && weapon.attackDelay + t(Constants.SECONDS_END_MARKER),
      },
      {
        label: t('attackTimeCell'),
        renderer: Text,
        value: weapon.attackTime && weapon.attackTime + t(Constants.SECONDS_END_MARKER),
      },
      {
        label: t('attackShotTimeCell'),
        renderer: Text,
        value: weapon.avgShotTime && weapon.avgShotTime + t(Constants.SECONDS_END_MARKER),
      }
    ].filter(element => element.value !== undefined)
  }
}

export const getEnvData = (damage, t) => {
  return {
    label: t('envInfoLabel'),
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
        label: t('envDamageCell'),
        renderer: Text,
        value: damage.envDamage,
      },
      {
        label: t('envCanDamageCell'),
        labelBaseline: true,
        renderer: TagList,
        value: damage.envsAffected && {
          tags: damage.envsAffected
        }
      }
    ].filter(element => element.value !== undefined)
  }
}

export const getTagData = (tag, t) => {
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
        label: t('tagNameCell'),
        renderer: Text,
        value: t(tag.name),
      },
      {
        label: t('tagGroupCell'),
        renderer: Text,
        value: t(tag.groupName),
      },
      {
        label: t('tagIdCell'),
        renderer: Text,
        value: tag.gameId,
      },
    ].filter(element => element.value !== undefined || element.value.length !== 0)
  }
}