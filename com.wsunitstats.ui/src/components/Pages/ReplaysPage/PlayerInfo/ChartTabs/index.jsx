import { Typography } from '@mui/material';
import { TimeLineChart } from 'components/Atoms/TimeLineChart';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export const ChartTabs = (props) => {
  const {
    playerCharts,
    playerNickname,
    playerColor
  } = props;
  const { t } = useTranslation();

  return (
    <TimeLineChart
      datasets={[playerCharts.ecoEfficiency]}
      length={playerCharts.ecoEfficiency.length}
      labels={[playerNickname]}
      title={t('playerEcoEfficiencyChartTitle')}
      stepTime={playerCharts.timeLinePeriod}
      infoText={
        <Typography variant="caption" sx={{ whiteSpace: 'pre-line'}}>
          {t('playerEcoEfficiencyChartDescription')}
        </Typography>
      }
    />
  );
};
