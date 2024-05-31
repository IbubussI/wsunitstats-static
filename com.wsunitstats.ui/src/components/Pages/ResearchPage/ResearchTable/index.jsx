import * as Utils from "utils/utils";
import { Box, Stack, Typography } from "@mui/material";
import { EntityImage } from "components/Atoms/EntityImage";
import { DoubleColumnFrame } from "components/Layout/DoubleColumnFrame";
import { EntityInfo } from "components/Atoms/Renderer";
import { useParams } from "react-router-dom";

const GRID_ITEM_WIDTH = 170;
const GRID_ITEM_GAP = 4;

export const ResearchTable = ({ research }) => {
  const { locale } = useParams();

  // get only unique upgrades to form affected unit list
  const upgrades = research.upgrades?.filter(element => element.unit)
    .filter((element, index, array) => array.findIndex(element_ => element.unit.entityId === element_.unit.entityId) === index);

  return (
    <DoubleColumnFrame column childrenProps={[null, { overflow: 'auto', width: '100%' }]}>
      <Stack alignItems='center' spacing={0.8}>
        <h3 style={{ marginBlockStart: '0.4em', marginBlockEnd: '0.65em', textAlign: 'center' }}>{research.name}</h3>
        <EntityImage image={research.image} width='100px' height='100px'/>
        <Typography variant='body2' align='center'>
          {research.description}
        </Typography>
        <Typography variant='body2' align='center'>
          Game ID: {research.gameId}
        </Typography>
      </Stack>
      {upgrades?.length && <Stack alignItems='center' spacing={0.8}>
        <p>Affected units</p>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, ${GRID_ITEM_WIDTH}px)`,
          gridColumnGap: '4px',
          gridRowGap: '4px',
          width: '100%',
          maxWidth: `${GRID_ITEM_WIDTH * upgrades.length + GRID_ITEM_GAP * (upgrades.length - 1)}px`
        }}>
          {upgrades.map((upgrade, index) => {
            const upgradeData = {
              values: [
                {
                  primary: upgrade.unit.entityName,
                  secondary: upgrade.unit.entityNation ? upgrade.unit.entityNation.name + ', ID: ' + upgrade.unit.entityId : 'ID: ' + upgrade.unit.entityId,
                  image: {
                    path: upgrade.unit.entityImage,
                    width: 50,
                    height: 50,
                  },
                  link: {
                    id: upgrade.unit.entityId,
                    locale: locale,
                    path: Utils.getEntityRoute("unit")
                  },
                  overflow: false
                },
              ].filter(element => element),
            }
            return (
              <EntityInfo key={index} data={upgradeData} />
            );
          })}
        </Box>
      </Stack>}
    </DoubleColumnFrame>
  );
}