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
  Calendar,
  CustomProvider,
  DateInput,
  DatePicker,
  DateRangeInput,
  DateRangePicker,
  IconButton,
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
  ButtonProps,
  ButtonToolbarProps,
  CalendarProps,
  CustomProviderProps,
  DateInputProps,
  DatePickerProps,
  DateRangeInputProps,
  DateRangePickerProps,
  IconButtonProps,
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
