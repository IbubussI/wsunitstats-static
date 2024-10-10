import { SvgIcon } from "@mui/material";

const colorLine = 'rgb(91, 91, 91)';
const colorButton = 'rgb(43, 113, 182)';
const colorIcon = 'rgb(91, 91, 91)';

export const NodeIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0, 0, 18, 18">
      <path style={{
        display: 'inline',
        fill: colorIcon,
        stroke: 'none'
      }}
        d="M 16.656999,9.4643458 13.334596,7.5653338 V 3.7673087 A 0.67255127,0.67102901 0 0 0 12.991595,3.1835134 L 9.3329162,1.0899029 a 0.67255127,0.67102901 0 0 0 -0.672552,0 L 5.0016855,3.1835134 A 0.67255127,0.67102901 0 0 0 4.6586844,3.7673087 V 7.5653338 L 1.3362812,9.4643458 A 0.67255127,0.67102901 0 0 0 1.0000055,10.048141 v 4.187221 a 0.67255127,0.67102901 0 0 0 0.3362757,0.577085 l 3.6654043,2.093611 a 0.67255127,0.67102901 0 0 0 0.6725511,0 l 3.3291286,-1.899012 3.3291298,1.899012 a 0.67255127,0.67102901 0 0 0 0.336275,0.09394 0.67255127,0.67102901 0 0 0 0.32955,-0.09394 l 3.665404,-2.093611 A 0.67255127,0.67102901 0 0 0 17,14.235358 V 10.048141 A 0.67255127,0.67102901 0 0 0 16.656999,9.4643458 Z M 8.9966402,2.4453815 11.989493,4.1565055 V 7.7330908 L 8.9899152,9.4509258 6.0037872,7.7062498 V 4.1565055 Z M 5.3312357,15.550579 2.345108,13.846166 v -3.42896 L 5.4926481,8.6188498 8.4518742,10.343394 v 3.428958 z M 15.627996,13.846166 12.641868,15.550579 9.5279562,13.772352 v -3.402117 l 2.9995788,-1.7245442 3.100461,1.7715152 z" />
    </SvgIcon>
  );
};

export const EndLeafIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0, 0, 18, 18">
      <path style={{
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1,1',
        strokeDashoffset: 1.5,
        strokeOpacity: 1
      }}
        d="M 9,0 V 9.5" />
      <path style={{
        display: 'inline',
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1,1',
        strokeDashoffset: 0,
        strokeOpacity: 1
      }}
        d="M 8.5,9 H 18" />
    </SvgIcon>
  );
};

export const EndInternalCollapsedIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0, 0, 18, 18">
      <path style={{
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1, 1',
        strokeDashoffset: 1.5,
        strokeOpacity: 1
      }}
        d="M 9,0 V 9.5" />
      <path style={{
        display: 'inline',
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1, 1',
        strokeDashoffset: 0,
        strokeOpacity: 1
      }}
        d="M 8.5,9 H 18" />
      <g transform="matrix(0.54305015,0,0,0.54305015,2.483398,2.483398)"
        style={{ display: 'inline' }}>
        <path style={{
          fill: colorButton,
          fillOpacity: 1
        }}
          d="M 19,3 H 5 C 3.9,3 3,3.9 3,5 v 14 c 0,1.1 0.9,2 2,2 h 14 c 1.1,0 2,-0.9 2,-2 V 5 C 21,3.9 20.1,3 19,3 Z" />
        <path style={{
          fill: '#ffffff',
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 1.5,
          strokeDasharray: '1.5, 1.5',
          strokeDashoffset: 0
        }}
          d="m 7,11 h 10 v 2 H 7 v 0 z" />
        <path style={{
          display: 'inline',
          fill: '#ffffff',
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 1.5,
          strokeDasharray: '1.5, 1.5',
          strokeDashoffset: 0
        }}
          d="M 13.000829,6.9995415 V 17.000459 h -1.999815 v -10.0009175 0 z" />
      </g>
    </SvgIcon>
  );
};

