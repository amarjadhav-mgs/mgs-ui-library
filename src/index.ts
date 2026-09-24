// @mgs/ui: the MGS component library. Components are RSuite 6 components, re-exported unchanged,
// so apps only ever import from '@mgs/ui':
//   import { Button } from '@mgs/ui';
//   import '@mgs/ui/styles.css';
import 'rsuite/dist/rsuite.css';
import './theme/mgs-theme.css';

export { Button, ButtonGroup, ButtonToolbar, CustomProvider, IconButton } from 'rsuite';
export type {
  ButtonGroupProps,
  ButtonProps,
  ButtonToolbarProps,
  CustomProviderProps,
  IconButtonProps,
} from 'rsuite';
