'use babel';

import MultipleRemoteFtpView from './multiple-remote-ftp-view';
import { CompositeDisposable, watchPath } from 'atom';
import { requirePackages } from 'atom-utils';
import { $ } from 'atom-space-pen-views';
import Path from 'path';
import fs from 'fs-extra';
import { noEnvironmentFoldersFound, configsFolderNotFound, projectRequired, fileFormatNotvalid, isGenericError } from './notifications';


export default {

  multipleRemoteFtpView: null,
  modalPanel: null,
  subscriptions: null,
  mytree: null,
  isVisible: null,

  activate(state) {

    this.multipleRemoteFtpView = this.setUpView(state);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'multiple-remote-ftp:toggle': () => this.toggle()
      }
    ));
    this.subscriptions.add(
      atom.commands.add('.multiple-remote-ftp .mrftp-menu', {
        'multiple-remote-ftp:openmenu': () => this.openmenu()
      }
    ));

    var self = this;
    var watcher = atom.project.onDidChangeFiles(events => {

      if (!events.length) {
        return;
      }

      for(i=0; i<events.length; i++) {
        if (events[i].path.indexOf('ftpconfigs/') !== -1) {
          console.log("reload instance")
          this.reloadView();
        }
      }

    });

    this.subscriptions.add(watcher);

  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.multipleRemoteFtpView.destroy();
  },

  serialize() {
    return {
      multipleRemoteFtpViewState: this.multipleRemoteFtpView.serialize()
    };
  },

  toggle() {
    var self = this;
    if (this.isVisible) {
      //console.log("remove element...");
      this.multipleRemoteFtpView.destroy();
      this.isVisible = false;
    } else {
      //console.log("add element...");
      if (this.mytree) {
        //console.log("tree view exists...");
        this.showInTree(this.mytree);
      } else {
        //console.log("get tree view...");
        requirePackages('tree-view').then(function([{treeView}]) {
          if (treeView && treeView.isVisible()) {
            self.showInTree(treeView);
            self.attachDomListeners();
          } else {
            //console.log("tree is not visible...");
          }
        });
      }
    }
  },

  setUpView(state) {

    if (!this.getConfigsPath()) {
      projectRequired();
    }

    var configFiles = this.searchForEnvironments(this.getConfigsPath());

    return new MultipleRemoteFtpView(state.multipleRemoteFtpViewState, configFiles);

  },

  showInTree(treeView) {
    this.mytree = treeView;
    this.mytree.element.prepend(this.multipleRemoteFtpView.getElement());
    this.isVisible = true;
  },

  attachDomListeners() {
    var self = this;
    var wrapper = this.multipleRemoteFtpView.getElement();
    var button = wrapper.querySelector('.mrftp-selected-label');
    //console.log(button);
    button.addEventListener("click", function(e) {
      var clicked = e.target;
      self.toggleMenu(clicked);
    });
    var listElements = wrapper.querySelectorAll('li[data-config]');
    //console.log(listElements);
    if (!listElements.length) {
      isGenericError('No items found in list.');
    }

    for (i=0; i<listElements.length; i++) {
      listElements[i].addEventListener("click", function(e) {
        var clicked = e.target;
        self.ftpSelected(clicked);
      });
    }

  },

  toggleMenu(button) {
    var menuWrapper = button.parentNode;
    if (menuWrapper.classList.contains('open')) {
      console.log("menu compress...");
      menuWrapper.classList.remove('open');
    } else {
      console.log("menu expand...");
      menuWrapper.classList.add('open');
    }
  },

  ftpSelected(clicked) {
    let file = clicked.getAttribute("data-config");
    var wrapper = this.multipleRemoteFtpView.getElement();
    var button = wrapper.querySelector('.mrftp-selected-label');

    if (file === '') {
      var text = '-- None --';
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'remote-ftp:disconnect');
      this.multipleRemoteFtpView.updateLabel(text);
      this.toggleMenu(button);
      return false;
    }

    let filePath = this.getFilePath('./ftpconfigs/' + file + '.ftpconfig');
    let projectPath = this.getProjectPath();

    try {
      fs.copySync(filePath, projectPath + '/.ftpconfig');
    } catch (err) {
      console.error(err);
      isGenericError('Error while copying config file');
      return false;
    }

    var text = clicked.textContent;
    this.multipleRemoteFtpView.updateLabel(text);
    atom.commands.dispatch(atom.views.getView(atom.workspace),'remote-ftp:connect');
    this.toggleMenu(button);
    return true
  },

  getConfigsPath() {
    let hasProject = atom.project && atom.project.getPaths().length;
    if (!hasProject) {
      return false;
    }
    return this.getFilePath('./ftpconfigs/');
  },

  getFilePath(relativePath) {
    const self = this;
    const projectPath = self.getProjectPath();
    if (projectPath === false) {
      return false;
    }
    return Path.resolve(projectPath, relativePath);
  },

  getProjectPath() {
    const self = this;
    let projectPath = null;

    const firstDirectory = atom.project.getDirectories()[0];
    if (firstDirectory != null) projectPath = firstDirectory.path;

    if (projectPath != null) {
      self.projectPath = projectPath;
      return projectPath;
    }

    return false;
  },

  searchForEnvironments(configsPath) {

    var isFolder = this.lookForConfigFolder(configsPath);

    if (!isFolder) {
      configsFolderNotFound();
      return false;
    }

    var envFound = fs.readdirSync(configsPath);

    if (!envFound.length) {
      noEnvironmentFoldersFound();
      return false;
    }

    //LOOK FOR FILES OR OTHER FIRST
    //TRY TO CONVERT ALSO
    for (i=0; i < envFound.length; i++) {

      child = envFound[i];
      path = configsPath + '/' + child;

      isDir = fs.lstatSync(path).isDirectory();
      isFile = fs.lstatSync(path).isFile();

      converted = false;

      if (isFile) {
        if (!(/([^\s]).(ftpconfig)$/i).test(child) ) {
          fileFormatNotvalid(child);
          continue;
        } else {
          console.log(path + " is a file following V1 format, try conversion");
          converted = this.convertToDirectory(configsPath, child);
        }

      }

      if (isDir || converted) {
        console.log("it is a directory or DONE CONVERTIN");
      //   //everything is ok, it is a directory
      //  //test the format of inner files
      //   continue;
      // } else {
      //   //throw error
      }

    }


    // for (i=0; i < envFound.length; i++) {
    //   var singleEnv = envFound[i];
    //   var path = configsPath + '/' + singleEnv;
    //   var isDir = fs.lstatSync(path).isDirectory();
    //   console.log(path + ' : ' + isDir);
    //
    //   if (!(/([^\s]).(ftpconfig)$/i).test(singleEnv) ) {
    //     fileFormatNotvalid(singleEnv);
    //     return false;
    //   }
    // }

    return envFound;

  },

  convertToDirectory(configsPath, file) {


    //NOTE: THIS FUNCTION LEADS TO INFINITE LOOP AS IT CHANGES THE FOLDER WHERE WE HAVE SETUP A LISTENER
    //2 OPTIONS:
    // - WE DISABLE THE LISTENER WHILE WE DO THE CHANGES
    // - WE CONVERT TO THE NEW FORMAT OF FOLDERS BEFORE SETTING UP THE LISTENER

    //folder name will be file name without extension
    var newFolderName = file.replace(/\.[^/.]+$/, "");
    var newFolderPath = configsPath + '/' + newFolderName;

    if (!fs.existsSync(newFolderPath)){
      try {
        fs.mkdirSync(newFolderPath);
      } catch (err) {
        console.error(err);
        isGenericError('Error while creating config folder');
        return false;
      }
    }

    var oldFilePath = configsPath + '/' + file;
    var newFilePath = newFolderPath + '/.ftpconfig';

    try {
      fs.copySync(oldFilePath, newFilePath);
    } catch (err) {
      console.error(err);
      isGenericError('Error while copying config file');
      return false;
    }

    fs.unlinkSync(oldFilePath);

    return true;

  },

  reloadView() {
    this.multipleRemoteFtpView.destroy();
    this.isVisible = false;
    this.mytree = false;
    this.multipleRemoteFtpView = this.setUpView({});
    this.toggle();
  },

  lookForConfigFolder(configsPath) {
    if (fs.existsSync(configsPath)) {
      return true;
    }

    return false;
  }

  //look for export const traverseTree

};
