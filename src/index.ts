// @mgs/ui: the MGS component library (see ARCHITECTURE.md). Apps only ever import from '@mgs/ui':
//   import { Button } from '@mgs/ui';
//   import '@mgs/ui/styles.css';
// Order matters: RSuite's styles first, then MGS tokens, the semantic theme and the bridge that overrides RSuite's
// variables. Component styles come after all of them, through the component exports below.
import 'rsuite/dist/rsuite.css';
import './styles/tokens.scss';
import './styles/themes.scss';
import './styles/rsuite-bridge.scss';

// MGS-owned components
export * from './components/Button';
export * from './components/IconButton';

// MGS icons
export * from './icons';

// RSuite re-exports: MGS adds nothing to these beyond the theme (ARCHITECTURE.md → What does MGS own here?).
export {
  Avatar,
  AvatarGroup,
  Badge,
  ButtonGroup,
  ButtonToolbar,
  Calendar,
  CustomProvider,
  DateInput,
  DatePicker,
  DateRangeInput,
  DateRangePicker,
  Input,
  InputGroup,
  PasswordInput,
  Textarea,
  TimePicker,
  TimeRangePicker,
} from 'rsuite';
export type {
  AvatarGroupProps,
  AvatarProps,
  BadgeProps,
  ButtonGroupProps,
  ButtonToolbarProps,
  CalendarProps,
  CustomProviderProps,
  DateInputProps,
  DatePickerProps,
  DateRangeInputProps,
  DateRangePickerProps,
  InputGroupProps,
  InputProps,
  PasswordInputProps,
  TextareaProps,
  TimePickerProps,
  TimeRangePickerProps,
} from 'rsuite';
export {
  after,
  afterToday,
  allowedDays,
  allowedMaxDays,
  allowedRange,
  before,
  beforeToday,
  combine,
} from 'rsuite';
export type { DateRange } from 'rsuite';
