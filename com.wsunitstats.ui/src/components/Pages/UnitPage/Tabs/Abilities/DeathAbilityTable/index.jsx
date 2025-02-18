import { CreateUnitView } from "./CreateUnitView";
import { DamageView } from "./DamageView";

export const DeathAbilityTable = ({ abilityContainer, overflowMinWidth }) => {
  const ability = abilityContainer.ability;
  if (ability.abilityType === 0) { // 0 - create unit
    return <CreateUnitView ability={ability} overflowMinWidth={overflowMinWidth} />
  } else if (ability.abilityType === 0) { // 6 - damage unit
    return <DamageView ability={ability} overflowMinWidth={overflowMinWidth} />
  }
};