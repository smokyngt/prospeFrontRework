declare module '@tabler/icons-react' {
  import type * as React from 'react';

  export type IconProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
    stroke?: number | string;
  };

  export const IconMenu2: React.FC<IconProps>;
  export const IconX: React.FC<IconProps>;
}
