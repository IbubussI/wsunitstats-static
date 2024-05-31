import * as React from 'react';
import { WeaponTable } from "components/Pages/UnitPage/Tabs/Weapons/WeaponTable";
import { GridGroup, ResizableGrid } from 'components/Layout/ResizableGrid';

const MIN_WIDTH = 340;
const COLUMN_WIDTH = 570;

export const WeaponTab = ({ entity: unit }) => {
  const getWeaponArray = (unit) => {
    const weapons = [];
    if (unit.weapons) {
      unit.weapons.forEach((weapon, index) => {
        weapons.push(<WeaponTable
          key={index}
          item={{ weapon: weapon, isTurret: false }}
          overflowMinWidth={MIN_WIDTH} />
        );
      })
    }
    if (unit.turrets) {
      unit.turrets.forEach((turret) => {
        turret.weapons.forEach((weapon, index) => {
          weapons.push(
            <WeaponTable
              key={index}
              item={{
                weapon: weapon,
                isTurret: true,
                turretId: turret.turretId,
                turretRotationSpeed: turret.rotationSpeed
              }}
              overflowMinWidth={MIN_WIDTH} />
          );
        })
      })
    }
    return weapons;
  }
  return (
    <>
      <h3>Weapons</h3>
      <ResizableGrid minWidth={MIN_WIDTH}>
        <GridGroup columnWidth={COLUMN_WIDTH}>
          {getWeaponArray(unit)}
        </GridGroup>
      </ResizableGrid>
    </>
  );
}
