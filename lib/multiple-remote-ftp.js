'use babel';

import MultipleRemoteFtpView from './multiple-remote-ftp-view';
import { CompositeDisposable } from 'atom';
import { requirePackages } from 'atom-utils';
import { $ } from 'atom-space-pen-views';
import Path from 'path';
import fs from 'fs-extra';
import { configsFolderNotFound, configsNotFound, projectRequired, fileFormatNotvalid, isGenericError } from './notifications';


export default {

  multipleRemoteFtpView: null,
  modalPanel: null,
  subscriptions: null,
  mytree: null,
  isVisible: null,

  activate(state) {
    this.multipleRemoteFtpView = new MultipleRemoteFtpView(state.multipleRemoteFtpViewState);
    // this.modalPanel = atom.workspace.addTopPanel({
    //   item: this.multipleRemoteFtpView.getElement(),
    //   visible: false
    // });

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

  showInTree : function(treeView) {
    this.mytree = treeView;
    let configsPath = this.getConfigsPath();

    if (!configsPath) {
      projectRequired();
      return false;
    }

    let configFiles = this.searchForConfig(configsPath);

    if (!configFiles) {
      configsNotFound();
    }

    let result = this.multipleRemoteFtpView.feedInSelect(configFiles);

    if (!result) {
      isGenericError('Something wrong happened while parsing config file list.');
    }

    this.mytree.element.prepend(this.multipleRemoteFtpView.getElement());
    this.isVisible = true;
  },

  attachDomListeners() {
    var self = this;
    var wrapper = this.multipleRemoteFtpView.getElement();
    var button = wrapper.querySelector('.mrftp-selected-label');
    button.addEventListener("click", function(e) {
      var clicked = e.target;
      self.toggleMenu(clicked);
    });
    var listElements = wrapper.querySelectorAll('li[data-config]');

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
      console.log(projectPath);
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

  searchForConfig(configsPath) {
    var isFolder = this.lookForConfigFolder(configsPath);

    if (!isFolder) {
      configsFolderNotFound();
      return false;
    }

    filesFound = fs.readdirSync(configsPath);

    if (!filesFound.length) {
      console.log("no files found");
      return false;
    }

    for(i=0; i < filesFound.length; i++) {
      file = filesFound[i];
      if (!(/([^\s]).(ftpconfig)$/i).test(file) ) {
        fileFormatNotvalid(file);
        return false;
      }
    }

    return filesFound;

  },

  lookForConfigFolder(configsPath) {
    if (fs.existsSync(configsPath)) {
      return true;
    }

    return false;
  }

  //look for export const traverseTree

};