export const EndInternalExpandedIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0, 0, 18, 18">
      <path
        style={{
          fill: 'none',
          stroke: colorLine,
          strokeWidth: 1,
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeDasharray: '1, 1',
          strokeDashoffset: 1.5,
          strokeOpacity: 1
        }}
        d="M 9,0 V 9.5" />
      <path style={{
        display: 'inline',
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1, 1',
        strokeDashoffset: 0,
        strokeOpacity: 1
      }}
        d="M 8.5,9 H 18" />
      <g transform="matrix(0.54305015,0,0,0.54305015,2.483398,2.483398)"
        style={{ display: 'inline' }}>
        <path style={{
          fill: colorButton,
          fillOpacity: 1
        }}
         d="M 19,3 H 5 C 3.9,3 3,3.9 3,5 v 14 c 0,1.1 0.9,2 2,2 h 14 c 1.1,0 2,-0.9 2,-2 V 5 C 21,3.9 20.1,3 19,3 Z" />
        <path style={{
          fill: '#ffffff',
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 1.5,
          strokeDasharray: '1.5, 1.5',
          strokeDashoffset: 0
        }}
          d="m 7,11 h 10 v 2 H 7 v 0 z" />
      </g>
    </SvgIcon>
  );
};

export const IntermediateLeafIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0, 0, 18, 18">
      <path style={{
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1,1',
        strokeDashoffset: 1.5,
        strokeOpacity: 1
      }}
        d="M 9,0 V 18" />
      <path style={{
        display: 'inline',
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1,1',
        strokeDashoffset: 0,
        strokeOpacity: 1
      }}
        d="M 8.5,9 H 18" />
    </SvgIcon>
  );
};

export const IntermediateInternalCollapsedIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0, 0, 18, 18">
      <path style={{
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1,1',
        strokeDashoffset: 1.5,
        strokeOpacity: 1
      }}
        d="M 9,0 V 18" />
      <path style={{
        display: 'inline',
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1,1',
        strokeDashoffset: 0,
        strokeOpacity: 1
      }}
        d="M 8.5,9 H 18" />
      <g transform="matrix(0.54305015,0,0,0.54305015,2.483398,2.483398)"
        style={{ display: 'inline' }}>
        <path style={{
          fill: colorButton,
          fillOpacity: 1
        }}
          d="M 19,3 H 5 C 3.9,3 3,3.9 3,5 v 14 c 0,1.1 0.9,2 2,2 h 14 c 1.1,0 2,-0.9 2,-2 V 5 C 21,3.9 20.1,3 19,3 Z" />
        <path style={{
          fill: '#ffffff',
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 1.5,
          strokeDasharray: '1.5, 1.5',
          strokeDashoffset: 0
        }}
          d="m 7,11 h 10 v 2 H 7 v 0 z" />
        <path style={{
          display: 'inline',
          fill: '#ffffff',
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 1.5,
          strokeDasharray: '1.5, 1.5',
          strokeDashoffset: 0
        }}
          d="M 13.000829,6.9995415 V 17.000459 h -1.999815 v -10.0009175 0 z" />
      </g>
    </SvgIcon>
  );
};

export const IntermediateInternalExpandedIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0, 0, 18, 18">
      <path style={{
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1,1',
        strokeDashoffset: 1.5,
        strokeOpacity: 1
      }}
        d="M 9,0 V 18" />
      <path style={{
        display: 'inline',
        fill: 'none',
        stroke: colorLine,
        strokeWidth: 1,
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeDasharray: '1,1',
        strokeDashoffset: 0,
        strokeOpacity: 1
      }}
        d="M 8.5,9 H 18" />
      <g transform="matrix(0.54305015,0,0,0.54305015,2.483398,2.483398)"
        style={{ display: 'inline' }}>
        <path style={{
          fill: colorButton,
          fillOpacity: 1
        }}
          d="M 19,3 H 5 C 3.9,3 3,3.9 3,5 v 14 c 0,1.1 0.9,2 2,2 h 14 c 1.1,0 2,-0.9 2,-2 V 5 C 21,3.9 20.1,3 19,3 Z" />
        <path style={{
          fill: '#ffffff',
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 1.5,
          strokeDasharray: '1.5, 1.5',
          strokeDashoffset: 0
        }}
          d="m 7,11 h 10 v 2 H 7 v 0 z" />
      </g>
    </SvgIcon>
  );
};

export const IntermediateLineIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0, 0, 18, 18">
      <path
        style={{
          fill: 'none',
          stroke: colorLine,
          strokeWidth: 1,
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeDasharray: '1,1',
          strokeDashoffset: 1.5,
          strokeOpacity: 1
        }}
        d="M 9,0 V 18" />
    </SvgIcon>
  );
};