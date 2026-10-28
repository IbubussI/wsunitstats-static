import { createTheme } from '@mui/material';

interface DocsPalette {
  main?: string;
  input: {
    gStart: string;
    gEnd: string;
  };
  propTable: {
    idCell: {
      gStart: string;
      gEnd: string;
    };
  };
}

declare module '@mui/material/styles' {
  interface Palette {
    docs: DocsPalette;
  }

  interface PaletteOptions {
    docs?: DocsPalette;
  }
}

export const lightTheme = createTheme({
  palette: {
    docs: {
      main: '#a6daff',
      input: {
        gStart: '#daf1f7',
        gEnd: '#fff0'
      },
      propTable: {
        idCell: {
          gStart: '#d9f1fc',
          gEnd: '#acdafc'
        }
      }
    }
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    docs: {
      input: {
        gStart: '#181818',
        gEnd: '#fff0'
      },
      propTable: {
        idCell: {
          gStart: '#0003',
          gEnd: '#fff0'
        }
      }
    }
  },
});
