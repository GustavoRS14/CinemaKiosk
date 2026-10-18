/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '@icons/*.svg' {
  import type { FunctionComponent, SVGProps } from 'react';

  const Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default Icon;
}

declare module '@illustrations/*.svg' {
  import type { FunctionComponent, SVGProps } from 'react';

  const Illustration: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default Illustration;
}

declare module '@/*.svg' {
  import type { FunctionComponent, SVGProps } from 'react';

  const Illustration: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default Illustration;
}
