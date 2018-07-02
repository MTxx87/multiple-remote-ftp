# Remote Ftp Multiple Hosts Add-On
Plugin for Atom editor that adds possibility for multiple .ftpconfig files within a single project using Remote Ftp.
It is useful when working with multiple server environments.

DEPENDENCIES:
Remote-Ftp https://github.com/icetee/remote-ftp
Project Manager https://atom.io/packages/project-manager

Getting Started
* create a /ftpconfigs folder under the project root
* in the folder create as many .ftpconfig file as needed. Follow the naming "{name}.ftpconfig" (Eg. DEVELOPEMENT.ftpconfig, STAGING.ftpconfig, PRODUCTION.ftpconfig,)
* menu Packages > Multiple Remote Ftp > toggle
* be sure to have Tree View open
* select an ftp file from the dropdown
* Remote FTP should connect to the selected server

![image](https://github.com/matteotonini/multiple-remote-ftp/blob/master/screenshot1.png)
