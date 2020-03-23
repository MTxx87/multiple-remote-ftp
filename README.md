# Remote Ftp Multiple Hosts Add-On
Plugin for Atom editor that adds possibility for multiple .ftpconfig and .ftpignore files within a single project using Remote Ftp. It is useful when working with multiple server environments.

**Version 1.0.0 VS 0.3.1:**
Starting from version 1.0.0, I've added support for .ftpignore files.<br>
For this reason, I decided to modify the configuration of the /ftpconfigs folder.<br>
The structure that worked until 0.3.0 will no longer work after you'll upgrade to 1.0.0.<br>
Migrating to the new structure is very easy though, just follow the getting started guide below.

Dependencies:
* Remote-Ftp https://github.com/icetee/remote-ftp
* Project Manager https://atom.io/packages/project-manager

Getting Started
* create a folder with name */ftpconfigs* under the project root
* under */ftpconfigs* create as many folders as the number of environments you have
* place .ftpconfig and .ftpignore files in these folders accordingly. <br>
The resulting tree should then be the following:<br/><br>
Eg.         
  * /ftpconfigs
    * /development
      * .ftpconfig
      * .ftpignore
    * /production
      * .ftpconfig<br><br>
* go to menu Packages > Multiple Remote Ftp > Toggle
* be sure to have Tree View open
* select an ftp file from the dropdown
* Remote FTP should connect to the selected server

![image](https://github.com/MTxx87/multiple-remote-ftp/blob/ftpignore-support-test/screenshot2.png)

NOTES:
* When an option is selected from the dropdown the plugin just copies the related {environment-name}/.ftpconfig and /.ftpignore in the root folder of your project before triggering the command 'remote-ftp:connect'.<br>
It is not a particularly elegant solution, but I had/have no time to refine or going with a more elegant approach.<br>
I have to say that it worked without problems since day one and I use Atom on daily basis.
