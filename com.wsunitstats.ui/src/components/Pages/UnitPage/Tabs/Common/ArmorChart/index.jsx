import * as React from 'react';
import { Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const ArmorChart = ({content, colors}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const chartRef = React.useRef();

  const [probabilities, values, avg, legendEntries] = React.useMemo(() => {
    const probabilities_ = [];
    const values_ = [];
    const legendEntries_ = [];
    for (let i = 0; i < content.length; ++i) {
      const probability = content[i].probability;
      if (probability > 0) {
        const value = content[i].value;
        probabilities_.push(probability);
        values_.push(value);
        legendEntries_.push({
          color: colors[i],
          probability: probability,
          value: value
        });
      }
    }
    const avg_ = findAverage(values_, probabilities_).toFixed(1);
    return [probabilities_, values_, avg_, legendEntries_];
  }, [content, colors]);

  const data = {
    labels: [], // use custom labels function
    datasets: [
      {
        data: probabilities,
        dataValues: values,
        borderWidth: 1,
        backgroundColor: colors,
        centerText: t('commonArmorAVG'),
        avgColor: theme.palette.text.primary
      }
    ]
  };

  const avgPlugin = {
    id: "avgPlugin",
    beforeDraw(chart, _, opts) {
      const { ctx, data } = chart;
      const x = chart.getDatasetMeta(0).data[0].x;
      const y = chart.getDatasetMeta(0).data[0].y;
      const dataset = data.datasets[0];

      ctx.font = 'bolder 18px sans-relief';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = dataset.avgColor;
      ctx.fillText(dataset.centerText, x, y - 10);
      ctx.fillText(opts.avg, x, y + 10);
    }
  }

  const tooltipTitle = (tooltipItems) => {
    const tooltipItem = tooltipItems[0];
    const dataset = tooltipItem.chart.data.datasets[0];
    const value = dataset.dataValues[tooltipItem.dataIndex];
    return t('commonArmorValue', { value: value });
  }

  const tooltipLabel = (tooltipItem) => {
    const dataset = tooltipItem.chart.data.datasets[0];
    const value = dataset.data[tooltipItem.dataIndex];
    return value + '%';
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 1.5,
    plugins: {
      avgPlugin: {
        avg: avg
      },
      legend: {
        display: false,
        position: 'bottom',
        onClick: (e) => e.stopPropagation()
      },
      tooltip: {
        callbacks: {
          title: tooltipTitle,
          label: tooltipLabel,
        }
      },
    },
  }

  return (
    <>
      <Box sx={{ width: '150px', height: '150px' }}>
        <Doughnut
          ref={chartRef}
          data={data}
          options={options}
          plugins={[avgPlugin, Tooltip, Legend]}
        />
      </Box>
      <Box sx={{ paddingTop: '10px' }}>
        <LegendTable data={legendEntries} />
      </Box>
    </>
  );
};

function findAverage(values, probabilities) {
  let result = 0;
  for (let i = 0; i < values.length; ++i) {
    result = result + values[i] * probabilities[i] / 100;
  }
  return result;
}

const LegendTable = ({ data }) => {
  return (
    <TableContainer sx={{ width: 'fit-content' }}>
      <Table>
        <TableBody>
          {data.map((entry, index) => {
            return (
              <TableRow key={index} sx={{
                '& td': {
                  paddingTop: '3px',
                  paddingBottom: '3px',
                  paddingRight: '3px',
                  paddingLeft: '3px',
                  verticalAlign: 'middle',
                  width: 'fit-content',
                  border: 0
                }
              }}>
                <TableCell>
                  <svg width="50" height="20" display='block'>
                    <rect width="50" height="20" style={{ fill: entry.color }} />
                  </svg>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body2'>
                    {entry.probability}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>
                    : {entry.value}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
