// MGS icons: a curated set under MGS names. Apps import them from '@mgs/ui', never @rsuite/icons.
// The artwork comes from @rsuite/icons; createIcon gives each one the MGS props (types.ts). Every icon renders an
// <svg> with aria-hidden="true", sized 1em and coloured with currentColor, so it follows the surrounding text.
// Add an icon here when a screen needs it; keep names describing what the icon shows or means.
// /* @__PURE__ */ lets apps' bundlers drop the icons they don't use.
import Plus from '@rsuite/icons/Plus';
import Minus from '@rsuite/icons/Minus';
import Edit from '@rsuite/icons/Edit';
import Trash from '@rsuite/icons/Trash';
import Copy from '@rsuite/icons/Copy';
import Save from '@rsuite/icons/Save';
import Search from '@rsuite/icons/Search';
import Funnel from '@rsuite/icons/Funnel';
import Sort from '@rsuite/icons/Sort';
import Reload from '@rsuite/icons/Reload';
import FileDownload from '@rsuite/icons/FileDownload';
import FileUpload from '@rsuite/icons/FileUpload';
import Attachment from '@rsuite/icons/Attachment';
import Setting from '@rsuite/icons/Setting';
import More from '@rsuite/icons/More';
import Menu from '@rsuite/icons/Menu';
import Check from '@rsuite/icons/Check';
import Close from '@rsuite/icons/Close';
import InfoOutline from '@rsuite/icons/InfoOutline';
import RemindOutline from '@rsuite/icons/RemindOutline';
import CloseOutline from '@rsuite/icons/CloseOutline';
import HelpOutline from '@rsuite/icons/HelpOutline';
import ArrowLeftLine from '@rsuite/icons/ArrowLeftLine';
import ArrowRightLine from '@rsuite/icons/ArrowRightLine';
import ArrowUpLine from '@rsuite/icons/ArrowUpLine';
import ArrowDownLine from '@rsuite/icons/ArrowDownLine';
import Email from '@rsuite/icons/Email';
import Notice from '@rsuite/icons/Notice';
import Admin from '@rsuite/icons/Admin';
import Peoples from '@rsuite/icons/Peoples';
import Calendar from '@rsuite/icons/Calendar';
import Time from '@rsuite/icons/Time';
import Visible from '@rsuite/icons/Visible';
import EyeClose from '@rsuite/icons/EyeClose';
import { createIcon } from './createIcon';

export type { MgsIcon, MgsIconProps } from './types';

// Actions
export const PlusIcon = /* @__PURE__ */ createIcon(Plus, 'PlusIcon');
export const MinusIcon = /* @__PURE__ */ createIcon(Minus, 'MinusIcon');
export const EditIcon = /* @__PURE__ */ createIcon(Edit, 'EditIcon');
export const TrashIcon = /* @__PURE__ */ createIcon(Trash, 'TrashIcon');
export const CopyIcon = /* @__PURE__ */ createIcon(Copy, 'CopyIcon');
export const SaveIcon = /* @__PURE__ */ createIcon(Save, 'SaveIcon');
export const SearchIcon = /* @__PURE__ */ createIcon(Search, 'SearchIcon');
export const FilterIcon = /* @__PURE__ */ createIcon(Funnel, 'FilterIcon');
export const SortIcon = /* @__PURE__ */ createIcon(Sort, 'SortIcon');
export const ReloadIcon = /* @__PURE__ */ createIcon(Reload, 'ReloadIcon');
export const DownloadIcon = /* @__PURE__ */ createIcon(FileDownload, 'DownloadIcon');
export const UploadIcon = /* @__PURE__ */ createIcon(FileUpload, 'UploadIcon');
export const AttachmentIcon = /* @__PURE__ */ createIcon(Attachment, 'AttachmentIcon');
export const SettingsIcon = /* @__PURE__ */ createIcon(Setting, 'SettingsIcon');
export const MoreIcon = /* @__PURE__ */ createIcon(More, 'MoreIcon');
export const MenuIcon = /* @__PURE__ */ createIcon(Menu, 'MenuIcon');

// Status and feedback
export const CheckIcon = /* @__PURE__ */ createIcon(Check, 'CheckIcon');
export const CloseIcon = /* @__PURE__ */ createIcon(Close, 'CloseIcon');
export const InfoIcon = /* @__PURE__ */ createIcon(InfoOutline, 'InfoIcon');
export const WarningIcon = /* @__PURE__ */ createIcon(RemindOutline, 'WarningIcon');
export const ErrorIcon = /* @__PURE__ */ createIcon(CloseOutline, 'ErrorIcon');
export const HelpIcon = /* @__PURE__ */ createIcon(HelpOutline, 'HelpIcon');

// Navigation and direction (chevrons also serve Back / Next buttons)
export const ChevronLeftIcon = /* @__PURE__ */ createIcon(ArrowLeftLine, 'ChevronLeftIcon');
export const ChevronRightIcon = /* @__PURE__ */ createIcon(ArrowRightLine, 'ChevronRightIcon');
export const ChevronUpIcon = /* @__PURE__ */ createIcon(ArrowUpLine, 'ChevronUpIcon');
export const ChevronDownIcon = /* @__PURE__ */ createIcon(ArrowDownLine, 'ChevronDownIcon');

// Objects
export const EmailIcon = /* @__PURE__ */ createIcon(Email, 'EmailIcon');
export const BellIcon = /* @__PURE__ */ createIcon(Notice, 'BellIcon');
export const UserIcon = /* @__PURE__ */ createIcon(Admin, 'UserIcon');
export const UsersIcon = /* @__PURE__ */ createIcon(Peoples, 'UsersIcon');
export const CalendarIcon = /* @__PURE__ */ createIcon(Calendar, 'CalendarIcon');
export const TimeIcon = /* @__PURE__ */ createIcon(Time, 'TimeIcon');
export const EyeIcon = /* @__PURE__ */ createIcon(Visible, 'EyeIcon');
export const EyeOffIcon = /* @__PURE__ */ createIcon(EyeClose, 'EyeOffIcon');
