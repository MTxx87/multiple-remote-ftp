'use babel';

export const configsFolderNotFound = () => {
  atom.notifications.addWarning('Multiple Remote FTP: ftpconfigs folder not found', {
    detail: 'Please create a /ftpconfigs folder at the root of your project.',
    true,
  });
};

export const configsNotFound = () => {
  atom.notifications.addWarning('Multiple Remote FTP: {name}.ftpconfig files not found', {
    detail: 'Please create {name}.ftpconfig files inside /ftpconfigs folder.',
    true,
  });
};

export const projectRequired = () => {
  atom.notifications.addWarning('Multiple Remote FTP: requires a project to work properly.', {
    detail: '',
    true,
  });
};

export const fileFormatNotvalid = (directory) => {
  atom.notifications.addWarning('Multiple Remote FTP: Wrong file format', {
    detail: `${directory} contains files with wrong format. Correct format is .ftpconfig or .ftpignore.`,
    true,
  });
};

export const isGenericError = (detail) => {
  atom.notifications.addError('Multiple Remote FTP', {
    detail,
    true,
  });
};


export const folderFormatNotvalid = (file) => {
  atom.notifications.addWarning('Multiple Remote FTP: Wrong folder structure', {
    detail: `${file} is not a directory. Only directories should be contained in /ftpconfigs folder`,
    true,
  });
};

export const envFormatNotvalid = (folder) => {
  atom.notifications.addWarning('Multiple Remote FTP: Folder is empty', {
    detail: `${folder} is empty. Does not contain ftpconfig/ftpignore files`,
    true,
  });
};

export const noticeOfNonBackwardCompatibilityStructure = () => {
  atom.notifications.addWarning('Multiple Remote FTP: WARNING!!!!!', {
    detail: 'We changed the way /ftpconfigs folder should be structured. Please check the plugin repo on README.',
    false,
  });
};
