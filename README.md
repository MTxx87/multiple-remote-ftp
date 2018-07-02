# multiple-remote-ftp
Plugin for Atom editor that adds possibility for multiple .ftpconfig files within a single project.
Useful when working with multiple server environments.

DEPENDENCIES
- The plugin needs https://github.com/icetee/remote-ftp and https://atom.io/packages/project-manager to be installed and active. Treeview must also be visible.

HOW TO USE
- Remote-ftp allows a single .ftpconfig file as specified here https://github.com/icetee/remote-ftp#configuration-in-projects-ftpconfig-file. With multiple-remote-ftp you can have a folder /ftpconfigs under your project root and then add multiple .ftpconfig files in that folder.

Example
- DEVELOPEMENT.ftpconfig, STAGING.ftpconfig, PRODUCTION.ftpconfig, etc.

Getting Started
* create a /ftpconfigs folder under the project root
* in the folder create as many .ftpconfig file as needed. Follow the naming "whatever-you-like.ftpconfig"
* menu Packages > Multiple Remote Ftp > toggle
* be sure to have Tree View open
* select an ftp file from the dropdown 

![image](https://github.com/matteotonini/multiple-remote-ftp/blob/master/screenshot1.png)
