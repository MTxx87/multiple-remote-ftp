'use babel';

import MultipleRemoteFtpView from './multiple-remote-ftp-view';
import { CompositeDisposable, watchPath } from 'atom';
import { requirePackages } from 'atom-utils';
import { $ } from 'atom-space-pen-views';
import Path from 'path';
import fs from 'fs-extra';
import { noticeOfNonBackwardCompatibilityStructure, envFormatNotvalid, folderFormatNotvalid, configsFolderNotFound, configsNotFound, projectRequired, fileFormatNotvalid, isGenericError } from './notifications';


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

    var enviroments = this.searchForEnvironments(this.getConfigsPath());

    return new MultipleRemoteFtpView(state.multipleRemoteFtpViewState, enviroments);

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
    let folder = clicked.getAttribute("data-config");
    var wrapper = this.multipleRemoteFtpView.getElement();
    var button = wrapper.querySelector('.mrftp-selected-label');

    if (folder === '') {
      var text = '-- None --';
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'remote-ftp:disconnect');
      this.multipleRemoteFtpView.updateLabel(text);
      this.toggleMenu(button);
      return false;
    }

    let folderPath = this.getFilePath('./ftpconfigs/' + folder);
    let projectPath = this.getProjectPath();
    let filesToCopy = fs.readdirSync(folderPath);

    if (!filesToCopy.length) {
      isGenericError('Error while copying ftpconfig/ftpignore files');
      return false;
    }

    for(i=0; i < filesToCopy.length; i++) {
      var singleFile = filesToCopy[i];
      try {
        fs.copySync(folderPath + '/' + singleFile, projectPath + '/' + singleFile);
      } catch (err) {
        console.error(err);
        isGenericError('Error while copying ftpconfig/ftpignore files');
        return false;
      }
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

    envFound = fs.readdirSync(configsPath);

    if (!envFound.length) {
      console.log("No enviroments found. No folders or files inside /ftpconfigs...");
      return false;
    }

    for(i=0; i < envFound.length; i++) {
      directory = envFound[i];

      if (!fs.lstatSync(configsPath + '/' + directory).isDirectory()) {
        //we've found a file inside the ftpconfig directory. No right. Should be just folders.

        if ((/([^\s]).(ftpconfig)$/i).test(directory) ) {
          noticeOfNonBackwardCompatibilityStructure();
          return [];
        }

        folderFormatNotvalid(directory);
        return [];

      }

      //PROCEED IN CHECKING THAT THE FOLDER CONTAINS only ftpconfig/ftpignore files.
      var envPath = configsPath + '/' + directory;
      var configsFiles = fs.readdirSync(envPath);

      if (!configsFiles.length) {
        envFormatNotvalid(directory);
        return [];
      }

      var filesAreCompliant = this.checkIfFilesAreOk(envPath, configsFiles);
      if (!filesAreCompliant) {
        fileFormatNotvalid(directory);
        return [];
      }

    }

    return envFound;

  },

  checkIfFilesAreOk(envPath, files) {

    for(y=0; y < files.length; y++) {
      var file = files[y];
      if (fs.lstatSync(envPath + '/' + file).isDirectory()) {
        return false;
      }

      if (file !== '.ftpignore' && file !== '.ftpconfig') {
        return false;
      }
    }

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
