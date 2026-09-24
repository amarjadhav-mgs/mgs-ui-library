// Minimal inline icons for stories only (not shipped with the library).
import type { SVGProps } from 'react';

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PlusIcon = () => (
  <Icon>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const ArrowLeftIcon = () => (
  <Icon>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Icon>
);

export const ArrowRightIcon = () => (
  <Icon>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Icon>
);

export const DownloadIcon = () => (
  <Icon>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </Icon>
);

export const TrashIcon = () => (
  <Icon>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

/** Options for Storybook `select` controls: `mapping` turns the name into the element. */
export const iconOptions = {
  none: undefined,
  plus: <PlusIcon />,
  arrowLeft: <ArrowLeftIcon />,
  arrowRight: <ArrowRightIcon />,
  download: <DownloadIcon />,
  trash: <TrashIcon />,
  close: <CloseIcon />,
};
