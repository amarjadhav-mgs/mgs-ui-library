// @mgs/ui: the MGS component library. Components are RSuite 6 components, re-exported unchanged,
// so apps only ever import from '@mgs/ui':
//   import { Button } from '@mgs/ui';
//   import '@mgs/ui/styles.css';
import 'rsuite/dist/rsuite.css';
import './theme/mgs-theme.css';

export {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  ButtonGroup,
  ButtonToolbar,
  CustomProvider,
  IconButton,
  Input,
  InputGroup,
  PasswordInput,
  Textarea,
} from 'rsuite';
export type {
  AvatarGroupProps,
  AvatarProps,
  BadgeProps,
  ButtonGroupProps,
  ButtonProps,
  ButtonToolbarProps,
  CustomProviderProps,
  IconButtonProps,
  InputGroupProps,
  InputProps,
  PasswordInputProps,
  TextareaProps,
} from 'rsuite';
