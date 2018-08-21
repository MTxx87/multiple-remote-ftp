'use babel';

export const configsFolderNotFound = () => {
  atom.notifications.addWarning('Multiple Remote FTP: ftpconfigs folder not found', {
    detail: 'Please create a /ftpconfigs folder at the root of your project.',
    true,
  });
};

export const projectRequired = () => {
  atom.notifications.addWarning('Multiple Remote FTP: requires a project to work properly.', {
    detail: '',
    true,
  });
};

export const fileFormatNotvalid = (file) => {
  atom.notifications.addWarning('Multiple Remote FTP: Wrong file format', {
    detail: `file ${file} non-compliant. Check out the README file in the plugin for more info about how to structure the ftpconfigs folder.`,
    true,
  });
};

export const noEnvironmentFoldersFound = () => {
  atom.notifications.addWarning('Multiple Remote FTP: ftpconfigs folder is empty.', {
    detail: 'Ftpconfigs folder is empty. Please create subfolders and config files inside.',
    true,
  });
};

export const isGenericError = (detail) => {
  atom.notifications.addError('Multiple Remote FTP', {
    detail,
    true,
  });
};
