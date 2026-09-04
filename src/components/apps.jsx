import AboutWindow from './AboutWindow';
import ContactWindow from './ContactWindow';
import EducationWindow from './EducationWindow';
import NotesWindow from './NotesWindow';
import ProjectsWindow from './ProjectsWindow';
import RecycleBinWindow from './RecycleBinWindow';
import ResumeWindow from './ResumeWindow';
import SkillsWindow from './SkillsWindow';
import TerminalWindow from './TerminalWindow';
import {
  IconAbout, IconContact, IconEducation, IconNotes, IconProjects,
  IconRecycle, IconResume, IconSkills, IconTerminal,
} from './Icons';

/**
 * The application registry: one entry per launchable app. Desktop icons, the
 * Start menu, the taskbar and the terminal all read from this, so adding an
 * app means adding one row here.
 */
export const APPS = {
  about: {
    id: 'about', label: 'About Me', Icon: IconAbout, Component: AboutWindow,
    width: 404, height: 268, onDesktop: true, inStart: true,
  },
  education: {
    id: 'education', label: 'Education', Icon: IconEducation, Component: EducationWindow,
    width: 382, height: 252, onDesktop: true, inStart: true,
  },
  projects: {
    id: 'projects', label: 'Projects', Icon: IconProjects, Component: ProjectsWindow,
    width: 452, height: 292, onDesktop: true, inStart: true,
  },
  skills: {
    id: 'skills', label: 'Skills', Icon: IconSkills, Component: SkillsWindow,
    width: 436, height: 284, onDesktop: true, inStart: true,
  },
  resume: {
    id: 'resume', label: 'Resume', Icon: IconResume, Component: ResumeWindow,
    width: 396, height: 284, onDesktop: true, inStart: true,
  },
  contact: {
    id: 'contact', label: 'Contact', Icon: IconContact, Component: ContactWindow,
    width: 386, height: 284, onDesktop: true, inStart: true,
  },
  recyclebin: {
    id: 'recyclebin', label: 'Recycle Bin', Icon: IconRecycle, Component: RecycleBinWindow,
    width: 360, height: 232, onDesktop: true, inStart: false,
  },
  terminal: {
    id: 'terminal', label: 'Terminal', Icon: IconTerminal, Component: TerminalWindow,
    width: 424, height: 252, onDesktop: false, inStart: true,
  },
  notes: {
    id: 'notes', label: 'Notes', Icon: IconNotes, Component: NotesWindow,
    width: 344, height: 250, onDesktop: false, inStart: true,
  },
};

/** Order the icons appear on the desktop, matching the requested layout. */
export const DESKTOP_ORDER = [
  'about', 'education',
  'projects', 'skills',
  'resume', 'contact',
  'recyclebin',
];

export const START_ORDER = [
  'about', 'education', 'projects', 'skills', 'resume', 'contact', 'terminal', 'notes',
];
