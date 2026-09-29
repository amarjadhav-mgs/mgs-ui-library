// @mgs/ui: the MGS component library (see ARCHITECTURE.md). Apps only ever import from '@mgs/ui':
//   import { Button } from '@mgs/ui';
//   import '@mgs/ui/styles.css';
// Order matters: RSuite's styles first (with the icon base styles @rsuite/icons would otherwise inject at runtime), then
// MGS tokens, the semantic theme, the bridge that overrides RSuite's variables, and the reduced-motion rules. Component
// styles come after all of them, through the component exports below.
import 'rsuite/dist/rsuite.css';
import './styles/rsuite-icons.scss';
import './styles/tokens.scss';
import './styles/themes.scss';
import './styles/rsuite-bridge.scss';
import './styles/motion.scss';

// MGS-owned components
export * from './components/MgsProvider';
export * from './components/Button';
export * from './components/IconButton';
export * from './components/ButtonGroup';
export * from './components/Calendar';
export * from './components/Stack';
export * from './components/Input';
export * from './components/Textarea';
export * from './components/PasswordInput';
export * from './components/NumberInput';
export * from './components/InputGroup';
export * from './components/Checkbox';
export * from './components/CheckboxGroup';
export * from './components/Radio';
export * from './components/RadioGroup';
export * from './components/RadioCard';
export * from './components/Switch';
export * from './components/Select';
export * from './components/MultiSelect';
export * from './components/AutoComplete';
export * from './components/DatePicker';
export * from './components/DateRangePicker';
export * from './components/TimePicker';
export * from './components/VisuallyHidden';

// MGS patterns
export * from './patterns/FormField';

// MGS icons
export * from './icons';

// RSuite re-exports waiting for migration to an MGS API (ARCHITECTURE.md → Migrating the RSuite re-exports).
export { Avatar, AvatarGroup, Badge } from 'rsuite';
export type { AvatarGroupProps, AvatarProps, BadgeProps } from 'rsuite';
